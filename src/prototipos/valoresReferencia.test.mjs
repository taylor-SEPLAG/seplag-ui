import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { consultarValorReferencia, dataReferencia, encadearReferencias, formatarValorReferencia, normalizarPeriodoReferencia, prepararGravacaoReferencia, situacaoValorReferencia, validarFormularioReferencia, validarValorReferencia } from "./valoresReferencia.ts";
import { consultarTetoRgps } from "./folhaRgps.ts";
import { consultarReferenciasIrrf } from "./folhaIrrf.ts";

const periodo = (id = 1, inicioVigencia = "01/01/2026", fimVigencia = "31/12/2026", valor = "R$ 8.475,55") => ({ id, inicioVigencia, fimVigencia, valor, situacao: "Ativo", ano: inicioVigencia.slice(-4), vigencia: "" });
const referencia = (codigo = "TETO_RGPS", vigencias = [periodo()], tipo = "Monetário") => ({ codigo, nome: codigo, tipo, vigencias });
const formulario = { valor: "9.000,00", inicioVigencia: "01/01/2027", observacoes: "Justificativa da atualização", baseLegal: ["lei-2027"] };

test("valida tipo, casas decimais, conteúdo e zero conforme o parâmetro", () => {
  for (const valor of ["abc", "-1", "1e3", "1,234", "1.23,45", "0"])
    assert.ok(validarValorReferencia("TETO_RGPS", "Monetário", valor), valor);
  assert.equal(validarValorReferencia("DEDUCAO_DEP_IRRF", "Monetário", "0"), undefined);
  assert.equal(validarValorReferencia("IRRF_COEFICIENTE_REDUCAO", "Numérico", "0,133145"), undefined);
  assert.ok(validarValorReferencia("IRRF_COEFICIENTE_REDUCAO", "Numérico", "0,1331451"));
  assert.ok(validarValorReferencia("IRRF_CONSTANTE_REDUCAO", "Numérico", "R$ 978,62"));
  assert.equal(formatarValorReferencia("IRRF_COEFICIENTE_REDUCAO", "Numérico", "0,133145"), "0,133145");
});

test("exige data real, base legal e observações dentro do limite", () => {
  assert.equal(dataReferencia("31/02/2026"), undefined);
  const dados = { ...formulario, codigo: "TETO_RGPS", tipo: "Monetário" };
  assert.equal(validarFormularioReferencia(dados), undefined);
  for (const alteracao of [{ valor: "" }, { inicioVigencia: "31/04/2026" }, { baseLegal: [] }, { observacoes: "a".repeat(501) }])
    assert.ok(validarFormularioReferencia({ ...dados, ...alteracao }));
});

test("migra fim inclusivo uma única vez preservando dias, base legal e observações", () => {
  const original = { ...periodo(), observacoes: "Histórico", baseLegal: ["lei-antiga"] };
  const migrada = normalizarPeriodoReferencia(original);
  assert.equal(migrada.fimVigencia, "01/01/2027");
  assert.deepEqual(normalizarPeriodoReferencia(migrada), migrada);
  assert.equal(original.fimVigencia, "31/12/2026");
  assert.equal(migrada.observacoes, "Histórico");
  assert.deepEqual(migrada.baseLegal, ["lei-antiga"]);
});

test("consulta usa início inclusivo e fim exclusivo sem selecionar uma vigência arbitrária", () => {
  const valores = [referencia("TETO_RGPS", [periodo(), { ...periodo(2, "01/01/2027", "", "R$ 9.000,00"), fimVigenciaExclusivo: true }])];
  assert.equal(consultarValorReferencia(valores, "TETO_RGPS", "31/12/2026").valor, "R$ 8.475,55");
  assert.equal(consultarValorReferencia(valores, "TETO_RGPS", "01/01/2027").valor, "R$ 9.000,00");
  assert.equal(consultarValorReferencia(valores, "TETO_RGPS", "31/12/2025").estado, "ausente");
  assert.equal(consultarValorReferencia([referencia("TETO_RGPS", [periodo(), periodo(2)])], "TETO_RGPS", "01/06/2026").estado, "conflito");
  assert.equal(consultarValorReferencia([referencia("TETO_RGPS", [{ ...periodo(), situacao: "Inativo" }])], "TETO_RGPS", "01/06/2026").estado, "ausente");
  assert.equal(consultarValorReferencia([referencia("TETO_RGPS", [periodo(1, "01/01/2026", "", "abc")])], "TETO_RGPS", "01/06/2026").estado, "invalido");
});

