# Indicadores do Projeto SIGEP

Página integrada em `/calendario/indicadores/projeto`, com o mesmo menu e tema da área de Processos.

`dados-iniciais.json` é uma extração do arquivo real **PROJETO SIGEP - CONTROLE US (6).xlsx** fornecido pelo usuário. O botão **Atualizar dados da planilha** usa o mesmo leitor de `importacao.ts` e salva a base normalizada no navegador. Ao carregar o painel, uma base fornecida mais recente prevalece sobre importações antigas; importações manuais posteriores são preservadas. Não há envio do arquivo para um serviço externo.

## Conferência da base fornecida

| Sprint | Registros | Pontos | Reaparições | Desenvolvedores disponíveis |
| --- | ---: | ---: | ---: | ---: |
| 18 | 11 | 74 | 0 | 7 |
| 19 | 22 | 123 | 0 | 7 |
| 20 | 29 | 202 | 11 | 7 |
| 21 | 34 | 188 | 13 | 7 |
| 22 | 33 | 189 | 0 | 12 |
| 23 | 43 | 311 | 4 | 11 |

Totais: **144 US distintas, 172 registros, 1.087 pontos e 28 reaparições**.

Conforme a correção mais recente do usuário, as dez histórias de férias (US302 a US309, US317 e US348) pertencem exclusivamente à Sprint 23, como histórias novas. As nove aparições indevidas da Sprint 22 são retiradas dos indicadores e preservadas apenas em `replanejadas`, com destino 23, para rastreabilidade. `ajustesEscopo.ts` aplica a correção na importação e recupera bases salvas com o ajuste anterior para a Sprint 24. Nenhuma dessas US é contabilizada como remanescente; as quatro reaparições da Sprint 23 são de outras histórias.

As US319, US321 e US322 são remanescentes da Sprint 22, conforme a imagem fornecida (US219 é outra história e não consta na Sprint 23). A US170 também aparece nas Sprints 22 e 23. A Sprint 23 totaliza **39 histórias novas e 4 remanescentes**. A classificação usa todo o histórico da base antes dos filtros de período, pessoa ou módulo; selecionar somente a Sprint 23 preserva essas quatro remanescências no painel e nas exportações.

O leitor identifica os cabeçalhos pelo nome, considera o bloco do início de período mais recente de cada aba e preserva o período original de cada linha. A US271 está explicitamente marcada como removida e é mantida no registro de exclusões. Quinze registros da Sprint 21 têm ano de término inconsistente; o término predominante válido é usado apenas no metadado da sprint, sem reescrever as células originais.

Conclusões distintas usam a última aparição da US no recorte filtrado. Na base atual, as Sprints 18 a 21 possuem situações de conclusão registradas. Há **99 US concluídas** na última aparição do recorte completo, com situação conhecida em 143 das 144 histórias e taxa de conclusão confirmada de **68,75%**. Por sprint, as conclusões registradas são 11, 22, 29, 34, 28 e 0. A Sprint 18 identifica sete desenvolvedores associados. QA atribuído e ambiente de teste não comprovam aprovação ou homologação.

Desenvolvedores disponíveis são os nomes distintos atribuídos às histórias de cada sprint, conforme a definição do usuário. Uma pessoa é contada uma vez por sprint, mesmo em várias histórias; no total do período, os nomes também são deduplicados (12 nas Sprints 18 a 23). O card segue os filtros e o gráfico de equipe exibe a evolução por sprint. PDF, resumo executivo e a aba Excel `Equipe por sprint` usam o mesmo critério.

A jornada de capacity é **8 horas diárias por desenvolvedor**, conforme informado pelo usuário. A capacity diária é a equipe da sprint × 8; a bruta da sprint multiplica esse valor pelos dias de segunda a sexta, incluindo início e fim, antes dos descontos de feriados, férias e suporte. O total do período soma a capacity de cada sprint, respeitando as alterações da equipe. Datas ausentes ou inválidas deixam a capacity bruta desconhecida.

