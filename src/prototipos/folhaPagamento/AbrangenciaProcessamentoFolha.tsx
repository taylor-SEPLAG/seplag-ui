import { SecaoProcessamentoFolha } from "./SecaoProcessamentoFolha";
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
  agrupar = false,
}: {
  control: Control<ProcessamentoFolhaForm>;
  setValue: UseFormSetValue<ProcessamentoFolhaForm>;
  catalogo: CatalogoAbrangencia;
  grupoEleitosOptions: OpcaoAbrangencia[];
  original: CriteriosAbrangencia;
  folhaId?: number;
  getError: (campo: keyof ProcessamentoFolhaForm) => ReactNode;
  onChange?: () => void;
  agrupar?: boolean;
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
  const ordem = agrupar
    ? ([
        "regimes",
        "tipos",
        "orgaos",
        "unidades",
        "cargos",
        "carreiras",
      ] as const)
    : chaves;
  const camposAbrangencia = ordem.map((c) => (
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
      placeholder={
        agrupar && !original[c].length
          ? "Não parametrizado na folha"
          : "Selecione..."
      }
      selectedItemsLabel="{0} selecionados"
      disabled={campoProcessamentoBloqueado(c, criterios, original, tipo)}
      onChange={(selecionados) => aplicar(c, selecionados)}
      getFormErrorMessage={() => getError(campos[c])}
    />
  ));
  const grupoEleitos = (
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
  );
  if (!agrupar)
    return (
      <>
        {camposAbrangencia}
        {grupoEleitos}
      </>
    );
  return (
    <>
      <SecaoProcessamentoFolha titulo="Abrangência" icone="pi pi-filter">
        <p className="processamento-aviso" role="note">
          <i className="pi pi-info-circle" aria-hidden="true" />
          {tipo === "TOTAL"
            ? "Processamento total: os critérios parametrizados na folha não podem ser alterados."
            : "Processamento parcial: selecione os critérios disponíveis dentro da abrangência parametrizada na folha."}
        </p>
        <div className="grid prototype-category-form-fields">
          {camposAbrangencia}
        </div>
      </SecaoProcessamentoFolha>
      <SecaoProcessamentoFolha
        titulo="Grupo de Eleitos"
        icone="pi pi-users"
        descricao="Opcional. Independe da abrangência da folha e pode ser informado em qualquer tipo de execução."
      >
        <div className="grid prototype-category-form-fields">
          {grupoEleitos}
        </div>
      </SecaoProcessamentoFolha>
    </>
  );
}
