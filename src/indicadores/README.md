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

Pessoas em histórias compartilhadas mantêm todas as associações, sem duplicar totais globais. Valores vazios permanecem desconhecidos. Dedicação, jornada, FTE real e indicadores específicos de QA não são presumidos. O simulador de capacity é identificado separadamente e não modifica os dados históricos.

Os gráficos usam Chart.js com animação, seleção, navegação por teclado, legendas interativas e zoom. PDF, PNG, Excel e resumo executivo são gerados localmente com os filtros aplicados.

Verificações: `npx vitest run src/indicadores` e `npx eslint src/indicadores`.
