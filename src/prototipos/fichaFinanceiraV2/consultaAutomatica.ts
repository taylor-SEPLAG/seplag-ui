export type RegistroFinanceiro = { id: string; fator: number };
const competencias = ["10/2026", "09/2026", "08/2026"];
export function competenciasDisponiveis(registro: RegistroFinanceiro | null) {
  if (!registro?.fator) return [];
  return registro.id === "pensao-01" ? ["10/2026"] : competencias;
}
export function folhasDisponiveis(registro: RegistroFinanceiro | null, competencia: string) {
  if (!registro || !competenciasDisponiveis(registro).includes(competencia)) return [];
  return registro.id === "358186-001" && competencia === "10/2026" ? ["1", "2"] : ["1"];
}
// Transporte simulado do protótipo. O AbortSignal também permite integrar a API real.
export async function recuperarDemonstrativo<T>(resolver: () => T, signal: AbortSignal): Promise<T> {
  await new Promise<void>((resolve,reject)=>{
    if(signal.aborted){reject(new DOMException("Consulta cancelada", "AbortError"));return;}
    const cancelar=()=>{clearTimeout(timer);reject(new DOMException("Consulta cancelada", "AbortError"));};
    const timer=setTimeout(()=>{signal.removeEventListener("abort",cancelar);resolve();},180);
    signal.addEventListener("abort",cancelar,{once:true});
  });
  if(signal.aborted) throw new DOMException("Consulta cancelada", "AbortError");
  return resolver();
}
