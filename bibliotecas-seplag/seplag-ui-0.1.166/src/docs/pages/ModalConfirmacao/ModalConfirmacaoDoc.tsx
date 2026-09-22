import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { ModalConfirmacaoSeplag } from "@componentes/ModalConfirmacao";
import { useState } from "react";

function ModalConfirmacaoPlayground() {
  const [visible, setVisible] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);

  function handleConfirm() {
    setConfirmando(true);
    window.setTimeout(() => {
      setConfirmando(false);
      setVisible(false);
      setResultado("Ação confirmada.");
    }, 1200);
  }

  function handleCancel() {
    setVisible(false);
    setResultado("Ação cancelada.");
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setResultado(null);
          setVisible(true);
        }}
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: 6,
          background: "#fff",
          padding: "0.5rem 1rem",
          cursor: "pointer",
        }}
      >
        Excluir registro
      </button>

      {resultado && (
        <div style={{ marginTop: "0.75rem", color: "#334155" }}>{resultado}</div>
      )}

      <ModalConfirmacaoSeplag
        visible={visible}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        titulo="Excluir registro"
        message="Deseja realmente excluir este registro? Esta ação não pode ser desfeita."
        confirmando={confirmando}
      />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "Abre o modal, simula uma confirmação assíncrona (loadingAcao) e mostra o resultado da escolha do usuário.",
    example: <ModalConfirmacaoPlayground />,
    code: `import { useState } from "react";
import { ModalConfirmacaoSeplag } from "@seplag/ui-lib-react-18";

const [visible, setVisible] = useState(false);
const [confirmando, setConfirmando] = useState(false);

function handleConfirm() {
  setConfirmando(true);
  excluirRegistro().finally(() => {
    setConfirmando(false);
    setVisible(false);
  });
}

<ModalConfirmacaoSeplag
  visible={visible}
  onConfirm={handleConfirm}
  onCancel={() => setVisible(false)}
  titulo="Excluir registro"
  message="Deseja realmente excluir este registro? Esta ação não pode ser desfeita."
  confirmando={confirmando}
/>`,
  },
  {
    title: "Uso básico",
    description:
      "Sem customização, usa o título \"Confirmação\" e a mensagem padrão \"Deseja realmente confirmar esta ação?\".",
    example: <div style={{ color: "#64748b" }}>Veja o Playground acima — o mesmo componente, sem props de customização, usa título e mensagem padrão.</div>,
    code: `<ModalConfirmacaoSeplag
  visible={visible}
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>`,
  },
  {
    title: "Rótulos e ícones customizados",
    description: "labelConfirmar, labelCancelar, iconConfirmar e iconCancelar permitem adaptar os botões ao contexto (ex: ativar/inativar).",
    example: <div style={{ color: "#64748b" }}>Exemplo apenas de código — troque os rótulos e ícones dos botões de ação/cancelamento conforme o contexto.</div>,
    code: `<ModalConfirmacaoSeplag
  visible={visible}
  onConfirm={handleAtivar}
  onCancel={handleCancel}
  titulo="Ativar certame"
  message="Deseja ativar este certame? Ele passará a ficar visível para os candidatos."
  labelConfirmar="Ativar"
  labelCancelar="Cancelar"
  iconConfirmar="pi pi-check-circle"
  iconCancelar="pi pi-ban"
/>`,
  },
];

const props: DocProp[] = [
  { name: "id", type: "string", defaultValue: '"confirmacao-modal"', description: "Identificador HTML do modal (e base de data-testid)." },
  { name: "visible", type: "boolean", required: true, description: "Controla a exibição do modal." },
  { name: "onConfirm", type: "() => void", required: true, description: "Callback executado ao clicar no botão de confirmação." },
  { name: "onCancel", type: "() => void", required: true, description: "Callback executado ao clicar em cancelar ou fechar o modal." },
  { name: "titulo", type: "string", defaultValue: '"Confirmação"', description: "Título exibido no cabeçalho do modal." },
  { name: "message", type: "ReactNode", description: 'Mensagem de confirmação. Strings são renderizadas com dangerouslySetInnerHTML (permite HTML simples); outros ReactNode são renderizados diretamente. Padrão: "Deseja realmente confirmar esta ação?".' },
  { name: "labelConfirmar", type: "string", defaultValue: '"Sim"', description: "Texto do botão de confirmação." },
  { name: "labelCancelar", type: "string", defaultValue: '"Não"', description: "Texto do botão de cancelamento." },
  { name: "iconConfirmar", type: "string", defaultValue: '"pi pi-check"', description: "Classe do ícone do botão de confirmação." },
  { name: "iconCancelar", type: "string", defaultValue: '"pi pi-times"', description: "Classe do ícone do botão de cancelamento." },
  { name: "confirmando", type: "boolean", defaultValue: "false", description: "Quando true, exibe o botão de confirmação em estado de carregamento e desabilita o fechamento (inclusive via Esc)." },
];

export default function ModalConfirmacaoDoc() {
  return (
    <DocPage
      title="ModalConfirmacao"
      badge="Estável"
      since="v0.1.153"
      description="Modal de confirmação padronizado (sim/não), construído sobre o ModalSeplag. Ideal para confirmar exclusões, ativações e outras ações destrutivas ou irreversíveis."
      importStatement={`import { ModalConfirmacaoSeplag } from "@seplag/ui-lib-react-18";
import type { ModalConfirmacaoSeplagProps } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
