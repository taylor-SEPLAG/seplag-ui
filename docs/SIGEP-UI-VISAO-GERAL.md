# SIGEP-UI / SEPLAG UI - Visão Geral do Projeto

## 1. O que é o projeto

O projeto `seplag-ui` é uma biblioteca de componentes React mantida para apoiar a construção de sistemas internos da SEPLAG-MT. Além da biblioteca, o repositório também funciona como ambiente de documentação interativa e como laboratório de protótipos navegáveis para sistemas e módulos de negócio.

Na prática, o repositório atende a três frentes:

1. **Design System / biblioteca de componentes**: componentes reutilizáveis com identidade visual SEPLAG, publicados como pacote npm `@seplag/ui-lib-react-18`.
2. **Documentação viva dos componentes**: páginas em `/docs` que demonstram uso, propriedades, exemplos e padrões dos componentes.
3. **Protótipos funcionais**: telas navegáveis em `/prototipos`, usadas para validar fluxos de sistemas como Gestão de Pessoas/SIGEP e Folha de Pagamento.

Quando o termo **SIGEP-UI** aparece no contexto do protótipo, ele se refere principalmente à experiência de interface do módulo **Gestão de Pessoas**, acessível em:

```text
/#/prototipos/sigep
```

O repositório, porém, é mais amplo que o SIGEP: ele concentra a biblioteca SEPLAG UI e outros protótipos que reutilizam os mesmos componentes.

## 2. Objetivo

O objetivo central do projeto é padronizar a construção de interfaces dos sistemas da SEPLAG, reduzindo retrabalho e garantindo consistência visual e comportamental entre telas.

O projeto permite:

- Reutilizar componentes comuns como botões, tabelas, campos de formulário, modais, cards, layout e menus.
- Validar fluxos de negócio antes da implementação definitiva em sistemas reais.
- Documentar padrões de uso dos componentes em uma área navegável.
- Simular módulos complexos, como Gestão de Pessoas e Folha de Pagamento, usando dados mockados e navegação local.
- Gerar artefatos base por CLI por meio do comando `seplag-generate`.

## 3. Stack técnica

O projeto é uma aplicação/biblioteca frontend baseada em:

- **React** para construção das interfaces.
- **TypeScript** para tipagem estática.
- **Vite** para desenvolvimento, build da biblioteca e build das páginas de documentação/protótipo.
- **PrimeReact**, **PrimeIcons** e **PrimeFlex** como base visual e utilitária.
- **React Hook Form** para formulários.
- **React Router DOM** com `HashRouter` para navegação local por rotas `/#/...`.
- **Redux Toolkit / React Redux** em estruturas auxiliares da biblioteca.
- **Vitest** e Testing Library para testes unitários existentes.
- **ESLint** para padronização e validação estática.

O pacote principal do projeto é:

```text
@seplag/ui-lib-react-18
```

## 4. Estrutura geral do repositório

```text
src/
  App.tsx                         Rotas principais da aplicação local
  main.tsx                        Entrada da aplicação com HashRouter
  index.ts                        Entrada pública da biblioteca

  componentes/                    Componentes reutilizáveis exportados pela biblioteca
  docs/                           Documentação interativa dos componentes
  prototipos/                     Telas e fluxos navegáveis dos protótipos
  hooks/                          Hooks utilitários
  provider/                       Providers da biblioteca
  tokens/                         Tokens visuais, principalmente cores
  uteis/                          Funções utilitárias, validações e formatadores
  interfaces/                     Tipos e interfaces compartilhados
  lib/OAuth2Seplag/               Biblioteca auxiliar de autenticação OAuth2/PKCE
  _generator/                     CLI de geração de arquivos
  template/                       Templates usados pelo gerador

docs/
  CONTEXTO_PROJETO.md             Contexto evolutivo e decisões do projeto
  folha-pagamento-status-implementacao.md

bibliotecas-seplag/
  seplag-ui-0.0.7/                Cópia/versionamento local anterior da biblioteca
  seplag-ui-0.0.18/               Cópia/versionamento local atual da biblioteca

dist/                             Saída do build da biblioteca
dist-pages/                       Saída do build das páginas/documentação
```

## 5. Biblioteca de componentes

A biblioteca exporta seus recursos por `src/index.ts`, incluindo:

