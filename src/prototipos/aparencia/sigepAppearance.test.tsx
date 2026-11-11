// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SigepAppearanceMenu, SigepAppearanceScope } from "./SigepAppearanceControls";
import { APPEARANCE_KEY, setSigepAppearance } from "./appearanceStore";
import { MemoryRouter } from "react-router-dom";
import { PaginaInicialContent } from "../paginaInicial/PaginaInicialContent";
import { AppTopbarSeplag } from "../../componentes/layout/AppTopbar";

beforeEach(() => { localStorage.clear(); setSigepAppearance("padrao"); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); setSigepAppearance("padrao"); localStorage.clear(); });
const mount = (enabled = true) => render(
  <SigepAppearanceScope enabled={enabled}>
    <SigepAppearanceMenu />
    <input aria-label="Filtro existente" defaultValue="" />
    <button type="button">Controle externo</button>
  </SigepAppearanceScope>,
);
const open = () => fireEvent.click(screen.getByRole("button", { name: "Apar\u00eancia do sistema" }));
const scope = () => document.querySelector(".prototype-shell")!;

it("mantem o padrao inicial e alterna os temas sem perder dados ou recriar o formulario", () => {
  mount();
  expect(scope().getAttribute("data-sigep-appearance")).toBe("padrao");
  const input = screen.getByRole("textbox", { name: "Filtro existente" });
  fireEvent.change(input, { target: { value: "Consulta em andamento" } });
  open();
  expect(screen.getByRole("menu", { name: "Apar\u00eancia do sistema" })).toBeTruthy();
  expect(screen.getByRole("menuitemradio", { name: /Padr\u00e3o/ }).getAttribute("aria-checked")).toBe("true");
  fireEvent.click(screen.getByRole("menuitemradio", { name: /Modo Natalino/ }));
  expect(scope().getAttribute("data-sigep-appearance")).toBe("natal");
  expect(localStorage.getItem(APPEARANCE_KEY)).toBe("natal");
  expect(screen.getByRole("textbox", { name: "Filtro existente" })).toBe(input);
  expect((input as HTMLInputElement).value).toBe("Consulta em andamento");
  open();
  expect(screen.getAllByRole("menuitemradio").filter(element => element.getAttribute("aria-checked") === "true")).toHaveLength(1);
  fireEvent.click(screen.getByRole("menuitemradio", { name: /Padr\u00e3o/ }));
  expect(scope().getAttribute("data-sigep-appearance")).toBe("padrao");
  expect((input as HTMLInputElement).value).toBe("Consulta em andamento");
});

it("restaura a preferencia salva em uma nova montagem e ignora valores desconhecidos", () => {
  localStorage.setItem(APPEARANCE_KEY, "natal");
  const view = mount();
  expect(scope().getAttribute("data-sigep-appearance")).toBe("natal");
  view.unmount();
  localStorage.setItem(APPEARANCE_KEY, "desconhecido");
  mount();
  expect(scope().getAttribute("data-sigep-appearance")).toBe("padrao");
});

it("oferece foco e navegacao por teclado e fecha com Escape ou clique fora", () => {
  mount();
  const trigger = screen.getByRole("button", { name: "Apar\u00eancia do sistema" });
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  const standard = screen.getByRole("menuitemradio", { name: /Padr\u00e3o/ });
  const christmas = screen.getByRole("menuitemradio", { name: /Modo Natalino/ });
  expect(document.activeElement).toBe(standard);
  fireEvent.keyDown(standard, { key: "ArrowDown" });
  expect(document.activeElement).toBe(christmas);
  fireEvent.keyDown(christmas, { key: "Home" });
  expect(document.activeElement).toBe(standard);
  fireEvent.keyDown(standard, { key: "Escape" });
  expect(screen.queryByRole("menu")).toBeNull();
  expect(document.activeElement).toBe(trigger);
  open();
  fireEvent.pointerDown(screen.getByRole("button", { name: "Controle externo" }));
  expect(screen.queryByRole("menu")).toBeNull();
  expect(scope().getAttribute("data-sigep-appearance")).toBe("padrao");
});

it("atualiza a aparencia quando a preferencia muda em outra aba", () => {
  mount();
  act(() => {
    localStorage.setItem(APPEARANCE_KEY, "natal");
    window.dispatchEvent(new StorageEvent("storage", { key: APPEARANCE_KEY, newValue: "natal" }));
  });
  expect(scope().getAttribute("data-sigep-appearance")).toBe("natal");
});

it("mantem a alternancia na sessao quando o armazenamento esta indisponivel", () => {
  mount();
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage indisponivel"); });
  open();
  fireEvent.click(screen.getByRole("menuitemradio", { name: /Modo Natalino/ }));
  expect(scope().getAttribute("data-sigep-appearance")).toBe("natal");
});

it("nao aplica o tema aos sistemas fora do escopo SIGEP", () => {
  localStorage.setItem(APPEARANCE_KEY, "natal");
  mount(false);
  expect(scope().hasAttribute("data-sigep-appearance")).toBe(false);
});

it("posiciona a personalizacao imediatamente antes do seletor de aplicacoes", () => {
  render(<AppTopbarSeplag isSidebarVisible onToggleMenu={() => {}} nomeSistema="SIGEP" ambienteSistema="Teste" systemas={[]} appearanceControl={<SigepAppearanceMenu />} />);
  const appearance = document.querySelector(".sigep-appearance-control")!;
  expect(appearance.nextElementSibling?.querySelector("button")).toBeTruthy();
  expect(appearance.parentElement?.lastElementChild).toBe(appearance.nextElementSibling);
});

it("preserva favoritos, links e a data da pagina inicial ao alternar a aparencia", () => {
  render(<MemoryRouter><SigepAppearanceScope enabled><SigepAppearanceMenu /><PaginaInicialContent
    menu={[{label:"Pessoas",icon:"pi pi-users",to:"/pessoas"}]} nomeUsuario="Servidor" avisos={0} cronogramas={0}
    modulos={[{nome:"Pessoas",descricao:"Consultar pessoas",icone:"pi pi-users"}]}
  /></SigepAppearanceScope></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", {name:"Adicionar aos favoritos: Pessoas"}));
  const favorite=screen.getByRole("button", {name:"Remover dos favoritos: Pessoas"});
  const date=document.querySelector("time")!.getAttribute("datetime");
  const link=screen.getByRole("link", {name:"Acessar Pessoas"});
  open();fireEvent.click(screen.getByRole("menuitemradio", {name:/Modo Natalino/}));
  expect(screen.getByRole("button", {name:"Remover dos favoritos: Pessoas"})).toBe(favorite);
  expect(favorite.getAttribute("aria-pressed")).toBe("true");
  expect(document.querySelector("time")!.getAttribute("datetime")).toBe(date);
  expect(screen.getByRole("link", {name:"Acessar Pessoas"})).toBe(link);
  expect(link.getAttribute("href")).toBe("/pessoas");
});
