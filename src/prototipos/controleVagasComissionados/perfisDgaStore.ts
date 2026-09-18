export type PerfilDgaCatalogo = {
  id: number;
  codigo: string;
  nome: string;
  ativo: boolean;
};

const CHAVE_PERFIS_DGA = "sigep:perfis:controle-vagas-comissionadas:dga:v1";

function normalizar(perfil: PerfilDgaCatalogo): PerfilDgaCatalogo {
  return {
    ...perfil,
    codigo: perfil.codigo.trim().toUpperCase(),
    nome: perfil.nome.trim(),
  };
}

function lerCatalogo(): PerfilDgaCatalogo[] {
  try {
    const valor = window.localStorage.getItem(CHAVE_PERFIS_DGA);
    return valor ? (JSON.parse(valor) as PerfilDgaCatalogo[]).map(normalizar) : [];
  } catch {
    return [];
  }
}

export function listarPerfisDgaControleVagasComissionadas() {
  return lerCatalogo()
    .filter((perfil) => perfil.ativo)
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export function atualizarPerfilDgaControleVagasComissionadas(
  perfil: Omit<PerfilDgaCatalogo, "ativo">,
  ativo: boolean,
) {
  const catalogo = lerCatalogo();
  const indice = catalogo.findIndex((item) => item.id === perfil.id);
  const atualizado = normalizar({ ...perfil, ativo });
  if (indice >= 0) catalogo[indice] = atualizado;
  else catalogo.push(atualizado);
  window.localStorage.setItem(CHAVE_PERFIS_DGA, JSON.stringify(catalogo));
}
