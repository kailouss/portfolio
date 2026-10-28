(function(scope){
function modulo(value,count){return((value%count)+count)%count}
function wrapOffset(value,start,span){return span>0?start+modulo(value-start,span):value}
if(typeof module!=='undefined'&&module.exports)module.exports={modulo,wrapOffset};else scope.CarouselLoop={modulo,wrapOffset};
})(typeof window!=='undefined'?window:globalThis);
