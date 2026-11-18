import { nomesUnicos, normalizar } from "./modelo.ts";
import { ajustarEscopoProjeto } from "./ajustesEscopo.ts";
import type { DadosProjeto, HistoriaProjeto, SprintProjeto } from "./types";

export function textoCelula(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  if (typeof valor !== "object") return String(valor).trim();
  const objeto = valor as Record<string, unknown>;
  if (Array.isArray(objeto.richText))
    return objeto.richText
      .map((v) => String((v as Record<string, unknown>).text ?? ""))
      .join("")
      .trim();
  if (objeto.text !== undefined) return textoCelula(objeto.text);
  if (objeto.result !== undefined) return textoCelula(objeto.result);
  return "";
}
const opcional = (valor: string) =>
  !valor || /^(n\/?a|nao informado|-|a definir)$/i.test(normalizar(valor))
    ? null
    : valor;
export function separarPessoas(valor: string): string[] {
  if (!opcional(valor)) return [];
  return nomesUnicos(
    valor
      .split(/[,;\n/]+|\s+\+\s+|\s+&\s+/)
      .map((nome) =>
        nome
          .replace(/^\s*\d+\s*[-–—]\s*/, "")
          .replace(/\s+/g, " ")
          .trim(),
      )
      .filter((nome) => Boolean(opcional(nome)) && !/^\*/.test(nome)),
  );
}
export function urlSegura(valor: unknown): string | null {
  const item =
    valor && typeof valor === "object"
      ? (valor as Record<string, unknown>)
      : null;
  const candidata = textoCelula(item?.hyperlink ?? valor).match(
    /https?:\/\/[^\s<>]+/i,
  )?.[0];
  if (!candidata) return null;
  try {
    const url = new URL(candidata);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
export function extrairPeriodo(
  valor: string,
): { inicio: string; fim: string | null } | null {
  const datas = [...valor.matchAll(/(\d{2})\/(\d{2})\/(\d{4})/g)].map(
    (m) => `${m[3]}-${m[2]}-${m[1]}`,
  );
  if (!datas.length) return null;
  const valida = (data: string) => {
    const d = new Date(`${data}T12:00:00Z`);
    return Number.isFinite(d.getTime()) && d.toISOString().startsWith(data);
  };
  if (!valida(datas[0])) return null;
  return {
    inicio: datas[0],
    fim: datas[1] && valida(datas[1]) ? datas[1] : null,
  };
}
export async function importarPlanilha(
  buffer: ArrayBuffer,
  arquivo: string,
): Promise<DadosProjeto> {
  const [{ default: ExcelJS }, { default: JSZip }] = await Promise.all([
    import("exceljs"),
    import("jszip"),
  ]);
  const zip = await JSZip.loadAsync(buffer);
  // ExcelJS 3 não lê alguns filtros de tabela do Excel. Removemos apenas os
  // filtros de exibição em memória; todas as células e o arquivo original são preservados.
  for (const [nome, parte] of Object.entries(zip.files))
    if (/^xl\/tables\/.*\.xml$/.test(nome))
      zip.file(
        nome,
        (await parte.async("string")).replace(
          /<autoFilter\b[^>]*>[\s\S]*?<\/autoFilter>/g,
          "",
        ),
      );
  const binario = await zip.generateAsync({ type: "uint8array" });
  const livro = new ExcelJS.Workbook();
  await livro.xlsx.load(
    binario.buffer.slice(
      binario.byteOffset,
      binario.byteOffset + binario.byteLength,
    ) as ArrayBuffer,
  );
  const dados: DadosProjeto = {
    versao: 1,
    arquivo,
    importadoEm: new Date().toISOString(),
    historias: [],
    sprints: [],
    avisos: [],
    historicosIgnorados: 0,
    removidas: 0,
  };
  const identidades = new Map<string, HistoriaProjeto>();
  for (const aba of livro.worksheets) {
    const correspondencia = aba.name.match(
      /^\s*sprint\s*(18|19|20|21|22|23)\b/i,
    );
    if (!correspondencia) continue;
    const sprint = Number(correspondencia[1]);
    const colunas = new Map<string, number>();
    let cabecalho = 0;
    aba.eachRow((linha, indice) => {
      if (cabecalho || indice > 40) return;
      const candidatos = new Map<string, number>();
      linha.eachCell((celula, coluna) =>
        candidatos.set(normalizar(textoCelula(celula.value)), coluna),
      );
      if (candidatos.has("us") && candidatos.has("sprint")) {
        cabecalho = indice;
        for (const [nome, coluna] of candidatos) colunas.set(nome, coluna);
      }
    });
    if (!cabecalho) {
      dados.avisos.push({
        tipo: "estrutura",
        sprint,
        mensagem: `A aba ${aba.name} não possui cabeçalhos US e Sprint reconhecíveis.`,
      });
      continue;
    }
    const coluna = (...nomes: string[]) =>
      nomes.map((nome) => colunas.get(normalizar(nome))).find(Boolean);
    const usColuna = coluna("US")!,
      periodoColuna = coluna("Sprint")!;
    const candidatas: {
      linha: number;
      titulo: string;
      codigo: string;
      periodo: string;
      datas: ReturnType<typeof extrairPeriodo>;
    }[] = [];
    aba.eachRow((linha, indice) => {
      if (indice <= cabecalho) return;
      const titulo = textoCelula(linha.getCell(usColuna).value),
        us = titulo.match(/\bUS\s*(\d+)\b/i);
      if (!us) return;
      const periodo = textoCelula(linha.getCell(periodoColuna).value);
      candidatas.push({
        linha: indice,
        titulo,
        codigo: `US${String(Number(us[1])).padStart(3, "0")}`,
        periodo,
        datas: extrairPeriodo(periodo),
      });
    });
    // As abas mais recentes preservam linhas de sprints antigas. O início mais
    // recente identifica o bloco atual, inclusive quando há erro no ano final.
    const inicio = candidatas
      .map((r) => r.datas?.inicio)
      .filter((v): v is string => Boolean(v))
      .sort()
      .at(-1);
    if (!inicio) {
      dados.avisos.push({
        tipo: "estrutura",
        sprint,
        mensagem: `A Sprint ${sprint} não contém período de referência identificável.`,
      });
      continue;
    }
    const atuais = candidatas.filter((r) => r.datas?.inicio === inicio),
      finais = new Map<string, number>();
    for (const r of atuais)
      if (r.datas?.fim && r.datas.fim >= inicio)
        finais.set(r.datas.fim, (finais.get(r.datas.fim) ?? 0) + 1);
    const fim = [...finais].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const dataPt = (data: string) => data.split("-").reverse().join("/");
    const periodo: SprintProjeto = {
      numero: sprint,
      inicio,
      fim,
      periodo: `${dataPt(inicio)}${fim ? ` a ${dataPt(fim)}` : " — término não informado"}`,
      aba: aba.name,
    };
    if (!dados.sprints.some((s) => s.numero === sprint))
      dados.sprints.push(periodo);
    dados.historicosIgnorados += candidatas.length - atuais.length;
    const inconsistentes: number[] = [];
    for (const registro of atuais) {
      if (/us\s+removida/i.test(normalizar(registro.titulo))) {
        dados.removidas++;
        dados.avisos.push({
          tipo: "exclusao",
          sprint,
          linhas: [registro.linha],
          mensagem: `${registro.codigo} excluída dos indicadores: explicitamente marcada como removida do escopo na Sprint ${sprint}.`,
        });
        continue;
      }
      if (
        !registro.datas?.fim ||
        registro.datas.fim < inicio ||
        (fim && registro.datas.fim !== fim)
      )
        inconsistentes.push(registro.linha);
      const linha = aba.getRow(registro.linha);
      const valor = (...nomes: string[]) => {
        const n = coluna(...nomes);
        return n ? textoCelula(linha.getCell(n).value) : "";
      };
      const celula = (...nomes: string[]) => {
        const n = coluna(...nomes);
        return n ? linha.getCell(n).value : null;
      };
      const textoPontos = valor(
        "Complexidade",
        "Story points",
        "Pontos",
      ).replace(",", ".");
      const pontos =
        textoPontos &&
        Number.isFinite(Number(textoPontos)) &&
        Number(textoPontos) >= 0
          ? Number(textoPontos)
          : null;
      const andamento = opcional(valor("Andamento")),
        situacaoOriginal = opcional(valor("Situação", "Status"));
      const situacao = andamento ?? situacaoOriginal ?? "Não informado";
      const campos: HistoriaProjeto = {
        id: `S${sprint}-${registro.codigo}`,
        codigo: registro.codigo,
        titulo: registro.titulo,
        sprint,
        menu: opcional(valor("Menu")),
        modulo: opcional(valor("Módulo/Funcionalidade", "Módulo")),
        squads: valor("Squad")
          .split(/[,;/]+/)
          .map((v) => v.trim())
          .filter(Boolean),
        analistas: separarPessoas(valor("Analista")),
        desenvolvedores: separarPessoas(valor("Dev", "Desenvolvedor")),
        qa: separarPessoas(valor("QA")),
        situacao,
        situacaoOriginal,
        andamentoOriginal: andamento,
        pontos,
        dependencias: nomesUnicos(
          [...valor("Dependências").matchAll(/US\s*(\d+)/gi)].map(
            (m) => `US${String(Number(m[1])).padStart(3, "0")}`,
          ),
        ),
        periodoOriginal: registro.periodo,
        redmine: urlSegura(
          celula(
            ...[...colunas.keys()].filter((k) =>
              /r[ea]d?mine|redmine|readmine/.test(k),
            ),
          ),
        ),
        documento: urlSegura(linha.getCell(usColuna).value),
        observacoes: opcional(valor("OBS", "Observações")),
        ambiente: opcional(valor("Ambiente")),
        qaSituacao: opcional(valor("Situação QA", "Status QA", "Resultado QA")),
        homologacao: opcional(valor("Homologação", "Situação homologação")),
        aba: aba.name,
        linhas: [registro.linha],
      };
      const anterior = identidades.get(campos.id);
      if (anterior) {
        anterior.linhas.push(registro.linha);
        for (const chave of [
          "analistas",
          "desenvolvedores",
          "squads",
          "qa",
          "dependencias",
        ] as const)
          anterior[chave] = nomesUnicos([...anterior[chave], ...campos[chave]]);
        if (anterior.pontos === null) anterior.pontos = campos.pontos;
        if (anterior.situacao === "Não informado")
          anterior.situacao = campos.situacao;
        dados.avisos.push({
          tipo: "duplicidade",
          sprint,
          linhas: [...anterior.linhas],
          mensagem: `${campos.codigo}: aparições duplicadas na Sprint ${sprint} unificadas; pessoas associadas preservadas.${anterior.pontos !== null && campos.pontos !== null && anterior.pontos !== campos.pontos ? " Pontuações divergentes: foi mantida a primeira informada." : ""}`,
        });
      } else {
        identidades.set(campos.id, campos);
        dados.historias.push(campos);
      }
    }
    if (inconsistentes.length)
      dados.avisos.push({
        tipo: "periodo",
        sprint,
        linhas: inconsistentes,
        mensagem: `Sprint ${sprint}: ${inconsistentes.length} registros possuem término inconsistente. O recorte usa o início ${dataPt(inicio)} e o término predominante ${fim ? dataPt(fim) : "não informado"}; os valores originais foram preservados.`,
      });
  }
  if (!dados.historias.length)
    throw new Error(
      "Nenhuma história vinculada a um período foi encontrada nas abas das Sprints 18 a 23. A Sprint 24 e o backlog não são importados.",
    );
  dados.historias.sort(
    (a, b) =>
      a.sprint - b.sprint ||
      a.codigo.localeCompare(b.codigo, undefined, { numeric: true }),
  );
  dados.sprints.sort((a, b) => a.numero - b.numero);
  const faltantes = [18, 19, 20, 21, 22, 23].filter(
    (n) => !dados.sprints.some((s) => s.numero === n),
  );
  if (faltantes.length)
    dados.avisos.push({
      tipo: "estrutura",
      mensagem: `Abas/períodos não disponíveis: ${faltantes.map((n) => `Sprint ${n}`).join(", ")}. Nenhum valor foi presumido para essas sprints.`,
    });
  return ajustarEscopoProjeto(dados);
}
