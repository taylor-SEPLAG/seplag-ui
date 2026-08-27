import { useState } from "react";
import { useForm } from "react-hook-form";
import { BotaoSalvarSeplag, BotaoSeplag, BotaoVoltarSeplag } from "@componentes/Botao";
import { CardSeplag } from "@componentes/Card";
import { CNPJFieldSeplag, DateFieldSeplag, DropdownFieldSeplag, EmailFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
import { AccordionCardSeplag } from "@componentes/AccordionCard";
import "./orgaosEntidades.css";

type Tipo = "ente" | "orgao" | "entidade";
type Dados = Record<string, any> & { tipo: Tipo };
const opts = (v: string[]) => v.map((label) => ({ label, value: label }));
const noError = () => null;
const etapas = [["Identificação Institucional", "Classificação, dados cadastrais e eSocial."], ["Localização e Contato", "Endereço oficial e canais institucionais."], ["Responsável e Dados Bancários", "Representante vigente e conta bancária."], ["Integrações", "Códigos externos. Preenchimento opcional."]];
const tipos = { ente: ["Ente Federativo", "Estado de Mato Grosso", "Ente Federativo", "Sim", "O próprio Ente Federativo"], orgao: ["Órgão", "SEPLAG, CGE, PM/MT", "Administração Direta", "Não", "Estado de Mato Grosso - GOV"], entidade: ["Entidade", "DETRAN, MTI, EMPAER", "Administração Indireta", "Sim", "Órgão de vinculação / supervisão"] };

export function OrgaosEntidadesCadastro() {
  const [etapa, setEtapa] = useState(0); const [maiorEtapa, setMaiorEtapa] = useState(0); const [eSocialAberto, setESocialAberto] = useState(true); const [feedback, setFeedback] = useState(""); const [erro, setErro] = useState("");
  const { control, watch, setValue } = useForm<Dados>({ defaultValues: { tipo: "orgao", enteSuperior: tipos.orgao[4], esferaGoverno: "Estadual", esferaPoder: "Executivo", forma: tipos.orgao[2], personalidade: tipos.orgao[3], estabelecimento: "Matriz", cnpj: "", razao: "", fantasia: "", sigla: "", natureza: "", situacao: "Ativa", cep: "", uf: "", municipio: "", bairro: "", tipoLogradouro: "", logradouro: "", numero: "", telefone: "", email: "", site: "" } });
  const tipo = watch("tipo"); const dados = watch(); const common = { control, getFormErrorMessage: noError };
  const dd = (name: string, label: string, values: string[], required = false) => <DropdownFieldSeplag name={name} label={label} required={required} showClear={!required} options={opts(values)} optionLabel="label" optionValue="value" {...common} />;
  const tx = (name: string, label: string, required = false, disabled = false) => <TextFieldSeplag name={name} label={label} required={required} disabled={disabled} {...common} />;
  const obrigatoriosPorEtapa = [
    ["enteSuperior", "esferaGoverno", "esferaPoder", "estabelecimento", "cnpj", "razao", "sigla", "abertura", "natureza", "cnae", "situacao", "tributaria", "registro", "desoneracao"],
    ["cep", "uf", "municipio", "bairro", "tipoLogradouro", "logradouro", "numero", "telefone", "email"],
    ["cpfResponsavel", "nomeResponsavel", "cargoResponsavel", "inicioResponsavel", "banco", "agencia", "conta"],
    [],
  ];
  const navegar = (n: number) => {
    if (n > maiorEtapa) return;
    setErro(""); setFeedback(""); setEtapa(Math.max(0, Math.min(3, n)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const avancar = () => {
    const faltantes = obrigatoriosPorEtapa[etapa].filter((campo) => !String(dados[campo] ?? "").trim());
    if (faltantes.length) { setErro("Preencha todos os campos obrigatórios desta etapa antes de avançar."); return; }
    const proxima = Math.min(3, etapa + 1); setErro(""); setMaiorEtapa((atual) => Math.max(atual, proxima)); setEtapa(proxima);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const selectType = (v: Tipo) => { setValue("tipo", v); setValue("forma", tipos[v][2]); setValue("personalidade", tipos[v][3]); setValue("enteSuperior", tipos[v][4]); };
  return <div className="orgao-page prototype-page-content">
    <header className="orgao-page-header"><span>Estrutura Organizacional</span><h1>Cadastrar - {tipos[tipo][0]}</h1></header>
    <nav className="orgao-stepper">{etapas.map(([t, d], i) => <button type="button" key={t} disabled={i > maiorEtapa} className={`${i === etapa ? "active" : ""} ${i < maiorEtapa ? "done" : ""}`} onClick={() => navegar(i)}><span className="orgao-step-number">{i < maiorEtapa ? <i className="pi pi-check" /> : i + 1}</span><strong>{t}</strong><small>{d}</small></button>)}</nav>
    {etapa > 0 && <div className="orgao-summary"><strong>{dados.sigla || "Sem sigla"} - {dados.razao || "Nome não informado"}</strong><span>{tipos[tipo][0]} • CNPJ {dados.cnpj || "não informado"} • {dados.esferaGoverno}</span></div>}
    {etapa === 0 && <><CardSeplag title="Classificação institucional" cols="12" legenda={() => <p className="orgao-description">Informe como este registro se enquadra na estrutura institucional.</p>}><div className="col-12 orgao-type-grid">{(Object.keys(tipos) as Tipo[]).map(v => <button type="button" role="radio" aria-checked={tipo === v} key={v} className={tipo === v ? "active" : ""} onClick={() => selectType(v)}><span /><strong>{tipos[v][0]}</strong><small>{tipos[v][1]}</small></button>)}</div><div className="col-12 orgao-grid cols-3">{dd("enteSuperior", "Ente superior", [tipos[tipo][4], "Outro ente superior"], true)}{dd("esferaGoverno", "Esfera de Governo", ["Federal", "Estadual", "Municipal"], true)}{dd("esferaPoder", "Esfera de Poder", ["Executivo", "Legislativo", "Judiciário"], true)}{tx("forma", "Forma de Administração", false, true)}{tx("personalidade", "Personalidade Jurídica Própria", false, true)}{dd("estabelecimento", "Tipo de Estabelecimento", ["Matriz", "Filial"], true)}</div></CardSeplag>
    <CardSeplag title="Identificação cadastral" cols="12"><div className="col-12 orgao-grid cols-4"><CNPJFieldSeplag name="cnpj" required validarCNPJ={false} {...common} />{tx("razao", "Nome/Razão Social", true)}{tx("fantasia", "Nome Fantasia")}{tx("sigla", "Sigla", true)}<DateFieldSeplag name="abertura" label="Data de Abertura" required {...common} /><DateFieldSeplag name="extincao" label="Data de Extinção" {...common} />{tx("inscricaoEstadual", "Inscrição Estadual")}{tx("inscricaoMunicipal", "Inscrição Municipal")}{dd("natureza", "Natureza Jurídica", ["Órgão Público do Poder Executivo Estadual"], true)}{dd("cnae", "Atividade Econômica Principal (CNAE)", ["8411-6/00 - Administração pública em geral"], true)}{dd("aplic", "Tipo do APLIC TCE/MT", ["Administração", "Gestão"])}</div></CardSeplag>
    <AccordionCardSeplag title="Informações para o eSocial" iconTitulo="pi pi-id-card" showIcon isOpen={eSocialAberto} onToggle={() => setESocialAberto((aberto) => !aberto)} className="col-12 orgao-esocial-accordion"><div className="orgao-grid cols-3">{dd("situacao", "Situação da Pessoa Jurídica", ["Ativa", "Baixada"], true)}{dd("tributaria", "Classificação Tributária", ["85 - Administração pública"], true)}{tx("siafi", "Número SIAFI")}{dd("registro", "Opção pelo Registro Eletrônico de Empregado", ["Sim", "Não"], true)}{dd("desoneracao", "Indicativo de Desoneração de Folha", ["Sim", "Não"], true)}<CNPJFieldSeplag name="cnpjEfr" label="CNPJ do Ente Federativo Responsável - EFR" validarCNPJ={false} {...common} /></div></AccordionCardSeplag></>}
    {etapa === 1 && <><CardSeplag title="Endereço" cols="12"><div className="col-12 orgao-grid cols-4">{tx("cep", "CEP", true)}{dd("uf", "UF", ["MT"], true)}{tx("municipio", "Município", true)}{tx("bairro", "Bairro/Distrito", true)}{dd("tipoLogradouro", "Tipo de Logradouro", ["Avenida", "Rua"], true)}{tx("logradouro", "Logradouro", true)}{tx("numero", "Número", true)}{tx("complemento", "Complemento")}</div></CardSeplag><CardSeplag title="Contato" cols="12"><div className="col-12 orgao-grid cols-3">{tx("telefone", "Telefone", true)}<EmailFieldSeplag name="email" label="E-mail institucional" required {...common} />{tx("site", "Website")}</div></CardSeplag></>}
    {etapa === 2 && <><CardSeplag title="Responsável" cols="12"><div className="col-12 orgao-grid cols-3">{tx("cpfResponsavel", "CPF", true)}{tx("nomeResponsavel", "Nome", true)}{dd("cargoResponsavel", "Cargo/Função", ["Secretário de Estado", "Presidente", "Governador"], true)}<DateFieldSeplag name="inicioResponsavel" label="Data Início" required {...common} /><DateFieldSeplag name="fimResponsavel" label="Data Fim" {...common} /></div></CardSeplag><CardSeplag title="Dados Bancários" cols="12"><div className="col-12 orgao-grid cols-4">{dd("banco", "Banco", ["001 - Banco do Brasil", "104 - Caixa"], true)}{tx("agencia", "Agência", true)}{tx("conta", "Conta", true)}{tx("dv", "DV")}</div></CardSeplag></>}
    {etapa === 3 && <CardSeplag title="Integrações" cols="12"><p className="col-12 orgao-description">Os códigos são opcionais e podem ser informados posteriormente.</p><div className="col-12 orgao-grid cols-3">{tx("arh", "Código ARH")}{tx("seap", "Código SEAP")}{tx("codigoAplic", "UO Fiplan / Código APLIC TCE")}</div></CardSeplag>}
    {erro && <div className="orgao-error"><i className="pi pi-exclamation-circle" /> {erro}</div>}{feedback && <div className="orgao-success"><i className="pi pi-check-circle" /> {feedback}</div>}<footer className="orgao-actions">{etapa === 0 ? <BotaoSeplag label="Cancelar" icon="pi pi-times" outlined onClick={() => history.back()} /> : <BotaoVoltarSeplag onClick={() => navegar(etapa - 1)} />}<div>{etapa === 3 && <BotaoSeplag label="Concluir sem integração" outlined onClick={() => setFeedback("Cadastro concluído sem integração.")} />}{etapa < 3 ? <BotaoSeplag label="Avançar" icon="pi pi-arrow-right" iconPos="right" onClick={avancar} /> : <BotaoSalvarSeplag label="Salvar cadastro" onClick={() => setFeedback("Cadastro salvo com sucesso.")} />}</div></footer>
  </div>;
}
