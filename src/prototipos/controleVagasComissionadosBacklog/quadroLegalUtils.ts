import type {
  HistoricoVaga,
  QuadroAutorizadoRow,
  SituacaoLegalVaga,
  Vaga,
} from "./types";
import { gerarIdentificadorVaga, gerarNomeVaga } from "./vagaUtils";

export type TipoAlteracaoQuadroLegal =
  | "AMPLIACAO"
  | "REDUCAO"
  | "TRANSFORMACAO"
  | "EXTINCAO_PROGRESSIVA"
  | "DISTRIBUICAO"
  | "REDISTRIBUICAO"
  | "ATUALIZACAO_BASE_LEGAL"
  | "INCLUSAO_ORGAO"
  | "EXCLUSAO_ORGAO";

export interface ComandoAlteracaoQuadroLegal {
  tipo: TipoAlteracaoQuadroLegal;
  quantidade?: number;
  lei: string;
  processo: string;
  dataEfeito: string;
  novoCargo?: string;
  novaCarreira?: string;
  quadroDestinoId?: number;
  quadroDestinoCodigo?: string;
  maiorSequencialDestino?: number;
  distribuicaoAtualPorVagaId?: Readonly<Record<string, {
    orgao?: string;
    ato?: string;
    inicioVigencia?: string;
  }>>;
  vagaIds?: readonly string[];
  vagaIdsBloqueados?: readonly string[];
}

export interface ResultadoAlteracaoQuadroLegal {
  vagas: Vaga[];
  criadas: Vaga[];
  alteradas: Vaga[];
  alertas: string[];
  quantitativoAnterior: number;
  quantitativoPosterior: number;
}

const dataRegistro = "16/07/2026 10:00";

const eventoLegal = (vaga: Vaga, comando: ComandoAlteracaoQuadroLegal, posterior: SituacaoLegalVaga, descricao: string): HistoricoVaga => ({
  id: `HIS-${vaga.id}-${String(vaga.historico.length + 1).padStart(3, "0")}`,
  vagaId: vaga.id,
  ocorridoEm: dataRegistro,
  dataEfeito: comando.dataEfeito.split("-").reverse().join("/"),
  tipo: "ALTERACAO_LEGAL",
  titulo: comando.tipo === "REDUCAO" ? "Redução do quadro legal" : comando.tipo === "TRANSFORMACAO" ? "Transformação legal" : "Extinção progressiva",
  descricao,
  situacaoLegalAnterior: vaga.situacaoLegal,
  situacaoLegalPosterior: posterior,
  origem: "Quadro Legal",
  usuario: "Usuário do protótipo",
  processo: comando.processo,
});

const alterarSituacao = (vaga: Vaga, situacaoLegal: SituacaoLegalVaga, comando: ComandoAlteracaoQuadroLegal, descricao: string): Vaga => ({
  ...vaga,
  situacaoLegal,
  historico: [...vaga.historico, eventoLegal(vaga, comando, situacaoLegal, descricao)],
});

