(function(scope){
function step(nodes,edges,dt,maxLength,pins=new Map()){
const forces=nodes.map(node=>({x:(node.homeX-node.x)*8,y:(node.homeY-node.y)*8}));
for(const edge of edges){const a=nodes[edge.a],b=nodes[edge.b],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy)||1;const force=(length-edge.rest)*105;forces[edge.a].x+=dx/length*force;forces[edge.a].y+=dy/length*force;forces[edge.b].x-=dx/length*force;forces[edge.b].y-=dy/length*force}
nodes.forEach((node,i)=>{if(pins.has(i)){node.x=pins.get(i).x;node.y=pins.get(i).y;node.vx=0;node.vy=0}else{node.vx=(node.vx+forces[i].x*dt)*Math.exp(-8*dt);node.vy=(node.vy+forces[i].y*dt)*Math.exp(-8*dt);node.x+=node.vx*dt;node.y+=node.vy*dt}});
// Projection enforces the visible three-rem limit, including during a drag.
for(let pass=0;pass<256;pass++){let largestError=0;for(const edge of edges){const a=nodes[edge.a],b=nodes[edge.b],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy),limit=edge.joint?0:maxLength;if(length<=limit||!length)continue;largestError=Math.max(largestError,length-limit);const excess=(length-limit)/length,pa=pins.has(edge.a),pb=pins.has(edge.b);if(pa&&pb)continue;const wa=pa?0:pb?1:.5,wb=pb?0:pa?1:.5;a.x+=dx*excess*wa;a.y+=dy*excess*wa;b.x-=dx*excess*wb;b.y-=dy*excess*wb}if(largestError<.0001)break}
return nodes.some(node=>Math.hypot(node.vx,node.vy)>.05||Math.hypot(node.x-node.homeX,node.y-node.homeY)>.05)||pins.size>0;
}
if(typeof module!=='undefined'&&module.exports)module.exports={step};else scope.NeuralPhysics={step};
})(typeof window!=='undefined'?window:globalThis);

