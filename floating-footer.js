(() => {
 const footer=document.querySelector('.floating-footer'); if(!footer)return;
 const stage=footer.querySelector('.footer-stage'), gallery=footer.querySelector('.footer-templates');
 const assets=["care-hero-v3","sales-hero-v3","finance-hero-v3","hydration-hero-v3","garden-hero-v3","haircare-hero-v3"];
 gallery.replaceChildren(...Array.from({length:12},(_,i)=>{
  const card=document.createElement('div');card.className='footer-float';
  const img=new Image();img.src=`assets/footer/${assets[i%assets.length]}.jpg`;img.alt='';img.width=1600;img.height=900;img.loading='lazy';card.append(img);return card;
 }));
 const cards=[...gallery.children], reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let visible=false,raf=0,last=0,phase=0,target=0,cursor=0,width=stage.clientWidth,hovering=false,speed=1;
 gallery.addEventListener('pointerover',event=>{hovering=event.pointerType!=='touch'&&!!event.target.closest('.footer-float')});
 gallery.addEventListener('pointerleave',()=>{hovering=false});
 gallery.addEventListener('pointerout',event=>{if(!event.relatedTarget?.closest?.('.footer-float'))hovering=false});
 function render(){
  const spacing=Math.max(170,width/5.5),span=spacing*cards.length;
  cards.forEach((card,i)=>{
   const x=((i*spacing+phase+cursor+span/2)%span+span)%span-span/2;
   const d=Math.min(1.4,Math.abs(x)/(width*.52));
   card.style.transform=`translate3d(${x}px,${d*d*Math.min(230,width*.25)}px,0) translateX(-50%) scale(${1-Math.min(.23,d*.18)})`;
   card.style.zIndex=String(Math.round(100-d*50));
   card.style.filter=`blur(${Math.max(0,d-.25)*2.4}px)`;
  });
 }
 function tick(now){raf=0;if(!visible||document.hidden||reduced.matches)return;
  const dt=Math.min(now-(last||now),40);last=now;speed+=((hovering?.12:1)-speed)*(1-Math.exp(-dt/260));phase-=dt*.018*speed;
  cursor+=(target-cursor)*(1-Math.exp(-dt/260));render();raf=requestAnimationFrame(tick);
 }
 function sync(){cancelAnimationFrame(raf);raf=0;last=0;if(reduced.matches){cursor=0;render();}else if(visible&&!document.hidden)raf=requestAnimationFrame(tick);}
 stage.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||reduced.matches)return;const r=stage.getBoundingClientRect();target=((e.clientX-r.left)/width-.5)*width*1;});
 stage.addEventListener('pointerleave',()=>{target=0;});
 new ResizeObserver(()=>{width=stage.clientWidth;render();}).observe(stage);
 new IntersectionObserver(es=>{visible=es[0].isIntersecting;sync();}).observe(footer);
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);render();
 footer.querySelector('.footer-build').addEventListener('click',()=>{const t=document.querySelector('#build-website');if(!t)return;t.scrollIntoView({behavior:'instant',block:'center'});if(t.getAttribute('aria-expanded')!=='true')t.click();});
})();
