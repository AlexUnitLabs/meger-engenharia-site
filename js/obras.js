/* Meger Engenharia · obras do portfólio
   ------------------------------------------------------------------
   Cada obra vira um card na página inicial e uma página própria (#obra-<slug>).
   As mídias ficam em media/obras/<slug>/ com o nome da obra na frente.

   Para adicionar uma obra:
   1. Crie a pasta media/obras/<slug>/ e coloque as fotos (.webp) e o vídeo (.mp4).
   2. Copie um bloco abaixo, troque os textos e a lista de fotos.
   3. A ordem desta lista é a ordem dos cards na página inicial.

   Campos:
   tipo      'Construção' ou 'Reforma'
   uso       'Residencial' ou 'Comercial'
   situacao  'Entregue' ou 'Em andamento'
   local     bairro e cidade. Deixe '' enquanto não tiver certeza: a linha some da página.
   capa      foto do card e do fundo do topo da página no celular. capaPos ajusta o enquadramento (x y).
   heroDesktop  fundo do topo da página no computador (1920 x 1080, horizontal). Opcional: sem ele, usa a capa.
   escopo    lista de serviços. Em obra em andamento use ['Etapa', 'feito' | 'atual' | 'proxima'].
   fotos     fase: 'obra' (durante), 'pronto' (entregue) ou 'projeto' (imagem 3D).
             w e h são a largura e a altura reais do arquivo, para a página não pular ao carregar.
   ------------------------------------------------------------------ */
