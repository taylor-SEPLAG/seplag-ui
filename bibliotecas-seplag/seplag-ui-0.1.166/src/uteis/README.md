# `uteis/` — Utilitários puros

## Objetivo

Concentrar funções puras, sem React e sem PrimeReact, reutilizadas pelos componentes da
biblioteca e expostas ao consumidor: manipulação de datas, formatação e validação de
CPF/CNPJ, conversão base64, tradução de grid responsivo e validadores prontos para
`react-hook-form`.

## Responsabilidade principal

Ser a **camada mais baixa do grafo de dependências**. Nada em `uteis/` importa
`componentes/`, `hooks/` ou `provider/` — apenas `date-fns` e outros arquivos do próprio módulo.

## Ponto de entrada

[`index.ts`](./index.ts) — barrel re-exportado por `src/index.ts`, portanto **API pública**.

```ts
export { formatarParaCNPJComPaddingSeplag, formatCNPJSeplag,
         formatCPFSeplag as formatCPFFromCpfCnpjSeplag,
         unmaskedCNPJSeplag, unmaskedSeplag, validarCNPJSeplag } from "./cpfCnpj/manipulaCNPJAndCPF";
export { baixarArquivoBase64Seplag, base64ParaBlobSeplag } from "./base64ParaBlob";
export { formatCPFSeplag } from "./formatCpf";
export * from "./manipulaData";
export { toBase64Seplag } from "./toBase64";
export * from "./validacoes/validacaoCNPJ";
export * from "./validacoes/validacaoDataNaoFutura";
```

> **Atenção ao alias de exportação:** existem **duas** implementações de formatação de CPF.
> `formatCpf.ts` (exportada como `formatCPFSeplag`) limpa a entrada e aplica a máscara
> progressivamente; `cpfCnpj/manipulaCNPJAndCPF.ts` (reexportada como
> `formatCPFFromCpfCnpjSeplag`) exige exatamente 11 dígitos e não remove caracteres.

## Funcionalidades existentes

### Datas — [`manipulaData.ts`](./manipulaData.ts)

| Função | Comportamento |
| --- | --- |
| `stringToDateSeplag(v)` | Aceita `Date`, `"dd/MM/yyyy"` ou `"yyyy-MM-dd"`. Valida com regex antes de parsear. Retorna `null` em falha. |
| `formatDateToStringSeplag(date)` | `Date` → `"dd/MM/yyyy"`; `null` se inválida |
| `formatAnyDateSeplag(...datas)` | Retorna a **primeira** entrada truthy formatada; `"-"` se nenhuma for válida. Usa `parseISO`. |
| `formatDateFieldSeplag(v)` | Tenta `new Date(v)`; retorna `undefined` em falha |
| `isDateBeforeSeplag(a, b)` | Compara apenas a data (`startOfDay`), ignorando horas |
| `isDateAfterSeplag(a, b)` | Idem, invertido |

### CPF / CNPJ — [`cpfCnpj/manipulaCNPJAndCPF.ts`](./cpfCnpj/manipulaCNPJAndCPF.ts)

| Função | Comportamento |
| --- | --- |
| `formatCPFSeplag` (→ `formatCPFFromCpfCnpjSeplag`) | Regex de 11 dígitos exatos → `000.000.000-00` |
| `formatCNPJSeplag` | Regex de 14 dígitos → `00.000.000/0000-00` |
| `formatarParaCNPJComPaddingSeplag` | Preenche com zeros à esquerda até 14; retorna string de erro se houver mais de 14 dígitos |
| `unmaskedSeplag` | Remove tudo que não for dígito |
| `unmaskedCNPJSeplag` | Remove apenas `.`, `-` e `/`, e converte para maiúsculas (suporta **CNPJ alfanumérico**) |
| `validarCNPJSeplag` | Valida DV conforme especificação SERPRO (`charCodeAt - 48`), aceitando letras. Rejeita comprimento ≠ 14 e sequências repetidas. |

### Base64 — [`base64ParaBlob.ts`](./base64ParaBlob.ts) · [`toBase64.ts`](./toBase64.ts)

- `base64ParaBlobSeplag(base64, mimeType)` → `Blob`
- `baixarArquivoBase64Seplag(base64, nomeArquivo, mimeType?)` — cria `<a download>`, clica,
  remove e faz `revokeObjectURL`
