// Seletores puros que derivam os indicadores do Painel Geral a partir de Certame[] —
// isolados do componente para permitir teste unitário direto (ver painelSelectors.test.ts).
import { differenceInCalendarDays, isWithinInterval } from "date-fns";
import { stringToDateSeplag } from "@uteis/manipulaData";
import { DOCUMENTOS_CERTAME } from "./dominios";
import type { Certame, SituacaoCertame, TipoDocumentoCertame } from "./types";

export type BucketStatusCertame = "ELABORACAO" | "PUBLICADA" | "ANALISE" | "HOMOLOGADO" | "CANCELADO";

// Mapeamento das 9 situações (RN-15) para os 5 grupos solicitados no Painel — pendência de
// validação com a área de negócio: o modelo atual não distingue um estado de "elaboração" (todo
// certame já nasce "Aberto"/publicado, RN-15/CA17), então esse grupo hoje é sempre 0.
const BUCKET_POR_SITUACAO:Record<SituacaoCertame, BucketStatusCertame> = {
 ABERTO:"PUBLICADA", RETIFICACAO_EDITAL:"PUBLICADA",
 PRORROGACAO_VALIDADE:"ANALISE", PARALISADO:"ANALISE",
 HOMOLOGADO:"HOMOLOGADO", HOMOLOGACAO_PARCIAL:"HOMOLOGADO", RETIFICACAO_HOMOLOGACAO:"HOMOLOGADO", RETIFICACAO_HOMOLOGACAO_PARCIAL:"HOMOLOGADO",
 CANCELADO_ANULADO:"CANCELADO",
};

export function bucketStatusCertame(certame:Certame):BucketStatusCertame {
 return BUCKET_POR_SITUACAO[certame.situacaoAtual];
}

// RN-05 (cancelamento não desfaz a existência do certame) — "ativo" aqui significa apenas que o
// certame não foi cancelado/anulado; certames homologados continuam contados como ativos.
export function certameAtivo(certame:Certame):boolean {
 return certame.situacaoAtual !== "CANCELADO_ANULADO";
}

export function totalVagas(certame:Certame):number {
 return certame.cargos.reduce((total, cargo) => total + cargo.quantidadeVagas, 0);
}

export function totalVagasPcd(certame:Certame):number {
 return totalVagasPorCota(certame, "PCD");
}

// Vagas reservadas para um tipo de cota específico (ver dominios.TIPOS_COTA), somadas entre todas
// as reservas de todos os cargos do certame — um mesmo cargo pode ter mais de uma reserva (ex.:
// PCD e PPP simultaneamente), ver CargoVagaCertame.reservasCota.
export function totalVagasPorCota(certame:Certame, tipoCota:string):number {
 return certame.cargos.reduce((total, cargo) => total + cargo.reservasCota.filter((reserva) => reserva.tipo === tipoCota).reduce((soma, reserva) => soma + reserva.quantidade, 0), 0);
}

export function inscricoesAbertas(certame:Certame, dataReferencia:Date):boolean {
 const inicio = stringToDateSeplag(certame.inicioInscricoesGerais ?? null);
 const fim = stringToDateSeplag(certame.fimInscricoesGerais ?? null);
 if (!inicio || !fim) return false;
 return isWithinInterval(dataReferencia, { start:inicio, end:fim });
}

// RN-20/RN-21/RN-22: mesma regra de obrigatoriedade usada no Cadastro de Certame — sempre
// obrigatório, ou obrigatório quando a execução é por empresa contratada.
export function documentosPendentes(certame:Certame):{ tipo:TipoDocumentoCertame; label:string }[] {
 const houveContratacaoEmpresa = certame.tipoContratacaoExecucao === "EMPRESA_CONTRATADA";
 const anexados = new Set(certame.documentos.map((documento) => documento.tipo));
 return DOCUMENTOS_CERTAME
  .filter((documento) => {
   const obrigatorio = documento.obrigatorioSempre || ((documento.tipo === "CONTRATO_SOCIAL_EMPRESA" || documento.tipo === "PUBLICACAO_CERTAME_LICITATORIO") && houveContratacaoEmpresa);
   return obrigatorio && !anexados.has(documento.tipo as TipoDocumentoCertame);
  })
  .map((documento) => ({ tipo:documento.tipo as TipoDocumentoCertame, label:documento.label }));
}

// Total de documentos obrigatórios para o certame (fixos + condicionais de RN-21/RN-22) — usado
// como denominador do progresso de documentos anexados.
export function documentosObrigatoriosTotal(certame:Certame):number {
 const houveContratacaoEmpresa = certame.tipoContratacaoExecucao === "EMPRESA_CONTRATADA";
 return DOCUMENTOS_CERTAME.filter((documento) => documento.obrigatorioSempre || ((documento.tipo === "CONTRATO_SOCIAL_EMPRESA" || documento.tipo === "PUBLICACAO_CERTAME_LICITATORIO") && houveContratacaoEmpresa)).length;
}

// Prazo de prestação de contas (RN-15) do registro mais recente do histórico de situações —
// é o único "prazo" com data efetivamente rastreada no modelo atual do certame.
export function prazoPrestacaoContasAtual(certame:Certame):string | undefined {
 return certame.historicoSituacoes[certame.historicoSituacoes.length - 1]?.prazoPrestacaoContas;
}

export function prazoVenceEmAteDias(certame:Certame, dataReferencia:Date, dias:number):boolean {
 const prazo = stringToDateSeplag(prazoPrestacaoContasAtual(certame) ?? null);
 if (!prazo) return false;
 const diferenca = differenceInCalendarDays(prazo, dataReferencia);
 return diferenca >= 0 && diferenca <= dias;
}

// Resultado já divulgado (Data do resultado no passado) mas o certame ainda não chegou ao grupo
// Homologado — sinal de que a homologação das vagas está atrasada em relação ao próprio fluxo do certame.
export function homologacaoDeVagasPendente(certame:Certame, dataReferencia:Date):boolean {
 const resultado = stringToDateSeplag(certame.dataResultado ?? null);
 if (!resultado) return false;
 return resultado <= dataReferencia && bucketStatusCertame(certame) !== "HOMOLOGADO";
}

export interface PrazoPainel { certameId:string; titulo:string; orgao:string; data:string; diasRestantes:number }

export function proximosPrazos(certames:readonly Certame[], dataReferencia:Date, limite = 8):PrazoPainel[] {
 return certames
  .map((certame) => {
   const dataPrazo = prazoPrestacaoContasAtual(certame);
   const data = stringToDateSeplag(dataPrazo ?? null);
   if (!data) return undefined;
   return { certameId:certame.id, titulo:`Prestação de contas — ${certame.numeroEditalOrgao}`, orgao:certame.setor, data:dataPrazo!, diasRestantes:differenceInCalendarDays(data, dataReferencia) };
  })
  .filter((item):item is PrazoPainel => item !== undefined && item.diasRestantes >= 0)
  .sort((a, b) => a.diasRestantes - b.diasRestantes)
  .slice(0, limite);
}
