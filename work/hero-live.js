// The cover is independent of the production scenario and uses a clone of the supplied CAD hierarchy.
(() => {
  const intro = document.getElementById("intro");
  if (!hero || !intro) return;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let visible = true, renderer, drawFrame, resize, frameId = 0, previous = 0, clock = 0;
  const cursor = { x: 0, y: 0 };
  const offset = { x: 0, y: 0 };

  function initialize() {
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch { return false; }
    renderer.setPixelRatio(Math.min(1.7, devicePixelRatio || 1));
    renderer.setClearColor(0, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block;pointer-events:none";
    renderer.domElement.setAttribute("aria-hidden", "true");
    hero.prepend(renderer.domElement);
    const studio = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-3, 3, 1.8, -1.8, .05, 35);
    const machinery = new THREE.Group();
    studio.add(machinery);
    const arm = root.clone(true);
    machinery.add(arm);
    const joints = J.map((_, i) => arm.getObjectByName("J" + (i + 1)));
    const silver = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .28, metalness: .73, envMapIntensity:.68 });
    arm.traverse(o => { if (o.isMesh && o.geometry.getAttribute("color")) o.material = silver; });

    // Broad studio reflectors give the cylindrical links a brush-finished metal highlight.
    const room = new THREE.Scene();
    room.background = new THREE.Color(0x53616b);
    for (const [x, y, z, width, height, intensity] of [
      [-3, 2, 2, 2.6, 4.3, 3.8], [2, 1, -2, 1.1, 4.4, 3.4],
      [2, 3, 3, 5, .65, 3], [-1, -1, 3, 3, 1, .6]
    ]) {
      const softbox = mesh(new THREE.PlaneGeometry(width, height),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(intensity, intensity, intensity), side: THREE.DoubleSide }),
        room, x, y, z);
      softbox.lookAt(0, 0, 0);
    }
    const pmrem = new THREE.PMREMGenerator(renderer);
    studio.environment = pmrem.fromScene(room, .04).texture;
    pmrem.dispose();
    room.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
    studio.add(new THREE.HemisphereLight(0xfffcf6, 0x65819a, .51));
    const light = new THREE.DirectionalLight(0xfff9eb, .44);
    light.position.set(-2, 3, 3); studio.add(light);

    const deck = material(0x5d707b, .65, .34), rail = material(0xa6bac2, .65, .24);
    for (const [r, h, y] of [[.28, .075, PED-.08], [.235, .05, PED-.023]])
      mesh(new THREE.CylinderGeometry(r, r*1.03, h, 48), rail, machinery, 0, y, 0);
    const pick = new THREE.Vector3(.94, .85, .12);
    const place = new THREE.Vector3(-.84, .57, -.31);
    box(machinery, .84, .065, .38, deck, pick.x+.18, pick.y-.27-.032, pick.z);
    for (let i=0; i<10; i++) {
      const roller = mesh(new THREE.CylinderGeometry(.026,.026,.356,14), rail, machinery,
        pick.x-.19+i*.079, pick.y-.27-.019, pick.z);
      roller.rotation.x=Math.PI/2;
    }
    for(const z of [-.20,.20])
      box(machinery,.84,.065,.022,rail,pick.x+.18,pick.y-.27-.023,pick.z+z);
    for (const x of [pick.x-.12, pick.x+.44]) {
      box(machinery,.045,.18,.27,rail,x,pick.y-.27-.155,pick.z);
    }
    const receiving = material(0xb39472, .08, .68);
    for (const z of [-.14, 0, .14]) box(machinery,.47,.045,.118,receiving,place.x,place.y-.27-.022,place.z+z);
    const payload = bucketTemplates[1].clone(); machinery.add(payload);
    const props = [[-1.95,1.95,-.65,-.25,1.32],[1.87,2.36,-.57,.32,1.55],[-1.60,.62,.56,.27,1.12]].map(
      ([x,y,z,tilt,scale], i) => {
        const bucket=bucketTemplates[i%2].clone(); bucket.scale.setScalar(scale);studio.add(bucket);
        return {bucket,x,y,z,tilt};
      });

    // One continuous curved ribbon sits behind the moving CAD assembly.
    const ring = new THREE.Group(); studio.add(ring);
    const letteringCanvas=document.createElement("canvas");
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

    for(const group of [payload,...props.map(p=>p.bucket)]){for(const child of group.children){if(!child.material)continue;child.material=child.material.clone();child.material.envMapIntensity=.2;if(child.geometry.type==="CylinderGeometry"){child.material.color.convertSRGBToLinear();child.material.roughness=.74;}}}
    const pickup = angles(pick.x,pick.y,pick.z), raised = angles(pick.x,pick.y+.30,pick.z);
    const drop = angles(place.x,place.y,place.z), above = angles(place.x,place.y+.33,place.z);
    const folded = [-.10,-.44,-1.45,-1.02,1.35,0];
    const choreography=[[0,folded],[1.4,folded],[3,raised],[3.85,pickup],[4.12,pickup],[5.1,raised],
      [7.6,above],[8.65,drop],[8.95,drop],[10.05,above],[12.35,folded],[13.2,folded]];
    let mobile=false;
    resize=()=>{
      const width=Math.max(1,hero.clientWidth),height=Math.max(1,hero.clientHeight),aspect=width/height;
      mobile=width<670;
      const spanX=Math.max(5.58,aspect*2.7),spanY=spanX/aspect;
      camera.left=-spanX/2;camera.right=spanX/2;camera.top=spanY/2;camera.bottom=-spanY/2;
      camera.updateProjectionMatrix();renderer.setSize(width,height,false);
      const scale=mobile?2.36:1.20;
      machinery.scale.setScalar(scale);machinery.position.set(.10,1.28*(1-scale),0);
      ring.position.y=mobile?1.51:1.22;
    };
    resize();new ResizeObserver(resize).observe(hero);
    drawFrame=(time,dt)=>{
      const t=time%13.2;
      const next=Math.max(1,choreography.findIndex(frame=>frame[0]>=t));
      const [ta,qa]=choreography[next-1],[tb,qb]=choreography[next];
      const q=blend(qa,qb,(t-ta)/(tb-ta));
      offset.x+=(cursor.x-offset.x)*(1-Math.exp(-4*dt));
      offset.y+=(cursor.y-offset.y)*(1-Math.exp(-4*dt));
      q[5]+=offset.x*.048;setPose(joints,q);
      const wristTip=fk(q,[0,1.986,-.201-D]);
      if(t<4.12) payload.position.set(pick.x,pick.y-.135,pick.z);
      else if(t<8.95) payload.position.set(wristTip[0],wristTip[1]+PED-.135,wristTip[2]);
      else payload.position.set(place.x,place.y-.135,place.z);
      // Departing and arriving buckets move off/on the short conveyor without a visible jump.
      if(t>10.9)payload.scale.setScalar(1-smooth(Math.min(1,(t-10.9)/1.15)));
      else if(t<.9){payload.scale.setScalar(smooth(t/.9));payload.position.x+=.28*(1-smooth(t/.9));}
      else payload.scale.setScalar(1);
      props.forEach(({bucket,x,y,z,tilt},i)=>{
        const multiplier=mobile?2.60:1;
        bucket.position.set(x+Math.sin(time*.34+i)*.055,1.35+(y-1.35)*multiplier+.07*Math.sin(time*.63+i*2),z);
        bucket.rotation.set(.16*Math.sin(time*.38+i),time*.105+i*1.8,tilt+.06*Math.sin(time*.47+i));
      });
      ring.rotation.y=.045*Math.sin(time*.12);
      ring.rotation.z=.028*Math.sin(time*.17);
      camera.position.set(.10+offset.x*.13,2.48+offset.y*.085,8.0);
      camera.lookAt(.02,1.26,0);
      renderer.render(studio,camera);
    };
    renderer.domElement.addEventListener("webglcontextlost",e=>{
      e.preventDefault();intro.classList.remove("live");cancelAnimationFrame(frameId);frameId=0;
    });
    renderer.domElement.addEventListener("webglcontextrestored",()=>start());
    return true;
  }
  function tick(now){
    frameId=0;
    if(!visible||document.hidden||motion.matches)return;
    const dt=previous?Math.min(.10,(now-previous)/1000):0;
    previous=now;clock+=dt;
    if(!document.body.classList.contains("dialogOpen")){drawFrame(clock,dt);intro.classList.add("live");}
    frameId=requestAnimationFrame(tick);
  }
  let failed=false;
  function start(){
    cancelAnimationFrame(frameId);frameId=0;previous=0;
    if(motion.matches){intro.classList.remove("live");return;}
    if(!visible||document.hidden||failed)return;
    if(!renderer){
      try {if(!initialize()){failed=true;return;}}
      catch {failed=true;intro.classList.remove("live");return;}
    }
    frameId=requestAnimationFrame(tick);
  }
  intro.addEventListener("pointermove",e=>{
    if(e.pointerType==="touch")return;
    const r=intro.getBoundingClientRect();
    cursor.x=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));
    cursor.y=Math.max(-1,Math.min(1,1-(e.clientY-r.top)/r.height*2));
  },{passive:true});
  intro.addEventListener("pointerleave",()=>{cursor.x=cursor.y=0;});
  if("IntersectionObserver" in window){
    new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;start();}).observe(hero);
  }
  motion.addEventListener("change",start);document.addEventListener("visibilitychange",start);
  start();
})();



