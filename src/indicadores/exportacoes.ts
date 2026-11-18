import { graficosAtivos, type RegistroGrafico } from "./registroGraficos";
import {
  gerarInsights,
  JORNADA_DIARIA,
  calcularCapacitySprint,
  numero,
  percentual,
  primeirasAparicoes,
  resumir,
  somarCapacityBruta,
} from "./modelo";
import type { DadosProjeto, FiltrosProjeto, HistoriaProjeto } from "./types";
import logoEstado from "../assets/img/logo-seplag-sigep.png";

export function baixarArquivo(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob),
    link = document.createElement("a");
  link.href = url;
  link.download = nome;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
export const descreverFiltros = (f: FiltrosProjeto) =>
  [
    `Sprints ${f.inicial} a ${f.final}`,
    f.squad ? `Squad ${f.squad}` : "Todas as squads",
    f.analista || "Todos os analistas",
    f.desenvolvedor || "Todos os desenvolvedores",
    f.modulo || "Todos os módulos",
    f.situacao || "Todas as situações",
  ].join(" · ");
const equipePorSprint = (
  dados: DadosProjeto,
  historias: HistoriaProjeto[],
  filtros: FiltrosProjeto,
) =>
  dados.sprints
    .filter((s) => s.numero >= filtros.inicial && s.numero <= filtros.final)
    .map((s) => ({
      sprint: s.numero,
      ...calcularCapacitySprint(s, historias),
    }));
