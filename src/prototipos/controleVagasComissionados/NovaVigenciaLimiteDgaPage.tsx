import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { BreadcrumbSeplag } from "@componentes/Breadcrumb";
import { BotaoSalvarSeplag, BotaoVoltarSeplag } from "@componentes/Botao";
import { CardSeplag } from "@componentes/Card";
import { DocumentosLegaisAssociadosSeplag } from "@componentes/DocumentosLegaisAssociados";
import { DateFieldSeplag, NumberFieldSeplag } from "@componentes/Fields";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { useDocumentosLegaisAssociaveis } from "../documentosLegais/documentosLegaisStore";
import { listarLimitesDga, salvarLimitesDga, simbologiasDga, type LimiteDgaLinha, type LimiteDgaOrgao, type VigenciaLimiteDga } from "../estruturaOrganizacional/limitesDgaStore";
import "../estruturaOrganizacional/limitesDga.css";

type Formulario = { inicio: string } & Record<string, number | string>;
const semErro = () => null;
const dataNumero = (valor: string) => {
  const partes = valor.includes("/") ? valor.split("/") : valor.split("-").reverse();
  const [dia, mes, ano] = partes.map(Number);
  return ano * 10_000 + mes * 100 + dia;
};
const diaAnterior = (valor: string) => {
  const partes = valor.includes("/") ? valor.split("/") : valor.split("-").reverse();
  const [dia, mes, ano] = partes.map(Number);
  const data = new Date(ano, mes - 1, dia - 1);
  const dd = String(data.getDate()).padStart(2, "0");
  const mm = String(data.getMonth() + 1).padStart(2, "0");
  return valor.includes("/") ? `${dd}/${mm}/${data.getFullYear()}` : `${data.getFullYear()}-${mm}-${dd}`;
};
const limitesDo = (vigencia: VigenciaLimiteDga | undefined) => Object.fromEntries(simbologiasDga.flatMap((dga) => {
  const linha = vigencia?.limites.find((limite) => limite.simbologia === dga);
  return [[`${dga}-cargos`, linha?.cargos ?? 0], [`${dga}-funcoes`, linha?.funcoes ?? 0]];
}));

