# Meger Engenharia · spec do projeto

Leia este arquivo inteiro antes de qualquer tarefa. Ele vale para qualquer IA que trabalhe neste projeto (Claude, Copilot, Cursor).

Site institucional da Meger Engenharia (construção e reforma, Curitiba e região). Padrão de entrega: site de agência premium. Nada pode parecer template ou feito por IA.

---

## 1. Economia de tokens (regra obrigatória)

1. Não leia arquivos inteiros sem necessidade. Use busca (grep, Ctrl+Shift+F) e leia só o trecho que vai mudar.
2. Não releia um arquivo que você acabou de editar.
3. Edite com diffs pequenos. Nunca reescreva um arquivo inteiro para mudar poucas linhas.
4. Não gere código, texto ou arquivos que não foram pedidos: sem README extra, sem comentários longos, sem "versão alternativa".
5. Uma verificação por mudança: um print no desktop (1440) e um no celular (390) quando mexer em layout. Sem ciclos de print repetidos.
6. Respostas curtas: o que mudou, em qual arquivo, e o que falta. Sem resumo do que o usuário já viu.
7. Se o pedido for ambíguo e a escolha errada custar retrabalho, pergunte antes. Se for pequeno, escolha o padrão deste arquivo e siga.
8. Não instale dependência nem framework. O projeto é HTML, CSS e JS puros. O único script é `node tools/gerar-paginas.js` (sem dependências).

## 2. Copy: proibido texto com cara de IA

Idioma: português do Brasil, frases curtas, voz ativa, "você" para o cliente.

Proibido:
- Travessão (— ou –) em frases. Use ponto, vírgula ou dois-pontos.
- Palavras vazias: solução completa, excelência, qualidade e compromisso, inovador, transformar, jornada, experiência única, sonho, do início ao fim, potencializar, elevar, desbloquear, no coração de, comprometidos com, referência no mercado.
- Estruturas de IA: "Mais do que X, Y", trios de adjetivos ("rápido, seguro e eficiente"), pergunta retórica no começo de seção, exclamação, emoji.
- Dado inventado: número, prazo, área, nota, depoimento ou cliente que não foi informado. Use `[a confirmar]` e avise.

Obrigatório:
- Fato concreto no lugar de adjetivo: "prazo no contrato", "cada nota fiscal no portal", "CNO e CVCO por nossa conta".
- Títulos (H2) curtos, em afirmação, até 6 palavras quando possível.
- CTA com verbo e objeto: "Pedir orçamento", "Ver obras", "Falar com um engenheiro".

## 3. Tokens de design (fonte: `css/styles.css`, bloco `:root`)

Use sempre as variáveis. Não crie cor, fonte ou espaçamento novo sem registrar aqui.

**Cores**
| Token | Valor | Uso |
|---|---|---|
| `--g-900` | #16181B | fundo escuro, texto principal no claro |
| `--g-800` / `--g-700` | #1E2024 / #2A2D32 | superfícies escuras |
| `--c-50` | #F4F3F0 | fundo claro padrão |
| `--c-100` / `--c-200` | #ECEAE6 / #E2E0DB | divisórias, bordas |
| `--c-600` | #5A5D62 | texto secundário no claro |
| `--sinal` | #FD9500 | laranja da marca: só ação principal e acentos pequenos |
| `--sinal-600` | #9E5A00 | laranja em texto sobre fundo claro (contraste) |
| `--ok` | #1F9D6B | estado concluído / entregue |

Laranja nunca é fundo de seção inteira, exceto o card "Quer uma obra assim?". No máximo um botão laranja por bloco.

**Espaçamento:** só múltiplos de 4, preferindo a escala de 8: `--s-1` 4 · `--s-2` 8 · `--s-3` 16 · `--s-4` 24 · `--s-5` 32 · `--s-6` 48 · `--s-7` 64 · `--s-8` 96 · `--s-9` 128.
- Seções: 128px de padding vertical no desktop, 96px no celular. Duas seções claras seguidas ganham uma linha de 1px entre elas no celular.
- Gutter: 80px desktop, 32px tablet, 16px celular. Largura máxima do conteúdo: 1280px.
- Gap entre cards: 16px. Entre título e conteúdo de seção: 64px (48px no celular).

