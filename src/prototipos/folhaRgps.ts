// Regras exclusivas da manutenção RGPS. Datas finais da tabela são exclusivas;
// as referências monetárias continuam usando seus períodos inclusivos.
export const rgpsData = (texto?: string): number | undefined => {
  if (!texto || !/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) return undefined;
  const [dia, mes, ano] = texto.split("/").map(Number);
  const data = new Date(ano, mes - 1, dia);
  return ano >= 1900 && data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia
    ? data.getTime() : undefined;
};

export const rgpsNumero = (texto: string): number => {
  const valor = texto.replace(/R\$/g, "").replace(/\s/g, "");
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(valor)) return NaN;
  return Number(valor.replace(/\./g, "").replace(",", "."));
};

type ReferenciaRgps = { valor: string; inicioVigencia?: string; fimVigencia?: string; situacao: string };
export const consultarTetoRgps = (referencias: ReferenciaRgps[], dataReferencia?: string) => {
  const data = rgpsData(dataReferencia);
  if (data === undefined) return { erro: "Informe uma data inicial válida para consultar o Teto RGPS." };
  const validas = referencias.filter((item) => {
    const inicio = rgpsData(item.inicioVigencia);
    const fim = item.fimVigencia ? rgpsData(item.fimVigencia) : Infinity;
    return item.situacao !== "Inativo" && inicio !== undefined && fim !== undefined && inicio <= data && data <= fim;
  });
  if (validas.length > 1) return { erro: "Existe mais de um Teto RGPS válido para a data informada. Regularize Valores de Referência." };
  const referencia = validas[0];
  if (!referencia || !Number.isFinite(rgpsNumero(referencia.valor)) || rgpsNumero(referencia.valor) <= 0)
    return { erro: "Não existe Teto RGPS válido para a data informada. Verifique Valores de Referência." };
  return { referencia, valor: referencia.valor };
};

export type FaixaRgps = { ordem: number; faixaInicial: string; faixaFinal: string; percentual: string };
export const validarFaixasRgps = (faixas: FaixaRgps[], teto: string): string | undefined => {
  const limite = Math.round(rgpsNumero(teto) * 100);
  if (!Number.isFinite(limite) || limite <= 0) return "Não existe Teto RGPS válido para esta configuração.";
  if (!faixas.length) return "Inclua ao menos uma faixa de contribuição.";
  let esperado = 0;
  for (const [index, faixa] of faixas.entries()) {
    const inicio = Math.round(rgpsNumero(faixa.faixaInicial) * 100);
    const fim = Math.round(rgpsNumero(faixa.faixaFinal) * 100);
    const percentual = rgpsNumero(faixa.percentual);
    if (!Number.isFinite(percentual) || percentual <= 0 || percentual > 100)
      return "Informe um percentual maior que zero e menor ou igual a 100, com até duas casas decimais.";
    if (!Number.isFinite(inicio) || !Number.isFinite(fim) || inicio < 0 || fim < inicio || fim <= 0)
      return "Informe limites monetários válidos. A configuração RGPS não admite faixa em aberto.";
    if (faixa.ordem !== index + 1 || inicio !== esperado)
      return "As faixas devem iniciar em zero e ser consecutivas, sem lacunas ou sobreposição.";
    if (fim > limite) return "O limite da faixa não pode ultrapassar o Teto RGPS.";
    esperado = fim + 1;
  }
  return esperado - 1 === limite ? undefined : "A última faixa deve encerrar no Teto RGPS aplicável à vigência.";
};

type VigenciaRgps = { id: number; inicioVigencia?: string; fimVigencia?: string };
export const encadearVigenciasRgps = <T extends VigenciaRgps>(atuais: T[], nova: T): T[] => {
  if (rgpsData(nova.inicioVigencia) === undefined) throw new Error("Informe uma data inicial válida.");
  const vigencias = [...atuais.filter((item) => item.id !== nova.id), nova]
    .sort((a, b) => (rgpsData(a.inicioVigencia) ?? Infinity) - (rgpsData(b.inicioVigencia) ?? Infinity));
  if (vigencias.some((item, index) => rgpsData(item.inicioVigencia) === undefined ||
    (index > 0 && item.inicioVigencia === vigencias[index - 1].inicioVigencia)))
    throw new Error("Já existe vigência RGPS com esta data inicial ou um período inválido.");
  return vigencias.map((item, index) => ({ ...item, fimVigencia: vigencias[index + 1]?.inicioVigencia ?? "" }));
};

export const situacaoRgps = (vigencia: VigenciaRgps, hoje = new Date()): "Agendado" | "Ativo" | "Encerrado" | "Inativo" => {
  const data = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();
  const inicio = rgpsData(vigencia.inicioVigencia);
  const fim = rgpsData(vigencia.fimVigencia);
  if (inicio === undefined) return "Inativo";
  if (inicio > data) return "Agendado";
  return fim !== undefined && data >= fim ? "Encerrado" : "Ativo";
};
