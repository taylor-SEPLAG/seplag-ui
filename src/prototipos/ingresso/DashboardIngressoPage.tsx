import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PrototypeSystemPage, menuGestaoPessoas } from '../PrototiposPage';
import { BreadcrumbSeplag } from '../../componentes/Breadcrumb';
import { BASE_DASHBOARD, SITUACOES, lerDadosDashboard, filtrarDados, filtrosIniciais, resumirDados, agrupar, pendente, urlConsulta, type FiltrosDashboard, type RegistroDashboard } from './dashboardIngressoModel';
import './dashboardIngresso.css';

const n = (value: number) => value.toLocaleString('pt-BR');
const dataBr = (value: string) => value ? value.split('-').reverse().join('/') : 'Não informada';
const statusInfo = (value: string) => SITUACOES.find(s => s.value === value)!;
const labels = ['Concursos em Andamento', 'Processos Seletivos em Andamento', 'Total de Ingressados', 'Total de Ingressos Pendentes', 'Total de Encerrados sem Ingresso', 'Total de Posses Suspensas', 'Total de Posses Negadas', 'Total de Ingressos Tornados sem Efeito', 'Total de Exonerações de Ofício', 'Total de Ingressos Cancelados'];
const cores = ['#1976d2','#753ac4','#15834f','#df7908','#63758a','#753ac4','#c92e42','#63758a','#43667d','#dc3545'];
const icons = ['pi-building','pi-users','pi-user-plus','pi-clock','pi-folder','pi-pause-circle','pi-ban','pi-minus-circle','pi-sign-out','pi-times-circle'];
const descriptions = ['Editais de concurso com ingressos pendentes.', 'Editais seletivos com ingressos pendentes.', 'Ingressos concluídos no sistema.', 'Inclui processos suspensos passíveis de continuidade.', 'Situações definitivas de encerramento.', 'Prazos de posse pausados.', 'Processos encerrados por negativa.', 'Atos tornados sem efeito.', 'Encerrados por exoneração de ofício.', 'Processos cancelados.'];
const cor = (value: string) => ({ '--di-cor': value }) as CSSProperties;
const unique = (valores: string[]) => [...new Set(valores)].filter(Boolean).sort((a,b) => a.localeCompare(b,'pt-BR'));

function GraficoBarras({ titulo, registros, campo, filtros, verde = false }: { titulo: string; registros: RegistroDashboard[]; campo: 'cargo'|'orgao'|'edital'; filtros: FiltrosDashboard; verde?: boolean }) {
  const [todos, setTodos] = useState(false);
  const grupos = agrupar(registros,campo);
  const max = Math.max(1,...grupos.map(g => g.total));
  return <section className="di-panel"><header><h2>{titulo}</h2><span>Ingressos concluídos</span></header>
    {!grupos.length ? <p className="di-empty">Nenhum ingresso concluído para os filtros selecionados.</p> : <div className="di-bars">{(todos ? grupos : grupos.slice(0,10)).map(g => {
      const href = campo === 'edital' ? `/prototipos/sigep/ingressos-teste/${g.itens[0].editalId}` : urlConsulta(filtros,{ [campo]: g.nome, situacao: 'Ingresso Concluído' });
      const tooltip = g.itens.reduce<Record<string,number>>((acc,r) => { const chave = `${r.edital} · ${r.tipo}`; acc[chave]=(acc[chave]||0)+1; return acc; },{});
      return <Link className="di-bar-row" key={g.nome} to={href} title={`${g.nome}\n${Object.entries(tooltip).map(([k,v]) => `${k}: ${v}`).join('\n')}`} aria-label={`Consultar ${g.nome}: ${g.total} ingressados`}>
        <span className="di-bar-label">{g.nome}</span><span className="di-bar-track"><span className="di-bar-segment" style={{ width: `${g.concurso/max*100}%`, background: verde ? '#15834f' : '#1976d2' }} /><span className="di-bar-segment" style={{ width: `${g.seletivo/max*100}%`, background: verde ? '#08a5a2' : '#753ac4' }} /></span><strong>{n(g.total)}</strong>
      </Link>;
    })}</div>}
    <div className="di-chart-legend"><span><i style={{background: verde ? '#15834f' : '#1976d2'}} />Concurso Público</span><span><i style={{background: verde ? '#08a5a2' : '#753ac4'}} />Processo Seletivo</span></div>
    {grupos.length > 10 && <button type="button" className="di-text-button" onClick={() => setTodos(!todos)}>{todos ? 'Mostrar os 10 primeiros' : `Consultar os demais ${campo === 'orgao' ? 'órgãos' : campo === 'edital' ? 'editais' : 'cargos'}`}</button>}
  </section>;
}

