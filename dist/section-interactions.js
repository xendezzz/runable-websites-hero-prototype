(() => {
  const items = [...document.querySelectorAll('#solutions-accordion .accordion-item')];
  const visual = document.querySelector('.solution-image');
  const nameOf = item => item.querySelector('.accordion-trigger').textContent.trim();
  function addTemplateAction(container,getItem) {
    const button=document.createElement('button');
    button.type='button';
    button.className='template-action';
    button.textContent='Use template';
    const update=()=>button.setAttribute('aria-label',`Use ${nameOf(getItem())} template`);
    update();
    button.addEventListener('click',()=>{
      // Selection/authentication is supplied by the integrating product.
      const item=getItem();
      button.dispatchEvent(new CustomEvent('use-template',{bubbles:true,detail:{template:nameOf(item),image:item.dataset.image}}));
    });
    container.append(button);
    return update;
  }
  const updateDesktop=addTemplateAction(visual,()=>items.find(item=>item.classList.contains('open'))||items[0]);
  items.forEach(item=>{
    addTemplateAction(item.querySelector('.solution-mobile-image'),()=>item);
    const trigger=item.querySelector('.accordion-trigger');
    // The existing controller already handles hover, focus, click and crossfade.
    // Track its selected category for a specific accessible CTA label.
    const syncCategory=()=>{
      item.querySelector('.accordion-panel').inert=!item.classList.contains('open');
      updateDesktop();
    };
    syncCategory();
    new MutationObserver(syncCategory).observe(trigger,{attributes:true,attributeFilter:['aria-expanded']});
  });

  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
  [visual,...document.querySelectorAll('.solution-mobile-image')].forEach(card=>{
    let frame=0,rect=null,x=0,y=0;
    const reset=()=>{
      cancelAnimationFrame(frame);frame=0;rect=null;
      card.classList.remove('cursor-following');
      card.style.removeProperty('--cursor-rx');card.style.removeProperty('--cursor-ry');
    };
    card.addEventListener('pointermove',event=>{
      if(event.pointerType==='touch'||!finePointer.matches||reduced.matches)return;
      // Keep the neutral rectangle stable so tilt does not feed back into
      // cursor coordinates. Recompute after scrolling or resizing.
      rect ||= card.getBoundingClientRect();
      x=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));
      y=Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1));
      if(frame)return;
      frame=requestAnimationFrame(()=>{
        frame=0;card.classList.add('cursor-following');
        card.style.setProperty('--cursor-rx',(-y*4).toFixed(2)+'deg');
        card.style.setProperty('--cursor-ry',(x*5).toFixed(2)+'deg');
      });
    },{passive:true});
    card.addEventListener('pointerleave',reset);
    card.addEventListener('pointercancel',reset);
    addEventListener('scroll',reset,{passive:true});
    addEventListener('resize',reset,{passive:true});
    addEventListener('blur',reset);
    reduced.addEventListener('change',reset);finePointer.addEventListener('change',reset);
  });
  const states=new Map();
  const visibleThreshold=.3;
  function sync(video,state) {
    const shouldPlay=state.active&&!state.finished&&state.visible&&!document.hidden&&!reduced.matches;
    if(shouldPlay)video.play().catch(()=>{});
    else video.pause();
  }
  document.querySelectorAll('.feature-card').forEach(card=>{
    const video=card.querySelector('video');
    const state={visible:false,active:card.classList.contains('is-active'),finished:false};
    states.set(video,state);
    video.loop=false;
    video.pause();
    video.addEventListener('ended',()=>{state.finished=true});
    new MutationObserver(()=>{
      const active=card.classList.contains('is-active');
      if(active===state.active)return;
      state.active=active;
      if(active){state.finished=false;video.currentTime=0}
      sync(video,state);
    }).observe(card,{attributes:true,attributeFilter:['class']});
  });
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      const video=entry.target.querySelector('video'),state=states.get(video);
      state.visible=entry.isIntersecting&&entry.intersectionRatio>=visibleThreshold;
      sync(video,state);
    });
  },{threshold:[0,visibleThreshold]});
  states.forEach((state,video)=>observer.observe(video.closest('.feature-card')));
  document.addEventListener('visibilitychange',()=>states.forEach((state,video)=>sync(video,state)));
  reduced.addEventListener('change',()=>states.forEach((state,video)=>sync(video,state)));
})();
