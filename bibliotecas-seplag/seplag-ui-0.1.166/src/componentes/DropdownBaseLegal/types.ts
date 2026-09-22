import type { Control, FieldValues, Path, RegisterOptions } from "react-hook-form";

/**
 * Mapa de cores por tipo de documento legal.
 * Chave: nome do tipo (ex.: "Lei"). Valor: cor do texto e do fundo.
 */
export type DocumentoLegalTipoCorMapSeplag = Record<string, { color: string; bg: string }>;

/**
 * Mapa do código do tipo (vindo de `valores[].valorCampo`) para o nome legível.
 */
export type DocumentoLegalTipoMapSeplag = Record<string, string>;

/**
 * Item bruto de documento legal — formato aceito como entrada pelo componente.
 * O consumidor pode fornecer um superconjunto deste shape; campos não usados
 * serão ignorados.
 */
export interface DocumentoLegalSeplag {
  id: number;
  numrDocumentoLegal?: string | null;
  anoVigencia?: string | null;
  nomeDocumentoLegal?: string | null;
  dataFim?: string | null;
  dataVigencia?: string | null;
  siglaTipoDocumento?: string | null;
  valores?: ReadonlyArray<{ nomeCampo: string; valorCampo?: string | null }>;
  arquivo?: {
    conteudoEmBase64?: string | null;
    contentType?: string | null;
    nome?: string | null;
  } | null;
}

/**
 * Formato bruto retornado pelas APIs de documento legal — mesmo shape de
 * `DocumentoLegalSeplag`, mas com `valores[].nomeCampo` opcional/nulo, como
 * as respostas RTK Query costumam tipar. O `DropdownBaseLegalSeplag` aceita
 * este shape diretamente na prop `documentos` e normaliza internamente.
 */
export interface DocumentoLegalApiSeplag
  extends Omit<DocumentoLegalSeplag, "valores"> {
  valores?: ReadonlyArray<{
    nomeCampo?: string | null;
    valorCampo?: string | null;
  }> | null;
}

/**
 * Versão normalizada do documento, exposta nos callbacks e templates.
 */
export interface NormalizedDocumentoSeplag {
  id: number;
  label: string;
  fullName: string;
  description: string;
  tipo: string;
  numrDocumentoLegal: string;
  anoVigencia: string;
  nomeDocumentoLegal: string;
  dataFim: string | null | undefined;
  dataVigencia: string | null | undefined;
  arquivo?: {
    conteudoEmBase64: string;
    contentType: string;
    nome: string;
  };
}

/**
 * Item selecionado para visualização no `Base64FileModalSeplag`.
 */
export interface FileSelecionadoSeplag {
  arquivo?: {
    conteudoEmBase64: string;
    contentType: string;
    label: string;
  };
}

/**
 * Props públicas do `DropdownBaseLegalSeplag`.
 *
 * O componente funciona em dois modos:
 * - Controlado por `react-hook-form` quando `name` + `control` forem fornecidos.
 * - Standalone (estado interno) caso contrário.
 */
export interface DropdownBaseLegalSeplagProps<T extends FieldValues = FieldValues> {
  /** Nome do campo no formulário. Opcional para uso standalone. */
  readonly name?: Path<T>;
  /** Controle do react-hook-form. Opcional para uso standalone. */
  readonly control?: Control<T>;
  /** Rótulo exibido acima do campo. */
  readonly label?: string;
  /** Largura em colunas do grid Seplag (ex.: "12", "6 6"). */
  readonly cols?: string;
  /** Marca o campo como obrigatório. */
  readonly required?: boolean;
  /** Desabilita o campo. */
  readonly disabled?: boolean;
  /** Regras adicionais do `react-hook-form`. */
  readonly rules?: RegisterOptions<T, Path<T>>;

  /**
   * Ids dos documentos selecionados. Usado apenas no modo standalone (sem `name`/`control`)
   * para controlar a seleção externamente — por exemplo, via `Controller` de um campo de
   * formulário com shape diferente de `number[]` (ex.: um único id). Ignorado no modo
   * `react-hook-form` (`name` + `control`), que controla o valor pelo próprio field.
   */
  readonly value?: readonly number[];

  /**
   * Quando `true`, o campo do formulário (`name`/`control`) guarda um único
   * id (`number | undefined`) em vez de `number[]` — para usos com
   * `maxSelecionados={1}` onde o modelo de dados é um valor único (ex.:
   * `leiIsencao?: number`). Só tem efeito no modo `react-hook-form`
   * (`name` + `control`); ignorado no modo standalone.
   */
  readonly singleValue?: boolean;

  /**
   * Lista de documentos disponíveis. O consumidor é responsável por
   * carregá-la. Aceita tanto o shape normalizado (`DocumentoLegalSeplag`)
   * quanto a resposta bruta da API, com `valores[].nomeCampo` opcional —
   * o componente normaliza internamente.
   */
  readonly documentos: ReadonlyArray<DocumentoLegalApiSeplag>;
  /** Indica que os documentos ainda estão sendo carregados. */
  readonly isLoading?: boolean;

