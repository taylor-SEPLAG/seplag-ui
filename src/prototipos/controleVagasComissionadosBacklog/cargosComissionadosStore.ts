export type CargoComissionadoCatalogo = {
  id: number;
  codigo: string;
  nome: string;
  ativo: boolean;
};

const CHAVE_CARGOS_COMISSIONADOS = "sigep:cargos:controle-vagas-comissionadas:v1";

export const cargosComissionadosIniciais: CargoComissionadoCatalogo[] = Array.from(
  { length: 10 },
  (_, indice) => ({
    id: 101 + indice,
    codigo: `DGA-${indice + 1}`,
    nome: `DGA-${indice + 1}`,
    ativo: true,
  }),
);

function normalizar(cargo: CargoComissionadoCatalogo): CargoComissionadoCatalogo {
  return {
    ...cargo,
    codigo: cargo.codigo.trim().toUpperCase(),
    nome: cargo.nome.trim(),
  };
}

function lerCatalogo(): CargoComissionadoCatalogo[] {
  try {
    const valor = window.localStorage.getItem(CHAVE_CARGOS_COMISSIONADOS);
    if (!valor) return cargosComissionadosIniciais.map(normalizar);
    const salvos = JSON.parse(valor) as CargoComissionadoCatalogo[];
    const porCodigo = new Map(salvos.map((cargo) => [cargo.codigo.toUpperCase(), normalizar(cargo)]));
    cargosComissionadosIniciais.forEach((cargo) => {
      if (!porCodigo.has(cargo.codigo)) porCodigo.set(cargo.codigo, cargo);
    });
    return [...porCodigo.values()];
  } catch {
    return cargosComissionadosIniciais.map(normalizar);
  }
}

export function listarCargosControleVagasComissionadas() {
  return lerCatalogo()
    .filter((cargo) => cargo.ativo)
    .sort((a, b) => a.codigo.localeCompare(b.codigo, "pt-BR", { numeric: true }));
}

export function atualizarControleVagasComissionadas(
  cargo: Omit<CargoComissionadoCatalogo, "ativo">,
  ativo: boolean,
) {
  const catalogo = lerCatalogo();
  const codigo = cargo.codigo.trim().toUpperCase();
  const indice = catalogo.findIndex((item) => item.codigo === codigo);
  const atualizado = normalizar({ ...cargo, ativo });
  if (indice >= 0) catalogo[indice] = atualizado;
  else catalogo.push(atualizado);
  window.localStorage.setItem(CHAVE_CARGOS_COMISSIONADOS, JSON.stringify(catalogo));
}
