import {
  ajustarAbrangencia,
  normalizarChaveAbrangencia,
  type CatalogoAbrangencia,
  type CriteriosAbrangencia,
  type OpcaoAbrangencia,
} from "./abrangenciaGrupoCalculo";
import type { FolhaPagamentoForm } from "./types";

export const camposAbrangenciaFolha = {
  regimes: "abrangenciaRegimeJuridico",
  tipos: "abrangenciaTipoVinculo",
  orgaos: "orgaos",
  carreiras: "abrangenciaCarreiras",
  unidades: "abrangenciaUnidades",
  cargos: "abrangenciaCargos",
} as const;

// Aceita também os códigos e rótulos usados nas folhas anteriores ao novo formulário.
export function criteriosDaFolha(
  data: FolhaPagamentoForm,
  catalogo: CatalogoAbrangencia,
): CriteriosAbrangencia {
  const aliases: Record<string, string> = {
    estatutario: "ESTATUTARIO CIVIL",
    efetivo: "Nomeado Efetivo",
  };
  const normalizar = (valores: string[], opcoes: OpcaoAbrangencia[]) => [
    ...new Set(
      valores.flatMap((v) => {
        const chave = normalizarChaveAbrangencia(
          aliases[normalizarChaveAbrangencia(v)] ?? v,
        );
        const opcao = opcoes.find((o) =>
          [o.value, o.label].some(
            (s) => normalizarChaveAbrangencia(s) === chave,
          ),
        );
        return opcao ? [opcao.value] : [];
      }),
    ),
  ];
  return ajustarAbrangencia(
    {
      regimes: normalizar(
        data.abrangenciaRegimeJuridico?.length
          ? data.abrangenciaRegimeJuridico
          : data.regimeJuridico
            ? [data.regimeJuridico]
            : [],
        catalogo.regimes,
      ),
      tipos: normalizar(data.abrangenciaTipoVinculo ?? [], catalogo.tipos),
      orgaos: normalizar(data.orgaos ?? [], catalogo.orgaos),
      carreiras: normalizar(
        data.abrangenciaCarreiras ?? [],
        catalogo.carreiras,
      ),
      unidades: normalizar(data.abrangenciaUnidades ?? [], catalogo.unidades),
      cargos: normalizar(
        data.abrangenciaCargos?.length
          ? data.abrangenciaCargos
          : data.cargo
            ? [data.cargo]
            : [],
        catalogo.cargos,
      ),
    },
    catalogo,
  );
}
