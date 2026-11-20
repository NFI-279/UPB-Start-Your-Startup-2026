from pathlib import Path
w=Path(__file__).parent
p=w/'scene.js'
s=p.read_text(encoding="utf-8-sig")
s=s[:s.index('// The same scene graph')]+s[s.index('const wrist=G[5];'):]
s=s.replace('0x152939','0xe0e9ee').replace('0x142938','0xb3c2ca').replace('0x345166,0x294353','0x8da1ad,0xa9bbc6').replace('0x9a663a','0x8b5a2b').replace('0x8b542e','0x8b5a2b')
s=s.replace('catch(e){ renderer=softwareRenderer(); }','''catch(e){
   host.closest(".console").classList.add("still");
   return {camera,host,scene,target,visible:false,dirty:false,static:true};
 }''')
s=s.replace('function draw(v){','function draw(v){\n if(v.static)return;')
s=s.replace('function playLabel(){','function playLabel(){').replace('b.disabled=!valid||!!reachError','b.disabled=!!simView.static||!valid||!!reachError')
s=s.replace('setStatus(!valid?', 'setStatus(simView.static?"Imagine statică. Redarea 3D necesită WebGL. Formularul și fișa sunt disponibile.":!valid?')
s=s.replace('Model CAD UR20 · zonă scanată marcată cu galben','')
a=s.index('function setView(name)');b=s.index('function tags()',a)
s=s[:a]+'''const cameraPresets={cell:[.45,.95,5.55],side:[.04,1.33,5.15],top:[0,.035,5.45]};
let transition=null;
function setView(name){
 const to=cameraPresets[name];
 transition={from:[simView.az,simView.polar,simView.radius],to,time:0};
 document.querySelectorAll("[data-view]").forEach(b=>b.setAttribute("aria-pressed",String(name===b.dataset.view)));
 simView.dirty=true;
}
for(const b of document.querySelectorAll("[data-view]"))b.onclick=()=>setView(b.dataset.view);
if(simView.static)document.querySelectorAll(".console button").forEach(b=>b.disabled=true);
'''+s[b:]
s=s.replace('function tags(){','function tags(){\n if(simView.static)return;')
s=s.replace(' if(simView.visible && valid', ''' if(simView.visible && transition){
  transition.time+=dt;
  const fraction=reduced.matches?1:Math.min(1,transition.time/.52);
  [simView.az,simView.polar,simView.radius]=blend(transition.from,transition.to,fraction);
  simView.dirty=true;
  if(fraction===1)transition=null;
 }
 if(simView.visible && valid''')
p.write_text(s,encoding="utf-8")
