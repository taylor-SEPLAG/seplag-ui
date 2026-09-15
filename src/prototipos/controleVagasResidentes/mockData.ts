import type { QuadroAutorizadoRow, RegraEvento, Vaga } from "./types";

export const regrasControleVagasMock: RegraEvento[] = [
  {
    id: 1,
    evento: "Ampliação legal do quadro",
    origem: "Lei ou ato autorizativo",
    impacto: "Autorização",
    comportamento:
      "Cria novas vagas individualizadas e numeradas após a vigência",
    validacao: "Provisória",
  },
  {
    id: 2,
    evento: "Redução legal do quadro",
    origem: "Lei ou ato autorizativo",
    impacto: "Autorização",
    comportamento:
      "Extingue vagas disponíveis e marca ocupadas para extinção progressiva",
    validacao: "Provisória",
  },
  {
    id: 3,
    evento: "Transformação de cargo",
    origem: "Lei ou ato autorizativo",
    impacto: "Autorização",
    comportamento:
      "Preserva a identidade e o histórico da vaga, registrando cargo de origem e destino",
    validacao: "Provisória",
  },
  {
    id: 4,
    evento: "Início de processo de ocupação",
    origem: "Ingresso do Servidor",
    impacto: "Comprometimento",
    comportamento: "Adiciona fases à vaga disponível sem alterar seu estado",
    validacao: "Provisória",
  },
  {
    id: 5,
    evento: "Efetivo exercício",
    origem: "Vida funcional",
    impacto: "Ocupação",
    comportamento: "Relaciona um vínculo à vaga e altera o estado para ocupada",
    validacao: "Provisória",
  },
  {
    id: 6,
    evento: "Início de processo de disponibilização",
    origem: "Vida funcional",
    impacto: "Comprometimento",
    comportamento: "Adiciona fases à vaga ocupada sem antecipar sua liberação",
    validacao: "Provisória",
  },
  {
    id: 7,
    evento: "Encerramento definitivo do vínculo",
    origem: "Vida funcional",
    impacto: "Liberação",
    comportamento: "Encerra a ocupação nominal e torna a vaga disponível",
    validacao: "Provisória",
  },
  {
    id: 8,
    evento: "Cancelamento de processo",
    origem: "Sistema de origem",
    impacto: "Liberação",
    comportamento: "Cancela as fases ativas sem alterar o estado da vaga",
    validacao: "Provisória",
  },
  {
    id: 9,
    evento: "Cessão funcional",
    origem: "Vida funcional",
    impacto: "Ocupação",
    comportamento:
      "Altera apenas o órgão de exercício; a titularidade da vaga é preservada",
    validacao: "Provisória",
  },
  {
    id: 10,
    evento: "Movimento de distribuição",
    origem: "Controle de Vagas",
    impacto: "Autorização",
    comportamento:
      "Distribui ou redistribui a vaga numerada por ato formal sem apagar movimentos anteriores",
    validacao: "Provisória",
  },
  {
    id: 11,
    evento: "Decisão judicial extraquadro",
    origem: "Decisão judicial",
    impacto: "Exceção",
    comportamento:
      "Registra vínculo excepcional separado das vagas legais e não amplia o quadro",
    validacao: "Provisória",
  },
  {
    id: 12,
    evento: "Movimento retroativo",
    origem: "Sistema de origem",
    impacto: "Exceção",
    comportamento:
      "Recalcula a posição temporal desde a data de efeito, preservando a data de registro",
    validacao: "Provisória",
  },
];
export const pendenciasRegrasMock = [
  "Marco definitivo e documento que comprovam o efetivo exercício",
  "Eventos definitivos de disponibilização por tipo de vínculo",
  "Órgãos de exercício permitidos por carreira e hipóteses de autorização especial",
  "Critério de encerramento de ocupação judicial extraquadro",
  "Periodicidade de homologação da metodologia e das taxas de projeção",
];

export const quadrosAutorizadosMock: QuadroAutorizadoRow[] = [];

export const vagasIndividualizadasMock: Vaga[] = [];
