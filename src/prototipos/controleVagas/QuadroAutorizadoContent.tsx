import { useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./quadroAutorizado.css";

type SituacaoQuadro = "Vigente" | "Rascunho" | "Aguardando aprovação" | "Vigência futura" | "Encerrada";

interface QuadroAutorizadoRow {
  id: number;
  codigo: string;
  tipoQuadro: string;
  vinculo: string;
  regime: string;
  carreira: string;
  cargo: string;
  especialidade: string;
  orgao: string;
  abrangencia: string;
  autorizadas: number;
  ocupadas: number;
  comprometidas: number;
  bloqueadas: number;
  inicioVigencia: string;
  fimVigencia: string;
  ato: string;
  processo: string;
  situacao: SituacaoQuadro;
  versao: number;
  atualizadoEm: string;
}

const BASE_PATH = "/prototipos/sigep/controle-vagas/quadro-autorizado";

const quadrosMock: QuadroAutorizadoRow[] = [
  { id: 1, codigo: "QA-0001", tipoQuadro: "Efetivo", vinculo: "Servidor efetivo", regime: "Estatutário", carreira: "Gestão Governamental", cargo: "Analista Administrativo", especialidade: "Administração", orgao: "SEPLAG", abrangencia: "Órgão específico", autorizadas: 120, ocupadas: 108, comprometidas: 4, bloqueadas: 0, inicioVigencia: "01/01/2025", fimVigencia: "", ato: "Lei Complementar nº 550/2014", processo: "SEPLAG-PRO-2025/00120", situacao: "Vigente", versao: 3, atualizadoEm: "10/07/2026" },
  { id: 2, codigo: "QA-0002", tipoQuadro: "Efetivo", vinculo: "Servidor efetivo", regime: "Estatutário", carreira: "Saúde Pública", cargo: "Técnico em Enfermagem", especialidade: "", orgao: "SES", abrangencia: "Órgão específico", autorizadas: 500, ocupadas: 472, comprometidas: 8, bloqueadas: 2, inicioVigencia: "01/03/2025", fimVigencia: "", ato: "Lei nº 12.104/2023", processo: "SES-PRO-2025/00871", situacao: "Vigente", versao: 2, atualizadoEm: "08/07/2026" },
  { id: 3, codigo: "QA-0003", tipoQuadro: "Comissionado", vinculo: "Exclusivamente comissionado", regime: "Administrativo", carreira: "Direção e Assessoramento", cargo: "DGA-6", especialidade: "", orgao: "SEFAZ", abrangencia: "Órgão específico", autorizadas: 42, ocupadas: 40, comprometidas: 1, bloqueadas: 0, inicioVigencia: "01/01/2026", fimVigencia: "", ato: "Lei Complementar nº 266/2006", processo: "SEFAZ-PRO-2026/00045", situacao: "Vigente", versao: 1, atualizadoEm: "02/07/2026" },
  { id: 4, codigo: "QA-0004", tipoQuadro: "Temporário", vinculo: "Contrato temporário", regime: "Administrativo", carreira: "Educação Básica", cargo: "Professor da Educação Básica", especialidade: "Matemática", orgao: "SEDUC", abrangencia: "Órgão específico", autorizadas: 300, ocupadas: 274, comprometidas: 12, bloqueadas: 0, inicioVigencia: "01/08/2026", fimVigencia: "31/12/2027", ato: "Autorização administrativa nº 18/2026", processo: "SEDUC-PRO-2026/03110", situacao: "Vigência futura", versao: 1, atualizadoEm: "11/07/2026" },
  { id: 5, codigo: "QA-0005", tipoQuadro: "Função", vinculo: "Função de confiança", regime: "Estatutário", carreira: "Direção e Assessoramento", cargo: "Função de Chefia", especialidade: "", orgao: "SINFRA", abrangencia: "Órgão específico", autorizadas: 28, ocupadas: 24, comprometidas: 0, bloqueadas: 1, inicioVigencia: "", fimVigencia: "", ato: "", processo: "SINFRA-PRO-2026/00420", situacao: "Rascunho", versao: 1, atualizadoEm: "12/07/2026" },
  { id: 6, codigo: "QA-0006", tipoQuadro: "Efetivo", vinculo: "Servidor efetivo", regime: "Estatutário", carreira: "Segurança Pública", cargo: "Investigador de Polícia", especialidade: "", orgao: "PJC", abrangencia: "Quadro geral", autorizadas: 850, ocupadas: 822, comprometidas: 17, bloqueadas: 0, inicioVigencia: "01/01/2026", fimVigencia: "", ato: "Lei Complementar nº 407/2010", processo: "PJC-PRO-2026/00091", situacao: "Aguardando aprovação", versao: 4, atualizadoEm: "09/07/2026" },
];

const situacaoClass: Record<SituacaoQuadro, string> = {
  Vigente: "is-active", Rascunho: "is-draft", "Aguardando aprovação": "is-waiting", "Vigência futura": "is-future", Encerrada: "is-closed",
};

const saldo = (item: QuadroAutorizadoRow) => item.autorizadas - item.ocupadas - item.comprometidas - item.bloqueadas;

export function QuadroAutorizadoContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isNovo = location.pathname.endsWith("/novo");
  const isEditar = location.pathname.endsWith("/editar");
  const isNovaVersao = location.pathname.endsWith("/nova-versao");
  const isDetalhe = Boolean(id) && !isEditar && !isNovaVersao;

  if (isNovo || isEditar || isNovaVersao) {
    const registro = id ? quadrosMock.find((item) => item.id === Number(id)) : undefined;
    return <QuadroAutorizadoForm registro={registro} novaVersao={isNovaVersao} onBack={() => navigate(BASE_PATH)} />;
  }

  if (isDetalhe) {
    const registro = quadrosMock.find((item) => item.id === Number(id)) ?? quadrosMock[0];
    return <QuadroAutorizadoDetalhe registro={registro} onBack={() => navigate(BASE_PATH)} />;
  }

  return <QuadroAutorizadoLista />;
}

