export const irrfData = (texto?: string): number | undefined => {
  if (!texto || !/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) return undefined;
  const [dia, mes, ano] = texto.split("/").map(Number);
  const data = new Date(ano, mes - 1, dia);
  return ano >= 1900 && data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia ? data.getTime() : undefined;
};

export const irrfNumero = (texto?: string, casas = 2): number => {
  const valor = (texto ?? "").replace(/R\$/g, "").replace(/\s/g, "");
  if (!new RegExp(`^(?:\\d+|\\d{1,3}(?:\\.\\d{3})+)(?:,\\d{1,${casas}})?$`).test(valor)) return NaN;
  return Number(valor.replace(/\./g, "").replace(",", "."));
};

export const irrfMoeda = (numero: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Object.is(numero, -0) ? 0 : numero);
export const irrfAberta = (fim: string) => fim.trim().toLowerCase() === "em aberto";
const centavos = (texto: string) => Math.round(irrfNumero(texto) * 100);

export type FaixaIrrf = { ordem: number; faixaInicial: string; faixaFinal: string; percentual: string; parcelaDeduzir?: string };
export const validarFaixaIrrf = (faixa: FaixaIrrf): string | undefined => {
  const aliquota = irrfNumero(faixa.percentual);
  if (!Number.isFinite(aliquota) || aliquota < 0 || aliquota > 100)
    return "Informe um percentual entre zero e 100, com até duas casas decimais.";
  const parcela = irrfNumero(faixa.parcelaDeduzir);
  if (!Number.isFinite(parcela) || parcela < 0)
    return "Informe a Parcela a Deduzir oficial, com valor não negativo e até duas casas decimais.";
  const inicio = centavos(faixa.faixaInicial);
  const fim = centavos(faixa.faixaFinal);
  if (!Number.isFinite(inicio) || (!irrfAberta(faixa.faixaFinal) && (!Number.isFinite(fim) || fim < inicio || fim <= 0)))
    return "Informe uma Base Final válida, maior ou igual à Base Inicial, ou Em aberto para a última faixa.";
  return undefined;
};

export const validarTabelaIrrf = (faixas: FaixaIrrf[]): string | undefined => {
  if (!faixas.length) return "Inclua ao menos uma faixa na Tabela Progressiva.";
  let inicioEsperado = 0;
  for (const [indice, faixa] of faixas.entries()) {
    const erro = validarFaixaIrrf(faixa);
    if (erro) return erro;
    if (faixa.ordem !== indice + 1 || centavos(faixa.faixaInicial) !== inicioEsperado)
      return "As faixas devem iniciar em zero e ser consecutivas, sem lacunas ou sobreposição.";
    if (irrfAberta(faixa.faixaFinal)) {
      if (indice !== faixas.length - 1) return "Uma faixa em aberto só pode ser a última da tabela.";
    } else inicioEsperado = centavos(faixa.faixaFinal) + 1;
  }
  if (!irrfAberta(faixas[faixas.length - 1].faixaFinal)) return "A última faixa da Tabela Progressiva deve estar Em aberto.";
  return undefined;
};

// Estimativa de continuidade. Nunca substitui a parcela publicada e confirmada.
export const sugerirParcelaIrrf = (faixas: FaixaIrrf[], ordem: number, percentual: string): string | undefined => {
  const aliquota = irrfNumero(percentual);
  if (!Number.isFinite(aliquota) || aliquota < 0 || aliquota > 100) return undefined;
  if (ordem === 1) return irrfMoeda(0);
  const anterior = faixas.find((faixa) => faixa.ordem === ordem - 1);
  if (!anterior || irrfAberta(anterior.faixaFinal)) return undefined;
  const parcela = irrfNumero(anterior.parcelaDeduzir);
  const valor = parcela + irrfNumero(anterior.faixaFinal) * (aliquota - irrfNumero(anterior.percentual)) / 100;
  return Number.isFinite(valor) && valor >= 0 ? irrfMoeda(valor) : undefined;
};

type VigenciaIrrf = { id: number; inicioVigencia?: string; fimVigencia?: string; fimVigenciaExclusivo?: boolean };
export const migrarPeriodoIrrf = <T extends VigenciaIrrf>(registro: T): T => {
  if (registro.fimVigenciaExclusivo) return { ...registro };
  const fim = irrfData(registro.fimVigencia);
  const data = fim === undefined ? undefined : new Date(fim);
  if (data) data.setDate(data.getDate() + 1);
  return { ...registro, fimVigencia: data ? data.toLocaleDateString("pt-BR") : registro.fimVigencia, fimVigenciaExclusivo: true };
};

export const situacaoIrrf = (registro: VigenciaIrrf, hoje = new Date()): "Agendado" | "Ativo" | "Encerrado" | "Inativo" => {
  const inicio = irrfData(registro.inicioVigencia);
  const fim = irrfData(registro.fimVigencia);
  const data = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();
  if (inicio === undefined) return "Inativo";
  if (inicio > data) return "Agendado";
  return fim !== undefined && data >= fim ? "Encerrado" : "Ativo";
};

export const periodoIrrf = (registro: VigenciaIrrf) => `${registro.inicioVigencia} até ${registro.fimVigencia ? `${registro.fimVigencia} (fim exclusivo)` : "vigente"}`;

