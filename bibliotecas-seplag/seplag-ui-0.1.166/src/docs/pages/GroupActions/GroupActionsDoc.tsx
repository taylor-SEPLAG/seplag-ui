import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { GroupActionsSeplag } from "@componentes/GroupActions";
import "primereact/resources/themes/saga-blue/theme.css";

const fullPermissions = {
  podeVisualizar: true,
  podeEditar: true,
  podeIncluir: true,
  podeDeletar: true,
};
const readonlyPermissions = {
  podeVisualizar: true,
  podeEditar: false,
  podeIncluir: false,
  podeDeletar: false,
};
const editOnlyPermissions = {
  podeVisualizar: true,
  podeEditar: true,
  podeIncluir: false,
  podeDeletar: false,
};

const sections: DocSection[] = [
  {
    title: "Permissões completas",
    description:
      "Quando o usuário possui todas as permissões, os três ícones (Editar, Duplicar, Excluir) são exibidos.",
    example: (
      <GroupActionsSeplag
        permissions={fullPermissions}
        onEdit={() => alert("Editar")}
        onDuplicate={() => alert("Duplicar")}
        onDelete={() => alert("Excluído!")}
        deleteMessage="Deseja realmente remover este item?"
      />
    ),
    code: `import { GroupActionsSeplag } from "@seplag/ui-lib-react-18";

<GroupActionsSeplag
  permissions={{ podeEditar: true, podeIncluir: true, podeDeletar: true }}
  onEdit={() => handleEdit(row)}
  onDuplicate={() => handleDuplicate(row)}
  onDelete={() => handleDelete(row)}
/>`,
  },
  {
    title: "Somente edição",
    description: "Apenas os botões correspondentes às permissões concedidas aparecem.",
    example: (
      <GroupActionsSeplag permissions={editOnlyPermissions} onEdit={() => alert("Editar")} />
    ),
    code: `<GroupActionsSeplag
  permissions={{ podeEditar: true, podeIncluir: false, podeDeletar: false }}
  onEdit={() => handleEdit(row)}
/>`,
  },
  {
    title: "Sem permissões",
    description: "Nenhum botão é renderizado quando todas as permissões estão negadas.",
    example: (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <GroupActionsSeplag permissions={readonlyPermissions} />
        <span style={{ fontSize: "0.85rem", color: "#6c757d" }}>(nenhum botão renderizado)</span>
      </div>
    ),
    code: `<GroupActionsSeplag
  permissions={{ podeEditar: false, podeIncluir: false, podeDeletar: false }}
/>`,
  },
];

const props: DocProp[] = [
  {
    name: "permissions",
    type: "IPermissionResponseSeplag",
    required: true,
    description:
      "Objeto de permissões: { podeVisualizar, podeEditar, podeIncluir, podeDeletar }. Controla quais ações podem ser exibidas (é necessário também fornecer o callback correspondente para cada ação).",
  },
  {
    name: "onEdit",
    type: "() => void",
    required: false,
    description:
      "Callback chamado ao confirmar a ação de editar. O botão só é renderizado se `podeEditar` for true e este callback for fornecido.",
  },
  {
    name: "onDuplicate",
    type: "() => void",
    required: false,
    description:
      "Callback chamado ao acionar Duplicar. O botão só é renderizado se `podeIncluir` for true e este callback for fornecido.",
  },
  {
    name: "onDelete",
    type: "() => void",
    required: false,
    description:
      "Callback chamado quando a exclusão é confirmada. O botão só é renderizado se `podeDeletar` for true e este callback for fornecido. Ao clicar, abre um modal de confirmação antes de chamar o callback.",
  },
  {
    name: "deleteMessage",
    type: "string",
    required: false,
    description: "Mensagem personalizada no modal de confirmação de exclusão.",
  },
  {
    name: "rowId",
    type: "string | number",
    required: false,
    description:
      "Identificador do registro da linha. Usado para compor id/data-testid únicos por linha nos botões de ação (editar, duplicar, excluir) e no modal de exclusão, evitando colisão quando o componente é renderizado repetidamente em uma tabela.",
  },
];

export default function GroupActionsDoc() {
  return (
    <DocPage
      title="GroupActions"
      description="Agrupa os botões de ação por linha (Editar, Duplicar, Excluir) com controle de visibilidade por permissão. Ideal para uso em tabelas e listagens."
      badge="Estável"
      since="v0.0.1"
      importStatement={`import { GroupActionsSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
