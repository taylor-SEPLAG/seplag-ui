# Mapa funcional do SIGEP

Este documento explica como consultar e alimentar a tela **Mapa funcional do sistema**.

## Acesso

- Página de seleção: `/prototipos`
- Ação: **Visão do sistema**, no card do SIGEP
- Rota direta: `/prototipos/sigep/visao-sistema`

## Objetivo

O mapa é uma documentação viva dos protótipos. Ele apresenta módulos do SIGEP, domínio funcional, estágio, entradas, entregas, dependências, impactos, pendências e o acesso ao protótipo existente.

## Onde alimentar

Os dados estão centralizados em:

```text
src/prototipos/sigepVisaoSistemaData.ts
```

A interface e os estilos ficam em:

```text
src/prototipos/SigepVisaoSistemaPage.tsx
src/prototipos/sigepVisaoSistema.css
```

Normalmente, para atualizar o mapa, altere somente `sigepVisaoSistemaData.ts`.

## Estrutura de um módulo

Cada objeto de `sigepSystemModules` representa um módulo ou uma capacidade funcional.

```ts
{
  id: "exemplo-modulo",
  name: "Exemplo de módulo",
  shortDescription: "Resumo curto do módulo.",
  objective: "Explica por que o módulo existe e o que entrega.",
  domain: "CONTROLE_VAGAS",
  status: "EM_PROTOTIPACAO",
  icon: "pi pi-cog",
  route: "/prototipos/sigep/exemplo",
  dependsOn: ["documentos-legais"],
  impacts: ["dashboard"],
  inputs: ["Documento legal", "Dados cadastrais"],
  outputs: ["Registro funcional", "Evento para outros módulos"],
  pending: ["Validar regra com a área responsável"],
}
```

## Campos

| Campo | Obrigatório | Preenchimento |
| --- | --- | --- |
| `id` | Sim | Identificador único e estável, em minúsculas e separado por hífen. Não altere depois que houver referências. |
| `name` | Sim | Nome funcional exibido ao usuário. |
| `shortDescription` | Sim | Resumo curto da responsabilidade. |
| `objective` | Sim | Objetivo e resultado esperado em linguagem de negócio. |
| `domain` | Sim | Domínio que agrupa o item no mapa. |
| `status` | Sim | Situação atual do protótipo ou da integração. |
| `icon` | Sim | Classe PrimeIcons, por exemplo `pi pi-book`. |
| `route` | Não | Rota interna. Omita quando ainda não existir protótipo navegável. |
| `dependsOn` | Sim | IDs dos módulos necessários para este funcionar. Use `[]` quando não houver. |
| `impacts` | Sim | IDs dos módulos que recebem dados ou efeitos deste. Use `[]` quando não houver. |
| `inputs` | Sim | Dados, eventos ou documentos consumidos. |
| `outputs` | Sim | Registros, eventos ou informações produzidos. |
| `pending` | Sim | Pendências de regra, validação, protótipo ou integração. Use `[]` quando não houver. |

## Domínios permitidos

| Valor | Uso |
| --- | --- |
| `BASE_JURIDICA` | Leis, decretos, atos, vigência e fundamentos legais. |
| `CADASTROS` | Carreiras, cargos, perfis, CBO, órgãos e unidades. |
| `CONTROLE_VAGAS` | Quadro autorizado, vagas individualizadas e distribuição. |
| `INGRESSO` | Concurso, seletivo, nomeação, posse e exercício. |
| `VIDA_FUNCIONAL` | Vínculos, cessões, remoções, transferências e saídas. |
| `GESTAO` | Dashboard, projeções, alertas e planejamento. |

Para criar um domínio, atualize `SigepDomain`, `sigepDomainLabels` e `domainOrder` em `SigepVisaoSistemaPage.tsx`.

## Situações permitidas

