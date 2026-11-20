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
 until("document.querySelector('#intro').classList.contains('live')")
 device(390,844);js("document.documentElement.style.scrollBehavior='auto';scrollTo(0,0)")
 call('Emulation.setCPUThrottlingRate',{'rate':4})
 print('Mobile emulation 4x CPU, 30 rAF samples (ms)',js("new Promise(resolve=>{let gaps=[],last=0;function frame(ts){if(last)gaps.push(ts-last);last=ts;if(gaps.length===30){gaps.sort((a,b)=>a-b);resolve([Math.round(gaps[15]),Math.round(gaps[28])])}else requestAnimationFrame(frame)}requestAnimationFrame(frame)})"))
 call('Emulation.setCPUThrottlingRate',{'rate':1})
 js("document.querySelector('.contactGlass').click()")
 assert js("document.getElementById('leadDialog').open");shot('dialog-mobile')
 js("document.querySelector('.modalClose').click()")
 call('Emulation.setEmulatedMedia',dict(features=[dict(name='prefers-reduced-motion',value='reduce')]))
 call('Page.reload',{'ignoreCache':True});time.sleep(.6)
 until("document.querySelector('#fit-text')?.value.includes('100/100') && document.querySelector('#bp')?.innerText==='Pornește'")
 print('Reduced motion',js("[document.querySelectorAll('#heroScene canvas').length,document.querySelector('.staticHero img').naturalWidth,getComputedStyle(document.querySelector('.staticHero')).visibility]"))
 call('Page.addScriptToEvaluateOnNewDocument',{'source':"const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){if(t.includes('webgl'))return null;return get.call(this,t,...a)};"})
 call('Emulation.setEmulatedMedia',dict(features=[dict(name='prefers-reduced-motion',value='no-preference')]))
 call('Page.reload',{'ignoreCache':True})
 until("document.querySelector('.console')?.classList.contains('still')")
 assert js("document.querySelector('#simStill').naturalWidth>400&&document.querySelector('#fit-text').value.includes('100/100') && document.querySelector('#bp').disabled")
 print('No WebGL',js("document.querySelector('#sceneStatus').textContent"))
 print('Offline errors',[e['params']['exceptionDetails'].get('exception',{}).get('description','') for e in events if e.get('method')=='Runtime.exceptionThrown'])
 call('Browser.close')
finally:
 try:proc.wait(timeout=3)
 except subprocess.TimeoutExpired:proc.terminate()





