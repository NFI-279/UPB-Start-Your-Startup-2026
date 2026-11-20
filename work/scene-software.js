// The same scene graph can be projected with Canvas 2D on machines without WebGL.
function softwareRenderer(){
 const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d",{alpha:false});
 if(!ctx)throw new Error("Browserul nu poate inițializa desenarea 2D.");
 const cache=new WeakMap(),viewMatrix=new THREE.Matrix4(),localMatrix=new THREE.Matrix4();
 function compact(geom){
  if(cache.has(geom))return cache.get(geom);
  const a=geom.attributes.position,colors=geom.attributes.color,index=geom.index;
  const cad=a.array instanceof Int16Array,step=cad?165:.00001,map=new Map(),vertices=[],lookup=[];
  for(let i=0;i<a.count;i++){
   const x=a.getX(i),y=a.getY(i),z=a.getZ(i),key=[x,y,z].map(v=>Math.round(v/step)).join(",");
   if(!map.has(key)){map.set(key,vertices.length);vertices.push([0,0,0,0]);}
   const id=map.get(key),v=vertices[id];v[0]+=x;v[1]+=y;v[2]+=z;v[3]++;lookup.push(id);
  }
  for(const v of vertices){v[0]/=v[3];v[1]/=v[3];v[2]/=v[3];}
  const faces=[],count=index?index.count:a.count;
  for(let j=0;j<count;j+=3){
   const orig=index?index.getX(j):j,p=lookup[orig],q=lookup[index?index.getX(j+1):j+1],r=lookup[index?index.getX(j+2):j+2];
   if(p===q||q===r||p===r)continue;
   const shade=colors?[colors.array[orig*3],colors.array[orig*3+1],colors.array[orig*3+2]]:null;
   faces.push([p,q,r,shade]);
  }
  const compacted={vertices,faces};cache.set(geom,compacted);return compacted;
 }
 function render(scene,camera){
  const w=canvas.width,h=canvas.height;
  scene.updateMatrixWorld(true);camera.updateMatrixWorld();viewMatrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
  ctx.fillStyle="#182e3f";ctx.fillRect(0,0,w,h);ctx.strokeStyle="#2a4354";ctx.lineWidth=.6;
  function gridLine(x,z,xx,zz){const a=new THREE.Vector3(x,0,z).project(camera),b=new THREE.Vector3(xx,0,zz).project(camera);
    if(a.z<0||a.z>1||b.z<0||b.z>1)return;
    ctx.moveTo((a.x+1)*w/2,(1-a.y)*h/2);ctx.lineTo((b.x+1)*w/2,(1-b.y)*h/2);}
  ctx.beginPath();for(let j=-12;j<=16;j++){gridLine(j*.25,-2.5,j*.25,2.5);gridLine(-3,j*.25,4,j*.25);}ctx.stroke();
  const triangles=[];
  scene.traverse(obj=>{
   if(!obj.isMesh||obj.geometry.type==="PlaneGeometry"||!obj.visible)return;
   const model=compact(obj.geometry);localMatrix.multiplyMatrices(viewMatrix,obj.matrixWorld);const m=localMatrix.elements;
   const points=model.vertices.map(([x,y,z])=>{
    const f=m[3]*x+m[7]*y+m[11]*z+m[15];
    return [((m[0]*x+m[4]*y+m[8]*z+m[12])/f+1)*w/2,(1-(m[1]*x+m[5]*y+m[9]*z+m[13])/f)*h/2,f];
   });
   const color=obj.material.color,fallback=[color.r*255,color.g*255,color.b*255];
   for(const [a,b,c,shade] of model.faces){
    const p=points[a],q=points[b],r=points[c];if(p[2]<.04||q[2]<.04||r[2]<.04)continue;
    const dx=q[0]-p[0],dy=q[1]-p[1],ex=r[0]-p[0],ey=r[1]-p[1],area=dx*ey-dy*ex;
    if(area>=0 && obj.material.side!==THREE.DoubleSide)continue;
    const rgb=shade||fallback,level=.74+.32*Math.min(1,Math.abs(area)/(Math.hypot(dx,dy)*Math.hypot(ex,ey)||1));
    triangles.push([p,q,r,(p[2]+q[2]+r[2])/3,"rgb("+rgb.map(v=>Math.min(255,Math.round(v*level))).join(",")+")"]);
   }
  });
  triangles.sort((a,b)=>b[3]-a[3]);for(const [p,q,r,z,fill] of triangles){
   ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.lineTo(r[0],r[1]);ctx.closePath();ctx.fill();
  }
 }
 return {domElement:canvas,setPixelRatio(){},setSize(w,h){canvas.width=Math.min(w,960);canvas.height=Math.round(h*canvas.width/w);},render};
}
