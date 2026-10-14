import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { SITUACOES, pendente, type RegistroDashboard } from './dashboardIngressoModel';

const orgaos = (registros: RegistroDashboard[]) => [...new Set(registros.map(r => r.orgao))].sort((a,b) => a.localeCompare(b,'pt-BR')).join(', ');
const normalizar = (valor: string) => valor.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
export function agruparPendenciasPorEdital(dados: RegistroDashboard[]) {
  const grupos = new Map<number,RegistroDashboard[]>();
  const vistos = new Set<string>();
  dados.filter(pendente).forEach(r => {
    if (vistos.has(r.id)) return;
    vistos.add(r.id);
    grupos.set(r.editalId,[...(grupos.get(r.editalId)||[]),r]);
  });
  return [...grupos.values()].map(registros => {
    const detalhes = new Map<string,RegistroDashboard[]>();
    registros.forEach(r => { const key=JSON.stringify([r.cargo,r.orgao]); detalhes.set(key,[...(detalhes.get(key)||[]),r]); });
    return { edital:registros[0], registros, detalhes:[...detalhes.values()].sort((a,b) => b.length-a.length || a[0].cargo.localeCompare(b[0].cargo,'pt-BR')) };
  }).sort((a,b) => b.registros.length-a.registros.length || a.edital.edital.localeCompare(b.edital.edital,'pt-BR'));
}
function acao(registro: RegistroDashboard, detalhe = false) {
  const params = new URLSearchParams({pendentes:'1'});
  if (detalhe) { params.set('cargo',registro.cargo);params.set('orgao',registro.orgao); }
  return `/prototipos/sigep/ingressos-teste/${registro.editalId}?${params}`;
}
export function IngressosPendentesPorEdital({ dados }: { dados: RegistroDashboard[] }) {
  const [busca,setBusca]=useState('');
  const [ordem,setOrdem]=useState('quantidade');
  const [pagina,setPagina]=useState(1);
  const [todos,setTodos]=useState(false);
  const [expandidos,setExpandidos]=useState<number[]>([]);
  const contexto=dados.map(r => r.id).join('|');
  useEffect(() => { setPagina(1);setExpandidos([]); },[contexto]);
  const grupos=agruparPendenciasPorEdital(dados).filter(g => normalizar(`${g.edital.edital} ${g.edital.processo} ${g.registros.map(r => `${r.cargo} ${r.orgao}`).join(' ')}`).includes(normalizar(busca)))
    .sort((a,b) => ordem==='edital' ? a.edital.edital.localeCompare(b.edital.edital,'pt-BR') : b.registros.length-a.registros.length);
  const paginas=Math.max(1,Math.ceil(grupos.length/10));
  const paginaAtual=Math.min(pagina,paginas);
  return <section className="di-panel di-pending-panel">
    <header><h2>Ingressos Pendentes por Edital</h2><span>Acompanhe os editais que possuem ingressos em andamento e suas respectivas pendências.</span></header>
    <div className="di-table-tools"><input aria-label="Pesquisar pendências" placeholder="Pesquisar edital, cargo ou órgão..." value={busca} onChange={e => {setBusca(e.target.value);setPagina(1);}} /><label>Ordenar por<select value={ordem} onChange={e => {setOrdem(e.target.value);setPagina(1);}}><option value="quantidade">Ingressos Pendentes</option><option value="edital">Edital</option></select></label><button type="button" onClick={() => setTodos(!todos)}>{todos?'Paginar':'Ver todos'}</button></div>
    <div className="di-table-wrap"><table aria-label="Ingressos Pendentes por Edital"><thead><tr><th>Edital</th><th>Tipo de Ingresso</th><th>Órgão/Entidade</th><th>Total de Ingressos Pendentes</th><th>Ações</th></tr></thead><tbody>
      {(todos?grupos:grupos.slice((paginaAtual-1)*10,paginaAtual*10)).map(g => {
        const r=g.edital;const expandido=expandidos.includes(r.editalId);
        const situacoes=SITUACOES.filter(s => ['Aguardando Analise','Em analise','Aguardando análise documento','Aguardando Efetivo Exercicio','Aguardando Termo Assinado','Posse Suspensa'].includes(s.value) && (!s.tipo || s.tipo===r.tipo));
        return <Fragment key={r.editalId}><tr><td><button type="button" className="di-expand-edital" aria-label={`${expandido?'Recolher':'Expandir'} ${r.edital}`} aria-expanded={expandido} aria-controls={`di-edital-${r.editalId}`} onClick={() => setExpandidos(atual => expandido?atual.filter(id => id!==r.editalId):[...atual,r.editalId])}><i className={`pi ${expandido?'pi-chevron-down':'pi-chevron-right'}`} aria-hidden="true" /></button>{r.edital}</td><td>{r.tipo==='Concurso'?'Concurso Público':r.tipo}</td><td>{orgaos(g.registros)}</td><td><strong className="di-pending-number">{g.registros.length}</strong></td><td><Link className="di-view-edital" to={acao(r)} title="Visualizar ingressos" aria-label={`Visualizar ingressos do ${r.edital}`}><i className="pi pi-eye" aria-hidden="true" /></Link></td></tr>
          {expandido && <tr className="di-edital-expanded"><td colSpan={5}><div id={`di-edital-${r.editalId}`} className="di-edital-details"><table aria-label={`Pendências por cargo do ${r.edital}`}><thead><tr><th>Cargo/Especialidade</th><th>Órgão/Entidade</th>{situacoes.map(s => <th key={s.value}>{s.label}</th>)}<th>Total de Pendentes</th><th>Ação</th></tr></thead><tbody>{g.detalhes.map(registros => { const cargo=registros[0];return <tr key={JSON.stringify([cargo.cargo,cargo.orgao])}><td>{cargo.cargo||'Não informado'}</td><td>{cargo.orgao}</td>{situacoes.map(s => <td key={s.value}>{registros.filter(item => item.situacao===s.value).length}</td>)}<td><strong className="di-pending-number">{registros.length}</strong></td><td><Link className="di-view-edital" to={acao(cargo,true)} aria-label={`Visualizar ingressos de ${cargo.cargo} em ${cargo.orgao}`} title="Visualizar ingressos"><i className="pi pi-eye" aria-hidden="true" /></Link></td></tr>;})}</tbody></table></div></td></tr>}
        </Fragment>;
      })}
    </tbody></table></div>
    {!grupos.length && <p className="di-empty">Nenhuma pendência para os filtros selecionados.</p>}
    {!todos && <div className="di-pagination"><button type="button" disabled={paginaAtual===1} onClick={() => {setPagina(paginaAtual-1);setExpandidos([]);}}>Anterior</button><span>{paginaAtual} de {paginas}</span><button type="button" disabled={paginaAtual===paginas} onClick={() => {setPagina(paginaAtual+1);setExpandidos([]);}}>Próxima</button></div>}
  </section>;
}
