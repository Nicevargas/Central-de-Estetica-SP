import { FAQ, ContactInfo } from './types';

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

// Google Meu Negócio (Perfil da Empresa no Google)
// Cole aqui o link "Pedir avaliações" do painel do Perfil da Empresa (ex.: https://g.page/r/XXXX/review).
// Enquanto estiver vazio, o botão "Avaliar no Google" não é exibido.
export const GOOGLE_REVIEW_URL = '';
export const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Central+da+Est%C3%A9tica+Rua+Artur+Fraz%C3%A3o+33+S%C3%A3o+Paulo';
export const GOOGLE_MAPS_EMBED_URL =
  'https://www.google.com/maps?q=Central+da+Est%C3%A9tica,+Rua+Artur+Fraz%C3%A3o,+33,+Jardim+Paulista,+S%C3%A3o+Paulo+-+SP&output=embed';
export const OPENING_HOURS = ['Seg a Sex: 8h às 20h', 'Sábado: 8h às 16h'];

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

