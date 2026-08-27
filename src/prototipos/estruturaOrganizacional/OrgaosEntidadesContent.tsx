import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { BotaoLimparFiltroSeplag, BotaoSalvarSeplag, BotaoSeplag, BotaoVoltarSeplag } from "@componentes/Botao";
import { BreadcrumbSeplag } from "@componentes/Breadcrumb";
import { CardSeplag } from "@componentes/Card";
import { CNPJFieldSeplag, DropdownFieldSeplag, RadioButtonFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
import { ModalSeplag } from "@componentes/Modal";
import { PanelSeplag } from "@componentes/PanelSeplag";
import { TablePaginadoSeplag, type ColumnMetaSeplag } from "@componentes/TablePaginado";
import type { ResultsSeplag } from "@interfaces/Results";
import { OrgaosEntidadesCadastro } from "./OrgaosEntidadesCadastro";
import "./orgaosEntidades.css";

type Registro = { id:number; nome:string; sigla:string; cnpj:string; tipo:string; classificacao:string; esfera:string };
type Filtros = { busca:string; tipo:string; classificacao:string };
const registros:Registro[] = [
  {id:1,nome:"Estado de Mato Grosso",sigla:"GOV",cnpj:"03.507.415/0001-00",tipo:"Ente Federativo",classificacao:"Ente Federativo",esfera:"Estadual"},
  {id:2,nome:"Secretaria de Estado de Planejamento e Gestão",sigla:"SEPLAG",cnpj:"03.507.415/0011-16",tipo:"Órgão",classificacao:"Administração Direta",esfera:"Estadual"},
  {id:3,nome:"Departamento Estadual de Trânsito",sigla:"DETRAN-MT",cnpj:"03.829.702/0001-70",tipo:"Entidade",classificacao:"Autarquia",esfera:"Estadual"},
  {id:4,nome:"Assembleia Legislativa do Estado de Mato Grosso",sigla:"ALMT",cnpj:"03.929.049/0001-11",tipo:"Órgão Externo",classificacao:"Órgão Externo",esfera:"Estadual"},
  {id:5,nome:"Controladoria Geral do Estado",sigla:"CGE",cnpj:"03.507.415/0024-30",tipo:"Órgão",classificacao:"Administração Direta",esfera:"Estadual"},
  {id:6,nome:"Empresa Mato-grossense de Tecnologia da Informação",sigla:"MTI",cnpj:"15.011.059/0001-52",tipo:"Entidade",classificacao:"Empresa Pública",esfera:"Estadual"},
];
const opts=(v:string[])=>v.map(value=>({label:value,value}));
const noError=()=>null;

function CadastroOrgaoExterno() {
  const navigate=useNavigate();
  const {control}=useForm<Record<string,string>>({defaultValues:{sigla:"",cnpj:"",descricao:"",tipoOrgao:"",cep:"",uf:"MT",municipio:"",bairro:"",tipoLogradouro:"Avenida",logradouro:"",numero:"",complemento:"",telefone1:"",telefone2:"",website:"",email1:"",email2:""}});
  const common={control,getFormErrorMessage:noError};
  return <div className="orgao-cadastro-page prototype-page-content prototype-page-content--white">
    <CardSeplag
      cols="12"
      cardHeaderClassNames="orgao-cadastro-card"
      headerNavigation={<BreadcrumbSeplag divided items={[{label:"Cadastro"},{label:"Estrutura Organizacional"},{label:"Órgãos e Entidades"},{label:"Cadastrar Órgão Externo"}]}/>}
      title={<div className="orgao-cadastro-title"><strong>Cadastrar - Órgão Externo</strong><small>Cadastro simplificado com os campos necessários para referência no SIGEP.</small></div>}
    >
      <div className="orgao-external-form">
        <PanelSeplag title="Detalhes" description="Informe os dados principais do órgão externo." className="orgao-form-section">
          <div className="orgao-fields-grid cols-2">
            <TextFieldSeplag name="sigla" label="Sigla" required placeholder="Ex.: INVEST MT" {...common}/>
            <CNPJFieldSeplag name="cnpj" required validarCNPJ={false} {...common}/>
            <TextFieldSeplag name="descricao" label="Descrição" required placeholder="Informe a descrição" {...common}/>
            <DropdownFieldSeplag name="tipoOrgao" label="Tipo de órgão" required options={opts(["Órgão público","Entidade privada","Organização social","Instituição de ensino","Outro"])} optionLabel="label" optionValue="value" placeholder="Selecione..." {...common}/>
          </div>
        </PanelSeplag>
        <PanelSeplag title="Endereço" description="Informe o endereço institucional." className="orgao-form-section">
          <div className="orgao-fields-grid cols-4">
            <TextFieldSeplag name="cep" label="CEP" required maxLength={9} {...common}/>
            <DropdownFieldSeplag name="uf" label="UF" required options={opts(["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"])} optionLabel="label" optionValue="value" {...common}/>
            <TextFieldSeplag name="municipio" label="Município" required {...common}/>
            <TextFieldSeplag name="bairro" label="Bairro/Distrito" required {...common}/>
            <DropdownFieldSeplag name="tipoLogradouro" label="Tipo de Logradouro" options={opts(["Avenida","Rua","Rodovia","Praça","Travessa","Estrada","Alameda"])} optionLabel="label" optionValue="value" {...common}/>
            <TextFieldSeplag name="logradouro" label="Logradouro" required {...common}/>
            <TextFieldSeplag name="numero" label="Número" required {...common}/>
            <TextFieldSeplag name="complemento" label="Complemento" {...common}/>
          </div>
        </PanelSeplag>
        <PanelSeplag title="Contato" description="Informe os canais institucionais." className="orgao-form-section">
          <div className="orgao-fields-grid cols-3">
            <TextFieldSeplag name="telefone1" label="Telefone 1" maxLength={15} {...common}/>
            <TextFieldSeplag name="telefone2" label="Telefone 2" maxLength={15} {...common}/>
            <TextFieldSeplag name="website" label="Website" {...common}/>
            <TextFieldSeplag name="email1" label="E-mail 1" {...common}/>
            <TextFieldSeplag name="email2" label="E-mail 2" {...common}/>
          </div>
        </PanelSeplag>
        <div className="orgao-step-actions"><BotaoVoltarSeplag type="button" onClick={()=>navigate(-1)}/><BotaoSalvarSeplag type="button" label="Salvar cadastro" onClick={()=>{}}/></div>
      </div>
    </CardSeplag>
  </div>;
}

export function OrgaosEntidadesContent({modo="lista"}:Readonly<{modo?:"lista"|"ente"|"orgao"|"externo"}>){
  const navigate=useNavigate();
  const [modalAdicionar,setModalAdicionar]=useState(false); const [pagina,setPagina]=useState(0);
  const {control,watch,reset}=useForm<Filtros>({defaultValues:{busca:"",tipo:"",classificacao:""}}); const f=watch(); const rows=5;
  const {control:controlTipo,watch:watchTipo,reset:resetTipo}=useForm<{tipoCadastro:"ente"|"orgao"|"externo"}>({defaultValues:{tipoCadastro:"orgao"}}); const tipoCadastro=watchTipo("tipoCadastro");
  const filtrados=useMemo(()=>registros.filter(r=>{const q=f.busca.trim().toLowerCase();return (!q||[r.nome,r.sigla,r.cnpj].some(v=>v.toLowerCase().includes(q)))&&(!f.tipo||r.tipo===f.tipo)&&(!f.classificacao||r.classificacao===f.classificacao)}),[f.busca,f.tipo,f.classificacao]);
  const content=filtrados.slice(pagina*rows,pagina*rows+rows);
  const data:ResultsSeplag<Registro>={content,last:(pagina+1)*rows>=filtrados.length,totalPages:Math.ceil(filtrados.length/rows),pageActual:pagina,sizePage:rows,totalRecords:filtrados.length,size:content.length,number:pagina,first:pagina===0,numberOfElements:content.length,empty:!content.length};
  const columns:ColumnMetaSeplag<Registro>[]=[
    {header:"Nome / Sigla",body:r=><div className="orgao-name-cell"><strong>{r.nome}</strong><span>{r.sigla}</span></div>},{header:"CNPJ",field:"cnpj"},
    {header:"Tipo de registro",body:r=><span className="orgao-type-badge">{r.tipo}</span>},{header:"Classificação",field:"classificacao"},{header:"Esfera",field:"esfera"}
  ];
  if(modo==="ente") return <OrgaosEntidadesCadastro tipoInicial="ente" onBack={()=>navigate(-1)}/>;
  if(modo==="orgao") return <OrgaosEntidadesCadastro tipoInicial="orgao" onBack={()=>navigate(-1)}/>;
  if(modo==="externo") return <CadastroOrgaoExterno/>;
  const common={control,getFormErrorMessage:noError};
  const abrirAdicionar=()=>{resetTipo({tipoCadastro:"orgao"});setModalAdicionar(true)};
  const continuarCadastro=()=>{
    setModalAdicionar(false);
    const destinos={ente:"cadastro-ente-federativo",orgao:"cadastro-orgao-entidade",externo:"cadastro-orgao-externo"};
    navigate(`/prototipos/sigep/gestao/cadastro/estrutura-organizacional/orgao-entidade/${destinos[tipoCadastro]}`);
  };
  return <div className="orgao-page orgao-list-page prototype-page-content prototype-page-content--white">
    <CardSeplag title="Órgãos e Entidades" cols="12" cardHeaderClassNames="prototype-carreira-card orgao-list-card" headerNavigation={<BreadcrumbSeplag divided items={[{label:"Cadastro"},{label:"Estrutura Organizacional"},{label:"Órgãos e Entidades"}]}/>}>
      <div className="prototype-category-filters prototype-carreira-filters orgao-list-filters grid">
        <TextFieldSeplag name="busca" label="Órgão ou Entidade (Nome, Sigla, CNPJ)" cols="12 6 5" placeholder="Nome, sigla ou CNPJ" {...common}/>
        <DropdownFieldSeplag name="tipo" label="Tipo de registro" cols="12 6 3" options={opts(["Ente Federativo","Órgão","Entidade","Órgão Externo"])} optionLabel="label" optionValue="value" placeholder="Selecione..." showClear {...common}/>
        <DropdownFieldSeplag name="classificacao" label="Classificação" cols="12 6 2" options={opts(["Ente Federativo","Administração Direta","Autarquia","Empresa Pública","Órgão Externo"])} optionLabel="label" optionValue="value" placeholder="Selecione..." showClear {...common}/>
        <div className="prototype-category-clear col-12 md:col-6 lg:col-2"><BotaoLimparFiltroSeplag type="button" label="Limpar Filtro" icon="pi pi-refresh" onClick={()=>{reset();setPagina(0)}}/></div>
      </div>
      <div className="prototype-category-table orgao-list-table"><TablePaginadoSeplag dataKey="id" data={data} rows={rows} rowsPerPage={[rows]} columns={columns} lazy paginator selectionMode={null} hasEventoAcao handleAdicionar={abrirAdicionar} handleOnPageChange={e=>setPagina(Math.floor((e.first??0)/(e.rows??rows)))} handleView={()=>navigate("/prototipos/sigep/gestao/cadastro/estrutura-organizacional/orgao-entidade/cadastro-orgao-entidade")} extraAcoesSplit={()=>[{label:"Editar",icon:"pi pi-pencil",command:()=>navigate("/prototipos/sigep/gestao/cadastro/estrutura-organizacional/orgao-entidade/cadastro-orgao-entidade")},{label:"Inativar",icon:"pi pi-ban",command:()=>{}}]}/></div>
    </CardSeplag>
    <ModalSeplag visible={modalAdicionar} titulo={<div className="orgao-add-modal-title"><strong>O que deseja adicionar?</strong><small>Selecione o tipo de registro para iniciar o cadastro.</small></div>} fechar={()=>setModalAdicionar(false)} tamanho="min(760px, calc(100vw - 32px))" customFooter={<div className="orgao-add-modal-actions"><BotaoSeplag label="Cancelar" outlined style={{border:"1px solid #1687c9",color:"#0870b6",background:"#fff"}} onClick={()=>setModalAdicionar(false)}/><BotaoSeplag label="Continuar" onClick={continuarCadastro}/></div>}>
      <div className="col-12 orgao-add-modal-content"><RadioButtonFieldSeplag name="tipoCadastro" control={controlTipo} variant="cards" getFormErrorMessage={noError} options={[
        {label:"Ente Federativo",value:"ente",description:"Utilizado para o ente raiz, como o Estado de Mato Grosso."},
        {label:"Órgãos e Entidades",value:"orgao",description:"Cadastro de órgãos da Administração Direta e entidades da Administração Indireta."},
        {label:"Órgãos Externos",value:"externo",description:"Cadastro simplificado de instituições utilizadas como referência externa ao escopo de gestão."}
      ]}/></div>
    </ModalSeplag>
  </div>;
}
