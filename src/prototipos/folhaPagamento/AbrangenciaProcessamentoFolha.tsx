import { useEffect, type ReactNode } from "react";
import { useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import { MultiSelectFieldSeplag } from "../../componentes/Fields/MultiSelectField";
import { DropdownFieldSeplag } from "../../componentes/Fields/DropdownField";
import type {
  CatalogoAbrangencia,
  CriteriosAbrangencia,
  OpcaoAbrangencia,
} from "./abrangenciaGrupoCalculo";
import {
  ajustarProcessamento,
  campoProcessamentoBloqueado,
  camposProcessamento as campos,
  criteriosDoProcessamento,
  criteriosProcessamento as chaves,
  opcoesProcessamento,
} from "./regrasProcessamentoFolha";
import type { ProcessamentoFolhaForm } from "./types";

const rotulos = {
  regimes: "Regime Jurídico",
  tipos: "Tipo de Vínculo",
  orgaos: "Órgão/Entidade",
  carreiras: "Carreira",
  unidades: "Unidade de Lotação",
  cargos: "Cargo",
};

export function AbrangenciaProcessamentoFolha({
  control,
  setValue,
  catalogo,
  grupoEleitosOptions,
  original,
  folhaId,
  getError,
  onChange,
}: {
  control: Control<ProcessamentoFolhaForm>;
  setValue: UseFormSetValue<ProcessamentoFolhaForm>;
  catalogo: CatalogoAbrangencia;
  grupoEleitosOptions: OpcaoAbrangencia[];
  original: CriteriosAbrangencia;
  folhaId?: number;
  getError: (campo: keyof ProcessamentoFolhaForm) => ReactNode;
  onChange?: () => void;
}) {
  const valores = useWatch({ control });
  const tipo = valores.tipoExecucao ?? "TOTAL";
  const criterios = criteriosDoProcessamento(
    valores as ProcessamentoFolhaForm,
    catalogo,
  );
  const opcoes = opcoesProcessamento(criterios, original, tipo, catalogo);
  const contexto = JSON.stringify({ folhaId, original, tipo });
  // A origem não é derivada dos campos editáveis. Trocar folha ou tipo restaura
  // a parametrização completa, descartando restrições da execução anterior.
  useEffect(() => {
    const { original: base }: { original: CriteriosAbrangencia } =
      JSON.parse(contexto);
    chaves.forEach((c) =>
      setValue(
        campos[c],
        c === "unidades" && !base.orgaos.length ? [] : [...base[c]],
      ),
    );
  }, [contexto, setValue]);
  const aplicar = (
    campo: keyof CriteriosAbrangencia,
    selecionados: string[],
  ) => {
    if (campoProcessamentoBloqueado(campo, criterios, original, tipo)) return;
    const ajustados = ajustarProcessamento(
      { ...criterios, [campo]: selecionados },
      original,
      tipo,
      catalogo,
      campo,
    );
    chaves.forEach((c) =>
      setValue(campos[c], ajustados[c], { shouldDirty: true }),
    );
    setValue("setores", []);
    setValue("categorias", []);
    setValue("subcategorias", []);
    onChange?.();
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
          disabled={campoProcessamentoBloqueado(c, criterios, original, tipo)}
          onChange={(selecionados) => aplicar(c, selecionados)}
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
        onChange={onChange}
        getFormErrorMessage={() => getError("grupoEleitos")}
      />
    </>
  );
}
