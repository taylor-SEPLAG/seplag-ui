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
afterEach(() => {
  cleanup();
  localStorage.clear();
});
const catalogo: CatalogoAbrangencia = {
  regimes: [],
  tipos: [],
  carreiras: [],
  orgaos: [
    { value: "seduc", label: "SEDUC" },
    { value: "seplag", label: "SEPLAG" },
  ],
  unidades: [],
  cargos: [],
};
const rubrica = { codigo: "1001", nomeRubrica: "Vencimento" };
const filho = {
  id: 2,
  grupo: "Filho",
  herdaDe: "Efetivos",
  nivel: 3,
  orgaoSetor: "SEDUC",
  versao: 2,
};
function montar({
  restrito = true,
  decisao = true,
  cadeia = false,
  irmao = false,
  parentOrgaos = [] as string[],
  filhoOrgao = "SEDUC",
  niveis = 2,
} = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const criteriosPai = {
    ...abrangenciaVazia(),
    orgaos: cadeia ? ["seduc", "seplag"] : parentOrgaos,
  };
  const grupos = [{ ...filho, orgaoSetor: restrito ? filhoOrgao : "Todos" }];
  if (cadeia)
    grupos.push({ ...filho, id: 3, grupo: "Neto", herdaDe: "Filho", nivel: 4 });
  if (cadeia)
    for (let nivel = 3; nivel <= niveis; nivel++)
      grupos.push({
        ...filho,
        id: nivel + 10,
        grupo: `Descendente nível ${nivel}`,
        herdaDe: grupos[grupos.length - 1].grupo,
        nivel: nivel + 2,
      });
  if (irmao) grupos.push({ ...filho, id: 4, grupo: "Irmão" });
  render(
    <PrimeReactProvider value={{ cssTransition: false }}>
      <RevisaoImpactados
        pai={{
          id: 1,
          grupo: "Efetivos",
          herdaDe: "Geral",
          nivel: 2,
          orgaoSetor: "Todos",
        }}
        grupos={grupos}
        criteriosPai={criteriosPai}
        catalogo={catalogo}
        atuais={[rubrica]}
        novas={decisao ? [] : [rubrica]}
        versaoPai={3}
        inicio="04/11/2026"
        usuario="revisor"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </PrimeReactProvider>,
  );
  return { onConfirm, onCancel, criteriosPai };
}
const concluir = () =>
  screen.getByRole("button", { name: "Concluir revisão" }) as HTMLButtonElement;
const principal = () =>
  within(
    screen.getByRole("dialog", { name: /Revisão de Registros Impactados/ }),
  );
