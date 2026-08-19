# Relatório de atividades — Controle de Vagas 3.0

**Data:** 19/08/2026  
**Projeto:** SIGEP — SEPLAG UI  
**Módulo:** Controle de Vagas 3.0  
**Foco:** Quadro Autorizado, versionamento, distribuição e documentação de US

## 1. Objetivo do trabalho

Durante a sessão foram revisados pontos do protótipo de Controle de Vagas relacionados ao versionamento do Quadro Autorizado, com atenção especial ao comportamento de versões agendadas, histórico de versões e especificação das histórias de usuário.

Também foram atualizados os guias de criação de US para padronizar a seção de Regras de negócio em tabela com duas colunas.

Nenhum commit ou envio para repositório remoto foi realizado nesta etapa.

## 2. Ajustes no protótipo

### 2.1 Detecção de versão agendada existente

Foi ajustada a lógica de identificação de versão agendada no componente de versionamento.

Antes, a detecção dependia principalmente do texto da situação da versão. Isso não era suficiente em cenários nos quais a versão possuía data de ativação futura, mas não era reconhecida de forma confiável como agendada.

Depois do ajuste, o sistema considera:

- mesmo código do Quadro Autorizado;
- versão diferente da versão atual selecionada;
- versão ainda não encerrada ou extinta;
- situação "Vigência futura" ou data de ativação futura.

### 2.2 Modal ao tentar versionar quadro com agendamento existente

Foi implementado um modal exibido imediatamente ao acessar a tela de nova versão quando já existe versão agendada para o mesmo quadro.

O modal informa que já existe agendamento e pergunta se o usuário deseja continuar. Ao continuar, o usuário assume que a nova versão substituirá o agendamento anterior.

Se o usuário cancelar ou fechar o modal, o sistema retorna para a listagem do Quadro Autorizado.

### 2.3 Substituição efetiva de agendamento anterior

Foi corrigido o comportamento de substituição de versão agendada.

Antes, a versão agendada anterior recebia apenas a situação textual "Encerrada", mas mantinha campos que faziam o cálculo operacional continuar classificando-a como agendada.

Agora, ao registrar nova versão que substitui agendamento existente, as versões agendadas anteriores do mesmo quadro são encerradas de forma consistente:

- situação textual passa para "Encerrada";
- situação de vigência passa para "ENCERRADO";
- data de encerramento é preenchida;
- fim de vigência é preenchido;
- motivo de encerramento registra que a versão agendada foi substituída por novo versionamento.

Com isso, apenas uma versão agendada válida permanece para o quadro.

### 2.4 Correção do histórico de versões

Foi corrigida a exibição do histórico de versões do Quadro Autorizado.

Antes, toda versão exibida no histórico era apresentada como "Encerrada", mesmo quando era uma versão futura/agendada.

Depois do ajuste, cada versão no histórico usa o status operacional real:

- Agendado;
- Ativo;
- Encerrado;
- Extinto.

O texto "Encerrada em" só é exibido quando a versão realmente possui encerramento.

### 2.5 Modal de visualização de versão

O modal de visualização de versão também passou a respeitar o status real da versão.

Assim, uma versão futura exibida no histórico aparece como Agendada também no detalhe, e não como Encerrada.

## 3. Análise funcional de agendamento

Foi analisado o cenário em que a listagem principal exibe a versão vigente do quadro, enquanto o histórico expansível apresenta versões agendadas.

A conclusão funcional consolidada foi:

- a linha principal deve continuar exibindo a versão vigente enquanto uma versão futura ainda não produz efeitos;
- versões futuras devem aparecer como Agendadas;
- versões agendadas substituídas devem deixar de aparecer como agendamentos ativos;
- o histórico não deve tratar automaticamente toda versão fora da linha principal como Encerrada.

## 4. Revisão e reescrita de US

### 4.1 US de Ampliação, Redução, Transformação e Extinção progressiva

Foi analisada a US temporária enviada pelo usuário e comparada com o protótipo atual.

A US foi reescrita no chat com escopo restrito às operações:

- Ampliação;
- Redução;
- Transformação;
- Extinção progressiva.

Distribuição e Redistribuição foram mantidas fora desse escopo por decisão funcional, para evitar uma US extensa demais.

### 4.2 US de Distribuição

Foi gerada no chat uma nova US específica para Distribuição como operação versionada do Quadro Autorizado.

A US contempla:

