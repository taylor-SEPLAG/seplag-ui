import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { CardRadioGroupSeplag } from "@componentes/CardRadioGroupSeplag";
import { useForm } from "react-hook-form";
import "primereact/resources/themes/saga-blue/theme.css";

interface OperacaoFormValues {
  tipoOperacao: string;
}

const OPCOES_OPERACAO = [
  {
    value: "AMPLIACAO",
    icon: "pi pi-plus-circle",
    label: "Ampliação legal",
    descricao: "Cria novos identificadores após o último sequencial, sem reutilizar códigos.",
  },
  {
    value: "REDUCAO",
    icon: "pi pi-minus-circle",
    label: "Redução legal",
    descricao: "Reduz somente vagas disponíveis, regulares e sem comprometimento ativo.",
  },
  {
    value: "TRANSFORMACAO",
    icon: "pi pi-sync",
    label: "Transformação",
    descricao: "Preserva a origem no histórico e gera vagas numeradas para o cargo de destino.",
  },
] as const;

function ExemploBasico() {
  const { control } = useForm<OperacaoFormValues>({ defaultValues: { tipoOperacao: "AMPLIACAO" } });

  return (
    <CardRadioGroupSeplag
      name="tipoOperacao"
      control={control}
      options={OPCOES_OPERACAO}
      ariaLabel="Tipo de operação legal"
    />
  );
}

function ExemploComTooltip() {
  const { control } = useForm<OperacaoFormValues>({ defaultValues: { tipoOperacao: "" } });

  return (
    <CardRadioGroupSeplag
      name="tipoOperacao"
      control={control}
      itemColClassName="col-12 sm:col-6"
      options={[
        { ...OPCOES_OPERACAO[0], tooltip: "Disponível apenas para quadros ativos." },
        { ...OPCOES_OPERACAO[1], tooltip: "Requer vagas disponíveis sem comprometimento." },
      ]}
      ariaLabel="Tipo de operação legal"
    />
  );
}

function ExemploDisabled() {
  const { control } = useForm<OperacaoFormValues>({ defaultValues: { tipoOperacao: "AMPLIACAO" } });

  return (
    <CardRadioGroupSeplag
      name="tipoOperacao"
      control={control}
      options={OPCOES_OPERACAO}
      disabled
      ariaLabel="Tipo de operação legal (desabilitado)"
    />
  );
}

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description:
      "Radio-group renderizado como cards selecionáveis (ícone + título + descrição), integrado ao react-hook-form via Controller. Cada opção é mutuamente exclusiva — clicar seleciona e atualiza o campo do formulário.",
    example: <ExemploBasico />,
    code: `import { CardRadioGroupSeplag } from "@seplag/ui-lib-react-18";

const OPCOES_OPERACAO = [
  { value: "AMPLIACAO", icon: "pi pi-plus-circle", label: "Ampliação legal", descricao: "Cria novos identificadores após o último sequencial, sem reutilizar códigos." },
  { value: "REDUCAO", icon: "pi pi-minus-circle", label: "Redução legal", descricao: "Reduz somente vagas disponíveis, regulares e sem comprometimento ativo." },
  { value: "TRANSFORMACAO", icon: "pi pi-sync", label: "Transformação", descricao: "Preserva a origem no histórico e gera vagas numeradas para o cargo de destino." },
] as const;

<CardRadioGroupSeplag
  name="tipoOperacao"
  control={control}
  options={OPCOES_OPERACAO}
  ariaLabel="Tipo de operação legal"
/>`,
  },
  {
    title: "Colunas customizadas + tooltip",
    description:
      'itemColClassName controla o breakpoint de coluna por item (default "col-12 sm:col-6 lg:col-4": 1 → 2 → 3 por linha). tooltip por opção exibe contexto extra ao passar o mouse.',
    example: <ExemploComTooltip />,
    code: `<CardRadioGroupSeplag
  name="tipoOperacao"
  control={control}
  itemColClassName="col-12 sm:col-6"
  options={[
    { value: "AMPLIACAO", icon: "...", label: "Ampliação legal", descricao: "...", tooltip: "Disponível apenas para quadros ativos." },
    { value: "REDUCAO", icon: "...", label: "Redução legal", descricao: "...", tooltip: "Requer vagas disponíveis sem comprometimento." },
  ]}
/>`,
  },
  {
    title: "Desabilitado",
    description: "disabled=true bloqueia o clique em todas as opções e aplica opacity/cursor visual.",
    example: <ExemploDisabled />,
    code: `<CardRadioGroupSeplag name="tipoOperacao" control={control} options={OPCOES_OPERACAO} disabled />`,
  },
];

const props: DocProp[] = [
  { name: "name", type: "Path<T>", required: true, description: "Nome do campo no formulário (react-hook-form)." },
  { name: "control", type: "Control<T>", required: true, description: "Control do useForm/react-hook-form." },
  {
    name: "options",
    type: "readonly CardRadioGroupOptionSeplag<V>[]",
    required: true,
    description: "Lista de opções: { value, icon, label, descricao, tooltip? }.",
  },
  { name: "disabled", type: "boolean", required: false, description: "Bloqueia o clique em todas as opções." },
  { name: "ariaLabel", type: "string", required: false, description: 'Rótulo de acessibilidade do role="radiogroup".' },
  {
    name: "itemColClassName",
    type: "string",
    defaultValue: '"col-12 sm:col-6 lg:col-4"',
    required: false,
    description: "Classe de coluna PrimeFlex por item — 1 por linha em telas estreitas, 2 em tablets, 3 em desktop.",
  },
];

export default function CardRadioGroupDoc() {
  return (
    <DocPage
      title="CardRadioGroupSeplag"
      description="Radio-group de cards selecionáveis (ícone + título + descrição), integrado ao react-hook-form. Uso: seleção de uma entre N opções mutuamente exclusivas com contexto textual por opção (tipo de operação, categoria, modalidade)."
      badge="Estável"
      since="v0.1.123"
      importStatement={`import { CardRadioGroupSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
