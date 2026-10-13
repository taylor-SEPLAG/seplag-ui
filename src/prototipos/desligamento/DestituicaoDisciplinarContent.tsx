import { Link } from "react-router-dom";
import { useState } from "react";
import { BotaoIconSeplag } from "../../componentes/Botao";
import { ModalSeplag } from "../../componentes/Modal";
import "../cadastro/cadastroGeral.css";

const EXONERACAO_DESTITUICAO_PATH = "/prototipos/sigep/desligamento-vinculo/exoneracao-destituicao";

export function DestituicaoDisciplinarContent() {
  const [informacoesAbertas, setInformacoesAbertas] = useState(false);

  return (
    <main className="prototype-cadastro-geral">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <div>
          <h1>Destituição disciplinar</h1>
          <p>Registre a penalidade disciplinar aplicável à pessoa exclusivamente comissionada.</p>
        </div>
        <BotaoIconSeplag
          type="button"
          icon="pi pi-info-circle"
          tooltip="Informações legais sobre destituição disciplinar"
          aria-label="Abrir informações legais sobre destituição disciplinar"
          onClick={() => setInformacoesAbertas(true)}
        />
      </header>

      <section aria-label="Retorno">
        <Link to={EXONERACAO_DESTITUICAO_PATH}>Voltar para Exoneração/destituição</Link>
      </section>

      <ModalSeplag
        visible={informacoesAbertas}
        titulo="Informações legais — Destituição disciplinar"
        fechar={() => setInformacoesAbertas(false)}
        hideFooter
        tamanho="min(920px, calc(100vw - 32px))"
      >
        <div style={{ display: "grid", gap: "1rem", lineHeight: 1.5 }}>
          <p>
            Destituição de cargo em comissão é penalidade disciplinar. Ela se aplica à pessoa que exerce cargo em
            comissão sem ser titular de cargo efetivo, quando a infração estiver sujeita a suspensão ou demissão. Não
            se confunde com exoneração a pedido, livre exoneração ou exoneração por ausências.
          </p>

          <section>
            <h3>Quando utilizar</h3>
            <p>
              Utilize este fluxo somente quando houver possível infração disciplinar atribuída a ocupante
              exclusivamente comissionado. A destituição exige processo administrativo disciplinar e não pode ser
              aplicada como simples ato administrativo de desligamento.
            </p>
          </section>

          <section>
            <h3>Procedimento disciplinar</h3>
            <p>
              Quando a infração puder resultar em destituição, a instauração de processo disciplinar é obrigatória.
              O processo possui as fases de instauração, inquérito administrativo — com instrução, defesa e relatório
              — e julgamento. A comissão processante é composta por três servidores estáveis, e o acusado tem direito
              ao contraditório e à ampla defesa.
            </p>
          </section>

          <section>
            <h3>Prazos e competência</h3>
            <p>
              O prazo de conclusão do processo disciplinar é de até 60 dias, prorrogável por igual período quando as
              circunstâncias exigirem. No Poder Executivo, após o relatório final, há parecer de legalidade da
              Corregedoria-Geral; a decisão é proferida no prazo legal pela autoridade competente. A ação disciplinar
              para infrações puníveis com destituição prescreve em cinco anos.
            </p>
          </section>

          <section>
            <h3>Infrações e efeitos possíveis</h3>
            <p>
              A LC nº 04/1990 lista hipóteses de demissão que podem fundamentar a destituição no caso aplicável, como
              crime contra a Administração, improbidade, insubordinação grave, aplicação irregular de dinheiro público,
              lesão aos cofres públicos e corrupção. Conforme o enquadramento legal, podem existir efeitos adicionais,
              como ressarcimento ao erário, indisponibilidade de bens ou impedimento temporário para nova investidura
              em cargo público estadual. Esses efeitos não são automáticos: dependem da hipótese legal apurada e da
              decisão no processo.
            </p>
          </section>

          <section>
            <h3>Revisão e cuidado operacional</h3>
            <p>
              A decisão disciplinar admite revisão nas hipóteses legais. Se a revisão da destituição for procedente,
              a penalidade é convertida em exoneração. A definição de alçada deve ser parametrizável: a LC nº 04/1990
              contém regras de competência que precisam ser validadas pela Corregedoria e pela área jurídica antes de
              automatizar a decisão no sistema.
            </p>
          </section>

          <section>
            <h3>Informações para o registro</h3>
            <ul>
              <li>vínculo exclusivamente comissionado e cargo ocupado;</li>
              <li>protocolo, ato de instauração e enquadramento disciplinar provisório;</li>
              <li>comissão processante, etapas de defesa e relatório final;</li>
              <li>parecer de legalidade, decisão e autoridade julgadora;</li>
              <li>penalidade aplicada, publicação e eventuais efeitos acessórios.</li>
            </ul>
          </section>

          <p style={{ fontSize: "0.875rem" }}>
            Fonte: <a href="https://app1.sefaz.mt.gov.br/0425762e005567C5/250A3B130089C1CC042572ED0051D0A1/F30BBDEE7F310A2E042567BD006CE603" target="_blank" rel="noreferrer">LC Estadual nº 04/1990</a>, especialmente os arts. 154, 159, 162 a 164, 169 e 173 a 209.
          </p>
        </div>
      </ModalSeplag>
    </main>
  );
}
