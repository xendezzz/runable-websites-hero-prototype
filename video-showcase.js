(() => {
  const frame=document.querySelector('#process-video');
  const video=document.querySelector('#process-video-media');
  const play=document.querySelector('#process-center-play');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const poster='assets/process-speaker-poster.png';
  video.poster=poster;
  const cover=document.createElement('img');
  cover.src=poster;cover.alt='Speaker presenting the finished fitness website in Runable';cover.className='demo-cover';cover.loading='lazy';cover.decoding='async';
  frame.append(cover);
  play.setAttribute('aria-label','Watch Runable build a website');
  const dialog=document.createElement('dialog');dialog.className='demo-dialog';dialog.setAttribute('aria-labelledby','demo-title');
  dialog.innerHTML='<div class="demo-dialog-inner"><div class="demo-dialog-header"><span id="demo-title">Watch Runable build a website</span><button class="demo-close" type="button" aria-label="Close video">×</button></div><div class="demo-stage"></div></div>';
  document.body.append(dialog);
  const inner=dialog.querySelector('.demo-dialog-inner'),stage=dialog.querySelector('.demo-stage'),closeButton=dialog.querySelector('.demo-close');
  let placeholder,returnFocus,scrollStyle,closing=false;
  const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
  let tiltFrame=0,tiltRect=null,tiltX=0,tiltY=0;
  function resetTilt(){
    cancelAnimationFrame(tiltFrame);tiltFrame=0;tiltRect=null;
    frame.style.removeProperty('--video-rx');frame.style.removeProperty('--video-ry');
  }
  frame.addEventListener('pointermove',event=>{
    if(dialog.open||reduce.matches||!finePointer.matches||event.pointerType==='touch')return;
    tiltRect??=frame.getBoundingClientRect();
    tiltX=Math.max(-1,Math.min(1,(event.clientX-tiltRect.left)/tiltRect.width*2-1));
    tiltY=Math.max(-1,Math.min(1,(event.clientY-tiltRect.top)/tiltRect.height*2-1));
    if(tiltFrame)return;
    tiltFrame=requestAnimationFrame(()=>{
      tiltFrame=0;
      frame.style.setProperty('--video-rx',(-tiltY*3).toFixed(2)+'deg');
      frame.style.setProperty('--video-ry',(tiltX*4).toFixed(2)+'deg');
    });
  },{passive:true});
  frame.addEventListener('pointerleave',resetTilt);frame.addEventListener('pointercancel',resetTilt);
  addEventListener('resize',resetTilt,{passive:true});addEventListener('scroll',resetTilt,{passive:true});addEventListener('blur',resetTilt);
  reduce.addEventListener('change',resetTilt);finePointer.addEventListener('change',resetTilt);
  async function open(){
    if(dialog.open)return;
    returnFocus=document.activeElement;
    const before=frame.getBoundingClientRect();
    resetTilt();
    placeholder=document.createElement('div');placeholder.style.cssText=`width:100%;aspect-ratio:${before.width}/${before.height}`;
    frame.before(placeholder);stage.append(frame);frame.classList.add('in-demo-dialog');
    scrollStyle=document.body.style.overflow;document.body.style.overflow='hidden';
    dialog.showModal();closeButton.focus({preventScroll:true});
    const after=frame.getBoundingClientRect();
    if(!reduce.matches)frame.animate([{transform:`translate(${before.left-after.left}px,${before.top-after.top}px) scale(${before.width/after.width},${before.height/after.height})`,transformOrigin:'top left'},{transform:'none',transformOrigin:'top left'}],{duration:480,easing:'cubic-bezier(.22,1,.36,1)'});
    showVideoControls(true);
    try{await video.play()}catch{video.controls=true}
  }
  async function close(){
    if(closing||!dialog.open)return;
    closing=true;video.pause();
    if(!reduce.matches){const from=frame.getBoundingClientRect(),to=placeholder.getBoundingClientRect();const animation=frame.animate([{transform:'none',transformOrigin:'top left',filter:'blur(0)'},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width},${to.height/from.height})`,transformOrigin:'top left',filter:'blur(2px)'}],{duration:420,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});try{await animation.finished}catch{}animation.cancel()}
    dialog.close();placeholder.replaceWith(frame);frame.classList.remove('in-demo-dialog','has-inline-playback');video.controls=false;
    document.body.style.overflow=scrollStyle;play.setAttribute('aria-label','Watch Runable build a website');
    if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
    closing=false;
  }
  // Capture the inline launch before existing controls toggle the same video.
  frame.addEventListener('click',event=>{if(!dialog.open&&!event.target.closest('.process-video-controls')){event.preventDefault();event.stopImmediatePropagation();open()}},true);
  frame.addEventListener('keydown',event=>{if(!dialog.open&&!event.target.closest('.process-video-controls')&&(event.key==='Enter'||event.key===' ')){event.preventDefault();event.stopImmediatePropagation();open()}},true);
  video.addEventListener('play',()=>{if(!dialog.open)frame.classList.add('has-inline-playback')});
  closeButton.addEventListener('click',close);
  dialog.addEventListener('cancel',event=>{event.preventDefault();close()});
  dialog.addEventListener('click',event=>{if(event.target===dialog)close()});
})();
