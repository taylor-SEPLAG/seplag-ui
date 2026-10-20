import { Fragment, useMemo, useState } from "react";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { BotaoIconSeplag, BotaoSeplag, BotaoVoltarSeplag } from "../../componentes/Botao";
import { CardSeplag } from "../../componentes/Card";
import { ModalSeplag } from "../../componentes/Modal";
import { AnexarDocumentoSeplag, type ArquivoAnexadoSeplag } from "../../componentes/AnexarDocumento";
import { Calendar } from "primereact/calendar";
import "../../componentes/Fields/primeLocalePt";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { listarFormasEncerramento, registrarUsoFormaEncerramento, type FormaEncerramento } from "./formasEncerramentoStore";
import { dataBR, pessoas, situacao, vinculos, type Vinculo } from "../vidaFuncional/model";
import "../vinculos/vinculoV2.css";
import "../vidaFuncional/vidaFuncional.css";

function SituacaoVinculo({ valor }: Readonly<{ valor: string }>) {
  const classe = ["Vigente", "Ativo"].includes(valor) ? "ativo" : valor === "Encerrado" ? "encerrado" : "inativo";
  return <span className={`v2v-status v2v-status-${classe}`}>{valor}</span>;
}

function vinculoPodeSerEncerrado(vinculo: Vinculo) {
  return ["Vigente", "Ativo"].includes(situacao(vinculo));
}

