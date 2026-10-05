# Site Meger Engenharia (protótipo)

Protótipo navegável feito pela Unit Labs: página inicial + uma página para cada obra (`/obras/<slug>/`).

## Como rodar no VS Code

1. Abra a pasta `site` no VS Code (Arquivo > Abrir pasta).
2. Instale a extensão **Live Server** (Ritwick Dey) pela aba Extensões (Ctrl+Shift+X).
3. Clique com o botão direito em `index.html` > **Open with Live Server**, ou clique em **Go Live** na barra de status.
4. O site abre em `http://127.0.0.1:5500`.

Rode sempre por servidor local. Abrindo o `index.html` direto do Explorer (file://) os vídeos podem não carregar.

Alternativa sem extensão, com Node instalado: `npx serve .` dentro da pasta.

## Estrutura

- `index.html`: página inicial. `obras/<slug>/index.html`: páginas das obras (geradas)
- `css/styles.css`: tokens (cores, tipografia, espaçamento 8/16) e estilos
- `js/obras.js`: **dados das obras** (textos, fotos, vídeo). É o único arquivo a editar para mudar ou incluir uma obra.
- `js/app.js`: preloader, Lenis, GSAP/ScrollTrigger, 3D da seção de processo (Three.js carregado sob demanda), cards e páginas das obras, galeria, simulador e formulário
- `media/`: vídeos da hero, foto dos sócios e `media/obras/<slug>/` com as fotos e vídeos de cada obra, já otimizados e renomeados
- `conteudo-obras/`: arquivos originais enviados pela engenharia. O site não usa essa pasta.

Bibliotecas via CDN (jsDelivr): GSAP 3.13, ScrollTrigger, Lenis 1.3.26 e Three.js 0.158 (só na seção "Como trabalhamos").

## Como incluir uma obra

1. Crie `media/obras/<slug>/` (ex.: `casa-bacacheri`) e salve as fotos como `<slug>-<ambiente>.webp`.
2. Vídeo (opcional): `<slug>-obra.mp4` (H.264, sem áudio, até uns 4 MB) e uma prévia curta `<slug>-preview.mp4` (8 s) para o card.
3. Fundo do topo no computador: `<slug>-hero-desktop.webp` (1920 x 1080). No celular o fundo é a foto de capa.
4. Imagem de compartilhamento (WhatsApp, redes): `media/og/<slug>.jpg` (1200 x 630). Opcional.
5. Em `js/obras.js`, copie um bloco existente e troque nome, tipo, uso, situação, textos e fotos (com largura e altura reais).
6. No terminal, dentro da pasta `site`: `node tools/gerar-paginas.js`. Ele cria `obras/<slug>/index.html`, atualiza os cards da página inicial, o sitemap e os dados de SEO.

O gerador também carimba a versão do CSS e do JS nos links (`styles.css?v=...`), então o navegador nunca usa arquivo velho depois de uma publicação.

A ordem da lista em `js/obras.js` é a ordem dos cards. As páginas em `obras/` são geradas: não edite à mão.

## SEO e publicação

- Domínio configurado no gerador: `https://megereng.com.br` (constante `SITE` em `tools/gerar-paginas.js`). Se o domínio final for outro, troque lá e rode o gerador.
- Depois de publicar: cadastrar o site no Google Search Console e enviar `sitemap.xml`.
- `404.html` usa caminhos a partir da raiz do domínio: só funciona quando o site estiver publicado na raiz.

Os campos `tipo` (Construção ou Reforma) e `uso` (Residencial ou Comercial) já servem para os filtros da futura página de portfólio.

## Conteúdo provisório

- Textos das obras são um padrão inicial: revisar com a engenharia. Local, área e prazo das obras ainda não foram informados.
- Situação do Condomínio Jardim Social ("Em andamento") e o bairro a confirmar.
- O botão "Ver todos os projetos" mostra um aviso até a página de portfólio existir.
- Domínio `megereng.com.br` tirado do e-mail da empresa: confirmar antes de publicar.
- Tela do portal é ilustrativa. Depoimentos, CREA, prazo de garantia e fator do simulador estão como "a confirmar".
