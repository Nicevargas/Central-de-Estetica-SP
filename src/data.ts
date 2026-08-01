import { Treatment, Testimonial, FAQ, Promotion, BlogPost, ContactInfo } from './types';

export const DEFAULT_CONTACT_INFO: ContactInfo = {
  phonePrimary: '(11) 3151-2433 / (11) 9468-3765',
  whatsappNumber: '551194683765',
  email: 'contatocentraldaestetica@gmail.com',
  addressLine1: 'Rua Artur Frazão, 33',
  addressLine2: 'Jardim Paulista, São Paulo - SP',
  cep: '01423-030',
  instagramUrl: 'https://instagram.com/centraldaesteticasp',
  facebookUrl: 'https://facebook.com/CENTRALDAESTETICASP',
};


export const TREATMENTS: Treatment[] = [
  {
    id: 'botox',
    name: 'Botox (Toxina Botulínica)',
    description: 'Suavize linhas de expressão na testa, pés de galinha e glabela com prevenção do envelhecimento precoce e resultados elegantes e naturais.',
    category: 'facial',
    popular: true,
    benefits: ['Prevenção de rugas profundas', 'Elevação harmônica das sobrancelhas', 'Resultados naturais e sem efeito congelado', 'Procedimento rápido sem necessidade de repouso'],
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    price: 'R$ 980,00',
    duration: '30 min',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    beforeAfterImages: [
      {
        before: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
        after: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        label: 'Linhas de expressão na testa e glabela (30 dias após)'
      },
      {
        before: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        after: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
        label: 'Suavização periocular / Pés de galinha'
      }
    ],
    technicalSpecs: {
      duration: '30 a 45 minutos',
      anesthesia: 'Anestésico tópico de alta potência',
      recovery: 'Imediata (sem tempo de inatividade)',
      indicatedFor: 'Rugas dinâmicas na testa, glabela, pés de galinha e prevenção do envelhecimento',
      resultsIn: 'Início em 3 a 5 dias, resultado final em 14 dias',
      sessionsRequired: '1 sessão a cada 4 a 6 meses'
    },
    postCareTips: [
      'Não deitar ou abaixar a cabeça por 4 horas após a aplicação.',
      'Evitar praticar atividades físicas intensas nas primeiras 24 horas.',
      'Não massagear ou pressionar as áreas aplicadas durante 48 horas.',
      'Usar protetor solar FPS 50+ diariamente e evitar exposição solar direta.'
    ],
    specialist: {
      name: 'Dra. Amanda Rodrigues',
      role: 'Biomédica Esteta & Especialista em Harmonização Facial',
      registration: 'CRBM 34.892-SP',
      bio: 'Mais de 10 anos de experiência em procedimentos injetáveis e rejuvenescimento facial natural.',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80'
    }
  },
  {
    id: 'limpeza-de-pele',
    name: 'Limpeza de Pele Profunda',
    description: 'Remoção de impurezas, cravos e renovação celular com vapor de ozônio, extração manual cuidadosa e fototerapia LED.',
    category: 'facial',
    benefits: ['Controle efetivo da oleosidade', 'Desobstrução e afinamento dos poros', 'Extração profissional asséptica sem cicatrizes', 'Aumento imediato do viço e luminosidade'],
    image: 'https://images.unsplash.com/photo-1512290900676-26c2a48f4134?auto=format&fit=crop&w=800&q=80',
    price: 'R$ 150,00',
    duration: '60 min',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    beforeAfterImages: [
      {
        before: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80',
        after: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
        label: 'Extração de cravos e desobstrução de poros'
      }
    ],
    technicalSpecs: {
      duration: '60 a 75 minutos',
      anesthesia: 'Não necessária (Creme amolecedor térmico)',
      recovery: '1 a 2 dias (leve vermelhidão transitória)',
      indicatedFor: 'Todos os tipos de pele, em especial oleosas e acneicas',
      resultsIn: 'Imediato (pele limpa e viçosa)',
      sessionsRequired: 'Manutenção mensal recomendada'
    },
    postCareTips: [
      'Não utilizar maquiagem pesada nas 12 horas seguintes ao procedimento.',
      'Usar protetor solar físico com FPS 50+ e reaplicar a cada 3 horas.',
      'Evitar o uso de ácidos ou esfoliantes por pelo menos 5 dias.',
      'Manter a pele higienizada com sabonete neutro indicado pela especialista.'
    ],
    specialist: {
      name: 'Carla Silveira',
      role: 'Esteticista Cosmetóloga Sênior',
      registration: 'EST-SP 12.450',
      bio: 'Especialista em tratamentos dermocosméticos, peelings e restauração da barreira cutânea.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
    }
  },
  {
    id: 'ultraformer-iii',
    name: 'Ultraformer III',
    description: 'Lifting facial sem cortes através de ultrassom micro e macrofocado para combate à flacidez, papada e definição do contorno mandíbula.',
    category: 'facial',
    benefits: ['Estímulo de colágeno profundo no SMAS', 'Efeito bichectomia-like e afinamento facial', 'Melhora imediata com evolução contínua por 3 meses', 'Sem cortes, agujas ou tempo de afastamento'],
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80',
    price: 'R$ 1.800,00',
    duration: '45 min',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    beforeAfterImages: [
      {
        before: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
        after: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        label: 'Definição do contorno mandibular e redução de papada'
      }
    ],
    technicalSpecs: {
      duration: '45 a 60 minutos',
      anesthesia: 'Anestésico tópico em creme',
      recovery: 'Retorno imediato às atividades normais',
      indicatedFor: 'Flacidez facial, perda de contorno, papada e código de barras',
      resultsIn: '20% imediato e 100% do pico em 90 dias',
      sessionsRequired: '1 a 2 sessões anuais'
    },
    postCareTips: [
      'Higienizar a pele com água morna e sabonete suave.',
      'Consumir suplementação de colágeno e vitamina C conforme orientação.',
      'Evitar banhos excessivamente quentes no dia da aplicação.',
      'Utilizar filtro solar FPS 50+ todos os dias.'
    ],
    specialist: {
      name: 'Dra. Amanda Rodrigues',
      role: 'Biomédica Esteta & Especialista em Tecnologias Médicas',
      registration: 'CRBM 34.892-SP',
      bio: 'Especialista certificada em plataformas de ultrassom microfocado e radiofrequência médica.',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80'
    }
  },
  {
    id: 'lipo-enzimatica',
    name: 'Lipo Enzimática',
    description: 'Combata a gordura localizada de forma minimamente invasiva com aplicação direcionada de mesclas enzimáticas lipolíticas altamente concentradas.',
    category: 'corporal',
    highlight: true,
    benefits: ['Redução expressiva de medidas na área tratada', 'Ação direta no tecido adiposo sem cirurgia', 'Combinação de enzimas para quebra e eliminação de gordura', 'Procedimento rápido e seguro'],
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80',
    price: 'R$ 350,00 por sessão',
    duration: '30 min',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    beforeAfterImages: [
      {
        before: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=600&q=80',
        after: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
        label: 'Redução de gordura infra-abdominal após 4 sessões'
      }
    ],
    technicalSpecs: {
      duration: '30 minutos',
      anesthesia: 'Anestésico local integrado na aplicação',
      recovery: 'Retorno imediato (sensibilidade leve por 24-48h)',
      indicatedFor: 'Gordura localizada no abdômen, flancos, culotes e braços',
      resultsIn: 'Visíveis a partir da 2ª ou 3ª sessão',
      sessionsRequired: 'Recomendado protocolo de 4 a 6 sessões'
    },
    postCareTips: [
      'Ingerir no mínimo 2 a 3 litros de água por dia para auxiliar na eliminação das toxinas.',
      'Realizar drenagem linfática 48h após a aplicação.',
      'Evitar ingestão de bebidas alcoólicas e alimentos ultraprocessados nas 48h seguintes.',
      'Utilizar cinta modeladora caso seja indicado pelo profissional.'
    ],
    specialist: {
      name: 'Dr. Lucas Mendes',
      role: 'Farmacêutico Esteta & Especialista em Injetáveis Corporais',
      registration: 'CRF 58.102-SP',
      bio: 'Especialista em farmacologia aplicada à estética corporal e mesoterapia de alta performance.',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80'
    }
  },
  {
    id: 'criofrequencia',
    name: 'Criofrequência',
    description: 'Terapia avançada que combina o choque térmico do frio externo (-10°C) com o calor interno para combater a flacidez e destruir células de gordura.',
    category: 'corporal',
    benefits: ['Tratamento duplo de flacidez e gordura simultaneamente', 'Redução visível de celulite e melhora da textura', 'Contração imediata das fibras de colágeno', 'Confortável e indolor devido ao resfriamento'],
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    price: 'R$ 290,00 por sessão',
    duration: '40 min',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    beforeAfterImages: [
      {
        before: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
        after: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80',
        label: 'Firmeza tissular nas coxas e glúteos'
      }
    ],
    technicalSpecs: {
      duration: '40 a 50 minutos',
      anesthesia: 'Não necessária (Crio-cabeçote gelado a -10°C)',
      recovery: 'Imediata',
      indicatedFor: 'Flacidez tissular corporal/facial, celulite e gordura localizada',
      resultsIn: 'Efeito lifting imediato e remodelamento contínuo',
      sessionsRequired: '6 a 8 sessões quinzenais'
    },
    postCareTips: [
      'Manter excelente hidratação oral.',
      'Evitar a aplicação de géis frios logo após a sessão para não cortar a neocolagenogênese.',
      'Manter rotina de exercícios físicos para potencializar o metabolismo lipídico.'
    ],
    specialist: {
      name: 'Carla Silveira',
      role: 'Esteticista Cosmetóloga Sênior',
      registration: 'EST-SP 12.450',
      bio: 'Especialista em eletroterapia corporal e tecnologias de remodelação de silhueta.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
    }
  },
  {
    id: 'velashape',
    name: 'Velashape',
    description: 'Tecnologia médica ELOS combinando radiofrequência bipolar, luz infravermelha e vácuo para drenagem e combate severo da celulite.',
    category: 'corporal',
    benefits: ['Aumento significativo da circulação e drenagem celular', 'Melhora acentuada do aspecto de casca de laranja', 'Redução da circunferência corporal tratada', 'Sensação agradável semelhante a uma massagem profunda'],
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
    price: 'R$ 320,00 por sessão',
    duration: '45 min',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    technicalSpecs: {
      duration: '45 minutos',
      anesthesia: 'Não necessária (massagem a vácuo aquecida)',
      recovery: 'Imediata',
      indicatedFor: 'Celulite em todos os graus, retenção de líquidos e contorno de coxas/glúteos',
      resultsIn: 'A partir da 3ª sessão',
      sessionsRequired: '6 a 10 sessões semanais'
    },
    postCareTips: [
      'Beba bastante água antes e depois de cada sessão.',
      'Evitar sol direto na região caso haja leve hiperemia (vermelhidão).',
      'Associar a uma dieta equilibrada baixa em sódio.'
    ],
    specialist: {
      name: 'Dr. Lucas Mendes',
      role: 'Farmacêutico Esteta',
      registration: 'CRF 58.102-SP',
      bio: 'Especialista em fisiopatologia do tecido adiposo e protocolos corporais combinados.',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80'
    }
  },
  {
    id: 'massagem-relaxante',
    name: 'Massagem Relaxante',
    description: 'Um momento sagrado de desconexão. Alivia tensões musculares, reduz o cortisol e promove o equilíbrio mental através de técnicas suecas e aromaterapia com óleos essenciais puros.',
    category: 'bem-estar',
    benefits: ['Alívio profundo do estresse e da ansiedade', 'Relaxamento muscular e alívio de nós de tensão', 'Estímulo da circulação e liberação de endorfinas', 'Ambiente climatizado com cromoterapia e música suave'],
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80',
    price: 'R$ 180,00',
    duration: '60 min',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    technicalSpecs: {
      duration: '60 a 90 minutos',
      anesthesia: 'Não aplicável',
      recovery: 'Sensação de leveza imediata',
      indicatedFor: 'Tensão muscular, estresse, insônia e fadiga física/mental',
      resultsIn: 'Imediato',
      sessionsRequired: 'Semanal ou quinzenal'
    },
    postCareTips: [
      'Evite compromissos muito agitados logo após o atendimento.',
      'Tome um chá morno hidratante (camomila ou erva-doce).',
      'Mantenha boa hidratação para potencializar a eliminação de resíduos metabólicos.'
    ],
    specialist: {
      name: 'Isabela Fontes',
      role: 'Massoterapeuta & Terapeuta Holística',
      registration: 'CRTH 8.910',
      bio: 'Mais de 8 anos dedicados às artes do toque integrativo, aromaterapia e bem-estar integral.',
      avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=300&q=80'
    }
  },
  {
    id: 'massagem-modeladora',
    name: 'Massagem Modeladora',
    description: 'Manobras intensas, firmes e rápidas que auxiliam no remodelamento corporal, ativação do metabolismo e drenagem de toxinas acumuladas nos tecidos.',
    category: 'bem-estar',
    benefits: ['Melhora expressiva da circulação e drenagem linfática', 'Modelagem da silhueta em áreas estratégicas', 'Auxílio direto na eliminação de toxinas e retenção', 'Tônus muscular reativado'],
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    price: 'R$ 220,00',
    duration: '50 min',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    technicalSpecs: {
      duration: '50 minutos',
      anesthesia: 'Não aplicável',
      recovery: 'Imediata',
      indicatedFor: 'Retenção hídrica, celulite, perda de tônus e modelagem da cintura',
      resultsIn: 'Visível logo após a 1ª sessão (redução de inchaço)',
      sessionsRequired: '1 a 2 vezes por semana'
    },
    postCareTips: [
      'Beber 500ml de água logo após a sessão.',
      'Evitar refeições pesadas 1 hora antes e 1 hora após.',
      'Manter atividades físicas aeróbicas regulares.'
    ],
    specialist: {
      name: 'Isabela Fontes',
      role: 'Massoterapeuta & Terapeuta Holística',
      registration: 'CRTH 8.910',
      bio: 'Especialista em manobras de remodelagem corporal e drenagem método exclusivo.',
      avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=300&q=80'
    }
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

