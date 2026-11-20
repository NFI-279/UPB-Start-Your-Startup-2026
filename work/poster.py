from pathlib import Path
import subprocess, time, urllib.request, json, base64, websocket
work = Path(__file__).resolve().parent
profile=work/'browser-profile'
url=(work/'poster.html').as_uri()
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
 (work/'hero.png').write_bytes(base64.b64decode(js('window.poster').split(',')[1]))
 call('Browser.close')
finally:
 try:proc.wait(timeout=3)
 except subprocess.TimeoutExpired:proc.terminate()


