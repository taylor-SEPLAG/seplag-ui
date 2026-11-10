// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DomHandler } from "primereact/utils";
import { PrototiposFolhaGrupoCalculoFormPage } from "../PrototiposPage";
import { lerAbrangenciaGrupo } from "./abrangenciaGrupoCalculo";

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(DomHandler, "absolutePosition").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
const montar = () =>
  render(
    <MemoryRouter>
      <PrototiposFolhaGrupoCalculoFormPage />
    </MemoryRouter>,
  );
const abrir = async (campo: string) => {
  fireEvent.click(document.getElementById(campo)!);
  return within(await screen.findByRole("listbox"));
};
const fechar = (campo: string) =>
  fireEvent.click(document.getElementById(campo)!);

it("exibe apenas os seis filtros na ordem solicitada e preserva as demais seções", () => {
  montar();
  const secao = screen.getByRole("region", { name: "Abrangência" });
  expect(
    Array.from(secao.querySelectorAll(".p-multiselect")).map((e) => e.id),
  ).toEqual([
    "abrangenciaRegimeJuridico",
    "abrangenciaTipoVinculo",
    "abrangenciaOrgao",
    "abrangenciaUnidades",
    "abrangenciaCarreiras",
    "abrangenciaCargos",
  ]);
  for (const label of [
    "Regime Jurídico",
    "Tipo de Vínculo",
    "Carreira",
    "Órgão/Entidade",
    "Unidade de Lotação",
    "Cargo",
  ])
    expect(within(secao).getByText(label)).toBeTruthy();
  for (const label of ["Instituição", "Categoria", "Subcategoria", "Setor"])
    expect(within(secao).queryByText(label)).toBeNull();
  expect(
    within(secao).getByText(
      "Defina os critérios de abrangência para identificar os vínculos funcionais que serão considerados neste Grupo de Cálculo.",
    ),
  ).toBeTruthy();
  expect(screen.getByText("Relacionar Rubricas")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Aprovar" }));
  expect(screen.getByRole("alert").textContent).toContain(
    "Ao menos um campo ativo de abrangência deve ser preenchido para aprovar.",
  );
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("filtra os tipos pelo regime, salva a abrangência e limpa somente os critérios", async () => {
  montar();
  let opcoes = await abrir("abrangenciaRegimeJuridico");
  fireEvent.click(opcoes.getByRole("option", { name: "REGIME ESPECIAL" }));
  fechar("abrangenciaRegimeJuridico");
  opcoes = await abrir("abrangenciaTipoVinculo");
  expect(opcoes.queryByRole("option", { name: "Nomeado Efetivo" })).toBeNull();
  expect(
    opcoes.getByRole("option", { name: "Contrato Temporário" }),
  ).toBeTruthy();
  fireEvent.click(opcoes.getByRole("option", { name: "Contrato Temporário" }));
  fechar("abrangenciaTipoVinculo");
  fireEvent.change(screen.getByPlaceholderText("Digite o nome do grupo"), { target: { value: "Grupo de teste" } });
  fireEvent.click(screen.getByRole("button", { name: "Salvar Rascunho" }));
  expect(lerAbrangenciaGrupo("2026-05:novo").regimes).toEqual(["REGIME ESPECIAL"]);
  expect(lerAbrangenciaGrupo("2026-05:novo").tipos).toEqual(["TV003"]);
  fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
  opcoes = await abrir("abrangenciaTipoVinculo");
  expect(opcoes.getByRole("option", { name: "Nomeado Efetivo" })).toBeTruthy();
});

it("atualiza unidades quando o órgão é alterado", async () => {
  montar();
  expect(
    document
      .getElementById("abrangenciaUnidades")
      ?.classList.contains("p-disabled"),
  ).toBe(true);
  let opcoes = await abrir("abrangenciaOrgao");
  fireEvent.click(opcoes.getByRole("option", { name: /^SEDUC —/ }));
  fechar("abrangenciaOrgao");
  expect(
    document
      .getElementById("abrangenciaUnidades")
      ?.classList.contains("p-disabled"),
  ).toBe(false);
  opcoes = await abrir("abrangenciaUnidades");
  expect(
    opcoes.getByRole("option", {
      name: "Gabinete do Secretário de Estado de Educação",
    }),
  ).toBeTruthy();
  expect(
    opcoes.queryByRole("option", {
      name: "Gabinete do Secretário de Estado de Planejamento e Gestão",
    }),
  ).toBeNull();
  fireEvent.click(
    opcoes.getByRole("option", {
      name: "Gabinete do Secretário de Estado de Educação",
    }),
  );
  fechar("abrangenciaUnidades");
  fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
  expect(
    document
      .getElementById("abrangenciaUnidades")
      ?.classList.contains("p-disabled"),
  ).toBe(true);
  expect(
    document.getElementById("abrangenciaUnidades")?.textContent,
  ).not.toContain("Gabinete do Secretário de Estado de Educação");
  opcoes = await abrir("abrangenciaOrgao");
  fireEvent.click(opcoes.getByRole("option", { name: /^SEPLAG —/ }));
  fechar("abrangenciaOrgao");
  opcoes = await abrir("abrangenciaUnidades");
  expect(
    opcoes.getByRole("option", {
      name: "Gabinete do Secretário de Estado de Planejamento e Gestão",
    }),
  ).toBeTruthy();
});
it("inicia na vigente e exige competencia para salvar e aprovar", () => {
  montar();
  const secao=screen.getByRole("region",{name:"Compet\u00eancia"});
  expect(secao.querySelector('.pi-calendar')).toBeTruthy();
  expect(secao.querySelector('.obrigatorio')?.textContent).toBe('*');
  expect(secao.querySelector('.p-dropdown-label')?.textContent).toBe('05/2026');
  fireEvent.pointerUp(secao.querySelector('.p-dropdown-clear-icon')!);
  fireEvent.click(screen.getByRole('button',{name:'Salvar Rascunho'}));
  expect(screen.getByRole('alert').textContent).toContain('Selecione a compet\u00eancia');
  fireEvent.click(screen.getByRole('button',{name:'Aprovar'}));
  expect(screen.queryByRole('dialog')).toBeNull();
  const banco=JSON.parse(localStorage.getItem('sigep:grupos-calculo:competencias:v1')!);
  expect(Object.keys(banco)).not.toContain('');
});
it("recebe o filtro da listagem e salva na competencia alterada sem afetar as demais", async () => {
  render(<MemoryRouter initialEntries={['/prototipos/folha/grupos-calculo/novo?competencia=2026-03']}><PrototiposFolhaGrupoCalculoFormPage /></MemoryRouter>);
  const secao=screen.getByRole('region',{name:'Compet\u00eancia'});
  expect(secao.querySelector('.p-dropdown-label')?.textContent).toBe('03/2026');
  const antes=JSON.parse(localStorage.getItem('sigep:grupos-calculo:competencias:v1')!);
  const opcoes=await abrir('competencia');
  fireEvent.click(opcoes.getByRole('option',{name:'04/2026'}));
  fireEvent.change(screen.getByPlaceholderText('Digite o nome do grupo'),{target:{value:'Novo grupo de abril'}});
  fireEvent.click(screen.getByRole('button',{name:'Salvar Rascunho'}));
  const depois=JSON.parse(localStorage.getItem('sigep:grupos-calculo:competencias:v1')!);
  expect(depois['2026-04'].grupos.find((g:{grupo:string})=>g.grupo==='Novo grupo de abril')).toMatchObject({competencia:'2026-04',versao:1});
  expect(depois['2026-03']).toEqual(antes['2026-03']);
  expect(depois['2026-05']).toEqual(antes['2026-05']);
});
