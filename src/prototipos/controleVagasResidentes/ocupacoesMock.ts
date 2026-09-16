import type { OcupacaoVaga } from "./types";

export const ocupacoesVagasMock: OcupacaoVaga[] = [
  1,
  2,
  3,
].map((sequencial): OcupacaoVaga => ({
  id: "OCU-QAB-0003-" + String(sequencial).padStart(3, "0"),
  vagaId: "VB-QAB-0003-" + String(sequencial).padStart(3, "0"),
  pessoaId: "BOLS-RES-" + String(sequencial).padStart(3, "0"),
  pessoaNome: "Bolsista Residente " + String(sequencial),
  cpf: "000.000.000-0" + String(sequencial),
  vinculoId: "VINC-BOLS-" + String(sequencial).padStart(3, "0"),
  matricula: "BOLS" + String(sequencial).padStart(4, "0"),
  tipoVinculo: "EFETIVO",
  orgaoVinculo: "SES",
  orgaoLotacao: "SES",
  orgaoExercicio: "SES",
  cargo: "Residente Técnico",
  efetivoExercicioEm: "2025-03-01",
  situacao: "ATIVA",
  eventos: [],
}));
