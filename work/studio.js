// Render the supplied articulated CAD assembly once for the static cover.
const studio = new THREE.Scene();
studio.add(root);
root.position.set(0,0,0);
const pose = [-.07,.59,-1.89,-.42,1.3,0];
G.forEach((g,i)=>g.rotation[i===0||i===4?'y':'z']=pose[i]);
const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
renderer.setSize(1800,1500);
renderer.setClearColor(0,0);
renderer.outputEncoding = THREE.sRGBEncoding;
// Large studio softboxes for highlights across the brush-finished surfaces.
const room = new THREE.Scene();
room.background = new THREE.Color(0x697b87);
for(const [x,y,z,w,h,power] of [[-2,2,2,2.4,4,4],[2,1,-1,.7,5,5],[2,3,2,5,.5,3],[-1,-1,2,3,1,.65]]){
 const panel = new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(power,power,power),side:THREE.DoubleSide}));
 panel.position.set(x,y,z); panel.lookAt(0,0,0);room.add(panel);
}
const env=new THREE.PMREMGenerator(renderer).fromScene(room,.05);
studio.environment=env.texture;
root.traverse(o=>{
 if(!o.isMesh||!o.geometry.attributes.color)return;
 const colors=o.geometry.attributes.color.array;
 for(let i=0;i<colors.length;i+=3){
   if(colors[i+2]>colors[i]+50){colors[i]=35;colors[i+1]=134;colors[i+2]=197;}
 }
 o.material=new THREE.MeshStandardMaterial({vertexColors:true,metalness:.78,roughness:.27,envMapIntensity:1.04});
});
studio.add(new THREE.HemisphereLight(0xffffff,0x617c91,.55));
const key=new THREE.DirectionalLight(0xfafcff,.85);key.position.set(-2,3,4);studio.add(key);
studio.updateMatrixWorld(true);
const camera=new THREE.PerspectiveCamera(26,1.2,.01,20);
camera.position.set(-1.25,1.29,3.8);camera.lookAt(.04,.77,0);camera.updateMatrixWorld();
renderer.render(studio,camera);window.poster=renderer.domElement.toDataURL('image/png');
