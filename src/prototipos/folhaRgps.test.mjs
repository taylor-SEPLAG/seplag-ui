import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { consultarTetoRgps, encadearVigenciasRgps, rgpsData, rgpsNumero, situacaoRgps, validarFaixasRgps } from "./folhaRgps.ts";

const referencia = (inicio, fim, valor = "R$ 8.475,55", situacao = "Ativo") => ({
  inicioVigencia: inicio, fimVigencia: fim, valor, situacao,
});
const faixas = [
  { ordem: 1, faixaInicial: "R$ 0,00", faixaFinal: "R$ 1.621,00", percentual: "7,5" },
  { ordem: 2, faixaInicial: "R$ 1.621,01", faixaFinal: "R$ 2.902,84", percentual: "9" },
  { ordem: 3, faixaInicial: "R$ 2.902,85", faixaFinal: "R$ 4.354,27", percentual: "12" },
  { ordem: 4, faixaInicial: "R$ 4.354,28", faixaFinal: "R$ 8.475,55", percentual: "14" },
];
const teto = "R$ 8.475,55";

test("datas reais, inclusive fevereiro bissexto; rejeita normalização silenciosa", () => {
  assert.notEqual(rgpsData("29/02/2024"), undefined);
  for (const data of ["29/02/2026", "31/04/2026", "01/13/2026", "2026-01-01", "", "01/01/0500"])
    assert.equal(rgpsData(data), undefined, data);
});

test("valores monetários brasileiros com separador e espaço não separável", () => {
  assert.equal(rgpsNumero("R$\u00a08.475,55"), 8475.55);
  for (const valor of ["abc", "Em aberto", "", "8.47,55", "1,234"])
    assert.equal(Number.isNaN(rgpsNumero(valor)), true, valor);
});

test("consulta temporal aceita referência histórica encerrada e futura agendada", () => {
  const referencias = [referencia("01/01/2026", "31/12/2026", teto, "Encerrado"), referencia("01/01/2027", "", "R$ 9.000,00", "Agendado")];
  assert.equal(consultarTetoRgps(referencias, "31/12/2026").valor, teto);
  assert.equal(consultarTetoRgps(referencias, "01/01/2027").valor, "R$ 9.000,00");
  assert.equal(consultarTetoRgps(referencias, "31/12/2025").valor, undefined);
});

test("bloqueia referência ausente, inativa, inválida, negativa ou sobreposta", () => {
  const valida = referencia("01/01/2026", "31/12/2026");
  for (const referencias of [[], [{ ...valida, situacao: "Inativo" }], [{ ...valida, valor: "0" }], [{ ...valida, valor: "abc" }], [{ ...valida, fimVigencia: "31/02/2026" }], [valida, valida]]) {
    assert.ok(consultarTetoRgps(referencias, "01/06/2026").erro);
  }
});

test("tabela de 2026 possui faixas consecutivas e encerra no teto", () => {
  assert.equal(validarFaixasRgps(faixas, teto), undefined);
  assert.ok(validarFaixasRgps([], teto));
  assert.ok(validarFaixasRgps(faixas.slice(0, 3), teto));
});

test("rejeita primeira faixa deslocada, lacuna, sobreposição e ordem incorreta", () => {
  for (const [indice, alteracao] of [[0, { faixaInicial: "0,01" }], [1, { faixaInicial: "1.621,02" }], [2, { faixaInicial: "2.902,84" }], [1, { ordem: 3 }]]) {
    assert.ok(validarFaixasRgps(faixas.map((faixa, i) => i === indice ? { ...faixa, ...alteracao } : faixa), teto));
  }
});

test("rejeita percentual inválido e faixa aberta ou superior ao teto", () => {
  for (const percentual of ["", "abc", "0", "-1", "100,01", "7,555"])
    assert.ok(validarFaixasRgps(faixas.map((faixa, i) => i === 1 ? { ...faixa, percentual } : faixa), teto), percentual);
  for (const faixaFinal of ["Em aberto", "8.475,56", "8.475,54", "0"])
    assert.ok(validarFaixasRgps(faixas.map((faixa, i) => i === 3 ? { ...faixa, faixaFinal } : faixa), teto), faixaFinal);
});

test("sucessora encerra anterior na mesma data sem alterar suas faixas", () => {
  const anterior = { id: 1, inicioVigencia: "01/01/2026", fimVigencia: "", faixasContribuicao: faixas };
  const nova = { id: 2, inicioVigencia: "01/01/2027", fimVigencia: "", faixasContribuicao: [] };
  const resultado = encadearVigenciasRgps([anterior], nova);
  assert.equal(resultado[0].fimVigencia, "01/01/2027");
  assert.deepEqual(resultado[0].faixasContribuicao, faixas);
  assert.equal(anterior.fimVigencia, "");
  assert.equal(situacaoRgps(resultado[0], new Date(2027, 0, 1)), "Encerrado");
  assert.equal(situacaoRgps(resultado[1], new Date(2027, 0, 1)), "Ativo");
});

