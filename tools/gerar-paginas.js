#!/usr/bin/env node
/* Meger Engenharia · gera as páginas estáticas a partir de js/obras.js
   ------------------------------------------------------------------
   Uso (na pasta site):  node tools/gerar-paginas.js
   Rode sempre que mudar js/obras.js ou o cabeçalho/rodapé do index.html.

   O que ele escreve:
   - index.html            atualiza os blocos <!--@seo--> e <!--@cards--> (o resto não é tocado)
   - obras/<slug>/index.html  uma página por obra, com título, descrição, canonical, Open Graph e dados estruturados
   - 404.html, sitemap.xml, robots.txt
   Sem dependências: só Node.js.
   ------------------------------------------------------------------ */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://megereng.com.br'; // domínio final, sem barra no fim. Trocar aqui se mudar.
const EMPRESA = {
  nome: 'Meger Engenharia',
  razao: 'L G Meger Engenharia',
  fundacao: '2020-11-13',
  telefone: '+55-41-99819-6442',
  whatsapp: 'https://wa.me/5541998196442',
  email: 'engenharia@megereng.com.br',
  endereco: { rua: 'Avenida Cândido de Abreu, 469, sala 1901', cidade: 'Curitiba', uf: 'PR' },
  atende: ['Curitiba', 'São José dos Pinhais', 'Pinhais', 'Colombo', 'Araucária', 'Campo Largo', 'Fazenda Rio Grande'],
  redes: ['https://www.instagram.com/meger.engenharia/'],
};
const HOME = {
  titulo: 'Meger Engenharia | Construtora em Curitiba e região',
  descricao: 'Construção e reforma de casas e obras comerciais em Curitiba e região. Prazo no contrato, notas e boletos no portal do cliente, do CNO ao CVCO. Peça um orçamento.',
};

const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
// versão dos arquivos no link (?v=hash): quando o CSS ou o JS mudam, o navegador baixa o novo na hora, sem cache velho
const ver = f => require('crypto').createHash('md5').update(read(f)).digest('hex').slice(0, 8);
const stamp = s => s.replace(/(css\/styles\.css|js\/app\.js|js\/obra\.js)(\?v=\w+)?"/g, (m, f) => `${f}?v=${ver(f)}"`);
const write = (f, s) => { if (f.endsWith('.html')) s = stamp(s); const p = path.join(ROOT, f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); console.log('ok', f); };
const exists = f => fs.existsSync(path.join(ROOT, f));
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const between = (s, tag, body) => {
  const a = `<!--@${tag}-->`, b = `<!--/@${tag}-->`, i = s.indexOf(a), j = s.indexOf(b);
  if (i < 0 || j < 0) throw new Error(`marcador @${tag} não encontrado no index.html`);
  return s.slice(0, i + a.length) + body + s.slice(j);
};
const inner = (s, tag) => { const a = `<!--@${tag}-->`, i = s.indexOf(a); return s.slice(i + a.length, s.indexOf(`<!--/@${tag}-->`)); };
const ld = obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
const cut = (t, n) => (t.length <= n ? t : t.slice(0, t.lastIndexOf(' ', n - 1)) + '…');
const hoje = new Date().toISOString().slice(0, 10);

/* ---------- dados ---------- */
const sandbox = { window: {} };
vm.runInNewContext(read('js/obras.js'), sandbox);
const OBRAS = (sandbox.window.MEGER_OBRAS || []).filter(o => o && o.slug);
const media = (o, f) => `media/obras/${o.slug}/${f}`;
const coverOf = o => o.fotos.find(f => f.src === o.capa) || o.fotos[0] || { src: o.capa, w: 810, h: 1080 };
const isLive = o => /andamento/i.test(o.situacao || '');
const soProjeto = o => o.fotos.length > 0 && o.fotos.every(f => f.fase === 'projeto');
const registro = o => {
  const n = o.fotos.length, fotos = soProjeto(o) ? `${n} perspectiva${n > 1 ? 's' : ''}` : `${n} foto${n > 1 ? 's' : ''}`;
  return o.video ? `${fotos} · vídeo` : fotos;
};
const ogImage = o => (o && exists(`media/og/${o.slug}.jpg`) ? `media/og/${o.slug}.jpg` : o ? media(o, o.heroDesktop || coverOf(o).src) : 'media/og/home.jpg');
const pad2 = n => String(n).padStart(2, '0');

/* ---------- ícones ---------- */
const ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
const BTN_IC = `<span class="btn__ic" aria-hidden="true">${ARROW}${ARROW}</span>`;
const WA = '<svg class="octa__wa" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3z"/></svg>';

/* ---------- dados estruturados ---------- */
const ORG = {
  '@type': 'GeneralContractor', '@id': `${SITE}/#empresa`, name: EMPRESA.nome, legalName: EMPRESA.razao, foundingDate: EMPRESA.fundacao,
  url: `${SITE}/`, logo: `${SITE}/media/icons/apple-touch-icon.png`, image: `${SITE}/media/og/home.jpg`,
  telephone: EMPRESA.telefone, email: EMPRESA.email,
  address: { '@type': 'PostalAddress', streetAddress: EMPRESA.endereco.rua, addressLocality: EMPRESA.endereco.cidade, addressRegion: EMPRESA.endereco.uf, addressCountry: 'BR' },
  areaServed: EMPRESA.atende.map(c => ({ '@type': 'City', name: c })), sameAs: EMPRESA.redes,
};
const WEBSITE = { '@type': 'WebSite', '@id': `${SITE}/#site`, url: `${SITE}/`, name: EMPRESA.nome, inLanguage: 'pt-BR', publisher: { '@id': ORG['@id'] } };