function isoParaData(data?: string) {
  if (!data) return null;
  const [ano, mes, dia] = data.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function dataParaIso(data?: Date | null) {
  if (!data) return "";
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

export function EncerrarVinculoPage() {
  const [nomeBusca, setNomeBusca] = useState("");
  const [cpfBusca, setCpfBusca] = useState("");
  const [matriculaBusca, setMatriculaBusca] = useState("");
  const [filtrosAplicados, setFiltrosAplicados] = useState({ nome: "", cpf: "", matricula: "" });
  const [expandidos, setExpandidos] = useState<string[]>([]);
  const [vinculoParaEncerrar, setVinculoParaEncerrar] = useState<Vinculo | null>(null);
  const [formaId, setFormaId] = useState("");
  const [dataEncerramento, setDataEncerramento] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [processoSigadoc, setProcessoSigadoc] = useState("");
  const [documentoSigadoc, setDocumentoSigadoc] = useState<ArquivoAnexadoSeplag | null>(null);
  const [erroEncerramento, setErroEncerramento] = useState("");
  const [versao, setVersao] = useState(0);
  const termo = filtrosAplicados.nome.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  const cpfDigitos = filtrosAplicados.cpf.replace(/\D/g, "");
  const matricula = filtrosAplicados.matricula.trim();
  const servidores = useMemo(() => pessoas.filter((pessoa) =>
    (!filtrosAplicados.nome.trim() || pessoa.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").includes(termo)) &&
    (!cpfDigitos || pessoa.cpf.replace(/\D/g, "").includes(cpfDigitos)) &&
    (!matricula || vinculos.some((vinculo) => vinculo.pessoaId === pessoa.id && vinculo.matricula.includes(matricula))),
  ), [cpfDigitos, filtrosAplicados.nome, matricula, termo]);

  const alternarServidor = (id: string) => setExpandidos((atuais) =>
    atuais.includes(id) ? atuais.filter((item) => item !== id) : [...atuais, id],
  );
  const formasDisponiveis = vinculoParaEncerrar
    ? listarFormasEncerramento().filter((forma) => forma.situacao === "ATIVA" && forma.vinculos.includes(vinculoParaEncerrar.tipo))
    : [];
  const formaSelecionada: FormaEncerramento | undefined = formasDisponiveis.find((forma) => String(forma.id) === formaId);
  const abrirEncerramento = (vinculo: Vinculo) => {
    setVinculoParaEncerrar(vinculo);
    setFormaId("");
    setDataEncerramento(new Date().toISOString().slice(0, 10));
    setJustificativa("");
    setProcessoSigadoc("");
    setDocumentoSigadoc(null);
    setErroEncerramento("");
  };
  const confirmarEncerramento = () => {
    if (!vinculoParaEncerrar || !formaSelecionada) { setErroEncerramento("Selecione a forma de encerramento."); return; }
    if (!dataEncerramento || dataEncerramento < vinculoParaEncerrar.inicio) { setErroEncerramento("A data de encerramento não pode ser anterior ao início do vínculo."); return; }
    if (!justificativa.trim()) { setErroEncerramento("Informe a justificativa do encerramento."); return; }
    if (formaSelecionada.exigeProcessoSigadoc && !processoSigadoc.trim()) { setErroEncerramento("Informe o número do processo SIGADOC."); return; }
    if (formaSelecionada.exigeAnexoProcessoSigadoc && !documentoSigadoc) { setErroEncerramento("Anexe o documento do processo SIGADOC."); return; }
    vinculoParaEncerrar.fim = dataEncerramento;
    vinculoParaEncerrar.classificacao = "Inativo";
    registrarUsoFormaEncerramento(formaSelecionada.id);
    setVinculoParaEncerrar(null);
    setVersao((atual) => atual + 1);
  };
  const anexarDocumentoSigadoc = (evento: { files?: File[] }) => {
    const arquivo = evento.files?.[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => setDocumentoSigadoc({
      nome: arquivo.name,
      extensao: arquivo.name.split(".").pop() || "pdf",
      contentType: arquivo.type || "application/pdf",
      conteudoEmBase64: String(leitor.result).split(",")[1] ?? "",
      tamanho: arquivo.size,
    });
    leitor.readAsDataURL(arquivo);
    setErroEncerramento("");
  };

  return (
    <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}>
      <main className="prototype-page-content prototype-page-content--white v2v-shell">
        <CardSeplag
          title="Encerrar Vínculo"
          cols="12"
          cardHeaderClassNames="prototype-carreira-card v2v-card"
          headerNavigation={<BreadcrumbSeplag divided homeTo="/prototipos/sigep" items={[{ label: "Encerramento de Vínculo", to: "/prototipos/sigep/encerramento-vinculo" }, { label: "Encerrar Vínculo" }]} />}
        >
          <div className="v2v-page vf-page">
            <p className="v2v-description">Pesquise o servidor para consultar seus vínculos e iniciar o encerramento do vínculo selecionado.</p>
            <section className="v2v-panel v2v-filters vf-consulta-filtros ev-consulta-filtros" aria-label="Pesquisa de servidor">
              <label>
                Nome do servidor
                <input value={nomeBusca} onChange={(evento) => setNomeBusca(evento.target.value)} placeholder="Informe o nome do servidor" />
              </label>
              <label>
                CPF
                <input value={cpfBusca} onChange={(evento) => setCpfBusca(evento.target.value)} placeholder="Informe o CPF" inputMode="numeric" />
              </label>
              <label>
                Matrícula
                <input value={matriculaBusca} onChange={(evento) => setMatriculaBusca(evento.target.value)} placeholder="Informe a matrícula" />
              </label>
              <div className="v2v-filter-actions">
                <button className="v2v-primary" type="button" onClick={() => setFiltrosAplicados({ nome: nomeBusca, cpf: cpfBusca, matricula: matriculaBusca })}>
                  <i className="pi pi-search" aria-hidden="true" /> Pesquisar
                </button>
                <button className="v2v-primary" type="button" onClick={() => { setNomeBusca(""); setCpfBusca(""); setMatriculaBusca(""); setFiltrosAplicados({ nome: "", cpf: "", matricula: "" }); }}>
                  <i className="pi pi-refresh" aria-hidden="true" /> Limpar filtro
                </button>
              </div>
            </section>
            <section className="v2v-panel vf-grid-panel" aria-label="Vínculos dos servidores">
              <div className="v2v-table-wrap">
                <table className="v2v-table">
                  <thead><tr><th>Servidor</th><th>CPF</th><th>Quantidade de Vínculos</th><th>Ação</th></tr></thead>
                  <tbody>
                    {servidores.map((servidor) => {
                      const lista = vinculos.filter((vinculo) => vinculo.pessoaId === servidor.id);
                      const expandido = expandidos.includes(servidor.id);
                      return <Fragment key={servidor.id}>
                        <tr className="vf-server-row" tabIndex={0} aria-expanded={expandido} onClick={() => alternarServidor(servidor.id)} onKeyDown={(evento) => {
                          if (evento.key === "Enter" || evento.key === " ") { evento.preventDefault(); alternarServidor(servidor.id); }
                        }}>
                          <td>{servidor.nome}</td><td>{servidor.cpf}</td><td>{lista.length}</td>
                          <td><button type="button" className="v2v-icon-action" aria-label={expandido ? "Recolher vínculos" : "Expandir vínculos"} title={expandido ? "Recolher vínculos" : "Expandir vínculos"} onClick={(evento) => { evento.stopPropagation(); alternarServidor(servidor.id); }}><i className={`pi pi-chevron-${expandido ? "up" : "down"}`} aria-hidden="true" /></button></td>
                        </tr>
                        {expandido && <tr className="v2v-expanded-row"><td colSpan={4}>
                          <div className="v2v-expanded vf-expanded">
                            <div className="v2v-expanded-head"><div><strong>Vínculos do Servidor</strong><span>{lista.length} vínculo(s) encontrado(s)</span></div></div>
                            <div className="v2v-table-wrap"><table className="v2v-table v2v-inner-table">
                              <thead><tr>{["Matrícula", "Nº do Vínculo", "Tipo de Vínculo", "Cargo/Função", "Órgão/Entidade", "Data de Início", "Data de Encerramento", "Situação", "Ação"].map((coluna) => <th key={coluna}>{coluna}</th>)}</tr></thead>
                              <tbody>{lista.map((vinculo) => <tr key={vinculo.id}>
                                <td>{vinculo.matricula}</td><td>{vinculo.numero}</td><td>{vinculo.tipo}</td><td>{vinculo.cargo}</td><td>{vinculo.orgao}</td><td>{dataBR(vinculo.inicio)}</td><td>{dataBR(vinculo.fim)}</td><td><SituacaoVinculo valor={situacao(vinculo)} /></td>
                                <td>{vinculoPodeSerEncerrado(vinculo) ? <BotaoIconSeplag type="button" severity="danger" icon="pi pi-sign-out" tooltip="Encerrar vínculo" aria-label="Encerrar vínculo" onClick={() => abrirEncerramento(vinculo)} style={{ width: 40, height: 40, borderRadius: 4 }} /> : null}</td>
                              </tr>)}</tbody>
                            </table></div>
                          </div>
                        </td></tr>}
                      </Fragment>;
                    })}
                    {!servidores.length && <tr><td colSpan={4} className="v2v-empty">Nenhum servidor encontrado para os filtros informados.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
            <ModalSeplag visible={Boolean(vinculoParaEncerrar)} titulo="Encerrar Vínculo" fechar={() => setVinculoParaEncerrar(null)} tamanho="760px" customFooter={<div className="flex justify-content-end gap-2"><BotaoVoltarSeplag type="button" label="Cancelar" icon="pi pi-times" onClick={() => setVinculoParaEncerrar(null)} /><BotaoSeplag type="button" severity="danger" label="Encerrar vínculo" icon="pi pi-sign-out" onClick={confirmarEncerramento} /></div>}>
              <div className="col-12"><div className="prototype-forma-encerramento-alerta-folha"><i className="pi pi-user" aria-hidden="true" /><span><strong>{vinculoParaEncerrar && pessoas.find((pessoa) => pessoa.id === vinculoParaEncerrar.pessoaId)?.nome}</strong><br />Matrícula {vinculoParaEncerrar?.matricula} · Vínculo {vinculoParaEncerrar?.numero} · {vinculoParaEncerrar?.tipo}<br />{vinculoParaEncerrar?.cargo} · {vinculoParaEncerrar?.orgao}</span></div></div>
              <div className="col-12 md:col-6"><label className="label-rotulo label-destaque" htmlFor="forma-encerramento-vinculo">Forma de encerramento *</label><select id="forma-encerramento-vinculo" className="p-inputtext p-component w-full" value={formaId} onChange={(evento) => { setFormaId(evento.target.value); setErroEncerramento(""); }}><option value="">Selecione a forma</option>{formasDisponiveis.map((forma) => <option key={forma.id} value={forma.id}>{forma.nome}</option>)}</select>{vinculoParaEncerrar && !formasDisponiveis.length ? <small className="p-error">Não há forma de encerramento ativa para este tipo de vínculo.</small> : null}</div>
              <div className="col-12 md:col-6"><label className="label-rotulo label-destaque" htmlFor="data-encerramento-vinculo">Data de encerramento *</label><Calendar inputId="data-encerramento-vinculo" value={isoParaData(dataEncerramento)} onChange={(evento) => { setDataEncerramento(dataParaIso(evento.value as Date | null)); setErroEncerramento(""); }} minDate={isoParaData(vinculoParaEncerrar?.inicio) ?? undefined} locale="pt" dateFormat="dd/mm/yy" mask="99/99/9999" showIcon style={{ width: "100%" }} inputStyle={{ width: "100%" }} /></div>
              <div className="col-12"><label className="label-rotulo label-destaque" htmlFor="justificativa-encerramento-vinculo">Justificativa *</label><textarea id="justificativa-encerramento-vinculo" className="p-inputtextarea p-inputtext p-component w-full" rows={3} value={justificativa} onChange={(evento) => setJustificativa(evento.target.value)} /></div>
              <div className="col-12 md:col-6"><label className="label-rotulo label-destaque" htmlFor="sigadoc-encerramento-vinculo">Número do processo SIGADOC{formaSelecionada?.exigeProcessoSigadoc ? " *" : ""}</label><input id="sigadoc-encerramento-vinculo" className="p-inputtext p-component w-full" value={processoSigadoc} onChange={(evento) => { setProcessoSigadoc(evento.target.value); setErroEncerramento(""); }} /></div>
              <div className="col-12 md:col-6"><label className="label-rotulo label-destaque">Documento do processo SIGADOC{formaSelecionada?.exigeAnexoProcessoSigadoc ? " *" : ""}</label><AnexarDocumentoSeplag hideLabel className="w-full" arquivoBase64={documentoSigadoc ?? undefined} onUploadDocument={anexarDocumentoSigadoc} onRemoveArquivo={() => { setDocumentoSigadoc(null); setErroEncerramento(""); }} handleViewArquivo={() => undefined} canView={false} accept="application/pdf" helpText="Formato aceito: .pdf | Tamanho máximo: 10MB" /></div>
              {erroEncerramento ? <div className="col-12"><small className="p-error">{erroEncerramento}</small></div> : null}
            </ModalSeplag>
          </div>
        </CardSeplag>
      </main>
    </PrototypeSystemPage>
  );
}
