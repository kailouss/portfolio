(() => {
  function mount(container,groups,options){
    const controllers=groups.map((group,groupIndex)=>{
      const section=document.createElement('section');section.className='globe-project-group';
      section.innerHTML=`<div class="globe-group-heading"><h2>${group.title}</h2><span class="meta">${group.projects.length} projects</span></div><div class="globe-track" tabindex="0" role="region" aria-roledescription="carousel" aria-label="${group.title} projects"></div><div class="globe-carousel-controls"><span class="meta globe-carousel-status"></span><div class="globe-carousel-dots"></div><div class="globe-carousel-arrows"><button class="globe-play">Pause</button><button class="globe-prev" aria-label="Previous ${group.title.toLowerCase()} project">←</button><button class="globe-next" aria-label="Next ${group.title.toLowerCase()} project">→</button></div></div>`;
      container.append(section);
      const track=section.querySelector('.globe-track'),cards=[],dots=[],count=group.projects.length;
      let cycle=0,start=0,speed=0,offset=null,target=null,hold=0,active=0,autoplay=true,hovered=false,focused=false,expanded=null,anchor=null;
      let entryTimer,closeTimer,finishTimer,disposed=false,keyboardExpanded=false;
      function cardFor(project,index,copy){
        const card=document.createElement('article');card.className='globe-card';card.dataset.project=index;card.dataset.copy=copy;
        card.innerHTML=`<button class="globe-card-open" aria-label="View ${project.title}"><span class="meta">${project.role.toLowerCase()}</span><strong>${project.mark}</strong></button><div class="globe-card-copy"><h3>${project.title}</h3><div class="globe-card-details" inert><p>${project.description}</p><div class="badges">${project.stack.slice(0,3).map(name=>`<span>${name}</span>`).join('')}</div><div class="globe-card-actions"><button>Details ↗</button><a href="${project.url}" target="_blank" rel="noopener noreferrer">Repository ↗</a></div></div></div>`;
        if(copy!==2){card.setAttribute('aria-hidden','true');card.querySelectorAll('button,a').forEach(control=>control.tabIndex=-1)}
        card.querySelector('.globe-card-open').onclick=()=>options.openProject(project);
        card.querySelector('.globe-card-actions button').onclick=()=>options.openProject(project);
        card.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'&&track.dataset.entranceState==='complete'&&!keyboardExpanded){expand(card)}});
        card.addEventListener('pointerleave',()=>{if(expanded===card&&!keyboardExpanded)collapse()});
        card.addEventListener('focusin',()=>{focused=true;expand(card);keyboardExpanded=!card.matches(':hover')});
        card.addEventListener('focusout',event=>{if(!card.contains(event.relatedTarget)){focused=false;collapse()}});
        return card;
      }
      for(let copy=0;copy<5;copy++)group.projects.forEach((project,index)=>{const card=cardFor(project,index,copy);cards.push(card);track.append(card)});
      group.projects.forEach((project,index)=>{
        const dot=document.createElement('button');dot.setAttribute('aria-label','Show '+project.title);dot.onclick=()=>navigate(index);dots.push(dot);section.querySelector('.globe-carousel-dots').append(dot);
      });
      function status(){
        section.querySelector('.globe-carousel-status').textContent=`${String(active+1).padStart(2,'0')} / ${String(count).padStart(2,'0')}`;
        dots.forEach((dot,index)=>dot.setAttribute('aria-current',String(index===active)));
        section.querySelector('.globe-play').innerHTML=window.GlobeEffects.playIcon(autoplay&&options.motion());
        section.querySelector('.globe-play').setAttribute('aria-label',autoplay&&options.motion()?'Pause '+group.title.toLowerCase()+' scrolling':'Play '+group.title.toLowerCase()+' scrolling');
      }
      function layout(){
        collapse(true);cycle=cards[count].offsetLeft-cards[0].offsetLeft;start=cards[count*2].offsetLeft;
        track.scrollLeft=start;offset=null;status();
      }
      function expand(card){
        if(expanded===card)return;
        collapse(true);clearTimeout(closeTimer);clearTimeout(finishTimer);
        const center=card.offsetLeft-track.scrollLeft+card.offsetWidth/2;
        anchor={card,center,currentCenter:center,start:performance.now()};expanded=card;speed=0;offset=null;target=null;
        card.dataset.expanded='true';card.setAttribute('aria-busy','true');
        finishTimer=setTimeout(()=>{if(expanded===card){card.querySelector('.globe-card-details').inert=false;card.setAttribute('aria-busy','false')}},options.motion()?750:0);
      }
      function collapse(immediate=false){
        if(!expanded)return;
        clearTimeout(finishTimer);clearTimeout(closeTimer);
        const card=expanded;expanded=null;keyboardExpanded=false;delete card.dataset.expanded;card.querySelector('.globe-card-details').inert=true;card.setAttribute('aria-busy','false');
        hold=performance.now()+850;
        if(immediate){anchor=null;return}
        if(anchor){anchor.center=anchor.currentCenter;anchor.start=performance.now()}
        closeTimer=setTimeout(()=>{anchor=null},options.motion()?750:0);
      }
      function navigate(index){
        if(track.dataset.entranceState!=='complete')return;
        collapse(true);active=(index+count)%count;hold=performance.now()+2000;speed=0;offset=null;
        const candidates=cards.filter(card=>+card.dataset.project===active);
        const chosen=candidates.reduce((best,card)=>Math.abs(card.offsetLeft-track.scrollLeft)<Math.abs(best.offsetLeft-track.scrollLeft)?card:best);
        target=chosen.offsetLeft;status();
      }
      section.querySelector('.globe-prev').onclick=()=>navigate(active-1);
      section.querySelector('.globe-next').onclick=()=>navigate(active+1);
      section.querySelector('.globe-play').onclick=()=>{if(!options.motion())options.enableMotion();else autoplay=!autoplay;status()};
      track.addEventListener('keydown',event=>{
        if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();navigate(active+(event.key==='ArrowRight'?1:-1))}
        if(event.key==='Escape'){event.preventDefault();collapse();track.focus({preventScroll:true})}
      });
      section.addEventListener('pointerenter',()=>{hovered=true});section.addEventListener('pointerleave',()=>{hovered=false;if(!keyboardExpanded)collapse()});
      section.addEventListener('focusin',()=>{focused=true});section.addEventListener('focusout',event=>{focused=section.contains(event.relatedTarget)});
      track.addEventListener('pointerdown',()=>{hold=performance.now()+2000;offset=null;target=null},{passive:true});
      track.addEventListener('wheel',()=>{hold=performance.now()+2000;offset=null;target=null},{passive:true});
      track.addEventListener('wheel',event=>{if(expanded?.getAttribute('aria-busy')==='true'&&expanded.contains(event.target))event.preventDefault()},{passive:false});
      track.addEventListener('touchmove',event=>{if(expanded?.getAttribute('aria-busy')==='true'&&expanded.contains(event.target))event.preventDefault()},{passive:false});
      function finishEntry(){
        clearTimeout(entryTimer);track.dataset.entranceState='complete';track.inert=false;
        cards.forEach(card=>{card.classList.remove('globe-card-entering');card.querySelector('h3').classList.remove('globe-title-entering')});
      }
      function enter(){
        if(disposed||track.dataset.entranceState!=='pending')return;
        observer.unobserve(track);
        if(!options.motion()){finishEntry();return}
        const bounds=track.getBoundingClientRect();
        const visible=cards.filter(card=>{const r=card.getBoundingClientRect();return r.right>bounds.left&&r.left<bounds.right});
        if(groupIndex)visible.reverse();
        track.dataset.entranceState='running';
        const heading=section.querySelector('.globe-group-heading');heading.classList.add('scene-entrance');heading.dataset.entrance='up';heading.addEventListener('animationend',()=>heading.classList.remove('scene-entrance'),{once:true});
        window.GlobeEffects.scramble(heading.querySelector('h2'));
        visible.forEach((card,i)=>{card.style.setProperty('--entry-delay',(i*.2)+'s');card.style.setProperty('--card-entry-x',groupIndex?'35px':'-35px');card.classList.add('globe-card-entering');card.querySelector('h3').classList.add('globe-title-entering')});
        entryTimer=setTimeout(finishEntry,850+Math.max(0,visible.length-1)*200);
      }
      const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting))enter()},{threshold:.12,root:document.querySelector('#section-view')});
      track.dataset.entranceState=!options.motion()?'complete':'pending';track.inert=track.dataset.entranceState==='pending';
      layout();if(track.dataset.entranceState==='pending')observer.observe(track);
      function step(dt,time){
        if(disposed||!options.visible())return;
        const bounds=track.getBoundingClientRect(),visible=bounds.bottom>90&&bounds.top<innerHeight-50;
        if(!options.motion()&&track.dataset.entranceState!=='complete')finishEntry();
        curveCards(bounds);
        if(track.dataset.entranceState!=='complete')return;
        if(anchor){
          const half=anchor.card.offsetWidth/2,safeCenter=Math.max(half+12,Math.min(track.clientWidth-half-12,anchor.center));
          const progress=options.motion()?Math.min(1,(time-anchor.start)/650):1,eased=progress*progress*(3-2*progress);
          anchor.currentCenter=anchor.center+(safeCenter-anchor.center)*eased;
          track.scrollLeft=anchor.card.offsetLeft+half-anchor.currentCenter;offset=null;
        }
        if(target!==null){const distance=target-track.scrollLeft;track.scrollLeft=options.motion()?track.scrollLeft+distance*(1-Math.exp(-dt*7)):target;if(Math.abs(distance)<.7||!options.motion())target=null;offset=null}
        else if(!anchor&&cycle){
          const run=autoplay&&options.motion()&&visible&&!hovered&&!focused&&!options.dialogOpen()&&time>hold;
          speed+=( (run?12:0)-speed)*(1-Math.exp(-dt*6));
          if(Math.abs(speed)>.03){if(offset===null)offset=track.scrollLeft;offset+=speed*dt;track.scrollLeft=offset}else offset=null;
          if(!focused&&(track.scrollLeft<start||track.scrollLeft>=start+cycle)){track.scrollLeft=start+((track.scrollLeft-start)%cycle+cycle)%cycle;offset=null}
        }
        curveCards(bounds);
        const closest=cards.reduce((best,card)=>Math.abs(card.offsetLeft-track.scrollLeft)<Math.abs(best.offsetLeft-track.scrollLeft)?card:best);
        const index=+closest.dataset.project;if(target===null&&index!==active){active=index;status()}
        if(expanded&&!visible)collapse(true);
      }
      function curveCards(bounds){
        const center=bounds.left+bounds.width/2;
        cards.forEach(card=>{
          const screenX=bounds.left+card.offsetLeft-track.scrollLeft+card.offsetWidth/2;
          const x=Math.max(-1,Math.min(1,(screenX-center)/(bounds.width/2))),depth=18*(1-x*x);
          card.style.transform=`translateZ(${depth}px) rotateY(${x*6}deg) scale(${1-Math.abs(x)*.025})`;card.dataset.depth=depth.toFixed(2);
        });
      }
      const resize=()=>{if(options.visible())layout()};window.addEventListener('resize',resize);
      function replay(){
        clearTimeout(entryTimer);collapse(true);speed=0;offset=null;target=null;
        cards.forEach(card=>{card.classList.remove('globe-card-entering');card.querySelector('h3').classList.remove('globe-title-entering')});
        section.querySelector('.globe-group-heading').classList.remove('scene-entrance');
        track.dataset.entranceState=options.motion()?'pending':'complete';track.inert=options.motion();
        if(options.motion())observer.observe(track);
      }
      return {step,refresh:status,layout,replay,dispose(){disposed=true;observer.disconnect();clearTimeout(entryTimer);clearTimeout(closeTimer);clearTimeout(finishTimer);window.removeEventListener('resize',resize)}};
    });
    return {step:(dt,time)=>controllers.forEach(controller=>controller.step(dt,time)),refresh:()=>controllers.forEach(controller=>controller.refresh()),layout:()=>controllers.forEach(controller=>controller.layout()),replay:()=>controllers.forEach(controller=>controller.replay()),dispose:()=>controllers.forEach(controller=>controller.dispose())};
  }
  window.GlobeProjectCarousels={mount};
})();

