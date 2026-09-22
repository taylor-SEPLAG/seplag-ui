import "primereact/resources/themes/saga-blue/theme.css";
import { DocPage, type DocProp, type DocSection } from "../../components/DocPage";

// ---------------------------------------------------------------------------
// Seções
// ---------------------------------------------------------------------------

const sections: DocSection[] = [
  // ── Datas ────────────────────────────────────────────────────────────────
  {
    title: "stringToDateSeplag",
    description:
      "Converte uma string nos formatos 'dd/MM/yyyy' ou 'yyyy-MM-dd' para um objeto Date. Retorna null para entradas inválidas.",
    example: null as any,
    code: `import { stringToDateSeplag } from "@seplag/ui-lib-react-18";

stringToDateSeplag("25/12/2024");    // Date(2024-12-25)
stringToDateSeplag("2024-12-25");    // Date(2024-12-25)
stringToDateSeplag(null);            // null
stringToDateSeplag("31/02/2024");    // null  (data inválida)`,
  },
  {
    title: "formatDateToStringSeplag",
    description:
      "Formata um objeto Date para string no formato 'dd/MM/yyyy'. Retorna null se a data for nula ou inválida.",
    example: null as any,
    code: `import { formatDateToStringSeplag } from "@seplag/ui-lib-react-18";

formatDateToStringSeplag(new Date(2024, 11, 25));  // "25/12/2024"
formatDateToStringSeplag(null);                    // null`,
  },
  {
    title: "formatAnyDateSeplag",
    description:
      "Recebe múltiplas datas opcionais (string ISO ou null) e retorna a primeira válida formatada como 'dd/MM/yyyy'. Útil para fallbacks. Retorna '-' se nenhuma for válida.",
    example: null as any,
    code: `import { formatAnyDateSeplag } from "@seplag/ui-lib-react-18";

formatAnyDateSeplag(null, undefined, "2024-12-25");  // "25/12/2024"
formatAnyDateSeplag(null, null);                     // "-"
formatAnyDateSeplag("2024-01-10");                   // "10/01/2024"`,
  },
  {
    title: "formatDateFieldSeplag",
    description:
      "Tenta formatar um valor string ('dd/MM/yyyy' ou 'yyyy-MM-dd') ou Date em 'dd/MM/yyyy'. Retorna undefined para valores falsy ou inválidos.",
    example: null as any,
    code: `import { formatDateFieldSeplag } from "@seplag/ui-lib-react-18";

formatDateFieldSeplag("2024-12-25");          // "25/12/2024"
formatDateFieldSeplag(new Date(2024, 0, 10)); // "10/01/2024"
formatDateFieldSeplag(null);                  // undefined`,
  },
  {
    title: "isDateBeforeSeplag",
    description:
      "Retorna true se a primeira data for anterior à segunda, ignorando horas. Aceita string ('dd/MM/yyyy' ou 'yyyy-MM-dd') ou Date.",
    example: null as any,
    code: `import { isDateBeforeSeplag } from "@seplag/ui-lib-react-18";

isDateBeforeSeplag("01/01/2024", "31/12/2024");  // true
isDateBeforeSeplag("2024-12-31", "2024-01-01");  // false`,
  },
  {
    title: "isDateAfterSeplag",
    description: "Retorna true se a primeira data for posterior à segunda, ignorando horas.",
    example: null as any,
    code: `import { isDateAfterSeplag } from "@seplag/ui-lib-react-18";

isDateAfterSeplag("31/12/2024", "01/01/2024");  // true
isDateAfterSeplag("01/01/2024", "31/12/2024");  // false`,
  },
  // ── CPF / CNPJ ───────────────────────────────────────────────────────────
  {
    title: "formatCPFSeplag",
    description: "Formata uma string de 11 dígitos (ou já mascarada) no padrão 999.999.999-99.",
    example: null as any,
    code: `import { formatCPFSeplag } from "@seplag/ui-lib-react-18";

formatCPFSeplag("12345678901");    // "123.456.789-01"
formatCPFSeplag("");               // ""`,
  },
  {
    title: "formatCNPJSeplag",
    description:
      "Formata uma string de 14 dígitos numéricos no padrão 99.999.999/9999-99. Para CNPJ alfanumérico, use diretamente a máscara do CNPJField.",
    example: null as any,
    code: `import { formatCNPJSeplag } from "@seplag/ui-lib-react-18";

formatCNPJSeplag("12345678000199");  // "12.345.678/0001-99"`,
  },
  {
    title: "formatarParaCNPJComPaddingSeplag",
    description:
      "Formata um CNPJ numérico preenchendo zeros à esquerda para completar 14 dígitos. Retorna mensagem de erro se houver mais de 14 dígitos.",
    example: null as any,
    code: `import { formatarParaCNPJComPaddingSeplag } from "@seplag/ui-lib-react-18";

formatarParaCNPJComPaddingSeplag("345678000199");      // "00.345.678/0001-99"
formatarParaCNPJComPaddingSeplag("12345678000199");    // "12.345.678/0001-99"
formatarParaCNPJComPaddingSeplag("123456780001991");   // "CNPJ inválido (mais de 14 dígitos)"`,
  },
  {
    title: "unmaskedSeplag",
    description:
      "Remove todos os caracteres não numéricos. Útil para CPF ou CNPJ numérico. Para CNPJ alfanumérico use unmaskedCNPJSeplag.",
    example: null as any,
    code: `import { unmaskedSeplag } from "@seplag/ui-lib-react-18";

unmaskedSeplag("123.456.789-01");     // "12345678901"
unmaskedSeplag("12.345.678/0001-99"); // "12345678000199"`,
  },
  {
    title: "unmaskedCNPJSeplag",
    description:
      "Remove apenas os separadores de formatação do CNPJ (pontos, barra e hífen), preservando letras. Use para preparar CNPJs alfanuméricos antes de validar ou enviar ao backend.",
    example: null as any,
    code: `import { unmaskedCNPJSeplag } from "@seplag/ui-lib-react-18";

unmaskedCNPJSeplag("12.ABC.345/01DE-35"); // "12ABC34501DE35"
unmaskedCNPJSeplag("12.345.678/0001-99"); // "12345678000199"`,
  },
  {
    title: "validarCNPJSeplag",
    description:
      "Valida os dígitos verificadores de um CNPJ numérico ou alfanumérico (aceita com ou sem máscara), usando módulo 11 conforme especificação SERPRO. Retorna false para sequências uniformes.",
    example: null as any,
    code: `import { validarCNPJSeplag } from "@seplag/ui-lib-react-18";

// CNPJ numérico (formato antigo — retrocompatível)
validarCNPJSeplag("11.222.333/0001-81");  // true
validarCNPJSeplag("11222333000181");      // true
validarCNPJSeplag("00.000.000/0000-00");  // false (sequência uniforme)
validarCNPJSeplag("12345678000100");      // false (dígitos inválidos)

// CNPJ alfanumérico (novo formato)
validarCNPJSeplag("12.ABC.345/01DE-35");  // true
validarCNPJSeplag("12ABC34501DE35");      // true`,
  },
  // ── Validações RHF ───────────────────────────────────────────────────────
  {
    title: "validacaoCNPJSeplag",
    description:
      "Retorna uma função de validação pronta para react-hook-form. Aceita CNPJ com ou sem máscara. Campo vazio é considerado válido (use required separadamente).",
    example: null as any,
    code: `import { validacaoCNPJSeplag } from "@seplag/ui-lib-react-18";

// Uso no CNPJField ou qualquer campo RHF
<Controller
  name="cnpj"
  control={control}
  rules={{ validate: validacaoCNPJSeplag("CNPJ do responsável") }}
  render={...}
/>

// Retornos possíveis:
// → true              (válido ou vazio)
// → "CNPJ incompleto" (menos de 14 dígitos)
// → "CNPJ inválido"   (dígitos verificadores incorretos)`,
  },
  {
    title: "validacaoDataNaoFuturaSeplag",
    description:
      "Retorna uma função de validação para o prop customValidation do DateField. Rejeita datas posteriores a hoje.",
    example: null as any,
    code: `import { validacaoDataNaoFuturaSeplag } from "@seplag/ui-lib-react-18";

// Uso no DateField
<DateFieldSeplag
  name="nascimento"
  control={control}
  label="Data de Nascimento"
  customValidation={validacaoDataNaoFuturaSeplag()}
  getFormErrorMessage={(name) => errors[name]?.message}
/>

// Com mensagem customizada
customValidation={validacaoDataNaoFuturaSeplag("Data não pode ser futura")}`,
  },
  // ── Grid ────────────────────────────────────────────────────────────────
  {
    title: "classesCssSeplag (Grid)",
    description:
      "Converte a prop cols nos formatos usados pelo SEPLAG (ex: '12 6 4') nas classes CSS PrimeFlex correspondentes (col-12 md:col-6 lg:col-4).",
    example: null as any,
    code: `import classesCssSeplag from "@seplag/ui-lib-react-18/Grid";

classesCssSeplag("12");       // " col-12"
classesCssSeplag("12 6");     // " col-12 md:col-6"
classesCssSeplag("12 6 4");   // " col-12 md:col-6 lg:col-4"
classesCssSeplag("");         // ""

// Usado internamente pelo RotuloSeplag — raramente necessário diretamente`,
  },
];

