import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BotaoSalvarSeplag, BotaoSeplag, BotaoVoltarSeplag } from "@componentes/Botao";
import { CardSeplag } from "@componentes/Card";
import { DropdownFieldSeplag, TextAreaFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
import { menuGestaoPessoas, PrototypeSystemPage } from "../PrototiposPage";
import "./tiposUnidades.css";

type TipoUnidade={id:number;nome:string;descricao:string;niveis:string[];situacao:"Ativo"|"Inativo"};
type Filtro={pesquisa:string;situacao:string};
type Formulario={nome:string;descricao:string;situacao:"Ativo"|"Inativo"};
const noError=()=>null;
const situacoes=[{label:"Ativos",value:"Ativo"},{label:"Inativos",value:"Inativo"},{label:"Todos",value:""}];
const niveis=[
  ["I — Decisão Colegiada","Conselhos, comissões e colegiados"],
  ["II — Direção Superior","Gabinetes, Secretarias Adjuntas e Diretorias"],
  ["III — Apoio Estratégico e Especializado","NGER, Ouvidoria e unidades especializadas"],
  ["IV — Assessoramento Superior","Gabinetes de direção e unidades de assessoria"],
  ["V — Administração Sistêmica","Superintendências, Coordenadorias, Gerências e Núcleos"],
  ["VI — Execução Programática","Unidades responsáveis pelas atividades finalísticas"],
  ["VII — Administração Regionalizada","Estruturas regionais, quando previstas"],
  ["VIII — Administração Desconcentrada","Unidades desconcentradas, quando previstas"]
];
const iniciais:TipoUnidade[]=[
  {id:1,nome:"Conselho",descricao:"",niveis:[niveis[0][0]],situacao:"Ativo"},
  {id:2,nome:"Gabinete",descricao:"",niveis:[niveis[1][0],niveis[3][0]],situacao:"Ativo"},
  {id:3,nome:"Secretaria Adjunta",descricao:"",niveis:[niveis[1][0]],situacao:"Ativo"},
  {id:4,nome:"Superintendência",descricao:"",niveis:[niveis[4][0],niveis[5][0]],situacao:"Ativo"},
  {id:5,nome:"Coordenadoria",descricao:"",niveis:[niveis[4][0],niveis[5][0]],situacao:"Ativo"},
  {id:6,nome:"Gerência",descricao:"",niveis:[niveis[4][0],niveis[5][0]],situacao:"Ativo"},
  {id:7,nome:"Núcleo",descricao:"",niveis:[niveis[2][0],niveis[4][0],niveis[5][0]],situacao:"Ativo"}
];

export function PrototiposTiposUnidadesPage(){
  const [tipos,setTipos]=useState(iniciais); const [formAberto,setFormAberto]=useState(false); const [editando,setEditando]=useState<number|null>(null); const [selecionados,setSelecionados]=useState<string[]>([]); const [feedback,setFeedback]=useState("");
  const filtros=useForm<Filtro>({defaultValues:{pesquisa:"",situacao:"Ativo"}}); const formulario=useForm<Formulario>({defaultValues:{nome:"",descricao:"",situacao:"Ativo"}});
  const filtro=filtros.watch(); const dados=formulario.watch();
  const lista=useMemo(()=>tipos.filter(item=>(!filtro.pesquisa||item.nome.toLocaleLowerCase("pt-BR").includes(filtro.pesquisa.toLocaleLowerCase("pt-BR")))&&(!filtro.situacao||item.situacao===filtro.situacao)),[filtro,tipos]);
  const abrir=(item?:TipoUnidade)=>{setEditando(item?.id??null);setSelecionados(item?.niveis??[]);formulario.reset({nome:item?.nome??"",descricao:item?.descricao??"",situacao:item?.situacao??"Ativo"});setFeedback("");setFormAberto(true)};
  const fechar=()=>{setFormAberto(false);setEditando(null);setSelecionados([]);setFeedback("");formulario.reset()};
  const alternar=(nivel:string)=>setSelecionados(atual=>atual.includes(nivel)?atual.filter(item=>item!==nivel):[...atual,nivel]);
  const salvar=()=>{if(!dados.nome.trim()){setFeedback("Informe o nome do tipo de unidade.");return}if(!selecionados.length){setFeedback("Selecione pelo menos um nível organizacional.");return}const registro={id:editando??Date.now(),nome:dados.nome.trim(),descricao:dados.descricao.trim(),niveis:selecionados,situacao:dados.situacao};setTipos(atual=>editando?atual.map(item=>item.id===editando?registro:item):[...atual,registro]);setFormAberto(false);setFeedback(editando?"Tipo atualizado com sucesso.":"Tipo cadastrado com sucesso.")};
  return <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}><div className="tipos-unidades-page prototype-page-content">
    {!formAberto?<CardSeplag title="Tipos de Unidades" cols="12" legenda={()=><p className="tipos-unidades-desc">Cadastre os tipos que poderão ser utilizados na estrutura organizacional dos órgãos.</p>}>
      <div className="col-12 tipos-unidades-filtros"><div className="grid"><TextFieldSeplag name="pesquisa" label="Pesquisar" placeholder="Digite o nome do tipo" cols="12 8" control={filtros.control} getFormErrorMessage={noError}/><DropdownFieldSeplag name="situacao" label="Situação" cols="12 4" control={filtros.control} options={situacoes} optionLabel="label" optionValue="value" getFormErrorMessage={noError}/></div></div>
      <div className="col-12 tipos-unidades-table-section"><div className="tipos-unidades-table-toolbar"><BotaoSeplag label="Adicionar" icon="pi pi-plus" onClick={()=>abrir()}/></div><div className="tipos-unidades-table"><table><thead><tr><th>Tipo de unidade</th><th>Níveis permitidos</th><th>Situação</th><th>Ações</th></tr></thead><tbody>{lista.map(item=><tr key={item.id}><td><strong>{item.nome}</strong><small>Tipo parametrizado</small></td><td><div className="tipos-unidades-chips">{item.niveis.map(nivel=><span key={nivel}>{nivel}</span>)}</div></td><td><span className={`tipos-unidades-status ${item.situacao.toLowerCase()}`}>{item.situacao}</span></td><td><BotaoSeplag label="Editar" icon="pi pi-pencil" outlined onClick={()=>abrir(item)}/></td></tr>)}</tbody></table>{!lista.length&&<div className="tipos-unidades-empty">Nenhum tipo encontrado.</div>}</div></div>
    </CardSeplag>:<><header className="tipos-unidades-header"><span>Estrutura Organizacional › Tipos de Unidades › {editando?"Editar":"Cadastrar"}</span><h1>{editando?"Editar":"Cadastrar"} Tipo de Unidade</h1><p>Informe o tipo e defina em quais níveis da estrutura ele poderá ser utilizado.</p></header><div className="tipos-unidades-layout"><div>
      <CardSeplag title="Dados do tipo" cols="12" legenda={()=><p className="tipos-unidades-desc">Identifique o tipo de unidade que ficará disponível para os cadastros.</p>}><div className="grid"><TextFieldSeplag name="nome" label="Nome do tipo" required placeholder="Ex.: Superintendência" cols="12 8" control={formulario.control} getFormErrorMessage={noError}/><DropdownFieldSeplag name="situacao" label="Situação" cols="12 4" control={formulario.control} options={[{label:"Ativo",value:"Ativo"},{label:"Inativo",value:"Inativo"}]} optionLabel="label" optionValue="value" getFormErrorMessage={noError}/><TextAreaFieldSeplag name="descricao" label="Descrição" placeholder="Descreva, se necessário, a finalidade deste tipo de unidade." cols="12" control={formulario.control} getFormErrorMessage={noError}/></div></CardSeplag>
      <CardSeplag title="Níveis organizacionais permitidos" cols="12" legenda={()=><p className="tipos-unidades-desc">Selecione um ou mais níveis em que este tipo poderá ser utilizado no cadastro de unidades.</p>}><div className="tipos-unidades-levels">{niveis.map(([nivel,exemplo])=><label key={nivel} className={selecionados.includes(nivel)?"selected":""}><input type="checkbox" checked={selecionados.includes(nivel)} onChange={()=>alternar(nivel)}/><span><strong>{nivel}</strong><small>{exemplo}</small></span></label>)}</div><p className="tipos-unidades-help">Exemplo: “Superintendência” pode ser permitida em Administração Sistêmica e Execução Programática.</p></CardSeplag>
      {feedback&&<div className="tipos-unidades-feedback"><i className="pi pi-exclamation-circle"/> {feedback}</div>}<footer className="tipos-unidades-actions"><BotaoVoltarSeplag label="Cancelar" onClick={fechar}/><BotaoSalvarSeplag label="Salvar" onClick={salvar}/></footer>
    </div><aside className="tipos-unidades-summary"><h3>Resumo do cadastro</h3><div><small>Tipo de unidade</small><strong className={!dados.nome?"empty":""}>{dados.nome||"Não informado"}</strong><small>Situação</small><strong>{dados.situacao}</strong><small>Níveis selecionados</small>{selecionados.length?<div className="tipos-unidades-chips">{selecionados.map(nivel=><span key={nivel}>{nivel}</span>)}</div>:<strong className="empty">Nenhum nível selecionado</strong>}<p><b>Como será usado:</b><br/>Ao cadastrar uma Unidade Organizacional, o sistema exibirá este tipo somente quando o nível escolhido estiver entre os níveis permitidos aqui.</p></div></aside></div></>}
    {!formAberto&&feedback&&<div className="tipos-unidades-toast"><i className="pi pi-check-circle"/> {feedback}</div>}
  </div></PrototypeSystemPage>
}
