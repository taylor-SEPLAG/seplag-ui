import type {
  HistoricoVaga,
  QuadroAutorizadoRow,
  SituacaoLegalVaga,
  Vaga,
} from "./types";
import { gerarIdentificadorVaga } from "./vagaUtils";

export type TipoAlteracaoQuadroLegal = "AMPLIACAO" | "REDUCAO" | "TRANSFORMACAO" | "EXTINCAO_PROGRESSIVA";

export interface ComandoAlteracaoQuadroLegal {
  tipo: TipoAlteracaoQuadroLegal;
  quantidade: number;
  lei: string;
  processo: string;
  dataEfeito: string;
  novoCargo?: string;
  novaCarreira?: string;
  vagaIds?: readonly string[];
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
  const quantidade = comando.tipo === "EXTINCAO_PROGRESSIVA" ? vagas.length : Math.max(0, Math.floor(comando.quantidade));
  const base = vagas[0];
  if (!base || !comando.lei || !comando.dataEfeito || quantidade < 1) return { vagas, criadas, alteradas, alertas: ["Preencha lei, data de efeito e quantidade válida."], quantitativoAnterior: vagas.length, quantitativoPosterior: vagas.length };

  if (comando.tipo === "AMPLIACAO") {
    const maiorSequencial = Math.max(0, ...vagas.map((vaga) => vaga.sequencial));
    for (let indice = 1; indice <= quantidade; indice += 1) {
      const sequencial = maiorSequencial + indice;
      const id = gerarIdentificadorVaga(base.orgaoTitular, base.cargo, sequencial);
      const historico: HistoricoVaga = { id: `HIS-${id}-001`, vagaId: id, ocorridoEm: dataRegistro, dataEfeito: comando.dataEfeito.split("-").reverse().join("/"), tipo: "CRIACAO", titulo: "Vaga criada por ampliação legal", descricao: `${comando.lei} ampliou o quadro em ${quantidade} vaga(s).`, origem: "Quadro Legal", usuario: "Usuário do protótipo", processo: comando.processo };
      criadas.push({
        ...base,
        id,
        sequencial,
        lei: comando.lei,
        destinacaoPrevistaLei: "Pendente de ato de distribuição",
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
    if (!comando.novoCargo) return { vagas, criadas, alteradas, alertas: ["Informe o cargo de destino da transformação."], quantitativoAnterior: vagas.length, quantitativoPosterior: vagas.length };
    const candidatas = vagas.filter((vaga) => vaga.situacaoLegal === "REGULAR").sort((a, b) => Number(a.estado === "OCUPADA") - Number(b.estado === "OCUPADA")).slice(0, quantidade);
    candidatas.forEach((vaga) => alteradas.push(alterarSituacao(vaga, "EM_TRANSFORMACAO", comando, `${comando.lei}: transformação para ${comando.novoCargo}.`)));
    const destinoBase = { ...base, cargo: comando.novoCargo, carreira: comando.novaCarreira || base.carreira };
    candidatas.forEach((_, indice) => {
      const sequencial = indice + 1;
      const id = gerarIdentificadorVaga(base.orgaoTitular, comando.novoCargo!, sequencial);
      const historico: HistoricoVaga = { id: `HIS-${id}-001`, vagaId: id, ocorridoEm: dataRegistro, dataEfeito: comando.dataEfeito.split("-").reverse().join("/"), tipo: "CRIACAO", titulo: "Vaga criada por transformação legal", descricao: `${comando.lei}: origem ${base.cargo}.`, origem: "Quadro Legal", usuario: "Usuário do protótipo", processo: comando.processo };
      criadas.push({ ...destinoBase, id, sequencial, lei: comando.lei, criadaEm: dataRegistro, inicioVigencia: historico.dataEfeito, estado: "DISPONIVEL", situacaoLegal: "REGULAR", historico: [historico] });
    });
    const ids = new Set(alteradas.map((vaga) => vaga.id));
    return { vagas: [...vagas.map((vaga) => alteradas.find((item) => item.id === vaga.id) ?? vaga), ...criadas], criadas, alteradas, alertas, quantitativoAnterior: vagas.length, quantitativoPosterior: vagas.length - ids.size + criadas.length };
  }

  const limite = Math.min(quantidade, vagas.filter((vaga) => vaga.situacaoLegal !== "EXTINTA").length);
  if (quantidade > limite) alertas.push(`A operação foi limitada a ${limite} vaga(s) existentes.`);
  const idsSelecionados = comando.vagaIds ? new Set(comando.vagaIds) : null;
  const candidatas = vagas.filter((vaga) => vaga.situacaoLegal !== "EXTINTA" && (!idsSelecionados || idsSelecionados.has(vaga.id))).sort((a, b) => idsSelecionados ? (comando.vagaIds?.indexOf(a.id) ?? 0) - (comando.vagaIds?.indexOf(b.id) ?? 0) : Number(a.estado === "OCUPADA") - Number(b.estado === "OCUPADA")).slice(0, limite);
  candidatas.forEach((vaga) => {
    const situacao: SituacaoLegalVaga = vaga.estado === "OCUPADA" ? "EM_EXTINCAO" : "EXTINTA";
    alteradas.push(alterarSituacao(vaga, situacao, comando, `${comando.lei}: vaga ${vaga.estado === "OCUPADA" ? "mantida até a vacância" : "extinta imediatamente"}.`));
  });
  const atualizadas = vagas.map((vaga) => alteradas.find((item) => item.id === vaga.id) ?? vaga);
  const emExtincao = alteradas.filter((vaga) => vaga.situacaoLegal === "EM_EXTINCAO").length;
  if (emExtincao) alertas.push(`${emExtincao} vaga(s) ocupada(s) permanecerão em extinção até a liberação.`);
  const quantitativoPosterior =
    comando.tipo === "EXTINCAO_PROGRESSIVA"
      ? atualizadas.filter((vaga) => vaga.situacaoLegal === "EM_EXTINCAO").length
      : vagas.length - alteradas.length;
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
