(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const desktop=matchMedia('(hover:hover) and (pointer:fine) and (min-width:901px)');
 let target=scrollY,frame=0,last=0,expected=scrollY;
 const limit=()=>Math.max(0,document.documentElement.scrollHeight-innerHeight);
 function stop(){cancelAnimationFrame(frame);frame=0;last=0;target=expected=scrollY}
 function tick(time){
  frame=0;
  // An anchor, scrollbar drag or another component may take ownership of scrolling.
  if(Math.abs(scrollY-expected)>3){stop();return}
  target=Math.max(0,Math.min(limit(),target));
  const dt=last?Math.min(50,time-last):16;last=time;
  const next=scrollY+(target-scrollY)*(1-Math.exp(-dt/175));
  window.scrollTo({top:Math.abs(target-next)<.75?target:next,behavior:'instant'});expected=scrollY;
  if(Math.abs(target-scrollY)>.75)frame=requestAnimationFrame(tick);else last=0;
 }
 addEventListener('wheel',event=>{
  if(reduced.matches||!desktop.matches||event.ctrlKey||event.metaKey||event.shiftKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||!event.deltaY||document.querySelector('dialog[open]'))return;
  const node=event.target instanceof Element?event.target:null;
  if(node?.closest('input,textarea,select,[contenteditable=true]'))return;
  // Keep independently scrollable panels native, including the horizontal feature track.
  for(let element=node;element&&element!==document.body;element=element.parentElement){
   const style=getComputedStyle(element);
   if(/auto|scroll/.test(style.overflowY)&&element.scrollHeight>element.clientHeight+2)return;
   if(/auto|scroll/.test(style.overflowX)&&element.scrollWidth>element.clientWidth+2)return;
  }
  event.preventDefault();
  const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1)*.68;
  if(!frame){target=expected=scrollY;last=0}
  if(Math.sign(delta)!==Math.sign(target-scrollY))target=scrollY;
  target=Math.max(0,Math.min(limit(),target+delta));
  if(!frame)frame=requestAnimationFrame(tick);
 },{passive:false});
 addEventListener('pointerdown',stop,{passive:true});
 addEventListener('keydown',event=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ','Tab','Escape'].includes(event.key))stop()});
 addEventListener('resize',stop);addEventListener('hashchange',stop);
 reduced.addEventListener('change',stop);desktop.addEventListener('change',stop);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
})();
