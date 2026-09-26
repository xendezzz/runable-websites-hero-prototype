/* Scroll entrances: sampled grains settle into live, accessible DOM content.
   Original implementation inspired by the Sublevel Studio particle reveal. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!CSS.supports('mask-image', 'linear-gradient(black, black)')) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'dither-particles';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  document.body.append(canvas);
  const pending = new Set(), active = new Map();
  let raf = 0, scale = 1;
  // Small reusable ordered-dither tiles: no per-frame bitmap allocation.
  const order = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
  const masks = Array.from({length:17}, (_, step) => {
    const cells = order.map((rank, i) => rank < step
      ? `<rect x="${i%4*3}" y="${Math.floor(i/4)*3}" width="3" height="3" fill="white"/>` : '').join('');
    return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12">${cells}</svg>`)}")`;
  });
  function resize() {
    scale = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(innerWidth * scale);
    canvas.height = Math.round(innerHeight * scale);
    ctx.setTransform(scale,0,0,scale,0,0);
  }
  resize();
  function finish(el) {
    el.classList.remove('dither-pending','dither-entering');
    el.style.removeProperty('--dither-mask');
    pending.delete(el); active.delete(el); observer.unobserve(el);
  }
  function finishAll() {
    [...pending, ...active.keys()].forEach(finish);
    cancelAnimationFrame(raf); raf=0;
    ctx.clearRect(0,0,innerWidth,innerHeight);
  }
  // Rasterise text using actual line positions and same-origin imagery. The
  // original DOM remains the only interactive/accessibility representation.
  function sample(el) {
    const box = el.getBoundingClientRect();
    const factor = Math.min(1, 800/Math.max(1,box.width));
    const plate = document.createElement('canvas');
    plate.width = Math.max(1,Math.ceil(box.width*factor));
    plate.height = Math.max(1,Math.ceil(box.height*factor));
    const paint = plate.getContext('2d', {willReadFrequently:true});
    paint.scale(factor,factor);
    const images = [...el.querySelectorAll('img')];
    if(el.tagName==='IMG') images.unshift(el);
    for(const img of images) {
      if(!img.complete || !img.naturalWidth || getComputedStyle(img).opacity==='0') continue;
      const r=img.getBoundingClientRect();
      try { paint.drawImage(img,r.left-box.left,r.top-box.top,r.width,r.height); } catch {}
    }
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
    const range=document.createRange();
    while(walker.nextNode()) {
      const node=walker.currentNode(), parent=node.parentElement;
      if(!node.textContent.trim() || parent.closest('[aria-hidden="true"],svg,video,script,style')) continue;
      const style=getComputedStyle(parent);
      if(style.display==='none'||style.visibility==='hidden') continue;
      paint.font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      paint.fillStyle=style.color; paint.textBaseline='alphabetic';
      const size=parseFloat(style.fontSize);
      // Each word uses its DOM position, preserving responsive line wrapping.
      for(const match of node.textContent.matchAll(/\S+/g)) {
        range.setStart(node,match.index); range.setEnd(node,match.index+match[0].length);
        const r=range.getBoundingClientRect();
        if(!r.width||!r.height) continue;
        paint.fillText(match[0],r.left-box.left,r.top-box.top+(r.height-size)/2+size*.82);
      }
    }
    let pixels;
    try { pixels=paint.getImageData(0,0,plate.width,plate.height).data; }
    catch { return []; } // Cross-origin media still gets the DOM dither mask.
    const points=[], step=images.length?6:3;
    for(let y=0;y<plate.height;y+=step) for(let x=0;x<plate.width;x+=step) {
      const i=(y*plate.width+x)*4;
      if(pixels[i+3]<70) continue;
      points.push({x:x/factor,y:y/factor,color:`rgb(${pixels[i]} ${pixels[i+1]} ${pixels[i+2]})`,
        dx:(Math.random()-.5)*110,dy:30+Math.random()*100,delay:Math.random()*.22,size:1+Math.random()*1.5});
    }
    const stride=Math.max(1,Math.ceil(points.length/2200));
    return points.filter((_,i)=>i%stride===0);
  }
  function frame(now) {
    raf=0; ctx.clearRect(0,0,innerWidth,innerHeight);
    for(const [el,state] of active) {
      const p=Math.min(1,Math.max(0,(now-state.start)/1250));
      const box=el.getBoundingClientRect();
      if(p>=1||box.bottom<0||box.top>innerHeight+100) {finish(el);continue;}
      const mask=Math.min(16,Math.floor(Math.max(0,(p-.2)/.65)*16));
      if(mask!==state.mask) {el.style.setProperty('--dither-mask',masks[mask]);state.mask=mask;}
      for(const dot of state.points) {
        const t=Math.max(0,Math.min(1,(p-dot.delay)/.7));
        const scatter=Math.pow(1-t,2.5);
        ctx.globalAlpha=Math.min(1,p*7)*Math.max(0,1-Math.max(0,p-.55)/.35)*.85;
        ctx.fillStyle=dot.color;
        ctx.fillRect(box.left+dot.x+dot.dx*scatter,box.top+dot.y+dot.dy*scatter,dot.size,dot.size);
      }
    }
    ctx.globalAlpha=1;
    if(active.size) raf=requestAnimationFrame(frame);
  }
  function enter(el,index) {
    if(!pending.has(el)) return;
    if(reduced.matches||document.hidden) {finish(el);return;}
    try {
      // Keep every reveal; bound expensive particle sampling during busy entrances.
      const points=active.size<5 ? sample(el) : [];
      pending.delete(el); observer.unobserve(el);
      el.classList.replace('dither-pending','dither-entering');
      active.set(el,{points,start:performance.now()+Math.min(index*65,195),mask:-1});
      if(!raf) raf=requestAnimationFrame(frame);
    } catch {finish(el);}
  }
  const observer=new IntersectionObserver(entries=>{
    entries.filter(e=>e.isIntersecting).forEach((entry,i)=>enter(entry.target,i));
  },{threshold:.08,rootMargin:'0px 0px -35px 0px'});
  const selector='.hero .nav,.hero .copy h1,.hero .copy p,.hero .copy .primary,.scene-window,.trust-kicker,.metric,.section-intro .section-heading,.section-intro .section-copy,.section-intro .inline-cta,.process-video,.solution-image,.accordion-trigger,.accordion-body,.feature-card,.device-media,.device-caption,.pricing-top,.price-card,.pricing-links,.sales-strip,.faq .section-heading,.faq-item,.footer-float,.footer-invitation,.footer-top,.footer-column,.footer-brand,.footer-legal,.footer-mantra';
  const candidates=[...document.querySelectorAll(selector)];
  const targets=candidates.filter(el=>!candidates.some(parent=>parent!==el&&parent.contains(el)));
  if(!reduced.matches) targets.forEach(el=>{
    el.dataset.ditherReveal='';pending.add(el);el.classList.add('dither-pending');observer.observe(el);
  });
  document.addEventListener('focusin',event=>{
    for(const el of [...pending,...active.keys()]) if(el.contains(event.target)) finish(el);
  });
  reduced.addEventListener('change',()=>{if(reduced.matches)finishAll();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finishAll();});
  addEventListener('beforeprint',finishAll);
  addEventListener('resize',()=>{resize();for(const el of [...active.keys()])finish(el);});
  addEventListener('pagehide',finishAll);
})();
