import { useMemo, useState } from "react";
import { ModalSeplag, BotaoLimparFiltroSeplag, BotaoVoltarSeplag } from "../../componentes";
import { listarQuadrosTemporarios, seletivoTemporario, type QuadroTemporarioCadastro } from "./novoQuadroTemporarioStore";
import { listarCargosControleVagasTemporarias } from "./cargosTemporariosStore";
import { useControlePssStore } from "../controlePss/controlePssStore";
import "./vagasIndividualizadas.css";

type SituacaoOcupacao = "DISPONIVEL" | "EM_OCUPACAO" | "OCUPADA";
type SituacaoLegal = "ATIVA" | "EXTINTA" | "ENCERRADA";
type VagaTemporaria = {
  id: string;
  codigo: string;
  quadro: QuadroTemporarioCadastro;
  cargo: QuadroTemporarioCadastro["cargos"][number];
  orgaoDestino: string;
  situacaoOcupacao: SituacaoOcupacao;
  situacaoLegal: SituacaoLegal;
};

const rotuloOcupacao: Record<SituacaoOcupacao, string> = {
  DISPONIVEL: "Disponível",
  EM_OCUPACAO: "Em ocupação",
  OCUPADA: "Ocupada",
};
const rotuloLegal: Record<SituacaoLegal, string> = {
  ATIVA: "Ativa",
  EXTINTA: "Extinta",
  ENCERRADA: "Encerrada",
};

