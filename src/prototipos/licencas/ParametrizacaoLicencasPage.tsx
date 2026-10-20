import { useRef, useState } from 'react';
import { Menu } from 'primereact/menu';
import { useNavigate } from 'react-router-dom';
import { ModalSeplag } from '../../componentes/Modal';
import { PaginacaoV2 } from '../vinculos/VinculoV2Page';
import { BASE_LICENCAS as BASE, STORAGE_LICENCAS, CATEGORIAS, NATUREZAS, filtrosVazios, carregarEventos, filtrarEventos, rotuloDuracao, type EventoLicenca, type FiltrosLicencas } from './model';
import '../vinculos/vinculoV2.css';
import './licencas.css';
import { Ambiente } from './AmbienteLicencas';

function Situacao({valor}:{valor:EventoLicenca['situacao']}) {return <span className={`v2v-status v2v-status-${valor.toLocaleLowerCase('pt-BR')}`}>{valor}</span>;}
function AcoesEvento({evento,visualizar,alterarSituacao}:{evento:EventoLicenca;visualizar:()=>void;alterarSituacao:()=>void}) {
  const menu=useRef<Menu>(null),navigate=useNavigate();
  const [aberto,setAberto]=useState(false);
  const situacao=evento.situacao==='Ativo'?'Inativar':'Reativar';
  return <div className="pl-acoes-divididas">
    <button type="button" title="Visualizar" aria-label={`Visualizar Evento ${evento.codigo}`} onClick={visualizar}><i className="pi pi-eye" aria-hidden="true"/></button>
    <button type="button" title="Mais ações" aria-label={`Ações do evento ${evento.codigo}`} aria-haspopup="menu" aria-controls={`pl-acoes-${evento.id}`} aria-expanded={aberto} onClick={event=>menu.current?.toggle(event)}><i className="pi pi-chevron-down" aria-hidden="true"/></button>
    <Menu ref={menu} popup id={`pl-acoes-${evento.id}`} onShow={()=>setAberto(true)} onHide={()=>setAberto(false)} model={[
      {label:'Editar',icon:'pi pi-pencil',command:()=>navigate(`${BASE}/${evento.id}/editar`)},
      {label:'Duplicar',icon:'pi pi-copy',command:()=>navigate(`${BASE}/${evento.id}/clonar`)},
      {label:situacao,icon:evento.situacao==='Ativo'?'pi pi-ban':'pi pi-refresh',command:alterarSituacao},
    ]}/>
  </div>;
}