**Tipografia**
- Display: Barlow Condensed, maiúsculas, em H1 e H2. H1 `clamp(48px, 7vw, 112px)`, line-height .9. H2 `clamp(32px, 4vw, 52px)`, line-height 1.
- Texto: Inter. Corpo 16px/24px (18px/28px no desktop). Lead 20px/32px, peso 300.
- Rótulos técnicos: IBM Plex Mono, maiúsculas, 12px/16px, letter-spacing .06em.
- Escala permitida: 12, 14, 16, 18, 20, 24, 28, 32, 40, 48 e os `clamp` acima. Line-height sempre múltiplo de 4.
- O CSS ainda tem tamanhos fora da escala (11, 13, 15, 17, 19, 21, 22px). Ao mexer num desses trechos, migre para o valor da escala mais próximo.

**Forma:** raio de 4px em tudo (botões, cards, imagens). Bordas de 1px. Sombras só em elementos flutuantes (WhatsApp, toast, mídia do hero).

## 4. Componentes existentes (reutilize, não recrie)

- Botões: `.btn--primary` (laranja, com `.btn__ic` de seta), `.btn--ghost` (sobre mídia/escuro), `.btn--line` (contorno). Altura mínima 48px.
- `.eyebrow` (rótulo mono com quadrado laranja) acima de todo H2 e do H1.
- `.section`, `.section__head`, `.wrap`, `.dark`, `.cta-row` (fecha seção com frase + botões).
- Obras: `.ocard` (card 3:4), página `.oh` (hero da obra), `.escopo`, `.ogal` (galeria + lightbox), `.ovideo`.
- Status: `.st` (bolinha verde = entregue, laranja pulsando = em andamento). `.chip` para tipo/uso.
- FAQ: `.qa` (acordeão, um aberto por vez).

## 5. Heurísticas de Nielsen aplicadas aqui

1. **Visibilidade do status:** preloader com %, nav compacta ao rolar, status da obra (Entregue / Em andamento / fase atual), toast quando algo ainda não existe.
2. **Linguagem do usuário:** "Pedir orçamento", não "Solicitar proposta comercial". Termos técnicos (CNO, CVCO) sempre explicados.
3. **Controle e liberdade:** botão voltar do navegador funciona entre início e obras; Esc fecha menu e lightbox; vídeo tem pausa.
4. **Consistência:** mesmo botão, mesmo raio, mesmo eyebrow em todas as seções.
5. **Prevenção de erro:** formulário em 2 passos, validação no campo, máscara de WhatsApp.
6. **Reconhecer em vez de lembrar:** ficha da obra no topo (tipo, uso, local, situação), breadcrumbs.
7. **Eficiência:** CTA de orçamento sempre visível (nav e barra fixa no celular), WhatsApp flutuante.
8. **Estética minimalista:** um assunto por seção, uma ação principal por bloco, nada decorativo sem função.
9. **Recuperação de erro:** mensagens de erro em português, no campo, dizendo como corrigir.
10. **Ajuda:** FAQ e "Falar com um engenheiro".

## 6. O que denuncia "site feito por IA" (não fazer)

- Gradiente roxo/azul, glow, blobs, glassmorphism em tudo (vidro só na nav, chips e controles sobre mídia).
- Grade de 3 cards com ícone genérico + título + 2 linhas. Ícone de emoji ou de biblioteca sem ajuste.
- Tudo centralizado. Prefira grids assimétricos (7/5, 5/7) e texto alinhado à esquerda.
- Raio grande (16px+), sombras difusas em cards, bordas coloridas.
- Imagem de banco, mockup genérico, depoimento ou número inventado.
- Animação em tudo. Movimento só quando ajuda a entender (entrada de seção, progresso, 3D do processo).

O que dá cara de engenharia (usar): rótulos mono, linhas de cota, grade técnica sutil, números tabulares, fotos reais de obra, ficha técnica.

## 7. Mídia

