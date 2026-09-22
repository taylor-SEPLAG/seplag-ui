import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Controller, type FieldValues, type Path } from "react-hook-form";
import { Link } from "react-router-dom";

import { useToastSeplag } from "../../hooks/toast";
import gridCss from "../../uteis/Grid";
import { BadgeSeplag } from "../Badge";
import Base64FileModalSeplag from "../Base64FileModal";
import { BotaoSeplag } from "../Botao";
import { FieldError } from "../Fields/FieldError";
import { isFieldObrigatorio, resolveFieldRules } from "../Fields/utils/resolveFieldRules";
import { ModalDeleteSeplag } from "../ModalDelete";
import { RotuloSeplag } from "../Rotulo";

import {
  filterDocumentos,
  getVariantByTipo,
  mapToDocumentosLegaisSeplag,
} from "./helpers/documentoLegalHelpers";

import styles from "./DropdownBaseLegal.module.css";
import { useDocumentoSelection } from "./hooks/useDocumentoSelection";
import type {
  DocumentoLegalApiSeplag,
  DocumentoLegalTipoCorMapSeplag,
  DocumentoLegalTipoMapSeplag,
  DropdownBaseLegalSeplagProps,
  FileSelecionadoSeplag,
  NormalizedDocumentoSeplag,
} from "./types";

const PAGE_SIZE = 20;
const MAX_VISIBLE_SELECTED_ITEMS = 3;

type GetOptionTitle = (documento: NormalizedDocumentoSeplag) => string;
type GetOptionDescription = (documento: NormalizedDocumentoSeplag) => string;

const defaultOptionTitle: GetOptionTitle = (documento) =>
  `${documento.tipo} nº ${documento.numrDocumentoLegal}/${documento.anoVigencia}`;
const defaultOptionDescription: GetOptionDescription = (documento) => documento.label;

interface DropdownInnerProps {
  readonly value: number[];
  readonly onChange: (ids: number[]) => void;
  readonly disabled: boolean;
  readonly fieldName: string;
  readonly invalid?: boolean;
  readonly documentos: ReadonlyArray<DocumentoLegalApiSeplag>;
  readonly isLoading?: boolean;
  readonly tipoMap?: DocumentoLegalTipoMapSeplag;
  readonly corMap?: DocumentoLegalTipoCorMapSeplag;
  readonly confirmarRemocao?: boolean;
  readonly getOptionTitle?: GetOptionTitle;
  readonly getOptionDescription?: GetOptionDescription;
  readonly onSelectionChange?: (selected: NormalizedDocumentoSeplag[]) => void;
  readonly indicarAplicavel?: boolean;
  readonly aplicavelId?: number | null;
  readonly onAplicavelChange?: (id: number | null) => void;
  readonly aplicavelLabel?: string;
  readonly maxSelecionados?: number;
}

function isSameIds(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((id) => setB.has(id));
}

function renderOptionsContent({
  isLoading,
  options,
  selectedSet,
  toggleDocument,
  getOptionTitle,
  getOptionDescription,
  selecaoUnica = false,
}: {
  isLoading: boolean;
  options: NormalizedDocumentoSeplag[];
  selectedSet: Set<number>;
  toggleDocument: (doc: NormalizedDocumentoSeplag) => void;
  getOptionTitle: GetOptionTitle;
  getOptionDescription: GetOptionDescription;
  selecaoUnica?: boolean;
}) {
  if (isLoading) {
    return (
      <div className={styles.loadingMore}>
        <i className="pi pi-spin pi-spinner" style={{ marginRight: "8px" }} />
        <span>Carregando documentos...</span>
      </div>
    );
  }

  if (!options.length) {
    return (
      <div className={styles.loadingMore}>
        <i className="pi pi-search" style={{ marginRight: "8px" }} />
        <span>Nenhum documento encontrado</span>
      </div>
    );
  }

  return options.map((documento) => {
    const checked = selectedSet.has(documento.id);
    const title = getOptionTitle(documento);
    const description = getOptionDescription(documento);

    return (
      <label
        className={`${styles.option} ${checked ? styles.optionSelected : ""}`}
        key={documento.id}
      >
        <input
          type={selecaoUnica ? "radio" : "checkbox"}
          name={selecaoUnica ? "documento-base-legal-radio" : undefined}
          className={styles.optionCheckbox}
          checked={checked}
          aria-label={title}
          onChange={() => {
            if (selecaoUnica && checked) return;
            toggleDocument(documento);
          }}
        />
        <span className={styles.optionBody}>
          <strong className={styles.optionNumero}>{title}</strong>
          <span className={styles.optionDescricao} title={documento.fullName}>
            {description}
          </span>
        </span>
      </label>
    );
  });
}

