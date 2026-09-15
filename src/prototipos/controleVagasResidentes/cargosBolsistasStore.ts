export interface CargoBolsista {
  id: number;
  codigo: string;
  nome: string;
}

const cargosBolsistas = new Map<number, CargoBolsista>([
  [6, { id: 6, codigo: "BOLS_NIV_MED", nome: "Bolsista de Nível Médio" }],
  [7, { id: 7, codigo: "BOLS_POS_GRAD", nome: "Bolsista de Pós-Graduação" }],
  [8, { id: 8, codigo: "RES_TECNICO", nome: "Residente Técnico" }],
]);

export const listarCargosBolsistas = () =>
  [...cargosBolsistas.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

export const atualizarControleVagasBolsistas = (
  cargo: CargoBolsista,
  habilitado: boolean,
) => {
  if (habilitado) cargosBolsistas.set(cargo.id, cargo);
  else cargosBolsistas.delete(cargo.id);
};
