import { useForm } from "react-hook-form";
import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { NumberFieldSeplag } from "@componentes/Fields";
import "primereact/resources/themes/saga-blue/theme.css";

const noError = () => null;

function BasicExample() {
  const { control } = useForm({
    defaultValues: {
      qtd: null,
      idade: null,
      valor: null,
      salario: null,
      distancia: null,
      decimal_ptbr: null,
    },
  });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <NumberFieldSeplag
        name="qtd"
        control={control}
        label="Quantidade"
        cols="12 6"
        getFormErrorMessage={noError}
      />
      <NumberFieldSeplag
        name="idade"
        control={control}
        label="Idade (0–120)"
        cols="12 6"
        min={0}
        max={120}
        getFormErrorMessage={noError}
      />
      <NumberFieldSeplag
        name="valor"
        control={control}
        label="Valor (2 decimais)"
        cols="12 6"
        minFractionDigits={2}
        maxFractionDigits={2}
        getFormErrorMessage={noError}
      />
      <NumberFieldSeplag
        name="salario"
        control={control}
        label="Salário (moeda)"
        cols="12 6"
        mode="currency"
        currency="BRL"
        locale="pt-BR"
        getFormErrorMessage={noError}
      />
      <NumberFieldSeplag
        name="decimal_ptbr"
        control={control}
        label="Decimal pt-BR (1,00)"
        cols="12 6"
        locale="pt-BR"
        minFractionDigits={2}
        maxFractionDigits={2}
        getFormErrorMessage={noError}
      />
      <NumberFieldSeplag
        name="distancia"
        control={control}
        label="Distância (sufixo)"
        cols="12 6"
        suffix=" km"
        minFractionDigits={1}
        maxFractionDigits={1}
        getFormErrorMessage={noError}
      />
    </div>
  );
}

function ReadOnlyExample() {
  const { control } = useForm({ defaultValues: { atual: 2, editavel: 0, bloqueado: 7 } });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <NumberFieldSeplag
        name="atual"
        control={control}
        label="Somente leitura"
        cols="12 4"
        readOnly
      />
      <NumberFieldSeplag
        name="editavel"
        control={control}
        label="Editável (comparação)"
        cols="12 4"
        min={0}
      />
      <NumberFieldSeplag
        name="bloqueado"
        control={control}
        label="Desabilitado (comparação)"
        cols="12 4"
        disabled
      />
    </div>
  );
}

const ORGAOS_EXEMPLO = [
  { id: 1, nome: "SEMA", atual: 2 },
  { id: 2, nome: "SEPLAG", atual: 2 },
  { id: 3, nome: "SEFAZ", atual: 1 },
];

