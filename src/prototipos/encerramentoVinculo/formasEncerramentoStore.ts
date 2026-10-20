export type FormaEncerramento = {
  id: number;
  codigo: number;
  nome: string;
  grupo: "Vacância" | "Encerramento de vínculo";
  vinculos: string[];
  situacao: "ATIVA" | "INATIVA";
  exigeProcessoSigadoc: boolean;
  exigeAnexoProcessoSigadoc?: boolean;
  exigeProcessoLegal: boolean;
  documentosLegaisIds: string[];
  dataCriacao: string;
  dataEncerramento?: string;
  motivoEncerramento?: string;
};

let formasEncerramento: FormaEncerramento[] = [
  { id: 1, codigo: 1, nome: "Exoneração", grupo: "Vacância", vinculos: ["Nomeado Efetivo", "Exclusivamente Comissionado"], situacao: "ATIVA", exigeProcessoSigadoc: true, exigeProcessoLegal: false, documentosLegaisIds: [], dataCriacao: "2026-01-01" },
  { id: 2, codigo: 2, nome: "Demissão", grupo: "Vacância", vinculos: ["Nomeado Efetivo"], situacao: "ATIVA", exigeProcessoSigadoc: true, exigeProcessoLegal: true, documentosLegaisIds: [], dataCriacao: "2026-01-01" },
  { id: 3, codigo: 3, nome: "Aposentadoria", grupo: "Vacância", vinculos: ["Nomeado Efetivo"], situacao: "ATIVA", exigeProcessoSigadoc: true, exigeProcessoLegal: true, documentosLegaisIds: [], dataCriacao: "2026-01-01" },
  { id: 4, codigo: 4, nome: "Posse em outro cargo inacumulável", grupo: "Vacância", vinculos: ["Nomeado Efetivo"], situacao: "ATIVA", exigeProcessoSigadoc: true, exigeProcessoLegal: false, documentosLegaisIds: [], dataCriacao: "2026-01-01" },
  { id: 5, codigo: 5, nome: "Falecimento", grupo: "Vacância", vinculos: ["Nomeado Efetivo", "Contrato Temporário", "Exclusivamente Comissionado"], situacao: "ATIVA", exigeProcessoSigadoc: false, exigeProcessoLegal: false, documentosLegaisIds: [], dataCriacao: "2026-01-01" },
  { id: 6, codigo: 6, nome: "Término do prazo contratual", grupo: "Encerramento de vínculo", vinculos: ["Contrato Temporário"], situacao: "ATIVA", exigeProcessoSigadoc: true, exigeProcessoLegal: false, documentosLegaisIds: [], dataCriacao: "2026-01-01" },
  { id: 7, codigo: 7, nome: "Rescisão por iniciativa do contratado", grupo: "Encerramento de vínculo", vinculos: ["Contrato Temporário"], situacao: "ATIVA", exigeProcessoSigadoc: true, exigeProcessoLegal: false, documentosLegaisIds: [], dataCriacao: "2026-01-01" },
  { id: 8, codigo: 8, nome: "Encerramento de bolsa", grupo: "Encerramento de vínculo", vinculos: ["Bolsista", "Estagiário"], situacao: "ATIVA", exigeProcessoSigadoc: false, exigeProcessoLegal: false, documentosLegaisIds: [], dataCriacao: "2026-01-01" },
];

const formasUtilizadasEmEncerramentos = new Set<number>();

export function listarFormasEncerramento() {
  return formasEncerramento;
}

export function adicionarFormaEncerramento(dados: Pick<FormaEncerramento, "nome" | "vinculos" | "exigeProcessoSigadoc" | "exigeAnexoProcessoSigadoc" | "documentosLegaisIds" | "dataCriacao">) {
  const nome = dados.nome.trim();
  if (formasEncerramento.some((forma) => forma.nome.localeCompare(nome, "pt-BR", { sensitivity: "accent" }) === 0)) {
    throw new Error("Já existe uma forma de encerramento com este nome.");
  }
  if (dados.dataCriacao > new Date().toISOString().slice(0, 10)) throw new Error("A data de início da vigência não pode ser futura.");
  const codigo = Math.max(...formasEncerramento.map((forma) => forma.codigo), 0) + 1;
  formasEncerramento = [...formasEncerramento, {
    id: codigo,
    codigo,
    nome,
    grupo: "Encerramento de vínculo",
    vinculos: dados.vinculos,
    situacao: "ATIVA",
    exigeProcessoSigadoc: dados.exigeProcessoSigadoc,
    exigeProcessoLegal: false,
    exigeAnexoProcessoSigadoc: Boolean(dados.exigeAnexoProcessoSigadoc),
    documentosLegaisIds: dados.documentosLegaisIds,
    dataCriacao: dados.dataCriacao,
  }];
}

export function obterFormaEncerramento(id: number) {
  return formasEncerramento.find((forma) => forma.id === id);
}

export function registrarUsoFormaEncerramento(id: number) {
  formasUtilizadasEmEncerramentos.add(id);
}

export function formaEncerramentoFoiUtilizada(id: number) {
  return formasUtilizadasEmEncerramentos.has(id);
}

export function excluirFormaEncerramento(id: number) {
  if (formaEncerramentoFoiUtilizada(id)) {
    throw new Error("Esta forma de encerramento já foi utilizada e não pode ser excluída.");
  }
  formasEncerramento = formasEncerramento.filter((forma) => forma.id !== id);
}

export function atualizarFormaEncerramento(id: number, dados: Pick<FormaEncerramento, "nome" | "vinculos" | "exigeProcessoSigadoc" | "exigeAnexoProcessoSigadoc" | "documentosLegaisIds">) {
  const nome = dados.nome.trim();
  if (formasEncerramento.some((forma) => forma.id !== id && forma.nome.localeCompare(nome, "pt-BR", { sensitivity: "accent" }) === 0)) throw new Error("Já existe uma forma de encerramento com este nome.");
  formasEncerramento = formasEncerramento.map((forma) => forma.id === id ? { ...forma, ...dados, nome } : forma);
}

export function encerrarFormaEncerramento(id: number, dataEncerramento: string, motivoEncerramento: string) {
  const forma = obterFormaEncerramento(id);
  if (!forma) throw new Error("Forma de encerramento não encontrada.");
  if (dataEncerramento < forma.dataCriacao) throw new Error("A data de encerramento não pode ser anterior à data de criação.");
  if (dataEncerramento > new Date().toISOString().slice(0, 10)) throw new Error("A data de encerramento não pode ser futura.");
  formasEncerramento = formasEncerramento.map((item) => item.id === id ? { ...item, situacao: "INATIVA", dataEncerramento, motivoEncerramento } : item);
}
