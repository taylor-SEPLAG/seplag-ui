import { useSyncExternalStore } from "react";
import {
  assinarInformativos,
  listarInformativosPaginaInicial,
} from "../paginaInicial/informativos";

export const AVISOS_PATH = "/prototipos/sigep/avisos-importantes";
export const HOME_PATH = "/prototipos/sigep/pagina-inicial";
export type Comunicado = ReturnType<
  typeof listarInformativosPaginaInicial
>[number];
export const categorias = [
  {
    id: "todos",
    nome: "Todos",
    singular: "Todos",
    icon: "pi pi-megaphone",
    cor: "#2563eb",
    iconeFundo: "#dbeafe",
    textoCor: "#1d4ed8",
    fundo: "#edf3ff",
  },
  {
    id: "urgente",
    nome: "Urgentes",
    singular: "Urgente",
    icon: "pi pi-exclamation-triangle",
    cor: "#f97300",
    iconeFundo: "#ffedd9",
    iconeCor: "#ea580c",
    textoCor: "#b94700",
    fundo: "#fff4ea",
  },
  {
    id: "informativo",
    nome: "Informativos",
    singular: "Informativo",
    icon: "pi pi-info-circle",
    cor: "#0875e1",
    iconeFundo: "#dceeff",
    textoCor: "#0056b8",
    fundo: "#eaf6ff",
  },
  {
    id: "regra",
    nome: "Avisos",
    singular: "Aviso",
    icon: "pi pi-thumbtack",
    cor: "#ec2875",
    iconeFundo: "#fce0ec",
    textoCor: "#b42364",
    fundo: "#fceef6",
  },
  {
    id: "atualizacao",
    nome: "Atualizações",
    singular: "Atualização",
    icon: "pi pi-refresh",
    cor: "#10b981",
    iconeFundo: "#c9f2df",
    textoCor: "#047857",
    fundo: "#e8f7ef",
  },
] as const;
export type Categoria = (typeof categorias)[number]["id"];

// Usa a classificação já registrada no Painel, sem inferir regras a partir do texto.
export function categoriaAviso(aviso: Comunicado): Exclude<Categoria, "todos"> {
  if (aviso.icon.includes("refresh") || aviso.destaque === "is-update")
    return "atualizacao";
  if (aviso.icon.includes("thumbtack") || aviso.destaque === "is-pin")
    return "regra";
  if (
    aviso.icon.includes("exclamation-triangle") ||
    aviso.icon.includes("star") ||
    aviso.destaque === "is-warning"
  )
    return "urgente";
  return "informativo";
}
export function metaAviso(aviso: Comunicado) {
  return categorias.find((item) => item.id === categoriaAviso(aviso))!;
}
const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
export function filtrarAvisos(
  avisos: Comunicado[],
  busca: string,
  categoria: Categoria,
) {
  const termo = normalizar(busca);
  return avisos.filter(
    (aviso) =>
      (categoria === "todos" || categoriaAviso(aviso) === categoria) &&
      normalizar(`${aviso.titulo} ${aviso.texto}`).includes(termo),
  );
}
export function useInformativos() {
  return useSyncExternalStore(
    assinarInformativos,
    listarInformativosPaginaInicial,
    listarInformativosPaginaInicial,
  );
}
