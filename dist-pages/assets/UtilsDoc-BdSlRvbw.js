import{t as e}from"./jsx-runtime--AOyvnT1.js";/* empty css              */import{t}from"./DocPage-DNS5xyAT.js";var n=e(),r=[{title:`stringToDateSeplag`,description:`Converte uma string nos formatos 'dd/MM/yyyy' ou 'yyyy-MM-dd' para um objeto Date. Retorna null para entradas inválidas.`,example:null,code:`import { stringToDateSeplag } from "@seplag/ui-lib-react-18";

stringToDateSeplag("25/12/2024");    // Date(2024-12-25)
stringToDateSeplag("2024-12-25");    // Date(2024-12-25)
stringToDateSeplag(null);            // null
stringToDateSeplag("31/02/2024");    // null  (data inválida)`},{title:`formatDateToStringSeplag`,description:`Formata um objeto Date para string no formato 'dd/MM/yyyy'. Retorna null se a data for nula ou inválida.`,example:null,code:`import { formatDateToStringSeplag } from "@seplag/ui-lib-react-18";

formatDateToStringSeplag(new Date(2024, 11, 25));  // "25/12/2024"
formatDateToStringSeplag(null);                    // null`},{title:`formatAnyDateSeplag`,description:`Recebe múltiplas datas opcionais (string ISO ou null) e retorna a primeira válida formatada como 'dd/MM/yyyy'. Útil para fallbacks. Retorna '-' se nenhuma for válida.`,example:null,code:`import { formatAnyDateSeplag } from "@seplag/ui-lib-react-18";

formatAnyDateSeplag(null, undefined, "2024-12-25");  // "25/12/2024"
formatAnyDateSeplag(null, null);                     // "-"
formatAnyDateSeplag("2024-01-10");                   // "10/01/2024"`},{title:`formatDateFieldSeplag`,description:`Tenta formatar um valor string ('dd/MM/yyyy' ou 'yyyy-MM-dd') ou Date em 'dd/MM/yyyy'. Retorna undefined para valores falsy ou inválidos.`,example:null,code:`import { formatDateFieldSeplag } from "@seplag/ui-lib-react-18";

formatDateFieldSeplag("2024-12-25");          // "25/12/2024"
formatDateFieldSeplag(new Date(2024, 0, 10)); // "10/01/2024"
formatDateFieldSeplag(null);                  // undefined`},{title:`isDateBeforeSeplag`,description:`Retorna true se a primeira data for anterior à segunda, ignorando horas. Aceita string ('dd/MM/yyyy' ou 'yyyy-MM-dd') ou Date.`,example:null,code:`import { isDateBeforeSeplag } from "@seplag/ui-lib-react-18";

isDateBeforeSeplag("01/01/2024", "31/12/2024");  // true
isDateBeforeSeplag("2024-12-31", "2024-01-01");  // false`},{title:`isDateAfterSeplag`,description:`Retorna true se a primeira data for posterior à segunda, ignorando horas.`,example:null,code:`import { isDateAfterSeplag } from "@seplag/ui-lib-react-18";

isDateAfterSeplag("31/12/2024", "01/01/2024");  // true
isDateAfterSeplag("01/01/2024", "31/12/2024");  // false`},{title:`formatCPFSeplag`,description:`Formata uma string de 11 dígitos (ou já mascarada) no padrão 999.999.999-99.`,example:null,code:`import { formatCPFSeplag } from "@seplag/ui-lib-react-18";

formatCPFSeplag("12345678901");    // "123.456.789-01"
formatCPFSeplag("");               // ""`},{title:`formatCNPJSeplag`,description:`Formata uma string de 14 dígitos no padrão 99.999.999/9999-99.`,example:null,code:`import { formatCNPJSeplag } from "@seplag/ui-lib-react-18";

formatCNPJSeplag("12345678000199");  // "12.345.678/0001-99"`},{title:`formatarParaCNPJComPaddingSeplag`,description:`Formata um CNPJ preenchendo zeros à esquerda para completar 14 dígitos. Retorna mensagem de erro se houver mais de 14 dígitos.`,example:null,code:`import { formatarParaCNPJComPaddingSeplag } from "@seplag/ui-lib-react-18";

formatarParaCNPJComPaddingSeplag("345678000199");      // "00.345.678/0001-99"
formatarParaCNPJComPaddingSeplag("12345678000199");    // "12.345.678/0001-99"
formatarParaCNPJComPaddingSeplag("123456780001991");   // "CNPJ inválido (mais de 14 dígitos)"`},{title:`unmaskedSeplag`,description:`Remove todos os caracteres não numéricos de uma string. Útil para enviar CPF/CNPJ ao backend.`,example:null,code:`import { unmaskedSeplag } from "@seplag/ui-lib-react-18";

unmaskedSeplag("123.456.789-01");     // "12345678901"
unmaskedSeplag("12.345.678/0001-99"); // "12345678000199"`},{title:`validarCNPJSeplag`,description:`Valida os dígitos verificadores de um CNPJ (aceita com ou sem máscara). Retorna false para sequências repetidas (ex: 00000000000000).`,example:null,code:`import { validarCNPJSeplag } from "@seplag/ui-lib-react-18";

validarCNPJSeplag("11.222.333/0001-81");  // true  (dígitos válidos)
validarCNPJSeplag("11222333000181");      // true
validarCNPJSeplag("00.000.000/0000-00"); // false  (sequência repetida)
validarCNPJSeplag("12345678000100");     // false  (dígitos inválidos)`},{title:`validacaoCNPJSeplag`,description:`Retorna uma função de validação pronta para react-hook-form. Aceita CNPJ com ou sem máscara. Campo vazio é considerado válido (use required separadamente).`,example:null,code:`import { validacaoCNPJSeplag } from "@seplag/ui-lib-react-18";

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
// → "CNPJ inválido"   (dígitos verificadores incorretos)`},{title:`validacaoDataNaoFuturaSeplag`,description:`Retorna uma função de validação para o prop customValidation do DateField. Rejeita datas posteriores a hoje.`,example:null,code:`import { validacaoDataNaoFuturaSeplag } from "@seplag/ui-lib-react-18";

// Uso no DateField
<DateFieldSeplag
  name="nascimento"
  control={control}
  label="Data de Nascimento"
  customValidation={validacaoDataNaoFuturaSeplag()}
  getFormErrorMessage={(name) => errors[name]?.message}
/>

// Com mensagem customizada
customValidation={validacaoDataNaoFuturaSeplag("Data não pode ser futura")}`},{title:`classesCssSeplag (Grid)`,description:`Converte a prop cols nos formatos usados pelo SEPLAG (ex: '12 6 4') nas classes CSS PrimeFlex correspondentes (col-12 md:col-6 lg:col-4).`,example:null,code:`import classesCssSeplag from "@seplag/ui-lib-react-18/Grid";

classesCssSeplag("12");       // " col-12"
classesCssSeplag("12 6");     // " col-12 md:col-6"
classesCssSeplag("12 6 4");   // " col-12 md:col-6 lg:col-4"
classesCssSeplag("");         // ""

// Usado internamente pelo RotuloSeplag — raramente necessário diretamente`}],i=[{name:`stringToDateSeplag(dateString)`,type:`(string | Date | null) → Date | null`,required:!1,description:`Converte string 'dd/MM/yyyy' ou 'yyyy-MM-dd' para Date.`},{name:`formatDateToStringSeplag(date)`,type:`(Date | null | undefined) → string | null`,required:!1,description:`Formata Date para string 'dd/MM/yyyy'.`},{name:`formatAnyDateSeplag(...dates)`,type:`(...(string | null | undefined)[]) → string`,required:!1,description:`Primeira data válida formatada. Retorna '-' se todas forem inválidas.`},{name:`formatDateFieldSeplag(value)`,type:`(string | Date | null | undefined) → string | undefined`,required:!1,description:`Formata qualquer representação de data. Retorna undefined se inválida.`},{name:`isDateBeforeSeplag(date, dateToCompare)`,type:`(string | Date, string | Date) → boolean`,required:!1,description:`Verdadeiro se date for anterior a dateToCompare (ignora horas).`},{name:`isDateAfterSeplag(date, dateToCompare)`,type:`(string | Date, string | Date) → boolean`,required:!1,description:`Verdadeiro se date for posterior a dateToCompare (ignora horas).`},{name:`formatCPFSeplag(cpf)`,type:`(string) → string`,required:!1,description:`Formata string de dígitos no padrão 999.999.999-99.`},{name:`formatCNPJSeplag(cnpj)`,type:`(string) → string`,required:!1,description:`Formata string de dígitos no padrão 99.999.999/9999-99.`},{name:`formatarParaCNPJComPaddingSeplag(cnpjString)`,type:`(string) → string`,required:!1,description:`Formata CNPJ com padding de zeros à esquerda.`},{name:`unmaskedSeplag(value)`,type:`(string) → string`,required:!1,description:`Remove todos os caracteres não numéricos.`},{name:`validarCNPJSeplag(cnpj)`,type:`(string) → boolean`,required:!1,description:`Valida dígitos verificadores do CNPJ.`},{name:`validacaoCNPJSeplag(label?)`,type:`(string?) → (value) => string | true`,required:!1,description:`Fábrica de validação de CNPJ para react-hook-form.`},{name:`validacaoDataNaoFuturaSeplag(mensagem?)`,type:`(string?) → (value) => string | boolean`,required:!1,description:`Fábrica de validação de data não futura para DateField.`},{name:`classesCssSeplag(colunas)`,type:`(string) → string`,required:!1,description:`Converte cols '12 6 4' em classes PrimeFlex col-12 md:col-6 lg:col-4.`}];function a(){return(0,n.jsx)(t,{title:`Utilitários`,description:`Funções auxiliares do SEPLAG UI: manipulação de datas, formatação e validação de CPF/CNPJ, validações para react-hook-form e helpers de grid CSS.`,badge:`Estável`,since:`v0.0.1`,sections:r,props:i})}export{a as default};