import { useEffect, type ReactNode } from "react";
import { useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import { MultiSelectFieldSeplag } from "../../componentes/Fields/MultiSelectField";
import { DropdownFieldSeplag } from "../../componentes/Fields/DropdownField";
import {
  ajustarAbrangencia,
  opcoesAbrangencia,
  type CatalogoAbrangencia,
  type CriteriosAbrangencia,
  type OpcaoAbrangencia,
} from "./abrangenciaGrupoCalculo";
import { criteriosDaFolha } from "./abrangenciaFolhaPagamento";
import type { ProcessamentoFolhaForm } from "./types";

const campos = {
  regimes: "regimesJuridicos",
  tipos: "tiposVinculo",
  orgaos: "orgaos",
  unidades: "unidades",
  carreiras: "carreiras",
  cargos: "cargos",
} as const;
const rotulos = {
  regimes: "Regime Jurídico",
  tipos: "Tipo de Vínculo",
  orgaos: "Órgão/Entidade",
  carreiras: "Carreira",
  unidades: "Unidade de Lotação",
  cargos: "Cargo",
};
const chaves = Object.keys(campos) as (keyof CriteriosAbrangencia)[];

export function AbrangenciaProcessamentoFolha({
  control,
  setValue,
  catalogo,
  grupoEleitosOptions,
  disabled,
  getError,
}: {
  control: Control<ProcessamentoFolhaForm>;
  setValue: UseFormSetValue<ProcessamentoFolhaForm>;
  catalogo: CatalogoAbrangencia;
  grupoEleitosOptions: OpcaoAbrangencia[];
  disabled: boolean;
  getError: (campo: keyof ProcessamentoFolhaForm) => ReactNode;
}) {
  const valores = useWatch({ control });
  const criterios = criteriosDaFolha(
    {
      abrangenciaRegimeJuridico: valores.regimesJuridicos,
      abrangenciaTipoVinculo: valores.tiposVinculo,
      orgaos: valores.orgaos,
      abrangenciaCarreiras: valores.carreiras,
      abrangenciaUnidades: valores.unidades,
      abrangenciaCargos: valores.cargos,
    },
    catalogo,
  );
  const opcoes = opcoesAbrangencia(criterios, catalogo);
  const assinaturaAtual = JSON.stringify(
    chaves.map((c) => valores[campos[c]] ?? []),
  );
  const assinaturaNormalizada = JSON.stringify(chaves.map((c) => criterios[c]));
  // Normaliza também valores legados recebidos ao abrir ou restaurar o processamento.
  useEffect(() => {
    const atuais: string[][] = JSON.parse(assinaturaAtual);
    const novos: string[][] = JSON.parse(assinaturaNormalizada);
    chaves.forEach((c, i) => {
      if (JSON.stringify(atuais[i]) !== JSON.stringify(novos[i]))
        setValue(campos[c], novos[i]);
    });
  }, [assinaturaAtual, assinaturaNormalizada, setValue]);
  const aplicar = (novos: CriteriosAbrangencia) => {
    const ajustados = ajustarAbrangencia(novos, catalogo);
    chaves.forEach((c) =>
      setValue(campos[c], ajustados[c], { shouldDirty: true }),
    );
    setValue("setores", []);
    setValue("categorias", []);
    setValue("subcategorias", []);
  };
  return (
    <>
      {chaves.map((c) => (
        <MultiSelectFieldSeplag
          key={c}
          name={campos[c]}
          control={control}
          label={rotulos[c]}
          cols="12 12 6"
          options={opcoes[c]}
          optionLabel="label"
          optionValue="value"
          dataKey="value"
          placeholder="Selecione..."
          selectedItemsLabel="{0} selecionados"
          disabled={disabled || (c === "carreiras" && !opcoes.carreiraAtiva)}
          onChange={(selecionados) =>
            aplicar({ ...criterios, [c]: selecionados })
          }
          getFormErrorMessage={() => getError(campos[c])}
        />
      ))}
      <DropdownFieldSeplag
        name="grupoEleitos"
        control={control}
        label="Grupo de eleitos"
        cols="12 12 6"
        options={grupoEleitosOptions}
        optionLabel="label"
        optionValue="value"
        disabled={disabled}
        getFormErrorMessage={() => getError("grupoEleitos")}
      />
    </>
  );
}