- Nunca esticar: `object-fit: cover` com `object-position` ajustado. Fotos em retrato vão em cards 3:4.
- Fotos: `.webp`, até ~300 KB. Vídeo de celular costuma vir em 9:16 gravado como quadrado: sempre converter respeitando o formato real (nunca achatar).
- Favicon: `media/icons/` (SVG + PNG 32 + apple-touch-icon). Fundos de hero: 1920×1080 (desktop) e retrato (celular).
- Vídeos: H.264 `.mp4`, sem áudio, `muted playsinline`, faststart. Hero do desktop até 8 MB (1920 x 1080, 30 fps); demais vídeos até 4 MB. Vídeo de fundo fica invisível até começar a tocar (iPhone em economia de bateria não mostra botão de play).
- Vídeo do hero só começa depois do preloader.
- Nomes: `media/obras/<slug>/<slug>-<ambiente>.webp`. Dados das obras só em `js/obras.js`.
- Todo `<img>` com `width`, `height` e `alt` descritivo (o que aparece na foto, não "imagem da obra").

## 8. Acessibilidade e performance

- Contraste mínimo 4.5:1 no texto. Laranja em texto sobre claro usa `--sinal-600`.
- Celular: menos é mais. Sem faixa de cidades, um botão por bloco (os `.btn--line` das `.cta-row__btns` somem), nenhum texto abaixo de 12px; sem barra fixa de orçamento (só o botão flutuante do WhatsApp); o "Pedir orçamento" fica dentro do menu. Ajustes ficam no bloco "Ajuste fino do celular" no fim do CSS.
- Alvo de toque mínimo 44px (botões já têm 48px). `:focus-visible` sempre visível.
- `prefers-reduced-motion`: desliga Lenis e animações decorativas.
- Metas: LCP < 2,5 s, CLS < 0,1. Imagens fora da tela com `loading="lazy"`. Three.js carrega só perto da seção.

## 9. Estrutura e fluxo de trabalho

```
index.html              página inicial (blocos <!--@seo--> e <!--@cards--> são gerados)
obras/<slug>/index.html página de cada obra (GERADA, não editar à mão)
404.html, sitemap.xml, robots.txt  (GERADOS)
css/styles.css          tokens + estilos
js/app.js               página inicial: preloader, Lenis, GSAP, 3D, simulador, formulário
js/obra.js              páginas de obra: galeria, lightbox, vídeo, animações
js/obras.js             dados das obras (texto, fotos, vídeo). Fonte única.
tools/gerar-paginas.js  gera páginas de obra, cards, SEO, sitemap
media/                  vídeos, imagens, og/ (imagens de compartilhamento 1200x630), icons/
conteudo-obras/         originais da engenharia (o site não usa)
```

**SEO (obrigatório):**
- Toda obra é uma página real em `/obras/<slug>/`. Nunca voltar para rotas com `#`.
- Depois de mudar `js/obras.js`, o cabeçalho ou o rodapé do `index.html`, rode `node tools/gerar-paginas.js`.
- Cada página tem um único H1, title e description próprios, canonical, Open Graph e JSON-LD (gerados).
- Domínio fica na constante `SITE` do gerador. Imagem de compartilhamento: `media/og/<slug>.jpg` (1200x630); sem ela, usa o fundo da obra.

- Bibliotecas por CDN: GSAP 3.13 + ScrollTrigger, Lenis 1.3.26, Three.js 0.158 (ES module). Não trocar versão sem motivo.
- Teste em 1440px e 390px antes de dar uma tarefa por concluída.
- Rode por servidor local (Live Server), nunca por `file://`.

## 10. Checklist de entrega (padrão de site de 10 mil dólares)

- [ ] Espaçamentos e fontes dentro da escala de 4/8.
- [ ] Um único botão laranja por bloco, CTA com verbo.
- [ ] Copy sem travessão, sem palavra da lista proibida, sem dado inventado.
- [ ] Hierarquia clara: eyebrow, título, texto, ação.
- [ ] Desktop e celular conferidos. Nada estourando, nada esticado.
- [ ] Sem erro no console.
- [ ] CSS com chaves balanceadas: uma `}` sobrando anula a regra seguinte sem dar erro (já quebrou o preloader).
- [ ] Imagens com alt, vídeos mudos e inline.
