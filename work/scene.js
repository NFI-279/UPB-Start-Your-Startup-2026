/* Visualisation locale. Les repères du STEP sont conservés dans le graphe articulé. */
(() => {
const cv = document.getElementById("cv"), hero = document.getElementById("heroScene");
const status = document.getElementById("sceneStatus");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const setStatus = s => { if(status) status.textContent=s; };
function mesh(geometry,material,parent,x=0,y=0,z=0) {
  const part=new THREE.Mesh(geometry,material);
  part.position.set(x,y,z); parent.add(part); return part;
}
const material=(color,metalness=0,roughness=.65)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
const paint = {steel:material(0x9caab2,.35), iron:material(0x344653,.3), rubber:material(0x233440),
  yellow:material(0xe4b13b), wood:material(0xc79765), darkwood:material(0xad7951), blue:material(0x56b5db), black:material(0x192a34)};
function box(parent,w,h,d,m,x,y,z){return mesh(new THREE.BoxGeometry(w,h,d),m,parent,x,y,z);}
const sc=new THREE.Scene();
sc.background=new THREE.Color(0xe0e9ee);
sc.fog=new THREE.FogExp2(0xe0e9ee,.075);
sc.add(new THREE.HemisphereLight(0xe3f4ff,0xa9b8c0,1.08));
const key=new THREE.DirectionalLight(0xfff5e8,1.0); key.position.set(3,6,3);sc.add(key);
const rim=new THREE.DirectionalLight(0xbde8ff,.8);rim.position.set(-4,3,-2);sc.add(rim);
const ground=mesh(new THREE.PlaneGeometry(25,25),material(0xb3c2ca),sc);
ground.rotation.x=-Math.PI/2;
const grid=new THREE.GridHelper(16,64,0x8da1ad,0xa9bbc6);grid.position.y=.002;sc.add(grid);
const zone=mesh(new THREE.RingGeometry(1.99,2.008,100),new THREE.MeshBasicMaterial({color:0xcfa53c,side:THREE.DoubleSide}),sc,0,.009,0);
zone.rotation.x=-Math.PI/2;
for(const a of [-.6,1.7,3.8]) {
  const post=new THREE.Group();post.position.set(2*Math.cos(a),0,2*Math.sin(a));post.rotation.y=-a;sc.add(post);
  box(post,.10,.10,.10,paint.yellow,0,.07,0);box(post,.08,.04,.09,paint.black,0,.14,0);
}
box(sc,.56,.06,.56,paint.iron,0,.03,0);box(sc,.42,PED-.09,.42,paint.steel,0,(PED-.09)/2+.06,0);
box(sc,.53,.03,.53,paint.iron,0,PED-.015,0);
const root=new THREE.Group();root.position.y=PED;sc.add(root);
const G=[];let prev=root;
for(let i=0;i<6;i++) {
 const joint=new THREE.Group();joint.position.set(...J[i].map((v,k)=>v-(i?J[i-1][k]:0)));
 joint.name="J"+(i+1);prev.add(joint);G.push(joint);prev=joint;
}


function dec(p,i){const bin=atob(p.b),u=new Uint8Array(bin.length);for(let k=0;k<u.length;k++)u[k]=bin.charCodeAt(k);const n=p.n;
 const pos=new Int16Array(u.buffer.slice(0,n*6)),nr=new Int8Array(u.buffer.slice(n*6,n*9)),col=new Uint8Array(n*3);
 const sites={1:[[0,.236]],2:[[0,.236],[0,1.098]],3:[[0,1.098],[0,1.827]],4:[[0,1.827]]}[i]||[],base={0:[170,177,184],7:[58,61,64]}[i]||[88,94,101],tube=i==2||i==3?[196,201,206]:null;
 const zs=[];for(let k=0;k<n;k++){const x=pos[3*k]*1e-4,y=pos[3*k+1]*1e-4,z=pos[3*k+2]*1e-4;let c=base,d=9;
  for(const s of sites)d=Math.min(d,Math.hypot(x-s[0],y-s[1]));
  if(tube&&d>.1)c=tube;zs.push(d);col[3*k]=c[0];col[3*k+1]=c[1];col[3*k+2]=c[2]}
 sites.forEach((s,si)=>{let lo=9,hi=-9;const idx=[];for(let k=0;k<n;k++){const nz=Math.abs(nr[3*k+2])/127;if(nz>.97&&Math.hypot(pos[3*k]*1e-4-s[0],pos[3*k+1]*1e-4-s[1])<.085){idx.push(k);const z=pos[3*k+2]*1e-4;lo=Math.min(lo,z);hi=Math.max(hi,z)}}
  idx.forEach(k=>{const z=pos[3*k+2]*1e-4;if(z<lo+.006||z>hi-.006){col[3*k]=120;col[3*k+1]=190;col[3*k+2]=235}})});
 const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(pos,3));g.setAttribute("normal",new THREE.BufferAttribute(nr,3,true));g.setAttribute("color",new THREE.BufferAttribute(col,3,true));return g}
const mm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.4,metalness:.35});
PARTS.forEach((p,i)=>{const m=new THREE.Mesh(dec(p,i),mm);m.scale.setScalar(1e-4);
 const gi=i==0||i==7?root:G[i-1],pv=i==0||i==7?[0,0,0]:J[i-1];m.position.set(-pv[0],-pv[1],-pv[2]);gi.add(m)});
