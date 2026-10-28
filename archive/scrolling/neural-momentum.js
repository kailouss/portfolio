(function(scope){
function releaseVelocity(samples,time){const recent=samples.filter(s=>time-s.time<=120);if(recent.length<2||time-recent.at(-1).time>80)return {x:0,y:0};const first=recent[0],last=recent.at(-1),seconds=(last.time-first.time)/1000;if(seconds<=0)return {x:0,y:0};let x=(last.x-first.x)/seconds,y=(last.y-first.y)/seconds;const speed=Math.hypot(x,y),limit=900;if(speed>limit){x*=limit/speed;y*=limit/speed}return {x,y}}
function decay(value,seconds){return value*Math.exp(-1.8*seconds)}
const api={releaseVelocity,decay};if(typeof module!=='undefined'&&module.exports)module.exports=api;else scope.NeuralMomentum=api;
})(typeof window!=='undefined'?window:globalThis);
