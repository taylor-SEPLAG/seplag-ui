# Modos de visualização para protótipos — Desenvolvimento e Gestão

## 1. Finalidade

Este documento ensina como aplicar em qualquer protótipo os dois modos criados inicialmente no Dashboard Gerencial do Controle de Vagas:

- **Desenvolvimento (<>):** especificação funcional e técnica navegável.
- **Gestão (✓):** validação visual dos componentes com avaliação e comentário.

Os modos são camadas auxiliares. Desligados, devem preservar exatamente aparência, navegação, dados e comportamento da tela. Este guia é uma instrução operacional para pessoas e agentes de IA.

## 2. Objetivo das visões

### Desenvolvimento

Cada região relevante pode informar objetivo, regra de negócio, origem, tipo de dado, componente, filtros, comportamento, rota ou ação, identificador estável e história de usuário. A visão complementa a US e reduz inferências baseadas apenas na aparência.

### Gestão

A pessoa seleciona uma região, classifica-a como aprovada, ajuste necessário ou dúvida e escreve um comentário contextual. A visão geral contabiliza pendências e decisões.

Na implementação atual, avaliações e comentários são **simulados localmente durante a sessão**. Não existe API, identificação do avaliador ou aprovação formal.

## 3. Referência no projeto

    src/prototipos/controleVagas/SpecificationMode.tsx
    src/prototipos/controleVagas/specificationMode.css
    src/prototipos/controleVagas/DashboardSpecifications.ts
    src/prototipos/controleVagas/DashboardGerencialContent.tsx

- SpecificationMode.tsx: motor, painel, seletor dos modos e áreas.
- specificationMode.css: máscara, contornos, painel, aba recolhida e estados.
- DashboardSpecifications.ts: catálogo de metadados.
- DashboardGerencialContent.tsx: integração completa.

Se vários módulos adotarem o recurso, mova apenas o motor e CSS para src/prototipos/shared/specificationMode/. Mantenha cada arquivo de especificações próximo da tela.

## 4. Contrato de metadados

    export interface SpecificationMetadata {
      id: string;
      title: string;
      description: string;
      businessRule: string;
      source: string;
      dataType: string;
      component: string;
      behavior?: string;
      filters?: string;
      route?: string;
      userStory?: string;
      status?: "CONFIRMADO" | "PENDENTE";
    }

| Campo | Preenchimento |
|---|---|
| id | Identificador único, estável e independente da posição visual. |
| title | Nome reconhecível do item. |
| description | O que informa ou permite fazer. |
| businessRule | Regras, cálculos, restrições e condições. |
| source | Módulo, entidade, store, endpoint ou evento de origem. |
| dataType | Inteiro, lista paginada, data, visão consolidada etc. |
| component | Componente ou padrão visual. |
| behavior | Interações, navegação e estados esperados. |
| filters | Filtros e data de referência que afetam o item. |
| route | Rota ou ação executada. |
| userStory | US, requisito ou documento relacionado. |
| status | Confirmação da especificação, não avaliação da Gestão. |

Se a integração não existir, registre mock, store do protótipo ou evento futuro do módulo de origem.

### Identificadores

Convenção: {MÓDULO}-{TELA}-{TIPO}-{SEQUENCIAL}.

Tipos sugeridos: SCR (tela), FLT (filtros), KPI (indicador), BLC (bloco), TBL (tabela), ACT (ação) e FRM (formulário).

Exemplos: CV-DASH-SCR-001, CV-DASH-KPI-001 e CV-DASH-TBL-001. Renomear ou reposicionar o item não muda seu ID.

## 5. Organização por tela

Crie NomeDaTelaSpecifications.ts separado do JSX:

    import type { SpecificationMetadata } from "./SpecificationMode";

    export const telaSpecification: SpecificationMetadata = {
      id: "MOD-TELA-SCR-001",
      title: "Minha tela",
      description: "Objetivo funcional.",
      businessRule: "Regra geral.",
      source: "Store e eventos do módulo.",
      dataType: "Página de consulta",
      component: "Página",
      route: "/prototipos/modulo/minha-tela",
      userStory: "US Minha tela",
      status: "PENDENTE",
    };

    export const telaItems = {
      filtros: {
        id: "MOD-TELA-FLT-001",
        title: "Filtros",
        description: "Restringem os resultados.",
        businessRule: "Resultados respeitam filtros ativos.",
        source: "Estado local da consulta",
        dataType: "Critérios de pesquisa",
        component: "Formulário",
        behavior: "Limpar restaura valores iniciais.",
        status: "CONFIRMADO",
      },
      tabela: {
        id: "MOD-TELA-TBL-001",
        title: "Resultados",
        description: "Lista registros encontrados.",
        businessRule: "Exibe apenas registros autorizados.",
        source: "Endpoint ou store da entidade",
        dataType: "Lista paginada",
        component: "Tabela com paginação",
        filters: "Todos os filtros",
        status: "PENDENTE",
      },
    } satisfies Record<string, SpecificationMetadata>;

    export const telaBusinessItems = Object.values(telaItems);

Integração:

    <SpecificationMode screen={telaSpecification} businessItems={telaBusinessItems}>
      <main>
        <SpecArea metadata={telaItems.filtros}>
          <section>{/* filtros existentes */}</section>
        </SpecArea>
        <SpecArea metadata={telaItems.tabela}>
          <section>{/* tabela existente */}</section>
        </SpecArea>
      </main>
    </SpecificationMode>

