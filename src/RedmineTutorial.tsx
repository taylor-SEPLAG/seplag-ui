import { useState } from 'react';
import { FiArrowLeft, FiArrowRight, FiBookOpen, FiCheckCircle, FiCode, FiDatabase, FiFileText, FiGitBranch, FiGrid, FiMail, FiSearch, FiShield, FiUsers } from 'react-icons/fi';
import type { ReactNode } from 'react';
import boasVindas from './assets/onboarding/boas-vindas-sigep.png';
import encerramento from './assets/onboarding/encerramento-sigep.png';
import planilhaPrint from './assets/tutoriais/planilha.png';
import redminePrint from './assets/tutoriais/redmine.png';
import './redmine-tutorial.css';

const titulos = ['Guia Prático do Redmine', 'Nossa ferramenta de controle de atividades', 'Como recebemos nossas demandas?', 'Como organizamos uma História de Usuário?', 'Quem registra a História de Usuário?', 'Quando precisamos de modelagem de banco?', 'Organizando o desenvolvimento', 'Como dividimos as atividades de implementação?', 'Preparando a validação da funcionalidade', 'Como registramos os defeitos?', 'Visualizando o fluxo completo no Redmine', 'Quem é responsável por cada etapa?', 'Cuidados importantes no dia a dia', 'Organização também faz parte da entrega!'];
const responsabilidades = [
  ['CONCEPÇÃO', 'História de Usuário', 'Analista de Requisitos', 'concepcao'],
  ['Modelagem de Banco de Dados', 'Atividade de banco', 'Líder de Projeto', 'modelagem'],
  ['IMPLEMENTAÇÃO', 'Tarefa pai', 'Tech Lead ou Desenvolvedor', 'implementacao'],
  ['IMPLEMENTAÇÃO', 'Subtarefas', 'Tech Lead ou Desenvolvedor', 'implementacao'],
  ['TESTE', 'Tarefa pai', 'Líder de Projeto', 'teste'],
  ['TESTE', 'Registro de bugs', 'QA', 'bug'],
];
const tarefas = [
  {id:'34594', tipo:'CONCEPÇÃO', titulo:'US213 — Cargo — Listagem e Filtro', pessoa:'Taylor Augusto dos Santos', situacao:'Nova', nivel:0, cor:'concepcao'},
  {id:'34670', tipo:'Modelagem de Banco', titulo:'US213 — Cargo — Listagem e Filtro', pessoa:'Aryadne Lelis De Oliveira', situacao:'Fechada', nivel:1, cor:'modelagem'},
  {id:'34780', tipo:'IMPLEMENTAÇÃO', titulo:'US213 — Cargo — Listagem e Filtro', pessoa:'Luciano da Silva Oliveira', situacao:'Nova', nivel:1, cor:'implementacao'},
  {id:'34781', tipo:'IMPLEMENTAÇÃO', titulo:'[FRONTEND] — US213 — Cargo — Listagem e Filtro', pessoa:'Alex Sandro Pereira Garcia', situacao:'Resolvida', nivel:2, cor:'implementacao'},
  {id:'34782', tipo:'IMPLEMENTAÇÃO', titulo:'[BACKEND] — US213 — Cargo — Listagem e Filtro', pessoa:'Gabriel Rodrigues de Moura', situacao:'Resolvida', nivel:2, cor:'implementacao'},
  {id:'35088', tipo:'TESTE', titulo:'TESTE QA', pessoa:'—', situacao:'Nova', nivel:1, cor:'teste'},
  {id:'35469', tipo:'TESTE', titulo:'BUG — (SIGEP): Validar filtro textual Cargo por Sigla', pessoa:'Gabriel Rodrigues de Moura', situacao:'Nova', nivel:2, cor:'bug'},
  {id:'35473', tipo:'TESTE', titulo:'BUG — (SIGEP): Validar filtro textual Cargo por Sigla / caracteres', pessoa:'Gabriel Rodrigues de Moura', situacao:'Nova', nivel:2, cor:'bug'},
];

