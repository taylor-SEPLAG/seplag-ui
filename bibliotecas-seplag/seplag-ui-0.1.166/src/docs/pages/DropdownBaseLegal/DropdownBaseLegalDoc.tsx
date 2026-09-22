import { useState } from "react";
import { useForm } from "react-hook-form";
import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { DropdownBaseLegalSeplag } from "@componentes/DropdownBaseLegal";
import { ModalSeplag } from "@componentes/Modal";
import {
  TIPO_DOCUMENTO_MAP_DEFAULT_SEPLAG,
  type DocumentoLegalApiSeplag,
  type NormalizedDocumentoSeplag,
} from "@componentes/DropdownBaseLegal/types";

const documentosMock: DocumentoLegalApiSeplag[] = [
  {
    id: 1,
    numrDocumentoLegal: "13.303",
    anoVigencia: "2016",
    nomeDocumentoLegal: "Estatuto Jurídico da Empresa Pública e da Sociedade de Economia Mista",
    siglaTipoDocumento: "1",
    valores: [{ nomeCampo: "tipo", valorCampo: "1" }],
  },
  {
    id: 2,
    numrDocumentoLegal: "9.507",
    anoVigencia: "2020",
    nomeDocumentoLegal: "Regulamenta procedimentos de contratação direta",
    siglaTipoDocumento: "2",
    valores: [{ nomeCampo: "tipo", valorCampo: "2" }],
  },
  {
    id: 3,
    numrDocumentoLegal: "14.133",
    anoVigencia: "2021",
    nomeDocumentoLegal: "Lei de Licitações e Contratos Administrativos",
    siglaTipoDocumento: "1",
    valores: [{ nomeCampo: "tipo", valorCampo: "1" }],
  },
];

function BasicExample() {
  const { control } = useForm({ defaultValues: { documentoLegalIds: [1] as number[] } });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <DropdownBaseLegalSeplag
        name="documentoLegalIds"
        control={control}
        label="Documento Base Legal"
        documentos={documentosMock}
        tipoMap={TIPO_DOCUMENTO_MAP_DEFAULT_SEPLAG}
        cols="12"
      />
    </div>
  );
}

function SelectionChangeExample() {
  const { control } = useForm({ defaultValues: { documentoLegalIds: [] as number[] } });
  const [selecionados, setSelecionados] = useState<NormalizedDocumentoSeplag[]>([]);

  return (
    <div className="grid" style={{ width: "100%" }}>
      <DropdownBaseLegalSeplag
        name="documentoLegalIds"
        control={control}
        label="Documento Base Legal"
        documentos={documentosMock}
        tipoMap={TIPO_DOCUMENTO_MAP_DEFAULT_SEPLAG}
        onSelectionChange={setSelecionados}
        cols="12"
      />
      {selecionados.length > 0 && (
        <pre style={{ width: "100%", fontSize: "0.8rem", background: "#f5f5f5", padding: 12 }}>
          {JSON.stringify(
            selecionados.map((d) => ({
              id: d.id,
              tipo: d.tipo,
              numero: d.numrDocumentoLegal,
              ano: d.anoVigencia,
              nome: d.nomeDocumentoLegal,
            })),
            null,
            2,
          )}
        </pre>
      )}
    </div>
  );
}

// Exemplo de seleção única (maxSelecionados=1): as opções viram radio button
// e escolher uma nova substitui a anterior automaticamente, sem precisar remover.
// Sem `name`/`control`, o componente é standalone — a seleção é controlada de
// fora via `value` (array com no máximo 1 id) + `onSelectionChange`.
function SelecaoUnicaExample() {
  const [documentoLegalId, setDocumentoLegalId] = useState<number | null>(null);

  return (
    <div className="grid" style={{ width: "100%" }}>
      <DropdownBaseLegalSeplag
        label="Lei de isenção"
        documentos={documentosMock}
        tipoMap={TIPO_DOCUMENTO_MAP_DEFAULT_SEPLAG}
        maxSelecionados={1}
        value={documentoLegalId != null ? [documentoLegalId] : []}
        onSelectionChange={(selecionados) => setDocumentoLegalId(selecionados[0]?.id ?? null)}
        cols="12"
      />
      <p style={{ fontSize: "0.82rem", color: "#6b7280", margin: 0 }}>
        Selecionado: {JSON.stringify(documentoLegalId)}
      </p>
    </div>
  );
}

