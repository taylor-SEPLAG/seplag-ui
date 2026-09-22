import { FileUpload, type ItemTemplateOptions } from "primereact/fileupload";
import { useCallback, useMemo } from "react";
import { BotaoIconSeplag } from "../Botao";
import RotuloSeplag from "../Rotulo";

export interface AnexarDocumentoSeplagProps {
  readonly name?: string;
  readonly fileUploadRef?: React.RefObject<FileUpload>;
  readonly arquivoBase64?: {
    nome: string;
    extensao: string;
    contentType: string;
    conteudoEmBase64: string;
  } | null;
  readonly handleViewArquivo: () => void;
  readonly onUploadDocument?: (event: any) => void;
  readonly onRemoveArquivo?: () => void;
  readonly hideLabel?: boolean;
  readonly label?: string;
  readonly cols?: string;
  readonly dragDrop?: boolean;
  readonly accept?: string;
  readonly maxFileSize?: number;
  readonly chooseLabel?: string;
  readonly helperText?: React.ReactNode;
  readonly emptyTemplateText?: string;
  readonly invalidFileSizeMessageDetail?: string;
  readonly canView?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function AnexarDocumentoSeplag(props: AnexarDocumentoSeplagProps) {
  const {
    name,
    arquivoBase64,
    fileUploadRef,
    handleViewArquivo,
    onUploadDocument,
    onRemoveArquivo,
    hideLabel,
    label,
    cols,
    dragDrop = false,
    accept = "application/pdf",
    maxFileSize = 2000000,
    chooseLabel = "Anexar documento",
    helperText = "Formato aceito: .pdf | Tamanho máximo: 2MB",
    emptyTemplateText = "Arraste e solte o arquivo aqui",
    invalidFileSizeMessageDetail = "Tamanho Máximo do Arquivo Não Permitido. Tamanho Máximo de {1}.",
    canView = true,
    className,
    style,
  } = props;

  const handleView = useCallback(() => handleViewArquivo?.(), [handleViewArquivo]);
  const handleRemove = useCallback(() => onRemoveArquivo?.(), [onRemoveArquivo]);

  const inputId = name ?? "anexar-documento";

  const headerTemplate = useCallback(
    (options: { chooseButton: React.ReactNode }) => (
      <div
        className="flex align-items-center w-full"
        style={{ backgroundColor: "#e5e7eb", padding: "0.35rem" }}
      >
        {options.chooseButton}
      </div>
    ),
    [],
  );

  const emptyTemplate = useCallback(
    () => (
      <div
        className="flex align-items-center p-2"
        style={{
          backgroundColor: "#ffffff",
          minHeight: "74px",
        }}
      >
        <small style={{ color: "#4b5563" }}>{emptyTemplateText}</small>
      </div>
    ),
    [emptyTemplateText],
  );

  const itemTemplate = useCallback(
    (file: object, options: ItemTemplateOptions) => {
      const selectedFile = file as File;

      return (
        <div className="flex align-items-center justify-content-between w-full p-3">
          <div>
            <div>{selectedFile.name}</div>
            <small>{options.formatSize}</small>
          </div>
          {onRemoveArquivo && (
            <BotaoIconSeplag
              type="button"
              id={`${inputId}-item-remover`}
              data-testid={`${inputId}-item-remover`}
              className="p-link text-red-500"
              icon="pi pi-times"
              onClick={options.onRemove}
              aria-label="Remover arquivo"
            />
          )}
        </div>
      );
    },
    [onRemoveArquivo, inputId],
  );

  const content = useMemo(
    () => (
      <>
        {arquivoBase64 && (
          <div
            className="mb-2 p-2 border-round"
            style={{
              backgroundColor: "#f0f9ff",
              border: "1px solid #bfdbfe",
            }}
          >
            <div className="flex align-items-center justify-content-between">
              <div className="flex align-items-center gap-2">
                <i
                  className="pi pi-file-pdf"
                  style={{
                    fontSize: "1.2rem",
                    color: "#dc2626",
                  }}
                />
                <span className="font-semibold" style={{ color: "#1e40af" }}>
                  {arquivoBase64.nome}
                </span>
              </div>
              <div className="flex gap-2">
                <BotaoIconSeplag
                  id={`${inputId}-visualizar`}
                  data-testid={`${inputId}-visualizar`}
                  icon="pi pi-eye"
                  tooltip="Visualizar documento"
                  onClick={handleView}
                  disabled={!canView}
                />
                {onRemoveArquivo && (
                  <BotaoIconSeplag
                    id={`${inputId}-remover`}
                    data-testid={`${inputId}-remover`}
                    icon="pi pi-times"
                    severity="danger"
                    tooltip="Remover arquivo"
                    onClick={handleRemove}
                  />
                )}
              </div>
            </div>
          </div>
        )}
        {!arquivoBase64 && (
          <>
            {dragDrop ? (
              <FileUpload
                ref={fileUploadRef}
                customUpload={true}
                mode="advanced"
                chooseLabel={chooseLabel}
                headerTemplate={headerTemplate}
                emptyTemplate={emptyTemplate}
                itemTemplate={itemTemplate}
                invalidFileSizeMessageDetail={invalidFileSizeMessageDetail}
                accept={accept}
                onSelect={onUploadDocument}
                maxFileSize={maxFileSize}
                className="w-full"
                pt={{
                  root: { id: inputId, "data-testid": inputId, style: { borderRadius: "2px" } },
                  buttonbar: {
                    className: "p-0 border-none",
                  },
                  chooseButton: {
                    className: "white-space-nowrap justify-content-center",
                    style: {
                      minWidth: "auto",
                      width: "auto",
                    },
                  },
                  content: { className: "p-0" },
                }}
              />
            ) : (
              <FileUpload
                ref={fileUploadRef}
                customUpload={true}
                mode="basic"
                chooseLabel={chooseLabel}
                invalidFileSizeMessageDetail={invalidFileSizeMessageDetail}
                accept={accept}
                onSelect={onUploadDocument}
                maxFileSize={maxFileSize}
                className="w-full flex"
                pt={{
                  root: { id: inputId, "data-testid": inputId },
                  chooseButton: {
                    className:
                      "w-full surface-400 border-none hover:surface-500 white-space-nowrap justify-content-center",
                  },
                }}
              />
            )}
            <small className="block mt-1">
              {dragDrop ? helperText : "Formato aceito: .pdf | Tamanho máximo: 2MB"}
            </small>
          </>
        )}
      </>
    ),
    [
      arquivoBase64,
      canView,
      inputId,
      fileUploadRef,
      onUploadDocument,
      onRemoveArquivo,
      handleView,
      handleRemove,
      dragDrop,
      chooseLabel,
      headerTemplate,
      emptyTemplate,
      itemTemplate,
      invalidFileSizeMessageDetail,
      accept,
      maxFileSize,
      helperText,
    ],
  );

  if (hideLabel) {
    return (
      <div className={className ?? cols ?? "col-12 md:col-4"} style={style}>
        {content}
      </div>
    );
  }

  return (
    <RotuloSeplag nome={label || "Anexar Documento"} cols={cols || "12 4"}>
      <div className={className} style={style}>
        {content}
      </div>
    </RotuloSeplag>
  );
}

export default AnexarDocumentoSeplag;