- Componentes visuais em `src/componentes`.
- Utilitários em `src/uteis`.
- Tokens em `src/tokens`.
- OAuth2 em `src/lib/OAuth2Seplag`.
- Provider de toast em `src/provider/printToast`.
- Hooks em `src/hooks`.
- Interfaces em `src/interfaces`.

Entre os componentes disponíveis estão:

- Botões: `BotaoSeplag`, `BotaoSalvarSeplag`, `BotaoVoltarSeplag`, `BotaoIconSeplag`.
- Formulários: `TextFieldSeplag`, `DropdownFieldSeplag`, `DateFieldSeplag`, `MultiSelectFieldSeplag`, `CPFFieldSeplag`, `CNPJFieldSeplag`, entre outros.
- Layout: `LayoutSeplag`, `AppTopbarSeplag`, `AppMenuSeplag`, `AppSwitcherSeplag`, `CardSeplag`, `PanelSeplag`, `TabsSeplag`.
- Feedback e overlays: `ModalSeplag`, `ModalDeleteSeplag`, `MensagemSeplag`, `LoaderSeplag`, `SkeletonSeplag`, toast.
- Tabelas e exibição: `TablePaginadoSeplag`, `BadgeSeplag`, `RotuloSeplag`, `PickListSeplag`, status chips.
- Documentos e arquivos: `AnexarDocumentoSeplag`, `Base64FileModalSeplag`, `ImageCropperSeplag`.

A regra de evolução indicada no contexto do projeto é: novas telas e funcionalidades devem usar componentes existentes em `src/componentes` sempre que possível. Quando não houver componente adequado, a decisão deve ser explícita entre criar um componente reutilizável na biblioteca ou resolver localmente no protótipo.

## 6. Documentação interativa

Para aplicar os modos auxiliares de **Desenvolvimento** e **Gestão** às telas de protótipo, consulte [Modos de visualização para protótipos](./MODOS-VISUALIZACAO-PROTOTIPOS.md). O guia contém contrato de metadados, integração, testes, critérios de aceite e prompt para agentes de IA.

A documentação dos componentes fica em `/docs` e é configurada principalmente em:

```text
src/docs/config.ts
src/docs/layout/DocsLayout.tsx
src/docs/pages/
```

Cada entrada de documentação tem identificador, rótulo, categoria e componente carregado por `lazy import`. As categorias incluem:

- Ações
- Overlays
- Formulários
- Utilitários
- Tokens
- Assets
- Feedback
- Exibição
- Layout

Rota local:

```text
/#/docs
/#/docs/:id
```

Essa área funciona como vitrine técnica da biblioteca: mostra exemplos, propriedades, variações visuais e padrões de uso.

## 7. Área de protótipos

A área de protótipos fica em:

```text
src/prototipos/PrototiposPage.tsx
src/prototipos/prototipos.css
```

Ela simula sistemas reais usando os componentes da biblioteca. A rota inicial `/prototipos` apresenta uma seleção de sistemas. No estado atual, há cards para:

- **Gestão de Pessoas** (`/#/prototipos/sigep`)
- **Folha** (`/#/prototipos/folha`)

Os protótipos compartilham um wrapper de página (`PrototypeSystemPage`) com topbar, menu lateral, switcher de sistemas e conteúdo central.

## 8. Protótipo Gestão de Pessoas / SIGEP

O protótipo de Gestão de Pessoas representa telas e fluxos associados ao SIGEP. Ele está acessível em:

```text
/#/prototipos/sigep
```

Principais áreas implementadas ou representadas:

- Página inicial do módulo Gestão de Pessoas.
- Componentes auxiliares usados pelo SIGEP:
  - Situação/Vigência.
  - Documentos vinculados.
  - Anexar documento.
  - Estrutura organizacional.
- Cadastros de Cargo e Concurso:
  - Regime Jurídico.
  - Categoria.
  - Cargo.
  - Tipo de Vínculo.
  - Matriz de Validação.
Rotas principais do SIGEP:

