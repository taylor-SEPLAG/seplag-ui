import { useMemo, useState } from "react";
import {
  FiClipboard,
  FiCopy,
  FiDownload,
  FiFileText,
  FiRefreshCw,
  FiZap,
} from "react-icons/fi";
import usTemplateUrl from "../assets/templates/us-template-rpps.docx?url";
import "./usGenerator.css";

type ListKey =
  | "atores"
  | "componentes"
  | "regras"
  | "validacoes"
  | "fluxoPrincipal"
  | "fluxosAlternativos"
  | "criteriosAceite"
  | "observacoes";

type UsDraft = {
  codigo: string;
  nome: string;
  modulo: string;
  prototipoReferencia: string;
  objetivo: string;
  contexto: string;
  comportamento: string;
  atores: string;
  componentes: string;
  regras: string;
  validacoes: string;
  fluxoPrincipal: string;
  fluxosAlternativos: string;
  criteriosAceite: string;
  observacoes: string;
};

type UsPayload = Omit<UsDraft, ListKey> & Record<ListKey, string[]>;

const initialDraft: UsDraft = {
  codigo: "USXXX",
  nome: "",
  modulo: "",
  prototipoReferencia: "",
  objetivo: "",
  contexto: "",
  comportamento: "",
  atores: "Usuario interno\nAdministrador do sistema",
  componentes: "",
  regras: "",
  validacoes: "",
  fluxoPrincipal: "",
  fluxosAlternativos: "",
  criteriosAceite: "",
  observacoes: "",
};

const listKeys: ListKey[] = [
  "atores",
  "componentes",
  "regras",
  "validacoes",
  "fluxoPrincipal",
  "fluxosAlternativos",
  "criteriosAceite",
  "observacoes",
];

const labels: Record<keyof UsDraft, string> = {
  codigo: "Codigo",
  nome: "Nome da US",
  modulo: "Modulo",
  prototipoReferencia: "Prototipo de referencia",
  objetivo: "Objetivo",
  contexto: "Contexto",
  comportamento: "Comportamento esperado",
  atores: "Atores",
  componentes: "Campos e componentes",
  regras: "Regras de negocio",
  validacoes: "Validacoes",
  fluxoPrincipal: "Fluxo principal",
  fluxosAlternativos: "Fluxos alternativos",
  criteriosAceite: "Criterios de aceite",
  observacoes: "Observacoes tecnicas/funcionais",
};

const placeholders: Partial<Record<keyof UsDraft, string>> = {
  nome: "Ex.: Manter parametros de folha RPPS",
  modulo: "Ex.: Folha de Pagamento",
  prototipoReferencia: "Ex.: /prototipos/folha/tabelas-referencia ou print/tela/modal analisado",
  objetivo: "Descreva o resultado que o usuario precisa alcancar.",
  contexto: "Explique onde a funcionalidade aparece e por que ela existe.",
  comportamento: "Descreva estados, acoes, respostas do sistema e dependencias visiveis.",
  componentes: "Um item por linha. Ex.: Competencia | mes/ano | obrigatorio | usado para filtrar registros.",
  regras: "Uma regra por linha. Ex.: Nao permitir duplicidade para a mesma competencia e regime.",
  validacoes: "Uma validacao por linha. Ex.: Data fim nao pode ser anterior a data inicio.",
  fluxoPrincipal: "Um passo por linha, na ordem esperada.",
  fluxosAlternativos: "Um fluxo por linha. Ex.: Quando nao houver resultados, exibir estado vazio.",
  criteriosAceite: "Um criterio por linha, preferencialmente no formato Dado/Quando/Entao.",
  observacoes: "Integrações, permissoes, rastreabilidade, auditoria ou pendencias.",
};

const splitLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const normalizePayload = (draft: UsDraft): UsPayload => {
  const payload = { ...draft } as UsPayload;
  listKeys.forEach((key) => {
    payload[key] = splitLines(draft[key]);
  });
  return payload;
};

