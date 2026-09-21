# Controle de Vagas — Servidores Efetivos

## Finalidade

O módulo administra os quantitativos legalmente autorizados para cargos efetivos, sua distribuição entre órgãos e as vagas individualizadas decorrentes desses quantitativos.

Ele distingue a autorização legal do quadro, a distribuição administrativa da vaga e a ocupação por servidor.

## Conceitos

| Conceito | Significado |
| --- | --- |
| Quadro autorizado | Registro legal do quantitativo de um cargo efetivo, sua carreira, vínculo e órgãos de abrangência. |
| Vaga autorizada | Unidade do quantitativo definido no quadro. |
| Vaga pendente de distribuição | Vaga ainda atribuída a ESTADO DE MATO GROSSO, sem órgão destinatário. |
| Vaga distribuída | Vaga direcionada formalmente a um órgão. |
| Vaga disponível | Vaga distribuída, regular e sem ocupação ou comprometimento ativo. |
| Vaga em ocupação | Vaga reservada por processo de ingresso ainda em andamento. |
| Vaga ocupada | Vaga vinculada a servidor efetivo. |
| Versão | Registro histórico de uma alteração legal do quadro. |

## Fluxo principal

```mermaid
flowchart LR
  A[Base legal] --> B[Cadastro do quadro autorizado]
  B --> C[Individualização das vagas]
  C --> D[Distribuição para órgãos]
  D --> E[Disponibilidade]
  E --> F[Ingresso]
  F --> G[Ocupação]
```

1. O usuário cadastra um quadro autorizado com base legal, cargo, carreira, vínculo, quantitativo e vigência.
2. O sistema gera vagas individualizadas a partir do quantitativo autorizado.
3. Vagas sem órgão definido ficam pendentes de distribuição em ESTADO DE MATO GROSSO.
4. A distribuição direciona vagas para órgãos.
5. Vagas distribuídas e sem reserva ficam disponíveis para ingresso.
6. O ingresso pode comprometer uma vaga; a conclusão gera a ocupação.
7. Alterações legais são registradas como nova versão do mesmo quadro.

## Quadro Servidores Efetivos

Rota: `/prototipos/sigep/controle-vagas/efetivos/quadro-autorizado`

### Indicadores

| Indicador | Regra |
| --- | --- |
| Autorizadas | Soma das vagas autorizadas pelos quadros vigentes. |
| Ocupadas | Vagas com ocupação ativa. |
| Comprometidas | Vagas vinculadas a ingresso ou outro processo ativo. |
| Disponíveis | Vagas distribuídas, regulares e livres. |
| Pendentes de distribuição | Vagas ainda sem órgão destinatário. |

### Filtros

- Quadro: código ou identificação do quadro.
- Cargo.
- Órgão.
- Tipo de vínculo.
- Situação.
- Limpar filtros.

### Colunas e ações

A listagem apresenta quadro, cargo, órgão, autorizadas, ocupadas, comprometidas, disponíveis, pendentes de distribuição, situação e ações.

- **Olho**: visualiza o quadro.
- **Mais**: inicia uma nova versão quando permitido.
- **Seta**: expande o histórico de versões.

## Cadastro e vigência

O cadastro do quadro requer, conforme o tipo de autorização:

- base legal vinculada;
- cargo e carreira;
- vínculo e regime jurídico;
- abrangência ou órgão;
- quantitativo autorizado;
- data de início de vigência.

A situação operacional é calculada pela vigência e pelas operações legais. O histórico deve preservar a informação originalmente registrada.

## Vagas Individualizadas Efetivos

Rota: `/prototipos/sigep/controle-vagas/efetivos/vagas`

A tela permite localizar uma vaga específica, acompanhar sua situação, distribuição, ingresso, ocupação, posição funcional e histórico.

### Indicadores

Após selecionar um quadro, a tela apresenta o total de vagas autorizadas, distribuídas, pendentes de distribuição, disponíveis, em ocupação, ocupadas e com situação legal especial quando aplicável.

### Filtros

- Quadro autorizado;
- órgão;
- identificador da vaga;
- ocupante atual;
- ingresso/ocupação;
- situação legal.

### Situações da vaga

| Situação | Significado |
| --- | --- |
| Disponível | Apta para receber ingresso. |
| Em ocupação | Reservada por ingresso ativo. |
| Ocupada | Preenchida por servidor efetivo. |
| Pendente de distribuição | Ainda sem órgão destinatário. |
| Em extinção | Integrante de quadro em extinção progressiva. |
| Extinta | Retirada por ato legal. |
| Em transformação | Em alteração estrutural ou legal. |

## Distribuição e redistribuição

A distribuição atribui vagas pendentes a um ou mais órgãos. A redistribuição transfere vagas distribuídas entre órgãos, sem ultrapassar os quantitativos elegíveis.

Toda movimentação deve registrar data de efeito, base legal quando aplicável, órgão de origem, órgão de destino, quantitativo e histórico.

## Nova versão e operações legais

A primeira versão de uma série representa a **Criação**. As versões posteriores preservam o mesmo código de quadro e registram sua evolução.

| Operação | Efeito |
| --- | --- |
| Ampliação legal | Aumenta o quantitativo autorizado e cria novas vagas. |
| Redução legal | Reduz vagas disponíveis, regulares e sem comprometimento. |
| Distribuição | Direciona vagas pendentes para órgãos. |
| Redistribuição | Move vagas entre órgãos. |
| Atualização da base legal | Altera o fundamento sem modificar quantitativos. |
| Extinção progressiva | Bloqueia novas ocupações e preserva ocupações existentes até a desocupação. |
| Transformação | Registra alteração de cargo, estrutura ou vínculo conforme ato legal. |

## Extinção e encerramento

Em uma extinção progressiva, vagas livres e pendentes deixam de estar disponíveis. Vagas ocupadas permanecem vinculadas até sua desocupação e, depois, também são extintas.

O quadro é encerrado quando não houver vaga operacional, ocupação ou processo ativo remanescente.

## Integrações

O módulo depende ou deve integrar-se a:

- Cadastro de cargos, carreiras e perfis profissionais;
- Documentos legais;
- Cadastro organizacional de órgãos;
- Ingresso de servidor;
- Vida funcional e ocupações;
- Movimentações, remoções e cessões.

## Persistência e limites do protótipo

O protótipo utiliza dados locais e simulados para demonstrar regras e navegação. A versão de produção requer API, banco de dados, auditoria, permissões e integração com os módulos de origem.

## Padrão visual

O padrão visual aplicável às próximas evoluções está definido em `docs/controle-vagas.md`: breadcrumb, cabeçalho, KPIs, filtros, tabelas e formulários em cartões separados.
