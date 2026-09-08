# Dúvidas funcionais — Cessão

Este documento registra questões que precisam de validação funcional ou jurídica durante a definição do módulo de Cessão do SIGEP. Uma dúvida registrada aqui não deve ser tratada como regra do sistema até sua confirmação.

## Controle das dúvidas

| ID | Tema | Dúvida | Evidência disponível | Situação | Responsável pela validação |
| --- | --- | --- | --- | --- | --- |
| CES-DUV-001 | Quantidade de vínculos | A cessão simultânea está limitada a exatamente dois vínculos efetivos ou pode abranger três ou mais vínculos da mesma pessoa? | A seção 2.1.2.3 do Manual de Cessão e Remoção, 4ª edição, trata expressamente apenas de servidor com dois vínculos e admite o afastamento de ambos para exercício de cargo em comissão. O manual não informa se essa exceção alcança mais de dois vínculos. | Pendente | Área responsável pela movimentação de pessoas / assessoria jurídica / PGE |

| CES-DUV-002 | Ônus e reembolso | Quais regras devem ser automatizadas para identificar as exceções ao ônus geral da cessão interna? | As seções 2.1.3 e 2.1.4 do manual apresentam regras específicas conforme carreira, órgão, finalidade e fonte de recursos. | Pendente | Área responsável pela movimentação de pessoas / Folha / Financeiro / assessoria jurídica |

## CES-DUV-001 — Limite de vínculos em uma cessão

### Contexto

O manual prevê uma situação excepcional na qual um servidor com dois vínculos efetivos pode ter ambos abrangidos pela cessão para desempenhar cargo em comissão no órgão cessionário.

Nesse caso, deve haver manifestação do servidor sobre a opção remuneratória:

1. remuneração integral do cargo em comissão; ou
2. remuneração de um dos cargos efetivos acrescida do percentual de comissionamento.

### Ponto não esclarecido

O manual utiliza especificamente as expressões “servidor com 02 vínculos” e “cessão dos dois vínculos efetivos”. Não há orientação expressa sobre servidor com três ou mais vínculos ativos.

### Pergunta para validação

A exceção pode ser aplicada a mais de dois vínculos efetivos ou o processo deve ficar limitado a, no máximo, dois vínculos?

### Impacto no SIGEP

Até a confirmação, o protótipo deve:

- permitir a cessão comum de um vínculo;
- listar todos os vínculos ativos da pessoa e permitir que ela indique exatamente quais serão afetados;
- permitir selecionar até dois vínculos específicos, mesmo quando a pessoa possuir mais vínculos ativos;
- não permitir automaticamente a cessão simultânea de três ou mais vínculos;
- encaminhar situações não previstas para análise excepcional.

### Fonte relacionada

- Manual de Cessão e Remoção, 4ª edição, seção 2.1.2.3.
- Parecer nº 925/SGACI/2019 e Manifestação nº 17/SGACI/2020 da PGE, mencionados pelo manual e ainda não analisados integralmente neste projeto.
## CES-DUV-002 — Exceções de ônus e reembolso

Devem ser retomadas e detalhadas antes da implementação definitiva das regras financeiras:

- determinadas situações envolvendo servidores do grupo TAF/SEFAZ;
- profissionais do SUS cedidos para atividades próprias do sistema;
- algumas cessões para a Assembleia Legislativa;
- requisição da Justiça Eleitoral;
- militares;
- servidores do sistema penitenciário e socioeducativo;
- folhas financiadas por recursos constitucionalmente vinculados ou fontes com finalidade específica, situação em que pode existir reembolso mesmo dentro do Poder Executivo.

Até a validação funcional e jurídica, essas situações não devem ser transformadas em decisões automáticas definitivas no SIGEP.