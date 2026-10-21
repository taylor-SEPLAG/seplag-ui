// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { agruparTiposPorCargo } from "./GraficoTiposPorOrgao";
import {
  agruparTiposPorOrgao,
  GraficoTiposPorOrgao,
} from "./GraficoTiposPorOrgao";
import { filtrosVinculosVazios } from "./vinculosConsulta";
import type { Vinculo } from "./VinculoV2Page";
afterEach(cleanup);
it('filtra somente o gráfico pelo órgão escolhido e permite voltar a todos', () => {
  render(<MemoryRouter><GraficoTiposPorOrgao registros={registros as Vinculo[]} filtros={filtrosVinculosVazios}/></MemoryRouter>);
  fireEvent.change(screen.getByLabelText('Selecione o órgão'), { target: { value: 'SES' } });
  expect(screen.getByRole('link', {name:'SES, Nomeado Efetivo, Ativo: 2 vínculos'})).toBeTruthy();
  expect(screen.queryByRole('link', {name:/SEDUC,/})).toBeNull();
  fireEvent.change(screen.getByLabelText('Selecione o órgão'), { target: { value: '' } });
  expect(screen.getByRole('link', {name:'SEDUC, Contrato Temporário, Ativo: 1 vínculos'})).toBeTruthy();
});
it("separa cargos e especialidades, consolidando cada tipo de vínculo", () => {
  const grupos = agruparTiposPorCargo([
    { cargo: "Analista", perfil: "TI", tipo: "Nomeado Efetivo" },
    { cargo: "Analista", perfil: "TI", tipo: "Nomeado Efetivo" },
    { cargo: "Analista", perfil: "Saúde", tipo: "Contrato Temporário" },
  ]);
  expect(grupos.map((g) => [g.orgao, g.total])).toEqual([
    ["Analista / TI", 2],
    ["Analista / Saúde", 1],
  ]);
});
it("exibe o gráfico por cargo com descrição dos segmentos", () => {
  render(
    <MemoryRouter>
      <GraficoTiposPorOrgao
        registros={
          [
            { cargo: "Analista", perfil: "TI", tipo: "Nomeado Efetivo" },
          ] as Vinculo[]
        }
        filtros={filtrosVinculosVazios}
        porCargo
      />
    </MemoryRouter>,
  );
  expect(
    screen.getByRole("heading", {
      name: "Tipos de vínculo por cargo/especialidade",
    }),
  ).toBeTruthy();
  expect(
    screen.getByRole("img", {
      name: "Analista / TI, Nomeado Efetivo: 1 vínculos",
    }),
  ).toBeTruthy();
});
const registros = [
  { orgao: "SES", tipo: "Nomeado Efetivo" },
  { orgao: "SES", tipo: "Nomeado Efetivo" },
  { orgao: "SES", tipo: "Contrato Temporário" },
  { orgao: "SEDUC", tipo: "Contrato Temporário" },
];
it("consolida por órgão e tipo com totais corretos", () => {
  const grupos = agruparTiposPorOrgao(registros);
  expect(grupos.map((g) => [g.orgao, g.total])).toEqual([
    ["SES", 3],
    ["SEDUC", 1],
  ]);
  expect(grupos[0].tipos.get("Nomeado Efetivo")).toBe(2);
  expect(agruparTiposPorOrgao([])).toEqual([]);
});
it("gera consulta com órgão, tipo e filtros atuais", () => {
  render(
    <MemoryRouter>
      <GraficoTiposPorOrgao
        registros={registros as Vinculo[]}
        filtros={{ ...filtrosVinculosVazios, situacao: "Ativo", tipo: 'Nomeado Efetivo' }}
      />
    </MemoryRouter>,
  );
  const url = screen
    .getByRole("link", { name: "SES, Nomeado Efetivo, Ativo: 2 vínculos" })
    .getAttribute("href")!;
  const params = new URL(url, "http://localhost").searchParams;
  expect(params.get("orgao")).toBe("SES");
  expect(params.get("tipo")).toBe("Nomeado Efetivo");
  expect(params.get("situacao")).toBe("Ativo");
});
it("apresenta estado vazio para filtros sem resultados", () => {
  render(
    <MemoryRouter>
      <GraficoTiposPorOrgao registros={[]} filtros={filtrosVinculosVazios} />
    </MemoryRouter>,
  );
  expect(screen.getByRole("status").textContent).toContain("Nenhum vínculo");
});
it('separa ativos e encerrados por órgão usando o encerramento registrado', () => {
  render(<MemoryRouter><GraficoTiposPorOrgao registros={[
    {orgao:'SES',tipo:'Nomeado Efetivo'},
    {orgao:'SES',tipo:'Contrato Temporário',vacanciaData:'2026-10-20',vacanciaForma:'Término de Contrato'},
  ] as Vinculo[]} filtros={filtrosVinculosVazios}/></MemoryRouter>);
  expect(screen.getByRole('link',{name:'SES, Nomeado Efetivo, Ativo: 1 vínculos'})).toBeTruthy();
  const url=screen.getByRole('link',{name:'SES, Contrato Temporário, Encerrado: 1 vínculos'}).getAttribute('href')!;
  expect(new URL(url,'http://localhost').searchParams.get('situacao')).toBe('Encerrado');
});