function QuadroAutorizadoLista() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [orgao, setOrgao] = useState("");
  const [tipo, setTipo] = useState("");
  const [situacao, setSituacao] = useState("");
  const [dataReferencia, setDataReferencia] = useState("2026-07-15");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return quadrosMock.filter((item) => (!termo || `${item.codigo} ${item.cargo} ${item.carreira} ${item.especialidade}`.toLocaleLowerCase("pt-BR").includes(termo)) && (!orgao || item.orgao === orgao) && (!tipo || item.tipoQuadro === tipo) && (!situacao || item.situacao === situacao));
  }, [busca, orgao, tipo, situacao]);

  const totais = filtrados.reduce((acc, item) => ({ autorizadas: acc.autorizadas + item.autorizadas, ocupadas: acc.ocupadas + item.ocupadas, comprometidas: acc.comprometidas + item.comprometidas, disponiveis: acc.disponiveis + Math.max(0, saldo(item)) }), { autorizadas: 0, ocupadas: 0, comprometidas: 0, disponiveis: 0 });

  const limpar = () => { setBusca(""); setOrgao(""); setTipo(""); setSituacao(""); setDataReferencia("2026-07-15"); };

  return <div className="prototype-quadro-page">
    <header className="prototype-quadro-header"><div><span>Controle de Vagas</span><h1>Quadro Autorizado</h1><p>Quantitativos autorizados por cargo, vínculo e órgão.</p></div><button className="prototype-quadro-primary" onClick={() => navigate(`${BASE_PATH}/novo`)}><i className="pi pi-plus" /> Nova autorização</button></header>
    <div className="prototype-quadro-info"><i className="pi pi-info-circle" /><span>As quantidades de ocupação e comprometimento são <strong>simuladas nesta etapa</strong>. Elas serão integradas às movimentações funcionais posteriormente.</span></div>
    <section className="prototype-quadro-kpis"><article><i className="pi pi-file-check" /><div><span>Autorizadas</span><strong>{totais.autorizadas.toLocaleString("pt-BR")}</strong></div></article><article><i className="pi pi-users" /><div><span>Ocupadas</span><strong>{totais.ocupadas.toLocaleString("pt-BR")}</strong></div></article><article><i className="pi pi-clock" /><div><span>Comprometidas</span><strong>{totais.comprometidas.toLocaleString("pt-BR")}</strong></div></article><article className="is-available"><i className="pi pi-check-circle" /><div><span>Disponíveis</span><strong>{totais.disponiveis.toLocaleString("pt-BR")}</strong></div></article></section>
    <section className="prototype-quadro-card"><div className="prototype-quadro-card-title"><div><h2>Consulta do quadro</h2><p>Posição calculada para a data de referência informada.</p></div></div>
      <div className="prototype-quadro-filters"><label className="is-wide"><span>Código, cargo ou carreira</span><div><i className="pi pi-search" /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Pesquisar no quadro" /></div></label><label><span>Órgão</span><select value={orgao} onChange={(e) => setOrgao(e.target.value)}><option value="">Todos</option>{[...new Set(quadrosMock.map((i) => i.orgao))].map((i) => <option key={i}>{i}</option>)}</select></label><label><span>Tipo de quadro</span><select value={tipo} onChange={(e) => setTipo(e.target.value)}><option value="">Todos</option>{[...new Set(quadrosMock.map((i) => i.tipoQuadro))].map((i) => <option key={i}>{i}</option>)}</select></label><label><span>Situação</span><select value={situacao} onChange={(e) => setSituacao(e.target.value)}><option value="">Todas</option>{[...new Set(quadrosMock.map((i) => i.situacao))].map((i) => <option key={i}>{i}</option>)}</select></label><label><span>Data de referência</span><input type="date" value={dataReferencia} onChange={(e) => setDataReferencia(e.target.value)} /></label><button onClick={limpar}><i className="pi pi-filter-slash" /> Limpar</button></div>
      <div className="prototype-quadro-table"><table><thead><tr><th>Quadro</th><th>Cargo/Função</th><th>Órgão</th><th className="is-number">Autorizadas</th><th className="is-number">Ocupadas</th><th className="is-number">Disponíveis</th><th>Vigência</th><th>Situação</th><th /></tr></thead><tbody>{filtrados.map((item) => <tr key={item.id}><td><button className="prototype-quadro-link" onClick={() => navigate(`${BASE_PATH}/${item.id}`)}>{item.codigo}</button><small>Versão {item.versao}</small></td><td><strong>{item.cargo}</strong><small>{item.especialidade || item.vinculo}</small></td><td>{item.orgao}</td><td className="is-number">{item.autorizadas}</td><td className="is-number">{item.ocupadas}</td><td className={`is-number ${saldo(item) <= 0 ? "is-danger" : "is-positive"}`}><strong>{Math.max(0, saldo(item))}</strong></td><td>{item.inicioVigencia || "Não informada"}<small>{item.fimVigencia ? `até ${item.fimVigencia}` : "sem término"}</small></td><td><span className={`prototype-quadro-status ${situacaoClass[item.situacao]}`}>{item.situacao}</span></td><td><div className="prototype-quadro-actions"><button title="Visualizar" onClick={() => navigate(`${BASE_PATH}/${item.id}`)}><i className="pi pi-eye" /></button>{item.situacao === "Rascunho" && <button title="Editar" onClick={() => navigate(`${BASE_PATH}/${item.id}/editar`)}><i className="pi pi-pencil" /></button>}{item.situacao === "Vigente" && <button title="Criar nova versão" onClick={() => navigate(`${BASE_PATH}/${item.id}/nova-versao`)}><i className="pi pi-copy" /></button>}</div></td></tr>)}</tbody></table></div>
      <footer className="prototype-quadro-table-footer"><span>{filtrados.length} registros encontrados</span><span>Data de referência: {dataReferencia.split("-").reverse().join("/")}</span></footer>
    </section>
  </div>;
}

