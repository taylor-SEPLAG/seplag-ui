// @vitest-environment jsdom
import { beforeEach, expect, it } from 'vitest';
import ExcelJS from 'exceljs';
import { criarExcelDashboard } from './exportarDashboardIngresso';
import { filtrosIniciais, lerDadosDashboard } from './dashboardIngressoModel';

beforeEach(() => localStorage.clear());
it('exporta três abas com filtros, totais únicos e exclusão de encerrados das pendências', async () => {
  const base = lerDadosDashboard()[0];
  const registros = [
    {...base,id:'a',tipo:'Concurso' as const,situacao:'Posse Suspensa' as const},
    {...base,id:'b',tipo:'Concurso' as const,situacao:'Ingresso Concluído' as const,conclusao:'2026-10-01'},
    {...base,id:'c',tipo:'Concurso' as const,situacao:'Posse Negada' as const},
    {...base,id:'d',tipo:'Processo Seletivo' as const,situacao:'Em analise' as const},
  ];
  const workbook = criarExcelDashboard([...registros,registros[0]], {...filtrosIniciais,tipo:'Concurso'});
  expect(workbook.worksheets.map(s => s.name)).toEqual(['Resumo Geral','Ingressados','Pendências por Edital']);
  const resumo = workbook.getWorksheet('Resumo Geral')!;
  const valores = new Map<string, unknown>();
  resumo.eachRow(row => valores.set(String(row.getCell(1).value),row.getCell(2).value));
  expect(valores.get('Total de ingressos pendentes')).toBe(1);
  expect(valores.get('Total de ingressados')).toBe(1);
  expect(valores.get('Encerrados sem ingresso')).toBe(1);
  expect(valores.get('Tipo de Ingresso')).toBe('Concurso Público');
  const pendencias=workbook.getWorksheet('Pendências por Edital')!;
  expect(pendencias.lastRow!.getCell(4).value).toBe('Posse Suspensa');
  expect(pendencias.lastRow!.getCell(5).value).toBe(1);
  const ingressados=workbook.getWorksheet('Ingressados')!;
  expect(ingressados.lastRow!.getCell(5).value).toBe(2026);
  expect(ingressados.lastRow!.getCell(6).value).toBe(1);
  expect(ingressados.autoFilter).toBeTruthy();
  const reaberto = new ExcelJS.Workbook();
  await reaberto.xlsx.load(await workbook.xlsx.writeBuffer());
  expect(reaberto.worksheets).toHaveLength(3);
});
it('respeita período de conclusão, cargo, órgão, edital e exporta além da paginação', () => {
  const base=lerDadosDashboard()[0];
  const registros=Array.from({length:25},(_,i) => ({...base,id:String(i),situacao:'Ingresso Concluído' as const,conclusao:i===24?'2025-01-01':'2026-10-01'}));
  const filtros={...filtrosIniciais,tipo:base.tipo,edital:String(base.editalId),orgao:base.orgao,cargo:base.cargo,inicio:'2026-10-01',fim:'2026-10-01'};
  const sheet=criarExcelDashboard(registros,filtros).getWorksheet('Ingressados')!;
  expect(sheet.lastRow!.getCell(6).value).toBe(24);
  const vazio=criarExcelDashboard(registros,{...filtros,orgao:'Não permitido'}).getWorksheet('Ingressados')!;
  expect(vazio.lastRow!.getCell(6).value).toBe('Quantidade de ingressados');
});
