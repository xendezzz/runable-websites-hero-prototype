(() => {
 const selector='.inline-cta,.get-started,#build-website,.footer-build,.accordion-link,.template-action,.login,.plan-expand';
 function wrap(control){
  control.classList.add('animated-cta');
  const walker=document.createTreeWalker(control,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walker.nextNode()){const node=walker.currentNode;if(node.textContent.trim()&&!node.parentElement.closest('.cta-label,svg'))nodes.push(node)}
  nodes.forEach(node=>{
   const label=document.createElement('span');label.className='cta-label';
   const text=document.createElement('span');text.className='cta-label-original';text.textContent=node.textContent;
   const echo=document.createElement('span');echo.className='cta-label-echo';echo.textContent=node.textContent;echo.setAttribute('aria-hidden','true');
   label.append(text,echo);node.replaceWith(label);
  });
 }
 document.querySelectorAll(selector).forEach(control=>{
  wrap(control);new MutationObserver(()=>wrap(control)).observe(control,{childList:true,subtree:true});
 });
})();
