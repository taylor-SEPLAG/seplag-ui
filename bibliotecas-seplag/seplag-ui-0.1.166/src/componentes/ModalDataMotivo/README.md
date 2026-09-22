# `ModalDataMotivo/` — ModalDataMotivoSeplag

## Objetivo

Modal padronizado que coleta **uma data e um motivo** — encerramento, extinção e ações parecidas
sobre um registro. O nome é deliberadamente abstrato: título, rótulos, mensagem e ícone vêm por props.

## Responsabilidade principal

Reunir num só lugar o formulário "data + motivo" que se repetia em telas de cadastro: data
pré-preenchida com hoje, calendário limitado, motivo obrigatório, estado de carregamento e reset ao
reabrir. Não faz chamadas HTTP e não fecha a si mesmo.

## Ponto de entrada

[`index.tsx`](./index.tsx) — exporta `ModalDataMotivoSeplag` (nomeado e `default`) e os tipos
`ModalDataMotivoSeplagProps` e `ModalDataMotivoValoresSeplag`.

## Funcionalidades existentes

### Props

| Prop                  | Default               | Papel                                                                                       |
| --------------------- | --------------------- | ------------------------------------------------------------------------------------------- |
| `id`                  | `"modal-data-motivo"` | Base dos `data-testid` e dos `name` dos campos (evite `.`)                                  |
| `visible`             | —                     | Controlado pelo consumidor                                                                  |
| `titulo`              | —                     | Cabeçalho do modal                                                                          |
| `onConfirm`           | —                     | Recebe `{ data, motivo }` só depois de o formulário validar                                 |
| `onCancel`            | —                     | Botão "Cancelar", "X" e ESC                                                                 |
| `confirmando`         | `false`               | Spinner no botão de ação; trava campos, cancelar e ESC                                      |
| `carregando`          | `false`               | Mesmo bloqueio, para quando o host ainda busca dados (ex.: a data de referência)            |
| `mensagem`            | —                     | Aviso `info` no topo; omitido se não informado                                              |
| `dataReferencia`      | —                     | Data somente leitura **e** limite mínimo do calendário. Aceita `dd/MM/yyyy` ou `yyyy-MM-dd` |
| `labelDataReferencia` | `"Data de início"`    | Rótulo da data somente leitura                                                              |
| `labelData`           | `"Data"`              | Rótulo do campo de data                                                                     |
| `labelMotivo`         | `"Motivo"`            | Rótulo do campo de motivo                                                                   |
| `labelAcao`           | `"Confirmar"`         | Botão de ação                                                                               |
| `iconAcao`            | `"pi pi-check"`       | Ícone do botão de ação                                                                      |
| `labelCancelar`       | `"Cancelar"`          | Botão de cancelar                                                                           |
| `maxLengthMotivo`     | `500`                 | Limite do motivo                                                                            |
| `tamanho`             | `"45vw"`              | Largura do modal                                                                            |

### Comportamento

- A data nasce preenchida com **hoje**; o motivo, vazio. Reabrir o modal (`visible` volta a `true`)
  restaura esses valores.
- Data e motivo são **obrigatórios**.
- `maxDate` é hoje e `minDate` é `dataReferencia`. **Os limites valem só para a escolha no
  calendário**: o `DateFieldSeplag` deixa o que foi digitado chegar ao formulário, então uma data fora
  do intervalo chega ao `onConfirm` e a recusa (com mensagem) fica com o backend.
- `data` é devolvida em `dd/MM/yyyy`; converta para ISO no consumidor se o contrato pedir.
- Fechar o modal após o sucesso é do consumidor. Em caso de falha, mantenha `visible` para não
  descartar o motivo digitado.

### Identificadores

`{id}` · `{id}-fechar` · `{id}-acao` · `{id}-close-x` · `{id}-mensagem` · `{id}-referencia` ·
`{id}-data` · `{id}-motivo`.

## Dependências

### Internas

- [`../Modal`](../Modal/) — `ModalSeplag`
- [`../Mensagem`](../Mensagem/) — `MensagemSeplag`
- [`../Fields`](../Fields/) — `DateFieldSeplag`, `TextAreaFieldSeplag`
- [`../../uteis/manipulaData`](../../uteis/) — `formatDateToStringSeplag`, `stringToDateSeplag`

### Externas (peers)

`react` · `react-hook-form` (formulário interno)

## Exemplo

```tsx
<ModalDataMotivoSeplag
  visible={visivel}
  titulo={`Encerrar tipo de vínculo — ${nome}`}
  mensagem="Ao confirmar, o encerramento será registrado com a data e o motivo informados."
  dataReferencia={tipoVinculo.dataInicioVigencia}
  labelDataReferencia="Início da vigência"
  labelData="Data de encerramento"
  labelMotivo="Motivo do encerramento"
  labelAcao="Encerrar"
  iconAcao="pi pi-ban"
  confirmando={isEncerrando}
  onCancel={() => setVisivel(false)}
  onConfirm={async ({ data, motivo }) => {
    const ok = await encerrar(tipoVinculo, {
      dataEncerramento: data,
      infoMtvoEncerramento: motivo,
    });
    if (ok) setVisivel(false);
  }}
/>
```

## Arquivos críticos

- [`index.tsx`](./index.tsx) — único arquivo do componente.

## Testes

Arquivo: [`index.test.tsx`](./index.test.tsx) · execução: `npx vitest run src/componentes/ModalDataMotivo`

Especificação escrita **antes** do código de teste (SDD). Cada linha da tabela corresponde a
exatamente um `it(...)`, identificado pelo ID em comentário. Padrão AAA. O `ModalSeplag` e os campos
são renderizados de verdade (sem `vi.mock`). Convenções gerais em
[`src/README.md` → Arquitetura de testes](../../README.md#arquitetura-de-testes).

| ID     | Cenário                                               | Assert principal                                                                                       |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| MDM-01 | Render com props mínimas                              | Título, botões "Cancelar"/"Confirmar", campos de data e motivo presentes                               |
| MDM-02 | Estado inicial                                        | Data preenchida com hoje (`dd/MM/yyyy`); motivo vazio                                                  |
| MDM-03 | `mensagem` informada / ausente                        | Aviso aparece; sem a prop, não existe                                                                  |
| MDM-04 | `dataReferencia` informada / ausente                  | Campo `{id}-referencia` presente e desabilitado com o valor formatado; ausente sem a prop; aceita ISO  |
| MDM-05 | Confirmar com motivo preenchido                       | `onConfirm` chamado uma vez com `{ data, motivo }`                                                     |
| MDM-06 | Confirmar com motivo vazio                            | `onConfirm` **não** é chamado                                                                          |
| MDM-07 | Clicar em "Cancelar"                                  | `onCancel` chamado; `onConfirm` não                                                                    |
| MDM-08 | `confirmando`                                         | Botão de ação em loading/desabilitado, "Cancelar" e campos desabilitados                               |
| MDM-09 | `carregando`                                          | Botão de ação e campos desabilitados                                                                   |
| MDM-10 | Data digitada fora do intervalo                       | Não é bloqueada no front: chega ao `onConfirm`                                                         |
| MDM-11 | Fechar e reabrir                                      | Data volta a hoje e motivo volta a vazio                                                               |
| MDM-12 | `id` customizado e rótulos/ícone/limites customizados | `data-testid` derivados do `id`; `labelAcao`, `labelData`, `labelMotivo` e `maxLengthMotivo` aplicados |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md)
- [`Modal/README.md`](../Modal/README.md) · [`ModalDelete/README.md`](../ModalDelete/README.md)
