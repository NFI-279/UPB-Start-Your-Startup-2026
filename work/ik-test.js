const L1=.862,L2=.7287,S0=[0,.236],D=.254,J=[[0,0,0],[0,.236,0],[0,1.098,0],[0,1.827,0],[0,1.9,-.201],[0,1.986,-.201]];
function ik(X,Y,Z){ // tool contact point (bucket top centre), tool pointing down
 const rad=Math.hypot(X,Z),xp=Math.sqrt(Math.max(rad*rad-.201*.201,0));
 const t1=Math.atan2(-.201,xp)-Math.atan2(Z,X);
 let Wx=xp+.159,Wy=Y+D,dx=Wx-S0[0],dy=Wy-S0[1],d=Math.hypot(dx,dy),clamp=false;
 if(d>L1+L2){const k=(L1+L2)/d;dx*=k;dy*=k;d=L1+L2;clamp=true}
 const a=(L1*L1-L2*L2+d*d)/(2*d),h=Math.sqrt(Math.max(L1*L1-a*a,0)),ux=dx/d,uy=dy/d;
 let c1=[a*ux-h*uy,a*uy+h*ux],c2=[a*ux+h*uy,a*uy-h*ux],e=c1[1]>=c2[1]?c1:c2;
 const t2=Math.atan2(-e[0],e[1]),f2=Math.atan2(-(dx-e[0]),dy-e[1]);
 return {q:[t1,t2,f2-t2,Math.PI/2-f2,Math.PI/2,0],clamp};
}
function fk(q,pt){const ax=['y','z','z','z','y','z'];let p=pt.slice();
 for(let j=5;j>=0;j--){let v=[p[0]-J[j][0],p[1]-J[j][1],p[2]-J[j][2]],c=Math.cos(q[j]),s=Math.sin(q[j]);
  if(ax[j]=='y')v=[v[0]*c+v[2]*s,v[1],-v[0]*s+v[2]*c];else v=[v[0]*c-v[1]*s,v[0]*s+v[1]*c,v[2]];
  p=[v[0]+J[j][0],v[1]+J[j][1],v[2]+J[j][2]]}return p}
for(const [kg,num,nx,nz,h,dx,dz,per] of [[5,100,5,4,.21,.22,.20,20],[13,44,4,3,.27,.3,.26,11]]){
 let peak=0,clipped=0,targets=0;
 function check(x,y,z){let obj=ik(x,y-.45,z);clipped+=obj.clamp;const tip=fk(obj.q,[0,1.986,-.201-D]);peak=Math.max(peak,Math.hypot(x-tip[0],y-.45-tip[1],z-tip[2]));targets++;}
 for(const up of [0,.1])check(1,.62+h+up,0);
 for(const side of [125,235])for(let n=0;n<num;n++)for(const up of [0,.1]){
 const rad=side*Math.PI/180,rot=Math.atan2(-Math.cos(rad),-Math.sin(rad));
 const px=(n%per%nx-(nx-1)/2)*dx,pz=(Math.floor(n%per/nx)-(nz-1)/2)*dz;
 check(.8*Math.cos(rad)+px*Math.cos(rot)+pz*Math.sin(rot),.144+(Math.floor(n/per)+1)*h+up,.8*Math.sin(rad)-px*Math.sin(rot)+pz*Math.cos(rot));}
 console.log({kg,targets,clipped,maxMM:peak*1000});}