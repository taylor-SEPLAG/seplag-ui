// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { PrimeReactProvider } from "primereact/api";
import { RevisaoImpactados } from "./RevisaoImpactados";
import {
  abrangenciaVazia,
  type CatalogoAbrangencia,
} from "./abrangenciaGrupoCalculo";
import type { GrupoImpacto, RubricaImpacto } from "./revisaoImpactosModelo";
import {
  criarContextoImpactos,
  calcularRevisaoImpactos,
} from "./revisaoImpactosModelo";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

it("preserva exclusões anteriores do filho quando a rubrica não é uma nova inclusão do pai", () => {
  const contexto = criarContextoImpactos(
    pai,
    [{ ...filho, composicaoRubricas: [r1, r9] }],
    criteriosPai,
    [r1, r2],
    [r1, r2, nova],
    catalogo,
  );
  const revisao = calcularRevisaoImpactos(contexto, {})[filho.id];
  expect(revisao.rubricas.map((r) => r.codigo)).toEqual([
    "1001",
    "8050",
    "9001",
  ]);
  expect(revisao.rubricas.find((r) => r.codigo === "8050")?.impacto).toBe(
    "nova",
  );
});
const catalogo: CatalogoAbrangencia = {
  regimes: [{ value: "R", label: "Estatutário" }],
  tipos: [
    { value: "T", label: "Efetivo", regimes: ["R"], possuiCarreira: true },
  ],
  orgaos: [
    { value: "seduc", label: "SEDUC" },
    { value: "pge", label: "PGE" },
  ],
  carreiras: [{ value: "CR", label: "Magistério", orgaos: ["seduc", "pge"] }],
  unidades: [{ value: "U1", label: "Escola A", orgao: "seduc" }],
  cargos: ["CG1", "CG2"].map((value) => ({
    value,
    label: value,
    tipos: ["T"],
    carreirasPorTipo: { T: "CR" },
  })),
};
const r1 = {
  codigo: "1001",
  nomeRubrica: "Vencimento",
  naturezaVerba: "Provento",
};
const r2 = {
  codigo: "1002",
  nomeRubrica: "Desconto",
  naturezaVerba: "Desconto",
};
const r9 = {
  codigo: "9001",
  nomeRubrica: "Rubrica própria",
  naturezaVerba: "Provento",
};
const nova = {
  codigo: "8050",
  nomeRubrica: "Qualificação",
  naturezaVerba: "Provento",
};
const criteriosPai = {
  ...abrangenciaVazia(),
  regimes: ["R"],
  tipos: ["T"],
  orgaos: ["seduc", "pge"],
  cargos: ["CG1"],
};
const pai: GrupoImpacto = {
  id: 1,
  grupo: "Efetivos",
  herdaDe: "-",
  nivel: 2,
  orgaoSetor: "Todos",
  abrangencia: criteriosPai,
  versao: 2,
};
const filho: GrupoImpacto = {
  id: 2,
  grupo: "Filho",
  herdaDe: "Efetivos",
  nivel: 3,
  orgaoSetor: "SEDUC",
  abrangencia: { ...abrangenciaVazia(), orgaos: ["seduc"] },
  composicaoRubricas: [r1, r2, r9],
  rubricasProprias: ["9001"],
  versao: 2,
};
function montar({
  novas = [r1, r2] as RubricaImpacto[],
  abrangencia = false,
  dois = false,
  niveis = 1,
} = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const grupos = [filho];
  for (let nivel = 2; nivel <= niveis; nivel++)
    grupos.push({
      ...filho,
      id: 10 + nivel,
      grupo: `Nível ${nivel}`,
      nivel: pai.nivel + nivel,
      herdaDe: grupos[grupos.length - 1].grupo,
    });
  if (dois)
    grupos.push({
      ...filho,
      id: 3,
      grupo: "Filho PGE",
      orgaoSetor: "PGE",
      abrangencia: { ...abrangenciaVazia(), orgaos: ["pge"] },
    });
  render(
    <PrimeReactProvider value={{ cssTransition: false }}>
      <RevisaoImpactados
        pai={pai}
        grupos={grupos}
        criteriosPai={
          abrangencia
            ? { ...criteriosPai, cargos: ["CG1", "CG2"] }
            : criteriosPai
        }
        catalogo={catalogo}
        atuais={[r1, r2]}
        novas={novas}
        versaoPai={3}
        inicio="04/11/2026"
        usuario="revisor"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </PrimeReactProvider>,
  );
  return { onConfirm, onCancel };
}
const concluir = () =>
  screen.getByRole("button", { name: "Concluir revisão" }) as HTMLButtonElement;
