# Controle de Vagas — padrão visual

Este documento define o padrão visual a ser adotado nas telas do módulo Controle de Vagas. Ele deve orientar as telas de efetivos, temporários, comissionados, bolsistas e as futuras categorias.

## Estrutura da página

A página deve ser composta por blocos independentes, separados por espaço vertical. Não usar uma área branca única envolvendo todo o conteúdo da tela.

1. **Breadcrumb**: cartão próprio no topo, com borda completa, cantos arredondados e a hierarquia de navegação. Não incluir atalho para a própria tela.
2. **Cabeçalho**: cartão próprio com título e descrição. Ações globais podem ficar neste bloco quando forem necessárias.
3. **KPIs**: os indicadores ficam em cartões individuais, organizados em grade, sem uma borda que envolva toda a linha.
4. **Filtros**: cartão próprio. Mostrar somente a borda externa; não usar linhas superior ou inferior internas ao redor dos campos.
5. **Listagem**: cartão próprio, contendo a barra de ações, tabela, estado vazio e paginação.
6. **Formulários**: cada assunto do cadastro fica em seu cartão, por exemplo: base legal, identificação, vigência, estrutura e ações de salvamento.

## Aparência dos cartões

- Fundo branco.
- Borda de `1px` em azul-cinza claro.
- Cantos arredondados.
- Espaçamento consistente entre cartões, em geral `1rem`.
- Sem sombras fortes.
- Em telas menores, manter os cartões e reorganizar apenas as grades de campos e indicadores.

## Breadcrumb e navegação

O breadcrumb segue o padrão das telas de Carreira: uma faixa simples de navegação, alinhada à largura dos cartões abaixo. Atalhos entre telas relacionadas só devem ser usados quando houver uma decisão funcional explícita e não devem criar espaço vazio ou duplicar a tela atual.

## Aplicação atual

O padrão já foi aplicado às telas de Vagas Temporárias. As demais telas de Controle de Vagas devem ser ajustadas para esse modelo em uma etapa posterior.

## Proposta em validação — edição e versionamento de quadros temporários

Esta proposta ainda não foi implementada.

O quadro temporário nasce a partir de um único processo seletivo e seus cargos. Por isso, o processo seletivo de origem, os cargos vinculados e a regra de cadastro reserva não devem ser alterados diretamente no quadro.

- A primeira versão será identificada como **Versão 1 — Criação**.
- Depois da criação, a alteração será feita por **Nova versão**, preservando a versão anterior para consulta.
- A nova versão exigirá documento legal, data de efeito igual ou anterior à data atual e justificativa da alteração. Não haverá situação agendada.
- Alterações de retificação do edital poderão atualizar as vagas previstas, mantendo a origem e o histórico da versão.
- As vagas temporárias reais serão calculadas pelos ingressos e ocupações; não serão editadas manualmente no quadro.
- A versão atual terá situação **Ativo**, **Extinto** ou **Encerrado**. O encerramento deve preservar o histórico e impedir novos ingressos.
- A listagem deve exibir a versão atual e oferecer as ações **Visualizar estrutura** e **Nova versão** quando a situação permitir.

Antes de implementar, precisam ser definidos quais tipos de retificação do processo seletivo podem gerar uma nova versão do quadro e se a extinção será tratada como uma versão específica.
