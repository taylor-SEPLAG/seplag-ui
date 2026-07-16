import { criarFasesComprometimento } from "./comprometimentos";
import { vagasIndividualizadasMock } from "./mockData";
import type { ComprometimentoVaga } from "./types";

const disponivelSeplag = vagasIndividualizadasMock.find((vaga) => vaga.quadroCodigo === "QA-0001" && vaga.estado === "DISPONIVEL")!;
const disponivelSes = vagasIndividualizadasMock.find((vaga) => vaga.quadroCodigo === "QA-0002" && vaga.estado === "DISPONIVEL")!;
const ocupadaSeplag = vagasIndividualizadasMock.find((vaga) => vaga.quadroCodigo === "QA-0001" && vaga.estado === "OCUPADA")!;
const ocupadaSefaz = vagasIndividualizadasMock.find((vaga) => vaga.quadroCodigo === "QA-0003" && vaga.estado === "OCUPADA")!;

export const comprometimentosVagasMock: ComprometimentoVaga[] = [
  { id: "CPR-2026-00128", vagaId: disponivelSeplag.id, natureza: "OCUPACAO", situacao: "ATIVO", origem: "Ingresso do Servidor", processo: "SEPLAG-PRO-2026/01820", criadoEm: "10/07/2026 09:00", dataEfeitoPrevista: "01/08/2026", motivo: "Nomeação de candidato aprovado no concurso nº 01/2024", fases: criarFasesComprometimento("OCUPACAO", "SEPLAG-PRO-2026/01820", "Ingresso do Servidor", 3) },
  { id: "CPR-2026-00129", vagaId: disponivelSes.id, natureza: "OCUPACAO", situacao: "ATIVO", origem: "Ingresso do Servidor", processo: "SES-PRO-2026/04211", criadoEm: "12/07/2026 14:20", dataEfeitoPrevista: "15/08/2026", motivo: "Convocação para provimento de cargo efetivo", fases: criarFasesComprometimento("OCUPACAO", "SES-PRO-2026/04211", "Ingresso do Servidor", 2) },
  { id: "CPR-2026-00130", vagaId: ocupadaSeplag.id, natureza: "DISPONIBILIZACAO", situacao: "ATIVO", origem: "Vida Funcional", processo: "SEPLAG-PRO-2026/01902", criadoEm: "11/07/2026 10:10", dataEfeitoPrevista: "31/07/2026", motivo: "Processo de aposentadoria voluntária", fases: criarFasesComprometimento("DISPONIBILIZACAO", "SEPLAG-PRO-2026/01902", "Vida Funcional", 2) },
  { id: "CPR-2026-00131", vagaId: ocupadaSefaz.id, natureza: "DISPONIBILIZACAO", situacao: "ATIVO", origem: "Vida Funcional", processo: "SEFAZ-PRO-2026/01108", criadoEm: "14/07/2026 08:45", motivo: "Exoneração a pedido em instrução", fases: criarFasesComprometimento("DISPONIBILIZACAO", "SEFAZ-PRO-2026/01108", "Vida Funcional", 1) },
];
