import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./quadroAutorizado.css";

import type { QuadroAutorizadoRow, SituacaoQuadro } from "./types";
import { controleVagasStore, useControleVagasStore } from "./controleVagasStore";
import { CONTROLE_VAGAS_BASE_PATH } from "./constants";
import { QuadroLegalOperacoes } from "./QuadroLegalOperacoes";
import { gerarVagasDoQuadro } from "./vagaUtils";
import { carreirasBaseTemporaria, cargosBaseTemporaria, perfisProfissionaisBaseTemporaria, orgaosBaseTemporaria } from "./baseTemporaria";
import { Dropdown, type DropdownChangeEvent } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { DocumentosLegaisAssociadosSeplag } from "../../componentes/DocumentosLegaisAssociados";
import { useDocumentosLegais, useDocumentosLegaisAssociaveis } from "../documentosLegais/documentosLegaisStore";
import { SituacaoVigenciaSeplag, calcularStatusOperacionalVigenciaSeplag, validarSituacaoVigenciaSeplag, type SituacaoVigenciaValueSeplag } from "../../componentes/SituacaoVigencia";

const BASE_PATH = `${CONTROLE_VAGAS_BASE_PATH}/quadro-autorizado`;

type VigenciaQuadroForm = SituacaoVigenciaValueSeplag;

const situacaoClass: Record<SituacaoQuadro, string> = {
  Vigente: "is-active", "Vigência futura": "is-future", Encerrada: "is-closed",
};

const saldo = (item: QuadroAutorizadoRow) => item.autorizadas - item.ocupadas - item.comprometidas - item.bloqueadas;

type CampoOrdenacaoQuadro = "quadro" | "cargo" | "orgao" | "autorizadas" | "ocupadas" | "disponiveis" | "vigencia" | "situacao";
type OrdenacaoQuadro = { campo: CampoOrdenacaoQuadro; direcao: "asc" | "desc" } | null;

const orgaosDoQuadro = (item: QuadroAutorizadoRow) =>
  item.orgaosDefinidosLei?.length ? [...item.orgaosDefinidosLei] : item.orgao ? [item.orgao] : [];

const resumoOrgaos = (item: QuadroAutorizadoRow) => {
  if (item.formaDestinacaoLegal === "DISTRIBUICAO_POSTERIOR") return "Pendente de ato de distribuição";
  const orgaos = orgaosDoQuadro(item).filter((orgao) => orgao !== "ESTADO DE MATO GROSSO");
  if (!orgaos.length) return "Pendente de ato de distribuição";
  if (orgaos.length === 1) return orgaos[0];
  return `${orgaos.length} órgãos definidos pela lei`;
};

export function QuadroAutorizadoContent() {
  const { quadros } = useControleVagasStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isNovo = location.pathname.endsWith("/novo");
  const isEditar = location.pathname.endsWith("/editar");
  const isNovaVersao = location.pathname.endsWith("/nova-versao");
  const isDetalhe = Boolean(id) && !isEditar && !isNovaVersao;

  if (isNovaVersao) {
    const registro = id ? quadros.find((item) => item.id === Number(id)) : undefined;
    return registro?.situacao === "Vigente"
      ? <QuadroAutorizadoNovaVersao registro={registro} onBack={() => navigate(BASE_PATH)} />
      : <QuadroAutorizadoLista />;
  }

  if (isNovo || isEditar) {
    const registro = id ? quadros.find((item) => item.id === Number(id)) : undefined;
    if (isEditar && registro?.situacao !== "Vigência futura") return <QuadroAutorizadoLista />;
    return <QuadroAutorizadoForm registro={registro} novaVersao={false} onBack={() => navigate(BASE_PATH)} />;
  }
  if (isDetalhe) {
    const registro = quadros.find((item) => item.id === Number(id)) ?? quadros[0];
    return <QuadroAutorizadoDetalhe registro={registro} onBack={() => navigate(BASE_PATH)} />;
  }

  return <QuadroAutorizadoLista />;
}

