export type FiltrosVinculos = {
  tipo: string;
  orgao: string;
  situacao: string;
  forma: string;
  inicio: string;
  fim: string;
};

export const filtrosVinculosVazios: FiltrosVinculos = {
  tipo: "",
  orgao: "",
  situacao: "",
  forma: "",
  inicio: "",
  fim: "",
};

export const FORMAS_VACANCIA = [
  "Exoneração",
  "Término de Contrato",
  "Aposentadoria",
  "Falecimento",
];

export const normalizarForma = (valor: string) =>
  valor.trim().toLocaleLowerCase("pt-BR");

export const FORMA_A_REVISAR = "Forma de Vacância a revisar";

export function formaVacanciaValida(v: {
  tipo: string;
  vacanciaForma?: string;
}): boolean {
  const forma = normalizarForma(v.vacanciaForma ?? "");
  if (!FORMAS_VACANCIA.some((opcao) => normalizarForma(opcao) === forma))
    return false;
  return !(
    v.tipo === "Nomeado Efetivo" &&
    forma === normalizarForma("Término de Contrato")
  );
}

type DadosConsulta = {
  tipo: string;
  orgao: string;
  vacanciaData?: string;
  vacanciaForma?: string;
};

export function situacaoDoVinculo(
  v: Pick<DadosConsulta, "vacanciaData" | "vacanciaForma">,
): "Ativo" | "Encerrado" {
  return v.vacanciaData?.trim() && v.vacanciaForma?.trim()
    ? "Encerrado"
    : "Ativo";
}

export function filtrarVinculos<T extends DadosConsulta>(
  registros: T[],
  filtros: FiltrosVinculos,
): T[] {
  const datasInvalidas = Boolean(
    filtros.inicio && filtros.fim && filtros.inicio > filtros.fim,
  );
  return registros.filter((v) => {
    const encerrado = situacaoDoVinculo(v) === "Encerrado";
    return (
      (!filtros.tipo || v.tipo === filtros.tipo) &&
      (!filtros.orgao || v.orgao === filtros.orgao) &&
      (!filtros.situacao ||
        (filtros.situacao === "Encerrado" ? encerrado : !encerrado)) &&
      (filtros.situacao !== "Encerrado" ||
        (!datasInvalidas &&
          (!filtros.forma ||
            (filtros.forma === FORMA_A_REVISAR
              ? !formaVacanciaValida(v)
              : formaVacanciaValida(v) &&
                normalizarForma(v.vacanciaForma ?? "") ===
                  normalizarForma(filtros.forma))) &&
          (!filtros.inicio || (v.vacanciaData ?? "") >= filtros.inicio) &&
          (!filtros.fim || (v.vacanciaData ?? "") <= filtros.fim)))
    );
  });
}

export function filtrosDaUrl(params: URLSearchParams): FiltrosVinculos {
  return Object.fromEntries(
    Object.keys(filtrosVinculosVazios).map((chave) => [
      chave,
      params.get(chave) ?? "",
    ]),
  ) as FiltrosVinculos;
}

export function urlConsultaVinculos(filtros: FiltrosVinculos): string {
  const params = new URLSearchParams(
    Object.entries(filtros).filter(([, valor]) => valor),
  );
  if (filtros.tipo) params.set("expand", filtros.tipo);
  return `/prototipos/sigep/vinculos-v2${params.size ? `?${params}` : ""}`;
}
