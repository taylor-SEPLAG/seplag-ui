import{t as e}from"./jsx-runtime--AOyvnT1.js";/* empty css              *//* empty css               */import{t}from"./AppProfile-D9St9SYn.js";import{t as n}from"./DocPage-DNS5xyAT.js";var r=e(),i=[{title:`Playground`,description:`Clique no nome do usuário para expandir as ações de perfil (alterar senha, trocar vínculo, sair).`,example:(0,r.jsx)(`div`,{style:{background:`#005494`,padding:`1.5rem`,borderRadius:8,display:`inline-block`,minWidth:220},children:(0,r.jsx)(t,{nomeApresentacao:`João da Silva`,numrVinculoAtual:`001`,vinculos:[{numrVinculo:`001`,statVinculo:`ATIVO`,unidade:{descUnidade:`STI`},orgao:{descOrgao:`SEPLAG`}},{numrVinculo:`002`,statVinculo:`ATIVO`,unidade:{descUnidade:`Coordenadoria de Sistemas`},orgao:{descOrgao:`SEPLAG`}}],onLogout:()=>alert(`Logout acionado`),onAlterarSenha:(e,t,n)=>alert(`Alterar senha:\nAtual: ${e}\nNova: ${t}\nConfirma: ${n}`),onSelecionarVinculo:e=>alert(`Vínculo selecionado: ${e.numrVinculo}`)})}),code:`import { AppProfileSeplag } from "@seplag/ui-lib-react-18";
import type { IVinculoSeplag } from "@seplag/ui-lib-react-18";

const vinculos: IVinculoSeplag[] = [
  {
    numrVinculo: "001",
    statVinculo: "ATIVO",
    unidade: { descUnidade: "STI" },
    orgao: { descOrgao: "SEPLAG" },
  },
];

<AppProfileSeplag
  nomeApresentacao="João da Silva"
  numrVinculoAtual="001"
  vinculos={vinculos}
  avatarSrc="/caminho/para/foto.jpg"
  onLogout={() => console.log("logout")}
  onAlterarSenha={(atual, nova, confirma) => console.log(atual, nova, confirma)}
  onSelecionarVinculo={(vinculo) => console.log(vinculo)}
/>`}],a=[{name:`nomeApresentacao`,type:`string`,required:!0,description:`Nome do usuário exibido no perfil.`},{name:`numrVinculoAtual`,type:`string | number`,required:!0,description:`Número do vínculo atualmente selecionado.`},{name:`vinculos`,type:`IVinculoSeplag[]`,required:!0,description:`Lista de vínculos disponíveis para seleção.`},{name:`avatarSrc`,type:`string`,description:`URL da imagem de avatar. Usa um avatar padrão quando omitido.`},{name:`onLogout`,type:`() => void`,required:!0,description:`Callback chamado ao clicar em Sair.`},{name:`onAlterarSenha`,type:`(senhaAtual: string, senhaNova: string, confirmarSenha: string) => void`,required:!0,description:`Callback chamado ao confirmar a alteração de senha.`},{name:`onSelecionarVinculo`,type:`(vinculo: IVinculoSeplag) => void`,required:!0,description:`Callback chamado ao confirmar a troca de vínculo.`}];function o(){return(0,r.jsx)(n,{title:`AppProfile`,description:`Componente de perfil do usuário no menu lateral. Exibe avatar, nome e vínculo atual, com ações para alterar senha e trocar de vínculo.`,badge:`Estável`,since:`v0.0.1`,importStatement:`import { AppProfileSeplag } from "@seplag/ui-lib-react-18";
import type { IVinculoSeplag } from "@seplag/ui-lib-react-18";`,sections:i,props:a})}export{o as default};