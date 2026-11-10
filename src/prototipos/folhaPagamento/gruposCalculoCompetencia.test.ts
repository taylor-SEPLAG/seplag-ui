// @vitest-environment jsdom
import { folhaPagamentoService } from "./folhaPagamentoService";
import {beforeEach,expect,it} from "vitest";
import {carregarGruposCompetencia,salvarGrupoCompetencia,excluirGrupoCompetencia,competenciaAnterior,replicarGruposNovaCompetencia} from "./gruposCalculoCompetencia";
const base=[{id:1,grupo:"Efetivos",situacao:"ATIVO",inicioVigencia:"01/01/2026",fimVigencia:"-",rubricas:["1001"]},{id:2,grupo:"Rascunho",situacao:"RASCUNHO",inicioVigencia:"01/01/2026",fimVigencia:"-",rubricas:[]}];
const historicos={1:[base[0],{...base[0],situacao:"ENCERRADO",inicioVigencia:"01/01/2025",fimVigencia:"31/12/2025"}],2:[base[1]]};
const carregar=(c:string)=>carregarGruposCompetencia(c,base,historicos,["2026-03","2026-04","2026-05"]);
beforeEach(()=>localStorage.clear());
it("carrega competências independentes e preserva a versão de origem",()=>{
  const maio=carregar("2026-05");expect(maio.grupos.find(g=>g.id===1)?.versao).toBe(2);expect(maio.grupos).toHaveLength(2);
  expect(carregar("2026-04").grupos).toHaveLength(1);
  maio.grupos[0].rubricas.push("externa");expect(carregar("2026-05").grupos[0].rubricas).not.toContain("externa");
});
it("replica todos os grupos da competencia anterior como V1, sem herdar o historico",()=>{
  const maio=carregar("2026-05");
  salvarGrupoCompetencia("2026-05",{...maio.grupos[0],rubricas:["nova"]},true);
  const origem=carregar("2026-05");
  replicarGruposNovaCompetencia("2026-06");
  const junho=carregar("2026-06");expect(junho.grupos).toHaveLength(2);
  expect(junho.grupos.find(g=>g.id===1)).toMatchObject({situacao:"ATIVO",versao:1,competencia:"2026-06",inicioVigencia:"01/06/2026",rubricas:["nova"]});
  expect(junho.grupos.find(g=>g.id===2)).toMatchObject({situacao:"RASCUNHO",versao:1});
  expect(junho.versoes[1]).toHaveLength(1);
  replicarGruposNovaCompetencia("2026-06");expect(carregar("2026-06")).toEqual(junho);
  salvarGrupoCompetencia("2026-06",{...junho.grupos[0],inicioVigencia:"15/06/2026"},true);
  expect(carregar("2026-06").grupos.find(g=>g.id===1)?.versao).toBe(2);
  expect(carregar("2026-05")).toEqual(origem);
});
it("nao busca grupos em outra competencia quando o mes anterior nao existe",()=>{
  carregar("2026-05");expect(carregar("2026-07").grupos).toHaveLength(0);
});
it("versiona somente o período selecionado e mantém histórico e cópias anteriores",()=>{
  const abril=carregar("2026-04");const maio=carregar("2026-05");
  salvarGrupoCompetencia("2026-04",{...abril.grupos[0],grupo:"Alterado em abril",inicioVigencia:"15/04/2026"},true);
  expect(carregar("2026-04").grupos[0]).toMatchObject({grupo:"Alterado em abril",versao:3});expect(carregar("2026-04").versoes[1][1].situacao).toBe("ENCERRADO");
  expect(carregar("2026-05")).toEqual(maio);
});
it("exclui apenas rascunhos da competência selecionada",()=>{
  const maio=carregar("2026-05");excluirGrupoCompetencia("2026-05",1);expect(carregar("2026-05").grupos).toHaveLength(2);
  excluirGrupoCompetencia("2026-05",2);expect(carregar("2026-05").grupos).toHaveLength(1);expect(maio.grupos).toHaveLength(2);
  expect(competenciaAnterior("2026-01")).toBe("2025-12");
});
it("seleciona a versão válida no mês em vez de uma versão futura",()=>{
  const dados=carregarGruposCompetencia("2026-05",[{...base[0],inicioVigencia:"01/06/2026"}],{1:[{...base[0],inicioVigencia:"01/06/2026"},{...base[0],inicioVigencia:"01/01/2026",fimVigencia:"31/05/2026"}]},["2026-05"]);
  expect(dados.grupos[0].versao).toBe(1);
});

it("replica ao avancar a competencia vigente no servico do sistema",()=>{
 const anteriores=folhaPagamentoService.listarCompetencias();carregar("2026-05");
 try {
  const maio=anteriores.find(c=>c.competencia==="2026-05")!;
  folhaPagamentoService.salvarCompetencias([{...maio,id:99,competencia:"2026-06",situacao:"ATIVA"},...anteriores.map(c=>({...c,situacao:"FECHADA" as const}))]);
  const banco=JSON.parse(localStorage.getItem("sigep:grupos-calculo:competencias:v1")!);
  expect(banco["2026-06"].grupos).toHaveLength(2);
  expect(banco["2026-06"].grupos.every((g:{versao:number})=>g.versao===1)).toBe(true);
 } finally {folhaPagamentoService.salvarCompetencias(anteriores);}
});
it('mantem encerrados e aguardando aprovacao na colecao da competencia',()=>{
 const encerrado={...base[0],situacao:'ENCERRADO',inicioVigencia:'01/05/2026',fimVigencia:'31/05/2026'};
 const dados=carregarGruposCompetencia('2026-05',[encerrado,base[1]],{1:[encerrado],2:[base[1]]},['2026-05']);
 expect(dados.grupos.map(g=>g.situacao)).toEqual(['ENCERRADO','RASCUNHO']);
});
it('corrige a carga antiga sem substituir grupos editados ou restaurar exclusoes futuras',()=>{
 const encerrado={...base[0],situacao:'ENCERRADO',inicioVigencia:'01/05/2026',fimVigencia:'31/05/2026'};
 localStorage.setItem('sigep:grupos-calculo:competencias:v1',JSON.stringify({'2026-05':{grupos:[{...encerrado,situacao:'ATIVO',versao:1}],versoes:{1:[{...encerrado,situacao:'ATIVO',versao:1}]}}}));
 const carregar=()=>carregarGruposCompetencia('2026-05',[encerrado,base[1]],{1:[encerrado],2:[base[1]]},['2026-05']);
 const dados=carregar();expect(dados.grupos.map(g=>g.situacao)).toEqual(['ENCERRADO','RASCUNHO']);
 excluirGrupoCompetencia('2026-05',2);expect(carregar().grupos).toHaveLength(1);
 salvarGrupoCompetencia('2026-05',{...dados.grupos[0],situacao:'ATIVO',grupo:'Editado'},true);
 expect(carregar().grupos[0]).toMatchObject({situacao:'ATIVO',grupo:'Editado',versao:2});
});
