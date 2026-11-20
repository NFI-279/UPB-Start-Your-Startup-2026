from pathlib import Path
w=Path('work')
p=w/'hero-live.js'
s=p.read_text(encoding="utf-8-sig")
s=s.replace('// Two adjoining words occupy opposite quadrants of one elliptical cylinder.\n    // The rear word is depth-tested against the CAD links; the front word crosses in front.','// One continuous curved ribbon sits behind the moving CAD assembly.')
a=s.index('    const labels = [];')
b=s.index('    for(const group of [payload',a)
s=s[:a]+'''    const letteringCanvas=document.createElement("canvas");
    letteringCanvas.width=3072; letteringCanvas.height=448;
    const lettering=letteringCanvas.getContext("2d");
    const titleTexture=new THREE.CanvasTexture(letteringCanvas);
    titleTexture.encoding=THREE.sRGBEncoding;
    titleTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    function paintTitle(){
      const title="TECH-CON INDUSTRY";
      lettering.clearRect(0,0,3072,448);
      lettering.save();
      lettering.font='600 360px StudioDisplay,"Arial Narrow",Arial,sans-serif';
      const metrics=lettering.measureText(title);
      const ascent=metrics.actualBoundingBoxAscent||270;
      const descent=metrics.actualBoundingBoxDescent||4;
      lettering.translate(18,12);
      lettering.scale(3036/metrics.width,424/(ascent+descent));
      const ink=lettering.createLinearGradient(0,0,0,ascent+descent);
      ink.addColorStop(0,"#174f76"); ink.addColorStop(.38,"#115983"); ink.addColorStop(1,"#073a60");
      lettering.fillStyle=ink;
      lettering.fillText(title,0,ascent);
      lettering.restore(); titleTexture.needsUpdate=true;
    }
    paintTitle();
    document.fonts?.ready.then(paintTitle);
    const geometry=new THREE.BufferGeometry(), positions=[], uvs=[], indices=[];
    const segments=112;
    for(let i=0;i<=segments;i++){
      const u=i/segments, angle=(u-.5)*1.92;
      const x=3.12*Math.sin(angle);
      const arch=Math.cos(angle);
      const centerY=1.38*(arch-1)+.19+x*.032;
      const centerZ=-.85-1.30*arch;
      // Preserve the stroke height along the curve's local normal.
      const slope=-1.38/3.12*Math.tan(angle)+.032;
      const normalScale=1/Math.hypot(1,slope);
      for(const v of [0,1]){
        const height=(v-.5)*.81;
        positions.push(x-height*slope*normalScale,centerY+height*normalScale,centerZ);
        uvs.push(u,v);
      }
      if(i<segments){const a=i*2;indices.push(a,a+2,a+1,a+2,a+3,a+1);}
    }
    geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);
    const titleInk=new THREE.MeshBasicMaterial({map:titleTexture,alphaTest:.28,side:THREE.DoubleSide});
    mesh(geometry,titleInk,ring);

'''+s[b:]
s=s.replace('ring.position.y=mobile?1.46:1.48','ring.position.y=mobile?1.75:1.54').replace('ring.rotation.y=.095','ring.rotation.y=.045')
p.write_text(s,encoding="utf-8")
v=(w/'validate.py').read_text(encoding="utf-8-sig")
a=v.index(' js("document.querySelector(\'.contactGlass\').click()")')
v=v[:a]+""" time.sleep(2.4);shot('title-pick')
 time.sleep(3.0);shot('title-return')
 device(390,844);time.sleep(.6);shot('current-mobile');still('static-mobile')
 print('Rendered desktop, mobile, motion samples and static covers.')
"""+v[v.index(" call('Browser.close')"):]
(w/'check-title.py').write_text(v,encoding="utf-8")
