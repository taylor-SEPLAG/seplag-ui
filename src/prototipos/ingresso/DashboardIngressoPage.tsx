import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PrototypeSystemPage, menuGestaoPessoas, estiloTagSituacaoIngresso, type IngressoSituacao } from '../PrototiposPage';
import { BreadcrumbSeplag } from '../../componentes/Breadcrumb';
import { BASE_DASHBOARD, SITUACOES, lerDadosDashboard, filtrarDados, filtrosIniciais, resumirDados, agrupar, pendente, urlConsulta, type FiltrosDashboard, type RegistroDashboard } from './dashboardIngressoModel';
import './dashboardIngresso.css';
import { IngressosPendentesPorEdital } from './IngressosPendentesPorEdital';

import { exportarDashboardIngresso } from './exportarDashboardIngresso';

const n = (value: number) => value.toLocaleString('pt-BR');
const dataBr = (value: string) => value ? value.split('-').reverse().join('/') : 'Não informada';
const statusInfo = (value: string) => SITUACOES.find(s => s.value === value)!;
const labels = ['Concursos em Andamento', 'Processos Seletivos em Andamento', 'Total de Ingressados', 'Total de Ingressos Pendentes', 'Encerrados sem Ingresso', 'Total de Posses Suspensas', 'Total de Posses Negadas', 'Total de Ingressos Tornados sem Efeito', 'Total de Exonerações de Ofício', 'Total de Ingressos Cancelados'];
const cores = ['#0D6EFD','#7B1FE0','#0B6B3A','#FF6A00','#506784','#7B1FE0','#DC162C','#506784','#486580','#E52D3C'];
const icons = ['pi-building','pi-users','pi-user-plus','pi-clock','pi-folder','pi-pause-circle','pi-ban','pi-minus-circle','pi-sign-out','pi-times-circle'];
const descriptions = ['Editais de concurso com ingressos pendentes.', 'Editais seletivos com ingressos pendentes.', 'Ingressos concluídos no sistema.', 'Inclui processos suspensos passíveis de continuidade.', 'Situações definitivas de encerramento.', 'Prazos de posse pausados.', 'Processos encerrados por negativa.', 'Atos tornados sem efeito.', 'Encerrados por exoneração de ofício.', 'Processos cancelados.'];
const cor = (value: string) => ({ '--di-cor': value }) as CSSProperties;
const estiloTag = (situacao: IngressoSituacao): CSSProperties => {
  const estilo = estiloTagSituacaoIngresso(situacao);
  return { ...cor(estilo.color), color: estilo.color, background: estilo.bg, borderColor: estilo.border };
};
const unique = (valores: string[]) => [...new Set(valores)].filter(Boolean).sort((a,b) => a.localeCompare(b,'pt-BR'));