export function aplicarAlteracaoQuadroLegal(vagasAtuais: readonly Vaga[], comando: ComandoAlteracaoQuadroLegal): ResultadoAlteracaoQuadroLegal {
  const vagas = [...vagasAtuais];
  const criadas: Vaga[] = [];
  const alteradas: Vaga[] = [];
  const alertas: string[] = [];
  const vagasAtivas = vagas.filter((vaga) => vaga.situacaoLegal !== "EXTINTA");
  const alteracaoSomenteOrgao = comando.tipo === "INCLUSAO_ORGAO" || comando.tipo === "EXCLUSAO_ORGAO";
  const alteracaoSemImpactoVagas = alteracaoSomenteOrgao || comando.tipo === "ATUALIZACAO_BASE_LEGAL";
  const quantidade = comando.tipo === "EXTINCAO_PROGRESSIVA"
    ? vagasAtivas.length
    : alteracaoSemImpactoVagas
      ? 0
      : Math.max(0, Math.floor(comando.quantidade ?? 0));
  const base = vagas[0];
  if ((!base && !alteracaoSemImpactoVagas) || !comando.lei || !comando.processo.trim() || !comando.dataEfeito) {
    return {
      vagas,
      criadas,
      alteradas,
      alertas: ["Preencha a lei ou ato legal, o Processo SIGADOC e a data de efeito."],
      quantitativoAnterior: vagasAtivas.length,
      quantitativoPosterior: vagasAtivas.length,
    };
  }
  if (alteracaoSemImpactoVagas) {
    return {
      vagas,
      criadas,
      alteradas,
      alertas,
      quantitativoAnterior: vagasAtivas.length,
      quantitativoPosterior: vagasAtivas.length,
    };
  }
  if (quantidade < 1) {
    return {
      vagas,
      criadas,
      alteradas,
      alertas: [comando.tipo === "EXTINCAO_PROGRESSIVA"
        ? "O quadro não possui vagas ativas para iniciar a extinção progressiva."
        : "Informe uma quantidade válida."],
      quantitativoAnterior: vagasAtivas.length,
      quantitativoPosterior: vagasAtivas.length,
    };
  }

  if (comando.tipo === "AMPLIACAO") {
    const maiorSequencial = Math.max(0, ...vagas.map((vaga) => vaga.sequencial));
    for (let indice = 1; indice <= quantidade; indice += 1) {
      const sequencial = maiorSequencial + indice;
      const id = gerarIdentificadorVaga(base.orgaoTitular, base.cargo, sequencial);
      const historico: HistoricoVaga = { id: `HIS-${id}-001`, vagaId: id, ocorridoEm: dataRegistro, dataEfeito: comando.dataEfeito.split("-").reverse().join("/"), tipo: "CRIACAO", titulo: "Vaga criada por ampliação legal", descricao: `${comando.lei} ampliou o quadro em ${quantidade} vaga(s).`, origem: "Quadro Legal", usuario: "Usuário do protótipo", processo: comando.processo };
      criadas.push({
        ...base,
        id,
        nome: undefined,
        sequencial,
        lei: comando.lei,
        destinacaoPrevistaLei: "Pendente de distribuição",
        orgaoDistribuicaoInicial: undefined,
        atoDistribuicaoInicial: undefined,
        inicioVigenciaDistribuicao: undefined,
        criadaEm: dataRegistro,
        inicioVigencia: historico.dataEfeito,
        estado: "DISPONIVEL",
        situacaoLegal: "REGULAR",
        historico: [historico],
      });
    }
    return { vagas: [...vagas, ...criadas], criadas, alteradas, alertas, quantitativoAnterior: vagas.length, quantitativoPosterior: vagas.length + quantidade };
  }

  if (comando.tipo === "TRANSFORMACAO") {
    if (!comando.novoCargo || !comando.quadroDestinoId || !comando.quadroDestinoCodigo) {
      return { vagas, criadas, alteradas, alertas: ["Selecione o Quadro Autorizado de destino da transformação."], quantitativoAnterior: vagas.length, quantitativoPosterior: vagas.length };
    }
    const idsSelecionados = new Set(comando.vagaIds ?? []);
    const idsBloqueados = new Set(comando.vagaIdsBloqueados ?? []);
    const disponiveis = vagas.filter((vaga) => vaga.situacaoLegal === "REGULAR" && vaga.estado === "DISPONIVEL" && !idsBloqueados.has(vaga.id)).sort((a, b) => b.sequencial - a.sequencial);
    const ocupadas = vagas.filter((vaga) => vaga.situacaoLegal === "REGULAR" && vaga.estado === "OCUPADA" && !idsBloqueados.has(vaga.id)).sort((a, b) => b.sequencial - a.sequencial);
    const elegiveis = [...disponiveis, ...ocupadas];
    const candidatas = comando.vagaIds?.length
      ? elegiveis.filter((vaga) => idsSelecionados.has(vaga.id)).slice(0, quantidade)
      : elegiveis.slice(0, quantidade);
    if (quantidade > elegiveis.length) alertas.push(`A transformação foi limitada a ${elegiveis.length} vaga(s) regulares do quadro de origem.`);
    candidatas.forEach((vaga) => alteradas.push(alterarSituacao(vaga, "EM_TRANSFORMACAO", comando, `${comando.lei}: transformação do ${vaga.quadroCodigo} para ${comando.quadroDestinoCodigo}.`)));
    candidatas.forEach((origem, indice) => {
      const sequencial = (comando.maiorSequencialDestino ?? 0) + indice + 1;
      const distribuicaoAtual = comando.distribuicaoAtualPorVagaId?.[origem.id];
      const orgaoDistribuicaoAtual = distribuicaoAtual?.orgao ?? origem.orgaoDistribuicaoInicial;
const id = origem.id;
      const nomeAnterior = origem.nome;
      const nome = orgaoDistribuicaoAtual
        ? gerarNomeVaga(orgaoDistribuicaoAtual, comando.novoCargo!, sequencial)
        : undefined;
      const historico: HistoricoVaga = {
        id: `HIS-${id}-${String(origem.historico.length + 1).padStart(3, "0")}`,
        vagaId: id,
        ocorridoEm: dataRegistro,
        dataEfeito: comando.dataEfeito.split("-").reverse().join("/"),
        tipo: "ALTERACAO_LEGAL",
        titulo: "Vaga transformada entre Quadros Autorizados",
        descricao: nome
          ? `${comando.lei}: nome anterior ${nomeAnterior ?? "não atribuído"}; nome resultante ${nome}; ID técnico preservado.`
          : `${comando.lei}: vaga transformada ainda pendente de distribuição; Nome da vaga não atribuído; ID técnico preservado.`,
        situacaoLegalAnterior: origem.situacaoLegal,
        situacaoLegalPosterior: "REGULAR",
        origem: "Quadro Legal",
        usuario: "Usuário do protótipo",
        processo: comando.processo,
      };
      criadas.push({
        ...origem,
        id,
        nome,
        sequencial,
        quadroAutorizadoId: comando.quadroDestinoId,
        quadroCodigo: comando.quadroDestinoCodigo,
        cargo: comando.novoCargo,
        carreira: comando.novaCarreira || origem.carreira,
        lei: comando.lei,
        orgaoDistribuicaoInicial: orgaoDistribuicaoAtual,
        atoDistribuicaoInicial: distribuicaoAtual?.ato ?? origem.atoDistribuicaoInicial,
        inicioVigenciaDistribuicao: distribuicaoAtual?.inicioVigencia ?? origem.inicioVigenciaDistribuicao,
        criadaEm: dataRegistro,
        inicioVigencia: historico.dataEfeito,
        situacaoLegal: "REGULAR",
        historico: [...origem.historico, historico],
      });
    });
    const idsTransformadas = new Set(candidatas.map((vaga) => vaga.id));
    const quantitativoAnterior = vagas.filter((vaga) => vaga.situacaoLegal !== "EXTINTA").length;
    return { vagas: [...vagas.filter((vaga) => !idsTransformadas.has(vaga.id)), ...criadas], criadas, alteradas, alertas, quantitativoAnterior, quantitativoPosterior: quantitativoAnterior - candidatas.length };
  }
  if (comando.tipo === "REDUCAO") {
    const idsSelecionados = new Set(comando.vagaIds ?? []);
    const idsBloqueados = new Set(comando.vagaIdsBloqueados ?? []);
    const elegiveis = vagas
      .filter(
        (vaga) =>
          vaga.estado === "DISPONIVEL" &&
          vaga.situacaoLegal === "REGULAR" &&
          !idsBloqueados.has(vaga.id),
      )
      .sort((a, b) => b.sequencial - a.sequencial);
    const candidatas = comando.vagaIds?.length
      ? elegiveis.filter((vaga) => idsSelecionados.has(vaga.id))
      : elegiveis.slice(0, quantidade);
    if (quantidade > elegiveis.length) {
      alertas.push(`A redução foi limitada a ${elegiveis.length} vaga(s) disponível(is), regular(es) e sem comprometimento.`);
    }
    candidatas.slice(0, quantidade).forEach((vaga) =>
      alteradas.push(
        alterarSituacao(
          vaga,
          "EXTINTA",
          comando,
          `${comando.lei}: vaga disponível reduzida e extinta imediatamente.`,
        ),
      ),
    );
    const atualizadas = vagas.map((vaga) => alteradas.find((item) => item.id === vaga.id) ?? vaga);
    return {
      vagas: atualizadas,
      criadas,
      alteradas,
      alertas,
      quantitativoAnterior: vagas.length,
      quantitativoPosterior: vagas.length - alteradas.length,
    };
  }

  const idsBloqueados = new Set(comando.vagaIdsBloqueados ?? []);
  const comprometidasAtivas = vagasAtivas.filter((vaga) => idsBloqueados.has(vaga.id));
  if (comprometidasAtivas.length > 0) {
    alertas.push(
      `${comprometidasAtivas.length} vaga(s) comprometida(s) permanecerá(ão) controlada(s) até a conclusão dos respectivos processos.`,
    );
  }
  const candidatas = vagasAtivas
    .sort((a, b) => Number(a.estado === "OCUPADA") - Number(b.estado === "OCUPADA"))
    .slice(0, quantidade);
  candidatas.forEach((vaga) => {
    const comprometida = idsBloqueados.has(vaga.id);
    const mantida = vaga.estado === "OCUPADA" || comprometida;
    const situacao: SituacaoLegalVaga = mantida ? "EM_EXTINCAO" : "EXTINTA";
    const efeito = comprometida
      ? "mantida até a conclusão do processo ativo"
      : vaga.estado === "OCUPADA"
        ? "mantida até a vacância"
        : "extinta imediatamente";
    alteradas.push(alterarSituacao(vaga, situacao, comando, `${comando.lei}: vaga ${efeito}.`));
  });
  const atualizadas = vagas.map((vaga) => alteradas.find((item) => item.id === vaga.id) ?? vaga);
  const quantitativoPosterior = atualizadas.filter((vaga) => vaga.situacaoLegal === "EM_EXTINCAO").length;
  return {
    vagas: atualizadas,
    criadas,
    alteradas,
    alertas,
    quantitativoAnterior: vagas.length,
    quantitativoPosterior,
  };
}

