(() => {
  const reveals=new Map(),characters='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function scramble(element,duration=1050){
    if(!element)return;
    const text=reveals.get(element)?.text||element.textContent;
    element.setAttribute('aria-label',text);
    if(document.documentElement.dataset.motion==='off'){element.textContent=text;return}
    element.dataset.reveal='scrambling';reveals.set(element,{text,start:performance.now(),duration,last:0,thresholds:[...text].map(()=>.15+Math.random()*.8)});
  }
  function step(time){
    for(const [element,reveal]of reveals){
      if(!element.isConnected){reveals.delete(element);continue}
      const progress=Math.min(1,(time-reveal.start)/reveal.duration);
      if(progress===1||document.documentElement.dataset.motion==='off'){
        element.textContent=reveal.text;element.dataset.reveal='complete';reveals.delete(element);continue;
      }
      if(time-reveal.last<45)continue;reveal.last=time;
      element.textContent=[...reveal.text].map((letter,i)=>letter===' '||progress>=reveal.thresholds[i]?letter:(letter===letter.toLowerCase()?characters[Math.floor(Math.random()*characters.length)].toLowerCase():characters[Math.floor(Math.random()*characters.length)])).join('');
    }
  }
  const playIcon=playing=>playing?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 4 12 8-12 8Z"/></svg>';
  const themeIcon=paper=>paper?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14a8 8 0 0 1-10-10 8.5 8.5 0 1 0 10 10Z"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></svg>';
  const planets=[{center:{x:-6.6,y:3,z:-8},radius:.07},{center:{x:7.2,y:-3,z:-9.5},radius:.19},{center:{x:-8.2,y:-4,z:-12},radius:.43},{center:{x:8.5,y:4.2,z:-13.5},radius:.88}];
  let skyTransition=null,skyKind=null;
  function phaseAt(minutes){
    const minute=((minutes%1440)+1440)%1440;
    if(minute>=1080||minute<330)return (minute>=1080?minute-1080:minute+360)/690;
    return (minute-330)/750;
  }
  function localPhase(){const now=new Date();return phaseAt(now.getHours()*60+now.getMinutes()+now.getSeconds()/60)}
  function transitionTheme(paper,motion){
    const incoming=paper?'sun':'moon',outgoing=skyKind||(paper?'moon':'sun');
    skyTransition=motion?{incoming,outgoing,start:performance.now(),from:localPhase()}:null;skyKind=incoming;
  }
  function drawBody(ctx,kind,phase,alpha,width,height,time,motion,paper){
    const radius=Math.max(10,Math.min(20,Math.min(width,height)*.024))*(kind==='sun'?3:1),outer=radius*(kind==='sun'?1.65:1);
    const theta=phase*Math.PI,x=Math.max(outer+8,Math.min(width-outer-8,width*.5+Math.cos(theta)*width*.4));
    const rawY=height*.8-Math.sin(theta)*height*.72,y=phase>=0&&phase<=1?Math.max(outer+8,Math.min(height-outer-8,rawY)):rawY;
    const ink=paper?'35,35,30':'226,223,213';
    ctx.save();ctx.translate(x,y);ctx.globalAlpha=alpha;ctx.strokeStyle=`rgba(${ink},.5)`;ctx.fillStyle=`rgba(${ink},.17)`;ctx.lineWidth=.8;
    ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();ctx.stroke();
    if(kind==='sun'){
      ctx.rotate(motion?time*.000035:0);
      for(let i=0;i<12;i++){const a=i/12*Math.PI*2;ctx.beginPath();ctx.moveTo(Math.cos(a)*radius*1.3,Math.sin(a)*radius*1.3);ctx.lineTo(Math.cos(a)*radius*1.65,Math.sin(a)*radius*1.65);ctx.stroke()}
    }else{
      ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.clip();
      ctx.fillStyle=paper?'#f1eee6':'#111110';ctx.beginPath();ctx.arc(radius*.55,-radius*.25,radius*.88,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
    return {kind,phase,x,y,alpha,radius};
  }
  const rings=[];
  for(const latitude of [-.55,0,.55])rings.push(Array.from({length:49},(_,i)=>{const a=i/48*Math.PI*2,r=Math.sqrt(1-latitude*latitude);return{x:Math.cos(a)*r,y:latitude,z:Math.sin(a)*r}}));
  for(let longitude=0;longitude<4;longitude++)rings.push(Array.from({length:49},(_,i)=>{const a=i/48*Math.PI*2,t=longitude/4*Math.PI;return{x:Math.cos(a)*Math.cos(t),y:Math.sin(a),z:Math.cos(a)*Math.sin(t)}}));
  function background(ctx,camera,width,height,time,motion,paper){
    const space=window.GlobeSpace,ink=paper?'35,35,30':'226,223,213',focal=Math.min(width,height)*1.1;
    const mainRadius=focal/Math.sqrt(Math.max(.05,space.dot(camera.position,camera.position)-1));
    let count=0,maxRatio=0;const sizes=[];
    for(const planet of planets){
      const p=space.project(planet.center,camera,width,height);
      if(!p.visible||space.occluded(planet.center,camera))continue;
      const radius=Math.min(planet.radius,mainRadius*.2/p.scale),ratio=radius*p.scale/mainRadius;
      maxRatio=Math.max(maxRatio,ratio);count++;sizes.push((radius*p.scale*2).toFixed(1));
      ctx.strokeStyle=`rgba(${ink},${paper?.19:.16})`;ctx.lineWidth=.65;
      for(const ring of rings){
        ctx.beginPath();ring.forEach((local,i)=>{
          const rotated=space.rotate(local,motion?time*.000025:.4),world=space.add(planet.center,space.multiply(rotated,radius)),point=space.project(world,camera,width,height);
          if(i)ctx.lineTo(point.x,point.y);else ctx.moveTo(point.x,point.y);
        });ctx.stroke();
      }
    }
    const root=document.documentElement;
    root.dataset.backgroundPlanets=count;root.dataset.planetSizes=sizes.join(',');root.dataset.planetMaxRatio=maxRatio.toFixed(3);
  }
  function sky(ctx,camera,width,height,time,motion,paper){
    ctx.clearRect(0,0,width,height);
    const phase=localPhase(),root=document.documentElement,bodies=[];skyKind=paper?'sun':'moon';
    if(skyTransition&&motion){
      const elapsed=time-skyTransition.start,prepare=Math.min(1,elapsed/500),raw=Math.max(0,Math.min(1,(elapsed-500)/1000)),travel=raw*raw*(3-2*raw);
      bodies.push(drawBody(ctx,skyTransition.outgoing,skyTransition.from+(1.06-skyTransition.from)*travel,1-travel,width,height,time,motion,paper));
      bodies.push(drawBody(ctx,skyTransition.incoming,-.06+(phase+.06)*travel,prepare*(.35+.65*travel),width,height,time,motion,paper));
      root.dataset.skyTransition=elapsed<500?'ease-in':'travel';
      if(elapsed>=1500)skyTransition=null;
    }else{
      skyTransition=null;bodies.push(drawBody(ctx,skyKind,phase,1,width,height,time,motion,paper));root.dataset.skyTransition='idle';
    }
    root.dataset.skyBodies=JSON.stringify(bodies);root.dataset.skyPhase=phase.toFixed(4);root.dataset.localTime=new Date().toLocaleTimeString();
    root.dataset.celestial=skyKind;
    const space=window.GlobeSpace,center=space.project({x:0,y:0,z:0},camera,width,height),radius=Math.min(width,height)*1.1/Math.sqrt(Math.max(.05,space.dot(camera.position,camera.position)-1));
    ctx.save();ctx.globalCompositeOperation='destination-out';ctx.beginPath();ctx.arc(center.x,center.y,radius+2,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  window.GlobeEffects={scramble,step,playIcon,themeIcon,background,sky,transitionTheme,phaseAt};
})();

