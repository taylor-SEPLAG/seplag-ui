import "./comissionadosVisual.css";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  BotaoAdicionarSeplag,
  BotaoIconSeplag,
  BotaoSalvarSeplag,
  BotaoVoltarSeplag,
} from "../../componentes/Botao";
import { MensagemSeplag } from "../../componentes/Mensagem";
import { DateFieldSeplag, DropdownFieldSeplag, TextFieldSeplag } from "../../componentes/Fields";
import { BaseLegalVinculada } from "./BaseLegalVinculada";
import { listarCargosControleVagasComissionadas } from "./cargosComissionadosStore";
import { listarPerfisDgaControleVagasComissionadas } from "./perfisDgaStore";
import {
  lerRascunhoQuadroComissionado,
  salvarRascunhoQuadroComissionado,
  listarQuadrosComissionados,
  type NivelComissionadoSalvo,
} from "./novoQuadroComissionadoStore";
import "./novoQuadroComissionado.css";
import "../controleVagas/quadroAutorizado.css";

type Dotacao = { id: string; perfil: string; simbologia: string; cargos: number; funcoes: number; extincaoProgressivaCargos?: boolean; extincaoProgressivaFuncoes?: boolean };
type ItemEstrutura = { id: string; nome: string; dotacoes: Dotacao[]; subitens: ItemEstrutura[] };

type Nivel = { id: string; nome: string; itens: ItemEstrutura[] };

const novoId = () => crypto.randomUUID();
const novaDotacao = (): Dotacao => ({ id: novoId(), perfil: "", simbologia: "", cargos: 0, funcoes: 0 });
const novoItem = (): ItemEstrutura => ({ id: novoId(), nome: "", dotacoes: [], subitens: [] });

const novoNivel = (): Nivel => ({ id: novoId(), nome: "", itens: [] });

type OcupacaoDaDotacao = { cargos: number; funcoes: number };
type ReducaoComOcupacao = { dotacaoId: string; perfil: string; simbologia: string; natureza: "Cargos" | "Funções"; proposta: number; ocupadas: number; excedente: number; extincaoProgressiva: boolean };

// Enquanto a integração de ocupações é concluída, este recorte representa as vagas já ocupadas
// no quadro demonstrativo da POLITEC. A regra de validação usa a mesma chave imutável da dotação.
const ocupacoesAtuaisPorDotacao: Record<string, OcupacaoDaDotacao> = {
  "politec-apoio-5-2": { cargos: 0, funcoes: 4 },
};

const atualizarItem = (itens: ItemEstrutura[], id: string, atualizar: (item: ItemEstrutura) => ItemEstrutura): ItemEstrutura[] =>
  itens.map((item) => item.id === id ? atualizar(item) : { ...item, subitens: atualizarItem(item.subitens, id, atualizar) });
const excluirItem = (itens: ItemEstrutura[], id: string): ItemEstrutura[] =>
  itens.filter((item) => item.id !== id).map((item) => ({ ...item, subitens: excluirItem(item.subitens, id) }));

const nomesOficiaisPolitec: Record<string, string> = {
  "Nível de Decisão Colegiada": "NÍVEL DE DECISÃO COLEGIADA",
  "Nível de Direção Superior": "NÍVEL DE DIREÇÃO SUPERIOR",
  "Diretoria-Geral da POLITEC": "1. Diretoria-Geral da POLITEC",
  "Diretoria-Geral Adjunta da POLITEC": "1.1. Diretoria-Geral Adjunta da POLITEC",
  "Diretor-Geral Adjunto": "Diretor-Geral Adjunto da POLITEC",
};

function normalizarItemPolitec(item: ItemEstrutura): ItemEstrutura {
  return {
    ...item,
    nome: nomesOficiaisPolitec[item.nome] ?? item.nome,
    dotacoes: item.dotacoes.map((dotacao) => ({
      ...dotacao,
      perfil: nomesOficiaisPolitec[dotacao.perfil] ?? dotacao.perfil,
    })),
    subitens: item.subitens.map(normalizarItemPolitec),
  };
}

