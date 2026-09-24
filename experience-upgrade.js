(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 // Prototype CTAs stay local and inert; real UI controls still work normally.
 document.addEventListener('click',event=>{
  if(event.target.closest('.inline-cta,.get-started,#build-website,.footer-build,.download-actions a,.accordion-link,.template-action')){
   event.preventDefault();event.stopImmediatePropagation();
  }
 },true);
 // Surface existing website-related benefits; preserve every plan entitlement.
 document.querySelectorAll('.price-card').forEach((card,index)=>{
  const lists=[...card.querySelectorAll(':scope > ul')];
  const primary=document.createElement('ul');primary.className='website-benefits';
  ['Websites & app building','Image & video creation','Connect Runable to your apps'].forEach(label=>{
   const item=lists.flatMap(list=>[...list.children]).find(item=>item.textContent.trim()===label);
   if(item)primary.append(item);
  });
  const button=document.createElement('button');button.type='button';button.className='plan-expand';button.textContent='View more';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','plan-extra-'+index);
  const extra=document.createElement('div');extra.className='plan-extra';extra.id='plan-extra-'+index;extra.inert=true;
  const inner=document.createElement('div');
  [...card.children].filter(e=>e.matches('ul,.plan-highlight')).forEach(e=>inner.append(e));extra.append(inner);card.append(primary,button,extra);
  button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));button.textContent=open?'View less':'View more';extra.classList.toggle('is-open',open);extra.inert=!open;});
 });
 // Keep the device preview untouched; only the background reveals its color.
 document.querySelectorAll('.device-media').forEach(media=>{
  const layer=document.createElement('span');layer.className='manage-color-reveal';layer.setAttribute('aria-hidden','true');media.prepend(layer);
  let raf=0,x=50,y=50;
  media.addEventListener('pointermove',e=>{if(!fine.matches||reduced.matches)return;const r=media.getBoundingClientRect();x=(e.clientX-r.left)/r.width*100;y=(e.clientY-r.top)/r.height*100;if(!raf)raf=requestAnimationFrame(()=>{media.style.setProperty('--spot-x',x+'%');media.style.setProperty('--spot-y',y+'%');raf=0})});
  media.addEventListener('pointerleave',()=>{cancelAnimationFrame(raf);raf=0});
 });
 document.querySelectorAll('.billing-toggle button').forEach(button=>button.addEventListener('click',()=>{
  if(reduced.matches)return;document.querySelectorAll('.price strong').forEach(price=>{price.getAnimations().forEach(a=>a.cancel());price.animate([{opacity:.25,filter:'blur(5px)',translate:'0 12px'},{opacity:1,filter:'blur(0)',translate:'0 0'}],{duration:380,easing:'ease-out'})});
 }));
})();