  /** Mapa opcional de código → nome do tipo. Sobrescreve o default. */
  readonly tipoMap?: DocumentoLegalTipoMapSeplag;
  /** Mapa opcional de cores por tipo. Sobrescreve o default. */
  readonly corMap?: DocumentoLegalTipoCorMapSeplag;

  /** Se informado, renderiza o link "+ Adicionar documento" apontando para essa rota. Ignorado quando `onAddNewClick` é informado. */
  readonly addNewHref?: string;
  /** Define o atributo `target` do link. Padrão: `_blank`. Só tem efeito com `addNewHref` (modo link). */
  readonly addNewTarget?: "_self" | "_blank" | "_parent" | "_top";
  /** Texto exibido no link/botão. Padrão: "+ Adicionar documento". */
  readonly addNewLabel?: string;
  /**
   * Callback disparado ao clicar em "Adicionar documento", no lugar da navegação
   * via `addNewHref`. Quando informado, o elemento é renderizado como `<button>`
   * (em vez de `<Link>`) com o mesmo visual/posicionamento, e `addNewHref`/`addNewTarget`
   * são ignorados. Use para abrir um modal de cadastro em vez de navegar de rota.
   */
  readonly onAddNewClick?: () => void;

  /** Callback disparado quando a seleção muda, com os documentos normalizados. */
  readonly onSelectionChange?: (selected: NormalizedDocumentoSeplag[]) => void;

  /**
   * Define o texto do título exibido para cada item (painel de opções, chips
   * e lista de selecionados). Padrão: `` `${tipo} nº ${numero}/${ano}` ``.
   */
  readonly getOptionTitle?: (documento: NormalizedDocumentoSeplag) => string;
  /**
   * Define o texto da descrição exibida abaixo do título no painel de opções
   * e na lista de selecionados. Padrão: `documento.label` (nome truncado).
   */
  readonly getOptionDescription?: (documento: NormalizedDocumentoSeplag) => string;

  /**
   * Exibe o `ModalDeleteSeplag` de confirmação ao remover um documento da lista
   * detalhada (abaixo do campo). Padrão: `true`. Use `false` em contextos onde
   * a confirmação extra não faz sentido (ex.: célula de uma grid/listagem).
   */
  readonly confirmarRemocao?: boolean;

  /**
   * Exibe o atalho "Adicionar documento" (quando `addNewHref` ou
   * `onAddNewClick` também for informado). Padrão: `false`. Ative em
   * formulários; mantenha desativado ao usar o componente como célula de
   * uma grid/listagem.
   */
  readonly showAddNewLink?: boolean;

  /**
   * Habilita a marcação de qual documento selecionado é o "aplicável": exibe
   * um radiobutton por linha na lista de selecionados (abaixo do campo),
   * habilitado só quando há 2+ documentos selecionados — com 1 só, ele é o
   * aplicável automaticamente. Padrão: `false`.
   */
  readonly indicarAplicavel?: boolean;
  /**
   * Nome do campo (no mesmo `control`) que guarda o id do documento
   * aplicável. Obrigatório quando `indicarAplicavel` é usado em modo
   * controlado por `react-hook-form`.
   */
  readonly nameAplicavel?: Path<T>;
  /**
   * Torna a marcação do documento aplicável obrigatória (valida
   * `nameAplicavel`). Só tem efeito com `indicarAplicavel` + `nameAplicavel`.
   */
  readonly requiredAplicavel?: boolean;
  /** Mensagem de erro quando `requiredAplicavel` e nenhum documento foi marcado como aplicável. */
  readonly aplicavelRequiredMessage?: string;
  /**
   * Rótulo exibido no badge e no aria-label do radiobutton do documento
   * marcado como aplicável. Padrão: `"Lei aplicável"`.
   */
  readonly aplicavelLabel?: string;

  /**
   * Limita a quantidade de documentos que podem ser selecionados simultaneamente.
   * Ao atingir o limite, novas seleções são bloqueadas (com aviso via toast) até que
   * algum documento selecionado seja removido. Sem limite por padrão.
   */
  readonly maxSelecionados?: number;
}

/**
 * Mapas padrão expostos para reaproveitamento.
 */
export const TIPO_DOCUMENTO_MAP_DEFAULT_SEPLAG: DocumentoLegalTipoMapSeplag = {
  "1": "Lei",
  "2": "Decreto",
  "3": "Norma",
  "4": "Portaria",
  "5": "Lei Complementar",
  "6": "Resolução",
};

export const TIPO_COR_MAP_DEFAULT_SEPLAG: DocumentoLegalTipoCorMapSeplag = {
  Lei: { color: "#1351b4", bg: "#dce9f5" },
  Decreto: { color: "#b41313", bg: "#f5dcdc" },
  Norma: { color: "#137d13", bg: "#dcf5e0" },
  Portaria: { color: "#b46f13", bg: "#f5e8d9" },
  "Lei Complementar": { color: "#6f13b4", bg: "#e8d9f5" },
  Resolução: { color: "#137d7d", bg: "#d9f5f5" },
};
