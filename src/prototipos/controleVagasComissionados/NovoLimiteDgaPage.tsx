import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { CardSeplag } from "@componentes/Card";
import { BreadcrumbSeplag } from "@componentes/Breadcrumb";
import { BotaoSalvarSeplag, BotaoVoltarSeplag } from "@componentes/Botao";
import { DocumentosLegaisAssociadosSeplag } from "@componentes/DocumentosLegaisAssociados";
import { DateFieldSeplag, DropdownFieldSeplag, NumberFieldSeplag } from "@componentes/Fields";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { useDocumentosLegaisAssociaveis } from "../documentosLegais/documentosLegaisStore";
import { lerEstruturaOrganizacional } from "../estruturaOrganizacional/estruturaOrganizacionalStore";
import { listarLimitesDga, salvarLimitesDga, simbologiasDga, type LimiteDgaLinha } from "../estruturaOrganizacional/limitesDgaStore";
import "../estruturaOrganizacional/limitesDga.css";

type Formulario = { orgao: string; inicio: string } & Record<string, number | string>;
const semErro = () => null;
const inicial = (): Formulario => ({ orgao: "", inicio: "", ...Object.fromEntries(simbologiasDga.flatMap((dga) => [[`${dga}-cargos`, 0], [`${dga}-funcoes`, 0]])) });

export function PrototiposNovoLimiteDgaPage() {
  const navigate = useNavigate();
  const documentos = useDocumentosLegaisAssociaveis();
  const [documentosSelecionados, setDocumentosSelecionados] = useState<string[]>([]);
  const { control, handleSubmit, watch } = useForm<Formulario>({ defaultValues: inicial() });
  const valores = watch();
  const orgaos = useMemo(() => {
    const existentes = new Set(listarLimitesDga().map((item) => item.codigoOrgao));
    return lerEstruturaOrganizacional().versoes
      .filter((versao) => versao.situacao === "VIGENTE")
      .map((versao) => ({ codigo: versao.codigoOrgao ?? versao.orgao, nome: versao.orgao, label: `${versao.codigoOrgao ?? versao.orgao} — ${versao.orgao}`, indisponivel: existentes.has(versao.orgao) || existentes.has(versao.codigoOrgao ?? "") }))
      .filter((orgao, indice, lista) => lista.findIndex((item) => item.codigo === orgao.codigo) === indice);
  }, []);
  const totais = useMemo(() => simbologiasDga.reduce((total, dga) => ({ cargos: total.cargos + Number(valores[`${dga}-cargos`] ?? 0), funcoes: total.funcoes + Number(valores[`${dga}-funcoes`] ?? 0) }), { cargos: 0, funcoes: 0 }), [valores]);
  const salvar = (dados: Formulario) => {
    const orgao = orgaos.find((item) => item.codigo === dados.orgao);
    if (!orgao || !documentosSelecionados.length) return;
    const limites: LimiteDgaLinha[] = simbologiasDga.map((simbologia) => ({ simbologia, cargos: Number(dados[`${simbologia}-cargos`] ?? 0), funcoes: Number(dados[`${simbologia}-funcoes`] ?? 0) }));
    const documentoLegal = documentosSelecionados.map((id) => documentos.find((item) => item.id === id)?.titulo).filter(Boolean).join("; ");
    salvarLimitesDga([...listarLimitesDga(), { id: crypto.randomUUID(), codigoOrgao: orgao.codigo, orgao: orgao.nome, vigencias: [{ id: crypto.randomUUID(), inicio: dados.inicio, documentoLegal, situacao: "VIGENTE", limites }] }]);
    navigate("/prototipos/sigep/controle-vagas/comissionados/limites-dga");
  };
  return (
    <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}>
      <form className="novo-limite-dga-page" onSubmit={handleSubmit(salvar)}>
        <CardSeplag title="Adicionar tabela de Limites DGA" cols="12" cardHeaderClassNames="prototype-carreira-card" headerNavigation={<BreadcrumbSeplag divided items={[{ label: "Controle de Vagas" }, { label: "Comissionados" }, { label: "Limites de DGA", to: "/prototipos/sigep/controle-vagas/comissionados/limites-dga" }, { label: "Adicionar tabela" }]} />}>
          <section className="col-12 novo-limite-dga-section">
            <header><span className="novo-limite-dga-step">1</span><div><h2>Documento legal</h2><p>Associe o ato normativo que estabelece os quantitativos da tabela.</p></div></header>
            <DocumentosLegaisAssociadosSeplag label="Documento legal" required options={documentos} value={documentosSelecionados} onChange={setDocumentosSelecionados} expandirAoAbrir exibirNovoCadastro={false} />
          </section>
          <section className="col-12 novo-limite-dga-section">
            <header><span className="novo-limite-dga-step">2</span><div><h2>Identificação e vigência</h2><p>Selecione o órgão que receberá os limites e informe a data de início da vigência.</p></div></header>
            <div className="grid novo-limite-dga-fields">
              <DropdownFieldSeplag name="orgao" control={control} label="Órgão/Entidade" required cols="12 8" placeholder="Pesquise por código ou nome" options={orgaos} optionLabel="label" optionValue="codigo" optionDisabled="indisponivel" filter filterBy="label,codigo,nome" itemTemplate={(opcao) => <span className={opcao.indisponivel ? "novo-limite-dga-orgao-indisponivel" : ""}>{opcao.label}{opcao.indisponivel && <small>Limite já cadastrado</small>}</span>} getFormErrorMessage={semErro} />
              <DateFieldSeplag name="inicio" control={control} label="Início da vigência" required cols="12 4" getFormErrorMessage={semErro} />
            </div>
          </section>
          <section className="col-12 novo-limite-dga-section">
            <header><span className="novo-limite-dga-step">3</span><div><h2>Quantitativos autorizados</h2><p>Informe o limite legal por simbologia. Cargos em comissão e funções de confiança são controlados separadamente.</p></div></header>
            <div className="novo-limite-dga-grid">
              <div className="novo-limite-dga-grid-head"><span>DGA</span><span>Cargo em comissão</span><span>Função de confiança</span></div>
              {simbologiasDga.map((dga) => <div className="novo-limite-dga-row" key={dga}><strong>{dga}</strong><NumberFieldSeplag name={`${dga}-cargos`} control={control} label="" min={0} cols="12" getFormErrorMessage={semErro} /><NumberFieldSeplag name={`${dga}-funcoes`} control={control} label="" min={0} cols="12" getFormErrorMessage={semErro} /></div>)}
              <div className="novo-limite-dga-total"><strong>Subtotal</strong><strong>{totais.cargos}</strong><strong>{totais.funcoes}</strong></div>
              <div className="novo-limite-dga-total is-general"><strong>Total geral</strong><strong>{totais.cargos + totais.funcoes}</strong></div>
            </div>
          </section>
          <footer className="col-12 novo-limite-dga-actions"><BotaoVoltarSeplag label="Cancelar" onClick={() => navigate(-1)} /><BotaoSalvarSeplag type="submit" label="Adicionar tabela" disabled={!valores.orgao || !valores.inicio || !documentosSelecionados.length} /></footer>
        </CardSeplag>
      </form>
    </PrototypeSystemPage>
  );
}
