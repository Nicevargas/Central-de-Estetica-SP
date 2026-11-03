/** Vídeos 16:9 do Laser Lavieén, hospedados em /public/videos/lavieen */
export interface LavieenVideo {
  src: string;
  poster: string;
  title: string;
  description: string;
}

export const LAVIEEN_TREATMENT_ID = 'laser-lavieen';

const video = (file: string, title: string, description: string): LavieenVideo => ({
  src: `/videos/lavieen/${file}.mp4`,
  poster: `/videos/lavieen/${file}.jpg`,
  title,
  description,
});

export const LAVIEEN_VIDEOS: LavieenVideo[] = [
  video('laser-lavieen', 'Conheça o Laser Lavieén', 'Como funciona o Lavieén e o que esperar do tratamento.'),
  video('anete-lavieen', 'Lavieén: colo, papada e renovação da pele', 'Explicação completa sobre o procedimento, cuidados e pós.'),
  video('lavieen-anete', 'Lavieén: perguntas e cuidados', 'Dúvidas frequentes sobre tipo de pele, pós-sessão e o que evitar.'),
  video('estrias', 'Lavieén nas estrias', 'Tratamento de estrias, inclusive em cima de tatuagem. Em média de 3 a 6 sessões.'),
  video('maos', 'Lavieén nas mãos', 'Estímulo de colágeno e renovação da pele das mãos.'),
  video('secagem-veias', 'Lavieén na secagem de veias', 'Tratamento de vasinhos e veias com o laser.'),
  video('pernas', 'Lavieén nas pernas', 'Tratamento região por região nas pernas.'),
];
