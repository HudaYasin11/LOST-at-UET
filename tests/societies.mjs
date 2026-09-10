import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { societies, findSocieties } from '../data/societies.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

assert.equal(societies.length, 40);
assert.equal(new Set(societies.map(s => s.id)).size, 40);
assert.equal(societies.find(s => s.id === 'aws').instagram, 'https://www.instagram.com/aws_sbg_uet/');
assert.deepEqual(findSocieties('  mUsIc  ').map(s => s.id), ['music']);
assert.deepEqual(findSocieties('AWS', 'Computing & cloud').map(s => s.id), ['aws']);
assert.deepEqual(findSocieties('AWS', 'Music'), []);
assert.equal(findSocieties('no-such-society-123').length, 0);
assert.equal(findSocieties('', 'Engineering').every(s => s.category === 'Engineering'), true);
assert.equal(findSocieties().length, 40);
assert.deepEqual(findSocieties().slice(0,2).map(s => s.id), ['music','aws']);

for (const society of societies) {
    assert.ok(society.source);
    const links = [society.source, society.instagram, ...society.links.map(link => link.url)].filter(Boolean);
    assert.equal(new Set(links).size, links.length, `Duplicate links on ${society.id}`);
    for (const url of links) assert.equal(new URL(url).protocol, 'https:');
    if (society.logo) {
        const resolved = path.resolve(root, society.logo);
        assert.ok(resolved.startsWith(path.join(root, 'assets', 'societies') + path.sep));
        assert.ok(fs.statSync(resolved).size > 100);
        assert.ok(society.logoSource);
    }
}
assert.equal(societies.filter(s => s.logo).length, 37);
assert.equal(societies.filter(s => !s.instagram && !s.links.length).length, 0);

for (const page of ['home','map','quests','discoveries','qr','search']) {
    const html = fs.readFileSync(path.join(root, `${page}.html`),'utf8');
    assert.ok(html.includes('href="societies.html"'), `${page} must link to societies`);
    assert.ok(html.includes('href="css/navigation.css"'));
}
const html = fs.readFileSync(path.join(root,'societies.html'),'utf8');
for (const [,url] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    if (!/^https?:/.test(url)) assert.ok(fs.existsSync(path.join(root,url)), `Missing local resource: ${url}`);
}
console.log('Society search, category combinations, approved links, logo assets, and route checks passed.');