| Sprint | Dias (seg. a sex.) | Capacity diária | Capacity bruta |
| --- | ---: | ---: | ---: |
| 18 | 11 | 56 h | 616 h |
| 19 | 12 | 56 h | 672 h |
| 20 | 11 | 56 h | 616 h |
| 21 | 12 | 56 h | 672 h |
| 22 | 13 | 96 h | 1.248 h |
| 23 | 12 | 88 h | 1.056 h |

Total bruto planejado: **4.880 h**. O painel e as exportações usam os mesmos cálculos. O simulador inicia a jornada com 8 h e permite informar dedicação e reservas do cenário.

Pessoas em histórias compartilhadas mantêm todas as associações, sem duplicar totais globais. Valores vazios permanecem desconhecidos. Dedicação efetiva, FTE real, horas utilizadas e indicadores específicos de QA não são presumidos. O simulador de capacity é identificado separadamente e não modifica os dados históricos.

Os gráficos usam Chart.js com animação, seleção, navegação por teclado, legendas interativas e zoom. PDF, PNG, Excel e resumo executivo são gerados localmente com os filtros aplicados.

Verificações: `npx vitest run src/indicadores` e `npx eslint src/indicadores`.

## Produtividade da Análise

A página existente em Indicadores → Produtividade da Análise usa a planilha **PROJETO SIGEP - CONTROLE US (6).xlsx** e os filtros globais. Apresenta quatro cards e quatro gráficos: atribuições, ICA, levantamento e composição histórica da equipe. As 144 US distintas da base são deduplicadas por código; reaparições entram em cada sprint. Atribuições compartilhadas aparecem em cada analista, portanto a soma por pessoa pode superar o total distinto. Atribuição não comprova escrita ou conclusão.

O ICA soma quatro critérios de 1 a 3: regras, fluxos/telas, dependências e validação. Faixas: 4–6 baixa, 7–9 média, 10–12 alta. É independente dos story points. Classificações são vinculadas à US, mantêm histórico de edições e acompanham a história em outras sprints. US sem cadastro não recebem pontuação.

Levantamento registra início, envio para validação e aprovação final opcional. Dias úteis excluem a data inicial, finais de semana e feriados cadastrados. Início sem envio é permitido, mas não entra na média. O tempo é duração decorrida, sem apontamento de horas. Datas invertidas são rejeitadas, inclusive em importações.

Equipe usa períodos de alocação com entrada, saída, dedicação e percentual opcional. Períodos da mesma pessoa não podem sobrepor-se. Para alterar dedicação, encerre o período anterior e abra outro no dia seguinte. A referência atual de Isabeli, Danielle, Carlos, Taylor e Marcela é informativa: não cria datas nem aplica retrospectivamente a equipe atual. FTE é a média diária de dedicação nos dias úteis da sprint, considerando entradas/saídas; exige percentuais de todos os registros daquele período. Cadastro ausente é desconhecido, e não equipe zero. Totais referem-se à cobertura cadastrada, que deve ser completada antes da análise gerencial.

Persistência local: **sigep:analise-simples:v1**, independente da planilha e dos registros anteriores (**sigep:analise:v1** e **sigep:analise-fluxo:v1**, preservados). Exportar/importar registros usa JSON validado; importar restaura o arquivo completo, com cópia anterior em **sigep:analise-simples:v1:antes-importacao**. Faça exportações para transporte entre navegadores. Não há sincronização com servidor. Dados legados não são convertidos automaticamente para o ICA de quatro critérios.

A comparação gerencial mostra US, média ICA e FTE por sprint, com variações quando houver base suficiente; não infere sobrecarga. A aba WIP está temporariamente oculta; seu componente, modelos, testes e armazenamento continuam preservados.

## Fluxo de Análise (WIP)