function QuadroAutorizadoForm({ registro, novaVersao, onBack }: { registro?: QuadroAutorizadoRow; novaVersao: boolean; onBack: () => void }) {
  const navigate = useNavigate();
  const [salvo, setSalvo] = useState(false);
  const [erros, setErros] = useState<string[]>([]);
  const [form, setForm] = useState({ tipoQuadro: registro?.tipoQuadro ?? "", vinculo: registro?.vinculo ?? "", regime: registro?.regime ?? "", carreira: registro?.carreira ?? "", cargo: registro?.cargo ?? "", especialidade: registro?.especialidade ?? "", orgao: registro?.orgao ?? "", abrangencia: registro?.abrangencia ?? "Órgão específico", quantidade: novaVersao ? "" : String(registro?.autorizadas ?? ""), inicioVigencia: "", fimVigencia: registro?.fimVigencia ?? "", tipoAto: "", numeroAto: registro?.ato ?? "", dataAto: "", processo: registro?.processo ?? "", fundamentacao: "", motivoAlteracao: "" });
  const set = (campo: keyof typeof form, valor: string) => setForm((atual) => ({ ...atual, [campo]: valor }));
  const submit = (event: FormEvent, encaminhar = false) => { event.preventDefault(); const novosErros = [!form.tipoQuadro && "Informe o tipo de quadro.", !form.vinculo && "Informe o tipo de vínculo.", !form.cargo && "Informe o cargo ou função.", !form.orgao && "Informe o órgão.", (!form.quantidade || Number(form.quantidade) <= 0) && "Informe uma quantidade maior que zero.", !form.inicioVigencia && "Informe o início da vigência.", !form.numeroAto && "Informe o ato autorizativo.", novaVersao && !form.motivoAlteracao && "Informe o motivo da nova versão."].filter(Boolean) as string[]; setErros(novosErros); if (!novosErros.length) { setSalvo(true); window.setTimeout(() => navigate(BASE_PATH), encaminhar ? 900 : 700); } };
  const titulo = novaVersao ? "Nova versão do quadro" : registro ? "Editar autorização" : "Nova autorização";
  return <div className="prototype-quadro-page"><header className="prototype-quadro-header"><div><button className="prototype-quadro-back" onClick={onBack}><i className="pi pi-arrow-left" /> Quadro Autorizado</button><h1>{titulo}</h1><p>{novaVersao ? `${registro?.codigo} • versão atual ${registro?.versao}` : "Preencha os dados que fundamentam o quantitativo autorizado."}</p></div><span className="prototype-quadro-form-state">{novaVersao ? "Nova versão" : registro ? "Rascunho" : "Novo rascunho"}</span></header>
    {salvo && <div className="prototype-quadro-success"><i className="pi pi-check-circle" /> Registro salvo com sucesso. Retornando à consulta...</div>}{erros.length > 0 && <div className="prototype-quadro-errors"><strong>Revise os campos obrigatórios:</strong><ul>{erros.map((erro) => <li key={erro}>{erro}</li>)}</ul></div>}
    <form onSubmit={submit} className="prototype-quadro-form"><section><header><i className="pi pi-briefcase" /><div><h2>Identificação do quadro</h2><p>Combinação utilizada para controlar o quantitativo.</p></div></header><div className="prototype-quadro-fields"><Field label="Tipo de quadro *"><select value={form.tipoQuadro} onChange={(e) => set("tipoQuadro", e.target.value)}><option value="">Selecione</option><option>Efetivo</option><option>Comissionado</option><option>Função</option><option>Temporário</option><option>Residente</option><option>Estagiário</option></select></Field><Field label="Tipo de vínculo *"><select value={form.vinculo} onChange={(e) => set("vinculo", e.target.value)}><option value="">Selecione</option><option>Servidor efetivo</option><option>Exclusivamente comissionado</option><option>Função de confiança</option><option>Contrato temporário</option></select></Field><Field label="Regime jurídico"><select value={form.regime} onChange={(e) => set("regime", e.target.value)}><option value="">Selecione</option><option>Estatutário</option><option>Administrativo</option><option>Celetista</option></select></Field><Field label="Carreira"><input value={form.carreira} onChange={(e) => set("carreira", e.target.value)} placeholder="Pesquisar carreira" /></Field><Field label="Cargo ou função *" wide><input value={form.cargo} onChange={(e) => set("cargo", e.target.value)} placeholder="Pesquisar cargo ou função" /></Field><Field label="Especialidade"><input value={form.especialidade} onChange={(e) => set("especialidade", e.target.value)} placeholder="Opcional" /></Field></div></section>
      <section><header><i className="pi pi-building" /><div><h2>Abrangência e quantitativo</h2><p>Onde a autorização se aplica e qual é o seu limite.</p></div></header><div className="prototype-quadro-fields"><Field label="Abrangência *"><select value={form.abrangencia} onChange={(e) => set("abrangencia", e.target.value)}><option>Órgão específico</option><option>Quadro geral</option></select></Field><Field label="Órgão *"><select value={form.orgao} onChange={(e) => set("orgao", e.target.value)}><option value="">Selecione</option><option>SEPLAG</option><option>SES</option><option>SEDUC</option><option>SEFAZ</option><option>SINFRA</option><option>PJC</option></select></Field><Field label={novaVersao ? "Nova quantidade autorizada *" : "Quantidade autorizada *"}><input type="number" min="1" value={form.quantidade} onChange={(e) => set("quantidade", e.target.value)} /></Field>{novaVersao && <div className="prototype-quadro-comparison"><span>Quantidade vigente</span><strong>{registro?.autorizadas}</strong><i className="pi pi-arrow-right" /><span>Nova quantidade</span><strong>{form.quantidade || "—"}</strong></div>}<Field label="Início da vigência *"><input type="date" value={form.inicioVigencia} onChange={(e) => set("inicioVigencia", e.target.value)} /></Field><Field label="Fim da vigência"><input type="date" value={form.fimVigencia} onChange={(e) => set("fimVigencia", e.target.value)} /></Field>{novaVersao && <Field label="Motivo da alteração *" wide><textarea rows={3} value={form.motivoAlteracao} onChange={(e) => set("motivoAlteracao", e.target.value)} placeholder="Justifique o aumento ou a redução do quantitativo" /></Field>}</div></section>
      <section><header><i className="pi pi-file" /><div><h2>Fundamentação</h2><p>Ato e processo que autorizam o quadro.</p></div></header><div className="prototype-quadro-fields"><Field label="Tipo do ato"><select value={form.tipoAto} onChange={(e) => set("tipoAto", e.target.value)}><option value="">Selecione</option><option>Lei</option><option>Lei Complementar</option><option>Decreto</option><option>Portaria</option><option>Autorização administrativa</option><option>Decisão judicial</option></select></Field><Field label="Número/identificação do ato *" wide><input value={form.numeroAto} onChange={(e) => set("numeroAto", e.target.value)} /></Field><Field label="Data do ato"><input type="date" value={form.dataAto} onChange={(e) => set("dataAto", e.target.value)} /></Field><Field label="Processo administrativo"><input value={form.processo} onChange={(e) => set("processo", e.target.value)} placeholder="ÓRGÃO-PRO-AAAA/NNNNN" /></Field><Field label="Fundamentação e observações" full><textarea rows={4} value={form.fundamentacao} onChange={(e) => set("fundamentacao", e.target.value)} /></Field><Field label="Documento do ato" full><div className="prototype-quadro-upload"><i className="pi pi-cloud-upload" /><div><strong>Selecione ou arraste o documento</strong><span>PDF, até 10 MB — simulação do protótipo</span></div><button type="button">Selecionar arquivo</button></div></Field></div></section>
      <footer className="prototype-quadro-form-actions"><button type="button" className="is-cancel" onClick={onBack}>Cancelar</button><button type="submit" className="is-save"><i className="pi pi-save" /> Salvar rascunho</button><button type="button" className="is-submit" onClick={(e) => submit(e as unknown as FormEvent, true)}><i className="pi pi-send" /> Salvar e encaminhar</button></footer>
    </form></div>;
}

