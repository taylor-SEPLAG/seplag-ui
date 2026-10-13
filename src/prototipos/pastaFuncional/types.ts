export const CATEGORIAS = [
  "Cadastrais",
  "Ingresso",
  "Vínculo Funcional",
  "Movimentações",
  "Férias / Licenças",
  "Aposentadoria e Benefícios",
  "Documentos Gerais",
] as const;
export type Categoria = (typeof CATEGORIAS)[number];
export type SituacaoPasta = "Ativo" | "Encerrado" | "Falecido";
export type VinculoPasta = {
  id: string;
  cpf: string;
  nome: string;
  matricula: string;
  numero: string;
  tipo: string;
  situacao: SituacaoPasta;
  orgao: string;
  unidade: string;
  inicio: string;
  fim?: string;
};
export type ServidorPasta = {
  id: string;
  cpf: string;
  nome: string;
  vinculos: VinculoPasta[];
};
export type DocumentoFuncional = {
  id: string;
  cpf: string;
  nome: string;
  categoria: Categoria;
  tipoDocumento: string;
  origem: string;
  moduloOrigem: string;
  origemId: string;
  vinculoId?: string;
  numeroIngresso?: string;
  evento?: string;
  dataDocumento?: string;
  anexadoEm: string;
  anexadoPor: string;
  orgaoResponsavel: string;
  arquivoNome: string;
  arquivoTipo: string;
  arquivoTamanho?: number;
  observacao: string;
  identificadorExterno?: string;
  validado: true;
  conteudoTexto?: string;
};
export type UsuarioPasta = {
  nome: string;
  orgao: string;
  perfil: "CENTRAL" | "SETORIAL";
  podeAnexar: boolean;
};
export const TIPOS_DOCUMENTO: Record<
  Exclude<Categoria, "Ingresso">,
  string[]
> = {
  Cadastrais: [
    "RG",
    "CPF",
    "Certidão de Nascimento",
    "Certidão de Casamento",
    "Comprovante de Residência",
    "Título de Eleitor",
    "PIS/PASEP",
    "Carteira de Trabalho",
    "Certificado Militar",
    "Foto",
    "Outro documento cadastral",
  ],
  "Vínculo Funcional": [
    "Portaria",
    "Ato Funcional",
    "Termo",
    "Ato de Vacância",
    "Ato de Exoneração",
    "Documento de Enquadramento",
  ],
  Movimentações: [
    "Remoção",
    "Relotação",
    "Cessão",
    "Designação",
    "Alteração de Jornada",
    "Portaria de Lotação",
  ],
  "Férias / Licenças": [
    "Requerimento",
    "Portaria de Férias",
    "Licença",
    "Atestado",
    "Afastamento",
    "Suspensão",
  ],
  "Aposentadoria e Benefícios": [
    "Processo de Aposentadoria",
    "Ato de Aposentadoria",
    "Pensão",
    "Benefício",
    "Laudo",
    "Certidão Previdenciária",
  ],
  "Documentos Gerais": [
    "Ofício",
    "Memorando",
    "Despacho",
    "Comunicação",
    "Documento Complementar",
  ],
};
