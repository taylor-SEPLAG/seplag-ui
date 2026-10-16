import { Fragment, useState, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { CardSeplag } from "../../componentes/Card";
import { ModalSeplag } from "../../componentes/Modal";
import { BotaoSeplag, BotaoVoltarSeplag } from "../../componentes/Botao";
import { VinculoAmbiente, AtalhoPerfisVinculos } from './VinculoAmbiente';
import { VinculoExclusaoDialog } from './VinculoExclusaoDialog';
import { VinculoAuditoria } from './VinculoAuditoria';
import { useUsuarioVinculos } from './vinculoSessao';
import { useAtualizacaoVinculos } from './vinculoPersistencia';
import { prepararEdicaoVinculo, confirmarEdicaoVinculo } from './vinculoAdministracao';
import "./vinculoV2.css";
import { filtrarVinculos, filtrosDaUrl, situacaoDoVinculo } from "./vinculosConsulta";
import { TIPOS_VINCULO as TIPOS } from "./tiposVinculo";
export { TIPOS_VINCULO as TIPOS } from "./tiposVinculo";

import { BASE, STORAGE, TIPOS_FIM_EXERCICIO, moduloDeOrigem, ORGAOS, SETORES, emptyCampos, PESSOAS, configTipo, opcoesCargo, salvos, todos, type Tipo, type Situacao, type Pessoa, type Campos, type Vinculo } from './vinculoDados';
export { todos, type Vinculo } from './vinculoDados';
function SituacaoTag({ situacao }: { situacao: Situacao }) {
  return <span className={`v2v-status v2v-status-${situacao.toLowerCase()}`}>{situacao}</span>;
}
const gerarId = () => `v2-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const normalizar = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
const digitosCpf = (value: string) => value.replace(/\D/g, "").slice(0, 11);
function mascararCpf(value: string) {
  const digitos = digitosCpf(value);
  const partes = [digitos.slice(0, 3), digitos.slice(3, 6), digitos.slice(6, 9)].filter(Boolean);
  return partes.join(".") + (digitos.length > 9 ? `-${digitos.slice(9)}` : "");
}
const dataBr = (value: string) => value ? value.split("-").reverse().join("/") : "—";
const comOpcaoAtual = (opcoes: string[], atual: string) => atual && !opcoes.includes(atual) ? [atual,...opcoes] : opcoes;

type PaginacaoV2Props = { nome: string; pagina: number; totalPaginas: number; porPagina: number; mudarPagina: (pagina: number) => void; mudarPorPagina: (quantidade: number) => void };
export function PaginacaoV2({ nome, pagina, totalPaginas, porPagina, mudarPagina, mudarPorPagina }: PaginacaoV2Props) {
  return <nav className="v2v-pagination" aria-label={`Paginação de ${nome}`}>
    <button type="button" aria-label={`Primeira página de ${nome}`} disabled={pagina === 1} onClick={() => mudarPagina(1)}><i className="pi pi-angle-double-left" aria-hidden="true" /></button>
    <button type="button" aria-label={`Página anterior de ${nome}`} disabled={pagina === 1} onClick={() => mudarPagina(pagina - 1)}><i className="pi pi-angle-left" aria-hidden="true" /></button>
    {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((numero) => <button type="button" key={numero} className={numero === pagina ? "is-current" : ""} aria-label={`Página ${numero} de ${nome}`} aria-current={numero === pagina ? "page" : undefined} onClick={() => mudarPagina(numero)}>{numero}</button>)}
    <button type="button" aria-label={`Próxima página de ${nome}`} disabled={pagina === totalPaginas} onClick={() => mudarPagina(pagina + 1)}><i className="pi pi-angle-right" aria-hidden="true" /></button>
    <button type="button" aria-label={`Última página de ${nome}`} disabled={pagina === totalPaginas} onClick={() => mudarPagina(totalPaginas)}><i className="pi pi-angle-double-right" aria-hidden="true" /></button>
    <select aria-label={`Registros por página de ${nome}`} value={porPagina} onChange={(event) => mudarPorPagina(Number(event.target.value))}>{[10, 20, 50].map((opcao) => <option key={opcao} value={opcao}>{opcao}</option>)}</select>
  </nav>;
}
function layout(title: string, action: React.ReactNode, children: React.ReactNode, situacao?: Situacao) {
  return <VinculoAmbiente>
    <main className="prototype-page-content prototype-page-content--white v2v-shell">
      <CardSeplag
        title={situacao ? <span className="v2v-title-status">{title}<SituacaoTag situacao={situacao} /></span> : title}
        cols="12"
        cardHeaderClassNames="prototype-carreira-card v2v-card"
        headerNavigation={<BreadcrumbSeplag divided items={[{ label: "Cadastro" }, { label: "Vínculos Funcionais" }, { label: "Vínculo", to: BASE }, ...(title === "Gestão de Vínculos" ? [] : [{ label: title }])]} />}
      >
        <div className="v2v-page">
          {title !== "Cadastrar Vínculo" && <AtalhoPerfisVinculos />}
          {title === "Gestão de Vínculos" && <p className="v2v-description">Consulte os vínculos cadastrados e a situação de cada servidor por tipo de vínculo.</p>}
          {action && <div className="v2v-toolbar">{action}</div>}
          {children}
        </div>
      </CardSeplag>
    </main>
  </VinculoAmbiente>;
}
export function VinculoV2ConsultaPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const usuario = useUsuarioVinculos();
  useAtualizacaoVinculos();
  const registros = todos();
  const [exclusao,setExclusao] = useState<Vinculo | null>(null);
  const [mensagem,setMensagem] = useState('');
  const solicitarExclusao = (v: Vinculo) => setExclusao(v);
  const [filtros, setFiltros] = useState({ tipo: params.get("tipo") ?? "" });
  const [expandido, setExpandido] = useState<string | null>(params.get("expand"));
  const [porPaginaTipos, setPorPaginaTipos] = useState(10);
  const [paginaTipos, setPaginaTipos] = useState(() => { const indice = TIPOS.findIndex((tipo) => tipo === params.get("expand")); return indice < 0 ? 1 : Math.floor(indice / 10) + 1; });
  const [porPaginaServidores, setPorPaginaServidores] = useState(10);
  const [paginaServidores, setPaginaServidores] = useState(1);
  const [filtrosServidores, setFiltrosServidores] = useState<Record<string, { busca: string; matricula: string }>>({});
  const atualizarFiltroServidor = (tipo: Tipo, campo: "busca" | "matricula", valor: string) => {
    setFiltrosServidores((atual) => ({
      ...atual,
      [tipo]: { busca: "", matricula: "", ...atual[tipo], [campo]: valor },
    }));
    setPaginaServidores(1);
  };
  const atualizarFiltro = (campo: keyof typeof filtros, valor: string) => { setFiltros((atual) => ({ ...atual, [campo]: valor })); setPaginaTipos(1); setPaginaServidores(1); };
  const ativos = registros.filter((v) => situacaoDoVinculo(v) === "Ativo");
  const encerrados = registros.filter((v) => situacaoDoVinculo(v) === "Encerrado");
  const contexto = { ...filtrosDaUrl(params), tipo: filtros.tipo };
  const filtrados = filtrarVinculos(registros, contexto);
  const contextoAtivo = Boolean(contexto.orgao || contexto.situacao);
  const abrirDetalhes = (v: Vinculo) => {
    const consulta = new URLSearchParams(params);
    consulta.set("tipo", v.tipo);
    navigate(`${BASE}/${v.id}?${consulta}`);
  };
  const tiposVisiveis = TIPOS.filter((tipo) => !filtros.tipo || filtros.tipo === tipo);
  const totalPaginasTipos = Math.max(1, Math.ceil(tiposVisiveis.length / porPaginaTipos));
  const paginaTiposAtual = Math.min(paginaTipos, totalPaginasTipos);
  const tiposPaginados = tiposVisiveis.slice((paginaTiposAtual - 1) * porPaginaTipos, paginaTiposAtual * porPaginaTipos);
  return layout("Gestão de Vínculos", null, <>
    {mensagem && <p className="v2v-notice" role="status">{mensagem}</p>}
    <section className="v2v-kpis v2v-kpis-situacao" aria-label="Indicadores de vínculos">
      <article className="v2v-kpi-active"><i className="pi pi-check-circle" aria-hidden="true" /><div><span>Vínculos Ativos</span><strong>{ativos.length}</strong></div></article>
      <article className="v2v-kpi-closed"><i className="pi pi-times-circle" aria-hidden="true" /><div><span>Vínculos Encerrados</span><strong>{encerrados.length}</strong></div></article>
    </section>
    {contextoAtivo && <p className="v2v-description" aria-label="Contexto da consulta">Consulta filtrada pelo dashboard: {[contexto.orgao, contexto.situacao, contexto.forma, contexto.inicio && `Vacância a partir de ${dataBr(contexto.inicio)}`, contexto.fim && `Vacância até ${dataBr(contexto.fim)}`].filter(Boolean).join(" · ")}</p>}
    <section className="v2v-panel v2v-filters v2v-type-filters" aria-label="Filtros de consulta">
      <label>Tipo de Vínculo<select value={filtros.tipo} onChange={(e) => atualizarFiltro("tipo", e.target.value)}><option value="">Todos</option>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></label>
      <div className="v2v-filter-actions"><button className="v2v-primary" type="button" onClick={() => { setFiltros({ tipo: "" }); setParams({}); setPaginaTipos(1); setPaginaServidores(1); }}><i className="pi pi-refresh" aria-hidden="true" />Limpar filtro</button></div>
    </section>    <section className="v2v-panel" aria-label="Tipos de vínculo"><div className="v2v-table-wrap"><table className="v2v-table"><thead><tr><th>Código</th><th>Tipo de Vínculo</th><th>Quantidade de Vínculos</th><th>Ação</th></tr></thead><tbody>
      {tiposPaginados.map((tipo) => { const idx = TIPOS.indexOf(tipo); const linhasTipo = filtrados.filter((v) => v.tipo === tipo);
 const filtroServidor = filtrosServidores[tipo] ?? { busca: "", matricula: "" };
 const cpfConsulta = filtroServidor.busca.replace(/\D/g, "");
 const linhas = linhasTipo.filter((v) =>
   (!filtroServidor.busca.trim() || normalizar(v.nome).includes(normalizar(filtroServidor.busca.trim())) || (cpfConsulta.length > 0 && digitosCpf(v.cpf).includes(cpfConsulta))) &&
   (!filtroServidor.matricula.trim() || v.matricula.includes(filtroServidor.matricula.trim()))
 ); const aberto = expandido === tipo; const totalPaginas = Math.max(1, Math.ceil(linhas.length / porPaginaServidores)); const paginaAtual = Math.min(paginaServidores, totalPaginas); return <Fragment key={tipo}><tr><td>{idx + 1}</td><td><strong>{tipo}</strong></td><td>{linhasTipo.length}</td><td><button type="button" className="v2v-icon-action" aria-label={aberto ? "Recolher" : "Visualizar"} title={aberto ? "Recolher" : "Visualizar"} aria-expanded={aberto} onClick={() => { setExpandido(aberto ? null : tipo); setPaginaServidores(1); }}><i className={`pi ${aberto ? "pi-chevron-up" : "pi-chevron-down"}`} aria-hidden="true" /></button></td></tr>
        {aberto && <tr className="v2v-expanded-row"><td colSpan={4}><div className="v2v-expanded">{moduloDeOrigem(tipo) && <div className="v2v-origin-notice" role="note"><i className="pi pi-info-circle" aria-hidden="true" /><div><strong>O cadastro desse Vínculo ocorre pelo módulo de {moduloDeOrigem(tipo)}. Não é permitido cadastrá-lo manualmente nesta tela.</strong><span>{tipo === "Aposentado" ? "Os vínculos de aposentados são gerados automaticamente durante a conclusão do processo de aposentadoria." : "Os vínculos ativos são gerados automaticamente durante a conclusão do processo de ingresso."}</span></div></div>}<div className="v2v-expanded-head"><div><strong>Servidores com Vínculo</strong><span>{linhas.length} vínculo(s) neste tipo</span></div>{!moduloDeOrigem(tipo) && <button type="button" className="v2v-primary" onClick={() => navigate(`${BASE}/novo?tipo=${encodeURIComponent(tipo)}`)}><i className="pi pi-plus" />Cadastrar Vínculo</button>}</div><section className="v2v-panel v2v-filters" aria-label={`Filtros de servidores de ${tipo}`}>
  <label>Nome ou CPF<input value={filtroServidor.busca} placeholder="Buscar por nome ou CPF" onChange={(e) => atualizarFiltroServidor(tipo, "busca", e.target.value)} /></label>
  <label>Matrícula<input value={filtroServidor.matricula} placeholder="Buscar por matrícula" onChange={(e) => atualizarFiltroServidor(tipo, "matricula", e.target.value)} /></label>
  <div className="v2v-filter-actions"><button type="button" className="v2v-primary" onClick={() => { setFiltrosServidores((atual) => ({ ...atual, [tipo]: { busca: "", matricula: "" } })); setPaginaServidores(1); }}><i className="pi pi-refresh" aria-hidden="true" />Limpar filtro</button></div>
</section><div className="v2v-table-wrap"><table className="v2v-table v2v-inner-table"><thead><tr><th>Matrícula</th><th>Nº do Vínculo</th><th>Servidor</th><th>CPF</th><th>Lotação</th><th>Cargo/Função</th><th>Data de Início</th>{TIPOS_FIM_EXERCICIO.has(tipo) && <th>Data de Fim do Exercício</th>}<th>Situação</th><th>Ação</th></tr></thead><tbody>{linhas.slice((paginaAtual - 1) * porPaginaServidores, paginaAtual * porPaginaServidores).map((v) => <tr key={v.id}><td>{v.matricula}</td><td>{v.numero}</td><td>{v.nome}</td><td>{v.cpf}</td><td>{v.setor || "—"}</td><td>{v.cargo}</td><td>{dataBr(v.inicio)}</td>{TIPOS_FIM_EXERCICIO.has(tipo) && <td>{v.termino ? dataBr(v.termino) : "—"}</td>}<td><SituacaoTag situacao={situacaoDoVinculo(v)} /></td><td><div className="v2v-row-actions"><button type="button" className="v2v-icon-action" aria-label="Ver detalhes" title="Visualizar" onClick={() => abrirDetalhes(v)}><i className="pi pi-eye" aria-hidden="true" /></button>{usuario?.editar && <button type="button" className="v2v-icon-action v2v-action-edit" aria-label="Editar" title="Editar" onClick={() => navigate(`${BASE}/${v.id}/editar?tipo=${encodeURIComponent(v.tipo)}`)}><i className="pi pi-pencil" aria-hidden="true" /></button>}{usuario?.excluir && <button type="button" className="v2v-icon-action v2v-action-delete" aria-label="Excluir" title="Excluir" onClick={() => solicitarExclusao(v)}><i className="pi pi-trash" aria-hidden="true" /></button>}</div></td></tr>)}{linhas.length === 0 && <tr><td colSpan={TIPOS_FIM_EXERCICIO.has(tipo) ? 10 : 9} className="v2v-empty">Nenhum vínculo encontrado para os filtros informados.</td></tr>}</tbody></table></div><PaginacaoV2 nome="servidores" pagina={paginaAtual} totalPaginas={totalPaginas} porPagina={porPaginaServidores} mudarPagina={setPaginaServidores} mudarPorPagina={(quantidade) => { setPorPaginaServidores(quantidade); setPaginaServidores(1); }} /></div></td></tr>}</Fragment>; })}
      {tiposVisiveis.length === 0 && <tr><td colSpan={4} className="v2v-empty">Nenhum vínculo encontrado para os filtros informados.</td></tr>}
    </tbody></table></div><PaginacaoV2 nome="tipos de vínculo" pagina={paginaTiposAtual} totalPaginas={totalPaginasTipos} porPagina={porPaginaTipos} mudarPagina={(numero) => { setPaginaTipos(numero); setExpandido(null); setPaginaServidores(1); }} mudarPorPagina={(quantidade) => { setPorPaginaTipos(quantidade); setPaginaTipos(1); setExpandido(null); }} /></section>
    {exclusao && <VinculoExclusaoDialog key={exclusao.id} vinculo={exclusao} fechar={() => setExclusao(null)} concluido={() => {setExclusao(null);setMensagem('Vínculo excluído com sucesso. Auditoria preservada.');}} />}
  </>);
}

export function VinculoV2CadastroPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [params] = useSearchParams();
  const usuario = useUsuarioVinculos();
  const [confirmacao,setConfirmacao] = useState<ReturnType<typeof prepararEdicaoVinculo> | null>(null);
  const [justificativa,setJustificativa] = useState('');
  const [autorizacao,setAutorizacao] = useState('');
  const [existente] = useState(() => id ? todos().find((v) => v.id === id) : undefined);
  const tipoInicial = existente?.tipo ?? TIPOS.find((t) => t === params.get("tipo")) ?? TIPOS[0];
  const tipo = tipoInicial;
  const config = configTipo(tipo);
  const opcoes = opcoesCargo(config, existente?.cargo ?? config.cargos[0] ?? "");
  const [cpf, setCpf] = useState(existente?.cpf ?? "");
  const [pessoa, setPessoa] = useState<Pessoa | null>(existente ?? null);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(-1);
  const [campos, setCampos] = useState<Campos>(() => ({
    ...emptyCampos,
    regime: existente?.regime ?? config.regimes[0] ?? "",
    carreira: existente?.carreira ?? config.carreiras[0] ?? "",
    cargo: existente?.cargo ?? config.cargos[0] ?? "",
    perfil: existente?.perfil ?? opcoes.perfis[0] ?? "",
    jornada: existente?.jornada ?? opcoes.jornadas[0] ?? "",
    matricula: existente?.matricula ?? "",
    orgao: existente?.orgao ?? "",
    setor: existente?.setor ?? "",
    inicio: existente?.inicio ?? "",
    termino: existente?.termino ?? "",
    vacanciaData: existente?.vacanciaData ?? "",
    vacanciaForma: existente?.vacanciaForma ?? "",
    observacao: existente?.observacao ?? "",
  }));
  const [erro, setErro] = useState("");
  const [cadastrado, setCadastrado] = useState<Vinculo | null>(null);
  const [registros] = useState(todos);
  const candidatos: Pessoa[] = [...new Map([...registros, ...PESSOAS].map((registro) => [digitosCpf(registro.cpf), { nome: registro.nome, cpf: registro.cpf, nascimento: registro.nascimento, matricula: registro.matricula }])).values()];
  const consultaCpf = digitosCpf(cpf);
  const sugestoes = consultaCpf.length >= 3 ? candidatos.filter((candidato) => digitosCpf(candidato.cpf).includes(consultaCpf)) : candidatos;
  const situacao = situacaoDoVinculo(campos);
  const opcoesAtuais = opcoesCargo(config, campos.cargo);
  const atualizar = (campo: keyof Campos, valor: string) => setCampos((atual) => ({ ...atual, [campo]: valor }));
  const voltar = () => navigate(existente ? `${BASE}/${existente.id}?tipo=${encodeURIComponent(existente.tipo)}` : `${BASE}?expand=${encodeURIComponent(tipo)}`);
  const matriculaDaPessoa = (selecionada: Pessoa, atuais: Vinculo[]) => {
    const vinculada = atuais.find((v) => digitosCpf(v.cpf) === digitosCpf(selecionada.cpf) && v.matricula.trim());
    if (vinculada) return vinculada.matricula;
    if (selecionada.matricula.trim()) return selecionada.matricula;
    const existentes = [...atuais, ...PESSOAS].map((v) => Number(v.matricula)).filter(Number.isFinite);
    return String(Math.max(0, ...existentes) + 1);
  };
  const preencherCpf = (valor: string) => {
    const cpfFormatado = mascararCpf(valor);
    const correspondente = digitosCpf(cpfFormatado).length === 11
      ? candidatos.find((candidato) => digitosCpf(candidato.cpf) === digitosCpf(cpfFormatado))
      : undefined;
    setCpf(cpfFormatado);
    setPessoa(correspondente ?? null);
    setMostrarSugestoes(true);
    setIndiceAtivo(-1);
    setErro("");
  };
  const selecionarPessoa = (selecionada: Pessoa) => {
    setCpf(selecionada.cpf);
    setPessoa(selecionada);
    setMostrarSugestoes(false);
    setIndiceAtivo(-1);
    setErro("");
  };
  const salvar = (evento: FormEvent) => {
    evento.preventDefault();
    if (cadastrado) return;
    setErro("");
    if (existente) {
      try {setConfirmacao(prepararEdicaoVinculo(existente.id,campos,autorizacao));setJustificativa('');}
      catch (e) {setErro((e as Error).message);}
      return;
    }
    if (!existente && moduloDeOrigem(tipo)) { setErro(`Este Tipo de Vínculo é gerado pelo módulo de ${moduloDeOrigem(tipo)} e não permite cadastro manual.`); return; }
    if (!pessoa) { setErro("Selecione um CPF da lista antes de salvar."); return; }
    if (!campos.regime || !campos.cargo || !campos.perfil || !campos.jornada || !campos.orgao || !campos.setor || !campos.inicio) {
      setErro("Preencha todos os campos obrigatórios do vínculo."); return;
    }
    if (Boolean(campos.vacanciaData) !== Boolean(campos.vacanciaForma)) {
      setErro("Informe a Data de Encerramento e as Formas de Encerramento juntas."); return;
    }
    if (campos.vacanciaData && campos.vacanciaData < campos.inicio) {
      setErro("A Data de Encerramento não pode ser anterior ao início do exercício."); return;
    }
    if (TIPOS_FIM_EXERCICIO.has(tipo) && campos.termino && campos.termino < campos.inicio) {
      setErro("A Data de Fim do Exercício não pode ser anterior ao início do exercício."); return;
    }
    try {
    const atuais = todos();
    const novo: Vinculo = {
      ...existente,
      id: existente?.id ?? gerarId(), tipo, ...pessoa, ...campos,
      matricula: existente?.matricula || matriculaDaPessoa(pessoa, atuais),
      numero: existente?.numero || String(Math.max(0, ...atuais.filter((v) => digitosCpf(v.cpf) === digitosCpf(pessoa.cpf)).map((v) => Number(v.numero) || 0)) + 1),
      situacao,
    };
    if (!existente) novo.criacao = {
      titulo: "Vínculo cadastrado", responsavel: "Roberto Junior", registradoEm: new Date().toISOString(),
      dados: { "Tipo de Vínculo": tipo, "Matrícula gerada": novo.matricula, "Nº do Vínculo": novo.numero,
        "Data de Início do Exercício": novo.inicio, "Órgão/Entidade": novo.orgao, "Lotação": novo.setor,
        "Cargo": novo.cargo, "Perfil Profissional": novo.perfil, "Jornada": novo.jornada },
    };
    localStorage.setItem(STORAGE, JSON.stringify([...salvos().filter((v) => v.id !== novo.id), novo]));
    if (existente) navigate(`${BASE}/${novo.id}?tipo=${encodeURIComponent(tipo)}`);
    else setCadastrado(novo);
    } catch {
      setErro("Não foi possível cadastrar o vínculo. Nenhum identificador foi confirmado. Tente novamente.");
    }
  };
  if (id && !existente) return layout("Editar Vínculo", null, <div className="v2v-notice">Vínculo não encontrado.</div>);
  if (existente && !usuario?.editar) return layout("Editar Vínculo", null, <div className="v2v-error" role="alert">Seu perfil não possui permissão para editar vínculos.</div>);
  if (!existente && moduloDeOrigem(tipoInicial)) return layout("Cadastrar Vínculo", null,
    <div className="v2v-origin-notice" role="alert"><i className="pi pi-info-circle" aria-hidden="true" /><strong>Este Tipo de Vínculo é gerado pelo módulo de {moduloDeOrigem(tipoInicial)} e não permite cadastro manual.</strong></div>);
  return layout(existente ? "Editar Vínculo" : "Cadastrar Vínculo", null, <form onSubmit={salvar} className="v2v-form">
    <section className="v2v-panel v2v-form-section v2v-server-section" aria-labelledby="v2v-servidor-title">
      <header className="v2v-section-header"><i className="pi pi-user" aria-hidden="true" /><div><h2 id="v2v-servidor-title">Dados do Servidor</h2><p>Identifique o servidor e o tipo de vínculo.</p></div></header>
      <div className="v2v-section-body v2v-form-grid v2v-grid-three">
        <label>CPF <em>*</em><span className="v2v-cpf-dropdown">
          <input role="combobox" aria-autocomplete="list" aria-haspopup="listbox" aria-expanded={mostrarSugestoes && sugestoes.length > 0} aria-controls="v2v-cpf-options" aria-activedescendant={indiceAtivo >= 0 && mostrarSugestoes ? `v2v-cpf-option-${indiceAtivo}` : undefined} value={cpf} readOnly={Boolean(existente)} onChange={(e) => preencherCpf(e.target.value)} onFocus={() => { if (!existente) setMostrarSugestoes(true); }} onClick={() => { if (!existente) setMostrarSugestoes(true); }} onBlur={() => setMostrarSugestoes(false)} onKeyDown={(e) => { if (e.key === "ArrowDown" && sugestoes.length) { e.preventDefault(); setMostrarSugestoes(true); setIndiceAtivo((indice) => (indice + 1) % sugestoes.length); } else if (e.key === "ArrowUp" && sugestoes.length) { e.preventDefault(); setIndiceAtivo((indice) => indice <= 0 ? sugestoes.length - 1 : indice - 1); } else if (e.key === "Enter" && mostrarSugestoes && sugestoes.length) { e.preventDefault(); selecionarPessoa(sugestoes[indiceAtivo >= 0 ? indiceAtivo : 0]); } else if (e.key === "Escape") { setMostrarSugestoes(false); setIndiceAtivo(-1); } }} placeholder="000.000.000-00" inputMode="numeric" autoComplete="off" maxLength={14} />
          <i className="pi pi-chevron-down" aria-hidden="true" />
          {mostrarSugestoes && sugestoes.length > 0 && <ul id="v2v-cpf-options" role="listbox">{sugestoes.map((candidato, indice) => <li key={candidato.cpf} id={`v2v-cpf-option-${indice}`} role="option" aria-selected={indice === indiceAtivo} tabIndex={-1} onMouseDown={(e) => e.preventDefault()} onClick={() => selecionarPessoa(candidato)} onKeyDown={(e) => { if (e.key === "Enter") selecionarPessoa(candidato); }}>{candidato.cpf} — {candidato.nome}</li>)}</ul>}
        </span></label>
        <label>Nome <em>*</em><input value={pessoa?.nome ?? ""} readOnly placeholder="Nome da Pessoa Física" /></label>
        <label>Tipo de Vínculo <em>*</em><select value={tipo} disabled><option>{tipo}</option></select></label>
      </div>
      {mostrarSugestoes && consultaCpf.length >= 3 && sugestoes.length === 0 && <div className="v2v-notice"><i className="pi pi-info-circle" aria-hidden="true" />CPF não encontrado no cadastro de Pessoa Física. <button type="button" className="v2v-link" onClick={() => navigate(`/prototipos/sigep/pessoa-fisica/novo?cpf=${encodeURIComponent(cpf)}`)}>Cadastrar Pessoa Física</button></div>}
    </section>
    {existente && <section className="v2v-panel v2v-form-section" aria-labelledby="v2v-vinculo-title">
      <header className="v2v-section-header"><i className="pi pi-id-card" aria-hidden="true" /><div><h2 id="v2v-vinculo-title">Dados do Vínculo</h2><p>A matrícula e o número do vínculo são preenchidos automaticamente conforme o CPF.</p></div></header>
      <div className="v2v-section-body v2v-form-grid v2v-grid-two">
        <label>Matrícula <em>*</em><input value={campos.matricula} readOnly /></label>
        <label>Nº do Vínculo <em>*</em><input value={existente.numero} readOnly /></label>
        <label>Classificação do Vínculo<input value={['Aposentado','Beneficiário de Aposentado','Pensão Especial'].includes(tipo) ? 'Não Funcional' : 'Funcional'} readOnly /></label>
        <label>Situação do Vínculo<input value={situacaoDoVinculo(existente) === 'Ativo' ? 'Vigente' : 'Encerrado'} readOnly /></label>
      </div>
    </section>}
    <section className="v2v-panel v2v-form-section" aria-labelledby="v2v-caracteristicas-title">
      <header className="v2v-section-header"><i className="pi pi-briefcase" aria-hidden="true" /><div><h2 id="v2v-caracteristicas-title">Características do Vínculo</h2><p>Informe as características funcionais e a vigência do vínculo.</p></div></header>
      <div className="v2v-section-body v2v-form-grid v2v-grid-four">
        <label>Regime Jurídico <em>*</em><select value={campos.regime} onChange={(e) => atualizar("regime", e.target.value)}>{comOpcaoAtual(config.regimes,campos.regime).map((opcao) => <option key={opcao}>{opcao}</option>)}</select></label>
        <label>Carreira<select value={campos.carreira} disabled={!config.carreiras.length} onChange={(e) => atualizar("carreira", e.target.value)}><option value="">{config.carreiras.length ? "Selecione..." : "Não se aplica"}</option>{comOpcaoAtual(config.carreiras,campos.carreira).map((opcao) => <option key={opcao}>{opcao}</option>)}</select></label>
        <label>Cargo <em>*</em><select value={campos.cargo} onChange={(e) => { const proximas = opcoesCargo(config, e.target.value); setCampos((atual) => ({ ...atual, cargo: e.target.value, perfil: proximas.perfis[0] ?? "", jornada: proximas.jornadas[0] ?? "" })); }}>{comOpcaoAtual(config.cargos,campos.cargo).map((opcao) => <option key={opcao}>{opcao}</option>)}</select></label>
        <label>Perfil Profissional <em>*</em><select value={campos.perfil} onChange={(e) => atualizar("perfil", e.target.value)}>{comOpcaoAtual(opcoesAtuais.perfis,campos.perfil).map((opcao) => <option key={opcao}>{opcao}</option>)}</select></label>
        <label>Jornada de Trabalho <em>*</em><select value={campos.jornada} onChange={(e) => atualizar("jornada", e.target.value)}>{comOpcaoAtual(opcoesAtuais.jornadas,campos.jornada).map((opcao) => <option key={opcao}>{opcao}</option>)}</select></label>
        <label>Órgão/Entidade <em>*</em><select value={campos.orgao} onChange={(e) => setCampos((atual) => ({ ...atual, orgao: e.target.value, setor: "" }))}><option value="">Selecione...</option>{comOpcaoAtual(ORGAOS,campos.orgao).map((orgao) => <option key={orgao} value={orgao}>{orgao}</option>)}</select></label>
        <label>Lotação <em>*</em><select value={campos.setor} disabled={!campos.orgao} onChange={(e) => atualizar("setor", e.target.value)}><option value="">Selecione...</option>{comOpcaoAtual(SETORES[campos.orgao] ?? [],campos.setor).map((setor) => <option key={setor} value={setor}>{setor}</option>)}</select></label>
        <label>Data de Início do Exercício <em>*</em><input type="date" value={campos.inicio} onChange={(e) => atualizar("inicio", e.target.value)} /></label>
        {TIPOS_FIM_EXERCICIO.has(tipo) && <label>Data de Fim do Exercício<input type="date" min={campos.inicio || undefined} value={campos.termino} onChange={(e) => atualizar("termino", e.target.value)} /></label>}
        <div className="v2v-status-field"><span>Situação do Vínculo</span><div><SituacaoTag situacao={situacao} /><small>Calculada automaticamente</small></div></div>
        <label>Data de Encerramento{campos.vacanciaForma && <em>*</em>}<input type="date" value={campos.vacanciaData} readOnly={Boolean(existente)} onChange={(e) => {if (!existente) atualizar("vacanciaData", e.target.value);}} /></label>
        <label>Formas de Encerramento{campos.vacanciaData && <em>*</em>}<select value={campos.vacanciaForma} disabled={Boolean(existente)} onChange={(e) => {if (!existente) atualizar("vacanciaForma", e.target.value);}}><option value="">Selecione...</option><option>Exoneração</option><option>Término de contrato</option><option>Aposentadoria</option><option>Falecimento</option></select></label>
        {existente && campos.termino !== existente.termino && <label>Autorização da prorrogação <em>*</em><input value={autorizacao} onChange={e => setAutorizacao(e.target.value)} placeholder="Referência do ato ou processo autorizador" /></label>}
      </div>
    </section>
    <section className="v2v-panel v2v-form-section" aria-labelledby="v2v-observacao-title">
      <header className="v2v-section-header"><i className="pi pi-file-edit" aria-hidden="true" /><div><h2 id="v2v-observacao-title">Observação</h2><p>Registre informações complementares sobre o vínculo.</p></div></header>
      <div className="v2v-section-body"><label>Observação<textarea value={campos.observacao} maxLength={500} placeholder="Registre uma observação, se necessário." onChange={(e) => atualizar("observacao", e.target.value)} /></label><small className="v2v-character-count">{campos.observacao.length}/500</small></div>
    </section>
    {erro && <div className="v2v-error" role="alert">{erro}</div>}
    <div className="v2v-form-actions"><button type="button" className="v2v-secondary" onClick={voltar}>{existente ? "Voltar" : "Cancelar"}</button><button type="submit" className="v2v-primary" disabled={!pessoa || Boolean(cadastrado)}><i className="pi pi-check" aria-hidden="true" />{existente ? "Salvar" : "Cadastrar Vínculo"}</button></div>
    <ModalSeplag visible={Boolean(confirmacao)} titulo="Confirmar Alterações do Vínculo" fechar={() => setConfirmacao(null)} hideFooter tamanho="750px">
      {confirmacao && <><p>Confira os campos alterados antes de confirmar.</p><div className="v2v-table-wrap"><table className="v2v-table"><thead><tr><th>Campo Alterado</th><th>Valor Anterior</th><th>Novo Valor</th></tr></thead><tbody>{confirmacao.mudancas.map(m => <tr key={m.campo}><td>{m.rotulo}</td><td>{m.anterior || '—'}</td><td>{m.novo || '—'}</td></tr>)}</tbody></table></div><label className="v2v-justificativa">Justificativa da Alteração<textarea value={justificativa} onChange={e => setJustificativa(e.target.value)} required /></label>{erro && <p role="alert">{erro}</p>}<div className="v2v-form-actions"><button type="button" className="v2v-secondary" onClick={() => setConfirmacao(null)}>Cancelar</button><button type="button" className="v2v-primary" disabled={!justificativa.trim()} onClick={() => {
        try {confirmarEdicaoVinculo(confirmacao.novo.id,confirmacao.novo,justificativa,confirmacao.versao,autorizacao);navigate(`${BASE}/${confirmacao.novo.id}?salvo=1&tipo=${encodeURIComponent(tipo)}`);}
        catch (e) {setErro((e as Error).message);}
      }}>Confirmar Alterações</button></div></>}
    </ModalSeplag>
    <ModalSeplag visible={Boolean(cadastrado)} titulo="Vínculo cadastrado" fechar={voltar} hideFooter tamanho="700px">
      {cadastrado && <div className="prototype-efetivo-registrado-modal">
        <p>O vínculo foi cadastrado com sucesso. A Matrícula e o Nº do Vínculo foram gerados automaticamente pelo sistema.</p>
        <dl className="prototype-efetivo-gerado-info"><div><dt>Matrícula gerada</dt><dd>{cadastrado.matricula}</dd></div><div><dt>Nº do Vínculo gerado</dt><dd>{cadastrado.numero}</dd></div></dl>
        <p className="prototype-efetivo-registrado-hint">O novo vínculo já está disponível para consulta na Gestão de Vínculos e na Histórico Funcional.</p>
        <div className="prototype-efetivo-modal-actions"><BotaoVoltarSeplag type="button" label="Fechar" icon="pi pi-times" onClick={voltar} /><BotaoSeplag type="button" label="Visualizar vínculo" icon="pi pi-eye" onClick={() => navigate(`${BASE}/${cadastrado.id}?tipo=${encodeURIComponent(tipo)}`)} /></div>
      </div>}
    </ModalSeplag>
  </form>);
}

function DadoDetalhe({ nome, valor }: { nome: string; valor: React.ReactNode }) {
  return <div><small>{nome}</small><strong>{valor}</strong></div>;
}

export function VinculoV2DetalhesPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [params] = useSearchParams();
  const usuario = useUsuarioVinculos();
  useAtualizacaoVinculos();
  const [aba,setAba] = useState<'dados' | 'historico'>('dados');
  const abaAtiva = usuario ? aba : 'dados';
  const vinculo = todos().find((v) => v.id === id);
  const voltar = () => {
    const consulta = new URLSearchParams(params);
    consulta.set("expand", params.get("tipo") || vinculo?.tipo || "");
    navigate(`${BASE}?${consulta}`);
  };
  if (!vinculo) return layout("Detalhes do Vínculo", null, <><div className="v2v-notice">Vínculo não encontrado.</div><div className="v2v-form-actions v2v-detail-actions"><button type="button" className="v2v-secondary" onClick={voltar}><i className="pi pi-arrow-left" aria-hidden="true" />Voltar</button></div></>);
  const situacao = situacaoDoVinculo(vinculo);

  return layout("Detalhes do Vínculo", null, <>
    {params.get('salvo') === '1' && <p className="v2v-notice" role="status">Alterações do vínculo salvas com sucesso. Histórico registrado.</p>}
    {usuario && <div className="v2v-tabs" role="tablist" aria-label="Informações do vínculo"><button type="button" role="tab" id="v2v-tab-dados" aria-controls="v2v-panel-dados" aria-selected={abaAtiva === 'dados'} onClick={() => setAba('dados')}>Dados do Vínculo</button><button type="button" role="tab" id="v2v-tab-historico" aria-controls="v2v-panel-historico" aria-selected={abaAtiva === 'historico'} onClick={() => setAba('historico')}>Histórico de Alterações</button></div>}
    <div id="v2v-panel-dados" role={usuario ? 'tabpanel' : undefined} aria-labelledby={usuario ? 'v2v-tab-dados' : undefined} hidden={abaAtiva !== 'dados'}>
    <section className="v2v-panel v2v-form-section v2v-server-section" aria-labelledby="v2v-servidor-title"><header className="v2v-section-header"><i className="pi pi-user" aria-hidden="true" /><div><h2 id="v2v-servidor-title">Dados do Servidor</h2></div></header><div className="v2v-section-body v2v-detail-grid v2v-grid-three"><DadoDetalhe nome="Nome" valor={vinculo.nome} /><DadoDetalhe nome="CPF" valor={vinculo.cpf} /><DadoDetalhe nome="Tipo de Vínculo" valor={vinculo.tipo} /></div></section>
    <section className="v2v-panel v2v-form-section" aria-labelledby="v2v-vinculo-title"><header className="v2v-section-header"><i className="pi pi-id-card" aria-hidden="true" /><div><h2 id="v2v-vinculo-title">Dados do Vínculo</h2></div></header><div className="v2v-section-body v2v-detail-grid v2v-grid-two"><DadoDetalhe nome="Matrícula" valor={vinculo.matricula} /><DadoDetalhe nome="Nº do Vínculo" valor={vinculo.numero} /></div></section>
    <section className="v2v-panel v2v-form-section" aria-labelledby="v2v-caracteristicas-title"><header className="v2v-section-header"><i className="pi pi-briefcase" aria-hidden="true" /><div><h2 id="v2v-caracteristicas-title">Características do Vínculo</h2></div></header><div className="v2v-section-body v2v-detail-grid v2v-grid-four"><DadoDetalhe nome="Regime Jurídico" valor={vinculo.regime} /><DadoDetalhe nome="Carreira" valor={vinculo.carreira || "Não se aplica"} /><DadoDetalhe nome="Cargo" valor={vinculo.cargo} /><DadoDetalhe nome="Perfil Profissional" valor={vinculo.perfil} /><DadoDetalhe nome="Jornada de Trabalho" valor={vinculo.jornada} /><DadoDetalhe nome="Órgão/Entidade" valor={vinculo.orgao || "Não informado"} /><DadoDetalhe nome="Lotação" valor={vinculo.setor || "Não informada"} /><DadoDetalhe nome="Data de Início do Exercício" valor={dataBr(vinculo.inicio)} />{TIPOS_FIM_EXERCICIO.has(vinculo.tipo) && <DadoDetalhe nome="Data de Fim do Exercício" valor={vinculo.termino ? dataBr(vinculo.termino) : "Não informada"} />}<DadoDetalhe nome="Situação do Vínculo" valor={<SituacaoTag situacao={situacao} />} /><DadoDetalhe nome="Data de Encerramento" valor={vinculo.vacanciaData ? dataBr(vinculo.vacanciaData) : "Não informada"} /><DadoDetalhe nome="Formas de Encerramento" valor={vinculo.vacanciaForma || "Não informada"} /></div></section>
    <section className="v2v-panel v2v-form-section" aria-labelledby="v2v-observacao-title"><header className="v2v-section-header"><i className="pi pi-file-edit" aria-hidden="true" /><div><h2 id="v2v-observacao-title">Observação</h2></div></header><div className="v2v-section-body v2v-detail-grid"><DadoDetalhe nome="Observação" valor={vinculo.observacao || "Não informada"} /></div></section>
    </div>
    {usuario && abaAtiva === 'historico' && <div id="v2v-panel-historico" role="tabpanel" aria-labelledby="v2v-tab-historico"><VinculoAuditoria id={vinculo.id} /></div>}
    <div className="v2v-form-actions v2v-detail-actions"><button type="button" className="v2v-secondary" onClick={voltar}><i className="pi pi-arrow-left" aria-hidden="true" />Voltar</button>{usuario?.editar && <button type="button" className="v2v-primary" onClick={() => navigate(`${BASE}/${vinculo.id}/editar?tipo=${encodeURIComponent(vinculo.tipo)}`)}><i className="pi pi-pencil" />Editar Vínculo</button>}</div>
  </>, situacao);
}
