import type { Certame, CargoVagaCertame } from "../controlePss/certame/types";
export interface QuadroTemporarioCadastro {
 id: string; codigo: string; certameId: string;
 certame: Certame; cargos: (CargoVagaCertame & { modoControle: "LIMITADO" | "SEM_LIMITE"; limiteVagas?: number })[];
 observacoes: string; criadoEm: string; dataAtivacao?: string;
}
const chave = "sigep:quadros-temporarios:cadastros:v1";
export function listarQuadrosTemporarios(): QuadroTemporarioCadastro[] {
 const json = localStorage.getItem(chave);
 return json ? JSON.parse(json).map((item: QuadroTemporarioCadastro) => ({ ...item, cargos: item.cargos ?? item.certame.cargos.map(cargo => ({ ...cargo, modoControle: cargo.aceitaCadastroReserva ? "SEM_LIMITE" : "LIMITADO", limiteVagas: cargo.aceitaCadastroReserva ? undefined : cargo.quantidadeVagas })) })) : [];
}
export function seletivoTemporario(certame: Certame) {
 return certame.tipoCertame === "PSS" && ["CONTRATO_TEMPORARIO", "CONTRATO_TEMPORARIO_VINCULO_UNICO"].includes(certame.tipoVinculo);
}
export function salvarQuadroTemporario(certame: Certame, observacoes: string, dataAtivacao?: string) {
 if (!seletivoTemporario(certame) || !certame.cargos.length) throw new Error("Selecione um PSS temporário com cargos cadastrados.");
 const quadros = listarQuadrosTemporarios();
 if (quadros.some(item => item.certameId === certame.id)) throw new Error("Já existe um quadro temporário para este seletivo.");
 const numero = quadros.reduce((max, item) => Math.max(max, Number(item.codigo.replace("QT-", "")) || 0), 0) + 1;
 const registro: QuadroTemporarioCadastro = {
  id: crypto.randomUUID(), codigo: "QT-" + String(numero).padStart(5, "0"),
  certameId: certame.id,
  certame: structuredClone(certame),
  cargos: certame.cargos.map(cargo => ({ ...structuredClone(cargo), modoControle: cargo.aceitaCadastroReserva ? "SEM_LIMITE" : "LIMITADO", limiteVagas: cargo.aceitaCadastroReserva ? undefined : cargo.quantidadeVagas })),
  dataAtivacao, observacoes: observacoes.trim(), criadoEm: new Date().toISOString(),
 };
 localStorage.setItem(chave, JSON.stringify([...quadros, registro]));
 return registro;
}
