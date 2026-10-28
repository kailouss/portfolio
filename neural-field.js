(function(){
const ns='http://www.w3.org/2000/svg',fields=[];let lastTime=0,needsFrame=false;
const motionEnabled=()=>document.documentElement.dataset.motion==='on';
function svgNode(tag,attrs){const e=document.createElementNS(ns,tag);for(const [key,value]of Object.entries(attrs))e.setAttribute(key,value);return e}
function wake(){needsFrame=true;window.dispatchEvent(new Event('neural-wake'))}
const root=document.body;
const host=document.createElement('div');host.className='page-neurals';const svg=svgNode('svg',{'aria-label':'Page-wide neural chains; drag circles together to connect. Shake four times to disconnect.',role:'group'});host.append(svg);root.append(host);
const status=document.createElement('span');status.className='neural-live';status.setAttribute('role','status');host.append(status);
const field={section:root,svg,host,nodes:[],edges:[],chains:[],pins:new Map(),drag:null,target:null,journeys:new Map(),absorptions:0};fields.push(field);
for(const [sectionIndex,section]of [...document.querySelectorAll('main>section')].entries()){
const origin=section.getBoundingClientRect(),page=root.getBoundingClientRect();
for(let chain=0;chain<2;chain++){
const chainId=field.chains.length,group=svgNode('g',{class:'neural-chain','data-chain':chainId,'data-origin':section.id||`section-${sectionIndex}`});svg.append(group);const ids=[],start=field.nodes.length,count=3+(sectionIndex+chain)%3;
for(let i=0;i<count;i++){const x=origin.left-page.left+Math.max(0,section.clientWidth-140)*(chain ? .78 : .12)+22+i*23,y=origin.top-page.top+50+Math.sin(i*1.8+sectionIndex*2+chain)*17;ids.push(field.nodes.length);field.nodes.push({x,y,homeX:x,homeY:y,vx:0,vy:0,chain:chainId})}
field.chains.push({group,ids,vx:chain?-9:11,vy:chain?-2.4:2.8,spin:chain?-.025:.03,momentumX:0,momentumY:0,scale:1,pattern:ids.map(id=>({x:field.nodes[id].x-field.nodes[start].x,y:field.nodes[id].y-field.nodes[start].y}))});
for(let i=0;i<count-1;i++){const a=start+i,b=a+1;field.edges.push({a,b,rest:Math.hypot(field.nodes[a].x-field.nodes[b].x,field.nodes[a].y-field.nodes[b].y),joint:false,group})}
}
}
for(const edge of field.edges)edge.baseRest=edge.rest;
function point(event){return new DOMPoint(event.clientX,event.clientY).matrixTransform(svg.getScreenCTM().inverse())}
function clearTarget(){for(const chain of field.chains)chain.group.classList.remove('is-target');for(const node of field.nodes)node.circle?.classList.remove('is-target');field.target=null}
function begin(event,ids){if(event.button!==0)return;event.preventDefault();if(svg.contains(document.activeElement))document.activeElement.blur?.();for(const id of NeuralConnections.component(field.nodes,field.edges,ids[0]))field.chains[field.nodes[id].chain].momentumX=field.chains[field.nodes[id].chain].momentumY=0;const p=point(event);field.drag={id:event.pointerId,ids,start:p,origins:ids.map(i=>({x:field.nodes[i].x,y:field.nodes[i].y})),shake:{x:event.clientX,y:event.clientY},pointer:event,samples:[{x:event.clientX,y:event.clientY,time:event.timeStamp}],broken:false};event.currentTarget.setPointerCapture(event.pointerId);for(const i of ids)field.pins.set(i,{x:field.nodes[i].x,y:field.nodes[i].y});for(const i of NeuralConnections.component(field.nodes,field.edges,ids[0]))field.chains[field.nodes[i].chain].group.classList.add('is-dragging');wake()}
function keyboard(event,ids){const move={ArrowLeft:[-8,0],ArrowRight:[8,0],ArrowUp:[0,-8],ArrowDown:[0,8]}[event.key];if(!move)return;event.preventDefault();for(const i of NeuralConnections.component(field.nodes,field.edges,ids[0])){field.nodes[i].x+=move[0];field.nodes[i].y+=move[1];field.nodes[i].vx=field.nodes[i].vy=0}wake()}
for(const [index,e]of field.edges.entries()){
const underlay=svgNode('line',{class:'neural-underlay'}),line=svgNode('line',{class:'neural-edge'}),hit=svgNode('line',{class:'neural-hit',tabindex:0,role:'button','aria-label':`Drag neural connection ${index+1}`});e.views={underlay,line,hit};e.group.append(underlay,line,hit);hit.addEventListener('pointerdown',event=>begin(event,[e.a,e.b]));hit.addEventListener('keydown',event=>keyboard(event,[e.a,e.b]));
}
for(const [i,node]of field.nodes.entries()){
const circle=svgNode('circle',{class:'neural-node',r:i===0?6:4.5}),hit=svgNode('circle',{class:'neural-node-hit',r:12,tabindex:0,role:'button','aria-label':`Drag neural circle ${i+1}`});node.circle=circle;node.hit=hit;field.chains[node.chain].group.append(circle,hit);hit.addEventListener('pointerdown',event=>begin(event,[i]));hit.addEventListener('keydown',event=>keyboard(event,[i]));
}
for(const e of field.edges){const handle=svgNode('circle',{class:'neural-line-handle',r:7,'aria-hidden':'true'});e.group.append(handle);e.views.handle=handle;handle.addEventListener('pointerdown',event=>begin(event,[e.a,e.b]))}
function move(event,gesture=true){
const drag=field.drag;if(!drag||event.pointerId!==drag.id)return;drag.pointer=event;if(gesture){drag.samples.push({x:event.clientX,y:event.clientY,time:event.timeStamp});drag.samples=drag.samples.filter(sample=>event.timeStamp-sample.time<=160)}const p=point(event),dx=p.x-drag.start.x,dy=p.y-drag.start.y;
if(gesture&&NeuralConnections.recordShake(drag.shake,event.clientX,event.clientY,event.timeStamp)&&!drag.broken){const chain=field.nodes[drag.ids[0]].chain;const removed=field.edges.filter(e=>e.joint&&(field.nodes[e.a].chain===chain||field.nodes[e.b].chain===chain));for(const edge of removed)edge.marker.remove();field.edges=field.edges.filter(e=>!removed.includes(e));drag.broken=true;status.textContent=removed.length?'Connection released by shaking.':'';}
drag.ids.forEach((id,i)=>{const pin={x:drag.origins[i].x+dx,y:drag.origins[i].y+dy};field.pins.set(id,pin);field.nodes[id].x=pin.x;field.nodes[id].y=pin.y});
clearTarget();const connected=new Set(NeuralConnections.component(field.nodes,field.edges,drag.ids[0]));let distance=18;
if(!drag.broken)for(const source of drag.ids)for(let target=0;target<field.nodes.length;target++){if(connected.has(target))continue;const a=field.nodes[source],b=field.nodes[target],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<distance){distance=d;field.target={source,target};}}
if(field.target){const target=field.nodes[field.target.target];field.chains[target.chain].group.classList.add('is-target');target.circle.classList.add('is-target')}
if(gesture)wake();else needsFrame=true;
}
svg.addEventListener('pointermove',move);field.updateDrag=()=>move(field.drag.pointer,false);
function end(event){const drag=field.drag;if(!drag||event.pointerId!==drag.id)return;if(field.target&&event.type==='pointerup'&&!drag.broken){const {source:a,target:b}=field.target;const marker=svgNode('circle',{class:'neural-joint',r:8,'data-joint':'true'});svg.append(marker);field.edges.push({a,b,rest:0,joint:true,marker});const target=field.nodes[b],source=field.nodes[a];source.x=target.x;source.y=target.y;status.textContent='Neural chains connected. Shake four times in one second to disconnect.';}if(event.type==='pointerup'){const velocity=NeuralMomentum.releaseVelocity(drag.samples,event.timeStamp),ids=NeuralConnections.component(field.nodes,field.edges,drag.ids[0]),chains=[...new Set(ids.map(id=>field.nodes[id].chain))],mass=Math.sqrt(chains.length);for(const chain of chains){field.chains[chain].momentumX=velocity.x*.8/mass;field.chains[chain].momentumY=velocity.y*.8/mass}for(const id of ids){field.nodes[id].vx+=velocity.x*(drag.ids.includes(id)?.14:.04);field.nodes[id].vy+=velocity.y*(drag.ids.includes(id)?.14:.04)}}field.journeys.delete([...new Set(NeuralConnections.component(field.nodes,field.edges,drag.ids[0]).map(id=>field.nodes[id].chain))].sort((a,b)=>a-b).join(','));field.drag=null;field.pins.clear();clearTarget();for(const chain of field.chains)chain.group.classList.remove('is-dragging');wake()}
svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);svg.addEventListener('lostpointercapture',end);
function respawn(field,ids,chains,bounds){
const originalIds=new Set(ids),removed=field.edges.filter(edge=>edge.joint&&(originalIds.has(edge.a)||originalIds.has(edge.b)));removed.forEach(edge=>edge.marker.remove());field.edges=field.edges.filter(edge=>!removed.includes(edge));
for(const chain of chains){const x=20+Math.random()*Math.max(1,bounds.width-170),visible=-bounds.top+30+Math.random()*Math.max(100,innerHeight-120),y=Math.max(30,Math.min(bounds.height-100,Math.random()<.65?visible:40+Math.random()*(bounds.height-160)));chain.scale=1;chain.momentumX=chain.momentumY=0;chain.ids.forEach((id,index)=>{const node=field.nodes[id];node.x=x+chain.pattern[index].x;node.y=y+chain.pattern[index].y;node.homeX=node.x;node.homeY=node.y;node.vx=node.vy=0});for(const edge of field.edges)if(!edge.joint&&field.nodes[edge.a].chain===field.nodes[chain.ids[0]].chain)edge.rest=edge.baseRest}
field.absorptions+=chains.length;field.host.dataset.absorptions=field.absorptions;
}
function advanceJourney(field,ids,chains,key,elapsed,bounds){
const target=NeuralGlobe.target(),cx=ids.reduce((sum,id)=>sum+field.nodes[id].x,0)/ids.length,cy=ids.reduce((sum,id)=>sum+field.nodes[id].y,0)/ids.length,dx=target.x-cx,dy=target.y-cy,distance=Math.hypot(dx,dy)||1;
let journey=field.journeys.get(key);if(!journey){journey={distance:Math.max(distance,60),scale:1,age:0,delay:(+key.split(',')[0]%5)*.45};field.journeys.set(key,journey)}journey.age+=elapsed;
const progress=Math.max(0,Math.min(1,1-distance/journey.distance));if(distance<Math.max(14,target.radius*.1)&&journey.age>journey.delay){respawn(field,ids,chains,bounds);field.journeys.delete(key);return}
const approaching=journey.age>journey.delay,desired=approaching?GlobeMath.perspectiveScale(progress):1,ratio=desired/journey.scale;journey.scale=desired;
const speed=approaching?Math.min(distance/Math.max(elapsed,.001),85+Math.min(95,distance*.025)):0,side=Math.sin(journey.age*.45+ids[0])*12;
const inertiaX=chains.reduce((v,c)=>v+c.momentumX,0)/chains.length,inertiaY=chains.reduce((v,c)=>v+c.momentumY,0)/chains.length;
const moveX=(dx/distance*speed-dy/distance*side+inertiaX)*elapsed,moveY=(dy/distance*speed+dx/distance*side+inertiaY)*elapsed,spin=chains.reduce((v,c)=>v+c.spin,0)/chains.length;
for(const id of ids){const node=field.nodes[id],x=(node.x-cx)*ratio,y=(node.y-cy)*ratio;node.vx*=ratio;node.vy*=ratio;node.x=cx+x-y*spin*elapsed+moveX;node.y=cy+y+x*spin*elapsed+moveY}
for(const chain of chains){chain.scale*=ratio;chain.momentumX=NeuralMomentum.decay(chain.momentumX,elapsed);chain.momentumY=NeuralMomentum.decay(chain.momentumY,elapsed);chain.group.dataset.journey='approaching'}
for(const edge of field.edges)if(!edge.joint&&ids.includes(edge.a))edge.rest*=ratio;
const xs=ids.map(id=>field.nodes[id].x),ys=ids.map(id=>field.nodes[id].y),offsetX=Math.min(...xs)<8?8-Math.min(...xs):Math.max(...xs)>bounds.width-8?bounds.width-8-Math.max(...xs):0,offsetY=Math.min(...ys)<8?8-Math.min(...ys):Math.max(...ys)>bounds.height-8?bounds.height-8-Math.max(...ys):0;
if(offsetX||offsetY)for(const id of ids){field.nodes[id].x+=offsetX;field.nodes[id].y+=offsetY}
if(offsetX)chains.forEach(chain=>chain.momentumX*=-.55);if(offsetY)chains.forEach(chain=>chain.momentumY*=-.55);
}
function step(time){const elapsed=Math.min((time-lastTime)/1000||1/60,1),dt=Math.min(elapsed,1/60);lastTime=time;needsFrame=false;
for(const field of fields){if(field.drag){const pointer=field.drag.pointer,edge=40;const speed=pointer.clientY<edge?-420*(1-pointer.clientY/edge):pointer.clientY>innerHeight-edge?420*(1-(innerHeight-pointer.clientY)/edge):0;if(speed)window.scrollBy({top:speed*elapsed,behavior:'instant'});field.updateDrag()}const bounds=field.section.getBoundingClientRect();field.host.style.height=`${bounds.height}px`;field.svg.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);field.svg.setAttribute('preserveAspectRatio','none');
const done=new Set(),journeysSeen=new Set();
for(let i=0;i<field.nodes.length;i++){
if(done.has(i))continue;const ids=NeuralConnections.component(field.nodes,field.edges,i);ids.forEach(id=>done.add(id));
const chainIds=[...new Set(ids.map(id=>field.nodes[id].chain))].sort((a,b)=>a-b),chains=chainIds.map(id=>field.chains[id]),key=chainIds.join(',');journeysSeen.add(key);
const dragging=field.drag&&ids.includes(field.drag.ids[0]),focused=chains.some(chain=>chain.group.contains(document.activeElement));
const hoveredTarget=field.target&&ids.includes(field.target.target);if(motionEnabled()&&!dragging&&!focused&&!hoveredTarget)advanceJourney(field,ids,chains,key,elapsed,bounds);
}
for(const key of field.journeys.keys())if(!journeysSeen.has(key))field.journeys.delete(key);
for(const node of field.nodes){node.homeX=node.x;node.homeY=node.y}needsFrame=NeuralPhysics.step(field.nodes,field.edges,dt,48,field.pins)||needsFrame;NeuralConnections.weld(field.nodes,field.edges,field.pins);
for(const edge of field.edges){const a=field.nodes[edge.a],b=field.nodes[edge.b];if(edge.joint){edge.marker.setAttribute('cx',a.x);edge.marker.setAttribute('cy',a.y);edge.marker.setAttribute('r',Math.max(.5,8*field.chains[a.chain].scale));continue}for(const line of [edge.views.underlay,edge.views.line,edge.views.hit])for(const [attr,value]of Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y}))line.setAttribute(attr,value);edge.views.handle.setAttribute('cx',(a.x+b.x)/2);edge.views.handle.setAttribute('cy',(a.y+b.y)/2);edge.views.line.style.strokeWidth=Math.max(.2,1.3*field.chains[a.chain].scale);edge.views.handle.setAttribute('r',Math.max(3,7*field.chains[a.chain].scale))}
for(const chain of field.chains){chain.group.dataset.scale=chain.scale.toFixed(3);chain.group.style.opacity=chain.group.classList.contains('is-dragging')||chain.group.classList.contains('is-target')||chain.group.matches(':hover')?'1':String(Math.max(.06,.7*chain.scale))}for(const node of field.nodes){node.circle.setAttribute('r',Math.max(.25,4.8*field.chains[node.chain].scale));node.hit.setAttribute('r',Math.max(5,12*field.chains[node.chain].scale));for(const view of [node.circle,node.hit]){view.setAttribute('cx',node.x);view.setAttribute('cy',node.y)}}
}}
window.NeuralClusters={step,needsFrame:()=>needsFrame};
})();







