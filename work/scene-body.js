
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
const profiles=[
 {r:.096,h:.21,pl:20,nx:5,nz:4,dx:.22,dz:.2,color:0x9a663a},
 {r:.122,h:.27,pl:11,nx:4,nz:3,dx:.3,dz:.26,color:0x8b542e}
];
const bucketTemplates=profiles.map(k=>{
 const g=new THREE.Group(), top=k.h/2;
 mesh(new THREE.CylinderGeometry(k.r,k.r*.84,k.h,24),material(k.color),g);
 mesh(new THREE.CylinderGeometry(k.r*1.04,k.r*1.04,.014,28),material(0x57351f),g,0,top-.004,0);
 const arc=mesh(new THREE.TorusGeometry(k.r*.89,.0045,5,21,Math.PI),paint.steel,g,0,top-.033,0);
 arc.rotation.x=1.28;return g;
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
 catch(e){ renderer=softwareRenderer(); }
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
 const radius=v.radius*Math.max(1,1.20/v.camera.aspect);
 v.camera.position.set(v.target.x+radius*Math.sin(v.polar)*Math.sin(v.az),v.target.y+radius*Math.cos(v.polar),v.target.z+radius*Math.sin(v.polar)*Math.cos(v.az));
 v.camera.lookAt(v.target);v.renderer.render(v.scene,v.camera);v.dirty=false;
}
const preview=sc.clone(true), previewRoot=preview.getObjectByName("J1");
const previewJoints=homeAngles.map((_,i)=>previewRoot.getObjectByName("J"+(i+1)));
const previewBucket=bucketTemplates[1].clone();preview.add(previewBucket);
const previewPoint=pallets[0].g.localToWorld(slot(profiles[1],0));
const take=angles(PX,HC+.27,0), up=angles(PX,HC+.49,0), down=angles(previewPoint.x,previewPoint.y+.135,previewPoint.z);
const approach=angles(previewPoint.x,previewPoint.y+.42,previewPoint.z);
const heroView=makeView(hero,preview,new THREE.Vector3(.26,1.00,0),[.34,1.08,4.35]);
const simView=makeView(cv,sc,new THREE.Vector3(.62,.67,0),[.45,.95,5.55]);
for(const x of [1.50,1.91,2.32,2.73]){const b=bucketTemplates[1].clone();b.position.set(x,HC+.135,0);preview.add(b);}
const frames=[[homeAngles,0],[up,1.45],[take,2.1],[up,2.8],[approach,4.2],[down,4.95],[approach,5.65]];
let heroTime=reduced.matches?5.65:0;
function heroFrame(t){
 const end=frames.findIndex(f=>f[1]>=t);let q=frames[frames.length-1][0];
 if(end<=0&&t===0)q=homeAngles;
 if(end>0){const prev=frames[end-1],next=frames[end];q=blend(prev[0],next[0],(t-prev[1])/(next[1]-prev[1]));}
 setPose(previewJoints,q);
 if(t<2.10)previewBucket.position.set(PX,HC+.135,0);
 else if(t>=4.95)previewBucket.position.copy(previewPoint);
 else {const contact=fk(q,[0,1.986,-.201-D]);previewBucket.position.set(contact[0],contact[1]+PED-.135,contact[2]);}
}
function endIntro(){heroTime=5.65;heroFrame(heroTime);heroView.dirty=true;document.getElementById("skipHero").hidden=true;}
const skip=document.getElementById("skipHero");skip.onclick=endIntro;if(reduced.matches)endIntro();
const defaultValues={kg:13,cap:44,rate:5,chg:2,cyc:7.5,operator:"available"};
let values=defaultValues,profileIndex=1,k=profiles[1],queue=[],active=null,carried=null,elapsed=0,arrival=0,placed=0,current=0,blocked=false;
let running=!reduced.matches,valid=true,speed=+(document.querySelector("[data-s].on")?.dataset.s||5),lastAngles=up,reachError="";
function playLabel(){const b=document.getElementById("bp");b.textContent=running?"Pauză":"Pornește";b.disabled=!valid||!!reachError;b.setAttribute("aria-pressed",String(running));}
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
function scheduleStatus(){setStatus(!valid?"Simulare suspendată. Verificați datele scenariului.":reachError||"Model CAD UR20 · zonă scanată marcată cu galben");}
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
   p.buckets.push(carried);carried=null;p.n++;placed++;
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
function setView(name){
 const preset={cell:[.45,.95,5.55],side:[.04,1.33,5.15],front:[1.62,1.25,5.20]}[name];
 if(preset)[simView.az,simView.polar,simView.radius]=preset;simView.dirty=true;
}
for(const button of document.querySelectorAll("[data-view]"))button.onclick=()=>setView(button.dataset.view);
const pointers=new Map();
cv.tabIndex=0;cv.setAttribute("aria-label","Vedere 3D a celulei. Rotiți cu săgețile, măriți sau micșorați cu plus și minus.");
function zoom(f){simView.radius=Math.min(9,Math.max(2.1,simView.radius*f));simView.dirty=true;}
function orbit(dx,dy){simView.az+=dx;simView.polar=Math.min(1.49,Math.max(.18,simView.polar+dy));simView.dirty=true;}
cv.onkeydown=e=>{
 if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","+","=","-"].includes(e.key)){e.preventDefault();
 if(e.key==="+"||e.key==="=")zoom(.9);else if(e.key==="-")zoom(1.1);else orbit(({ArrowLeft:-.08,ArrowRight:.08})[e.key]||0,({ArrowUp:-.08,ArrowDown:.08})[e.key]||0);}
};
cv.addEventListener("pointerdown",e=>{cv.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);});
cv.addEventListener("lostpointercapture",e=>pointers.delete(e.pointerId));
cv.addEventListener("pointermove",e=>{
 const old=pointers.get(e.pointerId);if(!old)return;
 const other=[...pointers].find(([id])=>id!==e.pointerId)?.[1];
 if(other)zoom(Math.hypot(old[0]-other[0],old[1]-other[1])/Math.max(1,Math.hypot(e.clientX-other[0],e.clientY-other[1])));
 else orbit((old[0]-e.clientX)*.006,(old[1]-e.clientY)*.006);pointers.set(e.pointerId,[e.clientX,e.clientY]);
});
cv.addEventListener("wheel",e=>{e.preventDefault();zoom(Math.exp(Math.sign(e.deltaY)*.09));},{passive:false});
function tags(){
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
reduced.addEventListener("change",e=>{if(e.matches){endIntro();running=false;playLabel();}});
let last=0,lastHUD=0,lastDraw=0;
function frame(now){
 requestAnimationFrame(frame);
 const dt=last?Math.min(.10,(now-last)/1000):0;last=now;
 if(document.hidden)return;
 if(heroView.visible && (heroTime<5.65||heroView.dirty)){
  heroTime=Math.min(5.65,heroTime+dt);heroFrame(heroTime);draw(heroView);if(heroTime>=5.65)skip.hidden=true;
 }
 if(simView.visible && valid && running && !reachError){
  let remaining=dt*speed;while(remaining>.000001){const sub=Math.min(remaining,.1);move(sub);remaining-=sub;}simView.dirty=true;
 }
 if(simView.visible && simView.dirty && now-lastDraw>25){draw(simView);tags();lastDraw=now;}
 if(now-lastHUD>270&&simView.visible){hud();lastHUD=now;}
}
resetScenario();heroFrame(heroTime);draw(heroView);draw(simView);tags();if(reduced.matches)skip.hidden=true;
requestAnimationFrame(frame);window.refreshFit?.();
})();
