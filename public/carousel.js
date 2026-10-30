(() => {
  'use strict';
  const config=JSON.parse(document.querySelector('#site-config').textContent);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const dialog=document.querySelector('.video-dialog');
  document.querySelectorAll('[data-carousel]').forEach(carousel=>{
    const slides=[...carousel.querySelectorAll('[data-slide]')];
    const choices=[...carousel.querySelectorAll('[data-carousel-go]')];
    const toggle=carousel.querySelector('[data-carousel-toggle]');
    const stage=carousel.querySelector('.carousel-stage');
    let index=0, paused=reduced.matches, freeze=reduced.matches, hovered=false, focused=false, visible=false, timer;
    const interval=Number(carousel.dataset.interval)||6000;
    carousel.classList.add('is-enhanced');

    function sync() {
      clearTimeout(timer);
      const away=!visible||document.hidden||Boolean(dialog?.open);
      const running=!paused&&!hovered&&!focused&&!away&&!reduced.matches;
      carousel.dataset.running=String(running);
      stage.setAttribute('aria-live',running?'off':'polite');
      toggle.setAttribute('aria-label',paused?config.playSlides:config.pauseSlides);
      toggle.setAttribute('aria-pressed',String(paused));
      toggle.firstElementChild.textContent=paused?'▶':'Ⅱ';
      slides.forEach((slide,i)=>{
        const video=slide.querySelector('[data-carousel-preview]');
        if(!video)return;
        if(i!==index||away||freeze||reduced.matches){video.pause();return;}
        if(video.paused&&!video.dataset.manualControl){video.muted=true;video.play().catch(()=>{});}
      });
      if(running)timer=setTimeout(()=>show(index+1),interval);
    }
    function show(next,manual=false) {
      index=(next+slides.length)%slides.length;
      slides.forEach((slide,i)=>{
        slide.hidden=i!==index;
        const video=slide.querySelector('video');
        if(video&&i!==index){video.pause();video.currentTime=0;delete video.dataset.manualControl;}
      });
      choices.forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.carouselGo)===index)));
      carousel.querySelector('[data-carousel-count]').textContent=`${String(index+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
      if(manual){paused=true;freeze=false;}
      sync();
    }
    carousel.querySelector('[data-carousel-prev]').addEventListener('click',()=>show(index-1,true));
    carousel.querySelector('[data-carousel-next]').addEventListener('click',()=>show(index+1,true));
    choices.forEach(button=>button.addEventListener('click',()=>show(Number(button.dataset.carouselGo),true)));
    toggle.addEventListener('click',()=>{
      paused=!paused;freeze=paused;
      if(!paused)slides[index].querySelector('video')?.removeAttribute('data-manual-control');
      sync();
    });
    carousel.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){hovered=true;sync();}});
    carousel.addEventListener('pointerleave',()=>{hovered=false;sync();});
    carousel.addEventListener('focusin',()=>{focused=true;sync();});
    carousel.addEventListener('focusout',()=>queueMicrotask(()=>{focused=carousel.contains(document.activeElement);sync();}));
    carousel.addEventListener('keydown',event=>{
      // Keep native video controls and unrelated inputs' keyboard behavior.
      if(event.target.closest('video')||!event.target.closest('[data-carousel-go],.carousel-controls'))return;
      if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show(index+(event.key==='ArrowLeft'?-1:1),true);}
    });
    carousel.querySelectorAll('video').forEach(video=>{
      video.addEventListener('pointerdown',()=>{video.dataset.manualControl='true';paused=true;freeze=false;sync();});
      video.addEventListener('keydown',()=>{video.dataset.manualControl='true';paused=true;freeze=false;sync();});
    });
    document.addEventListener('visibilitychange',sync);
    reduced.addEventListener('change',()=>{paused=reduced.matches;freeze=reduced.matches;sync();});
    if(dialog)new MutationObserver(sync).observe(dialog,{attributes:true,attributeFilter:['open']});
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0.15}).observe(carousel);
    show(0);
  });
})();
