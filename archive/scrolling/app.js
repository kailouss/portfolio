const root=document.documentElement;
const theme=document.querySelector('#theme');
theme.onclick=()=>{const paper=root.dataset.theme!=='paper';root.dataset.theme=paper?'paper':'night';theme.textContent=paper?'Night ↗':'Paper ↗';theme.setAttribute('aria-label',paper?'Switch to night theme':'Switch to paper theme')};
const carouselControllers=[];
function refreshPlayControl(){carouselControllers.forEach(controller=>controller.refresh())}
function stepCarousel(seconds,time){carouselControllers.forEach(controller=>controller.step(seconds,time))}
function renderTags(container,stack){container.replaceChildren(...stack.map(technology=>{const badge=document.createElement("span");badge.textContent=technology;return badge}))}
const dialog=document.querySelector('dialog');
function openProject(project){document.querySelector("#dialog-title").textContent=project.title;document.querySelector("#dialog-description").textContent=project.description;document.querySelector("#dialog-role").textContent=project.role;renderTags(document.querySelector("#dialog-stack"),project.stack);document.querySelector("#dialog-notes").textContent=project.notes;document.querySelector("#dialog-repo").href=project.url;dialog.showModal()}
document.querySelectorAll('.close,.close-project').forEach(button=>button.onclick=()=>dialog.close());
dialog.onclick=event=>{if(event.target!==dialog)return;const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close()};
document.querySelector('#contact-button').onclick=()=>{document.querySelector('#contact-note').hidden=false};

// Neural motion and project carousels share one render loop.
const networkMotion=matchMedia('(prefers-reduced-motion: reduce)');
let storedMotion=null;
try{storedMotion=localStorage.getItem('portfolio-motion')}catch{}
let motionOverride=storedMotion==='on'?true:storedMotion==='off'?false:null;
let motionEnabled=motionOverride===null?!networkMotion.matches:motionOverride;
const motionButton=document.querySelector('#motion-toggle');
function reflectMotion(){root.dataset.motion=motionEnabled?'on':'off';motionButton.textContent=motionEnabled?'Pause motion':'Enable motion';motionButton.setAttribute('aria-label',motionEnabled?'Pause motion':'Enable motion');motionButton.setAttribute('aria-pressed',String(motionEnabled))}
reflectMotion();
motionButton.onclick=()=>{motionEnabled=!motionEnabled;motionOverride=motionEnabled;try{localStorage.setItem('portfolio-motion',motionEnabled?'on':'off')}catch{}reflectMotion();refreshPlayControl();requestNetworkFrame()};
let networkFrame=0,lastSceneTime=0;
function drawScene(time){networkFrame=0;const elapsed=Math.min((time-lastSceneTime)/1000||0,1);lastSceneTime=time;window.NeuralGlobe.draw(time);window.NeuralClusters.step(time);stepCarousel(elapsed,time);if((motionEnabled||window.NeuralClusters.needsFrame())&&!document.hidden)networkFrame=requestAnimationFrame(drawScene)}
function requestNetworkFrame(){if(!networkFrame)networkFrame=requestAnimationFrame(drawScene)}
window.addEventListener('resize',requestNetworkFrame);
window.addEventListener('scroll',requestNetworkFrame,{passive:true});
networkMotion.addEventListener('change',()=>{if(motionOverride===null){motionEnabled=!networkMotion.matches;reflectMotion()}refreshPlayControl();requestNetworkFrame()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){lastSceneTime=0;requestNetworkFrame()}});

