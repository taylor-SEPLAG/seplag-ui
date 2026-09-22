import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CONTROLE_PSS_BASE_PATH as BASE, CONTROLE_PSS_DATA_REFERENCIA, CONTROLE_PSS_USUARIO_LOGADO } from "../constants";
import { comissoesStore, useComissoes } from "./comissoesStore";
import { HistoricoMembrosComissaoModal } from "./HistoricoMembrosComissaoModal";
import { STATUS_COMISSAO, TIPOS_COMISSAO } from "./dominios";
import { certamesMock } from "../certame/mock";
import type { Comissao, StatusComissao, TipoComissao } from "./types";
import { CardSeplag } from "@componentes/Card";
import { BadgeSeplag } from "@componentes/Badge";
import { BotaoAdicionarSeplag, BotaoLimparFiltroSeplag, BotaoSeplag } from "@componentes/Botao";
import { ModalSeplag } from "@componentes/Modal";
import { MensagemSeplag } from "@componentes/Mensagem";
import { Dropdown } from "primereact/dropdown";
import "./comissoes.css";

const tipoLabel:Record<TipoComissao,string> = Object.fromEntries(TIPOS_COMISSAO.map((item) => [item.value, item.label])) as Record<TipoComissao,string>;
const statusLabel:Record<StatusComissao,string> = Object.fromEntries(STATUS_COMISSAO.map((item) => [item.value, item.label])) as Record<StatusComissao,string>;
const statusEstilo:Record<StatusComissao,{ color:string; bg:string }> = {
 RASCUNHO: { color:"#8a5c00", bg:"#fff1cf" },
 EM_ANDAMENTO: { color:"#0b6199", bg:"#e9f3fc" },
 ENCERRADA: { color:"#147441", bg:"#e2f5e8" },
 CANCELADA: { color:"#ad3039", bg:"#ffe3e5" },
};

const nomeConcurso = (certameId?:string) => certameId ? certamesMock.find((item) => item.id === certameId)?.nomeEdital ?? "—" : "—";

const ITENS_POR_PAGINA_OPCOES = [10, 20, 50];