test("edição substitui o registro e inserção histórica preserva a continuidade", () => {
  const atuais = [{ id: 1, inicioVigencia: "01/01/2026" }, { id: 3, inicioVigencia: "01/01/2028" }];
  const resultado = encadearVigenciasRgps(atuais, { id: 2, inicioVigencia: "01/01/2027" });
  assert.deepEqual(resultado.map((item) => item.fimVigencia), ["01/01/2027", "01/01/2028", ""]);
  assert.equal(encadearVigenciasRgps(resultado, { ...resultado[1], nome: "Atualizada" }).length, 3);
  assert.throws(() => encadearVigenciasRgps(atuais, { id: 9, inicioVigencia: "01/01/2026" }));
  assert.throws(() => encadearVigenciasRgps(atuais, { id: 9, inicioVigencia: "31/02/2027" }));
});

test("situação considera início inclusivo e fim exclusivo", () => {
  const vigencia = { id: 1, inicioVigencia: "01/01/2026", fimVigencia: "01/01/2027" };
  assert.equal(situacaoRgps(vigencia, new Date(2025, 11, 31)), "Agendado");
  assert.equal(situacaoRgps(vigencia, new Date(2026, 0, 1)), "Ativo");
  assert.equal(situacaoRgps(vigencia, new Date(2026, 11, 31)), "Ativo");
  assert.equal(situacaoRgps(vigencia, new Date(2027, 0, 1)), "Encerrado");
});

