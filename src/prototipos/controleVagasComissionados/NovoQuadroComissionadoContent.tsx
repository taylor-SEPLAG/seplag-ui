import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BotaoAdicionarSeplag,
  BotaoIconSeplag,
  BotaoSalvarSeplag,
  BotaoVoltarSeplag,
} from "../../componentes/Botao";
import {
  calcularStatusOperacionalVigenciaSeplag,
  STATUS_OPERACIONAL_VIGENCIA,
} from "../../componentes/SituacaoVigencia";
import { BaseLegalVinculada } from "./BaseLegalVinculada";
import {
  lerRascunhoQuadroComissionado,
  salvarRascunhoQuadroComissionado,
  type NivelComissionadoSalvo,
} from "./novoQuadroComissionadoStore";
import "./novoQuadroComissionado.css";

type Dotacao = { id: string; perfil: string; simbologia: string; cargos: number; funcoes: number };
type ItemEstrutura = { id: string; nome: string; dotacoes: Dotacao[]; subitens: ItemEstrutura[] };

type Nivel = { id: string; nome: string; itens: ItemEstrutura[] };

const SIMBOLOGIAS = ["DGA-1", "DGA-2", "DGA-3", "DGA-4", "DGA-5", "DGA-6", "DGA-7", "DGA-8", "DGA-9", "DGA-10"];

const novoId = () => crypto.randomUUID();
const novaDotacao = (): Dotacao => ({ id: novoId(), perfil: "", simbologia: "", cargos: 0, funcoes: 0 });
const novoItem = (): ItemEstrutura => ({ id: novoId(), nome: "", dotacoes: [], subitens: [] });

const novoNivel = (): Nivel => ({ id: novoId(), nome: "", itens: [] });

const atualizarItem = (itens: ItemEstrutura[], id: string, atualizar: (item: ItemEstrutura) => ItemEstrutura): ItemEstrutura[] =>
  itens.map((item) => item.id === id ? atualizar(item) : { ...item, subitens: atualizarItem(item.subitens, id, atualizar) });
const excluirItem = (itens: ItemEstrutura[], id: string): ItemEstrutura[] =>
  itens.filter((item) => item.id !== id).map((item) => ({ ...item, subitens: excluirItem(item.subitens, id) }));