const headTags = ({ titulo, descricao, url, imagem, tipo = 'website', extra = '' }) => `
  <title>${esc(titulo)}</title>
  <meta name="description" content="${esc(descricao)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="${tipo}">
  <meta property="og:site_name" content="${EMPRESA.nome}">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:title" content="${esc(titulo)}">
  <meta property="og:description" content="${esc(descricao)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}/${imagem}">
  <meta name="twitter:card" content="summary_large_image">${extra}
`;

/* ---------- página inicial ---------- */
let index = read('index.html');
const faq = [...inner(index, 'main').matchAll(/<button class="qa__q"[^>]*><span>([\s\S]*?)<\/span>[\s\S]*?<div class="qa__a"[^>]*><div>([\s\S]*?)<\/div><\/div>/g)]
  .map(m => ({ q: m[1].trim(), a: m[2].replace(/<[^>]+>/g, '').trim() }));
const homeLd = { '@context': 'https://schema.org', '@graph': [ORG, WEBSITE,
  ...(faq.length ? [{ '@type': 'FAQPage', '@id': `${SITE}/#perguntas`, mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }] : []),
  { '@type': 'ItemList', name: 'Obras recentes', itemListElement: OBRAS.map((o, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/obras/${o.slug}/`, name: o.nome })) },
] };
index = between(index, 'seo', headTags({ titulo: HOME.titulo, descricao: HOME.descricao, url: `${SITE}/`, imagem: 'media/og/home.jpg' }) + '  ' + ld(homeLd) + '\n  ');

const card = (o, i) => {
  const c = coverOf(o);
  return `
        <a class="ocard" href="obras/${o.slug}/" style="--pos:${esc(o.capaPos || '50% 50%')}" aria-label="${esc(o.nome)}, ${esc(o.tipo)} ${esc(o.uso).toLowerCase()}, ${esc(o.situacao).toLowerCase()}. Ver obra">
          <div class="ocard__media"><img src="${media(o, c.src)}" alt="" width="${c.w}" height="${c.h}" loading="lazy" decoding="async">${o.video && o.video.preview ? `<video muted playsinline loop preload="none" aria-hidden="true" data-src="${media(o, o.video.preview)}"></video>` : ''}</div>
          <div class="ocard__top"><span class="st${isLive(o) ? ' is-live' : ''}">${esc(o.situacao)}</span><span class="ocard__n mono">${pad2(i + 1)}<small>/${pad2(OBRAS.length)}</small></span></div>
          <div class="ocard__body">
            <span class="ocard__tag">${esc(o.tipo)} · ${esc(o.uso)}</span>
            <h3 class="ocard__t">${esc(o.nome)}</h3>${o.local ? `<span class="ocard__loc">${esc(o.local)}</span>` : ''}
            <div class="ocard__foot"><span class="mono">${registro(o)}</span><span class="ocard__go" aria-hidden="true">${ARROW}${ARROW}</span></div>
          </div>
        </a>`;
};
index = between(index, 'cards', OBRAS.map(card).join('') + '\n      ');
write('index.html', index);

/* ---------- moldura compartilhada (cabeçalho, menu, rodapé) para as outras páginas ---------- */
const frame = (prefix, { seo, main, scripts, page }) => {
  let s = index;
  s = s.replace(/<!--@pl-->[\s\S]*?<!--\/@pl-->\n?/, '');
  s = s.replace(/\s*<link rel="preload" as="image"[^>]*>/g, '');
  s = s.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  s = s.replace('<body data-page="home">', `<body data-page="${page}">`);
  s = between(s, 'main', '%%MAIN%%');
  s = between(s, 'scripts', '%%SCRIPTS%%');
  s = between(s, 'seo', '%%SEO%%');
  s = s.replace(/(href|src|srcset)="(css|js|media)\//g, `$1="${prefix}$2/`);
  s = s.replace(/href="#inicio"/g, `href="${prefix}"`);
  s = s.replace(/href="#(?!conteudo")([^"]*)"/g, `href="${prefix}#$1"`);
  return s.replace('%%SEO%%', seo).replace('%%MAIN%%', main).replace('%%SCRIPTS%%', scripts);
};
const libs = prefix => `
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js"></script>
  <script src="${prefix}js/obra.js"></script>
  `;

/* ---------- uma página por obra ---------- */
const FASES = { obra: 'Durante a obra', pronto: 'Pronto', projeto: 'Projeto' };
const LBL = { atual: 'Em andamento', proxima: 'Próxima' };
OBRAS.forEach((o, idx) => {
  const R = '../../', M = f => R + media(o, f), c = coverOf(o), live = isLive(o), hero = o.heroDesktop || c.src;
  const url = `${SITE}/obras/${o.slug}/`;
  const titulo = `${o.nome}: ${o.tipo.toLowerCase()} ${o.uso.toLowerCase()}${o.local ? ` em ${o.local}` : ''} | ${EMPRESA.nome}`;
  const descricao = cut(o.resumo || o.nome, 158);
  const spec = [['Tipo', esc(o.tipo)], ['Uso', esc(o.uso)]];
  if (o.local) spec.push(['Local', esc(o.local)]);
  spec.push(['Situação', `${esc(o.situacao)}${live && o.fase ? `<small>Fase atual: ${esc(o.fase).toLowerCase()}</small>` : ''}`]);
  spec.push(['Registro', registro(o)]);
  const escopo = (o.escopo || []).map((it, k) => {
    const [txt, st] = Array.isArray(it) ? it : [it, ''];
    return `\n          <li${st ? ` data-st="${st}"` : ''}><span class="escopo__n" aria-hidden="true">${pad2(k + 1)}</span><span>${esc(txt)}${LBL[st] ? `<small style="display:block;margin-top:8px">${LBL[st]}</small>` : ''}</span></li>`;
  }).join('');
  const fases = Object.keys(FASES).filter(k => o.fotos.some(f => f.fase === k));
  const filtros = fases.length > 1 ? [['', 'Tudo', o.fotos.length], ...fases.map(k => [k, FASES[k], o.fotos.filter(f => f.fase === k).length])]
    .map(([k, l, n], i) => `<button type="button" data-f="${k}" aria-pressed="${i === 0}">${l}<span>${n}</span></button>`).join('') : '';
  const wide = o.fotos.filter(f => f.w > f.h).length > o.fotos.length / 2;
  const fotos = o.fotos.map((f, i) => `\n        <button class="ogal__item" type="button" data-n="${pad2(i + 1)}" data-fase="${f.fase || ''}" data-cap="${esc(f.legenda || '')}" aria-label="Ampliar foto: ${esc(f.legenda || o.nome)}"><img src="${M(f.src)}" alt="${esc(f.alt || f.legenda || o.nome)}" width="${f.w}" height="${f.h}" loading="lazy" decoding="async"><span class="ogal__cap" aria-hidden="true">${esc(f.legenda || '')}</span></button>`).join('');
  const nx = OBRAS[(idx + 1) % OBRAS.length], nc = coverOf(nx);
  const nxM = f => R + media(nx, f);

  const main = `
  <section class="oh" aria-labelledby="oh-title">
    <picture class="oh__bg" style="--pos:${o.heroDesktop ? '50% 50%' : esc(o.capaPos || '50% 50%')};--pos-m:${esc(o.capaPos || '50% 50%')}"><source media="(max-width: 767px)" srcset="${M(c.src)}"><img src="${M(hero)}" alt="${esc(c.alt || o.nome)}" fetchpriority="high" decoding="async"></picture>
    <div class="wrap oh__inner">
      <div class="oh__copy">
        <nav class="crumbs mono" aria-label="Você está em"><a href="${R}">Início</a><span>/</span><a href="${R}#obras">Obras</a><span>/</span><span aria-current="page">${esc(o.nome)}</span></nav>
        <div class="oh__tags"><span class="chip">${esc(o.tipo)}</span><span class="chip">${esc(o.uso)}</span><span class="st${live ? ' is-live' : ''}">${esc(o.situacao)}</span></div>
        <h1 class="h1 oh__title" id="oh-title">${esc(o.nome)}</h1>
        <p class="lead oh__lead">${esc(o.resumo || '')}</p>
        <div class="oh__ctas"><a class="btn btn--primary" href="#galeria"><span class="btn__t">${soProjeto(o) ? 'Ver as perspectivas' : 'Ver fotos da obra'}</span>${BTN_IC}</a><a class="btn btn--ghost" href="${R}#orcamento">Quero uma obra assim</a></div>
      </div>
      <dl class="oh__spec">${spec.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
    </div>
  </section>

  <section class="section osobre" aria-labelledby="osobre-title">
    <div class="wrap">
      <div class="oidx"><span class="mono oidx__n">01</span><span class="mono">Sobre a obra</span></div>
      <div class="osobre__grid">
        <h2 class="h2 osobre__title" id="osobre-title">${esc(o.titulo || o.nome)}</h2>
        <div class="osobre__p">${(o.texto || []).map(p => `<p>${esc(p)}</p>`).join('')}</div>
      </div>
      <div class="escopo">
        <div class="escopo__head"><span class="mono escopo__t" id="escopo-title">${esc(o.escopoTitulo || 'O que foi feito')}</span><span class="mono muted">${pad2((o.escopo || []).length)} ${(o.escopo || []).length === 1 ? 'item' : 'itens'}</span></div>
        <ol class="escopo__list${!live && !soProjeto(o) ? ' is-done' : ''}" aria-labelledby="escopo-title">${escopo}
        </ol>
      </div>
    </div>
  </section>

  <section class="section ogal" id="galeria" aria-labelledby="ogal-title">
    <div class="wrap">
      <div class="oidx"><span class="mono oidx__n">02</span><span class="mono">Galeria</span><span class="mono muted oidx__r">${registro(o)}</span></div>
      <div class="ogal__head">
        <h2 class="h2" id="ogal-title">${esc(o.galeriaTitulo || (soProjeto(o) ? 'Perspectivas do projeto.' : 'Fotos da obra.'))}</h2>
        <div class="ogal__filters" id="ogalFilters" role="group" aria-label="Filtrar fotos">${filtros}</div>
      </div>
      <div class="ogal__grid${wide ? ' is-wide' : ''}" id="ogalGrid">${fotos}
      </div>
    </div>
  </section>
${o.video ? `
  <section class="section dark ovideo" id="video" aria-labelledby="ovideo-title">
    <div class="wrap ovideo__grid">
      <div class="ovideo__copy">
        <div class="oidx oidx--dark"><span class="mono oidx__n">03</span><span class="mono">Vídeo da obra</span></div>
        <h2 class="h2" id="ovideo-title">Um giro pela obra.</h2>
        <p class="lead muted">${esc(o.video.texto || '')}</p>
      </div>
      <div class="ovideo__frame">
        <img class="ovideo__poster" src="${M(o.video.poster)}" alt="" decoding="async" loading="lazy">
        <video id="oVideo" src="${M(o.video.src)}" muted playsinline webkit-playsinline loop preload="none" disablepictureinpicture disableremoteplayback aria-label="Vídeo da obra ${esc(o.nome)}, sem som"></video>
        <button class="ovideo__btn" id="oVideoBtn" type="button" aria-label="Pausar vídeo"><svg class="i-pause" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10M11 3v10" stroke="currentColor" stroke-width="2"/></svg><svg class="i-play" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l8 5-8 5z" fill="currentColor"/></svg></button>
        <span class="ovideo__bar" aria-hidden="true"><i id="oVideoBar"></i></span>
      </div>
    </div>
  </section>
` : ''}
  <section class="section octa" aria-labelledby="octa-title">
    <div class="wrap octa__grid">
      <div class="octa__copy">
        <span class="mono eyebrow muted">Próximo passo</span>
        <h2 class="h2" id="octa-title">Quer uma obra assim?</h2>
        <p class="lead muted">Conte o que você quer construir ou reformar. Um engenheiro da Meger responde com os próximos passos e o que precisa para o orçamento.</p>
      </div>
      <div class="octa__btns">
        <a class="btn btn--primary" href="${R}#orcamento"><span class="btn__t">Pedir orçamento</span>${BTN_IC}</a>
        <a class="btn btn--line" href="${EMPRESA.whatsapp}" target="_blank" rel="noopener">${WA}Falar no WhatsApp</a>
      </div>
    </div>
  </section>

  <section class="onx" aria-label="Próxima obra">
    <a class="onx__card" href="${R}obras/${nx.slug}/">
      <picture><source media="(max-width: 767px)" srcset="${nxM(nc.src)}"><img src="${nxM(nx.heroDesktop || nc.src)}" alt="" loading="lazy" decoding="async" style="object-position:${nx.heroDesktop ? '50% 50%' : esc(nx.capaPos || '50% 50%')}"></picture>
      <div class="wrap onx__in">
        <span class="mono onx__k">Próxima obra <b>${pad2(OBRAS.indexOf(nx) + 1)} / ${pad2(OBRAS.length)}</b></span>
        <span class="onx__name">${esc(nx.nome)}</span>
        <span class="onx__meta mono">${esc(nx.tipo)} · ${esc(nx.uso)} · ${esc(nx.situacao)}</span>
        <span class="onx__go" aria-hidden="true">${ARROW}${ARROW}</span>
      </div>
    </a>
  </section>
`;
  const pageLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': url, url, name: titulo, description: descricao, inLanguage: 'pt-BR', isPartOf: { '@id': WEBSITE['@id'] },
      primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE}/${media(o, hero)}` },
      about: { '@type': 'CreativeWork', name: o.nome, genre: `${o.tipo} ${o.uso.toLowerCase()}`, creator: { '@id': ORG['@id'] },
        image: o.fotos.map(f => `${SITE}/${media(o, f.src)}`), ...(o.local ? { locationCreated: { '@type': 'Place', name: o.local } } : {}) } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Obras', item: `${SITE}/#obras` },
      { '@type': 'ListItem', position: 3, name: o.nome, item: url } ] },
    ORG, WEBSITE ] };
  const seo = headTags({ titulo, descricao, url, imagem: ogImage(o), tipo: 'article',
    extra: `\n  <link rel="preload" as="image" href="${M(hero)}" media="(min-width: 768px)">\n  <link rel="preload" as="image" href="${M(c.src)}" media="(max-width: 767px)">` }) + '  ' + ld(pageLd) + '\n  ';
  write(`obras/${o.slug}/index.html`, frame(R, { seo, main, scripts: libs(R), page: 'obra' }));
});

