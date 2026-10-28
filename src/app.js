import technologyMarkup from './data/technologies.html?raw';
// Comparison prototype: does navigating into a globe make the portfolio feel connected?
(() => {
  const canvas = document.querySelector('#universe'), display = canvas.getContext('2d');
  const skyCanvas=document.querySelector('#celestial-sky'),skyContext=skyCanvas.getContext('2d');
  const sceneCanvas=document.createElement('canvas'),ctx=sceneCanvas.getContext('2d'),space=window.GlobeSpace,effects=window.GlobeEffects;
  const root = document.documentElement, start = document.querySelector('#start');
  const orbitUI = document.querySelector('#orbit-ui'), branchSVG = document.querySelector('#branches');
  const navigation = document.querySelector('#globe-navigation'), sectionView = document.querySelector('#section-view');
  const controls = document.querySelector('#scene-controls'), status = document.querySelector('#scene-status');
  let motion = true, state = 'opening', width = innerWidth, height = innerHeight;
  let angle = .4, pitch=0, currentSection = '', lastTime = 0,rotationDrag=null,resumeRotationAt=0,orientationFlight=null,pendingSection=null,carousels=null;
  const orient=point=>{
    const p=space.rotate(point,angle),c=Math.cos(pitch),s=Math.sin(pitch);
    return {x:p.x,y:p.y*c-p.z*s,z:p.y*s+p.z*c};
  };
  let dragging = null, pointer = {x: -1000, y: -1000}, absorbed = 0, flight=null, returnFlight=null;
  const camera={position:{x:0,y:-.16,z:4.15},target:{x:0,y:-.16,z:0}};
  const openingCamera={position:{...camera.position},target:{...camera.target}};
  const orbitCamera={position:{x:0,y:0,z:3.25},target:{x:0,y:0,z:0}};
  let entranceRuns=true,keyboardNavigation=false,paper=false;
  document.addEventListener('pointerdown',()=>{keyboardNavigation=false},true);
  document.addEventListener('keydown',()=>{keyboardNavigation=true},true);
  const sectionNames = ['Projects', 'About', 'Tech stack', 'Process', 'Contact'];
  const sectionIds = ['projects', 'about', 'stack', 'process', 'contact'];
  const projects = window.PortfolioProjectGroups.flatMap(group => group.projects);
  const project=point=>space.project(point,camera,width,height);
  const sectionAnchors=[[-.7,.3,.74],[.65,.35,.76],[-.72,-.15,.72],[.7,-.3,.73],[.05,-.72,.7]].map(([x,y,z])=>space.normalize({x,y,z}));
  const points = Array.from({length: 1050}, (_, i) => {
    const y = 1 - 2 * (i + .5) / 1050, r = Math.sqrt(1 - y * y), t = i * Math.PI * (3 - Math.sqrt(5));
    return {x: Math.cos(t) * r, y, z: Math.sin(t) * r};
  });
  sectionAnchors.forEach(anchor=>{
    const radius=.17+Math.random()*.08;
    points.forEach(point=>{
      const distance=space.length(space.subtract(point,anchor));
      if(distance<radius*(.85+Math.random()*.3))point.light=Math.max(point.light||0,(.45+.55*(1-distance/radius))*(.8+Math.random()*.2));
      if(distance<.085)point.pinCore=true;
    });
    const nearest=points.reduce((best,point)=>space.length(space.subtract(point,anchor))<space.length(space.subtract(best,anchor))?point:best);nearest.light=1;nearest.pinCore=true;
  });
  root.dataset.mapLights=points.filter(point=>point.light).length;
  root.dataset.pinCores=points.filter(point=>point.pinCore).length;
  const edges = [];
  points.forEach((p, i) => {
    const near = [];
    for (let j = i + 1; j < points.length; j++) {
      const q = points[j], d = (p.x-q.x)**2 + (p.y-q.y)**2 + (p.z-q.z)**2;
      if (d < .022) near.push({j, d});
    }
    near.sort((a,b) => a.d-b.d);
    near.slice(0, 3).forEach(({j}) => edges.push([i,j]));
  });
  const maskDefinitions=document.createElementNS('http://www.w3.org/2000/svg','defs');
  maskDefinitions.innerHTML='<mask id="rear-branch-mask" maskUnits="userSpaceOnUse"><rect id="branch-mask-area" fill="white"/><circle id="branch-mask-globe" style="fill:black!important;stroke:none!important"/></mask>';branchSVG.append(maskDefinitions);
  const branches = sectionNames.map((name, i) => {
    const button = document.createElement('button');
    button.className = 'branch-label';button.setAttribute('aria-label',name);button.innerHTML = `<span class="branch-name">${name}</span><span>0${i+1}</span>`;
    button.onclick = () => chooseSection(sectionIds[i]); navigation.append(button);
    const group = document.createElementNS('http://www.w3.org/2000/svg','g');
    group.innerHTML = '<path/><circle r="2.8"/><circle r="3.4"/><circle r="2.8"/>';
    branchSVG.append(group);
    return {button, group,local:sectionAnchors[i],endpoint:null,middle:null};
  });
  function updateBranches() {
    const now=performance.now(),elapsed=Math.min(.05,(now-(updateBranches.lastTime||now-16))/1000);updateBranches.lastTime=now;
    const labels=[];
    const center=project({x:0,y:0,z:0}),globeRadius=Math.min(width,height)*1.1/Math.sqrt(Math.max(.05,space.dot(camera.position,camera.position)-1));
    const maskArea=document.querySelector('#branch-mask-area'),maskGlobe=document.querySelector('#branch-mask-globe');
    maskArea.setAttribute('width',width);maskArea.setAttribute('height',height);
    maskGlobe.setAttribute('cx',center.x);maskGlobe.setAttribute('cy',center.y);maskGlobe.setAttribute('r',globeRadius+1);
    branches.forEach((branch, i) => {
      const {button,group}=branch;
      branch.endpoint=orient(branch.local);
      const origin=project(branch.endpoint),line=Math.min(100,width*.15);
      const aim=Math.max(-1,Math.min(1,(origin.x-width/2)/(Math.min(width,height)*.25))),now=performance.now();
      const elapsed=Math.min(.05,(now-(branch.lastBillboardTime||now-16))/1000);branch.lastBillboardTime=now;
      branch.side=branch.side===undefined?aim:branch.side+(aim-branch.side)*(1-Math.exp(-elapsed*14));
      const straight=1-Math.abs(branch.side);
      let middle={x:origin.x+branch.side*line*.42,y:origin.y-line*(.36+straight*.25)};
      let tip={x:middle.x+branch.side*line*.72,y:middle.y-straight*line*.4};
      button.dataset.pinSide=branch.side.toFixed(3);
      const facing=space.dot(space.normalize(space.subtract(camera.position,branch.endpoint)),branch.endpoint);
      const front=facing>.025,wasFront=branch.front;
      if(!front&&branch.lastVisible){middle={...branch.lastVisible.middle};tip={...branch.lastVisible.tip}}
      else if(!front){
        const side=branch.local.x<0?-1:1,y=center.y-branch.local.y*globeRadius;
        middle={x:center.x+side*(globeRadius+line*.15),y};tip={x:middle.x+side*line*.72,y};
      }
      if(front&&branch.annotation){
        const amount=1-Math.exp(-elapsed*18);
        middle={x:branch.annotation.middle.x+(middle.x-branch.annotation.middle.x)*amount,y:branch.annotation.middle.y+(middle.y-branch.annotation.middle.y)*amount};
        tip={x:branch.annotation.tip.x+(tip.x-branch.annotation.tip.x)*amount,y:branch.annotation.tip.y+(tip.y-branch.annotation.tip.y)*amount};
      }
      const labelX=(middle.x+tip.x)/2,labelY=(middle.y+tip.y)/2-10;
      const shiftX=Math.max(button.offsetWidth/2+12,Math.min(width-58-button.offsetWidth/2,labelX))-labelX;
      const shiftY=Math.max(90,Math.min(height-90,labelY))-labelY;
      middle.x+=shiftX;tip.x+=shiftX;middle.y+=shiftY;tip.y+=shiftY;
      branch.annotation={middle:{...middle},tip:{...tip}};
      if(front)branch.lastVisible={middle:{...middle},tip:{...tip}};
      group.style.opacity='1';button.style.opacity='1';button.inert=false;button.tabIndex=0;button.style.pointerEvents='auto';
      branch.visible=true;branch.front=front;button.dataset.front=String(front);button.dataset.retained=String(!front);
      if(front)group.removeAttribute('mask');else group.setAttribute('mask','url(#rear-branch-mask)');
      if(front&&!wasFront&&state==='orbit')effects.scramble(button.querySelector('.branch-name'));
      const labelBounds=button.getBoundingClientRect(),labelHeight=labelBounds.height;
      labels.push({branch,origin,middle,tip,x:(middle.x+tip.x)/2,y:(middle.y+tip.y)/2-10-labelHeight/2,width:labelBounds.width,height:labelHeight,order:i,motion:branch.labelMotion});
    });
    window.GlobeLabelLayout.step(labels,elapsed,{top:78,bottom:height-78},motion);
    labels.forEach(label=>{
      const {branch,origin}=label,{button,group}=branch,shift=label.motion.y-label.y;
      branch.labelMotion=label.motion;
      const middle={x:label.middle.x,y:label.middle.y+shift},tip={x:label.tip.x,y:label.tip.y+shift};
      branch.middle=space.unproject(middle.x,middle.y,origin.depth,camera,width,height);
      group.querySelector('path').setAttribute('d',`M${origin.x},${origin.y} L${middle.x},${middle.y} L${tip.x},${tip.y}`);
      [origin,middle,tip].forEach((p,j)=>{const node=group.querySelectorAll('circle')[j];node.setAttribute('cx',p.x);node.setAttribute('cy',p.y)});
      button.style.left=label.x+'px';button.style.top=(label.motion.y+label.height/2)+'px';
      button.dataset.labelGap=String(window.GlobeLabelLayout.gap);
    });
  }
  const rail=document.querySelector('#globe-section-rail');
  const railButtons=[...rail.querySelectorAll('button')];
  function setState(next) {
    state=next;root.dataset.view=next;root.dataset.scene=next;
    rail.hidden=['opening','leaving'].includes(next);
    railButtons.forEach(button=>{
      const active=next==='section'?button.dataset.section===currentSection:button.dataset.section==='home';
      if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
    });
  }
  function chooseSection(id){
    if(flight||orientationFlight)return;
    if(id==='home'){if(state==='section')back();else if(state==='opening')begin();return}
    if(state==='section'){
      if(id===currentSection){animateSection(id,true);carousels?.replay();return}
      pendingSection=id;back();return;
    }
    if(state!=='orbit')return;
    const anchor=branches[sectionIds.indexOf(id)],endpoint=orient(anchor.local);
    const facing=space.dot(space.normalize(space.subtract(camera.position,endpoint)),endpoint);
    if(facing>.2){enterSection(id);return}
    let yaw=-Math.atan2(anchor.local.x,anchor.local.z);
    yaw+=Math.round((angle-yaw)/(Math.PI*2))*Math.PI*2;
    orientationFlight={fromYaw:angle,toYaw:yaw,fromPitch:pitch,toPitch:Math.atan2(anchor.local.y,Math.hypot(anchor.local.x,anchor.local.z)),start:performance.now(),id};
  }
  railButtons.forEach(button=>button.onclick=()=>chooseSection(button.dataset.section));
  function travel(destination,callback,controls=null){
    const from={...camera.position},targetFrom={...camera.target};
    flight={from,to:{...destination.position},targetFrom,targetTo:{...destination.target},
      controlA:controls?.[0]||space.mix(from,destination.position,.32),controlB:controls?.[1]||space.mix(from,destination.position,.72),
      start:performance.now(),duration:motion?1450:0,callback};
    root.dataset.travel='true';dragging=null;
  }
  function begin() {
    if(state!=='opening')return;
    start.hidden=true;setState('entering');
    controls.hidden=false;document.querySelector('#back').textContent='← Back';
    travel(orbitCamera,()=>{
      orbitUI.hidden=false;setState('orbit');updateBranches();
      entrance(document.querySelector('.orbit-heading'),'left');branches.forEach(branch=>effects.scramble(branch.button.querySelector('.branch-name')));
      status.textContent='Choose a neural connection to explore the portfolio.';
      if(keyboardNavigation)(branches.find(branch=>branch.visible)?.button||railButtons[0]).focus({preventScroll:true});
    });
  }
  function back() {
    orientationFlight=null;
    if(state==='section'||state==='zooming') {
      sectionView.hidden=true;orbitUI.hidden=true;setState('returning');
      document.querySelector('#scene-label').textContent='connected portfolio';document.querySelector('#back').textContent='← Back';
      travel(orbitCamera,()=>{
        orbitUI.hidden=false;setState('orbit');updateBranches();
        branches.forEach(branch=>effects.scramble(branch.button.querySelector('.branch-name')));
        const branch=branches[Math.max(0,sectionIds.indexOf(currentSection))];
        if(keyboardNavigation)(branch.visible?branch.button:railButtons[sectionIds.indexOf(currentSection)+1]).focus({preventScroll:true});
        status.textContent='Returned to the globe navigation.';
        if(pendingSection){const id=pendingSection;pendingSection=null;chooseSection(id)}
      },returnFlight?[returnFlight.controlB,returnFlight.controlA]:null);
    } else {
      orbitUI.hidden=true;setState('leaving');
      travel(openingCamera,()=>{start.hidden=false;setState('opening');effects.scramble(start.querySelector('span'));if(keyboardNavigation)start.focus({preventScroll:true})});
    }
  }
  function enterSection(id) {
    if(state!=='orbit')return;
    updateBranches();
    const branch=branches[sectionIds.indexOf(id)],endpoint={...branch.endpoint};
    currentSection=id;setState('zooming');orbitUI.hidden=true;
    const destination={position:space.multiply(endpoint,1.52),target:endpoint};
    const controlA=space.mix(camera.position,branch.middle,.42),controlB=space.add(space.multiply(endpoint,1.9),space.multiply(space.subtract(branch.middle,endpoint),.12));
    root.dataset.destination=JSON.stringify(endpoint);root.dataset.destinationSection=id;
    returnFlight={controlA,controlB};
    document.querySelector('#scene-label').textContent='connected portfolio';
    document.querySelector('#back').textContent='← Back';
    buildSection(id);sectionView.scrollTop=0;
    entranceRuns=true;
    travel(destination,()=>{
      sectionView.hidden=false;setState('section');sectionView.focus({preventScroll:true});
      carousels?.layout();animateSection(id,entranceRuns);
      status.textContent=`${sectionNames[sectionIds.indexOf(id)]} opened. Use Back to globe to explore another section.`;
    },[controlA,controlB]);
  }
  function buildSection(id) {
    carousels?.dispose();carousels=null;
    const content=document.querySelector('#view-content');content.replaceChildren();
    const titles={projects:['01 / selected work','Ideas made real.','Nine projects. Shared efforts and independent explorations. Pick a screen to look closer.'],about:['02 / about','Design meets development.','The person behind the connections.'],stack:['03 / technologies','Tools, connected.','A collection of the technologies behind the work.'],process:['04 / process','From question to craft.','How a useful idea becomes something people can use.'],contact:['05 / contact','Start a connection.','Good work begins with a conversation.']};
    const [eyebrow,title,intro]=titles[id];document.querySelector('#view-eyebrow').textContent=eyebrow;document.querySelector('#view-title').textContent=title;document.querySelector('#view-intro').textContent=intro;
    if(id==='projects'){
      carousels=window.GlobeProjectCarousels.mount(content,window.PortfolioProjectGroups,{openProject,motion:()=>motion,enableMotion:()=>{motion=true;reflectMotion()},dialogOpen:()=>detail.open,visible:()=>state==='section'&&currentSection==='projects'});
    }else if(id==='about'){
      content.innerHTML='<div class="reading-surface"><div><h2>A designer who builds.<br>A developer who cares.</h2><p class="meta" style="margin-top:28px">web · mobile · creative development</p></div><div><p>I work between the first sketch and the final interaction.</p><p>I bring design and development together to build useful web and mobile experiences, practical tools, and playful experiments.</p><p>My projects span community websites, mobile workspaces, security tools, games, and infrastructure.</p><a href="https://github.com/kailouss" target="_blank" rel="noopener noreferrer">Explore my GitHub ↗</a></div></div>';
    }else if(id==='stack'){
      const grid=document.createElement('ul');grid.className='globe-stack';content.append(grid);
      Promise.resolve(technologyMarkup.replaceAll('__BASE__', import.meta.env.BASE_URL)).then(html=>{
        const source=new DOMParser().parseFromString(html,'text/html');
        source.querySelectorAll('li').forEach(item=>{item.style.setProperty('--offset',((Math.random()-.5)*38).toFixed(1)+'px');grid.append(item)});
        if(currentSection==='stack'&&state==='section')animateLogos(entranceRuns);
      });
    }else if(id==='process'){
      content.innerHTML='<div class="process-steps"><article class="process-step"><span class="meta">01 / understand</span><h2>Find the real problem.</h2><p>Listen first, challenge assumptions, and agree on what a useful outcome looks like.</p></article><article class="process-step"><span class="meta">02 / explore</span><h2>Make it tangible.</h2><p>Sketch, prototype, and build so an idea can be tested with something people can use.</p></article><article class="process-step"><span class="meta">03 / refine</span><h2>Care about the finish.</h2><p>Refine the details, check accessibility, and keep the whole experience consistent.</p></article></div>';
    }else{
      content.innerHTML='<div class="contact-surface"><h2>A good idea deserves<br>a connection.</h2><p>Explore my repositories and find me on GitHub.<br>I’m open to conversations about building useful things.</p><a href="https://github.com/kailouss" target="_blank" rel="noopener noreferrer">Find me on GitHub ↗</a></div>';
    }
  }
  function entrance(element,direction,delay=0,enabled=true){
    if(!element||!enabled||!motion)return;
    element.classList.remove('scene-entrance');void element.offsetWidth;element.classList.add('scene-entrance');element.dataset.entrance=direction;
    element.style.setProperty('--entry-delay',delay+'s');
    element.addEventListener('animationend',()=>element.classList.remove('scene-entrance'),{once:true});
  }
  function animateLogos(enabled){
    const columns=width<700?4:7;
    document.querySelectorAll('.globe-stack li').forEach((logo,i)=>{
      for(const child of logo.children)entrance(child,'scale',Math.floor(i/columns)*.15,enabled);
    });
  }
  function animateSection(id,enabled){
    effects.scramble(document.querySelector('#view-title'));
    entrance(document.querySelector('.view-heading'),id==='contact'?'up':'left',0,enabled);
    if(id==='about'){
      entrance(document.querySelector('.reading-surface>div:first-child'),'left',0,enabled);
      entrance(document.querySelector('.reading-surface>div:last-child'),'right',0,enabled);
    }else if(id==='stack')animateLogos(enabled);
    else if(id==='process')document.querySelectorAll('.process-step').forEach((step,i)=>entrance(step,'up',i*.2,enabled));
    else entrance(document.querySelector('.contact-surface'),'up',.1,enabled);
  }
  const detail=document.querySelector('#project-detail');
  function openProject(project){
    document.querySelector('#detail-role').textContent=project.role;
    document.querySelector('#detail-title').textContent=project.title;
    document.querySelector('#detail-description').textContent=project.description;
    document.querySelector('#detail-stack').replaceChildren(...project.stack.map(name=>{const badge=document.createElement('span');badge.textContent=name;return badge}));
    document.querySelector('#detail-repo').href=project.url;detail.showModal();
  }
  document.querySelector('#close-detail').onclick=()=>detail.close();
  detail.addEventListener('click',event=>{if(event.target===detail){const r=detail.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)detail.close()}});
  document.querySelector('#back').onclick=back;
  start.onclick=begin;
  document.addEventListener('keydown',event=>{
    if(state==='opening'&&(event.key==='Enter'||event.key===' ')){event.preventDefault();begin()}
    else if(event.key==='Escape'&&!detail.open&&state!=='opening'){event.preventDefault();back()}
  });
  function reflectMotion(){const button=document.querySelector('#motion');button.innerHTML=effects.playIcon(motion);button.setAttribute('aria-label',motion?'Pause motion':'Play motion');button.title=motion?'Pause motion':'Play motion';button.setAttribute('aria-pressed',String(motion));root.dataset.motion=motion?'on':'off';carousels?.refresh()}
  document.querySelector('#motion').onclick=()=>{motion=!motion;reflectMotion()};reflectMotion();
  function reflectTheme(){
    root.dataset.theme=paper?'paper':'night';const button=document.querySelector('#theme');button.innerHTML=effects.themeIcon(paper);button.setAttribute('aria-label',paper?'Switch to dark mode':'Switch to light mode');button.title=paper?'Switch to dark mode':'Switch to light mode';
  }
  try{paper=localStorage.getItem('globe-theme')==='paper'}catch{}
  reflectTheme();document.querySelector('#theme').onclick=()=>{effects.transitionTheme(!paper,motion);paper=!paper;reflectTheme();try{localStorage.setItem('globe-theme',paper?'paper':'night')}catch{}};
  effects.scramble(start.querySelector('span'));
  entrance(canvas,'right');
  entrance(controls,'down');
  const chains=[];
  function spawn(chain){
    const direction=space.normalize({x:Math.random()*2-1,y:Math.random()*2-1,z:Math.random()*2-1});
    const center=space.multiply(direction,1.7+Math.random()*2.3);
    chain.nodes=Array.from({length:3+Math.floor(Math.random()*3)},(_,i)=>space.add(center,{x:i*.045,y:Math.sin(i*1.5)*.035,z:Math.cos(i)*.025}));
    chain.velocity={x:0,y:0,z:0};chain.phase=Math.random()*Math.PI*2;chain.age=0;
  }
  for(let i=0;i<32;i++){const chain={};spawn(chain);chains.push(chain)}
  function drawChains(dt,time){
    root.dataset.worldChains='true';
    let visibleCount=0;
    for(const chain of chains){
      if(motion&&dragging?.chain!==chain){
        chain.age+=dt;
        const center=chain.nodes[1],distance=space.length(center),direction=space.normalize(center);
        const movement=space.multiply(direction,-dt*(.045+distance*.018));
        const twist={x:Math.sin(time*.0003+chain.phase)*dt*.012,y:Math.cos(time*.0003+chain.phase)*dt*.012,z:0};
        const contraction=Math.max(.1,Math.min(1,(distance-1)*.8));
        const anchor={...center};
        chain.nodes=chain.nodes.map(node=>space.add(space.add(space.add(anchor,space.multiply(space.subtract(node,anchor),1-dt*(1-contraction)*.4)),movement),space.add(twist,space.multiply(chain.velocity,dt))));
        chain.velocity=space.multiply(chain.velocity,Math.exp(-dt*2));
        if(distance<1.02&&chain.age>1){spawn(chain);absorbed++;root.dataset.absorbed=absorbed}
      }
      if(dragging?.chain===chain){
        const destination=space.unproject(pointer.x,pointer.y,dragging.depth,camera,width,height),node=chain.nodes[dragging.index];
        chain.nodes[dragging.index]=space.mix(node,destination,Math.min(1,dt*24));
        for(let pass=0;pass<6;pass++)for(let i=1;i<chain.nodes.length;i++){
          const a=chain.nodes[i-1],b=chain.nodes[i],delta=space.subtract(b,a),length=space.length(delta)||1;
          const shift=space.multiply(delta,(length-.052)/length*.5);
          if(i-1!==dragging.index)chain.nodes[i-1]=space.add(a,shift);
          if(i!==dragging.index)chain.nodes[i]=space.subtract(b,shift);
        }
      }
      const projected=chain.nodes.map(node=>({...project(node),occluded:space.occluded(node,camera)}));
      const alpha=Math.min(.6,.9/Math.max(.6,projected[1].depth));
      const chainInk=paper?'35,35,30':'230,228,220';ctx.strokeStyle=`rgba(${chainInk},${alpha})`;ctx.lineWidth=.65;
      for(let i=1;i<projected.length;i++){
        const a=projected[i-1],b=projected[i];
        if(!a.visible||!b.visible||a.occluded||b.occluded)continue;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
      projected.forEach(p=>{
        if(!p.visible||p.occluded||p.x<0||p.y<0||p.x>width||p.y>height)return;
        visibleCount++;ctx.fillStyle=`rgba(${chainInk},${alpha+.15})`;ctx.beginPath();ctx.arc(p.x,p.y,Math.min(9,Math.max(.45,p.scale*.007)),0,Math.PI*2);ctx.fill();
      });
    }
    root.dataset.visibleChainNodes=visibleCount;
  }
  canvas.addEventListener('pointerdown',event=>{
    if(flight)return;
    if(['opening','orbit'].includes(state)){
      const rayPoint=space.unproject(event.clientX,event.clientY,1,camera,width,height),ray=space.normalize(space.subtract(rayPoint,camera.position));
      const b=space.dot(camera.position,ray),c=space.dot(camera.position,camera.position)-1,hit=b*b-c>=0;
      if(hit||state==='opening'){
        rotationDrag={lastX:event.clientX,lastY:event.clientY,startX:event.clientX,startY:event.clientY,moved:false,hit};orientationFlight=null;
        canvas.setPointerCapture(event.pointerId);canvas.dataset.dragging='true';return;
      }
    }
    let closest=null,distance=16;
    for(const chain of chains)chain.nodes.forEach((node,index)=>{
      const p=project(node);if(!p.visible||space.occluded(node,camera))return;
      const d=Math.hypot(p.x-event.clientX,p.y-event.clientY);if(d<distance){distance=d;closest={chain,index,depth:p.depth}};
    });
    if(!closest)return;dragging=closest;pointer={x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);canvas.style.cursor='grabbing';
  });
  canvas.addEventListener('pointermove',event=>{
    pointer={x:event.clientX,y:event.clientY};
    if(rotationDrag){
      const drag=rotationDrag,dx=event.clientX-drag.lastX,dy=event.clientY-drag.lastY;
      if(Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)>5)drag.moved=true;
      if(drag.hit&&drag.moved){angle+=dx*.006;pitch=Math.max(-1.2,Math.min(1.2,pitch+dy*.005));}
      drag.lastX=event.clientX;drag.lastY=event.clientY;
    }
  });
  function release(event){
    if(rotationDrag){const drag=rotationDrag;rotationDrag=null;resumeRotationAt=performance.now()+900;canvas.dataset.dragging='false';if(!drag.moved&&state==='opening'&&event.type!=='pointercancel')begin()}
    dragging=null;canvas.style.cursor='';
  }
  canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
  function resize(){
    width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);
    for(const surface of [canvas,sceneCanvas,skyCanvas]){surface.width=width*dpr;surface.height=height*dpr}
    ctx.setTransform(dpr,0,0,dpr,0,0);display.setTransform(dpr,0,0,dpr,0,0);skyContext.setTransform(dpr,0,0,dpr,0,0);
    if(state==='orbit')updateBranches();
  }
  window.addEventListener('resize',resize);resize();
  function draw(time){
    const dt=Math.min(.04,(time-lastTime)/1000||.016);lastTime=time;
    let speed=0;
    if(flight){
      const path=flight,progress=motion?Math.min(1,(time-path.start)/path.duration):1;
      const eased=progress<.5?4*progress**3:1-(-2*progress+2)**3/2;
      camera.position=space.bezier(path.from,path.controlA,path.controlB,path.to,eased);
      camera.target=space.mix(path.targetFrom,path.targetTo,eased);
      speed=motion?Math.sin(progress*Math.PI)**2:0;
      if(progress>=1){flight=null;root.dataset.travel='false';path.callback()}
    }else if(orientationFlight){
      const turn=orientationFlight,t=motion?Math.min(1,(time-turn.start)/750):1,eased=t*t*(3-2*t);
      angle=turn.fromYaw+(turn.toYaw-turn.fromYaw)*eased;pitch=turn.fromPitch+(turn.toPitch-turn.fromPitch)*eased;
      if(t>=1){orientationFlight=null;enterSection(turn.id)}
    }else if(motion&&!rotationDrag&&time>resumeRotationAt&&(state==='orbit'||state==='opening'))angle+=dt*.035;
    ctx.clearRect(0,0,width,height);
    effects.step(time);effects.background(ctx,camera,width,height,time,motion,paper);effects.sky(skyContext,camera,width,height,time,motion,paper);
    const ink=paper?'35,35,30':'238,235,226';
    const world=points.map(orient),projected=world.map(project);
    const immersed=['section','zooming','returning'].includes(state);
    for(const [a,b]of edges){
      const p=projected[a],q=projected[b];if(!p.visible||!q.visible)continue;
      const facing=space.dot(space.normalize(space.subtract(camera.position,world[a])),world[a]);
      ctx.strokeStyle=`rgba(${ink},${(facing<0?.025:.12+facing*.16)*(immersed?.32:1)})`;ctx.lineWidth=.55;
      ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
    }
    projected.forEach((p,i)=>{
      if(!p.visible||p.x<0||p.y<0||p.x>width||p.y>height)return;
      const facing=space.dot(space.normalize(space.subtract(camera.position,world[i])),world[i]);
      const light=points[i].light||0,core=points[i].pinCore,radius=Math.min(core?5:light?4:3,(i%7?.003:.005)*p.scale*(1+light*(core?1:.65)));
      ctx.fillStyle=`rgba(${ink},${(facing<0?.04:Math.min(1,.3+facing*.4+light*.3))*(immersed?.32:1)})`;
      ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);ctx.fill();
      if(light&&facing>0){ctx.strokeStyle=`rgba(${ink},${light*.65*(immersed?.32:1)})`;ctx.lineWidth=(core?1.5:.8)+light*.6;ctx.stroke()}
    });
    drawChains(dt,time);
    display.clearRect(0,0,width,height);display.drawImage(sceneCanvas,0,0,width,height);
    if(speed>.01){
      const endpoint=currentSection?project(orient(sectionAnchors[sectionIds.indexOf(currentSection)])):{x:width/2,y:height/2};
      const vanishing={x:Math.max(width*.15,Math.min(width*.85,endpoint.x)),y:Math.max(height*.15,Math.min(height*.85,endpoint.y))};
      display.save();display.filter=`blur(${speed*1.8}px)`;
      for(let i=1;i<=9;i++){
        const expansion=1+i*.025*speed;display.globalAlpha=.075*speed;
        display.drawImage(sceneCanvas,vanishing.x*(1-expansion),vanishing.y*(1-expansion),width*expansion,height*expansion);
      }
      display.filter='none';display.globalAlpha=speed*.2;display.strokeStyle=paper?'#353530':'#e7e4db';display.lineWidth=.6;
      for(let i=0;i<points.length;i+=19){
        const p=projected[i];if(!p.visible)continue;
        display.beginPath();display.moveTo(p.x,p.y);display.lineTo(p.x+(p.x-vanishing.x)*speed*.18,p.y+(p.y-vanishing.y)*speed*.18);display.stroke();
      }
      display.restore();
    }
    if(state==='orbit')updateBranches();
    canvas.dataset.grabbable=String(['opening','orbit'].includes(state)&&!flight);
    carousels?.step(dt,time);
    root.dataset.pitch=pitch.toFixed(3);
    root.dataset.speedBlur=speed.toFixed(2);root.dataset.camera=JSON.stringify(camera.position);root.dataset.rotation=angle.toFixed(3);
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();







