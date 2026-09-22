import { MultiSelectFieldSeplag } from "@componentes/Fields";
import "primereact/resources/themes/saga-blue/theme.css";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ToastProviderSeplag } from "../../../provider/printToast";
import { DocPage, type DocProp, type DocSection } from "../../components/DocPage";

const noError = () => null;

const cargos = [
  { label: "Analista", value: 1 },
  { label: "Técnico", value: 2 },
  { label: "Assistente", value: 3 },
  { label: "Coordenador", value: 4 },
  { label: "Gerente", value: 5 },
];

const CIDADES_BASE = [
  "Belo Horizonte",
  "Contagem",
  "Betim",
  "Uberlândia",
  "Juiz de Fora",
  "Montes Claros",
  "Ribeirão das Neves",
  "Uberaba",
  "Governador Valadares",
  "Ipatinga",
  "Sete Lagoas",
  "Divinópolis",
  "Santa Luzia",
  "Ibirité",
  "Poços de Caldas",
  "Patos de Minas",
  "Pouso Alegre",
  "Teófilo Otoni",
  "Barbacena",
  "Sabará",
  "Cuiabá",
  "Várzea Grande",
  "Rondonópolis",
  "Sinop",
  "Tangará da Serra",
  "Cáceres",
  "Sorriso",
  "Lucas do Rio Verde",
  "Primavera do Leste",
  "Barra do Garças",
  "Alta Floresta",
  "Nova Mutum",
  "Guarantã do Norte",
  "Colíder",
  "Juína",
  "Juara",
  "Nobres",
  "Diamantino",
  "Chapada dos Guimarães",
  "Campo Verde",
];

function gerarOpcoes(quantidade: number) {
  return Array.from({ length: quantidade }, (_, i) => ({
    id: i + 1,
    label:
      `${CIDADES_BASE[i % CIDADES_BASE.length]} ${Math.floor(i / CIDADES_BASE.length) > 0 ? Math.floor(i / CIDADES_BASE.length) + 1 : ""}`.trim(),
    value: i + 1,
  }));
}

const empregadoresExemplo = [
  {
    idenEmpregador: 1,
    nomeRazaoSocial: "SECRETARIA DE ESTADO DE PLANEJAMENTO E GESTAO MT",
    nomeFantasia: "SEPLAG",
    sigla: "SEPLAG",
    numrCnpj: "58337873000174",
  },
  {
    idenEmpregador: 2,
    nomeRazaoSocial: "FUNDACAO NOVA CHANCE",
    nomeFantasia: "FUNDACAO NOVA CHANCE",
    sigla: "FUNAC",
    numrCnpj: "09490144000148",
  },
  {
    idenEmpregador: 3,
    nomeRazaoSocial: "SECRETARIA DE ESTADO DE CIEN, TEC E INOVACAO DE MT",
    nomeFantasia: "SECITECI",
    sigla: "SECITECI",
    numrCnpj: "58129869000110",
  },
  {
    idenEmpregador: 4,
    nomeRazaoSocial: "DEPARTAMENTO ESTADUAL DE TRANSITO",
    nomeFantasia: "DEPARTAMENTO ESTADUAL DE TRANSITO",
    sigla: "DETRAN",
    numrCnpj: "03829702000170",
  },
];

function FilterFieldsExample() {
  const { control } = useForm({ defaultValues: { empregadores: [] } });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <MultiSelectFieldSeplag
        name="empregadores"
        control={control}
        label="Empregadores (busca por nome, sigla ou CNPJ)"
        options={empregadoresExemplo}
        optionLabel="nomeRazaoSocial"
        optionValue="idenEmpregador"
        dataKey="idenEmpregador"
        filterFields={["nomeFantasia", "sigla", "numrCnpj"]}
        cols="12 8"
        placeholder="Digite nome, sigla ou CNPJ..."
      />
      <p style={{ fontSize: "0.82rem", color: "#6b7280", margin: 0 }}>
        Digite "detran", "funac" ou "58337873000174" — todos encontram o registro certo, mesmo o
        texto não aparecendo no optionLabel exibido.
      </p>
    </div>
  );
}

