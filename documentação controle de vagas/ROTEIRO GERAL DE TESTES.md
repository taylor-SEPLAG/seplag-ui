# Roteiro geral de testes — Controle de Vagas

## Preparação

1. Acesse o Dashboard Gerencial e confirme que os indicadores são carregados.
2. Abra Quadro Autorizado e identifique um quadro vigente com vagas ocupadas e disponíveis.
3. Abra Vagas Individualizadas e anote uma vaga ocupada e uma vaga disponível compatível.
4. Abra Movimentações e use os mesmos vínculos e vagas nos cenários abaixo.

## 1. Transferência entre duas vagas

1. Abra Movimentações > Transferências.
2. Clique em Nova transferência.
3. Selecione uma pessoa com ocupação ativa.
4. Selecione órgão, unidade e uma vaga numerada compatível.
5. Informe processo, ato, fundamento e data de efeito.
6. Simule e confirme a reserva.
7. Percorra análise, validação e publicação.
8. Efetive a transferência.

Resultado esperado: a ocupação de origem é encerrada, a vaga de origem fica disponível, uma nova ocupação ativa é criada na vaga de destino e os dois históricos são preservados.

## 2. Bloqueio por incompatibilidade

1. Inicie uma transferência.
2. Tente escolher uma vaga de cargo, carreira, perfil, tipo de vínculo ou órgão incompatível.
3. Tente prosseguir.

Resultado esperado: a compatibilidade fica inválida, os motivos são exibidos e nenhuma vaga ou ocupação é alterada.

## 3. Cancelamento antes da efetivação

1. Use uma movimentação já publicada e ainda não efetivada.
2. Abra o detalhe e selecione Cancelar após publicação.
3. Informe a justificativa e confirme.

Resultado esperado: a movimentação fica cancelada, os comprometimentos são cancelados, origem e destino mantêm os estados anteriores e o cancelamento permanece no histórico.

## 4. Efetivação em data futura

1. Registre uma transferência com data futura.
2. Publique o ato.
3. Tente efetivar antes da data.
4. Consulte novamente na data de efeito.

Resultado esperado: antes da data, a movimentação fica Agendada para efetivação e nenhuma vaga muda de estado. Na data, a transação é efetivada integralmente.

## 5. Consulta histórica antes e depois

1. Conclua uma transferência com data de efeito conhecida.
2. Consulte a posição no dia anterior.
3. Consulte novamente na data de efeito.

Resultado esperado: no dia anterior, o vínculo ocupa a vaga de origem e o destino permanece disponível. A partir da data de efeito, a origem aparece liberada e o vínculo ocupa o destino.

## 6. Cessão não desocupa a vaga

1. Registre e efetive uma cessão.
2. Consulte o vínculo e a vaga em Vagas Individualizadas.

Resultado esperado: o órgão de exercício muda, mas a vaga continua ocupada pelo mesmo vínculo e permanece vinculada ao órgão titular.

## 7. Remoção interna mantém a vaga

1. Registre uma remoção interna ou entre unidades.
2. Efetive a movimentação.
3. Consulte a ocupação.

Resultado esperado: lotação e/ou exercício mudam conforme o ato, mas o identificador da vaga e a ocupação permanecem os mesmos.

## 8. Transferência troca a ocupação

1. Consulte a ocupação ativa da origem.
2. Efetive a transferência.
3. Consulte as duas vagas.

Resultado esperado: a ocupação antiga fica encerrada; a vaga de origem fica disponível; uma nova ocupação ativa é criada no destino para o mesmo vínculo.

## Movimentações especiais

Também devem ser exercitados:

- remoção por permuta entre dois vínculos compatíveis;
- transferência coordenada com troca atômica;
- decisão judicial com processo identificado;
- efeito retroativo com data e justificativa separadas do registro;
- retificação de ato;
- cancelamento posterior à publicação;
- retorno ao órgão, unidade ou vaga anterior.

Em todos os casos, validar o histórico, o responsável, o processo, o ato, a data de registro e a data de efeito.
