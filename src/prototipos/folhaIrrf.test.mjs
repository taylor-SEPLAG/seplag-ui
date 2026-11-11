import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { consultarReferenciasIrrf, encadearVigenciasIrrf, irrfAberta, irrfData, irrfMoeda, irrfNumero, migrarPeriodoIrrf, periodoIrrf, situacaoIrrf, sugerirParcelaIrrf, validarDadosIrrf, validarFaixaIrrf, validarTabelaIrrf } from "./folhaIrrf.ts";

const faixas = [
  ["0,00", "2.428,80", "0", "0,00"], ["2.428,81", "2.826,65", "7,5", "182,16"],
  ["2.826,66", "3.751,05", "15", "394,16"], ["3.751,06", "4.664,68", "22,5", "675,49"],
  ["4.664,69", "Em aberto", "27,5", "908,73"],
].map(([faixaInicial, faixaFinal, percentual, parcelaDeduzir], index) => ({ id: index + 1, ordem: index + 1, faixaInicial, faixaFinal, percentual, parcelaDeduzir, contribuicaoFaixa: "Calculada pelo motor" }));
const dados = { descricao: "IRRF 2026", anoBase: "2026", inicioVigencia: "01/01/2026", fimVigencia: "", baseLegal: ["lei-15191-2025"], observacoes: "" };

test("valida Dados Gerais em qualquer etapa e rejeita datas inexistentes", () => {
  assert.equal(validarDadosIrrf(dados), undefined);
  assert.notEqual(irrfData("29/02/2024"), undefined);
  for (const alteracao of [{ descricao: "" }, { baseLegal: [] }, { anoBase: "500" }, { inicioVigencia: "31/02/2026" }, { observacoes: "a".repeat(501) }])
    assert.ok(validarDadosIrrf({ ...dados, ...alteracao }));
});

test("tabela completa permite faixa isenta e exige final aberto", () => {
  assert.equal(validarTabelaIrrf(faixas), undefined);
  assert.ok(validarTabelaIrrf([]));
  assert.ok(validarTabelaIrrf(faixas.slice(0, -1)));
  assert.ok(validarTabelaIrrf(faixas.map((faixa, index) => index === 1 ? { ...faixa, faixaInicial: "2.428,82" } : faixa)));
  assert.ok(validarTabelaIrrf(faixas.map((faixa, index) => index === 1 ? { ...faixa, faixaFinal: "Em aberto" } : faixa)));
});

test("percentual aceita zero e rejeita conteúdo inválido e precisão excessiva", () => {
  for (const percentual of ["", "abc", "-1", "100,01", "7,555"])
    assert.ok(validarFaixaIrrf({ ...faixas[1], percentual }));
  for (const parcelaDeduzir of [undefined, "", "-1", "182,161"])
    assert.ok(validarFaixaIrrf({ ...faixas[1], parcelaDeduzir }));
  assert.equal(validarFaixaIrrf(faixas[0]), undefined);
  assert.equal(irrfMoeda(-0).startsWith("-"), false);
});

test("sugestão usa somente a faixa anterior e não modifica parcelas oficiais", () => {
  const antes = structuredClone(faixas);
  assert.equal(irrfNumero(sugerirParcelaIrrf(faixas, 2, "7,5")), 182.16);
  assert.equal(irrfNumero(sugerirParcelaIrrf(faixas, 5, "27,5")), 908.72);
  assert.deepEqual(faixas, antes);
  assert.equal(irrfNumero(faixas[4].parcelaDeduzir), 908.73);
});

test("consulta distingue referências ausentes, inativas, conflitantes e inválidas", () => {
  const referencia = { inicioVigencia: "01/01/2026", fimVigencia: "31/12/2026", situacao: "Ativo", valor: "189,59" };
  const valor = { codigo: "DEDUCAO_DEP_IRRF", nome: "Dependente", vigencias: [referencia] };
  assert.equal(consultarReferenciasIrrf([valor], "01/06/2026")[0].vigencia.valor, "189,59");
  const inativa = { ...referencia, situacao: "Inativo", valor: "999,00" };
  assert.equal(consultarReferenciasIrrf([{ ...valor, vigencias: [inativa, referencia] }], "01/06/2026")[0].vigencia.valor, "189,59");
  assert.match(consultarReferenciasIrrf([valor, valor], "01/06/2026")[0].erro, /Conflito/);
  assert.ok(consultarReferenciasIrrf([{ ...valor, vigencias: [{ ...referencia, valor: "abc" }] }], "01/06/2026")[0].erro);
  assert.equal(consultarReferenciasIrrf([], "01/06/2026").length, 9);
  assert.ok(consultarReferenciasIrrf([valor], "31/02/2026")[0].erro);
});

