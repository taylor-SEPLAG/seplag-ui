import { BotaoAdicionarSeplag, BotaoIconSeplag } from "@componentes/Botao";
import { DropdownFieldSeplag, NumberFieldSeplag } from "@componentes/Fields";
import { MensagemSeplag } from "@componentes/Mensagem";
import { PanelSeplag } from "@componentes/PanelSeplag";
import { ResumoValoresSeplag } from "@componentes/ResumoValores";
import { TabelaEditavelSeplag } from "@componentes/TabelaEditavel";
import { useFieldArray, useForm } from "react-hook-form";
import { DocPage, type DocProp, type DocSection } from "../../components/DocPage";
import "primereact/resources/themes/saga-blue/theme.css";

interface OrgaoExemplo {
  id: number;
  nome: string;
  distribuidas: number;
  ocupadas: number;
  comprometidas: number;
  disponiveis: number;
}

const ORGAOS: OrgaoExemplo[] = [
  { id: 1, nome: "SEMA", distribuidas: 2, ocupadas: 0, comprometidas: 0, disponiveis: 2 },
  { id: 2, nome: "SEPLAG", distribuidas: 2, ocupadas: 0, comprometidas: 0, disponiveis: 2 },
  { id: 3, nome: "SEFAZ", distribuidas: 1, ocupadas: 0, comprometidas: 0, disponiveis: 1 },
  {
    id: 0,
    nome: "Pendente de distribuição",
    distribuidas: 25,
    ocupadas: 0,
    comprometidas: 0,
    disponiveis: 25,
  },
];

const QUADROS = [
  { id: 1, nome: "Quadro Suplementar" },
  { id: 2, nome: "Quadro Permanente" },
];

/** Reproduz a tela de redução: leitura + uma coluna editável + coluna derivada. */
function ReducaoExample() {
  const { control, watch } = useForm({
    defaultValues: { itens: ORGAOS.map(() => ({ reduzir: 0 })) },
  });
  const itens = watch("itens");
  const totalSelecionado = itens.reduce((soma, item) => soma + (item.reduzir ?? 0), 0);

  return (
    <PanelSeplag
      id="doc-reducao"
      title="Redução por órgão de distribuição"
      description="Somente vagas disponíveis, regulares e sem comprometimento ativo podem ser reduzidas."
      headerVariant="filled"
      trailing={
        <ResumoValoresSeplag
          itens={[{ id: "sel", valor: `${totalSelecionado} vaga(s) selecionada(s)` }]}
        />
      }
    >
      <TabelaEditavelSeplag
        id="doc-tabela-reducao"
        items={ORGAOS}
        getKey={(orgao) => orgao.id}
        ariaLabel="Redução por órgão de distribuição"
        columns={[
          { id: "orgao", header: "Órgão", body: (orgao) => <strong>{orgao.nome}</strong> },
          { id: "distribuidas", header: "Distribuídas", field: "distribuidas", align: "right" },
          { id: "ocupadas", header: "Ocupadas", field: "ocupadas", align: "right" },
          { id: "comprometidas", header: "Comprometidas", field: "comprometidas", align: "right" },
          { id: "disponiveis", header: "Disponíveis", field: "disponiveis", align: "right" },
          {
            id: "reduzir",
            header: "Quantidade a reduzir",
            width: "11rem",
            body: (orgao, indice, { disabled }) => (
              <NumberFieldSeplag
                name={`itens.${indice}.reduzir`}
                control={control}
                semMoldura
                disabled={disabled}
                min={0}
                max={orgao.disponiveis}
                inputStyle={{ textAlign: "right" }}
              />
            ),
          },
          {
            id: "efeito",
            header: "Efeito previsto",
            width: "14rem",
            body: (_orgao, indice) => (
              <span style={{ fontSize: "0.8125rem", color: "#1d4ed8" }}>
                {itens[indice]?.reduzir ?? 0} extinta(s) imediatamente
              </span>
            ),
          },
        ]}
      />
    </PanelSeplag>
  );
}