const dataBr = (data: string) => data.split("-").reverse().join("/");

export function reconciliarQuadroAposVacanciaEmExtincao(
  quadro: QuadroAutorizadoRow,
  vagas: readonly Vaga[],
  dataVacancia: string,
): QuadroAutorizadoRow {
  if (!quadro.extincaoProgressivaEmAndamento) return quadro;

  const vagasRestantes = vagas.filter(
    (vaga) =>
      vaga.quadroAutorizadoId === quadro.id &&
      vaga.situacaoLegal !== "EXTINTA",
  );
  const ocupadas = vagasRestantes.filter(
    (vaga) => vaga.estado === "OCUPADA",
  ).length;

  if (vagasRestantes.length > 0) {
    return {
      ...quadro,
      autorizadas: vagasRestantes.length,
      ocupadas,
      comprometidas: 0,
      bloqueadas: 0,
      situacaoVigencia: "ENCERRADO",
      dataEncerramento:
        quadro.dataEncerramento ?? quadro.dataInicioExtincaoProgressiva ?? dataVacancia,
      motivoEncerramento: "Extinção progressiva em andamento.",
      situacao: "Encerrada",
      atualizadoEm: dataBr(dataVacancia),
    };
  }

  return {
    ...quadro,
    autorizadas: 0,
    ocupadas: 0,
    comprometidas: 0,
    bloqueadas: 0,
    situacaoVigencia: "EXTINTO",
    dataExtincao: dataVacancia,
    motivoExtincao:
      "Extinção progressiva concluída após a vacância da última vaga ocupada.",
    fimVigencia: dataBr(dataVacancia),
    situacao: "Encerrada",
    extincaoProgressivaEmAndamento: false,
    atualizadoEm: dataBr(dataVacancia),
  };
}
