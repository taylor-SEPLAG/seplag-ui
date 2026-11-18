import { useEffect, useMemo, useState } from "react";
import { BotaoIconSeplag, BotaoSeplag } from "../../componentes/Botao";
import { ModalSeplag } from "../../componentes/Modal";
import { listarCargosControleVagasComissionadas } from "./cargosComissionadosStore";
import { listarPerfisDgaControleVagasComissionadas } from "./perfisDgaStore";
import type { DotacaoComissionadaSalva, NivelComissionadoSalvo } from "./novoQuadroComissionadoStore";
import { lerEstruturaOrganizacional, obterUnidadesDaVersao, type UnidadeNoOrganograma } from "../estruturaOrganizacional/estruturaOrganizacionalStore";
import "./estruturaDotacoesComissionadas.css";

type Props = { orgao: string; dataVigencia: string; niveis: NivelComissionadoSalvo[]; onChange: (niveis: NivelComissionadoSalvo[]) => void; versaoId?: string; onVersaoChange: (id: string) => void };
const normalizar = (valor: string) => valor.replace(/^\s*\d+(?:\.\d+)*\.?\s*/, "").trim().toLocaleLowerCase("pt-BR");
const novaDotacao = (): DotacaoComissionadaSalva => ({ id: crypto.randomUUID(), perfil: "", simbologia: "", cargos: 0, funcoes: 0 });
const chaveData = (valor?: string) => {
  if (!valor) return 0;
  const partes = valor.includes("/") ? valor.split("/") : valor.split("-").reverse();
  const [dia, mes, ano] = partes.map(Number);
  return ano * 10_000 + mes * 100 + dia;
};

function extrairDotacoes(niveis: NivelComissionadoSalvo[], unidades: UnidadeNoOrganograma[]) {
  const porNome = new Map(unidades.map((unidade) => [normalizar(unidade.nome), unidade.id]));
  const resultado = new Map<number, DotacaoComissionadaSalva[]>();
  const visitar = (itens: NivelComissionadoSalvo["itens"]) => itens.forEach((item) => { const id = porNome.get(normalizar(item.nome)); if (id && item.dotacoes.length) resultado.set(id, structuredClone(item.dotacoes)); visitar(item.subitens); });
  niveis.forEach((nivel) => visitar(nivel.itens));
  return resultado;
}
function criarEstrutura(unidades: UnidadeNoOrganograma[], dotacoes: Map<number, DotacaoComissionadaSalva[]>) {
  const niveis = new Map<string, NivelComissionadoSalvo>();
  unidades.forEach((unidade) => {
    const nomeNivel = unidade.nivelOrganizacional || "Sem nível organizacional";
    if (!niveis.has(nomeNivel)) niveis.set(nomeNivel, { id: `nivel-${normalizar(nomeNivel).replaceAll(" ", "-")}`, nome: nomeNivel, itens: [] });
    niveis.get(nomeNivel)!.itens.push({ id: `unidade-${unidade.id}`, codigo: unidade.codigo, nome: unidade.nome, dotacoes: structuredClone(dotacoes.get(unidade.id) ?? []), subitens: [] });
  });
  return [...niveis.values()];
}