## 6. Regras obrigatórias

### Preservar a visão normal

Com os modos desligados, não altere espaçamentos, componentes, regras, cliques, dados, filtros ou rolagem. Compare antes e depois.

### Usar elementos que geram DOM

SpecArea recebe um ReactElement e injeta classe, atributos e captura de clique. Prefira section, div ou button. Evite Fragment. Componentes próprios precisam encaminhar className, eventos e atributos HTML ao elemento raiz.

### Evitar áreas sobrepostas

Use a tela no SpecificationMode, blocos independentes em SpecArea e itens internos apenas quando necessitarem validação própria. Áreas anotadas aninhadas competem pelo clique.

### Interceptar somente durante a inspeção

Com um modo ativo, o clique seleciona a área e não executa a ação original. Ao fechar o modo, a ação normal retorna.

### Preservar o painel recolhível

Mantenha o controle > para recolher, a aba < para reabrir e a reabertura ao selecionar área marcada.

## 7. Inventário recomendado

Documente finalidade da tela; filtros e data de referência; indicadores e fórmulas; tabelas, colunas e paginação; gráficos; alertas; formulários e validações; ações; navegação; estados vazio, carregando, erro e sem permissão; origem e atualização dos dados.

Elementos decorativos não precisam de SpecArea.

## 8. Procedimento de implementação

1. Inventariar blocos, indicadores, filtros, tabelas, formulários e ações.
2. Identificar regra, origem, tipo, comportamento e US.
3. Criar NomeDaTelaSpecifications.ts.
4. Definir metadado da tela e IDs estáveis.
5. Montar businessItems com todos os itens contabilizados na Gestão.
6. Envolver a raiz com SpecificationMode.
7. Envolver regiões independentes com SpecArea.
8. Eliminar sobreposição.
9. Testar modo normal, Desenvolvimento e Gestão.
10. Executar validações.

## 9. Evolução futura

Homologação real exigirá autenticação, API, banco, vínculo com versão, data e hora, histórico imutável, workflow, responsáveis, notificações, exportação, permissões e tratamento de conflitos.

Até lá, avaliações são temporárias e não podem ser apresentadas como homologação oficial.

## 10. Testes mínimos

1. Tela normal sem máscara.
2. Ativação do Desenvolvimento.
3. Seleção de área e metadado correto.
4. Recolhimento e reabertura do painel.
5. Fechamento e restauração da interação.
6. Ativação da Gestão.
7. Avaliação e comentário.
8. Exclusividade entre modos.
9. IDs únicos em businessItems.

Exemplo:

    render(<MinhaTela />);
    fireEvent.click(screen.getByRole("button", { name: /modo desenvolvimento/i }));
    fireEvent.click(screen.getByText("Resultados"));
    expect(screen.getByText("Lista paginada")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /modo gestão/i }));
    fireEvent.click(screen.getByText("Resultados"));
    fireEvent.click(screen.getByRole("button", { name: /aprovar/i }));

Validações:

    npm run type-check
    npm run lint
    npm test -- --run
    npm run build:pages

## 11. Critérios de aceite

- Botões compactos sem deslocar a tela.
- Apenas um modo ativo.
- Tela original inalterada com modos desligados.
- IDs únicos e metadados úteis.
- Painel correto e recolhível.
- Cliques de inspeção não executam ações.
- Gestão consegue avaliar e comentar.
- Caráter temporário da avaliação claro.
- TypeScript, lint, testes e build aprovados.

## 12. Problemas comuns

- **Sem contorno/clique:** SpecArea deve receber um elemento, não Fragment; componentes próprios devem encaminhar propriedades HTML.
- **Sempre seleciona o pai:** remova áreas anotadas sobrepostas.
- **Ausente no resumo:** inclua em businessItems e confira ID único.
- **Metadado indefinido:** use chaves estáveis e tipadas, não texto visual variável.
- **Tela branca:** consulte Vite, rode type-check, procure JSX aberto, importação circular ou metadado indefinido; reinicie o servidor correto se houver duas instâncias.

## 13. Prompt pronto para agentes

    Leia integralmente docs/MODOS-VISUALIZACAO-PROTOTIPOS.md e siga-o como padrão obrigatório.

    Aplique os modos Desenvolvimento e Gestão à tela [NOME/ARQUIVO/ROTA]. Antes de editar, inventarie blocos, filtros, indicadores, tabelas, formulários e ações e identifique regras e fontes no código.

    Crie NomeDaTelaSpecifications.ts com IDs únicos e estáveis. Envolva a tela com SpecificationMode, marque somente áreas funcionais independentes com SpecArea e forneça todos os itens validáveis em businessItems.

    Preserve layout, dados e comportamento com os modos desligados. Não implemente persistência sem solicitação explícita. Evite áreas sobrepostas. Adicione testes e execute type-check, lint, testes e build.

    Ao concluir, informe arquivos alterados, regiões documentadas, limitações e validações.

## 14. Decisão arquitetural

Os modos pertencem à camada de protótipo. As regras ficam em catálogos declarativos; o motor visual permanece reutilizável; a interface normal continua sendo a fonte visual. Assim o recurso é replicado sem duplicar o painel nem misturar documentação com componentes de negócio.
