// building-icons.js
// Tiny pixel-art building/landmark icons for LOST@UET map markers.
// Colored per-location so each pin reads as its actual building, not a generic dot.
//
// Usage in map.html:
//   import { getBuildingIcon } from './building-icons.js';
//   ...inside addLocationMarkers(), swap the marker <span> for getBuildingIcon(loc.name, !isDiscovered)

const BUILDING_STYLES = [
  { match: ['admin office', 'admin block', 'administration'], wall: '#E9DFC0', roof: '#1A1A1A', trim: '#1A1A1A', type: 'building' },
  { match: ['annexxe'], wall: '#F5F0E6', roof: '#7A5230', trim: '#5A3D20', type: 'building' },
  { match: ['architectural engineering'], wall: '#F2F2F2', roof: '#7A2331', trim: '#5A1A22', type: 'building' },
  { match: ['architecture'], wall: '#F2F2F2', roof: '#7A2331', trim: '#5A1A22', type: 'building' },
  { match: ['automotive'], wall: '#F5F5F5', roof: '#7A2331', trim: '#5A1A22', type: 'building' },
  { match: ['ayesha hall'], wall: '#F7EFEA', roof: '#B2302A', trim: '#7A1E1A', type: 'building' },
  { match: ['badminton'], color: '#3D8B5F', type: 'court' },
  { match: ['bank'], wall: '#3A3A3A', roof: '#1F1F1F', trim: '#111111', type: 'building' },
  { match: ['bhola cafe'], wall: '#F7F2E7', roof: '#B58A54', trim: '#7A5A32', type: 'cafe' },
  { match: ['chemical engineering'], wall: '#F2F2F2', roof: '#7A2331', trim: '#5A1A22', type: 'building' },
  { match: ['civil engineering'], wall: '#F2F2F2', roof: '#7A2331', trim: '#5A1A22', type: 'building' },
  { match: ['computer engineering'], wall: '#F2F2F2', roof: '#7A2331', trim: '#5A1A22', type: 'building' },
  { match: ['computing block'], wall: '#F2F2F2', roof: '#7A2331', trim: '#5A1A22', type: 'building' },
  { match: ['cs department'], wall: '#8B5A2B', roof: '#2C5F8A', trim: '#3A2A1A', type: 'building' },
  { match: ['electrical engineering'], wall: '#4B5563', roof: '#1C2B3A', trim: '#0E1A24', type: 'building' },
  { match: ['football'], color: '#3D8B5F', type: 'field' },
  { match: ['fries hidden spot'], wall: '#7A2331', roof: '#5A1A22', trim: '#3A0F12', type: 'cafe' },
  { match: ['gssc'], wall: '#F5F0E6', roof: '#A8C6D8', trim: '#5A5A5A', type: 'cafe' },
  { match: ['gym'], wall: '#E9DFC0', roof: '#D97B29', trim: '#8A4B14', type: 'building' },
  { match: ['humanities'], wall: '#F2F2F2', roof: '#7A2331', trim: '#5A1A22', type: 'building' },
  { match: ['ids'], wall: '#5B7C99', roof: '#3B4B5A', trim: '#2A343E', type: 'building' },
  { match: ['islamic studies'], wall: '#F2F2F2', roof: '#7A2331', trim: '#5A1A22', type: 'building' },
  { match: ['jj stadium'], color: '#8A8A8A', type: 'stadium' },
  { match: ['lalazar park'], color: '#3D8B5F', type: 'park' },
  { match: ['lecture theatre'], wall: '#7A2331', roof: '#F2F2F2', trim: '#5A1A22', type: 'building' },
  { match: ['main auditorium'], wall: '#E9DFC0', roof: '#4A7FA8', trim: '#2C4F6A', type: 'building' },
  { match: ['main block'], wall: '#F5F5F5', roof: '#7A2331', trim: '#5A1A22', type: 'building' },
  { match: ['mathematics'], wall: '#F2F2F2', roof: '#7A2331', trim: '#5A1A22', type: 'building' },
  { match: ['mechatronics'], wall: '#2B2B2B', roof: '#1C2B3A', trim: '#0E1A24', type: 'building' },
  { match: ['mosque'], wall: '#F7F2E7', roof: '#2E7D4F', trim: '#1E5A38', type: 'mosque' },
  { match: ['national library'], wall: '#6B4A2B', roof: '#2C5F8A', trim: '#3A2A1A', type: 'building' },
  { match: ['new girls hostel'], wall: '#F5F5F5', roof: '#A8A8A8', trim: '#5A5A5A', type: 'building' },
  { match: ['post office'], wall: '#F0EAD8', roof: '#8A8A8A', trim: '#5A5A5A', type: 'building' },
  { match: ['que cafe'], wall: '#F5F0E6', roof: '#B58A54', trim: '#7A5A32', type: 'cafe' },
  { match: ['security office'], wall: '#5B7C99', roof: '#3B4B5A', trim: '#2A343E', type: 'building' },
  { match: ['shopping market'], wall: '#F5F0E6', roof: '#D8CBA8', trim: '#8A7A5A', type: 'building' },
  { match: ['sports complex'], wall: '#E9DFC0', roof: '#D9C79A', trim: '#8A7A5A', type: 'building' },
  { match: ['ssc'], wall: '#F5F5F5', roof: '#A8C6D8', trim: '#5A5A5A', type: 'cafe' },
  { match: ['staff club'], wall: '#7C93A8', roof: '#A8C6D8', trim: '#3B4B5A', type: 'building' },
  { match: ['swimming pool'], color: '#3B82C4', type: 'pool' },
  { match: ['syalani cafe'], wall: '#B58A54', roof: '#7A5A32', trim: '#4A3418', type: 'cafe' },
  { match: ['transport department'], wall: '#5B7C99', roof: '#3B4B5A', trim: '#2A343E', type: 'building' },
];

