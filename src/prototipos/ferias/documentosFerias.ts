function abrirBase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ferias-documentos', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('arquivos');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function guardarDocumento(arquivo: File): Promise<string> {
  const db = await abrirBase();
  const id = crypto.randomUUID();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('arquivos', 'readwrite');
      tx.objectStore('arquivos').put(arquivo, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    return id;
  } finally { db.close(); }
}

export async function lerDocumento(id: string): Promise<Blob | undefined> {
  const db = await abrirBase();
  try {
    return await new Promise<Blob | undefined>((resolve, reject) => {
      const request = db.transaction('arquivos').objectStore('arquivos').get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}
