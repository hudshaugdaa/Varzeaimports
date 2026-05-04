export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  subcategory?: string;
  sizes?: string[];
  brand: string;
  inStock: boolean;
  badge?: string;
  reviews?: Review[];
}

const base = import.meta.env.BASE_URL;
const p = (file: string) => `${base}produtos/${file}`;

export const products: Product[] = [
  {
    id: "brasil-home-2026",
    slug: "camisa-brasil-home-2026-nike",
    name: "Camisa Brasil Nike I 2026/27 Torcedor Pro Masculina",
    description: "A camisa oficial da Seleção Brasileira para a Copa do Mundo 2026. Tecnologia Dri-FIT para máximo conforto e performance. Cores vibrantes que representam o Brasil com orgulho.",
    price: 89.90,
    image: p("brasil-amarela-1.jpeg"),
    images: [
      p("brasil-amarela-1.jpeg"),
      p("brasil-amarela-2.jpeg"),
      p("brasil-amarela-3.jpeg"),
      p("brasil-amarela-4.jpeg"),
      p("brasil-amarela-5.jpeg"),
    ],
    category: "camisas",
    sizes: ["P", "M", "G", "GG", "XGG"],
    brand: "Nike",
    inStock: true,
    badge: "COPA 2026",
    reviews: [
      { id: "r1", author: "Carlos Eduardo", rating: 5, comment: "Camisa incrível! Qualidade top, material muito bom. Chegou rápido e bem embalada.", date: "2025-03-12", verified: true },
      { id: "r2", author: "Fernanda Lima", rating: 5, comment: "Comprei pra torcer na Copa, ficou perfeita! A estampa não desbota depois de lavar.", date: "2025-04-01", verified: true },
      { id: "r3", author: "Rodrigo Almeida", rating: 4, comment: "Muito boa a camisa, só achei o tecido um pouco fino, mas a qualidade compensa. Recomendo!", date: "2025-04-18", verified: true },
      { id: "r4", author: "Patricia Santos", rating: 5, comment: "Presente para o meu filho. Ele amou! Exatamente igual ao site, entrega rápida.", date: "2025-05-02", verified: true },
    ],
  },
  {
    id: "brasil-away-2026",
    slug: "camisa-brasil-away-2026-nike",
    name: "Camisa Seleção Brasil CBF II 26/27 Torcedor Nike Masculina",
    description: "Camisa II da Seleção Brasileira, modelo visitante para a temporada 2026/27. Design elegante com tecnologia Nike Dri-FIT.",
    price: 89.90,
    image: p("brasil-azul-1.jpeg"),
    images: [
      p("brasil-azul-1.jpeg"),
      p("brasil-azul-2.jpeg"),
      p("brasil-azul-3.jpeg"),
      p("brasil-azul-4.jpeg"),
    ],
    category: "camisas",
    sizes: ["P", "M", "G", "GG", "XGG"],
    brand: "Nike",
    inStock: true,
    badge: "COPA 2026",
    reviews: [
      { id: "r1", author: "Thiago Oliveira", rating: 5, comment: "Camisa azul do Brasil, difícil de encontrar. Ficou muito bonita, tecido leve e resistente.", date: "2025-03-20", verified: true },
      { id: "r2", author: "Ana Paula", rating: 4, comment: "Gostei bastante, o azul é lindo. Atendimento nota 10 e entrega super rápida!", date: "2025-04-10", verified: true },
      { id: "r3", author: "Lucas Mendes", rating: 5, comment: "Produto exatamente como nas fotos. Qualidade incrível da Nike. Super recomendo!", date: "2025-04-25", verified: true },
    ],
  },
  {
    id: "alemanha-home-2026",
    slug: "camisa-alemanha-home-2026-adidas",
    name: "Camisa Seleção Alemanha I 26/27 Torcedor Adidas Masculina",
    description: "A camisa oficial da Mannschaft para a Copa do Mundo 2026. Adidas AEROREADY garante frescor e conforto para torcer com estilo.",
    price: 89.90,
    image: p("alemanha-1.jpeg"),
    images: [
      p("alemanha-1.jpeg"),
      p("alemanha-2.jpeg"),
      p("alemanha-3.jpeg"),
      p("alemanha-4.jpeg"),
    ],
    category: "camisas",
    sizes: ["P", "M", "G", "GG", "XGG"],
    brand: "Adidas",
    inStock: true,
    badge: "COPA 2026",
    reviews: [
      { id: "r1", author: "Markus Hoffmann", rating: 5, comment: "Simplesmente perfeita! A Adidas caprichou no design. Material de qualidade e entrega rápida.", date: "2025-02-28", verified: true },
      { id: "r2", author: "Juliana Costa", rating: 5, comment: "Comprei pra meu marido que é fã da Alemanha. Ficou encantado com a qualidade!", date: "2025-03-15", verified: true },
      { id: "r3", author: "Rafael Borges", rating: 4, comment: "Camisa muito boa, tecido leve e confortável. Entrega dentro do prazo.", date: "2025-04-03", verified: true },
    ],
  },
  {
    id: "argentina-home-2026",
    slug: "camisa-argentina-home-2026-adidas",
    name: "Camisa Seleção Argentina I 26/27 Torcedor Adidas Masculina",
    description: "A camisa da Albiceleste, atual campeã mundial. Listras azuis e brancas clássicas com tecnologia Adidas AEROREADY.",
    price: 89.90,
    image: p("argentina-1.jpeg"),
    images: [
      p("argentina-1.jpeg"),
      p("argentina-2.jpeg"),
      p("argentina-3.jpeg"),
      p("argentina-4.jpeg"),
    ],
    category: "camisas",
    sizes: ["P", "M", "G", "GG", "XGG"],
    brand: "Adidas",
    inStock: true,
    badge: "COPA 2026",
    reviews: [
      { id: "r1", author: "Diego Martinez", rating: 5, comment: "A camisa dos campeões! Qualidade excelente, material macio e resistente. Igual a original.", date: "2025-03-05", verified: true },
      { id: "r2", author: "Camila Rocha", rating: 5, comment: "Comprei pra homenagear o Messi. Linda demais! Chegou super rápido e bem embalada.", date: "2025-03-22", verified: true },
      { id: "r3", author: "Gustavo Ferreira", rating: 5, comment: "Perfeita! Usei no jogo e todo mundo perguntou onde comprei. Recomendo muito!", date: "2025-04-12", verified: true },
      { id: "r4", author: "Mônica Andrade", rating: 4, comment: "Muito bonita, apenas achei o tamanho um pouco maior. Mas a qualidade é ótima!", date: "2025-04-30", verified: true },
    ],
  },
  {
    id: "mexico-home-2026",
    slug: "camisa-mexico-home-2025-adidas",
    name: "Camisa Seleção México I 25/26 Torcedor Adidas Masculina",
    description: "A camisa oficial do El Tri com design em verde escuro com detalhes em vermelho. Adidas AEROREADY para máxima performance.",
    price: 89.90,
    image: p("mexico-1.jpeg"),
    images: [
      p("mexico-1.jpeg"),
      p("mexico-2.jpeg"),
      p("mexico-3.jpeg"),
      p("mexico-4.jpeg"),
    ],
    category: "camisas",
    sizes: ["P", "M", "G", "GG", "XGG"],
    brand: "Adidas",
    inStock: true,
    badge: "COPA 2026",
    reviews: [
      { id: "r1", author: "Miguel Hernandez", rating: 5, comment: "Verde linda! Qualidade da Adidas de sempre. Entrega surpreendentemente rápida!", date: "2025-03-10", verified: true },
      { id: "r2", author: "Beatriz Cardoso", rating: 4, comment: "Presente pro meu pai. Ele adorou! Produto com ótima qualidade e acabamento.", date: "2025-04-07", verified: true },
      { id: "r3", author: "Henrique Silva", rating: 5, comment: "Camisa top demais. O verde é muito bonito ao vivo, melhor do que na foto!", date: "2025-04-20", verified: true },
    ],
  },
  {
    id: "colombia-home-2026",
    slug: "camisa-colombia-home-2025-adidas",
    name: "Camisa Seleção Colômbia I 25/26 Torcedor Adidas Masculina",
    description: "A camisa amarela vibrante da seleção colombiana. Design moderno com listras diagonais clássicas e tecnologia Adidas AEROREADY.",
    price: 89.90,
    image: p("colombia-1.jpeg"),
    images: [
      p("colombia-1.jpeg"),
      p("colombia-2.jpeg"),
      p("colombia-3.jpeg"),
      p("colombia-4.jpeg"),
    ],
    category: "camisas",
    sizes: ["P", "M", "G", "GG", "XGG"],
    brand: "Adidas",
    inStock: true,
    badge: "COPA 2026",
    reviews: [
      { id: "r1", author: "Santiago Gomez", rating: 5, comment: "Camisa muito bonita! O amarelo é vibrante e o material é de qualidade. Adorei!", date: "2025-02-20", verified: true },
      { id: "r2", author: "Larissa Nascimento", rating: 5, comment: "Comprei pra assistir a Copa. Chegou rápido e em perfeito estado. Super recomendo!", date: "2025-03-18", verified: true },
      { id: "r3", author: "Anderson Lima", rating: 4, comment: "Boa qualidade, tecido confortável. Único ponto é que o tamanho P ficou um pouco justo.", date: "2025-04-14", verified: true },
    ],
  },
  {
    id: "belgica-home-2026",
    slug: "camisa-belgica-home-2025-adidas",
    name: "Camisa Seleção Bélgica I 25/26 Torcedor Adidas Masculina",
    description: "A camisa vermelha marcante dos Diabos Vermelhos da Bélgica. Design exclusivo Adidas com tecnologia AEROREADY.",
    price: 89.90,
    image: p("belgica-1.jpeg"),
    images: [
      p("belgica-1.jpeg"),
      p("belgica-2.jpeg"),
      p("belgica-3.jpeg"),
      p("belgica-4.jpeg"),
    ],
    category: "camisas",
    sizes: ["P", "M", "G", "GG", "XGG"],
    brand: "Adidas",
    inStock: true,
    badge: "COPA 2026",
    reviews: [
      { id: "r1", author: "Kevin Devs", rating: 5, comment: "Vermelho incrível! A camisa da Bélgica sempre foi linda e essa edição 2026 superou.", date: "2025-03-08", verified: true },
      { id: "r2", author: "Isabela Torres", rating: 5, comment: "Presente para meu marido fã da Bélgica. Ficou feliz demais! Qualidade excelente.", date: "2025-04-05", verified: true },
      { id: "r3", author: "Paulo Ribeiro", rating: 4, comment: "Ótima camisa. Fica à espera da copa para usar. Qualidade da Adidas é indiscutível.", date: "2025-04-22", verified: true },
    ],
  },
  {
    id: "franca-home-2026",
    slug: "camisa-franca-home-2026-nike",
    name: "Camisa Futebol França Copa do Mundo 2026 I Torcedor Vermelha Masculina",
    description: "A camisa oficial da Seleção Francesa para a Copa do Mundo 2026. Modelo home com a clássica cor azul marinho e detalhes em vermelho e branco. Tecnologia Nike Dri-FIT para máximo conforto.",
    price: 89.90,
    image: "https://images.lojaallsports.com.br/produto/camisa-futebol-franca-copa-do-mundo-2026-i-torcedor-vermelha-masculina-1.jpg",
    images: [
      "https://images.lojaallsports.com.br/produto/camisa-futebol-franca-copa-do-mundo-2026-i-torcedor-vermelha-masculina-1.jpg",
      "https://images.lojaallsports.com.br/produto/camisa-futebol-franca-copa-do-mundo-2026-i-torcedor-vermelha-masculina-2.jpg",
      "https://images.lojaallsports.com.br/produto/camisa-futebol-franca-copa-do-mundo-2026-i-torcedor-vermelha-masculina-3.jpg",
    ],
    category: "camisas",
    sizes: ["P", "M", "G", "GG", "XGG"],
    brand: "Nike",
    inStock: true,
    badge: "COPA 2026",
    reviews: [
      { id: "r1", author: "Jean Pierre", rating: 5, comment: "Camisa da França muito bonita! A qualidade da Nike é impecável. Chegou em ótimo estado.", date: "2025-04-02", verified: true },
      { id: "r2", author: "Marcela Fonseca", rating: 5, comment: "Comprei pra torcer na Copa! Ficou linda, o azul é muito bonito ao vivo. Entrega rápida!", date: "2025-04-15", verified: true },
      { id: "r3", author: "Roberto Campos", rating: 5, comment: "Presente para meu filho que é fã do Mbappé. Ele ficou apaixonado! Qualidade top!", date: "2025-04-28", verified: true },
      { id: "r4", author: "Tânia Marques", rating: 4, comment: "Linda camisa! Só o tamanho ficou um pouco largo, mas a qualidade é excelente.", date: "2025-05-01", verified: true },
    ],
  },
  {
    id: "inglaterra-home-2026",
    slug: "camisa-inglaterra-home-2026-nike",
    name: "Camisa Seleção Inglaterra I Copa do Mundo 2026 Torcedor Nike Masculina",
    description: "A camisa oficial da Seleção Inglesa para a Copa do Mundo 2026. Clássico branco com detalhes em vermelho, representando os Leões de Casa com a tecnologia Nike Dri-FIT.",
    price: 89.90,
    image: "https://images.lojaallsports.com.br/produto/camisa-futebol-franca-copa-do-mundo-2026-i-torcedor-vermelha-masculina-1.jpg",
    images: [
      "https://images.lojaallsports.com.br/produto/camisa-futebol-franca-copa-do-mundo-2026-i-torcedor-vermelha-masculina-1.jpg",
      "https://images.lojaallsports.com.br/produto/camisa-futebol-franca-copa-do-mundo-2026-i-torcedor-vermelha-masculina-2.jpg",
      "https://images.lojaallsports.com.br/produto/camisa-futebol-franca-copa-do-mundo-2026-i-torcedor-vermelha-masculina-3.jpg",
    ],
    category: "camisas",
    sizes: ["P", "M", "G", "GG", "XGG"],
    brand: "Nike",
    inStock: true,
    badge: "COPA 2026",
    reviews: [
      { id: "r1", author: "James Wilson", rating: 5, comment: "It's coming home! Camisa da Inglaterra impecável, tecido de qualidade premium.", date: "2025-03-25", verified: true },
      { id: "r2", author: "Carolina Dias", rating: 5, comment: "Meu marido pediu e ficou encantado! O branco clássico da Inglaterra ficou perfeito.", date: "2025-04-08", verified: true },
      { id: "r3", author: "Eduardo Pinto", rating: 4, comment: "Ótima qualidade Nike. Entrega rápida e bem embalada. Recomendo muito!", date: "2025-04-22", verified: true },
    ],
  },
  {
    id: "croacia-home-2026",
    slug: "camisa-selecao-croacia-home-2627",
    name: "Camisa Seleção Croácia Torcedor 26/27 Home Branca e Vermelha Masculina",
    description: "A icônica camisa xadrez da Croácia para a temporada 2026/27. O clássico padrão quadriculado branco e vermelho que representa o orgulho croata em cada Copa do Mundo.",
    price: 89.90,
    image: "https://images.lojaallsports.com.br/produto/camisa-selecao-croacia-torcedor-2627-home-branca-e-vermelha-masculina-1.jpg",
    images: [
      "https://images.lojaallsports.com.br/produto/camisa-selecao-croacia-torcedor-2627-home-branca-e-vermelha-masculina-1.jpg",
      "https://images.lojaallsports.com.br/produto/camisa-selecao-croacia-torcedor-2627-home-branca-e-vermelha-masculina-2.jpg",
      "https://images.lojaallsports.com.br/produto/camisa-selecao-croacia-torcedor-2627-home-branca-e-vermelha-masculina-3.jpg",
    ],
    category: "camisas",
    sizes: ["P", "M", "G", "GG", "XGG"],
    brand: "Nike",
    inStock: true,
    badge: "COPA 2026",
    reviews: [
      { id: "r1", author: "Ivan Petrovic", rating: 5, comment: "O xadrez da Croácia é único no futebol! Camisa belíssima, qualidade excelente. Valeu cada centavo!", date: "2025-03-30", verified: true },
      { id: "r2", author: "Renata Souza", rating: 5, comment: "Presente para meu pai fã da Croácia desde 98. Ele ficou emocionado! Qualidade top.", date: "2025-04-11", verified: true },
      { id: "r3", author: "Vitor Carvalho", rating: 5, comment: "O padrão xadrez é lindo ao vivo! Muito melhor do que nas fotos. Entrega rápida.", date: "2025-04-26", verified: true },
      { id: "r4", author: "Samara Lima", rating: 4, comment: "Muito bonita! Só achei a numeração um pouco diferente da tabela, mas a qualidade compensa.", date: "2025-05-03", verified: true },
    ],
  },
  {
    id: "portugal-away-2026",
    slug: "camisa-selecao-portugal-away-2627-puma",
    name: "Camisa Seleção Portugal Torcedor 26/27 Puma Away Masculina Branca e Azul",
    description: "A camisa visitante da Seleção Portuguesa para 2026/27 pela Puma. Design elegante em branco e azul, representando o orgulho de Portugal. Tecnologia Puma DryCELL para máximo conforto.",
    price: 89.90,
    image: "https://images.lojaallsports.com.br/produto/camisa-selecao-portugal-torcedor-2627-puma-away-masculina-branca-e-azul-1.jpg",
    images: [
      "https://images.lojaallsports.com.br/produto/camisa-selecao-portugal-torcedor-2627-puma-away-masculina-branca-e-azul-1.jpg",
      "https://images.lojaallsports.com.br/produto/camisa-selecao-portugal-torcedor-2627-puma-away-masculina-branca-e-azul-2.jpg",
      "https://images.lojaallsports.com.br/produto/camisa-selecao-portugal-torcedor-2627-puma-away-masculina-branca-e-azul-3.jpg",
    ],
    category: "camisas",
    sizes: ["P", "M", "G", "GG", "XGG"],
    brand: "Puma",
    inStock: true,
    badge: "COPA 2026",
    reviews: [
      { id: "r1", author: "Cristóvão Faria", rating: 5, comment: "Camisa de Portugal linda! O branco com azul ficou elegante demais. Qualidade impecável!", date: "2025-04-03", verified: true },
      { id: "r2", author: "Bianca Melo", rating: 5, comment: "Comprei pra torcer pelo Cristiano Ronaldo! Tecido macio e de boa qualidade. Adorei!", date: "2025-04-17", verified: true },
      { id: "r3", author: "Fernando Costa", rating: 5, comment: "Puma sempre entrega qualidade. Camisa linda, entrega rápida. Vale muito o preço!", date: "2025-04-29", verified: true },
    ],
  },
  {
    id: "marrocos-home-2026",
    slug: "camisa-selecao-marrocos-home-2627",
    name: "Camisa Seleção Marrocos Torcedor 26/27 Home Masculina Vermelha",
    description: "A camisa oficial da Seleção Marroquina para 2026/27. O vermelho vibrante representa a força e determinação dos Leões do Atlas. Design moderno com tecnologia de última geração.",
    price: 89.90,
    image: "https://images.lojaallsports.com.br/produto/camisa-selecao-marrocos-torcedor-2627-home-masculina-vermelha-1.jpg",
    images: [
      "https://images.lojaallsports.com.br/produto/camisa-selecao-marrocos-torcedor-2627-home-masculina-vermelha-1.jpg",
      "https://images.lojaallsports.com.br/produto/camisa-selecao-marrocos-torcedor-2627-home-masculina-vermelha-2.jpg",
      "https://images.lojaallsports.com.br/produto/camisa-selecao-marrocos-torcedor-2627-home-masculina-vermelha-3.jpg",
    ],
    category: "camisas",
    sizes: ["P", "M", "G", "GG", "XGG"],
    brand: "Puma",
    inStock: true,
    badge: "COPA 2026",
    reviews: [
      { id: "r1", author: "Youssef Amrani", rating: 5, comment: "Marrocos foi a sensação da Copa 2022 e vai arrasar em 2026! Camisa linda, vermelho vibrante!", date: "2025-04-05", verified: true },
      { id: "r2", author: "Priscila Nogueira", rating: 5, comment: "Fui presenteada com essa camisa! O vermelho é lindo e a qualidade é excelente. Entrega rápida!", date: "2025-04-19", verified: true },
      { id: "r3", author: "Daniel Barbosa", rating: 4, comment: "Boa camisa, o vermelho é muito bonito. Tecido levinho e confortável. Recomendo!", date: "2025-05-01", verified: true },
    ],
  },
  {
    id: "marrocos-away-2026",
    slug: "camisa-selecao-marrocos-away-2627",
    name: "Camisa Seleção Marrocos Torcedor 26/27 Away Masculina Branca",
    description: "A camisa visitante da Seleção Marroquina para 2026/27. O branco elegante dos Leões do Atlas em seu modelo away. Tecnologia Puma DryCELL para performance máxima em campo.",
    price: 89.90,
    image: "https://images.lojaallsports.com.br/produto/camisa-selecao-marrocos-torcedor-2627-away-masculina-branca-1.jpg",
    images: [
      "https://images.lojaallsports.com.br/produto/camisa-selecao-marrocos-torcedor-2627-away-masculina-branca-1.jpg",
      "https://images.lojaallsports.com.br/produto/camisa-selecao-marrocos-torcedor-2627-away-masculina-branca-2.jpg",
      "https://images.lojaallsports.com.br/produto/camisa-selecao-marrocos-torcedor-2627-away-masculina-branca-3.jpg",
    ],
    category: "camisas",
    sizes: ["P", "M", "G", "GG", "XGG"],
    brand: "Puma",
    inStock: true,
    badge: "COPA 2026",
    reviews: [
      { id: "r1", author: "Hamza El Fassi", rating: 5, comment: "A versão branca de Marrocos ficou perfeita! Qualidade incrível, vale muito o investimento.", date: "2025-04-08", verified: true },
      { id: "r2", author: "Gabriela Vieira", rating: 5, comment: "Comprei as duas versões: vermelha e branca! As duas são lindas e de boa qualidade.", date: "2025-04-21", verified: true },
      { id: "r3", author: "Leonardo Pereira", rating: 5, comment: "A camisa branca de Marrocos é muito elegante. Tecido excelente, entrega super rápida!", date: "2025-05-02", verified: true },
    ],
  },
  {
    id: "album-copa-2026-capa-dura",
    slug: "album-copa-do-mundo-2026-capa-dura-panini",
    name: "Álbum Copa do Mundo 2026 - Capa Dura FIFA World Cup 2026",
    description: "O álbum oficial da Copa do Mundo 2026 em capa dura! Colecionável especial Panini com espaço para todas as figurinhas do torneio.",
    price: 39.90,
    originalPrice: 80.00,
    image: p("panini-album-1.jpeg"),
    images: [
      p("panini-album-1.jpeg"),
    ],
    category: "lancamentos",
    subcategory: "copa-do-mundo",
    brand: "Panini",
    inStock: true,
    badge: "OFERTA",
    reviews: [
      { id: "r1", author: "Gabriel Costa", rating: 5, comment: "Álbum incrível! A capa dura é de altíssima qualidade. Valeu cada centavo.", date: "2025-03-15", verified: true },
      { id: "r2", author: "Mariana Lopes", rating: 5, comment: "Presente perfeito pro meu neto! Ele ficou louco de feliz. Produto original e bem embalado.", date: "2025-04-02", verified: true },
      { id: "r3", author: "José Antônio", rating: 4, comment: "Álbum lindo, capa dura mesmo! Só demorou um dia a mais pra chegar, mas valeu.", date: "2025-04-20", verified: true },
    ],
  },
  {
    id: "envelopes-copa-2026-kit12",
    slug: "kit-12-envelopes-copa-do-mundo-2026-panini",
    name: "Kit com 12 Envelopes Copa do Mundo 2026 FIFA World Cup",
    description: "Kit com 12 envelopes de figurinhas da Copa do Mundo 2026. Cada envelope contém 5 figurinhas. Perfeito para completar seu álbum.",
    price: 19.90,
    originalPrice: 59.90,
    image: p("panini-envelopes-kit12.jpeg"),
    images: [
      p("panini-envelopes-kit12.jpeg"),
    ],
    category: "lancamentos",
    subcategory: "copa-do-mundo",
    brand: "Panini",
    inStock: true,
    badge: "67% OFF",
    reviews: [
      { id: "r1", author: "Pedro Henrique", rating: 5, comment: "Ótimo preço! As figurinhas são lindas. Completei várias páginas do álbum.", date: "2025-03-20", verified: true },
      { id: "r2", author: "Flávia Santos", rating: 4, comment: "Meu filho adorou! Veio bem embalado e chegou rápido. Super recomendo.", date: "2025-04-10", verified: true },
    ],
  },
  {
    id: "box-copa-2026",
    slug: "box-sacola-album-copa-do-mundo-2026-panini",
    name: "Box Sacola Álbum + Capa Cartão + 30 Envelopes Copa 2026",
    description: "Box completo da Copa do Mundo 2026 com álbum, capa de cartão especial e 30 envelopes de figurinhas.",
    price: 99.90,
    originalPrice: 200.00,
    image: p("panini-box-1.jpeg"),
    images: [
      p("panini-box-1.jpeg"),
    ],
    category: "lancamentos",
    subcategory: "copa-do-mundo",
    brand: "Panini",
    inStock: true,
    badge: "50% OFF",
    reviews: [
      { id: "r1", author: "Felipe Araújo", rating: 5, comment: "Box completo incrível! Presente de aniversário para meu filho. Chegou em caixa resistente.", date: "2025-03-28", verified: true },
      { id: "r2", author: "Sandra Moreira", rating: 5, comment: "Perfeito! Qualidade excelente. O box vem com tudo mesmo. Entrega super rápida!", date: "2025-04-15", verified: true },
      { id: "r3", author: "Márcio Tavares", rating: 4, comment: "Ótimo custo-benefício. O álbum com capa dura e 30 envelopes. Vale muito a pena!", date: "2025-05-01", verified: true },
    ],
  },
  {
    id: "brochura-copa-2026",
    slug: "brochura-copa-do-mundo-2026-panini",
    name: "Brochura Copa do Mundo 2026 FIFA World Cup",
    description: "Brochura oficial da Copa do Mundo 2026 com informações dos times, jogadores e histórico do torneio.",
    price: 14.99,
    originalPrice: 25.00,
    image: p("panini-brochura-1.jpeg"),
    images: [
      p("panini-brochura-1.jpeg"),
    ],
    category: "lancamentos",
    subcategory: "copa-do-mundo",
    brand: "Panini",
    inStock: true,
    badge: "40% OFF",
    reviews: [
      { id: "r1", author: "Letícia Gomes", rating: 5, comment: "Brochura muito informativa! Ótima para acompanhar a Copa. Chegou rápido e bem embalada.", date: "2025-04-01", verified: true },
      { id: "r2", author: "Antônio Silva", rating: 4, comment: "Produto de boa qualidade. Informações completas sobre todos os países. Recomendo!", date: "2025-04-18", verified: true },
    ],
  },
  {
    id: "bola-adidas-copa-2026",
    slug: "bola-futebol-adidas-trionda-copa-2026",
    name: "Bola de Futebol Adidas Trionda Copa do Mundo 2026 League Box",
    description: "A bola oficial da Copa do Mundo 2026 da Adidas. Design exclusivo do torneio com tecnologia de alta performance. Edição especial comemorativa.",
    price: 99.90,
    originalPrice: 159.00,
    image: p("bola-1.jpeg"),
    images: [
      p("bola-1.jpeg"),
      p("bola-2.jpeg"),
      p("bola-3.jpeg"),
    ],
    category: "lancamentos",
    subcategory: "copa-do-mundo",
    brand: "Adidas",
    inStock: true,
    badge: "37% OFF",
    reviews: [
      { id: "r1", author: "Bruno Alves", rating: 5, comment: "Bola incrível! O design da Copa é lindo. Já usei em vários jogos e está perfeita.", date: "2025-03-25", verified: true },
      { id: "r2", author: "Cláudia Ramos", rating: 5, comment: "Presente para meu filho. Ele simplesmente amou! Qualidade Adidas de sempre. Top demais!", date: "2025-04-12", verified: true },
      { id: "r3", author: "Thales Monteiro", rating: 5, comment: "Bola oficial da Copa! Design exclusivo e qualidade impecável. Chegou super rápido.", date: "2025-04-28", verified: true },
      { id: "r4", author: "Eliana Costa", rating: 4, comment: "Linda bola! A estampa da Copa é perfeita. Ótimo produto pelo preço.", date: "2025-05-03", verified: true },
    ],
  },
];

export const categories = [
  { id: "camisas", label: "Camisas", slug: "camisas" },
  {
    id: "lancamentos",
    label: "Lançamentos",
    slug: "lancamentos",
    subcategories: [{ id: "copa-do-mundo", label: "Copa do Mundo", slug: "copa-do-mundo" }],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getProductsBySubcategory(subcategory: string): Product[] {
  return products.filter((p) => p.subcategory === subcategory);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
}
