import type {
  Categoria,
  DocumentoFuncional,
  ServidorPasta,
  UsuarioPasta,
  VinculoPasta,
} from "./types";

export const normalizar = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("pt-BR");
export const cpfChave = (cpf: string) => cpf.replace(/\D/g, "");
export const diaLocal = (data: string | Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Cuiaba",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(data));
export const dataHora = (data?: string) =>
  data
    ? new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Cuiaba",
        dateStyle: "short",
        timeStyle: "short",
      })
        .format(new Date(data))
        .replace(",", "")
    : "—";
export const dataBR = (data?: string) =>
  data ? data.slice(0, 10).split("-").reverse().join("/") : "—";
export const podeConsultarVinculo = (
  usuario: UsuarioPasta,
  vinculo: VinculoPasta,
) => usuario.perfil === "CENTRAL" || usuario.orgao === vinculo.orgao;

export function agruparServidores(
  vinculos: VinculoPasta[],
  pessoas: { cpf: string; nome: string }[] = [],
): ServidorPasta[] {
  const mapa = new Map<string, ServidorPasta>();
  [...vinculos, ...pessoas].forEach((pessoa) => {
    const id = cpfChave(pessoa.cpf);
    if (!id) return;
    if (!mapa.has(id))
      mapa.set(id, { id, cpf: pessoa.cpf, nome: pessoa.nome, vinculos: [] });
    if (
      "matricula" in pessoa &&
      !mapa.get(id)!.vinculos.some((v) => v.id === pessoa.id)
    )
      mapa.get(id)!.vinculos.push(pessoa);
  });
  return [...mapa.values()].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR"),
  );
}

export function documentosDoServidor(
  documentos: DocumentoFuncional[],
  servidor: ServidorPasta,
  usuario: UsuarioPasta,
  vinculoId?: string,
) {
  const permitidos = servidor.vinculos.filter((v) =>
    podeConsultarVinculo(usuario, v),
  );
  if (usuario.perfil !== "CENTRAL" && !permitidos.length) return [];
  return [
    ...new Map(
      documentos
        .filter(
          (d) =>
            d.validado &&
            cpfChave(d.cpf) === servidor.id &&
            (!d.vinculoId || permitidos.some((v) => v.id === d.vinculoId)) &&
            (!vinculoId || !d.vinculoId || d.vinculoId === vinculoId),
        )
        .map((d) => [d.id, d]),
    ).values(),
  ];
}

export type FiltrosServidores = {
  busca: string;
  tipo: string;
  orgao: string;
  situacao: string;
};
export const filtrosServidoresVazios: FiltrosServidores = {
  busca: "",
  tipo: "",
  orgao: "",
  situacao: "",
};
export function vinculosFiltrados(
  servidor: ServidorPasta,
  filtros: FiltrosServidores,
  usuario: UsuarioPasta,
) {
  const termo = normalizar(filtros.busca);
  const digitos = cpfChave(filtros.busca);
  const correspondePessoa =
    !termo ||
    normalizar(servidor.nome).includes(termo) ||
    (digitos.length > 0 && cpfChave(servidor.cpf).includes(digitos));
  return servidor.vinculos.filter(
    (v) =>
      podeConsultarVinculo(usuario, v) &&
      (!filtros.tipo || filtros.tipo === v.tipo) &&
      (!filtros.orgao || filtros.orgao === v.orgao) &&
      (!filtros.situacao || filtros.situacao === v.situacao) &&
      (correspondePessoa || v.matricula.includes(filtros.busca.trim())),
  );
}
export type FiltrosDocumentos = {
  busca: string;
  origem: string;
  autor: string;
  inicio: string;
  fim: string;
};
export const filtrosDocumentosVazios: FiltrosDocumentos = {
  busca: "",
  origem: "",
  autor: "",
  inicio: "",
  fim: "",
};
export function filtrarDocumentos(
  documentos: DocumentoFuncional[],
  aba: Categoria | "Todos",
  filtros: FiltrosDocumentos,
) {
  if (filtros.inicio && filtros.fim && filtros.inicio > filtros.fim) return [];
  return documentos
    .filter(
      (d) =>
        (aba === "Todos" || d.categoria === aba) &&
        (!filtros.busca ||
          normalizar(d.nome).includes(normalizar(filtros.busca))) &&
        (!filtros.origem || d.origem === filtros.origem) &&
        (!filtros.autor || d.anexadoPor === filtros.autor) &&
        (!filtros.inicio || diaLocal(d.anexadoEm) >= filtros.inicio) &&
        (!filtros.fim || diaLocal(d.anexadoEm) <= filtros.fim),
    )
    .sort((a, b) => Date.parse(b.anexadoEm) - Date.parse(a.anexadoEm));
}
