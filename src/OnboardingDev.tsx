import { FiFileText, FiZap, FiLayers, FiUsers, FiTarget, FiAward, FiTool, FiBriefcase, FiUser, FiCreditCard, FiMonitor, FiShield, FiCode, FiSearch, FiCalendar, FiMessageCircle, FiFlag, FiDatabase } from 'react-icons/fi';
import type { ReactNode } from 'react';
import './onboarding-dev.css';
import boasVindasSigep from './assets/onboarding/boas-vindas-sigep.png';
import encerramentoSigep from './assets/onboarding/encerramento-sigep.png';
import conhecendoSigep from './assets/onboarding/conhecendo-sigep.png';

const times = [
  ['SIGEP 1', 'Rodrigo Schecheli Bussolo', 'Rodrigo Thaua Lima Barroso', 'Rogério Carmo de Lima'],
  ['SIGEP 2', 'Luciano da Silva Oliveira', 'João Guilherme Antunes Lima Barros', 'Lohan Date da Silva'],
  ['SIGEP 3', 'Alex Sandro Pereira Garcia', 'Gabriel Rodrigues de Moura', 'Thassyus Fabiano Mariano de Almeida Carvalho'],
  ['SIGEP 4', 'André Parada de Oliveira Machado', 'Tiago Danilo de Matos Bankow'],
];
const etapas = [
  ['Refinamento', 'Detalhar demandas, esclarecer dúvidas e alinhar regras de negócio e critérios de aceitação.', 'Antes da sprint'],
  ['Sprint Planning', 'Definir o objetivo da sprint e selecionar as atividades que serão desenvolvidas.', 'Dia 1'],
  ['Planning Poker', 'Estimar o esforço de forma colaborativa, considerando a experiência do time.', 'Dia 1'],
  ['Daily', 'Reunião rápida diária: andamento, impedimentos e próximos passos.', 'Todo dia'],
  ['Sprint Review', 'Demonstrar as funcionalidades, coletar feedback e encerrar o ciclo.', 'Dia 15'],
];
const metodologia = [
  ['Ágil', 'Planejamento em ciclos curtos.', 'Adaptação às necessidades do projeto.', 'Comunicação constante entre os envolvidos.'],
  ['Incremental', 'Construção progressiva das funcionalidades.', 'Entregas contínuas.', 'Evolução do produto a cada sprint.'],
  ['Colaborativa', 'Trabalho conjunto entre requisitos, desenvolvimento e qualidade.', 'Compartilhamento de conhecimentos.', 'Participação ativa nas decisões.'],
  ['Orientada a resultados', 'Priorização de funcionalidades essenciais.', 'Foco nos objetivos do projeto.', 'Validação contínua das entregas.'],
];

function Cards({items}: {items: string[][]}) {
  const icons = [FiZap, FiLayers, FiUsers, FiTarget, FiAward, FiTool];
  return <div className="sigep-definitions onboarding-dev-cards">{items.map(([titulo, ...linhas], index) => {
    const Icon = icons[index % icons.length];
    return <article className="sigep-definition-card" key={titulo}><span className={`onboarding-icon onboarding-color-${index % 6}`}><Icon aria-hidden="true" /></span><h2>{titulo}</h2><ul>{linhas.map(linha => <li key={linha}>{linha}</li>)}</ul></article>;
  })}</div>;
}
function Introducao({numero, titulo, children}: {numero: string; titulo: string; children: ReactNode}) {
  return <section className={`calendar-process-overview${/^\d/.test(numero) ? ' onboarding-numbered-section' : ''}`}><div><span>{numero}</span><strong>{titulo}</strong>{children}</div></section>;
}

