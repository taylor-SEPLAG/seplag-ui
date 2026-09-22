# `template/` — Templates do gerador de CRUD

## Objetivo

Fornecer os arquivos-modelo renderizados pelo CLI [`seplag-generate`](../_generator/) ao criar
a estrutura de um cadastro na aplicação consumidora.

## Responsabilidade principal

Definir o **padrão de referência de um CRUD SEPLAG**: quais arquivos existem, como se
relacionam e quais componentes da biblioteca cada camada usa.

> ⚠️ **A extensão `.hbs` é apenas convenção — estes arquivos não usam Handlebars.**
> O motor de renderização é uma substituição por regex implementada em
> [`../_generator/generate.js`](../_generator/generate.js).

## Catálogo

### Páginas e componentes (raiz)

| Template | Gera |
| --- | --- |
| `List.tsx.hbs` | Página de listagem |
| `Filter.tsx.hbs` | Formulário de filtros da listagem |
| `Table.tsx.hbs` | Tabela da listagem |
| `Container.tsx.hbs` | Contêiner compartilhado entre criar/editar/visualizar |
| `Form.tsx.hbs` | Formulário do cadastro — **exige ajuste manual dos campos** |
| `Create.tsx.hbs` | Página de criação |
| `Edit.tsx.hbs` | Página de edição |
| `View.tsx.hbs` | Página de visualização |
| `Request.ts.hbs` | Tipo do payload de envio |
| `Response.ts.hbs` | Tipo da resposta da API |
| `PageRoutes.ts.hbs` | Definição de rotas da entidade |

### Camada de dados — `feat/`

| Template | Gera |
| --- | --- |
| `Buscar.ts.hbs` | Consulta paginada com filtros |
| `BuscarPorId.ts.hbs` | Consulta por identificador |
| `ListAll.ts.hbs` | Listagem completa (para dropdowns) |
| `CreateSlice.ts.hbs` | Mutation de criação |
| `UpdateSlice.ts.hbs` | Mutation de atualização |
| `DeleteSlice.ts.hbs` | Mutation de exclusão |

O mapeamento template → caminho de destino está documentado em
[`../_generator/README.md`](../_generator/README.md).

## Sintaxe de substituição

Duas formas reconhecidas pelo renderizador:

```
{{ chave }}                 → valor direto do contexto
{{ helper chave }}          → valor transformado pelo helper
```

**Helpers:** `pascalCase`, `camelCase`, `kebabCase`, `constantCase`, `lowerCase`.
Helper desconhecido devolve **string vazia**.

**Variáveis do contexto:**

| Variável | Exemplo (entrada `TipoAfastamento`) |
| --- | --- |
| `name` | `TipoAfastamento` (valor cru do argumento) |
| `pascal` / `pascalCase` | `TipoAfastamento` |
| `camel` / `camelCase` | `tipoAfastamento` |
| `kebab` / `kebabCase` | `tipo-afastamento` |
| `constant` / `constantCase` | `TIPO_AFASTAMENTO` |
| `description` | 3º argumento do CLI, ou o próprio nome |
| `endpoint` | 2º argumento do CLI, ou o kebab-case |
| `libPackageName` | Detectado do `package.json` do projeto alvo |

## Dependências

Os arquivos gerados importam da biblioteca (`{{ libPackageName }}`):

| Camada | Componentes/hooks usados |
| --- | --- |
| Listagem | [`CardSeplag`](../componentes/Card/), [`FilterFormSeplag`](../componentes/FilterForm/), [`TablePaginadoSeplag`](../componentes/TablePaginado/), [`useFiltersSeplag`](../hooks/filters/) |
| Formulário | [`Fields/*`](../componentes/Fields/), [`FormActionsSeplag`](../componentes/FormActions/), [`useMensagemErroFormularioSeplag`](../hooks/mensagemErro/) |
| Dados | Endpoints injetados na apiSlice criada por [`createBaseApiSliceSeplag`](../lib/createBaseApiSliceSeplag.ts) |
| Feedback | [`useToastSeplag`](../hooks/toast/) |

## Módulos relacionados

- [`../_generator/`](../_generator/) — CLI que consome estes templates
- [`../componentes/`](../componentes/) — componentes referenciados pelo código gerado

## Fluxos importantes

**Arquitetura do CRUD gerado:**

```
config/pageRoutes/pageRoutes{Nome}.ts        ← rotas da entidade (entram no menu.ts)
      │
      ├─ pages/Cadastro/{Nome}/List{Nome}.tsx
      │     ├─ components/List{Nome}Filter.tsx   → FilterFormSeplag + Fields
      │     └─ components/List{Nome}Table.tsx    → TablePaginadoSeplag
      │           ↑ useFiltersSeplag orquestra filtro → busca → paginação
      │
      ├─ pages/Cadastro/{Nome}/Create{Nome}.tsx  ┐
      ├─ pages/Cadastro/{Nome}/Edit{Nome}.tsx    ├─ components/{Nome}Container.tsx
      ├─ pages/Cadastro/{Nome}/View{Nome}.tsx    ┘        └─ components/{Nome}Form.tsx
      │                                                        (campos: AJUSTE MANUAL)
      ├─ {Nome}Request.ts · {Nome}Response.ts    ← contratos de dados
      │
      └─ features/{camel}/
            buscar{Nome}.ts · buscar{Nome}PorId.ts · listAll{Nome}.ts
            create{Nome}Slice.ts · update{Nome}Slice.ts · delete{Nome}Slice.ts
                  ↑ endpoints injetados na apiSlice do projeto
```

## Pontos de entrada

Os templates não são importados por código de runtime. São lidos por
[`generate.js`](../_generator/generate.js) a partir de `TEMPLATE_DIR`, que resolve para
`dist/template/` quando o pacote está instalado, e para `src/template/` quando executado do
código-fonte.

## Arquivos críticos

| Arquivo | Por quê |
| --- | --- |
| `Form.tsx.hbs` | Único template que exige intervenção manual após a geração (os campos precisam ser escritos) |
| `PageRoutes.ts.hbs` | Produz o arquivo referenciado pelo replace automático em `menu.ts` — se a estrutura mudar, o menu não é atualizado |
| `feat/*.hbs` | Definem o contrato com a apiSlice do projeto (nomes de hooks, tags de cache) |

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **`.hbs` sem Handlebars** | A extensão induz ao erro. Construções como `{{#if}}`, `{{#each}}` ou parciais **não são suportadas** — o renderizador as ignora ou substitui por vazio. Ao editar um template, use apenas as duas formas descritas acima. |
| Média | **Templates não são verificados** | Não passam por TypeScript, ESLint nem build — um erro de sintaxe só aparece depois de gerado, no projeto do consumidor. |
| Média | **Acoplados à estrutura de pastas do consumidor** | Os caminhos de destino (`src/pages/Cadastro/`, `src/features/`, `src/config/`) são fixos em `mapTargetPath`. |
| Baixa | **Sem versionamento próprio** | Os templates evoluem junto com a biblioteca; não há registro de qual versão gerou determinado código no projeto consumidor. |
| Baixa | **Campo do formulário sempre manual** | `Form.tsx.hbs` gera um esqueleto; os campos precisam ser escritos à mão (o CLI avisa isso ao final). |
| Baixa | **Sem exemplos versionados da saída** | Não há fixtures mostrando o resultado esperado de cada template, o que dificultaria detectar regressões. |
| Baixa | Sem testes. |

## Documentos relacionados

- [`../_generator/README.md`](../_generator/README.md)
- [Objetivo da biblioteca](../../docs/objetivo-da-biblioteca-de-componentes.md) — P-10
