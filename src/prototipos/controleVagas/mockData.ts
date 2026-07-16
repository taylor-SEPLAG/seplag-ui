import type { DashboardRow, DistribuicaoRow, MovimentoRow, PendenciaRow, QuadroAutorizadoRow, RegraEvento, Vaga } from "./types";
import { gerarVagasDoQuadro } from "./vagaUtils";

export const regrasControleVagasMock: RegraEvento[] = [
  {id:1,evento:"Aumento do quadro",origem:"Ato autorizativo",impacto:"Autorização",comportamento:"Aumenta o quantitativo autorizado",validacao:"Provisória"},
  {id:2,evento:"Redução do quadro",origem:"Ato autorizativo",impacto:"Autorização",comportamento:"Reduz o autorizado e alerta se houver excedente",validacao:"Provisória"},
  {id:3,evento:"Comprometimento da vaga",origem:"Sistema externo",impacto:"Comprometimento",comportamento:"Sinaliza processo em andamento sobre a vaga",validacao:"Provisória"},
  {id:4,evento:"Cancelamento do comprometimento",origem:"Sistema externo",impacto:"Liberação",comportamento:"Encerra o processo de comprometimento",validacao:"Provisória"},
  {id:5,evento:"Ocupação confirmada",origem:"Vida funcional",impacto:"Ocupação",comportamento:"Registra a ocupação da vaga",validacao:"Provisória"},
  {id:6,evento:"Ocupação direta",origem:"Vida funcional",impacto:"Ocupação",comportamento:"Aumenta a quantidade ocupada",validacao:"Provisória"},
  {id:7,evento:"Vacância ou desligamento",origem:"Vida funcional",impacto:"Liberação",comportamento:"Encerra a ocupação e libera a vaga",validacao:"Provisória"},
  {id:8,evento:"Bloqueio administrativo",origem:"Controle de Vagas",impacto:"Bloqueio",comportamento:"Impede temporariamente a utilização",validacao:"Provisória"},
  {id:9,evento:"Desbloqueio",origem:"Controle de Vagas",impacto:"Bloqueio",comportamento:"Remove o impedimento administrativo",validacao:"Provisória"},
  {id:10,evento:"Transferência",origem:"Controle de Vagas",impacto:"Liberação",comportamento:"Move a vaga entre distribuições sem alterar o total",validacao:"Provisória"},
  {id:11,evento:"Decisão judicial",origem:"Sistema externo",impacto:"Exceção",comportamento:"Registra ocupação excepcional sem ampliar o quadro",validacao:"Provisória"},
  {id:12,evento:"Retificação retroativa",origem:"Sistema de origem",impacto:"Exceção",comportamento:"Recalcula os saldos desde a data de efeito",validacao:"Provisória"},
];
export const pendenciasRegrasMock=["Marco que transforma uma vaga em ocupada","Existência de comprometimento formal antes da ocupação","Evento e data que liberam a vaga","Dimensões obrigatórias do saldo por modalidade","Modalidades que exigem vaga individualmente numerada","Tratamento definitivo de extraquadro e decisão judicial"];

