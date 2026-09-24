(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const seen=new WeakSet(),running=new Map();
 const selector='.section-intro .section-copy,.section-intro .inline-cta,.metric,.accordion-trigger,.accordion-body,.feature-card,.device-media,.device-caption p,.price-card,.pricing-top,.pricing-links,.sales-strip,.faq-item,.footer-invitation,.footer-column,.footer-brand,.footer-legal,.footer-mantra';
 function finish(element){const animation=running.get(element);if(animation){animation.cancel();running.delete(element)}}
 function enter(element,delay){
  seen.add(element);observer.unobserve(element);
  if(reduced.matches||document.hidden)return;
  const baseline=getComputedStyle(element);
  const animation=element.animate([
   {opacity:0,filter:'blur(26px)',translate:'0 58px',offset:0},
   {opacity:.55,filter:'blur(10px)',translate:'0 24px',offset:.48},
   {opacity:baseline.opacity,filter:baseline.filter,translate:baseline.translate,offset:1}
  ],{duration:1650,delay,easing:'cubic-bezier(.25,.65,.3,1)',fill:'backwards'});
  running.set(element,animation);
  animation.finished.catch(()=>{}).finally(()=>{if(running.get(element)===animation)running.delete(element)});
 }
 const observer=new IntersectionObserver(entries=>{
  const groups=new Map();
  entries.filter(entry=>entry.isIntersecting&&!seen.has(entry.target)).sort((a,b)=>a.target.compareDocumentPosition(b.target)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1).forEach(entry=>{
   const section=entry.target.closest('.page-section,.floating-footer');const order=groups.get(section)||0;groups.set(section,order+1);enter(entry.target,Math.min(order*190,760));
  });
 },{threshold:.12,rootMargin:'0px 0px -45px 0px'});
 document.querySelectorAll(selector).forEach(element=>observer.observe(element));
 // Collapsed template panels receive their entrance only when actually opened.
 document.querySelectorAll('.accordion-trigger').forEach(trigger=>{
  new MutationObserver(()=>{
   if(trigger.getAttribute('aria-expanded')!=='true')return;
   const body=trigger.closest('.accordion-item').querySelector('.accordion-body');
   if(!seen.has(body))observer.observe(body);
  }).observe(trigger,{attributes:true,attributeFilter:['aria-expanded']});
 });
 // Keyboard interaction should never wait for an entrance to finish.
 document.addEventListener('focusin',event=>{for(const element of running.keys())if(element.contains(event.target))finish(element)});
 reduced.addEventListener('change',()=>{if(reduced.matches)for(const element of running.keys())finish(element)});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)for(const element of running.keys())finish(element)});
})();
