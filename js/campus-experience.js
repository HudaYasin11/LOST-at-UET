// Presentation only: never writes discoveries, quests, XP, or campus coordinates.
import { subscribe, getLeaderboard, getLevel } from './dataService.js';
import { questsData } from './questData.js';
import { createCampusAmbience } from './campus-ambience.js';
import { revealDialogue, stopDialogue, stopDialoguesWithin } from './retro-dialogue.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const iconFor = loc => {
    const name = (loc.name || '').toLowerCase();
    if (/computer|computing|cs department/.test(name)) return '&lt;/&gt;';
    if (/library/.test(name)) return '▤';
    if (/mosque|islamic/.test(name)) return '☾';
    if (/cafe|annex|ssc|fries/.test(name)) return '☕';
    if (/pool/.test(name)) return '≈';
    if (/stadium|ground|sports|gym|court/.test(name)) return '⚑';
    if (/park/.test(name)) return '♧';
    if (/engineering|department/.test(name)) return '⚙';
    return '▥';
};
export function gameMarkerMarkup(loc, discovered) {
    return `<div class="campus-landmark ${discovered ? 'is-discovered' : ''} ${loc.is_hidden ? 'is-secret' : ''}"><span class="landmark-emblem">${iconFor(loc)}</span><i>${discovered ? '✓' : '·'}</i><b class="landmark-label">${escape(loc.name)}</b></div>`;
}

// Original, quietly layered minor-key soundtrack. Starts only on a user gesture.
let music;
function soundtrack() {
    if (music) return music;
    let context, timer, step = 0, enabled = false;
    const notes = [0, 7, 12, 3, 10, 7, 14, 12, 0, 7, 15, 12, 10, 3, 7, 2];
    function tick() {
        const at = context.currentTime;
        const tone = (frequency, duration, volume, type) => {
            const oscillator = context.createOscillator(), gain = context.createGain();
            oscillator.type = type; oscillator.frequency.value = frequency;
            gain.gain.setValueAtTime(0, at);
            gain.gain.linearRampToValueAtTime(volume, at + .09);
            gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
            oscillator.connect(gain); gain.connect(context.destination);
            oscillator.start(at); oscillator.stop(at + duration + .1);
            oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
        };
        tone(146.83 * 2 ** (notes[step % notes.length] / 12), 1.2, .018, 'triangle');
        if (step % 4 === 0) {
            const root = [73.42, 58.27, 65.41, 55][Math.floor(step / 8) % 4];
            tone(root, 2.4, .03, 'sine'); tone(root * 3, 2.2, .008, 'sine');
        }
        step++;
    }
    music = {
        get enabled() { return enabled; },
        async toggle() {
            if (!context) context = new (window.AudioContext || window.webkitAudioContext)();
            if (enabled) { clearInterval(timer); await context.suspend(); enabled = false; }
            else { await context.resume(); enabled = true; tick(); timer = setInterval(tick, 440); }
            return enabled;
        },
        async pause() { if (enabled) { clearInterval(timer); await context.suspend(); enabled = false; } }
    };
    return music;
}

