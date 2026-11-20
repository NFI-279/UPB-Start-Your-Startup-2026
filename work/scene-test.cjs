const fs=require('fs'),vm=require('vm');
const source=fs.readFileSync(require('path').join(__dirname, '../inputs/extracted/Pre-evaluare paletizare UR20.html'),'utf8');
const cad=source.slice(source.indexOf('const PARTS='),source.indexOf('/* ---------- evaluare')).replaceAll('L1+L2-.01','L1+L2');
const THREE=require('./three.min.js');const elements={},allButtons=[];
function element(id){return elements[id]??={id,style:{},clientWidth:800,clientHeight:410,addEventListener(){},setAttribute(){},prepend(){},classList:{toggle(){}}};}
const document={getElementById:element,querySelector(){return null;},querySelectorAll(){return [];}};
THREE.WebGLRenderer=class{domElement=element('cv1');setPixelRatio(){}setSize(){}render(){}};
const context={THREE,document,window:{},atob,Uint8Array,Int16Array,Int8Array,console,matchMedia(){return {matches:false,addEventListener(){}}},ResizeObserver:class{observe(){}},requestAnimationFrame(){}};
let script=fs.readFileSync(__dirname+'/scene.js','utf8');
script=script.replace('requestAnimationFrame(frame);window.refreshFit?.();',`function check(ok,msg){if(!ok)throw Error(msg);}
for(const c of [{kg:5,cap:100},{kg:13,cap:44}]){
 window.updateScenario({...defaultValues,...c});
 check(reachError==='',reachError);
 for(let i=0;i<20000;i++) move(.05);
 console.log('After 1000 seconds',c,placed,pallets.map(p=>[p.n,p.waiting]),queue.length);
 check(placed>=81 && placed<=84,'wrong measured pace');
}
window.updateScenario({...defaultValues,cap:499});check(!!reachError,'Unreachable stack not detected');
window.updateScenario({...defaultValues,cap:1,chg:.1});for(let i=0;i<1000;i++)move(.05);check(placed>=3,'two-position exchange');
window.updateScenario({...defaultValues,cap:1,operator:'none'});for(let i=0;i<10000;i++)move(.05);
check(placed===2&&blocked,'missing operator must stop cell after two full pallets');
console.log('Reach, timing, manual exchange, operator unavailable and belt saturation passed.');`);
vm.runInNewContext(cad+script,context);