export const encadearVigenciasIrrf = <T extends VigenciaIrrf>(atuais: T[], nova: T): T[] => {
  const antigas = atuais.map(migrarPeriodoIrrf).sort((a, b) => (irrfData(a.inicioVigencia) ?? Infinity) - (irrfData(b.inicioVigencia) ?? Infinity));
  const indiceAntigo = antigas.findIndex((registro) => registro.id === nova.id);
  const anteriorAntigo = antigas[indiceAntigo - 1];
  const original = antigas[indiceAntigo];
  const registros = [...antigas.filter((registro) => registro.id !== nova.id), { ...nova, fimVigenciaExclusivo: true }]
    .sort((a, b) => (irrfData(a.inicioVigencia) ?? Infinity) - (irrfData(b.inicioVigencia) ?? Infinity));
  if (registros.some((registro, indice) => irrfData(registro.inicioVigencia) === undefined || (indice > 0 && registro.inicioVigencia === registros[indice - 1].inicioVigencia)))
    throw new Error("Já existe vigência IRRF com esta data inicial ou um período inválido.");
  const resultado = registros.map((registro, indice) => {
    const proxima = registros[indice + 1];
    // Preserva outros períodos legados, inclusive eventuais intervalos históricos.
    const preservarFimHistorico = registro.fimVigencia && proxima?.id === nova.id && irrfData(registro.fimVigencia)! < irrfData(nova.inicioVigencia)!;
    const reencadear = registro.id === nova.id || (proxima?.id === nova.id && !preservarFimHistorico) ||
      (registro.id === anteriorAntigo?.id && registro.fimVigencia === original?.inicioVigencia);
    const fimHistorico = registro.id === nova.id && original?.fimVigencia &&
      irrfData(original.fimVigencia)! > irrfData(nova.inicioVigencia)! ? original.fimVigencia : "";
    return { ...registro, fimVigencia: reencadear ? proxima?.inicioVigencia ?? fimHistorico : registro.fimVigencia };
  });
  if (resultado.some((registro, indice) => {
    const inicio = irrfData(registro.inicioVigencia)!;
    const fim = registro.fimVigencia ? irrfData(registro.fimVigencia) : Infinity;
    const proximoInicio = irrfData(resultado[indice + 1]?.inicioVigencia) ?? Infinity;
    return fim === undefined || fim <= inicio || fim > proximoInicio;
  })) throw new Error("Existem períodos IRRF conflitantes. Revise as vigências antes de salvar.");
  return resultado;
};

export const validarDadosIrrf = (dados: { descricao: string; anoBase: string; inicioVigencia: string; baseLegal: string[]; observacoes?: string }): string | undefined => {
  if (!dados.descricao.trim() || !dados.anoBase.trim() || !dados.inicioVigencia.trim() || !dados.baseLegal.length)
    return "Informe Descrição, Ano Base, Início da Vigência e Base Legal para continuar.";
  if (!/^\d{4}$/.test(dados.anoBase) || Number(dados.anoBase) < 1900) return "Informe um Ano Base válido com quatro dígitos.";
  if (irrfData(dados.inicioVigencia) === undefined) return "Informe uma data inicial válida no formato DD/MM/AAAA.";
  if ((dados.observacoes ?? "").length > 500) return "As observações devem possuir no máximo 500 caracteres.";
  return undefined;
};

const referenciasIrrf = [
  ["DEDUCAO_DEP_IRRF", "Dedução por dependente"],
  ["DEDUCAO_SIMPL_IRRF", "Desconto simplificado mensal"],
  ["ISENCAO_65_IRRF", "Parcela isenta para 65 anos ou mais"],
  ["IRRF_LIMITE_IMPOSTO_ZERO", "Limite de renda com imposto zerado"],
  ["IRRF_REDUCAO_MAXIMA", "Redução máxima mensal"],
  ["IRRF_INICIO_REDUCAO_LINEAR", "Início da faixa de redução linear"],
  ["IRRF_FIM_REDUCAO_LINEAR", "Fim da faixa de redução linear"],
  ["IRRF_CONSTANTE_REDUCAO", "Constante da fórmula"],
  ["IRRF_COEFICIENTE_REDUCAO", "Coeficiente da fórmula"],
] as const;
type ValorIrrf = { codigo: string; nome: string; vigencias: { inicioVigencia: string; fimVigencia?: string; situacao: string; valor: string }[] };
export const consultarReferenciasIrrf = (valores: ValorIrrf[], dataReferencia?: string) => {
  const data = irrfData(dataReferencia);
  return referenciasIrrf.map(([codigo, nome]) => {
    const valor = { codigo, nome };
    if (data === undefined) return { valor, erro: "Informe uma data inicial válida para consultar." };
    const candidatas = valores.filter((item) => item.codigo === codigo).flatMap((item) => item.vigencias)
      .filter((registro) => {
        const inicio = irrfData(registro.inicioVigencia);
        const fim = registro.fimVigencia ? irrfData(registro.fimVigencia) : Infinity;
        return registro.situacao !== "Inativo" && inicio !== undefined && fim !== undefined && inicio <= data && data <= fim;
      });
    if (candidatas.length > 1) return { valor, erro: "Conflito: mais de uma vigência aplicável." };
    const vigencia = candidatas[0];
    if (!vigencia) return { valor, erro: "Sem vigência aplicável." };
    const numero = irrfNumero(vigencia.valor, codigo === "IRRF_COEFICIENTE_REDUCAO" ? 6 : 2);
    if (!Number.isFinite(numero) || numero < 0) return { valor, erro: "Valor de referência inválido." };
    return { valor, vigencia };
  });
};
