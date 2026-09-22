# `_generator/` — CLI `seplag-generate`

## Objetivo

Gerar automaticamente a estrutura completa de um CRUD (páginas, componentes, tipos, slices
RTK Query, rotas e permissões) na **aplicação consumidora**, a partir de um nome de entidade.

## Responsabilidade principal

Reduzir o tempo de partida de um cadastro novo. É o único artefato da biblioteca que **não é
código de runtime**: roda no terminal do desenvolvedor e escreve arquivos no projeto.

## Ponto de entrada

Declarado como binário em `package.json`:

```json
"bin": { "seplag-generate": "dist/_generator/generate.js" }
```

Empacotado pelo script `copy:generator`, que copia `src/_generator` e `src/template` para
`dist/` **após** o build do Vite (o generator não passa pelo bundler).

## Uso

```bash
npx seplag-generate NomePascalCase [endpoint] [descrição] [--force]
```

| Argumento | Obrigatório | Default |
| --- | --- | --- |
| `NomePascalCase` | ✔ | — |
| `endpoint` | — | versão kebab-case do nome |
| `descrição` | — | o próprio nome |
| `--force` / `-f` | — | sem ele, arquivos existentes são **pulados** |

Exemplo:

```bash
npx seplag-generate TipoAfastamento tipos-afastamento "Tipo de Afastamento"
```

## Funcionalidades existentes

### Motor de templates

Os arquivos usam extensão `.hbs`, mas **não usam Handlebars**.
[`generate.js`](./generate.js) implementa um renderizador próprio com duas regex:

```js
/{{\s*([a-zA-Z0-9]+)\s+([a-zA-Z0-9]+)\s*}}/g   // {{helper chave}}
/{{\s*([a-zA-Z0-9_]+)\s*}}/g                    // {{chave}}
```

**Helpers disponíveis:** `pascalCase`, `camelCase`, `kebabCase`, `constantCase`, `lowerCase`.
Helper desconhecido devolve string vazia.

**Contexto de renderização:** `name`, `pascal`/`pascalCase`, `camel`/`camelCase`,
`kebab`/`kebabCase`, `constant`/`constantCase`, `description`, `endpoint`, `libPackageName`.

### Detecção do nome do pacote

`libPackageName` é resolvido lendo o `package.json` do projeto alvo, procurando uma
dependência que comece com `@seplag/ui-lib-react`. Fallback: `@seplag/ui-lib-react-18`.
Isso permite que os arquivos gerados importem do pacote correto.

### Mapa de saída — `mapTargetPath`

| Template | Destino no projeto consumidor |
| --- | --- |
| `Container.tsx.hbs` | `src/pages/Cadastro/{Nome}/components/{Nome}Container.tsx` |
| `Form.tsx.hbs` | `src/pages/Cadastro/{Nome}/components/{Nome}Form.tsx` |
| `Filter.tsx.hbs` | `src/pages/Cadastro/{Nome}/components/List{Nome}Filter.tsx` |
| `Table.tsx.hbs` | `src/pages/Cadastro/{Nome}/components/List{Nome}Table.tsx` |
| `List.tsx.hbs` | `src/pages/Cadastro/{Nome}/List{Nome}.tsx` |
| `Create.tsx.hbs` | `src/pages/Cadastro/{Nome}/Create{Nome}.tsx` |
| `Edit.tsx.hbs` | `src/pages/Cadastro/{Nome}/Edit{Nome}.tsx` |
| `View.tsx.hbs` | `src/pages/Cadastro/{Nome}/View{Nome}.tsx` |
| `Request.ts.hbs` | `src/pages/Cadastro/{Nome}/{Nome}Request.ts` |
| `Response.ts.hbs` | `src/pages/Cadastro/{Nome}/{Nome}Response.ts` |
| `PageRoutes.ts.hbs` | `src/config/pageRoutes/pageRoutes{Nome}.ts` |
| `feat/Buscar.ts.hbs` | `src/features/{camel}/buscar{Nome}.ts` |
| `feat/BuscarPorId.ts.hbs` | `src/features/{camel}/buscar{Nome}PorId.ts` |
| `feat/ListAll.ts.hbs` | `src/features/{camel}/listAll{Nome}.ts` |
| `feat/CreateSlice.ts.hbs` | `src/features/{camel}/create{Nome}Slice.ts` |
| `feat/UpdateSlice.ts.hbs` | `src/features/{camel}/update{Nome}Slice.ts` |
| `feat/DeleteSlice.ts.hbs` | `src/features/{camel}/delete{Nome}Slice.ts` |

### Efeitos colaterais além dos templates

O generator também **modifica arquivos existentes** do projeto alvo:

| Arquivo | Ação |
| --- | --- |
| `src/config/permissions/permission{Nome}.ts` | **Cria** com as 4 constantes CRUD e o `DefaultPermissions{Nome}` |
| `src/type/Enuns/LocalStorage_enum.ts` | **Insere** a chave `FILTER_TELA_{CONSTANT}` antes do `}` final |
| `src/config/menu.ts` | **Insere** o import de `{Nome}Routes` antes de `export interface IMenu`, e o spread `...{Nome}Routes,` após `...ParametroTipoDocumentoRoutes` |

Todos os três estão em `try/catch` — falhas são ignoradas ou apenas avisadas no console.

### Saída no terminal