/** Reproduz a tela de transformação: a tabela inteira bloqueada até escolher o destino. */
function TransformacaoExample() {
  const { control, watch } = useForm({
    defaultValues: { quadroDestino: null as number | null, itens: ORGAOS.map(() => ({ qtd: 0 })) },
  });
  const quadroDestino = watch("quadroDestino");
  const itens = watch("itens");
  const totalSelecionado = itens.reduce((soma, item) => soma + (item.qtd ?? 0), 0);

  return (
    <PanelSeplag
      id="doc-transformacao"
      title="Transformação por órgão de distribuição"
      description="Somente vagas disponíveis ou ocupadas, regulares e sem comprometimento ativo podem ser transformadas."
      headerVariant="filled"
      trailing={
        <ResumoValoresSeplag
          itens={[{ id: "sel", valor: `${totalSelecionado} vaga(s) selecionada(s)` }]}
        />
      }
    >
      <div className="grid">
        <DropdownFieldSeplag
          name="quadroDestino"
          control={control}
          label="Quadro Autorizado de destino"
          options={QUADROS}
          optionLabel="nome"
          optionValue="id"
          placeholder="Selecione o quadro de destino"
          cols="12 5"
          required
        />
      </div>

      {!quadroDestino && (
        <MensagemSeplag
          severity="info"
          message="Selecione o Quadro Autorizado de destino para informar as quantidades por órgão."
        />
      )}

      <TabelaEditavelSeplag
        id="doc-tabela-transformacao"
        items={ORGAOS}
        getKey={(orgao) => orgao.id}
        ariaLabel="Transformação por órgão de distribuição"
        disabled={!quadroDestino}
        columns={[
          { id: "orgao", header: "Órgão", body: (orgao) => <strong>{orgao.nome}</strong> },
          { id: "distribuidas", header: "Distribuídas", field: "distribuidas", align: "right" },
          { id: "disponiveis", header: "Disponíveis", field: "disponiveis", align: "right" },
          { id: "elegiveis", header: "Elegíveis", field: "disponiveis", align: "right" },
          {
            id: "transformar",
            header: "Quantidade a transformar",
            width: "12rem",
            body: (orgao, indice, { disabled }) => (
              <NumberFieldSeplag
                name={`itens.${indice}.qtd`}
                control={control}
                semMoldura
                disabled={disabled}
                min={0}
                max={orgao.disponiveis}
                inputStyle={{ textAlign: "right" }}
              />
            ),
          },
          {
            id: "destino",
            header: "Destino",
            width: "12rem",
            body: () => (
              <span style={{ fontSize: "0.8125rem", color: "#1d4ed8" }}>
                {quadroDestino
                  ? QUADROS.find((q) => q.id === quadroDestino)?.nome
                  : "Selecione o destino"}
              </span>
            ),
          },
        ]}
      />
    </PanelSeplag>
  );
}

interface LinhaDestinacao {
  orgaoId: number | null;
  atual: number;
  adicionar: number;
  travada: boolean;
}

const DESTINACOES_PERSISTIDAS: LinhaDestinacao[] = [
  { orgaoId: 3, atual: 1, adicionar: 0, travada: true },
  { orgaoId: 1, atual: 2, adicionar: 0, travada: true },
  { orgaoId: 2, atual: 2, adicionar: 0, travada: true },
];

const TOTAL_PENDENTE = 25;

/**
 * Lista ofertada no dropdown de destinação — maior que a dos órgãos já distribuídos, para
 * sobrar o que escolher depois que as linhas persistidas tomaram SEMA, SEPLAG e SEFAZ.
 */
const ORGAOS_SELECIONAVEIS = [
  { id: 1, nome: "SEMA" },
  { id: 2, nome: "SEPLAG" },
  { id: 3, nome: "SEFAZ" },
  { id: 4, nome: "SAD" },
  { id: 5, nome: "MT PREV" },
  { id: 6, nome: "SECITECI" },
];

const LINHA_NOVA: LinhaDestinacao = { orgaoId: null, atual: 0, adicionar: 1, travada: false };

/**
 * Reproduz a tela de destinações completa: linhas persistidas travadas, botão que acrescenta
 * linhas ao final, lixeira só nas novas, e faixas de total que reagem.
 *
 * Nada disso exige prop nova na TabelaEditavelSeplag — as linhas são `items`, e a coluna de
 * ação é um `body` que devolve `null` quando a linha é travada.
 */
