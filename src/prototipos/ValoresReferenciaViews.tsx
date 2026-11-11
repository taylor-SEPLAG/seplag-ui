import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { BotaoIconSeplag, BotaoLimparFiltroSeplag, BotaoSalvarSeplag, BotaoSeplag, BotaoVoltarSeplag } from "@componentes/Botao";
import { CardSeplag } from "@componentes/Card";
import { ModalSeplag } from "@componentes/Modal";
import { TextAreaFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
import { DocumentosLegaisAssociadosSeplag, type DocumentoLegalAssociadoSeplag } from "@componentes/DocumentosLegaisAssociados";
import { consultarValorReferencia, dataReferencia, formatarValorReferencia, hojeReferencia, prepararGravacaoReferencia, regraValorReferencia, type FormularioValorReferencia, type ValorReferencia, type VigenciaValorReferencia } from "./valoresReferencia";

const BASE = "/prototipos/folha/valores-referencia";
type Carregamento = { valores: ValorReferencia[]; erro?: string };
interface Props {
  carregarValores: () => Carregamento;
  documentos: DocumentoLegalAssociadoSeplag[];
}
const caminhoNovo = (codigo: string) => `${BASE}/${encodeURIComponent(codigo)}/vigencias/novo`;
const caminhoEditar = (codigo: string, id: number) => `${BASE}/${encodeURIComponent(codigo)}/vigencias/${id}/editar`;
const badge = (texto: string) => <span className={`prototype-badge ${texto === "Ativo" ? "prototype-badge--success" : "prototype-badge--danger"}`}>{texto}</span>;

export function ValoresReferenciaListagem({ carregarValores, documentos }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const codigoSalvo = location.state?.valorReferenciaSalvo as string | undefined;
  const [dados, setDados] = useState(carregarValores);
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("");
  const [expandidos, setExpandidos] = useState<string[]>(codigoSalvo ? [codigoSalvo] : []);
  const [visualizada, setVisualizada] = useState<{ referencia: ValorReferencia; vigencia: VigenciaValorReferencia } | null>(null);
  useEffect(() => {
    const atualizar = () => setDados(carregarValores());
    window.addEventListener("focus", atualizar);
    window.addEventListener("storage", atualizar);
    return () => { window.removeEventListener("focus", atualizar); window.removeEventListener("storage", atualizar); };
  }, [carregarValores]);
  const termo = busca.trim().toLocaleLowerCase("pt-BR");
  const filtrados = dados.valores.filter((valor) => (!tipo || valor.tipo === tipo) && (!termo || `${valor.codigo} ${valor.nome}`.toLocaleLowerCase("pt-BR").includes(termo)));
  const hoje = hojeReferencia();
  const visualizar = (referencia: ValorReferencia, vigencia: VigenciaValorReferencia) => setVisualizada({ referencia, vigencia });
  return (
    <div className="prototype-page-content prototype-page-content--white prototype-folha-referencia-page">
      {codigoSalvo ? <div role="status" className="prototype-validation-panel">Vigência de {codigoSalvo} salva com sucesso!</div> : null}
      {dados.erro ? <div role="alert" className="prototype-validation-panel">{dados.erro}<BotaoSeplag type="button" label="Tentar novamente" onClick={() => setDados(carregarValores())} /></div> : null}
      <div className="prototype-folha-parametros-header"><h2>Valores de Referência</h2><p>Gerencie os valores utilizados como referência nos cálculos da folha.</p></div>
      <section className="prototype-folha-referencia-content">
        <div className="col-12 prototype-folha-referencia-filters prototype-folha-valores-referencia-filters">
          <label><span>Valor de referência</span><input type="search" placeholder="Código ou nome" value={busca} onChange={(evento) => setBusca(evento.target.value)} /></label>
          <label><span>Tipo</span><select value={tipo} onChange={(evento) => setTipo(evento.target.value)}><option value="">Todos</option><option>Monetário</option><option>Numérico</option></select></label>
          <div className="prototype-category-clear"><BotaoLimparFiltroSeplag type="button" label="Limpar" onClick={() => { setBusca(""); setTipo(""); }} /></div>
        </div>
        <div className="col-12 prototype-folha-referencia-list prototype-folha-valores-referencia-list">
          <table className="prototype-folha-valores-referencia-table">
            <thead><tr><th>Código</th><th>Nome</th><th>Tipo</th><th>Vigência Atual</th><th>Valor Atual</th><th>Situação</th><th>Ações</th></tr></thead>
            <tbody>{filtrados.map((referencia, indice) => {
              const consulta = consultarValorReferencia(dados.valores, referencia.codigo, hoje);
              const atual = consulta.estado === "ok" ? referencia.vigencias.find((item) => item.id === consulta.vigencia.id) : undefined;
              const expandido = expandidos.includes(referencia.codigo);
              const historico = [...referencia.vigencias].sort((a, b) => (dataReferencia(b.inicioVigencia) ?? 0) - (dataReferencia(a.inicioVigencia) ?? 0));
              return <Fragment key={`${referencia.codigo}-${indice}`}>
                <tr><td>{referencia.codigo}</td><td>{referencia.nome}</td><td>{referencia.tipo}</td>
                  <td>{atual?.vigencia ?? (consulta.estado === "ausente" ? "Sem vigência atual" : consulta.erro)}</td>
                  <td>{atual ? formatarValorReferencia(referencia.codigo, referencia.tipo, atual.valor) : "—"}</td>
                  <td>{atual ? badge(atual.situacao) : badge(consulta.estado === "conflito" ? "Conflito" : consulta.estado === "invalido" ? "Inválido" : "Sem vigência atual")}</td>
                  <td><div className="prototype-folha-referencia-actions">
                    <BotaoIconSeplag type="button" tooltip="Nova vigência" icon="pi pi-plus" onClick={() => navigate(caminhoNovo(referencia.codigo))} />
                    <BotaoIconSeplag type="button" tooltip="Visualizar vigência atual" icon="pi pi-eye" disabled={!atual} onClick={() => atual && visualizar(referencia, atual)} />
                    <BotaoIconSeplag type="button" tooltip="Editar vigência atual" severity="warning" icon="pi pi-pencil" disabled={!atual} onClick={() => atual && navigate(caminhoEditar(referencia.codigo, atual.id))} />
                    <button type="button" className="prototype-folha-referencia-expand prototype-folha-referencia-expand--small" aria-label={expandido ? "Recolher vigências" : "Expandir vigências"} aria-expanded={expandido} onClick={() => setExpandidos((atuais) => expandido ? atuais.filter((codigo) => codigo !== referencia.codigo) : [...atuais, referencia.codigo])}><i className={`pi ${expandido ? "pi-chevron-up" : "pi-chevron-down"}`} aria-hidden="true" /></button>
                  </div></td>
                </tr>
                {expandido ? <tr className="prototype-folha-valores-referencia-expanded-row"><td colSpan={7}><div className="prototype-folha-referencia-vigencias prototype-folha-valores-referencia-vigencias"><table>
                  <thead><tr><th>Ano</th><th>Vigência</th><th>Valor</th><th>Situação</th><th>Ações</th></tr></thead>
                  <tbody>{historico.map((vigencia) => <tr key={vigencia.id}><td>{vigencia.ano}</td><td>{vigencia.vigencia}</td><td>{formatarValorReferencia(referencia.codigo, referencia.tipo, vigencia.valor)}</td><td>{badge(vigencia.situacao)}</td><td><div className="prototype-folha-referencia-actions"><BotaoIconSeplag type="button" tooltip="Visualizar vigência" icon="pi pi-eye" onClick={() => visualizar(referencia, vigencia)} /><BotaoIconSeplag type="button" tooltip="Editar vigência" severity="warning" icon="pi pi-pencil" onClick={() => navigate(caminhoEditar(referencia.codigo, vigencia.id))} /></div></td></tr>)}
                    {!historico.length ? <tr><td colSpan={5} className="prototype-empty-table-cell">Nenhuma vigência cadastrada. Utilize Nova vigência para cadastrar a primeira.</td></tr> : null}
                  </tbody>
                </table></div></td></tr> : null}
              </Fragment>;
            })}{!filtrados.length && !dados.erro ? <tr><td colSpan={7} className="prototype-empty-table-cell">Nenhum valor de referência encontrado.</td></tr> : null}</tbody>
          </table>
        </div>
      </section>
      <ModalSeplag visible={Boolean(visualizada)} titulo="Visualizar Vigência" tamanho="800px" fechar={() => setVisualizada(null)} customFooter={<BotaoSeplag type="button" label="Fechar" onClick={() => setVisualizada(null)} />}>
        {visualizada ? <div className="prototype-folha-referencia-irrf-values-grid">
          <div><span>Código</span><strong>{visualizada.referencia.codigo}</strong></div><div><span>Nome</span><strong>{visualizada.referencia.nome}</strong></div>
          <div><span>Tipo</span><strong>{visualizada.referencia.tipo}</strong></div><div><span>Valor</span><strong>{formatarValorReferencia(visualizada.referencia.codigo, visualizada.referencia.tipo, visualizada.vigencia.valor)}</strong></div>
          <div><span>Vigência</span><strong>{visualizada.vigencia.vigencia}</strong></div><div><span>Situação</span><strong>{visualizada.vigencia.situacao}</strong></div>
          <div><span>Base Legal</span><strong>{visualizada.vigencia.baseLegal?.map((id) => documentos.find((documento) => documento.id === id)?.titulo ?? id).join("; ") || "Não informada"}</strong></div>
          <div><span>Observações</span><p style={{ whiteSpace: "pre-wrap" }}>{visualizada.vigencia.observacoes || "Não informadas"}</p></div>
        </div> : null}
      </ModalSeplag>
    </div>
  );
}

export function ValoresReferenciaFormulario({ carregarValores, salvarValores, documentos }: Props & { salvarValores: (valores: ValorReferencia[]) => void }) {
  const navigate = useNavigate();
  const { codigo = "", vigenciaId } = useParams();
  const carga = useMemo(carregarValores, [carregarValores]);
  const referencia = carga.valores.find((item) => item.codigo === codigo);
  const editando = vigenciaId !== undefined;
  const vigencia = referencia?.vigencias.find((item) => item.id === Number(vigenciaId));
  const erroRota = carga.erro ?? (!referencia ? "Valor de referência não encontrado." : editando && !vigencia ? "Vigência não encontrada." : carga.valores.filter((item) => item.codigo === codigo).length > 1 ? "Existem códigos de referência duplicados. Regularize o cadastro." : undefined);
  const [feedback, setFeedback] = useState("");
  const [documentoVisualizado, setDocumentoVisualizado] = useState<DocumentoLegalAssociadoSeplag | null>(null);
  const { control, handleSubmit, watch } = useForm<FormularioValorReferencia>({ defaultValues: {
    valor: vigencia?.valor ?? "", inicioVigencia: vigencia?.inicioVigencia ?? "", observacoes: vigencia?.observacoes ?? "", baseLegal: vigencia?.baseLegal ?? [],
  } });
  const formulario = watch();
  const assinatura = JSON.stringify(formulario);
  const inicial = useRef(assinatura);
  const salvo = useRef(false);
  const alterado = assinatura !== inicial.current;
  const inicio = dataReferencia(formulario.inicioVigencia);
  const proxima = referencia?.vigencias.filter((item) => item.id !== vigencia?.id && (dataReferencia(item.inicioVigencia) ?? 0) > (inicio ?? Infinity)).sort((a, b) => dataReferencia(a.inicioVigencia)! - dataReferencia(b.inicioVigencia)!)[0];
  const fim = proxima?.inicioVigencia ?? (vigencia?.fimVigencia && dataReferencia(vigencia.fimVigencia)! > (inicio ?? Infinity) ? vigencia.fimVigencia : "");
  const regra = regraValorReferencia(codigo, referencia?.tipo);
  useEffect(() => {
    if (!alterado) return;
    const fechar = (evento: BeforeUnloadEvent) => { if (!salvo.current) { evento.preventDefault(); evento.returnValue = ""; } };
    const sairPorLink = (evento: MouseEvent) => {
      const link = evento.target instanceof Element ? evento.target.closest("a[href]") : null;
      if (!salvo.current && link instanceof HTMLAnchorElement && link.target !== "_blank" && !evento.ctrlKey && !evento.metaKey && !evento.shiftKey && link.href !== window.location.href && !window.confirm("Existem alterações não salvas. Deseja sair sem salvar?")) { evento.preventDefault(); evento.stopPropagation(); }
    };
    window.addEventListener("beforeunload", fechar); document.addEventListener("click", sairPorLink, true);
    return () => { window.removeEventListener("beforeunload", fechar); document.removeEventListener("click", sairPorLink, true); };
  }, [alterado]);
  const voltar = () => { if (!alterado || window.confirm("Existem alterações não salvas. Deseja sair sem salvar?")) navigate(BASE); };
  const salvar = (dados: FormularioValorReferencia) => {
    if (erroRota) { setFeedback(erroRota); return; }
    const atualizados = carregarValores();
    if (atualizados.erro) { setFeedback(atualizados.erro); return; }
    let valores: ValorReferencia[];
    try { valores = prepararGravacaoReferencia(atualizados.valores, codigo, editando ? Number(vigenciaId) : undefined, dados); }
    catch (erro) { setFeedback(erro instanceof Error ? erro.message : "Não foi possível validar a vigência."); return; }
    try { salvarValores(valores); }
    catch { setFeedback("Não foi possível salvar a vigência. Os dados informados foram preservados."); return; }
    salvo.current = true;
    navigate(BASE, { state: { valorReferenciaSalvo: codigo } });
  };
  if (erroRota || !referencia) return <div className="prototype-page-content prototype-page-content--white"><p role="alert">{erroRota}</p><BotaoVoltarSeplag type="button" label="Voltar" onClick={() => navigate(BASE)} /></div>;
  return <form onSubmit={handleSubmit(salvar, () => setFeedback("Preencha os campos obrigatórios: Valor e Início da Vigência."))}><div className="prototype-page-content prototype-page-content--white prototype-folha-referencia-form-page">
    {feedback ? <div role="alert" className="prototype-validation-panel">{feedback}</div> : null}
    <CardSeplag title={`VALOR DE REFERÊNCIA - ${referencia.nome}`} cols="12" cardHeaderClassNames="prototype-regime-card">
      <div className="col-12 prototype-folha-referencia-vigencia-form"><div className="prototype-folha-referencia-vigencia-panel">
        <div className="prototype-folha-referencia-vigencia-panel-title"><h3>{editando ? "Editar Vigência" : "Nova Vigência"}</h3></div>
        <p>{regra.finalidade}</p>
        <div className="grid prototype-folha-referencia-vigencia-fields">
          <div className="col-12 md:col-4"><label htmlFor="referencia-codigo" className="block mb-2">Código</label><input id="referencia-codigo" className="p-inputtext p-component w-full" readOnly value={referencia.codigo} /></div>
          <div className="col-12 md:col-5"><label htmlFor="referencia-nome" className="block mb-2">Nome</label><input id="referencia-nome" className="p-inputtext p-component w-full" readOnly value={referencia.nome} /></div>
          <div className="col-12 md:col-3"><label htmlFor="referencia-tipo" className="block mb-2">Tipo</label><input id="referencia-tipo" className="p-inputtext p-component w-full" readOnly value={referencia.tipo} /></div>
          <TextFieldSeplag name="valor" control={control} label={referencia.tipo === "Monetário" ? "Valor monetário" : "Valor numérico"} required placeholder={regra.casas === 6 ? "Ex.: 0,133145" : referencia.tipo === "Monetário" ? "Ex.: 1.621,00" : "Ex.: 978,62"} cols="12 12 4" getFormErrorMessage={() => null} />
          <TextFieldSeplag name="inicioVigencia" control={control} label="Início da Vigência" placeholder="dd/mm/aaaa" required cols="12 12 4" getFormErrorMessage={() => null} />
          <div className="col-12 md:col-4"><label htmlFor="referencia-fim" className="block mb-2">Fim da Vigência</label><input id="referencia-fim" className="p-inputtext p-component w-full" readOnly value={fim} placeholder="Sem encerramento definido" /><small>{!proxima && fim ? "Encerramento histórico preservado; fim exclusivo." : "Automático pelo início da sucessora; fim exclusivo."}</small></div>
          <div className="col-12"><small>{referencia.tipo}: até {regra.casas} casas decimais. {regra.aceitaZero ? "Aceita valor zero." : "Exige valor maior que zero."}</small></div>
          <Controller name="baseLegal" control={control} render={({ field }) => <div className="col-12"><DocumentosLegaisAssociadosSeplag label="Base Legal" required options={documentos} value={field.value} onChange={field.onChange} placeholder="Selecione os documentos da vigência" exibirNovoCadastro={false} onVisualizar={setDocumentoVisualizado} /></div>} />
          <TextAreaFieldSeplag name="observacoes" control={control} label="Observações" placeholder="Observações..." cols="12" rows={4} maxLength={500} getFormErrorMessage={() => null} />
        </div>
        <div className="prototype-category-form-footer prototype-folha-referencia-vigencia-footer"><BotaoVoltarSeplag type="button" label="Voltar" onClick={voltar} /><BotaoSalvarSeplag type="submit" label="Salvar" /></div>
      </div></div>
    </CardSeplag>
    <ModalSeplag visible={Boolean(documentoVisualizado)} titulo="Base Legal" tamanho="700px" fechar={() => setDocumentoVisualizado(null)} customFooter={<BotaoSeplag type="button" label="Fechar" onClick={() => setDocumentoVisualizado(null)} />}>
      {documentoVisualizado ? <div><h3>{documentoVisualizado.titulo}</h3><p>{documentoVisualizado.categoria}</p><p>{documentoVisualizado.descricao || "Descrição não informada."}</p></div> : null}
    </ModalSeplag>
  </div></form>;
}
