import type { Certame, CargoVagaCertame } from "../controlePss/certame/types";

export type SituacaoQuadroTemporario = "ATIVO" | "EXTINTO" | "ENCERRADO";
export interface VersaoQuadroTemporario {
  versao: number; evolucao: "CRIACAO" | "AMPLIACAO"; quantidade: number;
  totalAutorizado: number; dataInicio: string; criadaEm: string; observacao?: string;
  processoSigadoc?: string; documentosLegaisIds?: string[];
}
export interface QuadroTemporarioCadastro {
 id: string; codigo: string; certameId: string; certame: Certame;
 cargos: (CargoVagaCertame & { modoControle: "LIMITADO" | "AMPLIAVEL"; limiteVagas?: number })[];
 observacoes: string; criadoEm: string; dataAtivacao?: string;
 /** Total de vagas autorizadas pelas versões do quadro. */
 vagasReais: number; totalAutorizado: number; versoes: VersaoQuadroTemporario[];
 situacao: SituacaoQuadroTemporario;
}
const chave = "sigep:quadros-temporarios:cadastros:v1";
const totalPrevisto = (certame: Pick<Certame, "cargos">) => certame.cargos.reduce((total, cargo) => total + cargo.quantidadeVagas, 0);
const hoje = () => new Date().toISOString().slice(0, 10);
const normalizarData = (valor?: string) => {
 if (!valor) return undefined;
 const brasileira = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
 return brasileira ? `${brasileira[3]}-${brasileira[2]}-${brasileira[1]}` : valor.slice(0, 10);
};

const normalizar = (item: Partial<QuadroTemporarioCadastro>): QuadroTemporarioCadastro => {
 const previsto = totalPrevisto(item.certame!);
 const dataInicio = item.dataAtivacao ?? String(item.criadoEm ?? hoje()).slice(0, 10);
 // Registros anteriores não tinham versões e gravavam vagasReais como zero;
 // a migração considera a previsão do edital como a autorização inicial.
 const autorizado = item.totalAutorizado ?? (item.versoes?.length ? item.vagasReais ?? previsto : previsto);
 return {
  ...item, vagasReais: autorizado, totalAutorizado: autorizado, situacao: item.situacao ?? "ATIVO",
  versoes: item.versoes?.length ? item.versoes : [{ versao: 1, evolucao: "CRIACAO", quantidade: previsto, totalAutorizado: previsto, dataInicio, criadaEm: item.criadoEm ?? new Date().toISOString() }],
  cargos: item.cargos ?? item.certame!.cargos.map(cargo => ({ ...cargo, modoControle: cargo.aceitaCadastroReserva ? "AMPLIAVEL" : "LIMITADO", limiteVagas: cargo.aceitaCadastroReserva ? undefined : cargo.quantidadeVagas })),
 } as QuadroTemporarioCadastro;
};
export function listarQuadrosTemporarios(): QuadroTemporarioCadastro[] {
 const json = localStorage.getItem(chave);
 return json ? JSON.parse(json).map(normalizar) : [];
}
const persistir = (quadros: QuadroTemporarioCadastro[]) => localStorage.setItem(chave, JSON.stringify(quadros));
export function seletivoTemporario(certame: Certame) {
 return certame.tipoCertame === "PSS" && ["CONTRATO_TEMPORARIO", "CONTRATO_TEMPORARIO_VINCULO_UNICO"].includes(certame.tipoVinculo);
}
export const possuiCadastroReserva = (quadro: Pick<QuadroTemporarioCadastro, "cargos">) => quadro.cargos.some(cargo => cargo.aceitaCadastroReserva);
export function salvarQuadroTemporario(certame: Certame, observacoes: string, dataAtivacao?: string) {
 if (!seletivoTemporario(certame) || !certame.cargos.length) throw new Error("Selecione um PSS temporário com cargos cadastrados.");
 const dataInicio = normalizarData(dataAtivacao);
 if (dataInicio && dataInicio > hoje()) throw new Error("A data de início não pode ser futura.");
 const quadros = listarQuadrosTemporarios();
 if (quadros.some(item => item.certameId === certame.id)) throw new Error("Já existe um quadro temporário para este seletivo.");
 const numero = quadros.reduce((max, item) => Math.max(max, Number(item.codigo.replace("QT-", "")) || 0), 0) + 1;
 const previsto = totalPrevisto(certame); const criadoEm = new Date().toISOString(); const inicio = dataInicio ?? hoje();
 const registro: QuadroTemporarioCadastro = {
  id: crypto.randomUUID(), codigo: "QT-" + String(numero).padStart(5, "0"), certameId: certame.id, certame: structuredClone(certame),
  cargos: certame.cargos.map(cargo => ({ ...structuredClone(cargo), modoControle: cargo.aceitaCadastroReserva ? "AMPLIAVEL" : "LIMITADO", limiteVagas: cargo.aceitaCadastroReserva ? undefined : cargo.quantidadeVagas })),
  dataAtivacao: inicio, observacoes: observacoes.trim(), vagasReais: previsto, totalAutorizado: previsto,
  versoes: [{ versao: 1, evolucao: "CRIACAO", quantidade: previsto, totalAutorizado: previsto, dataInicio: inicio, criadaEm: criadoEm }], situacao: "ATIVO", criadoEm,
 };
 persistir([...quadros, registro]); return registro;
}
export function ampliarQuadroTemporario(id: string, quantidade: number, dataInicio: string, observacao: string, processoSigadoc = "", documentosLegaisIds: string[] = []) {
 if (!Number.isInteger(quantidade) || quantidade <= 0) throw new Error("Informe uma quantidade adicional maior que zero.");
 if (!dataInicio) throw new Error("Informe a data de início da ampliação.");
 const dataInicioNormalizada = normalizarData(dataInicio);
 if (dataInicioNormalizada! > hoje()) throw new Error("A data de início não pode ser futura.");
 const quadros = listarQuadrosTemporarios(); const quadro = quadros.find(item => item.id === id);
 if (!quadro) throw new Error("Quadro temporário não encontrado.");
 if (quadro.situacao !== "ATIVO") throw new Error("Somente quadros ativos podem receber ampliação.");
 if (!possuiCadastroReserva(quadro)) throw new Error("Este quadro não possui cadastro reserva e não pode receber ampliação.");
 const totalAutorizado = quadro.totalAutorizado + quantidade;
 const versao: VersaoQuadroTemporario = { versao: quadro.versoes.length + 1, evolucao: "AMPLIACAO", quantidade, totalAutorizado, dataInicio: dataInicioNormalizada!, criadaEm: new Date().toISOString(), observacao: observacao.trim() || undefined, processoSigadoc: processoSigadoc.trim() || undefined, documentosLegaisIds: documentosLegaisIds.length ? documentosLegaisIds : undefined };
 const atualizado = { ...quadro, totalAutorizado, vagasReais: totalAutorizado, versoes: [...quadro.versoes, versao] };
 persistir(quadros.map(item => item.id === id ? atualizado : item)); return atualizado;
}
