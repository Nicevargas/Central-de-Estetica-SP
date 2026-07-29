import { Treatment, Testimonial, FAQ, Promotion, BlogPost } from './types';

export const TREATMENTS: Treatment[] = [
  {
    id: 'botox',
    name: 'Botox (Toxina Botulínica)',
    description: 'Suavize linhas de expressão e previna o envelhecimento precoce com resultados naturais.',
    category: 'facial',
    popular: true,
    benefits: ['Prevenção de rugas profundas', 'Elevação das sobrancelhas', 'Resultados naturais e elegantes'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBN6mAS0GY7g5i227Y8iLm2CJAn7Oh8ao6UhyS24sCRGq53bfGp5_Tl8nw2-UXzsJAJ-Nvd6DAqOXv-k5XoH--VZiM5-Zw9aJGe3l91WzWNqj6xiQsn7kTwqS-FBAfuJdxAZ3uJWc4WLHpwGg69EK1eFmcxIiYzCVEUMLLAp0REXWeJBu86qUvNgvRM-cItt5CGdiuDu-OT2T0ayAJD4U0rOptsxZYG3_I5cbUjUxNy8ap0diflMj5s7Q',
    price: 'R$ 980,00',
    duration: '30 min'
  },
  {
    id: 'limpeza-de-pele',
    name: 'Limpeza de Pele Profunda',
    description: 'Remoção de impurezas, cravos e renovação celular para uma pele viçosa e saudável.',
    category: 'facial',
    benefits: ['Controle de oleosidade', 'Desobstrução de poros', 'Extração profissional sem cicatrizes'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhlHxlbE90w6BcgjA9jPP1jp2OwR7nextm00QGKo9dHMwvoS6c546ObG4PTx3TbwzhpAmqNEHbu5GcK4yxAygg8m-l8ggV7e3T7QC1Q7DqOg8Nq0XYc3XZ0JwbLMPJq3WDA8KIbW7PsxPQM2VEfUdJ8vtmlPzDmAC5njOqxFr0oirppIAxgoxaIU-lJJ-p4Sn2iX8YMkPzpMl5kzV4e94RTywEWiIszWl5STSolCjzYAwXkLvigUK36Q',
    price: 'R$ 150,00',
    duration: '60 min'
  },
  {
    id: 'ultraformer-iii',
    name: 'Ultraformer III',
    description: 'Lifting facial sem cortes através de ultrassom microfocado para flacidez e contorno.',
    category: 'facial',
    benefits: ['Estímulo de colágeno intenso', 'Efeito bichectomia-like', 'Melhora imediata e contínua'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_IjB2cUoPht2sl_DZYyB3vJMjlSCe1_wZjmTD5JGAQNWKA_UOeXHWzgSD7Dbnq0HAO0jg8lmZLuyVakuMYOgb28GZ3xdcRprPjj0zj7Ny7PrOzr_KTYyfkWEgPBNIVTMJM7x4xHmPpTKyYvriNGMk2_P4MSZtahQ5av3dvE5Ytv1zXrV4RPqzmbvhgQTtIlTaZmes1SarXwlIGe9K8B0erqu0ekfS6e6788Jj1w34XHPQ14uNhiyrVA',
    price: 'R$ 1.800,00',
    duration: '45 min'
  },
  {
    id: 'lipo-enzimatica',
    name: 'Lipo Enzimática',
    description: 'Combata a gordura localizada de forma minimamente invasiva com aplicação direcionada de enzimas redutoras.',
    category: 'corporal',
    highlight: true,
    benefits: ['Redução de medidas', 'Foco em gordura localizada', 'Processo rápido e focado'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdALPIr_mYm1IpZ7vCO9l1Ig0tpHhxV3V-0HKjFn9mecvFZyxFIyylHXBV5Cz0TWimfvBzTHZ0nmbiEBz5JkCoWJbCOkasFfIIzfs_541sZQS0n7fk332hqrrCuGN0lJei0Iwcvd2sWoE8c1vOUEAAJ655BarsW0f5bgvY0okJpDpZJ0MUvVr8rCak0xGAH6SF1ciLhUB1P9MeTgbUQPRQbVAEqtDa6c_6Y2OGYVmXLqBBfjkNEIrQRw',
    price: 'R$ 350,00 por sessão',
    duration: '30 min'
  },
  {
    id: 'criofrequencia',
    name: 'Criofrequência',
    description: 'Terapia que combina frio e calor para combater flacidez e celulite.',
    category: 'corporal',
    benefits: ['Tratamento de flacidez', 'Redução de celulite', 'Contração imediata de fibras de colágeno'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCO93tAHf875s1-UCImJPNISVNu6pSRixbQieMiOPdiQfB-fsvVEPv9ONbzuFM6b5aZl2chHy5b5SRB2xZuyle3-LEA_nc_qf2z5I9kyNpjIDX4zlghYGpAJgtlyhUt8SCoPiBu-TEFS7QtVt3gnJvypQi3h2uC0thBGZ-z2YSDMwEKRiwQiovy-Dtic-ZEZQHrtgk65LI_mnNqWZIqbeyPcOxE4zx9yjN7vCiZrFkU9ALVkELxnVPKeA',
    price: 'R$ 290,00 por sessão',
    duration: '40 min'
  },
  {
    id: 'velashape',
    name: 'Velashape',
    description: 'Tecnologia ELOS para contorno corporal e redução da aparência de celulite.',
    category: 'corporal',
    benefits: ['Contorno corporal', 'Estímulo à circulação', 'Ação profunda no tecido adiposo'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWvYCUfN8KRHHq1aHXZR4f0k_tMS-o0RBcufjxhi6kZDtOxLYQyGavdI6v-LulH6W8BiDu7HHToQOuh0VXzWgATFaRw3Aj2lVeLvbL81ROVkzy9T7vfDBCxpDzfaKwSIZa8IQ5cDc8swJ5TlkOePpyzk335MDGWGlFE38PE7stUnpx6UffXyUD-3phkq9Gu0Ww6JgYonm9vxZTYlPsLY5Fimp5QojPyMpLEWXDPY4h3BtEy8jTk_uNMA',
    price: 'R$ 320,00 por sessão',
    duration: '45 min'
  },
  {
    id: 'massagem-relaxante',
    name: 'Massagem Relaxante',
    description: 'Um momento sagrado de desconexão. Alivia tensões musculares, reduz o estresse e promove o equilíbrio mental através de técnicas envolventes.',
    category: 'bem-estar',
    benefits: ['Alívio do estresse', 'Equilíbrio mental', 'Desconexão do cotidiano e relaxamento profundo'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw7_SmkXnHIyc7_F-FA3t1X11EpJQvqaPjDwTQ2aLtOhUMXdgqLDWEVpBpKqmPwqQyLf4Sr2L-SmLYDEgazbCxczQFwvWSBOlQbJ7UlCCbmvJedznz56_yhA8y6SFokyeTBwnF2T0DWkxYY3_eJqWQ5KCpJv1YCpKLDpGS-oGGSgZjjqxXoykJlKcyqH89ZYyErMB_T5GMdu8r-fBazcVmoDtEDs4LTN44ug-4_iloD2jeSkxIx1-N1g',
    price: 'R$ 180,00',
    duration: '60 min'
  },
  {
    id: 'massagem-modeladora',
    name: 'Massagem Modeladora',
    description: 'Manobras intensas e rápidas que auxiliam na redução de medidas, melhora da circulação e modelagem da silhueta corporal.',
    category: 'bem-estar',
    benefits: ['Melhora de circulação', 'Modelagem da silhueta', 'Auxílio na eliminação de toxinas'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPZVdmtLQKU7wed_9R2C8ZeMLgoVs6ysuvkOpSNl7ylCw3K08TQudzAzu_lbIc6MDWX1vvD6SdfSaYIf48hIeFtoDlGU-xr6EBOWRi0q3CgYCWfDecwzj9hqBXQF7VATW7vhiGcYx2bGw9ENYGfm_fOu3qQz1T3ZFNZVQFlkFAARyIKdrLGB8vGRGfePRyxh7KaX5xAiO0pNPIdqKydueS84aRTH8aaDrPw3P2qnbXeSXTbSO89icK0w',
    price: 'R$ 220,00',
    duration: '50 min'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Marina Santos',
    role: 'Cliente há 3 anos',
    text: 'Simplesmente a melhor experiência que já tive em uma clínica. O atendimento é impecável e os resultados do Botox foram super naturais, exatamente como eu queria.',
    stars: 5,
    avatarBg: 'bg-secondary-fixed-dim text-secondary'
  },
  {
    id: '2',
    name: 'Fernanda Lima',
    role: 'Cliente há 1 ano',
    text: 'Fiz o pacote de corporal (Velashape) e estou encantada. A equipe é muito capacitada e o ambiente é muito relaxante. Vale cada centavo!',
    stars: 5,
    avatarBg: 'bg-primary-fixed text-primary'
  },
  {
    id: '3',
    name: 'Camila Oliveira',
    role: 'Cliente Nova',
    text: 'A limpeza de pele mais completa que já fiz. Saí com a pele iluminada e me sentindo super cuidada. Recomendo de olhos fechados!',
    stars: 5,
    avatarBg: 'bg-tertiary-fixed text-tertiary'
  }
];

export const FAQS: FAQ[] = [
  {
    id: 'faq-1',
    question: 'Os procedimentos são doloridos?',
    answer: 'A maioria dos nossos procedimentos são minimamente invasivos e causam apenas um leve desconforto. Utilizamos anestésicos tópicos de alta qualidade sempre que necessário para garantir sua total comodidade.'
  },
  {
    id: 'faq-2',
    question: 'Quanto tempo dura o efeito do Botox?',
    answer: 'Em média, os resultados da toxina botulínica duram entre 4 a 6 meses, variando de acordo com o organismo de cada paciente e seus hábitos de vida.'
  },
  {
    id: 'faq-3',
    question: 'Como funciona o agendamento?',
    answer: 'Você pode agendar sua avaliação clicando no botão "Agendar Consulta" em nosso menu ou através do nosso WhatsApp. Realizamos uma consulta prévia para entender suas necessidades e indicar o melhor protocolo.'
  }
];

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    badge: 'OFERTA DESTAQUE DO MÊS',
    title: 'Combo Brilho & Rejuvenescimento',
    subtitle: 'Botox 3 áreas + Peeling de Diamante para uma pele renovada e radiante.',
    discount: '30% OFF',
    originalPrice: 'R$ 1.200',
    promoPrice: 'R$ 840',
    couponCode: 'ESTETICA30',
    expiresInDays: 5,
    treatmentId: 'botox',
    active: true,
  },
  {
    id: 'promo-2',
    badge: 'ESTÍMULO DE COLÁGENO',
    title: 'Protocolo Contorno & Firmeza',
    subtitle: 'Bioestimulador de Colágeno com Drenagem Facial de cortesia.',
    discount: 'R$ 350 OFF',
    originalPrice: 'R$ 1.950',
    promoPrice: 'R$ 1.600',
    couponCode: 'FIRM2026',
    expiresInDays: 8,
    treatmentId: 'bioestimulador',
    active: true,
  },
  {
    id: 'promo-3',
    badge: 'RENOVAÇÃO FACIAL EXPRESS',
    title: 'Limpeza de Pele HD + LED',
    subtitle: 'Limpeza profunda com hidratação e fototerapia anti-inflamatória.',
    discount: '25% OFF',
    originalPrice: 'R$ 280',
    promoPrice: 'R$ 210',
    couponCode: 'PELEPERFEITA',
    expiresInDays: 3,
    treatmentId: 'limpeza-de-pele',
    active: true,
  },
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Bioestimuladores de Colágeno: O Segredo do Rejuvenescimento Natural',
    slug: 'bioestimuladores-de-colageno-guia',
    category: 'Tratamentos Faciais',
    author: 'Dra. Camila Vasconcelos',
    date: '24 de Julho, 2026',
    readTime: '5 min de leitura',
    featured: true,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Descubra como os bioestimuladores acionam a produção natural de colágeno pelo próprio organismo, devolvendo firmeza e viço sem alterar seus traços.',
    content: `Os bioestimuladores de colágeno revolucionaram a dermatologia estética avançada ao oferecer um rejuvenescimento gradual, seguro e extremamente natural. Diferente dos preenchedores tradicionais que apenas conferem volume imediato, substâncias como o ácido poli-L-láctico e a hidroxiapatita de cálcio estimulam as células do próprio corpo a produzirem novas fibras de colágeno.

### Como Funcionam os Bioestimuladores?
A partir dos 25 a 30 anos, nosso corpo reduz gradativamente a produção natural de colágeno em cerca de 1% ao ano. Isso resulta em perda de firmeza, afinamento da pele e surgimento de rugas finas.

Ao aplicar o bioestimulador nas camadas profundas da pele, inicia-se um processo de regeneração tecidual. Nos meses subsequentes à aplicação, o tecido cutâneo ganha densidade, elasticidade e sustentação.

### Principais Benefícios:
1. **Resultados Progressivos:** O ápice do efeito ocorre entre 3 e 6 meses após a sessão.
2. **Durabilidade Estendida:** Os efeitos podem durar até 2 anos.
3. **Versatilidade:** Pode ser aplicado no rosto, pescoço, colo, mãos e glúteos.

Para saber qual o protocolo ideal para suas necessidades, agende uma avaliação personalizada com nossos especialistas.`
  },
  {
    id: 'post-2',
    title: 'Cuidados Essenciais com a Pele Pós-Procedimento Estético',
    slug: 'cuidados-pos-procedimento-estetico',
    category: 'Skincare & Dicas',
    author: 'Dr. Lucas Ribeiro',
    date: '18 de Julho, 2026',
    readTime: '4 min de leitura',
    featured: true,
    image: 'https://images.unsplash.com/photo-1512290900676-26c2a48f4134?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Saiba o que fazer e o que evitar logo após sessões de Botox, Peeling ou Ultraformer para maximizar seus resultados com segurança.',
    content: `Realizar um procedimento estético é apenas metade da jornada para alcançar a pele dos seus sonhos. Os cuidados domiciliares pós-procedimento desempenham um papel crucial na otimização dos resultados e na prevenção de reações indesejadas.

### 1. Proteção Solar É Inegociável
Após peelings, lasers ou limpezas de pele profundas, a barreira cutânea fica sensibilizada. O uso de protetor solar com FPS mínimo 50, com reaplicação a cada 3 horas, é indispensável para evitar manchas.

### 2. Hidratação Reparadora
Priorize cremes e séruns enriquecidos com ácido hialurônico, pantenol, ceramidas e niacinamida. Eles ajudam a acalmar a vermelhidão e restaurar o manto lipídico.

### 3. O Que Evitar nos Primeiros Dias:
- Atividades físicas intensas e sauna nas primeiras 24h após Botox ou preenchimento.
- Exposição direta ao sol prolongada.
- Produtos com ácidos fortes ou esfoliantes físicos sem orientação profissional.

Consulte sempre nosso protocolo específico impresso entregue ao final de cada sessão!`
  },
  {
    id: 'post-3',
    title: 'Ultraformer III vs. Preenchimento: Qual o Melhor para Flacidez?',
    slug: 'ultraformer-vs-preenchimento',
    category: 'Tecnologias Avançadas',
    author: 'Dra. Camila Vasconcelos',
    date: '10 de Julho, 2026',
    readTime: '6 min de leitura',
    featured: false,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Entenda a diferença entre ultrassom microfocado e ácido hialurônico para escolher a abordagem perfeita para o seu rosto.',
    content: `Uma das dúvidas mais frequentes na clínica é se o melhor caminho para tratar a queda do contorno facial é o Ultraformer III ou o preenchimento com ácido hialurônico. A resposta curta é: eles possuem indicações distintas e frequentemente se complementam!

### Ultraformer III (Ultrassom Microfocado)
Focado no combate à flacidez de pele e muscular. Suas ondas atigem a camada SMAS (a mesma trabalhada em cirurgias de facelift), promovendo ancoragem muscular e retração da pele.

### Preenchimento Facial
Ideal para repor compartimentos de gordura perdidos com o tempo, redefinir a mandíbula, tratar sulcos (como o 'bigode chinês') ou dar volume aos lábios.

Na nossa avaliação clínica, mapeamos o grau de flacidez e perda de volume para criar um plano harmonioso e sob medida.`
  }
];

