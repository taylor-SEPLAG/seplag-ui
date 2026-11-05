import { useState } from 'react';
import { Paginator } from 'primereact/paginator';
import type { FeriasRegistro } from './FeriasPages';
import { ModalSeplag } from '../../componentes/Modal';
import { tipoAprovacao, dataBrAprovacao, diasAprovacao, periodoAprovacao, filtrosAprovacaoVazios, filtrarAprovacoes, loteAprovacao, ordenarAprovacoes, situacaoAprovacao, correspondeFiltroSituacao, FILTRO_SUSPENSAO_PENDENTE, type FiltrosAprovacao, type OrdemAprovacao } from './aprovacoesModel';
import './aprovacoes.css';

// Mapeia a situação de aprovação ('Pendente'|'Aprovada'|'Rejeitada') para as mesmas classes
// de cor dos badges da grid de Gestão: Pendente -> roxo (aguardando-validacao),
// Aprovada -> verde (em-aberto), Rejeitada -> vermelho (reprovado).
function classeSituacaoAprovacao(situacao: string) {
  if (situacao === 'Aprovada') return 'em-aberto';
  if (situacao === 'Rejeitada') return 'reprovado';
  return 'pendente';
}

export function AprovacoesFerias({registros,onVisualizar,onAlterarStatus,onAlterarStatusLote}: {
  registros:FeriasRegistro[];onVisualizar:(r:FeriasRegistro)=>void;
  onAlterarStatus:(r:FeriasRegistro,a:'validar'|'rejeitar'|'aprovar_suspensao'|'rejeitar_suspensao')=>void;onAlterarStatusLote:(id:string,a:'validar'|'rejeitar')=>void;
}) {
  const [loteSelecionado,setLoteSelecionado]=useState<{loteId:string;membros:FeriasRegistro[]}|null>(null);
  const [menuAberto,setMenuAberto]=useState<string|number|null>(null);
  const [campos,setCampos]=useState<FiltrosAprovacao>({...filtrosAprovacaoVazios,situacao:'Pendente'});
  const [filtros,setFiltros]=useState(campos);
  const ordem:{campo:OrdemAprovacao;desc:boolean}={campo:'solicitacao',desc:true};
  const [primeiro,setPrimeiro]=useState(0),[porPagina,setPorPagina]=useState(10),[erro,setErro]=useState('');
  const alterar=(campo:keyof FiltrosAprovacao,valor:string) => {
    const novos={...campos,[campo]:valor};
    setCampos(novos);
    if(novos.inicio && novos.fim && novos.inicio>novos.fim) {setErro('A data final deve ser igual ou posterior à data inicial.');return;}
    setErro('');setFiltros(novos);setPrimeiro(0);
  };
  const limpar=() => {setCampos({...filtrosAprovacaoVazios});setFiltros({...filtrosAprovacaoVazios});setPrimeiro(0);setErro('');};
  const dados=ordenarAprovacoes(filtrarAprovacoes(registros,filtros),ordem.campo,ordem.desc);
  // Coletiva/Lote (loteAprovacao) são avaliados em bloco: agrupa todos os membros do mesmo
  // loteId numa única linha, em vez de uma linha por servidor — a ação de Validar/Rejeitar já
  // era aplicada ao lote inteiro, mas a listagem ainda mostrava cada servidor separadamente.
  const loteIdsVistos=new Set<string>();
  const linhas:({tipo:'grupo';loteId:string;membros:FeriasRegistro[]}|{tipo:'individual';registro:FeriasRegistro})[]=[];
  // Suspensão (pendente ou já efetivada) é sempre individual, mesmo que o registro seja de lote.
  const temSuspensao=(x:FeriasRegistro)=>!!x.suspensaoPendente || x.situacao==='SUSPENSO' || x.parcelaSuspensaId!=null;
  dados.forEach(r => {
    if(loteAprovacao(r) && !temSuspensao(r)) {
      if(loteIdsVistos.has(r.loteId!)) return;
      loteIdsVistos.add(r.loteId!);
      linhas.push({tipo:'grupo',loteId:r.loteId!,membros:dados.filter(x => x.loteId===r.loteId && !temSuspensao(x))});
    } else {
      linhas.push({tipo:'individual',registro:r});
    }
  });
  const primeiroAtual=Math.min(primeiro,Math.max(0,Math.ceil(linhas.length/porPagina)-1)*porPagina),visiveis=linhas.slice(primeiroAtual,primeiroAtual+porPagina);
  const hoje=new Date().toLocaleDateString('sv-SE',{timeZone:'America/Cuiaba'});
  const cards=[{nome:'Pendentes de aprovação',situacao:'Pendente',cor:'pending',icone:'pi-clock'},{nome:'Suspensões aguardando validação',situacao:FILTRO_SUSPENSAO_PENDENTE,cor:'suspensao',icone:'pi-pause-circle'},{nome:'Aprovadas',situacao:'Aprovada',cor:'approved',icone:'pi-check-circle'},{nome:'Rejeitadas',situacao:'Rejeitada',cor:'rejected',icone:'pi-times-circle'},{nome:'Total de solicitações',situacao:'',cor:'total',icone:'pi-file'}];
  const cabecalhos:{rotulo:string;campo?:OrdemAprovacao}[]=[{rotulo:'Servidor',campo:'nome'},{rotulo:'Matrícula / Vínculo',campo:'matricula'},{rotulo:'Órgão / Entidade',campo:'orgao'},{rotulo:'Lotação',campo:'lotacao'},{rotulo:'Período',campo:'periodo'},{rotulo:'Dias',campo:'dias'},{rotulo:'Tipo',campo:'tipo'},{rotulo:'Origem'},{rotulo:'Situação atual',campo:'situacao'},{rotulo:'Validade da solicitação',campo:'validade'},{rotulo:'Ações'}];

  return <section className="fa-page" aria-label="Aprovações de férias">
    <h2 className="prototype-ferias-sub-titulo">Avaliar e Aprovar Férias</h2>
    <div className="fa-kpis">{cards.map(c => <button key={c.nome} type="button" className={`fa-kpi fa-${c.cor}`} aria-pressed={filtros.situacao===c.situacao} onClick={() => {setCampos(v => ({...v,situacao:c.situacao}));setFiltros(v => ({...v,situacao:c.situacao}));setPrimeiro(0);}}><i className={`pi ${c.icone}`} aria-hidden="true" /><span>{c.nome}<strong>{registros.filter(r => correspondeFiltroSituacao(r,c.situacao)).length}</strong></span></button>)}</div>
    <form className="fa-filters" onSubmit={e => e.preventDefault()}><h3>Filtros de pesquisa</h3><div className="fa-filter-fields">
      <label>Servidor ou matrícula<input value={campos.busca} placeholder="Nome ou matrícula" onChange={e => alterar('busca',e.target.value)} /></label>
      <fieldset><legend>Período de férias</legend><div><input aria-label="Data inicial do período de férias" type="date" value={campos.inicio} onChange={e => alterar('inicio',e.target.value)} /><input aria-label="Data final do período de férias" type="date" value={campos.fim} onChange={e => alterar('fim',e.target.value)} /></div></fieldset>
      <label>Situação<select value={campos.situacao} onChange={e => alterar('situacao',e.target.value)}><option value="">Todos</option>{['Pendente',FILTRO_SUSPENSAO_PENDENTE,'Aprovada','Rejeitada'].map(s => <option key={s}>{s}</option>)}</select></label>
      <label>Órgão/Entidade<select value={campos.orgao} onChange={e => alterar('orgao',e.target.value)}><option value="">Todos</option>{[...new Set(registros.map(r => r.orgao))].sort().map(o => <option key={o}>{o}</option>)}</select></label>
      <label>Tipo<select value={campos.tipo} onChange={e => alterar('tipo',e.target.value)}><option value="">Todos</option><option>Individual</option><option>Coletiva</option><option>Em lote</option><option>Remunerado</option></select></label>
    <div className="fa-filter-actions"><button type="button" className="fa-primary fa-clear-filter" onClick={limpar}><i className="pi pi-refresh" aria-hidden="true" />Limpar filtro</button></div></div></form>
    {erro && <p className="fa-error" role="alert">{erro}</p>}
    <div className="fa-table-wrap"><table className="fa-table" aria-label="Solicitações de férias para aprovação"><thead><tr>{cabecalhos.map(c => <th key={c.rotulo}>{c.rotulo}</th>)}</tr></thead><tbody>{visiveis.map(linha => {
      const r=linha.tipo==='grupo' ? linha.membros[0] : linha.registro;
      const membros=linha.tipo==='grupo' ? linha.membros : [r];
      const situacao=situacaoAprovacao(r)!,expirado=!r.suspensaoPendente && (r.situacao==='PRAZO EXPIRADO' || (!!r.dataLimiteValidacaoChefia && hoje>r.dataLimiteValidacaoChefia && situacao==='Pendente'));
      const ehGrupo=linha.tipo==='grupo';
      const chaveLinha:string|number=ehGrupo ? `lote-${r.loteId}` : r.id;
      const lotacoes=[...new Set(membros.map(m => m.setor))];
      const suspensao=!ehGrupo && !!r.suspensaoPendente;
      const aguardandoPublicacao=r.suspensaoPendente?.processo.status==='AGUARDANDO_PUBLICACAO';
      const acao=(a:'validar'|'rejeitar') => ehGrupo ? onAlterarStatusLote(r.loteId!,a) : onAlterarStatus(r,suspensao ? (a==='validar' ? 'aprovar_suspensao' : 'rejeitar_suspensao') : a);
      return <tr key={chaveLinha}>
        <td>{ehGrupo ? <><strong>{membros.length} {membros.length===1 ? 'servidor' : 'servidores'}</strong><small>Avaliação em bloco · {r.loteId}</small></> : <strong>{r.servidorNome}</strong>}</td>
        <td>{ehGrupo ? '—' : `${r.matricula} / ${r.numeroVinculo || '—'}`}</td>
        <td>{r.orgao}</td>
        <td>{lotacoes.length>1 ? `${lotacoes.length} lotações` : lotacoes[0]}</td>
        <td>{(() => {
          const pend = r.suspensaoPendente;
          const suspensaoEfetivada = !ehGrupo && (r.situacao === 'SUSPENSO' || r.parcelaSuspensaId != null);
          // Parcela-alvo da suspensão (pendente ou efetivada) para deixar claro qual período foi suspenso.
          const alvoId = pend?.dados.parcelaId ?? r.parcelaSuspensaId ?? (r.parcelas.length > 1 ? r.parcelas[0]?.id : undefined);
          const parcelaAlvo = alvoId != null ? r.parcelas.find((p) => p.id === alvoId) : undefined;
          const mostraParcela = (suspensao || suspensaoEfetivada) && parcelaAlvo;
          return <>
            {mostraParcela
              ? '1 parcela'
              : r.parcelas.length > 1 ? `${r.parcelas.length} parcelas` : 'Integral'}
            {pend?.dados.suspensaoInicio && pend.dados.suspensaoFim
              ? <small>Suspensão: {dataBrAprovacao(pend.dados.suspensaoInicio)} a {dataBrAprovacao(pend.dados.suspensaoFim)}</small>
              : null}
          </>;
        })()}</td>
        <td>{(() => {
          const alvoId = r.suspensaoPendente?.dados.parcelaId ?? r.parcelaSuspensaId;
          const parcelaAlvo = !ehGrupo && alvoId != null ? r.parcelas.find((p) => p.id === alvoId) : undefined;
          return parcelaAlvo ? parcelaAlvo.dias : diasAprovacao(r);
        })()}</td>
        <td><span className={`prototype-ferias-badge prototype-ferias-badge-tipo is-tipo-${r.tipo.toLowerCase()}`}>{tipoAprovacao(r)}</span></td>
        <td><span className={`prototype-ferias-badge prototype-ferias-badge-origem is-${r.origem.toLowerCase()}`}>{r.origem==='PORTALSERVIDOR' ? 'Portal do Servidor' : 'SIGEP'}</span></td>
        <td>{(() => {
          // Suspensão: pendente mostra "aguardando validação"; efetivada mostra "Suspenso".
          if (suspensao) return <span className="prototype-ferias-badge is-aguardando-validacao">Suspensão aguardando validação</span>;
          if (!ehGrupo && (r.situacao === 'SUSPENSO' || r.parcelaSuspensaId != null)) return <span className="prototype-ferias-badge is-suspenso">Suspenso · Art. 17</span>;
          return <span className={`prototype-ferias-badge is-${classeSituacaoAprovacao(situacao)}`}>{situacao}</span>;
        })()}</td>
        <td className={expirado ? 'fa-expired':''}>{r.suspensaoPendente ? '—' : dataBrAprovacao(r.dataLimiteValidacaoChefia)}{expirado && <small><i className="pi pi-exclamation-triangle" aria-hidden="true" />Prazo expirado</small>}</td>
        <td>
          <div className="prototype-ferias-acao-dropdown">
            <button type="button" className="prototype-ferias-btn-acao" title="Visualizar" aria-label={`Visualizar ${ehGrupo ? 'servidores do lote '+r.loteId : r.servidorNome}`} onClick={() => ehGrupo ? setLoteSelecionado({loteId:r.loteId!,membros}) : onVisualizar(r)}><i className="pi pi-eye" aria-hidden="true" /></button>
            <button type="button" className="prototype-ferias-btn-acao-caret" title="Mais ações" aria-label="Mais ações" onClick={() => setMenuAberto(menuAberto===chaveLinha ? null : chaveLinha)}><i className="pi pi-chevron-down" aria-hidden="true" /></button>
            {menuAberto===chaveLinha ? (
              <div className="prototype-ferias-menu-acoes">
                <button type="button" onClick={() => { ehGrupo ? setLoteSelecionado({loteId:r.loteId!,membros}) : onVisualizar(r); setMenuAberto(null); }}><i className="pi pi-eye" aria-hidden="true" /> Visualizar</button>
                {situacao==='Pendente' && <>
                  <button type="button" className="is-acao-verde" onClick={() => { acao('validar'); setMenuAberto(null); }}><i className="pi pi-check-circle" aria-hidden="true" /> {ehGrupo ? 'Validar lote' : aguardandoPublicacao ? 'Registrar publicação (DO)' : suspensao ? 'Validar suspensão' : 'Validar'}</button>
                  {!aguardandoPublicacao && <button type="button" className="is-acao-vermelha" onClick={() => { acao('rejeitar'); setMenuAberto(null); }}><i className="pi pi-times-circle" aria-hidden="true" /> {ehGrupo ? 'Rejeitar lote' : suspensao ? 'Rejeitar suspensão' : 'Rejeitar'}</button>}
                </>}
              </div>
            ) : null}
          </div>
        </td>
      </tr>;
    })}{!visiveis.length && <tr><td colSpan={11} className="fa-empty">Nenhuma solicitação encontrada para os filtros aplicados.</td></tr>}</tbody></table></div>
    <footer className="fa-pagination">
      <Paginator
        first={primeiroAtual}
        rows={porPagina}
        totalRecords={linhas.length}
        rowsPerPageOptions={[10, 20, 50]}
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        onPageChange={(event) => { setPrimeiro(event.rows !== porPagina ? 0 : event.first); setPorPagina(event.rows); }}
      />
    </footer>
    {loteSelecionado ? (
      <ModalSeplag visible fechar={() => setLoteSelecionado(null)} titulo={`Servidores do lote · ${loteSelecionado.loteId}`} hideFooter tamanho="640px">
        <div className="fa-lote-membros">
          <p>{loteSelecionado.membros.length} servidor{loteSelecionado.membros.length===1 ? '' : 'es'} incluído{loteSelecionado.membros.length===1 ? '' : 's'} nesta avaliação em bloco.</p>
          <table className="fa-table fa-lote-membros-table">
            <thead><tr><th>Servidor</th><th>Matrícula / Vínculo</th><th>Cargo</th><th>Lotação</th><th>Parcela(s)</th></tr></thead>
            <tbody>{loteSelecionado.membros.map(m => (
              <tr key={m.id}>
                <td><strong>{m.servidorNome}</strong></td>
                <td>{m.matricula} / {m.numeroVinculo || '1'}</td>
                <td>{m.cargo}</td>
                <td>{m.setor}</td>
                <td>{periodoAprovacao(m)} · {diasAprovacao(m)} dias</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </ModalSeplag>
    ) : null}
  </section>;
}
