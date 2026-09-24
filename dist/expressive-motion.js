(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const running=new Set();
  function animate(element,frames,options){
    if(reduced.matches||document.hidden)return;
    const animation=element.animate(frames,options);running.add(animation);
    animation.finished.catch(()=>{}).finally(()=>running.delete(animation));
  }
  document.querySelectorAll('.faq-question').forEach(button=>button.addEventListener('click',()=>{
    if(button.getAttribute('aria-expanded')!=='true')return;
    animate(button.closest('.faq-item').querySelector('.faq-answer p'),[{opacity:.3,filter:'blur(3px)',translate:'0 6px'},{opacity:1,filter:'blur(0)',translate:'0 0'}],{duration:430,easing:'ease-out'});
  }));
  const scrollTo=(selector)=>document.querySelector(selector)?.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'});
  document.querySelector('.process .inline-cta').addEventListener('click',()=>{scrollTo('.hero');document.querySelector('#build-website').focus({preventScroll:true})});
  document.querySelector('.solutions-intro .inline-cta').addEventListener('click',()=>{scrollTo('#solutions-accordion');document.querySelector('.accordion-item.open .accordion-trigger')?.focus({preventScroll:true})});
  document.querySelector('.features .inline-cta').addEventListener('click',()=>{scrollTo('#feature-track');document.querySelector('#feature-track').focus({preventScroll:true})});
  document.querySelector('.device-intro .inline-cta').addEventListener('click',()=>{scrollTo('.device-grid');document.querySelector('.device-card-mobile .download-actions a').focus({preventScroll:true})});
  document.querySelector('.get-started').textContent='Start building';
  document.querySelector('.footer-build').textContent='Build my website';
  document.querySelectorAll('.pricing-compare').forEach(element=>element.remove());
  const stop=()=>{running.forEach(animation=>animation.cancel());running.clear()};
  reduced.addEventListener('change',()=>{if(reduced.matches)stop()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
})();
