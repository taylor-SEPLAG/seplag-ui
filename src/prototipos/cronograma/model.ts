export const CALENDARIO_CRONOGRAMA_PATH = "/prototipos/sigep/cronograma";
export const EVENTO_CRONOGRAMA_ATUALIZADO = "sigep:cronograma-atualizado";
export interface FonteCronograma {
  tituloCiclo: string;
  secoes: {
    id: number;
    titulo: string;
    marcador?: string;
    observacao?: string;
    eventos: {
      periodo: string;
      descricao: string;
      status?: string;
      nome?: string;
      observacao?: string;
    }[];
  }[];
}
export interface EventoCronograma {
  id: string;
  tipoId: string;
  tipo: string;
  cor: string;
  nome: string;
  descricao: string;
  inicio: string;
  fim: string;
  horario: string;
  status: string;
  observacao: string;
  competencia: string;
}
export interface CalendarioFonte {
  titulo: string;
  competencia: string;
  tipos: { id: string; nome: string; cor: string }[];
  eventos: EventoCronograma[];
  semData: number;
}
const meses = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];
const cores = [
  "#2155d6",
  "#ec5800",
  "#008d8b",
  "#8250d7",
  "#a75dc1",
  "#079455",
  "#e93652",
  "#566d80",
];
export const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
export const diaCuiaba = (agora = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Cuiaba",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora);
export const dataBR = (iso: string) => iso.split("-").reverse().join("/");
export const rotuloMes = (mes: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${mes}-01T12:00:00Z`));
function dataISO(texto: string, anoPadrao: number): string | null {
  const match = texto.trim().match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
  if (!match) return null;
  const dia = Number(match[1]),
    mes = Number(match[2]),
    ano = Number(match[3] ?? anoPadrao);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !== mes - 1 ||
    data.getUTCDate() !== dia
  )
    return null;
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}
export function adaptarCronograma(
  fonte: FonteCronograma,
  agora = new Date(),
): CalendarioFonte {
  const titulo = fonte.tituloCiclo || "Cronograma da Folha";
  const texto = normalizar(titulo);
  const ano = Number(
    texto.match(/\b(20\d{2})\b/)?.[1] ?? diaCuiaba(agora).slice(0, 4),
  );
  const numeroMes = meses.findIndex((mes) => texto.includes(mes));
  const competencia =
    numeroMes >= 0
      ? `${ano}-${String(numeroMes + 1).padStart(2, "0")}`
      : texto
          .match(/(0[1-9]|1[0-2])\/(20\d{2})/)?.[0]
          .split("/")
          .reverse()
          .join("-") || "";
  let semData = 0;
  const tipos = (fonte.secoes ?? []).map((secao, indice) => ({
    id: String(secao.id),
    nome: secao.titulo,
    cor:
      secao.marcador === "is-main" ||
      normalizar(secao.titulo).includes("principal")
        ? cores[0]
        : secao.marcador === "is-rescission" ||
            normalizar(secao.titulo).includes("rescis")
          ? cores[1]
          : cores[(indice + 2) % cores.length],
  }));
  const eventos = (fonte.secoes ?? []).flatMap((secao, indice) =>
    (secao.eventos ?? []).flatMap((evento, index) => {
      const partes = evento.periodo.split(/\s+-\s+/);
      const inicio = dataISO(partes[0] ?? "", ano);
      let fim = dataISO(
        /^\d{1,2}\//.test(partes[1] ?? "") ? partes[1] : (partes[0] ?? ""),
        ano,
      );
      // Um período sem ano explícito pode atravessar a virada do ano da competência.
      if (
        inicio &&
        fim &&
        inicio.slice(5, 7) === "12" &&
        fim.slice(5, 7) === "01" &&
        fim < inicio &&
        !/\/\d{4}/.test(partes[1] ?? "")
      )
        fim = dataISO(partes[1], ano + 1);
      if (!inicio || !fim || fim < inicio) {
        semData++;
        return [];
      }
      const hora = evento.periodo.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
      return [
        {
          id: `${secao.id}:${index}`,
          tipoId: String(secao.id),
          tipo: secao.titulo,
          cor: tipos[indice].cor,
          nome: evento.nome || evento.descricao,
          descricao: evento.descricao,
          inicio,
          fim,
          horario: hora ? `${hora[1].padStart(2, "0")}:${hora[2]}` : "",
          status: evento.status || "",
          observacao: [secao.observacao, evento.observacao]
            .filter(Boolean)
            .join(" — "),
          competencia: competencia || inicio.slice(0, 7),
        },
      ];
    }),
  );
  eventos.sort((a, b) =>
    `${a.inicio} ${a.horario}`.localeCompare(`${b.inicio} ${b.horario}`),
  );
  return {
    titulo,
    competencia:
      competencia ||
      eventos[0]?.inicio.slice(0, 7) ||
      diaCuiaba(agora).slice(0, 7),
    tipos,
    eventos,
    semData,
  };
}
// Os prazos da Folha são horários locais de Mato Grosso (UTC−04:00).
export const vencimento = (evento: EventoCronograma) =>
  Date.parse(`${evento.fim}T${evento.horario || "23:59"}:00-04:00`);
export function situacaoEvento(evento: EventoCronograma, agora = new Date()) {
  const estado = normalizar(evento.status);
  if (estado === "concluido" || estado === "finalizado")
    return { nome: "Concluído", classe: "concluido" };
  if (estado === "em andamento")
    return { nome: "Em andamento", classe: "andamento" };
  if (
    ["pendente", "agendado", "atrasado", "proximo do vencimento"].includes(
      estado,
    )
  ) {
    const diferenca = vencimento(evento) - agora.getTime();
    if (diferenca < 0) return { nome: "Atrasado", classe: "atrasado" };
    if (diferenca <= 7 * 86400000)
      return { nome: "Próximo do vencimento", classe: "proximo" };
    return { nome: "Pendente", classe: "pendente" };
  }
  return { nome: evento.status || "Não informado", classe: "nao-informado" };
}
export function proximoEvento(eventos: EventoCronograma[], agora = new Date()) {
  return eventos
    .filter(
      (evento) =>
        ["pendente", "proximo"].includes(
          situacaoEvento(evento, agora).classe,
        ) && vencimento(evento) >= agora.getTime(),
    )
    .sort((a, b) => vencimento(a) - vencimento(b))[0];
}
export function mudarMes(mes: string, deslocamento: number) {
  const [ano, numero] = mes.split("-").map(Number);
  return new Date(Date.UTC(ano, numero - 1 + deslocamento, 1))
    .toISOString()
    .slice(0, 7);
}
export function diasCalendario(mes: string) {
  const primeiro = new Date(`${mes}-01T12:00:00Z`);
  primeiro.setUTCDate(1 - primeiro.getUTCDay());
  const ultimo = new Date(
    Date.UTC(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)), 0),
  );
  const quantidade =
    Math.ceil(
      (new Date(`${mes}-01T12:00:00Z`).getUTCDay() +
        ultimo.getUTCDate()) /
        7,
    ) * 7;
  return Array.from({ length: quantidade }, (_, indice) =>
    new Date(primeiro.getTime() + indice * 86400000).toISOString().slice(0, 10),
  );
}
export const eventosDoDia = (eventos: EventoCronograma[], dia: string) =>
  eventos.filter((evento) => evento.inicio <= dia && evento.fim >= dia);
export function eventosDoMes(eventos: EventoCronograma[], mes: string) {
  const ultimo = new Date(
    Date.UTC(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)), 0),
  )
    .toISOString()
    .slice(0, 10);
  return eventos.filter(
    (evento) => evento.inicio <= ultimo && evento.fim >= `${mes}-01`,
  );
}
