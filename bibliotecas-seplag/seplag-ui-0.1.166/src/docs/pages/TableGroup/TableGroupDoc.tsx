import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { TableGroupFooterSeplag, TableGroupHeaderSeplag } from "@componentes/TableGroup";
import { useState } from "react";

type ItemDemo = { id: string; nome: string };

const itensGrupo: ItemDemo[] = [
  { id: "1", nome: "Maria Silva" },
  { id: "2", nome: "Joao Souza" },
  { id: "3", nome: "Ana Costa" },
  { id: "4", nome: "Pedro Lima" },
  { id: "5", nome: "Carla Nunes" },
];

function TableGroupPlayground() {
  const [aberto, setAberto] = useState(true);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [quantidadeExibida, setQuantidadeExibida] = useState(2);

  const totalSelecionados = selecionados.length;
  const indeterminate = totalSelecionados > 0 && totalSelecionados < itensGrupo.length;
  const todosSelecionados = totalSelecionados === itensGrupo.length;
  const itensVisiveis = itensGrupo.slice(0, quantidadeExibida);

  function alternarTodos(selected: boolean) {
    setSelecionados(selected ? itensGrupo.map((i) => i.id) : []);
  }

  return (
    <div style={{ width: "100%", maxWidth: 480 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ padding: 0 }} colSpan={2}>
              <TableGroupHeaderSeplag
                groupId="cargo-analista"
                selected={todosSelecionados}
                indeterminate={indeterminate}
                onSelectionChange={alternarTodos}
                onToggle={() => setAberto((v) => !v)}
                trailing={<span style={{ color: "#64748b", fontSize: "0.85rem" }}>{itensGrupo.length} itens</span>}
              >
                <span>
                  <i className={`pi ${aberto ? "pi-chevron-down" : "pi-chevron-right"}`} style={{ marginRight: "0.5rem" }} />
                  Analista — {totalSelecionados} selecionado(s)
                </span>
              </TableGroupHeaderSeplag>
            </td>
          </tr>

          {aberto &&
            itensVisiveis.map((item) => (
              <tr key={item.id}>
                <td style={{ padding: "0.4rem 0.75rem", width: 32 }}>
                  <input
                    type="checkbox"
                    checked={selecionados.includes(item.id)}
                    onChange={(e) =>
                      setSelecionados((atual) =>
                        e.target.checked ? [...atual, item.id] : atual.filter((id) => id !== item.id),
                      )
                    }
                  />
                </td>
                <td style={{ padding: "0.4rem 0.75rem" }}>{item.nome}</td>
              </tr>
            ))}

          {aberto && (
            <tr>
              <TableGroupFooterSeplag
                groupId="cargo-analista"
                shownRecords={itensVisiveis.length}
                totalRecords={itensGrupo.length}
                onShowAll={() => setQuantidadeExibida(itensGrupo.length)}
                colSpan={2}
              />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "Clique no cabeçalho para expandir/recolher o grupo, marque itens individualmente ou use o checkbox do cabeçalho para selecionar todos, e clique em \"Exibir todos\" no rodapé para carregar o restante dos registros.",
    example: <TableGroupPlayground />,
    code: `import { useState } from "react";
import { TableGroupHeaderSeplag, TableGroupFooterSeplag } from "@seplag/ui-lib-react-18";

const [aberto, setAberto] = useState(true);
const [selecionados, setSelecionados] = useState<string[]>([]);
const [quantidadeExibida, setQuantidadeExibida] = useState(2);

<table>
  <tbody>
    <tr>
      <td colSpan={2}>
        <TableGroupHeaderSeplag
          groupId="cargo-analista"
          selected={selecionados.length === itens.length}
          indeterminate={selecionados.length > 0 && selecionados.length < itens.length}
          onSelectionChange={(selected) => setSelecionados(selected ? itens.map((i) => i.id) : [])}
          onToggle={() => setAberto((v) => !v)}
        >
          Analista — {selecionados.length} selecionado(s)
        </TableGroupHeaderSeplag>
      </td>
    </tr>

    {aberto && itens.slice(0, quantidadeExibida).map((item) => (
      <tr key={item.id}>{/* ... */}</tr>
    ))}

    {aberto && (
      <tr>
        <TableGroupFooterSeplag
          groupId="cargo-analista"
          shownRecords={quantidadeExibida}
          totalRecords={itens.length}
          onShowAll={() => setQuantidadeExibida(itens.length)}
          colSpan={2}
        />
      </tr>
    )}
  </tbody>
</table>`,
  },
  {
    title: "Cabeçalho sem seleção",
    description: "Sem onSelectionChange, o checkbox de seleção não é renderizado — útil para agrupamentos puramente visuais, sem ações em lote.",
    example: (
      <table style={{ width: "100%", maxWidth: 420, borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ padding: 0 }}>
              <TableGroupHeaderSeplag groupId="somente-visual">
                <span>Grupo sem seleção</span>
              </TableGroupHeaderSeplag>
            </td>
          </tr>
        </tbody>
      </table>
    ),
    code: `<TableGroupHeaderSeplag groupId="somente-visual">
  Grupo sem seleção
</TableGroupHeaderSeplag>`,
  },
  {
    title: "Rodapé sem mais registros",
    description: "Quando shownRecords >= totalRecords, o botão \"Exibir todos\" não é renderizado, mesmo que onShowAll esteja definido.",
    example: (
      <table style={{ width: "100%", maxWidth: 420, borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <TableGroupFooterSeplag groupId="completo" shownRecords={5} totalRecords={5} onShowAll={() => {}} colSpan={2} />
          </tr>
        </tbody>
      </table>
    ),
    code: `<TableGroupFooterSeplag
  groupId="completo"
  shownRecords={5}
  totalRecords={5}
  onShowAll={handleShowAll}
  colSpan={2}
/>`,
  },
];

const props: DocProp[] = [
  { name: "TableGroupHeaderSeplag.groupId", type: "string | number", description: "Identificador do grupo, usado para compor ids e data-testid previsíveis." },
  { name: "TableGroupHeaderSeplag.children", type: "ReactNode", required: true, description: "Conteúdo principal do cabeçalho (título do grupo)." },
  { name: "TableGroupHeaderSeplag.trailing", type: "ReactNode", description: "Conteúdo adicional alinhado à direita do cabeçalho." },
  { name: "TableGroupHeaderSeplag.selected", type: "boolean", defaultValue: "false", description: "Estado marcado do checkbox de seleção do grupo." },
  { name: "TableGroupHeaderSeplag.indeterminate", type: "boolean", defaultValue: "false", description: "Estado indeterminado do checkbox (alguns, mas não todos, os itens selecionados)." },
  { name: "TableGroupHeaderSeplag.onSelectionChange", type: "(selected: boolean) => void", description: "Callback ao alternar o checkbox. Quando omitido, o checkbox não é renderizado." },
  { name: "TableGroupHeaderSeplag.selectionAriaLabel", type: "string", defaultValue: '"Selecionar grupo"', description: "Rótulo ARIA do checkbox de seleção." },
  { name: "TableGroupHeaderSeplag.selectionDisabled", type: "boolean", defaultValue: "false", description: "Desabilita o checkbox de seleção." },
  { name: "TableGroupHeaderSeplag.onToggle", type: "() => void", description: "Callback ao clicar no cabeçalho para expandir/recolher o grupo. Quando informado, o conteúdo é renderizado como botão." },
  { name: "TableGroupHeaderSeplag.className", type: "string", description: "Classe CSS adicional no cabeçalho." },
  { name: "TableGroupFooterSeplag.groupId", type: "string | number", description: "Identificador do grupo, usado para compor ids e data-testid previsíveis." },
  { name: "TableGroupFooterSeplag.shownRecords", type: "number", required: true, description: "Quantidade de registros atualmente exibidos do grupo." },
  { name: "TableGroupFooterSeplag.totalRecords", type: "number", required: true, description: "Quantidade total de registros do grupo." },
  { name: "TableGroupFooterSeplag.onShowAll", type: "() => void", description: "Callback ao clicar em \"Exibir todos\". Sem essa prop (ou sem registros restantes), o botão não é exibido." },
  { name: "TableGroupFooterSeplag.loading", type: "boolean", defaultValue: "false", description: "Exibe loadingLabel no lugar de showAllLabel e desabilita o botão." },
  { name: "TableGroupFooterSeplag.showAllLabel", type: "string", defaultValue: '"Exibir todos"', description: "Texto do botão de carregar mais registros." },
  { name: "TableGroupFooterSeplag.loadingLabel", type: "string", defaultValue: '"Carregando..."', description: "Texto exibido durante loading." },
  { name: "TableGroupFooterSeplag.colSpan", type: "number", description: "Quando informado, envolve o conteúdo em um <td colSpan>, pronto para uso dentro de <tr>. Sem colSpan, retorna apenas a div interna." },
  { name: "TableGroupFooterSeplag.className", type: "string", description: "Classe CSS adicional na célula (aplicada somente quando colSpan é informado)." },
];

export default function TableGroupDoc() {
  return (
    <DocPage
      title="TableGroup"
      badge="Estável"
      since="v0.1.153"
      description='Par de componentes (TableGroupHeaderSeplag e TableGroupFooterSeplag) para construir tabelas com linhas agrupadas: cabeçalho de grupo expansível com seleção em lote, e rodapé de grupo com paginação incremental ("Exibir todos").'
      importStatement={`import { TableGroupHeaderSeplag, TableGroupFooterSeplag } from "@seplag/ui-lib-react-18";
import type { TableGroupHeaderSeplagProps, TableGroupFooterSeplagProps } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
