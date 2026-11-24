import type { FolhaCronogramaState } from "../PrototiposPage";
import {
  competenciaValida,
  nomeCiclo,
  type CicloCronograma,
} from "./ciclosRepository";

/** Gera um rascunho independente, preservando os deslocamentos mensais das datas. */
export function copiarCiclo(
  referencia: CicloCronograma,
  destino: string,
): { configuracao: FolhaCronogramaState; avisos: string[] } {
  if (!competenciaValida(destino) || !competenciaValida(referencia.competencia))
    throw Error("Selecione um ciclo de referência cadastrado.");
  const [anoBase, mesBase] = referencia.competencia.split("-").map(Number);
  const [anoDestino, mesDestino] = destino.split("-").map(Number);
  const avisos: string[] = [];
  const configuracao = structuredClone(referencia.configuracao);
  configuracao.tituloCiclo = nomeCiclo(destino);
  for (const secao of configuracao.secoes)
    for (const evento of secao.eventos) {
      let datas = 0,
        primeira: number | undefined;
      evento.periodo = evento.periodo.replace(
        /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/g,
        (
          original,
          diaTexto: string,
          mesTexto: string,
          anoTexto: string | undefined,
        ) => {
          const dia = Number(diaTexto),
            mes = Number(mesTexto);
          let ano = anoTexto ? Number(anoTexto) : anoBase;
          if (!anoTexto) {
            if (mes - mesBase > 6) ano--;
            else if (mes - mesBase < -6) ano++;
          }
          let indice = ano * 12 + mes - 1;
          if (
            datas > 0 &&
            !anoTexto &&
            primeira !== undefined &&
            indice < primeira &&
            primeira - indice > 6
          ) {
            ano++;
            indice += 12;
          }
          const data = new Date(Date.UTC(ano, mes - 1, dia));
          if (
            mes < 1 ||
            mes > 12 ||
            dia < 1 ||
            data.getUTCMonth() !== mes - 1 ||
            data.getUTCDate() !== dia
          ) {
            avisos.push(
              `${evento.descricao || "Evento"}: data ${original} inválida na referência; revise o período.`,
            );
            return original;
          }
          primeira ??= indice;
          datas++;
          const deslocamento = indice - (anoBase * 12 + mesBase - 1);
          const novoIndice = anoDestino * 12 + mesDestino - 1 + deslocamento;
          const novoAno = Math.floor(novoIndice / 12),
            novoMes = novoIndice % 12;
          if (novoAno < 1900 || novoAno > 9999)
            throw Error(
              "As datas copiadas ultrapassam os anos permitidos. Revise o ciclo de referência.",
            );
          const ultimoDia = new Date(
            Date.UTC(novoAno, novoMes + 1, 0),
          ).getUTCDate();
          const novoDia = Math.min(dia, ultimoDia);
          const resultado = `${String(novoDia).padStart(2, "0")}/${String(novoMes + 1).padStart(2, "0")}/${novoAno}`;
          if (novoDia !== dia)
            avisos.push(
              `${evento.descricao || "Evento"}: ${original} ajustada para ${resultado}, último dia válido do mês.`,
            );
          return resultado;
        },
      );
      if (!datas)
        avisos.push(
          `${evento.descricao || "Evento"}: período não informado ou inválido; revise as datas antes de salvar.`,
        );
    }
  return { configuracao, avisos: [...new Set(avisos)] };
}
