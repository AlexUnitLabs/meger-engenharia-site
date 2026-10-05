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

  /* ---------------- Preloader: the grey half of the Meger symbol is a window into the hero video.
     The orange half fills as the page loads; at 100% we fly through the window into the hero. ---------------- */
  const pl = $('#pl'), docEl = document.documentElement;
  const PL = { done: false, queue: [] };
  const whenLoaded = fn => (PL.done ? fn() : PL.queue.push(fn));
  const releasePl = () => { if (PL.done) return; PL.done = true; docEl.classList.remove('is-loading'); PL.queue.splice(0).forEach(fn => fn()); };
  docEl.classList.add('is-loading');
  lenis && lenis.stop();
  const PL_STAGES = [[0, 'Projeto'], [30, 'Fundação'], [55, 'Estrutura'], [80, 'Acabamento'], [100, 'Entrega']];
  const plPct = $('#plPct'), plStage = $('#plStage'), plBar = $('#plBar'), plRect = $('#plRect');
  const plSvg = $('#plPlate'), plZoom = $('#plZoom'), plLogo = $('#plLogo');
  const outline = $$('.pl__outline path');
  outline.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.dataset.len = L; });
  // logo geometry on screen
  const LW = 346.24, LH = 356.23, P0 = [92.6, 300]; // zoom point: inside the left column (a window)
  const PZ = { k: 1, lx: 0, ly: 0, W: 1, H: 1, m: 0 };
  // the plate is one even-odd path: a big rectangle with the two grey pieces of the symbol cut out
  const GREY = ['M76.04 197.65L109.17 223.18V355.96H0V135.98L172.85 0V38.07L55.54 129.3L109.53 170.38L109.63 212.66L30.2 151.26V321H76.04V197.65Z', 'M117.55 176.14L172.85 218.36L270.28 147.18V186.07L172.85 260.48L117.55 217.27V176.14Z'];
  const plCut = $('#plCut');
  const placePath = (d, k, ox, oy) => { let x = 0, y = 0, out = ''; d.replace(/([MLHVZ])([^MLHVZ]*)/g, (_, c, a) => { const n = a.trim().split(/[\s,]+/).filter(Boolean).map(Number); if (c === 'M' || c === 'L') { x = n[0]; y = n[1]; } else if (c === 'H') x = n[0]; else if (c === 'V') y = n[0]; out += c === 'Z' ? 'Z' : `${c === 'M' ? 'M' : 'L'}${(ox + x * k).toFixed(2)} ${(oy + y * k).toFixed(2)}`; }); return out; };
  const plRender = () => {
    plLogo.setAttribute('transform', `matrix(${PZ.k} 0 0 ${PZ.k} ${PZ.lx} ${PZ.ly})`);
    const px = PZ.lx + P0[0] * PZ.k, py = PZ.ly + P0[1] * PZ.k;
    const sc = Math.pow(80, PZ.m), e = PZ.m * PZ.m * (3 - 2 * PZ.m);
    plZoom.setAttribute('transform', `translate(${px + (PZ.W / 2 - px) * e} ${py + (PZ.H / 2 - py) * e}) scale(${sc}) translate(${-px} ${-py})`);
  };
  const plLayout = () => {
    PZ.W = innerWidth; PZ.H = innerHeight;
    plSvg.setAttribute('viewBox', `0 0 ${PZ.W} ${PZ.H}`);
    const small = PZ.W < 768;
    const h = small ? Math.min(PZ.H * 0.3, PZ.W * 0.62) : Math.max(180, Math.min(PZ.H * 0.38, 360));
    PZ.k = h / LH; PZ.lx = (PZ.W - LW * PZ.k) / 2; PZ.ly = PZ.H * (small ? 0.4 : 0.42) - h / 2;
    const W = PZ.W, H = PZ.H;
    plCut.setAttribute('d', `M${-W} ${-H}H${2 * W}V${2 * H}H${-W}Z`); // placa sólida: nada da hero aparece por trás do preloader
    plRender();
  };
  if (G && !RM) G.set('.hero__media', { scale: 1.22 });
  plLayout();
  window.addEventListener('resize', () => { if (pl.isConnected) plLayout(); });

  const TASKS = ['fonts', 'img', 'load', 'video'], seen = new Set(), t0pl = performance.now();
  const mark = k => seen.add(k);
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => mark('fonts'));
  const heroImg = $('.hero__media img');
  if (heroImg.complete) mark('img'); else { heroImg.addEventListener('load', () => mark('img')); heroImg.addEventListener('error', () => mark('img')); }
  if (document.readyState === 'complete') mark('load'); else window.addEventListener('load', () => mark('load'));
  setTimeout(() => TASKS.forEach(mark), 6000); // never hold the visitor longer than this
  let shown = 0;
  const plTick = now => {
    const real = TASKS.filter(t => seen.has(t)).length / TASKS.length * 100;
    const cap = Math.min(100, (now - t0pl) / (RM ? 300 : 1600) * 100);
    const crawl = (now - t0pl) / 1000 * 4; // enquanto o vídeo baixa, o número continua andando devagar em vez de parar
    const target = Math.min(real === 100 ? 100 : Math.min(real + 10 + crawl, 96), cap);
    shown += (target - shown) * 0.12;
    if (target === 100 && 100 - shown < 1.2) shown = 100;
    const v = Math.floor(shown);
    plPct.textContent = v;
    plBar.style.transform = `scaleX(${(shown / 100).toFixed(4)})`;
    const d = Math.min(1, shown / 30);
    outline.forEach(p => (p.style.strokeDashoffset = p.dataset.len * (1 - d)));
    plRect.setAttribute('y', (363 - 369 * Math.max(0, (shown - 10) / 90)).toFixed(2));
    let st = PL_STAGES[0][1]; PL_STAGES.forEach(([p, n]) => { if (v >= p) st = n; });
    if (plStage.textContent !== st) plStage.textContent = st;
    if (shown >= 100) finishPl(); else requestAnimationFrame(plTick);
  };
  requestAnimationFrame(plTick);
  function finishPl() {
    let ended = false;
    const end = () => { if (ended) return; ended = true; pl.remove(); lenis && lenis.start(); releasePl(); ST && ST.refresh(); };
    if (!G || RM) { pl.style.transition = 'opacity .35s'; pl.style.opacity = 0; setTimeout(end, 350); return; }
    setTimeout(end, 3200); // garantia: mesmo que a animação trave (aba em segundo plano, aparelho lento), o preloader sai
    G.timeline({ delay: 0.15 })
      .to('.pl__top, .pl__bottom', { opacity: 0, y: 12, duration: 0.4, ease: 'power2.in' })
      .to('#plLogo', { opacity: 0, duration: 0.45, ease: 'power2.in' }, '-=0.2')
      .add(() => { pl.style.pointerEvents = 'none'; PL.opening = true; syncVideo(); }) // o vídeo começa junto com a abertura (o poster é o 1º quadro, sem salto)
      .to(pl, { autoAlpha: 0, duration: 0.6, ease: 'power1.out' })
      .to('.hero__media', { scale: 1, duration: 1.6, ease: 'power3.out' }, '<')
      .add(end, '<+0.6');
  }

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

  /* ---------------- Hero video: desktop or mobile cut, first frame counts for the preloader. ---------------- */
  const video = $('#heroVideo');
  primeVideo(video);
  const useVideo = !/(^|-)2g/.test(conn.effectiveType || '');
  let heroIn = true;
  const syncVideo = () => {
    if (!useVideo) return;
    if (heroIn && (PL.done || PL.opening)) tryPlay(video); else stopPlay(video); // só quando a página começa a abrir
  };
  if (!useVideo) mark('video');
  else {
    const mob = matchMedia('(max-width: 767px)').matches;
    video.src = mob ? 'media/hero-mobile.mp4' : 'media/hero-desktop.mp4';
    video.addEventListener('loadeddata', () => mark('video'), { once: true });
    video.addEventListener('error', () => mark('video'), { once: true });
    video.addEventListener('playing', () => video.classList.add('is-on'), { once: true });
  }
  new IntersectionObserver(([e]) => { heroIn = e.isIntersecting; syncVideo(); }).observe($('#hero'));
  if (useVideo) { video.addEventListener('loadedmetadata', syncVideo, { once: true }); whenLoaded(syncVideo); }

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

  /* ---------------- Bars grow when they enter the screen (visible at rest without JS) ---------------- */
  if (!RM && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.style.setProperty('--s', 1); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
    $$('.mini-bar').forEach(el => { el.style.setProperty('--s', 0); io.observe(el); });
  }

  /* ---------------- FAQ: one question open at a time, height animated with CSS grid rows ---------------- */
  $$('.qa__q').forEach(btn => btn.addEventListener('click', () => {
    const item = btn.closest('.qa'), open = !item.classList.contains('is-open');
    $$('.qa.is-open').forEach(o => { if (o !== item) { o.classList.remove('is-open'); $('.qa__q', o).setAttribute('aria-expanded', 'false'); } });
    item.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  }));

  /* ---------------- Floating WhatsApp: appears after the preloader ---------------- */
  whenLoaded(() => setTimeout(() => $('#waFloat').classList.add('is-in'), 900));

  /* ---------------- Spotlight cards ---------------- */
  $$('.spot').forEach(el => el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  /* ---------------- Copy buttons ---------------- */
  $$('[data-copy]').forEach(b => b.addEventListener('click', () => {
    const done = () => { b.textContent = 'Copiado'; setTimeout(() => (b.textContent = 'Copiar'), 1600); };
    try { navigator.clipboard.writeText(b.dataset.copy).then(done, () => (b.textContent = b.dataset.copy)); }
    catch { b.textContent = b.dataset.copy; }
  }));

  /* ---------------- Simulator ---------------- */
  const area = $('#simArea'), out = $('#simOut'), m2 = $('#simM2'), aOut = $('#simAreaOut');
  const brl = v => v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  const money = v => v >= 1e6 ? `R$ ${(v / 1e6).toFixed(2).replace('.', ',')} mi` : `R$ ${Math.round(v / 5000) * 5} mil`;
  const simState = { lo: 0, hi: 0 };
  const renderSim = () => { out.textContent = `${money(simState.lo)} a ${money(simState.hi)}`; };
  const calc = (animate = true) => {
    const a = +area.value, c = +$('input[name=padrao]:checked').value;
    aOut.textContent = `${a} m²`;
    area.style.setProperty('--p', `${((a - area.min) / (area.max - area.min)) * 100}%`);
    const lo = a * c * 1.3, hi = a * c * 1.5;
    m2.textContent = `R$ ${brl(c * 1.3)} a R$ ${brl(c * 1.5)} por m²`;
    if (G && animate && !RM) G.to(simState, { lo, hi, duration: 0.5, ease: 'power2.out', onUpdate: renderSim, overwrite: true });
    else { simState.lo = lo; simState.hi = hi; renderSim(); }
  };
  area.addEventListener('input', () => calc());
  $('#simCta').addEventListener('click', () => {
    $('#fArea').value = area.value;
    const pad = $('input[name=padrao]:checked + label').textContent;
    $('#fCidade').placeholder = `Ex.: Santa Felicidade, Curitiba (padrão ${pad.toLowerCase()})`;
  });
  $$('input[name=padrao]').forEach(r => r.addEventListener('change', () => calc()));
  calc(false);

  /* ---------------- Lead form (2 steps, simulated submit) ---------------- */
  const s1 = $('#fStep1'), s2 = $('#fStep2'), done = $('#fDone'), bar = $('#fBar'), lbl = $('#fStepLbl');
  const setErr = (wrap, span, msg) => { $(wrap).classList.toggle('has-err', !!msg); $(span).textContent = msg || ''; };
  const goStep = n => {
    s1.style.display = n === 1 ? 'grid' : 'none';
    s2.style.display = n === 2 ? 'grid' : 'none';
    bar.style.width = n === 1 ? '50%' : '100%';
    lbl.textContent = `Passo ${n} de 2`;
    (n === 1 ? $('#fCidade') : $('#p1')).focus({ preventScroll: true });
  };
  $('#fNext').addEventListener('click', () => {
    const v = $('#fCidade').value.trim();
    setErr('#wCidade', '#eCidade', v ? '' : 'Diga a cidade ou o bairro da obra.');
    if (v) goStep(2); else $('#fCidade').focus();
  });
  $('#fBack').addEventListener('click', () => goStep(1));
  $$('input[name=proj]').forEach(r => r.addEventListener('change', () => { $('#fHint').hidden = $('#p3').checked ? false : true; }));
  const zap = $('#fZap');
  zap.addEventListener('input', () => {
    const d = zap.value.replace(/\D/g, '').slice(0, 11);
    let f = d;
    if (d.length > 2) f = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) f = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
    zap.value = f;
  });
  $('#fArea').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5); });
  $('#lead').addEventListener('submit', e => {
    e.preventDefault();
    const nome = $('#fNome').value.trim(), dig = zap.value.replace(/\D/g, '');
    setErr('#wNome', '#eNome', nome ? '' : 'Como podemos te chamar?');
    setErr('#wZap', '#eZap', dig.length === 0 ? 'Faltou o WhatsApp.' : dig.length < 10 ? 'Faltou o DDD ou algum número.' : '');
    if (!nome) return $('#fNome').focus();
    if (dig.length < 10) return zap.focus();
    s2.style.display = 'none'; $('.form__steps').hidden = true; $('.form__bar').hidden = true;
    $('#fDoneT').textContent = `Obrigado, ${nome.split(' ')[0]}.`;
    done.hidden = false;
  });

  /* ---------------- Obras recentes: os cards já vêm no HTML (gerados por tools/gerar-paginas.js) ---------------- */
  const grid = $('#obrasGrid');
  if (grid) {
    // prévia em vídeo ao passar o mouse (só em telas com hover; o arquivo só baixa no primeiro hover)
    if (matchMedia('(hover: hover) and (pointer: fine)').matches && !RM && !SAVE_DATA) {
      $$('.ocard', grid).forEach(card => {
        const v = $('video', card); if (!v) return;
        card.addEventListener('pointerenter', () => {
          if (!v.getAttribute('src')) { primeVideo(v); v.src = v.dataset.src; v.addEventListener('playing', () => card.classList.add('is-playing')); }
          v.play().then(() => card.classList.add('is-playing')).catch(() => {});
        });
        card.addEventListener('pointerleave', () => { card.classList.remove('is-playing'); setTimeout(() => { if (!card.classList.contains('is-playing')) v.pause(); }, 600); });
      });
    }

    // barra de progresso do carrossel no celular
    const bar = $('#obrasBar');
    const syncBar = () => {
      const sw = grid.scrollWidth, cw = grid.clientWidth;
      if (!bar || sw <= cw) return;
      bar.style.setProperty('--w', `${(cw / sw) * 100}%`);
      bar.style.setProperty('--l', `${(grid.scrollLeft / sw) * 100}%`);
    };
    grid.addEventListener('scroll', syncBar, { passive: true });
    window.addEventListener('resize', syncBar);
    syncBar();
  }

  /* Aviso curto (usado enquanto o portfólio completo não existe) */
  const toastEl = $('#toast');
  let toastT = 0;
  const toast = msg => { toastEl.textContent = msg; toastEl.classList.add('is-in'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-in'), 3200); };

  /* ---------------- 3D stage (Como trabalhamos): continuous, scroll-driven ---------------- */
  const STEP_T = ['Conversa e análise do projeto', 'Orçamento detalhado', 'Contrato e abertura do CNO', 'Compras, equipes e fornecedores', 'Execução com fiscalização', 'Reunião mensal de custos', 'Vistoria e CVCO', 'Garantia pós-obra'];
  const Stage3D = { api: null, s: 0, loading: false };
  const stepsEls = $$('.step');
  let lastStep = -1;
  const setProgress = s => {
    s = Math.max(0, Math.min(7.999, s));
    Stage3D.s = s;
    const i = Math.floor(s), f = s - i;
    if (i !== lastStep) {
      lastStep = i;
      stepsEls.forEach((el, k) => { el.classList.toggle('is-active', k === i); el.classList.toggle('is-done', k < i); });
      $('#comoN').textContent = `${String(i + 1).padStart(2, '0')} / 08`;
      $('#comoT').textContent = STEP_T[i];
    }
    stepsEls.forEach((el, k) => el.style.setProperty('--f', k < i ? 1 : k === i ? f : 0));
    $('#comoBar').style.transform = `scaleX(${(s / 8).toFixed(4)})`;
    // fill the rail exactly up to the point between the current dot and the next one
    const rail = $('.steps-rail'), rr = rail.getBoundingClientRect();
    const dotY = k => { const r = stepsEls[Math.min(k, 7)].getBoundingClientRect(); return r.top + r.height / 2 - rr.top; };
    const fillY = dotY(i) + (dotY(i + 1) - dotY(i)) * f;
    $('#stepsRail').style.transform = `scaleY(${Math.max(0, Math.min(1, fillY / rr.height)).toFixed(4)})`;
    Stage3D.api && Stage3D.api.set(s);
  };
  // the rail runs from the centre of the first card's dot to the centre of the last one
  const layoutRail = () => {
    const rail = $('.steps-rail'), a = stepsEls[0], z = stepsEls[7];
    const t = a.offsetTop + a.offsetHeight / 2, b = z.offsetTop + z.offsetHeight / 2;
    Object.assign(rail.style, { top: t + 'px', height: (b - t) + 'px', bottom: 'auto' });
  };
  layoutRail();
  window.addEventListener('resize', layoutRail);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutRail);
  // which card sits on the reading line decides the stage, and how far into it we are
  const comoLine = () => innerHeight * (matchMedia('(max-width: 1023px)').matches ? 0.72 : 0.58);
  const syncSteps = () => {
    const y = comoLine();
    const first = stepsEls[0].getBoundingClientRect(), last = stepsEls[7].getBoundingClientRect();
    if (y < first.top) return setProgress(0);
    if (y >= last.bottom) return setProgress(7.999);
    for (let k = 0; k < 8; k++) {
      const r = stepsEls[k].getBoundingClientRect();
      const next = k < 7 ? stepsEls[k + 1].getBoundingClientRect().top : r.bottom;
      if (y >= r.top && y < next) return setProgress(k + (y - r.top) / (next - r.top));
    }
  };
  const loadThree = () => {
    if (Stage3D.loading) return; Stage3D.loading = true;
    // versão ES module do Three.js (o three.min.js antigo é obsoleto desde a r150 e avisa no console)
    import('https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.min.js')
      .then(mod => { window.THREE = mod; Stage3D.api = build3D($('#comoStage')); Stage3D.api.set(Stage3D.s, true); })
      .catch(err => console.warn(err));
  };
  new IntersectionObserver(([e], io) => { if (e.isIntersecting) { loadThree(); io.disconnect(); } }, { rootMargin: '800px 0px' }).observe($('#comoStage'));

  function build3D(host) {
    const THREE = window.THREE;
    const mobile = matchMedia('(max-width: 767px)').matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75));
    host.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400);
    const root = new THREE.Group(); scene.add(root);
    const C = { ink: new THREE.Color('#16181B'), ghost: new THREE.Color('#9A9DA1'), sinal: new THREE.Color('#FD9500'), ok: new THREE.Color('#1F9D6B'), paper: new THREE.Color('#FBFAF8') };
    const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const els = [];

    const fillMat = (color = '#FBFAF8', opacity = 1) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const lineMat = color => new THREE.LineBasicMaterial({ color: color || C.ink.clone(), transparent: true });
    // A box whose base sits at y (so it can "grow" from the ground)
    function box(w, h, d, x, y, z, o) {
      const g = new THREE.Group(); g.position.set(x, y, z); root.add(g);
      const geo = new THREE.BoxGeometry(w, h, d); geo.translate(0, h / 2, 0);
      const fm = fillMat(o.fill || '#FBFAF8', o.fillOpacity ?? 1);
      const lm = lineMat(o.keep ? C.sinal.clone() : null);
      g.add(new THREE.Mesh(geo, fm)); g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), lm));
      const e = { g, fm, lm, y0: y, type: 'grow', ...o, finish: o.finish ? new THREE.Color(o.finish) : null, base: new THREE.Color(o.fill || '#FBFAF8') };
      els.push(e); return e;
    }
    // Line segments drawn progressively (plans, dimension lines, strings)
    function lines(pts, o) {
      const geo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p[0], p[1], p[2])));
      const lm = o.dashed ? new THREE.LineDashedMaterial({ color: o.color || C.ghost.clone(), dashSize: 0.35, gapSize: 0.25, transparent: true }) : lineMat(o.color ? new THREE.Color(o.color) : (o.keep ? C.sinal.clone() : null));
      const seg = new THREE.LineSegments(geo, lm); if (o.dashed) seg.computeLineDistances();
      const g = new THREE.Group(); g.add(seg); root.add(g);
      const e = { g, lm, seg, n: pts.length, type: 'draw', ...o }; els.push(e); return e;
    }
    const rect = (x1, z1, x2, z2, y = 0.03) => [[x1, y, z1], [x2, y, z1], [x2, y, z1], [x2, y, z2], [x2, y, z2], [x1, y, z2], [x1, y, z2], [x1, y, z1]];
    const arc = (cx, cz, r, a0, a1, y = 0.03, n = 8) => { const o = []; for (let i = 0; i < n; i++) { const t0 = a0 + (a1 - a0) * i / n, t1 = a0 + (a1 - a0) * (i + 1) / n; o.push([cx + r * Math.cos(t0), y, cz + r * Math.sin(t0)], [cx + r * Math.cos(t1), y, cz + r * Math.sin(t1)]); } return o; };

    /* 0 · Conversa e análise: a planta baixa impressa na folha, sobre a mesa */
    const SH = { x0: -12, z0: -9.6, w: 28, h: 19.8 };
    const TW = mobile ? 1536 : 2048, K = TW / SH.w, px = K / 73;
    const cv = document.createElement('canvas'); cv.width = TW; cv.height = Math.round(SH.h * K);
    const g2 = cv.getContext('2d');
    const P = (x, z) => [(x - SH.x0) * K, (z - SH.z0) * K];
    const INKc = '#1B1D20', MID = '#6A6D71', LIGHT = '#B9BBBE';
    const DISP = '"Barlow Condensed", "Arial Narrow", sans-serif', MONO = '"IBM Plex Mono", ui-monospace, monospace';
    function drawSheet() {
      const W = cv.width, H = cv.height, ctx = g2;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#FDFCF9'; ctx.fillRect(0, 0, W, H);
      const line = (pts, w = 1.4, c = INKc, dash) => { ctx.beginPath(); pts.forEach(([x, z], i) => { const [u, v] = P(x, z); i ? ctx.lineTo(u, v) : ctx.moveTo(u, v); }); ctx.lineWidth = w * px; ctx.strokeStyle = c; ctx.setLineDash(dash ? dash.map(d => d * px) : []); ctx.stroke(); ctx.setLineDash([]); };
      const rectS = (x1, z1, x2, z2, w, c, dash) => line([[x1, z1], [x2, z1], [x2, z2], [x1, z2], [x1, z1]], w, c, dash);
      const fillR = (x1, z1, x2, z2, c = INKc) => { const [a, b] = P(x1, z1), [c2, d] = P(x2, z2); ctx.fillStyle = c; ctx.fillRect(Math.min(a, c2), Math.min(b, d), Math.abs(c2 - a), Math.abs(d - b)); };
      const text = (s, x, z, size, font = DISP, weight = 700, c = INKc, align = 'center', rot = 0) => { const [u, v] = P(x, z); ctx.save(); ctx.translate(u, v); ctx.rotate(rot); ctx.fillStyle = c; ctx.font = `${weight} ${size * px}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 0); ctx.restore(); };
      const arcS = (cx, cz, r, a0, a1, w = 1, c = INKc) => { const [u, v] = P(cx, cz); ctx.beginPath(); ctx.arc(u, v, r * K, a0, a1); ctx.lineWidth = w * px; ctx.strokeStyle = c; ctx.stroke(); };

      // margins + frame
      rectS(-11.4, -9.0, 15.4, 9.6, 3, INKc); rectS(-11.25, -8.85, 15.25, 9.45, 1, INKc);
      for (let x = -9; x <= 14; x += 4.6) { line([[x, -9.0], [x, -8.85]], 1); line([[x, 9.45], [x, 9.6]], 1); }

      // upper floor projection (dashed)
      rectS(-7.6, -3.5, 5.2, 4.6, 1.2, MID, [10, 7]);
      text('PROJEÇÃO PAV. SUPERIOR', -7.4, -3.85, 17, MONO, 500, MID, 'left');

      // furniture (light)
      rectS(0.2, 2.6, 4.4, 3.6, 1, LIGHT); rectS(0.2, 2.6, 0.7, 3.6, 1, LIGHT); rectS(3.9, 2.6, 4.4, 3.6, 1, LIGHT);
      arcS(2.6, 0.9, 0.75, 0, Math.PI * 2, 1, LIGHT);
      [[2.6, -0.2], [2.6, 2.0], [1.5, 0.9], [3.7, 0.9]].forEach(([x, z]) => rectS(x - 0.22, z - 0.22, x + 0.22, z + 0.22, 1, LIGHT));
      rectS(2.2, -4.3, 5.8, -3.7, 1.2, MID); arcS(4.6, -4.0, 0.2, 0, Math.PI * 2, 1, MID); rectS(3.0, -2.8, 5.2, -2.1, 1, LIGHT);
      rectS(-5.6, -4.3, -3.4, -3.6, 1, LIGHT); arcS(-4.5, -3.1, 0.3, 0, Math.PI * 2, 1, LIGHT);

      // stair
      rectS(-1.6, -4.3, 1.0, -2.2, 1.2, INKc);
      for (let z = -4.3; z <= -2.2; z += 0.35) line([[-1.6, z], [1.0, z]], 1, INKc);
      line([[-0.3, -2.4], [-0.3, -4.0]], 1.2, INKc); line([[-0.5, -3.7], [-0.3, -4.05], [-0.1, -3.7]], 1.2, INKc);

      // walls (poché) with openings
      const T = 0.2, t2 = 0.12;
      const segX = (z, x1, x2, th, gaps = []) => { let x = x1; [...gaps, [x2, x2]].forEach(([g1, g2]) => { if (g1 > x) fillR(x, z - th / 2, g1, z + th / 2); x = g2; }); };
      const segZ = (x, z1, z2, th, gaps = []) => { let z = z1; [...gaps, [z2, z2]].forEach(([g1, g2]) => { if (g1 > z) fillR(x - th / 2, z, x + th / 2, g1); z = g2; }); };
      segX(-4.5, -6.1, 6.1, T, [[-5.0, -3.4], [3.0, 5.0]]);
      segX(4.5, -6.1, -2, T, [[-4.7, -3.7]]);
      segZ(-6, -4.5, 4.5, T, [[-3.0, -1.2]]);
      segZ(6, -4.5, 1.0, T);
      segZ(-2, -4.5, 1.2, t2, [[-1.1, -0.2]]);
      segX(0, -6, -3.2, t2);
      segZ(2, -4.5, -1.2, t2);
      segX(-1.2, 2, 6, t2, [[2.3, 3.2]]);
      // glazing symbols
      const glazX = (z, x1, x2) => { line([[x1, z - 0.08], [x2, z - 0.08]], 1); line([[x1, z], [x2, z]], 1.6); line([[x1, z + 0.08], [x2, z + 0.08]], 1); for (let x = x1; x <= x2 + 0.01; x += (x2 - x1) / Math.max(1, Math.round((x2 - x1) / 2))) line([[x, z - 0.1], [x, z + 0.1]], 1.6); };
      const glazZ = (x, z1, z2) => { line([[x - 0.08, z1], [x - 0.08, z2]], 1); line([[x, z1], [x, z2]], 1.6); line([[x + 0.08, z1], [x + 0.08, z2]], 1); };
      glazX(4.5, -2, 6); glazZ(6, 1.0, 4.5); glazX(-4.5, -5.0, -3.4); glazX(-4.5, 3.0, 5.0); glazZ(-6, -3.0, -1.2);
      // doors (leaf + swing)
      line([[-4.7, 4.4], [-4.7, 3.4]], 1.6); arcS(-4.7, 4.4, 1.0, -Math.PI / 2, 0, 1, MID);
      line([[-2.06, -1.1], [-2.96, -1.1]], 1.6); arcS(-2.0, -1.1, 0.9, Math.PI / 2, Math.PI, 1, MID);
      line([[2.3, -1.26], [2.3, -2.16]], 1.6); arcS(2.3, -1.26, 0.9, -Math.PI / 2, 0, 1, MID);
      // wood slats on the entrance facade
      for (let x = -5.9; x <= -4.8; x += 0.18) line([[x, 4.66], [x, 4.8]], 1.2, MID);
      for (let x = -3.6; x <= -2.1; x += 0.18) line([[x, 4.66], [x, 4.8]], 1.2, MID);

      // room names + areas
      const room = (n, a, x, z) => { text(n, x, z, 30); text(a, x, z + 0.5, 17, MONO, 500, MID); };
      room('ESTAR / JANTAR', '46,4 m²', 2.0, 1.5);
      room('COZINHA', '14,6 m²', 4.1, -3.0 + 0.2);
      room('ESCRITÓRIO', '15,8 m²', -4.0, -2.0);
      room('HALL', '15,6 m²', -4.0, 2.2);
      text('ESCADA', -0.3, -1.8, 20, MONO, 500, MID);
      // levels
      text('+0,30', 4.8, 3.9, 17, MONO, 500, MID); text('+0,30', -4.6, 3.6, 17, MONO, 500, MID);

      // dimension lines (architectural ticks)
      const dimH = (z, xs, off = -0.28) => { line([[xs[0], z], [xs[xs.length - 1], z]], 1); xs.forEach(x => { line([[x - 0.12, z + 0.12], [x + 0.12, z - 0.12]], 1.8); line([[x, z - 0.25], [x, z + 0.25]], 0.8, MID); }); for (let i = 0; i < xs.length - 1; i++) text((xs[i + 1] - xs[i]).toFixed(2).replace('.', ','), (xs[i] + xs[i + 1]) / 2, z + off, 20, MONO, 500); };
      const dimV = (x, zs) => { line([[x, zs[0]], [x, zs[zs.length - 1]]], 1); zs.forEach(z => { line([[x - 0.12, z + 0.12], [x + 0.12, z - 0.12]], 1.8); line([[x - 0.25, z], [x + 0.25, z]], 0.8, MID); }); for (let i = 0; i < zs.length - 1; i++) text((zs[i + 1] - zs[i]).toFixed(2).replace('.', ','), x + 0.3, (zs[i] + zs[i + 1]) / 2, 20, MONO, 500, INKc, 'center', -Math.PI / 2); };
      dimH(5.7, [-6, -2, 6]); dimH(6.5, [-6, 6]); dimH(-5.5, [-6, 2, 6]);
      dimV(7.2, [-4.5, -1.2, 1.0, 4.5]); dimV(8.0, [-4.5, 4.5]);
      // section marks
      [[-7.0, -0.6], [7.0 + 1.6, -0.6]].forEach(([x, z]) => { arcS(x, z, 0.32, 0, Math.PI * 2, 1.4); text('A', x, z, 22, DISP, 700); });
      line([[-6.6, -0.6], [-6.2, -0.6]], 1.4, INKc, [6, 4]);

      // drawing title
      text('PLANTA BAIXA · PAVIMENTO TÉRREO', -6.0, 8.0, 40, DISP, 700, INKc, 'left');
      line([[-6.0, 8.45], [1.6, 8.45]], 2.4); text('ESCALA 1:100', -6.0, 8.85, 18, MONO, 500, MID, 'left');

      // north arrow
      arcS(-9.6, -7.2, 0.7, 0, Math.PI * 2, 1.4);
      line([[-9.6, -6.5], [-9.6, -7.9]], 1.4); line([[-9.9, -7.4], [-9.6, -7.95], [-9.3, -7.4]], 1.8); text('N', -9.6, -8.35, 24, DISP, 700);

      // areas table
      rectS(10.2, -8.4, 15.0, -5.0, 1.4);
      text('QUADRO DE ÁREAS', 10.45, -8.0, 22, DISP, 700, INKc, 'left');
      [['Térreo', '124,0 m²'], ['Superior', '124,0 m²'], ['Total construído', '248,0 m²']].forEach(([a, b], i) => {
        const z = -7.25 + i * 0.7; line([[10.2, z - 0.35], [15.0, z - 0.35]], 0.8, MID);
        text(a, 10.45, z, 18, MONO, i === 2 ? 600 : 400, INKc, 'left'); text(b, 14.8, z, 18, MONO, i === 2 ? 600 : 400, INKc, 'right');
      });

      // title block
      rectS(10.2, 4.4, 15.0, 9.2, 2.2);
      fillR(10.2, 4.4, 15.0, 5.5, INKc);
      text('MEGER', 10.45, 4.95, 44, DISP, 800, '#FDFCF9', 'left'); text('ENGENHARIA', 12.55, 5.02, 18, MONO, 500, '#FDFCF9', 'left');
      const rows = [['OBRA', 'Residência unifamiliar'], ['CONTEÚDO', 'Planta baixa · térreo'], ['LOCAL', 'Curitiba · PR']];
      rows.forEach(([k, v], i) => { const z = 5.95 + i * 0.62; line([[10.2, z + 0.31], [15.0, z + 0.31]], 0.8, MID); text(k, 10.45, z, 14, MONO, 500, MID, 'left'); text(v, 11.75, z, 16, MONO, 500, INKc, 'left'); });
      const cells = [['ESCALA', '1:100'], ['FOLHA', '01/08'], ['REV.', '00']];
      cells.forEach(([k, v], i) => { const x = 10.2 + i * 1.6; if (i) line([[x, 7.8], [x, 9.2]], 0.8, MID); text(k, x + 0.2, 8.1, 14, MONO, 500, MID, 'left'); text(v, x + 0.2, 8.7, 28, DISP, 700, INKc, 'left'); });
      line([[10.2, 7.8], [15.0, 7.8]], 1);
    }
    drawSheet();
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy(); tex.generateMipmaps = true;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { drawSheet(); tex.needsUpdate = true; });
    const paperM = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(SH.w, SH.h), paperM);
    paper.rotation.x = -Math.PI / 2; paper.position.set(SH.x0 + SH.w / 2, 0.012, SH.z0 + SH.h / 2); root.add(paper);
    const shadowM = new THREE.MeshBasicMaterial({ color: 0x16181B, transparent: true, opacity: 0.1, depthWrite: false });
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(SH.w, SH.h), shadowM);
    shadow.rotation.x = -Math.PI / 2; shadow.position.set(paper.position.x + 0.3, 0.004, paper.position.z + 0.4); root.add(shadow);
    const SHEET = { paper, paperM, shadowM, cx: SH.x0 + SH.w / 2, cz: SH.z0 + SH.h / 2 };


    /* terreno e curvas de nível entram quando a folha sai */
    const lot = box(22, 0.06, 18, -0.5, -0.06, 0.5, { a: 2.2, b: 2.8, type: 'fade', finish: '#E3E9D8', fa: 7.0, fb: 7.4, lineColor: 'ghost' });
    const contour = [];
    [[9.5, 7.2], [8.2, 6.1], [6.8, 5.0]].forEach(([rx, rz], k) => { for (let i = 0; i < 28; i++) { const t0 = i / 28 * Math.PI * 2, t1 = (i + 1) / 28 * Math.PI * 2; const w = t => 1 + 0.06 * Math.sin(t * 3 + k); contour.push([-0.5 + rx * w(t0) * Math.cos(t0), 0.02, 0.5 + rz * w(t0) * Math.sin(t0)], [-0.5 + rx * w(t1) * Math.cos(t1), 0.02, 0.5 + rz * w(t1) * Math.sin(t1)]); } });
    lines(contour, { a: 2.4, b: 2.9, color: '#C9C6BF', out: [3.6, 4.0] });
    const plan = [
      ...rect(-6, -4.5, 6, 4.5),
      [-2, 0.03, -4.5], [-2, 0.03, 1.2], [-6, 0.03, 0], [-3.2, 0.03, 0], [2, 0.03, -4.5], [2, 0.03, -1.2], [2, 0.03, -1.2], [6, 0.03, -1.2],
      [-1.6, 0.03, -4.3], [1.0, 0.03, -4.3], [-1.6, 0.03, -2.2], [1.0, 0.03, -2.2],
    ];
    const planE = lines(plan, { a: 2.1, b: 2.6, out: [4.0, 4.6] });

    /* 1 · Orçamento: cotas, volume previsto (tracejado) e barras de custo por etapa */
    const cotas = [
      [-6, 0.03, 6.4], [6, 0.03, 6.4], [-6, 0.03, 6.0], [-6, 0.03, 6.8], [6, 0.03, 6.0], [6, 0.03, 6.8], [-2, 0.03, 6.1], [-2, 0.03, 6.7],
      [7.8, 0.03, -4.5], [7.8, 0.03, 4.5], [7.4, 0.03, -4.5], [8.2, 0.03, -4.5], [7.4, 0.03, 4.5], [8.2, 0.03, 4.5], [7.5, 0.03, 0], [8.1, 0.03, 0],
    ];
    lines(cotas, { a: 2.3, b: 2.7, out: [4.2, 4.6] });
    const ghostPts = [];
    const boxEdges = (x1, y1, z1, x2, y2, z2) => { const c = [[x1, y1, z1], [x2, y1, z1], [x2, y1, z2], [x1, y1, z2], [x1, y2, z1], [x2, y2, z1], [x2, y2, z2], [x1, y2, z2]]; [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([a, b]) => ghostPts.push(c[a], c[b])); };
    boxEdges(-6, 0, -4.5, 6, 3.3, 4.5); boxEdges(-7.6, 3.5, -3.5, 5.2, 6.5, 4.6); boxEdges(-7.6, 6.5, -3.5, 5.2, 7.3, 4.6);
    const ghost = lines(ghostPts, { dashed: true, a: 1.3, b: 1.9, type: 'ghost', out: [4.1, 5.2] });
    const budget = [1.2, 2.0, 3.2, 2.6, 1.6, 2.8, 0.9];
    budget.forEach((h, i) => {
      box(0.5, h, 0.5, 10.4, 0, -4.2 + i * 1.4, { a: 1.35 + i * 0.06, b: 1.7 + i * 0.06, fill: '#E4E2DD', out: [6.0, 6.35], lineColor: 'ghost' });
      box(0.5, h * [1, 1.02, 0.98, 1.03, 1, 1.01, 0.99][i], 0.5, 11.0, 0, -4.2 + i * 1.4, { a: 5.15 + i * 0.09, b: 5.45 + i * 0.09, fill: '#2A2D32', out: [6.0, 6.35] });
    });

    /* 2 · Contrato e CNO: gabarito */
    [[-6.8, -5.3], [6.8, -5.3], [6.8, 5.3], [-6.8, 5.3]].forEach(([x, z], i) => box(0.12, 0.7, 0.12, x, 0, z, { a: 2.0 + i * 0.05, b: 2.25 + i * 0.05, keep: true, fill: '#FD9500', out: [3.7, 3.95] }));
    lines(rect(-6.8, -5.3, 6.8, 5.3, 0.55), { a: 2.25, b: 2.75, keep: true, out: [3.7, 3.95] });

    /* 3 · Compras e equipes: materiais chegando e fundação */
    [[8.4, -3.2], [8.4, -1.8], [9.6, -2.5]].forEach(([x, z], i) => box(1.0, 0.8, 1.0, x, 0, z, { a: 3.0 + i * 0.08, b: 3.3 + i * 0.08, type: 'drop', fill: '#D98C6A', out: [5.4, 5.8] }));
    for (let i = 0; i < 5; i++) box(4.2, 0.1, 0.1, -10.5, 0.1 + i * 0.12, -2 + i * 0.14, { a: 3.1 + i * 0.04, b: 3.35 + i * 0.04, type: 'drop', fill: '#8F959B', out: [5.4, 5.8] });
    box(12.6, 0.3, 9.6, 0, 0, 0, { a: 3.4, b: 3.95, fill: '#F1F0EC', finish: '#D8D5CF', fa: 6.3, fb: 6.8 });

    /* 4 · Execução: pilares, lajes e alvenaria fiada por fiada; grua */
    const colG = []; [-6, -2, 2, 6].forEach(x => [-4.4, 0, 4.4].forEach(z => colG.push([x * 0.975, z])));
    colG.forEach(([x, z], i) => box(0.3, 3.0, 0.3, x, 0.3, z, { a: 4.0 + i * 0.012, b: 4.18 + i * 0.012 }));
    box(12.9, 0.22, 8.4, -1.2, 3.3, 0.5, { a: 4.2, b: 4.35, type: 'drop', finish: '#D8D5CF', fa: 6.3, fb: 6.8 });
    const wall = (x1, z1, x2, z2, y0, y1, a, b, finish) => {
      const len = Math.hypot(x2 - x1, z2 - z1), alongX = Math.abs(x2 - x1) > Math.abs(z2 - z1), n = 4, ch = (y1 - y0) / n;
      for (let c = 0; c < n; c++) box(alongX ? len : 0.2, ch, alongX ? 0.2 : len, (x1 + x2) / 2, y0 + c * ch, (z1 + z2) / 2, { a: a + (b - a) * c / n, b: a + (b - a) * (c + 1) / n, type: 'drop', fill: '#F2E4DC', finish, fa: 6.3, fb: 6.8 });
    };
    const GF = '#5C5F63', UF = '#F4F3F0';
    wall(-6, -4.5, 6, -4.5, 0.3, 3.3, 4.35, 4.6, GF); wall(-6, -4.5, -6, 4.5, 0.3, 3.3, 4.38, 4.62, GF); wall(6, -4.5, 6, 1, 0.3, 3.3, 4.4, 4.64, GF); wall(-6, 4.5, -2, 4.5, 0.3, 3.3, 4.42, 4.66, GF);
    const colU = []; [-7.3, -3.2, 0.9, 4.8].forEach(x => [-3.3, 0.5, 4.3].forEach(z => colU.push([x, z])));
    colU.forEach(([x, z], i) => box(0.26, 3.0, 0.26, x, 3.52, z, { a: 4.55 + i * 0.01, b: 4.7 + i * 0.01 }));
    box(12.9, 0.22, 8.4, -1.2, 6.52, 0.5, { a: 4.72, b: 4.85, type: 'drop', finish: '#D8D5CF', fa: 6.3, fb: 6.8 });
    wall(-7.6, -3.5, 5.2, -3.5, 3.52, 6.52, 4.78, 4.96, UF); wall(-7.6, -3.5, -7.6, 4.6, 3.52, 6.52, 4.8, 4.98, UF); wall(5.2, -3.5, 5.2, 0.6, 3.52, 6.52, 4.82, 4.99, UF);
    wall(-7.6, 4.6, 5.2, 4.6, 3.52, 4.42, 4.84, 4.99, UF); wall(-7.6, 4.6, 5.2, 4.6, 5.92, 6.52, 4.9, 5.0, UF); wall(-7.6, 4.6, -5, 4.6, 4.42, 5.92, 4.86, 4.99, UF);
    // grua (tower crane)
    const crane = new THREE.Group(); crane.position.set(9.2, 0, -7); root.add(crane);
    const mkC = (w, h, d, x, y, z) => { const geo = new THREE.BoxGeometry(w, h, d); geo.translate(x, y + h / 2, z); const lm = lineMat(C.sinal.clone()); const fm = fillMat('#FD9500', 0.9); const m = new THREE.Group(); m.add(new THREE.Mesh(geo, fm), new THREE.LineSegments(new THREE.EdgesGeometry(geo), lm)); return { m, lm, fm }; };
    const mast = mkC(0.4, 10, 0.4, 0, 0, 0); crane.add(mast.m);
    const jibG = new THREE.Group(); jibG.position.y = 10; crane.add(jibG);
    const jib = mkC(11, 0.3, 0.3, -3.8, 0, 0); jibG.add(jib.m);
    const cw = mkC(1.4, 0.9, 0.9, 2.4, -0.2, 0); cw.fm.color.set('#5C5F63'); jibG.add(cw.m);
    const craneE = { g: crane, type: 'grow', a: 4.0, b: 4.25, out: [6.0, 6.3], mats: [mast, jib, cw], keep: true }; els.push(craneE);

    /* 5 · Reunião mensal: platibanda, cobertura (barras de custo realizado já acima) */
    [[-7.65, -3.85, 5.25, -3.85], [-7.65, -3.85, -7.65, 4.75], [5.25, -3.85, 5.25, 4.75], [-7.65, 4.75, 5.25, 4.75]].forEach(([x1, z1, x2, z2], i) => {
      const alongX = Math.abs(x2 - x1) > 1; box(alongX ? Math.abs(x2 - x1) : 0.2, 0.6, alongX ? 0.2 : Math.abs(z2 - z1), (x1 + x2) / 2, 6.74, (z1 + z2) / 2, { a: 5.0 + i * 0.05, b: 5.25 + i * 0.05, type: 'drop', fill: '#F2E4DC', finish: UF, fa: 6.3, fb: 6.8 });
    });
    box(1.6, 1.1, 1.6, 2.6, 6.74, -1.8, { a: 5.25, b: 5.45, type: 'drop' });
    for (let i = 0; i < 4; i++) box(1.1, 0.08, 2.0, -5.6 + i * 1.3, 6.9, 0.8, { a: 5.3 + i * 0.04, b: 5.5 + i * 0.04, type: 'drop', fill: '#3A4A5E' });

    /* 6 · Vistoria e CVCO: esquadrias, vidro, ripado, cores finais, selo aprovado */
    const glass = (w, h, d, x, y, z, a) => box(w, h, d, x, y, z, { a, b: a + 0.3, type: 'fade', fill: '#A9BCCB', fillOpacity: 0.75 });
    glass(8, 2.9, 0.06, 2, 0.35, 4.52, 6.0); glass(0.06, 2.9, 3.4, 6.02, 0.35, 2.75, 6.05); glass(10.2, 1.45, 0.06, 0.1, 4.45, 4.64, 6.1); glass(0.06, 2.9, 3.9, 5.22, 3.57, 2.6, 6.15);
    for (let x = -5.9; x <= -2.1; x += 0.28) box(0.1, 3.0, 0.1, x, 0.3, 4.7, { a: 6.2 + (x + 6) * 0.03, b: 6.35 + (x + 6) * 0.03, fill: '#9A6A42' });
    box(4.6, 0.12, 2.2, -4, 3.3, 5.5, { a: 6.3, b: 6.5, type: 'drop' });
    const stamp = [...arc(-9.4, 7.0, 1.2, 0, Math.PI * 2, 0.04, 24), [-9.95, 0.04, 7.0], [-9.55, 0.04, 7.45], [-9.55, 0.04, 7.45], [-8.8, 0.04, 6.5]];
    lines(stamp, { a: 6.55, b: 6.95, color: '#1F9D6B' });

    /* 7 · Garantia: paisagismo e anel de garantia */
    const trees = [[8.6, 6.4, 1.1], [9.2, -2.2, 1.3], [-9.3, 3.5, 1.0], [-9.8, -3.8, 1.2], [1, -7.4, 0.9], [4.2, 7.4, 0.8]];
    trees.forEach(([x, z, s], i) => {
      const g = new THREE.Group(); g.position.set(x, 0, z); root.add(g);
      const cg = new THREE.IcosahedronGeometry(1.25 * s, 0); cg.translate(0, 2.4 * s, 0);
      const tg = new THREE.CylinderGeometry(0.08 * s, 0.12 * s, 1.6 * s, 6); tg.translate(0, 0.8 * s, 0);
      const fm = fillMat('#C9D8B4'), lm = lineMat(), lm2 = lineMat(), fm2 = fillMat('#E7DED3');
      g.add(new THREE.Mesh(cg, fm), new THREE.LineSegments(new THREE.EdgesGeometry(cg), lm), new THREE.Mesh(tg, fm2), new THREE.LineSegments(new THREE.EdgesGeometry(tg), lm2));
      els.push({ g, type: 'scale', a: 7.0 + i * 0.06, b: 7.35 + i * 0.06, mats: [{ lm, fm }, { lm: lm2, fm: fm2 }] });
    });
    lines(arc(-0.5, 0.5, 11.2, 0, Math.PI * 2, 0.04, 64), { a: 7.3, b: 7.9, color: '#1F9D6B', dashedLook: true });

    /* ---------- camera + loop ---------- */
    let target = 0, cur = 0, mx = 0, my = 0, visible = true, raf = 0, t0 = performance.now();
    host.addEventListener('pointermove', e => { const r = host.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5; });
    host.addEventListener('pointerleave', () => { mx = 0; my = 0; });
    let aspect = 1;
    const resize = () => { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false); aspect = w / h; };
    new ResizeObserver(resize).observe(host); resize();
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }).observe(host);
    const tmp = new THREE.Color();

    function apply(s) {
      for (const e of els) {
        const t = smooth(e.a, e.b, s);
        const o = e.out ? 1 - smooth(e.out[0], e.out[1], s) : 1;
        const v = t * o;
        e.g.visible = v > 0.002;
        if (!e.g.visible) continue;
        const animating = t > 0.002 && t < 0.998;
        if (e.type === 'grow') e.g.scale.y = Math.max(v, 0.001);
        else if (e.type === 'scale') e.g.scale.setScalar(Math.max(v, 0.001));
        else if (e.type === 'drop') e.g.position.y = e.y0 + (1 - t) * 1.8 + (1 - o) * 1.2;
        // colours
        const lineTarget = e.keep ? C.sinal : e.color ? null : animating ? C.sinal : e.lineColor === 'ghost' ? C.ghost : C.ink;
        const alpha = e.type === 'grow' || e.type === 'scale' ? 1 : v;
        if (e.type === 'draw' || e.type === 'ghost') {
          const count = Math.floor((e.type === 'ghost' ? 1 : t) * e.n / 2) * 2;
          e.seg.geometry.setDrawRange(0, count);
          if (e.type === 'ghost') { e.g.scale.y = Math.max(t, 0.001); e.lm.opacity = 0.75 * o; }
          else { e.lm.opacity = o; if (lineTarget) e.lm.color.lerp(lineTarget, 0.2); }
          continue;
        }
        if (e.mats) { e.mats.forEach(m => { m.lm.opacity = alpha; if (!e.keep) m.lm.color.lerp(lineTarget, 0.2); }); continue; }
        e.lm.opacity = alpha; e.lm.color.lerp(lineTarget, 0.2);
        e.fm.opacity = (e.fillOpacity ?? 1) * alpha;
        if (e.finish) e.fm.color.copy(e.base).lerp(e.finish, smooth(e.fa, e.fb, s));
      }
      crane.children[1].rotation.y = -0.4 + s * 0.45;
      const po = 1 - smooth(2.15, 2.85, s);
      SHEET.paper.visible = po > 0.002; SHEET.paperM.opacity = po; SHEET.shadowM.opacity = 0.1 * po;
    }
    const lerp = (a, b, k) => a + (b - a) * k;
    function camera(s, t) {
      const k1 = smooth(0.9, 2.5, s); // folha (vista de cima) -> maquete 3D
      const elev = 1.535 - 0.6 * k1 - 0.24 * smooth(2.5, 5.0, s) - 0.06 * smooth(6, 8, s);
      const az = 0.95 * k1 - 0.35 * smooth(2.5, 8, s) + mx * (0.05 + 0.25 * k1) + Math.sin(t * 0.2) * 0.04 * k1;
      const ty = 2.8 * smooth(3.5, 5.2, s);
      const cx = lerp(SHEET.cx, -0.5, k1), cz = lerp(SHEET.cz + (mobile ? 2.0 : 0.9), 0.5, k1), R = 60, e2 = elev + my * 0.05 * k1;
      cam.position.set(cx + R * Math.cos(e2) * Math.sin(az), ty + R * Math.sin(e2), cz + R * Math.cos(e2) * Math.cos(az));
      cam.lookAt(cx, ty, cz);
      const sheetHH = Math.max(SH.h / 2 + 0.5, (SH.w / 2 + 0.5) / aspect);
      const zb = (mobile ? 10.6 : 11.2) + 0.8 * smooth(4, 6, s), buildHH = aspect >= 1 ? zb : zb / aspect;
      const hh = lerp(sheetHH, buildHH, smooth(1.0, 2.7, s));
      cam.left = -hh * aspect; cam.right = hh * aspect; cam.top = hh; cam.bottom = -hh; cam.updateProjectionMatrix();
    }
    function loop() {
      raf = 0;
      if (!visible) return;
      raf = requestAnimationFrame(loop);
      cur += (target - cur) * (RM ? 1 : 0.12);
      const t = (performance.now() - t0) / 1000;
      apply(cur); camera(cur, t);
      renderer.render(scene, cam);
    }
    raf = requestAnimationFrame(loop);
    return { set: (s, jump) => { target = s; if (jump) cur = s; } };
  }

  /* ---------------- View init: Home ---------------- */
  function initHome() {
    if (!G || !ST) return;
    const mm = G.matchMedia();
    if (!RM) {
      whenLoaded(() => {
        G.from('.hero__title .line > span', { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 0.1 });
        G.from('.hero [data-hero]', { y: 20, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.35 });
      });
      ST.create({ trigger: '.socios__stats', start: 'top 88%', once: true, onEnter: () => $$('.socios [data-count]').forEach(el => {
        const end = +el.dataset.count, dec = +(el.dataset.dec || 0), o = { v: 0 };
        G.to(o, { v: end, duration: 1.6, ease: 'power3.out', onUpdate: () => (el.textContent = o.v.toFixed(dec).replace('.', ',')) });
      }) });
      ST.batch('main [data-reveal]:not(.hero [data-reveal])', { start: 'top 88%', once: true, onEnter: b => G.from(b, { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 }) });
      G.fromTo('#portalApp', { rotateX: 14, y: 48 }, { rotateX: 0, y: 0, ease: 'none', scrollTrigger: { trigger: '#portalApp', start: 'top 98%', end: 'top 45%', scrub: true } });
    }
    if (!RM) {
      // no celular o carrossel entra sem mover os cards (transform em item com scroll-snap causa tremida)
      mm.add('(min-width: 640px)', () => { G.from('.ocard', { y: 48, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '#obrasGrid', start: 'top 85%', once: true } }); });
      mm.add('(min-width: 1024px)', () => {
        G.fromTo('.ogrid > .ocard:nth-child(even) .ocard__media', { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: '#obrasGrid', start: 'top bottom', end: 'bottom top', scrub: true } });
        G.fromTo('.ogrid > .ocard:nth-child(odd) .ocard__media', { yPercent: 4 }, { yPercent: -4, ease: 'none', scrollTrigger: { trigger: '#obrasGrid', start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }
    ST.create({ trigger: '#steps', start: 'top bottom', end: 'bottom top', onUpdate: syncSteps, onRefresh: syncSteps });
    return () => mm.revert();
  }

  /* ---------------- Âncoras da página inicial (#obras, #orcamento...) com rolagem suave ---------------- */
  if (G) G.context(() => initHome());
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = decodeURIComponent(a.getAttribute('href').slice(1)); if (!id) return;
    if (id === 'portfolio') { e.preventDefault(); toast('A página com todos os projetos está em construção. Por enquanto, veja as obras recentes.'); return; }
    const el = document.getElementById(id); if (!el) return;
    e.preventDefault(); closeMenu(); scrollToEl(el);
    try { history.replaceState(null, '', id === 'inicio' ? location.pathname : '#' + id); } catch (_) {}
  });
  if (location.hash) {
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el) whenLoaded(() => requestAnimationFrame(() => scrollToEl(el, true)));
  }
  window.addEventListener('load', () => ST && ST.refresh());
  if (!G || !ST) window.addEventListener('scroll', syncSteps, { passive: true });
  syncSteps();
})();
