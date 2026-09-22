import { BotaoAdicionarSeplag } from "@componentes/Botao";
import { ModalDeleteSeplag } from "@componentes/ModalDelete";
import "primereact/resources/themes/saga-blue/theme.css";
import { useState } from "react";
import { DocPage, PlaygroundCode, type DocProp, type DocSection } from "../../components/DocPage";

// ─── Playground ─────────────────────────────────────────────────────────────

const DEFAULT_MESSAGE = "Deseja realmente remover o registro selecionado?";

function ModalDeletePlayground() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [lastAction, setLastAction] = useState<string | null>(null);

  const trimmed = message.trim();
  const effectiveMessage = trimmed === "" ? undefined : trimmed;

  const propLines = [
    "<ModalDeleteSeplag",
    "  visible={visible}",
    ...(trimmed === "" ? [] : [`  message="${trimmed}"`]),
    "  onConfirm={() => setVisible(false)}",
    "  onCancel={() => setVisible(false)}",
    "/>",
  ];
  const code = propLines.join("\n");

  return (
    <div className="botao-playground">
      <div className="botao-playground-preview">
        <BotaoAdicionarSeplag
          label="Excluir registro"
          icon="pi pi-trash"
          onClick={() => {
            setVisible(true);
            setLastAction(null);
          }}
        />
        <ModalDeleteSeplag
          visible={visible}
          message={effectiveMessage}
          onConfirm={() => {
            setVisible(false);
            setLastAction("Confirmado!");
          }}
          onCancel={() => {
            setVisible(false);
            setLastAction("Cancelado.");
          }}
        />
        {lastAction !== null && (
          <span style={{ fontSize: "0.85rem", color: "#6c757d" }}>{lastAction}</span>
        )}
      </div>

      <div className="botao-playground-controls">
        <div className="pg-field">
          <label htmlFor="pg-md-message" className="pg-label">
            message
          </label>
          <textarea
            id="pg-md-message"
            className="pg-input"
            value={message}
            rows={3}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={DEFAULT_MESSAGE}
            style={{ maxWidth: 480, resize: "vertical" }}
          />
          <span style={{ fontSize: "0.75rem", color: "#6c757d" }}>
            Aceita HTML. Ex: <code>{"Texto<br>linha 2"}</code>
          </span>
        </div>
      </div>

      <PlaygroundCode code={code} />
    </div>
  );
}

function ModalDeleteBasicExample() {
  const [visible, setVisible] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <BotaoAdicionarSeplag
        label="Excluir registro"
        icon="pi pi-trash"
        onClick={() => setVisible(true)}
      />
      <ModalDeleteSeplag
        visible={visible}
        onConfirm={() => {
          setVisible(false);
          setResult("Confirmado!");
        }}
        onCancel={() => {
          setVisible(false);
          setResult("Cancelado.");
        }}
      />
      {result && <span style={{ fontSize: "0.85rem", color: "#6c757d" }}>{result}</span>}
    </div>
  );
}

function ModalDeleteCustomMessageExample() {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <BotaoAdicionarSeplag
        label="Remover usuário"
        icon="pi pi-user-minus"
        onClick={() => setVisible(true)}
      />
      <ModalDeleteSeplag
        visible={visible}
        message="Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita."
        onConfirm={() => setVisible(false)}
        onCancel={() => setVisible(false)}
      />
    </>
  );
}

function ModalDeleteJsxMessageExample() {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <BotaoAdicionarSeplag
        label="Remover com JSX"
        icon="pi pi-user-minus"
        onClick={() => setVisible(true)}
      />
      <ModalDeleteSeplag
        visible={visible}
        message={
          <>
            Tem certeza que deseja remover este usuário?
            <br />
            Esta ação não pode ser desfeita.
          </>
        }
        onConfirm={() => setVisible(false)}
        onCancel={() => setVisible(false)}
      />
    </>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description: "Configure as propriedades e veja o resultado em tempo real.",
    example: <ModalDeletePlayground />,
    code: "",
  },
  {
    title: "Uso básico",
    description: "Modal de confirmação padrão com mensagem genérica de exclusão.",
    example: <ModalDeleteBasicExample />,
    code: `import { useState } from "react";
import { ModalDeleteSeplag } from "@seplag/ui-lib-react-18";

const [visible, setVisible] = useState(false);

<ModalDeleteSeplag
  visible={visible}
  onConfirm={() => setVisible(false)}
  onCancel={() => setVisible(false)}
/>`,
  },
  {
    title: "Mensagem customizada",
    description: "Substitua o texto padrão pela prop message.",
    example: <ModalDeleteCustomMessageExample />,
    code: `<ModalDeleteSeplag
  visible={visible}
  message="Tem certeza que deseja remover este usuário?"
  onConfirm={() => setVisible(false)}
  onCancel={() => setVisible(false)}
/>`,
  },
  {
    title: "Mensagem com JSX",
    description:
      "A prop message aceita ReactNode, permitindo formatação com JSX como quebras de linha.",
    example: <ModalDeleteJsxMessageExample />,
    code: `<ModalDeleteSeplag
  visible={visible}
  message={
    <>
      Tem certeza que deseja remover este usuário?
      <br />
      Esta ação não pode ser desfeita.
    </>
  }
  onConfirm={() => setVisible(false)}
  onCancel={() => setVisible(false)}
/>`,
  },
];

const props: DocProp[] = [
  {
    name: "id",
    type: "string",
    defaultValue: '"confirmation-delete-modal"',
    required: false,
    description:
      "Identificador do modal, propagado como data-testid do Dialog e usado para compor o id dos botões Sim/Não. Útil para evitar colisão quando múltiplos ModalDeleteSeplag coexistem na tela (ex: um por linha de tabela).",
  },
  {
    name: "visible",
    type: "boolean",
    required: true,
    description: "Controla a visibilidade do modal.",
  },
  {
    name: "onConfirm",
    type: "() => void",
    required: true,
    description: 'Callback chamado ao clicar em "Sim".',
  },
  {
    name: "onCancel",
    type: "() => void",
    required: true,
    description: 'Callback chamado ao clicar em "Não".',
  },
  {
    name: "message",
    type: "ReactNode",
    defaultValue: '"Deseja realmente remover o registro selecionado?"',
    required: false,
    description:
      "Conteúdo alternativo à mensagem padrão. Aceita string ou JSX (ex: <><br /></> para quebras de linha).",
  },
];

export default function ModalDeleteDoc() {
  return (
    <DocPage
      title="Modal de Exclusão"
      description="Dialog de confirmação de exclusão padrão SEPLAG. Exibe uma mensagem de alerta e aguarda confirmação do usuário antes de prosseguir com a operação destrutiva."
      badge="Estável"
      since="v0.0.1"
      importStatement={'import { ModalDeleteSeplag } from "@seplag/ui-lib-react-18";'}
      sections={sections}
      props={props}
    />
  );
}
