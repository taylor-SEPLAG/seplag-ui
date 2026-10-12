import type { Vinculo } from "./VinculoV2Page";
import {
  normalizarForma,
  situacaoDoVinculo,
  formaVacanciaValida,
  FORMA_A_REVISAR,
} from "./vinculosConsulta";

export function resumoVinculos(registros: Vinculo[], tipos: readonly string[]) {
  const vigentes = registros.filter((v) => situacaoDoVinculo(v) === "Ativo");
  const encerrados = registros.filter(
    (v) => situacaoDoVinculo(v) === "Encerrado",
  );
  const pessoas = (lista: Vinculo[]) =>
    new Set(lista.map((v) => v.cpf.replace(/\D/g, ""))).size;
  const formas = (lista: Vinculo[]) => {
    const contagens = new Map<string, { nome: string; quantidade: number }>();
    lista.forEach((v) => {
      const nome = formaVacanciaValida(v)
        ? (v.vacanciaForma?.trim() ?? "")
        : FORMA_A_REVISAR;
      const chave = normalizarForma(nome);
      const atual = contagens.get(chave);
      contagens.set(chave, {
        nome: nome === "Término de contrato" ? "Término de Contrato" : nome,
        quantidade: (atual?.quantidade ?? 0) + 1,
      });
    });
    return [...contagens.values()].sort(
      (a, b) =>
        b.quantidade - a.quantidade || a.nome.localeCompare(b.nome, "pt-BR"),
    );
  };
  const linhas = tipos.map((tipo) => {
    const ativosTipo = vigentes.filter((v) => v.tipo === tipo).length;
    const encerradosTipo = encerrados.filter((v) => v.tipo === tipo);
    const ranking = formas(encerradosTipo.filter(formaVacanciaValida));
    return {
      tipo,
      vigentes: ativosTipo,
      encerrados: encerradosTipo.length,
      total: ativosTipo + encerradosTipo.length,
      principalForma:
        ranking[0]?.nome ?? (encerradosTipo.length ? FORMA_A_REVISAR : "—"),
    };
  });
  return {
    pessoasVigentes: pessoas(vigentes),
    pessoasEncerradas: pessoas(encerrados),
    vigentes: vigentes.length,
    encerrados: encerrados.length,
    total: registros.length,
    linhas,
    formas: formas(encerrados),
    formasARevisar: encerrados.filter((v) => !formaVacanciaValida(v)).length,
  };
}
