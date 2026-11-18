import { useId } from "react";
import { MultiSelect } from "primereact/multiselect";
import RotuloSeplag from "@componentes/Rotulo";
import { carreirasDosCargos, opcoesAbrangencia, type CatalogoAbrangencia, type CriteriosAbrangencia } from "./abrangenciaGrupoCalculo";
import "./carreiraCargoListas.css";

interface Props {
  catalogo: CatalogoAbrangencia;
  criterios: CriteriosAbrangencia;
  disabled: boolean;
  onCarreirasChange: (valores: string[]) => void;
  onCargosChange: (valores: string[]) => void;
}
export function CarreiraCargoListas({ catalogo, criterios, disabled, onCarreirasChange, onCargosChange }: Props) {
  const id = useId();
  const base = { ...criterios, carreiras: [], cargos: [] };
  const opcoes = opcoesAbrangencia(base, catalogo);
  const cargos = opcoes.cargos.map(cargo => {
    const carreiras = carreirasDosCargos([cargo.value], base, catalogo);
    const carreiraLabel = carreiras.map(c => catalogo.carreiras.find(item => item.value === c)?.label ?? c).join(", ");
    return { ...cargo, carreiraLabel };
  });
  const cargosOrdenados = [...cargos.filter(cargo => cargo.carreiraLabel), ...cargos.filter(cargo => !cargo.carreiraLabel)];
  const linhaCargo = (cargo: typeof cargos[number]) => <div className="cc-select-option">
    <span className="cc-select-option-name">{cargo.label}</span>{" "}
    <span className={cargo.carreiraLabel ? "cc-select-option-career" : "cc-select-option-no-career"}>{cargo.carreiraLabel || "sem carreira"}</span>
  </div>;
  return <div className="cc-select-fields" role="group" aria-label="Carreira e Cargo">
    <RotuloSeplag nome="Carreira" htmlFor={`${id}-carreira`} cols="12">
      <MultiSelect id="abrangenciaCarreiras" inputId={`${id}-carreira`} value={criterios.carreiras}
        options={opcoes.carreiras} optionLabel="label" optionValue="value" dataKey="value" filter
        placeholder="Selecione..." selectedItemsLabel="{0} carreiras selecionadas" maxSelectedLabels={3}
        className="w-full" style={{ width: "100%", height: "40px" }} disabled={disabled || !opcoes.carreiraAtiva}
        emptyMessage="Nenhuma carreira disponível." onChange={e => onCarreirasChange(e.value)} />
    </RotuloSeplag>
    <RotuloSeplag nome="Cargo" htmlFor={`${id}-cargo`} cols="12">
      <MultiSelect id="abrangenciaCargos" inputId={`${id}-cargo`} value={criterios.cargos}
        options={cargosOrdenados} optionLabel="label" optionValue="value" dataKey="value" filter filterBy="label,carreiraLabel"
        placeholder={criterios.carreiras.length ? "Selecione um cargo desta carreira..." : "Selecione um cargo..."}
        selectedItemsLabel="{0} cargos selecionados" maxSelectedLabels={3} itemTemplate={linhaCargo} panelClassName="cc-cargo-options"
        className="w-full" style={{ width: "100%", height: "40px" }} disabled={disabled}
        emptyMessage="Nenhum cargo disponível." onChange={e => onCargosChange(e.value)} />
    </RotuloSeplag>
  </div>;
}
