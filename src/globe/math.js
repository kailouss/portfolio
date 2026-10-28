(function(scope){
function perspectiveScale(progress){const p=Math.max(0,Math.min(1,progress));return 3/(3+30*p*p*p*p)}
function project(point,angle,radius){const c=Math.cos(angle),s=Math.sin(angle),x=point.x*c+point.z*s,z=point.z*c-point.x*s,tilt=-.2,y=point.y*Math.cos(tilt)-z*Math.sin(tilt),depth=point.y*Math.sin(tilt)+z*Math.cos(tilt),perspective=3.6/(3.6-depth);return {x:x*radius*perspective,y:-y*radius*perspective,z:depth,scale:perspective}}
const api={perspectiveScale,project};scope.GlobeMath=api;
})(typeof window!=='undefined'?window:globalThis);

