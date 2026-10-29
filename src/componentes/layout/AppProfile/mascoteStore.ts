let estado = { indice: 0, anterior: 0, revisao: 0 };
let ultimaRota: string | null = null;
const ouvintes = new Set<() => void>();
export const obterMascote = () => estado;
export const assinarMascote = (ouvinte: () => void) => { ouvintes.add(ouvinte); return () => { ouvintes.delete(ouvinte); }; };
export function avancarMascote() {
  estado = { indice: (estado.indice + 1) % 3, anterior: estado.indice, revisao: estado.revisao + 1 };
  ouvintes.forEach(ouvinte => ouvinte());
}
export function registrarRotaMascote(rota: string) {
  if (ultimaRota === rota) return;
  const inicial = ultimaRota === null;
  ultimaRota = rota;
  if (!inicial) avancarMascote();
}
