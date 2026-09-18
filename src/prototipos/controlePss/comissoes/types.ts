export type TipoComissao = "PROCESSO_SELETIVO" | "CONCURSO";
export type StatusComissao = "RASCUNHO" | "EM_ANDAMENTO" | "ENCERRADA";
export type CargoMembroComissao = "MEMBRO" | "PRESIDENTE" | "SECRETARIO" | "SUPLENTE";
export type TipoAtoNomeacao = "PORTARIA" | "DECRETO" | "RESOLUCAO";
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
 // Documento que institui a comissão (ex.: Portaria/Decreto de criação) — mesmo padrão de anexo
 // (.pdf, único arquivo) do Ato de nomeação de cada membro.
 arquivo?:ArquivoAtoNomeacao;
 readonly criadoEm:string;
 atualizadoEm:string;
}
