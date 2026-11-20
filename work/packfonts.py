import re,base64,requests,concurrent.futures
from pathlib import Path
w=Path(__file__).parent
css=(w/'fonts-origin.css').read_text(encoding="utf-8-sig")
blocks=re.findall(r'/\* (?:latin-ext|latin) \*/\s*(@font-face\s*\{[^}]+\})',css)
def fetch(url):
 r=requests.get(url,timeout=18);r.raise_for_status();return r.content
def inline(block):
 url=re.search(r'url\(([^)]+)\)',block)[1];assert url.startswith('https://fonts.gstatic.com/')
 data=fetch(url);assert data[:4]==b'wOF2'
 return block.replace(url,'data:font/woff2;base64,'+base64.b64encode(data).decode()).replace('Barlow Condensed','StudioDisplay').replace('Source Sans 3','StudioBody')
with concurrent.futures.ThreadPoolExecutor(6) as pool:
 mapped=list(pool.map(inline,blocks))
 licenses=list(pool.map(fetch,['https://raw.githubusercontent.com/google/fonts/main/ofl/'+name+'/OFL.txt' for name in ('barlowcondensed','sourcesans3')]))
(w/'fonts.css').write_text('\n'.join(mapped),encoding='utf-8')
(w/'font-licenses.txt').write_text('\n\n'.join(item.decode('utf-8') for item in licenses),encoding='utf-8')
print('Embedded',len(mapped),'font faces.')
