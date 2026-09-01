import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeSeplag } from "../Badge";
import styles from "./style.module.css";

export interface DocumentoLegalAssociadoSeplag {
  id: string;
  titulo: string;
  categoria: string;
  descricao?: string;
}

export interface DocumentosLegaisAssociadosSeplagProps {
  label?: string;
  required?: boolean;
  options: DocumentoLegalAssociadoSeplag[];
  value?: string[];
  onChange?: (selectedIds: string[]) => void;
  onNovoCadastro?: () => void;
  onVisualizar?: (documento: DocumentoLegalAssociadoSeplag) => void;
  placeholder?: string;
  filtroPlaceholder?: string;
  exibirNovoCadastro?: boolean;
  expandirAoAbrir?: boolean;
  /** Quando há mais de uma lei selecionada, sinaliza a primeira como a norma aplicável (RN). */
  indicarPrincipal?: boolean;
  /** Modo somente leitura: esconde "Novo Cadastro" e os botões de remover, e impede abrir o painel de busca. */
  disabled?: boolean;
  /** Reduz a altura mínima da caixa de busca para bater com a altura padrão dos demais campos de
   * texto (46px, ver .prototype-ingresso-field input) — útil em formulários curtos como
   * TipoCotaFormContent, onde esse campo divide linha com um input comum. */
  compact?: boolean;
}

const MAX_VISIBLE_SELECTED_ITEMS = 3;

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getCategoriaColors(categoria: string) {
  const key = normalizeText(categoria);

  if (key.includes("decreto")) {
    return { color: "#005ea8", bg: "#e6f3ff" };
  }

  if (key.includes("norma")) {
    return { color: "#6b4f00", bg: "#fff4d6" };
  }

  if (key.includes("portaria")) {
    return { color: "#475569", bg: "#f1f5f9" };
  }

  return { color: "#0072ce", bg: "#e8f3ff" };
}