window.MEGER_OBRAS = [
  {
    slug: 'tenis-de-mesa-performance',
    heroDesktop: 'tenis-de-mesa-performance-hero-desktop.webp',
    nome: 'Tênis de Mesa Performance',
    tipo: 'Construção',
    uso: 'Comercial',
    situacao: 'Entregue',
    local: '',
    capa: 'tenis-de-mesa-performance-fachada.webp',
    capaPos: '50% 50%',
    resumo: 'Loja e centro de treinamento de tênis de mesa no mesmo endereço, com fachada em vitrine e salão de jogo com piso esportivo.',
    titulo: 'Do galpão vazio ao dia da inauguração.',
    texto: [
      'A Tênis de Mesa Performance precisava juntar venda e treino no mesmo espaço. O galpão foi dividido em dois usos: a loja na frente, aberta para a rua pela vitrine, e o salão de jogo ao fundo, com pé-direito alto e luz uniforme sobre as mesas.',
      'Durante a obra entraram os fechamentos, as instalações elétricas, a iluminação, a pintura e a estrutura do banheiro. No acabamento vieram o piso esportivo vermelho da área de treino e a fachada com a identidade da marca.',
      'O espaço foi entregue pronto para receber alunos, atletas e clientes no dia da inauguração.',
    ],
    escopoTitulo: 'O que foi feito',
    escopo: [
      'Adequação do galpão para loja e área de treino',
      'Instalações elétricas e iluminação',
      'Fechamentos, pintura e revestimentos',
      'Piso esportivo da área de treino',
      'Banheiro e áreas de apoio',
      'Fachada com vitrine',
    ],
    video: null,
    fotos: [
      { src: 'tenis-de-mesa-performance-fachada.webp', w: 810, h: 1080, fase: 'pronto', legenda: 'Fachada com vitrine', alt: 'Fachada da loja Tênis de Mesa Performance, com vitrine de vidro e o nome da marca na parede cinza' },
      { src: 'tenis-de-mesa-performance-area-de-treino.webp', w: 810, h: 1080, fase: 'pronto', legenda: 'Área de treino', alt: 'Salão de treino com piso vermelho, mesas de tênis de mesa e iluminação linear no teto metálico' },
      { src: 'tenis-de-mesa-performance-inauguracao.webp', w: 608, h: 1080, fase: 'pronto', legenda: 'Dia da inauguração', alt: 'Entrada da loja no dia da inauguração, com arco de balões azuis e brancos e a vitrine com a frase Game On' },
      { src: 'tenis-de-mesa-performance-salao-de-treino.webp', w: 735, h: 980, fase: 'pronto', legenda: 'Salão de treino', alt: 'Salão de treino visto da entrada, com piso vermelho, mesas de tênis de mesa, parede azul e cobertura metálica com iluminação linear' },
      { src: 'tenis-de-mesa-performance-mezanino.webp', w: 735, h: 980, fase: 'pronto', legenda: 'Mezanino', alt: 'Mezanino com guarda-corpo metálico e escada, com vista para o salão de treino e a vitrine da fachada' },
      { src: 'tenis-de-mesa-performance-vestiario.webp', w: 735, h: 980, fase: 'pronto', legenda: 'Vestiário', alt: 'Vestiário com armários brancos e azuis com chave, bancada preta com cuba e iluminação linear no forro azul' },
      { src: 'tenis-de-mesa-performance-loja.webp', w: 608, h: 1080, fase: 'pronto', legenda: 'Loja', alt: 'Loja com estantes metálicas de produtos, camisetas penduradas e balcão de madeira' },
      { src: 'tenis-de-mesa-performance-banheiro.webp', w: 810, h: 1080, fase: 'pronto', legenda: 'Banheiro', alt: 'Banheiro com parede azul, bancada preta, gabinete de madeira e iluminação linear no forro' },
      { src: 'tenis-de-mesa-performance-obra-galpao-01.webp', w: 810, h: 1080, fase: 'obra', legenda: 'Galpão durante a obra', alt: 'Galpão durante a obra, com andaime, paredes em pintura e cobertura metálica aparente' },
      { src: 'tenis-de-mesa-performance-obra-galpao-02.webp', w: 810, h: 1080, fase: 'obra', legenda: 'Galpão durante a obra', alt: 'Vista longa do galpão em obra, com andaime ao fundo, parede azul começando a ser pintada e luminárias instaladas' },
    ],
  },
  {
    slug: 'apartamento-paulo-cris',
    heroDesktop: 'apartamento-paulo-cris-hero-desktop.webp',
    nome: 'Apartamento Paulo e Cris',
    tipo: 'Reforma',
    uso: 'Residencial',
    situacao: 'Entregue',
    local: '',
    capa: 'apartamento-paulo-cris-cozinha.webp',
    capaPos: '50% 50%',
    resumo: 'Reforma completa de apartamento, com cozinha integrada ao jantar, porcelanato na área social, forro com iluminação embutida e marcenaria sob medida.',
    titulo: 'Um apartamento refeito do piso ao forro.',
    texto: [
      'A reforma integrou a cozinha ao jantar e à sala. A bancada em ilha ficou no centro da área social e o porcelanato claro segue pelo piso de todos esses ambientes, sem divisão entre eles.',
      'Nos quartos, o piso amadeirado e o forro com iluminação embutida deixam o ambiente mais acolhedor. O banheiro ganhou box de vidro e bancada com gabinete suspenso. O closet recebeu portas altas e perfis de LED no forro.',
      'O vídeo mostra o apartamento durante a obra e os ambientes já finalizados.',
    ],
    escopoTitulo: 'O que foi feito',
    escopo: [
      'Integração da cozinha com o jantar',
      'Instalações elétricas e hidráulicas',
      'Forro de gesso com iluminação embutida',
      'Porcelanato e revestimentos',
      'Banheiro com box de vidro',
      'Closet e marcenaria sob medida',
    ],
    video: {
      src: 'apartamento-paulo-cris-reforma.mp4',
      poster: 'apartamento-paulo-cris-reforma-poster.webp',
      preview: 'apartamento-paulo-cris-preview.mp4',
      texto: 'Da obra em andamento aos ambientes prontos para morar, em poucos segundos.',
    },
    fotos: [
      { src: 'apartamento-paulo-cris-cozinha.webp', w: 810, h: 1080, fase: 'pronto', legenda: 'Cozinha integrada com ilha', alt: 'Cozinha com ilha em pedra clara, cooktop, coifa e geladeira de inox, piso de porcelanato marmorizado' },
      { src: 'apartamento-paulo-cris-jantar.webp', w: 810, h: 1080, fase: 'pronto', legenda: 'Jantar e sala', alt: 'Sala de jantar com mesa de vidro, piso de porcelanato marmorizado e janelas amplas' },
      { src: 'apartamento-paulo-cris-banheiro.webp', w: 810, h: 1080, fase: 'pronto', legenda: 'Banheiro', alt: 'Banheiro com box de vidro, bancada com cuba de apoio e gabinete suspenso' },
      { src: 'apartamento-paulo-cris-quarto.webp', w: 735, h: 980, fase: 'pronto', legenda: 'Quarto', alt: 'Quarto com piso amadeirado, spots no forro, ar-condicionado e janela com vista da cidade, ainda com móveis embalados' },
      { src: 'apartamento-paulo-cris-closet.webp', w: 810, h: 1080, fase: 'pronto', legenda: 'Closet', alt: 'Corredor do closet com portas altas e perfis de LED embutidos no forro' },
      { src: 'apartamento-paulo-cris-durante-a-obra.webp', w: 608, h: 1080, fase: 'obra', legenda: 'Durante a obra', alt: 'Sala do apartamento durante a reforma, com piso protegido, ferramentas e profissionais trabalhando' },
    ],
  },
  {
    slug: 'casa-eloiza-fernando',
    heroDesktop: 'casa-eloiza-fernando-hero-desktop.webp',
    nome: 'Casa Eloiza e Fernando',
    tipo: 'Construção',
    uso: 'Residencial',
    situacao: 'Em andamento',
    fase: 'Alvenaria',
    local: '',
    capa: 'casa-eloiza-fernando-estrutura-e-escada.webp',
    capaPos: '50% 50%',
    resumo: 'Casa em construção. A estrutura, as lajes e a escada já estão concretadas e as paredes de bloco cerâmico estão subindo.',
    titulo: 'Estrutura pronta, paredes subindo.',
    texto: [
      'A casa de Eloiza e Fernando está em obra. A estrutura em concreto armado, com pilares, vigas e lajes, já foi executada, junto com a escada que liga os pavimentos.',
      'Agora a equipe trabalha na alvenaria de blocos cerâmicos. Os eletrodutos já passam pela estrutura, prontos para as instalações da próxima etapa.',
      'O vídeo e as fotos abaixo mostram a obra nesta fase.',
    ],
    escopoTitulo: 'Etapas da obra',
    escopo: [
      ['Fundação', 'feito'],
      ['Estrutura e lajes', 'feito'],
      ['Escada', 'feito'],
      ['Alvenaria', 'atual'],
      ['Instalações', 'proxima'],
      ['Cobertura e acabamentos', 'proxima'],
    ],
    video: {
      src: 'casa-eloiza-fernando-obra.mp4',
      poster: 'casa-eloiza-fernando-obra-poster.webp',
      preview: 'casa-eloiza-fernando-preview.mp4',
      texto: 'Uma volta pela obra, da placa na entrada até a laje de cobertura.',
    },
    fotos: [
      { src: 'casa-eloiza-fernando-estrutura-e-escada.webp', w: 810, h: 1080, fase: 'obra', legenda: 'Estrutura e escada', alt: 'Estrutura de concreto da casa vista de cima, com a escada concretada e paredes de bloco cerâmico começando' },
      { src: 'casa-eloiza-fernando-alvenaria-terreo.webp', w: 810, h: 1080, fase: 'obra', legenda: 'Alvenaria no térreo', alt: 'Térreo em obra com pilares de concreto, primeiras fiadas de bloco cerâmico e a escada ao fundo' },
      { src: 'casa-eloiza-fernando-estrutura-pilares.webp', w: 608, h: 1080, fase: 'obra', legenda: 'Pilares e vigas', alt: 'Pilares e vigas de concreto com eletroduto laranja embutido e sacos de material no chão' },
      { src: 'casa-eloiza-fernando-pavimento-superior.webp', w: 608, h: 1080, fase: 'obra', legenda: 'Pavimento superior', alt: 'Pavimento superior com laje nervurada, pilares e escoras metálicas empilhadas' },
      { src: 'casa-eloiza-fernando-laje-de-cobertura.webp', w: 608, h: 1080, fase: 'obra', legenda: 'Laje de cobertura', alt: 'Laje de cobertura concretada, com o bairro e o céu nublado ao fundo' },
      { src: 'casa-eloiza-fernando-terreo-pilares-e-blocos.webp', w: 735, h: 980, fase: 'obra', legenda: 'Térreo: pilares e blocos', alt: 'Térreo com pilares de concreto, primeiras fiadas de bloco cerâmico marcando os cômodos e a escada ao fundo' },
      { src: 'casa-eloiza-fernando-vao-da-escada.webp', w: 735, h: 980, fase: 'obra', legenda: 'Vão da escada', alt: 'Vão da escada visto do pavimento superior, com laje treliçada aparente, paredes rebocadas e blocos cerâmicos no piso' },
      { src: 'casa-eloiza-fernando-quarto-instalacoes.webp', w: 735, h: 980, fase: 'obra', legenda: 'Quarto com instalações', alt: 'Quarto em obra com eletrodutos laranja passando pela laje, paredes rebocadas e vão da janela aberto' },
    ],
  },
  {
    slug: 'condominio-jardim-social',
    heroDesktop: 'condominio-jardim-social-hero-desktop.webp',
    nome: 'Condomínio Jardim Social',
    tipo: 'Construção',
    uso: 'Residencial',
    situacao: 'Em andamento',
    local: 'Jardim Social, Curitiba',
    capa: 'condominio-jardim-social-fachada-lateral.webp',
    capaPos: '42% 50%',
    resumo: 'Condomínio de sobrados com rua interna arborizada, cozinha integrada ao deck, terraço na cobertura e espaço de academia.',
    titulo: 'Morar em casa, com rua interna e muito verde.',
    texto: [
      'O Condomínio Jardim Social reúne sobrados em sequência, com acesso por uma rua interna de pedra e vegetação entre as casas.',
      'Cada sobrado tem cozinha integrada a um deck com jardim vertical e terraço na cobertura, com deck de madeira e vegetação. O projeto também inclui um espaço de academia aberto para o terraço.',
      'As imagens desta página são perspectivas do projeto.',
    ],
    escopoTitulo: 'O projeto',
    escopo: [
      'Sobrados em sequência',
      'Rua interna com paisagismo',
      'Cozinha integrada ao deck',
      'Terraço na cobertura',
      'Jardins verticais',
      'Espaço de academia',
    ],
    video: null,
    galeriaTitulo: 'Perspectivas do projeto.',
    fotos: [
      { src: 'condominio-jardim-social-fachada-sobrados.webp', w: 1440, h: 1080, fase: 'projeto', legenda: 'Fachada dos sobrados', alt: 'Perspectiva da fachada dos sobrados em sequência, com garagens, carros e vegetação na cobertura' },
      { src: 'condominio-jardim-social-vista-aerea.webp', w: 1724, h: 1080, fase: 'projeto', legenda: 'Vista aérea', alt: 'Perspectiva aérea do condomínio entre as árvores do bairro, com a cidade ao fundo' },
      { src: 'condominio-jardim-social-rua-interna.webp', w: 1440, h: 1080, fase: 'projeto', legenda: 'Rua interna', alt: 'Perspectiva da rua interna de pedra entre os sobrados, com carro, bicicleta e jardins' },
      { src: 'condominio-jardim-social-fachada-lateral.webp', w: 1440, h: 1080, fase: 'projeto', legenda: 'Fachada lateral', alt: 'Perspectiva da fachada lateral com volume vermelho, escada externa e jardim vertical' },
      { src: 'condominio-jardim-social-espaco-gourmet.webp', w: 2168, h: 980, fase: 'projeto', legenda: 'Espaço gourmet', alt: 'Perspectiva do espaço gourmet com ilha de mármore, banquetas de madeira, mesa comprida e porta de correr aberta para o jardim' },
      { src: 'condominio-jardim-social-suite.webp', w: 1568, h: 980, fase: 'projeto', legenda: 'Suíte', alt: 'Perspectiva da suíte com cama de veludo verde, armários brancos do piso ao teto, bancada de madeira e iluminação embutida no forro' },
      { src: 'condominio-jardim-social-cozinha-e-deck.webp', w: 1728, h: 1080, fase: 'projeto', legenda: 'Cozinha e deck', alt: 'Perspectiva da cozinha com mesa de jantar aberta para o deck de madeira, com lareira externa e jardim vertical' },
      { src: 'condominio-jardim-social-terraco.webp', w: 1728, h: 1080, fase: 'projeto', legenda: 'Terraço na cobertura', alt: 'Perspectiva do terraço na cobertura, com deck de madeira, jardineira em pedra verde e ambiente envidraçado' },
      { src: 'condominio-jardim-social-academia.webp', w: 2160, h: 1080, fase: 'projeto', legenda: 'Academia', alt: 'Perspectiva da academia com piso emborrachado, aparelhos e porta de vidro aberta para o terraço' },
      { src: 'condominio-jardim-social-vista-externa.webp', w: 1440, h: 1080, fase: 'projeto', legenda: 'Vista a partir do jardim', alt: 'Perspectiva dos sobrados vistos do gramado, entre árvores grandes' },
    ],
  },
];