function renderProjectCard(project,index){
const card=document.createElement('button');card.className='project';card.dataset.project=index;card.setAttribute('aria-label','View '+project.title+' project');
const copy=document.createElement('div');copy.className='project-copy';const title=document.createElement('h3');title.textContent=project.title;const tags=document.createElement('div');tags.className='tags';renderTags(tags,project.stack);copy.append(title,tags);
const preview=document.createElement('div');preview.className='project-preview repository-preview';preview.setAttribute('aria-hidden','true');
const poster=document.createElement('div');poster.className='repository-poster';const role=document.createElement('span');role.className='poster-role';role.textContent=project.role;const mark=document.createElement('strong');mark.textContent=project.mark;const owner=document.createElement('span');owner.className='poster-owner';owner.textContent=project.repo.split('/')[0];const number=document.createElement('span');number.className='poster-number';number.textContent=String(index+1).padStart(2,'0');poster.append(role,mark,owner,number);preview.append(poster);card.append(preview,copy);return card;
}
function createCarousel(carousel,projects){
const projectTrack=carousel.querySelector(".projects");
projects.forEach((project,index)=>projectTrack.append(renderProjectCard(project,index)));
const dots=carousel.querySelector(".carousel-dots");
projects.forEach((project,index)=>{const button=document.createElement("button");button.dataset.slide=index;button.setAttribute("aria-label",`Show ${project.title}`);dots.append(button)});
projectTrack.addEventListener("click",event=>{const card=event.target.closest("[data-project]");if(card){hideProjectPeek(true);openProject(projects[+card.dataset.project])}});
const sourceProjectSlides=[...projectTrack.querySelectorAll('.project')];
// Five identical sets keep both sides filled when the visible strip wraps.
const fragment=document.createDocumentFragment();
for(let set=0;set<5;set++)sourceProjectSlides.forEach((source,index)=>{let card;if(set===2){card=source}else{card=document.createElement('div');card.className=source.className;card.innerHTML=source.innerHTML;card.dataset.project=String(index);card.setAttribute('aria-hidden','true')}card.dataset.copy=String(set);fragment.append(card)});
projectTrack.replaceChildren(fragment);
const physicalSlides=[...projectTrack.querySelectorAll('.project')];
const projectPrevious=carousel.querySelector('.project-prev'),projectNext=carousel.querySelector('.project-next');
const projectDots=[...carousel.querySelectorAll('[data-slide]')];
const carouselPlay=carousel.querySelector('.carousel-play');
const projectPeek=document.querySelector("#project-peek-template").content.firstElementChild.cloneNode(true);
projectTrack.append(projectPeek);
let autoplayOffset=null,carouselSpeed=0,navigationTarget=null,peekCloseTimer=0,expansionAnchor=null,peekTimers=[],peekFocusRequested=false;
let activeProject=0,cycleWidth=0,loopStart=0,autoplay=true,hoverPaused=false,focusPaused=false,carouselVisible=true,holdUntil=0,scrollTimer=0,layoutFrame=0,peekCard=null;
projectTrack.style.scrollBehavior='auto';
function slideOffset(card){return projectTrack.scrollLeft+card.getBoundingClientRect().left-projectTrack.getBoundingClientRect().left}
function renderCarousel(index){if(activeProject!==index)activeProject=index;carousel.querySelector('.carousel-status').textContent=`${String(index+1).padStart(2,"0")} / ${String(projects.length).padStart(2,"0")} · ${projects[index].title}`;projectDots.forEach((dot,i)=>dot.setAttribute('aria-current',String(i===index)));sourceProjectSlides.forEach((slide,i)=>{slide.tabIndex=i===index?0:-1;slide.dataset.active=String(i===index)});carousel.querySelector('.carousel-status').setAttribute('aria-live',autoplay&&!hoverPaused&&!focusPaused&&motionEnabled?'off':'polite')}
function nearestPhysical(){const left=projectTrack.getBoundingClientRect().left;return physicalSlides.reduce((closest,slide,i)=>Math.abs(slide.getBoundingClientRect().left-left)<Math.abs(physicalSlides[closest].getBoundingClientRect().left-left)?i:closest,0)}
function normalizeStrip(force=false){if(!cycleWidth||peekCard||expansionAnchor||(!force&&focusPaused))return;const wrapped=CarouselLoop.wrapOffset(projectTrack.scrollLeft,loopStart,cycleWidth);if(Math.abs(wrapped-projectTrack.scrollLeft)>.5)projectTrack.scrollLeft=wrapped}
function layoutCarousel(){const phase=cycleWidth?CarouselLoop.modulo(projectTrack.scrollLeft-loopStart,cycleWidth)/cycleWidth:0;cycleWidth=physicalSlides[projects.length].offsetLeft-physicalSlides[0].offsetLeft;loopStart=slideOffset(physicalSlides[projects.length*2]);projectTrack.scrollLeft=loopStart+phase*cycleWidth;autoplayOffset=projectTrack.scrollLeft;renderCarousel(+physicalSlides[nearestPhysical()].dataset.project);refreshPlayControl()}
function goToProject(index,focus=false){autoplayOffset=null;carouselSpeed=0;const logical=CarouselLoop.modulo(index,projects.length);if(!focus)normalizeStrip(true);holdUntil=performance.now()+1800;let target;if(focus){target=sourceProjectSlides[logical];focusPaused=true;target.focus({preventScroll:true})}else{target=physicalSlides.filter(slide=>+slide.dataset.project===logical).reduce((best,slide)=>Math.abs(slideOffset(slide)-projectTrack.scrollLeft)<Math.abs(slideOffset(best)-projectTrack.scrollLeft)?slide:best)}renderCarousel(logical);navigationTarget=slideOffset(target);if(!motionEnabled){projectTrack.scrollLeft=navigationTarget;navigationTarget=null}refreshPlayControl();requestNetworkFrame()}
function refreshPlayControl(){const playing=autoplay&&motionEnabled;carousel.dataset.playback=!playing?'paused':hoverPaused?'hover-paused':focusPaused?'focus-paused':'running';carouselPlay.textContent=playing?'Pause':'Play';carouselPlay.setAttribute('aria-label',playing?'Pause automatic project scrolling':'Play automatic project scrolling');carouselPlay.setAttribute('aria-pressed',String(playing))}
function stepCarousel(seconds,time){if(projectTrack.dataset.entranceState && projectTrack.dataset.entranceState!=='complete')return;stepProjectExpansion();const bounds=carousel.getBoundingClientRect();carouselVisible=bounds.bottom>0&&bounds.top<innerHeight;const running=autoplay&&!expansionAnchor&&motionEnabled&&carouselVisible&&!hoverPaused&&!focusPaused&&!dialog.open&&time>holdUntil;carousel.dataset.playback=!autoplay?'paused':!motionEnabled?'motion-off':!carouselVisible?'offscreen':hoverPaused?'hover-paused':focusPaused?'focus-paused':dialog.open?'dialog-paused':time<=holdUntil?'navigation-paused':'running';if(navigationTarget!==null){const distance=navigationTarget-projectTrack.scrollLeft;projectTrack.scrollLeft+=distance*(1-Math.exp(-seconds*7));if(Math.abs(distance)<.8){projectTrack.scrollLeft=navigationTarget;navigationTarget=null}autoplayOffset=null}else{const previousSpeed=carouselSpeed;carouselSpeed=motionEnabled?carouselSpeed+((running?12:0)-carouselSpeed)*(1-Math.exp(-seconds*6)):0;if(Math.abs(carouselSpeed)<.02)carouselSpeed=0;if(carouselVisible&&!dialog.open&&cycleWidth&&(running||carouselSpeed)){if(autoplayOffset===null)autoplayOffset=projectTrack.scrollLeft;autoplayOffset=CarouselLoop.wrapOffset(autoplayOffset+(previousSpeed+carouselSpeed)*.5*seconds,loopStart,cycleWidth);projectTrack.scrollLeft=autoplayOffset;if(!focusPaused){const next=+physicalSlides[nearestPhysical()].dataset.project;if(next!==activeProject)renderCarousel(next)}}else autoplayOffset=null}if(peekCard)positionProjectPeek()}
function stepProjectExpansion(){if(!expansionAnchor)return;const {card,centre,baseWidth}=expansionAnchor;const half=card.offsetWidth/2,safeCentre=Math.max(half+5,Math.min(projectTrack.clientWidth-half-5,centre));projectTrack.scrollLeft=card.offsetLeft+half-safeCentre;autoplayOffset=null;if(!peekCard&&Math.abs(card.offsetWidth-baseWidth)<1)expansionAnchor=null}
function positionProjectPeek(){stepProjectExpansion();if(!peekCard)return;projectPeek.style.left=`${peekCard.offsetLeft}px`;projectPeek.style.top=`${peekCard.offsetTop}px`;projectPeek.style.width=`${peekCard.offsetWidth}px`;projectPeek.style.height=`${peekCard.offsetHeight}px`}
function showProjectPeek(card){clearTimeout(peekCloseTimer);if(peekCard===card&&projectPeek.dataset.state!=='closing'){positionProjectPeek();return}const previousAnchor=expansionAnchor?.card===card?expansionAnchor:null;hideProjectPeek(true);clearPeekTimers();const rect=card.getBoundingClientRect(),trackRect=projectTrack.getBoundingClientRect();expansionAnchor=previousAnchor||{card,centre:rect.left-trackRect.left+rect.width/2,baseWidth:card.offsetWidth};peekCard=card;carouselSpeed=0;autoplayOffset=null;navigationTarget=null;const index=+card.dataset.project;projectPeek.querySelector('h3').textContent=projects[index].title;projectPeek.querySelector('.peek-description').textContent=projects[index].description;renderTags(projectPeek.querySelector(".tags"),projects[index].stack.slice(0,3));projectPeek.querySelector(".peek-role").textContent=projects[index].role;projectPeek.querySelector(".peek-actions a").href=projects[index].url;projectPeek.querySelector(".peek-note").textContent=projects[index].verified?"":"Project details to be confirmed";projectPeek.querySelector('.peek-preview').replaceChildren(card.querySelector('.project-preview').cloneNode(true));projectPeek.style.setProperty('--poster-start-height',(card.offsetHeight-54)+'px');projectPeek.hidden=false;delete projectPeek.dataset.shrinking;projectPeek.dataset.state=motionEnabled?'opening':'open';projectPeek.dataset.animating=String(motionEnabled);projectPeek.querySelector('.peek-copy').inert=motionEnabled;projectPeek.setAttribute('aria-busy',String(motionEnabled));card.style.setProperty('--project-resize-duration','200ms');card.dataset.expanded='true';if(motionEnabled){peekTimers.push(setTimeout(()=>{projectPeek.dataset.state='open'},200));peekTimers.push(setTimeout(()=>{projectPeek.dataset.animating='false';projectPeek.querySelector('.peek-copy').inert=false;projectPeek.setAttribute('aria-busy','false');if(peekFocusRequested&&peekCard&&(peekCard===document.activeElement||projectPeek.contains(document.activeElement)))projectPeek.querySelector('.peek-open').focus();peekFocusRequested=false},500))}card.setAttribute('aria-expanded','true');positionProjectPeek();requestNetworkFrame()}
function clearPeekTimers(){peekTimers.forEach(clearTimeout);peekTimers=[]}
function finishProjectPeek(){peekFocusRequested=false;clearPeekTimers();clearTimeout(peekCloseTimer);if(peekCard){delete peekCard.dataset.expanded;peekCard.setAttribute('aria-expanded','false')}if(projectPeek.contains(document.activeElement))document.activeElement.blur();peekCard=null;projectPeek.hidden=true;projectPeek.dataset.animating='false';projectPeek.querySelector('.peek-copy').inert=false;projectPeek.setAttribute('aria-busy','false');delete projectPeek.dataset.state;delete projectPeek.dataset.shrinking;holdUntil=performance.now()+500;stepProjectExpansion();focusPaused=carousel.contains(document.activeElement);hoverPaused=carousel.matches(':hover')}
function hideProjectPeek(immediate=false){if(!peekCard)return;if(immediate||!motionEnabled){finishProjectPeek();return}if(projectPeek.dataset.state==='closing')return;clearPeekTimers();projectPeek.dataset.state='closing';projectPeek.dataset.animating='true';projectPeek.querySelector('.peek-copy').inert=true;projectPeek.setAttribute('aria-busy','true');peekTimers.push(setTimeout(()=>{if(!peekCard)return;peekCard.style.setProperty('--project-resize-duration','300ms');delete peekCard.dataset.expanded;projectPeek.dataset.shrinking='true'},200));peekTimers.push(setTimeout(finishProjectPeek,500));requestNetworkFrame()}
function schedulePeekClose(event){const pointerExit=event?.type==='pointerleave';clearTimeout(peekCloseTimer);peekCloseTimer=setTimeout(()=>{if(!projectPeek.matches(':hover')&&!peekCard?.matches(':hover')&&(pointerExit||(!projectPeek.contains(document.activeElement)&&!peekCard?.contains(document.activeElement)))){hideProjectPeek();hoverPaused=carousel.matches(':hover');focusPaused=carousel.contains(document.activeElement);refreshPlayControl()}},0)}
physicalSlides.forEach(card=>{card.addEventListener('pointerenter',event=>{const keyboardCardFocused=sourceProjectSlides.includes(document.activeElement)||projectPeek.contains(document.activeElement);if(event.pointerType==='mouse'&&!keyboardCardFocused){hoverPaused=true;showProjectPeek(card)}});card.addEventListener('pointerleave',schedulePeekClose)});
function closeExpandedProject(){const card=peekCard;card?.focus({preventScroll:true});hideProjectPeek()}
projectPeek.addEventListener('click',event=>event.stopPropagation());projectPeek.addEventListener('pointerenter',()=>{clearTimeout(peekCloseTimer);hoverPaused=true;if(projectPeek.dataset.state==='closing')showProjectPeek(peekCard)});projectPeek.addEventListener('pointerleave',schedulePeekClose);projectPeek.addEventListener('focusin',()=>{focusPaused=true});projectPeek.addEventListener('focusout',schedulePeekClose);projectPeek.querySelector('.peek-open').onclick=()=>{const project=projects[+peekCard.dataset.project];hideProjectPeek(true);openProject(project)};projectPeek.addEventListener('keydown',event=>{if(projectPeek.dataset.animating==='true'&&['PageDown','PageUp','ArrowDown','ArrowUp',' '].includes(event.key))event.preventDefault();if(event.key==='Escape'){event.preventDefault();closeExpandedProject()}});
carousel.addEventListener('pointerenter',()=>{hoverPaused=true;refreshPlayControl()});carousel.addEventListener('pointerleave',()=>{if(projectPeek.hidden)hoverPaused=false;schedulePeekClose();refreshPlayControl()});
carousel.addEventListener('focusin',event=>{focusPaused=true;const card=event.target.closest('.project');if(card){renderCarousel(+card.dataset.project);showProjectPeek(card)}refreshPlayControl()});carousel.addEventListener('focusout',event=>{if(!carousel.contains(event.relatedTarget)&&!projectPeek.contains(event.relatedTarget)){focusPaused=false;schedulePeekClose();holdUntil=performance.now()+500;refreshPlayControl()}});
carouselPlay.onclick=()=>{if(!motionEnabled){motionButton.click();autoplay=true}else autoplay=!autoplay;refreshPlayControl();requestNetworkFrame()};
projectPrevious.disabled=false;projectNext.disabled=false;
projectPrevious.onclick=()=>goToProject(activeProject-1);projectNext.onclick=()=>goToProject(activeProject+1);projectDots.forEach(dot=>dot.onclick=()=>goToProject(Number(dot.dataset.slide)));
projectTrack.addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{if(performance.now()>holdUntil&&navigationTarget===null)normalizeStrip();if(!focusPaused)renderCarousel(+physicalSlides[nearestPhysical()].dataset.project)},200);if(peekCard)positionProjectPeek()},{passive:true});
function holdManualScroll(){holdUntil=performance.now()+2500;autoplayOffset=null;navigationTarget=null;carouselSpeed=0}
function lockAnimatingScroll(event){if(projectPeek.dataset.animating==='true'&&(projectPeek.contains(event.target)||Math.abs(event.deltaX||0)>0))event.preventDefault()}
projectTrack.addEventListener('wheel',lockAnimatingScroll,{passive:false});projectTrack.addEventListener('touchmove',lockAnimatingScroll,{passive:false});
projectTrack.addEventListener('pointerdown',holdManualScroll,{passive:true});projectTrack.addEventListener('wheel',holdManualScroll,{passive:true});
projectTrack.addEventListener('keydown',event=>{if(projectPeek.contains(event.target))return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();const direction=event.key==='ArrowRight'?1:-1;goToProject(activeProject+direction,true)}else if(event.key==='Tab'&&!event.shiftKey&&peekCard){event.preventDefault();if(projectPeek.dataset.animating==='true')peekFocusRequested=true;else projectPeek.querySelector('.peek-open').focus()}else if(event.key==='Escape')hideProjectPeek()});

