# Indicadores do Projeto SIGEP

Página integrada em `/calendario/indicadores/projeto`, com o mesmo menu e tema da área de Processos.

`dados-iniciais.json` é uma extração do arquivo real **PROJETO SIGEP - CONTROLE US (6).xlsx** fornecido pelo usuário. O botão **Atualizar dados da planilha** usa o mesmo leitor de `importacao.ts` e salva a base normalizada no navegador. Ao carregar o painel, uma base fornecida mais recente prevalece sobre importações antigas; importações manuais posteriores são preservadas. Não há envio do arquivo para um serviço externo.

## Conferência da base fornecida

| Sprint | Registros | Pontos | Reaparições |
| --- | ---: | ---: | ---: |
| 18 | 11 | 74 | 0 |
| 19 | 22 | 123 | 0 |
| 20 | 29 | 202 | 11 |
| 21 | 34 | 188 | 13 |
| 22 | 42 | 189 | 0 |
| 23 | 43 | 311 | 13 |

Totais: **144 US distintas, 181 registros, 1.087 pontos e 37 reaparições**.

O leitor identifica os cabeçalhos pelo nome, considera o bloco do início de período mais recente de cada aba e preserva o período original de cada linha. A US271 está explicitamente marcada como removida e é mantida no registro de exclusões. Quinze registros da Sprint 21 têm ano de término inconsistente; o término predominante válido é usado apenas no metadado da sprint, sem reescrever as células originais.

Conclusões distintas usam a última aparição da US no recorte filtrado. Na base atual, as Sprints 18 a 21 possuem situações de conclusão registradas. Há **99 US concluídas** na última aparição do recorte completo, com situação conhecida em 143 das 144 histórias e taxa de conclusão confirmada de **68,75%**. Por sprint, as conclusões registradas são 11, 22, 29, 34, 28 e 0. A Sprint 18 identifica sete desenvolvedores associados. QA atribuído e ambiente de teste não comprovam aprovação ou homologação.

Pessoas em histórias compartilhadas mantêm todas as associações, sem duplicar totais globais. Valores vazios permanecem desconhecidos. Disponibilidade, FTE real e indicadores específicos de QA não são presumidos. O simulador de capacity é identificado separadamente e não modifica os dados históricos.

Os gráficos usam Chart.js com animação, seleção, navegação por teclado, legendas interativas e zoom. PDF, PNG, Excel e resumo executivo são gerados localmente com os filtros aplicados.

Verificações: `npx vitest run src/indicadores` e `npx eslint src/indicadores`.