function adicionarOrgao(nome = "Filho", valor = "seduc") {
  const modal = within(
    screen.getByRole("dialog", { name: `Editar ${nome} – Abrangência` }),
  );
  fireEvent.click(modal.getByRole("button", { name: "Adicionar critério" }));
  fireEvent.change(modal.getByRole("combobox", { name: "Valor" }), {
    target: { value: valor },
  });
  fireEvent.click(modal.getByRole("button", { name: "Adicionar" }));
  return modal;
}
it("resolve a decisão automaticamente e exige confirmação antes de aprovar", () => {
  const { onConfirm } = montar();
  expect(concluir().disabled).toBe(true);
  fireEvent.click(screen.getByRole("radio", { name: /Manter rubrica/ }));
  expect(concluir().disabled).toBe(false);
  expect(screen.queryByRole("tab")).toBeNull();
  expect(screen.queryByText("Configuração atual")).toBeNull();
  fireEvent.click(concluir());
  expect(onConfirm).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Confirmar e aprovar" }));
  expect(onConfirm).toHaveBeenCalledWith(
    expect.objectContaining({
      decisoes: { "2:1001": "manter" },
      fimAnterior: "03/11/2026",
      grupos: [
        expect.objectContaining({
          id: 2,
          rubricas: [rubrica],
          rubricasProprias: ["1001"],
          versao: 3,
          versaoOrigem: 3,
        }),
      ],
    }),
  );
});
it("considera grupos regulares revisados sem ação adicional", () => {
  montar({ decisao: false });
  expect(
    screen.getByText(
      "As alterações herdadas não geraram conflitos para este grupo.",
    ),
  ).toBeTruthy();
  expect(concluir().disabled).toBe(false);
});
it("mostra os critérios iguais e permite corrigir o grupo atual sem aplicar a aprovação", () => {
  const { onConfirm } = montar({ restrito: false, decisao: false });
  const card = within(
    screen.getByRole("region", { name: "Conflito com Efetivos" }),
  );
  expect(card.getByText("Nível 0")).toBeTruthy();
  expect(card.getByText("V3 – nova versão")).toBeTruthy();
  expect(card.queryByRole("table")).toBeNull();
  expect(
    card.getByText("Demais critérios: sem restrição em ambos os grupos."),
  ).toBeTruthy();
  expect(card.queryByText("Igual")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Editar grupo atual" }));
  const modal = adicionarOrgao();
  expect(concluir().disabled).toBe(true);
  fireEvent.click(modal.getByRole("button", { name: "Salvar alterações" }));
  expect(concluir().disabled).toBe(false);
  expect(screen.getByText("Conflito resolvido com sucesso.")).toBeTruthy();
  expect(onConfirm).not.toHaveBeenCalled();
});
it("mantém o status de conflito após salvar um ajuste que não o resolve", () => {
  montar({ restrito: false, decisao: false });
  fireEvent.click(screen.getByRole("button", { name: "Editar grupo atual" }));
  fireEvent.click(
    within(
      screen.getByRole("dialog", { name: "Editar Filho – Abrangência" }),
    ).getByRole("button", { name: "Salvar alterações" }),
  );
  expect(screen.getAllByRole("alert")).toHaveLength(1);
  expect(screen.getByRole("alert").textContent).toContain(
    "Conflito de abrangência",
  );
  expect(concluir().disabled).toBe(true);
});
it("descarta o rascunho da edição e confirma o cancelamento após decisões", () => {
  const { onCancel, onConfirm } = montar({ restrito: false });
  fireEvent.click(screen.getByRole("button", { name: "Editar grupo atual" }));
  fireEvent.click(adicionarOrgao().getByRole("button", { name: "Cancelar" }));
  expect(concluir().disabled).toBe(true);
  fireEvent.click(screen.getByRole("radio", { name: /Remover rubrica/ }));
  fireEvent.click(principal().getByRole("button", { name: "Cancelar" }));
  expect(onCancel).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: "Descartar e voltar à edição" }),
  );
  expect(onCancel).toHaveBeenCalledOnce();
  expect(onConfirm).not.toHaveBeenCalled();
  expect(localStorage.length).toBe(0);
});
it("recalcula toda a cadeia e mostra conflito entre filho e neto", () => {
  montar({ restrito: false, decisao: false, cadeia: true });
  fireEvent.click(screen.getByRole("button", { name: "Editar grupo atual" }));
  fireEvent.click(
    adicionarOrgao().getByRole("button", { name: "Salvar alterações" }),
  );
  const lateral = within(
    screen.getByRole("complementary", { name: "Grupos impactados" }),
  );
  expect(lateral.getByRole("button", { name: /Filho/ }).textContent).toContain(
    "Conflito",
  );
  fireEvent.click(lateral.getByRole("button", { name: /Neto/ }));
  const card = within(
    screen.getByRole("region", { name: "Conflito com Filho" }),
  );
  expect(
    card.getByRole("row", { name: /Órgão\/Entidade/ }).textContent,
  ).toContain("SEDUCSEDUC");
  expect(concluir().disabled).toBe(true);
});
it("edita o irmão conflitante mantendo o grupo atual selecionado", () => {
  const { onConfirm } = montar({ decisao: false, irmao: true });
  fireEvent.click(
    within(
      screen.getByRole("region", { name: "Conflito com Irmão" }),
    ).getByRole("button", { name: "Editar este grupo" }),
  );
  const modal = within(
    screen.getByRole("dialog", { name: "Editar Irmão – Abrangência" }),
  );
  fireEvent.click(
    modal.getByRole("button", { name: "Remover Órgão/Entidade: SEDUC" }),
  );
  fireEvent.click(
    adicionarOrgao("Irmão", "seplag").getByRole("button", {
      name: "Salvar alterações",
    }),
  );
  expect(
    principal().getByRole("heading", { name: /Filho Nível 1/ }),
  ).toBeTruthy();
  expect(concluir().disabled).toBe(false);
  expect(onConfirm).not.toHaveBeenCalled();
});
it("edita o pai dentro da revisão, resolve a incompatibilidade e envia os novos critérios só na confirmação", () => {
  const { onConfirm, criteriosPai } = montar({
    decisao: false,
    parentOrgaos: ["seduc"],
    filhoOrgao: "SEPLAG",
  });
  const card = within(
    screen.getByRole("region", { name: "Conflito com Efetivos" }),
  );
  const linha = card.getByRole("row", { name: /Órgão\/Entidade/ });
  expect(linha.textContent).toContain("SEPLAGSEDUC");
  fireEvent.click(
    screen.getByRole("button", { name: "Editar grupo conflitante" }),
  );
  fireEvent.click(
    adicionarOrgao("Efetivos", "seplag").getByRole("button", {
      name: "Salvar alterações",
    }),
  );
  expect(concluir().disabled).toBe(false);
  expect(criteriosPai.orgaos).toEqual(["seduc"]);
  expect(onConfirm).not.toHaveBeenCalled();
  expect(localStorage.length).toBe(0);
  fireEvent.click(concluir());
  fireEvent.click(screen.getByRole("button", { name: "Confirmar e aprovar" }));
  expect(onConfirm).toHaveBeenCalledWith(
    expect.objectContaining({
      criteriosPai: expect.objectContaining({ orgaos: ["seduc", "seplag"] }),
      criteriosPaiAntes: expect.objectContaining({ orgaos: ["seduc"] }),
    }),
  );
});
it("lista cada conflito com três colunas e edição direta sem dropdown", () => {
  montar({ decisao: false, irmao: true, parentOrgaos: ["seduc"] });
  expect(
    screen.getByRole("region", { name: "Conflito com Efetivos" }),
  ).toBeTruthy();
  expect(
    screen.getByRole("region", { name: "Conflito com Irmão" }),
  ).toBeTruthy();
  expect(screen.queryByRole("combobox")).toBeNull();
  expect(screen.getAllByRole("alert")).toHaveLength(1);
  const card = within(
    screen.getByRole("region", { name: "Conflito com Irmão" }),
  );
  expect(card.getAllByRole("columnheader")).toHaveLength(3);
  expect(card.getAllByRole("row")).toHaveLength(2);
  expect(card.queryByText("Situação")).toBeNull();
  expect(card.queryByText("Igual")).toBeNull();
  expect(card.queryByText("Critérios incompatíveis")).toBeNull();
  expect(
    card.getByText("Demais critérios: sem restrição em ambos os grupos."),
  ).toBeTruthy();
  fireEvent.click(
    card.getByRole("button", { name: "Editar grupo conflitante" }),
  );
  expect(
    screen.getByRole("dialog", { name: "Editar Irmão – Abrangência" }),
  ).toBeTruthy();
});

it("permite revisar individualmente seis níveis de descendência com uma ramificação independente", () => {
  montar({ cadeia: true, niveis: 6, irmao: true, decisao: false });
  const lateral = within(
    screen.getByRole("complementary", { name: "Grupos impactados" }),
  );
  const itens = lateral.getAllByRole("button");
  expect(itens).toHaveLength(7);
  for (let nivel = 1; nivel <= 6; nivel++)
    expect(lateral.getAllByText(`Nível ${nivel}`).length).toBeGreaterThan(0);
  fireEvent.click(lateral.getByRole("button", { name: /Descendente nível 6/ }));
  expect(
    principal().getByRole("heading", { name: /Descendente nível 6 Nível 6/ }),
  ).toBeTruthy();
  const conflito = within(
    screen.getByRole("region", { name: "Conflito com Descendente nível 5" }),
  );
  fireEvent.click(conflito.getByRole("button", { name: "Editar grupo atual" }));
  expect(
    screen.getByRole("dialog", {
      name: "Editar Descendente nível 6 – Abrangência",
    }),
  ).toBeTruthy();
  expect(concluir().disabled).toBe(true);
});
