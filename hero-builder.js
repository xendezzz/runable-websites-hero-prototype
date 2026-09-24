(() => {
  const hero = document.querySelector('.hero');
  const trigger = document.querySelector('#build-website');
  const slot = document.querySelector('#builder-slot');
  const source = document.querySelector('.scene-canvas > .prompt');
  const sceneWindow = hero.querySelector('.scene-window');
  source.setAttribute('role','button');
  source.setAttribute('tabindex','0');
  source.setAttribute('aria-label','Describe your website idea');
  source.setAttribute('aria-controls','hero-builder');
  source.setAttribute('aria-expanded','false');
  const form = document.createElement('form');
  form.id = 'hero-builder';
  form.className = 'hero-builder';
  form.hidden = true;
  form.setAttribute('aria-label', 'Describe your website');
  form.innerHTML = `<button type="button" class="builder-close" aria-label="Close website idea input">×</button><textarea id="website-idea" aria-label="Your website idea" placeholder="Describe the website you want to build…" maxlength="2000" rows="2" required></textarea><div class="builder-actions"><span class="builder-hint" aria-hidden="true">press enter <kbd>↵</kbd></span><button type="submit" class="builder-submit" aria-label="Build website" disabled><img src="assets/hero/submit.svg" alt=""></button></div><p class="builder-status" role="status"></p>`;
  hero.append(form);
  const input = form.querySelector('textarea');
  const submit = form.querySelector('.builder-submit');
  const status = form.querySelector('.builder-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let isOpen = false;
  let transition = null;
  let originalHeight = '';
  let token = 0;
  let sceneTransition = null;
  let closing = false;
  let opener = trigger;
  const timing = {duration:760,easing:'cubic-bezier(.22,.8,.22,1)'};

  function rectInHero(element) {
    const box = element.getBoundingClientRect(), root = hero.getBoundingClientRect();
    return {left:box.left-root.left,top:box.top-root.top,width:box.width,height:box.height};
  }
  function place(rect) {
    Object.assign(form.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});
    // Derive the enlarged surface directly from the animated prompt, including
    // its responsive overrides. Focus must not introduce a different stroke.
    const surface=getComputedStyle(source);
    const scale=rect.width/source.offsetWidth;
    const scaled=value=>value.replace(/(-?\d*\.?\d+)px/g,(_,n)=>(Number(n)*scale)+'px');
    for(const property of ['borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','borderTopLeftRadius','borderTopRightRadius','borderBottomRightRadius','borderBottomLeftRadius','boxShadow'])form.style[property]=scaled(surface[property]);
    form.style.borderColor=surface.borderColor;
    form.style.borderStyle=surface.borderStyle;
    form.style.background=surface.background;
  }
  function layout() {
    fit();
    if(isOpen){
      const scene=hero.querySelector('.scene-window');
      const target=rectInHero(slot);
      scene.style.top=Math.max(parseFloat(scene.style.top),target.top+target.height+18)+'px';
    }
  }
  function settleScene(from) {
    sceneTransition?.cancel();
    if(reduced.matches)return;
    const to=rectInHero(sceneWindow);
    sceneTransition=sceneWindow.animate([
      {transform:`translateY(${from.top-to.top}px)`},
      {transform:'translateY(0)'}
    ],timing);
  }
  async function move(from,to,returning=false) {
    transition?.cancel();
    place(to);
    if(reduced.matches) return;
    const startFrame={transform:`translate(${from.left-to.left}px,${from.top-to.top}px) scale(${from.width/to.width},${from.height/to.height})`,filter:'blur(0px)',opacity:1,offset:0};
    transition = form.animate(returning?[
      {...startFrame,filter:'blur(8px)',opacity:.7},
      {filter:'blur(8px)',opacity:.7,offset:.12},
      {filter:'blur(8px)',opacity:.55,offset:.9},
      {filter:'blur(8px)',opacity:.55,offset:1,transform:'none'}
    ]:[
      startFrame,
      {filter:'blur(7px)',opacity:.86,offset:.25},
      {filter:'blur(0px)',opacity:1,offset:1,transform:'none'}
    ],{...timing,fill:returning?'forwards':'none'});
    try { await transition.finished; } catch {}
  }
  async function open(event) {
    if(isOpen||closing) return;
    opener=event?.currentTarget===source?source:trigger;
    const generation = ++token;
    const start = rectInHero(source);
    const sceneStart = rectInHero(sceneWindow);
    isOpen = true;
    hero.classList.add('is-building');
    source.style.visibility = 'hidden';
    source.setAttribute('aria-expanded','true');
    trigger.hidden = true;
    trigger.setAttribute('aria-expanded','true');
    slot.hidden = false;
    form.hidden = false;
    originalHeight = hero.style.height;
    hero.style.height = (hero.offsetHeight + 100)+'px';
    layout();
    settleScene(sceneStart);
    const movement = move(start,rectInHero(slot));
    input.focus({preventScroll:true});
    await movement;
    if(generation!==token) return;
    place(rectInHero(slot));
  }
  async function close() {
    if(!isOpen) return;
    const generation = ++token;
    const start = rectInHero(form);
    const sceneStart = rectInHero(sceneWindow);
    closing = true;
    isOpen = false;
    input.blur();
    // Blur before changing layout or resizing the form into its destination.
    // Otherwise the first frame exposes the content reflow during the handoff.
    transition?.cancel();
    if(!reduced.matches){
      transition=form.animate([
        {filter:'blur(0px)',opacity:1},
        {filter:'blur(8px)',opacity:.7}
      ],{duration:140,easing:'ease-out',fill:'forwards'});
      try{await transition.finished}catch{}
    }
    slot.hidden = true;
    trigger.hidden = false;
    trigger.disabled = true;
    trigger.setAttribute('aria-expanded','false');
    hero.style.height = originalHeight;
    fit();
    const destination=rectInHero(source);
    settleScene(sceneStart);
    form.style.filter=reduced.matches?'':'blur(8px)';
    await move(start,destination,true);
    if(generation!==token) return;
    form.hidden = true;
    transition?.cancel();
    form.style.filter='';
    source.style.visibility = '';
    source.setAttribute('aria-expanded','false');
    if(!reduced.matches)source.animate([{filter:'blur(8px)',opacity:.55},{filter:'blur(0px)',opacity:1}],{duration:300,easing:'ease-out'});
    hero.classList.remove('is-building');
    trigger.disabled = false;
    closing = false;
    opener.focus({preventScroll:true});
  }
  trigger.addEventListener('click',open);
  source.addEventListener('click',open);
  source.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();open(event)}
  });
  form.querySelector('.builder-close').addEventListener('click',close);
  input.addEventListener('input',()=>{submit.disabled=!input.value.trim();status.textContent=''});
  form.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();close()}
    if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing&&event.target===input){event.preventDefault();if(input.value.trim())form.requestSubmit()}
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const idea=input.value.trim();
    if(!idea)return;
    // The integrating app supplies its real login destination. Preserve the
    // idea for that handoff without inventing an authentication endpoint.
    try{sessionStorage.setItem('runable.websiteIdea',idea)}catch{}
    const loginUrl=hero.dataset.loginUrl;
    if(loginUrl){location.assign(loginUrl);return}
    status.textContent='Your idea is ready. Login will connect here.';
    hero.dispatchEvent(new CustomEvent('website-idea-submit',{bubbles:true,detail:{idea}}));
  });
  addEventListener('resize',()=>{if(isOpen){transition?.cancel();layout();place(rectInHero(slot))}});
})();