// ---------------------------------------------------------------------------
// Props — aqui servem como tabela de referência de assinaturas
// ---------------------------------------------------------------------------
const props: DocProp[] = [
  // Datas
  {
    name: "stringToDateSeplag(dateString)",
    type: "(string | Date | null) → Date | null",
    required: false,
    description: "Converte string 'dd/MM/yyyy' ou 'yyyy-MM-dd' para Date.",
  },
  {
    name: "formatDateToStringSeplag(date)",
    type: "(Date | null | undefined) → string | null",
    required: false,
    description: "Formata Date para string 'dd/MM/yyyy'.",
  },
  {
    name: "formatAnyDateSeplag(...dates)",
    type: "(...(string | null | undefined)[]) → string",
    required: false,
    description: "Primeira data válida formatada. Retorna '-' se todas forem inválidas.",
  },
  {
    name: "formatDateFieldSeplag(value)",
    type: "(string | Date | null | undefined) → string | undefined",
    required: false,
    description: "Formata qualquer representação de data. Retorna undefined se inválida.",
  },
  {
    name: "isDateBeforeSeplag(date, dateToCompare)",
    type: "(string | Date, string | Date) → boolean",
    required: false,
    description: "Verdadeiro se date for anterior a dateToCompare (ignora horas).",
  },
  {
    name: "isDateAfterSeplag(date, dateToCompare)",
    type: "(string | Date, string | Date) → boolean",
    required: false,
    description: "Verdadeiro se date for posterior a dateToCompare (ignora horas).",
  },
  // CPF/CNPJ
  {
    name: "formatCPFSeplag(cpf)",
    type: "(string) → string",
    required: false,
    description: "Formata string de dígitos no padrão 999.999.999-99.",
  },
  {
    name: "formatCNPJSeplag(cnpj)",
    type: "(string) → string",
    required: false,
    description: "Formata string de dígitos no padrão 99.999.999/9999-99.",
  },
  {
    name: "formatarParaCNPJComPaddingSeplag(cnpjString)",
    type: "(string) → string",
    required: false,
    description: "Formata CNPJ com padding de zeros à esquerda.",
  },
  {
    name: "unmaskedSeplag(value)",
    type: "(string) → string",
    required: false,
    description:
      "Remove todos os caracteres não numéricos. Para CNPJ alfanumérico use unmaskedCNPJSeplag.",
  },
  {
    name: "unmaskedCNPJSeplag(cnpj)",
    type: "(string) → string",
    required: false,
    description:
      "Remove separadores (. / -) do CNPJ preservando letras. Use para CNPJs alfanuméricos.",
  },
  {
    name: "validarCNPJSeplag(cnpj)",
    type: "(string) → boolean",
    required: false,
    description:
      "Valida dígitos verificadores do CNPJ numérico ou alfanumérico (módulo 11 SERPRO).",
  },
  // Validações
  {
    name: "validacaoCNPJSeplag(label?)",
    type: "(string?) → (value) => string | true",
    required: false,
    description: "Fábrica de validação de CNPJ para react-hook-form.",
  },
  {
    name: "validacaoDataNaoFuturaSeplag(mensagem?)",
    type: "(string?) → (value) => string | boolean",
    required: false,
    description: "Fábrica de validação de data não futura para DateField.",
  },
  // Grid
  {
    name: "classesCssSeplag(colunas)",
    type: "(string) → string",
    required: false,
    description: "Converte cols '12 6 4' em classes PrimeFlex col-12 md:col-6 lg:col-4.",
  },
];

export default function UtilsDoc() {
  return (
    <DocPage
      title="Utilitários"
      description="Funções auxiliares do SEPLAG UI: manipulação de datas, formatação e validação de CPF/CNPJ, validações para react-hook-form e helpers de grid CSS."
      badge="Estável"
      since="v0.0.1"
      sections={sections}
      props={props}
    />
  );
}
