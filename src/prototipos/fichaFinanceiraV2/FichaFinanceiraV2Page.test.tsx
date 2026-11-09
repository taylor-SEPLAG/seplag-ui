// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within, configure } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import * as transporte from "./consultaAutomatica";
vi.mock("../PrototiposPage",()=>({PrototypeSystemPage:({children}:{children:React.ReactNode})=>children,menuFolha:[]}));
vi.mock("primereact/dropdown",()=>({Dropdown:({inputId,value,options,disabled,onChange}:{inputId:string;value:string;options:(string|{label:string;value:string})[];disabled?:boolean;onChange:(e:{value:string})=>void})=><select id={inputId} value={value??""} disabled={disabled} onChange={e=>onChange({value:e.target.value})}><option value="">Selecione</option>{options.map(o=><option key={typeof o==="string"?o:o.value} value={typeof o==="string"?o:o.value}>{typeof o==="string"?o:o.label}</option>)}</select>}));
import { FichaFinanceiraV2Content, identificacaoAutocomplete, correspondePesquisaPessoa } from "./FichaFinanceiraV2Page";
vi.setConfig({testTimeout:20000});configure({asyncUtilTimeout:5000});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
const montar=()=>render(<MemoryRouter><FichaFinanceiraV2Content /></MemoryRouter>);
async function pessoa(termo:string,nome:RegExp){fireEvent.change(screen.getByLabelText("Nome, CPF ou matrícula"),{target:{value:termo}});fireEvent.click(await screen.findByText(nome));}
function selecionar(label:string,valor:string){fireEvent.change(screen.getByLabelText(label),{target:{value:valor}});}
const botao=()=>screen.getByRole("button",{name:"Consultar"}) as HTMLButtonElement;
async function consultar(){fireEvent.click(botao());await screen.findByRole("button",{name:"Holerite"});return screen.getByRole("region",{name:"Demonstrativo de Pagamento"});}
it("exige confirmação mesmo com filtros completos e mantém identificação visível sem expansão",async()=>{
  const spy=vi.spyOn(transporte,"recuperarDemonstrativo");montar();expect(botao().disabled).toBe(true);
  await pessoa("32274/002",/Antonia Silva.*32274/);
  expect((screen.getByLabelText("Vínculo *") as HTMLSelectElement).value).toBe("32274-002");
  const resumo=screen.getByLabelText("Resumo da identificação");expect(within(resumo).getByText("Professora")).toBeTruthy();expect(within(resumo).getByText("Contrato administrativo temporário")).toBeTruthy();
  expect(screen.queryByRole("button",{name:"Ver detalhes"})).toBeNull();
  selecionar("Competência *","09/2026");expect(botao().disabled).toBe(false);expect(spy).not.toHaveBeenCalled();
  expect(screen.queryByRole("button",{name:"Holerite"})).toBeNull();expect(screen.getByText("Nenhum demonstrativo consultado")).toBeTruthy();
  const regiao=await consultar();expect(within(regiao).getByText(/5\.940,02/)).toBeTruthy();
  selecionar("Competência *","08/2026");expect(screen.queryByRole("button",{name:"Holerite"})).toBeNull();expect(screen.getByText("Nenhum demonstrativo consultado")).toBeTruthy();expect(spy).toHaveBeenCalledTimes(1);
  const nova=await consultar();expect(within(nova).getByText("Competência 08/2026")).toBeTruthy();
});
it("não escolhe vínculo arbitrário e invalida o demonstrativo ao mudar vínculo ou folha",async()=>{
  const spy=vi.spyOn(transporte,"recuperarDemonstrativo");montar();await pessoa("Antonia",/Antonia Silva.*32274/);
  expect((screen.getByLabelText("Vínculo *") as HTMLSelectElement).value).toBe("");expect(botao().disabled).toBe(true);
  selecionar("Vínculo *","32274-001");selecionar("Competência *","10/2026");await consultar();
  selecionar("Vínculo *","32274-002");expect((screen.getByLabelText("Competência *") as HTMLSelectElement).value).toBe("");expect(botao().disabled).toBe(true);expect(spy).toHaveBeenCalledTimes(1);
  await pessoa("Isabeli",/Isabeli.*358186/);selecionar("Competência *","10/2026");expect(botao().disabled).toBe(true);
  selecionar("Número da Folha *","1");await consultar();selecionar("Número da Folha *","2");
  expect(screen.queryByRole("button",{name:"Holerite"})).toBeNull();expect(screen.getByText("Nenhum demonstrativo consultado")).toBeTruthy();expect(spy).toHaveBeenCalledTimes(2);await consultar();expect(spy).toHaveBeenCalledTimes(3);
});
it("mostra informações do beneficiário no resumo e aguarda clique mesmo com opções únicas",async()=>{
  const spy=vi.spyOn(transporte,"recuperarDemonstrativo");montar();await pessoa("Maria",/^Maria Costa · 456\.789\.123-00$/);selecionar("Competência *","10/2026");
  expect(botao().disabled).toBe(false);expect(spy).not.toHaveBeenCalled();
  const campoVinculo=screen.getByLabelText("Vínculo") as HTMLInputElement;expect(campoVinculo.value).toBe("Não possui vínculo funcional");expect(campoVinculo.readOnly).toBe(true);expect(campoVinculo.tagName).toBe("INPUT");expect(screen.queryByLabelText(/Benefício \/ Relacionamento/)).toBeNull();
  const resumo=screen.getByLabelText("Resumo da identificação");expect(within(resumo).getByText(/Pensionista de CARLOS/)).toBeTruthy();expect(within(resumo).getByText("45120/001")).toBeTruthy();expect(within(resumo).queryByText("Regime:")).toBeNull();
  await consultar();fireEvent.click(screen.getByRole("button",{name:"Limpar filtro"}));
  expect((screen.getByLabelText("Nome, CPF ou matrícula") as HTMLInputElement).value).toBe("");expect((screen.getByLabelText("Competência *") as HTMLSelectElement).disabled).toBe(true);
  expect(screen.queryByLabelText("Resumo da identificação")).toBeNull();expect(screen.queryByRole("button",{name:"Holerite"})).toBeNull();expect(screen.getByText("Nenhum demonstrativo consultado")).toBeTruthy();expect(botao().disabled).toBe(true);
});
it("preserva filtros de rubricas, cálculo e Holerite",async()=>{
  montar();await pessoa("Isabeli",/Isabeli.*358186/);selecionar("Competência *","09/2026");const regiao=await consultar();
  expect(screen.getByRole("button",{name:"Holerite"})).toBeTruthy();fireEvent.click(screen.getByRole("button",{name:"Descontos",exact:true}));expect(within(regiao).queryByText("Subsídios")).toBeNull();
  fireEvent.click(screen.getAllByRole("button",{name:"Ver Cálculo"})[0]);expect(await screen.findByText("Memória de Cálculo")).toBeTruthy();
});
it("oferece nova tentativa após falha e mantém a consulta explícita",async()=>{
  vi.spyOn(transporte,"recuperarDemonstrativo").mockRejectedValueOnce(new Error("Falha"));montar();await pessoa("Maria",/^Maria Costa · 456\.789\.123-00$/);selecionar("Competência *","10/2026");
  fireEvent.click(botao());expect(await screen.findByRole("alert")).toBeTruthy();fireEvent.click(screen.getByRole("button",{name:"Tentar novamente"}));await screen.findByRole("button",{name:"Holerite"});
});
it("ignora resposta atrasada após alteração dos filtros sem iniciar uma nova consulta",async()=>{
  let liberar=()=>{};const spy=vi.spyOn(transporte,"recuperarDemonstrativo").mockImplementationOnce(resolver=>new Promise(resolve=>{liberar=()=>resolve(resolver());}));
  montar();await pessoa("Isabeli",/Isabeli.*358186/);selecionar("Competência *","10/2026");selecionar("Número da Folha *","1");fireEvent.click(botao());expect(botao().disabled).toBe(true);
  selecionar("Competência *","09/2026");liberar();await waitFor(()=>expect(screen.queryByRole("status")).toBeNull());
  expect(screen.queryByRole("button",{name:"Holerite"})).toBeNull();expect(screen.getByText("Nenhum demonstrativo consultado")).toBeTruthy();expect(spy).toHaveBeenCalledTimes(1);
  await consultar();expect(screen.getByText("Competência 09/2026")).toBeTruthy();
});
it("trata consultas vazias e pessoas sem registros",async()=>{
  montar();await pessoa("João",/900001/);expect(botao().disabled).toBe(true);expect(screen.getByRole("status").textContent).toContain("Nenhum registro financeiro");
  vi.spyOn(transporte,"recuperarDemonstrativo").mockImplementationOnce(async resolver=>Object.assign({},resolver(),{rubricas:[]}));
  await pessoa("Maria",/^Maria Costa · 456\.789\.123-00$/);selecionar("Competência *","10/2026");fireEvent.click(botao());expect(await screen.findByText("Nenhum demonstrativo encontrado")).toBeTruthy();expect(screen.getByText("Não foram encontrados registros financeiros para os filtros informados.")).toBeTruthy();expect(screen.queryByRole("button",{name:"Holerite"})).toBeNull();
});
it("mantém a formatação e a busca por múltiplas matrículas",()=>{
  const v=(identificacao:string)=>({id:identificacao,pessoaId:"p1",nome:"PESSOA TESTE",cpf:"123.456.789-09",tipo:"Efetivo",orgao:"SEPLAG",fator:1,identificacao});const p={nome:"PESSOA TESTE",cpf:"123.456.789-09",vinculos:[v("32274/001"),v("32274/002")]};
  expect(identificacaoAutocomplete(p).principal).toBe("Pessoa Teste · 123.456.789-09 · 32274");expect(identificacaoAutocomplete({...p,vinculos:[]}).principal).toBe("Pessoa Teste · 123.456.789-09");expect(correspondePesquisaPessoa(p,"32274/002")).toBe(true);
});
it("exibe estado inicial orientativo com filtros vazios e dependências bloqueadas",()=>{
  montar();
  expect(screen.getByRole("region",{name:"Consultar Demonstrativo"})).toBeTruthy();
  const resultado=screen.getByRole("region",{name:"Demonstrativo de Pagamento"});
  expect(within(resultado).getByText("Nenhum demonstrativo consultado")).toBeTruthy();
  expect(within(resultado).queryByRole("table")).toBeNull();
  expect(within(resultado).queryByRole("button",{name:"Holerite"})).toBeNull();
  expect((screen.getByLabelText("Nome, CPF ou matrícula") as HTMLInputElement).value).toBe("");
  for(const label of ["Vínculo","Competência *","Número da Folha *"]){const campo=screen.getByLabelText(label) as HTMLSelectElement;expect(campo.value).toBe("");expect(campo.disabled).toBe(true);}
  expect(botao().disabled).toBe(true);expect(screen.queryByLabelText("Resumo da identificação")).toBeNull();
});