- distribuição como evolução versionada;
- uso apenas de vagas Pendentes de distribuição;
- exibição da distribuição atual;
- bloqueio de remoção ou redução de distribuição já existente;
- possibilidade de acrescentar vagas a órgão já distribuído;
- inclusão de novas destinações;
- bloqueio de órgãos duplicados;
- validação de saldo pendente;
- simulação;
- confirmação;
- registro de movimentos individuais por vaga;
- preservação do ID técnico;
- geração do Nome da vaga após a distribuição.

Foi reforçado que o Nome da vaga deve seguir a composição:

```text
Órgão + Cargo + Sequencial
```

No padrão:

```text
ORGAO-CARGO-00000
```

Essa regra foi separada conceitualmente do ID técnico, que permanece único e imutável.

## 5. Atualização dos guias de criação de US

Foram atualizados os guias em:

- `documentação controle de vagas/guias-us/GUIA_GERACAO_US_NO_CHAT.md`;
- `documentação controle de vagas/guias-us/GUIA_COMPLETO_GERACAO_E_EDICAO_US.md`.

O ajuste padronizou a seção **Regras de negócio** para ser apresentada em tabela com duas colunas:

| Nº | Descrição da regra |
|---|---|
| RN001 | Descrição completa da regra. |

Também foi registrado que as regras não devem ser geradas como lista solta no formato `RN001 - ...`, salvo solicitação explícita do usuário.

## 6. Arquivos alterados

### 6.1 Protótipo

- `src/prototipos/controleVagas/QuadroLegalOperacoes.tsx`
  - detecção de versão agendada existente;
  - modal de confirmação ao entrar no versionamento com agendamento existente;
  - encerramento real das versões agendadas substituídas;
  - mensagem de substituição de agendamento.

- `src/prototipos/controleVagas/QuadroAutorizadoContent.tsx`
  - status real no histórico de versões;
  - remoção da exibição indevida de "Encerrada em" para versões agendadas;
  - status correto no modal de detalhe da versão.

### 6.2 Documentação

- `documentação controle de vagas/guias-us/GUIA_GERACAO_US_NO_CHAT.md`
  - regras de negócio em tabela de duas colunas.

- `documentação controle de vagas/guias-us/GUIA_COMPLETO_GERACAO_E_EDICAO_US.md`
  - regras de negócio em tabela de duas colunas;
  - exemplo atualizado em formato tabular.

## 7. Validações executadas

Foram executadas as seguintes validações após os ajustes de protótipo:

```text
.\node_modules\.bin\vitest.cmd run src\prototipos\controleVagas\_menuSmoke.test.tsx
```

Resultado:

- 1 arquivo de teste aprovado;
- 16 testes aprovados.

Também foi executado:

```text
npm.cmd run build
```

Resultado:

- build concluído com sucesso.

## 8. Pontos de atenção remanescentes

### 8.1 ID técnico da vaga

Ainda há ponto pendente relacionado à geração do ID técnico da vaga.

A regra funcional consolidada indica que o ID técnico deve ser único, imutável e não depender de órgão, cargo ou Nome da vaga.

O Nome da vaga, por outro lado, pode depender da distribuição e seguir o padrão:

```text
ORGAO-CARGO-00000
```

Esse ajuste de modelagem deve ser tratado separadamente para evitar misturar ID técnico com identificação funcional exibida ao usuário.

### 8.2 Código residual de inclusão/exclusão de órgão

Embora inclusão e exclusão de órgão não estejam disponíveis como operações visíveis do versionamento, ainda existe código residual relacionado a essas operações no componente.

Recomenda-se limpeza posterior para reduzir ambiguidade e alinhar o código ao escopo funcional definido.

### 8.3 Redistribuição

A Redistribuição permanece disponível no protótipo, mas deve ser documentada em US própria.

Esta sessão gerou a US específica de Distribuição, mas não gerou ainda a US específica de Redistribuição.

## 9. Situação final

Ao final da sessão:

- o protótipo passou a tratar corretamente versões agendadas existentes;
- o usuário recebe aviso modal antes de continuar com novo versionamento que substituirá agendamento;
- versões agendadas substituídas deixam de aparecer como agendamentos ativos;
- o histórico de versões diferencia corretamente Agendado, Ativo, Encerrado e Extinto;
- os guias de criação de US foram atualizados para exigir tabela de Regras de negócio com duas colunas;
- foi gerada no chat a US específica de Distribuição como versionamento do Quadro Autorizado.