```
✅ gerado: <caminho>          — arquivo novo
🔁 sobrescrito: <caminho>     — com --force
⚠️  já existe (pulado)        — sem --force
⚠️  Não foi possível atualizar menu.ts automaticamente: <erro>
```

Ao final, lembra o passo manual restante: ajustar os campos do formulário em
`src/pages/Cadastro/{Nome}/components/{Nome}Form.tsx`.

## Dependências

Apenas módulos nativos do Node: `fs/promises`, `path`, `url`. **Zero dependências externas** —
por isso é distribuído como JavaScript puro (`.js` com shebang), sem passar pelo bundler.

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`../template/`](../template/) | Os 17 arquivos `.hbs` renderizados |
| [`../componentes/`](../componentes/) | Os arquivos gerados importam `CardSeplag`, `TablePaginadoSeplag`, `Fields/*` etc. |
| [`../hooks/filters`](../hooks/filters/) | Os templates de listagem usam `useFiltersSeplag` |
| [`../lib/createBaseApiSliceSeplag`](../lib/createBaseApiSliceSeplag.ts) | Os slices gerados injetam endpoints na apiSlice do projeto |

## Fluxos importantes

```
npx seplag-generate TipoAfastamento tipos-afastamento "Tipo de Afastamento"
      │
      ├─ monta o contexto: pascal | camel | kebab | constant | description | endpoint
      ├─ lê o package.json do projeto alvo → libPackageName
      │
      ├─ cria src/config/permissions/permissionTipoAfastamento.ts
      ├─ insere FILTER_TELA_TIPO_AFASTAMENTO em src/type/Enuns/LocalStorage_enum.ts
      │
      ├─ walk(TEMPLATE_DIR) → 17 arquivos .hbs
      │     para cada um:
      │       render(template, ctx)      ← regex {{helper chave}} e {{chave}}
      │       mapTargetPath(tpl, ctx)    ← destino no projeto alvo
      │       existe && !force?  → ⚠️ pulado
      │       senão              → ✅ gerado / 🔁 sobrescrito
      │
      ├─ atualiza src/config/menu.ts (import + spread de {Nome}Routes)
      │
      └─ 📋 lembrete: ajustar os campos em pages/Cadastro/{Nome}/components/{Nome}Form.tsx
```

## Arquivos críticos

| Arquivo | Por quê |
| --- | --- |
| [`generate.js`](./generate.js) | 303 linhas; **escreve e modifica arquivos** no projeto do consumidor. `mapTargetPath` define onde cada arquivo cai; a atualização de `menu.ts` depende de um replace por regex que casa com um nome de entidade específico. |
| [`../template/`](../template/) | O que é gerado; alterações refletem em todos os CRUDs criados a partir daqui |

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| **Alta** | **Modifica arquivos por regex** | A atualização de `menu.ts` procura literalmente `...ParametroTipoDocumentoRoutes` (linha 279) — nome de uma entidade **específica de um sistema**. Em qualquer projeto que não tenha essa rota, o spread não é inserido e o desenvolvedor precisa fazê-lo à mão (o aviso só aparece em caso de exceção, não quando o replace simplesmente não casa). Idem para `LocalStorage_enum.ts`, que depende do arquivo terminar exatamente com `\n}`. |
| **Alta** | **Estrutura de pastas presumida** | Assume `src/pages/Cadastro/`, `src/features/`, `src/config/pageRoutes/`, `src/config/permissions/`, `src/type/Enuns/`. Projetos com outra organização recebem arquivos em lugares errados, sem aviso. |
| Média | **Extensão `.hbs` enganosa** | Sugere Handlebars, mas o motor é uma substituição por regex com 5 helpers. Sintaxes de Handlebars (`{{#if}}`, `{{#each}}`, parciais) **não funcionam** e são silenciosamente substituídas por string vazia (helper desconhecido) ou mantidas. |
| Média | **`--force` sobrescreve sem backup** | Reescreve arquivos existentes sem confirmação nem cópia de segurança. |
| Média | **Erros silenciados** | Escrita do arquivo de permissões e atualização do enum de `localStorage` estão em `try/catch` vazio (`// ignore`) — falhas passam despercebidas. |
| Baixa | **Ramo duplicado em `mapTargetPath`** | `if (base.startsWith("CreateSlice"))` aparece **duas vezes** (linhas 78 e 81); o segundo é inalcançável. |
| Baixa | **Template de permissões embutido no código** | O conteúdo de `permission{Nome}.ts` é uma template string dentro de `generate.js`, em vez de um `.hbs` como os demais — inconsistente e mais difícil de manter. |
| Baixa | **`packageLib` + `packageVersion` concatenados** | `"@seplag/ui-lib-react"` + `"-18"` montam o nome do pacote em duas constantes separadas. |
| Baixa | **Sem `--dry-run`** | Não há como pré-visualizar o que seria gerado. |
| Baixa | **Sem validação do nome** | Um argumento vazio ou com caracteres inválidos gera caminhos malformados. |
| Baixa | Sem testes. |

## Documentos relacionados

- [Objetivo da biblioteca](../../docs/objetivo-da-biblioteca-de-componentes.md) — P-10
- [Arquitetura da biblioteca](../../docs/arquitetura-da-biblioteca-de-componentes.md) — §2.1
- [`../template/README.md`](../template/README.md)