function normalizarNiveis(niveis: NivelComissionadoSalvo[] | undefined): Nivel[] {
  return (niveis ?? []).map((nivel) => {
    const legado = nivel as NivelComissionadoSalvo & { unidades?: { itens?: ItemEstrutura[] }[] };
    return {
      id: legado.id,
      nome: legado.nome,
      itens: legado.itens ?? legado.unidades?.flatMap((unidade) => unidade.itens ?? []) ?? [],
    };
  });
}
export function NovoQuadroComissionadoContent() {
  const navigate = useNavigate();
  const [rascunhoInicial] = useState(lerRascunhoQuadroComissionado);
  const [idQuadro] = useState(() => rascunhoInicial?.id ?? novoId());
  const [nome, setNome] = useState(() => rascunhoInicial?.nome ?? "");
  const [orgao, setOrgao] = useState(() => rascunhoInicial?.orgao ?? "");
  const [dataVigencia, setDataVigencia] = useState(() => rascunhoInicial?.dataVigencia ?? "");
  const [documentosLegaisIds, setDocumentosLegaisIds] = useState<string[]>(() => rascunhoInicial?.documentosLegaisIds ?? []);
  const [niveis, setNiveis] = useState<Nivel[]>(() => normalizarNiveis(rascunhoInicial?.niveis));
  const [salvo, setSalvo] = useState(false);
  const dataVigenciaRef = useRef<HTMLInputElement>(null);

  const atualizarNivel = (id: string, atualizar: (nivel: Nivel) => Nivel) => setNiveis((atual) => atual.map((nivel) => nivel.id === id ? atualizar(nivel) : nivel));
  const total = niveis.reduce((soma, nivel) => soma + contarDotacoes(nivel.itens), 0);
  const totais = niveis.reduce((soma, nivel) => somarTotais(nivel.itens, soma), { cargos: 0, funcoes: 0 });
  const resumoSimbologias = SIMBOLOGIAS.map((simbologia) => ({ simbologia, ...somarPorSimbologia(niveis, simbologia) }));
  const vigenciaAgendada = calcularStatusOperacionalVigenciaSeplag({ situacao: "ATIVO", dataAtivacao: dataVigencia }) === STATUS_OPERACIONAL_VIGENCIA.AGENDADO;

  const salvarQuadro = () => {
    salvarRascunhoQuadroComissionado({
      id: idQuadro,
      nome,
      orgao,
      dataVigencia,
      documentosLegaisIds,
      niveis: structuredClone(niveis) as NivelComissionadoSalvo[],
      salvoEm: new Date().toISOString(),
    });
    setSalvo(true);
  };
  return <div className="novo-quadro-comissionado">
    <header>
      <div><span>CONTROLE DE VAGAS</span><h1>Novo Quadro Comissionado</h1><p>Cadastre a estrutura autorizada de um órgão, incluindo níveis, itens, cargos em comissão e funções de confiança.</p></div>
    </header>

    {salvo && <div className="nqc-feedback"><i className="pi pi-check-circle" />Estrutura do quadro salva para o órgão selecionado.</div>}

    <BaseLegalVinculada value={documentosLegaisIds} onChange={setDocumentosLegaisIds} />

    <section className="nqc-card">
      <header><i className="pi pi-building" /><div><h2>Identificação do quadro</h2><p>Selecione o órgão a que pertence o quadro. A fundamentação é informada na Base legal.</p></div></header>
      <div className="nqc-fields">
        <label><span className="nqc-label">Nome do quadro <em>*</em></span><input value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Ex.: Estrutura organizacional da SESP" /></label>
        <label><span className="nqc-label">Órgão <em>*</em></span><select value={orgao} onChange={(event) => setOrgao(event.target.value)}><option value="">Selecione...</option><option>SEPLAG</option><option>POLITEC</option><option>SESP</option><option>SES</option><option>SEDUC</option><option>SEMA</option></select></label>
      </div>
    </section>

    

    <section className="nqc-card nqc-vigencia">
      <header><i className="pi pi-calendar" /><div><h2>Vigência</h2><p>Informe quando a estrutura passa a valer. A situação é calculada automaticamente.</p></div></header>
      <div className="nqc-vigencia-content">
        <label><span className="nqc-label">Data de início <em>*</em></span><span className="nqc-date-input"><input ref={dataVigenciaRef} type="date" value={dataVigencia} onChange={(event) => setDataVigencia(event.target.value)} /><button type="button" aria-label="Selecionar data de início" onClick={() => dataVigenciaRef.current?.showPicker()}><i className="pi pi-calendar" /></button></span></label>
        <div className="nqc-vigencia-status"><i className="pi pi-check-circle" /><div><span>Situação</span><strong className={vigenciaAgendada ? "nqc-status nqc-status--agendado" : "nqc-status"}>{vigenciaAgendada ? "Agendado" : "Ativo"}</strong><p>{vigenciaAgendada ? "A estrutura será ativada na data informada." : "A estrutura passa a valer a partir da data informada."}</p></div></div>
      </div>
    </section>

    <section className="nqc-card nqc-estrutura">
      <header><i className="pi pi-sitemap" /><div><h2>Estrutura organizacional</h2><p>Adicione os níveis da estrutura. Em cada nível, registre itens, subitens e suas dotações autorizadas.</p></div><BotaoAdicionarSeplag label="Adicionar nível" onClick={() => setNiveis((atual) => [...atual, novoNivel()])} /></header>
      {!niveis.length && <div className="nqc-empty"><i className="pi pi-sitemap" /><strong>Nenhum nível cadastrado</strong><span>Comece por um nível, como “Direção Superior” ou “Administração Sistêmica”.</span></div>}
      <div className="nqc-niveis">{niveis.map((nivel, indice) => <NivelEditor key={nivel.id} nivel={nivel} indice={indice} onChange={(atualizar) => atualizarNivel(nivel.id, atualizar)} onRemove={() => setNiveis((atual) => atual.filter((item) => item.id !== nivel.id))} />)}</div>
    </section>

    <section className="nqc-card nqc-resumo">
      <header><i className="pi pi-chart-bar" /><div><h2>Resumo das dotações</h2><p>Quantitativos autorizados por simbologia remuneratória.</p></div></header>
      <div className="nqc-resumo-table-wrap"><table><thead><tr><th>Simbologia remuneratória</th><th>Cargo</th><th>Função</th></tr></thead><tbody>{resumoSimbologias.map((linha) => <tr key={linha.simbologia}><td>{linha.simbologia}</td><td>{linha.cargos || "-"}</td><td>{linha.funcoes || "-"}</td></tr>)}</tbody><tfoot><tr><th>Subtotal</th><th>{totais.cargos}</th><th>{totais.funcoes}</th></tr><tr><th>Total</th><th colSpan={2}>{totais.cargos + totais.funcoes}</th></tr></tfoot></table></div>
    </section>
    <footer><div className="nqc-footer-actions"><BotaoVoltarSeplag label="Cancelar" onClick={() => navigate(-1)} /><BotaoSalvarSeplag label="Salvar quadro" disabled={!nome.trim() || !orgao || !dataVigencia || !documentosLegaisIds.length || !niveis.length} onClick={salvarQuadro} /></div></footer>
  </div>;
}

