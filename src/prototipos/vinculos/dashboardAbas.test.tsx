// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useState } from 'react';
import { DashboardVinculosPage } from './DashboardVinculosPage';
import { DashboardAnalises } from './DashboardAnalises';
import { agruparAnalise, cargoEspecialidade, dadosAnalise, filtrosAnaliseIniciais, gruposAnalise, linhasExportacaoAnalise, sexoVinculo, type VinculoPerfil } from './dashboardAbasModel';
import { criarExcelVinculos } from './exportarDashboardVinculos';
import { filtrosVinculosVazios } from './vinculosConsulta';
const dados:VinculoPerfil[] = [
  {id:'1',nome:'Ana',cpf:'1',matricula:'1',numero:'1',tipo:'Nomeado Efetivo',orgao:'SES',cargo:'Analista',perfil:'Saúde',carreira:'Saúde',inicio:'2020-01-01',sexo:'Feminino',escolaridade:'Superior completo'},
  {id:'2',nome:'Ana',cpf:'1',matricula:'1',numero:'2',tipo:'Nomeado Efetivo',orgao:'SES',cargo:'Analista',perfil:'Saúde',carreira:'Saúde',inicio:'2020-01-01',sexo:'Feminino',escolaridade:'Superior completo',vacanciaData:'2025-01-01',vacanciaForma:'Aposentadoria'},
  {id:'3',nome:'João',cpf:'2',matricula:'2',numero:'1',tipo:'Contrato Temporário',orgao:'SEDUC',cargo:'Professor',perfil:'Educação',carreira:'Educação',inicio:'2020-01-01'},
] as VinculoPerfil[];
afterEach(()=>{cleanup();localStorage.clear();});
it('detalha tipos de vínculo por sexo e consulta somente os registros do segmento',()=>{
  const tela=render(<MemoryRouter><DashboardAnalises aba="perfil" registros={dados} filtros={filtrosAnaliseIniciais} alterar={()=>{}} /></MemoryRouter>);
  const card=screen.getByRole('region',{name:'Tipos de Vínculo por Sexo'});
  const segmento=within(card).getByRole('button',{name:'Nomeado Efetivo · Feminino: 2 vínculos'});
  expect((segmento as HTMLElement).style.width).toBe('100%');
  expect(within(card).getByRole('button',{name:'Contrato Temporário · Não informado: 1 vínculos'})).toBeTruthy();
  fireEvent.click(segmento);
  expect(within(screen.getByRole('dialog')).getAllByRole('link',{name:'Consultar'})).toHaveLength(2);
  expect(linhasExportacaoAnalise(dados,'perfil',filtrosAnaliseIniciais)).toContainEqual(['Tipo de vínculo por sexo: Nomeado Efetivo · Feminino',1,1,2]);
  tela.unmount();
  render(<MemoryRouter><DashboardAnalises aba="perfil" registros={[dados[2]]} filtros={filtrosAnaliseIniciais} alterar={()=>{}} /></MemoryRouter>);
  const filtrado=screen.getByRole('region',{name:'Tipos de Vínculo por Sexo'});
  expect(within(filtrado).queryByRole('button',{name:/Feminino/})).toBeNull();
  expect(within(filtrado).getAllByRole('button')).toHaveLength(1);
});
it('escala o ranking pelo maior total e preserva a composição por situação',()=>{
  render(<MemoryRouter><DashboardAnalises aba="orgao" registros={dados} filtros={filtrosAnaliseIniciais} alterar={()=>{}} /></MemoryRouter>);
  const ranking=within(screen.getByRole('heading',{name:'Ranking dos Órgãos'}).closest('section')!);
  const maior=ranking.getByRole('button',{name:/SES/});
  const menor=ranking.getByRole('button',{name:/SEDUC/});
  expect((maior.querySelector('.da-vigente') as HTMLElement).style.width).toBe('50%');
  expect((maior.querySelector('.da-encerrado') as HTMLElement).style.width).toBe('50%');
  expect((menor.querySelector('.da-vigente') as HTMLElement).style.width).toBe('50%');
});
it('usa cinza para sexo não informado e explica a ausência de escolaridade sem alerta',()=>{
  const semDados=dados.map(({sexo,escolaridade,...registro})=>registro);
  render(<MemoryRouter><DashboardAnalises aba="perfil" registros={semDados} filtros={filtrosAnaliseIniciais} alterar={()=>{}} /></MemoryRouter>);
  const grafico=screen.getByRole('group',{name:'Distribuição de vínculos por sexo'});
  expect(grafico.querySelector('g circle')?.getAttribute('stroke')).toBe('var(--dv-nao-informado)');
  expect(screen.getByText('Não informado — 100%')).toBeTruthy();
  expect(screen.getByText('Os vínculos apresentados não possuem informação de escolaridade disponível no cadastro.')).toBeTruthy();
  expect(screen.queryByRole('alert')).toBeNull();
});
it('separa ativos e encerrados nos rankings sem alterar o total ou a consulta',()=>{
  render(<MemoryRouter><CargoTeste /></MemoryRouter>);
  for (const titulo of ['Ranking de Carreiras', 'Ranking de Cargos/Especialidades']) {
    const card = within(screen.getByRole('heading',{name:titulo}).closest('section')!);
    expect(card.getByText('Ativos')).toBeTruthy();
    expect(card.getByText('Encerrados')).toBeTruthy();
    const linha = card.getByRole('button',{name:/Saúde/});
    expect(linha.textContent).toContain('1 ativos · 1 encerrados');
    const vigente = linha.querySelector('.cc-rank-track > .cc-rank-vigentes') as HTMLElement;
    const encerrado = linha.querySelector('.cc-rank-track > .cc-rank-encerrados') as HTMLElement;
    expect(vigente.style.width).toBe(encerrado.style.width);
  }
});
function CargoTeste({registros=dados}:{registros?:VinculoPerfil[]}) {
  const [f,setF]=useState({...filtrosAnaliseIniciais,limite:'5'});
  return <DashboardAnalises aba="cargo" registros={registros} filtros={f} alterar={setF}/>;
}
it('organiza carreira antes de cargo e restringe opções de cargo pela carreira',()=>{
  render(<MemoryRouter><CargoTeste/></MemoryRouter>);
  const titulos=screen.getAllByRole('heading').map(h=>h.textContent);
  expect(titulos.indexOf('Análise por Carreira')).toBeLessThan(titulos.indexOf('Análise por Cargo/Especialidade'));
  expect(screen.getByRole('heading',{name:'Composição dos Vínculos por Cargo'})).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Cargo/Especialidade'),{target:{value:'Professor / Educação'}});
  fireEvent.change(screen.getByLabelText('Carreira'),{target:{value:'Saúde'}});
  expect((screen.getByLabelText('Cargo/Especialidade') as HTMLSelectElement).value).toBe('');
  expect(within(screen.getByLabelText('Cargo/Especialidade')).queryByRole('option',{name:'Professor / Educação'})).toBeNull();
  const ranking=within(screen.getByRole('heading',{name:'Ranking de Carreiras'}).closest('section')!);
  expect(ranking.getByRole('button',{name:/Saúde/}).textContent).toContain('2 · 100%');
});
it('abre ranking completo paginado sem aumentar a lista do card',()=>{
  const muitos=Array.from({length:13},(_,i)=>({...dados[0],id:`rank-${i}`,carreira:`Carreira ${String(i).padStart(2,'0')}`}));
  render(<MemoryRouter><CargoTeste registros={muitos}/></MemoryRouter>);
  const ranking=within(screen.getByRole('heading',{name:'Ranking de Carreiras'}).closest('section')!);
  expect(ranking.getAllByRole('button')).toHaveLength(6);
  fireEvent.click(ranking.getByRole('button',{name:/Ver todos/}));
  const modal=within(screen.getByRole('dialog'));
  expect(modal.getAllByRole('row')).toHaveLength(11);
  fireEvent.click(modal.getByRole('button',{name:'Próxima página de consulta da análise'}));
  expect(modal.getAllByRole('row')).toHaveLength(4);
  expect(modal.getByText('Carreira 12')).toBeTruthy();
});
it('consulta os vínculos de um segmento da composição sem misturar cargos',()=>{
  render(<MemoryRouter><CargoTeste/></MemoryRouter>);
  fireEvent.click(screen.getByRole('button',{name:'Analista / Saúde, Nomeado Efetivo: 2 vínculos'}));
  const modal=within(screen.getByRole('dialog'));
  expect(modal.getByText('2 vínculo(s) encontrado(s)')).toBeTruthy();
  expect(modal.getAllByRole('link',{name:'Consultar'})).toHaveLength(2);
  expect(modal.queryByText('João')).toBeNull();
});
it('filtra os tipos de vínculo pelo órgão sem alterar os demais gráficos',()=>{
  const {rerender}=render(<MemoryRouter><DashboardAnalises aba="orgao" registros={dados} filtros={filtrosAnaliseIniciais} alterar={()=>{}}/></MemoryRouter>);
  const grafico=()=>within(screen.getByRole('heading',{name:'Tipos de vínculo por órgão'}).closest('section')!);
  expect(grafico().getByRole('button',{name:'SES / Nomeado Efetivo: 1 ativos'})).toBeTruthy();
  rerender(<MemoryRouter><DashboardAnalises aba="orgao" registros={dados} filtros={{...filtrosAnaliseIniciais,orgaoTipo:'SEDUC'}} alterar={()=>{}}/></MemoryRouter>);
  expect(grafico().queryByRole('button',{name:/SES/})).toBeNull();
  expect(grafico().getByRole('button',{name:'SEDUC / Contrato Temporário: 1 ativos'})).toBeTruthy();
  expect(screen.getByRole('button',{name:'SES: 1 ativos'})).toBeTruthy();
  expect(linhasExportacaoAnalise(dados,'orgao',{...filtrosAnaliseIniciais,orgaoTipo:'SEDUC'}).filter(l=>String(l[0]).startsWith('Tipo por órgão:'))).toEqual([['Tipo por órgão: SEDUC / Contrato Temporário',1,0,1]]);
});
it('conta cada vínculo e inclui campos ausentes sem inferir sexo ou escolaridade',()=>{
  const grupos=gruposAnalise(dados,'orgao');
  expect(grupos[0]).toMatchObject({nome:'SES',total:2,vigentes:1,encerrados:1});
  expect(agruparAnalise(dados,sexoVinculo).map(g=>[g.nome,g.total])).toEqual([['Feminino',2],['Não informado',1]]);
  expect(gruposAnalise(dados,'perfil').reduce((s,g)=>s+g.total,0)).toBe(3);
});
it('aplica busca sem acentos e carreira somente ao contexto da aba',()=>{
  expect(dadosAnalise(dados,'cargo',{...filtrosAnaliseIniciais,busca:'Analista',carreira:'Saúde'})).toHaveLength(2);
  expect(dadosAnalise(dados,'orgao',{...filtrosAnaliseIniciais,busca:'inexistente'})).toHaveLength(3);
  expect(agruparAnalise(dados,cargoEspecialidade)[0].nome).toBe('Analista / Saúde');
});
it('mantém a exportação existente e adiciona a análise selecionada com nome válido',()=>{
  const linhas=linhasExportacaoAnalise(dados,'cargo',{...filtrosAnaliseIniciais,carreira:'Saúde'});
  expect(linhas).toEqual([['Analista / Saúde',1,1,2],['Tipo por cargo: Analista / Saúde / Nomeado Efetivo',1,1,2],['Carreira: Saúde',1,1,2]]);
  const excel=criarExcelVinculos(dados,filtrosVinculosVazios,['Nomeado Efetivo'],{nome:'Cargo/Especialidade',linhas,contexto:[['Carreira','Saúde']]});
  expect(excel.getWorksheet('Resumo Geral')).toBeTruthy();
  const analise=excel.getWorksheet('Cargo - Especialidade')!;
  expect(analise).toBeTruthy();
  expect(analise.lastRow?.values).toContain('Carreira: Saúde');
});
it('consulta somente os registros correspondentes ao segmento selecionado',()=>{
  render(<MemoryRouter><DashboardAnalises aba="orgao" registros={dados} filtros={filtrosAnaliseIniciais} alterar={()=>{}}/></MemoryRouter>);
  fireEvent.click(screen.getByRole('button',{name:'SES: 1 encerrados'}));
  const modal=within(screen.getByRole('dialog'));
  expect(modal.getByText('1 vínculo(s) encontrado(s)')).toBeTruthy();
  expect(modal.getByRole('link',{name:'Consultar'}).getAttribute('href')).toBe('/prototipos/sigep/vinculos-v2/2');
});
it('exibe cinco abas e preserva filtros globais ao alternar entre elas',()=>{
  render(<MemoryRouter><DashboardVinculosPage/></MemoryRouter>);
  expect(screen.getAllByRole('tab')).toHaveLength(4);
  expect(screen.getByRole('tab',{name:'Visão Geral'}).getAttribute('aria-selected')).toBe('true');
  const filtro=screen.getByLabelText('Órgão/Entidade');
  fireEvent.change(filtro,{target:{value:'SES'}});
  fireEvent.click(screen.getByRole('tab',{name:'Carreira e Cargo'}));
  expect(screen.getByRole('heading',{name:'Ativos x Encerrados por Cargo/Especialidade'})).toBeTruthy();
  expect(screen.getByRole('heading',{name:'Ativos x Encerrados por Carreira'})).toBeTruthy();
  expect(screen.getAllByLabelText('Carreira')).toHaveLength(1);
  const cargoSelecionado=(screen.getByLabelText('Cargo/Especialidade') as HTMLSelectElement).options[1].value;
  fireEvent.change(screen.getByLabelText('Cargo/Especialidade'),{target:{value:cargoSelecionado}});
  fireEvent.click(screen.getByRole('tab',{name:'Perfil dos Vínculos'}));
  expect(screen.getByRole('heading',{name:'Distribuição por Sexo'})).toBeTruthy();
  expect((filtro as HTMLSelectElement).value).toBe('SES');
  fireEvent.click(screen.getByRole('tab',{name:'Carreira e Cargo'}));
  expect((screen.getByLabelText('Cargo/Especialidade') as HTMLSelectElement).value).toBe(cargoSelecionado);
  fireEvent.click(screen.getByRole('tab',{name:'Visão Geral'}));
  expect(screen.getByRole('heading',{name:'Ativos x Encerrados por Tipo de Vínculo'})).toBeTruthy();
  expect(screen.queryByRole('heading',{name:'Vínculos ativos e encerrados por órgão'})).toBeNull();
  expect(screen.queryByRole('heading',{name:'Tipos de vínculo por cargo/especialidade'})).toBeNull();
});
it('aplica Top 10 inicialmente e expande todos os órgãos',()=>{
  const muitos=Array.from({length:12},(_,i)=>({...dados[0],id:`o-${i}`,orgao:`Órgão ${i}`}));
  const {rerender}=render(<MemoryRouter><DashboardAnalises aba="orgao" registros={muitos} filtros={filtrosAnaliseIniciais} alterar={()=>{}}/></MemoryRouter>);
  expect(within(screen.getByRole('heading',{name:'Ativos x Encerrados por Órgão'}).closest('section')!).getAllByRole('button',{name:/1 ativos$/})).toHaveLength(10);
  rerender(<MemoryRouter><DashboardAnalises aba="orgao" registros={muitos} filtros={{...filtrosAnaliseIniciais,todosOrgaos:true}} alterar={()=>{}}/></MemoryRouter>);
  expect(within(screen.getByRole('heading',{name:'Ativos x Encerrados por Órgão'}).closest('section')!).getAllByRole('button',{name:/1 ativos$/})).toHaveLength(12);
});
it('atualiza a distribuição de cargos da carreira selecionada sem perder vínculos',()=>{
  const {rerender}=render(<MemoryRouter><DashboardAnalises aba="carreira" registros={dados} filtros={filtrosAnaliseIniciais} alterar={()=>{}}/></MemoryRouter>);
  const ranking=()=>within(screen.getByRole('heading',{name:'Distribuição de Cargos por Carreira'}).closest('section')!);
  expect(ranking().getAllByRole('button')).toHaveLength(2);
  rerender(<MemoryRouter><DashboardAnalises aba="carreira" registros={dados} filtros={{...filtrosAnaliseIniciais,carreira:'Saúde'}} alterar={()=>{}}/></MemoryRouter>);
  expect(ranking().getAllByRole('button')).toHaveLength(1);
  expect(ranking().getByRole('button').textContent).toContain('2 · 100%');
});
it('exporta todas as análises sem omitir as categorias não informadas',()=>{
  for(const aba of ['orgao','cargo','carreira','perfil'] as const){
    const linhas=linhasExportacaoAnalise(dados,aba,filtrosAnaliseIniciais);
    expect(linhas.length).toBeGreaterThan(0);
    const arquivo=criarExcelVinculos(dados,filtrosVinculosVazios,['Nomeado Efetivo'],{nome:aba,linhas,contexto:[]});
    expect(arquivo.getWorksheet(aba)).toBeTruthy();
  }
  expect(linhasExportacaoAnalise(dados,'perfil',filtrosAnaliseIniciais).some(l=>l[0]==='Sexo: Não informado')).toBe(true);
});