function DestinacoesExample() {
  const { control, watch } = useForm<{ linhas: LinhaDestinacao[] }>({
    defaultValues: { linhas: DESTINACOES_PERSISTIDAS },
  });
  // `fields[].id` é a chave estável: linhas novas não têm id vindo do servidor.
  const { fields, append, remove } = useFieldArray({ control, name: "linhas" });

  const linhas = watch("linhas");
  const aDistribuir = linhas.reduce((soma, linha) => soma + (linha.adicionar ?? 0), 0);
  const jaDistribuidas = DESTINACOES_PERSISTIDAS.reduce((soma, linha) => soma + linha.atual, 0);
  const saldo = TOTAL_PENDENTE - aDistribuir;

  // Um órgão só pode aparecer uma vez: cada dropdown deixa de oferecer o que as outras linhas
  // já tomaram. A opção da própria linha é preservada pelo componente, sem guarda no consumidor.
  const orgaosUsados = linhas.map((linha) => linha.orgaoId);

  return (
    <PanelSeplag
      id="doc-destinacoes"
      title="Destinações da distribuição"
      description="Consulte o que já está distribuído e acrescente apenas vagas pendentes."
      headerVariant="filled"
      trailing={
        <BotaoAdicionarSeplag
          label="Adicionar destinação"
          onClick={() => append({ ...LINHA_NOVA })}
        />
      }
    >
      <ResumoValoresSeplag
        variante="barra"
        itens={[
          { id: "ja", rotulo: "Já distribuídas", valor: `${jaDistribuidas} vagas` },
          { id: "pendente", rotulo: "Pendente de distribuição", valor: `${TOTAL_PENDENTE} vagas` },
        ]}
      />

      <TabelaEditavelSeplag
        id="doc-tabela-destinacoes"
        items={fields}
        getKey={(linha) => linha.id}
        ariaLabel="Destinações da distribuição"
        emptyMessage="Nenhuma destinação. Use “Adicionar destinação” para começar."
        columns={[
          {
            id: "orgao",
            header: "Órgão",
            body: (linha, indice, { disabled }) => (
              <DropdownFieldSeplag
                name={`linhas.${indice}.orgaoId`}
                control={control}
                options={ORGAOS_SELECIONAVEIS}
                optionLabel="nome"
                optionValue="id"
                placeholder="Selecione"
                valoresIndisponiveis={orgaosUsados}
                semMoldura
                disabled={disabled}
                readOnly={linha.travada}
              />
            ),
          },
          {
            id: "atual",
            header: "Quantidade atual",
            width: "11rem",
            align: "right",
            body: (linha) => (
              <NumberFieldSeplag
                name={`atual-${linha.id}`}
                value={linha.atual}
                semMoldura
                readOnly
                inputStyle={{ textAlign: "right" }}
              />
            ),
          },
          {
            id: "adicionar",
            header: "A adicionar",
            width: "10rem",
            align: "right",
            body: (linha, indice, { disabled }) => (
              <NumberFieldSeplag
                name={`linhas.${indice}.adicionar`}
                control={control}
                semMoldura
                disabled={disabled || linha.travada}
                min={0}
                inputStyle={{ textAlign: "right" }}
              />
            ),
          },
          {
            id: "acoes",
            header: "Ações",
            width: "6rem",
            align: "center",
            // A regra "lixeira só nas linhas novas" cabe inteira aqui.
            body: (linha, indice) =>
              linha.travada ? null : (
                <BotaoIconSeplag
                  icon="pi pi-trash"
                  severity="danger"
                  aria-label={`Remover destinação ${indice + 1}`}
                  tooltip="Remover destinação"
                  onClick={() => remove(indice)}
                />
              ),
          },
        ]}
      />

      <ResumoValoresSeplag
        variante="barra"
        itens={[
          { id: "aDistribuir", rotulo: "A distribuir nesta versão", valor: `${aDistribuir} vagas` },
          {
            id: "saldo",
            rotulo: "Saldo pendente após operação",
            valor: `${saldo} vagas`,
            severidade: saldo < 0 ? "erro" : "info",
          },
        ]}
      />
    </PanelSeplag>
  );
}