function PerformancePlayground() {
  const [quantidade, setQuantidade] = useState(50);
  const [threshold, setThreshold] = useState(200);
  const { control } = useForm({ defaultValues: { municipios: [] } });
  const opcoes = useMemo(() => gerarOpcoes(quantidade), [quantidade]);

  const virtualAtivo = quantidade > threshold;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <label htmlFor="pg-quantidade" style={{ fontWeight: 600, minWidth: 160 }}>
          Quantidade de registros:
        </label>
        <input
          id="pg-quantidade"
          type="range"
          min={10}
          max={1500}
          step={10}
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value))}
          style={{ width: 240 }}
        />
        <span
          style={{
            fontWeight: 700,
            fontSize: "1.1rem",
            minWidth: 50,
            color: virtualAtivo ? "#d97706" : "#16a34a",
          }}
        >
          {quantidade}
        </span>
        <span
          style={{
            fontSize: "0.8rem",
            padding: "2px 10px",
            borderRadius: 12,
            background: virtualAtivo ? "#fef3c7" : "#dcfce7",
            color: virtualAtivo ? "#92400e" : "#166534",
            fontWeight: 600,
          }}
        >
          {virtualAtivo ? "⚡ Virtual Scroll ativo" : "✓ Renderização normal"}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <label htmlFor="pg-threshold" style={{ fontWeight: 600, minWidth: 160 }}>
          virtualScrollThreshold:
        </label>
        <input
          id="pg-threshold"
          type="range"
          min={10}
          max={1500}
          step={10}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          style={{ width: 240 }}
        />
        <span style={{ fontWeight: 700, fontSize: "1.1rem", minWidth: 50 }}>{threshold}</span>
      </div>

      <div className="grid" style={{ width: "100%" }}>
        <MultiSelectFieldSeplag
          name="municipios"
          control={control}
          label={`Municípios (${quantidade} opções)`}
          options={opcoes}
          optionLabel="label"
          optionValue="value"
          dataKey="id"
          cols="12 8"
          placeholder="Selecione municípios..."
          selectedItemsLabel="{0} municípios selecionados"
          virtualScrollThreshold={threshold}
        />
      </div>

      <p style={{ fontSize: "0.82rem", color: "#6b7280", margin: 0 }}>
        Arraste o primeiro slider para simular listas com diferentes volumes, e o segundo para
        ajustar o limiar de ativação do virtual scroll via <code>virtualScrollThreshold</code>{" "}
        (padrão 200). Abaixo do limiar, o painel encolhe para caber exatamente a quantidade de
        resultados filtrados (até um teto de 250px).
      </p>

      <pre
        style={{
          margin: 0,
          padding: "0.75rem 1rem",
          borderRadius: 8,
          background: "#0f172a",
          color: "#e2e8f0",
          fontSize: "0.78rem",
          overflowX: "auto",
        }}
      >
        <code>{`<MultiSelectFieldSeplag
  name="municipios"
  control={control}
  label="Municípios"
  options={municipios} // ${quantidade} opções
  optionLabel="label"
  optionValue="value"
  virtualScrollThreshold={${threshold}}
/>
// ${virtualAtivo ? "Virtual Scroll ativo" : "Renderização normal"} (${quantidade} > ${threshold} = ${virtualAtivo})`}</code>
      </pre>
    </div>
  );
}

function ReadOnlyExample() {
  const { control } = useForm({
    defaultValues: { cargos_ro: [1, 3] },
  });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <MultiSelectFieldSeplag
        name="cargos_ro"
        control={control}
        label="Cargos (somente leitura)"
        options={cargos}
        optionLabel="label"
        optionValue="value"
        cols="12 6"
        readOnly
      />
    </div>
  );
}

// Labels propositalmente longos (categorias de trabalhador do eSocial) para
// evidenciar confinamento, scroll horizontal e truncamento.
const categoriasESocial = [
  {
    id: 101,
    label:
      "101 - Empregado - Geral, inclusive o empregado público da administração direta ou indireta contratado pela CLT",
    value: 101,
  },
  { id: 104, label: "104 - Empregado - Aprendiz", value: 104 },
  { id: 105, label: "105 - Empregado - Doméstico", value: 105 },
  {
    id: 106,
    label:
      "106 - Trabalhador temporário - Lei 6.019/74, com vínculo empregatício com empresa de trabalho temporário",
    value: 106,
  },
  { id: 111, label: "111 - Empregado - Contrato de trabalho intermitente", value: 111 },
  {
    id: 711,
    label:
      "711 - Contribuinte individual - Diretor não empregado, com FGTS, sem contrato de trabalho",
    value: 711,
  },
  {
    id: 721,
    label: "721 - Contribuinte individual - Diretor não empregado e demais dirigentes, sem FGTS",
    value: 721,
  },
];

function PanelScopeExample() {
  const { control } = useForm({ defaultValues: { cat_body: [], cat_confined: [] } });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <MultiSelectFieldSeplag
        name="cat_body"
        control={control}
        label="panelScope='body' (padrão)"
        options={categoriasESocial}
        optionLabel="label"
        optionValue="value"
        dataKey="id"
        cols="12 6"
        placeholder="Selecione categorias..."
      />
      <MultiSelectFieldSeplag
        name="cat_confined"
        control={control}
        label="panelScope='confined'"
        options={categoriasESocial}
        optionLabel="label"
        optionValue="value"
        dataKey="id"
        cols="12 6"
        panelScope="confined"
        placeholder="Selecione categorias..."
      />
    </div>
  );
}

function TruncateExample() {
  const { control } = useForm({ defaultValues: { cat_scroll: [], cat_truncate: [] } });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <MultiSelectFieldSeplag
        name="cat_scroll"
        control={control}
        label="truncateOptionLabel={false} (scroll horizontal)"
        options={categoriasESocial}
        optionLabel="label"
        optionValue="value"
        dataKey="id"
        cols="12 6"
        panelScope="confined"
        placeholder="Selecione categorias..."
      />
      <MultiSelectFieldSeplag
        name="cat_truncate"
        control={control}
        label="truncateOptionLabel={true} (reticências + tooltip)"
        options={categoriasESocial}
        optionLabel="label"
        optionValue="value"
        dataKey="id"
        cols="12 6"
        panelScope="confined"
        truncateOptionLabel
        placeholder="Selecione categorias..."
      />
    </div>
  );
}

function DisabledWithValuesExample() {
  const { control } = useForm({
    defaultValues: { cargos_bloqueado_com_valor: [1, 4], cargos_bloqueado_vazio: [] },
  });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <MultiSelectFieldSeplag
        name="cargos_bloqueado_com_valor"
        control={control}
        label="Cargos (bloqueado, com valores herdados)"
        options={cargos}
        optionLabel="label"
        optionValue="value"
        cols="12 6"
        disabled
      />
      <MultiSelectFieldSeplag
        name="cargos_bloqueado_vazio"
        control={control}
        label="Cargos (bloqueado, sem valores)"
        options={cargos}
        optionLabel="label"
        optionValue="value"
        cols="12 6"
        disabled
      />
    </div>
  );
}