export function DocumentosLegaisAssociadosSeplag({
  label = "Documentos Legais Associados",
  required = false,
  options,
  value,
  onChange,
  onNovoCadastro,
  onVisualizar,
  placeholder = "Buscar documentos legais...",
  filtroPlaceholder = "Filtrar por número ou descrição...",
  exibirNovoCadastro = true,
  expandirAoAbrir = false,
  indicarPrincipal = false,
  disabled = false,
  compact = false,
}: Readonly<DocumentosLegaisAssociadosSeplagProps>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedListRef = useRef<HTMLDivElement>(null);
  const [internalValue, setInternalValue] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedIds = value ?? internalValue;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const documentsById = useMemo(
    () => new Map(options.map((item) => [item.id, item])),
    [options],
  );
  const selectedDocuments = useMemo(
    () =>
      selectedIds
        .map((id) => documentsById.get(id))
        .filter(
          (documento): documento is DocumentoLegalAssociadoSeplag =>
            Boolean(documento),
        ),
    [documentsById, selectedIds],
  );
  const filteredOptions = useMemo(() => {
    const query = normalizeText(search.trim());
    if (!query) return options;

    return options.filter((item) => {
      const content = normalizeText(
        `${item.titulo} ${item.categoria} ${item.descricao ?? ""}`,
      );
      return content.includes(query);
    });
  }, [options, search]);
  const shouldScrollSelectedList =
    selectedDocuments.length > MAX_VISIBLE_SELECTED_ITEMS;

  const updateSelected = (nextValue: string[]) => {
    if (!value) setInternalValue(nextValue);
    onChange?.(nextValue);
  };

  const toggleDocument = (id: string) => {
    const nextValue = selectedSet.has(id)
      ? selectedIds.filter((item) => item !== id)
      : [...selectedIds, id];

    updateSelected(nextValue);
  };

  const removeDocument = (id: string) => {
    updateSelected(selectedIds.filter((item) => item !== id));
  };

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    const list = selectedListRef.current;
    if (!list || !shouldScrollSelectedList) return;
    list.scrollTop = list.scrollHeight;
  }, [selectedDocuments.length, shouldScrollSelectedList]);

  return (
    <div className={styles.container} ref={rootRef}>
      <div className={styles.header}>
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
        {exibirNovoCadastro && !disabled && (
          <button
            className={styles.novoCadastro}
            type="button"
            onClick={onNovoCadastro}
          >
            <i className="pi pi-plus-circle" aria-hidden="true" />
            Novo Cadastro
          </button>
        )}
      </div>

      <div
        className={`${styles.inputShell} ${compact ? styles.inputShellCompact : ""} ${isOpen ? styles.inputShellOpen : ""}`}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        onClick={() => { if (!disabled) setIsOpen(true); }}
      >
        <i className={`pi pi-search ${styles.searchIcon}`} aria-hidden="true" />
        <div className={styles.chips}>
          {selectedDocuments.map((documento) => (
            <span className={styles.chip} key={documento.id}>
              <span>{documento.titulo}</span>
              {!disabled && (
                <button
                  type="button"
                  aria-label={`Remover ${documento.titulo}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeDocument(documento.id);
                  }}
                >
                  <i className="pi pi-times" aria-hidden="true" />
                </button>
              )}
            </span>
          ))}
          <input
            className={styles.inlineInput}
            aria-label="Buscar documentos legais associados"
            value={search}
            placeholder={selectedDocuments.length ? "" : placeholder}
            disabled={disabled}
            onChange={(event) => {
              setSearch(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => { if (!disabled) setIsOpen(true); }}
          />
        </div>
        {!disabled && (
          <i
            className={`pi ${isOpen ? "pi-chevron-up" : "pi-chevron-down"} ${styles.toggleIcon}`}
            aria-hidden="true"
          />
        )}
      </div>

      {isOpen && !disabled && (
        <div
          className={`${styles.dropdown} ${
            expandirAoAbrir ? styles.dropdownInline : ""
          }`}
        >
          <div className={styles.filterWrap}>
            <input
              className={styles.filterInput}
              value={search}
              placeholder={filtroPlaceholder}
              onChange={(event) => setSearch(event.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.options} role="listbox">
            {filteredOptions.length ? (
              filteredOptions.map((documento) => {
                const checked = selectedSet.has(documento.id);

                return (
                  <label
                    className={`${styles.option} ${
                      checked ? styles.optionSelected : ""
                    }`}
                    key={documento.id}
                  >
                    <input
                      className={styles.checkbox}
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDocument(documento.id)}
                    />
                    <span>
                      <span className={styles.optionTitle}>
                        {documento.titulo}
                      </span>
                      {documento.descricao && (
                        <span className={styles.optionDescription}>
                          {documento.descricao}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })
            ) : (
              <div className={styles.empty}>Nenhum documento encontrado.</div>
            )}
          </div>

          <div className={styles.dropdownFooter}>
            <span className={styles.selectedCount}>
              {selectedDocuments.length} selecionado
              {selectedDocuments.length === 1 ? "" : "s"}
            </span>
            <button
              className={styles.concluir}
              type="button"
              onClick={() => setIsOpen(false)}
            >
              Concluir
            </button>
          </div>
        </div>
      )}

      {selectedDocuments.length > 0 && (
        <div
          className={`${styles.selectedList} ${
            shouldScrollSelectedList ? styles.selectedListScrollable : ""
          }`}
          ref={selectedListRef}
        >
          {selectedDocuments.map((documento, index) => {
            const badgeColors = getCategoriaColors(documento.categoria);
            const ehPrincipal = indicarPrincipal && index === 0;

            return (
              <div className={styles.selectedRow} key={documento.id}>
                <div className={styles.selectedInfo}>
                  <div className={styles.selectedTitle}>
                    {documento.titulo}
                    {ehPrincipal && (
                      <span className={styles.principalTag} title="Primeira lei selecionada — considerada a norma aplicável.">
                        <i className="pi pi-star-fill" aria-hidden="true" /> Lei Aplic
                      </span>
                    )}
                  </div>
                  {documento.descricao && (
                    <div className={styles.selectedDescription}>
                      {documento.descricao}
                    </div>
                  )}
                </div>
                <div className={styles.badge}>
                  <BadgeSeplag
                    label={documento.categoria}
                    color={badgeColors.color}
                    bg={badgeColors.bg}
                    border="transparent"
                    size="xs"
                  />
                </div>
                <button
                  className={styles.iconButton}
                  type="button"
                  aria-label={`Visualizar ${documento.titulo}`}
                  onClick={() => onVisualizar?.(documento)}
                >
                  <i className="pi pi-eye" aria-hidden="true" />
                </button>
                {!disabled && (
                  <button
                    className={styles.iconButton}
                    type="button"
                    aria-label={`Remover ${documento.titulo}`}
                    onClick={() => removeDocument(documento.id)}
                  >
                    <i className="pi pi-times" aria-hidden="true" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DocumentosLegaisAssociadosSeplag;
