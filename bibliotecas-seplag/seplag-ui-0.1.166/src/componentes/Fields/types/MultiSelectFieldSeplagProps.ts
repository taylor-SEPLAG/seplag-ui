import type { MultiSelectProps } from "primereact/multiselect";
import type React from "react";
import type { ReactNode } from "react";
import type { Control, FieldValues, Path, RegisterOptions } from "react-hook-form";

/**
 * Escopo de renderização do painel (dropdown aberto) do MultiSelect.
 *
 * - `"body"` (default): mantém o comportamento padrão do PrimeReact, com o painel
 *   anexado ao `document.body`. Não sofre clipping de ancestrais, mas pode estourar
 *   a largura do input.
 * - `"confined"`: anexa o painel ao próprio container (`appendTo="self"`) e o limita
 *   a 100% da largura do componente pai. Atenção: pode ser cortado por um ancestral
 *   com `overflow: hidden`/`auto` (ex.: modal, card, célula de tabela).
 */
export type MultiSelectPanelScope = "confined" | "body";

export interface MultiSelectFieldSeplagProps<T extends FieldValues = any> {
  readonly name: Path<T>;
  readonly control?: Control<T>;
  readonly label?: string;
  readonly cols?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly visible?: boolean;
  /**
   * @deprecated Use react-hook-form error handling (`fieldState.error`) ou `rules` instead.
   */
  readonly getFormErrorMessage?: (name: string) => React.ReactNode;
  readonly rules?: RegisterOptions<T, Path<T>>;
  readonly options: any[];
  readonly optionValue?: string;
  readonly optionLabel: string;
  /**
   * Campos adicionais (além de `optionLabel`) considerados na busca do filtro.
   * Ex.: `["sigla", "numrCnpj"]` permite filtrar também por sigla ou CNPJ.
   */
  readonly filterFields?: string[];
  readonly optionsFiltered?: number[];
  readonly optionsDisabled?: (string | number)[];
  /**
   * Predicado avaliado para cada item de `options`: quando retorna `true`, o item é removido
   * antes de qualquer outro processamento (busca, ordenação, `optionsFiltered`) — some
   * completamente do painel e da busca, diferente de `optionsDisabled` (esmaecido, mas visível)
   * ou `inactive` (badge, mas visível). Útil para excluir registros com base em uma condição
   * arbitrária (ex.: `(item) => Boolean(item.dataDesligamento)`).
   */
  readonly excludeIf?: (option: any) => boolean;
  readonly dataKey?: string;
  readonly isLoading?: boolean;
  readonly placeholder?: string;
  readonly display?: "chip" | "comma";
  readonly maxSelectedLabels?: number;
  readonly selectedItemsLabel?: string;
  readonly readOnly?: boolean;
  readonly value?: any[];
  readonly uppercase?: boolean;
  readonly onChange?: (value: any[]) => void;
  readonly onBlur?: () => void;
  readonly onFilter?: (filter: string) => void;
  readonly emptyFilterMessage?: ReactNode | ((props: MultiSelectProps) => React.ReactNode);
  readonly filterPlaceholder?: string;
  readonly scrollHeight?: string;
  /**
   * Escopo de renderização do painel. Default `"body"` (comportamento atual do
   * PrimeReact). Use `"confined"` para travar o painel em 100% da largura do input.
   * @default "confined"
   */
  readonly panelScope?: MultiSelectPanelScope;
  /**
   * Quando `true`, trunca o label de cada opção com reticências (`...`) calculadas
   * pela largura real, exibindo o texto completo no hover via atributo `title`.
   * Quando `false` (default), o texto longo é lido por scroll horizontal.
   * @default false
   */
  readonly truncateOptionLabel?: boolean;
  readonly filterMaxLength?: number;
  readonly autoComplete?: string;
  /**
   * Modo de visualização: o dropdown exibe apenas as opções já selecionadas
   * (sem bloquear a abertura do painel) e não permite alterar a seleção.
   * Se não houver nenhum item selecionado, o campo fica `disabled`.
   * @default false
   */
  readonly viewMode?: boolean;
  /**
   * Quando `true`, exibe um botão "X" para limpar toda a seleção de uma vez,
   * visível apenas quando há itens selecionados.
   * @default true
   */
  readonly showClear?: boolean;
  readonly readOnlyTooltip?: string;
  /**
   * Texto do badge exibido ao lado da opção quando `inactive=true` e a opção não
   * define `badgeLabel` próprio.
   *
   * Para status com mais de dois estados (ex.: Ativo/Agendado/Encerrado/Extinto),
   * prefira definir `badgeLabel`/`badgeVariant` (e opcionalmente `badgeColor`/
   * `badgeBg`/`badgeBorder`) diretamente em cada item de `options` — o badge é
   * renderizado sempre que a opção tiver `badgeLabel`, `badgeVariant` ou
   * `inactive=true`.
   * @default "Inativo"
   */
  readonly inactiveBadgeLabel?: string;
  /**
   * Mensagem exibida em um toast quando o usuário seleciona uma opção com `inactive=true`.
   * @default "O registro selecionado está inativo."
   */
  readonly inactiveToastMessage?: string;
  /**
   * Quando `true` (padrão), ordena as opções alfabeticamente por `optionLabel` dentro de cada
   * grupo (ativos e inativos). Os registros com `inactive=true` sempre aparecem ao final,
   * independente deste valor. Quando `false`, cada grupo mantém a ordem original de `options`.
   * @default true
   */
  readonly sortAlphabetically?: boolean;
  /**
   * Quantidade mínima de opções a partir da qual o VirtualScroller é ativado.
   * @default 200
   */
  readonly virtualScrollThreshold?: number;
  /**
   * Altura fixa (em px) de cada item quando o VirtualScroller está ativo. Ajuste caso
   * `itemTemplate` renderize itens mais altos que o padrão (ex: com badge ou subtítulo).
   * @default 43
   */
  readonly virtualScrollItemSize?: number;
}
