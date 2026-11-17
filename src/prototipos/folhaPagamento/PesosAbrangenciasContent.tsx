import { useState } from "react";
import { BotaoIconSeplag, BotaoLimparFiltroSeplag, BotaoSeplag, BotaoVoltarSeplag } from "@componentes/Botao";
import { BreadcrumbSeplag } from "@componentes/Breadcrumb";
import { Dropdown } from "primereact/dropdown";
import { Paginator } from "primereact/paginator";
import { useForm } from "react-hook-form";
import { DateFieldSeplag } from "@componentes/Fields";
import { FOLHA_PAGINA_INICIAL_PATH } from "../paginaInicial/folhaModel";
import { CardSeplag } from "@componentes/Card";
import { ModalSeplag } from "@componentes/Modal";
import "./pesosAbrangencias.css";

const CHAVE = "sigep:pesos-abrangencias:v1";
const criterios = ["Órgão/Entidade", "Regime Jurídico", "Tipo de Vínculo", "Carreira", "Unidade de Lotação", "Cargo"];
const ordemCriterios = [1, 2, 0, 4, 3, 5];
const pesoValido = (valor: string) => Boolean(valor.trim()) && Number.isFinite(Number(valor)) && Number(valor) >= 0 && Number(valor) <= 100;
type Versao = { numero: number; inicio: string; fim: string | null; pesos: number[] };
const data = (valor: string | null) => valor ? new Date(valor).toLocaleDateString("pt-BR", { timeZone: "America/Cuiaba" }) : "-";
const estaAtiva = (versao: Versao) => !versao.fim || new Date(versao.fim).getTime() > Date.now();
const situacao = (versao: Versao) => estaAtiva(versao) ? "Ativo" : "Encerrada";
const dataVigencia = (valor: string | undefined, fim = false): string | null => {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor ?? "");
  if (!partes) return null;
  const [, dia, mes, ano] = partes;
  const teste = new Date(`${ano}-${mes}-${dia}T12:00:00Z`);
  if (!Number.isFinite(teste.getTime()) || teste.getUTCDate() !== Number(dia) || teste.getUTCMonth() + 1 !== Number(mes) || teste.getUTCFullYear() !== Number(ano)) return null;
  return new Date(`${ano}-${mes}-${dia}T${fim ? "23:59:59.999" : "00:00:00.000"}-04:00`).toISOString();
};
function carregar(): Versao[] {
  const dados: unknown = JSON.parse(localStorage.getItem(CHAVE) ?? "[]");
  if (!Array.isArray(dados) || !dados.every(v => Number.isInteger(v.numero) && typeof v.inicio === "string" && (v.fim === null || typeof v.fim === "string") && Array.isArray(v.pesos) && [5, 6].includes(v.pesos.length) && v.pesos.every((p: unknown) => typeof p === "number" && Number.isFinite(p) && p >= 0))) throw new Error("Dados inválidos");
  return dados;
}

