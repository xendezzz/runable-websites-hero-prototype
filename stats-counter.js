(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const formatter=new Intl.NumberFormat('en-US');
  const entries=[...document.querySelectorAll('.trust .metric strong')].map(element=>{
    const finalText=element.textContent.trim();
    const target=Number(finalText.replace(/[^\d]/g,''));
    const suffix=finalText.replace(/[\d,]/g,'');
    const visual=document.createElement('span');
    visual.setAttribute('aria-hidden','true');
    // Override the existing .metric span caption styling for this numeral.
    visual.style.cssText='display:inline;font:inherit;color:inherit;margin:0;letter-spacing:inherit';
    const accessible=document.createElement('span');
    accessible.textContent=finalText;
    accessible.style.cssText='position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap';
    element.replaceChildren(visual,accessible);
    element.style.fontVariantNumeric='tabular-nums';
    visual.textContent=reduced.matches?finalText:'0'+suffix;
    return {element,visual,finalText,target,suffix,frame:0,started:false};
  });
  const finish=entry=>{
    cancelAnimationFrame(entry.frame);
    entry.visual.textContent=entry.finalText;
    entry.started=true;
  };
  const animate=entry=>{
    if(entry.started)return;
    entry.started=true;
    if(reduced.matches){finish(entry);return}
    let start;
    const tick=now=>{
      start??=now;
      const progress=Math.min(1,(now-start)/1700);
      const eased=1-Math.pow(1-progress,3);
      entry.visual.textContent=formatter.format(Math.floor(entry.target*eased))+entry.suffix;
      if(progress<1)entry.frame=requestAnimationFrame(tick);
      else finish(entry);
    };
    entry.frame=requestAnimationFrame(tick);
  };
  const observer=new IntersectionObserver(changes=>{
    changes.forEach(change=>{
      if(!change.isIntersecting||change.intersectionRatio<.6)return;
      const entry=entries.find(entry=>entry.element===change.target);
      animate(entry);
      observer.unobserve(change.target);
    });
  },{threshold:.6});
  entries.forEach(entry=>observer.observe(entry.element));
  reduced.addEventListener('change',()=>{
    if(reduced.matches){entries.forEach(finish);observer.disconnect()}
  });
})();
