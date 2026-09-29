import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { BotaoSeplag } from "@componentes/Botao";
import { BreadcrumbSeplag } from "@componentes/Breadcrumb";
import { CardSeplag } from "@componentes/Card";
import { ModalSeplag } from "@componentes/Modal";
import { obterUnidadesDaVersao } from "./estruturaOrganizacionalStore";
import { adicionarUnidadeNoCanvas, lerOrganogramaCanvas, moverNoCanvas, reorganizarCanvas, type CoordenadaNoOrganograma } from "./organogramaCanvasStore";
import "./organogramaCanvas.css";
import "./organogramaCanvasFullscreen.css";

const nomeOrgao = (sigla: string) => sigla === "SEPLAG" ? "Secretaria de Estado de Planejamento e Gestão" : sigla === "SEDUC" ? "Secretaria de Estado de Educação" : sigla === "POLITEC" ? "Perícia Oficial e Identificação Técnica" : sigla;

export function OrganogramaCanvasContent() {
  const [estado, setEstado] = useState(lerOrganogramaCanvas);
  const [orgao, setOrgao] = useState("POLITEC");
  const versoesDoOrgao = useMemo(() => estado.estrutura.versoes.filter((versao) => versao.orgao === orgao), [estado, orgao]);
  const [versaoId, setVersaoId] = useState(() => estado.estrutura.versoes.find((versao) => versao.orgao === "POLITEC")?.id ?? estado.estrutura.versoes[0]?.id ?? "");
  const unidades = useMemo(() => obterUnidadesDaVersao(estado.estrutura, versaoId), [estado.estrutura, versaoId]);
  const coordenadas = estado.coordenadas[versaoId] ?? {};
  const [selecionadaId, setSelecionadaId] = useState<number | null>(null);
  const [adicionando, setAdicionando] = useState(false);
  const [nomeNova, setNomeNova] = useState("");
  const [tipoNova, setTipoNova] = useState("Unidade");
  const [nivelNovo, setNivelNovo] = useState("Nível de Execução Programática");
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [telaCheia, setTelaCheia] = useState(false);
  const selecionada = unidades.find((unidade) => unidade.id === selecionadaId) ?? null;
  const porId = new Map(unidades.map((unidade) => [unidade.id, unidade]));
  const orgaos = [...new Set(estado.estrutura.versoes.map((versao) => versao.orgao))];

  useEffect(() => {
    const atualizar = () => setTelaCheia(document.fullscreenElement === workspaceRef.current);
    document.addEventListener("fullscreenchange", atualizar);
    return () => document.removeEventListener("fullscreenchange", atualizar);
  }, []);

  const alternarTelaCheia = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await workspaceRef.current?.requestFullscreen();
  };

  const trocarOrgao = (novoOrgao: string) => {
    setOrgao(novoOrgao);
    setVersaoId(estado.estrutura.versoes.find((versao) => versao.orgao === novoOrgao)?.id ?? "");
    setSelecionadaId(null);
  };

  const iniciarArraste = (event: PointerEvent<HTMLButtonElement>, unidadeId: number) => {
    event.preventDefault();
    event.stopPropagation();
    const inicial = coordenadas[unidadeId] ?? { x: 40, y: 40 };
    const pontoInicial = { x: event.clientX, y: event.clientY };
    const mover = (movimento: globalThis.PointerEvent) => {
      const proxima: CoordenadaNoOrganograma = { x: Math.max(12, inicial.x + movimento.clientX - pontoInicial.x), y: Math.max(12, inicial.y + movimento.clientY - pontoInicial.y) };
      setEstado((atual) => moverNoCanvas(atual, versaoId, unidadeId, proxima));
    };
    const soltar = () => {
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
    };
    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar, { once: true });
  };

  const adicionar = () => {
    if (!nomeNova.trim()) return;
    setEstado((atual) => adicionarUnidadeNoCanvas(atual, versaoId, { nome: nomeNova, tipo: tipoNova, nivelOrganizacional: nivelNovo }, selecionadaId));
    setNomeNova("");
    setAdicionando(false);
  };

  return <div className="organograma-canvas-page">
    <CardSeplag title="Organograma em canvas" cols="12" cardHeaderClassNames="prototype-carreira-card" headerNavigation={<BreadcrumbSeplag divided items={[{ label: "Cadastro" }, { label: "Estrutura Organizacional" }, { label: "Organograma Canvas" }]} />}>
      <div className="organograma-canvas-intro"><i className="pi pi-sitemap" /><div><strong>Área experimental independente</strong><span>Esta cópia possui dados e posicionamento próprios. O Organograma original não será alterado.</span></div></div>
      <div className="organograma-canvas-toolbar">
        <label>Órgão/Entidade<select value={orgao} onChange={(event) => trocarOrgao(event.target.value)}>{orgaos.map((item) => <option key={item} value={item}>{item} — {nomeOrgao(item)}</option>)}</select></label>
        <label>Versão<select value={versaoId} onChange={(event) => { setVersaoId(event.target.value); setSelecionadaId(null); }}>{versoesDoOrgao.map((versao) => <option key={versao.id} value={versao.id}>{versao.nome} · {versao.inicio}</option>)}</select></label>
        <div className="organograma-canvas-toolbar-actions"><BotaoSeplag label="Adicionar unidade" icon="pi pi-plus" onClick={() => setAdicionando(true)} /><BotaoSeplag label="Organizar automaticamente" icon="pi pi-sitemap" severity="secondary" onClick={() => setEstado((atual) => reorganizarCanvas(atual, versaoId))} /><BotaoSeplag label={telaCheia ? "Sair da tela cheia" : "Tela cheia"} icon={telaCheia ? "pi pi-window-minimize" : "pi pi-window-maximize"} severity="secondary" onClick={alternarTelaCheia} /></div>
      </div>
      <div ref={workspaceRef} className="organograma-canvas-workspace">
        <aside className="organograma-canvas-panel"><h2>Propriedades</h2>{selecionada ? <><strong>{selecionada.nome}</strong><dl><div><dt>Código</dt><dd>{selecionada.codigo}</dd></div><div><dt>Tipo</dt><dd>{selecionada.tipo}</dd></div><div><dt>Nível</dt><dd>{selecionada.nivelOrganizacional}</dd></div><div><dt>Unidade superior</dt><dd>{selecionada.superiorId ? porId.get(selecionada.superiorId)?.nome ?? "Não encontrada" : "Órgão/Entidade"}</dd></div></dl><p><i className="pi pi-info-circle" /> Arraste o bloco para mudar apenas o posicionamento visual. A conexão é preservada.</p></> : <p>Selecione uma unidade para consultar seus dados ou use-a como referência ao adicionar uma unidade abaixo.</p>}</aside>
        <div className="organograma-canvas-viewport" onClick={() => setSelecionadaId(null)}><div className="organograma-canvas-surface" style={{ minHeight: Math.max(980, ...Object.values(coordenadas).map((item) => item.y + 180)) }}>
          <svg className="organograma-canvas-edges" aria-hidden="true">{unidades.filter((unidade) => unidade.superiorId && coordenadas[unidade.id] && coordenadas[unidade.superiorId]).map((unidade) => { const origem = coordenadas[unidade.superiorId!]; const destino = coordenadas[unidade.id]; const meioY = Math.round((origem.y + 112 + destino.y) / 2); return <path key={unidade.id} d={`M ${origem.x + 112} ${origem.y + 112} V ${meioY} H ${destino.x + 112} V ${destino.y}`} />; })}</svg>
          {unidades.map((unidade) => { const posicao = coordenadas[unidade.id] ?? { x: 24, y: 24 }; return <button type="button" key={unidade.id} className={`organograma-canvas-node ${selecionadaId === unidade.id ? "is-selected" : ""} ${unidade.tipo === "Diretoria" ? "is-directoria" : ""}`} style={{ transform: `translate(${posicao.x}px, ${posicao.y}px)` }} onPointerDown={(event) => iniciarArraste(event, unidade.id)} onClick={(event) => { event.stopPropagation(); setSelecionadaId(unidade.id); }}><span>{unidade.codigo}</span><strong>{unidade.nome}</strong><small>{unidade.tipo} · {unidade.nivelOrganizacional.replace("NÍVEL DE ", "")}</small><i className="pi pi-bars" aria-hidden="true" /></button>; })}
        </div></div>
      </div><div className="organograma-canvas-autosave"><i className="pi pi-check-circle" />Posição salva automaticamente</div>
    </CardSeplag>
    <ModalSeplag visible={adicionando} titulo="Adicionar unidade no canvas" fechar={() => setAdicionando(false)} labelFechar="Cancelar" labelAcao="Adicionar unidade" funcAcao={adicionar} tamanho="min(42rem, 94vw)"><div className="organograma-canvas-modal"><p>{selecionada ? <>A nova unidade será vinculada a <strong>{selecionada.nome}</strong>.</> : "Selecione uma unidade no canvas para vinculá-la como superior ou deixe-a no nível do órgão."}</p><label>Nome da unidade<input autoFocus value={nomeNova} onChange={(event) => setNomeNova(event.target.value)} placeholder="Ex.: Coordenadoria de ..." /></label><label>Tipo<select value={tipoNova} onChange={(event) => setTipoNova(event.target.value)}>{["Unidade", "Diretoria", "Coordenadoria", "Gerência", "Núcleo", "Gabinete", "Conselho", "Comissão", "Ouvidoria"].map((tipo) => <option key={tipo}>{tipo}</option>)}</select></label><label>Nível organizacional<input value={nivelNovo} onChange={(event) => setNivelNovo(event.target.value)} /></label></div></ModalSeplag>
  </div>;
}
