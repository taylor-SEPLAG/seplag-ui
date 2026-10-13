import { Link } from "react-router-dom";
import { useState } from "react";
import { BotaoIconSeplag } from "../../componentes/Botao";
import { ModalSeplag } from "../../componentes/Modal";
import "../cadastro/cadastroGeral.css";

const DESLIGAMENTO_BASE_PATH = "/prototipos/sigep/desligamento-vinculo";

export function TerminoPrazoContent() {
  const [informacoesAbertas, setInformacoesAbertas] = useState(false);

  return (
    <main className="prototype-cadastro-geral">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <div>
          <h1>Término do prazo</h1>
          <p>Registre o encerramento natural do vínculo temporário ao fim da vigência contratual.</p>
        </div>
        <BotaoIconSeplag
          type="button"
          icon="pi pi-info-circle"
          tooltip="Informações legais sobre término do prazo"
          aria-label="Abrir informações legais sobre término do prazo"
          onClick={() => setInformacoesAbertas(true)}
        />
      </header>

      <section aria-label="Retorno">
        <Link to={`${DESLIGAMENTO_BASE_PATH}/encerramento-contrato`}>Voltar para Encerramento contrato</Link>
      </section>

      <ModalSeplag
        visible={informacoesAbertas}
        titulo="Informações legais — Término do prazo"
        fechar={() => setInformacoesAbertas(false)}
        hideFooter
        tamanho="min(920px, calc(100vw - 32px))"
      >
        <div style={{ display: "grid", gap: "1rem", lineHeight: 1.5 }}>
          <p>
            Término do prazo é o encerramento natural do contrato temporário na data final da sua vigência.
            A Lei Complementar Estadual nº 600/2017 disciplina a contratação por tempo determinado e prevê essa
            forma de encerramento no art. 14.
          </p>

          <section>
            <h3>Quando utilizar</h3>
            <p>
              Utilize este motivo quando o contrato alcançou a sua data final e não existe prorrogação formal válida.
              Não se trata de rescisão por iniciativa do contratado ou da Administração: a vigência simplesmente chegou ao fim.
            </p>
          </section>

          <section>
            <h3>Prazo e prorrogação</h3>
            <p>
              Os prazos máximos variam conforme a hipótese legal que justificou a contratação temporária. A prorrogação
              depende dos limites legais, da permanência da necessidade temporária e de instrumento formal. Havendo termo
              aditivo vigente, o encerramento deve considerar a nova data final — e não a data original do contrato.
            </p>
          </section>

          <section>
            <h3>Procedimento e efeitos</h3>
            <p>
              Os modelos oficiais consultados preveem que o término pelo fim do prazo contratual ocorre sem direito a
              indenização e dispensa comunicação prévia das partes. As condições aplicáveis devem ser confirmadas no
              contrato, edital e eventuais termos aditivos específicos do vínculo.
            </p>
          </section>

          <section>
            <h3>Informações para o registro</h3>
            <ul>
              <li>contrato temporário de origem;</li>
              <li>data final originalmente pactuada;</li>
              <li>último termo aditivo, quando houver;</li>
              <li>data efetiva de encerramento;</li>
              <li>confirmação de inexistência de prorrogação vigente.</li>
            </ul>
          </section>

          <p style={{ fontSize: "0.875rem" }}>
            Fontes: <a href="https://app1.sefaz.mt.gov.br/Sistema/legislacao/LeiComplEstadual.nsf/250a3b130089c1cc042572ed0051d0a1/97c9b60fe2226c64842581fc005698e3?OpenDocument=" target="_blank" rel="noreferrer">LC Estadual nº 600/2017</a>,{" "}
            <a href="https://iomat.mt.gov.br/legislacao/diario_oficial/detalhes/2591" target="_blank" rel="noreferrer">modelo oficial de contrato temporário</a>{" "}
            e <a href="https://www.iomat.mt.gov.br/portal/edicoes/download/18349" target="_blank" rel="noreferrer">edital/modelo oficial de 2025</a>.
          </p>
        </div>
      </ModalSeplag>
    </main>
  );
}
