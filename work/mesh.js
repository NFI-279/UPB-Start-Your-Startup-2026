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
const gm=M(0x30343a,.5,.3);const plate=B(.16,.03,.16,gm);plate.position.set(0,0,-.37);const f1=B(.03,.03,.09,gm),f2=f1.clone();f1.position.set(.09,0,-.43);f2.position.set(-.09,0,-.43);
