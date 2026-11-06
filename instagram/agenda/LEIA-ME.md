# Fila agendada do Instagram (@centraldaesteticasp)

Cada pasta é um post. O GitHub Actions (`instagram-agenda.yml`) roda a cada 30 minutos
e publica as pastas cujo horário em `agendamento.txt` já passou e que ainda não têm `publicado.txt`.

- `agendamento.txt`: data e hora com fuso, ex. `2026-11-09T16:00:00-03:00`
- `legenda.txt`: legenda do post
- `video.mp4`: vira Reel; senão, os `slide-N.jpg` viram carrossel
- `publicado.txt`: criado pelo robô depois de publicar (nunca repete)

Para cancelar um post, apague a pasta. Para mudar o horário, edite `agendamento.txt`.
O GitHub pode atrasar a execução em alguns minutos. Posts atrasados em mais de 24 h são ignorados.