function normalizarNiveis(niveis: NivelComissionadoSalvo[] | undefined): Nivel[] {
  return (niveis ?? []).map((nivel) => {
    const legado = nivel as NivelComissionadoSalvo & { unidades?: { itens?: ItemEstrutura[] }[] };
    return {
      id: legado.id,
      nome: nomesOficiaisPolitec[legado.nome] ?? legado.nome,
      itens: (legado.itens ?? legado.unidades?.flatMap((unidade) => unidade.itens ?? []) ?? []).map(normalizarItemPolitec),
    };
  });
}
export function NovoQuadroComissionadoContent() {
  const navigate = useNavigate();
  const [rascunhoInicial] = useState(lerRascunhoQuadroComissionado);
  const [idQuadro] = useState(() => rascunhoInicial?.id ?? novoId());
  const { control: vigenciaControl, watch: watchVigencia, setValue: setValorVigencia } = useForm<{ dataVigencia: string; orgao: string; nome: string }>({ defaultValues: { dataVigencia: rascunhoInicial?.dataVigencia ?? "", orgao: rascunhoInicial?.orgao ?? "", nome: rascunhoInicial?.nome ?? "" } });
  const dataVigencia = watchVigencia("dataVigencia") ?? "";
  const orgao = watchVigencia("orgao") ?? "";
  const nome = watchVigencia("nome") ?? "";
  const dataAtual = new Date().toISOString().slice(0, 10);
  const dataVigenciaFutura = Boolean(dataVigencia && dataVigencia > dataAtual);
  const [documentosLegaisIds, setDocumentosLegaisIds] = useState<string[]>(() => rascunhoInicial?.documentosLegaisIds ?? []);
  const [niveis, setNiveis] = useState<Nivel[]>(() => normalizarNiveis(rascunhoInicial?.niveis));
  const [motivoVersionamento, setMotivoVersionamento] = useState(() => rascunhoInicial?.motivoVersionamento ?? "");
  const [simbolosAbertos, setSimbolosAbertos] = useState<string[]>([]);
  const emVersionamento = Boolean(rascunhoInicial?.versao && rascunhoInicial.versao > 1);
  const [salvo, setSalvo] = useState(false);
  const reducoesComOcupacao = emVersionamento ? listarReducoesComOcupacao(niveis) : [];
  const reducoesPendentes = reducoesComOcupacao.filter((reducao) => !reducao.extincaoProgressiva);
  const dotacoesOriginais = useMemo(() => indexarDotacoes(normalizarNiveis(rascunhoInicial?.niveis)), [rascunhoInicial]);

  const atualizarNivel = (id: string, atualizar: (nivel: Nivel) => Nivel) => setNiveis((atual) => atual.map((nivel) => nivel.id === id ? atualizar(nivel) : nivel));
  const total = niveis.reduce((soma, nivel) => soma + contarDotacoes(nivel.itens), 0);
  const totais = niveis.reduce((soma, nivel) => somarTotais(nivel.itens, soma), { cargos: 0, funcoes: 0 });
  const simbologias = listarCargosControleVagasComissionadas().map((cargo) => cargo.codigo);
  const resumoSimbologias = simbologias.map((simbologia) => ({ simbologia, ...somarPorSimbologia(niveis, simbologia), perfis: perfisPorSimbologia(niveis, simbologia) }));
  const orgaos = ["SEPLAG", "POLITEC", "SESP", "SES", "SEDUC", "SEMA"];
  const quadrosCadastrados = listarQuadrosComissionados();
  const normalizarOrgao = (valor: string) => valor.trim().toLocaleLowerCase("pt-BR");
  const quadroAtualId = rascunhoInicial?.quadroBaseId ?? rascunhoInicial?.id;
  const quadroExistenteDoOrgao = (valor: string) => quadrosCadastrados.find((quadro) => normalizarOrgao(quadro.orgao) === normalizarOrgao(valor) && (quadro.quadroBaseId ?? quadro.id) !== quadroAtualId);
  const orgaoSelecionadoJaPossuiQuadro = Boolean(orgao && quadroExistenteDoOrgao(orgao));
  const opcoesOrgao = orgaos.map((valor) => {
    const quadroExistente = quadroExistenteDoOrgao(valor);
    const codigo = quadroExistente?.codigo;
    return { label: valor, value: valor, indisponivel: Boolean(quadroExistente), quadroCodigo: codigo, motivoIndisponibilidade: codigo ? "Já existe o quadro " + codigo + " para este órgão." : "" };
  });
  useEffect(() => {
    if (!orgaoSelecionadoJaPossuiQuadro) return;
    setValorVigencia("orgao", "", { shouldDirty: true, shouldValidate: true });
  }, [orgaoSelecionadoJaPossuiQuadro, orgao, setValorVigencia]);

  const salvarQuadro = () => {
    if (dataVigenciaFutura || orgaoSelecionadoJaPossuiQuadro || reducoesPendentes.length) return;
    salvarRascunhoQuadroComissionado({
      id: idQuadro,
      nome,
      orgao,
      dataVigencia,
      documentosLegaisIds,
      niveis: structuredClone(niveis) as NivelComissionadoSalvo[],
      quadroBaseId: rascunhoInicial?.quadroBaseId ?? idQuadro,
      versao: rascunhoInicial?.versao ?? 1,
      versaoAnteriorId: rascunhoInicial?.versaoAnteriorId,
      motivoVersionamento: emVersionamento ? motivoVersionamento.trim() : undefined,
      salvoEm: new Date().toISOString(),
    });
    setSalvo(true);
  };
  return <div className="prototype-quadro-page novo-quadro-comissionado">
    <header className="prototype-quadro-header">
      <div><h1>{emVersionamento ? "Nova versão do quadro comissionado" : "Novo Quadro Comissionado"}</h1><p>{emVersionamento ? `Versão ${rascunhoInicial?.versao} do quadro ${rascunhoInicial?.nome}. Revise a estrutura e informe o motivo do versionamento.` : "Cadastre a estrutura autorizada de um órgão, incluindo níveis, itens, cargos em comissão e funções de confiança."}</p></div>
    </header>

    <MensagemSeplag visible={salvo} severity="success" message="Estrutura do quadro salva para o órgão selecionado." />

    {emVersionamento && reducoesComOcupacao.length > 0 && <section className={`nqc-reducoes-pendencias ${reducoesPendentes.length ? "is-blocking" : "is-progressive"}`}>
      <i className={reducoesPendentes.length ? "pi pi-exclamation-triangle" : "pi pi-info-circle"} />
      <div>
        <strong>{reducoesPendentes.length ? "Pendências para publicar a versão" : "Extinção progressiva configurada"}</strong>
        <p>{reducoesPendentes.length
          ? `${reducoesPendentes.length} dotação(ões) reduzida(s) abaixo das ocupações atuais. Defina a extinção progressiva ou mantenha o quantitativo ocupado.`
          : "As posições excedentes permanecerão ocupadas até a vacância e não aceitarão novo ingresso."}</p>
        <ul>{reducoesComOcupacao.map((reducao) => <li key={`${reducao.dotacaoId}-${reducao.natureza}`}><button type="button" onClick={() => document.getElementById(`dotacao-${reducao.dotacaoId}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}>Ver {reducao.excedente} vaga(s) afetada(s)</button> · {reducao.simbologia} — {reducao.perfil}</li>)}</ul>
      </div>
    </section>}

    <div className="prototype-quadro-form">
    <BaseLegalVinculada value={documentosLegaisIds} onChange={setDocumentosLegaisIds} />

    {emVersionamento && <section className="nqc-card nqc-versionamento">
      <header><i className="pi pi-history" /><div><h2>Motivo do versionamento</h2><p>Descreva a alteração que fundamenta esta nova versão do quadro.</p></div></header>
      <div className="nqc-versionamento-content"><label><span className="nqc-label">Motivo <em>*</em></span><textarea value={motivoVersionamento} onChange={(event) => setMotivoVersionamento(event.target.value)} placeholder="Ex.: Adequação da estrutura organizacional conforme novo ato normativo." /></label></div>
    </section>}


    <section className="nqc-card">
      <header><i className="pi pi-building" /><div><h2>Identificação do quadro</h2><p>Selecione o órgão a que pertence o quadro. A fundamentação é informada na Base legal.</p></div></header>
      <div className="nqc-fields">
        <TextFieldSeplag name="nome" control={vigenciaControl} label="Nome do quadro" required cols="12" placeholder="Ex.: Estrutura organizacional da SESP" getFormErrorMessage={() => null} />
        <DropdownFieldSeplag name="orgao" control={vigenciaControl} label="Órgão" required cols="12" options={opcoesOrgao} optionLabel="label" optionValue="value" onChange={(orgaoSelecionado) => { if (orgaoSelecionado && quadroExistenteDoOrgao(String(orgaoSelecionado))) setValorVigencia("orgao", "", { shouldDirty: true, shouldValidate: true }); }} itemTemplate={(option) => <span className={option.indisponivel ? "prototype-quadro-cargo-indisponivel nqc-orgao-indisponivel" : undefined} aria-label={option.motivoIndisponibilidade || undefined}><span className="prototype-quadro-cargo-indisponivel-label">{option.label}</span>{option.quadroCodigo && <span className="prototype-quadro-cargo-indisponivel-badge">{option.quadroCodigo}</span>}</span>} placeholder="Selecione" getFormErrorMessage={() => null} />
      </div>
    </section>

    

    <section className="nqc-card nqc-vigencia">
      <header><i className="pi pi-calendar" /><div><h2>Vigência</h2><p>Informe a data em que a estrutura passou a valer.</p></div></header>
      <div className="nqc-vigencia-content">
        <div className="nqc-vigencia-date"><DateFieldSeplag name="dataVigencia" control={vigenciaControl} label="Data de início" required cols="12" maxDate={new Date()} customValidation={(value: string) => !value || value <= dataAtual || "A data de início não pode ser futura."} getFormErrorMessage={() => null} /></div>
        <div className="nqc-vigencia-status"><i className="pi pi-check-circle" /><div><span>Situação</span><strong className="nqc-status">Ativo</strong><p>A estrutura passa a valer a partir da data informada.</p></div></div>
      </div>
    </section>

    <section className="nqc-card nqc-estrutura">
      <header><i className="pi pi-sitemap" /><div><h2>Estrutura organizacional</h2><p>Adicione os níveis da estrutura. Em cada nível, registre itens, subitens e suas dotações autorizadas.</p></div><BotaoAdicionarSeplag label="Adicionar nível" onClick={() => setNiveis((atual) => [...atual, novoNivel()])} /></header>
      {!niveis.length && <div className="nqc-empty"><i className="pi pi-sitemap" /><strong>Nenhum nível cadastrado</strong><span>Comece por um nível, como “Direção Superior” ou “Administração Sistêmica”.</span></div>}
      <div className="nqc-niveis">{niveis.map((nivel, indice) => <NivelEditor key={nivel.id} nivel={nivel} indice={indice} onChange={(atualizar) => atualizarNivel(nivel.id, atualizar)} onRemove={() => setNiveis((atual) => atual.filter((item) => item.id !== nivel.id))} simbologias={simbologias} emVersionamento={emVersionamento} dotacoesOriginais={dotacoesOriginais} />)}</div>
    </section>

    <section className="nqc-card nqc-resumo">
      <header><i className="pi pi-chart-bar" /><div><h2>Resumo das dotações</h2><p>Quantitativos autorizados por cargo comissionado.</p></div></header>
      <div className="nqc-resumo-table-wrap"><table><thead><tr><th>Cargo Comissionado</th><th>Cargo</th><th>Função</th></tr></thead><tbody>{resumoSimbologias.map((linha) => {
        const aberto = simbolosAbertos.includes(linha.simbologia);
        const alternar = () => setSimbolosAbertos((atuais) => aberto ? atuais.filter((simbolo) => simbolo !== linha.simbologia) : [...atuais, linha.simbologia]);
        return <Fragment key={linha.simbologia}>
          <tr className="nqc-resumo-linha-dga">
            <td><button type="button" className="nqc-resumo-accordion-trigger" onClick={alternar} aria-expanded={aberto} aria-controls={`perfis-${linha.simbologia}`}><i className={aberto ? "pi pi-chevron-down" : "pi pi-chevron-right"} />{linha.simbologia}</button></td>
            <td>{linha.cargos || "-"}</td><td>{linha.funcoes || "-"}</td>
          </tr>
          {aberto && <tr id={`perfis-${linha.simbologia}`} className="nqc-resumo-perfis"><td colSpan={3}>{linha.perfis.length ? <table><thead><tr><th>Perfil Profissional</th><th>Cargo</th><th>Função</th></tr></thead><tbody>{linha.perfis.map((perfil) => <tr key={perfil.nome}><td>{perfil.nome}</td><td>{perfil.cargos || "-"}</td><td>{perfil.funcoes || "-"}</td></tr>)}</tbody></table> : <span>Nenhum perfil associado a este cargo comissionado.</span>}</td></tr>}
        </Fragment>;
      })}</tbody><tfoot><tr><th>Subtotal</th><th>{totais.cargos}</th><th>{totais.funcoes}</th></tr><tr><th>Total</th><th colSpan={2}>{totais.cargos + totais.funcoes}</th></tr></tfoot></table></div>
    </section>
    <footer className="prototype-quadro-form-actions prototype-quadro-form-actions--flow"><div className="nqc-footer-actions"><BotaoVoltarSeplag label="Cancelar" onClick={() => navigate(-1)} /><BotaoSalvarSeplag label="Salvar quadro" disabled={!nome.trim() || !orgao || !dataVigencia || !documentosLegaisIds.length || !niveis.length || dataVigenciaFutura || orgaoSelecionadoJaPossuiQuadro || reducoesPendentes.length > 0 || (emVersionamento && !motivoVersionamento.trim())} onClick={salvarQuadro} /></div></footer>
    </div>
  </div>;
}

function NivelEditor({ nivel, indice, onChange, onRemove, simbologias, emVersionamento, dotacoesOriginais }: { nivel: Nivel; indice: number; onChange: (atualizar: (nivel: Nivel) => Nivel) => void; onRemove: () => void; simbologias: string[]; emVersionamento: boolean; dotacoesOriginais: Record<string, Dotacao> }) {
  return <article className="nqc-nivel"><div className="nqc-nivel-title"><span>Nível {indice + 1}</span><input value={nivel.nome} onChange={(event) => onChange((atual) => ({ ...atual, nome: event.target.value }))} placeholder="Ex.: Nível de Administração Sistêmica" /><BotaoIconSeplag icon="pi pi-trash" aria-label="Excluir nível" tooltip="Excluir nível" onClick={onRemove} /></div>
    <div className="nqc-nivel-itens">{nivel.itens.map((item) => <ItemEditor key={item.id} item={item} nivel={0} onChange={(atualizar) => onChange((atual) => ({ ...atual, itens: atualizarItem(atual.itens, item.id, atualizar) }))} onRemove={() => onChange((atual) => ({ ...atual, itens: excluirItem(atual.itens, item.id) }))} simbologias={simbologias} emVersionamento={emVersionamento} dotacoesOriginais={dotacoesOriginais} />)}</div>
    <button className="nqc-add-link" type="button" onClick={() => onChange((atual) => ({ ...atual, itens: [...atual.itens, novoItem()] }))}><i className="pi pi-plus" />Adicionar item</button>
  </article>;
}
function ItemEditor({ item, nivel, onChange, onRemove, simbologias, emVersionamento, dotacoesOriginais }: { item: ItemEstrutura; nivel: number; onChange: (atualizar: (item: ItemEstrutura) => ItemEstrutura) => void; onRemove: () => void; simbologias: string[]; emVersionamento: boolean; dotacoesOriginais: Record<string, Dotacao> }) {
  return <article className={"nqc-item nqc-item-" + nivel}><div className="nqc-item-title"><i className={nivel ? "pi pi-angle-right" : "pi pi-folder"} /><input value={item.nome} onChange={(event) => onChange((atual) => ({ ...atual, nome: event.target.value }))} placeholder={nivel ? "Nome do subitem" : "Nome do item"} /><BotaoIconSeplag icon="pi pi-trash" aria-label="Excluir item" tooltip="Excluir item" onClick={onRemove} /></div>
    <div className="nqc-dotacoes">{item.dotacoes.map((dotacao) => <DotacaoEditor key={dotacao.id} dotacao={dotacao} onChange={(atualizar) => onChange((atual) => ({ ...atual, dotacoes: atual.dotacoes.map((linha) => linha.id === dotacao.id ? atualizar(linha) : linha) }))} onRemove={() => onChange((atual) => ({ ...atual, dotacoes: atual.dotacoes.filter((linha) => linha.id !== dotacao.id) }))} simbologias={simbologias} emVersionamento={emVersionamento} dotacoesOriginais={dotacoesOriginais} />)}</div>
    <div className="nqc-item-actions"><button className="nqc-add-link" type="button" onClick={() => onChange((atual) => ({ ...atual, dotacoes: [...atual.dotacoes, novaDotacao()] }))}><i className="pi pi-plus" />Adicionar dotação</button><button className="nqc-add-link" type="button" onClick={() => onChange((atual) => ({ ...atual, subitens: [...atual.subitens, novoItem()] }))}><i className="pi pi-plus" />Adicionar subitem</button></div>
    {item.subitens.map((subitem) => <ItemEditor key={subitem.id} item={subitem} nivel={nivel + 1} onChange={(atualizar) => onChange((atual) => ({ ...atual, subitens: atualizarItem(atual.subitens, subitem.id, atualizar) }))} onRemove={() => onChange((atual) => ({ ...atual, subitens: excluirItem(atual.subitens, subitem.id) }))} simbologias={simbologias} emVersionamento={emVersionamento} dotacoesOriginais={dotacoesOriginais} />)}
  </article>;
}

function DotacaoEditor({ dotacao, onChange, onRemove, simbologias, emVersionamento, dotacoesOriginais }: { dotacao: Dotacao; onChange: (atualizar: (dotacao: Dotacao) => Dotacao) => void; onRemove: () => void; simbologias: string[]; emVersionamento: boolean; dotacoesOriginais: Record<string, Dotacao> }) {
  const [mostrarVagasAfetadas, setMostrarVagasAfetadas] = useState(false);
  const atualizar = <K extends keyof Dotacao>(campo: K, valor: Dotacao[K]) => onChange((atual) => ({ ...atual, [campo]: valor }));
  const perfisDga = listarPerfisDgaControleVagasComissionadas();
  const perfisDisponiveis = [...new Set([...perfisDga.map((perfil) => perfil.nome), dotacao.perfil].filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const original = dotacoesOriginais[dotacao.id];
  const houveAlteracao = Boolean(original && (original.cargos !== dotacao.cargos || original.funcoes !== dotacao.funcoes || original.perfil !== dotacao.perfil || original.simbologia !== dotacao.simbologia));
  const ocupadas = ocupacoesAtuaisPorDotacao[dotacao.id] ?? { cargos: 0, funcoes: 0 };
  const reducaoCargos = Math.max(0, ocupadas.cargos - dotacao.cargos);
  const reducaoFuncoes = Math.max(0, ocupadas.funcoes - dotacao.funcoes);
  const possuiReducaoComOcupacao = reducaoCargos > 0 || reducaoFuncoes > 0;
  const excedente = reducaoCargos + reducaoFuncoes;
  const extincaoProgressiva = (reducaoCargos === 0 || dotacao.extincaoProgressivaCargos) && (reducaoFuncoes === 0 || dotacao.extincaoProgressivaFuncoes);
  const vagasAfetadas = Array.from({ length: excedente }, (_, indice) => `${dotacao.simbologia || "Vaga"}-${reducaoFuncoes ? "F" : "C"}-${String((dotacao.funcoes || dotacao.cargos) + indice + 1).padStart(3, "0")}`);

  return <div id={`dotacao-${dotacao.id}`} className={`nqc-dotacao ${possuiReducaoComOcupacao ? "nqc-dotacao--reducao" : ""}`}>
    <label>Perfil Profissional<select value={dotacao.perfil} onChange={(event) => atualizar("perfil", event.target.value)}><option value="">Selecione...</option>{perfisDisponiveis.map((perfil) => <option key={perfil} value={perfil}>{perfil}</option>)}</select></label>
    <label>Cargo Comissionado<select value={dotacao.simbologia} onChange={(event) => atualizar("simbologia", event.target.value)}><option value="">Selecione...</option>{simbologias.map((simbolo) => <option key={simbolo}>{simbolo}</option>)}</select></label>
    <label>Cargos<input type="number" min="0" value={dotacao.cargos} onChange={(event) => atualizar("cargos", Number(event.target.value))} /></label>
    <label>Funções<input type="number" min="0" value={dotacao.funcoes} onChange={(event) => atualizar("funcoes", Number(event.target.value))} /></label>
    <BotaoIconSeplag icon="pi pi-trash" aria-label="Excluir dotação" tooltip="Excluir dotação" onClick={onRemove} />
    {emVersionamento && houveAlteracao && (possuiReducaoComOcupacao ? <div className={`nqc-reducao-alerta ${extincaoProgressiva ? "is-progressive" : ""}`}>
      <i className={extincaoProgressiva ? "pi pi-info-circle" : "pi pi-exclamation-triangle"} />
      <div><strong>{ocupadas.cargos + ocupadas.funcoes} vaga(s) ocupada(s) nesta dotação.</strong><p>A quantidade proposta deixa {excedente} posição(ões) excedente(s). Elas não podem ser extintas enquanto houver ocupação.</p>
        <button type="button" onClick={() => setMostrarVagasAfetadas((atual) => !atual)}>{mostrarVagasAfetadas ? "Ocultar vagas afetadas" : `Ver ${excedente} vaga(s) afetada(s)`}</button>
        {mostrarVagasAfetadas && <ul>{vagasAfetadas.map((vaga) => <li key={vaga}>{vaga} · Ocupada</li>)}</ul>}
      </div>
      <label className="nqc-extincao-progressiva"><input type="checkbox" checked={extincaoProgressiva} onChange={(event) => {
        if (reducaoCargos) atualizar("extincaoProgressivaCargos", event.target.checked);
        if (reducaoFuncoes) atualizar("extincaoProgressivaFuncoes", event.target.checked);
      }} />Extinguir progressivamente {excedente} vaga(s) após a vacância</label>
    </div> : <div className="nqc-alteracao-validada"><i className="pi pi-check-circle" /><div><strong>Alteração permitida.</strong><p>A dotação foi alterada e não há redução abaixo das vagas ocupadas.</p></div></div>)}
  </div>;
}
function indexarDotacoes(niveis: Nivel[]): Record<string, Dotacao> {
  const indice: Record<string, Dotacao> = {};
  const visitarItens = (itens: ItemEstrutura[]) => itens.forEach((item) => {
    item.dotacoes.forEach((dotacao) => { indice[dotacao.id] = structuredClone(dotacao); });
    visitarItens(item.subitens);
  });
  niveis.forEach((nivel) => visitarItens(nivel.itens));
  return indice;
}
function listarReducoesComOcupacao(niveis: Nivel[]): ReducaoComOcupacao[] {
  const reducoes: ReducaoComOcupacao[] = [];
  const verificarItens = (itens: ItemEstrutura[]) => itens.forEach((item) => {
    item.dotacoes.forEach((dotacao) => {
      const ocupadas = ocupacoesAtuaisPorDotacao[dotacao.id];
      if (!ocupadas) return;
      ([
        { natureza: "Cargos" as const, proposta: dotacao.cargos, ocupadas: ocupadas.cargos, extincaoProgressiva: Boolean(dotacao.extincaoProgressivaCargos) },
        { natureza: "Funções" as const, proposta: dotacao.funcoes, ocupadas: ocupadas.funcoes, extincaoProgressiva: Boolean(dotacao.extincaoProgressivaFuncoes) },
      ]).forEach((linha) => {
        const excedente = Math.max(0, linha.ocupadas - linha.proposta);
        if (excedente) reducoes.push({ dotacaoId: dotacao.id, perfil: dotacao.perfil, simbologia: dotacao.simbologia, natureza: linha.natureza, proposta: linha.proposta, ocupadas: linha.ocupadas, excedente, extincaoProgressiva: linha.extincaoProgressiva });
      });
    });
    verificarItens(item.subitens);
  });
  niveis.forEach((nivel) => verificarItens(nivel.itens));
  return reducoes;
}
function perfisPorSimbologia(niveis: Nivel[], simbologia: string) {
  const perfis = new Map<string, { nome: string; cargos: number; funcoes: number }>();
  const visitarItens = (itens: ItemEstrutura[]) => itens.forEach((item) => {
    item.dotacoes.filter((dotacao) => dotacao.simbologia === simbologia).forEach((dotacao) => {
      const atual = perfis.get(dotacao.perfil) ?? { nome: dotacao.perfil, cargos: 0, funcoes: 0 };
      perfis.set(dotacao.perfil, { ...atual, cargos: atual.cargos + dotacao.cargos, funcoes: atual.funcoes + dotacao.funcoes });
    });
    visitarItens(item.subitens);
  });
  niveis.forEach((nivel) => visitarItens(nivel.itens));
  return [...perfis.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
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











