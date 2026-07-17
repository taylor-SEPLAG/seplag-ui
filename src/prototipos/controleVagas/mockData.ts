import type { QuadroAutorizadoRow, RegraEvento, Vaga } from "./types";
import { gerarVagasDoQuadro } from "./vagaUtils";

export const regrasControleVagasMock: RegraEvento[] = [
  {id:1,evento:"Ampliação legal do quadro",origem:"Lei ou ato autorizativo",impacto:"Autorização",comportamento:"Cria novas vagas individualizadas e numeradas após a vigência",validacao:"Provisória"},
  {id:2,evento:"Redução legal do quadro",origem:"Lei ou ato autorizativo",impacto:"Autorização",comportamento:"Extingue vagas disponíveis e marca ocupadas para extinção progressiva",validacao:"Provisória"},
  {id:3,evento:"Transformação de cargo",origem:"Lei ou ato autorizativo",impacto:"Autorização",comportamento:"Preserva a identidade e o histórico da vaga, registrando cargo de origem e destino",validacao:"Provisória"},
  {id:4,evento:"Início de processo de ocupação",origem:"Ingresso do Servidor",impacto:"Comprometimento",comportamento:"Adiciona fases à vaga disponível sem alterar seu estado",validacao:"Provisória"},
  {id:5,evento:"Efetivo exercício",origem:"Vida funcional",impacto:"Ocupação",comportamento:"Relaciona um vínculo à vaga e altera o estado para ocupada",validacao:"Provisória"},
  {id:6,evento:"Início de processo de disponibilização",origem:"Vida funcional",impacto:"Comprometimento",comportamento:"Adiciona fases à vaga ocupada sem antecipar sua liberação",validacao:"Provisória"},
  {id:7,evento:"Encerramento definitivo do vínculo",origem:"Vida funcional",impacto:"Liberação",comportamento:"Encerra a ocupação nominal e torna a vaga disponível",validacao:"Provisória"},
  {id:8,evento:"Cancelamento de processo",origem:"Sistema de origem",impacto:"Liberação",comportamento:"Cancela as fases ativas sem alterar o estado da vaga",validacao:"Provisória"},
  {id:9,evento:"Cessão funcional",origem:"Vida funcional",impacto:"Ocupação",comportamento:"Altera apenas o órgão de exercício; a titularidade da vaga é preservada",validacao:"Provisória"},
  {id:10,evento:"Movimento de distribuição",origem:"Controle de Vagas",impacto:"Autorização",comportamento:"Distribui, transfere ou recolhe a vaga numerada sem apagar movimentos anteriores",validacao:"Provisória"},
  {id:11,evento:"Decisão judicial extraquadro",origem:"Decisão judicial",impacto:"Exceção",comportamento:"Registra vínculo excepcional separado das vagas legais e não amplia o quadro",validacao:"Provisória"},
  {id:12,evento:"Movimento retroativo",origem:"Sistema de origem",impacto:"Exceção",comportamento:"Recalcula a posição temporal desde a data de efeito, preservando a data de registro",validacao:"Provisória"},
];
export const pendenciasRegrasMock=["Marco definitivo e documento que comprovam o efetivo exercício","Eventos definitivos de disponibilização por tipo de vínculo","Órgãos de exercício permitidos por carreira e hipóteses de autorização especial","Critério de encerramento de ocupação judicial extraquadro","Periodicidade de homologação da metodologia e das taxas de projeção"];

export const quadrosAutorizadosMock: QuadroAutorizadoRow[]=[
 {id:1,codigo:"QA-0001",tipoQuadro:"Efetivo",vinculo:"Servidor efetivo",regime:"Estatutário",carreira:"Gestão Governamental",cargo:"Analista Administrativo",especialidade:"Administração",orgao:"SEPLAG",abrangencia:"Órgão específico",autorizadas:120,ocupadas:108,comprometidas:4,bloqueadas:0,inicioVigencia:"01/01/2025",fimVigencia:"",ato:"Lei Complementar nº 550/2014",processo:"SEPLAG-PRO-2025/00120",situacao:"Vigente",versao:3,atualizadoEm:"10/07/2026"},
 {id:2,codigo:"QA-0002",tipoQuadro:"Efetivo",vinculo:"Servidor efetivo",regime:"Estatutário",carreira:"Saúde Pública",cargo:"Técnico em Enfermagem",especialidade:"",orgao:"SES",abrangencia:"Órgão específico",autorizadas:500,ocupadas:472,comprometidas:8,bloqueadas:2,inicioVigencia:"01/03/2025",fimVigencia:"",ato:"Lei nº 12.104/2023",processo:"SES-PRO-2025/00871",situacao:"Vigente",versao:2,atualizadoEm:"08/07/2026"},
 {id:3,codigo:"QA-0003",tipoQuadro:"Comissionado",vinculo:"Exclusivamente comissionado",regime:"Administrativo",carreira:"Direção e Assessoramento",cargo:"DGA-6",especialidade:"",orgao:"SEFAZ",abrangencia:"Órgão específico",autorizadas:42,ocupadas:40,comprometidas:1,bloqueadas:0,inicioVigencia:"01/01/2026",fimVigencia:"",ato:"Lei Complementar nº 266/2006",processo:"SEFAZ-PRO-2026/00045",situacao:"Vigente",versao:1,atualizadoEm:"02/07/2026"},
 {id:6,codigo:"QA-0006",tipoQuadro:"Efetivo",vinculo:"Servidor efetivo",regime:"Estatutário",carreira:"Segurança Pública",cargo:"Investigador de Polícia",especialidade:"",orgao:"PJC",abrangencia:"Quadro geral",autorizadas:850,ocupadas:822,comprometidas:17,bloqueadas:0,inicioVigencia:"01/01/2026",fimVigencia:"",ato:"Lei Complementar nº 407/2010",processo:"PJC-PRO-2026/00091",situacao:"Aguardando aprovação",versao:4,atualizadoEm:"09/07/2026"},
];
export const vagasIndividualizadasMock: Vaga[] = quadrosAutorizadosMock
  .filter((quadro) => quadro.situacao === "Vigente" && (quadro.tipoQuadro === "Efetivo" || quadro.tipoQuadro === "Comissionado"))
  .flatMap(gerarVagasDoQuadro);
