import type { Vinculo } from "./VinculoV2Page";
import { situacaoDoVinculo } from "./vinculosConsulta";
export const abasDashboard = [
  { id: "geral", nome: "Visão Geral", icone: "pi-chart-bar" },
  { id: "orgao", nome: "Por Órgão", icone: "pi-building" },
  { id: "cargo", nome: "Carreira e Cargo", icone: "pi-briefcase" },
  { id: "perfil", nome: "Perfil dos Vínculos", icone: "pi-users" },
] as const;
export type AbaDashboard = (typeof abasDashboard)[number]["id"] | "carreira";
export interface FiltrosAnalise {
  busca: string;
  carreira: string;
  limite: string;
  todosOrgaos: boolean;
  orgaoTipo?: string;
  composicaoCargo?: string;
  composicaoLimite?: string;
  tiposComposicao?: string[];
}
export const filtrosAnaliseIniciais: FiltrosAnalise = {
  busca: "",
  carreira: "",
  limite: "10",
  todosOrgaos: false,
};
export const naoInformado = (s?: string) => s?.trim() || "Não informado";
export const cargoEspecialidade = (v: Vinculo) =>
  [naoInformado(v.cargo), v.perfil?.trim()].filter(Boolean).join(" / ");
export type VinculoPerfil = Vinculo & { sexo?: string; escolaridade?: string };
// Campos cadastrais ausentes são contabilizados sem inferência, inclusive nos exemplos.
export const sexoVinculo = (v: VinculoPerfil) => naoInformado(v.sexo);
export const escolaridadeVinculo = (v: VinculoPerfil) =>
  naoInformado(v.escolaridade);
export function agruparAnalise(
  registros: Vinculo[],
  chave: (v: Vinculo) => string,
) {
  const grupos = new Map<string, Vinculo[]>();
  for (const v of registros) {
    const nome = chave(v);
    grupos.set(nome, [...(grupos.get(nome) ?? []), v]);
  }
  return [...grupos]
    .map(([nome, itens]) => ({
      nome,
      itens,
      total: itens.length,
      vigentes: itens.filter((v) => situacaoDoVinculo(v) === "Ativo").length,
      encerrados: itens.filter((v) => situacaoDoVinculo(v) === "Encerrado")
        .length,
    }))
    .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome, "pt-BR"));
}
export function dadosAnalise(
  registros: Vinculo[],
  aba: AbaDashboard,
  f: FiltrosAnalise,
) {
  return registros.filter(
    (v) =>
      ((aba !== "cargo" && aba !== "carreira") ||
        !f.carreira ||
        naoInformado(v.carreira) === f.carreira) &&
      ((aba !== "cargo" && aba !== "carreira") ||
        !f.busca ||
        naoInformado(v.cargo) === f.busca ||
        cargoEspecialidade(v) === f.busca),
  );
}
export function gruposAnalise(registros: Vinculo[], aba: AbaDashboard) {
  return agruparAnalise(
    registros,
    aba === "orgao"
      ? (v) => naoInformado(v.orgao)
      : aba === "cargo"
        ? cargoEspecialidade
        : aba === "carreira"
          ? (v) => naoInformado(v.carreira)
          : escolaridadeVinculo,
  );
}
export function gruposTipoOrgao(registros: Vinculo[], orgao = "") {
  return agruparAnalise(
    registros.filter((v) => !orgao || naoInformado(v.orgao) === orgao),
    (v) => `${naoInformado(v.orgao)} / ${v.tipo}`,
  );
}
export function gruposTipoCargo(registros: Vinculo[]) {
  return agruparAnalise(
    registros,
    (v) => `${naoInformado(v.cargo)} / ${v.tipo}`,
  );
}
export function composicaoPorCargo(registros: Vinculo[], f: FiltrosAnalise) {
  const selecionados = registros.filter(
    (v) =>
      (!f.composicaoCargo || cargoEspecialidade(v) === f.composicaoCargo) &&
      (!f.tiposComposicao || f.tiposComposicao.includes(v.tipo)),
  );
  return agruparAnalise(selecionados, cargoEspecialidade).slice(
    0,
    Number(f.composicaoLimite ?? "5"),
  );
}
export function linhasExportacaoAnalise(
  registros: Vinculo[],
  aba: AbaDashboard,
  f: FiltrosAnalise,
) {
  const dados = dadosAnalise(registros, aba, f);
  const grupos = gruposAnalise(dados, aba);
  const limite =
    aba === "orgao"
      ? f.todosOrgaos
        ? Infinity
        : 10
      : aba === "perfil"
        ? Infinity
        : f.limite === "todos"
          ? Infinity
          : Number(f.limite);
  const linhas = grupos
    .slice(0, limite)
    .map(
      (g) => [g.nome, g.vigentes, g.encerrados, g.total] as (string | number)[],
    );
  if (aba === "orgao")
    linhas.push(
      ...gruposTipoOrgao(dados, f.orgaoTipo).map(
        (g) =>
          [`Tipo por órgão: ${g.nome}`, g.vigentes, g.encerrados, g.total] as (
            string | number
          )[],
      ),
    );
  if (aba === "cargo") {
    linhas.push(
      ...composicaoPorCargo(dados, f).flatMap((c) =>
        agruparAnalise(c.itens, (v) => v.tipo).map(
          (g) =>
            [
              `Tipo por cargo: ${c.nome} / ${g.nome}`,
              g.vigentes,
              g.encerrados,
              g.total,
            ] as (string | number)[],
        ),
      ),
    );
    linhas.push(
      ...agruparAnalise(dados, (v) => naoInformado(v.carreira))
        .slice(0, limite)
        .map(
          (g) =>
            [`Carreira: ${g.nome}`, g.vigentes, g.encerrados, g.total] as (
              string | number
            )[],
        ),
    );
  }
  if (aba === "perfil")
    linhas.push(
      ...agruparAnalise(dados, sexoVinculo).map((g) => [
        `Sexo: ${g.nome}`,
        g.vigentes,
        g.encerrados,
        g.total,
      ]),
      ...agruparAnalise(dados, v => `${v.tipo} · ${sexoVinculo(v)}`).map(g => [
        `Tipo de vínculo por sexo: ${g.nome}`, g.vigentes, g.encerrados, g.total,
      ]),
    );
  if (aba === "carreira")
    linhas.push(
      ...agruparAnalise(
        dados.filter((v) => !f.busca || naoInformado(v.cargo) === f.busca),
        cargoEspecialidade,
      )
        .slice(0, limite)
        .map(
          (g) =>
            [`Cargo: ${g.nome}`, g.vigentes, g.encerrados, g.total] as (
              string | number
            )[],
        ),
    );
  return linhas;
}
