import { Link } from "react-router-dom";
import { useState } from "react";
import { BotaoIconSeplag } from "../../componentes/Botao";
import { ModalSeplag } from "../../componentes/Modal";
import "../cadastro/cadastroGeral.css";

const EXONERACAO_DESTITUICAO_PATH = "/prototipos/sigep/desligamento-vinculo/exoneracao-destituicao";

export function ExoneracaoPedidoContent() {
  const [informacoesAbertas, setInformacoesAbertas] = useState(false);

  return (
    <main className="prototype-cadastro-geral">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <div>
          <h1>Exoneração a pedido</h1>
          <p>Registre o desligamento voluntário da pessoa ocupante de cargo em comissão.</p>
        </div>
        <BotaoIconSeplag
          type="button"
          icon="pi pi-info-circle"
          tooltip="Informações legais sobre exoneração a pedido"
          aria-label="Abrir informações legais sobre exoneração a pedido"
          onClick={() => setInformacoesAbertas(true)}
        />
      </header>

      <section aria-label="Retorno">
        <Link to={EXONERACAO_DESTITUICAO_PATH}>Voltar para Exoneração/destituição</Link>
      </section>

      <ModalSeplag
        visible={informacoesAbertas}
        titulo="Informações legais — Exoneração a pedido"
        fechar={() => setInformacoesAbertas(false)}
        hideFooter
        tamanho="min(920px, calc(100vw - 32px))"
      >
        <div style={{ display: "grid", gap: "1rem", lineHeight: 1.5 }}>
          <p>
            Exoneração a pedido é o desligamento voluntário de cargo em comissão. É hipótese de vacância e não
            constitui penalidade disciplinar. A Lei Complementar Estadual nº 04/1990 prevê expressamente a
            exoneração de cargo em comissão a pedido do próprio servidor.
          </p>

          <section>
            <h3>Quando utilizar</h3>
            <p>
              Utilize este motivo quando a pessoa ocupante de cargo em comissão solicitar formalmente o seu
              desligamento. O cargo em comissão tem provimento temporário e é de livre nomeação e exoneração.
              Não confunda este fluxo com destituição disciplinar, nem com a dispensa de função de confiança.
            </p>
          </section>

          <section>
            <h3>Qual vínculo é encerrado</h3>
            <p>
              O pedido deve identificar o vínculo de origem. Para pessoa exclusivamente comissionada, a exoneração
              pode encerrar o vínculo funcional. Quando a pessoa é titular de cargo efetivo e ocupa também cargo em
              comissão, o registro deve atingir somente o cargo em comissão, sem encerrar automaticamente o vínculo
              efetivo.
            </p>
          </section>

          <section>
            <h3>Protocolo, registro e publicação</h3>
            <p>
              O pedido deve ser devidamente protocolado no SIGADOC. No Poder Executivo estadual, a exoneração a
              pedido é registrada no SEAP e publicada no Diário Oficial a partir da data da solicitação protocolada;
              ela não segue a janela ordinária de registro entre os dias 1 e 12. A IN nº 003/2025/SEPLAG determina
              ainda o registro no sistema corporativo em até cinco dias do protocolo, com a data de desligamento
              informada no requerimento, independentemente da publicação no Diário Oficial.
            </p>
          </section>

          <section>
            <h3>Restrição disciplinar</h3>
            <p>
              A exoneração a pedido não deve ser usada para encerrar ou evitar apuração disciplinar. Conforme o
              art. 199 da LC nº 04/1990, quem responde a processo disciplinar somente pode ser exonerado a pedido
              após a conclusão do processo e o cumprimento da penalidade eventualmente aplicada. Para ocupante
              exclusivamente comissionado, a infração disciplinar cabível deve seguir o fluxo próprio de destituição.
            </p>
          </section>

          <section>
            <h3>Folha e informações para o registro</h3>
            <p>
              Para vínculo exclusivamente comissionado, a folha de desligamento observa a remuneração-base do mês,
              verbas rescisórias eventualmente devidas, diferenças e descontos ou devoluções aplicáveis. Registre o
              vínculo de origem, requerimento e protocolo SIGADOC, data solicitada, situação disciplinar, dados do
              ato, SEAP e publicação no Diário Oficial. As rubricas efetivamente devidas dependem do caso concreto e
              das normas aplicáveis.
            </p>
          </section>

          <p style={{ fontSize: "0.875rem" }}>
            Fontes: <a href="https://app1.sefaz.mt.gov.br/0425762e005567C5/250A3B130089C1CC042572ED0051D0A1/F30BBDEE7F310A2E042567BD006CE603" target="_blank" rel="noreferrer">LC Estadual nº 04/1990</a>,{" "}
            <a href="https://app1.sefaz.mt.gov.br/sistema/legislacao/leicomplestadual.nsf/250a3b130089c1cc042572ed0051d0a1/d796b7eb31f912bb04257264005c41e0?OpenDocument=" target="_blank" rel="noreferrer">LC Estadual nº 266/2006</a>,{" "}
            <a href="https://app1.sefaz.mt.gov.br/sistema/legislacao/legislacaotribut.nsf/2b2e6c5ed54869788425671300480214/ef423dc1da9722d704258965006364f3" target="_blank" rel="noreferrer">Decreto nº 141/2023</a>{" "}
            e <a href="https://app1.sefaz.mt.gov.br/Sistema/Legislacao/legislacaotribut.nsf/173e6c0d2202fdcb03258b1700659f1e/7d107ee69565c34d03258c4d0051f35c" target="_blank" rel="noreferrer">IN nº 003/2025/SEPLAG</a>.
          </p>
        </div>
      </ModalSeplag>
    </main>
  );
}
