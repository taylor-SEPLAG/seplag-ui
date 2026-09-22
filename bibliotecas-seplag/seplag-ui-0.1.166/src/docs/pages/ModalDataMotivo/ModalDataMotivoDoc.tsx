import {
  ModalDataMotivoSeplag,
  type ModalDataMotivoValoresSeplag,
} from "@componentes/ModalDataMotivo";
import { useState } from "react";
import { DocPage, type DocProp, type DocSection } from "../../components/DocPage";

const botaoStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  background: "#fff",
  padding: "0.5rem 1rem",
  cursor: "pointer",
} as const;

function EncerramentoPlayground() {
  const [visible, setVisible] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [resultado, setResultado] = useState<ModalDataMotivoValoresSeplag | null>(null);

  function handleConfirm(valores: ModalDataMotivoValoresSeplag) {
    setConfirmando(true);
    window.setTimeout(() => {
      setConfirmando(false);
      setVisible(false);
      setResultado(valores);
    }, 1200);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setResultado(null);
          setVisible(true);
        }}
        style={botaoStyle}
      >
        Encerrar vigência
      </button>

      {resultado && (
        <pre style={{ marginTop: "0.75rem", color: "#334155" }}>
          {JSON.stringify(resultado, null, 2)}
        </pre>
      )}

      <ModalDataMotivoSeplag
        id="doc-encerramento"
        visible={visible}
        titulo="Encerrar tipo de vínculo — Estatutário"
        mensagem="Ao confirmar, o encerramento será registrado com a data e o motivo informados. O registro continuará disponível para consulta."
        dataReferencia="2026-01-15"
        labelDataReferencia="Início da vigência"
        labelData="Data de encerramento"
        labelMotivo="Motivo do encerramento"
        labelAcao="Encerrar"
        iconAcao="pi pi-ban"
        confirmando={confirmando}
        onCancel={() => setVisible(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

function ExtincaoPlayground() {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <button type="button" onClick={() => setVisible(true)} style={botaoStyle}>
        Extinguir carreira
      </button>

      <ModalDataMotivoSeplag
        id="doc-extincao"
        visible={visible}
        titulo="Extinguir carreira — Profissionais da Educação"
        labelData="Data de extinção"
        labelMotivo="Motivo da extinção"
        labelAcao="Extinguir"
        iconAcao="pi pi-trash"
        maxLengthMotivo={200}
        onCancel={() => setVisible(false)}
        onConfirm={() => setVisible(false)}
      />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Encerramento (com data de início somente leitura)",
    description:
      "Simula uma confirmação assíncrona (`confirmando`) e mostra o valor entregue ao `onConfirm`. A `dataReferencia` aparece desabilitada e limita o calendário por baixo; o limite superior é hoje.",
    example: <EncerramentoPlayground />,
    code: `import { useState } from "react";
import { ModalDataMotivoSeplag } from "@seplag/ui-lib-react-18";

const [visible, setVisible] = useState(false);

<ModalDataMotivoSeplag
  visible={visible}
  titulo="Encerrar tipo de vínculo — Estatutário"
  mensagem="Ao confirmar, o encerramento será registrado com a data e o motivo informados."
  dataReferencia={tipoVinculo.dataInicioVigencia}
  labelDataReferencia="Início da vigência"
  labelData="Data de encerramento"
  labelMotivo="Motivo do encerramento"
  labelAcao="Encerrar"
  iconAcao="pi pi-ban"
  confirmando={isEncerrando}
  onCancel={() => setVisible(false)}
  onConfirm={async ({ data, motivo }) => {
    const ok = await encerrar({ dataEncerramento: data, infoMtvoEncerramento: motivo });
    if (ok) setVisible(false);
  }}
/>`,
  },
  {
    title: "Extinção (sem data de referência)",
    description:
      "Mesmo componente com outros textos. Sem `dataReferencia`, o campo somente leitura não aparece e o calendário não tem limite inferior.",
    example: <ExtincaoPlayground />,
    code: `<ModalDataMotivoSeplag
  visible={visible}
  titulo="Extinguir carreira — Profissionais da Educação"
  labelData="Data de extinção"
  labelMotivo="Motivo da extinção"
  labelAcao="Extinguir"
  iconAcao="pi pi-trash"
  maxLengthMotivo={200}
  onCancel={() => setVisible(false)}
  onConfirm={({ data, motivo }) => extinguir(data, motivo)}
/>`,
  },
  {
    title: "Dados carregados pelo host",
    description:
      "Quando a data de referência vem de uma consulta (detalhe do registro), use `carregando` para travar campos e ação até ela chegar.",
    example: (
      <div style={{ color: "#64748b" }}>
        Exemplo apenas de código — a lib não faz chamadas HTTP.
      </div>
    ),
    code: `const { data: detalhe, isFetching } = useGetDetalheQuery(id, { skip: !visible });

<ModalDataMotivoSeplag
  visible={visible}
  titulo="Encerrar cargo"
  dataReferencia={detalhe?.dataInicioVigencia}
  carregando={isFetching}
  confirmando={isEncerrando}
  onCancel={fechar}
  onConfirm={confirmar}
/>`,
  },
];

const props: DocProp[] = [
  {
    name: "id",
    type: "string",
    defaultValue: '"modal-data-motivo"',
    description:
      "Base dos data-testid e dos name dos campos ({id}-data, {id}-motivo, {id}-referencia). Evite ponto (.).",
  },
  {
    name: "visible",
    type: "boolean",
    required: true,
    description: "Controla a exibição do modal. Ao voltar a true, data e motivo são restaurados.",
  },
  { name: "titulo", type: "string", required: true, description: "Título exibido no cabeçalho." },
  {
    name: "onConfirm",
    type: "(valores: { data: string; motivo: string }) => void",
    required: true,
    description:
      "Chamado só depois de o formulário validar. `data` vem em dd/MM/yyyy. Fechar o modal é responsabilidade do consumidor.",
  },
  { name: "onCancel", type: "() => void", required: true, description: "Botão Cancelar, X e ESC." },
  {
    name: "confirmando",
    type: "boolean",
    defaultValue: "false",
    description: "Botão de ação em loading; trava campos, cancelar e ESC.",
  },
  {
    name: "carregando",
    type: "boolean",
    defaultValue: "false",
    description: "Mesmo bloqueio, para enquanto o host carrega dados (ex.: a data de referência).",
  },
  {
    name: "mensagem",
    type: "string",
    description: "Aviso informativo no topo. Omitido quando não informado.",
  },
  {
    name: "dataReferencia",
    type: "string | Date | null",
    description:
      "Data exibida somente leitura e limite mínimo do calendário. Aceita dd/MM/yyyy ou yyyy-MM-dd.",
  },
  {
    name: "labelDataReferencia",
    type: "string",
    defaultValue: '"Data de início"',
    description: "Rótulo da data somente leitura.",
  },
  {
    name: "labelData",
    type: "string",
    defaultValue: '"Data"',
    description: "Rótulo do campo de data (obrigatório; máximo hoje).",
  },
  {
    name: "labelMotivo",
    type: "string",
    defaultValue: '"Motivo"',
    description: "Rótulo do campo de motivo (obrigatório).",
  },
  {
    name: "labelAcao",
    type: "string",
    defaultValue: '"Confirmar"',
    description: "Texto do botão de ação.",
  },
  {
    name: "iconAcao",
    type: "string",
    defaultValue: '"pi pi-check"',
    description: "Classe do ícone do botão de ação.",
  },
  {
    name: "labelCancelar",
    type: "string",
    defaultValue: '"Cancelar"',
    description: "Texto do botão de cancelar.",
  },
  {
    name: "maxLengthMotivo",
    type: "number",
    defaultValue: "500",
    description: "Limite de caracteres do motivo.",
  },
  { name: "tamanho", type: "string", defaultValue: '"45vw"', description: "Largura do modal." },
];

export default function ModalDataMotivoDoc() {
  return (
    <DocPage
      title="ModalDataMotivo"
      badge="Novo"
      since="v0.1.166"
      description="Modal que coleta uma data e um motivo — encerramento, extinção e ações parecidas. Os limites de data valem só para a escolha no calendário: o que for digitado fora do intervalo chega ao onConfirm e a recusa fica com o backend."
      importStatement={`import { ModalDataMotivoSeplag } from "@seplag/ui-lib-react-18";
import type { ModalDataMotivoSeplagProps, ModalDataMotivoValoresSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
