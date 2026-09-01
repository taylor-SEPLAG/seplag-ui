import { useSyncExternalStore } from "react";

export type SituacaoTipoCota = "ATIVO" | "INATIVO";

// RN-08: o sistema permite múltiplas cotas por certame — este catálogo alimenta o dropdown "Tipo de
// cota" do bloco Cotas (CertameFormContent). "AMPLA" (Ampla Concorrência) é semeado por padrão e
// tratado como caso especial ali (é a ausência de reserva, não uma cota) — mantenha o código "AMPLA"
// estável se for editar esse registro.
// lei: normas (Documentos Legais/LEIS_CERTAME, por id) que instituem esse tipo de cota — mesmo
// catálogo de leis usado no bloco Cotas do certame, mas aqui é a lei que ampara o tipo em si, não a
// lei de um certame específico.
export interface TipoCota { id:string; value:string; label:string; lei:readonly string[]; situacao:SituacaoTipoCota }

// Só Nome e Lei são digitados (mesmo padrão de Locais/Fase do Certame, sem campo de código
// separado) — o código (value) é derivado automaticamente do nome ao criar e permanece estável
// depois, mesmo que o nome seja editado, para não invalidar cotas/certames que já o referenciam.
export type TipoCotaInput = Pick<TipoCota, "label" | "lei">;

function criar(id:string, value:string, label:string, lei:readonly string[] = []):TipoCota {
 return { id, value, label, lei, situacao:"ATIVO" };
}

let tiposCota:TipoCota[] = [
 criar("tipo-cota-001", "AMPLA", "Ampla Concorrência"),
 criar("tipo-cota-002", "PCD", "PCD — Pessoas com Deficiência", ["LEI-6752-1995"]),
 criar("tipo-cota-003", "PPP", "PPP — Pessoas Pretas e Pardas"),
 criar("tipo-cota-004", "INDIGENAS", "Indígenas"),
 criar("tipo-cota-005", "QUILOMBOLAS", "Quilombolas"),
 criar("tipo-cota-006", "TEA", "TEA — Transtorno do Espectro Autista"),
];

// Deriva o código a partir do nome: usa o trecho antes do " — " quando houver (ex.: "PCD — Pessoas
// com Deficiência" → "PCD"), senão a primeira palavra (ex.: "Ampla Concorrência" → "AMPLA",
// "Indígenas" → "INDIGENAS"), sempre maiúsculo e sem acentos/símbolos.
function slugCodigo(label:string):string {
 const base = label.includes(" — ") ? label.split(" — ")[0] : label.split(" ")[0];
 return base.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]/g, "").toLocaleUpperCase("pt-BR");
}

function codigoUnico(label:string, ignoredId?:string):string {
 const base = slugCodigo(label) || "TIPO";
 let candidato = base;
 let sufixo = 2;
 while (tiposCota.some((item) => item.id !== ignoredId && item.value === candidato)) {
  candidato = `${base}-${sufixo}`;
  sufixo += 1;
 }
 return candidato;
}

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export const tiposCotaStore = {
 subscribe(listener:() => void) { listeners.add(listener); return () => listeners.delete(listener); },
 getSnapshot: () => tiposCota,
 findById: (id:string) => tiposCota.find((item) => item.id === id),
 isDuplicate(input:TipoCotaInput, ignoredId?:string) {
  const nome = input.label.trim().toLocaleLowerCase("pt-BR");
  return tiposCota.some((item) => item.id !== ignoredId && item.label.trim().toLocaleLowerCase("pt-BR") === nome);
 },
 create(input:TipoCotaInput) {
  const label = input.label.trim();
  const item:TipoCota = { id:`tipo-cota-${Date.now()}`, value:codigoUnico(label), label, lei:input.lei, situacao:"ATIVO" };
  tiposCota = [...tiposCota, item];
  emit();
  return item;
 },
 update(id:string, input:TipoCotaInput) {
  tiposCota = tiposCota.map((item) => item.id === id ? { ...item, label:input.label.trim(), lei:input.lei } : item);
  emit();
 },
 toggleSituacao(id:string) {
  tiposCota = tiposCota.map((item) => item.id === id ? { ...item, situacao: item.situacao === "ATIVO" ? "INATIVO" : "ATIVO" } : item);
  emit();
 },
};

export function useTiposCota() {
 return useSyncExternalStore(tiposCotaStore.subscribe, tiposCotaStore.getSnapshot);
}

// Opções para dropdowns (CertameFormContent) — só os tipos ativos, mesma forma {value,label} que o
// antigo array estático TIPOS_COTA em dominios.ts, para não exigir mudanças nos consumidores.
export function useTiposCotaAtivos() {
 return useTiposCota().filter((item) => item.situacao === "ATIVO");
}
