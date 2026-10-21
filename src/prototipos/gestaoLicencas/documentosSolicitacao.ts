import type { ArquivoAnexadoSeplag } from "../../componentes/AnexarDocumento";
export function lerDocumento(file: File): Promise<ArquivoAnexadoSeplag> {
  const extensao = file.name.split(".").pop()?.toLowerCase() ?? "";
  const tipos: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  if (
    !tipos[extensao] ||
    (file.type &&
      file.type !== tipos[extensao] &&
      file.type !== "application/octet-stream")
  )
    return Promise.reject(Error("Selecione um documento PDF, DOC ou DOCX."));
  if (file.size > 10000000)
    return Promise.reject(Error("O documento deve ter no máximo 10MB."));
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(Error("Não foi possível ler o documento."));
    leitor.onload = () =>
      resolve({
        nome: file.name,
        extensao,
        contentType: tipos[extensao],
        conteudoEmBase64: String(leitor.result).split(",")[1],
        tamanho: file.size,
      });
    leitor.readAsDataURL(file);
  });
}
export function abrirDocumento(arquivo?: ArquivoAnexadoSeplag, baixar = false) {
  if (!arquivo) return;
  const bytes = Uint8Array.from(atob(arquivo.conteudoEmBase64), (c) =>
    c.charCodeAt(0),
  );
  const url = URL.createObjectURL(
    new Blob([bytes], { type: arquivo.contentType }),
  );
  const link = document.createElement("a");
  link.href = url;
  if (baixar) link.download = arquivo.nome;
  else {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