function NivelEditor({ nivel, indice, onChange, onRemove }: { nivel: Nivel; indice: number; onChange: (atualizar: (nivel: Nivel) => Nivel) => void; onRemove: () => void }) {
  return <article className="nqc-nivel"><div className="nqc-nivel-title"><span>Nível {indice + 1}</span><input value={nivel.nome} onChange={(event) => onChange((atual) => ({ ...atual, nome: event.target.value }))} placeholder="Ex.: Nível de Administração Sistêmica" /><BotaoIconSeplag icon="pi pi-trash" aria-label="Excluir nível" tooltip="Excluir nível" onClick={onRemove} /></div>
    <div className="nqc-nivel-itens">{nivel.itens.map((item) => <ItemEditor key={item.id} item={item} nivel={0} onChange={(atualizar) => onChange((atual) => ({ ...atual, itens: atualizarItem(atual.itens, item.id, atualizar) }))} onRemove={() => onChange((atual) => ({ ...atual, itens: excluirItem(atual.itens, item.id) }))} />)}</div>
    <button className="nqc-add-link" type="button" onClick={() => onChange((atual) => ({ ...atual, itens: [...atual.itens, novoItem()] }))}><i className="pi pi-plus" />Adicionar item</button>
  </article>;
}
function ItemEditor({ item, nivel, onChange, onRemove }: { item: ItemEstrutura; nivel: number; onChange: (atualizar: (item: ItemEstrutura) => ItemEstrutura) => void; onRemove: () => void }) {
  return <article className={`nqc-item nqc-item-${nivel}`}><div className="nqc-item-title"><i className={nivel ? "pi pi-angle-right" : "pi pi-folder"} /><input value={item.nome} onChange={(event) => onChange((atual) => ({ ...atual, nome: event.target.value }))} placeholder={nivel ? "Nome do subitem" : "Nome do item"} /><BotaoIconSeplag icon="pi pi-trash" aria-label="Excluir item" tooltip="Excluir item" onClick={onRemove} /></div>
    <div className="nqc-dotacoes">{item.dotacoes.map((dotacao) => <DotacaoEditor key={dotacao.id} dotacao={dotacao} onChange={(atualizar) => onChange((atual) => ({ ...atual, dotacoes: atual.dotacoes.map((linha) => linha.id === dotacao.id ? atualizar(linha) : linha) }))} onRemove={() => onChange((atual) => ({ ...atual, dotacoes: atual.dotacoes.filter((linha) => linha.id !== dotacao.id) }))} />)}</div>
    <div className="nqc-item-actions"><button className="nqc-add-link" type="button" onClick={() => onChange((atual) => ({ ...atual, dotacoes: [...atual.dotacoes, novaDotacao()] }))}><i className="pi pi-plus" />Adicionar dotação</button><button className="nqc-add-link" type="button" onClick={() => onChange((atual) => ({ ...atual, subitens: [...atual.subitens, novoItem()] }))}><i className="pi pi-plus" />Adicionar subitem</button></div>
    {item.subitens.map((subitem) => <ItemEditor key={subitem.id} item={subitem} nivel={nivel + 1} onChange={(atualizar) => onChange((atual) => ({ ...atual, subitens: atualizarItem(atual.subitens, subitem.id, atualizar) }))} onRemove={() => onChange((atual) => ({ ...atual, subitens: excluirItem(atual.subitens, subitem.id) }))} />)}
  </article>;
}

