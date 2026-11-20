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
sc.background=new THREE.Color(0x152939);
sc.fog=new THREE.FogExp2(0x152939,.075);
sc.add(new THREE.HemisphereLight(0xe3f4ff,0xa9b8c0,1.08));
const key=new THREE.DirectionalLight(0xfff5e8,1.0); key.position.set(3,6,3);sc.add(key);
const rim=new THREE.DirectionalLight(0xbde8ff,.8);rim.position.set(-4,3,-2);sc.add(rim);
const ground=mesh(new THREE.PlaneGeometry(25,25),material(0x142938),sc);
ground.rotation.x=-Math.PI/2;
const grid=new THREE.GridHelper(16,64,0x345166,0x294353);grid.position.y=.002;sc.add(grid);
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

