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
 call('Page.addScriptToEvaluateOnNewDocument',{'source':"const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,o){return original.call(this,t,t.includes('webgl')?{...o,preserveDrawingBuffer:true}:o)};"})
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
  data=js("document.querySelector('#heroScene canvas').toDataURL('image/png')");(work/(name+'.png')).write_bytes(base64.b64decode(data.split(',')[1]))
 still('static-desktop')
 time.sleep(2.4);shot('title-pick')
 time.sleep(3.0);shot('title-return')
 device(390,844);time.sleep(.6);shot('current-mobile');still('static-mobile')
 print('Rendered desktop, mobile, motion samples and static covers.')
 call('Browser.close')
finally:
 try:proc.wait(timeout=3)
 except subprocess.TimeoutExpired:proc.terminate()





