import { useState } from "react";
import { useForm } from "react-hook-form";
import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import {
  UnsavedChangesProviderSeplag,
  useUnsavedChangesSeplag,
  useUnsavedChangesSyncSeplag,
} from "@componentes/UnsavedChangesWarning";
import { TextFieldSeplag } from "@componentes/Fields";
import { BotaoSeplag } from "@componentes/Botao";
import "primereact/resources/themes/saga-blue/theme.css";

const noError = () => null;

// ---------------------------------------------------------------------------
// Exemplo 1 — useUnsavedChangesSyncSeplag (forma recomendada)
// ---------------------------------------------------------------------------
function FormExampleInner() {
  const { control, formState } = useForm({
    defaultValues: { nome: "" },
  });

  // Sincroniza automaticamente isDirty com o provider
  useUnsavedChangesSyncSeplag(formState.isDirty);

  const { guard } = useUnsavedChangesSeplag();

  return (
    <div className="flex flex-column gap-3" style={{ width: "100%" }}>
      <div className="grid" style={{ width: "100%" }}>
        <TextFieldSeplag
          name="nome"
          control={control}
          label="Nome (edite para marcar como dirty)"
          placeholder="Digite algo..."
          cols="12"
          getFormErrorMessage={noError}
        />
      </div>
      <div className="flex gap-2">
        <BotaoSeplag
          label="Navegar (protegido)"
          icon="pi pi-arrow-right"
          onClick={() => guard(() => alert("Navegação permitida!"))}
        />
      </div>
      <small className="text-500">
        Estado do formulário:{" "}
        <strong>{formState.isDirty ? "com alterações" : "sem alterações"}</strong>
      </small>
    </div>
  );
}

function SyncExample() {
  return (
    <UnsavedChangesProviderSeplag>
      <FormExampleInner />
    </UnsavedChangesProviderSeplag>
  );
}

// ---------------------------------------------------------------------------
// Exemplo 2 — setDirty manual
// ---------------------------------------------------------------------------
function ManualExampleInner() {
  const { setDirty, guard } = useUnsavedChangesSeplag();
  const [localDirty, setLocalDirty] = useState(false);

  const toggle = () => {
    const next = !localDirty;
    setLocalDirty(next);
    setDirty(next);
  };

  return (
    <div className="flex flex-column gap-3">
      <div className="flex gap-2 align-items-center">
        <BotaoSeplag
          label={localDirty ? "Limpar alterações" : "Simular alteração"}
          icon={localDirty ? "pi pi-times" : "pi pi-pencil"}
          onClick={toggle}
        />
        <BotaoSeplag
          label="Ação protegida"
          icon="pi pi-shield"
          onClick={() => guard(() => alert("Ação executada!"))}
        />
      </div>
      <small className="text-500">
        Estado: <strong>{localDirty ? "com alterações" : "sem alterações"}</strong>
      </small>
    </div>
  );
}

function ManualExample() {
  return (
    <UnsavedChangesProviderSeplag>
      <ManualExampleInner />
    </UnsavedChangesProviderSeplag>
  );
}

// ---------------------------------------------------------------------------
// Seções e props
// ---------------------------------------------------------------------------
const sections: DocSection[] = [
  {
    title: "Com formulário react-hook-form",
    description:
      "Use useUnsavedChangesSyncSeplag para sincronizar automaticamente o isDirty do useForm com o provider. Edite o campo e clique no botão para ver o modal de confirmação.",
    example: <SyncExample />,
    code: `// 1. Envolva a aplicação (ou a rota) com o Provider
import {
  UnsavedChangesProviderSeplag,
  useUnsavedChangesSyncSeplag,
  useUnsavedChangesSeplag,
} from "@seplag/ui-lib-react-18";

function App() {
  return (
    <UnsavedChangesProviderSeplag>
      <Router />
    </UnsavedChangesProviderSeplag>
  );
}

// 2. Dentro do formulário, sincronize o estado
function MeuFormulario() {
  const { control, formState } = useForm();

  useUnsavedChangesSyncSeplag(formState.isDirty);

  const { guard } = useUnsavedChangesSeplag();

  return (
    <>
      <TextFieldSeplag name="nome" control={control} label="Nome" ... />
      <button onClick={() => guard(() => navigate("/outra-rota"))}>
        Voltar
      </button>
    </>
  );
}`,
  },
  {
    title: "Controle manual com setDirty",
    description:
      "Use setDirty diretamente para cenários fora de formulários react-hook-form. O guard protege qualquer ação customizada.",
    example: <ManualExample />,
    code: `function MeuComponente() {
  const { setDirty, guard } = useUnsavedChangesSeplag();

  // Marcar como sujo após qualquer alteração
  const handleChange = () => setDirty(true);

  // Proteger uma ação/navegação
  const handleVoltar = () => guard(() => navigate("/lista"));

  return (
    <>
      <button onClick={handleChange}>Fazer alteração</button>
      <button onClick={handleVoltar}>Voltar</button>
    </>
  );
}`,
  },
];

const propsProvider: DocProp[] = [
  {
    name: "children",
    type: "ReactNode",
    required: true,
    description: "Árvore de componentes protegida pelo provider.",
  },
];

const propsHookSync: DocProp[] = [
  {
    name: "isDirty",
    type: "boolean",
    required: true,
    description: "Estado de sujidade do formulário. Quando true, ativa a proteção de navegação.",
  },
];

const propsContext: DocProp[] = [
  {
    name: "setDirty",
    type: "(dirty: boolean) => void",
    required: false,
    description: "Define manualmente se há alterações não salvas.",
  },
  {
    name: "guard",
    type: "(action: () => void) => void",
    required: false,
    description: "Envolve uma ação: se isDirty, exibe o modal de confirmação antes de executá-la.",
  },
];

export default function UnsavedChangesWarningDoc() {
  return (
    <DocPage
      title="UnsavedChangesWarning"
      description="Sistema de proteção contra perda de dados não salvos. Combina um Provider (contexto), interceptação de navegação (pushState / popstate) e um Modal de confirmação. Integra-se nativamente com react-hook-form via useUnsavedChangesSyncSeplag."
      badge="Estável"
      since="v0.0.1"
      importStatement={`import {
  UnsavedChangesProviderSeplag,
  useUnsavedChangesSyncSeplag,
  useUnsavedChangesSeplag,
} from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={[
        ...propsProvider.map((p) => ({
          ...p,
          name: `[Provider] ${p.name}`,
        })),
        ...propsHookSync.map((p) => ({
          ...p,
          name: `[useUnsavedChangesSyncSeplag] ${p.name}`,
        })),
        ...propsContext.map((p) => ({
          ...p,
          name: `[useUnsavedChangesSeplag] ${p.name}`,
        })),
      ]}
    />
  );
}
