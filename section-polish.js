(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
 // Tilt media containers, composing with existing scroll scales instead of replacing them.
 document.querySelectorAll('.feature-card,.device-media').forEach(card=>{
  let raf=0,rect=null,x=0,y=0;
  const reset=()=>{cancelAnimationFrame(raf);raf=0;rect=null;card.style.removeProperty('--media-rx');card.style.removeProperty('--media-ry')};
  card.addEventListener('pointerenter',()=>{rect=card.getBoundingClientRect()});
  card.addEventListener('pointermove',event=>{if(!fine.matches||reduced.matches||event.buttons)return;rect ||= card.getBoundingClientRect();x=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));y=Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1));if(!raf)raf=requestAnimationFrame(()=>{card.style.setProperty('--media-rx',(-y*4.6)+'deg');card.style.setProperty('--media-ry',(x*4.6)+'deg');raf=0})});
  card.addEventListener('pointerleave',reset);card.addEventListener('pointercancel',reset);reduced.addEventListener('change',reset);addEventListener('resize',reset);
 });
 const track=document.querySelector('#feature-track'),section=document.querySelector('#customization');
 const meter=document.createElement('div');meter.className='feature-progress';meter.setAttribute('aria-hidden','true');meter.innerHTML='<span></span>';track.after(meter);
 let scheduled=0;
 function update(){scheduled=0;const cards=[...track.querySelectorAll('.feature-card')];const first=cards[0].getBoundingClientRect(),last=cards.at(-1).getBoundingClientRect();const progress=section.classList.contains('is-compact')?track.scrollLeft/Math.max(1,track.scrollWidth-track.clientWidth):Math.max(0,-parseFloat(getComputedStyle(track).getPropertyValue('--feature-shift')||0))/Math.max(1,last.left-first.left);meter.firstChild.style.transform='scaleX('+(Math.min(1,Math.max(0,progress))*.75+.25)+')';
  const manage=document.querySelector('.mobile-showcase'),r=manage.getBoundingClientRect();manage.style.setProperty('--backdrop-y',reduced.matches?'0px':(Math.max(-1,Math.min(1,r.top/innerHeight))*16)+'px');
 }
 const schedule=()=>{if(!scheduled)scheduled=requestAnimationFrame(update)};addEventListener('scroll',schedule,{passive:true});track.addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);update();
 const toggle=document.querySelector('.billing-toggle');const slider=document.createElement('span');slider.className='billing-slider';slider.setAttribute('aria-hidden','true');toggle.prepend(slider);
 function billing(){const active=toggle.querySelector('button.active');slider.style.width=active.offsetWidth+'px';slider.style.height=active.offsetHeight+'px';slider.style.translate=active.offsetLeft+'px '+active.offsetTop+'px'}
 toggle.querySelectorAll('button').forEach(button=>button.addEventListener('click',billing));new ResizeObserver(billing).observe(toggle);document.fonts.ready.then(billing);billing();
 document.querySelectorAll('.plan-expand').forEach(button=>button.addEventListener('click',()=>{if(reduced.matches||button.getAttribute('aria-expanded')!=='true')return;document.getElementById(button.getAttribute('aria-controls')).querySelectorAll('li,.plan-highlight').forEach((row,i)=>{row.getAnimations().forEach(a=>a.cancel());row.animate([{opacity:0,translate:'0 8px'},{opacity:1,translate:'0 0'}],{duration:340,delay:Math.min(i*35,210),fill:'backwards',easing:'ease-out'})})}));
})();