export function PesosAbrangenciasContent() {
  const [estado, setEstado] = useState(() => {
    try { return { versoes: carregar(), erro: "" }; }
    catch { return { versoes: [] as Versao[], erro: "Não foi possível carregar a parametrização salva. Tente recarregar a página." }; }
  });
  const [versaoFiltro, setVersaoFiltro] = useState("");
  const [situacaoFiltro, setSituacaoFiltro] = useState("");
  const [paginacao, setPaginacao] = useState({ first: 0, rows: 10 });
  const [tela, setTela] = useState<"lista" | "editar" | "visualizar" | "historico">("lista");
  const [selecionada, setSelecionada] = useState<Versao | null>(null);
  const [pesos, setPesos] = useState<string[]>([]);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [confirmar, setConfirmar] = useState(false);
  const { control: controlVigencia, getValues: lerVigencia, reset: limparVigencia } = useForm<{ inicio: string; fim: string }>({ defaultValues: { inicio: "", fim: "" } });
  const [erroVigencia, setErroVigencia] = useState("");
  const ativa = estado.versoes.find(estaAtiva);
  const proximaVersao = Math.max(0, ...estado.versoes.map(v => v.numero)) + 1;
  const abrirEdicao = () => {
    limparVigencia({ inicio: ativa ? new Date().toLocaleDateString("pt-BR", { timeZone: "America/Cuiaba" }) : "", fim: "" }); setErroVigencia("");
    setSelecionada(ativa ?? null);
    setPesos(Array.from({ length: criterios.length }, (_, i) => String(ativa ? ativa.pesos[i] ?? 0 : [100, 40, 30, 20, 10, 0][i])));
    setErro(""); setSucesso(""); setTela("editar");
  };
  const validar = () => {
    if (!pesos.every(pesoValido)) {
      setErro("Verifique os pesos informados. Todos os pesos são obrigatórios e devem possuir valores numéricos de 0 a 100."); return;
    }
    if (ativa && pesos.every((p, i) => Number(p) === (ativa.pesos[i] ?? 0))) {
      setErro("Nenhuma alteração identificada. Modifique pelo menos um peso para gerar uma nova versão."); return;
    }
    {
      const vigencia = lerVigencia();
      const inicio = dataVigencia(vigencia.inicio);
      const fim = dataVigencia(vigencia.fim, true);
      if (!inicio) { setErroVigencia("Informe uma data de início válida."); return; }
      if (vigencia.fim && (!fim || fim < inicio)) { setErroVigencia("A data de fim deve ser válida e igual ou posterior à data de início."); return; }
    }
    setErroVigencia("");
    setErro(""); setConfirmar(true);
  };
  const aprovar = () => {
    try {
      const salvas = carregar();
      if (JSON.stringify(salvas) !== JSON.stringify(estado.versoes)) {
        setEstado({ versoes: salvas, erro: "" }); setTela("lista"); setConfirmar(false);
        setErro("A parametrização foi alterada em outra aba. Abra a versão ativa novamente."); return;
      }
      const agora = new Date().toISOString();
      const numero = Math.max(0, ...salvas.map(v => v.numero)) + 1;
      const vigencia = lerVigencia();
      const nova: Versao = { numero, inicio: dataVigencia(vigencia.inicio)!, fim: dataVigencia(vigencia.fim, true), pesos: pesos.map(Number) };
      const versoes = [nova, ...salvas.map(v => estaAtiva(v) ? { ...v, fim: agora } : v)];
      localStorage.setItem(CHAVE, JSON.stringify(versoes));
      setEstado({ versoes, erro: "" }); setConfirmar(false); setTela("lista"); setErro("");
      setPaginacao(p => ({ ...p, first: 0 }));
      setSucesso(ativa ? `Parametrização atualizada com sucesso! A versão V${numero} foi criada e ativada. A versão V${ativa.numero} foi encerrada e permanece disponível no histórico.` : `Parametrização aprovada com sucesso! A versão V1 foi criada com a vigência informada. Situação: ${situacao(nova)}.`);
    } catch { setConfirmar(false); setErro("Não foi possível salvar a parametrização. As alterações não foram aprovadas. Tente novamente."); }
  };
  const visualizar = (v: Versao) => { setSelecionada(v); setErro(""); setTela("visualizar"); };
  const badge = (v: Versao) => <span className={`pesos-badge ${estaAtiva(v) ? "pesos-badge--ativa" : ""}`}>{situacao(v)}</span>;
  const titulo = tela === "editar" ? ativa ? "Versionar Parametrização de Pesos" : "Nova Parametrização de Pesos" : tela === "visualizar" ? "Visualizar Parametrização de Pesos" : tela === "historico" ? "Histórico da Parametrização de Pesos" : "Gestão da Parametrização de Pesos";
  const listadas = estado.versoes.filter(v => (!versaoFiltro || String(v.numero) === versaoFiltro) && (!situacaoFiltro || situacao(v) === situacaoFiltro));
  const opcoesVersao = [...new Set(estado.versoes.map(v => v.numero))].sort((a, b) => b - a).map(numero => ({ label: `V${numero}`, value: String(numero) }));
  const opcoesSituacao = [...new Set(estado.versoes.map(situacao))].map(valor => ({ label: valor, value: valor }));
  const primeiroRegistro = Math.min(paginacao.first, Math.max(0, Math.ceil(listadas.length / paginacao.rows) - 1) * paginacao.rows);
  const paginadas = listadas.slice(primeiroRegistro, primeiroRegistro + paginacao.rows);
  return <div className="prototype-page-content prototype-page-content--white pesos-page v2v-shell">
    <CardSeplag title={titulo} cols="12" cardHeaderClassNames="prototype-carreira-card v2v-card" headerNavigation={<BreadcrumbSeplag divided homeTo={FOLHA_PAGINA_INICIAL_PATH} items={[{ label: "Página Inicial", to: FOLHA_PAGINA_INICIAL_PATH }, { label: "Folha" }, { label: "Pesos das Abrangências", to: "/prototipos/folha/pesos-abrangencias" }, ...(tela === "editar" ? [{ label: ativa ? "Versionar parametrização" : "Nova parametrização" }] : [])]} />}>
      <div className="v2v-page prototype-grupos-calculo-management pesos-content">
      {tela !== "editar" && <p className="pesos-description">Gerencie as versões da parametrização global de pesos utilizada na priorização dos Grupos de Cálculo.</p>}
      {tela === "editar" && ativa && <section className="pesos-info pesos-version-info" aria-labelledby="pesos-version-title">
        <i className="pi pi-info-circle" aria-hidden="true" />
        <div>
          <h2 id="pesos-version-title">Nova versão da parametrização</h2>
          <p>Você está alterando a parametrização de pesos da versão V{ativa.numero}. Ao aprovar as alterações, o sistema criará automaticamente a versão V{proximaVersao}, encerrando a vigência da versão anterior e preservando seu histórico para consulta. <span className="pesos-version-flow"><strong>Versão atual: V{ativa.numero}</strong> → <strong>Nova versão: V{proximaVersao}</strong></span></p>
        </div>
      </section>}
      {(erro || estado.erro) && <div role="alert" className="pesos-alert">{erro || estado.erro}</div>}
      {sucesso && tela === "lista" && <div role="status" className="pesos-success">{sucesso}</div>}
      {tela === "lista" && <>
        <div className="v2v-panel prototype-category-filters prototype-grupos-calculo-filters pesos-filtros">
          <label htmlFor="pesos-versao">Versão<Dropdown inputId="pesos-versao" value={versaoFiltro} placeholder="Todas" optionLabel="label" optionValue="value" options={[{ label: "Todas", value: "" }, ...opcoesVersao]} onChange={e => { setVersaoFiltro(e.value); setPaginacao(p => ({ ...p, first: 0 })); }} /></label>
          <label htmlFor="pesos-situacao">Situação<Dropdown inputId="pesos-situacao" value={situacaoFiltro} placeholder="Todas" optionLabel="label" optionValue="value" options={[{ label: "Todas", value: "" }, ...opcoesSituacao]} onChange={e => { setSituacaoFiltro(e.value); setPaginacao(p => ({ ...p, first: 0 })); }} /></label>
          <div className="prototype-category-clear"><BotaoLimparFiltroSeplag type="button" label="Limpar filtros" icon="pi pi-refresh" onClick={() => { setVersaoFiltro(""); setSituacaoFiltro(""); setPaginacao(p => ({ ...p, first: 0 })); }} /></div>
        </div>
        <section className="v2v-panel v2v-management-results" aria-label="Parametrizações cadastradas">
        <div className="v2v-grid-toolbar pesos-list-toolbar">
          <div className="pesos-toolbar-left"><BotaoSeplag type="button" label={estado.versoes.length ? "Nova versão" : "Nova parametrização"} icon="pi pi-plus" disabled={Boolean(estado.erro) || (estado.versoes.length > 0 && !ativa)} onClick={abrirEdicao} /></div>
        </div>
        <div className="pesos-table pesos-list-table prototype-grupos-calculo-flat-table"><table className="v2v-table v2v-inner-table"><colgroup><col style={{ width: "12%" }} /><col style={{ width: "26%" }} /><col style={{ width: "26%" }} /><col style={{ width: "18%" }} /><col style={{ width: "18%" }} /></colgroup><thead><tr><th>Versão</th><th>Data de início</th><th>Data fim</th><th>Situação</th><th>Ações</th></tr></thead><tbody>{paginadas.map(v => <tr key={v.numero} className={estaAtiva(v) ? "pesos-atual" : ""}><td><strong>V{v.numero}</strong></td><td>{data(v.inicio)}</td><td>{data(v.fim)}</td><td>{badge(v)}</td><td><div className="pesos-actions"><BotaoIconSeplag type="button" icon="pi pi-eye" tooltip="Visualizar" aria-label="Visualizar" onClick={() => visualizar(v)} /></div></td></tr>)}{!listadas.length && <tr><td colSpan={5}><div className="pesos-empty"><i className="pi pi-cog" aria-hidden="true" /><strong>{estado.versoes.length ? "Nenhuma parametrização encontrada" : "Nenhuma parametrização cadastrada"}</strong><p>{estado.versoes.length ? "Ajuste os filtros para consultar as parametrizações." : "Cadastre a primeira parametrização de pesos para definir a prioridade dos Grupos de Cálculo da Folha."}</p></div></td></tr>}</tbody></table></div>
        <Paginator className="prototype-grupos-calculo-paginator" first={primeiroRegistro} rows={paginacao.rows} totalRecords={listadas.length} rowsPerPageOptions={[10, 20, 50]} onPageChange={e => setPaginacao({ first: e.first, rows: e.rows })} />
        </section>
      </>}
      {(tela === "editar" || tela === "visualizar") && <>
        {tela === "visualizar" && selecionada && <section className="pesos-summary" aria-labelledby="pesos-summary-title">
          <h2 id="pesos-summary-title"><i className="pi pi-sliders-h" aria-hidden="true" />Resumo da Parametrização</h2>
          <dl className="pesos-summary-fields">
            <div><dt>Versão</dt><dd>V{selecionada.numero}</dd></div>
            <div><dt>Data de início</dt><dd>{data(selecionada.inicio)}</dd></div>
            <div><dt>Data de fim</dt><dd>{data(selecionada.fim)}</dd></div>
            <div><dt>Situação</dt><dd>{badge(selecionada)}</dd></div>
            <div><dt>Responsável</dt><dd>Admin User</dd></div>
          </dl>
        </section>}
        <form className="pesos-form" noValidate onSubmit={e => { e.preventDefault(); validar(); }}>
          {tela === "editar" && <section className="pesos-vigencia" aria-labelledby="pesos-vigencia-title">
            <header><i className="pi pi-calendar" aria-hidden="true" /><div><h2 id="pesos-vigencia-title">Vigência</h2><p>Informe a data início e, se necessário, a data fim da parametrização de pesos.</p></div></header>
            <div className="pesos-vigencia-fields">
              <DateFieldSeplag name="inicio" control={controlVigencia} label="Data início" cols="12" required getFormErrorMessage={() => null} />
              <DateFieldSeplag name="fim" control={controlVigencia} label="Data fim" cols="12" getFormErrorMessage={() => null} />
            </div>
            {erroVigencia && <p role="alert" className="pesos-vigencia-error">{erroVigencia}</p>}
          </section>}
          <div className={tela === "editar" ? "pesos-config-layout" : ""}>
            {tela === "editar" && <aside className="pesos-help" aria-label="Informações sobre os pesos">
              <section className="pesos-help-card pesos-help-how"><h2><i className="pi pi-cog" aria-hidden="true" />Como o peso funciona?</h2>
                <ul>
                  <li>Os pesos definidos nesta parametrização serão utilizados pelo <strong>motor de cálculo da folha de pagamento</strong> para determinar a prioridade entre os Grupos de Cálculo.</li>
                  <li>Cada grupo terá seu peso calculado conforme os critérios de abrangência configurados.</li>
                  <li>Quando um vínculo estiver contemplado por mais de um grupo, o motor de cálculo selecionará <strong>aquele com o maior peso</strong>, garantindo que o vínculo seja processado em apenas um Grupo de Cálculo.</li>
                </ul>
              </section>
            </aside>}
            <section aria-label="Configuração dos pesos" className="pesos-config-main">
              <div className="pesos-table pesos-config-table"><table><thead><tr><th>Critério da Abrangência</th><th>Peso (pontos){tela === "editar" && <span className="pesos-required" aria-hidden="true"> *</span>}</th></tr></thead><tbody>{ordemCriterios.map(i => criterios[i]).map((c, indice) => { const i = ordemCriterios[indice]; return <tr key={c}><td><label htmlFor={`peso-${i}`}>{c}</label></td><td>{tela === "editar" ? <input id={`peso-${i}`} aria-label={c} type="number" min="0" max="100" step="any" required aria-invalid={Boolean(erro) && !pesoValido(pesos[i] ?? "")} value={pesos[i] ?? ""} onChange={e => setPesos(p => p.map((v, j) => j === i ? e.target.value : v))} /> : selecionada?.pesos[i] ?? "—"}</td></tr>; })}</tbody></table></div>
              {tela === "editar" && <p className="pesos-required-note">* Pesos obrigatórios. Informe valores de 0 a 100.</p>}
            </section>
          </div>
          <div className="pesos-form-footer">{tela === "editar" ? <BotaoSeplag type="button" variant="back" label="Cancelar" icon="pi pi-times" onClick={() => { setTela("lista"); setErro(""); }} /> : <BotaoVoltarSeplag onClick={() => { setTela("lista"); setErro(""); }} />}{tela === "editar" && <BotaoSeplag type="submit" label={ativa ? "Aprovar nova versão" : "Aprovar parametrização"} icon="pi pi-check" />}</div>
        </form>
      </>}
      {tela === "historico" && <><ol className="pesos-timeline">{estado.versoes.map(v => <li key={v.numero} className={estaAtiva(v) ? "pesos-atual" : ""}><div><strong>V{v.numero}</strong> {badge(v)}</div><p>Data de início: {data(v.inicio)} · Data de fim: {data(v.fim)}</p><BotaoSeplag type="button" label={`Visualizar V${v.numero}`} icon="pi pi-eye" onClick={() => visualizar(v)} /></li>)}</ol>{!estado.versoes.length && <p>Nenhuma versão aprovada.</p>}<BotaoVoltarSeplag onClick={() => setTela("lista")} /></>}
      </div>
    </CardSeplag>
    <ModalSeplag visible={confirmar} titulo={ativa ? "Deseja aprovar a nova versão da parametrização?" : "Aprovar parametrização de pesos?"} tamanho="600px" fechar={() => setConfirmar(false)} customFooter={<div className="pesos-toolbar"><BotaoSeplag type="button" variant="back" label="Cancelar" onClick={() => setConfirmar(false)} /><BotaoSeplag type="button" label="Confirmar aprovação" onClick={aprovar} /></div>}><p>{ativa ? "A versão atual será encerrada e uma nova versão será criada com os pesos atualizados." : "Os pesos configurados serão utilizados pelo motor de cálculo da folha para determinar a prioridade entre os Grupos de Cálculo."}</p></ModalSeplag>
  </div>;
}
