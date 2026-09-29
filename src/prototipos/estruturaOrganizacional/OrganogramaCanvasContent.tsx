import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { BotaoSeplag } from "@componentes/Botao";
import { BreadcrumbSeplag } from "@componentes/Breadcrumb";
import { CardSeplag } from "@componentes/Card";
import { ModalSeplag } from "@componentes/Modal";
import { SplitButton } from "primereact/splitbutton";
import type { MenuItem } from "primereact/menuitem";
import { obterUnidadesDaVersao } from "./estruturaOrganizacionalStore";
import { adicionarUnidadeNoCanvas, ajustarDobraConexaoNoCanvas, lerOrganogramaCanvas, reorganizarCanvas, salvarOrganogramaCanvas, type CoordenadaNoOrganograma } from "./organogramaCanvasStore";
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
  const dobrasConexoes = estado.dobrasConexoes?.[versaoId] ?? {};
  const [selecionadasIds, setSelecionadasIds] = useState<number[]>([]);
  const [adicionando, setAdicionando] = useState(false);
  const [nomeNova, setNomeNova] = useState("");
  const [tipoNova, setTipoNova] = useState("Unidade");
  const [nivelNovo, setNivelNovo] = useState("Nível de Execução Programática");
  const workspaceRef = useRef<HTMLDivElement>(null);
  const arrastouRef = useRef(false);
  const bloqueiaCliqueCanvasRef = useRef(false);
  const autoPanRef = useRef<{ viewport: HTMLDivElement; origemX: number; origemY: number; atualX: number; atualY: number } | null>(null);
  const [autoPanAtivo, setAutoPanAtivo] = useState(false);
  const [pontoAutoPan, setPontoAutoPan] = useState({ x: 0, y: 0 });
  const [painelAberto, setPainelAberto] = useState(true);
  const [caixaSelecao, setCaixaSelecao] = useState<{ x: number; y: number; largura: number; altura: number } | null>(null);
  const [guiasAlinhamento, setGuiasAlinhamento] = useState<{ x?: number; y?: number } | null>(null);
  const [conexaoSelecionada, setConexaoSelecionada] = useState<number | null>(null);
  const [telaCheia, setTelaCheia] = useState(false);
  const selecionada = selecionadasIds.length === 1 ? unidades.find((unidade) => unidade.id === selecionadasIds[0]) ?? null : null;
  const porId = new Map(unidades.map((unidade) => [unidade.id, unidade]));
  const orgaos = [...new Set(estado.estrutura.versoes.map((versao) => versao.orgao))];
  const dimensoesCanvas = useMemo(() => ({
    largura: Math.max(1200, ...Object.values(coordenadas).map((item) => item.x + 260)),
    altura: Math.max(980, ...Object.values(coordenadas).map((item) => item.y + 150)),
  }), [coordenadas]);

  const escaparXml = (texto: string) => texto.replace(/[<>&"']/g, (caractere) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[caractere] ?? caractere));
  const quebrarTexto = (texto: string, limite = 30) => texto.split(" ").reduce<string[]>((linhas, palavra) => {
    const ultima = linhas.at(-1) ?? "";
    if (!ultima || `${ultima} ${palavra}`.length > limite) linhas.push(palavra);
    else linhas[linhas.length - 1] = `${ultima} ${palavra}`;
    return linhas;
  }, []);
  const criarSvgParaExportacao = () => {
    const linhas = unidades.map((unidade) => {
      const posicao = coordenadas[unidade.id] ?? { x: 24, y: 24 };
      const destaque = unidade.tipo === "Diretoria";
      const titulo = quebrarTexto(unidade.nome).slice(0, 3);
      return `<g transform="translate(${posicao.x} ${posicao.y})"><rect width="224" height="112" rx="7" fill="${destaque ? "#0876b8" : "#ffffff"}" stroke="${destaque ? "#086eae" : "#a9c6dc"}"/><text x="12" y="20" font-family="Arial, sans-serif" font-size="10" fill="${destaque ? "#ffffff" : "#315a7e"}">${escaparXml(unidade.codigo)}</text><text x="12" y="${38}" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="${destaque ? "#ffffff" : "#183a5d"}">${titulo.map((linha, indice) => `<tspan x="12" dy="${indice ? 15 : 0}">${escaparXml(linha)}</tspan>`).join("")}</text><text x="12" y="98" font-family="Arial, sans-serif" font-size="9" fill="${destaque ? "#e5f3fc" : "#58718b"}">${escaparXml(unidade.tipo)}</text></g>`;
    }).join("");
    const conexoes = unidades.filter((unidade) => unidade.superiorId && coordenadas[unidade.id] && coordenadas[unidade.superiorId]).map((unidade) => {
      const origem = coordenadas[unidade.superiorId!]; const destino = coordenadas[unidade.id]; const meioY = Math.round((origem.y + 112 + destino.y) / 2);
      return `<path d="M ${origem.x + 112} ${origem.y + 112} V ${meioY} H ${destino.x + 112} V ${destino.y}" fill="none" stroke="#82aeca" stroke-width="1.4"/>`;
    }).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${dimensoesCanvas.largura}" height="${dimensoesCanvas.altura}" viewBox="0 0 ${dimensoesCanvas.largura} ${dimensoesCanvas.altura}"><rect width="100%" height="100%" fill="#fbfdff"/>${conexoes}${linhas}</svg>`;
  };
  const baixarArquivo = (conteudo: Blob, nome: string) => { const url = URL.createObjectURL(conteudo); const link = document.createElement("a"); link.href = url; link.download = nome; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); };
  const exportarImagem = async () => {
    const svg = criarSvgParaExportacao(); const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    const imagem = new Image(); imagem.onload = () => { const escala = Math.min(2, 7000 / dimensoesCanvas.largura, 7000 / dimensoesCanvas.altura); const canvas = document.createElement("canvas"); canvas.width = Math.round(dimensoesCanvas.largura * escala); canvas.height = Math.round(dimensoesCanvas.altura * escala); const contexto = canvas.getContext("2d"); contexto?.drawImage(imagem, 0, 0, canvas.width, canvas.height); canvas.toBlob((arquivo) => { if (arquivo) baixarArquivo(arquivo, `organograma-${orgao.toLowerCase()}.png`); URL.revokeObjectURL(url); }, "image/png"); }; imagem.src = url;
  };
  const exportarPdf = () => { const janela = window.open("", "_blank", "noopener,noreferrer"); if (!janela) return; janela.document.write(`<!doctype html><html><head><title>Organograma — ${orgao}</title><style>@page{size:landscape;margin:10mm}body{margin:0}svg{width:100%;height:auto}</style></head><body>${criarSvgParaExportacao()}<script>window.onload=()=>window.print()</script></body></html>`); janela.document.close(); };
  const opcoesExportacao: MenuItem[] = [{ label: "Exportar imagem (PNG)", icon: "pi pi-image", command: exportarImagem }, { label: "Exportar PDF", icon: "pi pi-file-pdf", command: exportarPdf }];

  useEffect(() => {
    const atualizar = () => setTelaCheia(document.fullscreenElement === workspaceRef.current);
    document.addEventListener("fullscreenchange", atualizar);
    return () => document.removeEventListener("fullscreenchange", atualizar);
  }, []);

  useEffect(() => {
    if (!autoPanAtivo) return;
    let quadro = 0;
    const mover = (event: MouseEvent) => {
      if (autoPanRef.current) { autoPanRef.current.atualX = event.clientX; autoPanRef.current.atualY = event.clientY; }
    };
    const navegar = () => {
      const referencia = autoPanRef.current;
      if (referencia) {
        referencia.viewport.scrollLeft += (referencia.atualX - referencia.origemX) / 14;
        referencia.viewport.scrollTop += (referencia.atualY - referencia.origemY) / 14;
      }
      quadro = window.requestAnimationFrame(navegar);
    };
    window.addEventListener("mousemove", mover);
    quadro = window.requestAnimationFrame(navegar);
    return () => { window.removeEventListener("mousemove", mover); window.cancelAnimationFrame(quadro); autoPanRef.current = null; };
  }, [autoPanAtivo]);

  const alternarTelaCheia = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await workspaceRef.current?.requestFullscreen();
  };

  const trocarOrgao = (novoOrgao: string) => {
    setOrgao(novoOrgao);
    setVersaoId(estado.estrutura.versoes.find((versao) => versao.orgao === novoOrgao)?.id ?? "");
    setSelecionadasIds([]);
  };

  const iniciarArraste = (event: PointerEvent<HTMLButtonElement>, unidadeId: number) => {
    event.preventDefault();
    event.stopPropagation();
    const idsParaMover = selecionadasIds.includes(unidadeId) ? selecionadasIds : [unidadeId];
    if (!selecionadasIds.includes(unidadeId) && !event.ctrlKey && !event.metaKey && !event.shiftKey) setSelecionadasIds([unidadeId]);
    const iniciais = Object.fromEntries(idsParaMover.map((id) => [id, coordenadas[id] ?? { x: 40, y: 40 }]));
    const pontoInicial = { x: event.clientX, y: event.clientY };
    arrastouRef.current = false;
    const mover = (movimento: globalThis.PointerEvent) => {
      arrastouRef.current = true;
      const posicaoBase = iniciais[unidadeId];
      const posicaoArrastada = { x: Math.max(12, posicaoBase.x + movimento.clientX - pontoInicial.x), y: Math.max(12, posicaoBase.y + movimento.clientY - pontoInicial.y) };
      const idsEmMovimento = new Set(idsParaMover);
      const referencias = unidades.filter((unidade) => !idsEmMovimento.has(unidade.id)).map((unidade) => coordenadas[unidade.id]).filter((posicao): posicao is CoordenadaNoOrganograma => Boolean(posicao));
      const encontrarEncaixe = (alvos: number[], valores: number[]) => {
        let melhor: { ajuste: number; guia: number } | null = null;
        alvos.forEach((alvo) => valores.forEach((valor) => {
          const ajuste = valor - alvo;
          if (Math.abs(ajuste) > 12 || (melhor && Math.abs(ajuste) >= Math.abs(melhor.ajuste))) return;
          melhor = { ajuste, guia: valor };
        }));
        return melhor;
      };
      const encaixeX = encontrarEncaixe([posicaoArrastada.x, posicaoArrastada.x + 112, posicaoArrastada.x + 224], referencias.flatMap((posicao) => [posicao.x, posicao.x + 112, posicao.x + 224]));
      const encaixeY = encontrarEncaixe([posicaoArrastada.y, posicaoArrastada.y + 56, posicaoArrastada.y + 112], referencias.flatMap((posicao) => [posicao.y, posicao.y + 56, posicao.y + 112]));
      setGuiasAlinhamento(encaixeX || encaixeY ? { x: encaixeX?.guia, y: encaixeY?.guia } : null);
      setEstado((atual) => salvarOrganogramaCanvas({ ...atual, coordenadas: { ...atual.coordenadas, [versaoId]: { ...atual.coordenadas[versaoId], ...Object.fromEntries(idsParaMover.map((id) => { const inicial = iniciais[id]; const proxima: CoordenadaNoOrganograma = { x: Math.max(12, inicial.x + movimento.clientX - pontoInicial.x + (encaixeX?.ajuste ?? 0)), y: Math.max(12, inicial.y + movimento.clientY - pontoInicial.y + (encaixeY?.ajuste ?? 0)) }; return [id, proxima]; })) } } }));
    };
    const soltar = () => {
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
      setGuiasAlinhamento(null);
    };
    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar, { once: true });
  };

  const adicionar = () => {
    if (!nomeNova.trim()) return;
    setEstado((atual) => adicionarUnidadeNoCanvas(atual, versaoId, { nome: nomeNova, tipo: tipoNova, nivelOrganizacional: nivelNovo }, selecionada?.id ?? null));
    setNomeNova("");
    setAdicionando(false);
  };

  const iniciarSelecaoPorArea = (event: PointerEvent<HTMLDivElement>) => {
    if (autoPanAtivo) { setAutoPanAtivo(false); return; }
    if (event.button !== 0) return;
    if (event.target !== event.currentTarget) return;
    const area = event.currentTarget.getBoundingClientRect();
    const inicio = { x: event.clientX - area.left, y: event.clientY - area.top };
    bloqueiaCliqueCanvasRef.current = false;
    const mover = (movimento: globalThis.PointerEvent) => {
      const atual = { x: movimento.clientX - area.left, y: movimento.clientY - area.top };
      const x = Math.min(inicio.x, atual.x); const y = Math.min(inicio.y, atual.y);
      const largura = Math.abs(atual.x - inicio.x); const altura = Math.abs(atual.y - inicio.y);
      if (largura > 4 || altura > 4) bloqueiaCliqueCanvasRef.current = true;
      setCaixaSelecao({ x, y, largura, altura });
      setSelecionadasIds(unidades.filter((unidade) => { const posicao = coordenadas[unidade.id] ?? { x: 24, y: 24 }; return posicao.x < x + largura && posicao.x + 224 > x && posicao.y < y + altura && posicao.y + 112 > y; }).map((unidade) => unidade.id));
    };
    const soltar = () => { window.removeEventListener("pointermove", mover); window.removeEventListener("pointerup", soltar); setCaixaSelecao(null); };
    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar, { once: true });
  };

  const iniciarNavegacaoCanvas = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 1 && event.button !== 2) return;
    event.preventDefault();
    const viewport = event.currentTarget.parentElement;
    if (!viewport) return;
    if (event.button === 1) {
      if (autoPanAtivo) { setAutoPanAtivo(false); return; }
      const limites = viewport.getBoundingClientRect();
      autoPanRef.current = { viewport, origemX: event.clientX, origemY: event.clientY, atualX: event.clientX, atualY: event.clientY };
      setPontoAutoPan({ x: event.clientX - limites.left, y: event.clientY - limites.top });
      setAutoPanAtivo(true);
      return;
    }
    if (autoPanAtivo) setAutoPanAtivo(false);
    const inicio = { x: event.clientX, y: event.clientY, esquerda: viewport.scrollLeft, topo: viewport.scrollTop };
    const mover = (movimento: globalThis.PointerEvent) => {
      viewport.scrollLeft = inicio.esquerda - (movimento.clientX - inicio.x);
      viewport.scrollTop = inicio.topo - (movimento.clientY - inicio.y);
    };
    const soltar = () => { window.removeEventListener("pointermove", mover); window.removeEventListener("pointerup", soltar); };
    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar, { once: true });
  };

  const iniciarAjusteConexao = (event: PointerEvent<SVGPathElement>, unidadeId: number) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const unidade = porId.get(unidadeId);
    const origem = unidade?.superiorId ? coordenadas[unidade.superiorId] : undefined;
    const destino = coordenadas[unidadeId];
    const svg = event.currentTarget.ownerSVGElement;
    if (!origem || !destino || !svg) return;
    setConexaoSelecionada(unidadeId);
    const mover = (movimento: globalThis.PointerEvent) => {
      const area = svg.getBoundingClientRect();
      const minimo = Math.min(origem.y + 112, destino.y) + 12;
      const maximo = Math.max(origem.y + 112, destino.y) - 12;
      const y = Math.max(minimo, Math.min(maximo, movimento.clientY - area.top));
      setEstado((atual) => ajustarDobraConexaoNoCanvas(atual, versaoId, unidadeId, y));
    };
    const soltar = () => { window.removeEventListener("pointermove", mover); window.removeEventListener("pointerup", soltar); };
    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar, { once: true });
  };

  return <div className="organograma-canvas-page">
    <CardSeplag title="Organograma em canvas" cols="12" cardHeaderClassNames="prototype-carreira-card" headerNavigation={<BreadcrumbSeplag divided items={[{ label: "Cadastro" }, { label: "Estrutura Organizacional" }, { label: "Organograma Canvas" }]} />}>
      <div className="organograma-canvas-intro"><i className="pi pi-sitemap" /><div><strong>Área experimental independente</strong><span>Esta cópia possui dados e posicionamento próprios. O Organograma original não será alterado.</span></div></div>
      <div className="organograma-canvas-toolbar">
        <label>Órgão/Entidade<select value={orgao} onChange={(event) => trocarOrgao(event.target.value)}>{orgaos.map((item) => <option key={item} value={item}>{item} — {nomeOrgao(item)}</option>)}</select></label>
        <label>Versão<select value={versaoId} onChange={(event) => { setVersaoId(event.target.value); setSelecionadasIds([]); }}>{versoesDoOrgao.map((versao) => <option key={versao.id} value={versao.id}>{versao.nome} · {versao.inicio}</option>)}</select></label>
        <div className="organograma-canvas-toolbar-actions"><BotaoSeplag label="Adicionar unidade" icon="pi pi-plus" onClick={() => setAdicionando(true)} /><BotaoSeplag label="Organizar automaticamente" icon="pi pi-sitemap" severity="secondary" onClick={() => setEstado((atual) => reorganizarCanvas(atual, versaoId))} /><SplitButton label="Exportar" icon="pi pi-download" model={opcoesExportacao} onClick={exportarImagem} className="organograma-canvas-exportar" /><BotaoSeplag label={telaCheia ? "Sair da tela cheia" : "Tela cheia"} icon={telaCheia ? "pi pi-window-minimize" : "pi pi-window-maximize"} severity="secondary" onClick={alternarTelaCheia} /></div>
      </div>
      <div ref={workspaceRef} className={`organograma-canvas-workspace ${painelAberto ? "" : "is-panel-hidden"}`}>
        <aside className="organograma-canvas-panel"><header><h2>Propriedades</h2><button type="button" className="organograma-canvas-panel-toggle" onClick={() => setPainelAberto(false)} title="Ocultar propriedades" aria-label="Ocultar propriedades"><i className="pi pi-bars" /></button></header>{selecionada ? <><strong>{selecionada.nome}</strong><dl><div><dt>Código</dt><dd>{selecionada.codigo}</dd></div><div><dt>Tipo</dt><dd>{selecionada.tipo}</dd></div><div><dt>Nível</dt><dd>{selecionada.nivelOrganizacional}</dd></div><div><dt>Unidade superior</dt><dd>{selecionada.superiorId ? porId.get(selecionada.superiorId)?.nome ?? "Não encontrada" : "Órgão/Entidade"}</dd></div></dl><p><i className="pi pi-info-circle" /> Arraste o bloco para mudar apenas o posicionamento visual. A conexão é preservada.</p></> : selecionadasIds.length > 1 ? <p><strong>{selecionadasIds.length} unidades selecionadas.</strong><br />Arraste qualquer bloco selecionado para mover o conjunto.</p> : <p>Selecione uma unidade para consultar seus dados ou use-a como referência ao adicionar uma unidade abaixo.</p>}</aside>
        {!painelAberto && <button type="button" className="organograma-canvas-panel-reveal" onClick={() => setPainelAberto(true)} title="Exibir propriedades" aria-label="Exibir propriedades"><i className="pi pi-bars" /></button>}
        <div className="organograma-canvas-viewport" onContextMenu={(event) => event.preventDefault()} onClick={() => { if (bloqueiaCliqueCanvasRef.current) { bloqueiaCliqueCanvasRef.current = false; return; } setSelecionadasIds([]); }}><div className="organograma-canvas-surface" onPointerDown={(event) => { iniciarNavegacaoCanvas(event); iniciarSelecaoPorArea(event); }} style={{ minWidth: dimensoesCanvas.largura, minHeight: dimensoesCanvas.altura }}>
          <svg className="organograma-canvas-edges" aria-label="Conexões ajustáveis entre unidades">{unidades.filter((unidade) => unidade.superiorId && coordenadas[unidade.id] && coordenadas[unidade.superiorId]).map((unidade) => { const origem = coordenadas[unidade.superiorId!]; const destino = coordenadas[unidade.id]; const meioY = dobrasConexoes[unidade.id] ?? Math.round((origem.y + 112 + destino.y) / 2); const caminho = `M ${origem.x + 112} ${origem.y + 112} V ${meioY} H ${destino.x + 112} V ${destino.y}`; return <g key={unidade.id}><path className="organograma-canvas-edge-hit" d={caminho} onPointerDown={(event) => iniciarAjusteConexao(event, unidade.id)} /><path className={`organograma-canvas-edge-visible ${conexaoSelecionada === unidade.id ? "is-selected" : ""}`} d={caminho} /></g>; })}</svg>
          {autoPanAtivo && <span className="organograma-canvas-autopan" style={{ transform: `translate(${pontoAutoPan.x}px, ${pontoAutoPan.y}px)` }}><i className="pi pi-arrows-alt" /></span>}
          {guiasAlinhamento?.x !== undefined && <span className="organograma-canvas-guide is-vertical" style={{ transform: `translateX(${guiasAlinhamento.x}px)` }} />}
          {guiasAlinhamento?.y !== undefined && <span className="organograma-canvas-guide is-horizontal" style={{ transform: `translateY(${guiasAlinhamento.y}px)` }} />}
          {caixaSelecao && <div className="organograma-canvas-selection-box" style={{ transform: `translate(${caixaSelecao.x}px, ${caixaSelecao.y}px)`, width: caixaSelecao.largura, height: caixaSelecao.altura }} />}
          {unidades.map((unidade) => { const posicao = coordenadas[unidade.id] ?? { x: 24, y: 24 }; return <button type="button" key={unidade.id} className={`organograma-canvas-node ${selecionadasIds.includes(unidade.id) ? "is-selected" : ""} ${unidade.tipo === "Diretoria" ? "is-directoria" : ""}`} style={{ transform: `translate(${posicao.x}px, ${posicao.y}px)` }} onPointerDown={(event) => { if (event.button === 0) iniciarArraste(event, unidade.id); }} onClick={(event) => { event.stopPropagation(); if (arrastouRef.current) { arrastouRef.current = false; return; } if (event.ctrlKey || event.metaKey || event.shiftKey) setSelecionadasIds((atuais) => atuais.includes(unidade.id) ? atuais.filter((id) => id !== unidade.id) : [...atuais, unidade.id]); else setSelecionadasIds([unidade.id]); }}><span>{unidade.codigo}</span><strong>{unidade.nome}</strong><small>{unidade.tipo} · {unidade.nivelOrganizacional.replace("NÍVEL DE ", "")}</small><i className="pi pi-bars" aria-hidden="true" /></button>; })}
        </div></div>
      </div><div className="organograma-canvas-autosave"><i className="pi pi-check-circle" />Posição salva automaticamente</div>
    </CardSeplag>
    <ModalSeplag visible={adicionando} titulo="Adicionar unidade no canvas" fechar={() => setAdicionando(false)} labelFechar="Cancelar" labelAcao="Adicionar unidade" funcAcao={adicionar} tamanho="min(42rem, 94vw)"><div className="organograma-canvas-modal"><p>{selecionada ? <>A nova unidade será vinculada a <strong>{selecionada.nome}</strong>.</> : "Selecione uma unidade no canvas para vinculá-la como superior ou deixe-a no nível do órgão."}</p><label>Nome da unidade<input autoFocus value={nomeNova} onChange={(event) => setNomeNova(event.target.value)} placeholder="Ex.: Coordenadoria de ..." /></label><label>Tipo<select value={tipoNova} onChange={(event) => setTipoNova(event.target.value)}>{["Unidade", "Diretoria", "Coordenadoria", "Gerência", "Núcleo", "Gabinete", "Conselho", "Comissão", "Ouvidoria"].map((tipo) => <option key={tipo}>{tipo}</option>)}</select></label><label>Nível organizacional<input value={nivelNovo} onChange={(event) => setNivelNovo(event.target.value)} /></label></div></ModalSeplag>
  </div>;
}
