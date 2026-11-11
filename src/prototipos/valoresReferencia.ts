export type TipoValorReferencia = "Monetário" | "Numérico";
export type SituacaoReferencia = "Agendado" | "Ativo" | "Encerrado" | "Inativo";
export interface PeriodoReferencia {
  id?: number;
  valor: string;
  inicioVigencia?: string;
  fimVigencia?: string;
  fimVigenciaExclusivo?: boolean;
  situacao: string;
  observacoes?: string;
  baseLegal?: string[];
}
export interface ReferenciaConsultavel {
  codigo: string;
  tipo?: string;
  vigencias: PeriodoReferencia[];
}
export interface VigenciaValorReferencia extends PeriodoReferencia {
  id: number;
  ano: string;
  vigencia: string;
  inicioVigencia: string;
  situacao: SituacaoReferencia;
}
export interface ValorReferencia extends ReferenciaConsultavel {
  nome: string;
  tipo: TipoValorReferencia;
  vigencias: VigenciaValorReferencia[];
}
export interface FormularioValorReferencia {
  valor: string;
  inicioVigencia: string;
  observacoes: string;
  baseLegal: string[];
}

const regras: Record<string, { casas: number; aceitaZero: boolean; finalidade: string }> = {
  SALARIO_MINIMO: { casas: 2, aceitaZero: false, finalidade: "Salário mínimo utilizado pelas regras da folha." },
  TETO_RGPS: { casas: 2, aceitaZero: false, finalidade: "Limite do salário de contribuição do RGPS." },
  ISENCAO_LC700: { casas: 2, aceitaZero: false, finalidade: "Faixa de isenção previdenciária da LC 700." },
  LIMITE_PROVENTOS_LC700: { casas: 2, aceitaZero: false, finalidade: "Limite de enquadramento da regra por faixas da LC 700." },
  LIMITE_PREV_PM_BM: { casas: 2, aceitaZero: false, finalidade: "Limite entre as faixas de contribuição dos militares PM/BM." },
  DEDUCAO_DEP_IRRF: { casas: 2, aceitaZero: true, finalidade: "Dedução mensal por dependente, aplicada pelo motor conforme enquadramento." },
  DEDUCAO_SIMPL_IRRF: { casas: 2, aceitaZero: true, finalidade: "Limite do desconto simplificado mensal do IRRF." },
  ISENCAO_65_IRRF: { casas: 2, aceitaZero: true, finalidade: "Parcela isenta dos rendimentos previdenciários legalmente abrangidos a partir de 65 anos." },
  IRRF_LIMITE_IMPOSTO_ZERO: { casas: 2, aceitaZero: false, finalidade: "Limite de rendimentos para redução do imposto a zero." },
  IRRF_REDUCAO_MAXIMA: { casas: 2, aceitaZero: true, finalidade: "Valor máximo da redução mensal do imposto." },
  IRRF_INICIO_REDUCAO_LINEAR: { casas: 2, aceitaZero: false, finalidade: "Início da faixa de rendimentos para redução linear." },
  IRRF_FIM_REDUCAO_LINEAR: { casas: 2, aceitaZero: false, finalidade: "Final da faixa de rendimentos para redução linear." },
  IRRF_CONSTANTE_REDUCAO: { casas: 2, aceitaZero: true, finalidade: "Constante numérica da fórmula de redução do IRRF." },
  IRRF_COEFICIENTE_REDUCAO: { casas: 6, aceitaZero: true, finalidade: "Coeficiente da fórmula de redução do IRRF; preservar até seis casas decimais." },
  SALARIO_FAMILIA: { casas: 2, aceitaZero: false, finalidade: "Cota do benefício. Conferir a modalidade e a base legal aplicável antes de alterar." },
};
export const regraValorReferencia = (codigo: string, tipo = "Monetário") => regras[codigo] ?? {
  casas: tipo === "Numérico" ? 6 : 2, aceitaZero: true, finalidade: "Parâmetro utilizado pelas regras da folha.",
};

