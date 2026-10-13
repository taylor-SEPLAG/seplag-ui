import { Link } from "react-router-dom";
import { useState } from "react";
import { BotaoIconSeplag } from "../../componentes/Botao";
import { ModalSeplag } from "../../componentes/Modal";
import "../cadastro/cadastroGeral.css";

const ENCERRAMENTO_CONTRATO_PATH = "/prototipos/sigep/desligamento-vinculo/encerramento-contrato";

export function DemissaoDisciplinarContent() {
  const [informacoesAbertas, setInformacoesAbertas] = useState(false);

  return (
    <main className="prototype-cadastro-geral">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <div>
          <h1>Demissão disciplinar</h1>
          <p>Registre a penalidade disciplinar aplicável ao vínculo temporário, após o procedimento legal.</p>
        </div>
        <BotaoIconSeplag
          type="button"
          icon="pi pi-info-circle"
          tooltip="Informações legais sobre demissão disciplinar"
          aria-label="Abrir informações legais sobre demissão disciplinar"
          onClick={() => setInformacoesAbertas(true)}
        />
      </header>

      <section aria-label="Retorno">
        <Link to={ENCERRAMENTO_CONTRATO_PATH}>Voltar para Encerramento contrato</Link>
      </section>

      <ModalSeplag
        visible={informacoesAbertas}
        titulo="Informações legais — Demissão disciplinar"
        fechar={() => setInformacoesAbertas(false)}
        hideFooter
        tamanho="min(920px, calc(100vw - 32px))"
      >
        <div style={{ display: "grid", gap: "1rem", lineHeight: 1.5 }}>
          <p>
            A demissão disciplinar é uma penalidade aplicável ao contratado temporário; não é uma rescisão por
            conveniência da Administração. A Lei Complementar Estadual nº 845/2026 incluiu a demissão como hipótese
            expressa de extinção do contrato temporário e sujeitou o contratado aos deveres e proibições funcionais
            previstos na Lei Complementar nº 04/1990.
          </p>

          <section>
            <h3>Quando pode ser aplicada</h3>
            <p>
              A demissão alcança as hipóteses do art. 159 da LC nº 04/1990, entre elas crime contra a Administração,
              abandono, inassiduidade habitual, improbidade, insubordinação grave, ofensa física em serviço,
              corrupção, acumulação ilegal apurada e transgressões graves previstas em lei. Também ocorre quando o
              temporário, advertido nos últimos 12 meses, pratica outra falta passível de advertência.
            </p>
          </section>

          <section>
            <h3>Rito obrigatório</h3>
            <p>
              A apuração inicia-se por investigação preliminar sumária, que é preparatória e não pode aplicar sanção.
              Havendo elementos, poderá resultar em sindicância de servidor temporário. A sindicância é conduzida por
              comissão de dois servidores estáveis, com ato instaurador publicado, citação, instrução e relatório final.
            </p>
          </section>

          <section>
            <h3>Garantias e decisão</h3>
            <p>
              São assegurados contraditório e ampla defesa: acompanhamento por procurador, apresentação de provas e
              contraprovas e indicação de testemunhas. No Poder Executivo, o relatório passa por parecer de legalidade
              da Corregedoria-Geral antes do julgamento. A sindicância tem prazo de 30 dias, prorrogável por igual período,
              e cabe recurso em 30 dias da publicação ou ciência da penalidade.
            </p>
          </section>

          <section>
            <h3>Efeitos da penalidade</h3>
            <p>
              Observado o devido processo legal, a demissão pode ser aplicada mesmo se o contrato já tiver terminado.
              Ela extingue o vínculo vigente e impede novo vínculo contratual, trabalhista ou estatutário com o Poder
              Executivo de Mato Grosso por cinco anos, sem afastar o dever de reparar eventual dano ao erário. A ação
              disciplinar para infração punível com demissão prescreve em cinco anos.
            </p>
          </section>

          <section>
            <h3>Registro administrativo</h3>
            <p>
              O Decreto nº 141/2023 e a IN nº 003/2025/SEPLAG usam a categoria operacional “distrato” para contratos
              temporários, sem prever evento separado denominado “demissão disciplinar”. O enquadramento do registro
              como distrato por iniciativa da Administração é uma inferência operacional e deve ser validado pela área
              jurídica e de gestão de pessoas antes da automatização.
            </p>
          </section>

          <section>
            <h3>Informações para o registro</h3>
            <ul>
              <li>processo e sindicância de origem;</li>
              <li>fatos apurados e enquadramento legal;</li>
              <li>atos de citação, defesa, provas e relatório conclusivo;</li>
              <li>parecer de legalidade, decisão e eventual recurso;</li>
              <li>data de efeitos, registro/publicação e término do impedimento de cinco anos.</li>
            </ul>
          </section>

          <p style={{ fontSize: "0.875rem" }}>
            Fontes: <a href="https://app1.sefaz.mt.gov.br/Sistema/legislacao/LeiComplEstadual.nsf/9733a1d3f5bb1ab384256710004d4754/3c09c8c980124c8903258e12005e079a?OpenDocument" target="_blank" rel="noreferrer">LC Estadual nº 845/2026</a>,{" "}
            <a href="https://app1.sefaz.mt.gov.br/0425762e005567c5/250a3b130089c1cc042572ed0051d0a1/f30bbdee7f310a2e042567bd006ce603" target="_blank" rel="noreferrer">LC Estadual nº 04/1990 consolidada</a>,{" "}
            <a href="https://app1.sefaz.mt.gov.br/sistema/legislacao/legislacaotribut.nsf/2b2e6c5ed54869788425671300480214/ef423dc1da9722d704258965006364f3" target="_blank" rel="noreferrer">Decreto nº 141/2023</a>{" "}
            e <a href="https://app1.sefaz.mt.gov.br/Sistema/Legislacao/legislacaotribut.nsf/173e6c0d2202fdcb03258b1700659f1e/7d107ee69565c34d03258c4d0051f35c" target="_blank" rel="noreferrer">IN nº 003/2025/SEPLAG</a>.
          </p>
        </div>
      </ModalSeplag>
    </main>
  );
}
