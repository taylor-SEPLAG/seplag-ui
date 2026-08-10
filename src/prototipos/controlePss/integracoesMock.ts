import type { IntegracaoExterna } from "./types";

export const integracoesPssMock:IntegracaoExterna[]=[
 {
  id:"INT-SIES",sistema:"SIES",nome:"SIES — Sistema de Gestão de Concursos",
  finalidade:"Cadastro do certame, dos cargos, do cadastro de reserva e das convocações.",
  situacaoAtual:"PARCIAL",
  oQueFalta:[
   "Definir a fonte única do cadastro de cargos e vagas do certame para eliminar a dupla digitação.",
   "Publicar serviço de consulta de cargos do SIES para validação em tempo real no SIGEP.",
   "Conciliar automaticamente o quantitativo de vagas entre SIGEP e SIES.",
   "Validar o CBO do cargo contra a tabela do eSocial no momento do cadastro.",
  ],
  responsavel:"SEPLAG — Coordenadoria de Concursos / MTI",
  ultimaVerificacao:"2026-07-24",criticidade:"ALTA",
  etapasImpactadas:["CADASTRO_SIES","CADASTRO_RESERVA","CONVOCACAO","CONTROLE_VAGAS_SIGEP"],
 },
 {
  id:"INT-IOMAT",sistema:"IOMAT",nome:"IOMAT — Imprensa Oficial do Estado de Mato Grosso",
  finalidade:"Encaminhamento e publicação dos atos do certame.",
  situacaoAtual:"NAO_INTEGRADO",
  oQueFalta:[
   "Substituir o envio por ofício e arquivo em Word por remessa eletrônica.",
   "Retornar automaticamente número, data e página da publicação para o processo.",
   "Padronizar os modelos de edital, listagens e convocação.",
  ],
  responsavel:"IOMAT / SEPLAG — Comunicação",
  ultimaVerificacao:"2026-07-18",criticidade:"ALTA",
  etapasImpactadas:["PUBLICACAO_EDITAL","PUBLICACOES","HOMOLOGACAO"],
 },
 {
  id:"INT-DIARIO",sistema:"DIARIO_OFICIAL",nome:"Diário Oficial do Estado",
  finalidade:"Publicidade legal dos atos e contagem dos prazos do certame.",
  situacaoAtual:"NAO_INTEGRADO",
  oQueFalta:[
   "Registrar a publicação como evento do processo, com data de efeito para contagem de prazo.",
   "Vincular o documento publicado ao processo do Sigadoc.",
   "Disparar alerta quando o prazo de apresentação do convocado se aproximar do término.",
  ],
  responsavel:"SEPLAG — Gestão de Pessoas",
  ultimaVerificacao:"2026-07-18",criticidade:"MEDIA",
  etapasImpactadas:["PUBLICACAO_EDITAL","CONVOCACAO","PUBLICACOES"],
 },
 {
  id:"INT-TCE",sistema:"TCE",nome:"TCE-MT — Tribunal de Contas do Estado",
  finalidade:"Remessa das informações do certame e dos atos de admissão para fiscalização.",
  situacaoAtual:"PARCIAL",
  oQueFalta:[
   "Definir leiaute e periodicidade da remessa dos dados do certame.",
   "Automatizar a extração a partir do processo, sem montagem manual do arquivo.",
   "Registrar o protocolo de remessa como evento do processo.",
  ],
  responsavel:"SEPLAG — Gestão de Pessoas / CGE",
  ultimaVerificacao:"2026-07-10",criticidade:"MEDIA",
  etapasImpactadas:["HOMOLOGACAO"],
 },
];