function LegendaTipos({ tipo, verde = false, azul = '#0D6EFD' }: { tipo: string; verde?: boolean; azul?: string }) {
  return <div className="di-chart-legend">
    {tipo !== 'Processo Seletivo' && <span className="di-legend-concurso"><i style={{background:verde ? '#0B6B3A' : azul}} />Concurso Público</span>}
    {tipo !== 'Concurso' && <span className="di-legend-seletivo"><i style={{background:verde ? '#00A6B2' : '#7B1FE0'}} />Processo Seletivo</span>}
  </div>;
}
function GraficoBarras({ titulo, registros, campo, filtros, verde = false }: { titulo: string; registros: RegistroDashboard[]; campo: 'cargo'|'orgao'|'edital'; filtros: FiltrosDashboard; verde?: boolean }) {
  const [todos, setTodos] = useState(false);
  const grupos = agrupar(registros,campo);
  const max = Math.max(1,...grupos.map(g => g.total));
  return <section className="di-panel"><header><h2>{titulo}</h2><span>Ingressos concluídos</span></header>
    {!grupos.length ? <p className="di-empty">Nenhum ingresso concluído para os filtros selecionados.</p> : <div className="di-bars">{(todos ? grupos : grupos.slice(0,10)).map(g => {
      const href = campo === 'edital' ? `/prototipos/sigep/ingressos-teste/${g.itens[0].editalId}` : urlConsulta(filtros,{ [campo]: g.nome, situacao: 'Ingresso Concluído' });
      const tooltip = g.itens.reduce<Record<string,number>>((acc,r) => { const chave = `${r.edital} · ${r.tipo}`; acc[chave]=(acc[chave]||0)+1; return acc; },{});
      return <Link className="di-bar-row" key={g.nome} to={href} title={`${g.nome}\n${Object.entries(tooltip).map(([k,v]) => `${k}: ${v}`).join('\n')}`} aria-label={`Consultar ${g.nome}: ${g.total} ingressados`}>
        <span className="di-bar-label">{g.nome}</span><span className="di-bar-track"><span className="di-bar-segment" style={{ width: `${g.concurso/max*100}%`, background: verde ? '#0B6B3A' : '#0D6EFD' }} /><span className="di-bar-segment" style={{ width: `${g.seletivo/max*100}%`, background: verde ? '#00A6B2' : '#7B1FE0' }} /></span><strong>{n(g.total)}</strong>
      </Link>;
    })}</div>}
    <LegendaTipos tipo={filtros.tipo} verde={verde} />
    {grupos.length > 10 && <button type="button" className="di-text-button" onClick={() => setTodos(!todos)}>{todos ? 'Mostrar os 10 primeiros' : `Consultar os demais ${campo === 'orgao' ? 'órgãos' : campo === 'edital' ? 'editais' : 'cargos'}`}</button>}
  </section>;
}

