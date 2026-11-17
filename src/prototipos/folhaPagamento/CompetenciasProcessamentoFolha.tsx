import type { ReactNode } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import {
  DropdownFieldSeplag,
  RadioButtonFieldSeplag,
} from "@componentes/Fields";
import type { OpcaoAbrangencia } from "./abrangenciaGrupoCalculo";
import type { ProcessamentoFolhaForm } from "./types";

export function CompetenciasProcessamentoFolha({
  control,
  setValue,
  options,
  getError,
}: {
  control: Control<ProcessamentoFolhaForm>;
  setValue: UseFormSetValue<ProcessamentoFolhaForm>;
  options: OpcaoAbrangencia[];
  getError: (campo: keyof ProcessamentoFolhaForm) => ReactNode;
}) {
  return (
    <div className="col-12">
      <div className="prototype-processamento-competencias">
        <DropdownFieldSeplag
          name="competencia"
          control={control}
          label="Competência inicial"
          cols="12"
          required
          options={options}
          optionLabel="label"
          optionValue="value"
          onChange={(valor) =>
            setValue("competencia", valor ?? "", {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          getFormErrorMessage={() => getError("competencia")}
        />
        <DropdownFieldSeplag
          name="competenciaFinal"
          control={control}
          label="Competência final"
          cols="12"
          disabled
          options={options}
          optionLabel="label"
          optionValue="value"
          showClear={false}
          getFormErrorMessage={() => null}
        />
        <RadioButtonFieldSeplag
          name="tipoExecucao"
          control={control}
          label="Tipo de execução"
          cols="12"
          required
          options={[
            { label: "Parcial", value: "PARCIAL" },
            { label: "Total", value: "TOTAL" },
          ]}
          getFormErrorMessage={() => getError("tipoExecucao")}
        />
      </div>
    </div>
  );
}
