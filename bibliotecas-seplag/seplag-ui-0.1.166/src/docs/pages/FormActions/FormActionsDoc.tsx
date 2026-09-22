import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { FormActionsSeplag } from "@componentes/FormActions";
import { BotaoSeplag } from "@componentes/Botao";
import "primereact/resources/themes/saga-blue/theme.css";

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description:
      "Rodapé padrão de formulário com botões Voltar e Salvar. O divisor é inserido automaticamente acima dos botões.",
    example: (
      <div style={{ width: "100%" }}>
        <FormActionsSeplag onGoBack={() => alert("Voltar")} />
      </div>
    ),
    code: `import { FormActionsSeplag } from "@seplag/ui-lib-react-18";

<form onSubmit={handleSubmit(onSubmit)}>
  {/* campos do formulário */}
  <FormActionsSeplag onGoBack={onGoBack} />
</form>`,
  },
  {
    title: "Sem botão Salvar (somente leitura)",
    description:
      "Use showSave={false} para exibir apenas o botão Voltar, ideal para telas de visualização.",
    example: (
      <div style={{ width: "100%" }}>
        <FormActionsSeplag onGoBack={() => alert("Voltar")} showSave={false} />
      </div>
    ),
    code: `<FormActionsSeplag onGoBack={onGoBack} showSave={false} />`,
  },
  {
    title: "Com estado de carregamento",
    description:
      "Passe isLoading={true} para desabilitar o botão Salvar e exibir o indicador de carregamento durante o envio.",
    example: (
      <div style={{ width: "100%" }}>
        <FormActionsSeplag onGoBack={() => {}} isLoading={true} />
      </div>
    ),
    code: `<FormActionsSeplag onGoBack={onGoBack} isLoading={isLoading} />`,
  },
  {
    title: "Com botões extras (children)",
    description:
      "Passe botões adicionais como children. Eles serão renderizados entre o Voltar e o Salvar.",
    example: (
      <div style={{ width: "100%" }}>
        <FormActionsSeplag onGoBack={() => alert("Voltar")}>
          <BotaoSeplag
            type="button"
            label="Ação Extra"
            icon="pi pi-ban"
            severity="danger"
            outlined
            raised
          />
        </FormActionsSeplag>
      </div>
    ),
    code: `<FormActionsSeplag onGoBack={onGoBack} showSave={isEdit}>
  <BotaoSeplag
    type="button"
    label="Inativar"
    icon="pi pi-ban"
    severity="danger"
    outlined
    raised
    onClick={handleInativar}
  />
</FormActionsSeplag>`,
  },
  {
    title: "Com onSave explícito",
    description:
      'Quando onSave é passado, o botão Salvar muda para type="button" e chama a função ao clicar, em vez de submeter o formulário.',
    example: (
      <div style={{ width: "100%" }}>
        <FormActionsSeplag
          onGoBack={() => alert("Voltar")}
          onSave={() => alert("Salvar chamado!")}
        />
      </div>
    ),
    code: `<FormActionsSeplag onGoBack={onGoBack} onSave={handleSave} />`,
  },
];

const props: DocProp[] = [
  {
    name: "id",
    type: "string",
    defaultValue: '"form-actions"',
    required: false,
    description:
      "Identificador do wrapper de ações, usado como data-testid e para compor o id dos botões Voltar/Salvar.",
  },
  {
    name: "onGoBack",
    type: "() => void",
    required: true,
    description: "Função chamada ao clicar no botão Voltar.",
  },
  {
    name: "onSave",
    type: "() => void",
    required: false,
    description:
      'Quando fornecido, o botão Salvar usa type="button" e chama esta função. Sem ela, o botão usa type="submit".',
  },
  {
    name: "showSave",
    type: "boolean",
    defaultValue: "true",
    required: false,
    description: "Controla a visibilidade do botão Salvar.",
  },
  {
    name: "isLoading",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Exibe o indicador de carregamento no botão Salvar e o desabilita.",
  },
  {
    name: "saveLabel",
    type: "string",
    defaultValue: '"Salvar"',
    required: false,
    description: "Rótulo personalizado para o botão Salvar.",
  },
  {
    name: "backLabel",
    type: "string",
    defaultValue: '"Voltar"',
    required: false,
    description: "Rótulo personalizado para o botão Voltar.",
  },
  {
    name: "children",
    type: "ReactNode",
    required: false,
    description:
      "Botões extras inseridos entre o Voltar e o Salvar. Use a prop visible dos botões para exibição condicional sem if no JSX.",
  },
  {
    name: "saveProps",
    type: "BotaoSeplagProps",
    required: false,
    description:
      "Props adicionais repassadas ao BotaoSalvarSeplag (exceto type, loading e onClick que são controlados internamente).",
  },
];

export default function FormActionsDoc() {
  return (
    <DocPage
      title="FormActionsSeplag"
      description="Rodapé padrão de formulários com botões Voltar e Salvar. Inclui divisor automático, suporte a carregamento, botões extras via children e controle de visibilidade condicional. Garante consistência visual em todos os formulários do sistema."
      badge="Estável"
      since="v0.0.22"
      importStatement={`import { FormActionsSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
