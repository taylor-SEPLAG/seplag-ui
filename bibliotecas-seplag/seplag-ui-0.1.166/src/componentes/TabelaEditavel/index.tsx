import type { ReactNode } from "react";
import gridCss from "../../uteis/Grid";
import styles from "./style.module.css";

/** Estado que a tabela repassa a cada célula renderizada por `body`. */
export interface OpcoesCelulaTabelaEditavelSeplag {
  /**
   * `disabled` da tabela inteira. Combine com as regras da própria linha:
   * `disabled={disabled || linha.travada}`.
   */
  readonly disabled: boolean;
}

export interface ColunaTabelaEditavelSeplag<T> {
  /**
   * Identidade estável da coluna. **Obrigatória**, e deliberadamente sem fallback para o
   * índice: conjuntos de colunas montados condicionalmente
   * (`[...base, ...(podeEditar ? [colunaAcoes] : [])]`) mudam de posição entre renders, e
   * chavear por índice faria o React reaproveitar a célula errada.
   *
   * Também é o sufixo dos `data-testid` das células — por isso inserir uma coluna no meio não
   * renumera os seletores dos testes já escritos.
   */
  readonly id: string;
  readonly header: ReactNode;
  /** Caminho simples para leitura direta. Ignorado quando `body` é informado. */
  readonly field?: keyof T & string;
  /**
   * Renderiza a célula. É aqui que entra o campo editável — a tabela não conhece número,
   * dropdown nem regra de negócio.
   */
  readonly body?: (item: T, index: number, opcoes: OpcoesCelulaTabelaEditavelSeplag) => ReactNode;
  /**
   * Conteúdo da coluna no `<tfoot>`. Basta **uma** coluna declarar `footer` para o rodapé
   * inteiro ser renderizado.
   */
  readonly footer?: ReactNode | ((items: readonly T[]) => ReactNode);
  /**
   * Largura CSS da coluna. É uma **preferência**, não um limite: a tabela usa
   * `table-layout: auto`, então uma coluna nunca colapsa e o excedente vira rolagem
   * horizontal. Deixe sem `width` as colunas que devem absorver o espaço restante.
   */
  readonly width?: string;
  /** @default "left" */
  readonly align?: "left" | "center" | "right";
}

export interface TabelaEditavelSeplagProps<T> {
  /** `id` do elemento raiz e base dos `data-testid`. */
  readonly id?: string;
  readonly items: readonly T[];
  /** Chave única da linha e sufixo dos `data-testid`. */
  readonly getKey: (item: T) => string | number;
  readonly columns: readonly ColunaTabelaEditavelSeplag<T>[];
  /**
   * Desabilita a tabela inteira. **Não** é aplicado automaticamente: chega a cada `body` pelo
   * terceiro argumento, e quem monta a célula decide o que fazer com ele. Isso mantém a tabela
   * sem conhecimento dos campos que ela renderiza.
   */
  readonly disabled?: boolean;
  /** Classes extras por linha — para marcar linha travada, em erro, etc. */
  readonly rowClassName?: (item: T, index: number) => string | undefined;
  /** @default "Nenhum registro encontrado." */
  readonly emptyMessage?: ReactNode;
  /** Coluna(s) do grid responsivo da biblioteca. */
  readonly cols?: string;
  readonly className?: string;
  /** Nome acessível da tabela. */
  readonly ariaLabel?: string;
}

function resolverConteudoCelula<T>(
  item: T,
  index: number,
  coluna: ColunaTabelaEditavelSeplag<T>,
  opcoes: OpcoesCelulaTabelaEditavelSeplag,
): ReactNode {
  if (coluna.body) return coluna.body(item, index, opcoes);
  if (coluna.field) return item[coluna.field] as ReactNode;
  return null;
}

function resolverRodape<T>(coluna: ColunaTabelaEditavelSeplag<T>, items: readonly T[]): ReactNode {
  return typeof coluna.footer === "function" ? coluna.footer(items) : coluna.footer;
}

/**
 * Tabela editável em memória: sem paginação, sem busca e sem estado de carregamento.
 *
 * Cobre o caso de "alocação" — poucas linhas, já carregadas, cada uma com colunas de leitura
 * e uma ou mais células editáveis, tipicamente dentro de um formulário. Para listagem de tela
 * com paginação server-side, use o `TablePaginadoSeplag`.
 *
 * A tabela é deliberadamente burra: não registra campo, não valida, não soma e não conhece
 * regra de negócio. Tudo isso vem do `body` de cada coluna.
 */
export function TabelaEditavelSeplag<T>({
  id,
  items,
  getKey,
  columns,
  disabled = false,
  rowClassName,
  emptyMessage = "Nenhum registro encontrado.",
  cols,
  className,
  ariaLabel,
}: Readonly<TabelaEditavelSeplagProps<T>>) {
  const opcoesCelula: OpcoesCelulaTabelaEditavelSeplag = { disabled };
  const temRodape = columns.some((coluna) => coluna.footer !== undefined);

  const classeAlinhamento = (coluna: ColunaTabelaEditavelSeplag<T>) =>
    styles[coluna.align ?? "left"];

  return (
    <div
      id={id}
      data-testid={id}
      className={[gridCss(cols ?? "12"), className].filter(Boolean).join(" ")}
    >
      <div className={styles.wrapper}>
        <table className={styles.tabela} aria-label={ariaLabel}>
          <thead className={styles.cabecalho}>
            <tr>
              {columns.map((coluna) => (
                <th
                  key={coluna.id}
                  scope="col"
                  className={`${styles.th} ${classeAlinhamento(coluna)}`}
                  style={{ width: coluna.width }}
                >
                  {coluna.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  className={`${styles.td} ${styles.vazio}`}
                  colSpan={columns.length}
                  data-testid={id ? `${id}-vazio` : undefined}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              items.map((item, indiceLinha) => {
                const chave = getKey(item);
                return (
                  <tr
                    key={chave}
                    className={rowClassName?.(item, indiceLinha)}
                    data-testid={id ? `${id}-row-${chave}` : undefined}
                  >
                    {columns.map((coluna) => (
                      <td
                        key={coluna.id}
                        className={`${styles.td} ${classeAlinhamento(coluna)}`}
                        data-testid={id ? `${id}-cell-${chave}-${coluna.id}` : undefined}
                      >
                        {resolverConteudoCelula(item, indiceLinha, coluna, opcoesCelula)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>

          {temRodape && (
            <tfoot className={styles.rodape}>
              <tr data-testid={id ? `${id}-footer` : undefined}>
                {columns.map((coluna) => (
                  <td
                    key={coluna.id}
                    className={`${styles.td} ${classeAlinhamento(coluna)}`}
                    data-testid={id ? `${id}-footer-${coluna.id}` : undefined}
                  >
                    {resolverRodape(coluna, items)}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

export default TabelaEditavelSeplag;
