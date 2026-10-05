/* Meger Engenharia · página de obra (gerada por tools/gerar-paginas.js). Página inicial usa js/app.js. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = navigator.connection || {};
  const SAVE_DATA = !!conn.saveData || /(^|-)2g/.test(conn.effectiveType || '');
  const G = window.gsap, ST = window.ScrollTrigger;
  if (G && ST) G.registerPlugin(ST);

  /* ---------------- Lenis ---------------- */
  let lenis = null;
  if (!RM && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    if (G && ST) {
      lenis.on('scroll', ST.update);
      G.ticker.add(t => lenis.raf(t * 1000));
      G.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollToEl = (el, immediate = false) => {
    if (lenis) lenis.scrollTo(el, { offset: 0, immediate, duration: 1.4, easing: t => 1 - Math.pow(1 - t, 4) });
    else el.scrollIntoView({ behavior: immediate || RM ? 'auto' : 'smooth' });
  };
  const scrollTop = () => { if (lenis) lenis.scrollTo(0, { immediate: true, force: true }); window.scrollTo(0, 0); };

  /* ---------------- Nav: glass + shrink ---------------- */
  const nav = $('#nav');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { nav.classList.toggle('is-compact', window.scrollY > 24); ticking = false; });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- Mobile menu ---------------- */
  const menu = $('#menu'), burger = $('#burger');
  let menuT = 0;
  const openMenu = () => {
    clearTimeout(menuT); menu.hidden = false; document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
    burger.setAttribute('aria-expanded', 'true'); lenis && lenis.stop(); $('#menuClose').focus({ preventScroll: true });
  };
  const closeMenu = () => {
    if (menu.hidden) return;
    menu.classList.remove('is-open'); document.documentElement.style.overflow = '';
    menuT = setTimeout(() => { menu.hidden = true; }, RM ? 0 : 350);
    burger.setAttribute('aria-expanded', 'false'); lenis && lenis.start(); burger.focus({ preventScroll: true });
  };
  menu.addEventListener('keydown', e => { // mantém o foco dentro do menu
    if (e.key !== 'Tab') return;
    const f = $$('a, button', menu), first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  burger.addEventListener('click', openMenu);
  $('#menuClose').addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------------- Vídeos em autoplay (hero, página da obra, prévias dos cards)
     Mudo + playsinline é o que libera o autoplay no iOS e no Chrome. No modo de pouca bateria do iPhone
     o Safari bloqueia o autoplay até o primeiro toque: o vídeo fica invisível (só o poster aparece, sem o
     botão de play nativo) e começa a tocar no primeiro toque ou clique em qualquer lugar da página. ---------------- */
  const primeVideo = v => {
    v.muted = true; v.defaultMuted = true; v.playsInline = true; v.controls = false;
    ['muted', 'playsinline', 'webkit-playsinline', 'disablepictureinpicture', 'disableremoteplayback'].forEach(a => v.setAttribute(a, ''));
    v.addEventListener('playing', () => v.classList.add('is-on'));
  };
  const wantPlay = new Set();
  const tryPlay = v => { wantPlay.add(v); const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  const stopPlay = v => { wantPlay.delete(v); v.pause(); };
  const unlock = () => wantPlay.forEach(v => { if (v.paused) v.play().catch(() => {}); });
  ['touchend', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, unlock, { passive: true, capture: true }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) unlock(); });

  /* ---------------- Nav hover: a dimension line that draws itself under the word ---------------- */
  const sizeUnderlines = () => $$('.nav__links a').forEach(a => {
    const svg = $('.ul', a), w = Math.max(10, Math.round(a.querySelector('span').getBoundingClientRect().width));
    svg.setAttribute('viewBox', `0 0 ${w} 8`); svg.style.width = w + 'px';
    const [l, t1, t2] = svg.children;
    l.setAttribute('d', `M0 4H${w}`); t1.setAttribute('d', 'M0.75 0.5V7.5'); t2.setAttribute('d', `M${w - 0.75} 0.5V7.5`);
    svg.style.setProperty('--len', w);
  });
  sizeUnderlines();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeUnderlines);
  window.addEventListener('resize', sizeUnderlines);

  /* Aviso curto (usado enquanto o portfólio completo não existe) */
  const toastEl = $('#toast');
  let toastT = 0;
  const toast = msg => { toastEl.textContent = msg; toastEl.classList.add('is-in'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-in'), 3200); };

  if ($('#oVideo')) {
  /* Página da obra */
    const oVideo = $('#oVideo'), oVideoBtn = $('#oVideoBtn'), oVideoBar = $('#oVideoBar');
    const VID = { userPaused: false, inView: false };
    primeVideo(oVideo);
    const syncObraVideo = () => {
      if (!oVideo.getAttribute('src')) return;
      if (VID.inView && !VID.userPaused) tryPlay(oVideo); else stopPlay(oVideo);
    };
    new IntersectionObserver(([e]) => { VID.inView = e.isIntersecting; syncObraVideo(); }, { threshold: 0.25 }).observe($('.ovideo__frame'));
    oVideo.addEventListener('loadedmetadata', syncObraVideo);
    oVideo.addEventListener('play', () => { oVideoBtn.classList.remove('is-paused'); oVideoBtn.setAttribute('aria-label', 'Pausar vídeo'); });
    oVideo.addEventListener('pause', () => { oVideoBtn.classList.add('is-paused'); oVideoBtn.setAttribute('aria-label', 'Tocar vídeo'); });
    oVideo.addEventListener('timeupdate', () => { if (oVideo.duration) oVideoBar.style.setProperty('--p', (oVideo.currentTime / oVideo.duration).toFixed(3)); });
    const toggleObraVideo = e => { e.stopPropagation(); if (oVideo.paused) { VID.userPaused = false; tryPlay(oVideo); } else { VID.userPaused = true; stopPlay(oVideo); } };
    oVideoBtn.addEventListener('click', toggleObraVideo);
  }

  /* ---------------- Botão flutuante do WhatsApp (sem preloader nesta página) ---------------- */
  setTimeout(() => { const w = $('#waFloat'); w && w.classList.add('is-in'); }, 600);

  /* ---------------- Âncoras da página (#galeria, #video) com rolagem suave ---------------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = decodeURIComponent(a.getAttribute('href').slice(1)); const el = id && document.getElementById(id);
    if (!el) return;
    e.preventDefault(); closeMenu(); scrollToEl(el);
    try { history.replaceState(null, '', '#' + id); } catch (_) {}
  });
  if (location.hash) { const el = document.getElementById(decodeURIComponent(location.hash.slice(1))); el && requestAnimationFrame(() => scrollToEl(el, true)); }

  /* ---------------- Galeria: filtros por fase ---------------- */
  const filters = $('#ogalFilters');
  filters && filters.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', filters).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    const f = b.dataset.f;
    $$('.ogal__item').forEach(it => it.classList.toggle('is-off', !!f && it.dataset.fase !== f));
    ST && ST.refresh();
  });

  /* ---------------- Lightbox (lê as fotos direto da galeria) ---------------- */
  const lb = $('#lb'), lbImg = $('#lbImg');
  const GAL = { list: [], i: 0 };
  const lbShow = i => {
    const items = GAL.list; if (!items.length) return;
    GAL.i = (i + items.length) % items.length;
    const img = $('img', items[GAL.i]);
    lbImg.classList.add('is-swap');
    const im = new Image(); im.src = img.currentSrc || img.src;
    const put = () => { lbImg.src = im.src; lbImg.alt = img.alt; lbImg.width = img.width; lbImg.height = img.height; lbImg.classList.remove('is-swap'); };
    im.decode ? im.decode().then(put, put) : (im.onload = put);
    $('#lbN').textContent = `${String(GAL.i + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    $('#lbCap').textContent = items[GAL.i].dataset.cap || '';
  };
  const lbOpen = btn => {
    GAL.list = $$('.ogal__item:not(.is-off)');
    lb.classList.toggle('is-single', GAL.list.length < 2);
    lbShow(Math.max(0, GAL.list.indexOf(btn)));
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    lenis && lenis.stop();
  };
  const lbClose = () => { if (lb.open && typeof lb.close === 'function') lb.close(); else lb.removeAttribute('open'); };
  if (lb) {
    lb.addEventListener('close', () => { lenis && lenis.start(); const b = GAL.list[GAL.i]; b && b.focus({ preventScroll: true }); });
    const galEl = $('#ogalGrid');
    galEl && galEl.addEventListener('click', e => { const b = e.target.closest('.ogal__item'); if (b) lbOpen(b); });
    $('#lbClose').addEventListener('click', lbClose);
    $('#lbPrev').addEventListener('click', () => lbShow(GAL.i - 1));
    $('#lbNext').addEventListener('click', () => lbShow(GAL.i + 1));
    lb.addEventListener('click', e => { if (e.target === lb) lbClose(); });
    lb.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') lbShow(GAL.i - 1); else if (e.key === 'ArrowRight') lbShow(GAL.i + 1); });
    let sx = null;
    lb.addEventListener('pointerdown', e => { sx = e.clientX; });
    lb.addEventListener('pointerup', e => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 48) lbShow(GAL.i + (dx < 0 ? 1 : -1)); });
  }

  /* ---------------- Animações de entrada ---------------- */
  if (G && ST && !RM && $('.oh')) {
    const mm = G.matchMedia();
    G.from('.oh__copy > *', { y: 24, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.07, delay: 0.05 });
    G.fromTo('.oh__bg img', { scale: 1.15 }, { scale: 1, duration: 2, ease: 'expo.out' });
    G.from('.oh__spec > div', { y: 16, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06, delay: 0.5 });
    mm.add('(min-width: 768px)', () => {
      G.to('.oh__bg', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.oh', start: 'top top', end: 'bottom top', scrub: true } });
    });
    ST.batch('.escopo__list li', { start: 'top 92%', once: true, onEnter: b => G.from(b, { y: 16, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05 }) });
    ST.batch('.ogal__item', { start: 'top 94%', once: true, onEnter: b => G.from(b, { y: 32, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }) });
    if ($('#video')) G.from('.ovideo__frame', { scale: 0.92, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '#video', start: 'top 75%', once: true } });
    window.addEventListener('load', () => ST.refresh());
  }
})();
