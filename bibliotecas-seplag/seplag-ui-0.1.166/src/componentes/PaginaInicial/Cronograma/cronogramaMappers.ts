import type {
  CicloPagamentoRequest,
  CicloPagamentoResponse,
  CronogramaData,
  EventoCronogramaStatus,
} from "./types";

function normalizeStatus(status?: string): EventoCronogramaStatus {
  switch (status?.trim().toUpperCase()) {
    case "CONCLUIDO":
      return "concluido";
    case "EM_ANDAMENTO":
      return "emAndamento";
    case "AGENDADO":
      return "agendado";
    default:
      return "agendado";
  }
}

const apiIsoDateTimePattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;
const localDateTimePattern = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/;
const requestDateTimePattern = /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/;

function formatDateFromApi(value: string) {
  const isoMatch = apiIsoDateTimePattern.exec(value);

  if (isoMatch) {
    const [, year, month, day, hour, minute] = isoMatch;
    return `${day}/${month}/${year} ${hour}:${minute}`;
  }

  const localDateTimeMatch = localDateTimePattern.exec(value);

  if (localDateTimeMatch) {
    const [, day, month, year, hour, minute] = localDateTimeMatch;
    return `${day}/${month}/${year} ${hour}:${minute}`;
  }

  return value;
}

function formatDateToApi(value: string) {
  const trimmedValue = value.trim();
  const match = requestDateTimePattern.exec(trimmedValue);

  if (!match) {
    return trimmedValue;
  }

  const [, day, month, year, hour = "00", minute = "00"] = match;
  return `${day}/${month}/${year} ${hour}:${minute}:00`;
}

function getRequestId(id: number) {
  return Math.max(id, 0);
}

const sortByOrdem = <T extends { ordem: number }>(items: T[]) =>
  [...items].sort((a, b) => a.ordem - b.ordem);

export function mapCicloPagamentoToCronograma(ciclo: CicloPagamentoResponse): CronogramaData {
  return {
    id: ciclo.id,
    status: ciclo.status ?? "ATIVO",
    titulo: ciclo.nome,
    secoes: sortByOrdem(ciclo.secoes).map((secao, index) => ({
      id: secao.id,
      ordem: secao.ordem,
      titulo: secao.nome,
      marcador: index % 2 === 0 ? "azul" : "laranja",
      eventos: sortByOrdem(secao.eventos).map((evento) => ({
        id: evento.id,
        ordem: evento.ordem,
        dataInicio: formatDateFromApi(evento.dataInicio),
        dataFim: formatDateFromApi(evento.dataFim),
        descricao: evento.descricao,
        status: normalizeStatus(evento.status),
      })),
    })),
  };
}

export function mapCronogramaToCicloPagamentoRequest(
  cronograma: CronogramaData,
): CicloPagamentoRequest {
  return {
    nome: cronograma.titulo,
    status: cronograma.status ?? "ATIVO",
    secoes: sortByOrdem(cronograma.secoes).map((secao) => ({
      id: getRequestId(secao.id),
      nome: secao.titulo,
      ordem: secao.ordem,
      eventos: sortByOrdem(secao.eventos).map((evento) => ({
        id: getRequestId(evento.id),
        dataInicio: formatDateToApi(evento.dataInicio),
        dataFim: formatDateToApi(evento.dataFim),
        descricao: evento.descricao,
        ordem: evento.ordem,
      })),
    })),
  };
}