export function OnboardingDev() {
  return <section className="calendar-main-panel onboarding-dev-page">
    <header className="calendar-panel-header"><FiFileText aria-hidden="true" /><h1>Onboarding DEV — SIGEP</h1></header>
    <div className="calendar-process-content">
      <Introducao numero="BOAS-VINDAS" titulo="Bem-vindos ao time SIGEP!"><p>Conheça nosso projeto, nossa equipe e a forma como trabalhamos para construir uma solução que vai transformar a gestão de pessoas e a folha de pagamento do Estado.</p><img className="onboarding-welcome-image" src={boasVindasSigep} alt="Capivara e onça do SIGEP representando a integração entre Gestão de Pessoas e Folha de Pagamento." width={1536} height={1024} /></Introducao>
      <section className="calendar-process-overview onboarding-numbered-section onboarding-project-intro" aria-labelledby="onboarding-project-title"><div className="onboarding-project-layout"><div><span>01 · O PROJETO</span><strong id="onboarding-project-title">Conhecendo o SIGEP</strong><p>O Sistema Inteligente de Gestão de Pessoas e Folha de Pagamento foi criado para modernizar, integrar e automatizar os processos do Estado de Mato Grosso. Ele vai substituir o SEAP por uma solução mais moderna, integrada e eficiente.</p></div><img src={conhecendoSigep} alt="Tela inicial do SIGEP com os módulos de gestão de pessoas e os acessos rápidos do sistema." width={1911} height={953} loading="lazy" /></div></section>
      <Cards items={[
        ['Modernização', 'Evolução tecnológica dos processos de gestão de pessoas.'],
        ['Integração', 'Centralização e conexão das informações e funcionalidades.'],
        ['Eficiência', 'Automatização de processos e melhoria da gestão administrativa.'],
      ]} />
      <Introducao numero="02 · OBJETIVO ATÉ O FINAL DO ANO" titulo="Processar uma folha de pagamento utilizando o SIGEP até o final de 2026"><p>Garantir uma entrega funcional, integrada e consistente, evoluindo o sistema de forma incremental.</p></Introducao>
      <section className="onboarding-vinculos" aria-labelledby="onboarding-vinculos-title">
        <h2 id="onboarding-vinculos-title">Tipos de vínculo contemplados nesta entrega</h2>
        <div className="onboarding-vinculos-grid">{[
          {nome: 'Contrato Temporário', icon: FiFileText},
          {nome: 'Contrato Temporário Vínculo Único', icon: FiCreditCard},
          {nome: 'Estagiários', icon: FiUser},
          {nome: 'Bolsistas', icon: FiAward},
          {nome: 'Residentes Técnicos', icon: FiTool},
          {nome: 'Exclusivamente Comissionados', icon: FiBriefcase},
        ].map(({nome, icon: Icon}, index) => <article className="onboarding-vinculo-card" key={nome}><span className={`onboarding-icon onboarding-color-${index}`}><Icon aria-hidden="true" /></span><h3>{nome}</h3></article>)}</div>
      </section>
      <Introducao numero="03 · METODOLOGIA" titulo="Como trabalhamos?"><p>Planejar, entregar, validar e evoluir continuamente.</p></Introducao>
      <Cards items={metodologia} />
      <Introducao numero="04 · ESTRUTURA DE TRABALHO" titulo="Conheça nosso time"><p>Requisitos, desenvolvimento, DBAs e QA trabalham juntos em todas as etapas.</p></Introducao>
      <section className="onboarding-org" aria-label="Estrutura do time SIGEP">
        <div className="onboarding-org-lead"><FiBriefcase aria-hidden="true" /><div><span>Gerente de Projetos</span><strong>Adriane</strong></div></div>
        <div className="onboarding-org-lead onboarding-org-po"><FiTarget aria-hidden="true" /><div><span>Líder de Projeto / Product Owner (PO)</span><strong>Isabeli</strong></div></div>
        <div className="onboarding-org-branches">
          {[
            {titulo: 'Análise de Requisitos', icon: FiFileText, cor: 'teal', nomes: ['Danielle', 'Carlos', 'Taylor', 'Marcela', 'Isabeli']},
            {titulo: 'Desenvolvimento', icon: FiMonitor, cor: 'blue', nomes: ['SIGEP 1', 'SIGEP 2', 'SIGEP 3', 'SIGEP 4']},
            {titulo: 'DBAs', icon: FiDatabase, cor: 'purple', nomes: ['Aryadne', 'Eddie']},
            {titulo: 'Qualidade (QA)', icon: FiShield, cor: 'amber', nomes: ['Murilo', 'Deyvison']},
          ].map(({titulo, icon: Icon, cor, nomes}) => <article className={`onboarding-org-branch is-${cor}`} key={titulo}><h3><Icon aria-hidden="true" />{titulo}</h3><ul>{nomes.map(nome => <li key={nome}>{nome}</li>)}</ul>{cor==='blue' && <small>Quatro times de desenvolvimento</small>}</article>)}
        </div>
        <p className="onboarding-org-caption"><FiUsers aria-hidden="true" />Frentes conectadas: requisitos, desenvolvimento, DBAs e QA trabalham juntos em todas as etapas.</p>
      </section>
      <Introducao numero="05 · TIMES DE DESENVOLVIMENTO" titulo="Quatro times conectados"><p>Conheça os integrantes de cada time de desenvolvimento.</p></Introducao>
      <div className="onboarding-teams">{times.map(([nome, lider, ...integrantes], index) => <article className={`onboarding-team onboarding-team-${index}`} key={nome}><h3>{nome}</h3><div className="onboarding-team-lead"><FiAward aria-hidden="true" /><span>TECH LEAD</span><strong>{lider}</strong></div><ul>{integrantes.map(integrante => <li key={integrante}><FiCode aria-hidden="true" />{integrante}</li>)}</ul></article>)}</div>
      <Introducao numero="06 · NOSSO RITMO DE TRABALHO" titulo="Como funciona nossa sprint?"><p>Sprints de 15 dias corridos, com alinhamento diário e validação das entregas ao final do ciclo.</p></Introducao>
      <div className="onboarding-sprint-duration"><FiCalendar aria-hidden="true" />Sprints de <strong>15 dias corridos</strong></div>
      <ol className="onboarding-ceremonies" aria-label="Cerimônias da sprint">{etapas.map(([titulo, descricao, periodo], i) => {
        const Icon = [FiSearch, FiFileText, FiLayers, FiMessageCircle, FiFlag][i];
        return <li className={`onboarding-ceremony onboarding-stage-${i}`} key={titulo}><div className="onboarding-ceremony-heading"><span className="onboarding-stage-icon"><Icon aria-hidden="true" /></span><span className="onboarding-stage-number">{i+1}</span></div><h3>{titulo}</h3><p>{descricao}</p><span className="onboarding-stage-period">{periodo}</span></li>;
      })}</ol>
      <Introducao numero="07 · CRONOGRAMA DA SPRINT" titulo="Nosso ciclo de desenvolvimento"><p>O ciclo de entrega tem 30 dias: 15 dias de desenvolvimento e 15 dias de teste. Ao concluir o ciclo, uma versão é liberada para homologação.</p></Introducao>
      <section className="onboarding-release-cycle" aria-label="Ciclo de 30 dias para homologação">
        <div className="onboarding-release-stages">
          <article><span className="onboarding-icon onboarding-color-0"><FiCode aria-hidden="true" /></span><div><h3>Desenvolvimento</h3><strong>15 dias</strong><p>Implementação das funcionalidades da sprint.</p></div></article>
          <article><span className="onboarding-icon onboarding-color-1"><FiShield aria-hidden="true" /></span><div><h3>Teste · D−1</h3><strong>15 dias</strong><p>QA testa a entrega da sprint anterior de desenvolvimento.</p></div></article>
          <article><span className="onboarding-icon onboarding-color-3"><FiFlag aria-hidden="true" /></span><div><h3>Liberação para homologação</h3><strong>Ciclo de 30 dias</strong><p>A versão validada segue para homologação.</p></div></article>
        </div>
        <p className="onboarding-release-note"><FiLayers aria-hidden="true" /><span><strong>Testes sempre em D−1:</strong> enquanto o desenvolvimento trabalha na sprint atual, o teste executa a sprint anterior, uma sprint atrás do desenvolvimento.</span></p>
      </section>
      <ol className="onboarding-timeline" aria-label="Cronograma da sprint">{[
        {titulo:'Refinamento', periodo:'Antes da sprint', icon:FiSearch, itens:['Preparação e detalhamento das demandas.', 'Alinhamento de requisitos e esclarecimento de dúvidas.'], cor:0},
        {titulo:'Planning e Planning Poker', periodo:'Início · Dia 1', icon:FiLayers, itens:['Definição das atividades.', 'Estimativas e planejamento da execução.'], cor:1},
        {titulo:'Desenvolvimento e acompanhamento', periodo:'Dias 1 a 15 · todos os dias', icon:FiCode, itens:['Desenvolvimento das funcionalidades.', 'Testes e validações.', 'Daily e alinhamentos.', 'Tratamento de impedimentos.'], cor:2},
        {titulo:'Sprint Review', periodo:'Último dia', icon:FiFlag, itens:['Demonstração das entregas.', 'Coleta de feedback.', 'Encerramento do ciclo.'], cor:4},
      ].map(({titulo,periodo,icon:Icon,itens,cor}) => <li className={`onboarding-timeline-step onboarding-stage-${cor}`} key={titulo}><span className="onboarding-timeline-period">{periodo}</span><div className="onboarding-timeline-node"><span className="onboarding-stage-icon"><Icon aria-hidden="true" /></span></div><article><h3>{titulo}</h3><ul>{itens.map(item => <li key={item}>{item}</li>)}</ul></article></li>)}</ol>
      <Introducao numero="08 · ORGANIZAÇÃO NA SPRINT" titulo="Autonomia e colaboração no desenvolvimento"><p>Não há divisão fixa entre front-end e back-end. O próprio time distribui as demandas conforme a necessidade, decide quem assume cada atividade e compartilha a responsabilidade pela execução e pela qualidade da sprint.</p></Introducao>
      <section className="onboarding-collaboration" aria-label="Colaboração nas atividades da sprint">
        <div className="onboarding-collaboration-visual">
          <p>No SIGEP, trabalhamos de forma colaborativa e não estabelecemos previamente uma divisão fixa entre desenvolvedores de front-end e back-end.</p>
          <div className="onboarding-collaboration-diagram" role="img" aria-label="Atividades da sprint no centro, conectadas a quatro grupos de desenvolvedores que colaboram entre si.">
            <svg viewBox="0 0 320 320" aria-hidden="true"><defs><marker id="onboarding-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#14b8a6" /></marker></defs><circle cx="160" cy="160" r="113" fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeDasharray="6 5" />{[[160,75,160,103],[160,217,160,245],[75,160,103,160],[217,160,245,160]].map(([x1,y1,x2,y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#14b8a6" strokeWidth="1.5" markerStart="url(#onboarding-arrow)" markerEnd="url(#onboarding-arrow)" />)}</svg>
            <div className="onboarding-collaboration-center"><FiLayers aria-hidden="true" /><strong>Atividades da<br />sprint</strong></div>
            {['top','right','bottom','left'].map((position, i) => <span key={position} className={`onboarding-collaborator is-${position} onboarding-color-${[0,2,3,1][i]}`}><FiUsers aria-hidden="true" /></span>)}
          </div>
        </div>
        <div className="onboarding-collaboration-cards">{[
          {titulo:'Sem divisão fixa entre front e back', texto:'O próprio time define onde atuar, conforme a necessidade.', icon:FiCode, cor:0},
          {titulo:'Distribuição colaborativa das demandas', texto:'Ninguém recebe tarefas prontas: o time decide quem assume cada atividade.', icon:FiUsers, cor:1},
          {titulo:'Autonomia do time', texto:'Todos participam das decisões sobre execução e organização.', icon:FiTarget, cor:2},
          {titulo:'Compartilhamento de conhecimento', texto:'Troca de experiências e apoio entre os desenvolvedores.', icon:FiFileText, cor:3},
          {titulo:'Responsabilidade conjunta', texto:'Todos contribuem para os objetivos e a qualidade da sprint.', icon:FiShield, cor:4},
        ].map(({titulo,texto,icon:Icon,cor}) => <article className="onboarding-collaboration-card" key={titulo}><span className={`onboarding-icon onboarding-color-${cor}`}><Icon aria-hidden="true" /></span><div><h3>{titulo}</h3><p>{texto}</p></div></article>)}</div>
      </section>
      <Introducao numero="09 · NOSSA CULTURA" titulo="O que esperamos de você?"><p>Participação ativa e compromisso com o propósito e o impacto do SIGEP.</p></Introducao>
      <Cards items={[
        ['Colaboração', 'Trabalhar em equipe, apoiar os colegas e compartilhar conhecimento.'],
        ['Proatividade', 'Ter iniciativa, identificar melhorias e contribuir com soluções.'],
        ['Comunicação', 'Compartilhar dúvidas, dificuldades e sugestões, mantendo o time alinhado.'],
        ['Comprometimento', 'Assumir responsabilidades e contribuir para os objetivos da sprint.'],
        ['Aprendizado contínuo', 'Estar aberto a novos conhecimentos, tecnologias e regras de negócio.'],
        ['Senso de produto', 'Entender o propósito do SIGEP e o impacto do que desenvolvemos.'],
      ]} />
      <section className="onboarding-closing" aria-labelledby="onboarding-closing-title">
        <div className="onboarding-closing-copy">
          <h2 id="onboarding-closing-title">Juntos, construímos o SIGEP!</h2>
          <p>Mais do que desenvolver funcionalidades, estamos construindo uma solução que vai modernizar a gestão de pessoas e a folha de pagamento do Estado.</p>
          <p>Cada entrega representa um avanço importante. Colaboração, iniciativa e comprometimento de cada integrante são essenciais para alcançarmos nossos objetivos.</p>
          <strong>Sejam bem-vindos ao time SIGEP!</strong>
        </div>
        <div className="onboarding-closing-visual">
          <img src={encerramentoSigep} alt="Capivara e onça do SIGEP em uma reunião virtual, conectando gestão de pessoas e folha de pagamento." width={1672} height={941} loading="lazy" />
          <ul><li><FiUsers aria-hidden="true" />Colaboração</li><li><FiZap aria-hidden="true" />Iniciativa</li><li><FiShield aria-hidden="true" />Compromisso</li></ul>
        </div>
      </section>
    </div>
  </section>;
}