export function ParametrizacaoLicencasPage() {
  const navigate=useNavigate();
  const [registros,setRegistros]=useState(carregarEventos);
  const [filtros,setFiltros]=useState<FiltrosLicencas>({...filtrosVazios});
  const [pagina,setPagina]=useState(1),[porPagina,setPorPagina]=useState(10);
  const [confirmacao,setConfirmacao]=useState<EventoLicenca|null>(null);
  const [vinculosEvento,setVinculosEvento]=useState<EventoLicenca|null>(null);
  const [visualizacao,setVisualizacao]=useState<EventoLicenca|null>(null);
  const [mensagem,setMensagem]=useState(''),[erro,setErro]=useState('');
  const filtrados=filtrarEventos(registros,filtros),totalPaginas=Math.max(1,Math.ceil(filtrados.length/porPagina)),atual=Math.min(pagina,totalPaginas);
  const visiveis=filtrados.slice((atual-1)*porPagina,atual*porPagina);
  const alterar=(campo:keyof FiltrosLicencas,valor:string)=>{setFiltros(f=>({...f,[campo]:valor}));setPagina(1);};
  const confirmar=()=>{
    if(!confirmacao)return;
    try {
      const estado=confirmacao.situacao==='Ativo'?'Inativo':'Ativo';
      const atuais=carregarEventos();
      const novos=atuais.map(e=>e.id===confirmacao.id?{...e,situacao:estado as EventoLicenca['situacao']}:e);
      localStorage.setItem(STORAGE_LICENCAS,JSON.stringify(novos));setRegistros(novos);setMensagem(`Evento ${confirmacao.codigo} ${estado==='Ativo'?'reativado':'inativado'} com sucesso.`);setConfirmacao(null);setErro('');
    } catch {setErro('Não foi possível salvar a situação. Tente novamente.');}
  };
  return <Ambiente titulo="Parametrização de Licenças">
    <p className="v2v-description">Gerencie os parâmetros de licenças, afastamentos e ausências aplicáveis aos servidores.</p>
    <section className="v2v-kpis pl-kpis" aria-label="Indicadores de eventos">
      {['Total de Eventos Cadastrados','Licenças','Afastamentos','Ausências'].map((label,i)=><article className={['pl-kpi-total','pl-kpi-licenca','pl-kpi-afastamento','pl-kpi-ausencia'][i]} key={label}><i className={`pi ${['pi-list','pi-file','pi-sign-out','pi-calendar-minus'][i]}`} aria-hidden="true"/><div><span>{label}</span><strong>{i===0?registros.length:registros.filter(e=>e.natureza===NATUREZAS[i-1]).length}</strong></div></article>)}
    </section>
    <section className="v2v-panel v2v-filters pl-filtros" aria-label="Filtros de consulta">
      <label>Código ou Nome do Evento<input value={filtros.busca} onChange={e=>alterar('busca',e.target.value)} placeholder="Buscar por código ou nome"/></label>
      <label>Categoria<select value={filtros.categoria} onChange={e=>alterar('categoria',e.target.value)}><option value="">Todas</option>{CATEGORIAS.map(c=><option key={c}>{c}</option>)}</select></label>
      <label>Natureza<select value={filtros.natureza} onChange={e=>alterar('natureza',e.target.value)}><option value="">Todas</option>{NATUREZAS.map(n=><option key={n}>{n}</option>)}</select></label>
      <label>Situação<select value={filtros.situacao} onChange={e=>alterar('situacao',e.target.value)}><option value="">Todas</option><option>Ativo</option><option>Inativo</option></select></label>
      <button type="button" className="v2v-primary" onClick={()=>{setFiltros({...filtrosVazios});setPagina(1);}}><i className="pi pi-refresh" aria-hidden="true"/>Limpar filtro</button>
    </section>
    {mensagem&&<p className="v2v-notice" role="status">{mensagem}</p>}
    <div className="v2v-toolbar pl-table-toolbar"><button type="button" className="v2v-primary" onClick={()=>navigate(`${BASE}/novo`)}><i className="pi pi-plus" aria-hidden="true"/>Nova Parametrização</button></div>

    <div className="pl-grid-scroll"><table className="v2v-table pl-table" aria-label="Eventos parametrizados"><thead><tr>{['Código','Nome do Evento / Descrição','Natureza','Categoria','Vínculos Autorizados','Duração Máxima','Parentesco?','Recorrência?','Situação','Ações'].map(c=><th scope="col" key={c}>{c}</th>)}</tr></thead><tbody>{visiveis.map(e=><tr key={e.id}>
      <td>{e.codigo}</td><td><span className="pl-nome">{e.nome}</span><small className="pl-descricao">{e.descricao}</small></td>
      <td><span className={`pl-tag pl-natureza-${NATUREZAS.indexOf(e.natureza)}`}>{e.natureza}</span></td><td>{e.categoria}</td>
      <td><button type="button" className="pl-vinculos-link" aria-label={`Ver vínculos autorizados do evento ${e.codigo}`} onClick={()=>setVinculosEvento(e)}>{e.vinculos.length} {e.vinculos.length===1?'Vínculo':'Vínculos'}</button></td>
      <td>{rotuloDuracao(e)}</td><td>{e.parentesco?'Sim':'Não'}</td><td>{e.recorrencia||'Não'}</td><td><Situacao valor={e.situacao}/></td>
      <td><AcoesEvento evento={e} visualizar={()=>setVisualizacao(e)} alterarSituacao={()=>{setErro('');setConfirmacao(e);}}/></td>
    </tr>)}{!visiveis.length&&<tr><td colSpan={10} className="v2v-empty">Nenhum registro encontrado para os filtros informados.</td></tr>}</tbody></table></div>
    <PaginacaoV2 nome="eventos" pagina={atual} totalPaginas={totalPaginas} porPagina={porPagina} mudarPagina={setPagina} mudarPorPagina={q=>{setPorPagina(q);setPagina(1);}}/>
    <ModalSeplag visible={Boolean(visualizacao)} titulo="Visualizar Evento" fechar={()=>setVisualizacao(null)} hideFooter tamanho="720px">
      {visualizacao&&<div className="v2v-page"><h3>{visualizacao.codigo} — {visualizacao.nome}</h3><p>{visualizacao.descricao}</p><dl className="pl-detalhes">
        <div><dt>Natureza</dt><dd>{visualizacao.natureza}</dd></div><div><dt>Categoria</dt><dd>{visualizacao.categoria}</dd></div>
        <div><dt>Vínculos autorizados</dt><dd>{visualizacao.vinculos.join(', ')}</dd></div><div><dt>Duração máxima</dt><dd>{rotuloDuracao(visualizacao)}</dd></div>
        <div><dt>Parentesco?</dt><dd>{visualizacao.parentesco?'Sim':'Não'}</dd></div><div><dt>Recorrência?</dt><dd>{visualizacao.recorrencia||'Não'}</dd></div><div><dt>Situação</dt><dd><Situacao valor={visualizacao.situacao}/></dd></div>
      </dl></div>}
    </ModalSeplag>
    <ModalSeplag visible={Boolean(vinculosEvento)} titulo={`Tipos de vínculo autorizados (${vinculosEvento?.vinculos.length??0})`} fechar={()=>setVinculosEvento(null)} hideFooter tamanho="620px">
      <div className="prototype-carreira-org-list prototype-tipo-vinculo-regimes-list">
        <p><strong>Código {vinculosEvento?.codigo}</strong> — {vinculosEvento?.nome}</p>
        <ul>{vinculosEvento?.vinculos.map((v,i)=><li key={v}><i className="pi pi-book" aria-hidden="true"/><strong>{i+1}.</strong> {v}</li>)}</ul>
      </div>
    </ModalSeplag>
    <ModalSeplag visible={Boolean(confirmacao)} titulo={confirmacao?.situacao==='Ativo'?'Inativar Evento':'Reativar Evento'} fechar={()=>setConfirmacao(null)} hideFooter tamanho="480px">
      {confirmacao&&<div className="v2v-page"><p>Confirma {confirmacao.situacao==='Ativo'?'a inativação':'a reativação'} de <strong>{confirmacao.codigo} — {confirmacao.nome}</strong>?</p>{erro&&<p className="v2v-error" role="alert">{erro}</p>}<div className="v2v-form-actions"><button type="button" className="v2v-secondary" onClick={()=>setConfirmacao(null)}>Cancelar</button><button type="button" className="v2v-primary" onClick={confirmar}>Confirmar</button></div></div>}
    </ModalSeplag>
  </Ambiente>;
}