| Valor | Quando usar |
| --- | --- |
| `PLANEJADO` | Escopo identificado, implementação ainda não iniciada. |
| `EM_PROTOTIPACAO` | Tela ou fluxo em construção e sujeito a mudanças. |
| `PROTOTIPO_CONCLUIDO` | Protótipo da etapa atual implementado e navegável. Não significa pronto para produção. |
| `AGUARDANDO_VALIDACAO` | Implementação existente aguardando validação funcional ou jurídica. |
| `INTEGRACAO_PENDENTE` | Dependência de dados, serviços, eventos ou cadastros de outro módulo. |

## Dependências e impactos

As relações usam o `id`, nunca o nome visível.

```ts
{
  id: "quadro-autorizado",
  dependsOn: ["documentos-legais", "carreiras-cargos"],
  impacts: ["vagas-individualizadas", "distribuicao", "dashboard"],
}
```

Isso significa que o Quadro Autorizado precisa dos documentos e cadastros e que seu resultado alimenta vagas, distribuição e dashboard.

Regras:

- Referencie somente IDs existentes.
- Não crie autorreferência.
- Mapeie relações funcionais, não imports técnicos.
- Quando `A` impacta diretamente `B`, revise se `B` também deve declarar `A` em `dependsOn`.
- Explique trocas de mão dupla por meio de entradas e entregas.

## Como cadastrar um módulo

1. Defina um `id` único e estável.
2. Escolha o domínio correto.
3. Descreva objetivo, entradas e entregas.
4. Mapeie dependências e impactos por ID.
5. Informe a situação real, sem antecipar conclusão.
6. Adicione a rota somente se estiver registrada e navegável.
7. Registre as pendências conhecidas.
8. Revise os objetos dos módulos relacionados.
9. Execute as validações deste documento.

O novo item aparecerá automaticamente dentro do domínio escolhido.

## Como atualizar um módulo

Atualize o mesmo objeto quando houver mudança de status, rota, escopo, integração, dependência, impacto ou pendência. Não crie outro objeto para representar uma versão do mesmo módulo; o histórico é preservado pelo Git.

Crie um item separado somente quando a capacidade tiver responsabilidade própria, entradas e entregas diferentes, evolução independente ou fluxo próprio. Abas, filtros, modais e operações internas normalmente permanecem no módulo existente.

## Comportamento da tela

- Clicar em um módulo abre seus detalhes no painel lateral.
- Dependências e impactos são navegáveis.
- O módulo selecionado e os relacionados recebem destaque.
- Os filtros reduzem o destaque dos itens fora do critério sem removê-los do fluxo.
- **Somente com pendências** considera o conteúdo de `pending`.
- **Abrir protótipo** aparece somente quando existe `route`.

## Checklist

- [ ] O `id` é único e estável.
- [ ] IDs de `dependsOn` e `impacts` existem.
- [ ] Domínio e situação usam valores permitidos.
- [ ] A rota abre uma tela existente.
- [ ] Entradas e entregas estão em linguagem de negócio.
- [ ] Pendências resolvidas foram removidas.
- [ ] Novas pendências foram registradas.
- [ ] Módulos relacionados foram revisados.
- [ ] A tela `/prototipos/sigep/visao-sistema` abre sem erro.

## Validação técnica

```bash
npm run type-check
npm run build:pages
```

Depois:

1. Abra `/prototipos`.
2. Clique em **Visão do sistema**.
3. Teste os filtros.
4. Selecione o módulo alterado.
5. Navegue por dependências e impactos.
6. Teste **Abrir protótipo**, quando houver rota.

## Problemas comuns

### A aplicação fica em branco

Confira se os nomes importados em `SigepVisaoSistemaPage.tsx` correspondem exatamente aos exports de `sigepVisaoSistemaData.ts`. Um import inexistente impede o carregamento da aplicação.

### Uma relação não aparece

Confirme se foi usado o `id` do módulo, e não o `name`.

### Abrir protótipo não aparece

O campo `route` está ausente. Só o adicione depois de registrar a rota em `src/App.tsx`.

### O módulo aparece na etapa errada

Revise `domain`. A ordem das etapas é definida por `domainOrder`.

## Responsabilidade

Quem criar ou alterar um protótipo deve atualizar o mapa na mesma entrega, revisando objetivo, entradas, entregas, dependências, impactos, situação e pendências.