- `toBase64Seplag(file)` → `Promise<string>` via `FileReader.readAsDataURL` (retorna **com**
  o prefixo `data:`)

### Grid — [`Grid.ts`](./Grid.ts)

`classesCssSeplag(cols)` — **default export**, não está no barrel. Converte até 3 tokens em
classes PrimeFlex:

```
"12"      → " col-12"
"12 6"    → " col-12 md:col-6"
"12 6 3"  → " col-12 md:col-6 lg:col-3"
```

### Validadores para `react-hook-form` — [`validacoes/`](./validacoes/)

- `validacaoCNPJSeplag(label?)` → função para `rules.validate`. Vazio é válido;
  `< 14` dígitos → `"{label} incompleto"`; DV inválido → `"{label} inválido"`.
- `validacaoDataNaoFuturaSeplag(mensagem?)` → função para `customValidation` do `DateFieldSeplag`.

### Erro em objeto aninhado — [`getErrorMessageInObject.ts`](./getErrorMessageInObject.ts)

`getErrorMessageInObjectSeplag(obj, "endereco.cidade")` percorre o caminho por `.` e devolve
`{ type?, message? } | null`. **Não está no barrel** — é uso interno de
`useMensagemErroFormularioSeplag`.

## Dependências

- **Externas:** `date-fns` (única dependência direta do pacote).
- **Internas:** `validacoes/validacaoCNPJ` → `cpfCnpj/manipulaCNPJAndCPF`;
  `validacoes/validacaoDataNaoFutura` → `manipulaData`.
- **Navegador:** `atob`, `Blob`, `URL.createObjectURL`, `FileReader`, `document`.

## Módulos relacionados

| Consumidor | O que usa |
| --- | --- |
| `componentes/Rotulo`, `Card`, `Divider`, `PanelSeplag`, `Mensagem` | `Grid.classesCssSeplag` |
| `componentes/Fields/DateField`, `FieldsetDateField` | `stringToDateSeplag`, `formatDateToStringSeplag`, `isDateBeforeSeplag` |
| `componentes/Fields/CNPJField` | `validacaoCNPJSeplag` |
| `hooks/mensagemErro` | `getErrorMessageInObjectSeplag` |

## Fluxos importantes

**Ciclo de vida de uma data em formulário:**

```
API ("yyyy-MM-dd")
   → stringToDateSeplag → Date → <Calendar value>
   → onChange(Date) → formatDateToStringSeplag → "dd/MM/yyyy" → field.onChange
   → estado do formulário guarda SEMPRE string "dd/MM/yyyy"
```

Consequência: os campos de data da biblioteca trabalham com **string**, não com `Date`.
Um `rules.validate` customizado recebe string.

## Arquivos críticos

- [`Grid.ts`](./Grid.ts) — a prop `cols` de metade dos componentes depende dele.
- [`manipulaData.ts`](./manipulaData.ts) — define o formato de data de toda a biblioteca.

## Observações técnicas e débitos identificados

| Item | Detalhe |
| --- | --- |
| **Órfão** | [`RouteMixins.ts`](./RouteMixins.ts) não é importado por nenhum módulo nem exportado no barrel. Define `Route(nameRef, label, url, component, permissionKeys)` e o tipo `RouteMixingResp`, usando `any` para `component`. Empacotado em `dist/` por causa de `preserveModules`. |
| **Duplicação** | `toBase64Seplag` tem uma cópia idêntica em `componentes/ReactCrop/utils.ts` (também órfã). `base64ParaBlobSeplag` tem uma variante em `componentes/Base64FileModal/index.tsx` (`base64ToBlob`, que adicionalmente remove espaços em branco). |
| **API ambígua** | Dois `formatCPF` com semântica diferente exportados sob nomes parecidos (ver alerta acima). |
| **Fora do barrel** | `classesCssSeplag` e `getErrorMessageInObjectSeplag` não são públicos, apesar de úteis ao consumidor. |
| **`any`** | `getErrorMessageInObjectSeplag` usa `let current: any` na travessia. |
| **Sem testes** | Nenhum arquivo de `uteis/` tem teste, incluindo `validarCNPJSeplag` (algoritmo de DV — candidato natural a teste de unidade). |

## Documentos relacionados

- [Arquitetura da biblioteca](../../docs/arquitetura-da-biblioteca-de-componentes.md)
- [Objetivo da biblioteca](../../docs/objetivo-da-biblioteca-de-componentes.md)
