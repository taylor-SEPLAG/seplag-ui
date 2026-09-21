export interface CargoTemporarioCatalogo {
  id: number;
  codigo: string;
  nome: string;
}

const CHAVE_CARGOS_TEMPORARIOS = "sigep:cargos:controle-vagas-temporarias:v1";

function lerCatalogo(): CargoTemporarioCatalogo[] {
  try {
    const valor = window.localStorage.getItem(CHAVE_CARGOS_TEMPORARIOS);
    if (!valor) return [];
    return JSON.parse(valor) as CargoTemporarioCatalogo[];
  } catch {
    return [];
  }
}

export function listarCargosControleVagasTemporarias() {
  return lerCatalogo().sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR", { numeric: true }),
  );
}

export function atualizarControleVagasTemporarias(
  cargo: CargoTemporarioCatalogo,
  ativo: boolean,
) {
  const catalogo = lerCatalogo();
  const indice = catalogo.findIndex((item) => item.id === cargo.id);
  const atualizado = {
    ...cargo,
    codigo: cargo.codigo.trim().toUpperCase(),
    nome: cargo.nome.trim(),
  };

  if (ativo && indice < 0) catalogo.push(atualizado);
  if (ativo && indice >= 0) catalogo[indice] = atualizado;
  if (!ativo && indice >= 0) catalogo.splice(indice, 1);

  window.localStorage.setItem(CHAVE_CARGOS_TEMPORARIOS, JSON.stringify(catalogo));
}