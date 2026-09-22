import { DropdownFieldSeplag } from "@componentes/Fields";
import "primereact/resources/themes/saga-blue/theme.css";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ToastProviderSeplag } from "../../../provider/printToast";
import { DocPage, type DocProp, type DocSection } from "../../components/DocPage";

const ufs = [
  { label: "Mato Grosso", value: "MT" },
  { label: "São Paulo", value: "SP" },
  { label: "Rio de Janeiro", value: "RJ" },
  { label: "Minas Gerais", value: "MG" },
  { label: "Bahia", value: "BA" },
];

const MUNICIPIOS_BASE = [
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
];

function gerarOpcoes(quantidade: number) {
  return Array.from({ length: quantidade }, (_, i) => ({
    id: i + 1,
    label:
      `${MUNICIPIOS_BASE[i % MUNICIPIOS_BASE.length]} ${Math.floor(i / MUNICIPIOS_BASE.length) > 0 ? Math.floor(i / MUNICIPIOS_BASE.length) + 1 : ""}`.trim(),
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
  const { control } = useForm({ defaultValues: { empregador: null } });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <DropdownFieldSeplag
        name="empregador"
        control={control}
        label="Empregador (busca por nome, sigla ou CNPJ)"
        options={empregadoresExemplo}
        optionLabel="nomeRazaoSocial"
        optionValue="idenEmpregador"
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

function ReadOnlyExample() {
  const { control } = useForm({
    defaultValues: { leitura: "MT", editavel: "SP", bloqueado: "RJ" },
  });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <DropdownFieldSeplag
        name="leitura"
        control={control}
        label="Somente leitura"
        options={ufs}
        optionLabel="label"
        optionValue="value"
        cols="12 4"
        readOnly
      />
      <DropdownFieldSeplag
        name="editavel"
        control={control}
        label="Editável (comparação)"
        options={ufs}
        optionLabel="label"
        optionValue="value"
        cols="12 4"
      />
      <DropdownFieldSeplag
        name="bloqueado"
        control={control}
        label="Desabilitado (comparação)"
        options={ufs}
        optionLabel="label"
        optionValue="value"
        cols="12 4"
        disabled
      />
    </div>
  );
}

const ORGAOS_EXEMPLO = [
  { id: 1, nome: "SEMA" },
  { id: 2, nome: "SEPLAG" },
  { id: 3, nome: "SEFAZ" },
];

function CelulaTabelaExample() {
  const { control, watch } = useForm({
    defaultValues: {
      linhas: [
        { chave: "persistida-1", orgaoId: 1 as number | null, travada: true },
        { chave: "persistida-2", orgaoId: 2 as number | null, travada: true },
        { chave: "nova-1", orgaoId: null as number | null, travada: false },
      ],
    },
  });
  const linhas = watch("linhas");

  return (
    <div style={{ width: "100%" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid var(--surface-border)" }}>
            <th style={{ padding: "0.5rem" }}>Órgão</th>
            <th style={{ padding: "0.5rem", width: "12rem" }}>Situação</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, indice) => (
            <tr key={linha.chave} style={{ borderBottom: "1px solid var(--surface-border)" }}>
              <td style={{ padding: "0.5rem" }}>
                <DropdownFieldSeplag
                  name={`linhas.${indice}.orgaoId`}
                  control={control}
                  options={ORGAOS_EXEMPLO}
                  optionLabel="nome"
                  optionValue="id"
                  placeholder="Selecione"
                  semMoldura
                  readOnly={linha.travada}
                />
              </td>
              <td style={{ padding: "0.5rem", fontSize: "0.8125rem", color: "#6b7280" }}>
                {linha.travada ? "Já persistida — somente leitura" : "Nova — editável"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ fontSize: "0.8125rem", margin: "0.75rem 0 0.25rem", color: "#6b7280" }}>
        Estado do formulário — as linhas travadas continuam presentes:
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
        {JSON.stringify(linhas, null, 2)}
      </pre>
    </div>
  );
}

const ORGAOS_LISTA = [
  { id: 1, nome: "SEMA" },
  { id: 2, nome: "SEPLAG" },
  { id: 3, nome: "SEFAZ" },
  { id: 4, nome: "SAD" },
  { id: 5, nome: "MT PREV" },
];

function ValoresIndisponiveisExample() {
  const { control, watch } = useForm({
    defaultValues: { linhas: [{ orgaoId: null }, { orgaoId: null }, { orgaoId: null }] },
  });
  const linhas = watch("linhas");
  const usados = linhas.map((linha) => linha.orgaoId);

  return (
    <div style={{ width: "100%" }}>
      <div className="grid">
        {linhas.map((_linha, indice) => (
          <DropdownFieldSeplag
            key={`destino-${indice}`}
            name={`linhas.${indice}.orgaoId`}
            control={control}
            label={`Destinação ${indice + 1}`}
            options={ORGAOS_LISTA}
            optionLabel="nome"
            optionValue="id"
            placeholder="Selecione"
            valoresIndisponiveis={usados}
            cols="12 4"
          />
        ))}
      </div>
      <p style={{ fontSize: "0.8125rem", color: "#6b7280", margin: "0.5rem 0 0" }}>
        Escolha em um deles e abra os outros: a opção some das demais listas, mas continua visível
        no campo que a selecionou. Escolhendo nos três, o quarto ofereceria só os dois órgãos
        restantes.
      </p>
    </div>
  );
}

function BasicExample() {
  const { control } = useForm({ defaultValues: { uf: null, status: null } });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <DropdownFieldSeplag
        name="uf"
        control={control}
        label="UF"
        options={ufs}
        optionLabel="label"
        optionValue="value"
        cols="12 6"
      />
      <DropdownFieldSeplag
        name="status"
        control={control}
        label="Status (obrigatório)"
        options={[
          { label: "Ativo", value: "A" },
          { label: "Inativo", value: "I" },
        ]}
        optionLabel="label"
        optionValue="value"
        cols="12 6"
        required
      />
    </div>
  );
}

function PerformancePlayground() {
  const [quantidade, setQuantidade] = useState(50);
  const [threshold, setThreshold] = useState(200);
  const { control } = useForm({ defaultValues: { municipio: null } });
  const opcoes = useMemo(() => gerarOpcoes(quantidade), [quantidade]);

  const virtualAtivo = quantidade > threshold;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <label htmlFor="pg-dropdown-qtd" style={{ fontWeight: 600, minWidth: 160 }}>
          Quantidade de registros:
        </label>
        <input
          id="pg-dropdown-qtd"
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
        <label htmlFor="pg-dropdown-threshold" style={{ fontWeight: 600, minWidth: 160 }}>
          virtualScrollThreshold:
        </label>
        <input
          id="pg-dropdown-threshold"
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
        <DropdownFieldSeplag
          name="municipio"
          control={control}
          label={`Município (${quantidade} opções)`}
          options={opcoes}
          optionLabel="label"
          optionValue="value"
          cols="12 8"
          placeholder="Selecione um município..."
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
        <code>{`<DropdownFieldSeplag
  name="municipio"
  control={control}
  label="Município"
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

function DisabledOptionsExample() {
  const { control, watch } = useForm({ defaultValues: { cargo: 2 } });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <DropdownFieldSeplag
        name="cargo"
        control={control}
        label="Cargo (com opções bloqueadas)"
        options={[
          { label: "Analista", value: 1 },
          { label: "Técnico", value: 2 },
          { label: "Assistente", value: 3 },
          { label: "Coordenador", value: 4 },
          { label: "Gerente", value: 5 },
        ]}
        optionLabel="label"
        optionValue="value"
        optionsDisabled={[3, 5]}
        cols="12 6"
      />
      <p style={{ fontSize: "0.82rem", color: "#6b7280", margin: 0 }}>
        Valor atual: <strong>{String(watch("cargo"))}</strong> — tente selecionar "Assistente" ou
        "Gerente": eles aparecem esmaecidos no painel e o clique não altera o valor, mesmo
        manipulando o DOM manualmente.
      </p>
    </div>
  );
}

function OptionsFilteredExample() {
  const { control } = useForm({ defaultValues: { cargo_filtrado: null } });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <DropdownFieldSeplag
        name="cargo_filtrado"
        control={control}
        label="Cargo (apenas parte da lista)"
        options={[
          { label: "Analista", value: 1 },
          { label: "Técnico", value: 2 },
          { label: "Assistente", value: 3 },
          { label: "Coordenador", value: 4 },
          { label: "Gerente", value: 5 },
        ]}
        optionLabel="label"
        optionValue="value"
        optionsFiltered={[1, 2, 4]}
        cols="12 6"
      />
    </div>
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
  const { control } = useForm({ defaultValues: { cargo_excluido: null } });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <DropdownFieldSeplag
        name="cargo_excluido"
        control={control}
        label="Cargo (desligados nunca aparecem)"
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

const cargosComInativosOrdenados = [
  { label: "Coordenador", value: 4 },
  { label: "Analista", value: 1 },
  { label: "Gerente", value: 5, inactive: true },
  { label: "Assistente", value: 3 },
  { label: "Técnico", value: 2, inactive: true },
];

function InactiveOptionsExample() {
  const { control } = useForm({ defaultValues: { cargo_inativo: null } });
  return (
    <ToastProviderSeplag>
      <div className="grid" style={{ width: "100%" }}>
        <DropdownFieldSeplag
          name="cargo_inativo"
          control={control}
          label="Cargo (com opções inativas)"
          options={cargosComInativosOrdenados}
          optionLabel="label"
          optionValue="value"
          cols="12 6"
        />
      </div>
    </ToastProviderSeplag>
  );
}

function InactiveOptionsNoSortExample() {
  const { control } = useForm({ defaultValues: { cargo_inativo_sem_ordem: null } });
  return (
    <ToastProviderSeplag>
      <div className="grid" style={{ width: "100%" }}>
        <DropdownFieldSeplag
          name="cargo_inativo_sem_ordem"
          control={control}
          label="Cargo (ordem original, sem ordenação alfabética)"
          options={cargosComInativosOrdenados}
          optionLabel="label"
          optionValue="value"
          cols="12 6"
          sortAlphabetically={false}
        />
      </div>
    </ToastProviderSeplag>
  );
}

function ControlledExample() {
  const [value, setValue] = useState<string | null>("MT");
  return (
    <div className="grid" style={{ width: "100%" }}>
      <DropdownFieldSeplag
        name="uf_controlado"
        label="UF (sem react-hook-form)"
        options={ufs}
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
  const { control } = useForm({ defaultValues: { cargo_badge: null } });
  return (
    <ToastProviderSeplag>
      <div className="grid" style={{ width: "100%" }}>
        <DropdownFieldSeplag
          name="cargo_badge"
          control={control}
          label="Cargo (badge customizado por opção)"
          options={cargosComBadgeCustomizado}
          optionLabel="label"
          optionValue="value"
          cols="12 6"
        />
      </div>
    </ToastProviderSeplag>
  );
}

const fasesComBadgeInformativo = [
  { label: "Prova objetiva", value: 1 },
  {
    label: "Prova objetiva - Edital 2026",
    value: 2,
    badgeLabel: "TCE-MT",
    badgeVariant: "info" as const,
    badgeTooltip: "Apresentação de Currículos e Entrevista",
    badgeSemToast: true,
    badgeSemAgrupamento: true,
  },
  { label: "Recursos", value: 3 },
  {
    label: "Entrevista",
    value: 4,
    badgeLabel: "TCE-MT",
    badgeVariant: "info" as const,
    badgeSemToast: true,
    badgeSemAgrupamento: true,
  },
];

function InformativeBadgeExample() {
  const { control } = useForm({ defaultValues: { fase_badge: null } });
  return (
    <ToastProviderSeplag>
      <div className="grid" style={{ width: "100%" }}>
        <DropdownFieldSeplag
          name="fase_badge"
          control={control}
          label="Fase (badge informativo, sem toast nem agrupamento)"
          options={fasesComBadgeInformativo}
          optionLabel="label"
          optionValue="value"
          cols="12 6"
        />
      </div>
    </ToastProviderSeplag>
  );
}

const sections: DocSection[] = [
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
    code: `<DropdownFieldSeplag
  name="cargo"
  control={control}
  label="Cargo"
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
    code: `<DropdownFieldSeplag
  name="cargo"
  control={control}
  label="Cargo"
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
    title: "Uso básico",
    description: "Dropdown com filtro embutido e botão de limpar, integrado com react-hook-form.",
    example: <BasicExample />,
    code: `import { useForm } from "react-hook-form";
import { DropdownFieldSeplag } from "@seplag/ui-lib-react-18";

const { control } = useForm();

<DropdownFieldSeplag
  name="uf"
  control={control}
  label="UF"
  options={[{ label: "Mato Grosso", value: "MT" }]}
  optionLabel="label"
  optionValue="value"
  cols="12 6"
/>`,
  },
  {
    title: "Sem repetir entre campos — valoresIndisponiveis",
    description:
      "Para o caso de vários campos escolherem de uma mesma lista sem repetir — uma linha por órgão numa tabela, por exemplo. Passe a lista completa de valores já usados, incluindo o deste campo: a opção do próprio valor nunca é removida. Sem essa guarda, excluir o próprio valor faria o campo perder o rótulo e voltar a exibir o placeholder, embora o valor continuasse no formulário. Como o campo conhece o próprio valor, ela é automática. As opções somem do painel e da busca; para mantê-las visíveis porém esmaecidas, use optionsDisabled.",
    example: <ValoresIndisponiveisExample />,
    code: `const { control, watch } = useForm({
  defaultValues: { linhas: [{ orgaoId: null }, { orgaoId: null }] },
});

// A lista completa, inclusive o valor da própria linha.
const usados = watch("linhas").map((l) => l.orgaoId);

{linhas.map((_, i) => (
  <DropdownFieldSeplag
    key={i}
    name={\`linhas.\${i}.orgaoId\`}
    control={control}
    options={orgaos}
    optionLabel="nome"
    optionValue="id"
    valoresIndisponiveis={usados}
  />
))}

// Combina com excludeIf: os dois filtros se aplicam.
// Entradas null (linhas não preenchidas) são inofensivas.`,
  },
  {
    title: "Somente leitura — readOnly",
    description:
      "O Dropdown do PrimeReact não tem readOnly nativo: o modo é obtido impedindo o painel de abrir por mouse e por teclado, e desligando o filtro e o botão de limpar. Diferente de disabled, o campo continua focável pelo Tab e é anunciado com aria-readonly. Tente clicar no primeiro, ou focá-lo com Tab e teclar Enter, seta ou uma letra — a lista não abre. Navegando com Tab, o desabilitado é pulado; o somente-leitura não.",
    example: <ReadOnlyExample />,
    code: `// Somente leitura: focável, anunciado, e o valor continua no payload
<DropdownFieldSeplag
  name="orgaoId"
  control={control}
  label="Órgão"
  options={orgaos}
  optionLabel="nome"
  optionValue="id"
  readOnly
/>

// Desabilitado: sai da navegação por teclado
<DropdownFieldSeplag
  name="orgaoId"
  control={control}
  label="Órgão"
  options={orgaos}
  optionLabel="nome"
  optionValue="id"
  disabled
/>

// Quando as duas são passadas, disabled prevalece.`,
  },
  {
    title: "Dentro de célula de tabela — semMoldura",
    description:
      "semMoldura remove o rótulo e a classe de grid, deixando só o campo — o rótulo passa a ser o <th> da coluna. Como readOnly é por linha, dá para travar as linhas já persistidas e deixar editável apenas a nova, mantendo todas registradas no mesmo formulário. Selecione um órgão na última linha e veja o estado do formulário abaixo.",
    example: <CelulaTabelaExample />,
    code: `<tbody>
  {linhas.map((linha, indice) => (
    <tr key={linha.chave}>
      <td>
        <DropdownFieldSeplag
          name={\`linhas.\${indice}.orgaoId\`}
          control={control}
          options={orgaos}
          optionLabel="nome"
          optionValue="id"
          placeholder="Selecione"
          semMoldura
          readOnly={linha.travada}
        />
      </td>
    </tr>
  ))}
</tbody>`,
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

<DropdownFieldSeplag
  name="municipio"
  control={control}
  label="Município"
  options={municipios} // pode ter 1500+ itens sem travar
  optionLabel="label"
  optionValue="value"
  virtualScrollThreshold={500} // opcional, padrão 200
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

<DropdownFieldSeplag
  name="empregador"
  control={control}
  label="Empregador"
  options={empregadores}
  optionLabel="nomeRazaoSocial"
  optionValue="idenEmpregador"
  filterFields={["nomeFantasia", "sigla", "numrCnpj"]}
/>
// Digitar "detran" ou o CNPJ encontra o registro mesmo sem aparecer em nomeRazaoSocial`,
  },
  {
    title: "Opções desabilitadas — optionsDisabled",
    description:
      "Use optionsDisabled para bloquear apenas algumas opções específicas, mantendo o restante " +
      "selecionável. As opções listadas aparecem esmaecidas no painel (não podem ser escolhidas) " +
      "e o bloqueio também é reforçado no onChange internamente — mesmo que o valor desabilitado " +
      "chegue por alguma manipulação fora do fluxo normal do PrimeReact (ex.: DOM alterado " +
      "manualmente), a seleção é ignorada e o valor do campo não muda. A prop recebe um array de " +
      "valores correspondentes a optionValue.",
    example: <DisabledOptionsExample />,
    code: `const cargos = [
  { label: "Analista", value: 1 },
  { label: "Técnico", value: 2 },
  { label: "Assistente", value: 3 },
  { label: "Coordenador", value: 4 },
  { label: "Gerente", value: 5 },
];

<DropdownFieldSeplag
  name="cargo"
  control={control}
  label="Cargo"
  options={cargos}
  optionLabel="label"
  optionValue="value"
  optionsDisabled={[3, 5]} // Assistente e Gerente ficam bloqueados
/>`,
  },
  {
    title: "Restringir opções — optionsFiltered",
    description:
      "Use optionsFiltered para exibir apenas um subconjunto da lista original de options, sem " +
      "precisar recriar o array (útil quando as opções vêm de um cache/contexto compartilhado, " +
      "mas o campo atual só pode oferecer parte delas). A prop recebe um array de valores " +
      "correspondentes a optionValue; as demais opções somem completamente do painel e do filtro.",
    example: <OptionsFilteredExample />,
    code: `const cargos = [
  { label: "Analista", value: 1 },
  { label: "Técnico", value: 2 },
  { label: "Assistente", value: 3 },
  { label: "Coordenador", value: 4 },
  { label: "Gerente", value: 5 },
];

<DropdownFieldSeplag
  name="cargo"
  control={control}
  label="Cargo"
  options={cargos}
  optionLabel="label"
  optionValue="value"
  optionsFiltered={[1, 2, 4]} // só Analista, Técnico e Coordenador aparecem
/>`,
  },
  {
    title: "Excluir registros com base em um campo — excludeIf",
    description:
      "Use excludeIf quando a regra para ocultar um registro é arbitrária (qualquer campo, " +
      "qualquer condição), não apenas 'está inativo'. O predicado é avaliado internamente para " +
      "cada item de options, antes de qualquer outro processamento (busca, ordenação, " +
      "optionsFiltered) — quando retorna true, o item some completamente do painel e da busca, " +
      "sem precisar filtrar o array manualmente com useMemo no consumidor. Diferente de " +
      "optionsDisabled (o item aparece esmaecido, mas ainda visível) e de inactive (aparece com " +
      "badge), aqui o registro nunca chega a ser renderizado.",
    example: <ExcludeByFieldExample />,
    code: `const cargos = [
  { label: "Analista", value: 1, dataDesligamento: null },
  { label: "Técnico", value: 2, dataDesligamento: "2024-01-10" },
  { label: "Assistente", value: 3, dataDesligamento: null },
  { label: "Coordenador", value: 4, dataDesligamento: "2023-08-22" },
  { label: "Gerente", value: 5, dataDesligamento: null },
];

<DropdownFieldSeplag
  name="cargo"
  control={control}
  label="Cargo"
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
      "value/onChange. onFilter recebe o texto digitado no filtro a cada mudança, útil para " +
      "busca assíncrona no servidor.",
    example: <ControlledExample />,
    code: `const [value, setValue] = useState<string | null>("MT");

<DropdownFieldSeplag
  name="uf"
  label="UF"
  options={ufs}
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
      "aquela opção.",
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

<DropdownFieldSeplag
  name="cargo"
  control={control}
  label="Cargo"
  options={cargos}
  optionLabel="label"
  optionValue="value"
/>`,
  },
  {
    title: "Badge informativo (sem toast/agrupamento) — badgeSemToast / badgeSemAgrupamento / badgeTooltip",
    description:
      "Por padrão, qualquer opção com badgeLabel é tratada como um estado de atenção: dispara " +
      "toast ao selecionar e é agrupada ao final da lista (mesmo comportamento de inactive). " +
      "Para um badge puramente informativo — que não representa inatividade, ex.: a origem do " +
      "registro (\"TCE-MT\") — use badgeSemToast (não notifica ao selecionar) e " +
      "badgeSemAgrupamento (mantém a opção na ordenação alfabética normal, sem empurrá-la para " +
      "o final). badgeTooltip exibe um texto ao passar o mouse sobre o badge, independente das " +
      "outras duas flags.",
    example: <InformativeBadgeExample />,
    code: `const fases = [
  { label: "Prova objetiva", value: 1 },
  {
    label: "Prova objetiva - Edital 2026",
    value: 2,
    badgeLabel: "TCE-MT",
    badgeVariant: "info",
    badgeTooltip: "Apresentação de Currículos e Entrevista",
    badgeSemToast: true,        // não mostra toast ao selecionar
    badgeSemAgrupamento: true,  // mantém a posição alfabética normal
  },
  { label: "Recursos", value: 3 },
  {
    label: "Entrevista",
    value: 4,
    badgeLabel: "TCE-MT",
    badgeVariant: "info",
    badgeSemToast: true,
    badgeSemAgrupamento: true,
  },
];

<DropdownFieldSeplag
  name="fase"
  control={control}
  label="Fase"
  options={fases}
  optionLabel="label"
  optionValue="value"
/>
// Painel exibido em ordem alfabética normal: Entrevista, Prova objetiva,
// Prova objetiva - Edital 2026, Recursos — nenhuma delas é agrupada ao final
// nem dispara toast ao ser selecionada.`,
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
    description: "Lista de opções do dropdown.",
  },
  {
    name: "optionLabel",
    type: "string",
    required: true,
    description: "Propriedade da opção usada como texto exibido e base do filtro.",
  },
  {
    name: "optionValue",
    type: "string",
    required: true,
    description: "Propriedade da opção usada como valor.",
  },
  {
    name: "dataKey",
    type: "string",
    required: false,
    description:
      "Campo usado para comparar option/valor quando optionValue não é informado (valor armazenado é o objeto inteiro). Repassado ao dataKey do PrimeReact Dropdown.",
  },
  {
    name: "value",
    type: "any",
    required: false,
    description: "Valor selecionado no modo controlado (sem control). Use junto de onChange.",
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
    description: "Quando true, o texto exibido de cada opção é convertido para maiúsculas.",
  },
  {
    name: "appendTo",
    type: '"body" | "self" | HTMLElement | null',
    required: false,
    description:
      "Elemento ao qual o painel de opções é anexado (repassado ao PrimeReact Dropdown).",
  },
  {
    name: "filterMaxLength",
    type: "number",
    required: false,
    description: "Tamanho máximo do texto digitado no filtro.",
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
      "Valores (correspondentes a optionValue) que aparecem na lista mas não podem ser " +
      "selecionados. Bloqueio reforçado no onChange, além do visual esmaecido no painel.",
  },
  {
    name: "optionsFiltered",
    type: "number[]",
    required: false,
    description:
      "Valores (correspondentes a optionValue) que devem ser exibidos. Quando informado, as " +
      "demais opções da lista original são removidas do painel e do filtro.",
  },
  {
    name: "excludeIf",
    type: "(option: any) => boolean",
    required: false,
    description:
      "Predicado avaliado para cada item de options: quando retorna true, o item é removido " +
      "antes de qualquer outro processamento (busca, ordenação, optionsFiltered). Útil para " +
      "excluir registros com base em uma condição arbitrária, ex.: " +
      "(item) => Boolean(item.dataDesligamento).",
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
    description: 'Largura via grid SEPLAG (ex: "12 6" → 12 colunas mobile, 6 desktop).',
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
    name: "valoresIndisponiveis",
    type: "readonly (string | number | null | undefined)[]",
    required: false,
    description:
      "Valores já tomados por outros campos — as opções correspondentes somem do painel e da busca. A opção do valor DESTE campo nunca é removida, mesmo que apareça na lista: sem ela o rótulo da seleção sumiria da tela. Passe a lista completa, incluindo o valor da própria linha; entradas null são inofensivas. Combina com excludeIf.",
  },
  {
    name: "readOnly",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description:
      "Exibe a opção selecionada sem permitir alteração, mantendo o campo focável e " +
      "anunciado por leitores de tela (aria-readonly). O Dropdown do PrimeReact não tem " +
      "readOnly nativo: o painel é impedido de abrir por mouse e teclado, e o filtro e o " +
      "botão de limpar são desligados. Se disabled também for passado, ele prevalece.",
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
    name: "placeholder",
    type: "string",
    defaultValue: '"Selecione..."',
    required: false,
    description: "Texto exibido quando nenhum item está selecionado.",
  },
  {
    name: "showClear",
    type: "boolean",
    defaultValue: "true",
    required: false,
    description: "Exibe botão para limpar a seleção.",
  },
  {
    name: "filter",
    type: "boolean",
    defaultValue: "true",
    required: false,
    description: "Habilita o filtro interno do dropdown.",
  },
  {
    name: "isLoading",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Exibe indicador de carregamento enquanto as opções são buscadas.",
  },
  {
    name: "onChange",
    type: "(value: any) => void",
    required: false,
    description: "Callback disparado ao mudar a seleção.",
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
    name: "defaultValue",
    type: "any",
    required: false,
    description: "Valor padrão do campo (passado ao Controller do react-hook-form).",
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
    name: "options[].badgeLabel",
    type: "string",
    required: false,
    description:
      "Por opção. Define um badge próprio, independente de inactive — use para status com mais " +
      "de dois estados (Agendado, Extinto, etc.). Presente, já marca a opção como \"flagged\" " +
      "(toast ao selecionar + agrupada ao final), a menos que combinada com badgeSemToast / " +
      "badgeSemAgrupamento.",
  },
  {
    name: "options[].badgeVariant",
    type: '"success" | "warning" | "error" | "info" | "neutral"',
    defaultValue: '"error" (quando inactive=true)',
    required: false,
    description: "Por opção. Variante de cor do badge desta opção.",
  },
  {
    name: "options[].badgeColor",
    type: "string",
    required: false,
    description: "Por opção. Sobrescreve a cor do texto do badge definida pelo variant.",
  },
  {
    name: "options[].badgeBg",
    type: "string",
    required: false,
    description: "Por opção. Sobrescreve a cor de fundo do badge definida pelo variant.",
  },
  {
    name: "options[].badgeBorder",
    type: "string",
    required: false,
    description: "Por opção. Sobrescreve a cor da borda do badge definida pelo variant.",
  },
  {
    name: "options[].badgeToastMessage",
    type: "string",
    required: false,
    description:
      "Por opção. Substitui inactiveToastMessage só para esta opção. Sem efeito quando " +
      "badgeSemToast=true.",
  },
  {
    name: "options[].badgeSemToast",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description:
      "Por opção. Suprime o toast de aviso ao selecionar esta opção específica, mesmo que ela " +
      "tenha badgeLabel/badgeVariant ou inactive. Use em badges puramente informativos que não " +
      "representam um estado de inatividade/atenção.",
  },
  {
    name: "options[].badgeSemAgrupamento",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description:
      "Por opção. Mantém esta opção junto das demais na ordenação alfabética geral, em vez de " +
      "agrupá-la ao final da lista (comportamento padrão para toda opção com badge/inactive).",
  },
  {
    name: "options[].badgeTooltip",
    type: "string",
    required: false,
    description: "Por opção. Texto exibido ao passar o mouse sobre o badge desta opção.",
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

export default function DropdownFieldDoc() {
  return (
    <DocPage
      title="DropdownField"
      description="Campo de seleção única com filtro embutido (opcionalmente em múltiplos campos via filterFields), botão de limpar e virtual scroll automático para listas grandes. Integrado com react-hook-form, ou controlado via value/onChange quando control é omitido."
      badge="Estável"
      since="v0.0.1"
      importStatement={'import { DropdownFieldSeplag } from "@seplag/ui-lib-react-18";'}
      sections={sections}
      props={props}
    />
  );
}
