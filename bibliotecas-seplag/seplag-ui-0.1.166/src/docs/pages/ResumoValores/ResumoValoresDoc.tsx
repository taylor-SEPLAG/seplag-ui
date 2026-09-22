import { PanelSeplag } from "@componentes/PanelSeplag";
import { ResumoValoresSeplag } from "@componentes/ResumoValores";
import { DocPage, type DocProp, type DocSection } from "../../components/DocPage";

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description:
      "Cada item é um par rótulo/valor. O componente não soma nem formata nada: o valor chega pronto, com unidade e tudo.",
    example: (
      <ResumoValoresSeplag
        id="doc-basico"
        alinhamento="esquerda"
        itens={[
          { id: "distribuidas", rotulo: "Já distribuídas", valor: "5 vagas" },
          { id: "pendentes", rotulo: "Pendente de distribuição", valor: "25 vagas" },
        ]}
      />
    ),
    code: `<ResumoValoresSeplag
  itens={[
    { id: "distribuidas", rotulo: "Já distribuídas", valor: "5 vagas" },
    { id: "pendentes", rotulo: "Pendente de distribuição", valor: "25 vagas" },
  ]}
/>;`,
  },
  {
    title: "Severidade",
    description:
      "A cor do valor vem de tokens/colors. Use erro ou alerta para chamar atenção a um saldo que estourou o limite.",
    example: (
      <ResumoValoresSeplag
        id="doc-severidade"
        alinhamento="esquerda"
        itens={[
          { id: "info", rotulo: "A distribuir", valor: "12 vagas" },
          { id: "sucesso", rotulo: "Concluídas", valor: "8 vagas", severidade: "sucesso" },
          { id: "alerta", rotulo: "Em análise", valor: "3 vagas", severidade: "alerta" },
          { id: "erro", rotulo: "Saldo", valor: "-2 vagas", severidade: "erro" },
          { id: "neutro", rotulo: "Total", valor: "21 vagas", severidade: "neutro" },
        ]}
      />
    ),
    code: `<ResumoValoresSeplag
  itens={[
    { id: "saldo", rotulo: "Saldo", valor: "-2 vagas", severidade: "erro" },
    { id: "total", rotulo: "Total", valor: "21 vagas", severidade: "neutro" },
  ]}
/>;`,
  },
  {
    title: "Sem rótulo",
    description:
      "Quando o próprio valor já é a frase inteira, omita rotulo. É o formato usado no contador do cabeçalho.",
    example: (
      <ResumoValoresSeplag
        id="doc-sem-rotulo"
        alinhamento="esquerda"
        itens={[{ id: "sel", valor: "0 vaga(s) selecionada(s)" }]}
      />
    ),
    code: `<ResumoValoresSeplag
  itens={[{ id: "sel", valor: "0 vaga(s) selecionada(s)" }]}
/>;`,
  },
  {
    title: "No cabeçalho de um painel",
    description:
      "A composição prevista: variante inline no trailing do PanelSeplag, que empurra o resumo para a direita da faixa.",
    example: (
      <PanelSeplag
        id="doc-painel"
        title="Redução por órgão de distribuição"
        description="Somente vagas disponíveis, regulares e sem comprometimento ativo podem ser reduzidas."
        headerVariant="filled"
        trailing={
          <ResumoValoresSeplag
            id="doc-painel-resumo"
            itens={[{ id: "sel", valor: "0 vaga(s) selecionada(s)" }]}
          />
        }
      >
        <p style={{ margin: 0 }}>Tabela do painel.</p>
      </PanelSeplag>
    ),
    code: `<PanelSeplag
  title="Redução por órgão de distribuição"
  description="Somente vagas disponíveis podem ser reduzidas."
  headerVariant="filled"
  trailing={
    <ResumoValoresSeplag itens={[{ id: "sel", valor: "0 vaga(s) selecionada(s)" }]} />
  }
>
  <TabelaEditavelSeplag ... />
</PanelSeplag>;`,
  },
  {
    title: "Faixa acima e abaixo da tabela",
    description:
      "A variante barra ocupa a linha inteira. Use para os totais que emolduram uma tabela de alocação.",
    example: (
      <div style={{ width: "100%" }}>
        <ResumoValoresSeplag
          id="doc-barra-topo"
          variante="barra"
          itens={[
            { id: "distribuidas", rotulo: "Já distribuídas", valor: "5 vagas" },
            { id: "pendentes", rotulo: "Pendente de distribuição", valor: "25 vagas" },
          ]}
        />
        <div
          style={{
            border: "1px solid var(--surface-border)",
            borderRadius: 6,
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          Tabela
        </div>
        <ResumoValoresSeplag
          id="doc-barra-rodape"
          variante="barra"
          itens={[
            { id: "aDistribuir", rotulo: "A distribuir nesta versão", valor: "0 vagas" },
            { id: "saldo", rotulo: "Saldo pendente após operação", valor: "25 vagas" },
          ]}
        />
      </div>
    ),
    code: `<ResumoValoresSeplag
  variante="barra"
  itens={[
    { id: "distribuidas", rotulo: "Já distribuídas", valor: "5 vagas" },
    { id: "pendentes", rotulo: "Pendente de distribuição", valor: "25 vagas" },
  ]}
/>

<TabelaEditavelSeplag ... />

<ResumoValoresSeplag
  variante="barra"
  itens={[
    { id: "aDistribuir", rotulo: "A distribuir nesta versão", valor: "0 vagas" },
    { id: "saldo", rotulo: "Saldo pendente após operação", valor: "25 vagas" },
  ]}
/>;`,
  },
  {
    title: "Alinhamento",
    description:
      "Totalizadores são alinhados à direita por padrão. Use entre para empurrar o primeiro item para a esquerda e o último para a direita.",
    example: (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <ResumoValoresSeplag
          id="doc-alinha-esquerda"
          variante="barra"
          alinhamento="esquerda"
          itens={[
            { id: "a", rotulo: "esquerda", valor: "1" },
            { id: "b", rotulo: "item", valor: "2" },
          ]}
        />
        <ResumoValoresSeplag
          id="doc-alinha-direita"
          variante="barra"
          alinhamento="direita"
          itens={[
            { id: "a", rotulo: "direita", valor: "1" },
            { id: "b", rotulo: "item", valor: "2" },
          ]}
        />
        <ResumoValoresSeplag
          id="doc-alinha-entre"
          variante="barra"
          alinhamento="entre"
          itens={[
            { id: "a", rotulo: "entre", valor: "1" },
            { id: "b", rotulo: "item", valor: "2" },
          ]}
        />
      </div>
    ),
    code: `<ResumoValoresSeplag
  variante="barra"
  alinhamento="entre"
  itens={itens}
/>;`,
  },
];

const props: DocProp[] = [
  {
    name: "itens",
    type: "readonly ResumoValorSeplag[]",
    required: true,
    description: "Pares rótulo/valor exibidos. Lista vazia não renderiza nada.",
  },
  {
    name: "variante",
    type: '"inline" | "barra"',
    defaultValue: '"inline"',
    description:
      "inline não ocupa a linha inteira (para o trailing do PanelSeplag); barra ocupa a largura total com respiro vertical.",
  },
  {
    name: "alinhamento",
    type: '"esquerda" | "direita" | "entre"',
    defaultValue: '"direita"',
    description: "Distribuição horizontal dos itens.",
  },
  {
    name: "id",
    type: "string",
    description: "id do elemento raiz e base dos data-testid de cada item.",
  },
  {
    name: "className",
    type: "string",
    description: "Classes adicionais no elemento raiz.",
  },
  {
    name: "ariaLabel",
    type: "string",
    defaultValue: '"Resumo"',
    description: "Nome acessível do grupo (role=group).",
  },
  {
    name: "itens[].id",
    type: "string | number",
    required: true,
    description: "Chave única do item e sufixo do data-testid.",
  },
  {
    name: "itens[].rotulo",
    type: "ReactNode",
    description: "Texto descritivo à esquerda do valor. Omitido, o valor aparece sozinho.",
  },
  {
    name: "itens[].valor",
    type: "ReactNode",
    required: true,
    description: "O número ou expressão em destaque. Já deve vir formatado, com unidade.",
  },
  {
    name: "itens[].severidade",
    type: '"neutro" | "info" | "sucesso" | "alerta" | "erro"',
    defaultValue: '"info"',
    description: "Cor do valor, vinda de tokens/colors.",
  },
];

export default function ResumoValoresDoc() {
  return (
    <DocPage
      title="ResumoValoresSeplag"
      description="Faixa de totalizadores: pares rótulo/valor com o valor em destaque. Puramente apresentacional — não soma, não formata e não conhece a origem dos números."
      badge="Estável"
      since="v1.0.0.78"
      importStatement={`import { ResumoValoresSeplag } from "@seplag/ui-lib-react-18";
import type { ResumoValorSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
