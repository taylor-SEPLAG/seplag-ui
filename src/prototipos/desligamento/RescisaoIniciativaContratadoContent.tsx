import { Link } from "react-router-dom";
import { useState } from "react";
import { BotaoIconSeplag } from "../../componentes/Botao";
import { ModalSeplag } from "../../componentes/Modal";
import "../cadastro/cadastroGeral.css";

const ENCERRAMENTO_CONTRATO_PATH = "/prototipos/sigep/desligamento-vinculo/encerramento-contrato";

export function RescisaoIniciativaContratadoContent() {
  const [informacoesAbertas, setInformacoesAbertas] = useState(false);

  return (
    <main className="prototype-cadastro-geral">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <div>
          <h1>Rescisão por iniciativa do contratado</h1>
          <p>Registre o encerramento antecipado solicitado pela pessoa contratada temporariamente.</p>
        </div>
        <BotaoIconSeplag
          type="button"
          icon="pi pi-info-circle"
          tooltip="Informações legais sobre rescisão por iniciativa do contratado"
          aria-label="Abrir informações legais sobre rescisão por iniciativa do contratado"
          onClick={() => setInformacoesAbertas(true)}
        />
      </header>

      <section aria-label="Retorno">
        <Link to={ENCERRAMENTO_CONTRATO_PATH}>Voltar para Encerramento contrato</Link>
      </section>

      <ModalSeplag
        visible={informacoesAbertas}
        titulo="Informações legais — Rescisão por iniciativa do contratado"
        fechar={() => setInformacoesAbertas(false)}
        hideFooter
        tamanho="min(920px, calc(100vw - 32px))"
      >
        <div style={{ display: "grid", gap: "1rem", lineHeight: 1.5 }}>
          <p>
            É o encerramento antecipado do contrato temporário solicitado pela própria pessoa contratada, antes do
            fim da vigência. A Lei Complementar Estadual nº 600/2017 prevê essa hipótese no art. 14. Não se trata
            de vacância de cargo público nem de exoneração.
          </p>

          <section>
            <h3>Comunicação e efeitos</h3>
            <p>
              Nos modelos oficiais de contrato consultados, o pedido deve ser apresentado por escrito com antecedência
              mínima de 30 dias e a rescisão ocorre sem indenização. A condição aplicável deve ser confirmada no
              contrato, edital e eventuais termos aditivos do vínculo específico.
            </p>
          </section>

          <section>
            <h3>Formalização administrativa</h3>
            <p>
              O pedido deve ser protocolado no SIGADOC. Para distratos solicitados pela pessoa contratada, o Decreto
              nº 141/2023 disciplina o registro no sistema de gestão de pessoas e a publicação no Diário Oficial. A
              IN nº 003/2025/SEPLAG prevê o registro do desligamento a pedido no sistema oficial em até cinco dias do
              protocolo, com a data de afastamento indicada no requerimento.
            </p>
          </section>

          <section>
            <h3>Informações para o registro</h3>
            <ul>
              <li>contrato temporário e órgão de origem;</li>
              <li>número e data de protocolo do pedido;</li>
              <li>data solicitada para desligamento e último dia efetivamente trabalhado;</li>
              <li>aviso de 30 dias ou a justificativa/documentação aplicável;</li>
              <li>dados do registro administrativo e da publicação, quando cabível.</li>
            </ul>
          </section>

          <p style={{ fontSize: "0.875rem" }}>
            Fontes: <a href="https://app1.sefaz.mt.gov.br/Sistema/legislacao/LeiComplEstadual.nsf/250a3b130089c1cc042572ed0051d0a1/97c9b60fe2226c64842581fc005698e3?OpenDocument=" target="_blank" rel="noreferrer">LC Estadual nº 600/2017</a>,{" "}
            <a href="https://app1.sefaz.mt.gov.br/sistema/legislacao/legislacaotribut.nsf/2b2e6c5ed54869788425671300480214/ef423dc1da9722d704258965006364f3" target="_blank" rel="noreferrer">Decreto nº 141/2023</a>,{" "}
            <a href="https://app1.sefaz.mt.gov.br/Sistema/Legislacao/legislacaotribut.nsf/173e6c0d2202fdcb03258b1700659f1e/7d107ee69565c34d03258c4d0051f35c" target="_blank" rel="noreferrer">IN nº 003/2025/SEPLAG</a>{" "}
            e <a href="https://iomat.mt.gov.br/legislacao/diario_oficial/detalhes/2591" target="_blank" rel="noreferrer">modelo oficial de contrato temporário</a>.
          </p>
        </div>
      </ModalSeplag>
    </main>
  );
}
