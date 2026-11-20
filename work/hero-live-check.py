from pathlib import Path
work=Path(__file__).parent.resolve()
page=(work.parent/'outputs/index.html').read_text(encoding="utf-8")
if "Two adjoining words" not in page:
    page=page.replace('const defaultValues=',(work/'hero-live.js').read_text(encoding='utf-8')+'\nconst defaultValues=')
if 'id="heroScene"' not in page:
    page=page.replace('id="intro"','id="intro"').replace('<body>','<body><div id="heroScene"></div>')
page=page.replace('</head>','<style>#heroScene{display:block!important;position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;z-index:9999;background:linear-gradient(115deg,#edf0f1,#cbdbe3 68%,#eef2f4);}</style></head>')
(work/'hero-live-test.html').write_text(page,encoding='utf-8')
common=(work/'browser.py').read_text().split(" print('page',js(")[0].replace("work.parent/'outputs'/'index.html'","work/'hero-live-test.html'").replace("'browser-profile'","'hero-live-profile'")
exec(common+'''
 time.sleep(1.2)
 print(js("[document.querySelector('#intro').className,document.querySelector('#heroScene').innerHTML.slice(0,200)]"))
 shot('hero-live-desktop')
 device(390,800);time.sleep(.8);shot('hero-live-mobile')
finally:
 proc.terminate()
''')
