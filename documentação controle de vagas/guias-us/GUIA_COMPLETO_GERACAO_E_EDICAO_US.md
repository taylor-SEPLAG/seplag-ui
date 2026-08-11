# Guia completo para gerar, revisar e editar Histórias de Usuário (US)

Este é o procedimento oficial para criar Histórias de Usuário do SIGEP, especialmente para o módulo Controle de Vagas. Ele consolida o padrão dos guias existentes e o procedimento aplicado na criação da US2 — Dashboard – Composição do Quadro.

## 1. Objetivo da US

Cada US deve descrever uma capacidade funcional implementável e testável. A história não deve ser apenas uma descrição visual da tela: deve explicar o comportamento, as fontes dos dados, as regras, as mensagens e os fluxos envolvidos.

Uma US deve responder:

- quem utiliza a funcionalidade;
- o que o usuário precisa fazer ou consultar;
- qual resultado o sistema deve produzir;
- de onde vêm os dados;
- quais regras impedem resultados incorretos;
- como o comportamento será validado.

## 2. Fontes que devem ser analisadas antes da escrita

Antes de redigir a US, analisar todas as fontes disponíveis e separar o que é requisito confirmado do que é apenas sugestão de protótipo:

1. transcrições de levantamento;
2. manuais e legislação fornecidos pelo usuário;
3. planilhas e bases de referência;
4. telas atuais do protótipo;
5. outras US relacionadas;
6. regras já definidas para o módulo.

As transcrições e os manuais têm prioridade sobre dados fictícios da interface. Mocks podem ser usados para demonstrar a funcionalidade, mas devem ser identificados como simulação quando ainda não houver integração real.

Não criar regras jurídicas, modalidades, campos ou integrações sem fonte ou decisão explícita do usuário. Quando houver incerteza, registrar a dependência ou a pendência na US.

## 3. Definição do escopo

Antes de preencher o modelo, delimitar a funcionalidade da US.

Exemplos:

- uma US para filtros e cards não deve detalhar toda a exportação;
- uma US para composição do quadro deve definir os cálculos e suas fontes, mas não alterar vagas;
- uma US de movimentação deve separar cessão, remoção e demais modalidades conforme a decisão vigente;
- uma tela somente consultiva não deve receber botões de edição ou ações de alteração.

Se uma tela possuir blocos independentes, considerar USs separadas quando isso melhorar a implementação e os testes.

## 4. Estrutura obrigatória da US

Manter esta ordem:

1. Histórico de alterações;
2. Identificação da US;
3. Descrição;
4. Premissas;
5. Critérios de aceitação;
6. Fluxos funcionais;
7. Descrição da tela;
8. Mensagens e confirmações;
9. Ações;
10. Regras de negócio;
11. Protótipo;
12. Matriz de permissões;
13. Documentos/Legislação.

Os títulos, identificadores e cabeçalhos do modelo devem ser preservados.

## 5. Identificação e histórico

Manter o prefixo `USXXX`, salvo solicitação expressa para numerar a história.

Exemplo:

```text
Nome: USXXX - Dashboard - 02 - Composição do Quadro
```

O histórico deve registrar data, versão, descrição da alteração e autor. A data deve representar a versão que está sendo editada; não reutilizar a data de uma US anterior.

## 6. Descrição da história

Usar o formato:

```text
Como [perfil do usuário],
Eu quero [objetivo funcional],
Para que [benefício ou resultado].
```

O texto deve descrever o objetivo da US, sem listar toda a implementação.

## 7. Premissas

As premissas registram dependências, limites e condições válidas antes da execução.

Incluir, quando aplicável:

- caminho da tela no sistema;
- base consolidada utilizada;
- data de referência;
- escopo legal do módulo;
- comportamento somente leitura;
- relação entre categorias que podem ser subconjuntos;
- dependência de outras telas ou USs;
- origem temporária em mocks;
- integração futura com outros módulos.

No Dashboard, por exemplo, deve ficar explícito que todos os blocos usam a mesma posição consolidada e os mesmos filtros.

## 8. Critérios de aceitação

Cada critério deve ser objetivo, independente e testável. Preservar `CA01`, `CA02` etc.

Formato recomendado:

```text
CA01 - [Nome do critério]
Dado que [contexto], quando [ação ou evento], então [resultado verificável].
```

Os critérios devem cobrir, quando fizer sentido:

- estado inicial;
- consulta com dados;
- consulta sem dados;
- erro de carregamento;
- filtros;
- data de referência;
- coerência entre cards, tabelas e gráficos;
- permissões;
- preservação de histórico;
- origem dos dados;
- ausência de dupla contagem;
- comportamento somente leitura ou gravação.

## 9. Fluxos funcionais

Separar cada jornada relevante em um fluxo próprio. Não juntar abertura, filtragem, cálculo, navegação e erro em um fluxo único quando isso dificultar o teste.

Cada fluxo deve conter passos na ordem real da operação. Não inserir numeração manual quando o modelo já possuir lista numerada.

Exemplos de fluxos para um Dashboard:

- exibir composição ao abrir;
- calcular categorias;
- atualizar após filtros;
- tratar ausência ou falha de dados;
- navegar para a origem mantendo o contexto.

## 10. Descrição da tela e origem dos dados

Para cada grupo da tela, manter a tabela com as colunas:

```text
Nome | Tipo | Editável | Obrigatório | Tamanho | Orientações/Observações
```

A coluna `Orientações/Observações` deve explicar tanto o comportamento quanto a origem funcional do dado. Não basta escrever “exibe o total”; registrar de qual tela ou entidade o total é obtido.