test("situação é calculada para a data e preserva inativação explícita", () => {
  const registro = normalizarPeriodoReferencia(periodo());
  assert.equal(situacaoValorReferencia(registro, new Date(2025, 11, 31)), "Agendado");
  assert.equal(situacaoValorReferencia(registro, new Date(2026, 11, 31)), "Ativo");
  assert.equal(situacaoValorReferencia(registro, new Date(2027, 0, 1)), "Encerrado");
  assert.equal(situacaoValorReferencia({ ...registro, situacao: "Inativo" }, new Date(2026, 5, 1)), "Inativo");
});

test("cadastra primeira vigência e persiste observações/base legal sem alterar outros parâmetros", () => {
  const outro = referencia("SALARIO_MINIMO");
  const valores = [referencia("TETO_RGPS", []), outro];
  const resultado = prepararGravacaoReferencia(valores, "TETO_RGPS", undefined, formulario, 99);
  assert.equal(resultado[0].vigencias[0].observacoes, formulario.observacoes);
  assert.deepEqual(resultado[0].vigencias[0].baseLegal, formulario.baseLegal);
  assert.equal(resultado[0].vigencias[0].id, 99);
  assert.equal(resultado[1], outro);
  assert.equal(valores[0].vigencias.length, 0);
});

test("sucessora encerra anterior e edição modifica somente a vigência identificada", () => {
  const valores = prepararGravacaoReferencia([referencia()], "TETO_RGPS", undefined, formulario, 2);
  assert.equal(valores[0].vigencias[0].fimVigencia, "01/01/2027");
  assert.equal(valores[0].vigencias[0].valor, "R$ 8.475,55");
  const editada = prepararGravacaoReferencia(valores, "TETO_RGPS", 2, { ...formulario, valor: "9.100,00" });
  assert.match(editada[0].vigencias[1].valor, /9\.100,00/);
  assert.equal(editada[0].vigencias.length, 2);
  assert.throws(() => prepararGravacaoReferencia(valores, "INEXISTENTE", undefined, formulario));
  assert.throws(() => prepararGravacaoReferencia(valores, "TETO_RGPS", 999, formulario));
  assert.throws(() => prepararGravacaoReferencia(valores, "TETO_RGPS", undefined, { ...formulario, inicioVigencia: "01/01/2026" }));
});

test("inserção histórica encadeia sucessora e conserva lacunas e encerramentos legados", () => {
  const antigas = [periodo(1, "01/01/2024", "31/12/2024"), periodo(3, "01/01/2027", "31/12/2027")];
  const novas = encadearReferencias(antigas, { ...periodo(2, "01/01/2026", ""), fimVigenciaExclusivo: true });
  assert.equal(novas[0].fimVigencia, "01/01/2025");
  assert.equal(novas[1].fimVigencia, "01/01/2027");
  assert.equal(novas[2].fimVigencia, "01/01/2028");
  const editada = prepararGravacaoReferencia([referencia()], "TETO_RGPS", 1, { ...formulario, inicioVigencia: "01/01/2026" });
  assert.equal(editada[0].vigencias[0].fimVigencia, "01/01/2027");
});

