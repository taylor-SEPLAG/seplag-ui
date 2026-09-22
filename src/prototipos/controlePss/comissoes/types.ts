export type TipoComissao = "PROCESSO_SELETIVO" | "CONCURSO";
// ENCERRADA só é alcançada automaticamente, pela vigência (Término já passou — ver
// calcularStatusPorVigencia); CANCELADA é o cancelamento manual, antecipado, feito pelo usuário com
// justificativa (ação "Cancelar" da listagem — ver ComissoesListContent) — fica inativa. Reabrir só
// se aplica à CANCELADA; a ENCERRADA volta a Em andamento sozinha se o Término for removido/adiado.
export type StatusComissao = "RASCUNHO" | "EM_ANDAMENTO" | "ENCERRADA" | "CANCELADA";
export type CargoMembroComissao = "MEMBRO" | "PRESIDENTE" | "SECRETARIO" | "SUPLENTE";
export type TipoAtoNomeacao = "PORTARIA" | "DECRETO" | "RESOLUCAO" | "LEI";
export type LocalPublicacaoAto = "DOE" | "DOU";

export interface ArquivoAtoNomeacao { readonly id:string; nome:string; extensao:string; contentType:string; conteudoEmBase64:string; tamanho?:number; }

// Ato de nomeação: instrumento legal (Portaria/Decreto/Resolução) que formaliza a designação do
// servidor para o cargo na comissão — preenchido junto com o próprio membro, não como registro à parte.
export interface AtoNomeacaoMembro {
 tipoAto?:TipoAtoNomeacao;
 numeroAto?:string;
 dataPublicacao?:string;
 localPublicacao?:LocalPublicacaoAto;
 arquivo?:ArquivoAtoNomeacao;
}

export interface MembroComissao {
 readonly id:string;
 servidorId:string;
 nome:string;
 matricula:string;
 lotacao?:string;
 cargo:CargoMembroComissao;
 inicio?:string;
 fim?:string;
 atoNomeacao:AtoNomeacaoMembro;
}

export type TipoEventoHistoricoMembro = "MEMBRO_ADICIONADO" | "CARGO_ALTERADO" | "ARQUIVO_ATO_ALTERADO" | "MEMBRO_REMOVIDO" | "DOCUMENTO_COMISSAO_ALTERADO" | "STATUS_ALTERADO";

// Trilha de auditoria da comissão: cada alteração feita num membro — inclusão, troca de cargo,
// substituição do arquivo do ato de nomeação ou remoção — vira um registro novo aqui, nunca uma
// edição do que já foi gravado (mesmo padrão append-only do histórico de situações do Certame, ver
// certame/types.ts SituacaoHistoricoCertame). membroNome fica congelado no momento do evento para o
// histórico continuar legível mesmo depois que o membro for removido da composição. membroId/
// membroNome ficam vazios nos eventos DOCUMENTO_COMISSAO_ALTERADO e STATUS_ALTERADO, que não
// pertencem a um membro específico — são, respectivamente, a troca do documento único da própria
// comissão (aba Identificação) e a mudança do status da comissão (manual, via Cancelar/Reabrir na
// listagem, ou automática, pela vigência/finalização do cadastro — ver calcularStatusPorVigencia).
export interface HistoricoAlteracaoMembro {
 readonly id:string;
 readonly membroId?:string;
 readonly membroNome?:string;
 readonly tipo:TipoEventoHistoricoMembro;
 readonly descricao:string;
 readonly registradoEm:string;
 readonly usuario:string;
 // Cópia do arquivo (ato de nomeação ou documento da comissão) como ele estava no momento do
 // evento — só em ARQUIVO_ATO_ALTERADO/DOCUMENTO_COMISSAO_ALTERADO quando o evento anexou ou
 // substituiu um arquivo (indefinido quando o evento removeu o arquivo, ou não é sobre arquivo).
 // Guardado à parte da referência atual do membro/comissão para o "Visualizar" do Histórico
 // continuar funcionando mesmo depois de o arquivo ser substituído de novo.
 readonly arquivo?:ArquivoAtoNomeacao;
}

export interface Comissao {
 readonly id:string;
 numero:string;
 tipo:TipoComissao;
 certameId?:string;
 nome:string;
 observacoes?:string;
 previsaoInicio?:string;
 inicio?:string;
 previsaoTermino?:string;
 termino?:string;
 orgao:string;
 vinculoResponsavelId?:string;
 status:StatusComissao;
 membros:readonly MembroComissao[];
 // Histórico de alterações na composição (cargo, arquivo do ato, inclusão/remoção de membro) — ver
 // HistoricoAlteracaoMembro. Consultado pela ação "Histórico" da listagem de comissões.
 historicoMembros:readonly HistoricoAlteracaoMembro[];
 // Documento que institui a comissão (ex.: Portaria/Decreto de criação) — mesmo padrão de anexo
 // (.pdf, único arquivo) do Ato de nomeação de cada membro.
 arquivo?:ArquivoAtoNomeacao;
 readonly criadoEm:string;
 atualizadoEm:string;
}
