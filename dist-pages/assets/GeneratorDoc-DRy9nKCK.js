import{t as e}from"./jsx-runtime--AOyvnT1.js";/* empty css              */import{t}from"./DocPage-DNS5xyAT.js";var n=e(),r=[{title:`Parâmetros do comando`,description:`Descrição de cada argumento aceito pelo gerador.`,example:null,code:`Argumento         Obrigatório   Descrição
─────────────────────────────────────────────────────────────────────
NomePascalCase    Sim           Nome da entidade em PascalCase.
                                Ex: TipoDocumento, Cargo, Municipio

endpoint          Não           Segmento de URL usado nas chamadas REST.
                                Ex: tipo-documento  →  /v1/tipo-documento/...
                                Se omitido, é derivado automaticamente
                                do nome em kebab-case.

"Descrição"       Não           Texto legível exibido nos títulos das páginas.
                                Use aspas se tiver espaços.
                                Ex: "Tipo de Documento"
                                Se omitido, usa o próprio nome.

--force / -f      Não           Sobrescreve arquivos já existentes.
                                Sem essa flag, arquivos existentes são pulados.`},{title:`Exemplos de uso`,description:`Casos comuns de invocação do gerador.`,example:null,code:`# Mínimo — apenas o nome (endpoint e descrição derivados automaticamente)
npx seplag-generate Cargo
# URLs geradas: /v1/cargo/...

# Com endpoint customizado (quando o path da API difere do nome da entidade)
npx seplag-generate TipoDocumento tipo-documento
# URLs geradas: /v1/tipo-documento/...

# Com endpoint e descrição legível
npx seplag-generate TipoDocumento tipo-documento "Tipo de Documento"

# Regenerar sobrescrevendo arquivos existentes
npx seplag-generate TipoDocumento tipo-documento "Tipo de Documento" --force`},{title:`Arquivos gerados`,description:`Para o exemplo npx seplag-generate TipoDocumento tipo-documento "Tipo de Documento", os seguintes arquivos são criados:`,example:null,code:`src/
├── config/
│   ├── permissions/
│   │   └── permissionTipoDocumento.ts       ← permissões da entidade
│   └── pageRoutes/
│       └── pageRoutesTipoDocumento.ts        ← definição de rotas
│
├── features/
│   └── tipoDocumento/
│       ├── buscarTipoDocumento.ts            ← RTK Query POST /v1/tipo-documento/filtro
│       ├── buscarTipoDocumentoPorId.ts       ← RTK Query GET  /v1/tipo-documento/:id
│       ├── createTipoDocumentoSlice.ts       ← mutation POST  /v1/tipo-documento
│       ├── updateTipoDocumentoSlice.ts       ← mutation PUT   /v1/tipo-documento/:id
│       ├── deleteTipoDocumentoSlice.ts       ← mutation DELETE /v1/tipo-documento/:id
│       └── listAllTipoDocumento.ts           ← query GET      /v1/tipo-documento/all
│
├── type/
│   └── tipoDocumento/
│       ├── TipoDocumentoRequest.ts
│       └── TipoDocumentoResponse.ts
│
└── pages/
    └── Cadastro/
        └── TipoDocumento/
            ├── ListTipoDocumento.tsx
            ├── CreateTipoDocumento.tsx
            ├── EditTipoDocumento.tsx
            ├── ViewTipoDocumento.tsx
            └── components/
                ├── TipoDocumentoContainer.tsx
                ├── TipoDocumentoForm.tsx
                ├── ListTipoDocumentoFilter.tsx
                └── ListTipoDocumentoTable.tsx`},{title:`Arquivo de permissões gerado`,description:`O gerador cria src/config/permissions/permissionTipoDocumento.ts com as constantes de permissão padronizadas.`,example:null,code:`// src/config/permissions/permissionTipoDocumento.ts
import { IDefaultPermissions } from "./permission"

export const PermissionsTipoDocumento = {
  TIPO_DOCUMENTO_VISUALIZAR: "TIPO_DOCUMENTO_VISUALIZAR",
  TIPO_DOCUMENTO_INCLUIR:    "TIPO_DOCUMENTO_INCLUIR",
  TIPO_DOCUMENTO_EDITAR:     "TIPO_DOCUMENTO_EDITAR",
  TIPO_DOCUMENTO_DELETAR:    "TIPO_DOCUMENTO_DELETAR",
}

export const DefaultPermissionsTipoDocumento: IDefaultPermissions = {
  nome:       "TIPO_DOCUMENTO",
  visualizar: PermissionsTipoDocumento.TIPO_DOCUMENTO_VISUALIZAR,
  incluir:    PermissionsTipoDocumento.TIPO_DOCUMENTO_INCLUIR,
  editar:     PermissionsTipoDocumento.TIPO_DOCUMENTO_EDITAR,
  deletar:    PermissionsTipoDocumento.TIPO_DOCUMENTO_DELETAR,
}`},{title:`Arquivo de rotas gerado`,description:`O gerador cria src/config/pageRoutes/pageRoutesTipoDocumento.ts com as 4 rotas padrão (listagem, cadastro, edição, visualização).`,example:null,code:`// src/config/pageRoutes/pageRoutesTipoDocumento.ts
import Route from "@utils/RouteMixins"
import { ListTipoDocumento }   from "@pages/Cadastro/TipoDocumento/ListTipoDocumento"
import { CreateTipoDocumento } from "@pages/Cadastro/TipoDocumento/CreateTipoDocumento"
import { EditTipoDocumento }   from "@pages/Cadastro/TipoDocumento/EditTipoDocumento"
import { ViewTipoDocumento }   from "@pages/Cadastro/TipoDocumento/ViewTipoDocumento"

const BASE_PATH      = "/app/cadastro/tipoDocumento"
const PERMISSAO_ROOT = "TIPO_DOCUMENTO"

const createRoute = (label, path, component, permissao = null) =>
  Route(PERMISSAO_ROOT, label, \`\${BASE_PATH}\${path}\`, component, permissao)

export const TipoDocumentoRoutes = [
  createRoute("Tipo de Documento", "",          ListTipoDocumento),
  createRoute(null,                "/new",       CreateTipoDocumento),
  createRoute(null,                "/edit/:id",  EditTipoDocumento),
  createRoute(null,                "/view/:id",  ViewTipoDocumento),
]`},{title:`Atualizações automáticas em arquivos existentes`,description:`O gerador tenta atualizar dois arquivos automaticamente. Sempre verifique o resultado após a geração.`,example:null,code:`# ── 1. src/type/Enuns/LocalStorage_enum.ts ──────────────────────────────
# Adiciona a chave de filtro da nova entidade (apenas se não existir):

  FILTER_TELA_TIPO_DOCUMENTO: "filter_tela_tipo_documento",


# ── 2. src/config/menu.ts ────────────────────────────────────────────────
# Adiciona o import antes de "export interface IMenu":

  import { TipoDocumentoRoutes } from "./pageRoutes/pageRoutesTipoDocumento"

# Adiciona o spread das rotas no último grupo de itens do menu:

  ...TipoDocumentoRoutes,

# ⚠️  ATENÇÃO: a inserção no menu usa uma âncora fixa no código do projeto.
# Se o menu.ts não contiver essa âncora esperada, a rota NÃO será inserida
# automaticamente — verifique sempre o arquivo após a geração.`},{title:`Mock mode nos arquivos gerados`,description:`Os arquivos gerados incluem um modo mock para desenvolvimento antes do backend estar disponível. Basta alterar a flag para false quando o endpoint estiver pronto.`,example:null,code:`// ⚠️ ATENÇÃO: REMOVER — altere para false quando o endpoint estiver disponível.
const IS_MOCK_MODE_TIPO_DOCUMENTO = true;

// ⚠️ ATENÇÃO: REMOVER — dados de mock apenas para fins de teste.
const MOCK_DATA_TIPO_DOCUMENTO: Results<TipoDocumentoResponse> = {
  content: [
    { id: 1, descricao: "[MOCK] Registro de exemplo 1", ... },
  ],
  ...
};
// ⚠️ FIM DO MOCK`},{title:`Passos manuais após a geração`,description:`O gerador entrega uma estrutura funcional com mock. Execute os passos abaixo para integrar com o backend real.`,example:null,code:`1. VERIFIQUE o menu em src/config/menu.ts.
   Confirme que o import e o spread foram inseridos corretamente:

   import { TipoDocumentoRoutes } from "./pageRoutes/pageRoutesTipoDocumento"
   ...TipoDocumentoRoutes,

   Se não foram inseridos, adicione manualmente no grupo correto.

2. AJUSTE os campos do formulário em:
      src/pages/Cadastro/<Nome>/components/<Nome>Form.tsx
   Adicione/remova os campos conforme o modelo de dados real.

3. AJUSTE as colunas da tabela em:
      src/pages/Cadastro/<Nome>/components/List<Nome>Table.tsx

4. REMOVA o mock mode quando o backend estiver disponível:
   a) Em List<Nome>.tsx:
      - Altere IS_MOCK_MODE_<NOME> = false
      - Remova a constante MOCK_DATA_<NOME>
      - Substitua pelo retorno real de triggerFetch / listResult

   b) Em <Nome>Container.tsx:
      - Altere IS_MOCK_MODE_<NOME> = false
      - Remova a constante MOCK_FORM_VALUES_<NOME>
      - Restaure o reset baseado em entityQuery

5. CONFIRA as permissões geradas em:
      src/config/permissions/permission<Nome>.ts
   Certifique-se de que os perfis no backend usam os mesmos códigos.`},{title:`Testando a lib localmente (antes da publicação no GitLab)`,description:`Para usar a lib em outro projeto sem publicar no GitLab, use npm pack ou npm link.`,example:null,code:`# ── Opção 1: npm pack (recomendado — simula o pacote real) ──────────────
# Na lib:
npm run pack:local
# Gera: seplag-ui-lib-react-18-x.x.x.tgz

# No projeto consumidor:
npm install /caminho/para/seplag-ui-lib-react-18-x.x.x.tgz


# ── Opção 2: npm link (iteração rápida) ──────────────────────────────────
# Na lib (após cada build):
npm run build
npm link

# No projeto consumidor:
npm link @seplag/ui-lib-react-18

# Para desfazer no consumidor:
npm unlink @seplag/ui-lib-react-18`}];function i(){return(0,n.jsx)(t,{title:`seplag-generate`,description:`CLI gerador de CRUD completo — cria toda a estrutura de pages, features, types, rotas e permissões a partir de um único comando.`,badge:`CLI`,since:`v0.0.1`,importStatement:`# Instale a lib no projeto consumidor
npm install @seplag/ui-lib-react-18

# Execute o gerador
npx seplag-generate <NomePascalCase> [endpoint] ["Descrição"] [--force]`,sections:r})}export{i as default};