export function VagasIndividualizadasContent() {
  const [quadros] = useState(() => listarQuadrosTemporarios());
  const { certames } = useControlePssStore();
  const [quadroId, setQuadroId] = useState("");
  const [orgao, setOrgao] = useState("");
  const [codigo, setCodigo] = useState("");
  const [ocupante, setOcupante] = useState("");
  const [ocupacao, setOcupacao] = useState("");
  const [situacaoLegal, setSituacaoLegal] = useState("");
  const [selecionada, setSelecionada] = useState<VagaTemporaria | null>(null);

  const quadro = quadros.find((item) => item.id === quadroId);
  const vagas = useMemo(() => quadro ? gerarVagas(quadro) : [], [quadro]);
  const orgaos = [...new Set(vagas.map((vaga) => vaga.orgaoDestino))].sort();
  const filtradas = vagas.filter((vaga) =>
    (!orgao || vaga.orgaoDestino === orgao) &&
    (!codigo || vaga.codigo.toLocaleLowerCase("pt-BR").includes(codigo.toLocaleLowerCase("pt-BR"))) &&
    (!ocupante || "".includes(ocupante.toLocaleLowerCase("pt-BR"))) &&
    (!ocupacao || vaga.situacaoOcupacao === ocupacao) &&
    (!situacaoLegal || vaga.situacaoLegal === situacaoLegal),
  );
  const previstas = quadro ? quadro.cargos.reduce((total, cargo) => total + cargo.quantidadeVagas, 0) : 0;
  const reais = vagas.length;
  const disponiveis = vagas.filter((vaga) => vaga.situacaoOcupacao === "DISPONIVEL").length;
  const emOcupacao = vagas.filter((vaga) => vaga.situacaoOcupacao === "EM_OCUPACAO").length;
  const ocupadas = vagas.filter((vaga) => vaga.situacaoOcupacao === "OCUPADA").length;
  const limpar = () => { setOrgao(""); setCodigo(""); setOcupante(""); setOcupacao(""); setSituacaoLegal(""); };

  return <main className="temporarios-vagas-page">
    <header className="temporarios-vagas-header">
      <h1>Vagas Contratos Temporários</h1>
      <p>Consulte as vagas vinculadas aos processos seletivos e acompanhe o ingresso e a ocupação.</p>
    </header>

    <section className="temporarios-vagas-kpis" aria-label="Indicadores gerais">
      <Kpi label="Processos seletivos cadastrados" value={certames.filter(seletivoTemporario).length} icon="pi pi-sitemap" />
      <Kpi label="Quadros temporários criados" value={quadros.length} icon="pi pi-file" />
      <Kpi label="Cargos com vagas temporárias" value={listarCargosControleVagasTemporarias().length} icon="pi pi-briefcase" />
      <Kpi label="Vagas temporárias previstas" value={previstas} icon="pi pi-clock" />
    </section>
    <section className="temporarios-vagas-kpis temporarios-vagas-kpis-status" aria-label="Indicadores do quadro selecionado">
      <Kpi label="Vagas temporárias reais" value={reais} icon="pi pi-list" />
      <Kpi label="Vagas disponíveis" value={disponiveis} icon="pi pi-check-circle" kind="available" />
      <Kpi label="Vagas em ocupação" value={emOcupacao} icon="pi pi-user-plus" kind="warning" />
      <Kpi label="Vagas ocupadas" value={ocupadas} icon="pi pi-users" kind="occupied" />
    </section>

    <section className="temporarios-vagas-card temporarios-vagas-filters-card">
      <div className="temporarios-vagas-filters">
        <Campo label="Quadro Contratos Temporários"><select value={quadroId} onChange={(event) => { setQuadroId(event.target.value); limpar(); }}><option value="">Selecione</option>{quadros.map((item) => <option key={item.id} value={item.id}>{item.codigo} — {item.certame.nomeEdital}</option>)}</select></Campo>
        <Campo label="Órgão de destino"><select value={orgao} disabled={!quadro} onChange={(event) => setOrgao(event.target.value)}><option value="">Todos</option>{orgaos.map((item) => <option key={item}>{item}</option>)}</select></Campo>
        <Campo label="Nome da vaga"><span className="temporarios-vagas-search"><input value={codigo} disabled={!quadro} onChange={(event) => setCodigo(event.target.value)} placeholder="Ex.: QT-00001-001" /><i className="pi pi-search" /></span></Campo>
        <Campo label="Ocupante atual"><span className="temporarios-vagas-search"><input value={ocupante} disabled={!quadro} onChange={(event) => setOcupante(event.target.value)} placeholder="Nome, matrícula ou CPF" /><i className="pi pi-search" /></span></Campo>
        <Campo label="Ingresso/ocupação"><select value={ocupacao} disabled={!quadro} onChange={(event) => setOcupacao(event.target.value)}><option value="">Todos</option><option value="DISPONIVEL">Disponível</option><option value="EM_OCUPACAO">Em ocupação</option><option value="OCUPADA">Ocupada</option></select></Campo>
        <Campo label="Situação legal"><select value={situacaoLegal} disabled={!quadro} onChange={(event) => setSituacaoLegal(event.target.value)}><option value="">Todas</option><option value="ATIVA">Ativa</option><option value="EXTINTA">Extinta</option><option value="ENCERRADA">Encerrada</option></select></Campo>
        <div className="temporarios-vagas-clear"><BotaoLimparFiltroSeplag type="button" disabled={!quadro} onClick={limpar} /></div>
      </div>
    </section>

    <section className="temporarios-vagas-card temporarios-vagas-list-card">
      {!quadro ? <div className="temporarios-vagas-empty" role="status"><i className="pi pi-list" /><div><strong>Selecione um Quadro Contratos Temporários</strong><span>As vagas individualizadas serão apresentadas após a seleção.</span></div></div> : <div className="temporarios-vagas-table-wrap"><table><thead><tr><th>Nome da vaga</th><th>Cargo</th><th>Órgão de destino</th><th>Ocupante atual</th><th>Ingresso/ocupação</th><th>Situação legal</th><th>Ações</th></tr></thead><tbody>{filtradas.map((vaga) => <tr key={vaga.id}><td><button type="button" className="temporarios-vagas-link" onClick={() => setSelecionada(vaga)}>{vaga.codigo}</button></td><td><span className="temporarios-vagas-muted">Não definido</span><small>Definido pelo ingresso</small></td><td>{vaga.orgaoDestino || <span className="temporarios-vagas-muted">Não definido</span>}</td><td><span className="temporarios-vagas-muted">Sem ocupante atual</span></td><td><OcupacaoBadge situacao={vaga.situacaoOcupacao} /></td><td><LegalBadge situacao={vaga.situacaoLegal} /></td><td><button className="temporarios-vagas-view" type="button" aria-label={`Visualizar ${vaga.codigo}`} onClick={() => setSelecionada(vaga)}><i className="pi pi-eye" /></button></td></tr>)}</tbody></table>{!filtradas.length && <p className="temporarios-vagas-no-results">Nenhuma vaga encontrada com os filtros informados.</p>}</div>}
    </section>
    {selecionada && <DetalheVaga vaga={selecionada} onClose={() => setSelecionada(null)} />}
  </main>;
}