window.addEventListener('resize',()=>{cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(layoutCarousel);hideProjectPeek(true)});
window.addEventListener('scroll',()=>{if(peekCard){const r=peekCard.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)hideProjectPeek(true)}},{passive:true});
layoutCarousel();

return {step:stepCarousel,refresh:refreshPlayControl};
}
for(const group of window.PortfolioProjectGroups)carouselControllers.push(createCarousel(document.querySelector(`[data-project-group="${group.id}"]`),group.projects));

const stackCards=[...document.querySelectorAll('.stack-grid li')];
const stackFilters=[...document.querySelectorAll('[data-stack-filter]')];
let stackCategory='all';
const frontendCategories=['front-end','styling','build tooling'];
const backendCategories=['runtime','back-end','data','language'];
stackCards.forEach(card=>{const category=card.querySelector('p').textContent;card.dataset.category=frontendCategories.includes(category)?'frontend':backendCategories.includes(category)?'backend':'tools'});
function filterStack(){const query=document.querySelector('#stack-search').value.trim().toLowerCase();let count=0;stackCards.forEach(card=>{const match=(stackCategory==='all'||card.dataset.category===stackCategory)&&card.textContent.toLowerCase().includes(query);card.hidden=!match;if(match)count++});document.querySelector('#stack-count').textContent=`${count} of ${stackCards.length} technologies & tools`;document.querySelector('#stack-empty').hidden=count!==0;stackFilters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.stackFilter===stackCategory)))}
stackFilters.forEach(button=>button.onclick=()=>{stackCategory=button.dataset.stackFilter;filterStack()});document.querySelector('#stack-search').addEventListener('input',filterStack);filterStack();
window.addEventListener('neural-wake',requestNetworkFrame);

requestNetworkFrame();





// Inline text fragments leave surrounding whitespace available for neural dragging.
for(const element of document.querySelectorAll('main h1,main h2,main h3,main p,.hero-foot>span,.skills>span')){
if(element.closest('a,button,.project,.project-peek'))continue;
const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT),nodes=[];
while(walker.nextNode())if(walker.currentNode.textContent.trim()&&!walker.currentNode.parentElement.closest('a,button,.text-hit'))nodes.push(walker.currentNode);
for(const node of nodes){const span=document.createElement('span');span.className='text-hit';span.textContent=node.textContent;node.replaceWith(span)}
}






