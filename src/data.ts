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
    id: 'secagem-vasinhos',
    name: 'Secagem de Vasinhos (Laser & PEIM Injetável)',
    description: 'O nosso protocolo exclusivo associa laser específico para vasos e aplicações injetáveis (PEIM) para a desobstrução, esclerose e cauterização efetiva de vasos e microvarizes.',
    category: 'corporal',
    popular: true,
    highlight: true,
    benefits: [
      'Procedimento campeão de atração e satisfação dos clientes',
      'Associação de Laser vascular de alta precisão e aplicação injetável (PEIM)',
      'Desobstrução, cauterização e clareamento rápido dos vasinhos nas pernas',
      'Resultados visíveis sem necessidade de repouso ou cirurgia'
    ],
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80',
    price: 'A partir de R$ 380,00',
    duration: '45 min',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    beforeAfterImages: [
      {
        before: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
        after: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        label: 'Eliminação de microvasos e vasinhos aparentes nas pernas'
      }
    ],
    technicalSpecs: {
      duration: '45 a 60 minutos',
      anesthesia: 'Resfriamento cutâneo em tempo real e gel anestésico tópico',
      recovery: 'Retorno imediato às atividades diárias',
      indicatedFor: 'Telangiectasias, vasinhos aparentes, microvarizes nas pernas e coxas',
      resultsIn: 'Resultados visíveis desde as primeiras sessões',
      sessionsRequired: '3 a 5 sessões (intervalo de 15 a 30 dias)'
    },
    postCareTips: [
      'Evitar exposição direta ao sol na região tratada por 14 dias.',
      'Usar protetor solar corporal diariamente.',
      'Utilizar meias de compressão suave se recomendado pela especialista.',
      'Evitar banhos quentes ou saunas nas primeiras 48 horas.'
    ],
    specialist: {
      name: 'Dra. Amanda Rodrigues',
      role: 'Biomédica Esteta & Especialista Vascular Estética',
      registration: 'CRBM 34.892-SP',
      bio: 'Especialista no tratamento combinado de telangiectasias com laser vascular e PEIM de alta performance.',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80'
    }
  },
  {
    id: 'botox-dysport',
    name: 'Botox & Dysport (Toxina Botulínica)',
    description: 'Prevenção e suavização de linhas de expressão na testa, pés de galinha, glabela e arquear das sobrancelhas com Dysport e Botox de extrema pureza e acabamento natural.',
    category: 'facial',
    popular: true,
    benefits: [
      'Toxina Botulínica de alta precisão (Dysport / Botox)',
      'Prevenção de rugas profundas e alívio do aspecto cansado',
      'Elevação harmônica do olhar sem efeito congelado',
      'Procedimento rápido de 30 minutos sem afastamento'
    ],
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    price: 'A partir de R$ 980,00',
    duration: '30 min',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    technicalSpecs: {
      duration: '30 minutos',
      anesthesia: 'Anestésico tópico de alta eficácia',
      recovery: 'Imediata (sem tempo de repouso)',
      indicatedFor: 'Rugas dinâmicas na testa, glabela, pés de galinha e arquear do olhar',
      resultsIn: 'Início de ação em 3 a 5 dias, pico aos 14 dias',
      sessionsRequired: '1 aplicação a cada 4 a 6 meses'
    },
    postCareTips: [
      'Não deitar ou abaixar a cabeça por 4 horas após a aplicação.',
      'Evitar atividades físicas intensas por 24 horas.',
      'Não massagear a região tratada nas primeiras 48 horas.'
    ],
    specialist: {
      name: 'Dra. Amanda Rodrigues',
      role: 'Biomédica Esteta',
      registration: 'CRBM 34.892-SP',
      bio: 'Especialista em aplicação estratégica de toxina botulínica para rejuvenescimento natural.',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80'
    }
  },
  {
    id: 'radiesse-sculptra',
    name: 'Radiesse & Sculptra (Bioestimuladores Injetáveis de Alta Performance)',
    description: 'Bioestimuladores de colágeno à base de Hidroxiapatita de Cálcio (Radiesse) e Ácido Poli-L-Láctico (Sculptra) para firmeza, densidade e sustentação profunda da pele.',
    category: 'facial',
    highlight: true,
    benefits: [
      'Estímulo contínuo de colágeno pelo próprio organismo',
      'Combate efetivo da flacidez facial, pescoço e corporal',
      'Efeito firmeza e melhora da qualidade da pele por até 2 anos',
      'Bioestruturação sem alterar os traços originais da face'
    ],
    image: 'https://images.unsplash.com/photo-1512290900676-26c2a48f4134?auto=format&fit=crop&w=800&q=80',
    price: 'A partir de R$ 1.950,00',
    duration: '45 min',
    technicalSpecs: {
      duration: '45 a 60 minutos',
      anesthesia: 'Anestésico local com lidocaína integrada',
      recovery: 'Tranquila (pequenos pontos de aplicação)',
      indicatedFor: 'Flacidez facial, perda de firmeza no pescoço, colo, braços e glúteos',
      resultsIn: 'Aparecimento progressivo a partir de 30 dias (pico aos 90 dias)',
      sessionsRequired: '1 a 3 sessões (conforme grau de flacidez)'
    },
    postCareTips: [
      'Realizar a massagem "5x5" (5 minutos, 5 vezes ao dia, por 5 dias) se Sculptra.',
      'Usar protetor solar diariamente.',
      'Manter boa ingestão de água e suplementação de vitamina C.'
    ],
    specialist: {
      name: 'Dr. Lucas Mendes',
      role: 'Farmacêutico Esteta & Especialista em Injetáveis',
      registration: 'CRF 58.102-SP',
      bio: 'Especialista em remodelação dérmica e vetorização com bioestimuladores de colágeno.',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80'
    }
  },
  {
    id: 'laser-lavieen',
    name: 'Laser Lavieén (Tecnologia BB Laser)',
    description: 'Tecnologia de Laser Thulium não ablativo que proporciona o famoso "Efeito BB Cream": clareamento de manchas, viço extremo, uniformização de tom e fechamento de poros.',
    category: 'facial',
    popular: true,
    benefits: [
      'Pele de porcelana com efeito iluminação e viço instantâneo',
      'Clareamento de melasma, sardas e manchas de acne',
      'Tratamento de poros dilatados e linhas finas',
      'Baixo downtime (retorno rápido à rotina de maquiagem)'
    ],
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    price: 'R$ 850,00 por sessão',
    duration: '45 min',
    technicalSpecs: {
      duration: '45 minutos',
      anesthesia: 'Anestésico tópico prévio',
      recovery: '1 a 3 dias (leve sensação de pele aveludada/areia)',
      indicatedFor: 'Manchas, melasma, poros abertos, rugas finas e falta de brilho',
      resultsIn: 'Primeiros efeitos de brilho em 3 a 7 dias',
      sessionsRequired: '1 a 3 sessões mensais'
    },
    postCareTips: [
      'Uso rigoroso de protetor solar FPS 50+ com cor.',
      'Caprichar na hidratação com regeneradores labiais/cutâneos.',
      'Evitar exposição ao sol direto nos primeiros 10 dias.'
    ],
    specialist: {
      name: 'Dra. Amanda Rodrigues',
      role: 'Biomédica Esteta',
      registration: 'CRBM 34.892-SP',
      bio: 'Especialista certificada em plataformas de Laser Thulium e rejuvenescimento pré-evento.',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80'
    }
  },
  {
    id: 'ultraformer',
    name: 'Ultraformer (Ultrassom Micro e Macrofocado)',
    description: 'Lifting facial e corporal sem cortes. Atua no SMAS (camada muscular) para estímulo de colágeno profundo, ancoragem da pele e redução seletiva de gordura da papada.',
    category: 'facial',
    popular: true,
    benefits: [
      'Efeito lifting natural sem necessidade de cirurgia',
      'Definição do contorno da mandíbula e afinamento de papada',
      'Combate rigoroso à flacidez do pescoço e pálpebras',
      'Resultados que evoluem continuamente por até 3 meses'
    ],
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80',
    price: 'A partir de R$ 1.500,00',
    duration: '50 min',
    technicalSpecs: {
      duration: '45 a 60 minutos',
      anesthesia: 'Anestésico em creme',
      recovery: 'Sem tempo de afastamento',
      indicatedFor: 'Flacidez facial e corporal, papada, sulco nasogeniano e perda de contorno',
      resultsIn: 'Efeito imediato de contração + pico do colágeno aos 90 dias',
      sessionsRequired: '1 a 2 sessões por ano'
    },
    postCareTips: [
      'Manter uso habitual de protetor solar.',
      'Hidratar bem a pele diariamente.',
      'Pode ocorrer leve sensibilidade tátil no contorno ósseo por alguns dias.'
    ],
    specialist: {
      name: 'Dra. Amanda Rodrigues',
      role: 'Biomédica Esteta',
      registration: 'CRBM 34.892-SP',
      bio: 'Especialista em ultrassom focado e sustentação tecidual.',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80'
    }
  },
  {
    id: 'emagrecimento',
    name: 'Protocolo de Emagrecimento Consciente & Alta Performance',
    description: 'Abordagem integrada para redução de peso e gordura visceral combinando enzimas metabólicas, aceleradores lipolíticos e acompanhamento estratégico da silhueta.',
    category: 'corporal',
    benefits: [
      'Aceleração do metabolismo e estimulação do gasto calórico',
      'Mesclas injetáveis metabólicas e desintoxicantes seguras',
      'Preservação de massa magra e redução seletiva de gordura',
      'Protocolo individualizado com acompanhamento contínuo'
    ],
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    price: 'A partir de R$ 450,00',
    duration: '45 min',
    technicalSpecs: {
      duration: '45 minutos por sessão',
      anesthesia: 'Não necessária',
      recovery: 'Imediata',
      indicatedFor: 'Perda de peso, redução de gordura corporal global e otimização metabólica',
      resultsIn: 'Perceptível desde a 2ª semana de acompanhamento',
      sessionsRequired: 'Programa de 4 a 8 sessões semanais'
    },
    postCareTips: [
      'Aumentar o consumo de água para pelo menos 2,5L diários.',
      'Manter alimentação balanceada orientada no protocolo.',
      'Praticar exercícios físicos regulares.'
    ],
    specialist: {
      name: 'Dr. Lucas Mendes',
      role: 'Farmacêutico Esteta',
      registration: 'CRF 58.102-SP',
      bio: 'Especialista em modulação metabólica e bioativos para perda de peso.',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80'
    }
  },
  {
    id: 'terapia-capilar',
    name: 'Tratamento para Queda de Cabelo (Com Ativos & Tecnologia Associada)',
    description: 'Protocolo especializado contra calvície e queda capilar acentuada. Associa microagulhamento com ativos fatores de crescimento, intradermoterapia e LEDterapia para estancar a queda e estimular novos fios.',
    category: 'capilar',
    benefits: [
      'Interrupção da queda acentuada de cabelos (eflúvio e alopecia)',
      'Estimulação direta de novos fios e engrossamento capilar',
      'Aplicação de ativos fatores de crescimento e intradermoterapia',
      'Fotobiomodulação por LED para ativar a circulação no couro cabeludo'
    ],
    image: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=800&q=80',
    price: 'R$ 380,00 por sessão',
    duration: '45 min',
    technicalSpecs: {
      duration: '45 a 60 minutos',
      anesthesia: 'Anestésico tópico leve no couro cabeludo',
      recovery: 'Retorno imediato às atividades',
      indicatedFor: 'Eflúvio telógeno, calvície masculina e feminina, queda pós-dengue/estresse e fios finos',
      resultsIn: 'Redução da queda em 3 a 4 semanas; novos fios em 60 a 90 dias',
      sessionsRequired: 'Protocolo de 5 a 10 sessões quinzenais'
    },
    postCareTips: [
      'Não lavar os cabelos por 12 horas após a sessão para melhor absorção dos ativos.',
      'Evitar exposição ao sol direto no couro cabeludo no dia da aplicação.',
      'Usar o tônico/medicação homecare prescrito pela especialista.'
    ],
    specialist: {
      name: 'Carla Silveira',
      role: 'Especialista em Terapia Capilar & Tricologia',
      registration: 'EST-SP 12.450',
      bio: 'Especialista em patologias do couro cabeludo e protocolos de fortalecimento capilar.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
    }
  },
  {
    id: 'gluteo-max',
    name: 'Glúteo Max (Harmonização Glútea)',
    description: 'Protocolo completo para remodelação, sustentação e volumização dos glúteos. Associa bioestimuladores de colágeno, preenchimento e ativos tensores para empinar e arredondar os glúteos.',
    category: 'corporal',
    popular: true,
    benefits: [
      'Efeito levanta bumbum e definição do contorno das nádegas',
      'Preenchimento de depressões laterais ("hip dips") e celulites profundas',
      'Estímulo potente de firmeza contra a flacidez glútea',
      'Resultado natural e imediato sem cirurgia ou prótese'
    ],
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80',
    price: 'A partir de R$ 1.200,00',
    duration: '50 min',
    technicalSpecs: {
      duration: '50 a 60 minutos',
      anesthesia: 'Anestésico local integrado',
      recovery: 'Tranquila (evitar exercícios de glúteos por 48h)',
      indicatedFor: 'Flacidez glútea, falta de volume, depressão trocantérica e descaimento',
      resultsIn: 'Efeito volumizador imediato + melhora contínua da firmeza em 30 a 60 dias',
      sessionsRequired: '1 a 3 sessões'
    },
    postCareTips: [
      'Evitar treino pesado de pernas e glúteos nas primeiras 48 horas.',
      'Seguir orientações de massagem ou repouso prestadas pela equipe.',
      'Beba bastante água para auxiliar a síntese de colágeno.'
    ],
    specialist: {
      name: 'Dr. Lucas Mendes',
      role: 'Farmacêutico Esteta',
      registration: 'CRF 58.102-SP',
      bio: 'Especialista em harmonização glútea e remodelagem de contorno corporal.',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80'
    }
  },
  {
    id: 'massagens',
    name: 'Massagens (Drenagem Linfática, Relaxante e Modeladora)',
    description: 'Menu completo de massagens manuais adaptadas ao seu objetivo: Drenagem Linfática para edemas/retenção, Massagem Relaxante com aromaterapia e Massagem Modeladora Redutora.',
    category: 'bem-estar',
    benefits: [
      'Redução imediata de inchaços e retenção de líquidos',
      'Modelagem da cintura e pernas através de manobras intensas',
      'Alívio profundo do estresse, ansiedade e dores musculares',
      'Aumento da circulação e renovação energética'
    ],
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80',
    price: 'A partir de R$ 180,00',
    duration: '60 min',
    technicalSpecs: {
      duration: '50 a 75 minutos',
      anesthesia: 'Não aplicável',
      recovery: 'Sensação imediata de leveza e bem-estar',
      indicatedFor: 'Retenção hídrica, estresse, cansaço, edemas e gordura localizada',
      resultsIn: 'Sensação e desinchamento imediatos na 1ª sessão',
      sessionsRequired: 'Avulso ou pacotes semanais'
    },
    postCareTips: [
      'Beba um copo de água logo após o término da sessão.',
      'Evitar refeições pesadas na hora seguinte à massagem.',
      'Aproveite a sensação de relaxamento para descansar.'
    ],
    specialist: {
      name: 'Isabela Fontes',
      role: 'Massoterapeuta & Terapeuta Holística',
      registration: 'CRTH 8.910',
      bio: 'Especialista em técnicas de drenagem linfática e massoterapia integrativa.',
      avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=300&q=80'
    }
  },
  {
    id: 'gordura-localizada',
    name: 'Gordura Localizada (Lipo Enzimática)',
    description: 'Combate focado às gordurinhas difíceis do abdômen, flancos, culotes, papada e braços com aplicação de enzimas lipolíticas concentradas que destroem as células de gordura.',
    category: 'corporal',
    highlight: true,
    benefits: [
      'Ação direta no tecido adiposo sem necessidade de cortes',
      'Redução perceptível de medidas e afinamento da silhueta',
      'Combinação personalizada de enzimas queimadoras de gordura',
      'Aplicação rápida e segura com retorno imediato à rotina'
    ],
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    price: 'R$ 350,00 por sessão',
    duration: '30 min',
    technicalSpecs: {
      duration: '30 a 40 minutos',
      anesthesia: 'Anestésico local integrado',
      recovery: 'Retorno imediato às atividades normais',
      indicatedFor: 'Gordura acumulada no abdômen, flancos, papada, culotes e dobras do sutiã',
      resultsIn: 'A partir da 2ª ou 3ª sessão',
      sessionsRequired: 'Protocolo recomendado de 4 a 6 sessões'
    },
    postCareTips: [
      'Beber 2 a 3 litros de água diariamente para eliminar gordura metabolizada.',
      'Praticar atividade física moderada após a sessão.',
      'Evitar bebidas alcoólicas por 48 horas.'
    ],
    specialist: {
      name: 'Dr. Lucas Mendes',
      role: 'Farmacêutico Esteta',
      registration: 'CRF 58.102-SP',
      bio: 'Especialista em mesoterapia lipolítica e redução de medidas.',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80'
    }
  },
  {
    id: 'flacidez',
    name: 'Flacidez (Criofrequência & Bioestimulação)',
    description: 'Combinação potente do choque térmico da Criofrequência com tecnologia multipolar para contração imediata das fibras e remodelação profunda do colágeno corporal e facial.',
    category: 'corporal',
    benefits: [
      'Efeito tensor imediato e pele visivelmente mais firme',
      'Estímulo intenso e duradouro de novas fibras de colágeno e elastina',
      'Tratamento indolor e confortável com resfriamento a -10°C',
      'Excelente para flacidez do abdômen pós-parto, pernas, braços e papada'
    ],
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    price: 'R$ 290,00 por sessão',
    duration: '40 min',
    technicalSpecs: {
      duration: '40 a 50 minutos',
      anesthesia: 'Não necessária (cabeçote gelado a -10°C)',
      recovery: 'Imediata',
      indicatedFor: 'Flacidez tissular corporal e facial, umbigo triste, celulite e perda de tônus',
      resultsIn: 'Lifting perceptível na 1ª sessão com evolução quinzenal',
      sessionsRequired: '6 a 8 sessões quinzenais'
    },
    postCareTips: [
      'Beba bastante água.',
      'Evite o uso de cosméticos congelantes logo após a sessão.',
      'Manter alimentação rica em proteínas e vitamina C.'
    ],
    specialist: {
      name: 'Carla Silveira',
      role: 'Esteticista Cosmetóloga Sênior',
      registration: 'EST-SP 12.450',
      bio: 'Especialista em tecnologia médica para firmeza cutânea e eletroterapia.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
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
    badge: 'OFERTA CAMPEÃ DE ATRAÇÃO',
    title: 'Protocolo Secagem de Vasinhos (Laser + Injetável)',
    subtitle: 'Ação rápida contra vasinhos e microvarizes com laser vascular de alta precisão e PEIM.',
    discount: '30% OFF',
    originalPrice: 'R$ 550',
    promoPrice: 'R$ 380',
    couponCode: 'PERNASLINDAS',
    expiresInDays: 5,
    treatmentId: 'secagem-vasinhos',
    active: true,
  },
  {
    id: 'promo-2',
    badge: 'ESTÍMULO DE COLÁGENO',
    title: 'Radiesse / Sculptra + Anestésico Tópico',
    subtitle: 'Bioestimulador de alta performance para firmeza e combate da flacidez.',
    discount: 'R$ 350 OFF',
    originalPrice: 'R$ 2.300',
    promoPrice: 'R$ 1.950',
    couponCode: 'COLAGENO2026',
    expiresInDays: 8,
    treatmentId: 'radiesse-sculptra',
    active: true,
  },
  {
    id: 'promo-3',
    badge: 'PELE DE PORCELANA',
    title: 'Laser Lavieén (Efeito BB Laser)',
    subtitle: 'Pele iluminada, fechamento de poros e clareamento de manchas.',
    discount: '25% OFF',
    originalPrice: 'R$ 1.100',
    promoPrice: 'R$ 850',
    couponCode: 'LAVIEENGLOW',
    expiresInDays: 3,
    treatmentId: 'laser-lavieen',
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