function DotacaoEditor({ dotacao, onChange, onRemove }: { dotacao: Dotacao; onChange: (atualizar: (dotacao: Dotacao) => Dotacao) => void; onRemove: () => void }) {
  const atualizar = <K extends keyof Dotacao>(campo: K, valor: Dotacao[K]) => onChange((atual) => ({ ...atual, [campo]: valor }));
  return <div className="nqc-dotacao"><label>Perfil<input value={dotacao.perfil} onChange={(event) => atualizar("perfil", event.target.value)} placeholder="Ex.: Assessor Técnico II" /></label><label>Simbologia remuneratória<select value={dotacao.simbologia} onChange={(event) => atualizar("simbologia", event.target.value)}><option value="">Selecione...</option>{SIMBOLOGIAS.map((simbolo) => <option key={simbolo}>{simbolo}</option>)}</select></label><label>Cargos<input type="number" min="0" value={dotacao.cargos} onChange={(event) => atualizar("cargos", Number(event.target.value))} /></label><label>Funções<input type="number" min="0" value={dotacao.funcoes} onChange={(event) => atualizar("funcoes", Number(event.target.value))} /></label><BotaoIconSeplag icon="pi pi-trash" aria-label="Excluir dotação" tooltip="Excluir dotação" onClick={onRemove} /></div>;
}

function somarPorSimbologia(niveis: Nivel[], simbologia: string) {
  const somarItens = (itens: ItemEstrutura[]): { cargos: number; funcoes: number } => itens.reduce((total, item) => {
    const dotacoes = item.dotacoes.filter((dotacao) => dotacao.simbologia === simbologia);
    const filhos = somarItens(item.subitens);
    return { cargos: total.cargos + dotacoes.reduce((soma, dotacao) => soma + dotacao.cargos, 0) + filhos.cargos, funcoes: total.funcoes + dotacoes.reduce((soma, dotacao) => soma + dotacao.funcoes, 0) + filhos.funcoes };
  }, { cargos: 0, funcoes: 0 });
  return niveis.reduce((total, nivel) => { const atual = somarItens(nivel.itens); return { cargos: total.cargos + atual.cargos, funcoes: total.funcoes + atual.funcoes }; }, { cargos: 0, funcoes: 0 });
}

function contarDotacoes(itens: ItemEstrutura[]): number { return itens.reduce((total, item) => total + item.dotacoes.length + contarDotacoes(item.subitens), 0); }

function somarTotais(itens: ItemEstrutura[], acumulado = { cargos: 0, funcoes: 0 }) {
  return itens.reduce((total, item) => ({
    cargos: total.cargos + item.dotacoes.reduce((soma, dotacao) => soma + dotacao.cargos, 0) + somarTotais(item.subitens).cargos,
    funcoes: total.funcoes + item.dotacoes.reduce((soma, dotacao) => soma + dotacao.funcoes, 0) + somarTotais(item.subitens).funcoes,
  }), acumulado);
}






