import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { FilterFormSeplag, FilterActionsSeplag } from "@componentes/FilterForm";
import { BotaoConsultarSeplag, BotaoLimparFiltroSeplag } from "@componentes/Botao";
import "primereact/resources/themes/saga-blue/theme.css";

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description:
      "Formulário de filtro padrão com grid p-fluid. Envolve os campos de filtro e garante espaçamento consistente entre eles.",
    example: (
      <FilterFormSeplag>
        <div
          className="col-12 md:col-4"
          style={{
            padding: "0.5rem",
            background: "#f8f9fa",
            borderRadius: 4,
            border: "1px dashed #dee2e6",
          }}
        >
          Campo 1
        </div>
        <div
          className="col-12 md:col-4"
          style={{
            padding: "0.5rem",
            background: "#f8f9fa",
            borderRadius: 4,
            border: "1px dashed #dee2e6",
          }}
        >
          Campo 2
        </div>
        <FilterActionsSeplag>
          <BotaoConsultarSeplag label="Pesquisar" type="submit" />
          <BotaoLimparFiltroSeplag label="Limpar" type="button" />
        </FilterActionsSeplag>
      </FilterFormSeplag>
    ),
    code: `import { FilterFormSeplag, FilterActionsSeplag } from "@seplag/ui-lib-react-18";
import { BotaoConsultarSeplag, BotaoLimparFiltroSeplag } from "@seplag/ui-lib-react-18";

<FilterFormSeplag onSubmit={handleSubmit}>
  <TextFieldSeplag name="nome" label="Nome" control={control} cols="12 4" />
  <DropdownFieldSeplag name="status" label="Status" control={control} cols="12 4" options={[]} optionLabel="label" optionValue="value" />
  <FilterActionsSeplag>
    <BotaoConsultarSeplag label="Pesquisar" type="submit" />
    <BotaoLimparFiltroSeplag label="Limpar" type="button" onClick={handleReset} />
  </FilterActionsSeplag>
</FilterFormSeplag>`,
  },
  {
    title: "Apenas botão Limpar",
    description:
      "Quando o filtro é reativo (sem submit explícito), use apenas o FilterActionsSeplag com o botão de limpar.",
    example: (
      <FilterFormSeplag onSubmit={(e) => e.preventDefault()}>
        <div
          className="col-12 md:col-6"
          style={{
            padding: "0.5rem",
            background: "#f8f9fa",
            borderRadius: 4,
            border: "1px dashed #dee2e6",
          }}
        >
          Campo reativo
        </div>
        <FilterActionsSeplag>
          <BotaoLimparFiltroSeplag label="Limpar Filtro" icon="pi pi-undo" type="button" />
        </FilterActionsSeplag>
      </FilterFormSeplag>
    ),
    code: `<FilterFormSeplag onSubmit={(e) => e.preventDefault()}>
  <TextFieldSeplag name="filtro" label="Descrição" control={control} cols="12 6" />
  <FilterActionsSeplag>
    <BotaoLimparFiltroSeplag label="Limpar Filtro" icon="pi pi-undo" type="button" onClick={handleReset} />
  </FilterActionsSeplag>
</FilterFormSeplag>`,
  },
];

const propsFilterForm: DocProp[] = [
  {
    name: "id",
    type: "string",
    defaultValue: '"filter-form"',
    required: false,
    description: "Identificador do form/div, usado como data-testid.",
  },
  {
    name: "children",
    type: "ReactNode",
    required: true,
    description: "Campos de filtro e o componente FilterActionsSeplag.",
  },
  {
    name: "onSubmit",
    type: "FormEventHandler",
    required: false,
    description: "Handler de submissão do formulário. Omita para filtros reativos.",
  },
];

const propsFilterActions: DocProp[] = [
  {
    name: "id",
    type: "string",
    defaultValue: '"filter-actions"',
    required: false,
    description: "Identificador do wrapper de ações, usado como data-testid.",
  },
  {
    name: "children",
    type: "ReactNode",
    required: true,
    description:
      "Botões de ação do filtro (Pesquisar, Limpar, etc). O padding-top é calculado automaticamente para alinhar com os inputs.",
  },
];

export default function FilterFormDoc() {
  return (
    <DocPage
      title="FilterFormSeplag / FilterActionsSeplag"
      description="Par de componentes que padroniza a estrutura de formulários de filtro. O FilterFormSeplag provê o grid com p-fluid e o FilterActionsSeplag alinha automaticamente os botões de ação com os campos, sem necessidade de ajustes manuais de espaçamento."
      badge="Estável"
      since="v0.0.22"
      importStatement={`import { FilterFormSeplag, FilterActionsSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={[...propsFilterForm, ...propsFilterActions]}
    />
  );
}