export function createCampusExperience({ map, locations, getPosition, getState, getLocationStatus, viewDetails, scan, markers, initialPlayerPosition }) {
    const container = document.querySelector('.map-container');
    const hud = document.createElement('div'); hud.className = 'campus-hud';
    hud.innerHTML = `
        <div class="world-heading"><span class="world-eyebrow">EXPLORE · DISCOVER · BELONG</span><h1>THE CAMPUS<br><em>IS YOUR WORLD.</em></h1><span class="world-season">UET LAHORE / DUSK EDITION</span></div>
        <div class="world-tools"><button data-action="music" aria-pressed="false">♫ SOUND OFF</button><button data-action="light" aria-pressed="true">◐ DUSK</button><button data-action="quests" aria-expanded="true">⚑ QUESTS</button></div>
        <div class="world-compass" aria-label="Illustration up; not a GPS compass" title="Illustration up; not a GPS compass">N<span>▲</span></div>
        <button class="world-motion" data-action="motion" aria-pressed="true" aria-label="Pause campus animation" title="Decorative campus animation—not live traffic or people">Ⅱ LIVE SCENE</button>
        <aside class="world-quests"><div class="hud-section-title"><span>⚑ ACTIVE QUESTS</span><a href="quests.html" aria-label="View all quests">↗</a></div><div class="world-quest-list"></div><a class="quest-footer" href="quests.html">OPEN QUEST JOURNAL →</a></aside>
        <button class="world-minimap" data-action="recenter" aria-label="Recenter on explorer"><span>EXPLORER VIEW</span><svg viewBox="0 0 1536 1024" aria-hidden="true"><image href="assets/uet-retro-campus-map-v2.png" width="1536" height="1024"/><rect class="minimap-window"/><circle class="minimap-player" r="28"/></svg><small>◎ RECENTER</small></button>
        <button class="world-player" data-action="profile" aria-label="Open your player profile"><span class="portrait-mini">◆</span><span><b class="hud-player-name"></b><small class="hud-player-level"></small><span class="hud-xp-track"><i></i></span></span></button>
        <button class="world-rankings" data-action="leaderboard">♜ LEADERBOARD ↗</button>
        <button class="world-nearby" data-action="nearby">◇ NEARBY LANDMARKS</button>
        <div class="world-status"><span><i class="online-dot"></i> UET Lahore</span><span class="hud-discoveries"></span><span class="hud-quest-count"></span><span class="hud-xp"></span></div>
        <section class="world-destination" hidden aria-label="Selected location"><button class="hud-close" data-action="close" aria-label="Close location">×</button><small class="destination-category"></small><h2></h2><p class="destination-description"></p><div class="destination-meta"></div><div class="destination-actions"><button data-action="navigate">▷ PREVIEW ROUTE</button><button data-action="details">DETAILS</button><button data-action="scan">▦ SCAN QR</button></div><p class="route-status" role="status">Visual preview only · Scan a physical QR to discover.</p></section>
        <div class="world-toast" role="status" aria-live="polite"></div>
        <dialog class="world-dialog"><button class="hud-close" data-action="dialog-close" aria-label="Close panel">×</button><h2></h2><div class="world-dialog-content"></div></dialog>`;
    container.append(hud);
    const $ = selector => hud.querySelector(selector);
    const ambience = createCampusAmbience(map, container, enabled => {
        const control=$('[data-action="motion"]');
        control.textContent=enabled?'Ⅱ LIVE SCENE':'▷ PLAY SCENE';
        control.setAttribute('aria-pressed',String(enabled));
        control.setAttribute('aria-label',enabled?'Pause campus animation':'Play campus animation');
    });
    let selected, route, glow, frame, disposed = false, toastTimer, dialogVersion = 0;
    const revealPanel = () => revealDialogue($('.world-dialog'), 'h2, .world-dialog-content p, .world-rank-list li > span');
    $('.world-dialog').addEventListener('close', () => { dialogVersion++; stopDialogue($('.world-dialog')); });
    let playerPosition = [180, 788];
    const entry = locations.find(loc => loc.id === 'main-gate');
    if (entry) playerPosition = [...getPosition(entry)];
    if (Array.isArray(initialPlayerPosition) && initialPlayerPosition.length === 2 && initialPlayerPosition.every(Number.isFinite)) playerPosition = [...initialPlayerPosition];
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const player = L.marker(playerPosition, { zIndexOffset: 1500, interactive: false, icon: L.divIcon({
        className: 'explorer-avatar', iconSize: [28, 40], iconAnchor: [14, 34],
        html: `<div class="explorer-ring"></div>
            <svg class="explorer-character" viewBox="0 0 32 40" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                <g class="explorer-feet" fill="#20374c" stroke="#0d2435" stroke-width="1">
                    <path d="M10 26h6l-1 10h-5z"/><path d="M17 26h6l-1 10h-5z"/>
                    <path d="M10 34h5v3H8v-2z" fill="#d9e9e8"/><path d="M18 34h4l2 2v1h-7v-2z" fill="#d9e9e8"/>
                </g>
                <rect x="5" y="17" width="10" height="13" rx="3" fill="#c18b4d" stroke="#674c32" stroke-width="1.2"/>
                <path d="M11 17q6-3 11 1l3 11q-8 4-16-1z" fill="#339ac0" stroke="#155373" stroke-width="1.2"/>
                <path d="M13 18q4 4 8 0" fill="none" stroke="#89dfeb" stroke-width="2"/>
                <path d="M10 19l-3 8m16-8 3 8" stroke="#58bcd3" stroke-width="4" stroke-linecap="round"/>
                <path d="M7 27v2m19-2v2" stroke="#d6ab82" stroke-width="3" stroke-linecap="round"/>
                <path d="M12 20v8" stroke="#ebc07a" stroke-width="2"/><path d="M17 22v7" stroke="#166184" stroke-width="1"/>
                <path d="M9 9q0-7 8-7 8 1 7 10l-2 5H11z" fill="#252b3b" stroke="#152233" stroke-width="1"/>
                <path d="M10 10q6-3 12 0v5q-1 5-6 4-6-1-6-9" fill="#d6ab82"/>
                <path d="M9 10q0-8 8-7 6 0 7 7l-5-1-3-3-2 4z" fill="#293044"/>
                <path d="M12 5q4-3 8 1" fill="none" stroke="#4c5365" stroke-width="1.2"/>
                <path d="M14 12v1m6-1v1" stroke="#263448" stroke-width="1.3" stroke-linecap="round"/>
                <path d="M16 16h2" stroke="#a86f59" stroke-width="1" stroke-linecap="round"/>
            </svg><b>YOU · PREVIEW</b>`
    }) }).addTo(map);
    function toast(message) { $('.world-toast').textContent = message; $('.world-toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('.world-toast').classList.remove('visible'), 4500); }
    function updateMinimap() {
        const b = map.getBounds(); const rect = $('.minimap-window');
        rect.setAttribute('x', b.getWest()); rect.setAttribute('y', 1024 - b.getNorth());
        rect.setAttribute('width', b.getEast() - b.getWest()); rect.setAttribute('height', b.getNorth() - b.getSouth());
        $('.minimap-player').setAttribute('cx', playerPosition[1]); $('.minimap-player').setAttribute('cy', 1024 - playerPosition[0]);
    }
    function render() {
        stopDialogue($('.world-quests'));
        const state = getState(), user = state.user || {}, quests = questsData;
        const completed = new Set((user.completedQuests || []).map(String));
        const discoveries = user.discoveries || [];
        $('.hud-player-name').textContent = user.name || user.username || 'Explorer';
        $('.hud-player-level').textContent = `LEVEL ${getLevel()} · ${user.xp || 0} XP`;
        $('.hud-xp-track i').style.width = `${((Number(user.xp) || 0) % 100)}%`;
        $('.hud-xp-track').title = `${((Number(user.xp) || 0) % 100)}/100 XP to next level`;
        $('.hud-discoveries').textContent = `◆ ${discoveries.length}/${locations.length} locations`;
        $('.hud-quest-count').textContent = `⚑ ${quests.filter(q => completed.has(String(q.id))).length}/${quests.length} quests`;
        $('.hud-xp').textContent = `✦ ${user.xp || 0} XP`;
        const active = quests.filter(q => q.is_active !== false && !completed.has(String(q.id))).slice(0, 3);
        $('.world-quest-list').innerHTML = active.length ? active.map((q, i) => `<a class="hud-quest" href="quests.html"><span class="quest-sigil sigil-${i}">${['◇','⚑','✧'][i]}</span><div><b>${escape(q.title || q.name || 'Campus quest')}</b><small>${escape(q.category || 'Exploration')} · ${Number(q.xp_reward ?? q.xp ?? 0)} XP</small><span>${q.location_id ? `${discoveries.includes(q.location_id) ? 1 : 0}/1 location discovered` : 'Open journal for progress'} →</span></div></a>`).join('') : '<p class="quest-empty">No active quests. Visit the journal for your latest progress.</p>';
        markers.forEach(marker => { const loc = locations.find(l => l.id === marker.options.locationId); if (loc) { marker.setIcon(L.divIcon({ className:'custom-marker', html:gameMarkerMarkup(loc, getLocationStatus(loc.id) === 'discovered'), iconSize:[34,40],iconAnchor:[17,36]})); marker.getElement()?.classList.toggle('is-selected', loc.id === selected?.id); } });
        if (selected) updateSelectionStatus();
    }
    function stopRoute() { cancelAnimationFrame(frame); player.getElement()?.classList.remove('is-walking'); if (route) map.removeLayer(route); if (glow) map.removeLayer(glow); route = glow = null; }
    function select(loc) {
        stopDialogue($('.world-destination'));
        selected = loc; stopRoute();
        hud.classList.add('has-destination');
        markers.forEach(m => m.getElement()?.classList.toggle('is-selected', m.options.locationId === loc.id));
        $('.world-destination').hidden = false;
        $('.destination-category').textContent = `${loc.category || 'Campus'} / LANDMARK`;
        $('.world-destination h2').textContent = loc.name;
        $('.destination-description').textContent = loc.description || 'Explore this campus landmark and scan its physical QR code.';
        updateSelectionStatus();
        $('.route-status').textContent = 'Visual preview · Real-world distance unavailable on this illustrated map.';
        // setView respects the frame bounds and avoids flyTo's temporary zoom-out arc.
        map.setView(getPosition(loc), Math.max(map.getZoom(), .25), { animate: !reducedMotion, duration: .6 });
        stopDialogue($('.world-quests'));
        revealDialogue($('.world-destination'), 'h2, .destination-description');
    }
    function updateSelectionStatus() {
        $('.destination-meta').textContent = `✦ ${selected.xp || 0} XP · ${getLocationStatus(selected.id) === 'discovered' ? 'Discovered ✓' : 'Undiscovered ◇'}`;
    }
    function clearSelection() {
        stopDialogue($('.world-destination'));
        $('.world-destination').hidden = true;
        hud.classList.remove('has-destination'); stopRoute();
        markers.forEach(m=>m.getElement()?.classList.remove('is-selected')); selected = null;
    }
    function navigate() {
        if (!selected) return;
        stopRoute();
        const start = [...playerPosition], end = getPosition(selected);
        // These are illustration pixels, not surveyed roads or geographic distances.
        const points = [start, end];
        glow = L.polyline(points, {color:'#48ddff',weight:12,opacity:.16,interactive:false}).addTo(map);
        route = L.polyline(points, {color:'#a5edff',weight:3,dashArray:'6 12',className:'campus-route',interactive:false}).addTo(map);
        map.fitBounds(L.latLngBounds(points).pad(.4), { maxZoom: .5, animate: !reducedMotion });
        $('.route-status').textContent = 'SIMULATION · Illustrative route, not walking directions.';
        if (reducedMotion) { $('.route-status').textContent = 'Static route preview · Physical QR required to discover.'; return; }
        const began = performance.now(), duration = 9000;
        player.getElement()?.classList.add('is-walking');
        const animate = now => {
            if (disposed) return;
            const progress = Math.min((now - began) / duration, 1);
            playerPosition = [start[0] + (end[0]-start[0])*progress, start[1] + (end[1]-start[1])*progress];
            player.setLatLng(playerPosition); updateMinimap();
            $('.route-status').textContent = progress < 1 ? `SIMULATION · ${Math.round(progress * 100)}% of preview · No GPS tracking` : 'Preview complete. Visit the location and scan its physical QR.';
            if (progress < 1) frame = requestAnimationFrame(animate);
            else player.getElement()?.classList.remove('is-walking');
        };
        frame = requestAnimationFrame(animate);
    }
    function findMe() {
        map.setView(playerPosition, .5, {animate:!reducedMotion});
        if (!navigator.geolocation) { toast('Explorer recentered. GPS unavailable in this browser.'); return; }
        toast('Explorer recentered. Checking GPS permission…');
        navigator.geolocation.getCurrentPosition(position => {
            if (!disposed) toast(`GPS received (±${Math.round(position.coords.accuracy)} m). This illustrated map has no GPS calibration; avatar remains a preview.`);
        }, () => { if (!disposed) toast('GPS unavailable. You can still explore the campus preview.'); }, {timeout:10000, maximumAge:60000});
    }
    hud.addEventListener('click', async event => {
        const button = event.target.closest('[data-action]'); if (!button) return;
        if (['profile', 'nearby', 'leaderboard', 'dialog-close', 'nearby-select'].includes(button.dataset.action)) {
            dialogVersion++; stopDialoguesWithin(hud);
        }
        switch (button.dataset.action) {
            case 'music':
                try { const on = await soundtrack().toggle(); button.textContent = on ? '♫ SOUND ON' : '♫ SOUND OFF'; button.setAttribute('aria-pressed', String(on)); }
                catch { toast('Audio is unavailable in this browser.'); } break;
            case 'motion': ambience.toggle(); break;
            case 'light': container.classList.toggle('campus-day'); ambience.setDay(container.classList.contains('campus-day')); button.textContent = container.classList.contains('campus-day') ? '☀ DAY' : '◐ DUSK'; button.setAttribute('aria-pressed',String(!container.classList.contains('campus-day'))); break;
            case 'quests':
                if (selected) { clearSelection(); $('.world-quests').classList.remove('collapsed'); }
                else $('.world-quests').classList.toggle('collapsed');
                button.setAttribute('aria-expanded',String(!$('.world-quests').classList.contains('collapsed')));
                if (!$('.world-quests').classList.contains('collapsed')) revealDialogue($('.world-quests'), '.hud-quest b, .quest-empty');
                else stopDialogue($('.world-quests'));
                break;
            case 'close': clearSelection(); break;
            case 'details': stopDialoguesWithin(hud); if (selected) viewDetails(selected.id); break;
            case 'scan': if (selected) scan(selected.id); break;
            case 'navigate': navigate(); break;
            case 'recenter': map.setView(playerPosition,.5,{animate:!reducedMotion}); break;
            case 'nearby': {
                const nearest = locations.slice().sort((a,b) => {
                    const distance = loc => { const [y,x] = getPosition(loc); return Math.hypot(y-playerPosition[0], x-playerPosition[1]); };
                    return distance(a) - distance(b);
                }).slice(0,5);
                $('.world-dialog h2').textContent = 'Around your explorer';
                $('.world-dialog-content').innerHTML = `<p>Closest landmarks to your preview avatar on the illustration—not your GPS position.</p><div class="world-nearby-list">${nearest.map(loc => `<button data-action="nearby-select" data-location="${escape(loc.id)}"><span>${escape(loc.name)}</span><small>${escape(loc.category)} · ${getLocationStatus(loc.id) === 'discovered' ? 'Discovered ✓' : 'Undiscovered ◇'}</small><b>↗</b></button>`).join('')}</div>`;
                $('.world-dialog').showModal(); revealPanel(); break;
            }
            case 'nearby-select': {
                const loc = locations.find(item => item.id === button.dataset.location);
                if (loc) { $('.world-dialog').close(); select(loc); } break;
            }
            case 'dialog-close': $('.world-dialog').close(); break;
            case 'profile': {
                const user = getState().user || {};
                $('.world-dialog h2').textContent = user.name || user.username || 'Your explorer';
                $('.world-dialog-content').innerHTML = `<p>LEVEL ${getLevel()} · ${Number(user.xp) || 0} XP</p><p>${(user.discoveries || []).length}/${locations.length} campus locations discovered</p><p>Every discovery starts with a real visit. Scan the location’s QR code to earn XP.</p><a href="discoveries.html">YOUR DISCOVERIES →</a>`;
                $('.world-dialog').showModal(); revealPanel(); break;
            }
            case 'leaderboard': {
                const requestVersion = dialogVersion;
                $('.world-dialog h2').textContent = 'Campus leaderboard';
                $('.world-dialog-content').textContent = 'Loading explorers…';
                $('.world-dialog').showModal();
                try {
                    const result = await getLeaderboard(10);
                    if (disposed || requestVersion !== dialogVersion || !$('.world-dialog').open) return;
                    if (!result.success) throw new Error('Leaderboard unavailable');
                    const rows = Array.isArray(result.data) ? result.data : result.data?.leaderboard;
                    if (!Array.isArray(rows)) throw new Error('Leaderboard unavailable');
                    $('.world-dialog-content').innerHTML = rows.length ? `<ol class="world-rank-list">${rows.map(row=>`<li><span>${escape(row.name || row.username || 'Explorer')}</span><b>${Number(row.xp ?? row.total_xp) || 0} XP</b></li>`).join('')}</ol>` : '<p>No explorers listed yet.</p>';
                    revealPanel();
                } catch { if (!disposed && requestVersion === dialogVersion && $('.world-dialog').open) {
                    $('.world-dialog-content').innerHTML = '<p>The leaderboard could not load. Please try again shortly.</p>';
                    revealPanel();
                } }
                break;
            }
        }
    });
    const visibility = () => { if (document.hidden) { soundtrack().pause(); $('[data-action="music"]').textContent='♫ SOUND OFF'; $('[data-action="music"]').setAttribute('aria-pressed','false'); } };
    document.addEventListener('visibilitychange', visibility);
    map.on('move zoom',updateMinimap);
    const unsubscribe = subscribe(render);
    if (matchMedia('(max-width: 768px)').matches) { $('.world-quests').classList.add('collapsed'); $('[data-action="quests"]').setAttribute('aria-expanded','false'); }
    $('[data-action="music"]').textContent = soundtrack().enabled ? '♫ SOUND ON' : '♫ SOUND OFF';
    $('[data-action="music"]').setAttribute('aria-pressed',String(soundtrack().enabled));
    render(); updateMinimap();
    const requested = new URLSearchParams(location.search).get('location');
    if (requested) { const loc = locations.find(l=>l.id===requested); if(loc) select(loc); }
    return {select,findMe,getPlayerPosition:()=>[...playerPosition],destroy() {disposed=true;stopDialoguesWithin(hud);stopRoute();ambience.destroy();clearTimeout(toastTimer);unsubscribe();document.removeEventListener('visibilitychange',visibility);map.off('move zoom',updateMinimap);hud.remove();}};
}
