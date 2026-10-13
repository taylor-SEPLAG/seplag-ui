import { Link } from "react-router-dom";
import { useState } from "react";
import { BotaoIconSeplag } from "../../componentes/Botao";
import { ModalSeplag } from "../../componentes/Modal";
import "../cadastro/cadastroGeral.css";

const ENCERRAMENTO_CONTRATO_PATH = "/prototipos/sigep/desligamento-vinculo/encerramento-contrato";

export function RescisaoIniciativaAdministracaoContent() {
  const [informacoesAbertas, setInformacoesAbertas] = useState(false);

  return (
    <main className="prototype-cadastro-geral">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <div>
          <h1>Rescisão por iniciativa da Administração</h1>
          <p>Registre o encerramento antecipado do contrato temporário decidido pela Administração Pública.</p>
        </div>
        <BotaoIconSeplag
          type="button"
          icon="pi pi-info-circle"
          tooltip="Informações legais sobre rescisão por iniciativa da Administração"
          aria-label="Abrir informações legais sobre rescisão por iniciativa da Administração"
          onClick={() => setInformacoesAbertas(true)}
        />
      </header>

      <section aria-label="Retorno">
        <Link to={ENCERRAMENTO_CONTRATO_PATH}>Voltar para Encerramento contrato</Link>
      </section>

      <ModalSeplag
        visible={informacoesAbertas}
        titulo="Informações legais — Rescisão por iniciativa da Administração"
        fechar={() => setInformacoesAbertas(false)}
        hideFooter
        tamanho="min(920px, calc(100vw - 32px))"
      >
        <div style={{ display: "grid", gap: "1rem", lineHeight: 1.5 }}>
          <p>
            É o encerramento antecipado do contrato temporário decidido pela Administração. A Lei Complementar
            Estadual nº 600/2017 prevê essa hipótese de extinção no art. 14. Não corresponde a vacância de cargo
            público nem a exoneração.
          </p>

          <section>
            <h3>Motivação e limites</h3>
            <p>
              A decisão deve ser formalizada e motivada no processo administrativo. Modelos oficiais de contrato e
              editais consultados admitem a rescisão quando a contratação deixa de atender à necessidade do órgão ou
              ao interesse do objeto contratado. A justificativa concreta e as condições do contrato específico devem
              integrar o processo.
            </p>
          </section>

          <section>
            <h3>Comunicação e procedimento</h3>
            <p>
              Modelos oficiais consultados preveem comunicação ao contratado com antecedência mínima de 30 dias e
              encerramento sem indenização. Essa antecedência é cláusula de modelo contratual, devendo ser confirmada
              no instrumento, edital e eventuais termos aditivos aplicáveis ao vínculo.
            </p>
          </section>

          <section>
            <h3>Hipótese disciplinar</h3>
            <p>
              Quando o fundamento for infração disciplinar, deve ser utilizado o fluxo de demissão disciplinar. Os
              modelos oficiais preveem apuração com contraditório e ampla defesa; esta modalidade não deve ser usada
              para substituir o procedimento disciplinar cabível.
            </p>
          </section>

          <section>
            <h3>Registro e publicação</h3>
            <p>
              O Decreto nº 141/2023 determina o registro do distrato de contratos temporários no SEAP e sua
              publicação no Diário Oficial. Para a iniciativa da Administração, o registro ocorre no mês corrente,
              observando o ciclo de 1º a 15 de cada mês; a IN nº 003/2025/SEPLAG repete essa orientação para a folha
              de rescisão. O prazo de cinco dias previsto na IN é exclusivo para distrato a pedido, não para esta hipótese.
            </p>
          </section>

          <section>
            <h3>Informações para o registro</h3>
            <ul>
              <li>contrato temporário, órgão e pessoa contratada;</li>
              <li>fundamento e motivação da decisão;</li>
              <li>número do processo administrativo e autoridade responsável;</li>
              <li>comunicação ao contratado e data de ciência;</li>
              <li>data efetiva do desligamento, registro no SEAP e dados de publicação.</li>
            </ul>
          </section>

          <p style={{ fontSize: "0.875rem" }}>
            Fontes: <a href="https://app1.sefaz.mt.gov.br/Sistema/legislacao/LeiComplEstadual.nsf/250a3b130089c1cc042572ed0051d0a1/97c9b60fe2226c64842581fc005698e3?OpenDocument=" target="_blank" rel="noreferrer">LC Estadual nº 600/2017</a>,{" "}
            <a href="https://app1.sefaz.mt.gov.br/sistema/legislacao/legislacaotribut.nsf/2b2e6c5ed54869788425671300480214/ef423dc1da9722d704258965006364f3" target="_blank" rel="noreferrer">Decreto nº 141/2023</a>,{" "}
            <a href="https://app1.sefaz.mt.gov.br/Sistema/Legislacao/legislacaotribut.nsf/173e6c0d2202fdcb03258b1700659f1e/7d107ee69565c34d03258c4d0051f35c" target="_blank" rel="noreferrer">IN nº 003/2025/SEPLAG</a>,{" "}
            <a href="https://iomat.mt.gov.br/legislacao/diario_oficial/detalhes/2591" target="_blank" rel="noreferrer">modelo oficial de contrato temporário</a>{" "}
            e <a href="https://www.iomat.mt.gov.br/portal/edicoes/download/16562" target="_blank" rel="noreferrer">edital oficial com detalhamento</a>.
          </p>
        </div>
      </ModalSeplag>
    </main>
  );
}