function QuadroAutorizadoLista() {
  const { quadros } = useControleVagasStore();
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [orgao, setOrgao] = useState("");
  const [tipo, setTipo] = useState("");
  const [situacao, setSituacao] = useState("");
  const [dataReferencia, setDataReferencia] = useState("2026-07-15");
  const [visualizado, setVisualizado] = useState<QuadroAutorizadoRow | null>(null);
  const [ordenacao, setOrdenacao] = useState<OrdenacaoQuadro>(null);

  const alternarOrdenacao = (campo: CampoOrdenacaoQuadro) => {
    setOrdenacao((atual) => atual?.campo === campo
      ? { campo, direcao: atual.direcao === "asc" ? "desc" : "asc" }
      : { campo, direcao: "asc" });
  };

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    const resultado = quadros.filter((item) => (!termo || `${item.codigo} ${item.cargo} ${item.carreira} ${item.perfilProfissional} ${orgaosDoQuadro(item).join(" ")}`.toLocaleLowerCase("pt-BR").includes(termo)) && (!orgao || orgaosDoQuadro(item).includes(orgao)) && (!tipo || item.tipoQuadro === tipo) && (!situacao || item.situacao === situacao));
    if (!ordenacao) return [...resultado].sort((a, b) => b.id - a.id);
    const valor = (item: QuadroAutorizadoRow): string | number => {
      switch (ordenacao.campo) {
        case "quadro": return item.codigo;
        case "cargo": return item.cargo;
        case "orgao": return resumoOrgaos(item);
        case "autorizadas": return item.autorizadas;
        case "ocupadas": return item.ocupadas;
        case "disponiveis": return Math.max(0, saldo(item));
        case "vigencia": return item.dataAtivacao || item.inicioVigencia || "";
        case "situacao": return item.situacao;
      }
    };
    return [...resultado].sort((a, b) => {
      const valorA = valor(a);
      const valorB = valor(b);
      const comparacao = typeof valorA === "number" && typeof valorB === "number"
        ? valorA - valorB
        : String(valorA).localeCompare(String(valorB), "pt-BR", { numeric: true, sensitivity: "base" });
      return ordenacao.direcao === "asc" ? comparacao : -comparacao;
    });
  }, [busca, orgao, tipo, situacao, quadros, ordenacao]);

  const totais = filtrados.reduce((acc, item) => ({ autorizadas: acc.autorizadas + item.autorizadas, ocupadas: acc.ocupadas + item.ocupadas, comprometidas: acc.comprometidas + item.comprometidas, disponiveis: acc.disponiveis + Math.max(0, saldo(item)) }), { autorizadas: 0, ocupadas: 0, comprometidas: 0, disponiveis: 0 });

  const limpar = () => { setBusca(""); setOrgao(""); setTipo(""); setSituacao(""); setDataReferencia("2026-07-15"); };
  const excluirQuadroFuturo = (item: QuadroAutorizadoRow) => {
    if (item.situacao !== "Vigência futura" || !window.confirm(`Excluir ${item.codigo}? Esta autorização ainda não entrou em vigência.`)) return;
    controleVagasStore.set("quadros", (itens) => itens.filter((quadro) => quadro.id !== item.id));
    controleVagasStore.set("vagas", (itens) => itens.filter((vaga) => vaga.quadroAutorizadoId !== item.id));
    setVisualizado(null);
  };

  return <div className="prototype-quadro-page">
    <header className="prototype-quadro-header"><div><h1>Quadro Autorizado</h1><p>Quantitativos autorizados por cargo, vínculo e órgão.</p></div><button className="prototype-quadro-primary" onClick={() => navigate(`${BASE_PATH}/novo`)}><i className="pi pi-plus" /> Nova autorização</button></header>
    
    <section className="prototype-quadro-kpis"><article><i className="pi pi-file-check" /><div><span>Autorizadas</span><strong>{totais.autorizadas.toLocaleString("pt-BR")}</strong></div></article><article><i className="pi pi-users" /><div><span>Ocupadas</span><strong>{totais.ocupadas.toLocaleString("pt-BR")}</strong></div></article><article><i className="pi pi-clock" /><div><span>Comprometidas</span><strong>{totais.comprometidas.toLocaleString("pt-BR")}</strong></div></article><article className="is-available"><i className="pi pi-check-circle" /><div><span>Disponíveis</span><strong>{totais.disponiveis.toLocaleString("pt-BR")}</strong></div></article></section>
    <section className="prototype-quadro-card">
      <div className="prototype-quadro-filters"><label className="is-wide"><span>Código, cargo ou carreira</span><div><i className="pi pi-search" /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Pesquisar no quadro" /></div></label><label><span>Órgão</span><select value={orgao} onChange={(e) => setOrgao(e.target.value)}><option value="">Todos</option>{[...new Set(quadros.flatMap(orgaosDoQuadro))].map((i) => <option key={i}>{i}</option>)}</select></label><label><span>Tipo de quadro</span><select value={tipo} onChange={(e) => setTipo(e.target.value)}><option value="">Todos</option>{[...new Set(quadros.map((i) => i.tipoQuadro))].map((i) => <option key={i}>{i}</option>)}</select></label><label><span>Situação</span><select value={situacao} onChange={(e) => setSituacao(e.target.value)}><option value="">Todas</option>{[...new Set(quadros.map((i) => i.situacao))].map((i) => <option key={i}>{i}</option>)}</select></label><label><span>Data de referência</span><input type="date" value={dataReferencia} onChange={(e) => setDataReferencia(e.target.value)} /></label><button onClick={limpar}><i className="pi pi-filter-slash" /> Limpar</button></div>
      <div className="prototype-quadro-table"><table><thead><tr>{([ ["quadro", "Quadro", false], ["cargo", "Cargo/Função", false], ["orgao", "Órgão", false], ["autorizadas", "Autorizadas", true], ["ocupadas", "Ocupadas", true], ["disponiveis", "Disponíveis", true], ["vigencia", "Vigência", false], ["situacao", "Situação", false] ] as const).map(([campo, rotulo, numerico]) => <th key={campo} className={numerico ? "is-number" : undefined}><button type="button" className="prototype-quadro-sort" onClick={() => alternarOrdenacao(campo)} aria-label={`Ordenar por ${rotulo}`}><span>{rotulo}</span><i className={`pi ${ordenacao?.campo === campo ? ordenacao.direcao === "asc" ? "pi-sort-up-fill" : "pi-sort-down-fill" : "pi-sort-alt"}`} /></button></th>)}<th>Ações</th></tr></thead><tbody>{filtrados.map((item) => <tr key={item.id}><td><button className="prototype-quadro-link" onClick={() => setVisualizado(item)}>{item.codigo}</button><small>Versão {item.versao}</small></td><td><strong>{item.cargo}</strong><small>{item.perfilProfissional || item.vinculo}</small></td><td>{resumoOrgaos(item)}{orgaosDoQuadro(item).length > 1 && <small>{orgaosDoQuadro(item).join(" • ")}</small>}</td><td className="is-number">{item.autorizadas}</td><td className="is-number">{item.ocupadas}</td><td className={`is-number ${saldo(item) <= 0 ? "is-danger" : "is-positive"}`}><strong>{Math.max(0, saldo(item))}</strong></td><td>{item.inicioVigencia || "Não informada"}<small>{item.fimVigencia ? `até ${item.fimVigencia}` : "sem término"}</small></td><td><span className={`prototype-quadro-status ${situacaoClass[item.situacao]}`}>{item.situacao}</span></td><td><div className="prototype-quadro-actions"><button title="Visualizar" onClick={() => setVisualizado(item)}><i className="pi pi-eye" /></button><button title={item.situacao === "Vigência futura" ? "Editar antes da vigência" : "Edição indisponível após a vigência"} disabled={item.situacao !== "Vigência futura"} onClick={() => navigate(`${BASE_PATH}/${item.id}/editar`)}><i className="pi pi-pencil" /></button>{item.situacao === "Vigência futura" && <button title="Excluir antes da vigência" onClick={() => excluirQuadroFuturo(item)}><i className="pi pi-trash" /></button>}{item.situacao === "Vigente" && <button title="Distribuir vagas deste quadro" onClick={() => navigate(`${CONTROLE_VAGAS_BASE_PATH}/distribuicao?quadro=${item.id}`)}><i className="pi pi-sitemap" /></button>}{item.situacao === "Vigente" && <button title="Criar nova versão" onClick={() => navigate(`${BASE_PATH}/${item.id}/nova-versao`)}><i className="pi pi-plus" /></button>}</div></td></tr>)}</tbody></table></div>
      <footer className="prototype-quadro-table-footer"><span>{filtrados.length} registros encontrados</span><span>Data de referência: {dataReferencia.split("-").reverse().join("/")}</span></footer>
    </section>
      {visualizado && <QuadroAutorizadoModal registro={visualizado} onClose={() => setVisualizado(null)} onNovaVersao={() => navigate(`${BASE_PATH}/${visualizado.id}/nova-versao`)} />}
  </div>;
}

