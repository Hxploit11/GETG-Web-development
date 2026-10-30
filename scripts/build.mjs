import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { content } from '../src/content.mjs';
import { videosForLocale, solutionVideos, animatedVideos } from '../src/media.mjs';
import { editorial } from '../src/editorial.mjs';
import { solutionPage, fieldGallery, aboutPage } from '../src/components.mjs';
const copy=Object.fromEntries(Object.entries(content).map(([locale,c])=>[locale,{...c,...editorial[locale]}]));

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
const origin = (process.env.SITE_URL || 'https://getg.com').replace(/\/$/, '');
if (!/^https?:\/\//.test(origin)) throw new Error('SITE_URL must be an absolute HTTP(S) URL.');
const config = {
  formEndpoint: process.env.FORM_ENDPOINT || '',
  contactEmail: process.env.CONTACT_EMAIL || 'team@getg.com',
  requestEmail: process.env.REQUEST_EMAIL || 'tom@sterlingbrandcleaners.com',
  analyticsDomain: process.env.PLAUSIBLE_DOMAIN || '',
  analyticsScript: process.env.PLAUSIBLE_SCRIPT_URL || '',
};
for (const key of ['formEndpoint', 'analyticsScript']) {
  if (config[key] && !config[key].startsWith('https://')) throw new Error(`${key} must use HTTPS.`);
}
const indexable = process.env.SITE_INDEXABLE === 'true';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const routes = { en: {home:'',about:'who-we-are/',solutions:'solutions/',field:'in-the-field/',privacy:'privacy/'}, es: {home:'',about:'quienes-somos/',solutions:'soluciones/',field:'en-campo/',privacy:'privacidad/'} };
const url = (lang, page='home') => `/${lang}/${routes[lang][page]}`;
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg>';
const play = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m9 5 11 7-11 7z"/></svg>';
const chat = '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M24 13a10 10 0 0 1-14 9l-6 2 1-6A10 10 0 1 1 24 13Z"/><path d="M9 12h10M9 16h7"/></svg>';
const logo = (className='') => `<img class="brand-logo ${className}" src="/assets/logo.png" width="660" height="220" alt="GETG — Green Earth Technologies Global">`;
const button = (href, text, cls='primary') => `<a class="button ${cls}" href="${href}">${text}${arrow}</a>`;

function header(c, page) {
  return `<a class="skip-link" href="#main">${c.skip}</a><header class="site-header"><div class="container header-inner"><a href="${url(c.locale)}" class="brand" aria-label="GETG ${c.home}">${logo()}</a><button class="menu-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="${c.menu}"><span></span><span></span></button><nav id="main-nav" class="main-nav" aria-label="${c.locale==='es'?'Navegación principal':'Main navigation'}"><a ${page==='about'?'aria-current="page"':''} href="${url(c.locale,'about')}">${c.about}</a><a ${page==='solutions'?'aria-current="page"':''} href="${url(c.locale,'solutions')}">${c.solutions}<span class="chevron">⌄</span></a><a ${page==='field'?'aria-current="page"':''} href="${url(c.locale,'field')}">${c.field}<span class="chevron">⌄</span></a><div class="language-switch" aria-label="Language"><a href="${url('en',page)}" lang="en" ${c.locale==='en'?'aria-current="true"':''}>EN</a><span>/</span><a href="${url('es',page)}" lang="es" ${c.locale==='es'?'aria-current="true"':''}>ES</a></div>${button(`${url(c.locale)}#request`,c.quote)}</nav></div></header>`;
}
function footer(c) {
  return `<footer class="site-footer"><div class="container footer-inner"><a href="${url(c.locale)}" aria-label="GETG ${c.home}">${logo('footer-logo')}</a><div class="footer-links"><a href="${url(c.locale,'about')}">${c.about}</a><a href="${url(c.locale,'solutions')}">${c.solutions}</a><a href="${url(c.locale,'field')}">${c.field}</a><a href="${url(c.locale,'privacy')}">${c.privacy}</a></div><p>© ${new Date().getUTCFullYear()} GETG<br><span>${c.footerNote}</span></p></div></footer>`;
}
function form(c, interest='') {
  return `<section class="request-section" id="request"><div class="container request-layout"><div class="request-copy"><p class="eyebrow">${c.requestLabel}</p><h2>${c.request1}<br><em>${c.request2}</em></h2><p>${c.requestText}</p><div class="request-landscape" aria-hidden="true"></div></div><div class="form-panel"><form class="quote-form" data-demo="${!config.formEndpoint}"><div class="form-grid"><label>${c.name}<input name="name" autocomplete="name" placeholder="${c.nameHint}" required maxlength="120"></label><label>${c.company}<input name="company" autocomplete="organization" placeholder="${c.companyHint}" required maxlength="160"></label><label>${c.email}<input type="email" name="email" autocomplete="email" placeholder="${c.emailHint}" required maxlength="254"></label><label>${c.country}<select name="country" autocomplete="country-name" required><option value="">${c.countryHint}</option>${c.countries.map(v=>`<option>${esc(v)}</option>`).join('')}</select></label><label class="full">${c.interest}<select name="solution" required><option value="">${c.interestHint}</option>${c.areas.map(a=>`<option value="${a.id}" ${interest===a.id?'selected':''}>${a.title}</option>`).join('')}<option value="other">${c.locale==='es'?'Otra consulta':'General inquiry'}</option></select></label><label class="full">${c.message}<textarea name="message" rows="3" placeholder="${c.messageHint}" required minlength="10" maxlength="3000"></textarea></label></div><div class="honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div><label class="privacy-check"><input type="checkbox" name="privacy" required><span>${c.privacyCheck} <a href="${url(c.locale,'privacy')}">${c.privacy}</a>.</span></label><button class="button primary form-submit" type="submit">${config.formEndpoint?c.sendLive:c.send}${arrow}</button><p class="form-status" role="status" aria-live="polite"></p>${config.formEndpoint?'':`<p class="demo-note"><span></span>${c.demoNote}</p>`}</form><div class="contact-block"><span class="contact-icon">${chat}</span><div><h3>${c.contact}</h3><p>${c.contactText}</p>${config.contactEmail.endsWith('.example')?`<span class="contact-email">${esc(config.contactEmail)}</span><small>${c.emailPlaceholder}</small>`:`<a class="contact-email" href="mailto:${esc(config.contactEmail)}">${esc(config.contactEmail)}</a>`}</div></div></div></div></section>`;
}
function videoCards(c) {
  return `<div class="video-grid">${videosForLocale(c.locale).map((v,i)=>`<article class="video-card"><div class="video-frame"><video id="${v.id}" controls playsinline preload="none" poster="${v.poster}" aria-label="${esc(v.title[c.locale])}" data-video-id="${v.id}"><source src="${v.source}" type="video/mp4">${v.captions.map(track=>`<track kind="captions" src="${esc(track.src)}" srclang="${esc(track.language)}" label="${esc(track.label)}">`).join('')}<a href="${v.source}">${c.play}</a></video></div><div class="video-caption"><span class="index">0${i+1}</span><div><h3>${v.title[c.locale]}</h3><p>${v.description[c.locale]}</p></div></div></article>`).join('')}</div>`;
}
function demoSection(c) {
  return `<section class="section demos" id="demonstrations"><div class="container"><div class="section-heading"><div><p class="eyebrow">${c.demoLabel}</p><h2>${c.fieldDemoTitle}</h2></div><p>${c.fieldDemoIntro}</p></div>${videoCards(c)}<p class="media-note">${c.transcriptNote}</p></div></section>`;
}
function home(c) {
  return `<section class="hero"><img class="hero-image" src="/assets/hero.jpg" alt="${c.locale==='es'?'Imagen conceptual de un camión GETG al atardecer':'Concept image of a GETG tanker arriving at sunset'}" width="1774" height="887" fetchpriority="high"><div class="hero-shade"></div><div class="container hero-inner"><p class="eyebrow">${c.eyebrow}</p><h1>${c.hero1}<br><em>${c.hero2}</em></h1><p class="hero-description">${c.heroText}</p><div class="hero-actions">${button('#request',c.quote)}<button class="button outline" data-open-video="solution-03"><span class="play-small">${play}</span>${c.watch}</button></div></div><span class="hero-credit">${c.imageNote}</span></section><section class="section home-solutions"><div class="container"><div class="section-heading"><div><p class="eyebrow">${c.sectionLabel}</p><h2>${c.sectionTitle} <em>${c.sectionAccent}</em></h2></div><p>${c.sectionText}</p></div><div class="feature-grid"><a class="feature-card" href="${url(c.locale,'solutions')}"><div class="feature-image"><img src="/assets/drums.jpg" alt="${c.areas[1].alt}" width="1536" height="1024" loading="lazy"><span class="image-tag">${c.imageNote}</span><span class="image-action">${arrow}</span></div><h3><span></span>${c.detail}</h3><p>${c.detailText}</p></a><button class="feature-card" data-open-video="field-01"><div class="feature-image"><img src="/assets/field.jpg" alt="${c.areas[2].alt}" width="1536" height="1024" loading="lazy"><span class="image-tag">${c.imageNote}</span><span class="play-large">${play}</span></div><h3><span></span>${c.demo}</h3><p>${c.demoText}</p></button></div><div class="solution-links">${c.areas.map(a=>`<a href="${url(c.locale,'solutions')}#${a.id}">${a.title}${arrow}</a>`).join('')}</div></div></section>${form(c)}`;
}
function solutions(c) { return solutionPage(c,button,url); }
function about(c) { return aboutPage(c,button,url); }
function field(c) {
  return `<section class="page-hero compact"><div class="container"><p class="eyebrow">${c.field}</p><h1>${c.fieldTitle1} <em>${c.fieldTitle2}</em></h1><p>${c.fieldIntro}</p></div></section>${demoSection(c)}${fieldGallery(c)}${form(c)}`;
}
function privacy(c) {
  return `<section class="section privacy-page"><div class="container prose"><p class="eyebrow">GETG</p><h1>${c.privacyTitle}</h1><p>${c.privacyIntro}</p>${c.privacySections.map(([title,text])=>`<h2>${title}</h2><p>${text}</p>`).join('')}${config.formEndpoint||config.analyticsDomain?'<p><strong>Configuration changed: review and update this notice before enabling public access.</strong></p>':''}${button(url(c.locale),c.back,'outline')}</div></section>`;
}
function modal(c) {
  const v = animatedVideos[0];
  return `<dialog class="video-dialog" aria-labelledby="video-dialog-title"><div class="dialog-heading"><div><p class="eyebrow">${c.videoLabel}</p><h2 id="video-dialog-title">${v?.title[c.locale]||c.demo}</h2></div><button class="circle-button modal-close" aria-label="${c.close}">×</button></div><video controls playsinline preload="none" poster="${v?.poster||'/assets/real-tanker.jpg'}" data-modal-video><source src="${v?.source||''}" type="video/mp4"></video><p class="media-note" data-modal-note>${c.animationNote}</p><div class="dialog-links">${videosForLocale(c.locale,solutionVideos).map((entry,i)=>`<button data-switch-video="${entry.id}">${String(i+1).padStart(2,'0')} · ${entry.title[c.locale]}</button>`).join('')}</div></dialog>`;
}
function document(c, page, body) {
  const title = page==='home'?`GETG | ${c.footer}`:`${c[page==='field'?'field':page]} | GETG`;
  const description = page==='about'?c.aboutIntro:page==='solutions'?c.solutionIntro:page==='field'?c.fieldIntro:c.heroText;
  const data = JSON.stringify({ ...config, locale:c.locale, videos:videosForLocale(c.locale,solutionVideos), animationNote:c.animationNote, transcriptNote:c.transcriptNote, pauseSlides:c.pauseSlides, playSlides:c.playSlides }).replace(/</g,'\\u003c');
  return `<!doctype html><html lang="${c.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#071b16"><meta name="robots" content="${indexable?'index,follow':'noindex,nofollow'}"><link rel="canonical" href="${origin}${url(c.locale,page)}"><link rel="alternate" hreflang="en" href="${origin}${url('en',page)}"><link rel="alternate" hreflang="es" href="${origin}${url('es',page)}"><link rel="alternate" hreflang="x-default" href="${origin}${url('en',page)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${origin}${url(c.locale,page)}"><meta property="og:image" content="${origin}/assets/hero.jpg"><meta property="og:locale" content="${c.locale==='en'?'en_US':'es_419'}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/styles.css"><script id="site-config" type="application/json">${data}</script><script src="/app.js" defer></script><script src="/carousel.js" defer></script></head><body data-page="${page}">${header(c,page)}<main id="main">${body}</main>${footer(c)}${modal(c)}</body></html>`;
}

await mkdir(out, { recursive:true });
await cp(path.join(root,'public'), out, { recursive:true });
const pages = {home,about,solutions,field,privacy};
for (const c of Object.values(copy)) {
  for (const [page,render] of Object.entries(pages)) {
    const destination = path.join(out,url(c.locale,page));
    await mkdir(destination,{recursive:true});
    await writeFile(path.join(destination,'index.html'),document(c,page,render(c)));
  }
}
await writeFile(path.join(out,'index.html'),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/en/"><title>GETG — Green Earth Technologies Global</title><meta name="robots" content="noindex"><link rel="canonical" href="'+origin+'/en/"></head><body><a href="/en/">English</a> · <a href="/es/">Español</a></body></html>');
await writeFile(path.join(out,'404.html'),document(copy.en,'home',`<section class="section"><div class="container prose"><p class="eyebrow">404</p><h1>${content.en.notFound}</h1>${button('/en/',content.en.back)}</div></section>`));
await writeFile(path.join(out,'robots.txt'),indexable?`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`:'User-agent: *\nDisallow: /\n');
await writeFile(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+Object.keys(content).flatMap(lang=>Object.keys(pages).map(page=>`<url><loc>${origin}${url(lang,page)}</loc></url>`)).join('')+'</urlset>');
for (const video of animatedVideos) {
  for (const track of video.captions) {
    const text='WEBVTT\n\n'+video.steps[track.language].map((step,i)=>`00:00:0${i*2}.000 --> 00:00:0${(i+1)*2}.000\n${step}\n`).join('\n');
    await writeFile(path.join(out,track.src),text);
  }
}
console.log(`Built ${Object.keys(pages).length*2} localized pages in dist/. Forms: ${config.formEndpoint?'service endpoint':config.requestEmail.endsWith('.example')?'demo':'email draft'}. Search indexing: ${indexable?'enabled':'disabled'}.`);