function Cards({items}: {items: string[][]}) {
  return <div className="redmine-cards">{items.map(([titulo,...linhas]) => <article key={titulo}><FiCheckCircle aria-hidden="true"/><h3>{titulo}</h3><ul>{linhas.map(l => <li key={l}>{l}</li>)}</ul></article>)}</div>;
}
function Steps({items}: {items:string[]}) {
  return <ol className="redmine-steps">{items.map((s,i) => <li key={s}><b>{String(i+1).padStart(2,'0')}</b><span>{s}</span></li>)}</ol>;
}
function Note({children}: {children:ReactNode}) { return <aside className="redmine-note">{children}</aside>; }
function Flow({items}: {items:string[][]}) {
  return <div className="redmine-flow">{items.map(([nome,cor,...linhas],i) => <div className="redmine-flow-item" key={nome}>{i>0 && <FiArrowRight className="redmine-flow-arrow" aria-hidden="true"/>}<article className={`redmine-task is-${cor}`}><strong>{nome}</strong>{linhas.map(l => <small key={l}>{l}</small>)}</article></div>)}</div>;
}
function Tree() {
  return <div className="redmine-tree" aria-label="Hierarquia da US213">
    <div className="redmine-task is-concepcao"><strong>CONCEPÇÃO #34594</strong><span>US213 — Cargo — Listagem e Filtro</span><small>Abre: Analista de Requisitos</small></div>
    <ul><li><div className="redmine-task is-modelagem"><strong>Modelagem de Banco #34670</strong><small>Abre: Líder de Projeto · Executa: DBA</small></div></li>
      <li><div className="redmine-task is-implementacao"><strong>IMPLEMENTAÇÃO #34780 · Tarefa pai</strong><small>Abre: Tech Lead ou Desenvolvedor</small></div><ul><li><div className="redmine-task is-implementacao"><strong>#34781 · [FRONTEND]</strong><small>Tipo: IMPLEMENTAÇÃO</small></div></li><li><div className="redmine-task is-implementacao"><strong>#34782 · [BACKEND]</strong><small>Tipo: IMPLEMENTAÇÃO</small></div></li></ul></li>
      <li><div className="redmine-task is-teste"><strong>TESTE #35088 · TESTE QA · Tarefa pai</strong><small>Abre: Líder de Projeto · Validação: QA</small></div><ul><li><div className="redmine-task is-bug"><strong>TESTE #35469 · BUG 01</strong><small>Registra: QA · Correção: Desenvolvedor</small></div></li><li><div className="redmine-task is-bug"><strong>TESTE #35473 · BUG 02</strong><small>Registra: QA · Correção: Desenvolvedor</small></div></li></ul></li></ul>
  </div>;
}
function Planilha() {
  return <PrintTutorial src={planilhaPrint} alt="Planilha de Controle SIGEP com Histórias de Usuário, menu, módulo, analista, DBA, dependências, desenvolvedores, QA e infraestrutura." legenda="Planilha de Controle do SIGEP" />;
}
function PrintTutorial({src,alt,legenda}: {src:string;alt:string;legenda:string}) {
  return <figure className="redmine-print"><figcaption>{legenda}</figcaption><a href={src} target="_blank" rel="noreferrer" aria-label={`Ampliar imagem: ${legenda}`}><img src={src} alt={alt} loading="lazy" /></a><small>Clique na imagem para ampliar.</small></figure>;
}
function Tarefas() {
  return <div className="redmine-table-scroll"><table className="redmine-issues"><caption>US213 — exemplo da árvore de tarefas enviada</caption><thead><tr><th>Tarefa / vínculo</th><th>Situação</th><th>Atribuído para</th></tr></thead><tbody>{tarefas.map(t=><tr key={t.id}><td><div style={{paddingLeft:t.nivel*20}}><span className={`redmine-tag is-${t.cor}`}>{t.tipo}</span> <strong>#{t.id}</strong> · {t.titulo}</div></td><td>{t.situacao}</td><td>{t.pessoa}</td></tr>)}</tbody></table></div>;
}
function FormularioExemplo() {
  return <figure><figcaption>Exemplo de edição: IMPLEMENTAÇÃO #34782 · [BACKEND]</figcaption><dl className="redmine-form-example">{[
    ['Projeto','Desenvolvimento do Sistema de Inteligência de Gestão de Pessoas — SIGEP','Projeto SIGEP'],
    ['Tipo','IMPLEMENTAÇÃO','← Mesmo tipo da tarefa pai'],
    ['Título','[BACKEND] — US213 — Cargo — Listagem e Filtro','← Identifique a atividade'],
    ['Tarefa pai','34780','← IMPLEMENTAÇÃO pai; não a CONCEPÇÃO'],
    ['Atribuído para','Gabriel Rodrigues de Moura','← Responsável pela execução'],
    ['Situação','Resolvida','← Atualize conforme o andamento'],
    ['% Terminado','100 %','← Percentual coerente com a situação'],
    ['Início','04/09/2026','Data do exemplo enviado'],
    ['Complexidade','Média','Exemplo enviado'],
  ].map(([label,valor,dica])=><div key={label}><dt>{label}</dt><dd><strong>{valor}</strong><small>{dica}</small></dd></div>)}</dl></figure>;
}