function DropdownInner({
  value,
  onChange,
  disabled,
  fieldName,
  invalid,
  documentos,
  isLoading = false,
  tipoMap,
  confirmarRemocao = true,
  getOptionTitle = defaultOptionTitle,
  getOptionDescription = defaultOptionDescription,
  onSelectionChange,
  indicarAplicavel = false,
  aplicavelId = null,
  onAplicavelChange,
  aplicavelLabel = "Lei aplicável",
  maxSelecionados,
}: Readonly<DropdownInnerProps>) {
  const { toastAtencao } = useToastSeplag();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputShellRef = useRef<HTMLDivElement | null>(null);
  const selectedListRef = useRef<HTMLDivElement | null>(null);
  const optionsRef = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isVisivelModal, setIsVisivelModal] = useState(false);
  const [fileSelecionado, setFileSelecionado] = useState<FileSelecionadoSeplag | null>(null);
  const [removalCandidate, setRemovalCandidate] = useState<NormalizedDocumentoSeplag | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [dropdownZIndex, setDropdownZIndex] = useState(1000);

  const normalizedDocumentos = useMemo(() => mapToDocumentosLegaisSeplag(documentos), [documentos]);

  const allNormalizedDocumentos = useMemo(
    () => filterDocumentos(normalizedDocumentos, "", tipoMap),
    [normalizedDocumentos, tipoMap],
  );

  const filteredDocumentos = useMemo(
    () => filterDocumentos(normalizedDocumentos, search, tipoMap),
    [normalizedDocumentos, search, tipoMap],
  );

  const options = useMemo(
    () => filteredDocumentos.slice(0, visibleCount),
    [filteredDocumentos, visibleCount],
  );
  const hasMore = visibleCount < filteredDocumentos.length;

  const { selected, setSelected } = useDocumentoSelection();

  useEffect(() => {
    if (allNormalizedDocumentos.length === 0) return;
    const idsForm = Array.isArray(value) ? value : [];

    setSelected((prev) => {
      const idsLocal = prev.map((d) => d.id);
      if (isSameIds(idsForm, idsLocal)) return prev;

      if (idsForm.length === 0) {
        return prev.length === 0 ? prev : [];
      }

      const docs = allNormalizedDocumentos.filter((d) => idsForm.includes(d.id));
      const novosIds = docs.map((d) => d.id);
      if (isSameIds(novosIds, idsLocal)) return prev;
      return docs;
    });
  }, [value, allNormalizedDocumentos, setSelected]);

  const dropdownPortalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (dropdownPortalRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const atualizarPosicao = () => {
      const rect = inputShellRef.current?.getBoundingClientRect();
      if (!rect) return;
      setDropdownPos({ top: rect.bottom + 8, left: rect.left, width: rect.width });
    };

    atualizarPosicao();
    window.addEventListener("scroll", atualizarPosicao, true);
    window.addEventListener("resize", atualizarPosicao);
    return () => {
      window.removeEventListener("scroll", atualizarPosicao, true);
      window.removeEventListener("resize", atualizarPosicao);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let maiorZIndex = 1000;
    let elemento = inputShellRef.current?.parentElement ?? null;
    while (elemento) {
      const zIndexStr = window.getComputedStyle(elemento).zIndex;
      const zIndex = Number(zIndexStr);
      if (!Number.isNaN(zIndex)) maiorZIndex = Math.max(maiorZIndex, zIndex);
      elemento = elemento.parentElement;
    }
    document
      .querySelectorAll<HTMLElement>(".p-dialog, .p-sidebar, .p-overlaypanel")
      .forEach((el) => {
        const zIndex = Number(window.getComputedStyle(el).zIndex);
        if (!Number.isNaN(zIndex)) maiorZIndex = Math.max(maiorZIndex, zIndex);
      });
    setDropdownZIndex(maiorZIndex + 10);
  }, [isOpen]);

  const shouldScrollSelectedList = selected.length > MAX_VISIBLE_SELECTED_ITEMS;

  useEffect(() => {
    const list = selectedListRef.current;
    if (!list || !shouldScrollSelectedList) return;
    list.scrollTop = list.scrollHeight;
  }, [selected.length, shouldScrollSelectedList]);

  const commit = useCallback(
    (novos: NormalizedDocumentoSeplag[]) => {
      setSelected(novos);
      const ids = novos.map((d) => d.id);
      onChange(ids);
      onSelectionChange?.(novos);

      if (!indicarAplicavel) return;
      if (novos.length === 1) {
        if (novos[0].id !== aplicavelId) onAplicavelChange?.(novos[0].id);
        return;
      }
      if (aplicavelId != null && !ids.includes(aplicavelId)) {
        onAplicavelChange?.(null);
      }
    },
    [setSelected, onChange, onSelectionChange, indicarAplicavel, aplicavelId, onAplicavelChange],
  );

  const selectedSet = useMemo(() => new Set(selected.map((doc) => doc.id)), [selected]);

  const marcarAplicavel = useCallback(
    (id: number) => {
      if (!selectedSet.has(id)) return;
      onAplicavelChange?.(id);
    },
    [selectedSet, onAplicavelChange],
  );

  const idAplicavelEfetivo = indicarAplicavel
    ? selected.length === 1
      ? selected[0].id
      : aplicavelId
    : null;

  const toggleDocument = useCallback(
    (doc: NormalizedDocumentoSeplag) => {
      if (selectedSet.has(doc.id)) {
        commit(selected.filter((item) => item.id !== doc.id));
        return;
      }
      if (maxSelecionados === 1) {
        commit([doc]);
        setIsOpen(false);
        return;
      }
      if (maxSelecionados != null && selected.length >= maxSelecionados) {
        toastAtencao(`Só é possível selecionar até ${maxSelecionados} documentos.`);
        return;
      }
      commit([...selected, doc]);
    },
    [commit, selected, selectedSet, maxSelecionados, toastAtencao],
  );

  const handleRequestRemove = useCallback(
    (id: number) => {
      const doc = selected.find((d) => d.id === id);
      if (!doc) return;
      if (!confirmarRemocao) {
        toggleDocument(doc);
        return;
      }
      setRemovalCandidate(doc);
    },
    [selected, confirmarRemocao, toggleDocument],
  );

  const handleConfirmRemove = useCallback(() => {
    if (!removalCandidate) return;
    commit(selected.filter((d) => d.id !== removalCandidate.id));
    setRemovalCandidate(null);
  }, [commit, selected, removalCandidate]);

  const handleCancelRemove = useCallback(() => {
    setRemovalCandidate(null);
  }, []);

  const handleViewSelected = useCallback(
    (doc: NormalizedDocumentoSeplag) => {
      if (!doc.arquivo?.conteudoEmBase64) {
        toastAtencao("Documento sem arquivo disponível", "Visualização Indisponível");
        return;
      }
      setFileSelecionado({
        arquivo: {
          conteudoEmBase64: doc.arquivo.conteudoEmBase64,
          contentType: doc.arquivo.contentType || "application/pdf",
          label: doc.arquivo.nome || doc.nomeDocumentoLegal,
        },
      });
      setIsVisivelModal(true);
    },
    [toastAtencao],
  );

  const handleOptionsScroll = useCallback(() => {
    const el = optionsRef.current;
    if (!el || !hasMore) return;
    const threshold = 60;
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= threshold) {
      setVisibleCount((count) => count + PAGE_SIZE);
    }
  }, [hasMore]);

  let searchPlaceholder = "Buscar documentos legais...";
  if (isLoading) {
    searchPlaceholder = "Carregando documentos...";
  } else if (selected.length) {
    searchPlaceholder = "";
  }

  return (
    <div ref={rootRef} style={{ position: "relative", width: "100%" }}>
      <ModalDeleteSeplag
        id={`${fieldName}-delete-modal`}
        visible={removalCandidate !== null}
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
        message={
          removalCandidate
            ? `Deseja realmente remover o documento [${removalCandidate.tipo}] ${removalCandidate.numrDocumentoLegal}/${removalCandidate.anoVigencia}?`
            : undefined
        }
      />
      <Base64FileModalSeplag
        id={`${fieldName}-preview-modal`}
        visible={isVisivelModal}
        onHide={() => setIsVisivelModal(false)}
        base64={fileSelecionado?.arquivo?.conteudoEmBase64 ?? null}
        mimeType={fileSelecionado?.arquivo?.contentType ?? "application/octet-stream"}
        fileName={fileSelecionado?.arquivo?.label ?? "arquivo"}
      />

      <div
        ref={inputShellRef}
        className={`${styles.inputShell} ${isOpen ? styles.inputShellOpen : ""} ${
          invalid ? styles.invalid : ""
        }`}
      >
        <i className={`pi pi-search ${styles.searchIcon}`} aria-hidden="true" />
        {selected.map((doc) => (
          <BadgeSeplag
            key={doc.id}
            label={getOptionTitle(doc)}
            variant={getVariantByTipo(doc.tipo)}
            size="sm"
            capitalize={false}
            removable={!disabled}
            onRemove={() => handleRequestRemove(doc.id)}
          />
        ))}
        <input
          id={fieldName}
          data-testid={fieldName}
          className={styles.inlineInput}
          aria-label="Buscar documentos legais associados"
          autoComplete="off"
          value={search}
          disabled={isLoading || disabled}
          placeholder={searchPlaceholder}
          onChange={(event) => {
            setSearch(event.target.value);
            setVisibleCount(PAGE_SIZE);
            setIsOpen(true);
          }}
          onFocus={() => !disabled && setIsOpen(true)}
        />
        {search && (
          <button
            type="button"
            className={styles.clearSearch}
            aria-label="Limpar busca"
            onClick={(event) => {
              event.stopPropagation();
              setSearch("");
              setVisibleCount(PAGE_SIZE);
            }}
          >
            <i className="pi pi-times" aria-hidden="true" />
          </button>
        )}
      </div>

      {isOpen &&
        dropdownPos &&
        createPortal(
          <div
            ref={dropdownPortalRef}
            className={styles.dropdown}
            style={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              margin: 0,
              zIndex: dropdownZIndex,
            }}
          >
            <div
              ref={optionsRef}
              className={`${styles.options} ${options.length === 0 ? styles.optionsEmpty : ""}`}
              onScroll={handleOptionsScroll}
            >
              {renderOptionsContent({
                isLoading,
                options,
                selectedSet,
                toggleDocument,
                getOptionTitle,
                getOptionDescription,
                selecaoUnica: maxSelecionados === 1,
              })}
              {hasMore && options.length > 0 && (
                <div className={styles.loadingMore}>Carregando mais...</div>
              )}
            </div>
            <div className={styles.dropdownFooter}>
              <span className={styles.selectedCount}>
                {selected.length} selecionado{selected.length === 1 ? "" : "s"}
              </span>
              <BotaoSeplag
                type="button"
                label="Concluir"
                onClick={() => setIsOpen(false)}
                style={{ height: 32, minWidth: 0, padding: "0 14px", fontSize: "0.8rem" }}
              />
            </div>
          </div>,
          document.body,
        )}

      {indicarAplicavel && selected.length > 1 && idAplicavelEfetivo == null && (
        <div className={styles.aplicavelAviso}>
          <i className="pi pi-exclamation-triangle" aria-hidden="true" /> Marque qual dos documentos
          selecionados é o {aplicavelLabel.toLowerCase()}.
        </div>
      )}

      {selected.length > 0 && (
        <div
          className={`${styles.selectedList} ${
            shouldScrollSelectedList ? styles.selectedListScrollable : ""
          }`}
          ref={selectedListRef}
        >
          {selected.map((doc) => {
            const variant = getVariantByTipo(doc.tipo);
            const ehAplicavel = indicarAplicavel && idAplicavelEfetivo === doc.id;
            const radioHabilitado = indicarAplicavel && !disabled && selected.length > 1;
            return (
              <div
                className={`${styles.selectedRow} ${
                  indicarAplicavel ? styles.selectedRowComAplicavel : ""
                }`}
                key={doc.id}
              >
                {indicarAplicavel && (
                  <label
                    className={styles.aplicavelRadioWrap}
                    title={`Marcar como ${aplicavelLabel.toLowerCase()}`}
                  >
                    <input
                      type="radio"
                      name={`${fieldName}-aplicavel`}
                      className={styles.aplicavelRadio}
                      checked={ehAplicavel}
                      disabled={!radioHabilitado}
                      onChange={() => marcarAplicavel(doc.id)}
                      aria-label={`Marcar ${getOptionTitle(doc)} como ${aplicavelLabel.toLowerCase()}`}
                    />
                  </label>
                )}
                <div className={styles.selectedInfo}>
                  <div className={styles.selectedTitle}>
                    {getOptionTitle(doc)}
                    {ehAplicavel && (
                      <BadgeSeplag
                        label={aplicavelLabel}
                        icon="pi pi-star-fill text-xs"
                        variant="warning"
                        size="xs"
                        customStyle={{ marginLeft: 8 }}
                      />
                    )}
                  </div>
                  <div className={styles.selectedDescription} title={doc.fullName}>
                    {getOptionDescription(doc)}
                  </div>
                </div>
                <BadgeSeplag label={doc.tipo} size="xs" minWidth={120} variant={variant} />
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => handleViewSelected(doc)}
                  aria-label={`Visualizar documento ${doc.nomeDocumentoLegal}`}
                >
                  <i className="pi pi-eye" />
                </button>
                {!disabled && (
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => handleRequestRemove(doc.id)}
                    aria-label={`Remover documento ${doc.nomeDocumentoLegal}`}
                  >
                    <i className="pi pi-times" />
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

function StandaloneDropdown(
  props: Readonly<
    Omit<DropdownInnerProps, "value" | "onChange"> & {
      value?: readonly number[];
      onChange?: (ids: number[]) => void;
    }
  >,
) {
  const { value, onChange, ...rest } = props;
  const [idsInternos, setIdsInternos] = useState<number[]>([]);
  const controlado = value !== undefined;
  const ids = controlado ? (value as number[]) : idsInternos;

  return (
    <DropdownInner
      {...rest}
      value={ids}
      onChange={(novosIds) => {
        if (!controlado) setIdsInternos(novosIds);
        onChange?.(novosIds);
      }}
    />
  );
}

export function DropdownBaseLegalSeplag<T extends FieldValues = FieldValues>(
  props: Readonly<DropdownBaseLegalSeplagProps<T>>,
) {
  const {
    name,
    control,
    required = false,
    onSelectionChange,
    cols = "12",
    disabled = false,
    label,
    documentos,
    isLoading = false,
    tipoMap,
    confirmarRemocao,
    getOptionTitle,
    getOptionDescription,
    addNewHref,
    addNewTarget,
    addNewLabel,
    onAddNewClick,
    showAddNewLink = false,
    rules,
    indicarAplicavel = false,
    nameAplicavel,
    requiredAplicavel = false,
    aplicavelRequiredMessage = "Marque qual documento é o aplicável.",
    aplicavelLabel = "Lei aplicável",
    maxSelecionados,
    value,
    singleValue = false,
  } = props;

  const fieldName = (name as string | undefined) ?? "documentoLegalIds";

  const addNewStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    right: "0.5rem",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "#1351b4",
    fontWeight: 700,
    fontSize: "0.875rem",
  };

  const addNewContent = (
    <>
      <i className="pi pi-plus-circle" aria-hidden="true" />
      <span>{addNewLabel ?? "Adicionar documento"}</span>
    </>
  );

  let addNewLink: ReactNode = null;
  if (showAddNewLink && onAddNewClick) {
    addNewLink = (
      <button
        type="button"
        id={`${fieldName}-adicionar`}
        data-testid={`${fieldName}-adicionar`}
        onClick={onAddNewClick}
        style={{ ...addNewStyle, background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        {addNewContent}
      </button>
    );
  } else if (showAddNewLink && addNewHref) {
    addNewLink = (
      <Link
        id={`${fieldName}-adicionar`}
        data-testid={`${fieldName}-adicionar`}
        to={addNewHref}
        target={addNewTarget ?? "_blank"}
        style={addNewStyle}
      >
        {addNewContent}
      </Link>
    );
  }

  if (name && control) {
    const resolvedRules = resolveFieldRules(label ?? fieldName, required, rules);
    const obrigatorio = isFieldObrigatorio(required, resolvedRules);
    const usaAplicavel = indicarAplicavel && Boolean(nameAplicavel);
    const rulesAplicavel = requiredAplicavel ? { required: aplicavelRequiredMessage } : undefined;

    return (
      <div className={gridCss(cols)} style={{ position: "relative" }}>
        {addNewLink}
        <Controller
          name={name}
          control={control}
          rules={resolvedRules}
          render={({ field, fieldState }) => {
            const conteudo = (
              aplicavelField?: {
                value: unknown;
                onChange: (value: number | null) => void;
              },
              aplicavelError?: string,
            ) => (
              <RotuloSeplag
                nome={label || "Documento Base Legal"}
                htmlFor={fieldName}
                obrigatorio={obrigatorio}
                cols=""
              >
                <DropdownInner
                  value={
                    singleValue
                      ? typeof field.value === "number"
                        ? [field.value]
                        : []
                      : Array.isArray(field.value)
                        ? (field.value as number[])
                        : []
                  }
                  onChange={(ids) =>
                    field.onChange(singleValue ? (ids[0] ?? null) : ids)
                  }
                  disabled={disabled}
                  fieldName={fieldName}
                  invalid={Boolean(fieldState.error)}
                  documentos={documentos}
                  isLoading={isLoading}
                  tipoMap={tipoMap}
                  confirmarRemocao={confirmarRemocao}
                  getOptionTitle={getOptionTitle}
                  getOptionDescription={getOptionDescription}
                  onSelectionChange={onSelectionChange}
                  indicarAplicavel={indicarAplicavel}
                  aplicavelId={
                    typeof aplicavelField?.value === "number" ? aplicavelField.value : null
                  }
                  onAplicavelChange={aplicavelField?.onChange}
                  aplicavelLabel={aplicavelLabel}
                  maxSelecionados={maxSelecionados}
                />
                <FieldError id={`${fieldName}-error`}>{fieldState.error?.message}</FieldError>
                {aplicavelError && (
                  <FieldError id={`${fieldName}-aplicavel-error`}>{aplicavelError}</FieldError>
                )}
              </RotuloSeplag>
            );

            if (!usaAplicavel) return conteudo();

            return (
              <Controller
                name={nameAplicavel as Path<T>}
                control={control}
                rules={rulesAplicavel}
                render={({ field: aplicavelField, fieldState: aplicavelFieldState }) =>
                  conteudo(aplicavelField, aplicavelFieldState.error?.message)
                }
              />
            );
          }}
        />
      </div>
    );
  }

  return (
    <div className={gridCss(cols)} style={{ position: "relative" }}>
      {addNewLink}
      <RotuloSeplag
        nome={label || "Documento Base Legal"}
        htmlFor={fieldName}
        obrigatorio={required}
        cols=""
      >
        <StandaloneDropdown
          disabled={disabled}
          fieldName={fieldName}
          documentos={documentos}
          isLoading={isLoading}
          tipoMap={tipoMap}
          confirmarRemocao={confirmarRemocao}
          getOptionTitle={getOptionTitle}
          getOptionDescription={getOptionDescription}
          onSelectionChange={onSelectionChange}
          maxSelecionados={maxSelecionados}
          value={value}
        />
      </RotuloSeplag>
    </div>
  );
}

export default DropdownBaseLegalSeplag;
