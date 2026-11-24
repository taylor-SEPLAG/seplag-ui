import type { FolhaCronogramaState } from "../PrototiposPage";
import {
  adaptarCronograma,
  EVENTO_CRONOGRAMA_ATUALIZADO,
  rotuloMes,
} from "./model";
export const CICLOS_PATH = "/prototipos/sigep/cronograma/ciclos";
export const DUPLICADO =
  "Já existe um ciclo cadastrado para o mês e ano selecionados. Utilize a opção Editar para alterar o cronograma existente.";
export interface CicloCronograma {
  atualizadoEm?: string;
  competencia: string;
  configuracao: FolhaCronogramaState;
}
export function competenciaValida(valor: string) {
  return (
    /^\d{4}-(0[1-9]|1[0-2])$/.test(valor) &&
    Number(valor.slice(0, 4)) >= 1900 &&
    Number(valor.slice(0, 4)) <= 9999
  );
}
export function nomeCiclo(competencia: string) {
  const nome = rotuloMes(competencia).replace(" de ", "/");
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}
let conexao: Promise<IDBDatabase> | undefined;
function banco() {
  if (!conexao)
    conexao = new Promise((resolve, reject) => {
      const r = indexedDB.open("sigep-cronograma-ciclos", 1);
      r.onupgradeneeded = () => {
        r.result.createObjectStore("ciclos", { keyPath: "competencia" });
        r.result.createObjectStore("meta");
      };
      r.onsuccess = () => {
        r.result.onversionchange = () => {
          r.result.close();
          conexao = undefined;
        };
        resolve(r.result);
      };
      r.onerror = () => {
        conexao = undefined;
        reject(Error("Não foi possível abrir o armazenamento dos ciclos."));
      };
    });
  return conexao;
}
function configuracaoValida(c: FolhaCronogramaState) {
  return (
    c &&
    typeof c.tituloCiclo === "string" &&
    Array.isArray(c.secoes) &&
    c.secoes.every(
      (s) =>
        s &&
        Number.isFinite(s.id) &&
        typeof s.titulo === "string" &&
        Array.isArray(s.eventos) &&
        s.eventos.every(
          (e) =>
            e &&
            typeof e.periodo === "string" &&
            typeof e.descricao === "string",
        ),
    )
  );
}
/** A fonte legada reunia vários meses em uma configuração única. */
export function ciclosDaConfiguracao(
  configuracao: FolhaCronogramaState,
): CicloCronograma[] {
  const competenciaOriginal = adaptarCronograma(configuracao).competencia;
  const grupos = new Map<string, FolhaCronogramaState>();
  for (const secao of configuracao.secoes) {
    for (const evento of secao.eventos) {
      const calendario = adaptarCronograma({
        ...configuracao,
        secoes: [{ ...secao, eventos: [evento] }],
      });
      const competencia =
        calendario.eventos[0]?.inicio.slice(0, 7) ?? competenciaOriginal;
      if (!competenciaValida(competencia))
        throw Error("Competência inválida no cronograma anterior.");
      let grupo = grupos.get(competencia);
      if (!grupo) {
        grupo = { tituloCiclo: nomeCiclo(competencia), secoes: [] };
        grupos.set(competencia, grupo);
      }
      let destino = grupo.secoes.find((s) => s.id === secao.id);
      if (!destino) {
        destino = { ...secao, eventos: [] };
        grupo.secoes.push(destino);
      }
      destino.eventos.push({ ...evento });
    }
  }
  if (!grupos.size)
    grupos.set(competenciaOriginal, structuredClone(configuracao));
  return [...grupos].map(([competencia, configuracao]) => ({
    competencia,
    configuracao,
  }));
}
async function migrar() {
  const db = await banco();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["ciclos", "meta"], "readwrite"),
      meta = tx.objectStore("meta");
    const consulta = meta.get("migrado");
    consulta.onsuccess = () => {
      if (consulta.result) return;
      try {
        const salvo = localStorage.getItem("prototipos.folha.cronograma");
        if (salvo) {
          const configuracao = JSON.parse(salvo) as FolhaCronogramaState;
          if (!configuracaoValida(configuracao)) throw Error();
          for (const ciclo of ciclosDaConfiguracao(configuracao))
            tx.objectStore("ciclos").add(ciclo);
        }
        meta.put(true, "migrado");
        meta.put(true, "meses-separados-v2");
      } catch {
        tx.abort();
      }
    };
    tx.oncomplete = () => resolve();
    tx.onabort = () =>
      reject(
        Error(
          "Não foi possível importar o cronograma anterior. Os dados originais foram preservados.",
        ),
      );
    tx.onerror = () => {};
  });
}
async function separarMigracaoAnterior() {
  const db = await banco();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["ciclos", "meta"], "readwrite"),
      meta = tx.objectStore("meta"),
      store = tx.objectStore("ciclos");
    const revisao = meta.get("meses-separados-v2");
    revisao.onsuccess = () => {
      if (revisao.result) return;
      try {
        const fonte = localStorage.getItem("prototipos.folha.cronograma");
        if (!fonte) {
          meta.put(true, "meses-separados-v2");
          return;
        }
        const configuracao = JSON.parse(fonte) as FolhaCronogramaState;
        if (!configuracaoValida(configuracao)) throw Error();
        const competencia = adaptarCronograma(configuracao).competencia;
        const registro = store.get(competencia);
        registro.onsuccess = () => {
          // Só corrige a cópia legada intacta; não altera ciclos editados nem recria exclusões.
          if (
            registro.result &&
            JSON.stringify(registro.result.configuracao) ===
              JSON.stringify(configuracao)
          ) {
            const grupos = ciclosDaConfiguracao(configuracao);
            if (grupos.length > 1) {
              const todos = store.getAll();
              todos.onsuccess = () => {
                const existentes = todos.result as CicloCronograma[];
                // Em caso de conflito, preserva integralmente a configuração existente.
                if (
                  !grupos.some(
                    (g) =>
                      g.competencia !== competencia &&
                      existentes.some((e) => e.competencia === g.competencia),
                  )
                ) {
                  store.delete(competencia);
                  for (const ciclo of grupos) store.add(ciclo);
                }
              };
            }
          }
          meta.put(true, "meses-separados-v2");
        };
      } catch {
        tx.abort();
      }
    };
    tx.oncomplete = () => resolve();
    tx.onabort = () =>
      reject(
        Error(
          "Não foi possível organizar os ciclos anteriores. Os registros foram preservados.",
        ),
      );
    tx.onerror = () => {};
  });
}
/** Registra a atualização de inicialização, sem presumir a data histórica do legado. */
async function registrarAtualizacaoInicial() {
  const db = await banco();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("ciclos", "readwrite");
    const consulta = tx.objectStore("ciclos").openCursor();
    const atualizadoEm = new Date().toISOString();
    consulta.onsuccess = () => {
      const cursor = consulta.result;
      if (!cursor) return;
      const ciclo = cursor.value as CicloCronograma;
      if (
        !ciclo.atualizadoEm ||
        !Number.isFinite(Date.parse(ciclo.atualizadoEm))
      )
        cursor.update({ ...ciclo, atualizadoEm });
      cursor.continue();
    };
    tx.oncomplete = () => resolve();
    tx.onabort = () =>
      reject(Error("Não foi possível registrar a atualização dos ciclos."));
    tx.onerror = () => {};
  });
}
export async function listarCiclos(): Promise<CicloCronograma[]> {
  await migrar();
  await separarMigracaoAnterior();
  await registrarAtualizacaoInicial();
  const db = await banco();
  return new Promise((resolve, reject) => {
    const r = db.transaction("ciclos").objectStore("ciclos").getAll();
    r.onsuccess = () =>
      resolve(
        (r.result as CicloCronograma[]).sort((a, b) =>
          a.competencia.localeCompare(b.competencia),
        ),
      );
    r.onerror = () => reject(Error("Não foi possível consultar os ciclos."));
  });
}
export async function salvarCiclo(ciclo: CicloCronograma, novo: boolean) {
  if (
    !competenciaValida(ciclo.competencia) ||
    !configuracaoValida(ciclo.configuracao)
  )
    throw Error("Confira os dados do ciclo.");
  await migrar();
  const db = await banco();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("ciclos", "readwrite"),
      store = tx.objectStore("ciclos");
    let erro = "";
    if (novo) {
      store.add({ ...ciclo, atualizadoEm: new Date().toISOString() });
    } else {
      const r = store.get(ciclo.competencia);
      r.onsuccess = () => {
        if (!r.result) {
          erro = "Este ciclo não existe mais. Retorne à listagem.";
          tx.abort();
        } else store.put({ ...ciclo, atualizadoEm: new Date().toISOString() });
      };
    }
    tx.oncomplete = () => resolve();
    tx.onabort = () =>
      reject(
        Error(
          erro ||
            (tx.error?.name === "ConstraintError"
              ? DUPLICADO
              : "Não foi possível salvar o ciclo."),
        ),
      );
    tx.onerror = () => {};
  });
  window.dispatchEvent(new Event(EVENTO_CRONOGRAMA_ATUALIZADO));
}
export async function excluirCiclo(competencia: string) {
  const db = await banco();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("ciclos", "readwrite");
    tx.objectStore("ciclos").delete(competencia);
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(Error("Não foi possível excluir o ciclo."));
  });
  window.dispatchEvent(new Event(EVENTO_CRONOGRAMA_ATUALIZADO));
}

export function calendarioCiclo(ciclo: CicloCronograma) {
  return adaptarCronograma({
    ...ciclo.configuracao,
    tituloCiclo: nomeCiclo(ciclo.competencia),
  });
}