// Exemplo do mesmo padrão usado no RadioButtonField/CardRadioGroup: um campo
// auxiliar controlado por react-hook-form guarda o id selecionado via radio.
function AplicavelExample() {
  const { control, watch } = useForm({
    defaultValues: { documentoLegalIds: [1, 3] as number[], documentoLegalAplicavelId: null as number | null },
  });
  const documentoLegalIds = watch("documentoLegalIds");
  const documentoLegalAplicavelId = watch("documentoLegalAplicavelId");

  return (
    <div className="grid" style={{ width: "100%" }}>
      <DropdownBaseLegalSeplag
        name="documentoLegalIds"
        control={control}
        label="Documentos Base Legal"
        documentos={documentosMock}
        tipoMap={TIPO_DOCUMENTO_MAP_DEFAULT_SEPLAG}
        indicarAplicavel
        nameAplicavel="documentoLegalAplicavelId"
        requiredAplicavel
        cols="12"
      />
      <pre style={{ width: "100%", fontSize: "0.8rem", background: "#f5f5f5", padding: 12 }}>
        {JSON.stringify({ documentoLegalIds, documentoLegalAplicavelId }, null, 2)}
      </pre>
    </div>
  );
}

// Em vez de navegar via `addNewHref`, `onAddNewClick` abre um modal de cadastro
// próprio da aplicação, sem sair da tela/formulário atual.
function AddNewClickExample() {
  const { control } = useForm({ defaultValues: { documentoLegalIds: [] as number[] } });
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <div className="grid" style={{ width: "100%" }}>
      <DropdownBaseLegalSeplag
        name="documentoLegalIds"
        control={control}
        label="Documento Base Legal"
        documentos={documentosMock}
        tipoMap={TIPO_DOCUMENTO_MAP_DEFAULT_SEPLAG}
        showAddNewLink
        onAddNewClick={() => setModalAberto(true)}
        cols="12"
      />
      <ModalSeplag
        visible={modalAberto}
        fechar={() => setModalAberto(false)}
        titulo="Cadastrar documento legal"
        onlyClose
        labelFechar="Fechar"
      >
        <p>Formulário de cadastro do documento legal entraria aqui.</p>
      </ModalSeplag>
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description:
      "Campo multi-seleção de documentos legais (leis, decretos, normas etc.), integrado com react-hook-form. A lista de `documentos` é carregada pelo consumidor (ex.: via RTK Query) e passada já pronta.",
    example: <BasicExample />,
    code: `import { useForm } from "react-hook-form";
import {
  DropdownBaseLegalSeplag,
  TIPO_DOCUMENTO_MAP_DEFAULT_SEPLAG,
} from "@seplag/ui-lib-react-18";

const { control } = useForm({
  defaultValues: { documentoLegalIds: [] as number[] },
});

<DropdownBaseLegalSeplag
  name="documentoLegalIds"
  control={control}
  label="Documento Base Legal"
  documentos={documentosDaApi}
  tipoMap={TIPO_DOCUMENTO_MAP_DEFAULT_SEPLAG}
  cols="12"
/>`,
  },
  {
    title: "Obtendo o registro selecionado",
    description:
      "O campo do formulário (`documentoLegalIds`) guarda apenas os `id`s dos documentos. Para obter o registro completo (número, ano, tipo, arquivo etc.) use o callback `onSelectionChange`, disparado a cada mudança de seleção com a lista já normalizada (`NormalizedDocumentoSeplag[]`) — não é necessário procurar o documento na lista original a partir do id.",
    example: <SelectionChangeExample />,
    code: `import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  DropdownBaseLegalSeplag,
  TIPO_DOCUMENTO_MAP_DEFAULT_SEPLAG,
  type NormalizedDocumentoSeplag,
} from "@seplag/ui-lib-react-18";

const { control } = useForm({ defaultValues: { documentoLegalIds: [] as number[] } });
const [selecionados, setSelecionados] = useState<NormalizedDocumentoSeplag[]>([]);

<DropdownBaseLegalSeplag
  name="documentoLegalIds"
  control={control}
  label="Documento Base Legal"
  documentos={documentosDaApi}
  tipoMap={TIPO_DOCUMENTO_MAP_DEFAULT_SEPLAG}
  onSelectionChange={setSelecionados}
/>

// Exemplo do shape retornado em "selecionados" (NormalizedDocumentoSeplag[]):
// [
//   {
//     "id": 3,
//     "label": "Lei nº 14.133/2021",
//     "fullName": "Lei de Licitações e Contratos Administrativos",
//     "description": "Lei de Licitações e Contratos Administrativos",
//     "tipo": "Lei",
//     "numrDocumentoLegal": "14.133",
//     "anoVigencia": "2021",
//     "nomeDocumentoLegal": "Lei de Licitações e Contratos Administrativos",
//     "dataFim": null,
//     "dataVigencia": "2021-04-01",
//     "arquivo": {
//       "conteudoEmBase64": "JVBERi0xLjQKJ...",
//       "contentType": "application/pdf",
//       "nome": "lei-14133-2021.pdf"
//     }
//   }
// ]`,
  },
  {
    title: "Marcando o documento aplicável (radio)",
    description:
      "Quando mais de um documento é selecionado, `indicarAplicavel` exibe um radio button por linha na lista de selecionados para marcar qual deles é o 'aplicável'. Esse valor é lido/gravado em um segundo campo do formulário, indicado por `nameAplicavel` — mesmo padrão de campo controlado usado no RadioButtonFieldSeplag: o id vem de `field.value` e a seleção é propagada via `field.onChange` do Controller interno.",
    example: <AplicavelExample />,
    code: `const { control, watch } = useForm({
  defaultValues: {
    documentoLegalIds: [] as number[],
    documentoLegalAplicavelId: null as number | null,
  },
});

<DropdownBaseLegalSeplag
  name="documentoLegalIds"
  control={control}
  label="Documentos Base Legal"
  documentos={documentosDaApi}
  tipoMap={TIPO_DOCUMENTO_MAP_DEFAULT_SEPLAG}
  indicarAplicavel
  nameAplicavel="documentoLegalAplicavelId"
  requiredAplicavel
  aplicavelLabel="Lei aplicável"
/>

// Para ler o valor marcado fora do componente (ex.: enviar no payload):
const idDocumentoAplicavel = watch("documentoLegalAplicavelId");

// Exemplo do estado do formulário após marcar o documento id=3 como aplicável:
// {
//   "documentoLegalIds": [1, 3],
//   "documentoLegalAplicavelId": 3
// }
//
// Com apenas 1 documento selecionado, ele vira o aplicável automaticamente:
// {
//   "documentoLegalIds": [1],
//   "documentoLegalAplicavelId": 1
// }`,
  },
  {
    title: "Adicionar via callback — onAddNewClick",
    description:
      "Alternativa a `addNewHref` para quando o cadastro de um novo documento deve acontecer sem navegar de rota — por exemplo, abrindo um modal de cadastro que, ao fechar, atualiza a lista de `documentos` (refetch). Informe `onAddNewClick` junto de `showAddNewLink`; o atalho passa a ser renderizado como `<button>` (mesmo visual/posição do link) e `addNewHref`/`addNewTarget` são ignorados.",
    example: <AddNewClickExample />,
    code: `import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  DropdownBaseLegalSeplag,
  ModalSeplag,
  TIPO_DOCUMENTO_MAP_DEFAULT_SEPLAG,
} from "@seplag/ui-lib-react-18";

const { control } = useForm({ defaultValues: { documentoLegalIds: [] as number[] } });
const [modalAberto, setModalAberto] = useState(false);

<DropdownBaseLegalSeplag
  name="documentoLegalIds"
  control={control}
  label="Documento Base Legal"
  documentos={documentosDaApi}
  tipoMap={TIPO_DOCUMENTO_MAP_DEFAULT_SEPLAG}
  showAddNewLink
  onAddNewClick={() => setModalAberto(true)}
/>

<ModalSeplag
  visible={modalAberto}
  fechar={() => setModalAberto(false)}
  titulo="Cadastrar documento legal"
  onlyClose
  labelFechar="Fechar"
>
  {/* formulário de cadastro; ao salvar, fechar o modal e dar refetch em "documentos" */}
</ModalSeplag>`,
  },
  {
    title: "Seleção única — maxSelecionados",
    description:
      "Use maxSelecionados={1} quando o campo representa um único documento (ex.: lei de isenção de uma taxa), reaproveitando a mesma busca/badges do componente. Com o limite em 1, as opções do painel viram radio button — escolher uma nova substitui a anterior automaticamente, sem precisar remover a seleção antiga primeiro. O valor do campo continua sendo `number[]` (aqui sempre com 0 ou 1 item); a conversão para um id único fica por conta do consumidor, como no exemplo com `value`/`onSelectionChange` em modo standalone.",
    example: <SelecaoUnicaExample />,
    code: `const [documentoLegalId, setDocumentoLegalId] = useState<number | null>(null);

<DropdownBaseLegalSeplag
  label="Lei de isenção"
  documentos={documentosDaApi}
  tipoMap={TIPO_DOCUMENTO_MAP_DEFAULT_SEPLAG}
  maxSelecionados={1}
  value={documentoLegalId != null ? [documentoLegalId] : []}
  onSelectionChange={(selecionados) => setDocumentoLegalId(selecionados[0]?.id ?? null)}
/>

// Com react-hook-form (campo guarda um único id, não array):
<Controller
  name="leiIsencao"
  control={control}
  rules={{ validate: (value) => value != null || "O campo é obrigatório" }}
  render={({ field }) => (
    <DropdownBaseLegalSeplag
      label="Lei de isenção"
      documentos={documentosDaApi}
      maxSelecionados={1}
      value={field.value != null ? [field.value] : []}
      onSelectionChange={(selecionados) => field.onChange(selecionados[0]?.id)}
    />
  )}
/>`,
  },
];

