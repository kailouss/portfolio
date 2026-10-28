const assert=require('node:assert/strict');
const connections=require('./neural-connections.js');
const physics=require('./neural-physics.js');
let state={x:0,y:0},released=false;
for(let i=0;i<10;i++)released=connections.recordShake(state,i%2?-30:30,0,i*90)||released;
assert(released,'Four fast full swings should release a connection');
for(const [amplitude,interval]of [[30,300],[3,20]]){
state={x:0,y:0};for(let i=0;i<30;i++)assert.equal(connections.recordShake(state,i%2?-amplitude:amplitude,0,i*interval),false,'Slow movement and pointer jitter should not release');
}
const nodes=Array.from({length:8},(_,i)=>({x:i*28,y:50,homeX:i*28,homeY:50,vx:0,vy:0}));
const edges=[0,1,2,4,5,6].map(a=>({a,b:a+1,rest:28}));
edges.push({a:3,b:4,rest:0,joint:true});
assert.equal(connections.component(nodes,edges,0).length,8);
assert.equal(connections.component(nodes,edges.filter(e=>!e.joint),0).length,4);
for(let frame=0;frame<100;frame++){
const pins=new Map([[0,{x:frame*9,y:50+frame*2}]]);
nodes.forEach(n=>{n.homeX=n.x;n.homeY=n.y});
physics.step(nodes,edges,1/60,48,pins);connections.weld(nodes,edges,pins);
for(const e of edges)assert(Math.hypot(nodes[e.a].x-nodes[e.b].x,nodes[e.a].y-nodes[e.b].y)<=48.01);
assert(Math.hypot(nodes[3].x-nodes[4].x,nodes[3].y-nodes[4].y)<.01);
}
console.log('Passed shake timing, jitter rejection, joining, separation, joint alignment, and 3rem constraint checks.');
const network=Array.from({length:12},(_,i)=>({x:i*16,y:400+Math.floor(i/4)*600,homeX:i*16,homeY:400+Math.floor(i/4)*600,vx:0,vy:0}));
const networkEdges=[0,1,2,4,5,6,8,9,10].map(a=>({a,b:a+1,rest:16}));
networkEdges.push({a:3,b:4,joint:true,rest:0},{a:4,b:8,joint:true,rest:0});
assert.equal(connections.component(network,networkEdges,0).length,12,'Three chains from different page positions must join');
connections.weld(network,networkEdges,new Map());
assert.equal(network[3].x,network[8].x);assert.equal(network[3].y,network[8].y);
assert.equal(connections.component(network,networkEdges.filter(e=>!e.joint),0).length,4,'Breaking joints must preserve original chains');
console.log('Passed three-chain page-wide connectivity, shared junction alignment, and separation checks.');
const momentum=require('./neural-momentum.js');
const fast=momentum.releaseVelocity([{x:0,y:0,time:0},{x:30,y:12,time:40},{x:60,y:24,time:80}],85);
assert(fast.x>500&&fast.y>0,'Release preserves the direction and speed of a fast drag');
const held=momentum.releaseVelocity([{x:0,y:0,time:0},{x:60,y:24,time:80}],200);
assert.deepEqual(held,{x:0,y:0},'Holding still before release should not launch the chain');
const capped=momentum.releaseVelocity([{x:0,y:0,time:0},{x:1000,y:1000,time:10}],12);
assert(Math.hypot(capped.x,capped.y)<=900.001,'Release speed stays bounded');
assert(momentum.decay(600,.5)>0&&momentum.decay(600,.5)<600);
assert(Math.abs(momentum.decay(momentum.decay(600,.3),.7)-momentum.decay(600,1))<.0001,'Damping does not depend on frame boundaries');
console.log('Passed release direction, held-pointer, speed cap, and momentum decay checks.');
const globe=require('./globe-math.js');
let previous=1;
for(let i=0;i<=100;i++){const scale=globe.perspectiveScale(i/100);assert(scale>0&&scale<=previous);previous=scale}
assert(globe.perspectiveScale(1)<.1,'Approaching chains shrink into the background');
const front=globe.project({x:.4,y:0,z:.8},0,100),back=globe.project({x:.4,y:0,z:-.8},0,100);
assert(front.scale>back.scale,'Perspective makes front points larger');
assert.notEqual(globe.project({x:1,y:0,z:0},0,100).x,globe.project({x:1,y:0,z:0},1,100).x,'The globe rotates in 3D');
console.log('Passed perspective shrink, front/back depth, and globe rotation checks.');