function DisabledOptionsExample() {
  const { control } = useForm({ defaultValues: { cargos_parcial: [2, 3] } });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <MultiSelectFieldSeplag
        name="cargos_parcial"
        control={control}
        label="Cargos (com opções bloqueadas)"
        options={cargos}
        optionLabel="label"
        optionValue="value"
        optionsDisabled={[3, 5]}
        cols="12 6"
      />
    </div>
  );
}

function ShowClearExample() {
  const { control } = useForm({ defaultValues: { cargos_clear: [1, 2], cargos_no_clear: [1, 2] } });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <MultiSelectFieldSeplag
        name="cargos_clear"
        control={control}
        label="showClear (padrão)"
        options={cargos}
        optionLabel="label"
        optionValue="value"
        cols="12 6"
      />
      <MultiSelectFieldSeplag
        name="cargos_no_clear"
        control={control}
        label="showClear={false}"
        options={cargos}
        optionLabel="label"
        optionValue="value"
        showClear={false}
        cols="12 6"
      />
    </div>
  );
}

const cargosComInativos = [
  { label: "Coordenador", value: 4 },
  { label: "Analista", value: 1 },
  { label: "Gerente", value: 5, inactive: true },
  { label: "Assistente", value: 3 },
  { label: "Técnico", value: 2, inactive: true },
];

function InactiveOptionsExample() {
  const { control } = useForm({ defaultValues: { cargos_inativos: [] } });
  return (
    <ToastProviderSeplag>
      <div className="grid" style={{ width: "100%" }}>
        <MultiSelectFieldSeplag
          name="cargos_inativos"
          control={control}
          label="Cargos (com opções inativas)"
          options={cargosComInativos}
          optionLabel="label"
          optionValue="value"
          cols="12 6"
        />
      </div>
    </ToastProviderSeplag>
  );
}

function InactiveOptionsNoSortExample() {
  const { control } = useForm({ defaultValues: { cargos_inativos_sem_ordem: [] } });
  return (
    <ToastProviderSeplag>
      <div className="grid" style={{ width: "100%" }}>
        <MultiSelectFieldSeplag
          name="cargos_inativos_sem_ordem"
          control={control}
          label="Cargos (ordem original, sem ordenação alfabética)"
          options={cargosComInativos}
          optionLabel="label"
          optionValue="value"
          cols="12 6"
          sortAlphabetically={false}
        />
      </div>
    </ToastProviderSeplag>
  );
}

const cargosComDesligados = [
  { label: "Analista", value: 1, dataDesligamento: null },
  { label: "Técnico", value: 2, dataDesligamento: "2024-01-10" },
  { label: "Assistente", value: 3, dataDesligamento: null },
  { label: "Coordenador", value: 4, dataDesligamento: "2023-08-22" },
  { label: "Gerente", value: 5, dataDesligamento: null },
];

function ExcludeByFieldExample() {
  const { control } = useForm({ defaultValues: { cargos_excluidos: [] } });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <MultiSelectFieldSeplag
        name="cargos_excluidos"
        control={control}
        label="Cargos (desligados nunca aparecem)"
        options={cargosComDesligados}
        optionLabel="label"
        optionValue="value"
        excludeIf={(item) => Boolean(item.dataDesligamento)}
        cols="12 6"
      />
      <p style={{ fontSize: "0.82rem", color: "#6b7280", margin: 0 }}>
        "Técnico" e "Coordenador" têm dataDesligamento preenchida e por isso o excludeIf os remove
        antes de tudo — diferente de optionsDisabled (aparece esmaecido) ou inactive (aparece com
        badge), aqui o registro some completamente do painel e da busca.
      </p>
    </div>
  );
}

function ControlledExample() {
  const [value, setValue] = useState<number[]>([1]);
  return (
    <div className="grid" style={{ width: "100%" }}>
      <MultiSelectFieldSeplag
        name="cargos_controlado"
        label="Cargos (sem react-hook-form)"
        options={cargos}
        optionLabel="label"
        optionValue="value"
        value={value}
        onChange={setValue}
        cols="12 6"
      />
      <p style={{ fontSize: "0.82rem", color: "#6b7280", margin: 0 }}>
        Selecionado: {JSON.stringify(value)}
      </p>
    </div>
  );
}

const cargosComBadgeCustomizado = [
  { label: "Analista", value: 1 },
  {
    label: "Técnico",
    value: 2,
    badgeLabel: "Agendado",
    badgeVariant: "warning" as const,
    badgeToastMessage: "Este cargo entra em vigor numa data futura.",
  },
  { label: "Assistente", value: 3 },
  { label: "Coordenador", value: 4, badgeLabel: "Extinto", badgeVariant: "error" as const },
];

function CustomBadgeExample() {
  const { control } = useForm({ defaultValues: { cargos_badge: [] } });
  return (
    <ToastProviderSeplag>
      <div className="grid" style={{ width: "100%" }}>
        <MultiSelectFieldSeplag
          name="cargos_badge"
          control={control}
          label="Cargos (badge customizado por opção)"
          options={cargosComBadgeCustomizado}
          optionLabel="label"
          optionValue="value"
          cols="12 6"
        />
      </div>
    </ToastProviderSeplag>
  );
}

