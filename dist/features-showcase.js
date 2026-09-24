(() => {
  const section=document.querySelector('#customization');
  const track=document.querySelector('#feature-track');
  const cards=[...track.querySelectorAll('.feature-card')];
  // The supplied filenames do not match the feature shown in these recordings.
  ['select-edit','publish','live-analytics','stripe'].forEach((asset,index)=>{
    const video=cards[index].querySelector('video');
    video.querySelector('source').src='assets/customization/'+asset+'.mp4';
    video.load();
  });
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  section.querySelector('.section-copy').textContent='Make it yours. Understand your audience. Accept payments. Go live—all in one place.';
  let active=-1,pending=0,distance=0,movement=1;
  const compact=()=>innerWidth<=900||innerHeight<700||reduced.matches;
  // Pin the section for one complete journey from the first card to the last.
  // Native page scrolling drives the track; no wheel interception is needed.
  function measure(){
    section.classList.toggle('is-compact',compact());
    if(compact()){
      section.style.removeProperty('height');
      track.style.removeProperty('--feature-shift');
      section.style.removeProperty('--feature-card-width');
    }else{
      const sticky=section.querySelector('.features-sticky');
      const intro=section.querySelector('.section-intro');
      const available=innerHeight-parseFloat(getComputedStyle(sticky).paddingTop)-intro.offsetHeight-parseFloat(getComputedStyle(intro).marginBottom)-40;
      section.style.setProperty('--feature-card-width',Math.max(240,Math.min(innerWidth*.37,available*1042/990/1.025))+'px');
      distance=cards[cards.length-1].offsetLeft-cards[0].offsetLeft;
      movement=Math.max(innerHeight*1.4,distance);
      section.style.height=(innerHeight+movement+innerHeight*.18)+'px';
    }
    schedule();
  }
  function select(index){
    if(index===active)return;
    active=index;
    cards.forEach((card,i)=>card.classList.toggle('is-active',i===index));
  }
  function update(){
    pending=0;
    if(compact()){
      const box=track.getBoundingClientRect(),center=box.left+box.width/2;
      let nearest=0,distance=Infinity;
      cards.forEach((card,i)=>{const r=card.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-center);if(d<distance){nearest=i;distance=d}});
      select(nearest);
    }else{
      const progress=Math.max(0,Math.min(1,-section.getBoundingClientRect().top/movement));
      track.style.setProperty('--feature-shift',(-progress*distance)+'px');
      select(Math.round(progress*(cards.length-1)));
    }
  }
  const schedule=()=>{if(!pending)pending=requestAnimationFrame(update)};
  let drag=null;
  track.addEventListener('pointerdown',event=>{
    if(event.pointerType!=='mouse'||event.button!==0||event.target.closest('button,a'))return;
    drag={x:event.clientX,scroll:track.scrollLeft,page:scrollY};track.setPointerCapture(event.pointerId);track.classList.add('is-dragging');
  });
  track.addEventListener('pointermove',event=>{
    if(!drag)return;const delta=drag.x-event.clientX;
    if(compact())track.scrollLeft=drag.scroll+delta;
    else window.scrollTo({top:Math.max(scrollY+section.getBoundingClientRect().top,Math.min(scrollY+section.getBoundingClientRect().top+movement,drag.page+delta*movement/Math.max(1,distance))),behavior:'instant'});
  });
  const endDrag=()=>{drag=null;track.classList.remove('is-dragging')};
  track.addEventListener('pointerup',endDrag);track.addEventListener('pointercancel',endDrag);track.addEventListener('lostpointercapture',endDrag);
  track.tabIndex=0;
  track.setAttribute('role','region');
  track.setAttribute('aria-label','Website features. Use left and right arrow keys to explore all four cards.');
  track.addEventListener('keydown',event=>{
    if(event.target!==track||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    const index=event.key==='Home'?0:event.key==='End'?cards.length-1:Math.max(0,Math.min(cards.length-1,active+(event.key==='ArrowRight'?1:-1)));
    const behavior=reduced.matches?'instant':'smooth';
    if(compact())track.scrollTo({left:cards[index].offsetLeft-cards[0].offsetLeft,behavior});
    else window.scrollTo({top:scrollY+section.getBoundingClientRect().top+index/(cards.length-1)*movement,behavior});
  });
  addEventListener('scroll',schedule,{passive:true});track.addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',measure,{passive:true});reduced.addEventListener('change',measure);
  addEventListener('load',measure);
  document.fonts.ready.then(measure);
  new ResizeObserver(measure).observe(section.querySelector('.section-intro'));
  measure();
})();
