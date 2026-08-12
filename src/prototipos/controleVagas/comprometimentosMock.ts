import { criarFasesComprometimento } from "./comprometimentos";
import { quadrosAutorizadosMock, vagasIndividualizadasMock } from "./mockData";
import type { ComprometimentoVaga, SituacaoComprometimento } from "./types";

const vagasDisponiveisSeplag = vagasIndividualizadasMock.filter(
  (vaga) => vaga.quadroCodigo === "QA-0001" && vaga.estado === "DISPONIVEL",
);
const ocupadasSeplag = vagasIndividualizadasMock.filter(
  (vaga) => vaga.quadroCodigo === "QA-0001" && vaga.estado === "OCUPADA",
);
const ocupadaSefaz = vagasIndividualizadasMock.find(
  (vaga) => vaga.quadroCodigo === "QA-0003" && vaga.estado === "OCUPADA",
)!;

const ingresso = (
  id: string,
  vagaId: string,
  processo: string,
  fase: number,
  pessoaNome: string,
  situacao: SituacaoComprometimento = "ATIVO",
  eventoDefinitivo?: string,
): ComprometimentoVaga => {
  const fasesBase = criarFasesComprometimento(
    "OCUPACAO",
    processo,
    "Ingresso do Servidor",
    fase,
  );
  const fases =
    situacao === "ATIVO"
      ? fasesBase
      : fasesBase.map((item) => ({
          ...item,
          situacao:
            situacao === "CONCLUIDO"
              ? ("CONCLUIDA" as const)
              : item.situacao === "CONCLUIDA"
                ? item.situacao
                : ("CANCELADA" as const),
        }));

  return {
    id,
    vagaId,
    natureza: "OCUPACAO",
    situacao,
    origem: "Ingresso do Servidor",
    processo,
    criadoEm: "10/07/2026 09:00",
    dataEfeitoPrevista: "01/08/2026",
    motivo: `Andamento simulado do ingresso de ${pessoaNome}`,
    pessoaId: `PES-${id}`,
    pessoaNome,
    cpf: "***.***.***-00",
    vinculoId: `VIN-${id}`,
    matricula: `MAT-${id.slice(-3)}`,
    fases,
    eventoDefinitivo,
    concluidoEm: situacao === "ATIVO" ? undefined : "18/07/2026 16:00",
  };
};

const quadrosElegiveisParaIngresso = new Set(
  quadrosAutorizadosMock
    .filter(
      (quadro) =>
        quadro.situacao === "Vigente" &&
        quadro.situacaoVigencia !== "ENCERRADO" &&
        quadro.situacaoVigencia !== "EXTINTO" &&
        quadro.situacao !== "Vigência futura" &&
        quadro.formaDestinacaoLegal !== "DISTRIBUICAO_POSTERIOR",
    )
    .map((quadro) => quadro.codigo),
);

const vagasComDesfechoHistorico = new Set([
  vagasDisponiveisSeplag[4]?.id,
  vagasDisponiveisSeplag[5]?.id,
]);

const nomesSimulados = [
  "Lucas Ferreira",
  "Amanda Ribeiro",
  "Carolina Mendes",
  "Rafael Nunes",
  "Ana Paula Lima",
  "Bruno Oliveira",
  "Camila Rodrigues",
  "Daniel Almeida",
  "Elisa Moreira",
  "Felipe Carvalho",
];

const quantidadePorQuadro = new Map<string, number>();
const ingressosAtivosMock = vagasIndividualizadasMock
  .filter((vaga) => {
    if (
      vaga.estado !== "DISPONIVEL" ||
      vaga.situacaoLegal !== "REGULAR" ||
      !vaga.orgaoDistribuicaoInicial ||
      !quadrosElegiveisParaIngresso.has(vaga.quadroCodigo) ||
      vagasComDesfechoHistorico.has(vaga.id)
    ) {
      return false;
    }
    const quantidade = quantidadePorQuadro.get(vaga.quadroCodigo) ?? 0;
    if (quantidade >= 30) return false;
    quantidadePorQuadro.set(vaga.quadroCodigo, quantidade + 1);
    return true;
  })
  .map((vaga, indice) => {
    const sequencia = String(indice + 200).padStart(5, "0");
    const codigoQuadro = vaga.quadroCodigo.replace("QA-", "");
    return ingresso(
      `CPR-2026-${sequencia}`,
      vaga.id,
      `${codigoQuadro}-ING-2026/${sequencia}`,
      indice % 4,
      `${nomesSimulados[indice % nomesSimulados.length]} ${codigoQuadro}`,
    );
  });

export const comprometimentosVagasMock: ComprometimentoVaga[] = [
  ...ingressosAtivosMock,
  ingresso(
    "CPR-2026-00132",
    ocupadasSeplag[1].id,
    "SEPLAG-ING-2026/00132",
    4,
    "Joana Costa",
    "CONCLUIDO",
    "Ingresso concluído",
  ),
  ingresso(
    "CPR-2026-00133",
    vagasDisponiveisSeplag[4].id,
    "SEPLAG-ING-2026/00133",
    1,
    "Pedro Martins",
    "CANCELADO",
    "Posse Negada",
  ),
  ingresso(
    "CPR-2026-00134",
    vagasDisponiveisSeplag[5].id,
    "SEPLAG-ING-2026/00134",
    2,
    "Beatriz Souza",
    "CANCELADO",
    "Tornado sem efeito",
  ),
  {
    id: "CPR-2026-00130",
    vagaId: ocupadasSeplag[0].id,
    natureza: "DISPONIBILIZACAO",
    situacao: "ATIVO",
    origem: "Vida Funcional",
    processo: "SEPLAG-PRO-2026/01902",
    criadoEm: "11/07/2026 10:10",
    dataEfeitoPrevista: "31/07/2026",
    motivo: "Processo de aposentadoria voluntária",
    fases: criarFasesComprometimento(
      "DISPONIBILIZACAO",
      "SEPLAG-PRO-2026/01902",
      "Vida Funcional",
      2,
    ),
  },
  {
    id: "CPR-2026-00131",
    vagaId: ocupadaSefaz.id,
    natureza: "DISPONIBILIZACAO",
    situacao: "ATIVO",
    origem: "Vida Funcional",
    processo: "SEFAZ-PRO-2026/01108",
    criadoEm: "14/07/2026 08:45",
    motivo: "Exoneração a pedido em instrução",
    fases: criarFasesComprometimento(
      "DISPONIBILIZACAO",
      "SEFAZ-PRO-2026/01108",
      "Vida Funcional",
      1,
    ),
  },
];
