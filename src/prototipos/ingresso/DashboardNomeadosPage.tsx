import { lerRegistrosIngresso, EVENTO_DADOS_INGRESSO } from "./ingressoDados";
import { Fragment, useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { BreadcrumbSeplag } from '../../componentes/Breadcrumb';
import { PrototypeSystemPage, menuGestaoPessoas } from '../PrototiposPage';
import { useControlePssStore } from '../controlePss/controlePssStore';
import { useControleVagasStore } from '../controleVagas/controleVagasStore';

import { exportarExcelNomeados } from './exportarExcelNomeados';
import { consultarCertamesIngresso, sincronizarCertamesIngresso } from './sincronizarCertamesIngresso';
import { consultarDashboardNomeados, descricaoCargoNomeados, filtrosNomeadosVazios, type FiltrosNomeados, type LinhaNomeados } from './dashboardNomeadosModel';
import './dashboardIngresso.css';
import './dashboardNomeados.css';

const numero = (valor: number) => valor.toLocaleString('pt-BR');
const cores = ['#005996', '#6D28D9', '#166534', '#D97706'];
function GraficoNomeados({ titulo, dados }: { titulo: string; dados: ReturnType<typeof consultarDashboardNomeados>['porCargo'] }) {
  const [selecionado,setSelecionado] = useState('');
  const [tooltip,setTooltip] = useState<{id:string;texto:string} | null>(null);
  const d=dados.find(d => d.id===selecionado) ?? dados[0];
  const [agrupadoId,setAgrupadoId] = useState('');
  const agrupado=!!d && agrupadoId===d.id;
  useEffect(() => {setAgrupadoId('');setTooltip(null);},[d?.id]);
  const alternarAgrupamento=() => {if(d) setAgrupadoId(agrupado ? '' : d.id);setTooltip(null);};
  const series = [
    {campo:'totalVagas',label:'Total de Vagas',cor:'#2563EB',icone:'pi-th-large'},
    {campo:'nomeados',label:'Nomeados',cor:'#7C3AED',icone:'pi-users'},
    {campo:'ingressados',label:'Ingressados',cor:'#15945D',icone:'pi-check-circle'},
    {campo:'ingressosPendentes',label:'Pendentes',cor:'#FF812B',icone:'pi-clock'},
    {campo:'aNomear',label:'A nomear',cor:'#718AA3',icone:'pi-user-plus'},
  ] as const;
  const total=d ? d.vagas+(d.cadastroReserva ?? 0) : 0;
  const segmentos=agrupado ? [
    {campo:'agrupados',label:'Ingressados + Pendentes',cor:'#7C3AED',valor:(d?.ingressados ?? 0)+(d?.ingressosPendentes ?? 0)},
    {campo:'aNomear',label:'A nomear',cor:'#718AA3',valor:d?.aNomear ?? 0},
  ] : series.slice(2).map(serie => ({...serie,valor:d?.[serie.campo] ?? 0}));
  const inconsistente=!!d && !d.incompletas && (d.ingressados+d.ingressosPendentes>total || d.ingressados+d.ingressosPendentes+d.aNomear!==total);
  const desenhar=!!d && !d.incompletas && total>0 && !inconsistente;
  const percentual=(valor:number) => (valor/total*100).toLocaleString('pt-BR',{maximumFractionDigits:1})+'%';
  return <section className="di-panel dn-chart dn-donut-card" aria-label={titulo}>
    <header><div><h2>{titulo}</h2><span>Base: vagas + cadastro de reserva</span></div></header>
    <label className="dn-donut-select">{titulo === 'Distribuição por Edital' ? 'Selecionar edital' : 'Selecionar cargo/função'}
      <select value={d?.id ?? ''} disabled={!dados.length} onChange={e => {setSelecionado(e.target.value);setAgrupadoId('');setTooltip(null);}}>
        {!dados.length && <option value="">Nenhum registro disponível</option>}
        {dados.map(item => <option key={item.id} value={item.id}>{item.nome}{'itens' in item ? ' · '+[...new Set(item.itens.map(l => l.edital))].join(', ') : ''}</option>)}
      </select>
    </label>
    {!d ? <p className="di-empty">Nenhum registro para os filtros selecionados.</p> : <>
      <div className="dn-donut-content">
        <div className="dn-donut-visual">
          <svg viewBox="0 0 240 240" aria-label={titulo+' de '+d.nome}>
            <circle cx="120" cy="120" r="88" fill="none" stroke="#edf2f7" strokeWidth="30" />
            {desenhar && segmentos.map((serie,i) => {
              const valor=serie.valor, fracao=valor/total;
              const interativo=serie.campo!=='aNomear';
              const antes=segmentos.slice(0,i).reduce((s,anterior) => s+anterior.valor,0)/total;
              const angulo=(antes+fracao/2)*Math.PI*2-Math.PI/2;
              const rotuloExterno=interativo && fracao<.09;
              const pequenosProximos=!agrupado && rotuloExterno && d.ingressados>0 && d.ingressados/total<.09 && d.ingressosPendentes>0 && d.ingressosPendentes/total<.09;
              const deslocamentoRotulo=pequenosProximos ? (serie.campo === 'ingressados' ? -14 : 14) : 0;
              const raioRotulo=rotuloExterno ? 112 : 88;
              const texto=d.nome+'\n'+serie.label+': '+numero(valor)+' ('+percentual(valor)+')\nVagas imediatas: '+numero(d.vagas)+'\nCadastro de reserva: '+numero(d.cadastroReserva ?? 0);
              return valor>0 && <g key={serie.campo} role={interativo ? 'button' : 'img'} tabIndex={interativo ? 0 : undefined} aria-label={texto} aria-pressed={interativo ? agrupado : undefined} onClick={interativo ? alternarAgrupamento : undefined} onKeyDown={interativo ? e => {if(e.key==='Enter' || e.key===' '){e.preventDefault();alternarAgrupamento();}} : undefined} className={interativo ? 'dn-donut-toggle' : undefined}>
                <circle cx="120" cy="120" r="88" fill="none" stroke={serie.cor} strokeWidth="30" pathLength="100" strokeDasharray={fracao*100+' '+(100-fracao*100)} strokeDashoffset={-antes*100} transform="rotate(-90 120 120)"  onMouseEnter={() => setTooltip({id:d.id,texto})} onMouseLeave={() => setTooltip(null)} onFocus={() => setTooltip({id:d.id,texto})} onBlur={() => setTooltip(null)}><title>{texto}</title></circle>
                {rotuloExterno && <line x1={120+Math.cos(angulo)*103} y1={120+Math.sin(angulo)*103} x2={120+Math.cos(angulo)*107+deslocamentoRotulo} y2={120+Math.sin(angulo)*107} stroke={serie.cor} aria-hidden="true" />}
                {(fracao>=.09 || rotuloExterno) && <text x={120+Math.cos(angulo)*raioRotulo+deslocamentoRotulo} y={120+Math.sin(angulo)*raioRotulo} className="dn-donut-percentage" style={rotuloExterno ? {fill:serie.cor,paintOrder:'stroke',stroke:'#fff',strokeWidth:3} : undefined} textAnchor="middle" dominantBaseline="middle">{percentual(valor)}</text>}
              </g>;
            })}
            <text x="120" y="112" textAnchor="middle" className="dn-donut-center-label">Total de Vagas</text>
            <text x="120" y="142" textAnchor="middle" className="dn-donut-center-value">{d.incompletas ? '—' : numero(total)}</text>
          </svg>
          {tooltip?.id===d.id && <div className="dn-donut-tooltip" role="tooltip">{tooltip.texto}</div>}
        </div>
        <dl className="dn-donut-metrics">{series.map(serie => <div key={serie.campo} style={{'--dn-metric-color':serie.cor} as CSSProperties}>
          <dt><i className={'pi '+serie.icone} aria-hidden="true" />{serie.label}</dt>
          <dd>{d.incompletas && (serie.campo==='totalVagas' || serie.campo==='aNomear') ? '—' : numero(serie.campo==='totalVagas' ? total : d[serie.campo])}</dd>
        </div>)}</dl>
      </div>
      {d.incompletas ? <p className="dn-donut-message">Distribuição de vagas não disponível para o recorte selecionado. Parametrização pendente.</p> : inconsistente ? <p className="dn-donut-message" role="alert">Quantitativos inconsistentes com o total de vagas. Confira os dados antes de interpretar a distribuição.</p> : total===0 ? <p className="dn-donut-message">Nenhuma vaga cadastrada para o recorte selecionado.</p> : null}
      <div className="dn-grouped-legend dn-donut-legend">{segmentos.map(serie => <span key={serie.campo}><i style={{background:serie.cor}} />{serie.label}</span>)}</div>
    </>}
  </section>;
}

export function DashboardNomeadosPage() {
  const { certames } = useControlePssStore();
  const controleVagas = useControleVagasStore();
  const [registros, setRegistros] = useState(lerRegistrosIngresso);
  const [atualizado, setAtualizado] = useState(() => new Date());
  const [filtros, setFiltros] = useState(filtrosNomeadosVazios);
  const [pagina, setPagina] = useState(1);
  const [exportando, setExportando] = useState(false);
  const [erroExportacao, setErroExportacao] = useState('');
  const [erroSincronizacao,setErroSincronizacao] = useState('');
  const sincronizar = () => {
    try {const resultado=sincronizarCertamesIngresso();setErroSincronizacao(resultado.ambiguos.length ? `Confira os vínculos dos editais: ${resultado.ambiguos.join(', ')}.` : '');}
    catch {setErroSincronizacao('Não foi possível persistir a sincronização dos certames. Tente atualizar os dados.');}
  };
  const atualizar = () => { sincronizar();setRegistros(lerRegistrosIngresso()); setAtualizado(new Date()); };
  useEffect(() => {sincronizar();},[certames,registros]);
  useEffect(() => {
    window.addEventListener(EVENTO_DADOS_INGRESSO, atualizar); window.addEventListener('focus', atualizar); window.addEventListener('storage', atualizar);
    return () => { window.removeEventListener(EVENTO_DADOS_INGRESSO, atualizar); window.removeEventListener('focus', atualizar); window.removeEventListener('storage', atualizar); };
  }, []);
  const consolidado = consultarDashboardNomeados(consultarCertamesIngresso(), registros,filtros,controleVagas);
  const permitidos = consolidado.editais;
  const {linhas,totaisEditais,resumo,homologados} = consolidado;
  const vagasIncompletas = totaisEditais.some(l => !l.vagasInformadas);
  const disponibilidadeIncompleta = totaisEditais.some(l => !l.candidatosInformados);
  const reservaIncompleta = totaisEditais.some(l => !l.reservaInformada);
  const inconsistencias = [...new Set(linhas.flatMap(l => l.alertas || []))];
  const alterar = (campo: keyof FiltrosNomeados, valor: string) => { setFiltros(f => ({...f,[campo]:valor})); setPagina(1); };
  const paginas = Math.max(1, Math.ceil(linhas.length/10));
  const atual = Math.min(pagina,paginas);
  const exportar = async () => {
    setExportando(true); setErroExportacao('');
    try { await exportarExcelNomeados(linhas, filtros, homologados, totaisEditais); }
    catch { setErroExportacao('Não foi possível exportar o Excel. Tente novamente.'); }
    finally { setExportando(false); }
  };
  const indicadores = [
    { titulo:'Editais em Homologação', valor:homologados, icone:'pi-building', descricao:'Quantidade de editais na situação Homologação.' },
    { titulo:'Nomeados', valor:resumo.nomeados, icone:'pi-user-plus', descricao:'Quantidade total de nomeados no recorte atual.' },
    { titulo:'Ingressados', valor:resumo.ingressados, icone:'pi-check-circle', descricao:'Nomeados com ingresso concluído.' },
    { titulo:'Ingressos Pendentes', valor:resumo.ingressosPendentes, icone:'pi-clock', descricao:'Nomeados em andamento no fluxo de ingresso.' },
    { titulo:'A nomear', valor:disponibilidadeIncompleta ? '—' : resumo.aNomear, icone:'pi-briefcase', descricao:'Vagas e reserva menos nomeados.' },
  ];
  const celulas = (l: LinhaNomeados) => [l.vagasInformadas === false ? '—' : numero(l.vagas), l.reservaInformada === false ? '—' : numero(l.cadastroReserva || 0), numero(l.nomeados), numero(l.ingressados), numero(l.ingressosPendentes), l.tipo === 'Concurso' ? numero(l.tomaramPosse) : '—', numero(l.apresentaramServico), numero(l.naoCompareceram), l.candidatosInformados === false ? '—' : numero(l.aNomear)];
  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}><main className="di-page dn-page"><div className="di-page-frame">
    <BreadcrumbSeplag divided items={[{label:'Ingresso',to:'/prototipos/sigep/ingresso'},{label:'Dashboard Nomeados'}]} />
    <header className="di-heading"><div><h1>Dashboard Nomeados</h1><p>Acompanhe as vagas dos editais, nomeações e o andamento dos ingressos por edital e cargo/função.</p></div><div className="di-update"><small>Última atualização: {atualizado.toLocaleString('pt-BR',{timeZone:'America/Cuiaba'})}</small><div className="di-update-actions"><button type="button" onClick={atualizar}><i className="pi pi-refresh" aria-hidden="true" />Atualizar dados</button><button type="button" className="di-export-excel" disabled={exportando} aria-busy={exportando} onClick={exportar}><i className="pi pi-download" aria-hidden="true" />{exportando ? 'Exportando...' : 'Exportar Excel'}</button></div></div></header>
    {erroExportacao && <p role="alert">{erroExportacao}</p>}
    {erroSincronizacao && <p role="alert">{erroSincronizacao}</p>}
    {!consolidado.editais.length && <p className="di-empty" role="status">Nenhum edital em homologação encontrado.</p>}
    <section className="di-filters dn-filters" aria-label="Filtros do dashboard de nomeados">
      <label>Tipo de Ingresso<select value={filtros.tipo} onChange={e => alterar('tipo',e.target.value)}><option value="">Todos</option><option value="Concurso">Concurso Público</option><option>Processo Seletivo</option></select></label>
      <label>Órgão/Entidade<select value={filtros.orgao} onChange={e => alterar('orgao',e.target.value)}><option value="">Todos</option>{[...new Set(consolidado.linhasBase.map(l => l.orgao))].sort().map(o => <option key={o}>{o}</option>)}</select></label>
      <label>Edital<select value={filtros.edital} onChange={e => alterar('edital',e.target.value)}><option value="">Todos</option>{permitidos.map(e => <option key={e.id} value={e.id}>{e.numeroEditalOrgao} · {e.tipoCertame === 'CONCURSO_PUBLICO' ? 'Concurso' : 'Processo Seletivo'}</option>)}</select></label>
      <label>Cargo/Função<input value={filtros.cargo} onChange={e => alterar('cargo',e.target.value)} placeholder="Pesquisar cargo ou função..." /></label>
      <button type="button" onClick={() => {setFiltros(filtrosNomeadosVazios);setPagina(1);}}>Limpar filtros</button>
    </section>
    <h2 className="di-section-title">Visão geral</h2><section className="di-kpis" aria-label="Indicadores de nomeados">{indicadores.map((item,i) => <article key={item.titulo} style={{'--di-cor':cores[i] || '#64748B'} as CSSProperties}><i className={`pi ${item.icone}`} aria-hidden="true" /><div><strong>{typeof item.valor === 'number' ? numero(item.valor) : item.valor}</strong><h3>{item.titulo}</h3><small>{item.descricao}</small></div><span className={`pi ${item.icone} di-kpi-background-icon`} aria-hidden="true" /></article>)}</section>
    <div className="di-type-tabs" role="tablist" aria-label="Tipo de ingresso dos nomeados">{['','Concurso','Processo Seletivo'].map(tipo => <button id={`dn-tab-${tipo === 'Concurso' ? 'concurso' : tipo ? 'seletivo' : 'todos'}`} type="button" role="tab" aria-controls="dn-panel" aria-selected={filtros.tipo===tipo} className={filtros.tipo===tipo ? 'active' : ''} key={tipo} onClick={() => alterar('tipo',tipo)}>{tipo || 'Todos'}</button>)}</div>
    <div id="dn-panel" role="tabpanel" aria-labelledby={`dn-tab-${filtros.tipo === 'Concurso' ? 'concurso' : filtros.tipo ? 'seletivo' : 'todos'}`}>
    <div className="dn-information" role="note"><i className="pi pi-info-circle" aria-hidden="true" /><p>A nomear = (vagas + cadastro de reserva) − nomeados. Pendentes = nomeados − ingressados, incluindo nomeações sem ingresso concluído independentemente da situação atual. Nomeados preserva o histórico das nomeações. Tomaram posse considera a ocorrência da posse, inclusive após a conclusão. Não comparecimento exige motivo registrado.</p></div>
    {linhas.some(l => l.vagasInformadas === false) && <p className="dn-note" role="status">Distribuição de vagas por cargo/função pendente de parametrização. Os totais disponíveis permanecem apresentados por edital.</p>}
    <h2 className="di-section-title">Gráficos gerenciais</h2><div className="di-charts"><GraficoNomeados titulo="Distribuição por Edital" dados={consolidado.porEdital} /><GraficoNomeados titulo="Distribuição por Cargo/Função" dados={consolidado.porCargo} /></div>
    {resumo.excedentes > 0 && <p className="dn-note" role="status">Ingressados e pendentes excedem o total de candidatos previsto em {numero(resumo.excedentes)} registro(s). Confira os dados. O saldo a nomear permanece limitado a zero.</p>}
    <section className="di-panel dn-summary"><header><h2>Vagas e nomeações por edital e cargo/função</h2><span>Base: editais e registros da Gestão de Ingresso</span></header><div className="di-table-wrap"><table aria-label="Vagas e nomeações"><thead><tr>{['Edital','Órgão/Entidade','Cargo/Função','Vagas','Cadastro de Reserva','Nomeados','Ingressados','Ingressos Pendentes','Tomaram Posse','Apresentaram-se para o serviço','Não Compareceram','A nomear','Ações'].map(t => <th key={t}>{t}</th>)}</tr></thead><tbody>{linhas.slice((atual-1)*10,atual*10).map((l,i,pagina) => <Fragment key={l.id}>{(i === 0 || pagina[i-1].certameId !== l.certameId) && (() => {const t=totaisEditais.find(t => t.id === l.certameId)!;return <tr className="dn-edital-total"><th scope="row">{t.edital}</th><td>{[...new Set(t.itens.map(l => l.orgao))].join(', ')}</td><td>Total do edital{t.itens.length !== consolidado.linhasBase.filter(l => l.certameId === t.id).length ? ' (recorte filtrado)' : ''}</td><td>{t.vagasInformadas ? numero(t.vagas) : '—'}</td><td>{t.reservaInformada ? numero(t.cadastroReserva) : '—'}</td><td>{numero(t.nomeados)}</td><td>{numero(t.ingressados)}</td><td>{numero(t.ingressosPendentes)}</td><td>{l.tipo === 'Concurso' ? numero(t.tomaramPosse) : '—'}</td><td>{numero(t.apresentaramServico)}</td><td>{numero(t.naoCompareceram)}</td><td>{t.candidatosInformados ? numero(t.aNomear) : '—'}</td><td /></tr>;})()}<tr><td>{l.edital}</td><td>{l.orgao}</td><td>{descricaoCargoNomeados(l)}</td>{celulas(l).map((valor,i) => <td key={i}>{i === 3 ? <span className="dn-total-ingressados">{valor}</span> : i === 8 ? <strong className="dn-total-pendente">{valor}</strong> : valor}</td>)}<td><Link className="di-view-edital" title="Visualizar ingressos" to={l.ingressoId ? `/prototipos/sigep/ingressos-teste/${l.ingressoId}?${new URLSearchParams({cargo:l.cargo,orgao:l.orgao,...(l.polo ? {polo:l.polo} : {}),...(l.tipoVaga ? {tipoVaga:l.tipoVaga} : {})})}` : `/prototipos/sigep/controle-pss/certames/${l.certameOrigemId || l.certameId}?modo=visualizar`} aria-label={`Visualizar detalhes de ${l.edital} ${l.cargo}`}><i className="pi pi-eye" /></Link></td></tr></Fragment>)}</tbody><tfoot><tr><th scope="row" colSpan={3}>Total filtrado</th><td>{vagasIncompletas ? '—' : numero(resumo.vagas)}</td><td>{reservaIncompleta ? '—' : numero(resumo.cadastroReserva)}</td><td>{numero(resumo.nomeados)}</td><td>{numero(resumo.ingressados)}</td><td>{numero(resumo.ingressosPendentes)}</td><td>{linhas.some(l => l.tipo === 'Concurso') ? numero(resumo.tomaramPosse) : '—'}</td><td>{numero(resumo.apresentaramServico)}</td><td>{numero(resumo.naoCompareceram)}</td><td>{disponibilidadeIncompleta ? '—' : numero(resumo.aNomear)}</td><td /></tr></tfoot></table></div>{!linhas.length && <p className="di-empty">Nenhum cargo/função cadastrado para os filtros selecionados.</p>}<div className="di-pagination"><button type="button" disabled={atual===1} onClick={() => setPagina(atual-1)}>Anterior</button><span>{atual} de {paginas}</span><button type="button" disabled={atual===paginas} onClick={() => setPagina(atual+1)}>Próxima</button></div></section>
    </div>
    {disponibilidadeIncompleta && <p className="dn-note" role="status">Vagas e cadastro de reserva não disponíveis para parte do recorte. Confira a vinculação do edital e dos cargos no Controle de Certame para calcular A nomear.</p>}
    {inconsistencias.length > 0 && <div className="dn-information" role="note"><i className="pi pi-info-circle" aria-hidden="true" /><div><strong>Conferência das vagas</strong><ul>{inconsistencias.map(a => <li key={a}>{a}</li>)}</ul></div></div>}
  </div></main></PrototypeSystemPage>;
}

