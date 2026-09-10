"""Download public profile images from the user-approved society pages.

Original image bytes are retained. Missing or inaccessible artwork stays absent.
Run with the bundled Python (Pillow) and outbound network permission.
"""
import concurrent.futures
import html
from html.parser import HTMLParser
import io
import json
import hashlib
import sys
from pathlib import Path
import re
import urllib.request
from urllib.parse import urljoin
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.tmp' / 'society-sources'
OUT = ROOT / 'assets' / 'societies'
CACHE.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)
SOCIALS = json.loads((ROOT / 'data/society-socials.json').read_text())
HEADERS = {'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36'}

class Markup(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []
        self.meta = {}
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'img':
            self.images.append(attrs)
        if tag == 'meta':
            self.meta[attrs.get('property', attrs.get('name',''))] = attrs.get('content','')

def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=18) as response:
        return response.read(8 * 1024 * 1024)

def collect(item):
    sid, record = item
    sources = [link['url'] for link in record['links']]
    if record.get('instagram'):
        sources.append(record['instagram'])
    failures = []
    for index, source in enumerate(sources):
        try:
            source_key = hashlib.sha256(source.encode()).hexdigest()[:10]
            cached = CACHE / f'{sid}-{source_key}.html'
            raw = cached.read_text(encoding='utf-8') if cached.exists() else fetch(source).decode('utf-8','replace')
            if not cached.exists(): cached.write_text(raw, encoding='utf-8')
            parsed = Markup(); parsed.feed(raw)
            candidates = []
            for img in parsed.images:
                url = img.get('data-delayed-url') or img.get('data-src') or img.get('src') or ''
                label = ((img.get('alt') or '') + ' ' + (img.get('class') or '')).lower()
                if 'company-logo' in url or 'top-card-layout__entity-image' in label or 'profile' in label or 'avatar' in label:
                    candidates.append((url, img.get('alt','')))
                if sid == 'spet' and 'SPET-logo' in url:
                    candidates.insert(0,(url,'SPET logo on the approved department page'))
            # Linktree uses its avatar as og:image; social company pages do too.
            og = parsed.meta.get('og:image') or ''
            if any(host in source for host in ['linktr.ee','instagram.com','facebook.com']):
                candidates.append((og,'Profile image metadata'))
            if 'linkedin.com/company/' in source and 'company-logo' in og:
                candidates.append((og,'Company logo metadata'))
            for url, label in candidates:
                if not url or url.startswith('data:') or 'static.licdn' in url:
                    continue
                url = urljoin(source,html.unescape(url))
                try:
                    data = fetch(url)
                    image = Image.open(io.BytesIO(data))
                    width,height = image.size
                    if min(width,height)<40 or max(width,height)/min(width,height)>1.35:
                        continue
                    ext = {'JPEG':'.jpg','PNG':'.png','WEBP':'.webp'}.get(image.format)
                    if not ext: continue
                    target = OUT / (sid + ext)
                    target.write_bytes(data)
                    return sid, {'path':str(target.relative_to(ROOT)).replace('\\','/'),'source':source,'label':label,'width':width,'height':height}
                except Exception:
                    continue
            failures.append('No usable profile image: '+source)
        except Exception as exc:
            failures.append(type(exc).__name__+': '+str(exc)[:100]+': '+source)
    return sid, {'missing':True,'attempts':failures}

if __name__ == '__main__':
    selected = set(sys.argv[1:])
    results = json.loads((OUT/'sources.json').read_text()) if selected and (OUT/'sources.json').exists() else {}
    items = [(sid,record) for sid,record in SOCIALS.items() if not selected or sid in selected]
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        for sid, result in pool.map(collect, items):
            results[sid] = result
            print(sid + ': ' + result.get('path','unavailable'),flush=True)
    (OUT / 'sources.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
