import { useState } from 'react';
import type { FeriasRegistro } from './FeriasPages';
import { tipoAprovacao, dataBrAprovacao, diasAprovacao, filtrosAprovacaoVazios, filtrarAprovacoes, loteAprovacao, ordenarAprovacoes, situacaoAprovacao, type FiltrosAprovacao, type OrdemAprovacao } from './aprovacoesModel';
import './aprovacoes.css';

export function AprovacoesFerias({registros,onVisualizar,onAlterarStatus,onAlterarStatusLote}: {
  registros:FeriasRegistro[];onVisualizar:(r:FeriasRegistro)=>void;
  onAlterarStatus:(r:FeriasRegistro,a:'validar'|'rejeitar')=>void;onAlterarStatusLote:(id:string,a:'validar'|'rejeitar')=>void;
}) {
  const [campos,setCampos]=useState<FiltrosAprovacao>({...filtrosAprovacaoVazios,situacao:'Pendente'});
  const [filtros,setFiltros]=useState(campos);
  const [ordem,setOrdem]=useState<{campo:OrdemAprovacao;desc:boolean}>({campo:'solicitacao',desc:true});
  const [pagina,setPagina]=useState(1),[exportando,setExportando]=useState(false),[erro,setErro]=useState('');
  const alterar=(campo:keyof FiltrosAprovacao,valor:string) => {
    const novos={...campos,[campo]:valor};
    setCampos(novos);
    if(novos.inicio && novos.fim && novos.inicio>novos.fim) {setErro('A data final deve ser igual ou posterior à data inicial.');return;}
    setErro('');setFiltros(novos);setPagina(1);
  };
  const limpar=() => {setCampos({...filtrosAprovacaoVazios});setFiltros({...filtrosAprovacaoVazios});setPagina(1);setErro('');};
  const dados=ordenarAprovacoes(filtrarAprovacoes(registros,filtros),ordem.campo,ordem.desc);
  const paginas=Math.max(1,Math.ceil(dados.length/10)),atual=Math.min(pagina,paginas),visiveis=dados.slice((atual-1)*10,atual*10);
  const hoje=new Date().toLocaleDateString('sv-SE',{timeZone:'America/Cuiaba'});
  const cards=[{nome:'Pendentes de aprovação',situacao:'Pendente',cor:'pending',icone:'pi-clock'},{nome:'Aprovadas',situacao:'Aprovada',cor:'approved',icone:'pi-check-circle'},{nome:'Rejeitadas',situacao:'Rejeitada',cor:'rejected',icone:'pi-times-circle'},{nome:'Total de solicitações',situacao:'',cor:'total',icone:'pi-file'}];
  const cabecalhos:{rotulo:string;campo?:OrdemAprovacao}[]=[{rotulo:'Servidor',campo:'nome'},{rotulo:'Matrícula / Vínculo',campo:'matricula'},{rotulo:'Órgão / Entidade',campo:'orgao'},{rotulo:'Lotação',campo:'lotacao'},{rotulo:'Período',campo:'periodo'},{rotulo:'Dias',campo:'dias'},{rotulo:'Tipo',campo:'tipo'},{rotulo:'Situação atual',campo:'situacao'},{rotulo:'Validade da solicitação',campo:'validade'},{rotulo:'Ações'}];
  const mudarOrdem=(campo:OrdemAprovacao) => {setOrdem(o => ({campo,desc:o.campo===campo ? !o.desc : false}));setPagina(1);};
  return <section className="fa-page" aria-label="Aprovações de férias">
    <h2 className="prototype-ferias-sub-titulo">Avaliar e Aprovar Férias</h2>
    <div className="fa-kpis">{cards.map(c => <button key={c.nome} type="button" className={`fa-kpi fa-${c.cor}`} aria-pressed={filtros.situacao===c.situacao} onClick={() => {setCampos(v => ({...v,situacao:c.situacao}));setFiltros(v => ({...v,situacao:c.situacao}));setPagina(1);}}><i className={`pi ${c.icone}`} aria-hidden="true" /><span>{c.nome}<strong>{registros.filter(r => situacaoAprovacao(r) && (!c.situacao || situacaoAprovacao(r)===c.situacao)).length}</strong></span></button>)}</div>
    <form className="fa-filters" onSubmit={e => e.preventDefault()}><h3>Filtros de pesquisa</h3><div className="fa-filter-fields">
      <label>Servidor ou matrícula<input value={campos.busca} placeholder="Nome ou matrícula" onChange={e => alterar('busca',e.target.value)} /></label>
      <fieldset><legend>Período de férias</legend><div><input aria-label="Data inicial do período de férias" type="date" value={campos.inicio} onChange={e => alterar('inicio',e.target.value)} /><input aria-label="Data final do período de férias" type="date" value={campos.fim} onChange={e => alterar('fim',e.target.value)} /></div></fieldset>
      <label>Situação<select value={campos.situacao} onChange={e => alterar('situacao',e.target.value)}><option value="">Todos</option>{['Pendente','Aprovada','Rejeitada'].map(s => <option key={s}>{s}</option>)}</select></label>
      <label>Órgão/Entidade<select value={campos.orgao} onChange={e => alterar('orgao',e.target.value)}><option value="">Todos</option>{[...new Set(registros.map(r => r.orgao))].sort().map(o => <option key={o}>{o}</option>)}</select></label>
      <label>Tipo<select value={campos.tipo} onChange={e => alterar('tipo',e.target.value)}><option value="">Todos</option><option>Individual</option><option>Coletiva</option><option>Em lote</option><option>Remunerado</option></select></label>
    <div className="fa-filter-actions"><button type="button" className="fa-primary fa-clear-filter" onClick={limpar}><i className="pi pi-refresh" aria-hidden="true" />Limpar filtro</button></div></div></form>
    {erro && <p className="fa-error" role="alert">{erro}</p>}
    <div className="fa-list-toolbar"><button type="button" className="fa-secondary" disabled={exportando || !dados.length} onClick={async () => {setExportando(true);setErro('');try {const {exportarAprovacoes}=await import('./exportarAprovacoes');await exportarAprovacoes(dados);}catch {setErro('Não foi possível exportar as solicitações. Tente novamente.');}finally {setExportando(false);}}}><i className="pi pi-file-excel" aria-hidden="true" />{exportando ? 'Exportando...' : 'Exportar Excel'}</button>
      <label>Ordenar por<select value={ordem.campo==='solicitacao' ? (ordem.desc ? 'recente':'antiga') : ordem.campo} onChange={e => {const valor=e.target.value;setOrdem({campo:valor==='recente' || valor==='antiga' ? 'solicitacao' : valor as OrdemAprovacao,desc:valor==='recente'});setPagina(1);}}><option value="recente">Data da solicitação (mais recente)</option><option value="antiga">Data da solicitação (mais antiga)</option><option value="validade">Validade da solicitação</option><option value="nome">Nome do servidor</option>{!['solicitacao','validade','nome'].includes(ordem.campo) && <option value={ordem.campo}>{cabecalhos.find(c => c.campo===ordem.campo)?.rotulo}</option>}</select></label>
    </div>
    <div className="fa-table-wrap"><table className="fa-table" aria-label="Solicitações de férias para aprovação"><thead><tr>{cabecalhos.map(c => <th key={c.rotulo} aria-sort={!c.campo ? undefined : ordem.campo===c.campo ? (ordem.desc ? 'descending':'ascending') : 'none'}>{c.campo ? <button type="button" onClick={() => mudarOrdem(c.campo!)}>{c.rotulo}<i className="pi pi-sort-alt" aria-hidden="true" /></button> : c.rotulo}</th>)}</tr></thead><tbody>{visiveis.map(r => {
      const situacao=situacaoAprovacao(r)!,expirado=!!r.dataLimiteValidacaoChefia && hoje>r.dataLimiteValidacaoChefia && situacao==='Pendente';
      const acao=(a:'validar'|'rejeitar') => loteAprovacao(r) ? onAlterarStatusLote(r.loteId!,a) : onAlterarStatus(r,a);
      return <tr key={r.id}><td><strong>{r.servidorNome}</strong>{loteAprovacao(r) && <small>Avaliação em bloco · {r.loteId}</small>}</td><td>{r.matricula} / {r.numeroVinculo || '—'}</td><td>{r.orgao}</td><td>{r.setor}</td><td>{r.parcelas.map(p => <span className="fa-period" key={p.id}>{dataBrAprovacao(p.inicio)} a<br />{dataBrAprovacao(p.fim)}</span>)}</td><td>{diasAprovacao(r)}</td><td><span className={`fa-tag ${r.tipo==='Recesso' ? 'fa-tag-recesso':'fa-tag-individual'}`}>{tipoAprovacao(r)}</span></td><td><span className={`fa-tag fa-status-${situacao.toLowerCase()}`}>{situacao}</span></td><td className={expirado ? 'fa-expired':''}>{dataBrAprovacao(r.dataLimiteValidacaoChefia)}{expirado && <small><i className="pi pi-exclamation-triangle" aria-hidden="true" />Prazo expirado</small>}</td><td><div className="fa-row-actions"><button type="button" className="fa-view" aria-label={`Visualizar ${r.servidorNome}`} title="Visualizar" onClick={() => onVisualizar(r)}><i className="pi pi-eye" aria-hidden="true" /></button>{situacao==='Pendente' && <><button type="button" className="fa-reject" aria-label={`Rejeitar ${loteAprovacao(r) ? 'lote de ' : ''}${r.servidorNome}`} title={loteAprovacao(r) ? 'Rejeitar lote completo':'Rejeitar'} onClick={() => acao('rejeitar')}><i className="pi pi-times" aria-hidden="true" /></button><button type="button" className="fa-validate" aria-label={`Validar ${loteAprovacao(r) ? 'lote de ' : ''}${r.servidorNome}`} title={loteAprovacao(r) ? 'Validar lote completo':'Validar'} onClick={() => acao('validar')}><i className="pi pi-check" aria-hidden="true" /></button></>}</div></td></tr>;
    })}{!visiveis.length && <tr><td colSpan={10} className="fa-empty">Nenhuma solicitação encontrada para os filtros aplicados.</td></tr>}</tbody></table></div>
    <footer className="fa-pagination"><span>Mostrando {visiveis.length} de {dados.length} solicitações</span><nav aria-label="Paginação de aprovações"><button type="button" disabled={atual===1} onClick={() => setPagina(atual-1)}>Anterior</button><button type="button" aria-current="page">{atual}</button><button type="button" disabled={atual===paginas} onClick={() => setPagina(atual+1)}>Próxima</button></nav></footer>
  </section>;
}