### Padrão de origem

Usar textos no formato:

```text
Origem: [tela ou entidade]; [campo, evento ou regra utilizado].
```

Exemplos do Controle de Vagas:

- `Origem: Quadro Autorizado; limite legal vigente e fundamento do quadro.`
- `Origem: Vagas Individualizadas; vagas numeradas, estado e situação legal.`
- `Origem: Vagas Individualizadas; ocupação nominal ativa vinculada à vaga.`
- `Origem: Distribuição; órgão de distribuição, ato e data de efeito.`
- `Origem: flags e processos automáticos da vaga; integração futura com Ingresso e Vida Funcional.`
- `Origem: histórico de eventos; movimentos com efeito até a data de referência.`

Quando a informação for derivada, explicar a regra:

```text
Derivado de Vagas legais menos Ocupadas, respeitando situação legal e comprometimentos ativos.
```

## 11. Regras para composição de indicadores

Quando a US calcular totais, definir explicitamente quais categorias são exclusivas e quais são complementares.

No Dashboard de Controle de Vagas:

```text
Vagas legais = Ocupadas + Disponíveis livres + Disponíveis comprometidas
```

As categorias abaixo são complementares e não devem ser somadas novamente:

- `Em disponibilização` é subconjunto de `Ocupadas`;
- `Disponíveis comprometidas` é subconjunto de `Disponíveis`;
- situações legais especiais são atributos da vaga, não parcelas adicionais.

Toda US com gráficos ou cards deve registrar a regra de não dupla contagem e a coerência com os demais blocos.

## 12. Mensagens e confirmações

Manter:

```text
Ação | Mensagem
```

As mensagens devem cobrir situações reais, como:

- consulta sem dados;
- data inválida;
- falha de origem;
- falha de consolidação;
- confirmação de atualização;
- operação somente leitura;
- categoria complementar ou subconjunto.

Evitar mensagens que prometam uma integração ainda inexistente. Para mocks, usar mensagem compatível com o protótipo e registrar a integração futura nas premissas.

## 13. Ações

Manter:

```text
Botão | Cor | Ação | Orientações/Observações
```

Descrever o efeito real de cada botão. Se a ação apenas navega para outra tela, informar a rota e o contexto preservado. Se a tela é somente leitura, não criar ações de edição, exclusão ou alteração de saldo.

## 14. Regras de negócio

Preservar `RN001`, `RN002` etc. As regras devem ser independentes do layout e escritas de forma verificável.

Exemplos:

- a composição deve usar uma única posição consolidada;
- todos os valores devem respeitar os filtros;
- vagas extintas não entram no total legal vigente;
- ocupada exige ocupação nominal ativa;
- vaga comprometida continua disponível até o evento definitivo;
- processo de disponibilização não libera a vaga antes da conclusão;
- a tela não altera registros de origem.

## 15. Protótipo

Informar a URL da tela e, quando necessário, o nome da rota.

```text
URL: http://localhost:5173/#/prototipos/sigep/controle-vagas/dashboard
Tela: Dashboard Gerencial
```

## 16. Processo de criação no Google Drive

1. Localizar a pasta oficial do projeto.
2. Localizar o modelo ativo pelo nome exato.
3. Criar uma cópia com o nome da nova US.
4. Ler o texto e as tabelas da cópia antes de editar.
5. Comparar a quantidade de premissas, critérios, fluxos, passos e linhas disponíveis com o conteúdo planejado.
6. Se o modelo não comportar a US, avisar antes de editar; não condensar conteúdo automaticamente.
7. Após revisão do usuário, aplicar as alterações na cópia.

## 17. Edição segura no Google Docs

Editar somente o conteúdo previsto pelo modelo:

- substituir placeholders;
- preservar títulos e seções;
- preservar cabeçalhos de tabelas;
- preservar `CAxx` e `RNxxx`;
- manter fluxos separados;
- substituir cada célula individualmente;
- não alterar `Matriz de permissões` ou `Documentos/Legislação` sem pedido explícito;
- usar controle de revisão para evitar sobrescrever alterações concorrentes.

Não apagar linhas excedentes deixando a tabela quebrada. Se houver itens demais, ampliar o modelo ou criar blocos adicionais com autorização.

## 18. Validação após a edição

Conferir o documento por texto e por tabelas:

- nome e módulo corretos;
- descrição no formato de história;
- todos os placeholders removidos;
- último critério presente, por exemplo `CA20`;
- última regra presente, por exemplo `RN020`;
- grupos de tela preenchidos;
- coluna `Orientações/Observações` contendo as origens;
- mensagens e ações preenchidas;
- fluxos separados e completos;
- URL do protótipo correta;
- `Matriz de permissões` preservada;
- `Documentos/Legislação` preservado;
- nenhuma edição aplicada em arquivo errado, duplicado antigo ou arquivo na lixeira.

Também validar coerência funcional: os números, filtros e regras da US devem corresponder à implementação atual e às demais USs relacionadas.

## 19. Entrega ao usuário

Ao finalizar, informar:

- nome do arquivo criado ou editado;
- link direto para o Google Doc;
- confirmação de que o modelo foi preservado;
- resumo das seções preenchidas;
- fontes de dados documentadas;
- limitações, mocks ou integrações futuras;
- qualquer pendência que exija decisão do usuário.

## 20. Regra de ouro

Uma US deve ser rastreável do requisito à tela e da tela à fonte do dado. O leitor deve conseguir identificar:

```text
Requisito → regra → campo/bloco da tela → origem do dado → critério de teste
```

Se essa cadeia não estiver clara, a US ainda não está pronta para implementação.
