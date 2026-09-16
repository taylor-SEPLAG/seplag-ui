# Controle de Vagas — Bolsistas

## Finalidade

O módulo controla as vagas vinculadas aos cargos que possuem a opção **Controla vagas de bolsistas** marcada no cadastro de cargo. Cada cargo bolsista pode ter somente um quadro autorizado vigente.

## Quadro autorizado

O quadro informa o cargo bolsista, a quantidade autorizada, os documentos legais e a data de início. As vagas podem permanecer em **ESTADO DE MATO GROSSO**, o que representa pendência de distribuição, ou ser distribuídas formalmente a um órgão.

## Distribuição e ocupação

- Uma vaga somente fica disponível para ocupação depois de distribuída para um órgão.
- Vaga com órgão **ESTADO DE MATO GROSSO** está pendente de distribuição e não pode ser ocupada.
- A ocupação é iniciada pelo processo de ingresso do bolsista.

## Encerramento e extinção do quadro

Quando um quadro fica **Encerrado** ou **Extinto**:

- as vagas disponíveis são encerradas ou extintas, conforme a situação do quadro;
- as vagas pendentes de distribuição deixam de ser pendências operacionais e também são encerradas ou extintas;
- não é permitida nova distribuição, novo processo de ingresso ou nova ocupação dessas vagas;
- vagas já ocupadas permanecem vinculadas ao bolsista até a desocupação;
- após a desocupação, a vaga ocupada também é encerrada ou extinta e não volta a ficar disponível.

Os indicadores de vagas pendentes, disponíveis e em ocupação consideram somente quadros ativos. O total de vagas autorizadas e as distribuições realizadas preservam o histórico dos quadros encerrados e extintos.