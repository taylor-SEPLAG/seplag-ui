import { stringToDateSeplag } from "@uteis/manipulaData";
import { CONTROLE_PSS_DATA_REFERENCIA } from "../constants";
import type { CargoMembroComissao, LocalPublicacaoAto, StatusComissao, TipoAtoNomeacao, TipoComissao } from "./types";

export const TIPOS_COMISSAO:{ label:string; value:TipoComissao }[] = [
 { label:"Processo Seletivo", value:"PROCESSO_SELETIVO" },
 { label:"Concurso", value:"CONCURSO" },
];

export const STATUS_COMISSAO:{ label:string; value:StatusComissao }[] = [
 { label:"Rascunho", value:"RASCUNHO" },
 { label:"Em andamento", value:"EM_ANDAMENTO" },
 { label:"Encerrada", value:"ENCERRADA" },
 { label:"Cancelada", value:"CANCELADA" },
];

export const CARGOS_MEMBRO_COMISSAO:{ label:string; value:CargoMembroComissao }[] = [
 { label:"Membro", value:"MEMBRO" },
 { label:"Presidente", value:"PRESIDENTE" },
 { label:"Secretário(a)", value:"SECRETARIO" },
 { label:"Suplente", value:"SUPLENTE" },
];

export const TIPOS_ATO_NOMEACAO:{ label:string; value:TipoAtoNomeacao }[] = [
 { label:"Decreto", value:"DECRETO" },
 { label:"Lei", value:"LEI" },
 { label:"Portaria", value:"PORTARIA" },
 { label:"Resolução", value:"RESOLUCAO" },
];

export const LOCAIS_PUBLICACAO_ATO:{ label:string; value:LocalPublicacaoAto }[] = [
 { label:"Diário Oficial do Estado", value:"DOE" },
 { label:"Diário Oficial da União", value:"DOU" },
];

// Catálogo simplificado de servidores para a busca de "Adicionar membro" — mesmo papel do
// CARGOS_CADASTRADOS em certame/dominios.ts: um recorte fixo só para o protótipo navegar.
export interface ServidorCadastrado { readonly id:string; nome:string; matricula:string; lotacao:string; }
export const SERVIDORES_CADASTRADOS:readonly ServidorCadastrado[] = [
 { id:"SRV-0001", nome:"Ana Paula Ferreira Lima", matricula:"123456-1", lotacao:"SEPLAG — Gestão de Pessoas" },
 { id:"SRV-0002", nome:"Bruno Henrique Costa Silva", matricula:"234567-2", lotacao:"SEPLAG — Planejamento" },
 { id:"SRV-0003", nome:"Carla Regina Souza Alves", matricula:"345678-3", lotacao:"SEDUC — Ensino Fundamental" },
 { id:"SRV-0004", nome:"Diego Martins Rocha", matricula:"456789-4", lotacao:"SEFAZ — Auditoria Fiscal" },
 { id:"SRV-0005", nome:"Elaine Cristina Barbosa", matricula:"567890-5", lotacao:"SES — Vigilância Sanitária" },
 { id:"SRV-0006", nome:"Fábio Augusto Pereira", matricula:"678901-6", lotacao:"SESP — Corregedoria" },
 { id:"SRV-0007", nome:"Gabriela Nunes Cardoso", matricula:"789012-7", lotacao:"SEJUS — Gestão Prisional" },
 { id:"SRV-0008", nome:"Henrique Oliveira Dias", matricula:"890123-8", lotacao:"SETASC — Assistência Social" },
];

// A lotação sempre começa com a sigla do órgão ("SEPLAG — Gestão de Pessoas") — usado para
// restringir o "Vínc. responsável" da comissão aos servidores lotados no órgão escolhido.
export function orgaoDoServidor(servidor:ServidorCadastrado):string {
 return servidor.lotacao.split(" — ")[0];
}

// Status automático pela vigência (Início/Término): "quando o sistema verificar a validade da
// data" — chamado a cada salvamento da comissão (ComissaoFormContent), tanto na criação quanto na
// edição. Nunca mexe numa comissão Cancelada — esse é um cancelamento manual e antecipado (ação
// "Cancelar" da listagem, com justificativa, deixa a comissão inativa); só a ação "Reabrir" desfaz.
// Sem Início definido, o status também não é mexido (fica Rascunho até alguém informar quando a
// comissão de fato começou). Com Início no futuro (hoje < início), também não mexe — só passa a
// vigorar quando a data chega; na prática Início é preenchido só quando a comissão já começou, mas
// a guarda evita marcar como Encerrada algo que ainda nem começou. Dentro do período (hoje >= início
// e, se houver Término, hoje <= término) vira Em andamento; depois do Término, Encerrada — inclusive
// voltando de Encerrada para Em andamento sozinha se o Término for removido ou adiado para uma data
// futura. Isso substitui a necessidade de uma ação manual "Ativar": Rascunho -> Em andamento
// acontece sozinho assim que a comissão é salva com uma data de Início já vencida.
export function calcularStatusPorVigencia(inicio:string | undefined, termino:string | undefined, statusAtual:StatusComissao):StatusComissao {
 if (statusAtual === "CANCELADA" || !inicio) return statusAtual;
 const hoje = stringToDateSeplag(CONTROLE_PSS_DATA_REFERENCIA);
 const dataInicio = stringToDateSeplag(inicio);
 const dataTermino = termino ? stringToDateSeplag(termino) : null;
 if (!hoje || !dataInicio || hoje < dataInicio) return statusAtual;
 return dataTermino && hoje > dataTermino ? "ENCERRADA" : "EM_ANDAMENTO";
}

export function iniciaisNome(nome:string):string {
 const partes = nome.trim().split(/\s+/).filter(Boolean);
 if (partes.length === 0) return "";
 if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
 return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}
