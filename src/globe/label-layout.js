(function(scope){
  const gap=20;
  function step(labels,elapsed,bounds,animate=true){
    const ordered=[...labels].sort((a,b)=>a.order-b.order);
    const overlaps=(a,b)=>a.side===b.side||Math.abs(a.x-b.x)<(a.width+b.width)/2+8;
    const clamp=(value,label)=>Math.max(bounds.top+label.height/2,Math.min(bounds.bottom-label.height/2,value));
    const targets=new Map(ordered.map(label=>[label,clamp(label.y,label)]));
    function separate(read,write,impulse=false){
      for(let pass=0;pass<16;pass++){
        let largest=0;
        for(let i=0;i<ordered.length;i++)for(let j=i+1;j<ordered.length;j++){
          const a=ordered[i],b=ordered[j];if(!overlaps(a,b))continue;
          const penetration=(a.height+b.height)/2+gap+24-(read(b)-read(a));
          if(penetration<=.001)continue;
          largest=Math.max(largest,penetration);
          const push=penetration/2;
          write(a,clamp(read(a)-push,a));write(b,clamp(read(b)+push,b));
          if(impulse&&pass===0){
            const closing=b.motion.velocity-a.motion.velocity;
            if(closing<0){const bump=-closing*.54;a.motion.velocity-=bump;b.motion.velocity+=bump}
          }
        }
        if(largest<=.001)break;
      }
    }
    separate(label=>targets.get(label),(label,value)=>targets.set(label,value));
    for(const label of ordered){
      if(!label.motion)label.motion={y:targets.get(label),velocity:0};
      if(!animate){label.motion.y=targets.get(label);label.motion.velocity=0}
    }
    const duration=Math.min(.05,Math.max(0,elapsed)),steps=Math.max(1,Math.ceil(duration/(1/120))),dt=duration/steps;
    if(animate)for(let n=0;n<steps;n++){
      for(const label of ordered){
        const state=label.motion;
        state.velocity+=((targets.get(label)-state.y)*170-state.velocity*20.5)*dt;
        state.y+=state.velocity*dt;
        const bounded=clamp(state.y,label);if(bounded!==state.y)state.velocity=0;state.y=bounded;
      }
      separate(label=>label.motion.y,(label,value)=>{label.motion.y=value},true);
    }
    return labels;
  }
  const api={step,gap};
  scope.GlobeLabelLayout=api;
})(typeof window==='undefined'?globalThis:window);

