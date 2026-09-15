import { useMemo, useState } from "react";
import type { DataTableExpandedRows } from "primereact/datatable";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { BadgeSeplag } from "../../componentes/Badge";
import { BotaoAdicionarSeplag, BotaoIconSeplag, BotaoLimparFiltroSeplag } from "../../componentes/Botao";
import { DropdownFieldSeplag, TextFieldSeplag } from "../../componentes/Fields";
import { TablePaginadoSeplag, type ColumnMetaSeplag } from "../../componentes/TablePaginado";
import type { ResultsSeplag } from "../../interfaces/Results";
import {
  listarQuadrosComissionados,
  prepararNovaVersaoQuadroComissionado,
  prepararNovoQuadroComissionado,
  type ItemEstruturaComissionadaSalvo,
  type QuadroComissionadoSalvo,
} from "./novoQuadroComissionadoStore";
import "../controleVagas/quadroAutorizado.css";
import "./quadroAutorizadoComissionadoLista.css";

const BASE_PATH = "/prototipos/sigep/controle-vagas/comissionados/quadro-autorizado";
type SituacaoLista = "Ativo" | "Agendado";
type FiltrosQuadroComissionado = { busca: string; orgao: string; situacao: string };
type QuadroLista = QuadroComissionadoSalvo & { codigo: string; cargos: number; funcoes: number; dotacoes: number; situacao: SituacaoLista };
const filtrosIniciais: FiltrosQuadroComissionado = { busca: "", orgao: "", situacao: "" };

function resultados<T>(content: T[]): ResultsSeplag<T> {
  return { content, last: true, totalPages: Math.max(1, Math.ceil(content.length / 10)), pageActual: 0, sizePage: 10, totalRecords: content.length, size: content.length, number: 0, first: true, numberOfElements: content.length, empty: content.length === 0 };
}
function somarItens(itens: ItemEstruturaComissionadaSalvo[]) {
  return itens.reduce((total, item) => {
    const atual = item.dotacoes.reduce((soma, dotacao) => ({ cargos: soma.cargos + dotacao.cargos, funcoes: soma.funcoes + dotacao.funcoes, dotacoes: soma.dotacoes + 1 }), { cargos: 0, funcoes: 0, dotacoes: 0 });
    const filhos = somarItens(item.subitens ?? []);
    return { cargos: total.cargos + atual.cargos + filhos.cargos, funcoes: total.funcoes + atual.funcoes + filhos.funcoes, dotacoes: total.dotacoes + atual.dotacoes + filhos.dotacoes };
  }, { cargos: 0, funcoes: 0, dotacoes: 0 });
}
function situacaoDoQuadro(dataVigencia: string): SituacaoLista {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  return dataVigencia && new Date(`${dataVigencia}T00:00:00`) > hoje ? "Agendado" : "Ativo";
}