export function DashboardIngressoPage() {
  const [params] = useSearchParams();
  const [registros,setRegistros] = useState(lerDadosDashboard);
  const [atualizado,setAtualizado] = useState(() => new Date());
  const [filtros,setFiltros] = useState<FiltrosDashboard>(() => ({ ...Object.fromEntries(Object.keys(filtrosIniciais).map(k => [k,params.get(k)||''])), tipo: params.get('tipo') ?? (params.get('view') === 'consulta' ? '' : 'Concurso') }) as FiltrosDashboard);
  const [pagina,setPagina] = useState(1);
  const [exportando,setExportando] = useState(false);
  const [erroExportacao,setErroExportacao] = useState('');
  const consulta = params.get('view') === 'consulta';
  const atualizar = () => { setRegistros(lerDadosDashboard()); setAtualizado(new Date()); };
  useEffect(() => { window.addEventListener('focus',atualizar); window.addEventListener('storage',atualizar); return () => { window.removeEventListener('focus',atualizar); window.removeEventListener('storage',atualizar); }; },[]);
  useEffect(() => { setFiltros(({ ...Object.fromEntries(Object.keys(filtrosIniciais).map(k => [k,params.get(k)||''])), tipo: params.get('tipo') ?? (params.get('view') === 'consulta' ? '' : 'Concurso') }) as FiltrosDashboard); setPagina(1); },[params]);
  const alterar = (campo: keyof FiltrosDashboard, valor: string) => { setFiltros(f => ({...f,[campo]:valor})); setPagina(1); };
  const tipoAtivo = filtros.tipo;
  const dados = filtrarDados(registros,consulta ? filtros : {...filtros,tipo:tipoAtivo});
  const exportar = async () => {
    setExportando(true); setErroExportacao('');
    try { await exportarDashboardIngresso(registros, consulta ? filtros : {...filtros,tipo:tipoAtivo}); }
    catch { setErroExportacao('Não foi possível exportar o Excel. Tente novamente.'); }
    finally { setExportando(false); }
  };
  const concluidos = dados.filter(r => r.situacao === 'Ingresso Concluído');
  const resumo = resumirDados(filtrarDados(registros,{...filtros,tipo:'',situacao:'',pendentes:''}));
  const situacoes = SITUACOES.filter(s => (!filtros.tipo || !s.tipo || s.tipo === filtros.tipo) && (s.value !== 'Encerrado por desistência' || dados.some(r => r.situacao === s.value)));
  const distribuicao = situacoes.map(s => ({ ...s, total: dados.filter(r => r.situacao === s.value).length }));
  let acumulado = 0;
  const gradient = distribuicao.filter(s => s.total).map(s => { const inicio = acumulado; acumulado += s.total/Math.max(1,dados.length)*100; return `${s.color} ${inicio}% ${acumulado}%`; }).join(',');
  const anos = agrupar(concluidos,'conclusao').sort((a,b) => a.nome.localeCompare(b.nome));
  const maxAno = Math.max(1,...anos.map(a => a.total));
  const paginas = Math.max(1,Math.ceil(dados.length/10));
  const paginaAtual = Math.min(pagina,paginas);
  const hoje = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Cuiaba',year:'numeric',month:'2-digit',day:'2-digit'}).format(atualizado);
  const alertas = dados.filter(pendente).flatMap(r => {
    const lista: {r:RegistroDashboard; texto:string; color:string; icon:string}[] = [];
    if (['Aguardando Analise','Posse Suspensa','Aguardando Efetivo Exercicio','Aguardando Termo Assinado'].includes(r.situacao)) { const info=statusInfo(r.situacao); lista.push({r,texto:`${info.label} · ${dataBr(r.inicio)}`,color:r.situacao === 'Posse Suspensa' ? '#8526DD' : r.situacao === 'Aguardando Analise' ? '#FF8A00' : '#0D6EFD',icon:info.icon}); }
    if (r.tipo === 'Concurso' && ['Aguardando Analise','Em analise'].includes(r.situacao) && r.limitePosse) {
      const dias = Math.round((Date.parse(r.limitePosse)-Date.parse(hoje))/86400000);
      if (dias <= 5) lista.push({r,texto:dias < 0 ? `Prazo de posse vencido em ${dataBr(r.limitePosse)}` : `Prazo de posse vence em ${dias} dia(s) · ${dataBr(r.limitePosse)}`,color:dias < 0 ? '#DC162C' : '#FF8A00',icon:'pi-exclamation-triangle'});
    }
    if (r.tipo === 'Concurso' && r.situacao === 'Aguardando Efetivo Exercicio' && r.limiteEfetivoExercicio) {
      const dias = Math.round((Date.parse(r.limiteEfetivoExercicio)-Date.parse(hoje))/86400000);
      if (dias <= 5) lista.push({r,texto:dias < 0 ? `Prazo de efetivo exercício vencido há ${Math.abs(dias)} dia(s) · Limite ${dataBr(r.limiteEfetivoExercicio)}` : `Prazo de efetivo exercício vence em ${dias} dia(s) · Limite ${dataBr(r.limiteEfetivoExercicio)}`,color:dias < 0 ? '#DC162C' : '#FF8A00',icon:'pi-exclamation-triangle'});
    }
    return lista;
  }).sort((a,b) => Number(b.color === '#DC162C')-Number(a.color === '#DC162C'));
  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}><main className="di-page"><div className="di-page-frame">
    <BreadcrumbSeplag divided items={[{label:'Ingresso',to:'/prototipos/sigep/ingresso'},{label:'Gestão de Ingresso',to:'/prototipos/sigep/ingressos-teste'},{label:consulta ? 'Consulta de ingressos' : 'Dashboard'}]} />
    <header className="di-heading"><div><h1>{consulta ? 'Consulta de ingressos' : 'Dashboard do Ingresso'}</h1><p>Visão geral dos concursos, processos seletivos e do andamento dos ingressos no sistema.</p></div><div className="di-update"><small>Última atualização: {atualizado.toLocaleString('pt-BR',{timeZone:'America/Cuiaba'})}</small><div className="di-update-actions"><button type="button" onClick={atualizar}><i className="pi pi-refresh" />Atualizar dados</button><button type="button" className="di-export-excel" onClick={exportar} disabled={exportando} aria-busy={exportando}><i className="pi pi-download" aria-hidden="true" />{exportando ? 'Exportando...' : 'Exportar Excel'}</button></div></div></header>{erroExportacao && <p role="alert">{erroExportacao}</p>}
    <section className="di-filters" aria-label="Filtros do dashboard">
      <label>Tipo de Ingresso<select value={filtros.tipo} onChange={e => alterar('tipo',e.target.value)}><option value="">Todos</option><option value="Concurso">Concurso Público</option><option>Processo Seletivo</option></select></label>
      <label>Edital<select value={filtros.edital} onChange={e => alterar('edital',e.target.value)}><option value="">Todos</option>{[...new Map(registros.map(r => [r.editalId,r])).values()].map(r => <option key={r.editalId} value={r.editalId}>{r.edital} · {r.tipo}</option>)}</select></label>
      <label>Órgão/Entidade<select value={filtros.orgao} onChange={e => alterar('orgao',e.target.value)}><option value="">Todos</option>{unique(registros.map(r => r.orgao)).map(o => <option key={o}>{o}</option>)}</select></label>
      <label>Cargo/Especialidade<input list="di-cargos" placeholder="Pesquisar cargo..." value={filtros.cargo} onChange={e => alterar('cargo',e.target.value)} /><datalist id="di-cargos">{unique(registros.map(r => r.cargo)).map(c => <option key={c} value={c} />)}</datalist></label>
      <label>Período inicial<input type="date" value={filtros.inicio} onChange={e => alterar('inicio',e.target.value)} /></label><label>Período final<input type="date" min={filtros.inicio||undefined} value={filtros.fim} onChange={e => alterar('fim',e.target.value)} /></label>
      <button type="button" className="di-clear" onClick={() => {setFiltros({...filtrosIniciais,tipo:consulta ? '' : tipoAtivo});setPagina(1);}}>Limpar filtros</button>
    </section>
    {filtros.inicio && filtros.fim && filtros.inicio > filtros.fim && <p role="alert" className="di-empty">A data final deve ser igual ou posterior à data inicial.</p>}
    {consulta ? <section className="di-panel"><header><h2>Ingressos encontrados · {n(dados.length)}</h2><Link to={BASE_DASHBOARD}>Voltar ao dashboard</Link></header><label>Situação<select value={filtros.situacao} onChange={e => alterar('situacao',e.target.value)}><option value="">Todas</option>{SITUACOES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></label>
      <div className="di-table-wrap"><table><thead><tr><th>Servidor</th><th>Cargo/Especialidade</th><th>Órgão/Entidade</th><th>Edital</th><th>Tipo de Ingresso</th><th>Situação</th><th>Ação</th></tr></thead><tbody>{dados.slice((paginaAtual-1)*10,paginaAtual*10).map(r => <tr key={r.id}><td>{r.nome}</td><td>{r.cargo}</td><td>{r.orgao}</td><td>{r.edital}</td><td>{r.tipo}</td><td><span className="di-tag" style={estiloTag(r.situacao)}>{statusInfo(r.situacao).label}</span></td><td><Link to={r.url}>Consultar ingresso</Link></td></tr>)}</tbody></table></div>{!dados.length && <p className="di-empty">Nenhum ingresso encontrado para os filtros selecionados.</p>}<div className="di-pagination"><button disabled={paginaAtual===1} onClick={() => setPagina(paginaAtual-1)}>Anterior</button><span>{paginaAtual} de {paginas}</span><button disabled={paginaAtual===paginas} onClick={() => setPagina(paginaAtual+1)}>Próxima</button></div>
    </section> : <>
    <h2 className="di-section-title">Visão geral</h2><section className="di-kpis" aria-label="Indicadores gerais">{labels.slice(0,5).map((label,i) => <article key={label} style={cor(cores[i])}><i className={`pi ${icons[i]}`} aria-hidden="true" /><div><strong>{n(resumo[i])}</strong><h3>{label}</h3><small>{descriptions[i]}</small></div><span className={`pi ${icons[i]} di-kpi-background-icon`} aria-hidden="true" /></article>)}</section>
    <div className="di-type-tabs" role="tablist" aria-label="Tipo de ingresso do dashboard">
      {(['','Concurso','Processo Seletivo'] as const).map(tipo => <button type="button" key={tipo} role="tab" id={tipo === '' ? 'di-tab-todos' : tipo === 'Concurso' ? 'di-tab-concurso' : 'di-tab-seletivo'} aria-controls="di-type-panel" aria-selected={tipoAtivo === tipo} className={tipoAtivo === tipo ? 'active' : ''} onClick={() => alterar('tipo',tipo)}><i className={`pi ${tipo === '' ? 'pi-th-large' : tipo === 'Concurso' ? 'pi-building' : 'pi-users'}`} aria-hidden="true" />{tipo === '' ? 'Todos' : tipo === 'Concurso' ? 'Concurso Público' : 'Processo Seletivo'}</button>)}
    </div>
    <div id="di-type-panel" role="tabpanel" aria-labelledby={tipoAtivo === '' ? 'di-tab-todos' : tipoAtivo === 'Concurso' ? 'di-tab-concurso' : 'di-tab-seletivo'}>
    <h2 className="di-section-title">Gráficos gerenciais</h2><div className="di-charts"><GraficoBarras titulo="Ingressados por Cargo/Especialidade" registros={concluidos} campo="cargo" filtros={filtros} /><GraficoBarras titulo="Ingressados por Órgão/Entidade" registros={concluidos} campo="orgao" filtros={filtros} verde />
      <section className="di-panel"><header><h2>Ingressados por Ano</h2><span>Data efetiva de conclusão</span></header>{!anos.length ? <p className="di-empty">Nenhum ingresso concluído com data informada.</p> : <div className="di-columns">{anos.map(a => <Link key={a.nome} to={urlConsulta(filtros,{situacao:'Ingresso Concluído',inicio:`${a.nome}-01-01`,fim:`${a.nome}-12-31`})} title={`${a.nome}: Concurso Público ${a.concurso}; Processo Seletivo ${a.seletivo}; total ${a.total}`}><strong>{n(a.total)}</strong><span className="di-column-stack" style={{height:`${a.total/maxAno*150}px`}}><i style={{flex:a.seletivo,background:'#7B1FE0'}} /><i style={{flex:a.concurso,background:'#0D6EFD'}} /></span><span>{a.nome}</span></Link>)}</div>}<LegendaTipos tipo={tipoAtivo} azul="#0D6EFD" /></section>

      <GraficoBarras titulo="Ingressados por Edital" registros={concluidos} campo="edital" filtros={filtros} />
      <section className="di-panel di-distribution"><header><h2>Situação do Ingresso</h2><span>Distribuição sem duplicidade</span></header><div className="di-donut-layout"><div className="di-donut" role="img" title={distribuicao.map(s => `${s.label}: ${s.total}`).join("; ")} aria-label={`Distribuição de ${dados.length} ingressos por situação`} style={{background:gradient ? `conic-gradient(${gradient})` : '#e5eaf0'}}><div><strong>{n(dados.length)}</strong><small>ingressos</small></div></div><div className="di-distribution-legend">{distribuicao.map(s => <Link to={urlConsulta(filtros,{situacao:s.value})} key={s.value} title={`${s.label}: ${s.total} ingressos (${(dados.length ? s.total / dados.length * 100 : 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%)`}><i style={{background:s.color}} /><span>{s.label}</span><strong>{n(s.total)}</strong><small>{(dados.length?s.total/dados.length*100:0).toLocaleString('pt-BR',{maximumFractionDigits:1})}%</small></Link>)}</div></div></section>


    </div>
    <section className="di-panel"><header><h2>Alertas do Ingresso</h2><span>Prazos de posse suspensos não geram alertas de vencimento</span></header><div className="di-alerts">{alertas.map((a,i) => <Link key={`${a.r.id}-${i}`} to={a.r.url} style={cor(a.color)}><i className={`pi ${a.icon}`} /><div><strong>{a.texto}</strong><span>{a.r.nome} · {a.r.edital} · {a.r.cargo}</span></div><i className="pi pi-arrow-right" /></Link>)}</div>{!alertas.length && <p className="di-empty">Nenhum alerta para os filtros selecionados.</p>}</section>
    <IngressosPendentesPorEdital dados={dados} />

    </div></>}
  </div></main></PrototypeSystemPage>;
}