export const quadrosAutorizadosMock: QuadroAutorizadoRow[]=[
 {id:1,codigo:"QA-0001",tipoQuadro:"Efetivo",vinculo:"Servidor efetivo",regime:"Estatutário",carreira:"Gestão Governamental",cargo:"Analista Administrativo",especialidade:"Administração",orgao:"SEPLAG",abrangencia:"Órgão específico",autorizadas:120,ocupadas:108,comprometidas:4,bloqueadas:0,inicioVigencia:"01/01/2025",fimVigencia:"",ato:"Lei Complementar nº 550/2014",processo:"SEPLAG-PRO-2025/00120",situacao:"Vigente",versao:3,atualizadoEm:"10/07/2026"},
 {id:2,codigo:"QA-0002",tipoQuadro:"Efetivo",vinculo:"Servidor efetivo",regime:"Estatutário",carreira:"Saúde Pública",cargo:"Técnico em Enfermagem",especialidade:"",orgao:"SES",abrangencia:"Órgão específico",autorizadas:500,ocupadas:472,comprometidas:8,bloqueadas:2,inicioVigencia:"01/03/2025",fimVigencia:"",ato:"Lei nº 12.104/2023",processo:"SES-PRO-2025/00871",situacao:"Vigente",versao:2,atualizadoEm:"08/07/2026"},
 {id:3,codigo:"QA-0003",tipoQuadro:"Comissionado",vinculo:"Exclusivamente comissionado",regime:"Administrativo",carreira:"Direção e Assessoramento",cargo:"DGA-6",especialidade:"",orgao:"SEFAZ",abrangencia:"Órgão específico",autorizadas:42,ocupadas:40,comprometidas:1,bloqueadas:0,inicioVigencia:"01/01/2026",fimVigencia:"",ato:"Lei Complementar nº 266/2006",processo:"SEFAZ-PRO-2026/00045",situacao:"Vigente",versao:1,atualizadoEm:"02/07/2026"},
 {id:6,codigo:"QA-0006",tipoQuadro:"Efetivo",vinculo:"Servidor efetivo",regime:"Estatutário",carreira:"Segurança Pública",cargo:"Investigador de Polícia",especialidade:"",orgao:"PJC",abrangencia:"Quadro geral",autorizadas:850,ocupadas:822,comprometidas:17,bloqueadas:0,inicioVigencia:"01/01/2026",fimVigencia:"",ato:"Lei Complementar nº 407/2010",processo:"PJC-PRO-2026/00091",situacao:"Aguardando aprovação",versao:4,atualizadoEm:"09/07/2026"},
];

