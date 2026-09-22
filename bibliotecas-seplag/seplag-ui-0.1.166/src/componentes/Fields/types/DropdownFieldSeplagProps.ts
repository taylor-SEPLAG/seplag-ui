import type React from "react";
import type { Control, FieldValues, Path, RegisterOptions } from "react-hook-form";

export interface DropdownFieldSeplagProps<T extends FieldValues = any> {
  readonly name: Path<T>;
  readonly control?: Control<T>;
  readonly label?: string;
  readonly cols?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  /**
   * Exibe a opção selecionada sem permitir alteração.
   *
   * Diferente de `disabled`, o campo continua focável pelo teclado e é anunciado normalmente
   * por leitores de tela (com `aria-readonly`), e o valor permanece no estado do formulário.
   * O `Dropdown` do PrimeReact não tem `readOnly` nativo, então o modo é obtido bloqueando a
   * abertura do painel (mouse e teclado) e ignorando o `onChange`; o filtro e o botão de
   * limpar são desligados para não oferecerem uma edição que não vai acontecer.
   *
   * Quando combinado com `disabled`, `disabled` prevalece.
   *
   * @default false
   */
  readonly readOnly?: boolean;
  /**
   * Renderiza apenas o campo, sem rótulo e sem a classe de grid derivada de `cols`.
   * Repassado ao `RotuloSeplag`. Use dentro de célula de tabela ou grupo inline, onde o
   * rótulo é responsabilidade do contexto.
   *
   * @default false
   */
  readonly semMoldura?: boolean;
  readonly visible?: boolean;
  /**
   * @deprecated Use react-hook-form error handling (`fieldState.error`) ou `rules` instead.
   */
  readonly getFormErrorMessage?: (name: string) => React.ReactNode;
  readonly rules?: RegisterOptions<T, Path<T>>;
  readonly options: any[];
  readonly optionLabel: string;
  readonly optionValue: string;
  /**
   * Campo usado para comparar option/valor quando `optionValue` não é informado
   * (ou seja, quando o valor armazenado é o objeto inteiro). Repassado ao `dataKey`
   * do PrimeReact Dropdown.
   */
  readonly dataKey?: string;
  /**
   * Campos adicionais do objeto de opção usados na busca do filtro, além de `optionLabel`.
   * Útil para permitir que o usuário encontre a opção digitando, por exemplo, a sigla ou o CNPJ.
   * @example ["sigla", "numrCnpj"]
   */
  readonly filterFields?: string[];
  readonly optionsDisabled?: (string | number)[];
  readonly optionsFiltered?: number[];
  /**
   * Valores já tomados por outros campos — tipicamente as demais linhas de uma tabela, onde
   * cada linha escolhe um item de uma lista compartilhada sem repetir. As opções
   * correspondentes **somem** do painel e da busca, como no `excludeIf`.
   *
   * A opção do valor **deste** campo nunca é removida, mesmo que apareça na lista: sem ela o
   * `valueTemplate` não encontra o valor selecionado e cai no placeholder, apagando a própria
   * seleção da tela. Como o campo conhece o próprio valor, essa guarda é automática — passe a
   * lista completa de valores usados, incluindo o desta linha.
   *
   * Entradas `null`/`undefined` (linhas ainda não preenchidas) são inofensivas: nenhum valor
   * de opção casa com elas.
   *
   * Combina com `excludeIf`: os dois filtros se aplicam.
   *
   * @example
   * // uma linha por órgão, sem repetir órgão entre linhas
   * valoresIndisponiveis={linhas.map((l) => l.orgaoId)}
   */
  readonly valoresIndisponiveis?: readonly (string | number | null | undefined)[];
  /**
   * Predicado avaliado para cada item de `options`: quando retorna `true`, o item é removido
   * antes de qualquer outro processamento (busca, ordenação, `optionsFiltered`) — some
   * completamente do painel e da busca, diferente de `optionsDisabled` (esmaecido, mas visível)
   * ou `inactive` (badge, mas visível). Útil para excluir registros com base em uma condição
   * arbitrária (ex.: `(item) => Boolean(item.dataDesligamento)`).
   */
  readonly excludeIf?: (option: any) => boolean;
  readonly placeholder?: string;
  readonly isLoading?: boolean;
  readonly showClear?: boolean;
  readonly onChange?: (value: any) => void;
  readonly onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  readonly onFilter?: (filter: string) => void;
  readonly defaultValue?: any;
  readonly filter?: boolean;
  readonly value?: any;
  readonly uppercase?: boolean;
  /**
   * Onde o painel de opções é renderizado. `"self"` o mantém dentro do próprio campo; `"body"` o
   * portaliza, escapando de qualquer ancestral que o recorte.
   *
   * O padrão acompanha o contexto: `"body"` quando `semMoldura` está ligado — célula de tabela ou
   * grupo inline, onde quase sempre há um contêiner de rolagem que cortaria o painel — e `"self"`
   * no restante. Informe explicitamente para forçar um dos dois.
   *
   * @default semMoldura ? "body" : "self"
   */
  readonly appendTo?: "body" | "self" | HTMLElement | null;
  readonly filterMaxLength?: number;
  readonly autoComplete?: string;
  /**
   * Texto do badge exibido ao lado da opção quando `inactive=true`.
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
