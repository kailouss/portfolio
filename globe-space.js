(() => {
  const add=(a,b)=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z});
  const subtract=(a,b)=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z});
  const multiply=(a,s)=>({x:a.x*s,y:a.y*s,z:a.z*s});
  const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
  const cross=(a,b)=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
  const length=a=>Math.hypot(a.x,a.y,a.z);
  const normalize=a=>multiply(a,1/(length(a)||1));
  const mix=(a,b,t)=>add(multiply(a,1-t),multiply(b,t));
  const rotate=(p,angle)=>({x:p.x*Math.cos(angle)+p.z*Math.sin(angle),y:p.y,z:p.z*Math.cos(angle)-p.x*Math.sin(angle)});
  function basis(camera){
    const forward=normalize(subtract(camera.target,camera.position));
    const right=normalize(cross(forward,{x:0,y:1,z:0}));
    return {forward,right,up:cross(right,forward)};
  }
  function project(point,camera,width,height){
    const axes=basis(camera),relative=subtract(point,camera.position),depth=dot(relative,axes.forward);
    const focal=Math.min(width,height)*1.1;
    return {x:width/2+dot(relative,axes.right)*focal/depth,y:height/2-dot(relative,axes.up)*focal/depth,depth,scale:focal/depth,visible:depth>.06};
  }
  function unproject(x,y,depth,camera,width,height){
    const axes=basis(camera),focal=Math.min(width,height)*1.1;
    return add(camera.position,add(multiply(axes.forward,depth),add(multiply(axes.right,(x-width/2)*depth/focal),multiply(axes.up,-(y-height/2)*depth/focal))));
  }
  function occluded(point,camera){
    const direction=subtract(point,camera.position),distance=length(direction),ray=normalize(direction);
    const b=dot(camera.position,ray),c=dot(camera.position,camera.position)-1,discriminant=b*b-c;
    if(discriminant<0)return false;
    const hit=-b-Math.sqrt(discriminant);
    return hit>0&&hit<distance-.015;
  }
  const bezier=(a,b,c,d,t)=>add(add(multiply(a,(1-t)**3),multiply(b,3*(1-t)**2*t)),add(multiply(c,3*(1-t)*t*t),multiply(d,t**3)));
  window.GlobeSpace={add,subtract,multiply,dot,length,normalize,mix,rotate,project,unproject,occluded,bezier};
})();
