export function base64ParaBlobSeplag(base64: string, mimeType: string): Blob {
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.codePointAt(i) ?? 0;
  }
  return new Blob([bytes], { type: mimeType });
}

export function baixarArquivoBase64Seplag(
  conteudoEmBase64: string,
  nomeArquivo: string,
  mimeType: string = "application/octet-stream",
): void {
  const blob = base64ParaBlobSeplag(conteudoEmBase64, mimeType);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