function Field({ label, children, wide, full }: { label: string; children: React.ReactNode; wide?: boolean; full?: boolean }) { return <label className={full ? "is-full" : wide ? "is-wide" : ""}><span>{label}</span>{children}</label>; }

function QuadroAutorizadoDetalhe({ registro, onBack }: { registro: QuadroAutorizadoRow; onBack: () => void }) {
  const navigate = useNavigate(); const [situacao, setSituacao] = useState(registro.situacao); const disponivel = Math.max(0, saldo(registro));
  return <div className="prototype-quadro-page"><header className="prototype-quadro-header"><div><button className="prototype-quadro-back" onClick={onBack}><i className="pi pi-arrow-left" /> Quadro Autorizado</button><div className="prototype-quadro-title-line"><h1>{registro.codigo}</h1><span className={`prototype-quadro-status ${situacaoClass[situacao]}`}>{situacao}</span></div><p>{registro.cargo} • {registro.orgao} • Versão {registro.versao}</p></div><div className="prototype-quadro-header-actions">{situacao === "Rascunho" && <button onClick={() => navigate(`${BASE_PATH}/${registro.id}/editar`)}><i className="pi pi-pencil" /> Editar</button>}{situacao === "Aguardando aprovação" && <><button className="is-reject" onClick={() => setSituacao("Rascunho")}><i className="pi pi-times" /> Devolver</button><button className="prototype-quadro-primary" onClick={() => setSituacao("Vigente")}><i className="pi pi-check" /> Aprovar</button></>}{situacao === "Vigente" && <button className="prototype-quadro-primary" onClick={() => navigate(`${BASE_PATH}/${registro.id}/nova-versao`)}><i className="pi pi-copy" /> Nova versão</button>}</div></header>
    <section className="prototype-quadro-detail-kpis"><article><span>Autorizadas</span><strong>{registro.autorizadas}</strong></article><article><span>Ocupadas <small>simulado</small></span><strong>{registro.ocupadas}</strong></article><article><span>Comprometidas <small>simulado</small></span><strong>{registro.comprometidas}</strong></article><article className="is-available"><span>Disponíveis <small>simulado</small></span><strong>{disponivel}</strong></article></section>
    <div className="prototype-quadro-detail-grid"><section className="prototype-quadro-detail-card"><header><h2>Identificação e abrangência</h2></header><dl><div><dt>Tipo de quadro</dt><dd>{registro.tipoQuadro}</dd></div><div><dt>Tipo de vínculo</dt><dd>{registro.vinculo}</dd></div><div><dt>Regime jurídico</dt><dd>{registro.regime}</dd></div><div><dt>Carreira</dt><dd>{registro.carreira}</dd></div><div><dt>Cargo ou função</dt><dd>{registro.cargo}</dd></div><div><dt>Especialidade</dt><dd>{registro.especialidade || "Não se aplica"}</dd></div><div><dt>Órgão</dt><dd>{registro.orgao}</dd></div><div><dt>Abrangência</dt><dd>{registro.abrangencia}</dd></div></dl></section><section className="prototype-quadro-detail-card"><header><h2>Vigência e fundamentação</h2></header><dl><div><dt>Início da vigência</dt><dd>{registro.inicioVigencia || "Não informado"}</dd></div><div><dt>Fim da vigência</dt><dd>{registro.fimVigencia || "Sem término"}</dd></div><div className="is-full"><dt>Ato autorizativo</dt><dd>{registro.ato || "Ainda não informado"}</dd></div><div className="is-full"><dt>Processo administrativo</dt><dd>{registro.processo}</dd></div><div><dt>Versão</dt><dd>{registro.versao}</dd></div><div><dt>Última atualização</dt><dd>{registro.atualizadoEm}</dd></div></dl></section></div>
    <section className="prototype-quadro-detail-card prototype-quadro-history"><header><div><h2>Histórico de versões</h2><p>Alterações preservadas para rastreabilidade.</p></div></header><table><thead><tr><th>Versão</th><th>Vigência</th><th>Quantidade</th><th>Motivo</th><th>Situação</th></tr></thead><tbody><tr><td><strong>v{registro.versao}</strong></td><td>{registro.inicioVigencia || "Em definição"}</td><td>{registro.autorizadas}</td><td>{registro.versao > 1 ? "Atualização do quantitativo autorizado" : "Cadastro inicial do quadro"}</td><td><span className={`prototype-quadro-status ${situacaoClass[situacao]}`}>{situacao}</span></td></tr>{registro.versao > 1 && <tr><td>v{registro.versao - 1}</td><td>01/01/2024 a 31/12/2024</td><td>{Math.max(1, registro.autorizadas - 10)}</td><td>Versão anterior substituída</td><td><span className="prototype-quadro-status is-closed">Substituída</span></td></tr>}</tbody></table></section>
  </div>;
}