// Executa os handlers reais do formulário com armazenamento isolado, sem abrir
// nem modificar o localStorage do usuário e sem importar a árvore inteira da UI.
const fonte = ts.createSourceFile("PrototiposPage.tsx", readFileSync(new URL("./PrototiposPage.tsx", import.meta.url), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
function handler(nome, dependencias) {
  let expressao;
  function visitar(no) {
    if (ts.isVariableDeclaration(no) && no.name.getText(fonte) === nome) expressao = no.initializer.getText(fonte);
    ts.forEachChild(no, visitar);
  }
  visitar(fonte);
  assert.ok(expressao, `Handler ${nome} encontrado`);
  const codigo = ts.transpileModule(`const executar = ${expressao};`, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
  return new Function(...Object.keys(dependencias), `${codigo}; return executar;`)(...Object.values(dependencias));
}

function formulario({ registros = [], referencias = [referencia("01/01/2026", "31/12/2026")], faixa = faixas, aba = "faixa-contribuicao", id, falharGravacao = false } = {}) {
  const chave = "teste.rgps";
  const armazenamento = new Map([[chave, JSON.stringify(registros)]]);
  const resultado = { feedback: "", destino: null, aba: null, dadosGeraisSalvos: false };
  const window = { localStorage: {
    getItem: (key) => armazenamento.get(key) ?? null,
    setItem: (key, valor) => { if (falharGravacao) throw new Error("QuotaExceededError"); armazenamento.set(key, valor); },
  } };
  const ler = handler("lerFolhaTabelaReferenciaRgpsVigencias", { window, FOLHA_TABELAS_REFERENCIA_RGPS_STORAGE_KEY: chave, situacaoRgps });
  const salvar = handler("salvarVigencia", {
    isTabelaRgps: true, isEditing: Boolean(id), vigenciaId: id, vigenciaAtual: registros.find((item) => item.id === id),
    setFeedback: (texto) => { resultado.feedback = texto; },
    rgpsData, rgpsNumero, consultarTetoRgps, encadearVigenciasRgps, validarFaixasRgps,
    getFolhaValoresReferenciaPersistidos: () => [{ codigo: "TETO_RGPS", vigencias: referencias }],
    lerFolhaTabelaReferenciaRgpsVigencias: ler,
    activeTab: aba, faixasVigencia: faixa, referenciasTetoRgps: referencias,
    setDadosGeraisSalvos: (valor) => { resultado.dadosGeraisSalvos = valor; },
    setActiveTab: (valor) => { resultado.aba = valor; }, window,
    FOLHA_TABELAS_REFERENCIA_RGPS_STORAGE_KEY: chave,
    FOLHA_TABELAS_REFERENCIA_BASE_PATH: "/tabelas",
    rgpsSalvo: { current: false }, navigate: (destino) => { resultado.destino = destino; },
  });
  return { salvar, ler, resultado, armazenamento };
}
const dados = { descricao: "RGPS 2026", anoBase: "2026", inicioVigencia: "01/01/2026", fimVigencia: "", baseLegal: ["portaria-13-2026"], observacoes: "" };

test("Dados Gerais avança sem persistir configuração incompleta", () => {
  const app = formulario({ aba: "dados-gerais", faixa: [] });
  app.salvar(dados);
  assert.equal(app.resultado.aba, "faixa-contribuicao");
  assert.equal(app.resultado.dadosGeraisSalvos, true);
  assert.deepEqual(app.ler(), []);
});

test("salvar, reabrir e editar utiliza os dados persistidos da própria vigência", () => {
  const app = formulario();
  app.salvar(dados);
  const [gravada] = app.ler();
  assert.equal(app.resultado.destino, "/tabelas");
  assert.equal(gravada.tetoPrevidenciario, teto);
  assert.deepEqual(gravada.faixasContribuicao, faixas);
  const editada = faixas.map((faixa) => ({ ...faixa, percentual: "15" }));
  const edicao = formulario({ id: gravada.id, registros: [gravada], faixa: editada });
  edicao.salvar({ ...dados, descricao: "Descrição corrigida" });
  assert.equal(edicao.ler().length, 1);
  assert.equal(edicao.ler()[0].nome, "Descrição corrigida");
  assert.deepEqual(edicao.ler()[0].faixasContribuicao, editada);
});

test("sucessora persiste encerramento da anterior sem substituir suas faixas", () => {
  const anterior = { ...dados, id: 1, nome: "Original", ano: "2026", faixasContribuicao: faixas };
  const app = formulario({ registros: [anterior], referencias: [referencia("01/01/2026", "31/12/2027")] });
  app.salvar({ ...dados, inicioVigencia: "01/01/2027", anoBase: "2027" });
  assert.equal(app.ler()[0].fimVigencia, "01/01/2027");
  assert.deepEqual(app.ler()[0].faixasContribuicao, faixas);
  assert.equal(app.ler().length, 2);
});

test("erros de referência, faixas, período e armazenamento não confirmam nem navegam", () => {
  for (const opcoes of [{ referencias: [] }, { faixa: [] }, { referencias: [referencia("01/01/2026", ""), referencia("01/01/2026", "")] }, { registros: [{ id: 1, inicioVigencia: dados.inicioVigencia }] }, { falharGravacao: true }]) {
    const app = formulario(opcoes);
    const antes = [...app.armazenamento];
    app.salvar(dados);
    assert.equal(app.resultado.destino, null);
    assert.ok(app.resultado.feedback);
    assert.deepEqual([...app.armazenamento], antes);
  }
});

test("editar faixa intermediária preserva continuidade e recalcula sua contribuição", () => {
  let atualizadas = faixas;
  let mensagem = "";
  let modalAberto = true;
  const moeda = (valor) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
  const calcular = handler("calcularContribuicaoFaixaReferencia", { parseMoedaReferencia: rgpsNumero, formatMoedaReferencia: moeda });
  const salvar = handler("salvarNovaFaixa", {
    novaFaixaForm: { faixaFinal: "2.902,84", percentual: "10" },
    isTabelaRgps: true, isTabelaIrrf: false, tetoRgpsNaData: teto, tetoRgpsConsultado: { valor: teto },
    isFaixaAberta: (faixa) => faixa.faixaFinal === "Em aberto", rgpsNumero,
    setFeedback: (texto) => { mensagem = texto; },
    isModeloRppsMilitar: false, isModeloRppsSalarioMinimo: false, isModeloRppsLc700: false,
    faixaEditandoId: 2, faixaEditando: { ...faixas[1], id: 2 },
    faixasVigencia: faixas.map((faixa, index) => ({ ...faixa, id: index + 1 })),
    tetoPrevidenciarioSelecionado: teto, parseMoedaReferencia: rgpsNumero,
    faixaInicialModal: faixas[1].faixaInicial, proximaOrdemFaixa: 5,
    formatMoedaReferencia: moeda, calcularContribuicaoFaixaReferencia: calcular,
    setFaixasVigencia: (atualizar) => { atualizadas = atualizar(faixas.map((faixa, index) => ({ ...faixa, id: index + 1 }))); },
    setModalNovaFaixaAberto: (valor) => { modalAberto = valor; }, setFaixaEditandoId: () => {},
  });
  salvar();
  assert.equal(mensagem, "Faixa atualizada com sucesso!");
  assert.equal(modalAberto, false);
  assert.equal(atualizadas[1].percentual, "10");
  assert.equal(rgpsNumero(atualizadas[1].contribuicaoFaixa), 128.18);
  assert.equal(validarFaixasRgps(atualizadas, teto), undefined);
});

test("configuração não atravessa mudança de teto sem sucessora compatível", () => {
  const app = formulario({ referencias: [referencia("01/01/2026", "31/12/2026"), referencia("01/01/2027", "", "R$ 9.000,00")] });
  app.salvar(dados);
  assert.equal(app.resultado.destino, null);
  assert.match(app.resultado.feedback, /alteração do Teto RGPS/);
  assert.deepEqual(app.ler(), []);
});
