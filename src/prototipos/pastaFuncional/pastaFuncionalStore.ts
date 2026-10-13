import type { DocumentoFuncional, UsuarioPasta } from "./types";

type DocumentoSalvo = DocumentoFuncional & { arquivo?: Blob };
const BANCO = "sigep-pasta-funcional";
const COLECAO = "documentos";
export const EVENTO_PASTA = "sigep-pasta-funcional-atualizada";

function abrirBanco(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(
        new Error(
          "O armazenamento local de arquivos não está disponível neste navegador.",
        ),
      );
      return;
    }
    const request = indexedDB.open(BANCO, 1);
    request.onupgradeneeded = () => {
      const banco = request.result;
      if (!banco.objectStoreNames.contains(COLECAO))
        banco.createObjectStore(COLECAO, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("Não foi possível abrir a Pasta Funcional local."));
    request.onblocked = () =>
      reject(new Error("Feche as outras abas do SIGEP e tente novamente."));
  });
}

export async function listarDocumentosPersistidos(): Promise<
  DocumentoFuncional[]
> {
  const banco = await abrirBanco();
  try {
    return await new Promise((resolve, reject) => {
      const transacao = banco.transaction(COLECAO, "readonly");
      const request = transacao.objectStore(COLECAO).getAll();
      request.onsuccess = () =>
        resolve(
          (request.result as DocumentoSalvo[]).map(
            ({ arquivo: _arquivo, ...documento }) => documento,
          ),
        );
      request.onerror = () =>
        reject(new Error("Não foi possível consultar os documentos."));
    });
  } finally {
    banco.close();
  }
}

export async function incorporarDocumentoValidado(
  documento: DocumentoFuncional,
  arquivo?: Blob,
): Promise<void> {
  if (
    documento.validado !== true ||
    !documento.cpf ||
    !documento.origem ||
    !documento.origemId ||
    !documento.anexadoPor ||
    !documento.anexadoEm ||
    !Number.isFinite(Date.parse(documento.anexadoEm))
  )
    throw new Error("Documento sem validação ou rastreabilidade completa.");
  const banco = await abrirBanco();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = banco.transaction(COLECAO, "readwrite");
      const store = tx.objectStore(COLECAO);
      const consulta = store.get(documento.id);
      // A chave de origem é única: incorpora uma vez e preserva o arquivo original.
      consulta.onsuccess = () => {
        if (!consulta.result) store.add({ ...documento, arquivo });
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject(
          new Error(
            "Não foi possível salvar o arquivo. Verifique o espaço disponível no navegador.",
          ),
        );
      tx.onabort = () =>
        reject(new Error("O anexo não foi salvo. Tente novamente."));
    });
    window.dispatchEvent(new Event(EVENTO_PASTA));
  } finally {
    banco.close();
  }
}

export async function obterArquivo(
  documento: DocumentoFuncional,
): Promise<Blob> {
  if (documento.conteudoTexto !== undefined)
    return new Blob([documento.conteudoTexto], {
      type: "text/plain;charset=utf-8",
    });
  const banco = await abrirBanco();
  let salvo: DocumentoSalvo | undefined;
  try {
    salvo = await new Promise((resolve, reject) => {
      const request = banco
        .transaction(COLECAO, "readonly")
        .objectStore(COLECAO)
        .get(documento.id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(new Error("Não foi possível carregar o arquivo."));
    });
  } finally {
    banco.close();
  }
  if (salvo?.arquivo) return salvo.arquivo;
  throw new Error(
    "O módulo de origem disponibilizou os metadados, mas não o arquivo original.",
  );
}

export async function anexarDocumentoManual(
  documento: Omit<
    DocumentoFuncional,
    | "id"
    | "origem"
    | "moduloOrigem"
    | "origemId"
    | "anexadoEm"
    | "anexadoPor"
    | "orgaoResponsavel"
    | "validado"
  >,
  arquivo: File,
  usuario: UsuarioPasta,
): Promise<DocumentoFuncional> {
  if (!usuario.podeAnexar)
    throw new Error("Seu perfil não permite anexar documentos.");
  if (documento.categoria === "Ingresso")
    throw new Error(
      "Documentos de ingresso devem ser incorporados pelo módulo de origem.",
    );
  if (!arquivo.size || arquivo.size > 10 * 1024 * 1024)
    throw new Error("Selecione um arquivo não vazio de até 10 MB.");
  if (!/\.(pdf|png|jpe?g|txt|docx?)$/i.test(arquivo.name))
    throw new Error("Utilize PDF, PNG, JPG, TXT, DOC ou DOCX.");
  const id = crypto.randomUUID();
  const registro: DocumentoFuncional = {
    ...documento,
    id,
    origemId: id,
    origem: "Cadastro Manual — Pasta Funcional",
    moduloOrigem: "Pasta Funcional do Servidor",
    anexadoEm: new Date().toISOString(),
    anexadoPor: usuario.nome,
    orgaoResponsavel: usuario.orgao,
    validado: true,
    arquivoNome: arquivo.name,
    arquivoTipo: arquivo.type || "application/octet-stream",
    arquivoTamanho: arquivo.size,
  };
  await incorporarDocumentoValidado(registro, arquivo);
  return registro;
}