test("coeficiente mantém seis casas e consulta referências históricas encerradas", () => {
  const resultado = consultarReferenciasIrrf([{ codigo: "IRRF_COEFICIENTE_REDUCAO", nome: "Coeficiente", vigencias: [{ inicioVigencia: "01/01/2026", fimVigencia: "31/12/2026", situacao: "Encerrado", valor: "0,133145" }] }], "31/12/2026");
  assert.equal(resultado[8].vigencia.valor, "0,133145");
  assert.equal(irrfNumero(resultado[8].vigencia.valor, 6), 0.133145);
});

test("migração converte fim inclusivo uma única vez, preservando período e parcelas", () => {
  const legado = { id: 1, inicioVigencia: "01/01/2025", fimVigencia: "31/12/2025", faixasContribuicao: faixas };
  const migrado = migrarPeriodoIrrf(legado);
  assert.equal(migrado.fimVigencia, "01/01/2026");
  assert.equal(legado.fimVigencia, "31/12/2025");
  assert.deepEqual(migrarPeriodoIrrf(migrado), migrado);
  assert.deepEqual(migrado.faixasContribuicao, faixas);
  assert.equal(situacaoIrrf(migrado, new Date(2025, 11, 31)), "Ativo");
  assert.equal(situacaoIrrf(migrado, new Date(2026, 0, 1)), "Encerrado");
  assert.equal(encadearVigenciasIrrf([migrado], { ...migrado, nome: "Corrigida" })[0].fimVigencia, "01/01/2026");
});

test("sucessora encerra anterior e preserva intervalos históricos não envolvidos", () => {
  const antigos = [{ id: 1, inicioVigencia: "01/01/2024", fimVigencia: "31/01/2024" }, { id: 2, inicioVigencia: "01/01/2026", fimVigencia: "" }];
  const resultado = encadearVigenciasIrrf(antigos, { id: 3, inicioVigencia: "01/01/2027" });
  assert.equal(resultado[0].fimVigencia, "01/02/2024");
  assert.equal(resultado[1].fimVigencia, "01/01/2027");
  assert.equal(resultado[2].fimVigencia, "");
  assert.throws(() => encadearVigenciasIrrf(resultado, { id: 9, inicioVigencia: "01/01/2026" }));
  const comIntervalo = encadearVigenciasIrrf([antigos[0]], { id: 8, inicioVigencia: "01/01/2027" });
  assert.equal(comIntervalo[0].fimVigencia, "01/02/2024");
});