/* ---------- 404 (caminhos absolutos, porque pode ser servida em qualquer endereço) ---------- */
write('404.html', frame('/', { page: 'obra', scripts: libs('/'),
  seo: `\n  <title>Página não encontrada | ${EMPRESA.nome}</title>\n  <meta name="description" content="Esta página não existe ou mudou de endereço.">\n  <meta name="robots" content="noindex">\n  `,
  main: `
  <section class="nf" aria-labelledby="nf-title">
    <div class="wrap nf__in">
      <span class="mono eyebrow muted">Erro 404</span>
      <h1 class="h1" id="nf-title">Página não encontrada.</h1>
      <p class="lead muted">O endereço pode ter mudado. Volte para o início ou veja as obras recentes.</p>
      <div class="nf__btns"><a class="btn btn--primary" href="/"><span class="btn__t">Ir para o início</span>${BTN_IC}</a><a class="btn btn--ghost" href="/#obras">Ver obras</a></div>
    </div>
  </section>
` }));

/* ---------- sitemap e robots ---------- */
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url><loc>${SITE}/</loc><lastmod>${hoje}</lastmod><priority>1.0</priority></url>
${OBRAS.map(o => `  <url><loc>${SITE}/obras/${o.slug}/</loc><lastmod>${hoje}</lastmod><priority>0.8</priority>${o.fotos.slice(0, 10).map(f => `<image:image><image:loc>${SITE}/${media(o, f.src)}</image:loc></image:image>`).join('')}</url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /conteudo-obras/\nDisallow: /tools/\n\nSitemap: ${SITE}/sitemap.xml\n`);
