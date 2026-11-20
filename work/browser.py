from pathlib import Path
import subprocess, time, urllib.request, json, base64, websocket
work = Path(__file__).resolve().parent
profile=work/'browser-profile'
url=(work.parent/'outputs'/'index.html').as_uri()
proc=subprocess.Popen([r'C:\Program Files\Google\Chrome\Application\chrome.exe','--headless=new','--disable-background-networking','--enable-unsafe-swiftshader','--use-angle=swiftshader','--no-first-run','--disable-extensions','--remote-allow-origins=*','--remote-debugging-port=0','--user-data-dir='+str(profile),'about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
 for _ in range(120):
  try:
   port=(profile/'DevToolsActivePort').read_text().splitlines()[0]
   target=json.load(urllib.request.urlopen('http://127.0.0.1:'+port+'/json/list'))[0]
   sock=websocket.create_connection(target['webSocketDebuggerUrl'],timeout=15,suppress_origin=True)
   break
  except Exception:time.sleep(.12)
 else: raise Exception('Chrome debugging unavailable')
 counter=0; events=[]
 def call(method,params=None):
  global counter
  counter+=1
  sock.send(json.dumps(dict(id=counter,method=method,params=params or {})))
  while True:
   msg=json.loads(sock.recv())
   if msg.get('id')==counter:
    if msg.get('error'): raise Exception(msg['error'])
    return msg.get('result')
   events.append(msg)
 def js(expression):
  result=call('Runtime.evaluate',dict(expression=expression,returnByValue=True,awaitPromise=True))
  if 'exceptionDetails' in result:raise Exception(result['exceptionDetails'])
  return result['result'].get('value')
 def shot(name):
  img=call('Page.captureScreenshot',dict(format='jpeg',quality=78))
  (work/(name+'.jpg')).write_bytes(base64.b64decode(img['data']))
 def device(width,height):
  call('Emulation.setDeviceMetricsOverride',dict(width=width,height=height,deviceScaleFactor=1,mobile=False))
 call('Runtime.enable');call('Network.enable');call('Page.enable')
 call('Network.emulateNetworkConditions',dict(offline=True,latency=0,downloadThroughput=-1,uploadThroughput=-1))
 call('Emulation.setEmulatedMedia',dict(features=[dict(name='prefers-reduced-motion',value='no-preference')]))
 device(1360,890);call('Page.navigate',{'url':url})
 for _ in range(80):
  if js("document.readyState==='complete' && document.querySelector('#fit-text')?.value.length>20"):break
  time.sleep(.1)
 print('page',js("[document.title,document.querySelectorAll('canvas').length,document.querySelector('#sceneStatus').textContent,document.querySelector('#fit-state').innerText]"),flush=True)
 assert js("document.querySelector('.studioRobot').naturalWidth>900");shot('desktop')
 js("document.querySelector('.contactGlass').click()");assert js("location.hash==='#contact' && document.querySelector('#contact').getBoundingClientRect().top < innerHeight")
 js("document.querySelector('#simulator').scrollIntoView();document.querySelector('[data-s=\"20\"]').click()");time.sleep(3)
 print('sim',js("document.querySelector('#hud').innerText"),flush=True)
 assert 'Paletizate 0 ' not in js("document.querySelector('#hud').innerText"), 'Conveyor did not deposit'
 shot('sim')
 for preset in ['side','front','cell']:
  js("document.querySelector('[data-view="+preset+"]').click()")
 js("document.querySelector('#bp').click()")
 print('pause',js("document.querySelector('#bp').textContent"))
 js("document.querySelector('#br').click()")
 print('default report',js("document.querySelector('#fit-text').value.slice(0,700)"))
 def change(id,value):
  js("document.getElementById("+json.dumps(id)+").value="+json.dumps(value)+";document.getElementById("+json.dumps(id)+").dispatchEvent(new Event('input',{bubbles:true}))")
 for field,val in [('kg','-1'),('kg','40'),('rate','0'),('rate','')]:
  change(field,val);print(field,val,js("[document.querySelector('#fit-state').innerText,document.querySelector('#fit-download').disabled]"))
 js("document.querySelector('[data-preset=small]').click()")
 assert js("document.querySelector('#cap').value==='100'")
 js("document.querySelector('#county').value='Timiș';document.querySelector('#county').dispatchEvent(new Event('change'))")
 assert js("document.querySelector('#fit-text').value.includes('Timișoara')")
 dest=work/'test-download';dest.mkdir(exist_ok=True)
 call('Browser.setDownloadBehavior',dict(behavior='allow',downloadPath=str(dest)))
 js("document.querySelector('#fit-download').click()");time.sleep(.6)
 assert any('Timișoara' in file.read_text(encoding='utf-8-sig') for file in dest.glob('*.txt'))
 js("document.querySelector('#theme').click()")
 device(390,844);js("scrollTo(0,0)");time.sleep(.4);shot('mobile')
 print('mobile',js("[innerWidth,document.documentElement.scrollWidth,document.documentElement.dataset.theme]"))
 call('Emulation.setEmulatedMedia',dict(features=[dict(name='prefers-reduced-motion',value='reduce')]))
 time.sleep(.2);print('reduce',js("[document.querySelectorAll('.cover canvas').length===0,document.querySelector('#bp').innerText]"))
 print('outside requests',[e['params']['request']['url'][:90] for e in events if e.get('method')=='Network.requestWillBeSent' and e['params']['request']['url'].startswith(('http:','https:'))])
 print('errors',[e['params']['exceptionDetails'].get('exception',{}).get('description','') for e in events if e.get('method')=='Runtime.exceptionThrown'])
 call('Browser.close')
finally:
 try:proc.wait(timeout=3)
 except subprocess.TimeoutExpired:proc.terminate()