O menu lateral inclui **Produtividade da Análise**, logo abaixo de **Indicadores do Projeto SIGEP**, em `/calendario/indicadores/analise`. A página apresenta **Produtividade da Análise**; a aba **Fluxo de Análise (WIP)** está temporariamente oculta. As abas e definições da página original de indicadores foram preservadas.

`fluxoModelo.ts` reconstrói as posições a partir de movimentações, nunca do status de desenvolvimento ou das datas da sprint. O adaptador lê as transições reais já existentes em `sigep:analise:v1` e mantém sua precisão diária; não inventa horários. A conclusão de especificação não representa aprovação. Suporte a desenvolvimento e QA não altera a etapa da análise.

O registro WIP (`sigep:analise-fluxo:v1`) acrescenta movimentações com origem, destino, analista, motivo e data/hora com fuso. Bloqueios e esperas têm intervalos próprios, responsável e encerramento preservado. O Kanban é consultivo; os registros não alteram a planilha ou o Redmine. O fluxo ativo abrange Levantamento, Especificação/Prototipação, Validação com Cliente e Ajustes. Backlog, aprovação, cancelamento e suspensão não entram no WIP. Suspensão preserva o início do ciclo para retomada; reaberturas após aprovação/cancelamento exigem registro e motivo explícitos.

As fotografias diárias úteis sustentam as médias. Os picos também consideram cada movimentação com horário conhecido; eventos antigos sem horário não recebem instantes presumidos. O CFD mostra as posições por data, com filtros diário, semanal e por sprint. As séries representam apenas as US com histórico conhecido; datas anteriores ao primeiro evento conhecido permanecem indisponíveis. Filtros de situação, etapa ou bloqueio selecionam a coorte na data de posição, e o histórico dessa coorte aparece nos gráficos. A posição padrão é limitada ao dia atual em America/Cuiaba e ao fim da sprint selecionada. Uma primeira observação já em especificação/validação confirma WIP, mas não cria artificialmente uma entrada naquela data; o balanço identifica inícios ausentes.

Throughput deduplica US aprovadas no período; o balanço de entradas/saídas conta passagens e separa novas entradas de retomadas explícitas. Retorno da validação para ajustes dentro do ciclo não é nova entrada. Cycle Time inclui espera, usa somente aprovações com início conhecido e não inclui histórias abertas. Média, mediana, P85 e P95 usam os ciclos conhecidos; percentis têm interpolação linear.

Limites de equipe, analista e etapa, prazos por faixa de complexidade e atenção por inatividade são configuráveis e começam sem valores presumidos. O simulador altera apenas seus alertas. Story points contextualizam o fluxo e não são convertidos em horas. A eficiência requer horas de referência por dia e confirmação explícita dos apontamentos completos da US: horas ativas / (dias úteis de ciclo × horas por dia). O restante é identificado como **espera residual normalizada**, sem atribuição automática ao analista. Totais ativos maiores que o ciclo normalizado deixam a eficiência indisponível.

O importador aceita JSON conforme o modelo vazio disponível na interface, valida US, campos e sequência de origem/destino, combina registros sem duplicar identificadores e rejeita alterações conflitantes de IDs existentes. Parâmetros atuais são preservados na importação. O backup cobre todos os registros WIP, independentemente dos filtros. Arquivos inválidos preservam os dados anteriores. A base real atual (6) continua sendo a fonte de histórias; o arquivo (3) citado no pedido não estava disponível no checkout.

PDF de fluxo inclui os 14 tópicos gerenciais, definições, cobertura, fontes, filtros e gráficos. Cada gráfico permite PNG, seleção de séries, zoom e exploração dos pontos por teclado. Detalhamentos mostram US, movimentações, permanência nas etapas, validações e impedimentos. Tudo é armazenado no navegador, sem integração externa automática. Testes: `npx vitest run src/indicadores`; tipos: `npx tsc -p .tmp-indicadores-tsconfig.json`; build do protótipo: `npx vite build --mode pages`.