const numbered = (items: string[], fallback: string) =>
  items.length
    ? items.map((item, index) => `${index + 1}. ${item}`).join("\n")
    : fallback;

const bulleted = (items: string[], fallback: string, prefix = "-") =>
  items.length
    ? items.map((item) => `${prefix} ${item}`).join("\n")
    : fallback;

const coded = (items: string[], prefix: string, fallback: string) =>
  items.length
    ? items
        .map((item, index) => `- ${prefix}${String(index + 1).padStart(2, "0")}: ${item}`)
        .join("\n")
    : fallback;

const buildMarkdown = (payload: UsPayload) => `# Especificacao para Geracao de US

## Identificacao
- Codigo: ${payload.codigo || "USXXX"}
- Nome: ${payload.nome || "[Informar nome da US]"}
- Modulo: ${payload.modulo || "[Informar modulo]"}
- Prototipo de Referencia: ${payload.prototipoReferencia || "[Informar tela, link, print ou componente]"}

## Objetivo
${payload.objetivo || "[Descrever o objetivo funcional da US]"}

## Contexto
${payload.contexto || "[Descrever o contexto de uso da funcionalidade]"}

## Atores
${bulleted(payload.atores, "- [Informar atores envolvidos]")}

## Comportamento Esperado
${payload.comportamento || "[Descrever o comportamento esperado do sistema]"}

## Campos e Componentes
${bulleted(payload.componentes, "- [Informar campos, componentes, obrigatoriedade e regras locais]")}

## Regras de Negocio
${coded(payload.regras, "RN", "- RN01: [Informar regra de negocio]")}

## Validacoes
${coded(payload.validacoes, "V", "- V01: [Informar validacao]")}

## Fluxo Principal
${numbered(payload.fluxoPrincipal, "1. [Informar primeiro passo do fluxo principal]")}

## Fluxos Alternativos
${coded(payload.fluxosAlternativos, "FA", "- FA01: [Informar fluxo alternativo ou excecao]")}

## Criterios de Aceite
${coded(payload.criteriosAceite, "CA", "- CA01: [Informar criterio de aceite]")}

## Observacoes Tecnicas/Funcionais
${bulleted(payload.observacoes, "- [Informar observacoes relevantes]")}
`;

const slug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

const downloadTextFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const paragraph = (text: string, style?: "title" | "heading" | "body") => {
  const size = style === "title" ? "32" : style === "heading" ? "24" : "21";
  const bold = style === "title" || style === "heading" ? "<w:b/>" : "";
  const spacing = style === "heading" ? '<w:spacing w:before="260" w:after="100"/>' : '<w:spacing w:after="90"/>';
  return `<w:p><w:pPr>${spacing}</w:pPr><w:r><w:rPr>${bold}<w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
};

const bulletParagraph = (text: string) =>
  `<w:p><w:pPr><w:spacing w:after="70"/><w:ind w:left="360" w:hanging="180"/></w:pPr><w:r><w:rPr><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr><w:t xml:space="preserve">- ${escapeXml(text)}</w:t></w:r></w:p>`;

const metadataTable = (payload: UsPayload) => {
  const rows = [
    ["Codigo", payload.codigo || "USXXX", "Modulo", payload.modulo || ""],
    ["Nome da US", payload.nome || "", "Prototipo", payload.prototipoReferencia || ""],
  ];
  return `<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="6" w:color="B7C6D6"/><w:left w:val="single" w:sz="6" w:color="B7C6D6"/><w:bottom w:val="single" w:sz="6" w:color="B7C6D6"/><w:right w:val="single" w:sz="6" w:color="B7C6D6"/><w:insideH w:val="single" w:sz="6" w:color="DCE5EE"/><w:insideV w:val="single" w:sz="6" w:color="DCE5EE"/></w:tblBorders></w:tblPr>${rows
    .map(
      (row) =>
        `<w:tr>${row
          .map(
            (cell, index) =>
              `<w:tc><w:tcPr><w:tcW w:w="${index % 2 === 0 ? 1700 : 2980}" w:type="dxa"/><w:shd w:fill="${index % 2 === 0 ? "EEF3F8" : "FFFFFF"}"/></w:tcPr>${paragraph(cell)}</w:tc>`,
          )
          .join("")}</w:tr>`,
    )
    .join("")}</w:tbl>`;
};

const section = (title: string, content: string | string[], empty: string) => {
  const items = Array.isArray(content) ? content : splitLines(content);
  return [
    paragraph(title, "heading"),
    items.length ? items.map((item) => bulletParagraph(item)).join("") : paragraph(empty),
  ].join("");
};

const simpleTable = (headers: string[], rows: string[][]) =>
  `<w:tbl><w:tblPr><w:tblW w:w="14570" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="6" w:color="B7C6D6"/><w:left w:val="single" w:sz="6" w:color="B7C6D6"/><w:bottom w:val="single" w:sz="6" w:color="B7C6D6"/><w:right w:val="single" w:sz="6" w:color="B7C6D6"/><w:insideH w:val="single" w:sz="6" w:color="DCE5EE"/><w:insideV w:val="single" w:sz="6" w:color="DCE5EE"/></w:tblBorders></w:tblPr><w:tr>${headers
    .map(
      (header) =>
        `<w:tc><w:tcPr><w:shd w:fill="E8F2FB"/></w:tcPr>${paragraph(header, "heading")}</w:tc>`,
    )
    .join("")}</w:tr>${rows
    .map(
      (row) =>
        `<w:tr>${row
          .map((cell) => `<w:tc><w:tcPr><w:shd w:fill="FFFFFF"/></w:tcPr>${paragraph(cell)}</w:tc>`)
          .join("")}</w:tr>`,
    )
    .join("")}</w:tbl>`;

const extractSectionProperties = (templateDocumentXml: string) => {
  const matches = templateDocumentXml.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/g) ?? [];
  return {
    portrait:
      matches[0] ??
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1247" w:right="1134" w:bottom="1134" w:left="1701" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>',
    landscape:
      matches[matches.length - 1] ??
      '<w:sectPr><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/><w:pgMar w:top="1701" w:right="1247" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>',
  };
};

const buildDocumentXml = (payload: UsPayload, templateDocumentXml: string) => {
  const sections = extractSectionProperties(templateDocumentXml);
  const rules = payload.regras.length
    ? payload.regras.map((item, index) => [`RN${String(index + 1).padStart(2, "0")}`, item])
    : [["RN01", "[Informar regra de negocio]"]];
  const validations = payload.validacoes.length
    ? payload.validacoes.map((item, index) => [`V${String(index + 1).padStart(2, "0")}`, item])
    : [["V01", "[Informar validacao]"]];
  const acceptance = payload.criteriosAceite.length
    ? payload.criteriosAceite.map((item, index) => [`CA${String(index + 1).padStart(2, "0")}`, item])
    : [["CA01", "[Informar criterio de aceite]"]];
  const components = payload.componentes.length
    ? payload.componentes.map((item, index) => [String(index + 1), item])
    : [["1", "[Informar campos, componentes, obrigatoriedade e regra local]"]];

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${paragraph(`${payload.codigo || "USXXX"} - ${payload.nome || "User Story"}`, "title")}
    ${metadataTable(payload)}
    ${section("Objetivo", payload.objetivo, "[Descrever o objetivo funcional da US]")}
    ${section("Contexto", payload.contexto, "[Descrever o contexto de uso da funcionalidade]")}
    ${section("Atores", payload.atores, "[Informar atores envolvidos]")}
    ${section("Comportamento Esperado", payload.comportamento, "[Descrever o comportamento esperado do sistema]")}
    ${section("Fluxo Principal", payload.fluxoPrincipal.map((item, index) => `${index + 1}. ${item}`), "[Informar fluxo principal]")}
    ${section("Fluxos Alternativos", payload.fluxosAlternativos.map((item, index) => `FA${String(index + 1).padStart(2, "0")}: ${item}`), "[Informar fluxos alternativos]")}
    <w:p><w:pPr>${sections.portrait}</w:pPr></w:p>
    ${paragraph("Campos e Componentes", "heading")}
    ${simpleTable(["Item", "Descricao"], components)}
    ${paragraph("Regras de Negocio", "heading")}
    ${simpleTable(["Codigo", "Regra"], rules)}
    ${paragraph("Validacoes", "heading")}
    ${simpleTable(["Codigo", "Validacao"], validations)}
    ${paragraph("Criterios de Aceite", "heading")}
    ${simpleTable(["Codigo", "Criterio"], acceptance)}
    ${section("Observacoes Tecnicas/Funcionais", payload.observacoes, "[Informar observacoes relevantes]")}
    ${sections.landscape}
  </w:body>
</w:document>`;
};

