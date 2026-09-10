// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { certamesMock } from "../controlePss/certame/mock";
import { salvarQuadroTemporario, listarQuadrosTemporarios, seletivoTemporario } from "./novoQuadroTemporarioStore";
import { NovoQuadroTemporarioContent } from "./NovoQuadroTemporarioContent";
afterEach(() => { cleanup(); localStorage.clear(); });
it("usa cadastro reserva como ausência de limite e impede duplicidade", () => {
 const certame = certamesMock.find(seletivoTemporario)!;
 const cargo = { ...certame.cargos[0], aceitaCadastroReserva:true, quantidadeCadastroReserva:10 };
 const registro = salvarQuadroTemporario({ ...certame, cargos:[cargo] }, " Observação ");
 expect(registro.cargos[0].modoControle).toBe("SEM_LIMITE"); expect(registro.cargos[0].limiteVagas).toBeUndefined();
 expect(registro.cargos[0].quantidadeVagas).toBe(cargo.quantidadeVagas);
 expect(() => salvarQuadroTemporario(certame, "")).toThrow(/Já existe/);
 expect(listarQuadrosTemporarios()).toHaveLength(1);
});
it("preserva o quantitativo como limite quando não há cadastro reserva", () => {
 const certame = certamesMock.find(seletivoTemporario)!;
 const registro = salvarQuadroTemporario({ ...certame, cargos:[{ ...certame.cargos[0], aceitaCadastroReserva:false }] }, "");
 expect(registro.cargos[0].modoControle).toBe("LIMITADO"); expect(registro.cargos[0].limiteVagas).toBe(certame.cargos[0].quantidadeVagas);
});
it("renderiza somente seleção de origem e desabilita criação sem cargo", () => {
 const view = render(<MemoryRouter><NovoQuadroTemporarioContent /></MemoryRouter>);
 expect(view.getByRole("heading", {name:"Novo Quadro Temporário"})).toBeTruthy();
 expect(view.getByRole("button", {name:"Criar Quadro Temporário"}).hasAttribute("disabled")).toBe(true);
 expect(view.queryByText("Carreira")).toBeNull();
});

it("inclui todos os cargos com limites independentes e aceita cargo em outro seletivo", () => {
 const origem = certamesMock.find(seletivoTemporario)!;
 const certame = { ...origem, cargos:[{ ...origem.cargos[0], aceitaCadastroReserva:true }, { ...origem.cargos[0], id:"segundo", aceitaCadastroReserva:false, quantidadeVagas:7 }] };
 const quadro = salvarQuadroTemporario(certame, "");
 expect(quadro.cargos).toHaveLength(2);
 expect(quadro.cargos[0].limiteVagas).toBeUndefined();
 expect(quadro.cargos[1].limiteVagas).toBe(7);
 expect(() => salvarQuadroTemporario({...certame, cargos:[certame.cargos[1]]}, "")).toThrow(/este seletivo/);
 salvarQuadroTemporario({ ...certame, id:"outro" }, "");
 expect(listarQuadrosTemporarios()).toHaveLength(2);
});
it("recusa seletivo sem cargos", () => {
 expect(() => salvarQuadroTemporario({ ...certamesMock.find(seletivoTemporario)!, cargos:[] }, "")).toThrow(/cargos cadastrados/);
});