function Conteudo({slide}: {slide:number}) {
  switch(slide) {
    case 0: return <div className="redmine-cover"><span className="redmine-eyebrow">ONBOARDING SIGEPers</span><h2>Guia Prático<br/>do Redmine</h2><div className="redmine-pills"><span>Registro</span><span>Organização</span><span>Acompanhamento</span></div><img src={boasVindas} alt="Personagens do SIGEP: capivara e onça, juntos no onboarding."/><strong>Da História de Usuário ao registro de bugs</strong></div>;
    case 1: return <><div className="redmine-hub"><PrintTutorial src={redminePrint} alt="Tela do Redmine do SIGEP: CONCEPÇÃO #35787, Sprint 21, propriedades, andamento e hierarquia de subtarefas." legenda="Redmine — controle de atividades do SIGEP" /><Cards items={[
      ['Organização','Registrar demandas','Atribuir responsáveis'], ['Desenvolvimento','Registrar atividades técnicas'], ['Acompanhamento','Situação e progresso das tarefas'], ['Testes','Validações e defeitos encontrados'], ['Rastreabilidade','Histórias de Usuário e tarefas vinculadas']
    ]}/></div><a className="redmine-index-link" href="http://redmine/issues/35787" target="_blank" rel="noopener noreferrer"><FiArrowRight aria-hidden="true"/>Acessar Redmine — Sprint 21 (#35787)</a><Note>Redmine = Registro + Organização + Acompanhamento</Note></>;
    case 2: return <><div className="redmine-channels"><article><FiMail/><h3>1. E-mail</h3><ul><li>Histórias de Usuário compartilhadas pelos analistas</li><li>Conhecimento e acompanhamento da equipe</li></ul></article><article><FiGrid/><h3>2. Planilha de Controle do SIGEP</h3><ul><li>Código, nome, módulo e funcionalidade</li><li>Analistas, desenvolvedores e dependências</li><li>Acompanhamento das sprints</li></ul></article></div><Planilha/><Note>Planilha de Controle → referência para consultar e acompanhar as demandas</Note></>;
    case 3: return <><Tree/><Note>Quem abre a tarefa ≠ quem executa a atividade</Note></>;
    case 4: return <><Flow items={ [['Analista de Requisitos','concepcao','Responsável pela abertura'],['CONCEPÇÃO','concepcao','US213 — Cargo — Listagem e Filtro']] }/><Steps items={['Acessar o projeto SIGEP no Redmine','Criar uma nova tarefa','Selecionar o tipo CONCEPÇÃO','Informar código e título da História de Usuário','Preencher as informações necessárias','Salvar o registro']}/><Note>CONCEPÇÃO → referência principal para as demais tarefas da História de Usuário</Note></>;
    case 5: return <><Flow items={ [['CONCEPÇÃO','concepcao','US213'],['Modelagem de Banco','modelagem','Quem abre: Líder de Projeto'],['DBA','modelagem','Quem executa: DBA']] }/><Steps items={['Localizar a CONCEPÇÃO da História de Usuário','Criar a tarefa de modelagem de banco','Vincular à CONCEPÇÃO','Informar o título correspondente','Atribuir ao responsável pela modelagem','Salvar a tarefa']}/><Note>SIGEP — Modelagem de Banco — US213: Cargo — Listagem e Filtro</Note></>;
    case 6: return <><Flow items={ [['CONCEPÇÃO #34594','concepcao','História de Usuário'],['IMPLEMENTAÇÃO #34780','implementacao','Tarefa pai · Abre: Tech Lead ou Desenvolvedor']] }/><Steps items={['Localizar a CONCEPÇÃO','Criar uma nova subtarefa','Selecionar o tipo IMPLEMENTAÇÃO','Informar código e título da História de Usuário','Vincular à tarefa pai de CONCEPÇÃO','Salvar']}/><Note>IMPLEMENTAÇÃO pai → agrupa as atividades técnicas da funcionalidade</Note></>;
    case 7: return <><Flow items={ [['IMPLEMENTAÇÃO #34780','implementacao','Tarefa pai'],['[FRONTEND] #34781','implementacao','Tipo: IMPLEMENTAÇÃO'],['[BACKEND] #34782','implementacao','Tipo: IMPLEMENTAÇÃO']] }/><Steps items={['Acessar a IMPLEMENTAÇÃO pai','Criar uma subtarefa do tipo IMPLEMENTAÇÃO','Informar o título e os campos correspondentes','Definir o responsável pela execução','Salvar a subtarefa']}/><FormularioExemplo/><Note>Tech Lead ou Desenvolvedor → cria pai e subtarefas. O time decide a divisão; não há papéis fixos exclusivos de front-end ou back-end.</Note></>;
    case 8: return <><Flow items={ [['CONCEPÇÃO','concepcao','História de Usuário'],['TESTE · Tarefa pai','teste','Quem abre: Líder de Projeto'],['QA','teste','Quem realiza a validação']] }/><Steps items={['Localizar a CONCEPÇÃO','Criar uma subtarefa','Selecionar o tipo TESTE','Informar o título: TESTE QA','Vincular à CONCEPÇÃO','Salvar']}/><Note>TESTE pai → centraliza a validação e os defeitos identificados pelos QAs</Note></>;
    case 9: return <><Flow items={ [['TESTE #35088','teste','Pai · Abre: Líder de Projeto'],['TESTE · BUG','bug','Identifica e registra: QA'],['Correção','implementacao','Executa: Desenvolvedor']] }/><Steps items={['Acessar a tarefa pai de TESTE','Criar uma subtarefa para o defeito','Informar um título objetivo','Descrever o comportamento encontrado','Registrar as informações para reprodução','Vincular à tarefa pai de TESTE e salvar']}/><Cards items={ [['TESTE #35469','BUG — (SIGEP): Validar filtro textual Cargo por Sigla'],['TESTE #35473','BUG — (SIGEP): Validar filtro textual Cargo por Sigla / caracteres']] }/></>;
    case 10: return <><Note>US213 — Cargo — Listagem e Filtro</Note><Tarefas/><Cards items={ [['Analista','CONCEPÇÃO #34594'],['Líder de Projeto','Modelagem #34670','TESTE pai #35088'],['Tech Lead / Dev','IMPLEMENTAÇÃO pai #34780','Subtarefas #34781 e #34782'],['QA','Registro dos bugs #35469 e #35473']] }/><Note>Na árvore: “Atribuído para” identifica a execução; a abertura segue as responsabilidades do fluxo.</Note></>;
    case 11: return <div className="redmine-table-scroll"><table className="redmine-responsibilities"><caption>Responsabilidade pela abertura das tarefas</caption><thead><tr><th>Tipo</th><th>Atividade</th><th>Quem abre</th></tr></thead><tbody>{responsabilidades.map(([tipo,atividade,pessoa,cor])=><tr key={tipo+atividade}><td><span className={`redmine-tag is-${cor}`}>{tipo}</span></td><td>{atividade}</td><td><FiUsers aria-hidden="true"/> {pessoa}</td></tr>)}</tbody></table></div>;
    case 12: return <Cards items={ [['Organização','Vincule corretamente à tarefa pai'],['Clareza','Use títulos objetivos que identifiquem a atividade'],['Responsabilidade','Confira o profissional atribuído'],['Atualização','Mantenha situação e percentual coerentes'],['Rastreabilidade','Registre informações relevantes'],['Colaboração','Comunique dúvidas, impedimentos e impactos na entrega']] }/>;
    default: return <div className="redmine-cover redmine-closing"><span className="redmine-eyebrow">ONBOARDING SIGEPers</span><h2>Organização também<br/>faz parte da entrega!</h2><div className="redmine-pills"><span>Clareza</span><span>Colaboração</span><span>Qualidade</span></div><img src={encerramento} alt="Personagens do SIGEP celebrando o trabalho em equipe."/><strong>Um time alinhado e organizado entrega com mais clareza, colaboração e qualidade.</strong></div>;
  }
}

export function RedmineTutorial() {
  const [slide,setSlide] = useState(0);
  const [todos,setTodos] = useState(false);
  return <section className="calendar-main-panel redmine-tutorial">
    <header className="calendar-panel-header"><FiBookOpen aria-hidden="true"/><h1>Abertura de Redmine</h1></header>
    <div className="redmine-toolbar"><label>Etapa<select value={slide} onChange={e=>setSlide(Number(e.target.value))}>{titulos.map((t,i)=><option value={i} key={t}>{String(i+1).padStart(2,'0')} · {t}</option>)}</select></label><button type="button" aria-pressed={todos} onClick={()=>setTodos(!todos)}><FiGrid aria-hidden="true"/>{todos?'Ver apresentação':'Ver todas as etapas'}</button></div>
    <div className="redmine-slides">{(todos ? titulos.map((_,i)=>i) : [slide]).map(i=><section className="redmine-slide" key={i} aria-labelledby={`redmine-slide-${i}`}>
      <div className="redmine-slide-heading"><span>{String(i+1).padStart(2,'0')} / 14 {i>0&&i<10?`· PASSO ${i}`:''}</span><h2 id={`redmine-slide-${i}`}>{titulos[i]}</h2></div><Conteudo slide={i}/>
    </section>)}</div>
    {!todos && <nav className="redmine-navigation" aria-label="Navegação do guia Redmine"><button type="button" disabled={slide===0} onClick={()=>setSlide(slide-1)}><FiArrowLeft aria-hidden="true"/>Anterior</button><span role="status">Etapa {slide+1} de 14</span><button type="button" disabled={slide===13} onClick={()=>setSlide(slide+1)}>Próxima<FiArrowRight aria-hidden="true"/></button></nav>}
    <div className="redmine-footer"><FiFileText aria-hidden="true"/><FiDatabase aria-hidden="true"/><FiCode aria-hidden="true"/><FiShield aria-hidden="true"/><FiSearch aria-hidden="true"/><FiGitBranch aria-hidden="true"/><span>Requisitos · Banco de Dados · Desenvolvimento · Qualidade</span></div>
  </section>;
}
