import { Fragment, useMemo, useState } from "react";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { BotaoIconSeplag, BotaoSeplag, BotaoVoltarSeplag } from "../../componentes/Botao";
import { CardSeplag } from "../../componentes/Card";
import { ModalSeplag } from "../../componentes/Modal";
import { Calendar } from "primereact/calendar";
import "../../componentes/Fields/primeLocalePt";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { listarFormasEncerramento, type FormaEncerramento } from "./formasEncerramentoStore";
import { dataBR, pessoas, situacao, vinculos, type Vinculo } from "../vidaFuncional/model";
import "../vinculos/vinculoV2.css";
import "../vidaFuncional/vidaFuncional.css";

function SituacaoVinculo({ valor }: Readonly<{ valor: string }>) {
  const classe = valor === "Vigente" ? "ativo" : valor === "Encerrado" ? "encerrado" : "inativo";
  return <span className={`v2v-status v2v-status-${classe}`}>{valor}</span>;
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
  const [busca, setBusca] = useState("");
  const [expandidos, setExpandidos] = useState<string[]>([]);
  const [vinculoParaEncerrar, setVinculoParaEncerrar] = useState<Vinculo | null>(null);
  const [formaId, setFormaId] = useState("");
  const [dataEncerramento, setDataEncerramento] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [processoSigadoc, setProcessoSigadoc] = useState("");
  const [processoLegal, setProcessoLegal] = useState("");
  const [erroEncerramento, setErroEncerramento] = useState("");
  const [versao, setVersao] = useState(0);
  const termo = busca.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  const digitos = busca.replace(/\D/g, "");
  const servidores = useMemo(() => pessoas.filter((pessoa) =>
    !busca.trim() || pessoa.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").includes(termo) || (digitos.length > 0 && pessoa.cpf.replace(/\D/g, "").includes(digitos)),
  ), [busca, digitos, termo]);

  const alternarServidor = (id: string) => setExpandidos((atuais) =>
    atuais.includes(id) ? atuais.filter((item) => item !== id) : [...atuais, id],
  );
  const formasDisponiveis = vinculoParaEncerrar
    ? listarFormasEncerramento().filter((forma) => forma.situacao === "ATIVA" && forma.vinculos.includes(vinculoParaEncerrar.tipo))
    : [];
  const formaSelecionada: FormaEncerramento | undefined = formasDisponiveis.find((forma) => String(forma.id) === formaId);
  const diaEncerramento = dataEncerramento ? Number(dataEncerramento.slice(-2)) : 0;
  const foraDaJanelaFolha = Boolean(formaSelecionada?.regraFolha && diaEncerramento && (diaEncerramento < formaSelecionada.regraFolha.diaInicial || diaEncerramento > formaSelecionada.regraFolha.diaFinal));
  const bloqueiaEncerramento = foraDaJanelaFolha && formaSelecionada?.regraFolha?.tratamento === "BLOQUEAR";
  const mensagemRegraFolha = formaSelecionada?.regraFolha?.mensagem?.trim() || "A data de encerramento informada está fora do período permitido para esta forma de encerramento.";
  const abrirEncerramento = (vinculo: Vinculo) => {
    setVinculoParaEncerrar(vinculo);
    setFormaId("");
    setDataEncerramento(new Date().toISOString().slice(0, 10));
    setJustificativa("");
    setProcessoSigadoc("");
    setProcessoLegal("");
    setErroEncerramento("");
  };
  const confirmarEncerramento = () => {
    if (!vinculoParaEncerrar || !formaSelecionada) { setErroEncerramento("Selecione a forma de encerramento."); return; }
    if (!dataEncerramento || dataEncerramento < vinculoParaEncerrar.inicio) { setErroEncerramento("A data de encerramento não pode ser anterior ao início do vínculo."); return; }
    if (!justificativa.trim()) { setErroEncerramento("Informe a justificativa do encerramento."); return; }
    if (formaSelecionada.exigeProcessoSigadoc && !processoSigadoc.trim()) { setErroEncerramento("Informe o processo SIGADOC."); return; }
    if (formaSelecionada.exigeProcessoLegal && !processoLegal.trim()) { setErroEncerramento("Informe o processo legal."); return; }
    if (bloqueiaEncerramento) { setErroEncerramento(mensagemRegraFolha); return; }
    vinculoParaEncerrar.fim = dataEncerramento;
    vinculoParaEncerrar.classificacao = "Inativo";
    setVinculoParaEncerrar(null);
    setVersao((atual) => atual + 1);
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
            <section className="v2v-panel v2v-filters vf-consulta-filtros" aria-label="Pesquisa de servidor">
              <label>
                Servidor ou CPF
                <input value={busca} onChange={(evento) => setBusca(evento.target.value)} placeholder="Buscar por nome ou CPF" />
              </label>
              <div className="v2v-filter-actions">
                <button className="v2v-primary" type="button" onClick={() => setBusca("")}>
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
                                <td>{situacao(vinculo) === "Vigente" ? <BotaoIconSeplag type="button" severity="danger" icon="pi pi-sign-out" tooltip="Encerrar vínculo" aria-label="Encerrar vínculo" onClick={() => abrirEncerramento(vinculo)} style={{ width: 40, height: 40, borderRadius: 4 }} /> : null}</td>
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
            <ModalSeplag visible={Boolean(vinculoParaEncerrar)} titulo="Encerrar Vínculo" fechar={() => setVinculoParaEncerrar(null)} tamanho="760px" customFooter={<div className="flex justify-content-end gap-2"><BotaoVoltarSeplag type="button" label="Cancelar" icon="pi pi-times" onClick={() => setVinculoParaEncerrar(null)} /><BotaoSeplag type="button" severity="danger" label="Encerrar vínculo" icon="pi pi-sign-out" disabled={bloqueiaEncerramento} onClick={confirmarEncerramento} /></div>}>
              <div className="col-12"><div className="prototype-forma-encerramento-alerta-folha"><i className="pi pi-user" aria-hidden="true" /><span><strong>{vinculoParaEncerrar && pessoas.find((pessoa) => pessoa.id === vinculoParaEncerrar.pessoaId)?.nome}</strong><br />Matrícula {vinculoParaEncerrar?.matricula} · Vínculo {vinculoParaEncerrar?.numero} · {vinculoParaEncerrar?.tipo}<br />{vinculoParaEncerrar?.cargo} · {vinculoParaEncerrar?.orgao}</span></div></div>
              <div className="col-12 md:col-6"><label className="label-rotulo label-destaque" htmlFor="forma-encerramento-vinculo">Forma de encerramento *</label><select id="forma-encerramento-vinculo" className="p-inputtext p-component w-full" value={formaId} onChange={(evento) => { setFormaId(evento.target.value); setErroEncerramento(""); }}><option value="">Selecione a forma</option>{formasDisponiveis.map((forma) => <option key={forma.id} value={forma.id}>{forma.nome}</option>)}</select>{vinculoParaEncerrar && !formasDisponiveis.length ? <small className="p-error">Não há forma de encerramento ativa para este tipo de vínculo.</small> : null}</div>
              <div className="col-12 md:col-6"><label className="label-rotulo label-destaque" htmlFor="data-encerramento-vinculo">Data de encerramento *</label><Calendar inputId="data-encerramento-vinculo" value={isoParaData(dataEncerramento)} onChange={(evento) => { setDataEncerramento(dataParaIso(evento.value as Date | null)); setErroEncerramento(""); }} minDate={isoParaData(vinculoParaEncerrar?.inicio) ?? undefined} locale="pt" dateFormat="dd/mm/yy" mask="99/99/9999" showIcon style={{ width: "100%" }} inputStyle={{ width: "100%" }} /></div>
              {formaSelecionada?.regraFolha && foraDaJanelaFolha ? <div className={`col-12 prototype-forma-encerramento-alerta-folha${bloqueiaEncerramento ? " is-blocking" : ""}`}><i className={`pi ${bloqueiaEncerramento ? "pi-ban" : "pi-info-circle"}`} aria-hidden="true" /><span>{mensagemRegraFolha}{bloqueiaEncerramento ? " O encerramento foi bloqueado." : " O encerramento poderá continuar mediante alerta."}</span></div> : null}
              <div className="col-12"><label className="label-rotulo label-destaque" htmlFor="justificativa-encerramento-vinculo">Justificativa *</label><textarea id="justificativa-encerramento-vinculo" className="p-inputtextarea p-inputtext p-component w-full" rows={3} value={justificativa} onChange={(evento) => setJustificativa(evento.target.value)} /></div>
              {formaSelecionada?.exigeProcessoSigadoc ? <div className="col-12 md:col-6"><label className="label-rotulo label-destaque" htmlFor="sigadoc-encerramento-vinculo">Processo SIGADOC *</label><input id="sigadoc-encerramento-vinculo" className="p-inputtext p-component w-full" value={processoSigadoc} onChange={(evento) => setProcessoSigadoc(evento.target.value)} /></div> : null}
              {formaSelecionada?.exigeProcessoLegal ? <div className="col-12 md:col-6"><label className="label-rotulo label-destaque" htmlFor="legal-encerramento-vinculo">Processo legal *</label><input id="legal-encerramento-vinculo" className="p-inputtext p-component w-full" value={processoLegal} onChange={(evento) => setProcessoLegal(evento.target.value)} /></div> : null}
              {erroEncerramento ? <div className="col-12"><small className="p-error">{erroEncerramento}</small></div> : null}
            </ModalSeplag>
          </div>
        </CardSeplag>
      </main>
    </PrototypeSystemPage>
  );
}