function CelulaTabelaExample() {
  const { control, watch } = useForm({
    defaultValues: {
      itens: ORGAOS_EXEMPLO.map((orgao) => ({ atual: orgao.atual, adicionar: 0 })),
    },
  });
  const itens = watch("itens");

  return (
    <div style={{ width: "100%" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid var(--surface-border)" }}>
            <th style={{ padding: "0.5rem" }}>Órgão</th>
            <th style={{ padding: "0.5rem", width: "10rem" }}>Quantidade atual</th>
            <th style={{ padding: "0.5rem", width: "10rem" }}>A adicionar</th>
          </tr>
        </thead>
        <tbody>
          {ORGAOS_EXEMPLO.map((orgao, indice) => (
            <tr key={orgao.id} style={{ borderBottom: "1px solid var(--surface-border)" }}>
              <td style={{ padding: "0.5rem", fontWeight: 600 }}>{orgao.nome}</td>
              <td style={{ padding: "0.5rem" }}>
                <NumberFieldSeplag
                  name={`itens.${indice}.atual`}
                  control={control}
                  semMoldura
                  readOnly
                />
              </td>
              <td style={{ padding: "0.5rem" }}>
                <NumberFieldSeplag
                  name={`itens.${indice}.adicionar`}
                  control={control}
                  semMoldura
                  min={0}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ fontSize: "0.8125rem", margin: "0.75rem 0 0.25rem", color: "#6b7280" }}>
        Estado do formulário — as colunas somente-leitura continuam presentes:
      </p>
      <pre
        style={{
          margin: 0,
          padding: "0.75rem",
          background: "var(--surface-100, #f1f5f9)",
          borderRadius: 6,
          fontSize: "0.75rem",
          overflowX: "auto",
        }}
      >
        {JSON.stringify(itens, null, 2)}
      </pre>
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description: "Campo numérico inteiro sem agrupamento (sem separador de milhares).",
    example: <BasicExample />,
    code: `import { useForm } from "react-hook-form";
import { NumberFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm();

<NumberFieldSeplag
  name="qtd"
  control={control}
  label="Quantidade"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>

// Com limites min/max
<NumberFieldSeplag
  name="idade"
  control={control}
  label="Idade"
  min={0}
  max={120}
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>

// Decimal pt-BR sem símbolo (ex: 1,00)
<NumberFieldSeplag
  name="decimal_ptbr"
  control={control}
  label="Decimal pt-BR"
  cols="12 6"
  locale="pt-BR"
  minFractionDigits={2}
  maxFractionDigits={2}
  getFormErrorMessage={(name) => errors[name]?.message}
/>

// Com casas decimais fixas
<NumberFieldSeplag
  name="valor"
  control={control}
  label="Valor (2 decimais)"
  cols="12 6"
  minFractionDigits={2}
  maxFractionDigits={2}
  getFormErrorMessage={(name) => errors[name]?.message}
/>

// Modo moeda
<NumberFieldSeplag
  name="salario"
  control={control}
  label="Salário"
  cols="12 6"
  mode="currency"
  currency="BRL"
  locale="pt-BR"
  getFormErrorMessage={(name) => errors[name]?.message}
/>

// Com sufixo
<NumberFieldSeplag
  name="distancia"
  control={control}
  label="Distância"
  cols="12 6"
  suffix=" km"
  minFractionDigits={1}
  maxFractionDigits={1}
  getFormErrorMessage={(name) => errors[name]?.message}
/>`,
  },
  {
    title: "Somente leitura (readOnly)",
    description:
      "readOnly exibe o valor sem permitir alteração, mas — diferente de disabled — o campo continua focável pelo Tab e é anunciado por leitores de tela. Use quando o número existe para o usuário ler e decidir o que preencher em outro campo. Navegue com Tab pelos três abaixo: o desabilitado é pulado, o somente-leitura não.",
    example: <ReadOnlyExample />,
    code: `// Somente leitura: focável, anunciado, e o valor continua no payload
<NumberFieldSeplag
  name="quantidadeAtual"
  control={control}
  label="Quantidade atual"
  readOnly
/>

// Desabilitado: sai da navegação por teclado
<NumberFieldSeplag
  name="quantidadeAtual"
  control={control}
  label="Quantidade atual"
  disabled
/>

// Quando as duas são passadas, disabled prevalece.`,
  },
  {
    title: "Dentro de célula de tabela (semMoldura)",
    description:
      "semMoldura remove o rótulo e a classe de grid, deixando só o campo — o rótulo passa a ser o <th> da coluna. Combinado com readOnly, permite uma coluna de leitura ao lado de uma editável, ambas registradas no mesmo formulário. Edite a coluna 'A adicionar' e veja o estado do formulário abaixo: as colunas somente-leitura continuam lá.",
    example: <CelulaTabelaExample />,
    code: `const { control } = useForm({
  defaultValues: { itens: orgaos.map((o) => ({ atual: o.atual, adicionar: 0 })) },
});

<tbody>
  {orgaos.map((orgao, indice) => (
    <tr key={orgao.id}>
      <td>{orgao.nome}</td>
      <td>
        <NumberFieldSeplag
          name={\`itens.\${indice}.atual\`}
          control={control}
          semMoldura
          readOnly
        />
      </td>
      <td>
        <NumberFieldSeplag
          name={\`itens.\${indice}.adicionar\`}
          control={control}
          semMoldura
          min={0}
        />
      </td>
    </tr>
  ))}
</tbody>`,
  },
];

const props: DocProp[] = [
  {
    name: "name",
    type: "Path<T>",
    required: true,
    description: "Nome do campo no formulário.",
  },
  {
    name: "control",
    type: "Control<T>",
    required: false,
    description: "Objeto control do useForm. Quando omitido, funciona como input simples.",
  },
  {
    name: "rules",
    type: "RegisterOptions<T, Path<T>>",
    required: false,
    description: "Validações customizadas (required, minLength, validate, etc).",
  },
  {
    name: "getFormErrorMessage",
    type: "(name: string) => ReactNode",
    required: false,
    deprecated: true,
    deprecationMessage:
      "DEPRECATED — Use react-hook-form error handling (fieldState.error) ou passe validações via `rules`",
    description:
      "Compatibilidade legada: quando retorna um nó válido, tem prioridade sobre o erro interno do react-hook-form.",
  },
  {
    name: "label",
    type: "string",
    required: false,
    description: "Rótulo exibido acima do campo.",
  },
  {
    name: "cols",
    type: "string",
    defaultValue: '"12 6"',
    required: false,
    description: "Largura via grid SEPLAG.",
  },
  {
    name: "placeholder",
    type: "string",
    required: false,
    description: "Texto de dica exibido quando o campo está vazio.",
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
    name: "readOnly",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description:
      "Exibe o valor sem permitir alteração. Diferente de disabled, o campo continua " +
      "focável e é anunciado por leitores de tela — use quando o valor precisa ser lido " +
      "para embasar o preenchimento de outro campo. Se disabled também for passado, ele prevalece.",
  },
  {
    name: "semMoldura",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description:
      "Renderiza só o campo, sem rótulo e sem a classe de grid derivada de cols. " +
      "Use dentro de célula de tabela ou grupo inline, onde o rótulo é do contexto.",
  },
  {
    name: "visible",
    type: "boolean",
    defaultValue: "true",
    required: false,
    description: "Quando false, oculta o campo.",
  },
  {
    name: "min",
    type: "number",
    required: false,
    description: "Valor mínimo permitido.",
  },
  {
    name: "max",
    type: "number",
    required: false,
    description: "Valor máximo permitido.",
  },
  {
    name: "prefix",
    type: "string",
    required: false,
    description: 'Texto exibido antes do valor, ex: "R$ ".',
  },
  {
    name: "suffix",
    type: "string",
    required: false,
    description: 'Texto exibido após o valor, ex: " km".',
  },
  {
    name: "locale",
    type: "string",
    required: false,
    description: 'Locale de formatação numérica, ex: "pt-BR".',
  },
  {
    name: "mode",
    type: '"decimal" | "currency"',
    defaultValue: '"decimal"',
    required: false,
    description: 'Modo de formatação. Use "currency" junto com a prop currency.',
  },
  {
    name: "currency",
    type: "string",
    required: false,
    description: 'Código ISO 4217 da moeda, ex: "BRL". Obrigatório quando mode="currency".',
  },
  {
    name: "minFractionDigits",
    type: "number",
    required: false,
    description:
      "Número mínimo de casas decimais exibidas. Quando omitido, o campo trata o valor como inteiro.",
  },
  {
    name: "maxFractionDigits",
    type: "number",
    required: false,
    description: "Número máximo de casas decimais permitidas.",
  },
  {
    name: "inputStyle",
    type: "CSSProperties",
    required: false,
    description: "Estilo inline aplicado ao input interno.",
  },
  {
    name: "autoComplete",
    type: "string",
    required: false,
    description:
      "Atributo HTML autocomplete repassado ao input. Por padrão o autocomplete do navegador " +
      'fica ativo; passe autoComplete="off" para desativá-lo.',
  },
];

export default function NumberFieldDoc() {
  return (
    <DocPage
      title="NumberField"
      description="Campo numérico sem agrupamento de dígitos, integrado com react-hook-form. Suporta limites mínimo/máximo e configuração de casas decimais."
      badge="Estável"
      since="v0.0.1"
      sections={sections}
      props={props}
    />
  );
}