export function ComissoesListContent() {
 const comissoes = useComissoes();
 const navigate = useNavigate();
 const location = useLocation();
 // Confirmação de "Finalizar cadastro" (ComissaoFormContent) — chega pelo state da navegação,
 // exibida uma vez e some sozinha; mesmo padrão do aviso de tipo de certame em CertamesListContent.
 const [comissaoSalva, setComissaoSalva] = useState<string | null>((location.state as { comissaoSalva?:string } | null)?.comissaoSalva ?? null);
 useEffect(() => {
  if (!comissaoSalva) return undefined;
  const temporizador = setTimeout(() => setComissaoSalva(null), 6000);
  return () => clearTimeout(temporizador);
 }, [comissaoSalva]);
 const [numeroFiltro, setNumeroFiltro] = useState("");
 const [editalFiltro, setEditalFiltro] = useState("");
 const [nomeFiltro, setNomeFiltro] = useState("");
 const [tipoFiltro, setTipoFiltro] = useState<TipoComissao | "">("");
 const [statusFiltro, setStatusFiltro] = useState<StatusComissao | "">("");
 const [pagina, setPagina] = useState(1);
 const [itensPorPagina, setItensPorPagina] = useState(10);
 const [comissaoExcluirId, setComissaoExcluirId] = useState<string | null>(null);
 const [comissaoAlternarStatus, setComissaoAlternarStatus] = useState<Comissao | null>(null);
 // Cancelar exige justificativa (obrigatória, vai para o Histórico junto com a troca de status);
 // Reabrir continua só com a confirmação simples.
 const [justificativaCancelamento, setJustificativaCancelamento] = useState("");
 const [erroJustificativa, setErroJustificativa] = useState<string | null>(null);
 const [comissaoHistoricoId, setComissaoHistoricoId] = useState<string | null>(null);
 const [acoesMenuAbertoId, setAcoesMenuAbertoId] = useState<string | null>(null);

 // Código, Edital e Nome listados no filtro são só os valores efetivamente cadastrados em alguma
 // comissão — mesmo padrão do filtro "Nome do edital" da listagem de Certames, cada um com busca
 // própria (Dropdown com filter, em vez de <select>/<input> de texto livre).
 const numeros = useMemo(() => Array.from(new Set(comissoes.map((item) => item.numero))).sort((a, b) => b.localeCompare(a, "pt-BR", { numeric:true })), [comissoes]);
 const editais = useMemo(() => Array.from(new Set(comissoes.map((item) => nomeConcurso(item.certameId)).filter((nome) => nome !== "—"))).sort((a, b) => a.localeCompare(b, "pt-BR")), [comissoes]);
 const nomes = useMemo(() => Array.from(new Set(comissoes.map((item) => item.nome))).sort((a, b) => a.localeCompare(b, "pt-BR")), [comissoes]);

 const lista = useMemo(() => comissoes.filter((comissao) =>
  (!numeroFiltro || comissao.numero === numeroFiltro) &&
  (!editalFiltro || nomeConcurso(comissao.certameId) === editalFiltro) &&
  (!nomeFiltro || comissao.nome === nomeFiltro) &&
  (!tipoFiltro || comissao.tipo === tipoFiltro) &&
  (!statusFiltro || comissao.status === statusFiltro),
 ).sort((a, b) => b.numero.localeCompare(a.numero, "pt-BR", { numeric:true })), [comissoes, numeroFiltro, editalFiltro, nomeFiltro, tipoFiltro, statusFiltro]);

 const totalPaginas = Math.max(1, Math.ceil(lista.length / itensPorPagina));
 const paginaAtual = Math.min(pagina, totalPaginas);
 const listaPaginada = lista.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

 const limparFiltros = () => { setNumeroFiltro(""); setEditalFiltro(""); setNomeFiltro(""); setTipoFiltro(""); setStatusFiltro(""); setPagina(1); };

 // KPIs no topo da listagem — somam sobre todas as comissões, independente dos filtros aplicados.
 const indicadores = useMemo(() => [
  { label:"Total de comissões", value:comissoes.length, icon:"pi pi-briefcase", tone:"gray" },
  { label:"Rascunhos", value:comissoes.filter((item) => item.status === "RASCUNHO").length, icon:"pi pi-file-edit", tone:"amber" },
  { label:"Em andamento", value:comissoes.filter((item) => item.status === "EM_ANDAMENTO").length, icon:"pi pi-play", tone:"green" },
  { label:"Encerradas", value:comissoes.filter((item) => item.status === "ENCERRADA").length, icon:"pi pi-lock", tone:"blue" },
  { label:"Canceladas", value:comissoes.filter((item) => item.status === "CANCELADA").length, icon:"pi pi-ban", tone:"red" },
  { label:"Processos seletivos", value:comissoes.filter((item) => item.tipo === "PROCESSO_SELETIVO").length, icon:"pi pi-users", tone:"teal" },
  { label:"Concursos públicos", value:comissoes.filter((item) => item.tipo === "CONCURSO").length, icon:"pi pi-building", tone:"purple" },
 ], [comissoes]);

 const fecharModalAlternarStatus = () => { setComissaoAlternarStatus(null); setJustificativaCancelamento(""); setErroJustificativa(null); };
 const confirmarAlternarStatus = () => {
  if (!comissaoAlternarStatus) return;
  // Cancelar (manual, com justificativa) leva a Cancelada — Encerrada só é alcançada sozinha, pela
  // vigência (ver calcularStatusPorVigencia). Reabrir só se aplica à Cancelada, de volta a Em andamento.
  const proximo:StatusComissao = comissaoAlternarStatus.status === "CANCELADA" ? "EM_ANDAMENTO" : "CANCELADA";
  if (proximo === "CANCELADA" && !justificativaCancelamento.trim()) { setErroJustificativa("Informe a justificativa do cancelamento."); return; }
  const agora = CONTROLE_PSS_DATA_REFERENCIA.split("-").reverse().join("/");
  const descricao = proximo === "CANCELADA"
   ? `Status alterado de ${statusLabel[comissaoAlternarStatus.status]} para ${statusLabel[proximo]}. Justificativa: ${justificativaCancelamento.trim()}`
   : `Status alterado de ${statusLabel[comissaoAlternarStatus.status]} para ${statusLabel[proximo]}.`;
  comissoesStore.alterarStatus(comissaoAlternarStatus.id, proximo, {
   descricao,
   registradoEm:`${agora} ${new Date().toTimeString().slice(0, 5)}`,
   usuario:CONTROLE_PSS_USUARIO_LOGADO,
  });
  fecharModalAlternarStatus();
 };

 const confirmarExclusao = () => {
  if (comissaoExcluirId) comissoesStore.remove(comissaoExcluirId);
  setComissaoExcluirId(null);
 };

 return <div className="prototype-page-content prototype-page-content--white prototype-ingressos-teste-list-page">
  <CardSeplag title="Comissões" cols="12" cardHeaderClassNames="prototype-regime-card prototype-ingressos-card">
   <div className="col-12"><div className="prototype-ingressos-teste-content">
    <p className="prototype-ingressos-teste-support">Cadastro das comissões instituídas para condução de concursos públicos e processos seletivos.</p>
    {comissaoSalva && <MensagemSeplag severity="success" message={comissaoSalva} cols="12" />}
    <hr className="prototype-ingressos-teste-header-divider" />

    <section className="prototype-ingressos-teste-indicators prototype-comissoes-list-indicators" aria-label="Indicadores de comissões">
     {indicadores.map((indicador) => <article key={indicador.label} className={`prototype-ingressos-teste-indicator prototype-ingressos-teste-indicator--${indicador.tone}`}>
      <span className="prototype-ingressos-teste-indicator-icon" aria-hidden="true"><i className={indicador.icon} /></span>
      <div><span>{indicador.label}</span><strong>{indicador.value.toLocaleString("pt-BR")}</strong></div>
     </article>)}
    </section>

    <div className="prototype-category-filters prototype-ingressos-filters prototype-comissoes-list-filters grid">
     <label className="prototype-native-field">
      <span>Código</span>
      <Dropdown value={numeroFiltro || null} options={numeros.map((numero) => ({ label:numero, value:numero }))} onChange={(event) => { setNumeroFiltro(event.value ?? ""); setPagina(1); }} filter showClear placeholder="Todos os códigos" className="w-full" />
     </label>
     <label className="prototype-native-field">
      <span>Edital</span>
      <Dropdown value={editalFiltro || null} options={editais.map((nome) => ({ label:nome, value:nome }))} onChange={(event) => { setEditalFiltro(event.value ?? ""); setPagina(1); }} filter showClear placeholder="Todos os editais" className="w-full" />
     </label>
     <label className="prototype-native-field">
      <span>Nome da Comissão</span>
      <Dropdown value={nomeFiltro || null} options={nomes.map((nome) => ({ label:nome, value:nome }))} onChange={(event) => { setNomeFiltro(event.value ?? ""); setPagina(1); }} filter showClear placeholder="Todos os nomes" className="w-full" />
     </label>
     <label className="prototype-native-field">
      <span>Tipo</span>
      <select value={tipoFiltro} onChange={(event) => { setTipoFiltro(event.target.value as TipoComissao | ""); setPagina(1); }}>
       <option value="">Todos os tipos</option>
       {TIPOS_COMISSAO.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
     </label>
     <label className="prototype-native-field">
      <span>Status</span>
      <select value={statusFiltro} onChange={(event) => { setStatusFiltro(event.target.value as StatusComissao | ""); setPagina(1); }}>
       <option value="">Todos os status</option>
       {STATUS_COMISSAO.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
     </label>
     <div className="prototype-category-clear">
      <BotaoLimparFiltroSeplag type="button" label="Limpar filtros" icon="pi pi-refresh" onClick={limparFiltros} />
     </div>
    </div>

    <div className="prototype-comissoes-list-acoes">
     <BotaoAdicionarSeplag label="Nova comissão" onClick={() => navigate(`${BASE}/comissoes/novo`)} />
    </div>

    <div className="prototype-efetivo-exercicio-table-wrap">
     <table className="prototype-simple-table">
      <thead>
       <tr>
        <th>Código</th>
        <th>Edital</th>
        <th>Nome da Comissão</th>
        <th>Tipo</th>
        <th>Início</th>
        <th>Término</th>
        <th>Status</th>
        <th>Ações</th>
       </tr>
      </thead>
      <tbody>
       {listaPaginada.length === 0
        ? <tr><td colSpan={8} className="prototype-empty-table-cell">Nenhuma comissão encontrada para os filtros aplicados.</td></tr>
        : listaPaginada.map((row) => {
         const menuId = row.id;
         // Cancelar (manual, com justificativa) só se aplica a uma comissão Em andamento, e leva a
         // Cancelada; Reabrir só se aplica à Cancelada, de volta a Em andamento. Encerrada (pela
         // vigência) não tem ação manual — para reabri-la, edite o Término na aba Identificação.
         const podeAlternarStatus = row.status === "EM_ANDAMENTO" || row.status === "CANCELADA";
         return <tr key={row.id}>
         <td>{row.numero}</td>
         <td>{nomeConcurso(row.certameId)}</td>
         <td>{row.nome}</td>
         <td>{tipoLabel[row.tipo]}</td>
         <td>{row.inicio ?? "—"}</td>
         <td>{row.termino ?? "—"}</td>
         <td><BadgeSeplag label={statusLabel[row.status]} color={statusEstilo[row.status].color} bg={statusEstilo[row.status].bg} border="transparent" size="sm" /></td>
         <td>
          <div className="prototype-ingresso-candidato-actions">
           <div className="prototype-ingresso-actions-dropdown">
            <div className="prototype-ingresso-actions-trigger" role="group" aria-label="Ações da comissão">
             <button type="button" className="prototype-ingresso-actions-eye" title="Visualizar" aria-label="Visualizar" onClick={() => navigate(`${BASE}/comissoes/${row.id}?modo=visualizar`)}>
              <i className="pi pi-eye" aria-hidden="true" />
             </button>
             <button type="button" className="prototype-ingresso-actions-arrow" title="Mais ações" aria-label="Mais ações" aria-expanded={acoesMenuAbertoId === menuId} onClick={() => setAcoesMenuAbertoId((atual) => atual === menuId ? null : menuId)}>
              <i className="pi pi-chevron-down" aria-hidden="true" />
             </button>
            </div>
            {acoesMenuAbertoId === menuId && <div className="prototype-ingresso-actions-menu" role="menu">
             <button type="button" role="menuitem" onClick={() => { setAcoesMenuAbertoId(null); navigate(`${BASE}/comissoes/${row.id}`); }}>
              <i className="pi pi-pencil" aria-hidden="true" /><span>Editar</span>
             </button>
             <button type="button" role="menuitem" onClick={() => { setAcoesMenuAbertoId(null); setComissaoHistoricoId(row.id); }}>
              <i className="pi pi-history" aria-hidden="true" /><span>Histórico</span>
             </button>
             {podeAlternarStatus && <button type="button" role="menuitem" onClick={() => { setAcoesMenuAbertoId(null); setComissaoAlternarStatus(row); }}>
              <i className={row.status === "CANCELADA" ? "pi pi-refresh" : "pi pi-ban"} aria-hidden="true" /><span>{row.status === "CANCELADA" ? "Reabrir" : "Cancelar"}</span>
             </button>}
             {row.status === "RASCUNHO" && <button type="button" role="menuitem" className="is-danger" onClick={() => { setAcoesMenuAbertoId(null); setComissaoExcluirId(row.id); }}>
              <i className="pi pi-trash" aria-hidden="true" /><span>Excluir</span>
             </button>}
            </div>}
           </div>
          </div>
         </td>
        </tr>;
        })}
      </tbody>
     </table>
    </div>

    <nav className="prototype-efetivo-exercicio-pagination" aria-label="Paginação de comissões">
     <button type="button" aria-label="Primeira página" disabled={paginaAtual === 1} onClick={() => setPagina(1)}><i className="pi pi-angle-double-left" aria-hidden="true" /></button>
     <button type="button" aria-label="Página anterior" disabled={paginaAtual === 1} onClick={() => setPagina((atual) => Math.max(1, atual - 1))}><i className="pi pi-angle-left" aria-hidden="true" /></button>
     <span aria-current="page">{paginaAtual}</span>
     <button type="button" aria-label="Próxima página" disabled={paginaAtual === totalPaginas} onClick={() => setPagina((atual) => Math.min(totalPaginas, atual + 1))}><i className="pi pi-angle-right" aria-hidden="true" /></button>
     <button type="button" aria-label="Última página" disabled={paginaAtual === totalPaginas} onClick={() => setPagina(totalPaginas)}><i className="pi pi-angle-double-right" aria-hidden="true" /></button>
     <select aria-label="Itens por página" value={itensPorPagina} onChange={(event) => { setItensPorPagina(Number(event.target.value)); setPagina(1); }}>
      {ITENS_POR_PAGINA_OPCOES.map((opcao) => <option key={opcao} value={opcao}>{opcao}</option>)}
     </select>
    </nav>
   </div></div>
  </CardSeplag>

  <ModalSeplag
   visible={comissaoExcluirId !== null}
   titulo="Excluir comissão"
   fechar={() => setComissaoExcluirId(null)}
   tamanho="480px"
   closeOnEscape
   customFooter={<div className="flex justify-content-end gap-2">
    <BotaoSeplag type="button" label="Cancelar" outlined onClick={() => setComissaoExcluirId(null)} />
    <BotaoSeplag type="button" label="Excluir" severity="danger" onClick={confirmarExclusao} />
   </div>}
  >
   <p className="col-12">Deseja realmente excluir esta comissão? Essa ação não pode ser desfeita.</p>
  </ModalSeplag>

  <ModalSeplag
   visible={comissaoAlternarStatus !== null}
   titulo={comissaoAlternarStatus?.status === "CANCELADA" ? "Reabrir comissão" : "Cancelar comissão"}
   fechar={fecharModalAlternarStatus}
   tamanho="520px"
   closeOnEscape
   customFooter={<div className="flex justify-content-end gap-2">
    <BotaoSeplag type="button" label={comissaoAlternarStatus?.status === "CANCELADA" ? "Cancelar" : "Voltar"} outlined onClick={fecharModalAlternarStatus} />
    <BotaoSeplag type="button" label={comissaoAlternarStatus?.status === "CANCELADA" ? "Reabrir" : "Cancelar"} onClick={confirmarAlternarStatus} />
   </div>}
  >
   {comissaoAlternarStatus?.status === "CANCELADA"
    ? <p className="col-12">Deseja realmente reabrir esta comissão? Ela volta para o status "Em andamento".</p>
    : <div className="col-12">
      <p>Deseja realmente cancelar esta comissão? Ela fica Cancelada (vermelho) e deixa de aparecer como ativa.</p>
      <label className="prototype-native-field">
       <span>Justificativa do cancelamento <span className="required-marker">*</span></span>
       <textarea rows={4} maxLength={1000} value={justificativaCancelamento} placeholder="Descreva o motivo do cancelamento desta comissão..." onChange={(event) => { setJustificativaCancelamento(event.target.value); if (erroJustificativa) setErroJustificativa(null); }} />
      </label>
      {erroJustificativa && <small className="p-error">{erroJustificativa}</small>}
     </div>}
  </ModalSeplag>

  {comissaoHistoricoId && <HistoricoMembrosComissaoModal comissaoId={comissaoHistoricoId} onClose={() => setComissaoHistoricoId(null)} />}
 </div>;
}