const props: DocProp[] = [
  {
    name: "name",
    type: "Path<T>",
    required: false,
    description: "Nome do campo no formulário. Opcional para uso standalone.",
  },
  {
    name: "control",
    type: "Control<T>",
    required: false,
    description: "Control do useForm. Quando omitido (junto de `name`), funciona como standalone.",
  },
  {
    name: "documentos",
    type: "ReadonlyArray<DocumentoLegalApiSeplag>",
    required: true,
    description:
      "Lista de documentos disponíveis para seleção. Aceita o shape bruto retornado pela API (valores[].nomeCampo opcional) — o componente normaliza internamente.",
  },
  {
    name: "isLoading",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Indica que os documentos ainda estão sendo carregados (exibe estado de loading no dropdown).",
  },
  {
    name: "tipoMap",
    type: "DocumentoLegalTipoMapSeplag",
    required: false,
    description: "Mapa código → nome do tipo. Sobrescreve `TIPO_DOCUMENTO_MAP_DEFAULT_SEPLAG`.",
  },
  {
    name: "corMap",
    type: "DocumentoLegalTipoCorMapSeplag",
    required: false,
    description: "Mapa de cores por tipo. Sobrescreve `TIPO_COR_MAP_DEFAULT_SEPLAG`.",
  },
  {
    name: "label",
    type: "string",
    defaultValue: '"Documento Base Legal"',
    required: false,
    description: "Rótulo exibido acima do campo.",
  },
  {
    name: "cols",
    type: "string",
    defaultValue: '"12"',
    required: false,
    description: "Largura via grid SEPLAG.",
  },
  {
    name: "required",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Torna o campo obrigatório.",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Desabilita o campo.",
  },
  {
    name: "rules",
    type: "RegisterOptions<T, Path<T>>",
    required: false,
    description: "Validações customizadas do react-hook-form.",
  },
  {
    name: "confirmarRemocao",
    type: "boolean",
    defaultValue: "true",
    required: false,
    description:
      "Exibe o ModalDeleteSeplag de confirmação ao remover um documento da lista detalhada. Use `false` em células de grid/listagem.",
  },
  {
    name: "showAddNewLink",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description:
      'Exibe o atalho "+ Adicionar documento" (requer `addNewHref` ou `onAddNewClick`). Ative apenas em formulários.',
  },
  {
    name: "addNewHref",
    type: "string",
    required: false,
    description:
      "Rota do link de adicionar novo documento (renderizado como `<Link>`). Ignorado quando `onAddNewClick` é informado.",
  },
  {
    name: "addNewTarget",
    type: '"_self" | "_blank" | "_parent" | "_top"',
    defaultValue: '"_blank"',
    required: false,
    description: "Atributo target do link de adicionar documento. Só tem efeito no modo `addNewHref` (link).",
  },
  {
    name: "addNewLabel",
    type: "string",
    defaultValue: '"+ Adicionar documento"',
    required: false,
    description: "Texto exibido no link/botão de adicionar documento.",
  },
  {
    name: "onAddNewClick",
    type: "() => void",
    required: false,
    description:
      'Callback disparado ao clicar em "Adicionar documento", no lugar da navegação via `addNewHref`. Quando informado, o atalho vira um `<button>` (mesmo visual/posição do link) e `addNewHref`/`addNewTarget` são ignorados. Use para abrir um modal de cadastro sem navegar de rota.',
  },
  {
    name: "getOptionTitle",
    type: "(documento: NormalizedDocumentoSeplag) => string",
    required: false,
    description: 'Define o título de cada item (opções, chips e lista). Padrão: "{tipo} nº {numero}/{ano}".',
  },
  {
    name: "getOptionDescription",
    type: "(documento: NormalizedDocumentoSeplag) => string",
    required: false,
    description: "Define a descrição de cada item. Padrão: `documento.label`.",
  },
  {
    name: "onSelectionChange",
    type: "(selected: NormalizedDocumentoSeplag[]) => void",
    required: false,
    description: "Disparado quando a seleção muda, com os documentos já normalizados.",
  },
  {
    name: "maxSelecionados",
    type: "number",
    required: false,
    description:
      "Limita a quantidade de documentos selecionáveis simultaneamente. Com o valor 1, as opções do painel viram radio button e escolher uma nova substitui a anterior automaticamente. Acima de 1, novas seleções além do limite são bloqueadas com um toast de aviso.",
  },
  {
    name: "value",
    type: "readonly number[]",
    required: false,
    description:
      "Ids selecionados, usado apenas no modo standalone (sem `name`/`control`) para controlar a seleção externamente — por exemplo, via `Controller` de um campo cujo valor não é `number[]` (um único id, como em `maxSelecionados={1}`). Ignorado no modo react-hook-form, que controla o valor pelo próprio field.",
  },
  {
    name: "indicarAplicavel",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description:
      'Exibe um radio button por linha selecionada para marcar o documento "aplicável". Habilitado só com 2+ documentos selecionados (com 1 só, ele é o aplicável automaticamente).',
  },
  {
    name: "nameAplicavel",
    type: "Path<T>",
    required: false,
    description: "Nome do campo (no mesmo `control`) que guarda o id do documento aplicável. Obrigatório quando `indicarAplicavel` é usado em modo controlado.",
  },
  {
    name: "requiredAplicavel",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Torna obrigatória a marcação do documento aplicável.",
  },
  {
    name: "aplicavelRequiredMessage",
    type: "string",
    defaultValue: '"Marque qual documento é o aplicável."',
    required: false,
    description: "Mensagem de erro quando `requiredAplicavel` e nenhum documento foi marcado.",
  },
  {
    name: "aplicavelLabel",
    type: "string",
    defaultValue: '"Lei aplicável"',
    required: false,
    description: "Rótulo exibido no badge e no aria-label do radio do documento aplicável.",
  },
];

export default function DropdownBaseLegalDoc() {
  return (
    <DocPage
      title="DropdownBaseLegal"
      description="Campo de multi-seleção de documentos legais (leis, decretos, normas, portarias...) com busca, badges e opção de marcar qual documento é o 'aplicável' via radio button. Integrado com react-hook-form."
      badge="Estável"
      since="v0.0.1"
      sections={sections}
      props={props}
    />
  );
}
