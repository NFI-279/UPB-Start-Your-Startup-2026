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
 def until(exp):
  for i in range(80):
   if js(exp): return
   time.sleep(.12)
  raise AssertionError(exp)
 until("document.getElementById('intro').classList.contains('live')")
 js("document.documentElement.style.scrollBehavior='auto'")
 call('Runtime.evaluate',dict(expression='document.fonts.ready',awaitPromise=True))
 time.sleep(.4);shot('current-hero')
 def clip(selector,name):
  r=js("JSON.parse(JSON.stringify(document.querySelector("+json.dumps(selector)+").getBoundingClientRect()))")
  scroll=js("scrollY")
  img=call('Page.captureScreenshot',dict(format='png',captureBeyondViewport=True,clip=dict(x=r['x'],y=r['y']+scroll,width=r['width'],height=r['height'],scale=1)))
  (work/(name+'.png')).write_bytes(base64.b64decode(img['data']))
 def still(name):
  js("window.inject=document.head.appendChild(document.createElement('style'));inject.textContent=':root,body{background:transparent!important}body:before,.coverBar,.coverFoot,.tag{visibility:hidden!important}'")
  call('Emulation.setDefaultBackgroundColorOverride',dict(color=dict(r=0,g=0,b=0,a=0)))
  clip('#heroScene',name)
  js('inject.remove()');call('Emulation.setDefaultBackgroundColorOverride',{})
 still('static-desktop')
 js("document.querySelector('.contactGlass').click()")
 assert js("document.querySelector('#leadDialog').open && !location.hash")
 shot('contact-dialog');js("document.querySelector('#leadSave').click()")
 assert js("document.querySelector('#leadFeedback').textContent.includes('firmei')")
 js("document.querySelector('#leadCompany').value='Firma Demo';document.querySelector('#leadName').value='Test Demo';document.querySelector('#leadEmail').value='demo@example.test'")
 dest=work/'lead-download';dest.mkdir(exist_ok=True)
 call('Browser.setDownloadBehavior',dict(behavior='allow',downloadPath=str(dest)))
 js("document.querySelector('#leadSave').click()");time.sleep(.4)
 assert any('Firma Demo' in f.read_text(encoding='utf-8-sig') and '100/100' in f.read_text(encoding='utf-8-sig') for f in dest.glob('*.txt'))
 print('Contact email draft',js("(()=>{let url='';const click=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){url=this.href};try{document.querySelector('#leadForm').requestSubmit()}finally{HTMLAnchorElement.prototype.click=click}return url.startsWith('mailto:')&&decodeURIComponent(url).includes('demo@example.test')})()"))
 call('Input.dispatchKeyEvent',dict(type='keyDown',key='Escape',code='Escape',windowsVirtualKeyCode=27));call('Input.dispatchKeyEvent',dict(type='keyUp',key='Escape',code='Escape',windowsVirtualKeyCode=27))
 until("!document.querySelector('#leadDialog').open")
 js("document.querySelector('#simulator').scrollIntoView();document.querySelector('[data-s=\"20\"]').click()")
 until("!document.querySelector('#hud').textContent.includes('Paletizate 0 ')")
 print('HUD',js("document.querySelector('#hud').textContent"))
 js("document.querySelector('#bp').click()");shot('current-sim')
 js("document.querySelectorAll('.tag').forEach(e=>e.style.visibility='hidden')")
 clip('#cv','static-cell')
 js("document.querySelectorAll('.tag').forEach(e=>e.style.visibility='')")
 for name in ['side','top','cell']:
  js("document.querySelector('[data-view="+name+"]').click()");time.sleep(.55)
  assert js("document.querySelector('[data-view="+name+"]').getAttribute('aria-pressed')==='true'")
 print('normal',js("document.querySelector('#fit-text').value.slice(0,650)"))
 def change(id,val):
  js("const f=document.getElementById("+json.dumps(id)+");f.value="+json.dumps(val)+";f.dispatchEvent(new Event('input',{bubbles:true}))".replace("const f=","var f="))
 for f,v in [('kg','-1'),('kg','40'),('rate','0'),('rate',''),('kg','13'),('rate','5'),('cap','500')]:
  js("(()=>{const f=document.getElementById("+json.dumps(f)+");f.value="+json.dumps(v)+";f.dispatchEvent(new Event('input',{bubbles:true}))})()")
  print(f,v,js("[document.querySelector('#fit-state').innerText,document.querySelector('#fit-download').disabled]"))
 js("document.querySelector('[data-preset=large]').click()")
 js("document.querySelector('#county').value='Timiș';document.querySelector('#county').dispatchEvent(new Event('change'))")
 assert js("document.querySelector('#fit-text').value.includes('Timișoara')")
 dest=work/'redesign-download';dest.mkdir(exist_ok=True)
 call('Browser.setDownloadBehavior',dict(behavior='allow',downloadPath=str(dest)))
 js("document.querySelector('#fit-download').click()");time.sleep(.3)
 assert any('Timișoara' in file.read_text(encoding='utf-8-sig') for file in dest.glob('*.txt'))
 device(390,844);js("scrollTo(0,0)");time.sleep(.7);shot('current-mobile');still('static-mobile')
 print('mobile',js("[innerWidth,document.documentElement.scrollWidth,document.querySelector('#cv').getBoundingClientRect().top<document.querySelector('#bucket-fit').getBoundingClientRect().top]"))
 print('small text',js("Array.from(document.querySelectorAll('body *')).filter(e=>e.getClientRects().length&&Array.from(e.childNodes).some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<15).map(e=>[e.tagName,e.className,getComputedStyle(e).fontSize])"))
 print('small controls',js("Array.from(document.querySelectorAll('button,input,select,summary')).filter(e=>e.getClientRects().length&&e.getBoundingClientRect().height<43.9).map(e=>e.outerHTML.slice(0,55))"))
 call('Emulation.setEmulatedMedia',dict(features=[dict(name='prefers-reduced-motion',value='reduce')]))
 time.sleep(.5);print('reduce',js("[getComputedStyle(document.querySelector('#heroScene')).visibility, getComputedStyle(document.querySelector('.staticHero')).visibility,document.querySelector('#bp').innerText]"))
 print('external requests',[e['params']['request']['url'][:90] for e in events if e.get('method')=='Network.requestWillBeSent' and e['params']['request']['url'].startswith(('http:','https:'))])
 print('errors',[e['params']['exceptionDetails'].get('exception',{}).get('description','') for e in events if e.get('method')=='Runtime.exceptionThrown'])
 call('Browser.close')
finally:
 try:proc.wait(timeout=3)
 except subprocess.TimeoutExpired:proc.terminate()




