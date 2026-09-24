(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const running=new Set();
 const selector='.page-section .section-heading,.feature-caption h3,.device-caption h3';
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting)return;
  observer.unobserve(entry.target);
  if(reduced.matches||document.hidden)return;
  const letters=[...entry.target.querySelectorAll('.reveal-letter')];
  const step=Math.min(28,1100/Math.max(1,letters.length-1));
  letters.forEach((letter,index)=>{
   const animation=letter.animate([{opacity:0,filter:'blur(8px)',translate:'0 .18em'},{opacity:1,filter:'blur(0)',translate:'0 0'}],{duration:780,delay:index*step,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
   running.add(animation);animation.finished.catch(()=>{}).finally(()=>running.delete(animation));
  });
 }),{threshold:.12,rootMargin:'0px 0px -25px 0px'});
 document.querySelectorAll(selector).forEach(element=>{
  // Keep the original markup and accessible reading order. Animated copies are decorative.
  const original=document.createElement('span');original.className='letter-accessible';
  const visual=document.createElement('span');visual.className='letter-visual';visual.setAttribute('aria-hidden','true');
  while(element.firstChild)original.append(element.firstChild);
  visual.append(...[...original.childNodes].map(node=>node.cloneNode(true)));
  const walker=document.createTreeWalker(visual,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{
   const fragment=document.createDocumentFragment();
   node.textContent.split(/(\s+)/).forEach(word=>{
    if(!word)return;
    if(/^\s+$/.test(word)){fragment.append(document.createTextNode(word));return}
    const group=document.createElement('span');group.className='reveal-word';
    Array.from(word).forEach(character=>{const letter=document.createElement('span');letter.className='reveal-letter';letter.textContent=character;group.append(letter)});fragment.append(group);
   });node.replaceWith(fragment);
  });
  element.append(original,visual);observer.observe(element);
 });
 const stop=()=>{running.forEach(animation=>animation.cancel());running.clear()};
 reduced.addEventListener('change',()=>{if(reduced.matches)stop()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
})();