export const dataReferencia = (texto?: string): number | undefined => {
  if (!texto || !/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) return undefined;
  const [dia, mes, ano] = texto.split("/").map(Number);
  const data = new Date(ano, mes - 1, dia);
  return ano >= 1900 && data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia ? data.getTime() : undefined;
};
export const hojeReferencia = () => new Date().toLocaleDateString("pt-BR");
export const numeroReferencia = (texto: string, casas = 2) => {
  const normalizado = texto.trim().replace(/^R\$\s*/, "");
  if (!new RegExp(`^(?:\\d+|\\d{1,3}(?:\\.\\d{3})+)(?:,\\d{1,${casas}})?$`).test(normalizado)) return NaN;
  return Number(normalizado.replace(/\./g, "").replace(",", "."));
};
export const validarValorReferencia = (codigo: string, tipo: string, texto: string) => {
  const regra = regraValorReferencia(codigo, tipo);
  const numero = numeroReferencia(texto, regra.casas);
  if (!Number.isFinite(numero) || (tipo === "Numérico" && texto.includes("R$")))
    return `Informe um valor ${tipo === "Monetário" ? "monetário" : "numérico"} válido, com até ${regra.casas} casas decimais.`;
  if (numero === 0 && !regra.aceitaZero) return "Este parâmetro exige um valor maior que zero.";
  return undefined;
};
export const formatarValorReferencia = (codigo: string, tipo: string, texto: string) => {
  const regra = regraValorReferencia(codigo, tipo);
  const numero = numeroReferencia(texto, regra.casas);
  return Number.isFinite(numero) ? new Intl.NumberFormat("pt-BR", tipo === "Monetário"
    ? { style: "currency", currency: "BRL" }
    : { maximumFractionDigits: regra.casas, minimumFractionDigits: 0 }).format(numero) : texto;
};

export const situacaoValorReferencia = (registro: PeriodoReferencia, hoje = new Date()): SituacaoReferencia => {
  if (registro.situacao === "Inativo") return "Inativo";
  const inicio = dataReferencia(registro.inicioVigencia);
  const fim = registro.fimVigencia ? dataReferencia(registro.fimVigencia) : Infinity;
  if (inicio === undefined || fim === undefined || fim <= inicio) return "Inativo";
  const data = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();
  return data < inicio ? "Agendado" : data >= fim ? "Encerrado" : "Ativo";
};
export const periodoValorReferencia = (registro: PeriodoReferencia) =>
  `${registro.inicioVigencia ?? "Data inválida"} até ${registro.fimVigencia ? `${registro.fimVigencia} (fim exclusivo)` : "vigente"}`;

// Migração idempotente: preserva os dias efetivos do encerramento inclusivo legado.
export const normalizarPeriodoReferencia = <T extends PeriodoReferencia>(registro: T, hoje = new Date()): T => {
  let fim = registro.fimVigencia;
  if (!registro.fimVigenciaExclusivo && fim && dataReferencia(fim) !== undefined) {
    const data = new Date(dataReferencia(fim)!);
    data.setDate(data.getDate() + 1);
    fim = data.toLocaleDateString("pt-BR");
  }
  const atualizado = { ...registro, fimVigencia: fim, fimVigenciaExclusivo: true };
  return { ...atualizado, situacao: situacaoValorReferencia(atualizado, hoje), vigencia: periodoValorReferencia(atualizado) };
};

export const consultarValorReferencia = (valores: ReferenciaConsultavel[], codigo: string, dataTexto?: string) => {
  const data = dataReferencia(dataTexto);
  if (data === undefined) return { estado: "invalido" as const, erro: "Informe uma data válida para consultar." };
  const parametros = valores.filter((valor) => valor.codigo === codigo);
  const periodoInvalido = parametros.some((valor) => valor.vigencias.some((registro) => {
    const inicio = dataReferencia(registro.inicioVigencia);
    const fim = registro.fimVigencia ? dataReferencia(registro.fimVigencia) : Infinity;
    return inicio === undefined || fim === undefined || (registro.fimVigenciaExclusivo ? fim <= inicio : fim < inicio);
  }));
  if (periodoInvalido) return { estado: "invalido" as const, erro: "Existe um período de referência inválido. Regularize as vigências." };
  const periodos = parametros.flatMap((valor) => valor.vigencias).map((registro) => normalizarPeriodoReferencia(registro));
  const candidatas = periodos.filter((registro) => {
    const inicio = dataReferencia(registro.inicioVigencia);
    const fim = registro.fimVigencia ? dataReferencia(registro.fimVigencia) : Infinity;
    return registro.situacao !== "Inativo" && inicio !== undefined && fim !== undefined && inicio <= data && data < fim;
  });
  if (candidatas.length > 1) return { estado: "conflito" as const, erro: "Conflito: mais de uma vigência aplicável." };
  const vigencia = candidatas[0];
  if (!vigencia) return { estado: "ausente" as const, erro: "Sem vigência aplicável." };
  const erro = validarValorReferencia(codigo, parametros[0]?.tipo ?? (codigo.includes("COEFICIENTE") || codigo.includes("CONSTANTE") ? "Numérico" : "Monetário"), vigencia.valor);
  if (erro) return { estado: "invalido" as const, erro: "Valor de referência inválido." };
  return { estado: "ok" as const, vigencia, valor: vigencia.valor };
};