function RodapeExample() {
  return (
    <TabelaEditavelSeplag
      id="doc-rodape"
      items={ORGAOS.filter((orgao) => orgao.id !== 0)}
      getKey={(orgao) => orgao.id}
      ariaLabel="Totais por órgão"
      columns={[
        { id: "orgao", header: "Órgão", field: "nome", footer: <strong>Total</strong> },
        {
          id: "distribuidas",
          header: "Distribuídas",
          field: "distribuidas",
          align: "right",
          footer: (itens) => itens.reduce((soma, orgao) => soma + orgao.distribuidas, 0),
        },
        {
          id: "disponiveis",
          header: "Disponíveis",
          field: "disponiveis",
          align: "right",
          footer: (itens) => itens.reduce((soma, orgao) => soma + orgao.disponiveis, 0),
        },
      ]}
    />
  );
}

function VaziaExample() {
  return (
    <TabelaEditavelSeplag
      id="doc-vazia"
      items={[]}
      getKey={(orgao: OrgaoExemplo) => orgao.id}
      emptyMessage="Nenhum órgão elegível para esta operação."
      columns={[
        { id: "orgao", header: "Órgão" },
        { id: "disponiveis", header: "Disponíveis", align: "right" },
        { id: "quantidade", header: "Quantidade" },
      ]}
    />
  );
}