function QuadroAutorizadoModal({ registro, onClose, onNovaVersao }: { registro: QuadroAutorizadoRow; onClose: () => void; onNovaVersao: () => void }) {
  const documentosLegaisDisponiveis = useDocumentosLegais();
  const normas = documentosLegaisDisponiveis.filter((documento) => registro.documentosLegaisIds?.includes(documento.id));
  const quantitativos = registro.quantitativosLegaisPorOrgao ?? [];
  return <div className="prototype-quadro-modal-backdrop" onMouseDown={onClose} role="presentation"><section className="prototype-quadro-modal" role="dialog" aria-modal="true" aria-labelledby="quadro-modal-titulo" onMouseDown={(event) => event.stopPropagation()}><header><div><span>Quadro autorizado</span><h2 id="quadro-modal-titulo">{registro.codigo}</h2><p>{registro.cargo} • Versão {registro.versao}</p></div><button type="button" title="Fechar" aria-label="Fechar" onClick={onClose}><i className="pi pi-times" /></button></header><div className="prototype-quadro-modal-status"><span className={`prototype-quadro-status ${situacaoClass[registro.situacao]}`}>{registro.situacao}</span><strong>{registro.autorizadas.toLocaleString("pt-BR")} vagas autorizadas</strong></div><div className="prototype-quadro-modal-body"><section><h3>Identificação</h3><dl><div><dt>Tipo de quadro</dt><dd>{registro.tipoQuadro}</dd></div><div><dt>Tipo de vínculo</dt><dd>{registro.vinculo}</dd></div><div><dt>Regime jurídico</dt><dd>{registro.regime || "Não informado"}</dd></div><div><dt>Carreira</dt><dd>{registro.carreira || "Não informada"}</dd></div><div><dt>Cargo</dt><dd>{registro.cargo}</dd></div><div><dt>Perfil profissional</dt><dd>{registro.perfilProfissional || "Não se aplica"}</dd></div></dl></section><section><h3>Abrangência e quantitativo</h3><dl><div><dt>Destinação legal</dt><dd>{resumoOrgaos(registro)}</dd></div><div><dt>Abrangência</dt><dd>{registro.abrangencia}</dd></div><div><dt>Autorizadas</dt><dd>{registro.autorizadas}</dd></div><div><dt>Ocupadas</dt><dd>{registro.ocupadas}</dd></div><div><dt>Comprometidas</dt><dd>{registro.comprometidas}</dd></div><div><dt>Disponíveis</dt><dd>{Math.max(0, saldo(registro))}</dd></div></dl>{quantitativos.length > 0 && <table><thead><tr><th>Órgão definido pela lei</th><th>Quantidade</th></tr></thead><tbody>{quantitativos.map((item) => <tr key={item.orgao}><td>{item.orgao}</td><td>{item.quantidade}</td></tr>)}</tbody></table>}{!quantitativos.length && orgaosDoQuadro(registro).length > 1 && <p className="prototype-quadro-modal-orgs">{orgaosDoQuadro(registro).join(" • ")}</p>}</section><section><h3>Base legal</h3>{normas.length ? <ul>{normas.map((norma) => <li key={norma.id}><strong>{norma.titulo}</strong><span>{norma.descricao}</span></li>)}</ul> : <p>{registro.ato || "Não informada"}</p>}<dl><div><dt>Processo administrativo</dt><dd>{registro.processo || "Não informado"}</dd></div></dl></section><section><h3>Vigência e controle</h3><dl><div><dt>Situação da vigência</dt><dd>{registro.situacaoVigencia ?? registro.situacao}</dd></div><div><dt>Data de início</dt><dd>{registro.dataAtivacao || registro.inicioVigencia || "Não informada"}</dd></div><div><dt>Encerramento</dt><dd>{registro.dataEncerramento || "Sem encerramento"}</dd></div><div><dt>Extinção</dt><dd>{registro.dataExtincao || "Sem extinção"}</dd></div><div><dt>Última atualização</dt><dd>{registro.atualizadoEm}</dd></div><div><dt>Versão</dt><dd>{registro.versao}</dd></div></dl></section></div><footer><button type="button" onClick={onClose}>Fechar</button>{registro.situacao === "Vigente" && <button type="button" className="is-primary" onClick={onNovaVersao}><i className="pi pi-plus" /> Criar nova versão</button>}</footer></section></div>;
}
function QuadroAutorizadoForm({ registro, novaVersao, onBack }: { registro?: QuadroAutorizadoRow; novaVersao: boolean; onBack: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const documentosLegaisDisponiveis = useDocumentosLegaisAssociaveis();
  const { control: vigenciaControl, setValue: setVigenciaValue, getValues: getVigenciaValues } = useForm<VigenciaQuadroForm>({
    defaultValues: {
      situacao: novaVersao ? "ATIVO" : registro?.situacaoVigencia ?? "ATIVO",
      dataAtivacao: novaVersao ? "" : registro?.dataAtivacao ?? registro?.inicioVigencia ?? "",
      dataEncerramento: novaVersao ? undefined : registro?.dataEncerramento,
      motivoEncerramento: novaVersao ? undefined : registro?.motivoEncerramento,
      dataExtincao: novaVersao ? undefined : registro?.dataExtincao,
      motivoExtincao: novaVersao ? undefined : registro?.motivoExtincao,
    },
  });
  const [salvo, setSalvo] = useState(false);
  const [erros, setErros] = useState<string[]>([]);
  const [documentosLegaisIds, setDocumentosLegaisIds] = useState<string[]>(registro?.documentosLegaisIds ? [...registro.documentosLegaisIds] : []);
  const documentoCriadoId = searchParams.get("documentoLegalId");
  useEffect(() => {
    if (!documentoCriadoId) return;
    setDocumentosLegaisIds((current) => current.includes(documentoCriadoId) ? current : [...current, documentoCriadoId]);
    navigate(location.pathname, { replace: true });
  }, [documentoCriadoId, location.pathname, navigate]);

  const novoDocumentoUrl = `/prototipos/sigep/documentos-legais/novo?returnTo=${encodeURIComponent(location.pathname)}`;


  const [form, setForm] = useState({ tipoQuadro: registro?.tipoQuadro ?? "", vinculo: registro?.vinculo ?? "", regime: registro?.regime ?? "", carreira: registro?.carreira ?? "", cargo: registro?.cargo ?? "", perfilProfissional: registro?.perfilProfissional ?? "", orgao: registro?.orgao ?? "", abrangencia: registro?.abrangencia ?? "Órgão específico", quantidade: String(registro?.autorizadas ?? ""), inicioVigencia: "", fimVigencia: registro?.fimVigencia ?? "", tipoAto: "", numeroAto: registro?.ato ?? "", dataAto: "", processo: registro?.processo ?? "", fundamentacao: "", motivoAlteracao: "" });
  const formaInicial = registro?.formaDestinacaoLegal ?? (registro?.abrangencia === "Quadro geral" ? "DISTRIBUICAO_POSTERIOR" : "DEFINIDA_NA_LEI");
  const [formaDestinacao, setFormaDestinacao] = useState<"DISTRIBUICAO_POSTERIOR" | "DEFINIDA_NA_LEI">(formaInicial);
  const [orgaosDefinidos, setOrgaosDefinidos] = useState<string[]>(registro?.orgaosDefinidosLei ? [...registro.orgaosDefinidosLei] : registro?.orgao && registro.orgao !== "ESTADO DE MATO GROSSO" ? [registro.orgao] : []);
  const [defineQuantidadePorOrgao, setDefineQuantidadePorOrgao] = useState(Boolean(registro?.quantitativosLegaisPorOrgao?.length));
  const [quantidadesPorOrgao, setQuantidadesPorOrgao] = useState<Record<string, string>>(() => Object.fromEntries((registro?.quantitativosLegaisPorOrgao ?? []).map((item) => [item.orgao, String(item.quantidade)])));
  const set = (campo: keyof typeof form, valor: string) => setForm((atual) => ({ ...atual, [campo]: valor }));
  const totalPorOrgao = orgaosDefinidos.reduce((total, orgao) => total + Number(quantidadesPorOrgao[orgao] || 0), 0);
  const selecionarAbrangencia = (modo: "SEM_ORGAOS" | "ORGAOS_SEM_QUANTITATIVO" | "ORGAOS_COM_QUANTITATIVO") => {
    if (modo === "SEM_ORGAOS") { setFormaDestinacao("DISTRIBUICAO_POSTERIOR"); setDefineQuantidadePorOrgao(false); setOrgaosDefinidos([]); setQuantidadesPorOrgao({}); }
    else { setFormaDestinacao("DEFINIDA_NA_LEI"); setDefineQuantidadePorOrgao(modo === "ORGAOS_COM_QUANTITATIVO"); if (modo === "ORGAOS_SEM_QUANTITATIVO") setQuantidadesPorOrgao({}); }
  };
  const alterarOrgaosSelecionados = (orgaos: string[]) => {
    setOrgaosDefinidos(orgaos);
    setQuantidadesPorOrgao((atuais) => Object.fromEntries(orgaos.map((orgao) => [orgao, atuais[orgao] ?? ""])));
  };  const modoAbrangencia = formaDestinacao === "DISTRIBUICAO_POSTERIOR" ? "SEM_ORGAOS" : defineQuantidadePorOrgao ? "ORGAOS_COM_QUANTITATIVO" : "ORGAOS_SEM_QUANTITATIVO";
  const quantidadeAutorizada = Number(form.quantidade || 0);
  const saldoAlocacaoLegal = Math.max(0, quantidadeAutorizada - totalPorOrgao);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const vigencia = getVigenciaValues();
    const errosVigencia = validarSituacaoVigenciaSeplag(vigencia);
    const novosErros = [!form.tipoQuadro && "Informe o tipo de quadro.", !form.vinculo && "Informe o tipo de vínculo.", !form.regime && "Informe o regime jurídico.", !form.carreira && "Informe a carreira.", !form.cargo && "Informe o cargo.", !documentosLegaisIds.length && "Vincule ao menos uma norma à autorização.", ...errosVigencia, formaDestinacao === "DEFINIDA_NA_LEI" && !orgaosDefinidos.length && "Selecione ao menos um órgão definido pela lei.", (!form.quantidade || Number(form.quantidade) <= 0) && "Informe uma quantidade maior que zero.", formaDestinacao === "DEFINIDA_NA_LEI" && defineQuantidadePorOrgao && totalPorOrgao !== Number(form.quantidade) && "A soma das quantidades por órgão deve ser igual à quantidade autorizada.", formaDestinacao === "DEFINIDA_NA_LEI" && defineQuantidadePorOrgao && orgaosDefinidos.some((orgao) => Number(quantidadesPorOrgao[orgao] || 0) <= 0) && "Informe uma quantidade maior que zero para cada órgão.", novaVersao && !form.motivoAlteracao && "Informe o motivo da nova versão."].filter(Boolean) as string[];
    setErros(novosErros);if(novosErros.length)return;
    const atual=controleVagasStore.getState();const novoId=novaVersao||!registro?Math.max(0,...atual.quadros.map((item)=>item.id))+1:registro.id;const codigo=novaVersao?registro!.codigo:registro?.codigo??`QA-${String(novoId).padStart(4,"0")}`;const statusVigencia=calcularStatusOperacionalVigenciaSeplag(vigencia);const situacao=statusVigencia.startsWith("AGENDADO")?"Vigência futura" as const:statusVigencia==="ATIVO"?"Vigente" as const:"Encerrada" as const;const normasSelecionadas=documentosLegaisDisponiveis.filter((item)=>documentosLegaisIds.includes(item.id));
    const orgaoCompatibilidade=formaDestinacao==="DEFINIDA_NA_LEI"&&orgaosDefinidos.length===1?orgaosDefinidos[0]:"ESTADO DE MATO GROSSO";const quadro:QuadroAutorizadoRow={id:novoId,codigo,tipoQuadro:form.tipoQuadro as QuadroAutorizadoRow["tipoQuadro"],vinculo:form.vinculo,regime:form.regime,carreira:form.carreira,cargo:form.cargo,perfilProfissional:form.perfilProfissional,orgao:orgaoCompatibilidade,abrangencia:formaDestinacao==="DISTRIBUICAO_POSTERIOR"?"Distribuição posterior pelo Estado":"Destinação definida na lei",formaDestinacaoLegal:formaDestinacao,orgaosDefinidosLei:formaDestinacao==="DEFINIDA_NA_LEI"?orgaosDefinidos:[],quantitativosLegaisPorOrgao:formaDestinacao==="DEFINIDA_NA_LEI"&&defineQuantidadePorOrgao?orgaosDefinidos.map((orgao)=>({orgao,quantidade:Number(quantidadesPorOrgao[orgao])})):[],autorizadas:Number(form.quantidade),ocupadas:novaVersao?registro?.ocupadas??0:0,comprometidas:novaVersao?registro?.comprometidas??0:0,bloqueadas:novaVersao?registro?.bloqueadas??0:0,inicioVigencia:vigencia.dataAtivacao??"",fimVigencia:vigencia.dataExtincao??vigencia.dataEncerramento??"",ato:normasSelecionadas.map((item)=>item.titulo).join("; "),processo:form.processo,documentosLegaisIds,situacaoVigencia:vigencia.situacao,dataAtivacao:vigencia.dataAtivacao,dataEncerramento:vigencia.dataEncerramento,motivoEncerramento:vigencia.motivoEncerramento,dataExtincao:vigencia.dataExtincao,motivoExtincao:vigencia.motivoExtincao,situacao,versao:novaVersao?(registro?.versao??0)+1:registro?.versao??1,atualizadoEm:"17/07/2026"};
    controleVagasStore.set("quadros",(itens)=>novaVersao?[...itens.map((item)=>item.id===registro?.id&&situacao==="Vigente"?{...item,situacao:"Encerrada" as const}:item),quadro]:!registro?[...itens,quadro]:itens.map((item)=>item.id===registro.id?quadro:item));
    if(!novaVersao&&situacao==="Vigente"&&!atual.vagas.some((vaga)=>vaga.quadroAutorizadoId===quadro.id))controleVagasStore.set("vagas",(itens)=>[...itens,...gerarVagasDoQuadro(quadro)]);
    setSalvo(true);window.setTimeout(()=>navigate(BASE_PATH),700);
  };
  const titulo = novaVersao ? "Nova versão do quadro" : registro ? "Editar autorização" : "Nova autorização";
  return <div className="prototype-quadro-page"><header className="prototype-quadro-header"><div><button className="prototype-quadro-back" onClick={onBack}><i className="pi pi-arrow-left" /> Quadro Autorizado</button><h1>{titulo}</h1><p>{novaVersao ? `${registro?.codigo} • versão atual ${registro?.versao}` : "Preencha os dados que fundamentam o quantitativo autorizado."}</p></div></header>
    {salvo && <div className="prototype-quadro-success"><i className="pi pi-check-circle" /> Registro salvo com sucesso. Retornando à consulta...</div>}{erros.length > 0 && <div className="prototype-quadro-errors"><strong>Revise os campos obrigatórios:</strong><ul>{erros.map((erro) => <li key={erro}>{erro}</li>)}</ul></div>}
    <form onSubmit={submit} className="prototype-quadro-form">
      <section><header><i className="pi pi-link" /><div><h2>{novaVersao ? "Nova base legal vinculada" : "Base legal vinculada"}</h2><p>{novaVersao ? "Vincule a norma que fundamenta esta nova versão." : "Selecione uma norma cadastrada ou use o atalho para cadastrar uma nova."}</p></div></header><div className="prototype-quadro-library-section"><DocumentosLegaisAssociadosSeplag label="Documentos legais associados" required options={documentosLegaisDisponiveis} value={documentosLegaisIds} onChange={setDocumentosLegaisIds} onNovoCadastro={() => navigate(novoDocumentoUrl)} onVisualizar={(documento) => navigate(`/prototipos/sigep/documentos-legais/${documento.id}`)} expandirAoAbrir /></div></section>
    <section><header><i className="pi pi-briefcase" /><div><h2>Identificação do quadro</h2><p>Combinação utilizada para controlar o quantitativo.</p></div></header><div className="prototype-quadro-fields"><Field label="Tipo de quadro *"><DropdownPesquisa value={form.tipoQuadro} onChange={(valor) => set("tipoQuadro", valor)} options={["Efetivo", "Comissionado"]} /></Field><Field label="Tipo de vínculo *"><DropdownPesquisa value={form.vinculo} onChange={(valor) => set("vinculo", valor)} options={["Servidor efetivo", "Exclusivamente comissionado"]} /></Field><Field label="Regime jurídico *"><DropdownPesquisa value={form.regime} onChange={(valor) => set("regime", valor)} options={["Estatutário", "Administrativo", "Celetista"]} /></Field><Field label="Carreira *"><DropdownPesquisa value={form.carreira} onChange={(valor) => set("carreira", valor)} options={carreirasBaseTemporaria.map((item) => ({ label: item.situacaoLegal === "EM_EXTINCAO" ? item.nome + " — Em extinção" : item.nome, value: item.nome }))} /></Field><Field label="Cargo *" wide><DropdownPesquisa value={form.cargo} onChange={(valor) => set("cargo", valor)} options={cargosBaseTemporaria.map((item) => ({ label: item.situacaoLegal === "EM_EXTINCAO" ? item.nome + " — Em extinção" : item.nome, value: item.nome }))} /></Field><Field label="Perfil profissional"><DropdownPesquisa value={form.perfilProfissional} onChange={(valor) => set("perfilProfissional", valor)} options={perfisProfissionaisBaseTemporaria.map((item) => item.nome)} placeholder="Selecione um perfil" /></Field></div></section>      <section><header><i className="pi pi-building" /><div><h2>{novaVersao ? "Nova configuração legal" : "Abrangência e quantitativo"}</h2><p>{novaVersao ? "Informe somente o quantitativo e a alocação que passarão a valer." : "Defina o total autorizado e como a legislação alocou as vagas."}</p></div></header>
        <div className="prototype-quadro-scope">
          <div className="prototype-quadro-scope-summary">
            <Field label={novaVersao ? "Nova quantidade autorizada *" : "Quantidade autorizada *"}><input type="number" min="1" value={form.quantidade} onChange={(event) => set("quantidade", event.target.value)} /></Field>
            <article><span>Alocado pela lei</span><strong>{totalPorOrgao.toLocaleString("pt-BR")} <small>vagas</small></strong></article>
            <article><span>Saldo sem alocação legal</span><div><strong className={saldoAlocacaoLegal === 0 && quantidadeAutorizada > 0 ? "is-complete" : ""}>{saldoAlocacaoLegal.toLocaleString("pt-BR")} <small>vagas</small></strong>{modoAbrangencia === "ORGAOS_COM_QUANTITATIVO" && saldoAlocacaoLegal === 0 && quantidadeAutorizada > 0 && <em><i className="pi pi-check-circle" /> Alocação concluída</em>}</div></article>
          </div>
          <div className="prototype-quadro-scope-question"><span>Como a lei definiu a alocação das vagas? *</span>
            <label className={modoAbrangencia === "SEM_ORGAOS" ? "is-selected" : ""}><input type="radio" name="modoAbrangencia" checked={modoAbrangencia === "SEM_ORGAOS"} onChange={() => selecionarAbrangencia("SEM_ORGAOS")} /><i className="pi pi-file" /><span><strong>Não indicou órgãos específicos</strong><small>As vagas poderão ser distribuídas posteriormente pelo Estado.</small></span></label>
            <label className={modoAbrangencia === "ORGAOS_SEM_QUANTITATIVO" ? "is-selected" : ""}><input type="radio" name="modoAbrangencia" checked={modoAbrangencia === "ORGAOS_SEM_QUANTITATIVO"} onChange={() => selecionarAbrangencia("ORGAOS_SEM_QUANTITATIVO")} /><i className="pi pi-users" /><span><strong>Indicou os órgãos, mas não definiu quantitativos</strong><small>A lei restringiu os órgãos que poderão receber as vagas.</small></span></label>
            <label className={modoAbrangencia === "ORGAOS_COM_QUANTITATIVO" ? "is-selected" : ""}><input type="radio" name="modoAbrangencia" checked={modoAbrangencia === "ORGAOS_COM_QUANTITATIVO"} onChange={() => selecionarAbrangencia("ORGAOS_COM_QUANTITATIVO")} /><i className="pi pi-building" /><span><strong>Indicou os órgãos e o quantitativo de cada um</strong><small>A lei definiu os órgãos e a quantidade destinada a cada um.</small></span></label>
          </div>
          {modoAbrangencia === "SEM_ORGAOS" && <div className="prototype-quadro-destination-info"><i className="pi pi-info-circle" /><span>As vagas serão criadas como <strong>pendentes de ato de distribuição</strong>. A destinação será registrada posteriormente no menu Distribuição.</span></div>}
          {modoAbrangencia !== "SEM_ORGAOS" && <div className="prototype-quadro-legal-allocation"><h3>{modoAbrangencia === "ORGAOS_COM_QUANTITATIVO" ? "Alocação definida pela lei" : "Órgãos permitidos pela lei"}</h3>
            <MultiSelect value={orgaosDefinidos} options={orgaosBaseTemporaria.map((item) => ({ label: item.nome, value: item.nome }))} optionLabel="label" optionValue="value" filter filterPlaceholder="Pesquisar órgão" placeholder="Selecione um ou mais órgãos" display="chip" showClear className="prototype-quadro-orgao-multiselect" onChange={(event) => alterarOrgaosSelecionados(event.value ?? [])} />
            {orgaosDefinidos.length === 0 ? <div className="prototype-quadro-empty-orgao"><i className="pi pi-building" /> Nenhum órgão adicionado.</div> : <table><thead><tr><th>Órgão</th>{modoAbrangencia === "ORGAOS_COM_QUANTITATIVO" && <><th>Quantidade de vagas</th><th>%</th></>}<th>Ações</th></tr></thead><tbody>{orgaosDefinidos.map((orgao) => <tr key={orgao}><td><strong>{orgao}</strong></td>{modoAbrangencia === "ORGAOS_COM_QUANTITATIVO" && <><td><input type="number" min="1" value={quantidadesPorOrgao[orgao] ?? ""} onChange={(event) => setQuantidadesPorOrgao((atuais) => ({ ...atuais, [orgao]: event.target.value }))} aria-label={"Quantidade para " + orgao} /></td><td>{quantidadeAutorizada > 0 ? ((Number(quantidadesPorOrgao[orgao] || 0) / quantidadeAutorizada) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : "0"}%</td></>}<td><button type="button" title={"Remover " + orgao} onClick={() => alterarOrgaosSelecionados(orgaosDefinidos.filter((item) => item !== orgao))}><i className="pi pi-trash" /></button></td></tr>)}</tbody></table>}
            {modoAbrangencia === "ORGAOS_COM_QUANTITATIVO" && orgaosDefinidos.length > 0 && <div className={"prototype-quadro-allocation-total " + (totalPorOrgao === quantidadeAutorizada && quantidadeAutorizada > 0 ? "is-valid" : totalPorOrgao > quantidadeAutorizada ? "is-over" : "")}><div><strong>Total alocado</strong><span>{totalPorOrgao.toLocaleString("pt-BR")} de {quantidadeAutorizada.toLocaleString("pt-BR")} vagas</span></div><progress max={Math.max(1, quantidadeAutorizada)} value={Math.min(totalPorOrgao, Math.max(1, quantidadeAutorizada))} /><small><i className={"pi " + (totalPorOrgao === quantidadeAutorizada && quantidadeAutorizada > 0 ? "pi-check-circle" : "pi-info-circle")} /> {totalPorOrgao === quantidadeAutorizada && quantidadeAutorizada > 0 ? "O total alocado corresponde ao autorizado." : totalPorOrgao > quantidadeAutorizada ? "O total alocado ultrapassa o autorizado." : "Ainda faltam " + Math.max(0, quantidadeAutorizada - totalPorOrgao).toLocaleString("pt-BR") + " vagas para alocar."}</small></div>}
          </div>}
          {novaVersao && <div className="prototype-quadro-comparison"><span>Quantidade vigente</span><strong>{registro?.autorizadas}</strong><i className="pi pi-arrow-right" /><span>Nova quantidade</span><strong>{form.quantidade || "—"}</strong></div>}
        </div>
      </section>
      <section><header><i className="pi pi-calendar" /><div><h2>{novaVersao ? "Início da nova versão" : "Vigência"}</h2><p>{novaVersao ? "Defina quando a nova versão passará a produzir efeitos." : "Informe a situação temporal da autorização utilizando o padrão do sistema."}</p></div></header><div className="prototype-quadro-library-section"><SituacaoVigenciaSeplag control={vigenciaControl} setValue={setVigenciaValue} rotuloDataAtivacao="Data de início" cols={{ situacao: "12 12 3", dataAtivacao: "12 12 3", statusOperacional: "col-12 md:col-12 lg:col-5", dataEncerramento: "12 12 3", motivoEncerramento: "12", dataExtincao: "12 12 3", motivoExtincao: "12" }} getFormErrorMessage={() => null} /></div></section>      <footer className="prototype-quadro-form-actions"><button type="button" className="is-cancel" onClick={onBack}>Cancelar</button><button type="submit" className="is-submit"><i className="pi pi-save" /> {novaVersao ? "Criar nova versão" : "Salvar"}</button></footer>
    </form></div>;
}

type DropdownPesquisaOpcao = string | { label: string; value: string };

function DropdownPesquisa({ value, onChange, options, placeholder = "Selecione", disabled = false, showClear = true }: { value: string; onChange: (valor: string) => void; options: DropdownPesquisaOpcao[]; placeholder?: string; disabled?: boolean; showClear?: boolean }) {
  const normalizadas = options.map((opcao) => typeof opcao === "string" ? { label: opcao, value: opcao } : opcao);
  return <Dropdown value={value || null} options={normalizadas} optionLabel="label" optionValue="value" placeholder={placeholder} filter filterPlaceholder="Pesquisar" emptyFilterMessage="Nenhum resultado encontrado" emptyMessage="Nenhuma opção disponível" showClear={showClear} disabled={disabled} virtualScrollerOptions={normalizadas.length > 50 ? { itemSize: 38 } : undefined} className="prototype-quadro-dropdown" onChange={(event: DropdownChangeEvent) => onChange(String(event.value ?? ""))} />;
}
function Field({ label, children, wide, full }: { label: string; children: React.ReactNode; wide?: boolean; full?: boolean }) { return <label className={full ? "is-full" : wide ? "is-wide" : ""}><span>{label}</span>{children}</label>; }

function QuadroAutorizadoNovaVersao({ registro, onBack }: { registro: QuadroAutorizadoRow; onBack: () => void }) {
  return <div className="prototype-quadro-page">
    <header className="prototype-quadro-header"><div><button className="prototype-quadro-back" onClick={onBack}><i className="pi pi-arrow-left" /> Quadro Autorizado</button><h1>Nova versão do quadro</h1><p>{registro.codigo} • {registro.cargo} • versão vigente {registro.versao}</p></div><span className="prototype-quadro-form-state">Evolução legal</span></header>
    <div className="prototype-quadro-info"><i className="pi pi-info-circle" /><span>A versão vigente será preservada. Selecione a alteração legal e simule seu impacto antes de registrar a nova versão.</span></div>
    <QuadroLegalOperacoes registro={registro} onSaved={onBack} />
  </div>;
}
function QuadroAutorizadoDetalhe({ registro, onBack }: { registro: QuadroAutorizadoRow; onBack: () => void }) {
  const navigate = useNavigate(); const situacao = registro.situacao; const disponivel = Math.max(0, saldo(registro));
  return <div className="prototype-quadro-page"><header className="prototype-quadro-header"><div><button className="prototype-quadro-back" onClick={onBack}><i className="pi pi-arrow-left" /> Quadro Autorizado</button><div className="prototype-quadro-title-line"><h1>{registro.codigo}</h1><span className={`prototype-quadro-status ${situacaoClass[situacao]}`}>{situacao}</span></div><p>{registro.cargo} • {resumoOrgaos(registro)} • Versão {registro.versao}</p></div><div className="prototype-quadro-header-actions">{situacao === "Vigência futura" && <button onClick={() => navigate(`${BASE_PATH}/${registro.id}/editar`)}><i className="pi pi-pencil" /> Editar antes da vigência</button>}{situacao === "Vigente" && <button className="prototype-quadro-primary" onClick={() => navigate(`${BASE_PATH}/${registro.id}/nova-versao`)}><i className="pi pi-plus" /> Nova versão</button>}</div></header>
    <section className="prototype-quadro-detail-kpis"><article><span>Autorizadas</span><strong>{registro.autorizadas}</strong></article><article><span>Ocupadas <small>simulado</small></span><strong>{registro.ocupadas}</strong></article><article><span>Comprometidas <small>simulado</small></span><strong>{registro.comprometidas}</strong></article><article className="is-available"><span>Disponíveis <small>simulado</small></span><strong>{disponivel}</strong></article></section>
    <div className="prototype-quadro-detail-grid"><section className="prototype-quadro-detail-card"><header><h2>Identificação e abrangência</h2></header><dl><div><dt>Tipo de quadro</dt><dd>{registro.tipoQuadro}</dd></div><div><dt>Tipo de vínculo</dt><dd>{registro.vinculo}</dd></div><div><dt>Regime jurídico</dt><dd>{registro.regime}</dd></div><div><dt>Carreira</dt><dd>{registro.carreira}</dd></div><div><dt>Cargo</dt><dd>{registro.cargo}</dd></div><div><dt>Perfil profissional</dt><dd>{registro.perfilProfissional || "Não se aplica"}</dd></div><div><dt>Destinação</dt><dd>{resumoOrgaos(registro)}</dd></div><div><dt>Abrangência</dt><dd>{registro.abrangencia}</dd></div>{orgaosDoQuadro(registro).length > 1 && <div className="is-full"><dt>Órgãos definidos pela lei</dt><dd>{orgaosDoQuadro(registro).join(" • ")}</dd></div>}</dl></section><section className="prototype-quadro-detail-card"><header><h2>Vigência e fundamentação</h2></header><dl><div><dt>Início da vigência</dt><dd>{registro.inicioVigencia || "Não informado"}</dd></div><div><dt>Fim da vigência</dt><dd>{registro.fimVigencia || "Sem término"}</dd></div><div className="is-full"><dt>Ato autorizativo</dt><dd>{registro.ato || "Ainda não informado"}</dd></div><div className="is-full"><dt>Processo administrativo</dt><dd>{registro.processo}</dd></div><div><dt>Versão</dt><dd>{registro.versao}</dd></div><div><dt>Última atualização</dt><dd>{registro.atualizadoEm}</dd></div></dl></section></div>
    <section className="prototype-quadro-detail-card prototype-quadro-history"><header><div><h2>Histórico de versões</h2><p>Alterações preservadas para rastreabilidade.</p></div></header><table><thead><tr><th>Versão</th><th>Vigência</th><th>Quantidade</th><th>Motivo</th><th>Situação</th></tr></thead><tbody><tr><td><strong>v{registro.versao}</strong></td><td>{registro.inicioVigencia || "Em definição"}</td><td>{registro.autorizadas}</td><td>{registro.versao > 1 ? "Atualização do quantitativo autorizado" : "Cadastro inicial do quadro"}</td><td><span className={`prototype-quadro-status ${situacaoClass[situacao]}`}>{situacao}</span></td></tr>{registro.versao > 1 && <tr><td>v{registro.versao - 1}</td><td>01/01/2024 a 31/12/2024</td><td>{Math.max(1, registro.autorizadas - 10)}</td><td>Versão anterior substituída</td><td><span className="prototype-quadro-status is-closed">Substituída</span></td></tr>}</tbody></table></section>
  </div>;
}