export const distribuicoesVagasMock: DistribuicaoRow[]=[
 {id:1,quadro:"QA-0001",cargo:"Analista Administrativo",especialidade:"Administração",vinculo:"Efetivo",orgao:"SEPLAG",unidade:"Administração Sistêmica",autorizado:120,distribuido:52,ocupado:46,comprometido:2,bloqueado:0,vigencia:"01/01/2025",situacao:"Atenção"},
 {id:2,quadro:"QA-0001",cargo:"Analista Administrativo",especialidade:"Administração",vinculo:"Efetivo",orgao:"SEPLAG",unidade:"Gestão de Pessoas",autorizado:120,distribuido:38,ocupado:36,comprometido:1,bloqueado:0,vigencia:"01/01/2025",situacao:"Crítica"},
 {id:3,quadro:"QA-0001",cargo:"Analista Administrativo",especialidade:"Administração",vinculo:"Efetivo",orgao:"SEPLAG",unidade:"Tecnologia da Informação",autorizado:120,distribuido:20,ocupado:18,comprometido:1,bloqueado:0,vigencia:"01/01/2025",situacao:"Crítica"},
 {id:4,quadro:"QA-0002",cargo:"Técnico em Enfermagem",especialidade:"",vinculo:"Efetivo",orgao:"SES",unidade:"Hospital Metropolitano",autorizado:500,distribuido:210,ocupado:202,comprometido:5,bloqueado:2,vigencia:"01/03/2025",situacao:"Crítica"},
 {id:5,quadro:"QA-0002",cargo:"Técnico em Enfermagem",especialidade:"",vinculo:"Efetivo",orgao:"SES",unidade:"Hospital Regional de Rondonópolis",autorizado:500,distribuido:160,ocupado:158,comprometido:3,bloqueado:0,vigencia:"01/03/2025",situacao:"Excedente"},
 {id:6,quadro:"QA-0003",cargo:"DGA-6",especialidade:"",vinculo:"Comissionado",orgao:"SEFAZ",unidade:"Gabinete",autorizado:42,distribuido:18,ocupado:17,comprometido:1,bloqueado:0,vigencia:"01/01/2026",situacao:"Sem saldo"},
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

export const movimentacoesVagasMock: MovimentoRow[]=[
 {id:1,codigo:"MOV-00128",dataEfeito:"15/07/2026",dataRegistro:"15/07/2026 09:42",evento:"Ocupação confirmada",tipo:"Ocupação",quadro:"QA-0001",cargo:"Analista Administrativo",orgao:"SEPLAG",unidade:"Gestão de Pessoas",quantidade:1,impacto:"-",parcela:"Ocupadas",saldoAnterior:2,saldoPosterior:1,origem:"Vida Funcional",referencia:"Vínculo 1045892",processo:"SEPLAG-PRO-2026/01820",responsavel:"Integração SIGEP",situacao:"Processada",retroativa:false},
 {id:2,codigo:"MOV-00127",dataEfeito:"14/07/2026",dataRegistro:"14/07/2026 16:18",evento:"Comprometimento de vaga",tipo:"Comprometimento",quadro:"QA-0002",cargo:"Técnico em Enfermagem",orgao:"SES",unidade:"Hospital Metropolitano",quantidade:3,impacto:"-",parcela:"Comprometidas",saldoAnterior:6,saldoPosterior:3,origem:"Ingresso do Servidor",referencia:"Lote de ingresso 2026/041",processo:"SES-PRO-2026/04211",responsavel:"Integração SIGEP",situacao:"Processada",retroativa:false},
 {id:3,codigo:"MOV-00126",dataEfeito:"01/07/2026",dataRegistro:"14/07/2026 11:05",evento:"Liberação por vacância",tipo:"Liberação",quadro:"QA-0001",cargo:"Analista Administrativo",orgao:"SEPLAG",unidade:"Administração Sistêmica",quantidade:1,impacto:"+",parcela:"Disponíveis",saldoAnterior:5,saldoPosterior:6,origem:"Vida Funcional",referencia:"Vacância 2026/0098",processo:"SEPLAG-PRO-2026/01702",responsavel:"Integração SIGEP",situacao:"Processada",retroativa:true},
 {id:4,codigo:"MOV-00125",dataEfeito:"12/07/2026",dataRegistro:"12/07/2026 14:27",evento:"Bloqueio administrativo",tipo:"Bloqueio",quadro:"QA-0003",cargo:"DGA-6",orgao:"SEFAZ",unidade:"Gabinete",quantidade:1,impacto:"-",parcela:"Bloqueadas",saldoAnterior:2,saldoPosterior:1,origem:"Controle de Vagas",referencia:"Bloqueio administrativo",processo:"SEFAZ-PRO-2026/01108",responsavel:"Marta Silva",situacao:"Processada",retroativa:false},
 {id:5,codigo:"MOV-00124",dataEfeito:"10/07/2026",dataRegistro:"10/07/2026 17:03",evento:"Transferência entre unidades",tipo:"Transferência",quadro:"QA-0001",cargo:"Analista Administrativo",orgao:"SEPLAG",unidade:"TI → Gestão de Pessoas",quantidade:2,impacto:"↔",parcela:"Distribuídas",saldoAnterior:20,saldoPosterior:18,origem:"Controle de Vagas",referencia:"Redistribuição interna",processo:"SEPLAG-PRO-2026/01642",responsavel:"Marta Silva",situacao:"Processada",retroativa:false},
 {id:6,codigo:"MOV-00123",dataEfeito:"09/07/2026",dataRegistro:"09/07/2026 10:31",evento:"Ocupação por decisão judicial",tipo:"Exceção",quadro:"QA-0002",cargo:"Técnico em Enfermagem",orgao:"SES",unidade:"Hospital Regional de Rondonópolis",quantidade:1,impacto:"-",parcela:"Excedentes",saldoAnterior:0,saldoPosterior:-1,origem:"Vida Funcional",referencia:"Decisão judicial 0801122-42.2026",processo:"SES-PRO-2026/03991",responsavel:"Integração SIGEP",situacao:"Processada",retroativa:false},
];
export const pendenciasMovimentacoesMock: PendenciaRow[]=[
 {id:1,recebidaEm:"15/07/2026 10:02",evento:"Ocupação confirmada",origem:"Vida Funcional",cargo:"Médico",orgao:"SES",motivo:"Quadro autorizado não localizado para a especialidade",criticidade:"Alta",tentativas:3},
 {id:2,recebidaEm:"15/07/2026 09:18",evento:"Liberação por exoneração",origem:"Vida Funcional",cargo:"DGA-5",orgao:"SINFRA",motivo:"Unidade de origem sem distribuição vigente",criticidade:"Alta",tentativas:2},
 {id:4,recebidaEm:"14/07/2026 14:11",evento:"Ocupação confirmada",origem:"Vida Funcional",cargo:"Analista de Meio Ambiente",orgao:"SEMA",motivo:"Evento possivelmente duplicado",criticidade:"Média",tentativas:1},
];

export const vagasIndividualizadasMock: Vaga[] = quadrosAutorizadosMock
  .filter((quadro) => quadro.situacao === "Vigente" && (quadro.tipoQuadro === "Efetivo" || quadro.tipoQuadro === "Comissionado"))
  .flatMap(gerarVagasDoQuadro);