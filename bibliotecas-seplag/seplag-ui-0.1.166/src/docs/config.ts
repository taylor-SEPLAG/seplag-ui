import { lazy, type ComponentType } from "react";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface DocEntry {
  /** Identificador único usado na URL: /docs/:id */
  id: string;
  /** Rótulo exibido no menu e no título */
  label: string;
  /** Agrupa o componente numa seção do menu lateral */
  category: string;
  /** Componente da página de documentação — carregado sob demanda */
  component: ComponentType;
}

export interface DocCategory {
  label: string;
  entries: DocEntry[];
}

// ---------------------------------------------------------------------------
// Registro de componentes documentados
// ---------------------------------------------------------------------------
// Para adicionar um novo componente basta inserir uma nova entrada aqui
// e criar o arquivo de documentação correspondente em ./pages/<Nome>/<Nome>Doc.tsx

const docEntries: DocEntry[] = [
  // ── Ações ──────────────────────────────────────────────────
  {
    id: "botao",
    label: "Botão",
    category: "Ações",
    component: lazy(() => import("./pages/Botao/BotaoDoc")),
  },
  {
    id: "group-actions",
    label: "GroupActions",
    category: "Ações",
    component: lazy(() => import("./pages/GroupActions/GroupActionsDoc")),
  },
  // ── Overlays ───────────────────────────────────────────────
  {
    id: "modal",
    label: "Modal",
    category: "Overlays",
    component: lazy(() => import("./pages/Modal/ModalDoc")),
  },
  {
    id: "modal-delete",
    label: "Modal de Exclusão",
    category: "Overlays",
    component: lazy(() => import("./pages/ModalDelete/ModalDeleteDoc")),
  },
  {
    id: "modal-confirmacao",
    label: "ModalConfirmacao",
    category: "Overlays",
    component: lazy(() => import("./pages/ModalConfirmacao/ModalConfirmacaoDoc")),
  },
  {
    id: "modal-data-motivo",
    label: "ModalDataMotivo",
    category: "Overlays",
    component: lazy(() => import("./pages/ModalDataMotivo/ModalDataMotivoDoc")),
  },
  {
    id: "base64-file-modal",
    label: "Base64FileModal",
    category: "Overlays",
    component: lazy(() => import("./pages/Base64FileModal/Base64FileModalDoc")),
  },
  {
    id: "image-cropper",
    label: "ImageCropper",
    category: "Overlays",
    component: lazy(() => import("./pages/ImageCropper/ImageCropperDoc")),
  },
  // ── Formulários ────────────────────────────────────────────
  {
    id: "fields-playground",
    label: "⚡ Fields Playground",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/FieldsPlaygroundDoc")),
  },
  {
    id: "fields",
    label: "Campos de Formulário (visão geral)",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/FieldsDoc")),
  },
  {
    id: "field-text",
    label: "TextField",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/TextFieldDoc")),
  },
  {
    id: "field-textarea",
    label: "TextAreaField",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/TextAreaFieldDoc")),
  },
  {
    id: "field-email",
    label: "EmailField",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/EmailFieldDoc")),
  },
  {
    id: "field-number",
    label: "NumberField",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/NumberFieldDoc")),
  },
  {
    id: "field-currency",
    label: "CurrencyField",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/CurrencyFieldDoc")),
  },
  {
    id: "field-cpf",
    label: "CPFField",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/CPFFieldDoc")),
  },
  {
    id: "field-cnpj",
    label: "CNPJField",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/CNPJFieldDoc")),
  },
  {
    id: "field-mask",
    label: "MaskField",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/MaskFieldDoc")),
  },
  {
    id: "field-date",
    label: "DateField",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/DateFieldDoc")),
  },
  {
    id: "field-fieldset-date",
    label: "FieldsetDateField",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/FieldsetDateFieldDoc")),
  },
  {
    id: "field-dropdown",
    label: "DropdownField",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/DropdownFieldDoc")),
  },
  {
    id: "field-multiselect",
    label: "MultiSelectField",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/MultiSelectFieldDoc")),
  },
  {
    id: "field-radiobutton",
    label: "RadioButtonField",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/RadioButtonFieldDoc")),
  },
  {
    id: "field-checkbox",
    label: "CheckboxField",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/CheckboxFieldDoc")),
  },
  {
    id: "field-checkbox-list",
    label: "CheckboxList",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/CheckboxListDoc")),
  },
  {
    id: "field-switch",
    label: "SwitchField",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/SwitchFieldDoc")),
  },
  {
    id: "field-search",
    label: "SearchField",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/SearchFieldDoc")),
  },
  {
    id: "seplag-autocomplete",
    label: "AutoCompleteSeplag",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/AutoCompleteSeplagDoc")),
  },
  {
    id: "field-image-upload",
    label: "ImageUploadField",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/ImageUploadFieldDoc")),
  },
  {
    id: "checkbox-sn",
    label: "Checkbox S/N",
    category: "Formulários",
    component: lazy(() => import("./pages/Fields/CheckboxSNDoc")),
  },
  {
    id: "anexar-documento",
    label: "Anexar Documento",
    category: "Formulários",
    component: lazy(() => import("./pages/AnexarDocumento/AnexarDocumentoDoc")),
  },
  {
    id: "filter-form",
    label: "FilterForm / FilterActions",
    category: "Formulários",
    component: lazy(() => import("./pages/FilterForm/FilterFormDoc")),
  },
  {
    id: "form-actions",
    label: "FormActions",
    category: "Formulários",
    component: lazy(() => import("./pages/FormActions/FormActionsDoc")),
  },
  {
    id: "lista-busca-acao",
    label: "ListaBuscaAcao",
    category: "Formulários",
    component: lazy(() => import("./pages/ListaBuscaAcao/ListaBuscaAcaoDoc")),
  },
  {
    id: "lista-arrastavel",
    label: "ListaArrastavel",
    category: "Formulários",
    component: lazy(() => import("./pages/ListaArrastavel/ListaArrastavelDoc")),
  },
  {
    id: "card-radio-group",
    label: "CardRadioGroup",
    category: "Formulários",
    component: lazy(() => import("./pages/CardRadioGroup/CardRadioGroupDoc")),
  },
  {
    id: "radio-card-group",
    label: "RadioCardGroup",
    category: "Formulários",
    component: lazy(() => import("./pages/RadioCardGroup/RadioCardGroupDoc")),
  },
  {
    id: "dropdown-base-legal",
    label: "DropdownBaseLegal",
    category: "Formulários",
    component: lazy(() => import("./pages/DropdownBaseLegal/DropdownBaseLegalDoc")),
  },
  {
    id: "secao-formulario",
    label: "SecaoFormulario",
    category: "Formulários",
    component: lazy(() => import("./pages/SecaoFormulario/SecaoFormularioDoc")),
  },
  // ── Utilitários ────────────────────────────────────────────
  {
    id: "unsaved-changes-warning",
    label: "UnsavedChangesWarning",
    category: "Utilitários",
    component: lazy(() => import("./pages/UnsavedChangesWarning/UnsavedChangesWarningDoc")),
  },
  {
    id: "utils",
    label: "Utilitários (funções)",
    category: "Utilitários",
    component: lazy(() => import("./pages/Utils/UtilsDoc")),
  },
  {
    id: "tokens-colors",
    label: "Tokens: Cores",
    category: "Tokens",
    component: lazy(() => import("./pages/Tokens/ColorsDoc")),
  },
  {
    id: "assets-images",
    label: "Assets: Imagens",
    category: "Assets",
    component: lazy(() => import("./pages/Assets/ImagesDoc")),
  },
  {
    id: "oauth2lib",
    label: "OAuth2Lib",
    category: "Utilitários",
    component: lazy(() => import("./pages/OAuth2/OAuth2SeplagDoc")),
  },
  {
    id: "interfaces",
    label: "Interfaces",
    category: "Utilitários",
    component: lazy(() => import("./pages/Interfaces/InterfacesDoc")),
  },
  {
    id: "generator",
    label: "generate (CLI)",
    category: "Utilitários",
    component: lazy(() => import("./pages/Generator/GeneratorDoc")),
  },
  // ── Feedback ───────────────────────────────────────────────
  {
    id: "loader",
    label: "Loader",
    category: "Feedback",
    component: lazy(() => import("./pages/Loader/LoaderDoc")),
  },
  {
    id: "skeleton-seplag",
    label: "Skeleton",
    category: "Feedback",
    component: lazy(() => import("./pages/Skeleton/SkeletonSeplagDoc")),
  },
  {
    id: "mensagem",
    label: "Mensagem",
    category: "Feedback",
    component: lazy(() => import("./pages/Mensagem/MensagemDoc")),
  },
  {
    id: "toast",
    label: "Toast",
    category: "Feedback",
    component: lazy(() => import("./pages/Toast/ToastDoc")),
  },
  {
    id: "simple-loader",
    label: "SimpleLoader",
    category: "Feedback",
    component: lazy(() => import("./pages/SimpleLoader/SimpleLoaderDoc")),
  },
  {
    id: "skeleton-simples",
    label: "SkeletonSimples",
    category: "Feedback",
    component: lazy(() => import("./pages/SkeletonSimples/SkeletonSimplesDoc")),
  },
  // ── Exibição ───────────────────────────────────────────────
  {
    id: "badge",
    label: "Badge",
    category: "Exibição",
    component: lazy(() => import("./pages/Badge/BadgeDoc")),
  },
  {
    id: "barra-proporcional",
    label: "Barra Proporcional",
    category: "Exibição",
    component: lazy(() => import("./pages/BarraProporcional/BarraProporcionalDoc")),
  },
  {
    id: "resumo-valores",
    label: "Resumo de Valores",
    category: "Exibição",
    component: lazy(() => import("./pages/ResumoValores/ResumoValoresDoc")),
  },
  {
    id: "status-card",
    label: "StatusCard",
    category: "Exibição",
    component: lazy(() => import("./pages/StatusCard/StatusCardDoc")),
  },
  {
    id: "status-card-group",
    label: "StatusCardGroup",
    category: "Exibição",
    component: lazy(() => import("./pages/StatusCardGroup/StatusCardGroupDoc")),
  },
  {
    id: "linha-do-tempo",
    label: "Linha do Tempo",
    category: "Exibição",
    component: lazy(() => import("./pages/LinhaDoTempo/LinhaDoTempoDoc")),
  },
  {
    id: "rotulo",
    label: "Rótulo",
    category: "Exibição",
    component: lazy(() => import("./pages/Rotulo/RotuloDoc")),
  },
  {
    id: "picklist",
    label: "PickList",
    category: "Exibição",
    component: lazy(() => import("./pages/PickList/PickListDoc")),
  },
  {
    id: "lista-simples",
    label: "ListaSimples",
    category: "Exibição",
    component: lazy(() => import("./pages/ListaSimples/ListaSimplesDoc")),
  },
  {
    id: "status-by-datafim",
    label: "StatusByDataFimChip (Deprecated)",
    category: "Exibição",
    component: lazy(() => import("./pages/StatusByDataFimChip/StatusByDataFimChipDoc")),
  },
  {
    id: "status-by-filter",
    label: "StatusByFilterChip (Deprecated)",
    category: "Exibição",
    component: lazy(() => import("./pages/StatusByFilterChip/StatusByFilterChipDoc")),
  },
  // ── Layout ─────────────────────────────────────────────────
  {
    id: "app-topbar",
    label: "AppTopbar",
    category: "Layout",
    component: lazy(() => import("./pages/AppTopbar/AppTopbarDoc")),
  },
  {
    id: "app-switcher",
    label: "AppSwitcher",
    category: "Layout",
    component: lazy(() => import("./pages/AppSwitcher/AppSwitcherDoc")),
  },
  {
    id: "app-footer",
    label: "AppFooter",
    category: "Layout",
    component: lazy(() => import("./pages/AppFooter/AppFooterDoc")),
  },
  {
    id: "app-menu",
    label: "AppMenu",
    category: "Layout",
    component: lazy(() => import("./pages/AppMenu/AppMenuDoc")),
  },
  {
    id: "app-profile",
    label: "AppProfile",
    category: "Layout",
    component: lazy(() => import("./pages/AppProfile/AppProfileDoc")),
  },
  {
    id: "app-submenu",
    label: "AppSubmenu",
    category: "Layout",
    component: lazy(() => import("./pages/AppSubmenu/AppSubmenuDoc")),
  },
  {
    id: "app-submenu-item",
    label: "AppSubmenuItem",
    category: "Layout",
    component: lazy(() => import("./pages/AppSubmenuItem/AppSubmenuItemDoc")),
  },
  {
    id: "layout",
    label: "Layout",
    category: "Layout",
    component: lazy(() => import("./pages/Layout/LayoutDoc")),
  },
  {
    id: "card",
    label: "Card",
    category: "Layout",
    component: lazy(() => import("./pages/Card/CardDoc")),
  },
  {
    id: "breadcrumb",
    label: "Breadcrumb",
    category: "Layout",
    component: lazy(() => import("./pages/Breadcrumb/BreadcrumbDoc")),
  },
  {
    id: "accordion-card",
    label: "AccordionCard",
    category: "Layout",
    component: lazy(() => import("./pages/AccordionCard/AccordionCardDoc")),
  },
  {
    id: "panel-seplag",
    label: "Panel",
    category: "Layout",
    component: lazy(() => import("./pages/Panel/PanelSeplagDoc")),
  },
  {
    id: "divider",
    label: "Divider",
    category: "Layout",
    component: lazy(() => import("./pages/Divider/DividerDoc")),
  },
  {
    id: "entity-info-card",
    label: "EntityInfoCard",
    category: "Layout",
    component: lazy(() => import("./pages/EntityInfoCard/EntityInfoCardDoc")),
  },
  {
    id: "tabs",
    label: "Tabs",
    category: "Layout",
    component: lazy(() => import("./pages/Tabs/TabsDoc")),
  },
  {
    id: "accordion",
    label: "Accordion",
    category: "Layout",
    component: lazy(() => import("./pages/Accordion/AccordionDoc")),
  },
  {
    id: "table-paginado",
    label: "TablePaginado",
    category: "Layout",
    component: lazy(() => import("./pages/TablePaginado/TablePaginadoDoc")),
  },
  {
    id: "tabela-editavel",
    label: "TabelaEditavel",
    category: "Layout",
    component: lazy(() => import("./pages/TabelaEditavel/TabelaEditavelDoc")),
  },
  {
    id: "table-group",
    label: "TableGroup",
    category: "Layout",
    component: lazy(() => import("./pages/TableGroup/TableGroupDoc")),
  },
  {
    id: "app-sidebar-version",
    label: "AppSidebarVersion",
    category: "Layout",
    component: lazy(() => import("./pages/AppSidebarVersion/AppSidebarVersionDoc")),
  },
  {
    id: "pagina-inicial",
    label: "PaginaInicial",
    category: "Layout",
    component: lazy(() => import("./pages/PaginaInicial/PaginaInicialDoc")),
  },
  // ── Roteamento ─────────────────────────────────────────────
  {
    id: "app-router",
    label: "AppRouter",
    category: "Roteamento",
    component: lazy(() => import("./pages/AppRouter/AppRouterDoc")),
  },
  {
    id: "permissao-negada-redirect",
    label: "PermissaoNegadaRedirect",
    category: "Roteamento",
    component: lazy(() => import("./pages/PermissaoNegadaRedirect/PermissaoNegadaRedirectDoc")),
  },
  {
    id: "not-found",
    label: "NotFound",
    category: "Roteamento",
    component: lazy(() => import("./pages/NotFound/NotFoundDoc")),
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getDocsByCategory(): DocCategory[] {
  const map = new Map<string, DocEntry[]>();
  for (const entry of docEntries) {
    if (!map.has(entry.category)) map.set(entry.category, []);
    const bucket = map.get(entry.category);
    if (bucket) bucket.push(entry);
  }
  const categories = Array.from(map.entries()).map(([label, entries]) => ({
    label,
    entries: entries.toSorted((a, b) =>
      a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }),
    ),
  }));
  return categories.sort((a, b) =>
    a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }),
  );
}

export function getDocEntry(id: string): DocEntry | undefined {
  return docEntries.find((e) => e.id === id);
}

export function getFirstDocEntry(): DocEntry | undefined {
  return docEntries[0];
}

export { docEntries };
