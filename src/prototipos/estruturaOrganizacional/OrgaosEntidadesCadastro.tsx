import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BadgeSeplag } from "@componentes/Badge";
import { BotaoSalvarSeplag, BotaoSeplag, BotaoVoltarSeplag } from "@componentes/Botao";
import { BreadcrumbSeplag } from "@componentes/Breadcrumb";
import { CardSeplag } from "@componentes/Card";
import { CNPJFieldSeplag, DateFieldSeplag, DropdownFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
import { PanelSeplag } from "@componentes/PanelSeplag";
import "./orgaosEntidades.css";
import "./orgaosEntidadesOverrides.css";

type TipoCadastro = "ente" | "orgao" | "externo";
type Classificacao = "orgao" | "entidade";
type Aba = "identificacao" | "localizacao" | "responsavel" | "integracoes";
type Dados = Record<string, string> & { tipoCadastro: TipoCadastro; classificacao: Classificacao };

export interface OrgaosEntidadesCadastroProps { onBack?: () => void; tipoInicial?: TipoCadastro }
const noError=()=>null;
const opts=(values:string[])=>values.map(value=>({label:value,value}));
const autoLabel=(texto:string)=><span className="orgao-auto-label">{texto}<BadgeSeplag label="AUTOMÁTICO" size="xs" color="#0870b6" bg="#e8f5ff"/></span>;

export function OrgaosEntidadesCadastro({tipoInicial="orgao",onBack}:Readonly<OrgaosEntidadesCadastroProps>){
  const [aba,setAba]=useState<Aba>("identificacao");
  const {control,watch,setValue}=useForm<Dados>({defaultValues:{
    tipoCadastro:tipoInicial,classificacao:"orgao",enteSuperior:"Estado de Mato Grosso - GOV",enteFederativo:"Estado de Mato Grosso - GOV",orgaoSuperior:"",esferaGoverno:"Estadual",esferaPoder:"Executivo",formaAdministracao:"Administração Direta",personalidade:"Não",estabelecimento:"Matriz",
    cnpj:"03.507.415/0011-16",razao:"Secretaria de Estado de Planejamento e Gestão",fantasia:"SEPLAG",sigla:"SEPLAG",dataAbertura:"2019-01-01",dataExtincao:"",inscricaoEstadual:"",inscricaoMunicipal:"",natureza:"Órgão Público do Poder Executivo Estadual",cnae:"8411-6/00",aplic:"Administração",
    situacao:"Ativa",classificacaoTributaria:"85 - Ente federativo...",siafi:"000001",registroEletronico:"Não aplicável",desoneracao:"Não aplicável",cnpjEfr:"03.507.415/0001-00",
    cep:"",uf:"MT",municipio:"",bairro:"",tipoLogradouro:"Avenida",logradouro:"",numero:"",complemento:"",telefone1:"",telefone2:"",website:"",email1:"",email2:"",
    responsavel:"",cargoFuncao:"",dataInicioResponsavel:"",banco:"",agencia:"",conta:"",digitoVerificador:"",
    codigoArh:"",codigoSeap:"",uoFiplan:"",codigoAplic:""
  }});
  const dados=watch(); const disabled=false; const common={control,getFormErrorMessage:noError};
  useEffect(()=>{
    setValue("personalidade",dados.formaAdministracao==="Administração Indireta"?"Sim":"Não");
  },[dados.formaAdministracao,setValue]);
  const abas:{id:Aba;label:string;descricao:string}[]=[
    {id:"identificacao",label:"Identificação Institucional",descricao:"Classificação, dados cadastrais e eSocial."},
    {id:"localizacao",label:"Localização e Contato",descricao:"Endereço e canais institucionais."},
    {id:"responsavel",label:"Responsável e Dados Bancários",descricao:"Responsável vigente e conta bancária."},
    {id:"integracoes",label:"Integrações",descricao:"Códigos externos e conclusão."},
  ];
  return <div className="orgao-cadastro-page prototype-page-content prototype-page-content--white">
    <CardSeplag cols="12" cardHeaderClassNames="orgao-cadastro-card" headerNavigation={<BreadcrumbSeplag divided items={[{label:"Cadastro"},{label:"Estrutura Organizacional"},{label:"Órgãos e Entidades"}]}/>} title={<div className="orgao-cadastro-title"><strong>{tipoInicial==="ente"?"Cadastro de Ente Federativo":"Cadastro de Órgãos"}</strong><small>Consulte as informações vigentes ou edite uma seção específica.</small></div>}>
      <nav className="orgao-stepper" style={{boxSizing:"border-box",gridColumn:"1 / -1",gridTemplateColumns:"repeat(4, minmax(0, 1fr))",maxWidth:"none",width:"100%"}} aria-label="Etapas do cadastro">{abas.map((item,index)=>{const atual=abas.findIndex(etapa=>etapa.id===aba);return <button type="button" key={item.id} className={index===atual?"active":index<atual?"done":""} aria-current={index===atual?"step":undefined} onClick={()=>setAba(item.id)}><span className="orgao-step-number">{index+1}</span><strong>{item.label}</strong><small>{item.descricao}</small></button>})}</nav>
      {aba==="identificacao"&&<div className="orgao-tab-content">
        <PanelSeplag title="Identificação cadastral" description="Dados oficiais de identificação do órgão ou entidade." className="orgao-form-section">
          <div className="orgao-fields-grid cols-4"><CNPJFieldSeplag name="cnpj" required validarCNPJ={false} disabled={disabled} {...common}/><TextFieldSeplag name="razao" label="Nome/Razão Social" required disabled={disabled} {...common}/><TextFieldSeplag name="fantasia" label="Nome Fantasia" disabled={disabled} {...common}/><TextFieldSeplag name="sigla" label="Sigla" required disabled={disabled} {...common}/><DateFieldSeplag name="dataAbertura" label="Data de Abertura" disabled={disabled} {...common}/><DateFieldSeplag name="dataExtincao" label="Data de Extinção" disabled={disabled} {...common}/><TextFieldSeplag name="inscricaoEstadual" label="Inscrição Estadual" disabled={disabled} {...common}/><TextFieldSeplag name="inscricaoMunicipal" label="Inscrição Municipal" disabled={disabled} {...common}/><DropdownFieldSeplag name="natureza" label="Natureza Jurídica" disabled={disabled} options={opts(["Órgão Público do Poder Executivo Estadual"])} optionLabel="label" optionValue="value" {...common}/><TextFieldSeplag name="cnae" label="CNAE principal" disabled={disabled} {...common}/><DropdownFieldSeplag name="aplic" label="Tipo do APLIC TCE/MT" disabled={disabled} options={opts(["Administração","Gestão"])} optionLabel="label" optionValue="value" {...common}/></div>
        </PanelSeplag>
        <PanelSeplag title="Classificação institucional" description="Defina o enquadramento institucional e os dados derivados do vínculo superior." className="orgao-form-section">
          <div className="orgao-fields-grid cols-3">{tipoInicial==="ente"?<div className="orgao-display-field"><span>Ente Superior</span><strong>{dados.enteSuperior}</strong></div>:<><DropdownFieldSeplag name="enteFederativo" label="Ente Federativo" required disabled={disabled} options={opts(["Estado de Mato Grosso - GOV"])} optionLabel="label" optionValue="value" {...common}/><DropdownFieldSeplag name="orgaoSuperior" label="Órgão superior" disabled={disabled} options={opts(["Governadoria do Estado","Casa Civil","Secretaria de Estado de Planejamento e Gestão - SEPLAG"])} optionLabel="label" optionValue="value" placeholder="Selecione, se houver" showClear {...common}/></>}<DropdownFieldSeplag name="esferaGoverno" label={autoLabel("Esfera de Governo")} disabled options={opts(["Estadual"])} optionLabel="label" optionValue="value" {...common}/><DropdownFieldSeplag name="esferaPoder" label={autoLabel("Esfera de Poder")} disabled options={opts(["Executivo"])} optionLabel="label" optionValue="value" {...common}/><DropdownFieldSeplag name="formaAdministracao" label="Forma de Administração" required disabled={disabled} options={opts(["Administração Direta","Administração Indireta"])} optionLabel="label" optionValue="value" {...common}/><TextFieldSeplag name="personalidade" label={autoLabel("Personalidade Jurídica Própria")} disabled {...common}/><DropdownFieldSeplag name="estabelecimento" label="Tipo de Estabelecimento" required disabled={disabled} options={opts(["Matriz","Filial"])} optionLabel="label" optionValue="value" {...common}/></div>
        </PanelSeplag>
        <PanelSeplag title="Informações para o eSocial" description="Dados utilizados nas obrigações do eSocial." className="orgao-form-section">
          <div className="orgao-fields-grid cols-3"><DropdownFieldSeplag name="situacao" label="Situação cadastral" disabled={disabled} options={opts(["Ativa","Baixada"])} optionLabel="label" optionValue="value" {...common}/><DropdownFieldSeplag name="classificacaoTributaria" label="Classificação Tributária" disabled={disabled} options={opts(["85 - Ente federativo..."])} optionLabel="label" optionValue="value" {...common}/><TextFieldSeplag name="siafi" label="Número SIAFI" disabled={disabled} {...common}/><DropdownFieldSeplag name="registroEletronico" label="Registro Eletrônico" disabled={disabled} options={opts(["Não aplicável","Sim","Não"])} optionLabel="label" optionValue="value" {...common}/><DropdownFieldSeplag name="desoneracao" label="Desoneração da Folha" disabled={disabled} options={opts(["Não aplicável","Sim","Não"])} optionLabel="label" optionValue="value" {...common}/><CNPJFieldSeplag name="cnpjEfr" label={autoLabel("CNPJ do EFR")} validarCNPJ={false} disabled {...common}/></div>
        </PanelSeplag>
        <div className="orgao-step-actions">
          <BotaoSeplag type="button" label="Cancelar" outlined onClick={onBack}/>
          <BotaoSeplag type="button" label="Avançar" icon="pi pi-arrow-right" iconPos="right" onClick={()=>setAba("localizacao")}/>
        </div>
      </div>}
      {aba==="localizacao"&&<div className="orgao-tab-content">
        <PanelSeplag title="Endereço" description="Informe o endereço institucional." className="orgao-form-section">
          <div className="orgao-fields-grid cols-4">
            <TextFieldSeplag name="cep" control={control} label="CEP" required maxLength={9} getFormErrorMessage={noError}/>
            <DropdownFieldSeplag name="uf" control={control} label="UF" required options={opts(["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"])} optionLabel="label" optionValue="value" getFormErrorMessage={noError}/>
            <TextFieldSeplag name="municipio" control={control} label="Município" required getFormErrorMessage={noError}/>
            <TextFieldSeplag name="bairro" control={control} label="Bairro/Distrito" required getFormErrorMessage={noError}/>
            <DropdownFieldSeplag name="tipoLogradouro" control={control} label="Tipo de Logradouro" options={opts(["Avenida","Rua","Rodovia","Praça","Travessa","Estrada","Alameda"])} optionLabel="label" optionValue="value" getFormErrorMessage={noError}/>
            <TextFieldSeplag name="logradouro" control={control} label="Logradouro" required getFormErrorMessage={noError}/>
            <TextFieldSeplag name="numero" control={control} label="Número" required getFormErrorMessage={noError}/>
            <TextFieldSeplag name="complemento" control={control} label="Complemento" getFormErrorMessage={noError}/>
          </div>
        </PanelSeplag>
        <PanelSeplag title="Contato" description="Informe os canais institucionais." className="orgao-form-section">
          <div className="orgao-fields-grid cols-3">
            <TextFieldSeplag name="telefone1" control={control} label="Telefone 1" maxLength={15} getFormErrorMessage={noError}/>
            <TextFieldSeplag name="telefone2" control={control} label="Telefone 2" maxLength={15} getFormErrorMessage={noError}/>
            <TextFieldSeplag name="website" control={control} label="Website" getFormErrorMessage={noError}/>
            <TextFieldSeplag name="email1" control={control} label="E-mail 1" getFormErrorMessage={noError}/>
            <TextFieldSeplag name="email2" control={control} label="E-mail 2" getFormErrorMessage={noError}/>
          </div>
        </PanelSeplag>
        <div className="orgao-step-actions">
          <BotaoVoltarSeplag type="button" onClick={()=>setAba("identificacao")}/>
          <BotaoSeplag type="button" label="Avançar" icon="pi pi-arrow-right" iconPos="right" onClick={()=>setAba("responsavel")}/>
        </div>
      </div>}{aba==="responsavel"&&<div className="orgao-tab-content">
        <PanelSeplag title="Responsável" description="Selecione o responsável vigente." className="orgao-form-section">
          <div className="orgao-fields-grid cols-3">
            <DropdownFieldSeplag name="responsavel" control={control} label="Responsável" required options={opts(["Ana Paula Ferreira","Carlos Eduardo Silva","Mariana Souza Oliveira"])} optionLabel="label" optionValue="value" placeholder="Selecione..." getFormErrorMessage={noError}/>
            <DropdownFieldSeplag name="cargoFuncao" control={control} label="Cargo/Função" required options={opts(["Secretário de Estado","Secretário Adjunto","Presidente","Diretor","Coordenador"])} optionLabel="label" optionValue="value" placeholder="Selecione..." getFormErrorMessage={noError}/>
            <DateFieldSeplag name="dataInicioResponsavel" control={control} label="Data de Início" required getFormErrorMessage={noError}/>
          </div>
        </PanelSeplag>
        <PanelSeplag title="Dados bancários" description="Informe os dados bancários." className="orgao-form-section">
          <div className="orgao-fields-grid cols-4">
            <DropdownFieldSeplag name="banco" control={control} label="Banco" options={opts(["001 - Banco do Brasil","104 - Caixa Econômica Federal","237 - Bradesco","341 - Itaú Unibanco","748 - Sicredi"])} optionLabel="label" optionValue="value" placeholder="Selecione..." showClear getFormErrorMessage={noError}/>
            <TextFieldSeplag name="agencia" control={control} label="Agência" maxLength={10} getFormErrorMessage={noError}/>
            <TextFieldSeplag name="conta" control={control} label="Conta" maxLength={20} getFormErrorMessage={noError}/>
            <TextFieldSeplag name="digitoVerificador" control={control} label="DV" maxLength={2} getFormErrorMessage={noError}/>
          </div>
        </PanelSeplag>
        <div className="orgao-step-actions">
          <BotaoVoltarSeplag type="button" onClick={()=>setAba("localizacao")}/>
          <BotaoSeplag type="button" label="Avançar" icon="pi pi-arrow-right" iconPos="right" onClick={()=>setAba("integracoes")}/>
        </div>
      </div>}{aba==="integracoes"&&<div className="orgao-tab-content">
        <PanelSeplag title="Integrações" description="Preenchimento opcional." className="orgao-form-section">
          <div className="orgao-fields-grid cols-4">
            <TextFieldSeplag name="codigoArh" control={control} label="Código ARH" getFormErrorMessage={noError}/>
            <TextFieldSeplag name="codigoSeap" control={control} label="Código SEAP" getFormErrorMessage={noError}/>
            <TextFieldSeplag name="uoFiplan" control={control} label="UO Fiplan" getFormErrorMessage={noError}/>
            <TextFieldSeplag name="codigoAplic" control={control} label="Código APLIC" getFormErrorMessage={noError}/>
          </div>
        </PanelSeplag>
        <div className="orgao-step-actions">
          <BotaoVoltarSeplag type="button" onClick={()=>setAba("responsavel")}/>
          <BotaoSalvarSeplag type="button" label="Salvar cadastro" onClick={()=>{}}/>
        </div>
      </div>}
    </CardSeplag>
  </div>;
}
