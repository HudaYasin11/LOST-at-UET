import { societies, findSocieties } from '../data/societies.js';

const grid = document.getElementById('society-grid');
const search = document.getElementById('society-search');
const category = document.getElementById('society-category');
const accents = {'Music':'#f5a8ce','Computing & cloud':'#91d9ff','Engineering':'#aabfff','Environment':'#99dfb4','Design & arts':'#d6b0ff','Literature & speaking':'#ffd284','Community':'#a5dadd','Media & journalism':'#ffb59a','Science & technology':'#aabfff','Sports':'#ffd284'};
const instagramIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>';

function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
}

function externalLink(label, url, societyName) {
    const link = element('a', '', label);
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `${societyName}: ${label} (opens in a new tab)`);
    return link;
}

function renderCard(society) {
    const card = element('article', 'society-card');
    card.style.setProperty('--society-accent', accents[society.category]);
    const top = element('div', 'society-card-top');
    const badge = element('div', 'society-logo', society.initials);
    badge.setAttribute('aria-hidden', 'true');
    if (society.logo) {
        const logo = document.createElement('img');
        logo.alt = '';
        logo.loading = 'lazy';
        logo.width = 58; logo.height = 58;
        logo.addEventListener('error', () => {
            badge.replaceChildren(document.createTextNode(society.initials));
            if (!card.querySelector('.logo-pending')) card.append(element('span','availability-tag logo-pending','Logo coming soon'));
        }, {once:true});
        logo.src = society.logo;
        badge.replaceChildren(logo);
    }
    top.append(badge, element('span', 'society-category', society.category));
    card.append(top, element('h2', '', society.name));
    if (society.description) card.append(element('p', 'society-about', society.description));
    card.append(element('p', 'society-registration', society.status));
    const links = element('div', 'society-links');
    if (society.instagram) {
        const link = externalLink('Instagram', society.instagram, society.name);
        link.className = 'instagram-link';
        link.insertAdjacentHTML('afterbegin', instagramIcon);
        links.append(link);
    }
    for (const {label,url} of society.links) links.append(externalLink(label,url,society.name));
    links.append(externalLink(society.sourceLabel,society.source,society.name));
    card.append(links);
    const availability = element('div','society-availability');
    if (!society.instagram && !society.links.length) {
        availability.append(element('span','availability-tag','Social links coming soon'));
    } else if (!society.instagram) {
        availability.append(element('span','availability-tag','Instagram coming soon'));
    }
    if (!society.logo) availability.append(element('span','availability-tag logo-pending','Logo coming soon'));
    if (availability.childElementCount) card.append(availability);
    return card;
}

for (const name of [...new Set(societies.map(society => society.category))].sort()) {
    const option = element('option', '', name);
    option.value = name;
    category.append(option);
}

function render() {
    const matches = findSocieties(search.value, category.value);
    grid.replaceChildren(...matches.map(renderCard));
    document.getElementById('society-count').textContent = `${matches.length} of ${societies.length} societies & communities`;
    document.getElementById('society-empty').hidden = matches.length > 0;
}

search.addEventListener('input',render);
category.addEventListener('change',render);
document.getElementById('society-reset').addEventListener('click',() => {
    search.value = ''; category.value = 'all'; render(); search.focus();
});
render();