type ZipFileMap = Record<string, Uint8Array | string>;

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let c = index;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

const crc32 = (data: Uint8Array) => {
  let crc = 0xffffffff;
  data.forEach((byte) => {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  });
  return (crc ^ 0xffffffff) >>> 0;
};

const pushUint16 = (target: number[], value: number) => {
  target.push(value & 0xff, (value >>> 8) & 0xff);
};

const pushUint32 = (target: number[], value: number) => {
  target.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
};

const readUint16 = (data: Uint8Array, offset: number) => data[offset] | (data[offset + 1] << 8);

const readUint32 = (data: Uint8Array, offset: number) =>
  (data[offset] |
    (data[offset + 1] << 8) |
    (data[offset + 2] << 16) |
    (data[offset + 3] << 24)) >>>
  0;

const decodeText = (data: Uint8Array) => new TextDecoder().decode(data);

const inflateRaw = async (data: Uint8Array) => {
  if (!("DecompressionStream" in window)) {
    throw new Error("O navegador atual nao suporta descompactacao DOCX no cliente.");
  }
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
};

const unzip = async (zipBytes: Uint8Array): Promise<Record<string, Uint8Array>> => {
  let endOffset = -1;
  for (let index = zipBytes.length - 22; index >= 0; index -= 1) {
    if (readUint32(zipBytes, index) === 0x06054b50) {
      endOffset = index;
      break;
    }
  }
  if (endOffset < 0) {
    throw new Error("Template DOCX invalido: diretorio central nao encontrado.");
  }

  const entriesCount = readUint16(zipBytes, endOffset + 10);
  let centralOffset = readUint32(zipBytes, endOffset + 16);
  const files: Record<string, Uint8Array> = {};
  const decoder = new TextDecoder();

  for (let index = 0; index < entriesCount; index += 1) {
    if (readUint32(zipBytes, centralOffset) !== 0x02014b50) {
      throw new Error("Template DOCX invalido: entrada central corrompida.");
    }

    const method = readUint16(zipBytes, centralOffset + 10);
    const compressedSize = readUint32(zipBytes, centralOffset + 20);
    const nameLength = readUint16(zipBytes, centralOffset + 28);
    const extraLength = readUint16(zipBytes, centralOffset + 30);
    const commentLength = readUint16(zipBytes, centralOffset + 32);
    const localOffset = readUint32(zipBytes, centralOffset + 42);
    const name = decoder.decode(zipBytes.slice(centralOffset + 46, centralOffset + 46 + nameLength));

    const localNameLength = readUint16(zipBytes, localOffset + 26);
    const localExtraLength = readUint16(zipBytes, localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = zipBytes.slice(dataStart, dataStart + compressedSize);

    if (!name.endsWith("/")) {
      files[name] = method === 0 ? compressed : await inflateRaw(compressed);
    }

    centralOffset += 46 + nameLength + extraLength + commentLength;
  }

  return files;
};

const createZip = (files: ZipFileMap) => {
  const encoder = new TextEncoder();
  const output: number[] = [];
  const central: number[] = [];

  Object.entries(files).forEach(([name, content]) => {
    const nameBytes = encoder.encode(name);
    const data = content instanceof Uint8Array ? content : encoder.encode(content);
    const crc = crc32(data);
    const offset = output.length;

    pushUint32(output, 0x04034b50);
    pushUint16(output, 20);
    pushUint16(output, 0);
    pushUint16(output, 0);
    pushUint16(output, 0);
    pushUint16(output, 0);
    pushUint32(output, crc);
    pushUint32(output, data.length);
    pushUint32(output, data.length);
    pushUint16(output, nameBytes.length);
    pushUint16(output, 0);
    output.push(...nameBytes, ...data);

    pushUint32(central, 0x02014b50);
    pushUint16(central, 20);
    pushUint16(central, 20);
    pushUint16(central, 0);
    pushUint16(central, 0);
    pushUint16(central, 0);
    pushUint16(central, 0);
    pushUint32(central, crc);
    pushUint32(central, data.length);
    pushUint32(central, data.length);
    pushUint16(central, nameBytes.length);
    pushUint16(central, 0);
    pushUint16(central, 0);
    pushUint16(central, 0);
    pushUint16(central, 0);
    pushUint32(central, 0);
    pushUint32(central, offset);
    central.push(...nameBytes);
  });

  const centralOffset = output.length;
  output.push(...central);
  pushUint32(output, 0x06054b50);
  pushUint16(output, 0);
  pushUint16(output, 0);
  pushUint16(output, Object.keys(files).length);
  pushUint16(output, Object.keys(files).length);
  pushUint32(output, central.length);
  pushUint32(output, centralOffset);
  pushUint16(output, 0);

  return new Uint8Array(output);
};

const buildDocxFromTemplate = async (payload: UsPayload) => {
  const response = await fetch(usTemplateUrl);
  if (!response.ok) {
    throw new Error("Template de US nao encontrado no pacote da aplicacao.");
  }

  const templateBytes = new Uint8Array(await response.arrayBuffer());
  const files = await unzip(templateBytes);
  const templateDocument = files["word/document.xml"];
  if (!templateDocument) {
    throw new Error("Template de US invalido: word/document.xml ausente.");
  }

  files["word/document.xml"] = new TextEncoder().encode(
    buildDocumentXml(payload, decodeText(templateDocument)),
  );
  return createZip(files);
};

const downloadDocx = async (payload: UsPayload, filename: string) => {
  const bytes = await buildDocxFromTemplate(payload);
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const parseSourceText = (source: string, current: UsDraft): UsDraft => {
  const lines = splitLines(source);
  const sections: Partial<Record<keyof UsDraft, string[]>> = {};
  let active: keyof UsDraft | null = null;
  const aliases: Record<string, keyof UsDraft> = {
    codigo: "codigo",
    "nome da us": "nome",
    nome: "nome",
    modulo: "modulo",
    "prototipo de referencia": "prototipoReferencia",
    prototipo: "prototipoReferencia",
    objetivo: "objetivo",
    contexto: "contexto",
    atores: "atores",
    "comportamento esperado": "comportamento",
    comportamento: "comportamento",
    "campos e componentes": "componentes",
    componentes: "componentes",
    "regras de negocio": "regras",
    regras: "regras",
    validacoes: "validacoes",
    "fluxo principal": "fluxoPrincipal",
    "fluxos alternativos": "fluxosAlternativos",
    "criterios de aceite": "criteriosAceite",
    observacoes: "observacoes",
  };

  lines.forEach((line) => {
    const normalized = line
      .replace(/^#+\s*/, "")
      .replace(/:$/, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    const colonMatch = line.match(/^([^:]{3,40}):\s*(.+)$/);
    const nextSection = aliases[normalized];
    const inlineSection = colonMatch
      ? aliases[
          colonMatch[1]
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
        ]
      : undefined;

    if (nextSection) {
      active = nextSection;
      return;
    }

    if (inlineSection && colonMatch) {
      sections[inlineSection] = [...(sections[inlineSection] ?? []), colonMatch[2].trim()];
      active = inlineSection;
      return;
    }

    if (active) {
      sections[active] = [...(sections[active] ?? []), line.replace(/^[-*]\s*/, "")];
    }
  });

  const inferredName = sections.nome?.join(" ") || lines[0] || current.nome;
  const fallbackText = source.trim();
  return {
    ...current,
    codigo: sections.codigo?.join(" ") || current.codigo,
    nome: inferredName,
    modulo: sections.modulo?.join(" ") || current.modulo,
    prototipoReferencia: sections.prototipoReferencia?.join(" ") || current.prototipoReferencia,
    objetivo: sections.objetivo?.join("\n") || current.objetivo || fallbackText,
    contexto: sections.contexto?.join("\n") || current.contexto,
    comportamento: sections.comportamento?.join("\n") || current.comportamento || fallbackText,
    atores: sections.atores?.join("\n") || current.atores,
    componentes: sections.componentes?.join("\n") || current.componentes,
    regras: sections.regras?.join("\n") || current.regras,
    validacoes: sections.validacoes?.join("\n") || current.validacoes,
    fluxoPrincipal: sections.fluxoPrincipal?.join("\n") || current.fluxoPrincipal,
    fluxosAlternativos: sections.fluxosAlternativos?.join("\n") || current.fluxosAlternativos,
    criteriosAceite: sections.criteriosAceite?.join("\n") || current.criteriosAceite,
    observacoes: sections.observacoes?.join("\n") || current.observacoes,
  };
};

export function UsGeneratorPage() {
  const [draft, setDraft] = useState<UsDraft>(initialDraft);
  const [sourceText, setSourceText] = useState("");
  const [copied, setCopied] = useState<"markdown" | "json" | null>(null);
  const [docxStatus, setDocxStatus] = useState<"idle" | "generating" | "error">("idle");
  const [docxError, setDocxError] = useState("");

  const payload = useMemo(() => normalizePayload(draft), [draft]);
  const markdown = useMemo(() => buildMarkdown(payload), [payload]);
  const json = useMemo(() => JSON.stringify(payload, null, 2), [payload]);
  const baseFilename = `${draft.codigo || "USXXX"}-${slug(draft.nome || "gerador-us")}`;

  const updateField = (field: keyof UsDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setCopied(null);
  };

  const copy = async (value: string, kind: "markdown" | "json") => {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
  };

  const applySourceText = () => {
    setDraft((current) => parseSourceText(sourceText, current));
    setCopied(null);
  };

  const generateDocx = async () => {
    setDocxStatus("generating");
    setDocxError("");
    try {
      await downloadDocx(payload, `${baseFilename}.docx`);
      setDocxStatus("idle");
    } catch (error) {
      setDocxStatus("error");
      setDocxError(error instanceof Error ? error.message : "Nao foi possivel gerar o DOCX.");
    }
  };

  return (
    <main className="us-generator-page">
      <header className="us-generator-header">
        <div>
          <span>Ferramenta interna</span>
          <h1>Gerador de especificacao de US</h1>
          <p>
            Preencha a parte analisada do prototipo e gere a entrada padronizada
            para montar a US no modelo institucional.
          </p>
        </div>
        <button type="button" onClick={() => setDraft(initialDraft)}>
          <FiRefreshCw aria-hidden="true" />
          Limpar
        </button>
      </header>

      <section className="us-generator-layout">
        <form className="us-generator-form">
          <div className="us-generator-source">
            <label>
              <span>Texto de entrada</span>
              <textarea
                rows={8}
                value={sourceText}
                placeholder="Cole aqui a descricao da tela, fluxo ou componente do prototipo. Se usar titulos como Objetivo:, Regras de negocio: e Criterios de aceite:, o gerador distribui automaticamente nos campos abaixo."
                onChange={(event) => setSourceText(event.target.value)}
              />
            </label>
            <button type="button" onClick={applySourceText} disabled={!sourceText.trim()}>
              <FiZap aria-hidden="true" />
              Interpretar texto
            </button>
          </div>

          <div className="us-generator-grid">
            <Field
              label={labels.codigo}
              value={draft.codigo}
              onChange={(value) => updateField("codigo", value)}
            />
            <Field
              label={labels.modulo}
              value={draft.modulo}
              onChange={(value) => updateField("modulo", value)}
              placeholder={placeholders.modulo}
            />
            <Field
              className="is-wide"
              label={labels.nome}
              value={draft.nome}
              onChange={(value) => updateField("nome", value)}
              placeholder={placeholders.nome}
            />
            <Field
              className="is-full"
              label={labels.prototipoReferencia}
              value={draft.prototipoReferencia}
              onChange={(value) => updateField("prototipoReferencia", value)}
              placeholder={placeholders.prototipoReferencia}
            />
            <Area
              label={labels.objetivo}
              value={draft.objetivo}
              onChange={(value) => updateField("objetivo", value)}
              placeholder={placeholders.objetivo}
            />
            <Area
              label={labels.contexto}
              value={draft.contexto}
              onChange={(value) => updateField("contexto", value)}
              placeholder={placeholders.contexto}
            />
            <Area
              className="is-full"
              label={labels.comportamento}
              value={draft.comportamento}
              onChange={(value) => updateField("comportamento", value)}
              placeholder={placeholders.comportamento}
            />
            {listKeys.map((key) => (
              <Area
                key={key}
                className={
                  key === "componentes" ||
                  key === "fluxoPrincipal" ||
                  key === "criteriosAceite"
                    ? "is-full"
                    : undefined
                }
                label={labels[key]}
                value={draft[key]}
                onChange={(value) => updateField(key, value)}
                placeholder={placeholders[key]}
              />
            ))}
          </div>
        </form>

        <aside className="us-generator-output">
          <div className="us-generator-output-header">
            <div>
              <span>Saida do gerador</span>
              <h2>Texto fonte</h2>
            </div>
            <div>
              <button type="button" onClick={() => copy(markdown, "markdown")}>
                <FiCopy aria-hidden="true" />
                {copied === "markdown" ? "Copiado" : "Copiar"}
              </button>
              <button
                type="button"
                onClick={generateDocx}
                disabled={docxStatus === "generating"}
              >
                <FiDownload aria-hidden="true" />
                {docxStatus === "generating" ? "Gerando" : "DOCX"}
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadTextFile(markdown, `${baseFilename}.md`, "text/markdown;charset=utf-8")
                }
              >
                <FiDownload aria-hidden="true" />
                MD
              </button>
            </div>
          </div>
          {docxError && <p className="us-generator-error">{docxError}</p>}
          <textarea value={markdown} readOnly />

          <div className="us-generator-output-actions">
            <button type="button" onClick={() => copy(json, "json")}>
              <FiClipboard aria-hidden="true" />
              {copied === "json" ? "JSON copiado" : "Copiar JSON"}
            </button>
            <button
              type="button"
              onClick={() =>
                downloadTextFile(json, `${baseFilename}.json`, "application/json;charset=utf-8")
              }
            >
              <FiFileText aria-hidden="true" />
              Baixar JSON
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={className}>
      <span>{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={className}>
      <span>{label}</span>
      <textarea
        rows={5}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
