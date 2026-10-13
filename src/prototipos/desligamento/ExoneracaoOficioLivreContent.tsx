import { Link } from "react-router-dom";
import { useState } from "react";
import { BotaoIconSeplag } from "../../componentes/Botao";
import { ModalSeplag } from "../../componentes/Modal";
import "../cadastro/cadastroGeral.css";

const EXONERACAO_DESTITUICAO_PATH = "/prototipos/sigep/desligamento-vinculo/exoneracao-destituicao";

export function ExoneracaoOficioLivreContent() {
  const [informacoesAbertas, setInformacoesAbertas] = useState(false);

  return (
    <main className="prototype-cadastro-geral">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <div>
          <h1>Livre exoneração</h1>
          <p>Registre a exoneração de cargo em comissão decidida pela autoridade competente.</p>
        </div>
        <BotaoIconSeplag
          type="button"
          icon="pi pi-info-circle"
          tooltip="Informações legais sobre livre exoneração"
          aria-label="Abrir informações legais sobre livre exoneração"
          onClick={() => setInformacoesAbertas(true)}
        />
      </header>

      <section aria-label="Retorno">
        <Link to={EXONERACAO_DESTITUICAO_PATH}>Voltar para Exoneração/destituição</Link>
      </section>

      <ModalSeplag
        visible={informacoesAbertas}
        titulo="Informações legais — Livre exoneração"
        fechar={() => setInformacoesAbertas(false)}
        hideFooter
        tamanho="min(920px, calc(100vw - 32px))"
      >
        <div style={{ display: "grid", gap: "1rem", lineHeight: 1.5 }}>
          <p>
            A livre exoneração é a saída do cargo em comissão por decisão da autoridade competente. A LC Estadual nº
            04/1990 usa a expressão “a juízo da autoridade competente”, e a LC nº 266/2006 define o cargo em
            comissão como de livre nomeação e exoneração, provido temporariamente por ato governamental.
          </p>

          <section>
            <h3>Quando utilizar</h3>
            <p>
              Utilize este motivo quando a Administração decidir encerrar a ocupação do cargo em comissão, sem
              requerimento da pessoa ocupante e sem finalidade disciplinar. Esta medida não é destituição e não deve
              ser usada como substituta de procedimento disciplinar.
            </p>
          </section>

          <section>
            <h3>Livre exoneração e exoneração de ofício não são sinônimos</h3>
            <p>
              A livre exoneração decorre do art. 45, I, da LC nº 04/1990. Já a exoneração de ofício é utilizada em
              hipóteses objetivas previstas em norma, como a falta de apresentação ao trabalho em 15 dias sucessivos
              ou ausências injustificadas superiores a 15 dias nos casos legalmente definidos. Essas situações devem
              ser registradas no fluxo específico de não comparecimento ou ausências.
            </p>
          </section>

          <section>
            <h3>Registro, publicação e efeitos</h3>
            <p>
              No Poder Executivo estadual, o SEAP é a ferramenta oficial de registro e publicação. A USGP deve
              registrar a exoneração entre os dias 1 e 12 de cada mês, e os efeitos financeiros e funcionais seguem a
              data do registro constante do ato publicado no Diário Oficial. A IN nº 003/2025/SEPLAG também exige o
              registro no mês da exoneração por iniciativa da Administração. O prazo de cinco dias é exclusivo de
              exoneração a pedido e não se aplica a esta modalidade.
            </p>
          </section>

          <section>
            <h3>Efeitos conforme o vínculo</h3>
            <p>
              Para pessoa exclusivamente comissionada, a exoneração pode encerrar o vínculo e gerar folha de
              rescisão, com as parcelas previstas na legislação aplicável. A LC nº 266/2006 assegura, na exoneração,
              indenização proporcional de férias e gratificação natalina a que houver direito. Para titular de cargo
              efetivo que ocupa cargo em comissão, o registro deve encerrar somente a ocupação comissionada, sem
              desligar automaticamente o vínculo efetivo.
            </p>
          </section>

          <section>
            <h3>Casos que exigem atenção</h3>
            <p>
              Cargos em comissão ocupados por servidores do quadro de carreiras eleitos nos termos do art. 134 da
              Constituição Estadual têm regra própria: somente podem ser exonerados a pedido ou mediante processo
              administrativo que comprove atuação contra os interesses do Estado e da categoria. Se houver infração
              disciplinar, aplique o fluxo de destituição disciplinar, que exige processo próprio.
            </p>
          </section>

          <section>
            <h3>Informações para o registro</h3>
            <ul>
              <li>cargo em comissão, órgão e vínculo de origem;</li>
              <li>indicação se a pessoa é exclusivamente comissionada ou titular de cargo efetivo;</li>
              <li>decisão da autoridade competente, dados do ato e, quando houver, processo de suporte;</li>
              <li>data de registro no SEAP e dados da publicação no Diário Oficial;</li>
              <li>validação de que não se trata de ausência, não apresentação ou medida disciplinar.</li>
            </ul>
          </section>

          <p style={{ fontSize: "0.875rem" }}>
            Fontes: <a href="https://app1.sefaz.mt.gov.br/0425762e005567C5/250A3B130089C1CC042572ED0051D0A1/F30BBDEE7F310A2E042567BD006CE603" target="_blank" rel="noreferrer">LC Estadual nº 04/1990</a>,{" "}
            <a href="https://app1.sefaz.mt.gov.br/sistema/legislacao/leicomplestadual.nsf/250a3b130089c1cc042572ed0051d0a1/d796b7eb31f912bb04257264005c41e0?OpenDocument=" target="_blank" rel="noreferrer">LC Estadual nº 266/2006</a>,{" "}
            <a href="https://app1.sefaz.mt.gov.br/sistema/legislacao/legislacaotribut.nsf/2b2e6c5ed54869788425671300480214/ef423dc1da9722d704258965006364f3" target="_blank" rel="noreferrer">Decreto nº 141/2023</a>{" "}
            e <a href="https://app1.sefaz.mt.gov.br/Sistema/Legislacao/legislacaotribut.nsf/173e6c0d2202fdcb03258c4d0051f35c" target="_blank" rel="noreferrer">IN nº 003/2025/SEPLAG</a>.
          </p>
        </div>
      </ModalSeplag>
    </main>
  );
}
