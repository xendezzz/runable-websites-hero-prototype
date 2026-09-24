(() => {
  // Connect only destinations that exist in this prototype, never invent routes.
  const destinations={Capabilities:'#customization',Solutions:'#solutions-heading',Resources:'#process-heading',Pricing:'#pricing-heading'};
  document.querySelectorAll('.nav-item').forEach(link=>{
    const destination=destinations[link.textContent.trim()];
    const target=destination&&document.querySelector(destination);
    if(!target)return;
    link.href=destination;
    link.classList.remove('menu');
    link.addEventListener('click',event=>{
      event.preventDefault();
      target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    });
  });
  document.querySelectorAll('.get-started').forEach(control=>{
    // Purchase buttons need real plan/auth destinations, not the generic builder.
    if(control.closest('.price-card'))return;
    control.addEventListener('click',event=>{
      event.preventDefault();
      const trigger=document.querySelector('#build-website');
      document.querySelector('.hero').scrollIntoView({behavior:'instant',block:'start'});
      trigger.focus({preventScroll:true});
    });
  });
  document.querySelectorAll('.logo,.footer-top,.footer-brand-name').forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }));
  const billing=[...document.querySelectorAll('.billing-toggle button')];
  const syncBilling=()=>billing.forEach(button=>button.setAttribute('aria-pressed',String(button.classList.contains('active'))));
  billing.forEach(button=>button.addEventListener('click',syncBilling));syncBilling();
  document.querySelectorAll('.faq-item').forEach((item,index)=>{
    const button=item.querySelector('.faq-question'),answer=item.querySelector('.faq-answer');
    answer.id='faq-answer-'+index;button.setAttribute('aria-controls',answer.id);
    const sync=()=>{answer.inert=button.getAttribute('aria-expanded')!=='true'};
    button.addEventListener('click',sync);sync();
  });
})();