// Exercita os handlers reais com armazenamento isolado do navegador do usuário.
const fonte = ts.createSourceFile("PrototiposPage.tsx", readFileSync(new URL("./PrototiposPage.tsx", import.meta.url), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
function handler(nome, dependencias) {
  let expressao;
  function visitar(no) {
    if (ts.isVariableDeclaration(no) && no.name.getText(fonte) === nome) expressao = no.initializer.getText(fonte);
    ts.forEachChild(no, visitar);
  }
  visitar(fonte);
  assert.ok(expressao, nome);
  const codigo = ts.transpileModule(`const executar = ${expressao};`, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
  return new Function(...Object.keys(dependencias), `${codigo}; return executar;`)(...Object.values(dependencias));
}

function formulario({ registros = [], aba = "tabela-progressiva", id, erroArmazenamento = false } = {}) {
  const chave = "teste.irrf";
  let armazenado = JSON.stringify(registros);
  const resultado = { feedback: "", destino: null, aba: null, gerais: false };
  const window = { localStorage: { getItem: () => armazenado, setItem: (_, valor) => { if (erroArmazenamento) throw Error("QuotaExceededError"); armazenado = valor; } } };
  const ler = handler("lerFolhaTabelaReferenciaIrrfVigencias", { window, FOLHA_TABELAS_REFERENCIA_IRRF_STORAGE_KEY: chave, migrarPeriodoIrrf, periodoIrrf, situacaoIrrf });
  const salvarTodos = handler("salvarFolhaTabelaReferenciaIrrfVigencias", { window, FOLHA_TABELAS_REFERENCIA_IRRF_STORAGE_KEY: chave });
  const salvar = handler("salvarVigencia", {
    isTabelaRgps: false, isTabelaIrrf: true, isEditing: Boolean(id), vigenciaAtual: registros.find((item) => item.id === id), vigenciaId: id,
    validarDadosIrrf, encadearVigenciasIrrf, validarTabelaIrrf, periodoIrrf, situacaoIrrf,
    lerFolhaTabelaReferenciaIrrfVigencias: ler, salvarFolhaTabelaReferenciaIrrfVigencias: salvarTodos,
    faixasVigencia: faixas, activeTab: aba, rgpsSalvo: { current: false },
    setFeedback: (texto) => { resultado.feedback = texto; }, setDadosGeraisSalvos: (valor) => { resultado.gerais = valor; }, setActiveTab: (valor) => { resultado.aba = valor; },
    navigate: (destino) => { resultado.destino = destino; }, FOLHA_TABELAS_REFERENCIA_BASE_PATH: "/tabelas",
  });
  return { salvar, ler, resultado };
}

test("Próximo valida e avança inclusive na edição, sem gravar", () => {
  const registro = { ...dados, id: 1, ano: "2026", fimVigenciaExclusivo: true, faixasContribuicao: faixas };
  for (const opcoes of [{}, { registros: [registro], id: 1 }]) {
    const app = formulario({ ...opcoes, aba: "dados-gerais" });
    const antes = app.ler();
    app.salvar(dados);
    assert.equal(app.resultado.aba, "tabela-progressiva");
    assert.equal(app.resultado.destino, null);
    assert.deepEqual(app.ler(), antes);
  }
});

test("grava, reabre e edita preservando as cinco parcelas oficiais", () => {
  const app = formulario(); app.salvar(dados);
  assert.equal(app.resultado.destino, "/tabelas");
  const [registro] = app.ler();
  assert.deepEqual(registro.faixasContribuicao, faixas);
  const edicao = formulario({ registros: [registro], id: registro.id });
  edicao.salvar({ ...dados, descricao: "Descrição corrigida" });
  assert.equal(edicao.ler()[0].nome, "Descrição corrigida");
  assert.deepEqual(edicao.ler()[0].faixasContribuicao, faixas);
});

test("revalida obrigatórios na gravação final e preserva dados na falha de armazenamento", () => {
  const app = formulario(); app.salvar({ ...dados, baseLegal: [] });
  assert.equal(app.resultado.destino, null);
  assert.deepEqual(app.ler(), []);
  const falha = formulario({ erroArmazenamento: true }); falha.salvar(dados);
  assert.equal(falha.resultado.destino, null);
  assert.match(falha.resultado.feedback, /Não foi possível salvar/);
});

test("nova vigência persiste encerramento automático da anterior", () => {
  const anterior = { id: 1, inicioVigencia: "01/01/2025", fimVigencia: "", faixasContribuicao: faixas };
  const app = formulario({ registros: [anterior] }); app.salvar(dados);
  assert.equal(app.ler()[0].fimVigencia, "01/01/2026");
  assert.deepEqual(app.ler()[0].faixasContribuicao, faixas);
});

test("reconfirmar ou alterar percentual preserva a parcela oficial e as outras faixas", () => {
  for (const percentual of [faixas[1].percentual, "8"]) {
  let resultado;
  const salvar = handler("salvarNovaFaixa", {
    isTabelaIrrf: true, novaFaixaForm: { faixaFinal: faixas[1].faixaFinal, percentual, parcelaDeduzir: faixas[1].parcelaDeduzir },
    isFaixaAberta: (faixa) => irrfAberta(faixa.faixaFinal), faixaEditando: faixas[1], faixaEditandoId: 2,
    ordemFaixaModal: 2, faixaInicialModal: faixas[1].faixaInicial, faixasVigencia: faixas,
    validarFaixaIrrf, irrfAberta, irrfNumero, irrfMoeda,
    setFeedback: () => {}, setModalNovaFaixaAberto: () => {}, setFaixaEditandoId: () => {},
    setFaixasVigencia: (atualizar) => { resultado = atualizar(faixas); },
  });
  salvar();
  assert.equal(irrfNumero(resultado[1].parcelaDeduzir), 182.16);
  assert.equal(resultado[1].percentual, percentual);
  for (const indice of [0, 2, 3, 4]) assert.deepEqual(resultado[indice], faixas[indice]);
  }
});