export const encadearReferencias = <T extends PeriodoReferencia & { id: number }>(atuais: T[], nova: T): T[] => {
  const antigas = atuais.map((item) => normalizarPeriodoReferencia(item)).sort((a, b) => (dataReferencia(a.inicioVigencia) ?? Infinity) - (dataReferencia(b.inicioVigencia) ?? Infinity));
  const indice = antigas.findIndex((item) => item.id === nova.id);
  const original = antigas[indice];
  const anteriorOriginal = antigas[indice - 1];
  const registros = [...antigas.filter((item) => item.id !== nova.id), { ...nova, fimVigenciaExclusivo: true }]
    .sort((a, b) => (dataReferencia(a.inicioVigencia) ?? Infinity) - (dataReferencia(b.inicioVigencia) ?? Infinity));
  if (registros.some((item, i) => dataReferencia(item.inicioVigencia) === undefined || (i > 0 && item.inicioVigencia === registros[i - 1].inicioVigencia)))
    throw new Error("Já existe vigência com esta data inicial ou um período inválido.");
  const encadeadas = registros.map((item, i) => {
    const proxima = registros[i + 1];
    const preservarIntervalo = item.fimVigencia && proxima?.id === nova.id && dataReferencia(item.fimVigencia)! < dataReferencia(nova.inicioVigencia)!;
    const ajustar = item.id === nova.id || (proxima?.id === nova.id && !preservarIntervalo) ||
      (item.id === anteriorOriginal?.id && item.fimVigencia === original?.inicioVigencia);
    const fimHistorico = item.id === nova.id && original?.fimVigencia && dataReferencia(original.fimVigencia)! > dataReferencia(nova.inicioVigencia)! ? original.fimVigencia : "";
    return normalizarPeriodoReferencia({ ...item, fimVigencia: ajustar ? proxima?.inicioVigencia ?? fimHistorico : item.fimVigencia, fimVigenciaExclusivo: true });
  });
  if (encadeadas.some((item, i) => {
    const inicio = dataReferencia(item.inicioVigencia)!;
    const fim = item.fimVigencia ? dataReferencia(item.fimVigencia) : Infinity;
    const seguinte = dataReferencia(encadeadas[i + 1]?.inicioVigencia) ?? Infinity;
    return fim === undefined || fim <= inicio || fim > seguinte;
  })) throw new Error("Existem períodos conflitantes. Revise as vigências antes de salvar.");
  return encadeadas;
};

export const validarFormularioReferencia = (dados: { codigo: string; tipo: string; valor: string; inicioVigencia: string; observacoes: string; baseLegal: string[] }) => {
  if (!dados.valor.trim()) return "Informe o Valor.";
  const erro = validarValorReferencia(dados.codigo, dados.tipo, dados.valor);
  if (erro) return erro;
  if (dataReferencia(dados.inicioVigencia) === undefined) return "Informe uma data inicial válida no formato DD/MM/AAAA.";
  if (dados.observacoes.length > 500) return "As observações devem possuir no máximo 500 caracteres.";
  if (!dados.baseLegal.length) return "Selecione ao menos uma Base Legal para a vigência.";
  return undefined;
};

export const prepararGravacaoReferencia = (valores: ValorReferencia[], codigo: string, id: number | undefined, formulario: FormularioValorReferencia, novoId = Date.now()): ValorReferencia[] => {
  const referencia = valores.find((item) => item.codigo === codigo);
  if (!referencia) throw new Error("Valor de referência não encontrado.");
  if (valores.filter((item) => item.codigo === codigo).length !== 1) throw new Error("Existem códigos de referência duplicados. Regularize o cadastro.");
  if (new Set(referencia.vigencias.map((item) => item.id)).size !== referencia.vigencias.length) throw new Error("Existem identificadores de vigência duplicados. Regularize o cadastro.");
  const atual = referencia.vigencias.find((item) => item.id === id);
  if (id !== undefined && !atual) throw new Error("Vigência não encontrada.");
  const erro = validarFormularioReferencia({ ...formulario, codigo, tipo: referencia.tipo });
  if (erro) throw new Error(erro);
  const registro: VigenciaValorReferencia = {
    id: atual?.id ?? novoId, ano: formulario.inicioVigencia.slice(-4),
    inicioVigencia: formulario.inicioVigencia, fimVigenciaExclusivo: true,
    valor: formatarValorReferencia(codigo, referencia.tipo, formulario.valor),
    observacoes: formulario.observacoes, baseLegal: formulario.baseLegal,
    situacao: atual?.situacao === "Inativo" ? "Inativo" : "Ativo", vigencia: "",
  };
  const vigencias = encadearReferencias(referencia.vigencias, registro);
  return valores.map((item) => item.codigo === codigo ? { ...item, vigencias } : item);
};