```text
/#/prototipos/sigep
/#/prototipos/sigep/componentes
/#/prototipos/sigep/regime-juridico
/#/prototipos/sigep/categoria
/#/prototipos/sigep/cargo
/#/prototipos/sigep/cargo-concurso-teste/regime-juridico
/#/prototipos/sigep/cargo-concurso-teste/categoria
/#/prototipos/sigep/cargo-concurso-teste/cargo
/#/prototipos/sigep/cargo-concurso-teste/tipo-vinculo
/#/prototipos/sigep/cargo-concurso-teste/matriz-validacao
```

## 9. Protótipo Folha de Pagamento

Além do SIGEP, o repositório contém o protótipo do módulo Folha. Ele está acessível em:

```text
/#/prototipos/folha
```

Principais áreas:

- Competências.
- Folha de Pagamento.
- Processamento da Folha.
- Solicitações de Ajustes da Folha.
- Tabelas de Referência.
- Grupo de Eleitos.
- Grupos de Cálculo.
- Catálogo de Rubricas.
- Ficha Financeira.
- Relatório de Conformidade.
- Penhora Judicial.

O documento `docs/folha-pagamento-status-implementacao.md` consolida o status desse módulo e deve ser usado como referência para continuidade da Folha.

## 10. Build, execução e publicação

Scripts principais:

```bash
npm run dev
npm run build
npm run build:pages
npm run preview
npm run preview:pages
npm run lint
npm run type-check
```

O projeto possui dois modos principais de build:

1. **Build da biblioteca**

```bash
npm run build
```

Gera a saída em:

```text
dist/
```

Esse build usa `src/index.ts` como entrada pública, gera declarações TypeScript com `vite-plugin-dts`, preserva módulos e copia o gerador/template para o pacote.

2. **Build das páginas**

```bash
npm run build:pages
```

Gera a saída em:

```text
dist-pages/
```

Esse build empacota a aplicação navegável de documentação e protótipos.

## 11. Gerador de código

O pacote expõe o binário:

```text
seplag-generate
```

Ele aponta para:

```text
dist/_generator/generate.js
```

Os templates ficam em:

```text
src/template/
```

Essa estrutura sugere uma estratégia de geração de arquivos padronizados para telas, listas, filtros, formulários, containers e operações básicas.

## 12. Testes e qualidade

O projeto possui testes unitários com Vitest e Testing Library em pontos específicos, como:

- Store Redux.
- Hooks de Redux.
- Campos de formulário, especialmente `TextFieldSeplag`.
- Autocomplete.

Também há scripts para:

- `npm run lint`
- `npm run type-check`

Esses comandos ajudam a manter a biblioteca estável, mas a cobertura ainda parece concentrada em componentes/infra específicos. Os protótipos, por sua natureza exploratória, dependem mais de validação visual e fluxo manual.

## 13. Dados e persistência nos protótipos

Os protótipos usam dados mockados e serviços locais em memória. No módulo Folha, por exemplo, há arquivos dedicados:

```text
src/prototipos/folhaPagamento/types.ts
src/prototipos/folhaPagamento/folhaPagamentoService.ts
```

Isso significa que o comportamento é navegável e simula regras de negócio, mas não representa integração real com backend, banco de dados ou APIs finais.

## 14. Como entender o projeto rapidamente

Para uma visão geral técnica:

1. Leia `docs/CONTEXTO_PROJETO.md`.
2. Consulte o `README.md` para uso da biblioteca e instalação.
3. Abra `src/index.ts` para ver a superfície pública exportada.
4. Abra `src/componentes/index.ts` para ver os componentes disponíveis.
5. Abra `src/App.tsx` para entender as rotas.
6. Abra `src/prototipos/PrototiposPage.tsx` para entender os protótipos.
7. Consulte `docs/folha-pagamento-status-implementacao.md` para o status do protótipo da Folha de Pagamento.

## 15. Resumo executivo

O SIGEP-UI, dentro deste repositório, é a camada de prototipação e interface do módulo Gestão de Pessoas construída sobre a biblioteca SEPLAG UI. O projeto completo `seplag-ui` é um Design System React com documentação interativa e protótipos navegáveis. Ele serve tanto para padronizar componentes reutilizáveis quanto para validar experiências de sistemas internos antes da implementação produtiva.

Em uma frase:

> O projeto é a base visual e técnica para criar, documentar e prototipar interfaces dos sistemas da SEPLAG, com destaque para o protótipo de Gestão de Pessoas/SIGEP e o módulo Folha de Pagamento.