export function EstruturaDotacoesComissionadas({ orgao, dataVigencia, niveis, onChange, versaoId, onVersaoChange }: Props) {
  const estrutura = useMemo(lerEstruturaOrganizacional, []);
  const versoes = useMemo(() => {
    const competencia = chaveData(dataVigencia);
    return estrutura.versoes
      .filter((versao) => versao.orgao === orgao && versao.situacao === "VIGENTE")
      .filter((versao) => !competencia || (chaveData(versao.inicio) <= competencia && (!versao.fim || chaveData(versao.fim) >= competencia)))
      .sort((a, b) => chaveData(b.inicio) - chaveData(a.inicio));
  }, [estrutura, orgao, dataVigencia]);
  const versao = versoes.find((item) => item.id === versaoId) ?? versoes[0];
  useEffect(() => { if (versao && versao.id !== versaoId) onVersaoChange(versao.id); }, [onVersaoChange, versao, versaoId]);
  const unidades = useMemo(() => versao ? obterUnidadesDaVersao(estrutura, versao.id).filter((unidade) => unidade.situacao === "ATIVA") : [], [estrutura, versao]);
  const dotacoes = useMemo(() => extrairDotacoes(niveis, unidades), [niveis, unidades]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<UnidadeNoOrganograma | null>(null);
  const [dotacaoSelecionada, setDotacaoSelecionada] = useState<string | null>(null);
  const [rascunhoDotacao, setRascunhoDotacao] = useState<DotacaoComissionadaSalva | null>(null);
  const filhosDe = (superiorId: number | null) => unidades.filter((unidade) => unidade.superiorId === superiorId).sort((a, b) => a.ordem - b.ordem);
  const atualizar = (unidadeId: number, fn: (atuais: DotacaoComissionadaSalva[]) => DotacaoComissionadaSalva[]) => { const proximas = new Map(dotacoes); proximas.set(unidadeId, fn(proximas.get(unidadeId) ?? [])); onChange(criarEstrutura(unidades, proximas)); };
  const formulario = rascunhoDotacao;
  const fechar = () => { setUnidadeSelecionada(null); setDotacaoSelecionada(null); setRascunhoDotacao(null); };
  const salvar = () => { if (!unidadeSelecionada || !formulario?.simbologia || !formulario.perfil || (!formulario.cargos && !formulario.funcoes)) return; atualizar(unidadeSelecionada.id, (atuais) => dotacaoSelecionada ? atuais.map((item) => item.id === dotacaoSelecionada ? formulario : item) : [...atuais, formulario]); fechar(); };
  const alterarFormulario = (campo: keyof DotacaoComissionadaSalva, valor: string | number) => { if (!formulario) return; setRascunhoDotacao({ ...formulario, [campo]: valor }); };
  const abrir = (unidade: UnidadeNoOrganograma, dotacaoId: string | null = null) => { setUnidadeSelecionada(unidade); setDotacaoSelecionada(dotacaoId); setRascunhoDotacao(dotacaoId ? structuredClone((dotacoes.get(unidade.id) ?? []).find((dotacao) => dotacao.id === dotacaoId) ?? novaDotacao()) : novaDotacao()); };
  const cargos = listarCargosControleVagasComissionadas();
  const perfis = listarPerfisDgaControleVagasComissionadas();
  const alterarDotacao = (unidadeId: number, dotacaoId: string, campo: keyof DotacaoComissionadaSalva, valor: string | number) => atualizar(unidadeId, (atuais) => atuais.map((dotacao) => dotacao.id === dotacaoId ? { ...dotacao, [campo]: valor } : dotacao));
  const No = ({ unidade }: { unidade: UnidadeNoOrganograma }) => { const linhas = dotacoes.get(unidade.id) ?? []; const filhos = filhosDe(unidade.id); return <li className="ecd-unidade"><article><header><div><small>{unidade.codigo}</small><strong>{unidade.nome}</strong><span>{unidade.nivelOrganizacional}</span></div><BotaoSeplag type="button" className="ecd-adicionar-dotacao" label="Adicionar dotação" icon="pi pi-plus" iconPos="left" onClick={() => atualizar(unidade.id, (atuais) => [...atuais, novaDotacao()])} /></header>{!!linhas.length && <ul className="ecd-dotacoes">{linhas.map((dotacao) => <li className="ecd-dotacao-edicao" key={dotacao.id}><label><span>Cargo Comissionado</span><select value={dotacao.simbologia} onChange={(event) => alterarDotacao(unidade.id, dotacao.id, "simbologia", event.target.value)}><option value="">Selecione</option>{cargos.map((cargo) => <option key={cargo.id} value={cargo.codigo}>{cargo.codigo}</option>)}</select></label><label><span>Perfil Profissional</span><select value={dotacao.perfil} onChange={(event) => alterarDotacao(unidade.id, dotacao.id, "perfil", event.target.value)}><option value="">Selecione</option>{perfis.map((perfil) => <option key={perfil.id} value={perfil.nome}>{perfil.nome}</option>)}</select></label><label><span>Cargos</span><input type="number" min="0" value={dotacao.cargos} onChange={(event) => alterarDotacao(unidade.id, dotacao.id, "cargos", Math.max(0, Number(event.target.value)))} /></label><label><span>Funções</span><input type="number" min="0" value={dotacao.funcoes} onChange={(event) => alterarDotacao(unidade.id, dotacao.id, "funcoes", Math.max(0, Number(event.target.value)))} /></label><BotaoIconSeplag className="ecd-acao ecd-acao-excluir" icon="pi pi-trash" aria-label="Excluir dotação" tooltip="Excluir dotação" onClick={() => atualizar(unidade.id, (atuais) => atuais.filter((item) => item.id !== dotacao.id))} /></li>)}</ul>}</article>{!!filhos.length && <ul>{filhos.map((filho) => <No key={filho.id} unidade={filho} />)}</ul>}</li>; };

  if (!orgao || !dataVigencia) return <div className="ecd-empty"><i className="pi pi-info-circle" /><strong>Informe o órgão e a vigência</strong><span>A estrutura será carregada após o preenchimento das informações gerais.</span></div>;
  if (!versao) return <div className="ecd-empty"><i className="pi pi-exclamation-triangle" /><strong>Nenhuma estrutura vigente encontrada</strong><span>Publique a Estrutura Organizacional de {orgao} antes de distribuir as vagas.</span></div>;
  return <section className="ecd"><div className="ecd-contexto"><div><span>Estrutura vinculada</span><strong>{versao.nome}</strong><small>{versao.documentoLegal} · vigente desde {versao.inicio}</small></div>{versoes.length > 1 && <label>Versão estrutural<select value={versao.id} onChange={(event) => onVersaoChange(event.target.value)}>{versoes.map((item) => <option key={item.id} value={item.id}>{item.nome} — {item.inicio}</option>)}</select></label>}</div><p>Escolha uma unidade para distribuir os cargos comissionados e funções de confiança. A árvore é mantida pela Estrutura Organizacional.</p><ul className="ecd-arvore">{filhosDe(null).map((unidade) => <No key={unidade.id} unidade={unidade} />)}</ul><ModalSeplag visible={Boolean(unidadeSelecionada)} titulo={dotacaoSelecionada ? "Editar dotação comissionada" : "Adicionar dotação comissionada"} fechar={fechar} labelFechar="Cancelar" labelAcao="Salvar dotação" funcAcao={salvar} tamanho="min(42rem, 94vw)">{unidadeSelecionada && formulario && <div className="ecd-modal"><div className="ecd-modal-unidade"><span>Unidade</span><strong>{unidadeSelecionada.nome}</strong><small>{unidadeSelecionada.codigo} · {unidadeSelecionada.nivelOrganizacional}</small></div><label>Cargo Comissionado<select value={formulario.simbologia} onChange={(event) => alterarFormulario("simbologia", event.target.value)}><option value="">Selecione</option>{cargos.map((cargo) => <option key={cargo.id} value={cargo.codigo}>{cargo.codigo}</option>)}</select></label><label>Perfil Profissional<select value={formulario.perfil} onChange={(event) => alterarFormulario("perfil", event.target.value)}><option value="">Selecione</option>{perfis.map((perfil) => <option key={perfil.id} value={perfil.nome}>{perfil.nome}</option>)}</select></label><label>Cargos<input type="number" min="0" value={formulario.cargos} onChange={(event) => alterarFormulario("cargos", Math.max(0, Number(event.target.value)))} /></label><label>Funções<input type="number" min="0" value={formulario.funcoes} onChange={(event) => alterarFormulario("funcoes", Math.max(0, Number(event.target.value)))} /></label><small>O resumo atualiza os Limites DGA após o salvamento da dotação.</small></div>}</ModalSeplag></section>;
}
