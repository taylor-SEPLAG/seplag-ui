// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Link, Routes, Route } from "react-router-dom";
import { MascoteAvatar } from "./MascoteAvatar";
import { obterMascote } from "./mascoteStore";
afterEach(cleanup);
it("cycles on navigation and submenu clicks, preserving state across remounts", () => {
  function Pagina() { return <><MascoteAvatar /><Link to="/destino">Abrir modulo</Link><div className="layout-menu"><a href="#" onClick={e => e.preventDefault()}>Submenu</a></div><input aria-label="Busca" /></>; }
  const view = render(<MemoryRouter initialEntries={["/inicio"]}><Routes><Route path="*" element={<Pagina />} /></Routes></MemoryRouter>);
  expect(obterMascote().indice).toBe(0);
  fireEvent.change(screen.getByLabelText("Busca"), { target: { value: "texto" } });
  fireEvent.mouseMove(screen.getByText("Submenu"));
  expect(obterMascote().indice).toBe(0);
  fireEvent.click(screen.getByText("Abrir modulo"));
  expect(obterMascote().indice).toBe(1);
  fireEvent.click(screen.getByText("Submenu"));
  expect(obterMascote().indice).toBe(2);
  view.unmount();
  render(<MemoryRouter initialEntries={["/destino"]}><Pagina /></MemoryRouter>);
  expect(obterMascote().indice).toBe(2);
  fireEvent.click(screen.getByText("Submenu"));
  expect(obterMascote().indice).toBe(0);
});

it("keeps the module mascot on submenu interactions and switches when the module changes", () => {
  const view = render(<MemoryRouter><MascoteAvatar mascote="onca" /><div className="layout-menu"><a href="#" onClick={e => e.preventDefault()}>Menu fixo</a></div></MemoryRouter>);
  const atual = () => view.container.querySelector<HTMLImageElement>(".sigep-mascote-atual img")!.src;
  expect(atual()).toContain("SIGEP_Onca_fiel.png");
  fireEvent.click(screen.getByText("Menu fixo"));
  expect(atual()).toContain("SIGEP_Onca_fiel.png");
  view.rerender(<MemoryRouter><MascoteAvatar mascote="capivara" /></MemoryRouter>);
  expect(atual()).toContain("SIGEP_Capivara_fiel.png");
});
