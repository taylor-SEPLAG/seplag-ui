import { Link } from "react-router-dom";
import { useState } from "react";
import { BotaoIconSeplag } from "../../componentes/Botao";
import { ModalSeplag } from "../../componentes/Modal";
import "../cadastro/cadastroGeral.css";

const EXONERACAO_DESTITUICAO_PATH = "/prototipos/sigep/desligamento-vinculo/exoneracao-destituicao";

export function ExoneracaoNaoComparecimentoContent() {
  const [informacoesAbertas, setInformacoesAbertas] = useState(false);

  return (
    <main className="prototype-cadastro-geral">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <div>
          <h1>Exoneração por não comparecimento ou ausências</h1>
          <p>Registre a exoneração de ofício decorrente de não apresentação ou ausências injustificadas.</p>
        </div>
        <BotaoIconSeplag
          type="button"
          icon="pi pi-info-circle"
          tooltip="Informações legais sobre não comparecimento ou ausências"
          aria-label="Abrir informações legais sobre não comparecimento ou ausências"
          onClick={() => setInformacoesAbertas(true)}
        />
      </header>

      <section aria-label="Retorno">
        <Link to={EXONERACAO_DESTITUICAO_PATH}>Voltar para Exoneração/destituição</Link>
      </section>

      <ModalSeplag
        visible={informacoesAbertas}
        titulo="Informações legais — Não comparecimento ou ausências"
        fechar={() => setInformacoesAbertas(false)}
        hideFooter
        tamanho="min(920px, calc(100vw - 32px))"
      >
        <div style={{ display: "grid", gap: "1rem", lineHeight: 1.5 }}>
          <p>
            Este fluxo reúne duas hipóteses objetivas de exoneração de ofício previstas para cargos em comissão no
            Poder Executivo estadual: a não apresentação após a nomeação e as ausências injustificadas de pessoa
            exclusivamente comissionada. As hipóteses têm requisitos e alcance diferentes.
          </p>

          <section>
            <h3>Não apresentação após a nomeação</h3>
            <p>
              Quando a pessoa nomeada para cargo em comissão não se apresenta na data indicada no ato administrativo,
              a USGP deve registrar imediatamente a ausência no evento “ARC - Aguardando Regularização de Cargo” no
              SEAP e realizar o desconto dos dias de ausência. Se não houver apresentação ao trabalho em 15 dias
              sucessivos, contados da data do exercício, ocorre a exoneração de ofício. Para contrato temporário, a
              consequência é rescisão contratual, e não exoneração.
            </p>
          </section>

          <section>
            <h3>Ausências injustificadas no exercício</h3>
            <p>
              Esta hipótese é exclusiva da pessoa exclusivamente comissionada. A exoneração de ofício ocorre quando
              as ausências injustificadas forem superiores a 15 dias — ou seja, mais de 15 dias — contínuos ou
              intercalados no período máximo de 12 meses. Ausências legalmente justificadas e comprovadas não devem
              compor essa contagem.
            </p>
          </section>

          <section>
            <h3>Registro, descontos e publicação</h3>
            <p>
              O ARC é uma medida imediata e temporária para registrar a ausência e evitar pagamento indevido; ele não
              substitui o ato formal de exoneração. O SEAP é a ferramenta oficial para registro e publicação, e a
              USGP deve registrar a exoneração administrativa no mês corrente, observando a janela aplicável e o ato
              publicado no Diário Oficial. As faltas injustificadas acarretam o desconto remuneratório correspondente.
            </p>
          </section>

          <section>
            <h3>Alcance conforme o vínculo</h3>
            <p>
              A não apresentação alcança nomeação em cargo em comissão, função de confiança e contratação temporária,
              com efeitos próprios para cada vínculo. A regra de ausências superiores a 15 dias alcança apenas a pessoa
              exclusivamente comissionada. Para titular de cargo efetivo em comissão, o sistema deve tratar somente a
              ocupação comissionada, sem presumir desligamento do vínculo efetivo.
            </p>
          </section>

          <section>
            <h3>Não confundir</h3>
            <p>
              Não se trata de exoneração a pedido, livre exoneração ou destituição disciplinar. A destituição é uma
              penalidade disciplinar distinta e exige o procedimento próprio quando cabível. Também não se aplicam aqui
              as regras de exoneração de cargo efetivo por não entrar em exercício.
            </p>
          </section>

          <section>
            <h3>Informações para o registro</h3>
            <ul>
              <li>tipo de vínculo e cargo ou função de origem;</li>
              <li>data do exercício e registros de frequência ou de ausência;</li>
              <li>justificativas e documentos apresentados, quando houver;</li>
              <li>hipótese legal aplicável: não apresentação ou ausências injustificadas;</li>
              <li>registro ARC, descontos, ato, SEAP e publicação no Diário Oficial.</li>
            </ul>
          </section>

          <p style={{ fontSize: "0.875rem" }}>
            Fontes: <a href="https://app1.sefaz.mt.gov.br/sistema/legislacao/legislacaotribut.nsf/2b2e6c5ed54869788425671300480214/ef423dc1da9722d704258965006364f3" target="_blank" rel="noreferrer">Decreto nº 141/2023</a>,{" "}
            <a href="https://app1.sefaz.mt.gov.br/sistema/legislacao/leicomplestadual.nsf/250a3b130089c1cc042572ed0051d0a1/d796b7eb31f912bb04257264005c41e0?OpenDocument=" target="_blank" rel="noreferrer">LC Estadual nº 266/2006</a>,{" "}
            <a href="https://app1.sefaz.mt.gov.br/0425762e005567C5/250A3B130089C1CC042572ED0051D0A1/F30BBDEE7F310A2E042567BD006CE603" target="_blank" rel="noreferrer">LC Estadual nº 04/1990</a>{" "}
            e <a href="https://app1.sefaz.mt.gov.br/Sistema/Legislacao/legislacaotribut.nsf/173e6c0d2202fdcb03258c4d0051f35c" target="_blank" rel="noreferrer">IN nº 003/2025/SEPLAG</a>.
          </p>
        </div>
      </ModalSeplag>
    </main>
  );
}
