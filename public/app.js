(() => {
  'use strict';
  const config = JSON.parse(document.querySelector('#site-config').textContent);
  const es = config.locale === 'es';
  // This adapter never receives names, emails, message text, or other form values.
  const track = (name, props={}) => {
    if (typeof window.plausible === 'function') window.plausible(name, { props: { language:config.locale, ...props } });
  };
  if (config.analyticsDomain && config.analyticsScript) {
    window.plausible = window.plausible || function() { (window.plausible.q=window.plausible.q||[]).push(arguments); };
    const script = document.createElement('script');
    script.src=config.analyticsScript; script.dataset.domain=config.analyticsDomain; script.defer=true;
    document.head.append(script);
  }
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.main-nav');
  const closeMenu=()=>{toggle.setAttribute('aria-expanded','false');nav.classList.remove('open');};
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
  nav.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
  document.querySelectorAll('.language-switch a').forEach(link=>{if(location.hash)link.hash=location.hash;});

  const dialog=document.querySelector('.video-dialog');
  const player=dialog.querySelector('[data-modal-video]');
  let openedBy;
  function setVideo(id, shouldPlay=false) {
    const media=config.videos.find(item=>item.id===id);
    if(!media)return;
    player.pause();
    if(player.getAttribute('src')!==media.source){player.src=media.source;player.poster=media.poster;player.load();}
    player.dataset.videoId=media.id;
    document.querySelector('#video-dialog-title').textContent=media.title[config.locale];
    dialog.querySelectorAll('[data-switch-video]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.switchVideo===id)));
    if(shouldPlay)player.play().catch(()=>{});
  }
  document.querySelectorAll('[data-open-video]').forEach(button=>button.addEventListener('click',()=>{openedBy=button;setVideo(button.dataset.openVideo);dialog.showModal();document.body.classList.add('modal-open');player.play().catch(()=>{});}));
  dialog.querySelector('.modal-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{player.pause();document.body.classList.remove('modal-open');openedBy?.focus();});
  dialog.querySelectorAll('[data-switch-video]').forEach(button=>button.addEventListener('click',()=>setVideo(button.dataset.switchVideo,true)));
  document.querySelectorAll('video').forEach(video=>video.addEventListener('play',()=>{document.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause();});track('Video play',{video:video.dataset.videoId||'field-demo'});}));

  const slides=[...document.querySelectorAll('[data-gallery-slide]')];
  let slideIndex=0;
  const moveSlide=delta=>{slideIndex=(slideIndex+delta+slides.length)%slides.length;slides.forEach((slide,i)=>slide.hidden=i!==slideIndex);document.querySelector('.gallery-count').textContent=`${String(slideIndex+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;};
  document.querySelector('[data-gallery-prev]')?.addEventListener('click',()=>moveSlide(-1));
  document.querySelector('[data-gallery-next]')?.addEventListener('click',()=>moveSlide(1));

  const requestedSolution=new URLSearchParams(location.search).get('solution');
  document.querySelectorAll('.quote-form').forEach(form=>{
    const select=form.elements.solution;
    if(requestedSolution && [...select.options].some(option=>option.value===requestedSolution))select.value=requestedSolution;
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      if(!form.reportValidity())return;
      const status=form.querySelector('.form-status');
      if(!config.formEndpoint){
        status.className='form-status visible';
        if(config.requestEmail.endsWith('.example')){status.textContent=es?'Vista previa completa. Sus datos no se guardaron ni enviaron.':'Preview complete. Your details were not saved or sent.';return;}
        const values=new FormData(form);
        const labels=es?['Nombre','Empresa','Correo','País','Solución','Mensaje']:['Name','Company','Email','Country','Solution','Message'];
        const fields=['name','company','email','country','solution','message'];
        const body=fields.map((key,i)=>`${labels[i]}: ${key==='solution'?select.selectedOptions[0].textContent:values.get(key)}`).join('\n');
        const subject=es?'GETG — Solicitud de cotización o información':'GETG — Quote or solution information request';
        status.textContent=es?'Su borrador está listo. Ábralo y envíelo desde su aplicación de correo. La solicitud aún no se ha enviado.':'Your draft is ready. Open it and send it from your email app. Your request has not been sent yet.';
        const draft=document.createElement('a');draft.className='draft-link';draft.href=`mailto:${config.requestEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        draft.textContent=es?'Abrir borrador de correo →':'Open email draft →';
        status.append(document.createElement('br'),draft);
        return;
      }
      if(form.elements.website.value)return;
      const submit=form.querySelector('[type="submit"]');submit.disabled=true;
      status.textContent=es?'Enviando…':'Sending…';status.className='form-status visible';
      try {
        const response=await fetch(config.formEndpoint,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});
        if(!response.ok)throw new Error('Submission failed');
        status.textContent=es?'Gracias. Su solicitud se envió correctamente.':'Thank you. Your request was sent successfully.';
        track('Quote request submitted',{solution:select.value});form.reset();
      } catch {status.textContent=es?'No se pudo enviar. Inténtelo de nuevo o use el correo de contacto.':'We couldn’t send your request. Please try again or use the contact email.';status.classList.add('error');}
      finally {submit.disabled=false;}
    });
  });
})();
