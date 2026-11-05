import { describe, expect, it } from "vitest";
import {
  CHAVE_FLUXO_SUSPENSAO_ART16,
  CHAVE_FLUXO_SUSPENSAO_ART17,
  FLUXOS_PADRAO,
  fluxoExigeAprovacao,
  iniciarProcesso,
  obterFluxo,
  perfilPodeDecidir,
  registrarDecisao,
  registrarPublicacao,
  validarConfiguracaoFluxo,
  type ConfiguracaoFluxo,
} from "./fluxoAprovacao";

const art17 = obterFluxo(FLUXOS_PADRAO, CHAVE_FLUXO_SUSPENSAO_ART17);
const decisao = { perfil: "DRE / RH Central", responsavel: "Aprovador", em: "04/11/2026", documentacaoConferida: true } as const;

describe("fluxoAprovacao — padrões", () => {
  it("Art. 16 não exige aprovador; Art. 17 exige validação do órgão central", () => {
    expect(fluxoExigeAprovacao(obterFluxo(FLUXOS_PADRAO, CHAVE_FLUXO_SUSPENSAO_ART16))).toBe(false);
    expect(fluxoExigeAprovacao(art17)).toBe(true);
    expect(iniciarProcesso(obterFluxo(FLUXOS_PADRAO, CHAVE_FLUXO_SUSPENSAO_ART16), "x")).toBeNull();
  });

  it("desligar o validador central equivale a registro direto", () => {
    const desligado: ConfiguracaoFluxo = { ...art17, niveis: art17.niveis.map((n) => ({ ...n, ativo: false })) };
    expect(fluxoExigeAprovacao(desligado)).toBe(false);
    expect(iniciarProcesso(desligado, "x")).toBeNull();
  });
});

describe("fluxoAprovacao — decisão", () => {
  it("aprova no nível único e efetiva", () => {
    const processo = iniciarProcesso(art17, "x")!;
    expect(perfilPodeDecidir(processo, "DRE / RH Central")).toBe(true);
    expect(perfilPodeDecidir(processo, "RH / Gestão de Pessoas")).toBe(false);
    const r = registrarDecisao(processo, { ...decisao, decisao: "APROVADO" });
    expect(r.sucesso && r.processo.status).toBe("APROVADO");
  });

  it("exige conferência documental para aprovar e justificativa para rejeitar", () => {
    const processo = iniciarProcesso(art17, "x")!;
    expect(registrarDecisao(processo, { ...decisao, decisao: "APROVADO", documentacaoConferida: false }).sucesso).toBe(false);
    expect(registrarDecisao(processo, { ...decisao, decisao: "REJEITADO" }).sucesso).toBe(false);
    const rejeitado = registrarDecisao(processo, { ...decisao, decisao: "REJEITADO", justificativa: "Documentação incompleta" });
    expect(rejeitado.sucesso && rejeitado.processo.status).toBe("REJEITADO");
  });

  it("perfil fora da etapa não decide", () => {
    const processo = iniciarProcesso(art17, "x")!;
    expect(registrarDecisao(processo, { ...decisao, perfil: "Chefia Imediata", decisao: "APROVADO" }).sucesso).toBe(false);
  });

  it("vários níveis e publicação no Diário Oficial como etapa final", () => {
    const fluxo: ConfiguracaoFluxo = {
      ...art17,
      niveis: [
        { ordem: 1, perfil: "Chefia Imediata", rotulo: "Chefia", ativo: true },
        { ordem: 2, perfil: "DRE / RH Central", rotulo: "Central", ativo: true },
      ],
      publicacaoDiarioOficial: true,
    };
    let processo = iniciarProcesso(fluxo, "x")!;
    const n1 = registrarDecisao(processo, { ...decisao, perfil: "Chefia Imediata", decisao: "APROVADO" });
    expect(n1.sucesso && n1.processo.nivelAtual).toBe(2);
    if (n1.sucesso) processo = n1.processo;
    const n2 = registrarDecisao(processo, { ...decisao, decisao: "APROVADO" });
    expect(n2.sucesso && n2.processo.status).toBe("AGUARDANDO_PUBLICACAO");
    if (n2.sucesso) processo = n2.processo;
    expect(registrarPublicacao(processo, "DRE / RH Central", { numero: "", data: "" }).sucesso).toBe(false);
    const publicado = registrarPublicacao(processo, "DRE / RH Central", { numero: "123", data: "2026-11-10" });
    expect(publicado.sucesso && publicado.processo.status).toBe("APROVADO");
  });

  it("o processo em andamento mantém os níveis do início, mesmo se o fluxo mudar depois", () => {
    const processo = iniciarProcesso(art17, "x")!;
    const desligado: ConfiguracaoFluxo = { ...art17, niveis: art17.niveis.map((n) => ({ ...n, ativo: false })) };
    expect(fluxoExigeAprovacao(desligado)).toBe(false);
    expect(perfilPodeDecidir(processo, "DRE / RH Central")).toBe(true);
  });
});

describe("fluxoAprovacao — validação de configuração", () => {
  it("rejeita aprovação ligada sem nível ativo", () => {
    expect(validarConfiguracaoFluxo({ ...art17, niveis: [] })).toMatch(/ao menos um nível ativo/);
    expect(validarConfiguracaoFluxo(art17)).toBeNull();
  });
});