const wrist=G[5];
box(wrist,.14,.08,.09,paint.iron,0,0,-.074);
box(wrist,.25,.04,.055,paint.blue,0,0,-.143);
for(const x of [-.106,.106]) box(wrist,.025,.048,.095,paint.iron,x,0,-.203);
const belt=box(sc,2.50,.055,.49,paint.rubber,2.10,HC-.029,0);
for(let z of [-.255,.255]) {
 box(sc,2.52,.11,.035,paint.steel,2.10,HC-.036,z);
 for(let x of [.96,2.10,3.21]){
  box(sc,.055,HC-.1,.055,paint.steel,x,(HC-.1)/2,z);
  box(sc,.12,.028,.10,paint.iron,x,.014,z);
 }
}
for(let x=1;x<3.35;x+=.19) box(sc,.012,.003,.48,paint.iron,x,HC-.0005,0);
box(sc,.03,.095,.5,paint.yellow,.86,HC+.02,0);
box(sc,.036,.58,.036,paint.steel,1.52,HC+.21,-.30);
box(sc,.036,.035,.31,paint.steel,1.52,HC+.49,-.16);
box(sc,.096,.07,.07,paint.blue,1.52,HC+.44,-.025);
function makePallet(angle,name){
 const a=angle*Math.PI/180,g=new THREE.Group();
 g.position.set(RP*Math.cos(a),0,RP*Math.sin(a));g.rotation.y=Math.atan2(-Math.cos(a),-Math.sin(a));sc.add(g);
 for(const z of [-.32,0,.32]){
   box(g,1.2,.026,.13,paint.darkwood,0,.013,z);
   for(const x of [-.5,0,.5]) box(g,.16,.084,.13,paint.darkwood,x,.067,z);
 }
 for(let z=-.335;z<.35;z+=.1675)box(g,1.2,.035,.13,paint.wood,0,.1265,z);
 return {g,name,n:0,waiting:0,buckets:[],tag:document.getElementById("t"+name)};
}
const pallets=[makePallet(125,"A"),makePallet(235,"B")];
sc.updateMatrixWorld(true);
const profiles=[
 {r:.096,h:.21,pl:20,nx:5,nz:4,dx:.22,dz:.2,color:0x8b5a2b},
 {r:.122,h:.27,pl:11,nx:4,nz:3,dx:.3,dz:.26,color:0x8b5a2b}
];
const bucketTemplates=profiles.map(k=>{
 const g=new THREE.Group(), top=k.h/2;
 mesh(new THREE.CylinderGeometry(k.r,k.r*.84,k.h,24),material(k.color),g);
 mesh(new THREE.CylinderGeometry(k.r*1.04,k.r*1.04,.014,28),material(0x57351f),g,0,top-.004,0);
 const arc=mesh(new THREE.TorusGeometry(k.r*.89,.0045,5,21,Math.PI),paint.steel,g,0,top+.003,0);
 arc.name="mâner";arc.rotation.x=.58;return g;
});
function slot(k,n){
 const i=n%k.pl;
 return new THREE.Vector3((i%k.nx-(k.nx-1)/2)*k.dx,.144+(Math.floor(n/k.pl)+.5)*k.h,(Math.floor(i/k.nx)-(k.nz-1)/2)*k.dz);
}
const homeAngles=[0,0,0,0,0,0];
const angles=(x,y,z)=>ik(x,y-PED,z).q;
function setPose(joints,q){joints.forEach((g,i)=>g.rotation[i===0||i===4?"y":"z"]=q[i]);}
const smooth=t=>t*t*(3-2*t);
function blend(a,b,t){return a.map((v,i)=>v+(b[i]-v)*smooth(t));}
function reachable(X,Y,Z){
 const radial=X*X+Z*Z-.201*.201;
 if(radial<0)return false;
 const d=Math.hypot(Math.sqrt(radial)+.159,Y-PED+D-.236);
 return d<=L1+L2+1e-8 && d>=Math.abs(L1-L2)-1e-8;
}
function makeView(host,scene,target,initial){
 const camera=new THREE.PerspectiveCamera(36,1,.04,45);
 let renderer;
 try{ renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:"low-power"}); }
 catch(e){
   host.closest(".console").classList.add("still");
   return {camera,host,scene,target,visible:false,dirty:false,static:true};
 }
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
 const canvas=renderer.domElement;canvas.style.cssText="width:100%;height:100%;display:block;position:absolute;inset:0;z-index:0";
 canvas.setAttribute("aria-hidden","true");host.prepend(canvas);
 const view={camera,renderer,host,scene,target,az:initial[0],polar:initial[1],radius:initial[2],visible:true,dirty:true};
 function resize(){
  const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;
  camera.updateProjectionMatrix();view.dirty=true;
 }
 resize();new ResizeObserver(resize).observe(host);
 if("IntersectionObserver" in window)new IntersectionObserver(([entry])=>{view.visible=entry.isIntersecting;view.dirty=true;}).observe(host);
 return view;
}
function draw(v){
 if(v.static)return;
 const radius=v.radius*Math.max(1,1.20/v.camera.aspect);
 v.camera.position.set(v.target.x+radius*Math.sin(v.polar)*Math.sin(v.az),v.target.y+radius*Math.cos(v.polar),v.target.z+radius*Math.sin(v.polar)*Math.cos(v.az));
 v.camera.lookAt(v.target);v.renderer.render(v.scene,v.camera);v.dirty=false;
}
const up=angles(PX,HC+.49,0);
const simView=makeView(cv,sc,new THREE.Vector3(.62,.67,0),[.45,.95,5.55]);
const defaultValues={kg:13,cap:44,rate:5,chg:2,cyc:7.5,operator:"available"};
let values=defaultValues,profileIndex=1,k=profiles[1],queue=[],active=null,carried=null,elapsed=0,arrival=0,placed=0,current=0,blocked=false;
let running=!reduced.matches,valid=true,speed=+(document.querySelector("[data-s].on")?.dataset.s||5),lastAngles=up,reachError="";
function playLabel(){const b=document.getElementById("bp");b.textContent=running?"Pauză":"Pornește";b.disabled=!!simView.static||!valid||!!reachError;b.setAttribute("aria-pressed",String(running));}
function remove(obj){if(obj?.parent)obj.parent.remove(obj);}
function clearPallet(p){p.buckets.forEach(remove);p.buckets=[];p.n=0;p.waiting=0;}
function resetScenario(){
 queue.forEach(remove);queue=[];remove(carried);carried=null;active=null;pallets.forEach(clearPallet);
 k=profiles[profileIndex];elapsed=0;placed=0;arrival=0;current=0;blocked=false;reachError="";
 lastAngles=angles(PX,HC+k.h+UP,0);setPose(G,lastAngles);
 for(const p of pallets){
  for(let n=0;n<values.cap;n++){
   const point=p.g.localToWorld(slot(k,n));
   if(!reachable(point.x,point.y+k.h/2+UP,point.z)||!reachable(point.x,point.y+k.h/2,point.z)){
    reachError="Poziția "+p.name+", găleata "+(n+1)+" depășește raza modelului. Reduceți numărul de găleți pe palet.";break;
   }
  }
  if(reachError)break;
 }
 // One incoming bucket is already on the belt when the operator starts the demonstration.
 if(valid){const b=bucketTemplates[profileIndex].clone();b.position.set(1.48,HC+k.h/2,0);sc.add(b);queue.push(b);}
 playLabel();simView.dirty=true;hud();scheduleStatus();
}
function scheduleStatus(){window.scenarioReachWarning=reachError;setStatus(simView.static?"Imagine statică. Redarea 3D necesită WebGL. Formularul și fișa sunt disponibile.":!valid?"Simulare suspendată. Verificați datele scenariului.":reachError||"");}
window.updateScenario=v=>{
 if(!v){valid=false;playLabel();scheduleStatus();hud();return;}
 const updated={kg:v.kg,cap:v.cap,rate:v.rate,chg:v.chg,cyc:v.cyc??v.cycle??7.5,operator:v.operator||"available"};
 if(valid && Object.keys(updated).every(key=>updated[key]===values[key]))return;
 valid=true;values=updated;profileIndex=v.kg<9?0:1;resetScenario();
};
function startCycle(){
 if(pallets[current].waiting){if(pallets[1-current].waiting)return;current=1-current;}
 const p=pallets[current],s=slot(k,p.n),w=p.g.localToWorld(s.clone()),top=w.y+k.h/2,pk=HC+k.h;
 const a=angles(PX,pk+UP,0),pick=angles(PX,pk,0),b=angles(w.x,top+UP,w.z),place=angles(w.x,top,w.z);
 active={p,s,i:0,t:0,from:lastAngles,steps:[[a,.12],[pick,.12,"take"],[a,.1],[b,.26],[place,.12,"place"],[b,.08],[a,.2]]};
}
function move(dt){
 const gap=2*k.r+.06;elapsed+=dt;arrival+=dt;
 if(arrival>=60/values.rate){
  const tail=queue[queue.length-1];
  if(!tail||tail.position.x<=3.17-gap){
   const b=bucketTemplates[profileIndex].clone();b.position.set(3.17,HC+k.h/2,0);sc.add(b);queue.push(b);arrival-=60/values.rate;blocked=false;
  }else{arrival=60/values.rate;blocked=true;}
 }
 queue.forEach((b,i)=>b.position.x=Math.max(i?queue[i-1].position.x+gap:PX,b.position.x-.3*dt));
 pallets.forEach(p=>{if(p.waiting>0){p.waiting=Math.max(0,p.waiting-dt);if(p.waiting===0)clearPallet(p);}});
 if(!active&&queue.length&&queue[0].position.x<=PX+.001)startCycle();
 while(active && dt>1e-9){
  const cycle=active,segment=cycle.steps[cycle.i],duration=segment[1]*values.cyc;
  const advance=Math.min(dt,duration-cycle.t);cycle.t+=advance;dt-=advance;
  lastAngles=blend(cycle.from,segment[0],Math.min(1,cycle.t/duration));setPose(G,lastAngles);
  if(cycle.t<duration-1e-9)break;
  if(segment[2]==="take"){carried=queue.shift();G[5].attach(carried);}
  if(segment[2]==="place"){
   const p=cycle.p;p.g.attach(carried);carried.position.copy(cycle.s);carried.rotation.set(0,0,0);
   carried.getObjectByName("mâner").rotation.x=1.52;p.buckets.push(carried);carried=null;p.n++;placed++;
   if(p.n===values.cap){p.waiting=values.operator==="none"?Infinity:Math.max(.000001,values.chg*60);current=1-current;}
  }
  cycle.from=segment[0];cycle.i++;cycle.t=0;if(cycle.i===cycle.steps.length)active=null;
 }
}
document.getElementById("bp").onclick=()=>{running=!running;playLabel();};
document.getElementById("br").onclick=resetScenario;
for(const button of document.querySelectorAll("[data-s]")){
 button.onclick=()=>{speed=+button.dataset.s;for(const b of document.querySelectorAll("[data-s]")){b.classList.toggle("on",b===button);b.setAttribute("aria-pressed",String(b===button));}};
}
const cameraPresets={cell:[.45,.95,5.55],side:[.04,1.33,5.15],top:[0,.035,5.45]};
let transition=null;
function setView(name){
 const to=cameraPresets[name];
 transition={from:[simView.az,simView.polar,simView.radius],to,time:0};
 document.querySelectorAll("[data-view]").forEach(b=>b.setAttribute("aria-pressed",String(name===b.dataset.view)));
 simView.dirty=true;
}
for(const b of document.querySelectorAll("[data-view]"))b.onclick=()=>setView(b.dataset.view);
if(simView.static)document.querySelectorAll(".console button").forEach(b=>b.disabled=true);
function tags(){
 if(simView.static)return;
 for(const p of pallets){
  const point=p.g.localToWorld(new THREE.Vector3(0,.19,0));point.project(simView.camera);
  const el=p.tag;el.style.zIndex=1;el.style.left=Math.max(8,Math.min(92,(point.x*.5+.5)*100))+"%";el.style.top=Math.max(8,Math.min(94,(-point.y*.5+.5)*100))+"%";
  el.textContent=p.name+" · "+(p.waiting?"schimb manual":p.n+" / "+values.cap);
 }
}
const ro=n=>n.toLocaleString("ro-RO",{maximumFractionDigits:1});
function hud(){
 const manual=pallets.filter(p=>p.waiting).map(p=>p.name).join(" + ");
 document.getElementById("hud").innerHTML=(!valid?"<b>Date invalide · scenariu suspendat</b><br>":"")+"Coadă transportor <b>"+queue.length+"</b> · Paletizate <b>"+placed+"</b> · Ritm măsurat <b>"+ro(elapsed?placed*60/elapsed:0)+" /min</b> · Timp simulat <b>"+Math.floor(elapsed/60)+" min "+Math.floor(elapsed%60)+" s</b>"+(manual?"<br>Poziția "+manual+" · schimb manual (operator + separator)":"")+(blocked?"<br><b>Coada este plină. Alimentarea așteaptă la intrarea în celulă.</b>":"")+(reachError?"<br><b>"+reachError+"</b>":"");
}
reduced.addEventListener("change",e=>{if(e.matches){running=false;playLabel();}});
let last=0,lastHUD=0,lastDraw=0;
function frame(now){
 requestAnimationFrame(frame);
 const dt=last?Math.min(.10,(now-last)/1000):0;last=now;
 if(document.hidden||document.body.classList.contains("dialogOpen"))return;
 if(simView.visible && transition){
  transition.time+=dt;
  const fraction=reduced.matches?1:Math.min(1,transition.time/.52);
  [simView.az,simView.polar,simView.radius]=blend(transition.from,transition.to,fraction);
  simView.dirty=true;
  if(fraction===1)transition=null;
 }
 if(simView.visible && valid && running && !reachError){
  let remaining=dt*speed;while(remaining>.000001){const sub=Math.min(remaining,.1);move(sub);remaining-=sub;}simView.dirty=true;
 }
 if(simView.visible && simView.dirty && now-lastDraw>25){draw(simView);tags();lastDraw=now;}
 if(now-lastHUD>270&&simView.visible){hud();lastHUD=now;}
}
resetScenario();draw(simView);tags();
requestAnimationFrame(frame);window.refreshFit?.();
})();