export function DashboardIngressoPage() {
  const [params] = useSearchParams();
  const [registros,setRegistros] = useState(lerDadosDashboard);
  const [atualizado,setAtualizado] = useState(() => new Date());
  const [filtros,setFiltros] = useState<FiltrosDashboard>(() => Object.fromEntries(Object.keys(filtrosIniciais).map(k => [k,params.get(k)||''])) as FiltrosDashboard);
  const [busca,setBusca] = useState('');
  const [pagina,setPagina] = useState(1);
  const [ordem,setOrdem] = useState<'quantidade'|'cargo'>('quantidade');
  const [mostrarTodos,setMostrarTodos] = useState(false);
  const consulta = params.get('view') === 'consulta';
  const atualizar = () => { setRegistros(lerDadosDashboard()); setAtualizado(new Date()); };
  useEffect(() => { window.addEventListener('focus',atualizar); window.addEventListener('storage',atualizar); return () => { window.removeEventListener('focus',atualizar); window.removeEventListener('storage',atualizar); }; },[]);
  useEffect(() => { setFiltros(Object.fromEntries(Object.keys(filtrosIniciais).map(k => [k,params.get(k)||''])) as FiltrosDashboard); setPagina(1); },[params]);
  const alterar = (campo: keyof FiltrosDashboard, valor: string) => { setFiltros(f => ({...f,[campo]:valor,...(campo === 'tipo' ? { edital: '' } : {})})); setPagina(1); };
  const dados = filtrarDados(registros,filtros);
  const concluidos = dados.filter(r => r.situacao === 'Ingresso Concluído');
  const resumo = resumirDados(dados);
  const situacoes = SITUACOES.filter(s => (!filtros.tipo || !s.tipo || s.tipo === filtros.tipo) && (s.value !== 'Encerrado por desistência' || dados.some(r => r.situacao === s.value)));
  const distribuicao = situacoes.map(s => ({ ...s, total: dados.filter(r => r.situacao === s.value).length }));
  let acumulado = 0;
  const gradient = distribuicao.filter(s => s.total).map(s => { const inicio = acumulado; acumulado += s.total/Math.max(1,dados.length)*100; return `${s.color} ${inicio}% ${acumulado}%`; }).join(',');
  const anos = agrupar(concluidos,'conclusao').sort((a,b) => a.nome.localeCompare(b.nome));
  const maxAno = Math.max(1,...anos.map(a => a.total));
  const gruposPendentes = new Map<string,RegistroDashboard[]>();
  dados.filter(pendente).forEach(r => { const key = `${r.cargo}|${r.orgao}|${r.editalId}|${r.tipo}`; gruposPendentes.set(key,[...(gruposPendentes.get(key)||[]),r]); });
  const linhas = [...gruposPendentes.values()].filter(rs => `${rs[0].cargo} ${rs[0].orgao} ${rs[0].edital}`.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR')))
    .sort((a,b) => ordem === 'cargo' ? a[0].cargo.localeCompare(b[0].cargo,'pt-BR') : b.length-a.length);
  const paginas = Math.max(1,Math.ceil((consulta ? dados.length : linhas.length)/10));
  const paginaAtual = Math.min(pagina,paginas);
  const hoje = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Cuiaba',year:'numeric',month:'2-digit',day:'2-digit'}).format(atualizado);
  const alertas = dados.filter(pendente).flatMap(r => {
    const lista: {r:RegistroDashboard; texto:string; color:string; icon:string}[] = [];
    if (['Aguardando Analise','Posse Suspensa','Aguardando Efetivo Exercicio','Aguardando Termo Assinado'].includes(r.situacao)) { const info=statusInfo(r.situacao); lista.push({r,texto:info.label,color:info.color,icon:info.icon}); }
    if (r.tipo === 'Concurso' && ['Aguardando Analise','Em analise'].includes(r.situacao) && r.limitePosse) {
      const dias = Math.round((Date.parse(r.limitePosse)-Date.parse(hoje))/86400000);
      if (dias <= 5) lista.push({r,texto:dias < 0 ? `Prazo de posse vencido em ${dataBr(r.limitePosse)}` : `Prazo de posse vence em ${dias} dia(s) · ${dataBr(r.limitePosse)}`,color:dias < 0 ? '#c92e42' : '#df7908',icon:'pi-exclamation-triangle'});
    }
    return lista;
  }).sort((a,b) => Number(b.color === '#c92e42')-Number(a.color === '#c92e42'));
  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}><main className="di-page"><div className="di-page-frame">
    <BreadcrumbSeplag divided items={[{label:'Ingresso',to:'/prototipos/sigep/ingresso'},{label:'Gestão de Ingresso',to:'/prototipos/sigep/ingressos-teste'},{label:consulta ? 'Consulta de ingressos' : 'Dashboard'}]} />
    <header className="di-heading"><div><span className="di-eyebrow">GESTÃO DE INGRESSO</span><h1>{consulta ? 'Consulta de ingressos' : 'Dashboard do Ingresso'}</h1><p>Visão geral dos concursos, processos seletivos e do andamento dos ingressos no sistema.</p></div><div className="di-update"><small>Última atualização: {atualizado.toLocaleString('pt-BR',{timeZone:'America/Cuiaba'})}</small><button type="button" onClick={atualizar}><i className="pi pi-refresh" />Atualizar dados</button></div></header>
    <section className="di-filters" aria-label="Filtros do dashboard">
      <label>Tipo de Ingresso<select value={filtros.tipo} onChange={e => alterar('tipo',e.target.value)}><option value="">Todos</option><option value="Concurso">Concurso Público</option><option>Processo Seletivo</option></select></label>
      <label>Edital<select value={filtros.edital} onChange={e => alterar('edital',e.target.value)}><option value="">Todos</option>{[...new Map(registros.filter(r => !filtros.tipo || r.tipo === filtros.tipo).map(r => [r.editalId,r])).values()].map(r => <option key={r.editalId} value={r.editalId}>{r.edital} · {r.tipo}</option>)}</select></label>
      <label>Órgão/Entidade<select value={filtros.orgao} onChange={e => alterar('orgao',e.target.value)}><option value="">Todos</option>{unique(registros.map(r => r.orgao)).map(o => <option key={o}>{o}</option>)}</select></label>
      <label>Cargo/Especialidade<input list="di-cargos" placeholder="Pesquisar cargo..." value={filtros.cargo} onChange={e => alterar('cargo',e.target.value)} /><datalist id="di-cargos">{unique(registros.map(r => r.cargo)).map(c => <option key={c} value={c} />)}</datalist></label>
      <label>Período inicial<input type="date" value={filtros.inicio} onChange={e => alterar('inicio',e.target.value)} /></label><label>Período final<input type="date" min={filtros.inicio||undefined} value={filtros.fim} onChange={e => alterar('fim',e.target.value)} /></label>
      <button type="button" className="di-clear" onClick={() => {setFiltros(filtrosIniciais);setPagina(1);setBusca('');}}>Limpar filtros</button>
    </section>
    <p className="di-period-note">Período: data de conclusão para ingressados; data da nomeação ou convocação para os demais ingressos. Datas de conclusão não informadas ficam fora dos gráficos anuais e dos filtros de período.</p>
    {filtros.inicio && filtros.fim && filtros.inicio > filtros.fim && <p role="alert" className="di-empty">A data final deve ser igual ou posterior à data inicial.</p>}
    {consulta ? <section className="di-panel"><header><h2>Ingressos encontrados · {n(dados.length)}</h2><Link to={BASE_DASHBOARD}>Voltar ao dashboard</Link></header><label>Situação<select value={filtros.situacao} onChange={e => alterar('situacao',e.target.value)}><option value="">Todas</option>{SITUACOES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></label>
      <div className="di-table-wrap"><table><thead><tr><th>Servidor</th><th>Cargo/Especialidade</th><th>Órgão/Entidade</th><th>Edital</th><th>Tipo de Ingresso</th><th>Situação</th><th>Ação</th></tr></thead><tbody>{dados.slice((paginaAtual-1)*10,paginaAtual*10).map(r => <tr key={r.id}><td>{r.nome}</td><td>{r.cargo}</td><td>{r.orgao}</td><td>{r.edital}</td><td>{r.tipo}</td><td><span className="di-tag" style={cor(statusInfo(r.situacao).color)}>{statusInfo(r.situacao).label}</span></td><td><Link to={r.url}>Consultar ingresso</Link></td></tr>)}</tbody></table></div>{!dados.length && <p className="di-empty">Nenhum ingresso encontrado para os filtros selecionados.</p>}<div className="di-pagination"><button disabled={paginaAtual===1} onClick={() => setPagina(paginaAtual-1)}>Anterior</button><span>{paginaAtual} de {paginas}</span><button disabled={paginaAtual===paginas} onClick={() => setPagina(paginaAtual+1)}>Próxima</button></div>
    </section> : <>
    <h2 className="di-section-title">Visão geral</h2><section className="di-kpis" aria-label="Indicadores gerais">{labels.map((label,i) => <article key={label} style={cor(cores[i])}><i className={`pi ${icons[i]}`} aria-hidden="true" /><div><strong>{n(resumo[i])}</strong><h3>{label}</h3><small>{descriptions[i]}</small></div></article>)}</section>
    <h2 className="di-section-title">Andamento do Ingresso</h2><section className="di-status-grid" aria-label="Situações dos ingressos">{distribuicao.map(s => <Link key={s.value} style={cor(s.color)} to={urlConsulta(filtros,{situacao:s.value,pendentes:''})}><div><i className={`pi ${s.icon}`} aria-hidden="true" /><strong>{n(s.total)}</strong></div><h3>{s.label}</h3><p>{s.description}</p><span>Visualizar ingressos <i className="pi pi-arrow-right" /></span></Link>)}</section>
    <h2 className="di-section-title">Gráficos gerenciais</h2><div className="di-charts"><GraficoBarras titulo="Ingressados por Cargo/Especialidade" registros={concluidos} campo="cargo" filtros={filtros} /><GraficoBarras titulo="Ingressados por Órgão/Entidade" registros={concluidos} campo="orgao" filtros={filtros} verde />
      <section className="di-panel"><header><h2>Ingressados por Ano</h2><span>Data efetiva de conclusão</span></header>{!anos.length ? <p className="di-empty">Nenhum ingresso concluído com data informada.</p> : <div className="di-columns">{anos.map(a => <Link key={a.nome} to={urlConsulta(filtros,{situacao:'Ingresso Concluído',inicio:`${a.nome}-01-01`,fim:`${a.nome}-12-31`})} title={`${a.nome}: Concurso Público ${a.concurso}; Processo Seletivo ${a.seletivo}; total ${a.total}`}><strong>{n(a.total)}</strong><span className="di-column-stack" style={{height:`${a.total/maxAno*150}px`}}><i style={{flex:a.seletivo,background:'#753ac4'}} /><i style={{flex:a.concurso,background:'#1976d2'}} /></span><span>{a.nome}</span></Link>)}</div>}<div className="di-chart-legend"><span><i style={{background:'#1976d2'}} />Concurso Público</span><span><i style={{background:'#753ac4'}} />Processo Seletivo</span></div></section>
      <GraficoBarras titulo="Ingressados por Edital" registros={concluidos} campo="edital" filtros={filtros} />
      <section className="di-panel di-distribution"><header><h2>Situação do Ingresso</h2><span>Distribuição sem duplicidade</span></header><div className="di-donut-layout"><div className="di-donut" role="img" title={distribuicao.map(s => `${s.label}: ${s.total}`).join("; ")} aria-label={`Distribuição de ${dados.length} ingressos por situação`} style={{background:gradient ? `conic-gradient(${gradient})` : '#e5eaf0'}}><div><strong>{n(dados.length)}</strong><small>ingressos</small></div></div><div className="di-distribution-legend">{distribuicao.map(s => <Link to={urlConsulta(filtros,{situacao:s.value})} key={s.value} title={`${s.label}: ${s.total} ingressos (${(dados.length ? s.total / dados.length * 100 : 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%)`}><i style={{background:s.color}} /><span>{s.label}</span><strong>{n(s.total)}</strong><small>{(dados.length?s.total/dados.length*100:0).toLocaleString('pt-BR',{maximumFractionDigits:1})}%</small></Link>)}</div></div></section>
    </div>
    <section className="di-panel"><header><h2>Cargos com candidatos com ingressos ainda pendentes</h2><span>Suspensos incluídos; encerrados excluídos</span></header><div className="di-table-tools"><input aria-label="Pesquisar pendências" placeholder="Pesquisar cargo, órgão ou edital..." value={busca} onChange={e => {setBusca(e.target.value);setPagina(1);}} /><label>Ordenar por<select value={ordem} onChange={e => setOrdem(e.target.value as typeof ordem)}><option value="quantidade">Ingressos Pendentes</option><option value="cargo">Cargo/Especialidade</option></select></label><button type="button" onClick={() => setMostrarTodos(!mostrarTodos)}>{mostrarTodos?'Paginar':'Ver todos'}</button></div>
      <div className="di-table-wrap"><table><thead><tr><th>Cargo/Especialidade</th><th>Órgão/Entidade</th><th>Edital</th><th>Tipo de Ingresso</th><th>Ingressos Pendentes</th><th>Situação Predominante</th><th>Ações</th></tr></thead><tbody>{(mostrarTodos?linhas:linhas.slice((paginaAtual-1)*10,paginaAtual*10)).map(rs => {const r=rs[0];const status=SITUACOES.map(s => ({...s,count:rs.filter(x => x.situacao===s.value).length})).sort((a,b) => b.count-a.count)[0];return <tr key={`${r.cargo}-${r.orgao}-${r.editalId}`}><td>{r.cargo}</td><td>{r.orgao}</td><td>{r.edital}</td><td>{r.tipo}</td><td><strong className="di-pending-number">{rs.length}</strong></td><td><span className="di-tag" style={cor(status.color)}>{status.label}</span></td><td><Link to={urlConsulta(filtros,{cargo:r.cargo,orgao:r.orgao,edital:String(r.editalId),tipo:r.tipo,pendentes:'1'})}>Visualizar ingressos</Link></td></tr>;})}</tbody></table></div>{!linhas.length && <p className="di-empty">Nenhuma pendência para os filtros selecionados.</p>}{!mostrarTodos && <div className="di-pagination"><button disabled={paginaAtual===1} onClick={() => setPagina(paginaAtual-1)}>Anterior</button><span>{paginaAtual} de {paginas}</span><button disabled={paginaAtual===paginas} onClick={() => setPagina(paginaAtual+1)}>Próxima</button></div>}
    </section>
    <section className="di-panel"><header><h2>Alertas do Ingresso</h2><span>Prazos de posse suspensos não geram alertas de vencimento</span></header><div className="di-alerts">{alertas.map((a,i) => <Link key={`${a.r.id}-${i}`} to={a.r.url} style={cor(a.color)}><i className={`pi ${a.icon}`} /><div><strong>{a.texto}</strong><span>{a.r.nome} · {a.r.edital} · {a.r.cargo}</span></div><i className="pi pi-arrow-right" /></Link>)}</div>{!alertas.length && <p className="di-empty">Nenhum alerta para os filtros selecionados.</p>}</section>
    </>}
  </div></main></PrototypeSystemPage>;
}
