import type { DashboardRow, QuadroAutorizadoRow, RegraEvento, Vaga } from "./types";
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
export const dashboardControleVagasMock: DashboardRow[]=[
 {id:1,cargo:"Analista Administrativo",orgao:"SEPLAG",unidade:"Gestão de Pessoas",vinculo:"Efetivo",autorizado:120,distribuido:110,ocupado:100,comprometido:6,bloqueado:0,saidas:6,processos:2,situacao:"Crítica"},
 {id:2,cargo:"Técnico em Enfermagem",orgao:"SES",unidade:"Hospital Metropolitano",vinculo:"Efetivo",autorizado:500,distribuido:480,ocupado:462,comprometido:15,bloqueado:2,saidas:25,processos:8,situacao:"Crítica"},
 {id:4,cargo:"Investigador de Polícia",orgao:"PJC",unidade:"Diretoria Metropolitana",vinculo:"Efetivo",autorizado:850,distribuido:840,ocupado:822,comprometido:17,bloqueado:0,saidas:14,processos:12,situacao:"Crítica"},
 {id:5,cargo:"DGA-6",orgao:"SEFAZ",unidade:"Gabinete",vinculo:"Comissionado",autorizado:42,distribuido:42,ocupado:40,comprometido:1,bloqueado:1,saidas:0,processos:1,situacao:"Sem saldo"},
 {id:6,cargo:"Analista de Meio Ambiente",orgao:"SEMA",unidade:"Superintendência de Licenciamento",vinculo:"Efetivo",autorizado:95,distribuido:88,ocupado:72,comprometido:3,bloqueado:0,saidas:4,processos:0,situacao:"Regular"},
 {id:7,cargo:"Engenheiro Civil",orgao:"SINFRA",unidade:"Superintendência de Obras",vinculo:"Efetivo",autorizado:70,distribuido:68,ocupado:66,comprometido:3,bloqueado:0,saidas:5,processos:1,situacao:"Excedente"},
 {id:8,cargo:"Agente do Sistema Penitenciário",orgao:"SESP",unidade:"Sistema Penitenciário",vinculo:"Efetivo",autorizado:620,distribuido:600,ocupado:541,comprometido:18,bloqueado:4,saidas:22,processos:10,situacao:"Atenção"},
 {id:9,cargo:"Assistente Administrativo",orgao:"SETASC",unidade:"Administração Sistêmica",vinculo:"Efetivo",autorizado:80,distribuido:68,ocupado:51,comprometido:2,bloqueado:0,saidas:3,processos:0,situacao:"Regular"},
 {id:10,cargo:"Médico",orgao:"SES",unidade:"Hospital Regional",vinculo:"Efetivo",autorizado:240,distribuido:230,ocupado:215,comprometido:5,bloqueado:0,saidas:18,processos:2,situacao:"Divergente"},
];
export const vagasIndividualizadasMock: Vaga[] = quadrosAutorizadosMock
  .filter((quadro) => quadro.situacao === "Vigente" && (quadro.tipoQuadro === "Efetivo" || quadro.tipoQuadro === "Comissionado"))
  .flatMap(gerarVagasDoQuadro);
