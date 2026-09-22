import { Dialog } from "primereact/dialog";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BotaoSeplag } from "../Botao";

export interface Base64FileModalSeplagProps {
  id?: string;
  visible: boolean;
  onHide: () => void;

  /** Base64 puro (sem data:) */
  base64?: string | null;

  /** Ex: application/pdf, image/png, text/plain */
  mimeType: string;

  /** Nome sugerido para download */
  fileName?: string;

  /** Título exibido no cabeçalho do modal. Padrão: "Visualização do arquivo" */
  header?: string;

  /** Largura do modal em unidade CSS. Padrão: "80vw" */
  modalWidth?: string;
}

const base64ToBlob = (b64: string, type: string): Blob => {
  const clean = b64.replaceAll(/\s/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.codePointAt(i) ?? 0;
  }

  return new Blob([bytes], { type });
};

const Base64FileModal = ({
  id = "base64-file-modal",
  visible,
  onHide,
  base64,
  mimeType,
  fileName = "arquivo",
  header = "Visualização do arquivo",
  modalWidth = "80vw",
}: Base64FileModalSeplagProps) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canPreview = useMemo<boolean>(() => {
    return (
      mimeType.startsWith("image/") ||
      mimeType === "application/pdf" ||
      mimeType.startsWith("text/")
    );
  }, [mimeType]);

  useEffect(() => {
    if (!visible || !base64) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const blob = base64ToBlob(base64, mimeType);
      const url = URL.createObjectURL(blob);
      setObjectUrl(url);

      return () => URL.revokeObjectURL(url);
    } catch {
      setError("Erro ao decodificar o arquivo.");
    } finally {
      setLoading(false);
    }
  }, [visible, base64, mimeType]);

  const downloadFile = useCallback((): void => {
    if (!base64) return;

    const url = objectUrl ?? URL.createObjectURL(base64ToBlob(base64, mimeType));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    if (!objectUrl) URL.revokeObjectURL(url);
  }, [base64, mimeType, fileName, objectUrl]);

  const canDownload = !!base64 && !error;

  return (
    <Dialog
      id={id}
      data-testid={id}
      visible={visible}
      onHide={onHide}
      header={header}
      modal
      maximizable
      dismissableMask
      style={{ width: modalWidth }}
      footer={
        <div className="flex gap-2 justify-content-end">
          <BotaoSeplag
            id={`${id}-baixar`}
            data-testid={`${id}-baixar`}
            label="Baixar"
            icon="pi pi-download"
            severity="secondary"
            onClick={downloadFile}
            disabled={!canDownload}
          />
          <BotaoSeplag
            id={`${id}-fechar`}
            data-testid={`${id}-fechar`}
            label="Fechar"
            icon="pi pi-times"
            onClick={onHide}
          />
        </div>
      }
    >
      {loading && (
        <div className="flex justify-content-center p-4">
          <ProgressSpinner />
        </div>
      )}

      {!loading && error && <Message severity="error" text={error} />}

      {!loading && !base64 && (
        <Message severity="warn" text="Nenhum arquivo disponível para exibição." />
      )}

      {!loading && base64 && !canPreview && (
        <Message
          severity="info"
          text="Este tipo de arquivo não suporta visualização. Use o botão Baixar."
        />
      )}

      {!loading && base64 && canPreview && objectUrl && (
        <div style={{ height: "70vh" }}>
          {mimeType === "application/pdf" && (
            <iframe
              src={objectUrl}
              title={`Visualização de ${fileName}`}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
            />
          )}

          {mimeType.startsWith("image/") && (
            <img
              src={objectUrl}
              alt={fileName}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                display: "block",
                margin: "0 auto",
              }}
            />
          )}

          {mimeType.startsWith("text/") && <TextPreview base64={base64} mimeType={mimeType} />}
        </div>
      )}
    </Dialog>
  );
};

/* ================= TEXTO ================= */

interface TextPreviewProps {
  base64: string;
  mimeType: string;
}

const TextPreview: React.FC<TextPreviewProps> = ({ base64, mimeType }) => {
  const [state, setState] = useState<{ text: string | null; error: boolean }>({
    text: null,
    error: false,
  });

  useEffect(() => {
    const blob = new Blob([Uint8Array.from(atob(base64), (c) => c.codePointAt(0) ?? 0)], {
      type: mimeType,
    });

    blob
      .text()
      .then((t) => setState({ text: t, error: false }))
      .catch(() => setState({ text: null, error: true }));
  }, [base64, mimeType]);

  if (state.error) return <Message severity="error" text="Erro ao exibir o conteúdo do arquivo." />;

  if (state.text === null)
    return (
      <div className="flex justify-content-center p-4">
        <ProgressSpinner />
      </div>
    );

  return (
    <pre style={{ whiteSpace: "pre-wrap", height: "100%", overflow: "auto" }}>{state.text}</pre>
  );
};

export default Base64FileModal;