const lateral = () =>
  within(screen.getByRole("complementary", { name: "Grupos impactados" }));
const rubricas = () =>
  fireEvent.click(screen.getByRole("tab", { name: /Rubricas/ }));
const revisar = () =>
  fireEvent.click(
    screen.getByRole("button", { name: "Confirmar revisão do grupo" }),
  );
const aprovar = () => {
  fireEvent.click(concluir());
  fireEvent.click(screen.getByRole("button", { name: "Confirmar e aprovar" }));
};

it("mantém a estrutura e apresenta duas abas de impactos, sem painéis de conflito", () => {
  montar();
  expect(screen.getByRole("tab", { name: "Abrangência (0)" })).toBeTruthy();
  expect(screen.getByRole("tab", { name: "Rubricas (0)" })).toBeTruthy();
  expect(
    screen.getByText(
      "Não existem impactos de abrangência a revisar para este grupo.",
    ),
  ).toBeTruthy();
  expect(screen.queryByText("Grupos conflitantes")).toBeNull();
  expect(screen.queryByText("Conflito")).toBeNull();
  expect(
    lateral().getByRole("button", { name: /Filho/ }).textContent,
  ).toContain("Revisado");
  expect(concluir().disabled).toBe(false);
});
it("exige decisões independentes de abrangência e revisão de cada filho", () => {
  const { onConfirm } = montar({ abrangencia: true, dois: true });
  fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));
  expect(concluir().disabled).toBe(true);
  revisar();
  expect(
    lateral().getByRole("button", { name: /Filho\s*Nível/ }).textContent,
  ).toContain("Revisado");
  expect(
    lateral().getByRole("button", { name: /Filho PGE/ }).getAttribute("aria-pressed"),
  ).toBe("true");
  expect(
    screen
      .getByRole("button", { name: "Manter atual" })
      .getAttribute("aria-pressed"),
  ).toBe("false");
  fireEvent.click(screen.getByRole("button", { name: "Manter atual" }));
  revisar();
  expect(concluir().disabled).toBe(false);
  aprovar();
  const resultado = onConfirm.mock.calls[0][0];
  expect(
    resultado.grupos.find((g: { id: number }) => g.id === 2).criterios.cargos,
  ).toEqual(["CG1", "CG2"]);
  expect(
    resultado.grupos.find((g: { id: number }) => g.id === 3).criterios.cargos,
  ).toEqual(["CG1"]);
});
it("exibe a composição completa e inclui nova rubrica herdada somente após decidir", () => {
  const { onConfirm } = montar({ novas: [r1, r2, nova] });
  rubricas();
  const tabela = within(
    screen.getByRole("table", { name: "Rubricas de Filho" }),
  );
  expect(tabela.getAllByRole("row")).toHaveLength(5);
  expect(tabela.getByText("Rubrica própria")).toBeTruthy();
  expect(tabela.getByText("Nova herdada")).toBeTruthy();
  expect(tabela.queryByText("Nova do pai")).toBeNull();
  expect(
    within(tabela.getByRole("row", { name: /1001/ })).getByText("Herdada"),
  ).toBeTruthy();
  expect(
    within(tabela.getByRole("row", { name: /9001/ })).getByText("Própria"),
  ).toBeTruthy();
  expect(
    (
      screen.getByRole("button", {
        name: "Confirmar revisão do grupo",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  fireEvent.click(tabela.getByRole("button", { name: "Manter" }));
  expect(tabela.getByText("Nova do pai")).toBeTruthy();
  revisar();
  expect(onConfirm).not.toHaveBeenCalled();
  aprovar();
  expect(
    onConfirm.mock.calls[0][0].grupos[0].rubricas.map(
      (r: RubricaImpacto) => r.codigo,
    ),
  ).toEqual(["1001", "1002", "8050", "9001"]);
  expect(onConfirm.mock.calls[0][0].grupos[0].rubricasProprias).toEqual([
    "9001",
  ]);
});
it("preserva rubrica removida como própria e mantém as demais rubricas", () => {
  const { onConfirm } = montar({ novas: [r1] });
  rubricas();
  expect(screen.getByText("Removida do pai")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Manter como própria" }));
  revisar();
  aprovar();
  expect(onConfirm.mock.calls[0][0].grupos[0].rubricasProprias).toEqual([
    "1002",
    "9001",
  ]);
});
it("permite excluir uma proposta nova e reordena e renumera a lista completa", () => {
  const { onConfirm } = montar({ novas: [r2, r1, nova] });
  rubricas();
  const tabela = within(
    screen.getByRole("table", { name: "Rubricas de Filho" }),
  );
  expect(tabela.getAllByText("Ordem alterada").length).toBeGreaterThan(0);
  fireEvent.click(tabela.getByRole("button", { name: "Excluir" }));
  expect(tabela.getByText("Excluída")).toBeTruthy();
  const origem = tabela.getByRole("row", { name: /9001/ });
  fireEvent.dragStart(origem);
  fireEvent.drop(tabela.getByRole("row", { name: /1001/ }));
  const linhas = tabela.getAllByRole("row").slice(1);
  const incluidas = linhas.filter((l) => !l.classList.contains("is-excluded"));
  expect(
    incluidas.map((l) => within(l).getAllByRole("cell")[1].textContent),
  ).toEqual(["1", "2", "3"]);
  revisar();
  aprovar();
  expect(
    onConfirm.mock.calls[0][0].grupos[0].rubricas.map(
      (r: RubricaImpacto) => r.codigo,
    ),
  ).toEqual(["1002", "9001", "1001"]);
});
it("confirma o descarte sem publicar as decisões ou gerar versões", () => {
  const { onCancel, onConfirm } = montar({ novas: [r1] });
  rubricas();
  fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
  fireEvent.click(screen.getByRole("button", { name: "Voltar à edição do Grupo Pai" }));
  expect(onCancel).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: "Descartar e voltar à edição" }),
  );
  expect(onCancel).toHaveBeenCalledOnce();
  expect(onConfirm).not.toHaveBeenCalled();
  expect(localStorage.length).toBe(0);
});
it("bloqueia uma escolha que elimina a especificidade e permite manter a configuração atual", () => {
  const original = { ...criteriosPai, cargos: ["CG1", "CG2"] };
  const grupo = {
    ...filho,
    abrangencia: { ...abrangenciaVazia(), cargos: ["CG1"] },
    orgaoSetor: "Todos",
  };
  render(
    <PrimeReactProvider value={{ cssTransition: false }}>
      <RevisaoImpactados
        pai={{ ...pai, abrangencia: original }}
        grupos={[grupo]}
        criteriosPai={{ ...original, cargos: [] }}
        catalogo={catalogo}
        atuais={[r1, r2]}
        novas={[r1, r2]}
        versaoPai={3}
        inicio="04/11/2026"
        usuario="teste"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    </PrimeReactProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));
  expect(screen.getByRole("alert").textContent).toContain("especificidade");
  expect(concluir().disabled).toBe(true);
  expect(
    screen
      .getByRole("button", { name: "Aplicar" })
      .getAttribute("aria-pressed"),
  ).toBe("false");
  fireEvent.click(screen.getByRole("button", { name: "Manter atual" }));
  revisar();
  expect(concluir().disabled).toBe(false);
});
it("preserva a navegação individual nos seis níveis da árvore", () => {
  montar({ niveis: 6 });
  expect(lateral().getAllByRole("button")).toHaveLength(6);
  fireEvent.click(lateral().getByRole("button", { name: /Nível 6\s*Nível 6/ }));
  expect(
    screen.getByRole("heading", { name: /Nível 6\s*Nível 6/ }),
  ).toBeTruthy();
  expect(screen.getByText("6 de 6")).toBeTruthy();
});

it("recalcula os descendentes e invalida sua revisão quando a herança anterior muda", () => {
  montar({ novas: [r1, r2, nova], niveis: 2 });
  fireEvent.click(lateral().getByRole("button", { name: /^Nível 2/ }));
  rubricas();
  fireEvent.click(screen.getByRole("button", { name: "Manter" }));
  revisar();
  expect(
    lateral().getByRole("button", { name: /^Nível 2/ }).textContent,
  ).toContain("Revisado");
  fireEvent.click(lateral().getByRole("button", { name: /^Filho/ }));
  fireEvent.click(screen.getByRole("button", { name: "Manter" }));
  revisar();
  expect(concluir().disabled).toBe(false);
  const propria = screen.getByRole("row", { name: /9001/ });
  fireEvent.dragStart(propria);
  fireEvent.drop(screen.getByRole("row", { name: /8050/ }));
  expect(
    lateral().getByRole("button", { name: /^Nível 2/ }).textContent,
  ).toContain("Pendente");
  expect(concluir().disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
  fireEvent.click(lateral().getByRole("button", { name: /^Nível 2/ }));
  expect(screen.queryByText("Qualificação")).toBeNull();
});