export function imagemGrafico(registro: RegistroGrafico): string {
  registro.chart.stop();
  registro.chart.update("none");
  const original = registro.chart.canvas,
    canvas = document.createElement("canvas");
  const escala = Math.max(1, original.width / 900),
    topo = 74 * escala,
    rodape = 72 * escala;
  canvas.width = original.width;
  canvas.height = original.height + topo + rodape;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível preparar a imagem do gráfico.");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#123354";
  ctx.font = `600 ${18 * escala}px Arial`;
  ctx.fillText(
    registro.titulo,
    18 * escala,
    28 * escala,
    canvas.width - 36 * escala,
  );
  ctx.font = `${12 * escala}px Arial`;
  ctx.fillStyle = "#526a82";
  ctx.fillText(
    registro.periodo,
    18 * escala,
    52 * escala,
    canvas.width - 36 * escala,
  );
  ctx.drawImage(original, 0, topo);
  const legendas = registro.chart.data.datasets.map((d) => d.label).join(" · ");
  ctx.fillText(
    legendas,
    18 * escala,
    canvas.height - 42 * escala,
    canvas.width - 36 * escala,
  );
  ctx.fillText(
    "Projeto SIGEP · Estimativas e associações registradas na fonte; dados ausentes permanecem não informados.",
    18 * escala,
    canvas.height - 18 * escala,
    canvas.width - 36 * escala,
  );
  return canvas.toDataURL("image/png");
}
export function exportarPNG(id: string) {
  const grafico = graficosAtivos.get(id);
  if (!grafico)
    throw new Error("Selecione um gráfico disponível na aba atual.");
  const base64 = imagemGrafico(grafico).split(",")[1],
    binario = atob(base64),
    bytes = Uint8Array.from(binario, (c) => c.charCodeAt(0));
  baixarArquivo(new Blob([bytes], { type: "image/png" }), `sigep-${id}.png`);
}
export function textoExecutivo(
  dados: DadosProjeto,
  historias: HistoriaProjeto[],
  filtros: FiltrosProjeto,
) {
  const primeiras = primeirasAparicoes(dados.historias),
    r = resumir(historias, primeiras),
    equipe = equipePorSprint(dados, historias, filtros),
    insights = gerarInsights(historias, primeiras);
  return [
    `PROJETO SIGEP — RESUMO EXECUTIVO`,
    descreverFiltros(filtros),
    `Fonte: ${dados.arquivo}`,
    `Importação: ${new Date(dados.importadoEm).toLocaleString("pt-BR", { timeZone: "America/Cuiaba" })}`,
    "",
    `${r.distintas} histórias distintas · ${r.registros} registros nas sprints · Pontos estimados: ${numero(r.pontuadas ? r.pontos : null)}.`,
    `${numero(r.concluidas)} conclusões confirmadas na última aparição de cada US; ${r.conhecidas}/${r.distintas} histórias têm situação conhecida.`,
    `Taxa de conclusão confirmada: ${percentual(r.taxaConclusao)}; registros sem situação não são considerados concluídos.`,
    `${r.reaparecidas} reaparições; média de ${numero(r.media, 2)} pontos por história pontuada.`,
    `Desenvolvedores disponíveis no período: ${r.desenvolvedores} nomes distintos atribuídos às histórias.`,
    `Jornada diária: ${JORNADA_DIARIA} h por desenvolvedor.`,
    `Capacity bruta planejada no período: ${numero(somarCapacityBruta(equipe))} h.`,
    ...equipe.map(
      (s) =>
        `Sprint ${s.sprint}: ${s.nomes.length} desenvolvedores disponíveis. ${numero(s.diasUteis)} dias (seg. a sex.); capacity diária: ${numero(s.diaria)} h; capacity bruta: ${numero(s.bruta)} h.`,
    ),
    `Capacity bruta: dias de segunda a sexta, com início e fim incluídos, antes dos descontos de feriados, férias e suporte.`,
    `FTE, capacity líquida e horas efetivamente utilizadas: não informados.`,
    "",
    ...insights.flatMap((i) => [
      `${i.titulo}: ${i.valor}`,
      i.explicacao,
      `Discussão: ${i.pergunta}`,
      "",
    ]),
    "RESSALVAS",
    "Estimativas não representam necessariamente pontos entregues. Reaparição não comprova atraso ou retrabalho. Situação Finalizada não comprova aprovação em QA ou homologação.",
    ...dados.avisos.map((a) => a.mensagem),
  ].join("\n");
}
export async function exportarExcel(
  dados: DadosProjeto,
  historias: HistoriaProjeto[],
  filtros: FiltrosProjeto,
  nome = "sigep-indicadores",
) {
  const { default: ExcelJS } = await import("exceljs"),
    livro = new ExcelJS.Workbook();
  livro.creator = "SIGEP";
  livro.created = new Date();
  const info = livro.addWorksheet("Origem e filtros");
  const resumo = resumir(historias, primeirasAparicoes(dados.historias));
  const equipeSprints = equipePorSprint(dados, historias, filtros);
  info.addRows([
    ["Projeto SIGEP — Indicadores gerenciais"],
    ["Arquivo", dados.arquivo],
    ["Importado em", dados.importadoEm],
    ["Filtros", descreverFiltros(filtros)],
    [
      "Desenvolvedores disponíveis",
      "Nomes distintos atribuídos às histórias por sprint; nomes sem repetição no total do período",
    ],
    ["Jornada diária (h por desenvolvedor)", JORNADA_DIARIA],
    [
      "Capacity bruta planejada (h)",
      somarCapacityBruta(equipeSprints) ?? "Não informado",
    ],
    [
      "Dias de capacity",
      "Segunda a sexta, início e fim incluídos, antes dos descontos de feriados, férias e suporte",
    ],
    ["FTE / capacity líquida / horas utilizadas", "Não informados"],
    ["Regra de conclusão", "Situação da última aparição de cada US no recorte"],
    [
      "Story points",
      "Estimativas registradas; não equivalem a horas nem a entregas",
    ],
    ...Object.entries({
      ...resumo,
      pontos: resumo.pontuadas ? resumo.pontos : null,
    }).map(([k, v]) => [
      k === "desenvolvedores"
        ? "Total de desenvolvedores disponíveis no período"
        : k,
      v ?? "Não informado",
    ]),
    [],
    ["Qualidade dos dados"],
    ...dados.avisos.map((a) => [a.mensagem]),
  ]);
  info.getColumn(1).width = 42;
  info.getColumn(2).width = 100;
  const aba = livro.addWorksheet("Histórias filtradas");
  aba.columns = [
    "US",
    "Título",
    "Sprint",
    "Squad",
    "Menu",
    "Módulo",
    "Analista",
    "Desenvolvedores",
    "QA associado",
    "Situação",
    "Andamento original",
    "Situação original",
    "Pontos estimados",
    "Dependências",
    "Período original",
    "Redmine",
    "Aba de origem",
    "Linhas de origem",
    "Observações",
  ].map((header, i) => ({
    header,
    key: String(i),
    width: [0, 2, 12].includes(i) ? 16 : i === 1 ? 70 : 30,
  }));
  for (const h of historias)
    aba.addRow([
      h.codigo,
      h.titulo,
      h.sprint,
      h.squads.join(", ") || "Não informado",
      h.menu ?? "Não informado",
      h.modulo ?? "Não informado",
      h.analistas.join(", "),
      h.desenvolvedores.join(", "),
      h.qa.join(", "),
      h.situacao,
      h.andamentoOriginal ?? "",
      h.situacaoOriginal ?? "",
      h.pontos,
      h.dependencias.join(", "),
      h.periodoOriginal,
      h.redmine ?? "",
      h.aba,
      h.linhas.join(", "),
      h.observacoes ?? "",
    ]);
  aba.views = [{ state: "frozen", ySplit: 1 }];
  aba.autoFilter = { from: "A1", to: "S1" };
  const equipe = livro.addWorksheet("Equipe por sprint");
  equipe.columns = [
    { header: "Sprint", width: 15 },
    { header: "Desenvolvedores disponíveis", width: 30 },
    { header: "Nomes atribuídos às histórias", width: 100 },
    { header: "Jornada diária (h)", width: 24 },
    { header: "Dias (seg. a sex.)", width: 24 },
    { header: "Capacity diária (h)", width: 24 },
    { header: "Capacity bruta (h)", width: 24 },
  ];
  equipe.addRows(
    equipeSprints.map((s) => [
      s.sprint,
      s.nomes.length,
      s.nomes.join(", "),
      s.jornada,
      s.diasUteis,
      s.diaria,
      s.bruta,
    ]),
  );
  equipe.views = [{ state: "frozen", ySplit: 1 }];
  for (const folha of [info, aba, equipe]) {
    folha.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    folha.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF005A92" },
    };
    folha.getRow(1).height = 28;
  }
  const bytes = await livro.xlsx.writeBuffer();
  baixarArquivo(
    new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${nome}.xlsx`,
  );
}
export async function exportarPDF(
  dados: DadosProjeto,
  historias: HistoriaProjeto[],
  filtros: FiltrosProjeto,
  aba: string,
) {
  const { jsPDF } = await import("jspdf"),
    doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });
  const img = new Uint8Array(await (await fetch(logoEstado)).arrayBuffer());
  let y = 0;
  const cabecalho = () => {
    doc.setFillColor(0, 90, 146);
    doc.rect(0, 0, 210, 29, "F");
    doc.addImage(img, "PNG", 12, 6, 43, 15.35, "governo-mt", "FAST");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.text("Dashboard Gerencial — Projeto SIGEP", 62, 12);
    doc.setFontSize(9);
    doc.text(aba, 62, 20);
    y = 38;
  };
  const espaco = (altura: number) => {
    if (y + altura > 276) {
      doc.addPage();
      cabecalho();
    }
  };
  const texto = (conteudo: string, tamanho = 9, negrito = false) => {
    doc.setFont("helvetica", negrito ? "bold" : "normal");
    doc.setFontSize(tamanho);
    doc.setTextColor(25, 53, 79);
    const linhas = doc.splitTextToSize(conteudo, 184) as string[];
    for (const linha of linhas) {
      espaco(5);
      doc.text(linha, 13, y);
      y += 5;
    }
    y += 2;
  };
  cabecalho();
  texto(descreverFiltros(filtros), 10, true);
  texto(`Fonte: ${dados.arquivo}`);
  texto(
    `Última importação: ${new Date(dados.importadoEm).toLocaleString("pt-BR", { timeZone: "America/Cuiaba" })}`,
  );
  const primeiras = primeirasAparicoes(dados.historias),
    r = resumir(historias, primeiras),
    equipe = equipePorSprint(dados, historias, filtros);
  texto(
    `${r.distintas} histórias distintas | ${r.registros} registros | Pontos estimados: ${numero(r.pontuadas ? r.pontos : null)}`,
    11,
    true,
  );
  texto(
    `${numero(r.concluidas)} conclusões confirmadas | ${r.reaparecidas} reaparições | Média: ${numero(r.media, 2)} pontos`,
  );
  texto(
    `Desenvolvedores disponíveis no período: ${r.desenvolvedores} nomes distintos atribuídos às histórias.`,
  );
  texto(
    equipe
      .map(
        (s) =>
          `Sprint ${s.sprint}: ${s.nomes.length} devs; ${numero(s.bruta)} h`,
      )
      .join(" | "),
  );
  texto(
    `Capacity bruta planejada: ${numero(somarCapacityBruta(equipe))} h. ${JORNADA_DIARIA} h/dia por desenvolvedor × dias de segunda a sexta, início e fim incluídos, antes dos descontos de feriados, férias e suporte.`,
  );
  texto(
    `Situação conhecida em ${r.conhecidas} de ${r.distintas} histórias. Capacidade líquida, horas efetivamente utilizadas e FTE não informados. QA e homologação não são inferidos de situação Finalizada.`,
  );
  for (const registro of graficosAtivos.values()) {
    const png = imagemGrafico(registro),
      propriedades = doc.getImageProperties(png),
      altura = Math.min(100, (184 * propriedades.height) / propriedades.width);
    espaco(altura + 12);
    doc.addImage(png, "PNG", 13, y, 184, altura);
    y += altura + 8;
  }
  texto("Leitura gerencial", 12, true);
  for (const insight of gerarInsights(historias, primeiras)) {
    texto(`${insight.titulo}: ${insight.valor}`, 10, true);
    texto(insight.explicacao);
  }
  texto("Qualidade e origem dos dados", 12, true);
  for (const aviso of dados.avisos) texto(aviso.mensagem);
  texto("Histórias do recorte", 12, true);
  for (const h of historias) {
    const linhas = doc.splitTextToSize(
      `${h.codigo} · Sprint ${h.sprint} · ${h.titulo}\n${h.desenvolvedores.join(", ") || "Desenvolvedor não informado"} · ${h.pontos === null ? "Sem pontuação" : `${h.pontos} pontos`} · ${h.situacao}`,
      184,
    ) as string[];
    espaco(linhas.length * 4 + 6);
    doc.setFontSize(8);
    doc.setTextColor(25, 53, 79);
    doc.text(linhas, 13, y, { lineHeightFactor: 1.4 });
    y += linhas.length * 4 + 5;
  }
  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(80, 104, 127);
    doc.text(
      `SIGEP · ${i}/${paginas} · Estimativas não equivalem a horas ou pontos entregues.`,
      13,
      288,
    );
  }
  doc.save("sigep-dashboard-gerencial.pdf");
}