export function QuadroAutorizadoComissionadoLista() {
  const navigate = useNavigate();
  const { control, reset, watch } = useForm<FiltrosQuadroComissionado>({ defaultValues: filtrosIniciais });
  const filtros = watch();
  const [detalhe, setDetalhe] = useState<QuadroLista | null>(null);
  const [linhasExpandidas, setLinhasExpandidas] = useState<DataTableExpandedRows>({});
  const quadros = useMemo<QuadroLista[]>(() => listarQuadrosComissionados().map((quadro, indice) => {
    const totais = quadro.niveis.reduce((total, nivel) => {
      const itens = somarItens(nivel.itens ?? []);
      return { cargos: total.cargos + itens.cargos, funcoes: total.funcoes + itens.funcoes, dotacoes: total.dotacoes + itens.dotacoes };
    }, { cargos: 0, funcoes: 0, dotacoes: 0 });
    return { ...quadro, ...totais, codigo: `QC-${String(indice + 1).padStart(4, "0")}`, situacao: situacaoDoQuadro(quadro.dataVigencia) };
  }), []);

  const quadrosAtuais = useMemo(() => {
    const porQuadroBase = new Map<string, QuadroLista>();
    quadros.forEach((quadro) => {
      const chave = quadro.quadroBaseId ?? quadro.id;
      const atual = porQuadroBase.get(chave);
      if (!atual || (quadro.versao ?? 1) > (atual.versao ?? 1)) porQuadroBase.set(chave, quadro);
    });
    return [...porQuadroBase.values()];
  }, [quadros]);
  const versoesAnteriores = (quadro: QuadroLista) => quadros
    .filter((item) => (item.quadroBaseId ?? item.id) === (quadro.quadroBaseId ?? quadro.id) && item.id !== quadro.id)
    .sort((a, b) => (b.versao ?? 1) - (a.versao ?? 1));
  const orgaos = useMemo(() => [...new Set(quadrosAtuais.map((quadro) => quadro.orgao))].sort(), [quadrosAtuais]);
  const filtrados = quadrosAtuais.filter((quadro) => {
    const termo = filtros.busca.trim().toLocaleLowerCase("pt-BR");
    return (!termo || `${quadro.codigo} ${quadro.nome}`.toLocaleLowerCase("pt-BR").includes(termo)) && (!filtros.orgao || quadro.orgao === filtros.orgao) && (!filtros.situacao || quadro.situacao === filtros.situacao);
  });
  const totais = quadrosAtuais.reduce((total, quadro) => ({ cargos: total.cargos + quadro.cargos, funcoes: total.funcoes + quadro.funcoes, dotacoes: total.dotacoes + quadro.dotacoes }), { cargos: 0, funcoes: 0, dotacoes: 0 });
  const novoQuadro = () => { prepararNovoQuadroComissionado(); navigate(`${BASE_PATH}/novo`); };
  const criarNovaVersao = (id: string) => { prepararNovaVersaoQuadroComissionado(id); navigate(`${BASE_PATH}/${id}/nova-versao`); };

  const columns: ColumnMetaSeplag<QuadroLista>[] = [
    { header: "Quadro", field: "codigo", sortable: true, body: (quadro) => <div className="prototype-comissionados-quadro-main"><strong>{quadro.codigo}</strong><small>Versão {quadro.versao ?? 1} — {quadro.nome}</small></div> },
    { header: "Órgão", field: "orgao", sortable: true },
    { header: "Cargos", field: "cargos", sortable: true, body: (quadro) => <strong>{quadro.cargos.toLocaleString("pt-BR")}</strong> },
    { header: "Funções", field: "funcoes", sortable: true, body: (quadro) => <strong>{quadro.funcoes.toLocaleString("pt-BR")}</strong> },
    { header: "Situação", field: "situacao", sortable: true, body: (quadro) => <SituacaoBadge situacao={quadro.situacao} /> },
  ];
  const renderHistoricoVersoes = (quadro: QuadroLista) => {
    const anteriores = versoesAnteriores(quadro);
    return <section className="prototype-quadro-version-history prototype-comissionados-historico"><header><strong>Versões anteriores</strong><span>{anteriores.length ? `${anteriores.length} versão(ões) registrada(s)` : "Nenhuma versão anterior registrada."}</span></header>{!!anteriores.length && <table className="prototype-quadro-version-table"><thead><tr><th>Versão</th><th>Vigência</th><th>Motivo do versionamento</th><th>Situação</th></tr></thead><tbody>{anteriores.map((versao) => <tr key={versao.id}><td>Versão {versao.versao ?? 1}</td><td>{versao.dataVigencia || "-"}</td><td>{versao.motivoVersionamento || "Cadastro inicial"}</td><td><SituacaoBadge situacao={versao.situacao} /></td></tr>)}</tbody></table>}</section>;
  };

  return <main className="prototype-quadro-page prototype-quadro-page-current prototype-comissionados-quadro-page">
    <header className="prototype-quadro-header"><div><h1>Quadro de Vagas Comissionados</h1><p>Estruturas organizacionais e dotações autorizadas por órgão.</p></div></header>
    <section className="prototype-quadro-kpis"><Kpi label="Quadros cadastrados" value={quadrosAtuais.length} icon="pi pi-file" /><Kpi label="Órgãos vinculados" value={orgaos.length} icon="pi pi-building" /><Kpi label="Cargos em comissão autorizados" value={totais.cargos} icon="pi pi-briefcase" /><Kpi label="Funções de confiança autorizadas" value={totais.funcoes} icon="pi pi-users" /><Kpi label="Dotações registradas" value={totais.dotacoes} icon="pi pi-sitemap" /></section>
    <section className="prototype-quadro-card">
      <div className="prototype-quadro-filters prototype-quadro-library-filters prototype-comissionados-quadro-filters">
        <div className="prototype-quadro-spec-control"><TextFieldSeplag name="busca" control={control} label="Quadro" cols="12" icon="pi pi-search" placeholder="Nome ou código do quadro" /></div>
        <div className="prototype-quadro-spec-control"><DropdownFieldSeplag name="orgao" control={control} label="Órgão" cols="12" options={orgaos.map((value) => ({ label: value, value }))} optionLabel="label" optionValue="value" placeholder="Todos" getFormErrorMessage={() => null} /></div>
        <div className="prototype-quadro-spec-control"><DropdownFieldSeplag name="situacao" control={control} label="Situação" cols="12" options={[{ label: "Ativo", value: "Ativo" }, { label: "Agendado", value: "Agendado" }]} optionLabel="label" optionValue="value" placeholder="Todas" getFormErrorMessage={() => null} /></div>
        <div className="prototype-quadro-spec-control"><BotaoLimparFiltroSeplag onClick={() => reset(filtrosIniciais)} /></div>
      </div>
      <div className="prototype-quadro-table-toolbar"><BotaoAdicionarSeplag label="Novo Quadro" onClick={novoQuadro} /></div>
      <div className="prototype-quadro-table prototype-quadro-library-table prototype-comissionados-quadro-table"><TablePaginadoSeplag<QuadroLista> dataKey="id" data={resultados(filtrados)} rows={10} rowsPerPage={[10, 20, 50]} lazy={false} selectionMode={null} columns={columns} expandedRows={linhasExpandidas} rowExpansionTemplate={renderHistoricoVersoes} hasEventoAcao actionHeader="Ações" renderBotoes={(quadro) => <span className="prototype-quadro-actions prototype-comissionados-quadro-actions"><BotaoIconSeplag icon="pi pi-eye" aria-label={`Visualizar ${quadro.nome}`} tooltip="Visualizar estrutura" onClick={() => setDetalhe(quadro)} />{quadro.situacao === "Ativo" && <BotaoIconSeplag icon="pi pi-plus" aria-label="Criar nova versão" tooltip="Criar nova versão" onClick={() => criarNovaVersao(quadro.id)} />}</span>} renderExpander={(quadro) => { const aberto = Boolean((linhasExpandidas as Record<string, boolean>)[quadro.id]); return <button type="button" className="prototype-quadro-expander" aria-label={aberto ? "Fechar versões anteriores" : "Abrir versões anteriores"} title={aberto ? "Fechar versões anteriores" : "Abrir versões anteriores"} onClick={() => setLinhasExpandidas((atual) => { const proximas = { ...(atual as Record<string, boolean>) }; if (aberto) delete proximas[quadro.id]; else proximas[quadro.id] = true; return proximas; })}><i className={aberto ? "pi pi-chevron-up" : "pi pi-chevron-down"} /></button>; }} handleOnPageChange={() => undefined} emptyMessage="Nenhum quadro comissionado encontrado." /></div>
    </section>
    {detalhe && <aside className="prototype-comissionados-quadro-detail" role="dialog" aria-label="Resumo do quadro"><header><div><span>QUADRO COMISSIONADO</span><h2>{detalhe.nome}</h2></div><BotaoIconSeplag icon="pi pi-times" aria-label="Fechar resumo" tooltip="Fechar" onClick={() => setDetalhe(null)} /></header><dl><div><dt>Órgão</dt><dd>{detalhe.orgao}</dd></div><div><dt>Versão</dt><dd>{detalhe.versao ?? 1}</dd></div><div><dt>Níveis</dt><dd>{detalhe.niveis.length}</dd></div><div><dt>Itens e subitens</dt><dd>{contarItens(detalhe.niveis)}</dd></div><div><dt>Cargos autorizados</dt><dd>{detalhe.cargos}</dd></div><div><dt>Funções autorizadas</dt><dd>{detalhe.funcoes}</dd></div></dl></aside>}
  </main>;
}
function SituacaoBadge({ situacao }: { situacao: SituacaoLista }) { return <BadgeSeplag label={situacao} color={situacao === "Ativo" ? "#00843d" : "#8a5a00"} bg={situacao === "Ativo" ? "#dff3e8" : "#fff4d6"} size="xs" />; }
function Kpi({ label, value, icon }: { label: string; value: number; icon: string }) { return <article><i className={icon} /><div><span>{label}</span><strong>{value.toLocaleString("pt-BR")}</strong></div></article>; }
function contarItens(niveis: QuadroComissionadoSalvo["niveis"]) { const contar = (itens: ItemEstruturaComissionadaSalvo[]): number => itens.reduce((total, item) => total + 1 + contar(item.subitens ?? []), 0); return niveis.reduce((total, nivel) => total + contar(nivel.itens ?? []), 0); }