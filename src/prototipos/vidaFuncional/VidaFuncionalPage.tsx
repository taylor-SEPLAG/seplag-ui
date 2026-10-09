import { useState, type ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CardSeplag } from '../../componentes/Card';
import { BreadcrumbSeplag } from '../../componentes/Breadcrumb';
import { PrototypeSystemPage, menuGestaoPessoas } from '../PrototiposPage';
import { pessoas, vinculos, eventos, dataBR, situacao, pesquisarPessoas, pesquisarEventos, indicadores, filtrosVazios, type Evento } from './model';
import './vidaFuncional.css';

const base = '/prototipos/sigep/vida-funcional';
function Campos({ dados }: { dados: Record<string, string> }) { return <dl className="vf-campos">{Object.entries(dados).map(([campo, valor]) => <div key={campo}><dt>{campo}</dt><dd>{valor}</dd></div>)}</dl>; }
function Tag({ valor }: { valor: string }) { return <span className={`vf-tag ${valor === 'Vigente' || valor === 'Ativo' ? 'vf-vigente' : ''}`}>{valor}</span>; }
function download(nome: string, conteudo: string, tipo = 'text/plain;charset=utf-8') { const url = URL.createObjectURL(new Blob(['\uFEFF', conteudo], { type: tipo })); const a = document.createElement('a'); a.href = url; a.download = nome; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
function detalhes(e: Evento) { return { ...e.secoes, 'Documentação e Rastreabilidade': { 'Documento/Ato': e.documento, 'Origem do registro': e.origem, 'Responsável pelo registro': e.responsavel, 'Data/hora do registro': `${dataBR(e.registradoEm)} ${e.registradoEm.slice(11, 19)}`, 'Observações': 'Registro fictício para demonstração do protótipo.' } }; }
function Paginacao({ total, pagina, mudar }: { total: number; pagina: number; mudar: (p: number) => void }) { const paginas = Math.max(1, Math.ceil(total / 5)); return <div className="vf-paginacao"><span>{total ? `${pagina * 5 + 1}–${Math.min((pagina + 1) * 5, total)} de ${total} registros` : '0 registros'}</span><div><button disabled={pagina === 0} onClick={() => mudar(pagina - 1)} aria-label="Página anterior"><i className="pi pi-angle-left" /></button><span>Página {pagina + 1} de {paginas}</span><button disabled={pagina + 1 >= paginas} onClick={() => mudar(pagina + 1)} aria-label="Próxima página"><i className="pi pi-angle-right" /></button></div></div>; }

export function VidaFuncionalPage() {
  const { pessoaId, vinculoId } = useParams();
  // Separate routed content resets transient history state when a different link is opened.
  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}><div className="prototype-page-content prototype-page-content--white vf-page"><Conteudo key={`${pessoaId ?? ''}/${vinculoId ?? ''}`} pessoaId={pessoaId} vinculoId={vinculoId} /></div></PrototypeSystemPage>;
}
function Conteudo({ pessoaId, vinculoId }: { pessoaId?: string; vinculoId?: string }) {
  const [params, setParams] = useSearchParams();
  const filtros = { ...filtrosVazios, ...Object.fromEntries(Object.keys(filtrosVazios).map(k => [k, params.get(k) || ''])) };
  const [rascunho, setRascunho] = useState(filtros);
  const pagina = Math.max(0, Number(params.get('pagina')) || 0);
  const [paginaVinculos, setPaginaVinculos] = useState(0);
  const [tipo, setTipo] = useState(''); const [inicio, setInicio] = useState(''); const [fim, setFim] = useState(''); const [antigo, setAntigo] = useState(false);
  const [abertos, setAbertos] = useState<string[]>([]);
  const pessoa = pessoas.find(p => p.id === pessoaId);
  const meusVinculos = vinculos.filter(v => v.pessoaId === pessoaId);
  const vinculo = meusVinculos.find(v => v.id === vinculoId);
  const servidores = pesquisarPessoas(filtros);
  const paginaAtual = Math.min(pagina, Math.max(0, Math.ceil(servidores.length / 5) - 1));
  const invalido = Boolean(inicio && fim && inicio > fim);
  const historico = vinculo ? pesquisarEventos(vinculo.id, tipo, inicio, fim, antigo) : [];
  const titulo = vinculoId ? 'Histórico da Vida Funcional' : pessoaId ? 'Vínculos do Servidor' : 'Vida Funcional do Servidor';
  const consultaUrl = `${base}${params.toString() ? `?${params}` : ''}`;
  const vinculosUrl = `${base}/${pessoaId}/vinculos${params.toString() ? `?${params}` : ''}`;
  const historicoUrl = (id: string) => `${base}/${pessoaId}/vinculos/${id}/historico${params.toString() ? `?${params}` : ''}`;
  const exportar = () => {
    if (!vinculo || !pessoa) return;
    const todos = pesquisarEventos(vinculo.id);
    download(`vida-funcional-${vinculo.matricula}-${vinculo.numero}.txt`, ['SIGEP — Histórico da Vida Funcional', 'Dados fictícios demonstrativos', ...Object.entries(resumo).map(([k, v]) => `${k}: ${v}`), ...todos.map(e => `\n${dataBR(e.data)} — ${e.tipo}\n${e.titulo}\n${Object.entries(detalhes(e)).map(([secao, campos]) => `${secao}\n${Object.entries(campos).map(([k, v]) => `${k}: ${v}`).join('\n')}`).join('\n')}`)].join('\n'));
  };
  const resumo: Record<string, string> = pessoa && vinculo ? { 'Nome do servidor': pessoa.nome, 'CPF': pessoa.cpf, 'Matrícula': vinculo.matricula, 'Número do vínculo': String(vinculo.numero), 'Tipo de vínculo': vinculo.tipo, 'Classificação do vínculo': vinculo.classificacao, 'Situação do vínculo': situacao(vinculo), 'Cargo/Função': vinculo.cargo, 'Órgão/Entidade': vinculo.orgao, 'Unidade atual ou última unidade': vinculo.unidade, 'Data de início': dataBR(vinculo.inicio), ...(vinculo.fim ? { 'Data de encerramento': dataBR(vinculo.fim) } : {}) } : {};
  const cabecalho = <BreadcrumbSeplag divided homeTo="/prototipos/sigep" items={[{ label: 'Vínculos Funcionais', to: '/prototipos/sigep/vinculos-funcionais' }, { label: 'Vida Funcional do Servidor', to: consultaUrl }, ...(pessoaId ? [{ label: vinculoId ? 'Histórico da Vida Funcional' : 'Vínculos' }] : [])]} />;
  let conteudo: ReactNode;
  if (pessoaId && (!pessoa || (vinculoId && !vinculo))) conteudo = <div role="alert"><p>Servidor ou vínculo não encontrado.</p><Link to={consultaUrl}>Voltar à consulta</Link></div>;
  else if (!pessoaId) conteudo = <>
    <p>Consulte os vínculos e o histórico funcional dos servidores.</p>
    <div className="vf-indicadores">{['Total de servidores', 'Vínculos vigentes', 'Vínculos encerrados', 'Movimentações no mês'].map((label, i) => <div key={label}><span>{label}</span><strong>{indicadores()[i]}</strong></div>)}</div>
    <form className="vf-filtros" onSubmit={e => { e.preventDefault(); setParams(Object.fromEntries(Object.entries(rascunho).filter(([, v]) => v))); }}>
      {(['nome', 'cpf', 'matricula'] as const).map((campo, i) => <label key={campo}>{['Nome do servidor', 'CPF', 'Matrícula'][i]}<input value={rascunho[campo]} onChange={e => setRascunho({ ...rascunho, [campo]: e.target.value })} /></label>)}
      <label>Tipo de vínculo<select value={rascunho.tipo} onChange={e => setRascunho({ ...rascunho, tipo: e.target.value })}><option value="">Todos</option>{[...new Set(vinculos.map(v => v.tipo))].map(t => <option key={t}>{t}</option>)}</select></label>
      <label>Situação do vínculo<select value={rascunho.situacao} onChange={e => setRascunho({ ...rascunho, situacao: e.target.value })}><option value="">Todas</option><option>Vigente</option><option>Encerrado</option></select></label>
      <div className="vf-botoes"><button className="vf-primario" type="submit"><i className="pi pi-search" /> Pesquisar</button><button type="button" onClick={() => { setRascunho(filtrosVazios); setParams({}); }}>Limpar</button></div>
    </form>
    <div className="vf-table"><table><thead><tr>{['Nome do servidor', 'CPF', 'Órgão/Entidade', 'Quantidade de vínculos', 'Vínculos vigentes', 'Ações'].map(c => <th key={c}>{c}</th>)}</tr></thead><tbody>{servidores.slice(paginaAtual * 5, paginaAtual * 5 + 5).map(p => { const vs = vinculos.filter(v => v.pessoaId === p.id); const ultimo = [...vs].sort((a, b) => Number(Boolean(a.fim)) - Number(Boolean(b.fim)) || b.inicio.localeCompare(a.inicio))[0]; return <tr key={p.id}><td><strong>{p.nome}</strong></td><td>{p.cpf}</td><td>{ultimo.orgao}</td><td>{vs.length}</td><td>{vs.filter(v => !v.fim).length}</td><td><Link to={`${base}/${p.id}/vinculos${params.toString() ? `?${params}` : ''}`}><i className="pi pi-eye" /> Ver vínculos</Link></td></tr>; })}{!servidores.length && <tr><td colSpan={6}>Nenhum servidor encontrado para os filtros informados.</td></tr>}</tbody></table></div>
    <Paginacao total={servidores.length} pagina={paginaAtual} mudar={p => { const novos = new URLSearchParams(params); novos.set('pagina', String(p)); setParams(novos); }} />
  </>;
  else if (!vinculoId && pessoa) conteudo = <>
    <section className="vf-resumo"><Campos dados={{ 'Nome completo': pessoa.nome, 'CPF': pessoa.cpf, 'Data de nascimento': dataBR(pessoa.nascimento), 'Quantidade total de vínculos': String(meusVinculos.length) }} /></section>
    <div className="vf-table"><table><thead><tr>{['Matrícula', 'Nº do vínculo', 'Tipo de vínculo', 'Cargo/Função', 'Órgão/Entidade', 'Data de início', 'Data de encerramento', 'Classificação', 'Situação', 'Ações'].map(c => <th key={c}>{c}</th>)}</tr></thead><tbody>{meusVinculos.slice(paginaVinculos * 5, paginaVinculos * 5 + 5).map(v => <tr key={v.id}><td>{v.matricula}</td><td>{v.numero}</td><td>{v.tipo}</td><td>{v.cargo}</td><td>{v.orgao}</td><td>{dataBR(v.inicio)}</td><td>{dataBR(v.fim)}</td><td><Tag valor={v.classificacao} /></td><td><Tag valor={situacao(v)} /></td><td><Link to={historicoUrl(v.id)}>Ver vida funcional</Link></td></tr>)}</tbody></table></div>
    <Paginacao total={meusVinculos.length} pagina={paginaVinculos} mudar={setPaginaVinculos} />
  </>;
  else conteudo = <>
    <section className="vf-resumo"><Campos dados={resumo} />{vinculo?.relacionadoId && <Link to={historicoUrl(vinculo.relacionadoId)}><i className="pi pi-link" /> Consultar vínculo {vinculo.tipo === 'Aposentado' ? 'efetivo de origem' : 'de aposentado gerado'}</Link>}</section>
    <h2>Linha do Tempo Funcional</h2>
    <div className="vf-filtros vf-filtros-historico"><label>Tipo de ocorrência<select value={tipo} onChange={e => setTipo(e.target.value)}><option value="">Todos</option>{[...new Set(eventos.filter(e => e.vinculoId === vinculoId).map(e => e.tipo))].map(t => <option key={t}>{t}</option>)}</select></label><label>Data inicial<input type="date" value={inicio} onChange={e => setInicio(e.target.value)} /></label><label>Data final<input type="date" value={fim} onChange={e => setFim(e.target.value)} /></label><label>Ordenação<select value={antigo ? 'antigo' : 'recente'} onChange={e => setAntigo(e.target.value === 'antigo')}><option value="recente">Mais recentes primeiro</option><option value="antigo">Mais antigos primeiro</option></select></label><button onClick={() => { setTipo(''); setInicio(''); setFim(''); setAntigo(false); }}>Limpar</button></div>
    {invalido ? <p role="alert">A data final deve ser igual ou posterior à data inicial.</p> : <><p className="vf-contagem">{historico.length} ocorrência(s) • Selecione uma linha para consultar os detalhes.</p><div className="vf-timeline">{historico.map(e => { const aberto = abertos.includes(e.id); return <article className="vf-evento" key={e.id}><button className="vf-evento-linha" aria-expanded={aberto} aria-controls={`detalhe-${e.id}`} onClick={() => setAbertos(atuais => aberto ? atuais.filter(id => id !== e.id) : [...atuais, e.id])}><span><time dateTime={e.data}>{dataBR(e.data)}</time><Tag valor={e.tipo} /><strong>{e.titulo}</strong><small>{e.descricao} • {e.origem}</small></span><i className={`pi pi-chevron-${aberto ? 'up' : 'down'}`} /></button>{aberto && <div id={`detalhe-${e.id}`} className="vf-detalhes">{Object.entries(detalhes(e)).map(([secao, campos]) => <section key={secao}><h3>{secao}</h3><Campos dados={campos} /></section>)}<button onClick={() => download(`documento-${e.id}.txt`, `SIGEP — DOCUMENTO FICTÍCIO PARA DEMONSTRAÇÃO\n${e.documento}\n${e.titulo}\nData efetiva: ${dataBR(e.data)}\nOrigem: ${e.origem}\nResponsável: ${e.responsavel}`)}><i className="pi pi-download" /> Baixar documento demonstrativo</button></div>}</article>; })}</div>{!historico.length && <p>Nenhuma ocorrência encontrada para os filtros informados.</p>}</>}
  </>;
  return <CardSeplag title={titulo} cardHeaderClassNames="prototype-carreira-card" headerNavigation={cabecalho}><div className="vf-conteudo"><div className="vf-acoes">{pessoaId ? <Link className="vf-botao" to={vinculoId ? vinculosUrl : consultaUrl}><i className="pi pi-arrow-left" /> {vinculoId ? 'Voltar aos vínculos' : 'Voltar'}</Link> : <span>Consulta de servidores</span>}{vinculo && <button onClick={exportar}><i className="pi pi-download" /> Exportar histórico</button>}</div>{conteudo}<small className="vf-demonstrativo">Protótipo com dados fictícios. Consulta somente leitura.</small></div></CardSeplag>;
}
