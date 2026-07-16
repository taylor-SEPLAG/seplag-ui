import { useMemo, useState } from "react";
import "./controleVagasRegras.css";

import type { ImpactoRegra, RegraEvento } from "./types";
import { pendenciasRegrasMock, regrasControleVagasMock } from "./mockData";

const impactoMeta: Record<ImpactoRegra, { icon: string; className: string }> = {
  Autorização: { icon: "pi pi-file-edit", className: "is-blue" },
  Comprometimento: { icon: "pi pi-clock", className: "is-purple" },
  Ocupação: { icon: "pi pi-user-plus", className: "is-green" },
  Liberação: { icon: "pi pi-sign-out", className: "is-cyan" },
  Bloqueio: { icon: "pi pi-lock", className: "is-orange" },
  Exceção: { icon: "pi pi-exclamation-triangle", className: "is-red" },
};

export function ControleVagasRegrasContent() {
  const [aba, setAba] = useState<"eventos" | "dimensoes" | "parametros" | "pendencias">("eventos");
  const [busca, setBusca] = useState("");
  const [impacto, setImpacto] = useState("");
  const [regraSelecionada, setRegraSelecionada] = useState<RegraEvento | null>(null);
  const [regras, setRegras] = useState(regrasControleVagasMock);

  const regrasFiltradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return regras.filter((regra) => {
      const atendeBusca = !termo || `${regra.evento} ${regra.origem} ${regra.comportamento}`.toLocaleLowerCase("pt-BR").includes(termo);
      return atendeBusca && (!impacto || regra.impacto === impacto);
    });
  }, [busca, impacto, regras]);

  const confirmarRegra = (id: number) => {
    setRegras((atuais) => atuais.map((regra) => regra.id === id ? { ...regra, validacao: "Confirmada" } : regra));
    setRegraSelecionada(null);
  };

  return (
    <div className="prototype-vagas-rules-page">
      <header className="prototype-vagas-page-header">
        <div>
          <span className="prototype-vagas-eyebrow">Controle de Vagas</span>
          <h1>Regras e Parâmetros</h1>
          <p>Definições utilizadas no cálculo do quadro, da ocupação e do saldo disponível.</p>
        </div>
        <span className="prototype-vagas-version"><i className="pi pi-wrench" /> Protótipo — regras provisórias</span>
      </header>

      <div className="prototype-vagas-notice" role="status">
        <i className="pi pi-info-circle" />
        <div><strong>Base inicial para validação.</strong><span>As regras abaixo poderão ser refinadas sem alterar o histórico das movimentações.</span></div>
      </div>

      <section className="prototype-vagas-summary" aria-label="Resumo da configuração">
        <article><span className="is-blue"><i className="pi pi-list" /></span><div><strong>12</strong><small>Eventos configurados</small></div></article>
        <article><span className="is-green"><i className="pi pi-calculator" /></span><div><strong>6</strong><small>Quantidades controladas</small></div></article>
        <article><span className="is-purple"><i className="pi pi-sitemap" /></span><div><strong>3 + opcionais</strong><small>Dimensões da chave</small></div></article>
        <article><span className="is-orange"><i className="pi pi-question-circle" /></span><div><strong>{pendenciasRegrasMock.length}</strong><small>Pontos para validação</small></div></article>
      </section>

      <section className="prototype-vagas-formula-card">
        <div><span>Fórmula provisória do saldo</span><strong>Disponível = Autorizada − Ocupada − Comprometida − Bloqueada</strong></div>
        <div className="prototype-vagas-formula-note"><i className="pi pi-shield" /><span>Saldo negativo será apresentado como <strong>excedente</strong>, sem criar autorização automaticamente.</span></div>
      </section>

      <nav className="prototype-vagas-tabs" aria-label="Seções da configuração">
        <button className={aba === "eventos" ? "is-active" : ""} onClick={() => setAba("eventos")}>Matriz de eventos <span>12</span></button>
        <button className={aba === "dimensoes" ? "is-active" : ""} onClick={() => setAba("dimensoes")}>Dimensões do controle</button>
        <button className={aba === "parametros" ? "is-active" : ""} onClick={() => setAba("parametros")}>Parâmetros gerenciais</button>
        <button className={aba === "pendencias" ? "is-active" : ""} onClick={() => setAba("pendencias")}>Pendências <span>{pendenciasRegrasMock.length}</span></button>
      </nav>

      {aba === "eventos" && (
        <section className="prototype-vagas-panel">
          <div className="prototype-vagas-panel-heading"><div><h2>Matriz de impacto dos eventos</h2><p>Como cada informação recebida altera o saldo de vagas.</p></div></div>
          <div className="prototype-vagas-filters">
            <label><span>Pesquisar</span><div><i className="pi pi-search" /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Evento, origem ou comportamento" /></div></label>
            <label><span>Impacto</span><select value={impacto} onChange={(e) => setImpacto(e.target.value)}><option value="">Todos</option>{Object.keys(impactoMeta).map((item) => <option key={item}>{item}</option>)}</select></label>
            <button onClick={() => { setBusca(""); setImpacto(""); }}><i className="pi pi-filter-slash" /> Limpar</button>
          </div>
          <div className="prototype-vagas-table-wrap">
            <table><thead><tr><th>Evento</th><th>Origem</th><th>Impacto</th><th>Comportamento provisório</th><th>Validação</th><th aria-label="Ações" /></tr></thead>
              <tbody>{regrasFiltradas.map((regra) => { const meta = impactoMeta[regra.impacto]; return <tr key={regra.id}><td><strong>{regra.evento}</strong></td><td>{regra.origem}</td><td><span className={`prototype-vagas-impact ${meta.className}`}><i className={meta.icon} />{regra.impacto}</span></td><td>{regra.comportamento}</td><td><span className={`prototype-vagas-status ${regra.validacao === "Confirmada" ? "is-confirmed" : ""}`}><i className={regra.validacao === "Confirmada" ? "pi pi-check-circle" : "pi pi-clock"} />{regra.validacao}</span></td><td><button className="prototype-vagas-icon-button" title="Analisar regra" onClick={() => setRegraSelecionada(regra)}><i className="pi pi-pencil" /></button></td></tr>; })}</tbody>
            </table>
          </div>
          <footer className="prototype-vagas-table-footer">Exibindo {regrasFiltradas.length} de {regras.length} regras</footer>
        </section>
      )}

      {aba === "dimensoes" && <section className="prototype-vagas-panel"><div className="prototype-vagas-panel-heading"><div><h2>Composição da chave de controle</h2><p>A vaga será inicialmente quantitativa e agrupada pelas dimensões abaixo.</p></div></div><div className="prototype-vagas-dimension-grid">
        {[{ nome: "Tipo de vínculo", texto: "Efetivo, comissionado, temporário, função, residente ou estagiário", obrigatoria: true, icon: "pi pi-id-card" },{ nome: "Cargo ou função", texto: "Elemento central de identificação do quadro", obrigatoria: true, icon: "pi pi-briefcase" },{ nome: "Órgão", texto: "Responsável pela autorização ou distribuição", obrigatoria: true, icon: "pi pi-building" },{ nome: "Especialidade", texto: "Utilizada apenas quando diferenciar o saldo", obrigatoria: false, icon: "pi pi-tag" },{ nome: "Jornada", texto: "Carga horária quando fizer parte da autorização", obrigatoria: false, icon: "pi pi-clock" },{ nome: "Localidade ou unidade", texto: "Detalhamento territorial ou administrativo", obrigatoria: false, icon: "pi pi-map-marker" }].map((item) => <article key={item.nome}><i className={item.icon} /><div><h3>{item.nome}</h3><p>{item.texto}</p><span className={item.obrigatoria ? "is-required" : ""}>{item.obrigatoria ? "Obrigatória" : "Configurável"}</span></div></article>)}
      </div></section>}

      {aba === "parametros" && <section className="prototype-vagas-panel"><div className="prototype-vagas-panel-heading"><div><h2>Faixas de atenção do dashboard</h2><p>Indicadores visuais para priorização gerencial. Não produzem decisões automáticas.</p></div></div><div className="prototype-vagas-thresholds"><article className="is-regular"><span>Regular</span><strong>até 79,99%</strong><p>Ocupação dentro da faixa esperada.</p></article><article className="is-attention"><span>Atenção</span><strong>80% a 94,99%</strong><p>Saldo reduzido; acompanhar evolução.</p></article><article className="is-critical"><span>Crítica</span><strong>95% a 99,99%</strong><p>Capacidade próxima do limite.</p></article><article className="is-full"><span>Sem saldo</span><strong>100%</strong><p>Não há quantidade disponível.</p></article><article className="is-excess"><span>Excedente</span><strong>acima de 100%</strong><p>Ocupação superior ao autorizado.</p></article></div></section>}

      {aba === "pendencias" && <section className="prototype-vagas-panel"><div className="prototype-vagas-panel-heading"><div><h2>Pontos para validação com a área de negócio</h2><p>O protótipo utiliza premissas provisórias enquanto estas definições estiverem pendentes.</p></div></div><ol className="prototype-vagas-pending-list">{pendenciasRegrasMock.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item}</strong><small>Aguardando validação</small></div><i className="pi pi-chevron-right" /></li>)}</ol></section>}

      {regraSelecionada && <div className="prototype-vagas-modal-backdrop" role="presentation" onMouseDown={() => setRegraSelecionada(null)}><section className="prototype-vagas-modal" role="dialog" aria-modal="true" aria-labelledby="regra-titulo" onMouseDown={(e) => e.stopPropagation()}><header><div><span>Análise da regra</span><h2 id="regra-titulo">{regraSelecionada.evento}</h2></div><button onClick={() => setRegraSelecionada(null)} aria-label="Fechar"><i className="pi pi-times" /></button></header><div className="prototype-vagas-modal-body"><label>Origem<input value={regraSelecionada.origem} readOnly /></label><label>Impacto<input value={regraSelecionada.impacto} readOnly /></label><label className="is-wide">Comportamento<textarea value={regraSelecionada.comportamento} readOnly rows={3} /></label><div className="prototype-vagas-modal-warning"><i className="pi pi-exclamation-circle" /><span>Confirmar no protótipo sinaliza que a regra foi revisada. A operação não altera dados externos.</span></div></div><footer><button className="is-secondary" onClick={() => setRegraSelecionada(null)}>Cancelar</button><button className="is-primary" onClick={() => confirmarRegra(regraSelecionada.id)}><i className="pi pi-check" /> Marcar como confirmada</button></footer></section></div>}
    </div>
  );
}
