export type TipoInformativo = "ALERTA" | "INFORMACAO" | "AVISO" | "IMPORTANTE";

export type InformativoRequest = {
  titulo: string;
  tipo: TipoInformativo;
  texto: string;
};

export type InformativoResponse = {
  id: number;
  titulo: string;
  tipo: TipoInformativo;
  texto: string;
  dataPublicacao: string;
};
