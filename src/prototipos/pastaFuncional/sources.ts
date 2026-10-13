import { todos } from "../vinculos/VinculoV2Page";
import { situacaoDoVinculo } from "../vinculos/vinculosConsulta";
import { pessoas, vinculos, eventos } from "../vidaFuncional/model";
import {
  listarIngressosConcluidosPasta,
  listarPessoasFisicasPasta,
} from "../PrototiposPage";
import {
  getOrgaoAtuacaoIngresso,
  getPerfilVariacaoIngresso,
} from "../ingresso/perfilVariacao";
import { agruparServidores, cpfChave } from "./model";
import type {
  Categoria,
  DocumentoFuncional,
  UsuarioPasta,
  VinculoPasta,
} from "./types";

export function usuarioPasta(): UsuarioPasta {
  return {
    nome: "ROBERTO JUNIOR",
    orgao: getOrgaoAtuacaoIngresso(),
    perfil: getPerfilVariacaoIngresso(),
    podeAnexar: true,
  };
}

function categoriaEvento(tipo: string): Categoria {
  if (tipo === "Ingresso") return "Ingresso";
  if (tipo === "Movimentação" || tipo === "Alteração de jornada")
    return "Movimentações";
  if (["Férias", "Licença", "Retorno ao exercício"].includes(tipo))
    return "Férias / Licenças";
  return "Vínculo Funcional";
}

function isoOrigem(data: string) {
  if (/^\d{4}-/.test(data))
    return /(?:Z|[+-]\d{2}:\d{2})$/.test(data)
      ? data
      : `${data.slice(0, 19)}-04:00`;
  const partes = data.match(/(\d{2})\/(\d{2})\/(\d{4}).*?(\d{2}):(\d{2})/);
  return partes
    ? `${partes[3]}-${partes[2]}-${partes[1]}T${partes[4]}:${partes[5]}:00-04:00`
    : "";
}

export function carregarFontesPasta() {
  const registros: VinculoPasta[] = todos().map((v) => ({
    id: v.id,
    cpf: v.cpf,
    nome: v.nome,
    matricula: v.matricula,
    numero: v.numero,
    tipo: v.tipo,
    situacao:
      v.vacanciaForma === "Falecimento" && situacaoDoVinculo(v) === "Encerrado"
        ? "Falecido"
        : situacaoDoVinculo(v),
    orgao: v.orgao,
    unidade: v.setor,
    inicio: v.inicio,
    fim: v.vacanciaData,
  }));
  vinculos.forEach((v) => {
    const pessoa = pessoas.find((p) => p.id === v.pessoaId)!;
    if (
      registros.some(
        (r) =>
          cpfChave(r.cpf) === cpfChave(pessoa.cpf) &&
          r.matricula === v.matricula &&
          r.numero === String(v.numero),
      )
    )
      return;
    registros.push({
      id: v.id,
      cpf: pessoa.cpf,
      nome: pessoa.nome,
      matricula: v.matricula,
      numero: String(v.numero),
      tipo: v.tipo,
      situacao:
        v.classificacao === "Falecido"
          ? "Falecido"
          : v.fim
            ? "Encerrado"
            : "Ativo",
      orgao: v.orgao,
      unidade: v.unidade,
      inicio: v.inicio,
      fim: v.fim,
    });
  });
  const documentos: DocumentoFuncional[] = eventos.map((e) => {
    const v = vinculos.find((item) => item.id === e.vinculoId)!;
    const pessoa = pessoas.find((p) => p.id === v.pessoaId)!;
    const categoria =
      v.tipo === "Aposentado" ||
      (e.tipo === "Encerramento" && Boolean(v.relacionadoId))
        ? "Aposentadoria e Benefícios"
        : categoriaEvento(e.tipo);
    const numeroIngresso =
      e.secoes["Dados do Ingresso"]?.["Número do ingresso"];
    const conteudo = [
      "SIGEP — Registro documental da Vida Funcional",
      e.documento,
      e.titulo,
      `Servidor: ${pessoa.nome}`,
      `CPF: ${pessoa.cpf}`,
      `Matrícula: ${v.matricula}`,
      `Vínculo: ${v.numero}`,
      ...Object.entries(e.secoes).flatMap(([secao, campos]) => [
        secao,
        ...Object.entries(campos).map(([campo, valor]) => `${campo}: ${valor}`),
      ]),
      `Origem: ${e.origem}`,
      `Responsável: ${e.responsavel}`,
      `Registro: ${e.registradoEm}`,
    ].join("\n");
    return {
      id: `vida-funcional:${e.id}`,
      cpf: pessoa.cpf,
      nome: e.titulo,
      categoria,
      tipoDocumento: e.tipo,
      origem: e.origem,
      moduloOrigem: "Vida Funcional do Servidor",
      origemId: e.id,
      vinculoId: v.id,
      numeroIngresso,
      evento: e.tipo,
      dataDocumento: e.data,
      anexadoEm: isoOrigem(e.registradoEm),
      anexadoPor: e.responsavel,
      orgaoResponsavel: v.orgao,
      arquivoNome: `registro-${e.id.replace(/[^a-z0-9-]/gi, "-")}.txt`,
      arquivoTipo: "text/plain",
      conteudoTexto: conteudo,
      observacao:
        "Registro documental disponível no protótipo de Vida Funcional; os dados e a referência do ato são preservados. Não substitui o arquivo original do ato.",
      validado: true,
    };
  });
  listarIngressosConcluidosPasta().forEach((ingresso) => {
    const id = `ingresso-comissionado:${ingresso.id}`;
    registros.push({
      id,
      cpf: ingresso.cpf,
      nome: ingresso.nome,
      matricula: ingresso.dados?.matricula ?? "—",
      numero: ingresso.dados?.vinculo ?? "—",
      tipo: "Exclusivamente Comissionado",
      situacao: "Ativo",
      orgao: ingresso.orgao,
      unidade: ingresso.setorLotacao,
      inicio: ingresso.dataEfetivoExercicio.split("/").reverse().join("-"),
    });
    ingresso.historico
      .filter((h) => h.arquivo)
      .forEach((h) => {
        const data = isoOrigem(h.dataHora);
        if (!data) return;
        documentos.push({
          id: `ingresso-comissionado:${ingresso.id}:${h.arquivo}`,
          cpf: ingresso.cpf,
          nome: h.titulo,
          categoria: "Ingresso",
          tipoDocumento: "Termo de Efetivo Exercício",
          origem: "Efetivo Exercício",
          moduloOrigem: "Ingresso Comissionados",
          origemId: String(ingresso.id),
          vinculoId: id,
          numeroIngresso: String(ingresso.id),
          evento: h.titulo,
          anexadoEm: data,
          anexadoPor: h.responsavel,
          orgaoResponsavel: ingresso.orgao,
          arquivoNome: `registro-${h.arquivo}.txt`,
          arquivoTipo: "text/plain",
          conteudoTexto: [
            "SIGEP — Registro documental do Ingresso",
            h.titulo,
            h.descricao,
            `Arquivo de origem: ${h.arquivo}`,
            `Responsável: ${h.responsavel}`,
            `Registro: ${h.dataHora}`,
          ].join("\n"),
          observacao: `Referência do arquivo no módulo de origem: ${h.arquivo}. O protótipo anterior conserva metadados; este arquivo TXT reúne o registro disponível.`,
          validado: true,
        });
      });
  });
  return {
    servidores: agruparServidores(registros, listarPessoasFisicasPasta()),
    documentos,
  };
}
