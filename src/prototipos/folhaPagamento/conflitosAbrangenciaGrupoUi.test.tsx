// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { DomHandler } from "primereact/utils";
import { PrototiposFolhaGrupoCalculoFormPage } from "../PrototiposPage";
import { abrangenciaVazia } from "./abrangenciaGrupoCalculo";

const chave = "sigep:grupos-calculo:competencias:v1";
const registro = (id: number, nome: string) => ({
  id,
  codigo: `G${id}`,
  grupo: nome,
  nivel: 1,
  herdaDe: "-",
  orgaoSetor: "SEDUC",
  tipoVinculo: "Todos",
  situacao: "ATIVO",
  inicioVigencia: "01/05/2026",
  fimVigencia: "-",
  rubricas: 0,
  pendencias: 0,
  competencia: "2026-05",
  versao: 1,
  abrangencia: {
    ...abrangenciaVazia(),
    regimes: ["REGIME ESPECIAL"],
    orgaos: ["seduc"],
  },
});
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("sigep:grupos-calculo:situacoes:v2", "1");
  vi.spyOn(DomHandler, "absolutePosition").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
function montar(versionar = false) {
  const grupos = versionar
    ? [registro(101, "Grupo em edição"), registro(102, "Efetivos SEDUC")]
    : [registro(102, "Efetivos SEDUC")];
  localStorage.setItem(
    chave,
    JSON.stringify({
      "2026-05": {
        grupos,
        versoes: Object.fromEntries(grupos.map((g) => [g.id, [g]])),
      },
    }),
  );
  render(
    <MemoryRouter
      initialEntries={[
        versionar
          ? "/grupo/101?competencia=2026-05&modo=nova-versao"
          : "/grupo?competencia=2026-05",
      ]}
    >
      <Routes>
        <Route
          path="/grupo/:id?"
          element={<PrototiposFolhaGrupoCalculoFormPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}
async function selecionar(campo: string, nome: string | RegExp) {
  fireEvent.click(document.getElementById(campo)!);
  fireEvent.click(
    within(await screen.findByRole("listbox")).getByRole("option", {
      name: nome,
    }),
  );
  fireEvent.click(document.getElementById(campo)!);
}
it("bloqueia a aprovação na própria tela, mostra os critérios e revalida ao corrigir", async () => {
  montar();
  fireEvent.change(screen.getByPlaceholderText("Digite o nome do grupo"), {
    target: { value: "Novo grupo" },
  });
  await selecionar("abrangenciaRegimeJuridico", "REGIME ESPECIAL");
  fireEvent.click(screen.getByRole("button", { name: "Aprovar" }));
  const alerta = screen.getByRole("alert", {
    name: "Conflito de abrangência identificado",
  });
  expect(within(alerta).getByText("Grupos conflitantes (1)")).toBeTruthy();
  expect(
    within(alerta).getByRole("cell", { name: "Efetivos SEDUC" }),
  ).toBeTruthy();
  expect(within(alerta).getByRole("cell", { name: "05/2026" })).toBeTruthy();
  expect(within(alerta).getByText("Órgão/Entidade:")).toBeTruthy();
  expect(
    document
      .querySelector(".prototype-grupo-calculo-form-fields")
      ?.firstElementChild?.contains(alerta),
  ).toBe(true);
  expect(within(alerta).queryByText("Como resolver?")).toBeNull();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(
    (screen.getByRole("button", { name: "Aprovar" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  expect(
    (
      screen.getByRole("button", {
        name: "Salvar Rascunho",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(false);
  await selecionar("abrangenciaOrgao", /^SEPLAG —/);
  expect(
    screen.queryByRole("alert", {
      name: "Conflito de abrangência identificado",
    }),
  ).toBeNull();
  expect(
    (screen.getByRole("button", { name: "Aprovar" }) as HTMLButtonElement)
      .disabled,
  ).toBe(false);
});
it("salva um grupo novo como rascunho apesar do conflito", async () => {
  montar();
  fireEvent.change(screen.getByPlaceholderText("Digite o nome do grupo"), {
    target: { value: "Rascunho conflitante" },
  });
  await selecionar("abrangenciaRegimeJuridico", "REGIME ESPECIAL");
  fireEvent.click(screen.getByRole("button", { name: "Aprovar" }));
  fireEvent.click(screen.getByRole("button", { name: "Salvar Rascunho" }));
  const grupos = JSON.parse(localStorage.getItem(chave)!)["2026-05"].grupos;
  expect(
    grupos.find((g: { grupo: string }) => g.grupo === "Rascunho conflitante")
      ?.situacao,
  ).toBe("RASCUNHO");
});
it("mantém o rascunho disponível no versionamento e preserva a versão anterior", () => {
  montar(true);
  fireEvent.click(screen.getByRole("button", { name: "Aprovar V2" }));
  expect(
    screen.getByRole("alert", { name: "Conflito de abrangência identificado" }),
  ).toBeTruthy();
  expect(screen.queryByRole("dialog")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Salvar Rascunho" }));
  const versoes = JSON.parse(localStorage.getItem(chave)!)["2026-05"]
    .versoes[101];
  expect(versoes[0].situacao).toBe("RASCUNHO");
  expect(versoes[1].situacao).toBe("ATIVO");
});

it("abre a revisão de impactos ao versionar Efetivos com os dados padrão sem conflito de abrangência", async () => {
  render(
    <MemoryRouter
      initialEntries={["/grupo/2?competencia=2026-05&modo=nova-versao"]}
    >
      <Routes>
        <Route
          path="/grupo/:id"
          element={<PrototiposFolhaGrupoCalculoFormPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
  expect(
    document.getElementById("abrangenciaTipoVinculo")?.textContent,
  ).toContain("Nomeado Efetivo");
  await selecionar("abrangenciaRegimeJuridico", "ESTATUTÁRIO CIVIL");
  fireEvent.click(screen.getByRole("button", { name: /^Aprovar V\d+/ }));
  expect(
    screen.queryByRole("alert", {
      name: "Conflito de abrangência identificado",
    }),
  ).toBeNull();
  const publicacao = within(
    await screen.findByRole("dialog", { name: /Aprovar Versão/ }),
  );
  fireEvent.change(publicacao.getByLabelText("Usuário"), {
    target: { value: "teste" },
  });
  fireEvent.change(publicacao.getByLabelText("Senha"), {
    target: { value: "teste" },
  });
  fireEvent.click(publicacao.getByRole("button", { name: "Aprovar" }));
  const revisao = await screen.findByRole("dialog", {
    name: /Revisão de Registros Impactados/,
  });
  const lateral = within(revisao).getByRole("complementary", {
    name: "Grupos impactados",
  });
  expect(within(lateral).getAllByRole("button")).toHaveLength(7);
  expect(within(lateral).getByText(/^Nível 6 ·/)).toBeTruthy();
});