const sections: DocSection[] = [
  {
    title: "Uso básico com rodapé de totais",
    description:
      "Colunas de leitura via field, alinhamento por coluna e rodapé. Basta uma coluna declarar footer para o <tfoot> inteiro aparecer — não existe prop showFooter, que permitiria o estado inválido 'rodapé ligado sem conteúdo'. O footer aceita um ReactNode fixo ou uma função que recebe items.",
    example: <RodapeExample />,
    code: `<TabelaEditavelSeplag
  items={orgaos}
  getKey={(o) => o.id}
  ariaLabel="Totais por órgão"
  columns={[
    { id: "orgao", header: "Órgão", field: "nome", footer: <strong>Total</strong> },
    {
      id: "disponiveis",
      header: "Disponíveis",
      field: "disponiveis",
      align: "right",
      footer: (itens) => itens.reduce((soma, o) => soma + o.disponiveis, 0),
    },
  ]}
/>`,
  },
  {
    title: "Células editáveis dentro de um formulário",
    description:
      "O caso central. Cada célula editável é um campo da biblioteca com semMoldura, registrado no mesmo useForm — ganha validação, exibição de erro e data-testid de graça. Digite nas quantidades: o contador do cabeçalho e a coluna 'Efeito previsto' reagem, porque ambos leem o estado do formulário.",
    example: <ReducaoExample />,
    code: `const { control, watch } = useForm({
  defaultValues: { itens: orgaos.map(() => ({ reduzir: 0 })) },
});

<PanelSeplag
  title="Redução por órgão de distribuição"
  headerVariant="filled"
  trailing={<ResumoValoresSeplag itens={[{ id: "sel", valor: \`\${total} vaga(s) selecionada(s)\` }]} />}
>
  <TabelaEditavelSeplag
    items={orgaos}
    getKey={(o) => o.id}
    columns={[
      { id: "orgao", header: "Órgão", body: (o) => <strong>{o.nome}</strong> },
      { id: "disponiveis", header: "Disponíveis", field: "disponiveis", align: "right" },
      {
        id: "reduzir",
        header: "Quantidade a reduzir",
        width: "11rem",
        body: (o, i, { disabled }) => (
          <NumberFieldSeplag
            name={\`itens.\${i}.reduzir\`}
            control={control}
            semMoldura
            disabled={disabled}
            min={0}
            max={o.disponiveis}
          />
        ),
      },
    ]}
  />
</PanelSeplag>`,
  },
  {
    title: "Bloqueio da tabela inteira — disabled",
    description:
      "A tabela não aplica disabled a nada: ela o repassa como terceiro argumento do body, e quem monta a célula decide. Isso mantém a tabela sem conhecimento dos campos, e permite combinar com regras da própria linha. Selecione o quadro de destino abaixo e veja todos os campos destravarem de uma vez.",
    example: <TransformacaoExample />,
    code: `<TabelaEditavelSeplag
  items={orgaos}
  getKey={(o) => o.id}
  disabled={!quadroDestino}
  columns={[
    {
      id: "transformar",
      header: "Quantidade a transformar",
      body: (o, i, { disabled }) => (
        <NumberFieldSeplag
          name={\`itens.\${i}.qtd\`}
          control={control}
          semMoldura
          disabled={disabled}
          min={0}
          max={o.elegiveis}
        />
      ),
    },
  ]}
/>

// Combinando com uma regra da própria linha:
// disabled={disabled || linha.travada}`,
  },
  {
    title: "Adicionar e remover linhas, com linhas travadas",
    description:
      "Clique em “Adicionar destinação” quantas vezes quiser: cada clique acrescenta uma linha ao final, e só as linhas novas ganham a lixeira. Nada disso exige prop nova na tabela — as linhas são o items (aqui vindo de useFieldArray), e a coluna de ação é um body que devolve null quando a linha é travada. readOnly também é por linha, então as persistidas ficam travadas enquanto as novas permanecem editáveis, todas no mesmo formulário. Cada dropdown deixa de oferecer os órgãos já tomados pelas outras linhas (valoresIndisponiveis) — abra dois dropdowns e compare as listas. Preencha “A adicionar”: o saldo recalcula e vira vermelho se passar do pendente.",
    example: <DestinacoesExample />,
    code: `const { control, watch } = useForm({ defaultValues: { linhas: persistidas } });
// fields[].id é a chave estável: linhas novas não têm id de servidor.
const { fields, append, remove } = useFieldArray({ control, name: "linhas" });

// Um órgão só pode aparecer uma vez. A opção da própria linha é preservada
// pelo componente — não precisa de guarda aqui.
const orgaosUsados = watch("linhas").map((l) => l.orgaoId);

<PanelSeplag
  title="Destinações da distribuição"
  headerVariant="filled"
  trailing={
    <BotaoAdicionarSeplag
      label="Adicionar destinação"
      onClick={() => append({ orgaoId: null, atual: 0, adicionar: 1, travada: false })}
    />
  }
>
  <ResumoValoresSeplag variante="barra" itens={totaisDoTopo} />

  <TabelaEditavelSeplag
    items={fields}
    getKey={(l) => l.id}
    columns={[
      {
        id: "orgao",
        header: "Órgão",
        body: (l, i, { disabled }) => (
          <DropdownFieldSeplag
            name={\`linhas.\${i}.orgaoId\`}
            control={control}
            options={orgaos}
            optionLabel="nome"
            optionValue="id"
            valoresIndisponiveis={orgaosUsados}
            semMoldura
            disabled={disabled}
            readOnly={l.travada}
          />
        ),
      },
      {
        id: "adicionar",
        header: "A adicionar",
        align: "right",
        body: (l, i, { disabled }) => (
          <NumberFieldSeplag
            name={\`linhas.\${i}.adicionar\`}
            control={control}
            semMoldura
            disabled={disabled || l.travada}
            min={0}
          />
        ),
      },
      {
        id: "acoes",
        header: "Ações",
        width: "6rem",
        align: "center",
        // A regra "lixeira só nas linhas novas" cabe inteira aqui.
        body: (l, i) =>
          l.travada ? null : (
            <BotaoIconSeplag
              icon="pi pi-trash"
              severity="danger"
              tooltip="Remover destinação"
              onClick={() => remove(i)}
            />
          ),
      },
    ]}
  />

  <ResumoValoresSeplag variante="barra" itens={totaisDoRodape} />
</PanelSeplag>`,
  },
  {
    title: "Lista vazia",
    description:
      "A mensagem ocupa todas as colunas via colSpan. Atenção: se alguma coluna declarar footer, o rodapé continua sendo renderizado mesmo com items vazio — cabe ao consumidor tratar.",
    example: <VaziaExample />,
    code: `<TabelaEditavelSeplag
  items={[]}
  getKey={(o) => o.id}
  emptyMessage="Nenhum órgão elegível para esta operação."
  columns={colunas}
/>`,
  },
];

