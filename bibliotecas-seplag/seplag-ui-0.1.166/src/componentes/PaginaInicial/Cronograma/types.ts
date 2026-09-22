export type EventoCronogramaStatus = "concluido" | "emAndamento" | "agendado";

export type EventoCronograma = {
  id: number;
  ordem: number;
  dataInicio: string;
  dataFim: string;
  descricao: string;
  status: EventoCronogramaStatus;
};

export type SecaoCronograma = {
  id: number;
  ordem: number;
  titulo: string;
  marcador: "laranja" | "azul";
  eventos: EventoCronograma[];
};

export type CronogramaData = {
  id?: number;
  status?: string;
  titulo: string;
  secoes: SecaoCronograma[];
};

export type CicloPagamentoEventoRequest = {
  id: number;
  dataInicio: string;
  dataFim: string;
  descricao: string;
  ordem: number;
};

export type CicloPagamentoSecaoRequest = {
  id: number;
  nome: string;
  ordem: number;
  eventos: CicloPagamentoEventoRequest[];
};

export type CicloPagamentoRequest = {
  nome: string;
  status: string;
  secoes: CicloPagamentoSecaoRequest[];
};

export type CicloPagamentoEventoResponse = CicloPagamentoEventoRequest & {
  idSecao: number;
  status?: string;
};

export type CicloPagamentoSecaoResponse = {
  id: number;
  idCicloPagamento: number;
  nome: string;
  ordem: number;
  totalEventos: number;
  eventos: CicloPagamentoEventoResponse[];
};

export type CicloPagamentoResponse = {
  id: number;
  nome: string;
  status?: string;
  secoes: CicloPagamentoSecaoResponse[];
};
