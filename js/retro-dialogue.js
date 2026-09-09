// Presentation only. Full text remains available to assistive technology immediately.
const active = new Map();
let muted = false, audio, lastClick = 0;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function keySound() {
    if (muted || reduced() || document.hidden || !navigator.userActivation?.hasBeenActive) return;
    const now = performance.now();
    if (now - lastClick < 65) return;
    lastClick = now;
    try {
        audio ||= new (window.AudioContext || window.webkitAudioContext)();
        if (audio.state === 'suspended') { void audio.resume().catch(() => {}); return; }
        if (audio.state !== 'running') return;
        const oscillator = audio.createOscillator(), gain = audio.createGain();
        const at = audio.currentTime;
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(650 + Math.random() * 250, at);
        oscillator.frequency.exponentialRampToValueAtTime(180, at + .025);
        // Audible on phone speakers, while leaving ample headroom for the music.
        gain.gain.setValueAtTime(.06, at);
        gain.gain.exponentialRampToValueAtTime(.0001, at + .028);
        oscillator.connect(gain); gain.connect(audio.destination);
        oscillator.start(at); oscillator.stop(at + .03);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    } catch { /* Text remains usable when browser audio is unavailable. */ }
}

function syncMuteButtons() {
    document.querySelectorAll('.retro-mute').forEach(button => {
        button.textContent = muted ? 'KEY SOUND OFF' : 'KEY SOUND ON';
        button.setAttribute('aria-pressed', String(!muted));
        button.setAttribute('aria-label', muted ? 'Enable typing sound' : 'Mute typing sound');
    });
}

export function stopDialogue(panel) {
    const state = active.get(panel);
    if (!state) return;
    cancelAnimationFrame(state.frame);
    state.lines.forEach(({element, full, text}) => {
        // Do not restore stale text if the application already replaced this content.
        if (full.parentNode === element) element.replaceChildren(document.createTextNode(text));
        element.classList.remove('retro-line');
    });
    panel.removeAttribute('data-typing');
    state.skip.hidden = true;
    active.delete(panel);
}

export function stopDialoguesWithin(root) {
    for (const panel of active.keys()) if (root === panel || root.contains(panel)) stopDialogue(panel);
}

export function revealDialogue(panel, selector) {
    stopDialogue(panel);
    let controls = panel.querySelector(':scope > .retro-dialogue-controls');
    if (!controls) {
        controls = document.createElement('div');
        controls.className = 'retro-dialogue-controls';
        controls.setAttribute('role', 'group');
        controls.setAttribute('aria-label', 'Message playback');
        const mute = document.createElement('button');
        mute.type = 'button'; mute.className = 'retro-mute';
        mute.addEventListener('click', () => { muted = !muted; syncMuteButtons(); });
        const skip = document.createElement('button');
        skip.type = 'button'; skip.className = 'retro-skip'; skip.textContent = 'SHOW ALL ›';
        skip.setAttribute('aria-label', 'Show all text immediately');
        skip.addEventListener('click', () => { stopDialogue(panel); mute.focus({preventScroll:true}); });
        controls.append(mute, skip); panel.append(controls);
    }
    syncMuteButtons();
    const skip = controls.querySelector('.retro-skip');
    skip.hidden = true;
    if (reduced() || document.hidden) return;
    const lines = [...panel.querySelectorAll(selector)].filter(element =>
        element.textContent.trim() && !element.children.length
    ).map(element => {
        const text = element.textContent;
        const full = document.createElement('span');
        full.className = 'retro-full'; full.textContent = text;
        const visual = document.createElement('span');
        visual.className = 'retro-visual'; visual.setAttribute('aria-hidden', 'true');
        element.classList.add('retro-line'); element.replaceChildren(full, visual);
        return {element, full, visual, text, characters:Array.from(text), count:0};
    });
    if (!lines.length) return;
    const state = {lines, skip, frame:0};
    active.set(panel, state); panel.dataset.typing = 'true'; skip.hidden = false;
    const start = performance.now();
    const duration = Math.min(2200, Math.max(650, Math.max(...lines.map(line => line.characters.length)) * 24));
    const tick = now => {
        if (!panel.isConnected || panel.hidden || document.hidden || reduced()) { stopDialogue(panel); return; }
        const progress = Math.min(1, (now - start) / duration);
        let advanced = false;
        lines.forEach(line => {
            const count = Math.floor(progress * line.characters.length);
            if (count !== line.count) {
                line.visual.textContent = line.characters.slice(0, count).join('');
                line.count = count; advanced = true;
            }
        });
        if (advanced) keySound();
        if (progress === 1) stopDialogue(panel);
        else state.frame = requestAnimationFrame(tick);
    };
    state.frame = requestAnimationFrame(tick);
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        for (const panel of active.keys()) stopDialogue(panel);
        if (audio?.state === 'running') void audio.suspend().catch(() => {});
    }
});