function BasicExample() {
  const { control } = useForm({ defaultValues: { cargos: [], perfis: [] } });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <MultiSelectFieldSeplag
        name="cargos"
        control={control}
        label="Cargos"
        options={cargos}
        optionLabel="label"
        optionValue="value"
        cols="12 6"
        getFormErrorMessage={noError}
      />
      <MultiSelectFieldSeplag
        name="perfis"
        control={control}
        label="Perfis (chips)"
        options={cargos}
        optionLabel="label"
        optionValue="value"
        display="chip"
        cols="12 6"
        getFormErrorMessage={noError}
      />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Sobre o componente",
    description:
      "O MultiSelectFieldSeplag é um wrapper do MultiSelect do PrimeReact que padroniza a " +
      "seleção múltipla no design system. Integra-se ao react-hook-form pelo ramo `control` " +
      "(via Controller) e também funciona em modo controlado (`value`/`onChange`) quando o " +
      "control é omitido. O rótulo e a largura em grid vêm do RotuloSeplag (prop `cols`), e o " +
      "tratamento de erro usa FieldError / getFormErrorMessage. A busca é acento-insensível: o " +
      'texto das opções é pré-normalizado uma vez (`filterBy="_search"`), evitando custo de ' +
      "normalização a cada tecla; use `filterFields` para incluir outros campos (sigla, CNPJ, " +
      "etc.) nessa busca, além de optionLabel. Acima de virtualScrollThreshold opções (200 por " +
      "padrão) o virtual scroller é ativado automaticamente (itemSize fixo), mantendo o " +
      "desempenho com listas grandes (1500+ itens); abaixo disso o painel encolhe conforme a " +
      "quantidade de itens filtrados, até um teto de 250px. As props `panelScope` e " +
      "`truncateOptionLabel` controlam o comportamento do painel aberto.",
    example: null,
    code: "",
  },
  {
    title: "Escopo do painel — panelScope",
    description:
      'Por padrão (`panelScope="body"`) o painel é anexado ao document.body, podendo estourar a ' +
      'largura do input. Com `panelScope="confined"` o painel é anexado ao próprio container ' +
      '(appendTo="self") e travado em 100% da largura do campo. Atenção: no modo confined o ' +
      "painel pode ser cortado por um ancestral com overflow: hidden/auto (modal, card, célula " +
      "de tabela). Compare os dois campos abaixo abrindo cada um.",
    example: <PanelScopeExample />,
    code: `// Padrão: painel no body (comportamento atual)
<MultiSelectFieldSeplag
  name="categorias"
  control={control}
  label="Categorias"
  options={categorias}
  optionLabel="label"
  optionValue="value"
/>

// Confinado: painel travado em 100% da largura do input
<MultiSelectFieldSeplag
  name="categorias"
  control={control}
  label="Categorias"
  options={categorias}
  optionLabel="label"
  optionValue="value"
  panelScope="confined"
/>`,
  },
  {
    title: "Truncamento do label — truncateOptionLabel",
    description:
      "Com `truncateOptionLabel={false}` (padrão) o texto longo de cada opção é lido por scroll " +
      "horizontal. Com `truncateOptionLabel={true}` o texto é truncado com reticências calculadas " +
      "pela largura real e o texto completo aparece no hover (atributo title nativo). Funciona " +
      'melhor junto de panelScope="confined", que dá largura definida ao painel.',
    example: <TruncateExample />,
    code: `// Scroll horizontal (padrão)
<MultiSelectFieldSeplag
  name="categorias"
  control={control}
  options={categorias}
  optionLabel="label"
  optionValue="value"
  panelScope="confined"
/>

// Reticências + tooltip no hover
<MultiSelectFieldSeplag
  name="categorias"
  control={control}
  options={categorias}
  optionLabel="label"
  optionValue="value"
  panelScope="confined"
  truncateOptionLabel
/>`,
  },
  {
    title: "Uso básico",
    description:
      "Seleção múltipla com filtro. Suporta display em texto separado por vírgula ou em chips.",
    example: <BasicExample />,
    code: `import { useForm } from "react-hook-form";
import { MultiSelectFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm();

// Display padrão (vírgula)
<MultiSelectFieldSeplag
  name="cargos"
  control={control}
  label="Cargos"
  options={[{ label: "Analista", value: 1 }]}
  optionLabel="label"
  optionValue="value"
  cols="12 6"
/>

// Display em chips
<MultiSelectFieldSeplag
  name="perfis"
  control={control}
  label="Perfis"
  options={[{ label: "Admin", value: 1 }]}
  optionLabel="label"
  optionValue="value"
  display="chip"
  cols="12 6"
/>`,
  },
  {
    title: "Performance — virtual scroll automático",
    description:
      "Arraste o slider para simular listas com diferentes volumes. Por padrão, acima de 200 registros o virtual scroll é ativado automaticamente, sem necessidade de nenhuma prop extra. Use virtualScrollThreshold para ajustar esse limiar por instância. Abaixo do limite, o painel encolhe (via max-height) para caber exatamente a quantidade de itens visíveis, incluindo quando o filtro reduz a lista a poucos resultados.",
    example: <PerformancePlayground />,
    code: `// Por padrão não é necessário configurar nada — o componente decide sozinho.
// Com até 200 opções: renderização normal, painel encolhe conforme o filtro.
// Acima de 200 opções: virtual scroll + scrollHeight fixo (250px) ativados.
// Use virtualScrollThreshold para customizar esse limiar.

<MultiSelectFieldSeplag
  name="municipios"
  control={control}
  label="Municípios"
  virtualScrollThreshold={500} // opcional, padrão 200
  options={municipios} // pode ter 1500+ itens sem travar
  optionLabel="label"
  optionValue="value"
  dataKey="id"
  selectedItemsLabel="{0} municípios selecionados"
/>`,
  },
  {
    title: "Busca em múltiplos campos — filterFields",
    description:
      "Por padrão o filtro busca apenas em optionLabel. Use filterFields para incluir outros " +
      "campos da opção na busca (ex.: sigla, CNPJ), permitindo encontrar um registro digitando " +
      "um texto que não aparece no label exibido. A busca continua acento-insensível e " +
      "case-insensitive, combinando optionLabel + filterFields num único índice interno.",
    example: <FilterFieldsExample />,
    code: `const empregadores = [
  {
    idenEmpregador: 4,
    nomeRazaoSocial: "DEPARTAMENTO ESTADUAL DE TRANSITO",
    nomeFantasia: "DEPARTAMENTO ESTADUAL DE TRANSITO",
    sigla: "DETRAN",
    numrCnpj: "03829702000170",
  },
  // ...
];

<MultiSelectFieldSeplag
  name="empregadores"
  control={control}
  label="Empregadores"
  options={empregadores}
  optionLabel="nomeRazaoSocial"
  optionValue="idenEmpregador"
  dataKey="idenEmpregador"
  filterFields={["nomeFantasia", "sigla", "numrCnpj"]}
/>
// Digitar "detran" ou o CNPJ encontra o registro mesmo sem aparecer em nomeRazaoSocial`,
  },
  {
    title: "Somente leitura",
    description:
      "Com readOnly=true os itens selecionados são exibidos mas não podem ser alterados. O display é forçado para vírgula e as opções ficam desabilitadas.",
    example: <ReadOnlyExample />,
    code: `<MultiSelectFieldSeplag
  name="cargos"
  control={control}
  label="Cargos (somente leitura)"
  options={cargos}
  optionLabel="label"
  optionValue="value"
  readOnly
/>`,
  },
  {
    title: "Bloqueado com valores — disabled / viewMode",
    description:
      "Quando o campo é bloqueado (disabled=true ou viewMode=true) e já possui itens " +
      "selecionados, ele NÃO fica com a aparência cinza de um campo comum desabilitado: " +
      "permanece com fundo normal e clicável (para o usuário poder abrir o painel e ver a " +
      "lista completa dos itens selecionados), mas nenhuma alteração é permitida — não dá para " +
      "marcar, desmarcar, limpar (showClear some) ou usar 'Selecionar todos'. O texto do campo " +
      "fica na mesma cor cinza de um campo disabled comum, e um tooltip ('Clique para " +
      "visualizar os dados' por padrão, customizável via readOnlyTooltip) aparece ao passar o " +
      "mouse. Já quando bloqueado e SEM nenhum item selecionado, o campo fica normalmente " +
      "desabilitado (cinza, sem interação), pois não há nada relevante para visualizar. Esse é " +
      "o comportamento indicado para campos herdados de outro registro (ex.: grupo de cálculo " +
      "de folha), onde o valor herdado deve ficar visível mas travado.",
    example: <DisabledWithValuesExample />,
    code: `// Bloqueado com itens selecionados: aparência normal, clicável, só leitura
<MultiSelectFieldSeplag
  name="orgaos"
  control={control}
  label="Órgãos (herdado)"
  options={orgaos}
  optionLabel="label"
  optionValue="value"
  disabled={campoHerdado}
  readOnlyTooltip="Clique para visualizar os dados selecionados"
/>

// Bloqueado e vazio: fica desabilitado (cinza) normalmente, sem tooltip
<MultiSelectFieldSeplag
  name="orgaos"
  control={control}
  label="Órgãos"
  options={orgaos}
  optionLabel="label"
  optionValue="value"
  disabled
/>`,
  },
  {
    title: "Opções desabilitadas — optionsDisabled",
    description:
      "Use optionsDisabled para bloquear apenas algumas opções específicas, mantendo o restante " +
      "selecionável. Diferente de readOnly (que bloqueia o campo inteiro), aqui as opções listadas " +
      "em optionsDisabled continuam visíveis e podem já estar selecionadas (ex.: valores herdados " +
      "de uma regra de negócio), mas o usuário não consegue marcá-las nem desmarcá-las. O bloqueio " +
      "é reforçado também no onChange: qualquer valor desabilitado que tente entrar na seleção " +
      "(inclusive por manipulação do DOM fora do fluxo normal do PrimeReact) é filtrado antes de " +
      "chegar ao formulário, e valores desabilitados já selecionados nunca são removidos por essa " +
      "sanitização. A prop recebe um array de valores correspondentes a optionValue.",
    example: <DisabledOptionsExample />,
    code: `const cargos = [
  { label: "Analista", value: 1 },
  { label: "Técnico", value: 2 },
  { label: "Assistente", value: 3 },
  { label: "Coordenador", value: 4 },
  { label: "Gerente", value: 5 },
];

<MultiSelectFieldSeplag
  name="cargos"
  control={control}
  label="Cargos"
  options={cargos}
  optionLabel="label"
  optionValue="value"
  optionsDisabled={[3, 5]} // Assistente e Gerente ficam bloqueados
/>`,
  },
  {
    title: "Limpar seleção — showClear",
    description:
      'Com showClear (padrão true), aparece um botão "X" ao lado do campo para limpar toda a ' +
      "seleção de uma vez, visível apenas quando há itens selecionados. Passe showClear={false} " +
      "para ocultá-lo. O botão não aparece quando o campo está bloqueado (disabled ou viewMode).",
    example: <ShowClearExample />,
    code: `// Padrão: X aparece quando há seleção
<MultiSelectFieldSeplag
  name="cargos"
  control={control}
  label="Cargos"
  options={cargos}
  optionLabel="label"
  optionValue="value"
/>

// Ocultando o X
<MultiSelectFieldSeplag
  name="cargos"
  control={control}
  label="Cargos"
  options={cargos}
  optionLabel="label"
  optionValue="value"
  showClear={false}
/>`,
  },
  {
    title: "Opções inativas — inactive",
    description:
      "Passe inactive: true em uma opção para exibir um BadgeSeplag ('Inativo' por padrão, " +
      "customizável via inactiveBadgeLabel) ao lado do texto no painel. O item continua " +
      "selecionável normalmente; ao selecioná-lo, um toast é exibido (mensagem padrão " +
      "customizável via inactiveToastMessage). Opções sem a propriedade inactive são " +
      "consideradas ativas, mantendo compatibilidade com todo o código existente. Por padrão " +
      "(sortAlphabetically=true) as opções são ordenadas alfabeticamente por optionLabel dentro " +
      "de cada grupo, com os itens inativos sempre exibidos ao final da lista.",
    example: <InactiveOptionsExample />,
    code: `<MultiSelectFieldSeplag
  name="cargos"
  control={control}
  label="Cargos"
  options={[
    { label: "Coordenador", value: 4 },
    { label: "Analista", value: 1 },
    { label: "Gerente", value: 5, inactive: true },
    { label: "Assistente", value: 3 },
    { label: "Técnico", value: 2, inactive: true },
  ]}
  optionLabel="label"
  optionValue="value"
  inactiveBadgeLabel="Inativo" // opcional, esse já é o padrão
  inactiveToastMessage="Este registro está inativo." // opcional
/>
// Painel exibido: Analista, Assistente, Coordenador, Gerente (inativo), Técnico (inativo)`,
  },
  {
    title: "Ordenação — sortAlphabetically",
    description:
      "Com sortAlphabetically={false}, cada grupo (ativos e inativos) mantém a ordem original " +
      "de options, sem reordenação alfabética — útil quando a ordem já vem definida pelo " +
      "sistema/backend. Os registros inativos continuam sendo movidos para o final da lista " +
      "independente deste valor; apenas a ordenação alfabética dentro de cada grupo é desativada.",
    example: <InactiveOptionsNoSortExample />,
    code: `<MultiSelectFieldSeplag
  name="cargos"
  control={control}
  label="Cargos"
  options={[
    { label: "Coordenador", value: 4 },
    { label: "Analista", value: 1 },
    { label: "Gerente", value: 5, inactive: true },
    { label: "Assistente", value: 3 },
    { label: "Técnico", value: 2, inactive: true },
  ]}
  optionLabel="label"
  optionValue="value"
  sortAlphabetically={false}
/>
// Painel exibido: Coordenador, Analista, Assistente, Gerente (inativo), Técnico (inativo)
// (ordem original preservada dentro de cada grupo; inativos ainda vão para o final)`,
  },
  {
    title: "Excluir registros com base em um campo — excludeIf",
    description:
      "Use excludeIf quando a regra para ocultar um registro é arbitrária (qualquer campo, " +
      "qualquer condição), não apenas 'está inativo'. O predicado é avaliado internamente para " +
      "cada item de options, antes de qualquer outro processamento (busca, ordenação) — quando " +
      "retorna true, o item some completamente do painel e da busca, sem precisar filtrar o " +
      "array manualmente com useMemo no consumidor. Diferente de optionsDisabled (o item " +
      "aparece esmaecido, mas ainda visível e pode estar pré-selecionado) e de inactive " +
      "(aparece com badge), aqui o registro nunca chega a ser renderizado.",
    example: <ExcludeByFieldExample />,
    code: `const cargos = [
  { label: "Analista", value: 1, dataDesligamento: null },
  { label: "Técnico", value: 2, dataDesligamento: "2024-01-10" },
  { label: "Assistente", value: 3, dataDesligamento: null },
  { label: "Coordenador", value: 4, dataDesligamento: "2023-08-22" },
  { label: "Gerente", value: 5, dataDesligamento: null },
];

<MultiSelectFieldSeplag
  name="cargos"
  control={control}
  label="Cargos"
  options={cargos}
  optionLabel="label"
  optionValue="value"
  excludeIf={(item) => Boolean(item.dataDesligamento)} // "Técnico" e "Coordenador" nunca aparecem
/>`,
  },
  {
    title: "Modo controlado — sem react-hook-form",
    description:
      "Quando control é omitido, o componente funciona como um input simples controlado por " +
      "value/onChange (arrays de valores). onFilter recebe o texto digitado no filtro a cada " +
      "mudança, útil para busca assíncrona no servidor.",
    example: <ControlledExample />,
    code: `const [value, setValue] = useState<number[]>([1]);

<MultiSelectFieldSeplag
  name="cargos"
  label="Cargos"
  options={cargos}
  optionLabel="label"
  optionValue="value"
  value={value}
  onChange={setValue}
  onFilter={(texto) => buscarNoServidor(texto)}
/>`,
  },
  {
    title: "Badge customizado por opção — badgeLabel / badgeVariant",
    description:
      "Além do binário inactive (badge fixo 'Inativo', variant error), cada item de options " +
      "pode definir badgeLabel/badgeVariant próprios — útil para status com mais de dois " +
      "estados (Agendado, Extinto, etc.). badgeColor/badgeBg/badgeBorder sobrescrevem as cores " +
      "do variant quando necessário, e badgeToastMessage substitui inactiveToastMessage só para " +
      "aquela opção. Qualquer opção com badgeLabel ou badgeVariant é tratada como 'sinalizada' " +
      "(mesmo grupo de ordenação/toast que inactive=true), mesmo sem inactive: true.",
    example: <CustomBadgeExample />,
    code: `const cargos = [
  { label: "Analista", value: 1 },
  {
    label: "Técnico",
    value: 2,
    badgeLabel: "Agendado",
    badgeVariant: "warning",
    badgeToastMessage: "Este cargo entra em vigor numa data futura.",
  },
  { label: "Coordenador", value: 4, badgeLabel: "Extinto", badgeVariant: "error" },
];

<MultiSelectFieldSeplag
  name="cargos"
  control={control}
  label="Cargos"
  options={cargos}
  optionLabel="label"
  optionValue="value"
/>`,
  },
  {
    title: "Nota de migração",
    description:
      "As props panelScope e truncateOptionLabel são aditivas e o default de panelScope é 'body', " +
      "ou seja, nenhum uso existente muda de comportamento. Para travar o painel na largura do " +
      'input use panelScope="confined", ciente do risco de clipping em ancestrais com ' +
      "overflow: hidden/auto (modal, card, célula de tabela). Nesses casos, volte para " +
      'panelScope="body".',
    example: null,
    code: "",
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
    name: "options",
    type: "object[]",
    required: true,
    description: "Lista de opções do multiselect.",
  },
  {
    name: "optionLabel",
    type: "string",
    required: true,
    description: "Propriedade usada como texto exibido.",
  },
  {
    name: "optionValue",
    type: "string",
    required: false,
    description: "Propriedade usada como valor.",
  },
  {
    name: "filterFields",
    type: "string[]",
    required: false,
    description:
      "Campos adicionais (além de optionLabel) considerados na busca do filtro. Ex.: " +
      '["sigla", "numrCnpj"] permite encontrar a opção digitando a sigla ou o CNPJ, mesmo que ' +
      "esse texto não apareça no label exibido.",
  },
  {
    name: "optionsDisabled",
    type: "(string | number)[]",
    required: false,
    description:
      "Valores (correspondentes a optionValue) que devem aparecer na lista mas não podem ser " +
      "selecionados/desmarcados pelo usuário. Requer optionValue definido. Bloqueio reforçado " +
      "no onChange (sanitizeSelection), além do visual desabilitado no painel.",
  },
  {
    name: "optionsFiltered",
    type: "number[]",
    required: false,
    description:
      "Restringe as opções exibidas a este conjunto de valores (correspondentes a optionValue), " +
      "aplicado antes da busca/ordenação. Diferente de excludeIf (predicado por item), aqui a " +
      "lista de valores permitidos é definida diretamente pelo consumidor.",
  },
  {
    name: "value",
    type: "any[]",
    required: false,
    description: "Valores selecionados no modo controlado (sem control). Use junto de onChange.",
  },
  {
    name: "onChange",
    type: "(value: any[]) => void",
    required: false,
    description:
      "Callback do modo controlado (sem control), chamado com o novo array de valores selecionados.",
  },
  {
    name: "onBlur",
    type: "() => void",
    required: false,
    description:
      "Callback disparado quando o campo perde o foco. No modo react-hook-form (com " +
      "control), é chamado após field.onBlur(), preservando o rastreio de touched do form.",
  },
  {
    name: "onFilter",
    type: "(filter: string) => void",
    required: false,
    description:
      "Chamado a cada mudança do texto digitado no filtro do painel — útil para busca assíncrona no servidor.",
  },
  {
    name: "uppercase",
    type: "boolean",
    defaultValue: "true",
    required: false,
    description:
      "Quando true, o texto exibido de cada opção (_label interno, usado no painel e nos itens selecionados) é convertido para maiúsculas.",
  },
  {
    name: "filterPlaceholder",
    type: "string",
    defaultValue: '"Pesquisar..."',
    required: false,
    description: "Placeholder do input de busca dentro do painel.",
  },
  {
    name: "filterMaxLength",
    type: "number",
    defaultValue: "100",
    required: false,
    description: "Tamanho máximo do texto digitado no filtro.",
  },
  {
    name: "emptyFilterMessage",
    type: "ReactNode | ((props: MultiSelectProps) => ReactNode)",
    defaultValue: '"Nenhum resultado encontrado"',
    required: false,
    description: "Mensagem exibida quando o filtro não encontra nenhuma opção.",
  },
  {
    name: "scrollHeight",
    type: "string",
    defaultValue: '"250px"',
    required: false,
    description:
      "Altura máxima do painel de opções (teto do encolhimento automático abaixo de 200 itens).",
  },
  {
    name: "excludeIf",
    type: "(option: any) => boolean",
    required: false,
    description:
      "Predicado avaliado para cada item de options: quando retorna true, o item é removido " +
      "antes de qualquer outro processamento (busca, ordenação). Útil para excluir registros " +
      "com base em uma condição arbitrária, ex.: (item) => Boolean(item.dataDesligamento).",
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
    defaultValue: '"12 4"',
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
    description:
      "Bloqueia o campo. Se já houver itens selecionados, o campo permanece com aparência " +
      "normal (não cinza) e clicável para visualização, mas sem permitir adicionar, remover ou " +
      "limpar a seleção — o texto fica na cor de disabled e um tooltip informativo aparece no " +
      "hover (ver readOnlyTooltip). Se não houver itens selecionados, o campo fica " +
      "completamente desabilitado (cinza, sem interação). Equivalente a viewMode.",
  },
  {
    name: "viewMode",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description:
      "Alias de disabled focado em telas de visualização: mesmo comportamento (bloqueia " +
      "edição, mostra os itens selecionados com aparência normal quando houver algum, ou fica " +
      "desabilitado quando vazio).",
  },
  {
    name: "readOnlyTooltip",
    type: "string",
    defaultValue: '"Clique para visualizar os dados"',
    required: false,
    description:
      "Mensagem do tooltip exibido quando o campo está bloqueado (disabled ou viewMode) e já " +
      "possui itens selecionados. Passe um texto customizado para substituir a mensagem padrão.",
  },
  {
    name: "visible",
    type: "boolean",
    defaultValue: "true",
    required: false,
    description: "Quando false, oculta o campo.",
  },
  {
    name: "placeholder",
    type: "string",
    defaultValue: '"Selecione..."',
    required: false,
    description: "Texto de placeholder.",
  },
  {
    name: "display",
    type: '"comma" | "chip"',
    defaultValue: '"comma"',
    required: false,
    description: "Exibe selecionados separados por vírgula ou como chips.",
  },
  {
    name: "maxSelectedLabels",
    type: "number",
    defaultValue: "3",
    required: false,
    description: "Máximo de rótulos exibidos antes de mostrar contagem.",
  },
  {
    name: "selectedItemsLabel",
    type: "string",
    required: false,
    description: "Texto customizado quando ultrapassa maxSelectedLabels.",
  },
  {
    name: "dataKey",
    type: "string",
    defaultValue: '"id"',
    required: false,
    description: "Chave única de cada item para performance.",
  },
  {
    name: "readOnly",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Impede alteração dos itens selecionados.",
  },
  {
    name: "panelScope",
    type: '"body" | "confined"',
    defaultValue: '"body"',
    required: false,
    description:
      "Escopo do painel aberto. 'body' (padrão) anexa ao document.body. 'confined' trava o " +
      "painel em 100% da largura do input (appendTo='self'). Caveat: no modo confined o painel " +
      "pode ser cortado por ancestral com overflow: hidden/auto (modal, card, célula de tabela).",
  },
  {
    name: "truncateOptionLabel",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description:
      "Quando false, texto longo da opção é lido por scroll horizontal. Quando true, trunca com " +
      "reticências (largura real) e mostra o texto completo no hover via title.",
  },
  {
    name: "isLoading",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Exibe indicador de carregamento.",
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
    name: "autoComplete",
    type: "string",
    required: false,
    description:
      "Atributo HTML autocomplete repassado ao input. Por padrão o autocomplete do navegador " +
      'fica ativo; passe autoComplete="off" para desativá-lo.',
  },
  {
    name: "showClear",
    type: "boolean",
    defaultValue: "true",
    required: false,
    description:
      'Exibe um botão "X" para limpar toda a seleção de uma vez, visível apenas quando há ' +
      "itens selecionados. Passe showClear={false} para ocultá-lo. Sem efeito quando o campo " +
      "está bloqueado (disabled ou viewMode), pois o X nunca aparece nesses casos.",
  },
  {
    name: "inactiveBadgeLabel",
    type: "string",
    defaultValue: '"Inativo"',
    required: false,
    description:
      "Texto padrão do badge exibido ao lado de opções com inactive: true. Cada opção pode " +
      "sobrescrever com badgeLabel/badgeVariant (e badgeColor/badgeBg/badgeBorder) próprios, " +
      "independente de inactive.",
  },
  {
    name: "inactiveToastMessage",
    type: "string",
    defaultValue: '"Este registro está inativo."',
    required: false,
    description:
      "Mensagem exibida em um toast quando o usuário seleciona uma opção com inactive: true.",
  },
  {
    name: "sortAlphabetically",
    type: "boolean",
    defaultValue: "true",
    required: false,
    description:
      "Ordena as opções alfabeticamente por optionLabel dentro de cada grupo (ativos e " +
      "inativos). Os registros inactive: true sempre aparecem ao final, independente deste " +
      "valor; quando false, cada grupo mantém a ordem original de options.",
  },
  {
    name: "virtualScrollThreshold",
    type: "number",
    defaultValue: "200",
    required: false,
    description:
      "Quantidade mínima de opções a partir da qual o VirtualScroller é ativado " +
      "({ itemSize: 43, lazy: false }). Abaixo desse limite o painel encolhe naturalmente " +
      "até o max-height do CSS.",
  },
  {
    name: "virtualScrollItemSize",
    type: "number",
    defaultValue: "43",
    required: false,
    description:
      "Altura fixa (em px) de cada item quando o VirtualScroller está ativo. Ajuste caso " +
      "itemTemplate renderize itens mais altos que o padrão (ex: com badge ou subtítulo) — " +
      "um valor incorreto faz o painel cortar itens ou deixar espaço em branco entre eles.",
  },
];

export default function MultiSelectFieldDoc() {
  return (
    <DocPage
      title="MultiSelectField"
      description="Campo de seleção múltipla com filtro embutido (opcionalmente em múltiplos campos via filterFields) e dois modos de exibição (vírgula ou chips). Integrado com react-hook-form, ou controlado via value/onChange quando control é omitido."
      badge="Estável"
      since="v0.0.1"
      importStatement={'import { MultiSelectFieldSeplag } from "@seplag/ui-lib-react-18";'}
      sections={sections}
      props={props}
    />
  );
}