const fonte = readFileSync(new URL("./PrototiposPage.tsx", import.meta.url), "utf8");
const ast = ts.createSourceFile("pagina.tsx", fonte, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
function funcao(nome, contexto, arvore = ast) {
  let declaracao;
  const visitar = (no) => { if (ts.isVariableDeclaration(no) && ts.isIdentifier(no.name) && no.name.text === nome) declaracao = no; ts.forEachChild(no, visitar); };
  visitar(arvore);
  assert.ok(declaracao, nome);
  const js = ts.transpile(`const ${declaracao.getText(arvore)};`, { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None });
  return new Function(...Object.keys(contexto), `${js}; return ${nome};`)(...Object.values(contexto));
}

test("carregamento real distingue armazenamento vazio, ausente e corrompido sem sobrescrever", () => {
  let armazenado = null;
  const mock = [referencia()];
  const carregar = funcao("carregarFolhaValoresReferencia", { window: { localStorage: { getItem: () => armazenado } }, FOLHA_VALORES_REFERENCIA_STORAGE_KEY: "teste", folhaValoresReferenciaMock: mock, normalizarPeriodoReferencia });
  assert.equal(carregar().valores[0].vigencias[0].fimVigencia, "01/01/2027");
  armazenado = "[]";
  assert.deepEqual(carregar().valores, []);
  armazenado = "{invalido";
  assert.ok(carregar().erro);
  assert.equal(armazenado, "{invalido");
  armazenado = JSON.stringify(mock);
  assert.equal(carregar().valores[0].vigencias[0].fimVigencia, "01/01/2027");
});

test("handler real salva e navega somente após persistência; erros preservam o formulário", () => {
  const fonteFormulario = readFileSync(new URL("./ValoresReferenciaViews.tsx", import.meta.url), "utf8");
  const arvore = ts.createSourceFile("formulario.tsx", fonteFormulario, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const cenario of ["sucesso", "armazenamento", "leitura", "validacao"]) {
    let feedback = "", destino, persistido;
    const salvo = { current: false };
    const salvar = funcao("salvar", {
      erroRota: undefined, codigo: "TETO_RGPS", editando: false, vigenciaId: undefined,
      carregarValores: () => cenario === "leitura" ? { valores: [], erro: "Leitura indisponível" } : { valores: [referencia()] },
      prepararGravacaoReferencia, salvo, BASE: "/valores",
      setFeedback: (mensagem) => { feedback = mensagem; },
      salvarValores: (valores) => { if (cenario === "armazenamento") throw new Error("Quota"); persistido = valores; },
      navigate: (caminho) => { destino = caminho; },
    }, arvore);
    const dados = { ...formulario, ...(cenario === "validacao" ? { valor: "abc" } : {}) };
    salvar(dados);
    if (cenario === "sucesso") {
      assert.equal(destino, "/valores");
      assert.equal(salvo.current, true);
      assert.equal(persistido[0].vigencias[1].observacoes, formulario.observacoes);
    } else {
      assert.equal(destino, undefined);
      assert.equal(salvo.current, false);
      assert.ok(feedback);
      assert.equal(persistido, undefined);
    }
    assert.deepEqual(dados, { ...formulario, ...(cenario === "validacao" ? { valor: "abc" } : {}) });
  }
});

test("RGPS, IRRF e RPPS consultam o mesmo limite temporal sem valor fixo substituto", () => {
  const valores = [referencia("TETO_RGPS", [normalizarPeriodoReferencia(periodo()), { ...periodo(2, "01/01/2027", "", "R$ 9.000,00"), fimVigenciaExclusivo: true }])];
  assert.equal(consultarTetoRgps(valores[0].vigencias, "01/01/2027").valor, "R$ 9.000,00");
  const getNaData = funcao("getFolhaValorReferenciaNaData", { consultarValorReferencia, getFolhaValoresReferenciaPersistidos: () => valores });
  const faixas = funcao("getFaixasAutomaticasRppsPorRegra", { getFolhaValorReferenciaNaData: getNaData });
  assert.equal(faixas("ATE_TETO_RGPS", "15", "01/01/2027")[0].faixaFinal, "R$ 9.000,00");
  assert.deepEqual(faixas("ATE_TETO_RGPS", "15", "01/01/2025"), []);
  const coeficientes = [referencia("IRRF_COEFICIENTE_REDUCAO", [{ ...periodo(1, "01/01/2026", "", "0,133145"), fimVigenciaExclusivo: true }], "Numérico")];
  const consulta = consultarReferenciasIrrf(coeficientes, "01/06/2026");
  assert.ok(JSON.stringify(consulta).includes("0,133145"));
});