const DEFAULT_STYLE = { wall: '#D9CBAE', roof: '#8B5A2B', trim: '#5A3D20', type: 'building' };

export function getBuildingStyle(name = '') {
  const n = name.toLowerCase();
  const found = BUILDING_STYLES.find(s => s.match.some(k => n.includes(k)));
  return found || DEFAULT_STYLE;
}

function px(x, y, w, h, fill) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
}

function wrap(inner) {
  return `<svg width="22" height="22" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;shape-rendering:crispEdges;">${inner}</svg>`;
}

// Generic pixel building: roof strip + wall block + door + 2 windows
function buildingSVG(style, locked) {
  const wall = locked ? '#7a7a7a' : style.wall;
  const roof = locked ? '#4a4a4a' : style.roof;
  const trim = locked ? '#2a2a2a' : style.trim;
  return wrap(
    px(0, 4, 16, 3, roof) +
    px(1, 7, 14, 8, wall) +
    px(0, 4, 16, 1, trim) +
    px(1, 14, 14, 1, trim) +
    px(6, 10, 4, 5, trim) +
    px(2.5, 8.5, 2, 2, '#bfe3ff') +
    px(11.5, 8.5, 2, 2, '#bfe3ff')
  );
}

// Cafe: flatter awning + storefront glass
function cafeSVG(style, locked) {
  const wall = locked ? '#7a7a7a' : style.wall;
  const roof = locked ? '#4a4a4a' : style.roof;
  const trim = locked ? '#2a2a2a' : style.trim;
  return wrap(
    px(0, 5, 16, 2, roof) +
    px(1, 7, 14, 8, wall) +
    px(0, 7, 16, 1, trim) +
    px(6, 11, 4, 4, trim) +
    px(2, 9, 3, 2, '#bfe3ff') +
    px(11, 9, 3, 2, '#bfe3ff')
  );
}

function mosqueSVG(style, locked) {
  const wall = locked ? '#7a7a7a' : style.wall;
  const roof = locked ? '#4a4a4a' : style.roof;
  return wrap(
    px(2, 8, 12, 7, wall) +
    `<circle cx="8" cy="6" r="4" fill="${roof}"/>` +
    px(7, 1, 2, 3, roof) +
    px(6, 12, 4, 3, '#2a2a2a')
  );
}

function fieldSVG(color, locked) {
  const c = locked ? '#6a6a6a' : color;
  return wrap(px(0, 3, 16, 13, c) + px(0, 3, 16, 1, '#f5f5f5') + px(7.3, 3, 1.4, 13, '#f5f5f5'));
}

function poolSVG(color, locked) {
  const c = locked ? '#6a6a6a' : color;
  return wrap(px(1, 4, 14, 10, '#eeeeee') + px(2, 5, 12, 8, c));
}

function parkSVG(color, locked) {
  const c = locked ? '#6a6a6a' : color;
  return wrap(
    px(0, 10, 16, 6, '#7a9b5a') +
    `<circle cx="5" cy="7" r="4" fill="${c}"/><circle cx="11" cy="8" r="3.4" fill="${c}"/>` +
    px(4.3, 10, 1.4, 4, '#5a3d20') +
    px(10.3, 10, 1.4, 4, '#5a3d20')
  );
}

function stadiumSVG(color, locked) {
  const c = locked ? '#6a6a6a' : color;
  return wrap(px(0, 2, 16, 4, c) + px(2, 6, 12, 8, '#3d8b5f') + px(0, 2, 16, 1, '#e9e9e9'));
}

function courtSVG(color, locked) {
  const c = locked ? '#6a6a6a' : color;
  return wrap(px(0, 3, 16, 13, c) + px(7.3, 3, 1.4, 13, '#f5f5f5') + px(0, 3, 16, 1, '#f5f5f5'));
}

export function getBuildingIcon(name, locked) {
  const style = getBuildingStyle(name);
  switch (style.type) {
    case 'cafe': return cafeSVG(style, locked);
    case 'mosque': return mosqueSVG(style, locked);
    case 'field': return fieldSVG(style.color, locked);
    case 'pool': return poolSVG(style.color, locked);
    case 'park': return parkSVG(style.color, locked);
    case 'stadium': return stadiumSVG(style.color, locked);
    case 'court': return courtSVG(style.color, locked);
    default: return buildingSVG(style, locked);
  }
}