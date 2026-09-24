(() => {
  const section=document.querySelector('.mobile-showcase');
  if(!section)return;
  const grid=section.querySelector('.device-grid');
  const phone=section.querySelector('.device-card-mobile');
  const desktop=section.querySelector('.device-card-desktop');
  section.querySelector('.section-heading').innerHTML='Your website,<br>within reach';
  phone.querySelector('img').src='assets/manage/manage-phone-sharp.png';
  desktop.querySelector('img').src='assets/manage/manage-desktop-figma.svg';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const sticky=section.querySelector('.mobile-sticky');
  let frame=0,base=0,current=0,lastTime=0,travel=1;
  const compact=()=>innerWidth<=900||innerHeight<700;
  function update(time){
    frame=0;
    if(compact()||reduced.matches)return;
    // Growth begins only after the entire fitted stage reaches its pinned position.
    const progress=Math.max(0,Math.min(1,-section.getBoundingClientRect().top/travel));
    const target=progress*progress*(3-2*progress);
    const dt=lastTime?Math.min(64,time-lastTime):16;
    lastTime=time;
    current+=(target-current)*(1-Math.exp(-dt/150));
    if(Math.abs(target-current)<.0001)current=target;
    const scale=1+.5*current;
    grid.style.setProperty('--manage-phone-width',(base*scale)+'px');
    grid.style.setProperty('--manage-phone-scale',scale);
    grid.style.setProperty('--manage-desktop-scale',1-.18*current);
    grid.dataset.phoneScale=scale.toFixed(4);
    if(current!==target)schedule();
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update)}
  function measure(){
    section.classList.toggle('is-compact',compact()||reduced.matches);
    current=0;lastTime=0;
    if(compact()||reduced.matches){
      section.style.removeProperty('height');
      grid.style.removeProperty('width');
      grid.style.removeProperty('--manage-stage-height');
      grid.style.removeProperty('--manage-phone-width');
      grid.style.removeProperty('--manage-panel-height');
      grid.style.removeProperty('--manage-phone-scale');
      grid.style.removeProperty('--manage-desktop-scale');
      grid.dataset.phoneScale='1';
      return;
    }
    const intro=section.querySelector('.device-intro');
    const header=intro.offsetHeight+parseFloat(getComputedStyle(intro).marginBottom);
    // Reserve enough space for both CTAs and the largest device at either endpoint.
    // Bound media by its width as well as viewport height: tall/high-resolution
    // screens must not turn these panels into narrow portrait columns.
    const available=Math.max(160,Math.min(innerHeight-header-48-164,sticky.clientWidth*.4,800));
    const gap=24;
    grid.style.width='100%';
    base=(sticky.clientWidth-gap)*.29;
    grid.style.setProperty('--manage-gap',gap+'px');
    grid.style.setProperty('--manage-panel-height',available+'px');
    grid.style.setProperty('--manage-phone-width',base+'px');
    grid.style.setProperty('--manage-phone-scale','1');
    grid.style.setProperty('--manage-desktop-scale','1');
    grid.dataset.phoneScale='1';
    grid.style.setProperty('--manage-stage-height',(available+164)+'px');
    travel=Math.max(650,innerHeight*.95);
    section.style.height=(innerHeight+travel+innerHeight*.3)+'px';
    schedule();
  }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',measure,{passive:true});
  addEventListener('load',measure);
  reduced.addEventListener('change',measure);
  document.fonts.ready.then(measure);
  measure();
})();
