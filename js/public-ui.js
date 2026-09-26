/* Elite Ballers FC — public UX helpers */
(function(){
  const cleanDigits = v => String(v || '').replace(/\D/g,'');
  const normaliseWhatsApp = raw => {
    let digits = cleanDigits(raw);
    if (digits.startsWith('0')) digits = `234${digits.slice(1)}`;
    return digits.length >= 10 ? digits : '';
  };

  async function settings(){
    if (!window.SB) return {};
    const keys=['club_name','contact_email','whatsapp_number','training_location','coach_name','coach_bio'];
    const requests=keys.map(key=>SB.fetchAll('club_settings',{filters:{key},limit:1}));
    const results=await Promise.all(requests);
    return Object.fromEntries(keys.map((key,i)=>[key,results[i]?.data?.[0]?.value || '']));
  }

  async function initContact(){
    const form=document.getElementById('contactForm');
    const wa=document.getElementById('clubWhatsApp');
    if(!form && !wa && !document.querySelector('.coach-card')) return;

    const s=await settings();
    const number=normaliseWhatsApp(s.whatsapp_number);
    if(wa){
      if(number){
        const message=`Hey Cyrus, I found Elite Ballers FC and I'd like to know more about the team.`;
        wa.href=`https://wa.me/${number}?text=${encodeURIComponent(message)}`;
        wa.removeAttribute('aria-disabled');
      }else{
        wa.classList.add('is-disabled');
        wa.setAttribute('aria-disabled','true');
        wa.addEventListener('click',e=>e.preventDefault());
      }
    }

    const coachName=document.querySelector('.coach-info h3');
    if(coachName && s.coach_name) coachName.textContent=s.coach_name;
    const coachBio=document.querySelector('.coach-bio');
    if(coachBio && s.coach_bio) coachBio.textContent=s.coach_bio;
    const locationEl=document.querySelector('[data-training-location]');
    if(locationEl && s.training_location) locationEl.textContent=s.training_location;

    const coachContact=document.getElementById('coachContact');
    if(coachContact){
      const emailLine=document.getElementById('coachEmailLine');
      const emailValue=document.getElementById('coachEmailValue');
      const locationLine=document.getElementById('coachLocationLine');
      const locationValue=document.getElementById('coachLocationValue');
      let hasAny=false;
      if(s.contact_email){ if(emailValue) emailValue.textContent=s.contact_email; hasAny=true; }
      else if(emailLine) emailLine.hidden=true;
      if(s.training_location){ if(locationValue) locationValue.textContent=s.training_location; hasAny=true; }
      else if(locationLine) locationLine.hidden=true;
      coachContact.hidden=!hasAny;
    }

    if(form){
      form.addEventListener('submit', e=>{
        e.preventDefault();
        const status=document.getElementById('contactFormStatus');
        const name=form.elements.name?.value.trim();
        const email=form.elements.email?.value.trim();
        const subject=form.elements.subject?.value.trim();
        const message=form.elements.message?.value.trim();
        if(!name || !email || !subject || !message){status.textContent='Please complete every field.';return}
        const body=`Hello Elite Ballers FC,\n\nName: ${name}\nEmail: ${email}\n\n${message}`;
        if(number){
          window.open(`https://wa.me/${number}?text=${encodeURIComponent(body)}`,'_blank','noopener');
          status.textContent='Opening WhatsApp…';
          return;
        }
        if(s.contact_email){
          location.href=`mailto:${encodeURIComponent(s.contact_email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          status.textContent='Opening your email app…';
          return;
        }
        status.textContent='Club contact details are not configured yet.';
      });
    }
  }

  function initGalleryLightbox(){
    if(document.getElementById('ebLightbox')) return;
    const overlay=document.createElement('div');
    overlay.id='ebLightbox';
    overlay.innerHTML='<button type="button" aria-label="Close photo">×</button><img alt=""><div></div>';
    document.body.appendChild(overlay);
    const image=overlay.querySelector('img'), caption=overlay.querySelector('div');
    const close=()=>{overlay.classList.remove('open');document.body.classList.remove('eb-lightbox-open');image.src='';};
    overlay.querySelector('button').onclick=close;
    overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    document.addEventListener('click',e=>{
      const item=e.target.closest('.gallery-item');
      if(!item || !item.querySelector('img')) return;
      image.src=item.querySelector('img').src;
      image.alt=item.querySelector('img').alt;
      caption.textContent=item.querySelector('.gallery-overlay span')?.textContent || '';
      overlay.classList.add('open');document.body.classList.add('eb-lightbox-open');
    });
    document.addEventListener('keydown',e=>{
      if(e.key==='Enter'){
        const item=document.activeElement?.closest?.('.gallery-item');
        if(item) item.click();
      }
    });
  }

  function init(){
    initContact().catch(err=>console.warn('[Elite Ballers] contact init:',err));
    initGalleryLightbox();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
