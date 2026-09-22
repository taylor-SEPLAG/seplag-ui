import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { AppProfileSeplag } from "@componentes/layout/AppProfile/AppProfile";
import type { IVinculoSeplag } from "@componentes/layout/Config/menu";
import "@componentes/layout/layout/Layout.css";
import "primereact/resources/themes/saga-blue/theme.css";

// ---------------------------------------------------------------------------
// Dados de exemplo
// ---------------------------------------------------------------------------

const exampleVinculos: IVinculoSeplag[] = [
  {
    numrVinculo: "001",
    statVinculo: "ATIVO",
    unidade: { descUnidade: "STI" },
    orgao: { descOrgao: "SEPLAG" },
  },
  {
    numrVinculo: "002",
    statVinculo: "ATIVO",
    unidade: { descUnidade: "Coordenadoria de Sistemas" },
    orgao: { descOrgao: "SEPLAG" },
  },
];

// ---------------------------------------------------------------------------
// Seções
// ---------------------------------------------------------------------------

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "Clique no nome do usuário para expandir as ações de perfil (alterar senha, trocar vínculo, sair).",
    example: (
      <div
        style={{
          background: "#005494",
          padding: "1.5rem",
          borderRadius: 8,
          display: "inline-block",
          minWidth: 220,
        }}
      >
        <AppProfileSeplag
          nomeApresentacao="João da Silva"
          numrVinculoAtual="001"
          vinculos={exampleVinculos}
          onLogout={() => alert("Logout acionado")}
          onAlterarSenha={(atual, nova, confirma) =>
            alert(`Alterar senha:\nAtual: ${atual}\nNova: ${nova}\nConfirma: ${confirma}`)
          }
          onSelecionarVinculo={(v) => alert(`Vínculo selecionado: ${v.numrVinculo}`)}
        />
      </div>
    ),
    code: `import { AppProfileSeplag } from "@seplag/ui-lib-react-18";
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
/>`,
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

const props: DocProp[] = [
  {
    name: "nomeApresentacao",
    type: "string",
    required: true,
    description: "Nome do usuário exibido no perfil.",
  },
  {
    name: "numrVinculoAtual",
    type: "string | number",
    required: true,
    description: "Número do vínculo atualmente selecionado.",
  },
  {
    name: "vinculos",
    type: "IVinculoSeplag[]",
    required: true,
    description: "Lista de vínculos disponíveis para seleção.",
  },
  {
    name: "avatarSrc",
    type: "string",
    description: "URL da imagem de avatar. Usa um avatar padrão quando omitido.",
  },
  {
    name: "onLogout",
    type: "() => void",
    required: true,
    description: "Callback chamado ao clicar em Sair.",
  },
  {
    name: "onAlterarSenha",
    type: "(senhaAtual: string, senhaNova: string, confirmarSenha: string) => void",
    required: true,
    description: "Callback chamado ao confirmar a alteração de senha.",
  },
  {
    name: "onSelecionarVinculo",
    type: "(vinculo: IVinculoSeplag) => void",
    required: true,
    description: "Callback chamado ao confirmar a troca de vínculo.",
  },
];

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default function AppProfileDoc() {
  return (
    <DocPage
      title="AppProfile"
      description="Componente de perfil do usuário no menu lateral. Exibe avatar, nome e vínculo atual, com ações para alterar senha e trocar de vínculo."
      badge="Estável"
      since="v0.0.1"
      importStatement={`import { AppProfileSeplag } from "@seplag/ui-lib-react-18";\nimport type { IVinculoSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