function gerarVagas(quadro: QuadroTemporarioCadastro): VagaTemporaria[] {
  const legal: SituacaoLegal = quadro.situacao === "ATIVO" ? "ATIVA" : quadro.situacao === "EXTINTO" ? "EXTINTA" : "ENCERRADA";
  let sequencial = 0;
  return quadro.cargos.flatMap((cargo) => Array.from({ length: cargo.quantidadeVagas }, (_, indice) => {
    sequencial += 1;
    return {
    id: `${quadro.id}-${cargo.id}-${indice + 1}`,
    codigo: `${quadro.codigo}-${String(sequencial).padStart(3, "0")}`,
    quadro, cargo,
    orgaoDestino: "",
    situacaoOcupacao: legal === "ATIVA" ? "DISPONIVEL" : "DISPONIVEL",
    situacaoLegal: legal,
  }; }));
}
function Campo({ label, children }: { label: string; children: React.ReactNode }) { return <label className="temporarios-vagas-field"><span>{label}</span>{children}</label>; }
function Kpi({ label, value, icon, kind = "" }: { label: string; value: number; icon: string; kind?: string }) { return <article className={kind}><i className={icon} /><div><span>{label}</span><strong>{value.toLocaleString("pt-BR")}</strong></div></article>; }
function OcupacaoBadge({ situacao }: { situacao: SituacaoOcupacao }) { return <span className={`temporarios-vagas-badge ${situacao.toLowerCase()}`}>{rotuloOcupacao[situacao]}</span>; }
function LegalBadge({ situacao }: { situacao: SituacaoLegal }) { return <span className={`temporarios-vagas-badge legal ${situacao.toLowerCase()}`}>{rotuloLegal[situacao]}</span>; }
function DetalheVaga({ vaga, onClose }: { vaga: VagaTemporaria; onClose: () => void }) { return <ModalSeplag visible titulo={`Detalhe da vaga ${vaga.codigo}`} ariaLabel={`Detalhe da vaga ${vaga.codigo}`} tamanho="min(900px, 94vw)" fechar={onClose} customFooter={<BotaoVoltarSeplag type="button" label="Fechar" icon="pi pi-times" onClick={onClose} />}><div className="temporarios-vagas-detail"><section><h3>Vinculação</h3><dl><Dado label="Quadro" value={vaga.quadro.codigo} /><Dado label="Processo seletivo" value={vaga.quadro.certame.nomeEdital} /><Dado label="Cargo" value="Será informado pelo ingresso" /><Dado label="Órgão de destino" value={vaga.orgaoDestino || "Será informado pelo ingresso"} /><Dado label="Jornada" value="Será informada pelo ingresso" /></dl></section><section><h3>Situação</h3><div className="temporarios-vagas-detail-badges"><OcupacaoBadge situacao={vaga.situacaoOcupacao} /><LegalBadge situacao={vaga.situacaoLegal} /></div><p>Não há ocupante ou processo de ingresso vinculado a esta vaga.</p></section></div></ModalSeplag>; }
function Dado({ label, value }: { label: string; value?: string }) { return <div><dt>{label}</dt><dd>{value || "Não informado"}</dd></div>; }