const props: DocProp[] = [
  {
    name: "items",
    type: "readonly T[]",
    required: true,
    description: "Linhas da tabela, já carregadas em memória. Não há paginação nem busca.",
  },
  {
    name: "getKey",
    type: "(item: T) => string | number",
    required: true,
    description: "Chave única da linha e sufixo dos data-testid.",
  },
  {
    name: "columns",
    type: "readonly ColunaTabelaEditavelSeplag<T>[]",
    required: true,
    description: "Definição das colunas.",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    description:
      "Desabilita a tabela inteira. NÃO é aplicado automaticamente: chega a cada body pelo terceiro argumento, e quem monta a célula decide o que fazer com ele.",
  },
  {
    name: "rowClassName",
    type: "(item: T, index: number) => string | undefined",
    description: "Classes extras por linha — para marcar linha travada, em erro, etc.",
  },
  {
    name: "emptyMessage",
    type: "ReactNode",
    defaultValue: '"Nenhum registro encontrado."',
    description: "Exibida quando items está vazio, ocupando todas as colunas via colSpan.",
  },
  {
    name: "cols",
    type: "string",
    defaultValue: '"12"',
    description: "Coluna(s) do grid responsivo da biblioteca, via classesCssSeplag.",
  },
  {
    name: "id",
    type: "string",
    description:
      "id do elemento raiz e base dos data-testid: {id}-row-{chave}, {id}-cell-{chave}-{coluna}, {id}-footer, {id}-vazio.",
  },
  {
    name: "className",
    type: "string",
    description: "Classes adicionais no elemento raiz.",
  },
  {
    name: "ariaLabel",
    type: "string",
    description: "Nome acessível da <table>.",
  },
  {
    name: "columns[].id",
    type: "string",
    required: true,
    description:
      "Identidade estável da coluna, usada como key do React e como sufixo dos data-testid das células. Obrigatória e sem fallback para o índice: conjuntos de colunas montados condicionalmente mudam de posição entre renders, e chavear por índice faria o React reaproveitar a célula errada. Também evita que inserir uma coluna no meio renumere os seletores dos testes já escritos.",
  },
  {
    name: "columns[].header",
    type: "ReactNode",
    required: true,
    description: "Conteúdo do <th>, com scope=col.",
  },
  {
    name: "columns[].field",
    type: "keyof T & string",
    description: "Leitura direta do valor. Ignorado quando body é informado.",
  },
  {
    name: "columns[].body",
    type: "(item, index, { disabled }) => ReactNode",
    description:
      "Renderiza a célula. É aqui que entra o campo editável — a tabela não conhece número, dropdown nem regra de negócio.",
  },
  {
    name: "columns[].footer",
    type: "ReactNode | ((items: readonly T[]) => ReactNode)",
    description:
      "Conteúdo da coluna no <tfoot>. Basta uma coluna declarar footer para o rodapé inteiro ser renderizado.",
  },
  {
    name: "columns[].width",
    type: "string",
    description:
      "Largura CSS da coluna — uma preferência, não um limite: a tabela usa table-layout: auto, então nenhuma coluna colapsa e o excedente vira rolagem horizontal. Declare width só nas colunas de campo editável e deixe as demais absorverem o espaço restante.",
  },
  {
    name: "columns[].align",
    type: '"left" | "center" | "right"',
    defaultValue: '"left"',
    description: "Alinhamento do cabeçalho, das células e do rodapé da coluna.",
  },
];

export default function TabelaEditavelDoc() {
  return (
    <DocPage
      title="TabelaEditavelSeplag"
      description="Tabela em memória com células editáveis: poucas linhas já carregadas, colunas de leitura ao lado de campos de formulário. Deliberadamente burra — não registra campo, não valida, não soma e não conhece regra de negócio. Para listagem com paginação server-side, use o TablePaginadoSeplag."
      badge="Estável"
      since="v1.0.0.78"
      importStatement={`import { TabelaEditavelSeplag } from "@seplag/ui-lib-react-18";
import type { ColunaTabelaEditavelSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