export function PrototiposNovaVigenciaLimiteDgaPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const documentos = useDocumentosLegaisAssociaveis();
  const registro = useMemo(() => listarLimitesDga().find((item) => item.id === id), [id]);
  const vigenciaAtual = registro?.vigencias.filter((vigencia) => vigencia.situacao === "VIGENTE").sort((a, b) => dataNumero(b.inicio) - dataNumero(a.inicio))[0];
  const { control, handleSubmit, watch } = useForm<Formulario>({ defaultValues: { inicio: "", ...limitesDo(vigenciaAtual) } });
  const valores = watch();
  const [documentosSelecionados, setDocumentosSelecionados] = useState<string[]>([]);
  const [erro, setErro] = useState("");
  const totais = useMemo(() => simbologiasDga.reduce((total, dga) => ({ cargos: total.cargos + Number(valores[`${dga}-cargos`] ?? 0), funcoes: total.funcoes + Number(valores[`${dga}-funcoes`] ?? 0) }), { cargos: 0, funcoes: 0 }), [valores]);

  const salvar = (dados: Formulario) => {
    if (!registro || !documentosSelecionados.length) return;
    const maisRecente = [...registro.vigencias].sort((a, b) => dataNumero(b.inicio) - dataNumero(a.inicio))[0];
    if (maisRecente && dataNumero(dados.inicio) <= dataNumero(maisRecente.inicio)) {
      setErro("O início da nova vigência deve ser posterior ao início da vigência mais recente.");
      return;
    }
    const limites: LimiteDgaLinha[] = simbologiasDga.map((simbologia) => ({ simbologia, cargos: Number(dados[`${simbologia}-cargos`] ?? 0), funcoes: Number(dados[`${simbologia}-funcoes`] ?? 0) }));
    const documentoLegal = documentosSelecionados.map((documentoId) => documentos.find((documento) => documento.id === documentoId)?.titulo).filter(Boolean).join("; ");
    const novaVigencia: VigenciaLimiteDga = { id: crypto.randomUUID(), inicio: dados.inicio, documentoLegal, situacao: "VIGENTE", limites };
    const atualizado: LimiteDgaOrgao = {
      ...registro,
      vigencias: registro.vigencias.map((vigencia) => vigencia.situacao === "VIGENTE" && !vigencia.fim
        ? { ...vigencia, fim: diaAnterior(dados.inicio), situacao: "ENCERRADA" }
        : vigencia).concat(novaVigencia),
    };
    salvarLimitesDga(listarLimitesDga().map((item) => item.id === registro.id ? atualizado : item));
    navigate("/prototipos/sigep/controle-vagas/comissionados/limites-dga");
  };

  if (!registro) return <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}><div className="novo-limite-dga-page"><CardSeplag title="Limites DGA" cols="12"><p>Registro de limites não encontrado.</p><BotaoVoltarSeplag label="Voltar" onClick={() => navigate("/prototipos/sigep/controle-vagas/comissionados/limites-dga")} /></CardSeplag></div></PrototypeSystemPage>;

  return <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}>
    <form className="novo-limite-dga-page" onSubmit={handleSubmit(salvar)}>
      <CardSeplag title={`Nova vigência de Limites DGA — ${registro.codigoOrgao}`} cols="12" cardHeaderClassNames="prototype-carreira-card" headerNavigation={<BreadcrumbSeplag divided items={[{ label: "Controle de Vagas" }, { label: "Comissionados" }, { label: "Limites de DGA", to: "/prototipos/sigep/controle-vagas/comissionados/limites-dga" }, { label: "Nova vigência" }]} />}>
        <section className="col-12 novo-limite-dga-identificacao"><div className="grid"><div><strong>Órgão/Entidade</strong><p>{registro.orgao}</p></div><div><strong>Código</strong><p>{registro.codigoOrgao}</p></div></div><small>Os quantitativos abaixo foram copiados da vigência atual. Ao salvar, a vigência anterior será encerrada no dia anterior ao novo início.</small></section>
        <section className="col-12 novo-limite-dga-section"><header><span className="novo-limite-dga-step">1</span><div><h2>Documento legal</h2><p>Associe o ato normativo que fundamenta esta nova vigência.</p></div></header><DocumentosLegaisAssociadosSeplag label="Documento legal" required options={documentos} value={documentosSelecionados} onChange={setDocumentosSelecionados} expandirAoAbrir exibirNovoCadastro={false} /></section>
        <section className="col-12 novo-limite-dga-section"><header><span className="novo-limite-dga-step">2</span><div><h2>Vigência</h2><p>Informe a data de início. A vigência anterior será encerrada automaticamente.</p></div></header><div className="grid novo-limite-dga-fields"><DateFieldSeplag name="inicio" control={control} label="Início da vigência" required cols="12" getFormErrorMessage={semErro} /></div>{erro && <p className="novo-limite-dga-erro">{erro}</p>}</section>
        <section className="col-12 novo-limite-dga-section"><header><span className="novo-limite-dga-step">3</span><div><h2>Quantitativos autorizados</h2><p>Revise os limites por simbologia. Cargos em comissão e funções de confiança são controlados separadamente.</p></div></header><div className="novo-limite-dga-grid"><div className="novo-limite-dga-grid-head"><span>DGA</span><span>Cargo em comissão</span><span>Função de confiança</span></div>{simbologiasDga.map((dga) => <div className="novo-limite-dga-row" key={dga}><strong>{dga}</strong><NumberFieldSeplag name={`${dga}-cargos`} control={control} label="" min={0} cols="12" getFormErrorMessage={semErro} /><NumberFieldSeplag name={`${dga}-funcoes`} control={control} label="" min={0} cols="12" getFormErrorMessage={semErro} /></div>)}<div className="novo-limite-dga-total"><strong>Subtotal</strong><strong>{totais.cargos}</strong><strong>{totais.funcoes}</strong></div><div className="novo-limite-dga-total is-general"><strong>Total geral</strong><strong>{totais.cargos + totais.funcoes}</strong></div></div></section>
        <footer className="col-12 novo-limite-dga-actions"><BotaoVoltarSeplag label="Cancelar" onClick={() => navigate(-1)} /><BotaoSalvarSeplag type="submit" label="Salvar vigência" disabled={!valores.inicio || !documentosSelecionados.length} /></footer>
      </CardSeplag>
    </form>
  </PrototypeSystemPage>;
}
