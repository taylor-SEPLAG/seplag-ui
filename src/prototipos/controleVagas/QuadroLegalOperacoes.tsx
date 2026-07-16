import { useMemo, useState, type FormEvent } from "react";
import { vagasIndividualizadasMock } from "./mockData";
import type { QuadroAutorizadoRow } from "./types";
import { aplicarAlteracaoQuadroLegal, type TipoAlteracaoQuadroLegal } from "./quadroLegalUtils";
import "./quadroLegalOperacoes.css";

const rotulos: Record<TipoAlteracaoQuadroLegal, string> = { AMPLIACAO: "Ampliação legal", REDUCAO: "Redução legal", TRANSFORMACAO: "Transformação", EXTINCAO_PROGRESSIVA: "Extinção progressiva" };
const descricoes: Record<TipoAlteracaoQuadroLegal, string> = {
  AMPLIACAO: "Cria novos identificadores após o último sequencial, sem reutilizar códigos.",
  REDUCAO: "Extingue vagas disponíveis e mantém ocupadas em extinção até a vacância.",
  TRANSFORMACAO: "Preserva a origem no histórico e gera vagas numeradas para o cargo de destino.",
  EXTINCAO_PROGRESSIVA: "Bloqueia novas ocupações; vagas ocupadas desaparecem do limite somente após vagarem.",
};

export function QuadroLegalOperacoes({ registro }: { registro: QuadroAutorizadoRow }) {
  const vagasOriginais = useMemo(() => vagasIndividualizadasMock.filter((vaga) => vaga.quadroAutorizadoId === registro.id), [registro.id]);
  const [tipo, setTipo] = useState<TipoAlteracaoQuadroLegal>("AMPLIACAO");
  const [quantidade, setQuantidade] = useState(1);
  const [lei, setLei] = useState("");
  const [processo, setProcesso] = useState(registro.processo);
  const [dataEfeito, setDataEfeito] = useState("2026-08-01");
  const [novoCargo, setNovoCargo] = useState("");
  const [resultado, setResultado] = useState<ReturnType<typeof aplicarAlteracaoQuadroLegal> | null>(null);

  const simular = (event: FormEvent) => {
    event.preventDefault();
    setResultado(aplicarAlteracaoQuadroLegal(vagasOriginais, { tipo, quantidade, lei, processo, dataEfeito, novoCargo }));
  };

  return <section className="prototype-legal-card">
    <header><div><h2>Evolução do quadro legal</h2><p>Simule o efeito de uma nova lei sobre as vagas individuais deste quadro.</p></div><span><i className="pi pi-lock" /> Operação rastreável</span></header>
    <div className="prototype-legal-scope"><i className="pi pi-shield" /><div><strong>Escopo controlado</strong><span>Somente cargos efetivos e comissionados podem compor o quadro legal. Contratos temporários não geram vagas neste módulo.</span></div></div>
    <form onSubmit={simular}>
      <div className="prototype-legal-types">{(Object.keys(rotulos) as TipoAlteracaoQuadroLegal[]).map((item) => <button key={item} type="button" className={tipo === item ? "active" : ""} onClick={() => { setTipo(item); setResultado(null); }}><i className={item === "AMPLIACAO" ? "pi pi-plus-circle" : item === "REDUCAO" ? "pi pi-minus-circle" : item === "TRANSFORMACAO" ? "pi pi-sync" : "pi pi-ban"} /><strong>{rotulos[item]}</strong><small>{descricoes[item]}</small></button>)}</div>
      <div className="prototype-legal-fields"><label><span>Lei ou ato legal *</span><input value={lei} onChange={(e) => setLei(e.target.value)} placeholder="Ex.: Lei Complementar nº 999/2026" /></label><label><span>Data de efeito *</span><input type="date" value={dataEfeito} onChange={(e) => setDataEfeito(e.target.value)} /></label><label><span>Processo administrativo</span><input value={processo} onChange={(e) => setProcesso(e.target.value)} /></label>{tipo !== "EXTINCAO_PROGRESSIVA" && <label><span>Quantidade *</span><input type="number" min="1" max={tipo === "AMPLIACAO" ? 9999 : vagasOriginais.length} value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} /></label>}{tipo === "TRANSFORMACAO" && <label><span>Novo cargo *</span><input value={novoCargo} onChange={(e) => setNovoCargo(e.target.value)} placeholder="Cargo de destino" /></label>}<button type="submit"><i className="pi pi-calculator" /> Simular impacto legal</button></div>
    </form>
    {resultado && <div className="prototype-legal-result"><header><div><span>Resultado da simulação</span><h3>{rotulos[tipo]}</h3></div><span className={resultado.alertas.length ? "warning" : "ok"}>{resultado.alertas.length ? "Requer atenção" : "Consistente"}</span></header><div className="prototype-legal-result-kpis"><article><span>Quadro anterior</span><strong>{resultado.quantitativoAnterior}</strong></article><article><span>Quadro resultante</span><strong>{resultado.quantitativoPosterior}</strong></article><article><span>Vagas geradas</span><strong>{resultado.criadas.length}</strong></article><article><span>Vagas afetadas</span><strong>{resultado.alteradas.length}</strong></article></div>{resultado.alertas.map((alerta) => <p className="prototype-legal-alert" key={alerta}><i className="pi pi-exclamation-triangle" /> {alerta}</p>)}{(resultado.criadas.length > 0 || resultado.alteradas.length > 0) && <div className="prototype-legal-impact-list"><h4>Amostra das vagas impactadas</h4><table><thead><tr><th>Identificador</th><th>Efeito</th><th>Estado</th><th>Situação legal</th></tr></thead><tbody>{[...resultado.criadas, ...resultado.alteradas].slice(0, 8).map((vaga) => <tr key={`${vaga.id}-${vaga.situacaoLegal}`}><td><strong>{vaga.id}</strong></td><td>{resultado.criadas.some((item) => item.id === vaga.id) ? "Nova vaga numerada" : "Atualização preservando o código"}</td><td>{vaga.estado === "DISPONIVEL" ? "Disponível" : "Ocupada"}</td><td>{vaga.situacaoLegal.replaceAll("_", " ")}</td></tr>)}</tbody></table>{resultado.criadas.length + resultado.alteradas.length > 8 && <small>Mais {resultado.criadas.length + resultado.alteradas.length - 8} vaga(s) receberiam o mesmo tratamento.</small>}</div>}<footer><i className="pi pi-info-circle" /><span>A simulação não altera os mocks. Na implementação definitiva, a publicação da nova versão gravará os eventos imutáveis e atualizará a posição legal pela data de efeito.</span></footer></div>}
  </section>;
}
