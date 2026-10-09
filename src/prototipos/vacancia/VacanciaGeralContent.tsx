import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BotaoIconSeplag } from "../../componentes/Botao";
import { ModalSeplag } from "../../componentes/Modal";
import "../cadastro/cadastroGeral.css";

const VACANCIA_BASE_PATH = "/prototipos/sigep/vacancia";

const modalidades = [
  { slug: "exoneracao", titulo: "Exoneração", descricao: "Registre a vacância por exoneração do cargo.", icone: "pi pi-user-minus" },
  { slug: "demissao", titulo: "Demissão", descricao: "Registre a vacância decorrente de demissão.", icone: "pi pi-times-circle" },
  { slug: "ascensao", titulo: "Ascensão", descricao: "Registre a vacância decorrente de ascensão.", icone: "pi pi-arrow-up" },
  { slug: "acesso", titulo: "Acesso", descricao: "Registre a vacância decorrente de acesso.", icone: "pi pi-arrow-right-arrow-left" },
  { slug: "transferencia", titulo: "Transferência", descricao: "Registre a vacância decorrente de transferência.", icone: "pi pi-send" },
  { slug: "readaptacao", titulo: "Readaptação", descricao: "Registre a vacância decorrente de readaptação.", icone: "pi pi-refresh" },
  { slug: "aposentadoria", titulo: "Aposentadoria", descricao: "Registre a vacância decorrente de aposentadoria.", icone: "pi pi-clock" },
  { slug: "posse-outro-cargo-inacumulavel", titulo: "Posse em outro cargo inacumulável", descricao: "Registre a vacância por posse em outro cargo inacumulável.", icone: "pi pi-briefcase" },
  { slug: "falecimento", titulo: "Falecimento", descricao: "Registre a vacância decorrente de falecimento.", icone: "pi pi-heart-fill" },
] as const;

export function VacanciaGeralContent() {
  const { modalidade } = useParams();
  const modalidadeSelecionada = modalidades.find((item) => item.slug === modalidade);
  const [informacoesExoneracaoAbertas, setInformacoesExoneracaoAbertas] = useState(false);
  const [informacoesDemissaoAbertas, setInformacoesDemissaoAbertas] = useState(false);
  const [informacoesAscensaoAbertas, setInformacoesAscensaoAbertas] = useState(false);
  const [informacoesAcessoAbertas, setInformacoesAcessoAbertas] = useState(false);
  const [informacoesTransferenciaAbertas, setInformacoesTransferenciaAbertas] = useState(false);
  const [informacoesReadaptacaoAbertas, setInformacoesReadaptacaoAbertas] = useState(false);
  const [informacoesAposentadoriaAbertas, setInformacoesAposentadoriaAbertas] = useState(false);
  const [informacoesPosseInacumulavelAbertas, setInformacoesPosseInacumulavelAbertas] = useState(false);
  const [informacoesFalecimentoAbertas, setInformacoesFalecimentoAbertas] = useState(false);

  if (modalidade && modalidadeSelecionada) {
    return (
      <main className="prototype-cadastro-geral">
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
          <div>
            <h1>{modalidadeSelecionada.titulo}</h1>
            <p>{modalidadeSelecionada.descricao}</p>
          </div>
          {["exoneracao", "demissao", "ascensao", "acesso", "transferencia", "readaptacao", "aposentadoria", "posse-outro-cargo-inacumulavel", "falecimento"].includes(modalidadeSelecionada.slug) ? (
            <BotaoIconSeplag
              type="button"
              icon="pi pi-info-circle"
              tooltip={`Informações legais sobre ${modalidadeSelecionada.titulo}`}
              aria-label={`Abrir informações legais sobre ${modalidadeSelecionada.titulo}`}
              onClick={() => {
                if (modalidadeSelecionada.slug === "exoneracao") setInformacoesExoneracaoAbertas(true);
                else if (modalidadeSelecionada.slug === "demissao") setInformacoesDemissaoAbertas(true);
                else if (modalidadeSelecionada.slug === "ascensao") setInformacoesAscensaoAbertas(true);
                else if (modalidadeSelecionada.slug === "acesso") setInformacoesAcessoAbertas(true);
                else if (modalidadeSelecionada.slug === "transferencia") setInformacoesTransferenciaAbertas(true);
                else if (modalidadeSelecionada.slug === "readaptacao") setInformacoesReadaptacaoAbertas(true);
                else if (modalidadeSelecionada.slug === "aposentadoria") setInformacoesAposentadoriaAbertas(true);
                else if (modalidadeSelecionada.slug === "posse-outro-cargo-inacumulavel") setInformacoesPosseInacumulavelAbertas(true);
                else setInformacoesFalecimentoAbertas(true);
              }}
            />
          ) : null}
        </header>
        <section aria-label={`Vacância por ${modalidadeSelecionada.titulo}`}>
          <Link to={VACANCIA_BASE_PATH}>
            <i className="pi pi-arrow-left" aria-hidden="true" />
            <h2>Voltar para Vacância</h2>
            <p>Selecione outra modalidade de vacância.</p>
            <span>Voltar <i className="pi pi-arrow-right" aria-hidden="true" /></span>
          </Link>
        </section>
        <ModalSeplag
          visible={informacoesExoneracaoAbertas}
          titulo="Informações legais — Exoneração"
          fechar={() => setInformacoesExoneracaoAbertas(false)}
          hideFooter
          tamanho="min(920px, calc(100vw - 32px))"
        >
          <div style={{ display: "grid", gap: "1rem", lineHeight: 1.5 }}>
            <p>
              A exoneração é uma forma de vacância do cargo público. Ela não é penalidade disciplinar: a penalidade é a demissão.
            </p>

            <section>
              <h3>Cargo efetivo</h3>
              <p>A Lei Complementar estadual nº 4/1990 prevê exoneração a pedido do servidor ou de ofício.</p>
              <p>A exoneração de ofício ocorre somente quando:</p>
              <ul>
                <li>não forem satisfeitas as condições do estágio probatório;</li>
                <li>prescrever a punibilidade para demissão por abandono de cargo;</li>
                <li>o servidor tomar posse e não entrar em exercício no prazo legal.</li>
              </ul>
            </section>

            <section>
              <h3>Cargo em comissão</h3>
              <p>Pode ocorrer a pedido do servidor ou a juízo da autoridade competente. Quando um servidor efetivo deixa apenas o cargo em comissão, seu vínculo efetivo permanece ativo.</p>
              <p>Os cargos em comissão são de livre nomeação e exoneração e destinam-se a direção, chefia e assessoramento.</p>
            </section>

            <section>
              <h3>Restrições e efeitos</h3>
              <ul>
                <li>Servidor que responde a processo disciplinar só pode ser exonerado a pedido após a conclusão do processo e o cumprimento da penalidade eventualmente aplicada.</li>
                <li>Na acumulação ilegal, a opção apresentada no prazo de defesa configura boa-fé e converte-se automaticamente em pedido de exoneração do outro cargo.</li>
                <li>Após afastamento para estudo ou missão oficial, a exoneração antes de período equivalente exige ressarcimento da despesa pública.</li>
                <li>O servidor exonerado recebe gratificação natalina proporcional ao período de efetivo exercício.</li>
              </ul>
            </section>

            <section>
              <h3>Procedimento administrativo</h3>
              <p>Na exoneração a pedido, a orientação da SEPLAG prevê requerimento protocolado com a data de desligamento, documento de identificação e declaração de nada consta de processo administrativo disciplinar.</p>
              <p>Para cargos em comissão, funções de confiança e temporários do Executivo estadual, o registro é feito no SEAP e publicado no Diário Oficial; pedido de exoneração é exceção ao calendário mensal e parte da solicitação protocolada no SIGADOC.</p>
            </section>

            <section>
              <h3>Fontes consultadas</h3>
              <ul>
                <li><a href="https://app1.sefaz.mt.gov.br/0425762E005567C5/250A3B130089C1CC042572ED0051D0A1/F30BBDEE7F310A2E042567BD006CE603" target="_blank" rel="noreferrer">Lei Complementar nº 4/1990 — texto consolidado</a></li>
                <li><a href="https://iomat.mt.gov.br/legislacao/diario_oficial/download/38066" target="_blank" rel="noreferrer">Decreto nº 141/2023</a></li>
                <li><a href="https://seplag.mt.gov.br/images/gestao-de-pessoas/arquivos/PERGUNTAS_E_RESPOSTAS_POLITICAS_GESTAO_DE_PESSOAS.pdf" target="_blank" rel="noreferrer">Orientação de Gestão de Pessoas da SEPLAG</a></li>
              </ul>
              <small>O conteúdo é informativo. Somente os atos publicados no Diário Oficial produzem efeitos legais.</small>
            </section>
          </div>
        </ModalSeplag>
        <ModalSeplag
          visible={informacoesDemissaoAbertas}
          titulo="Informações legais — Demissão"
          fechar={() => setInformacoesDemissaoAbertas(false)}
          hideFooter
          tamanho="min(920px, calc(100vw - 32px))"
        >
          <div style={{ display: "grid", gap: "1rem", lineHeight: 1.5 }}>
            <p>
              A demissão é penalidade disciplinar que gera vacância do cargo. Não se confunde com exoneração, que não possui natureza punitiva.
            </p>

            <section>
              <h3>Hipóteses legais</h3>
              <p>A Lei Complementar estadual nº 4/1990 prevê demissão, entre outros casos, por crime contra a administração pública, abandono de cargo, inassiduidade habitual, improbidade administrativa, insubordinação grave, ofensa física em serviço, aplicação irregular de dinheiro público, revelação de segredo, lesão ao erário, corrupção e acumulação ilegal comprovada em processo disciplinar.</p>
              <p>Também se aplica nas transgressões graves do art. 144, incluindo proveito indevido do cargo, propina, assédio sexual ou moral, fraude em licitação ou contrato, uso de documento falso e participação em organização criminosa.</p>
            </section>

            <section>
              <h3>Abandono e inassiduidade</h3>
              <ul>
                <li>Abandono de cargo: ausência intencional por mais de 30 dias consecutivos.</li>
                <li>Inassiduidade habitual: 60 dias de faltas injustificadas, interpoladas em 12 meses.</li>
                <li>Ambas as situações seguem rito sumário, com identificação detalhada das ausências; no abandono, a comissão deve se manifestar sobre a intencionalidade.</li>
              </ul>
            </section>

            <section>
              <h3>Processo disciplinar</h3>
              <p>A demissão exige processo administrativo disciplinar. A investigação preliminar e a sindicância não podem, sozinhas, aplicar essa penalidade.</p>
              <ol>
                <li>Instauração, com publicação do ato que constitui a comissão;</li>
                <li>Inquérito administrativo, incluindo instrução, defesa e relatório;</li>
                <li>Julgamento.</li>
              </ol>
              <p>São assegurados contraditório e ampla defesa. O servidor pode acompanhar o processo, ter procurador, apresentar provas, contraprovas e testemunhas. A defesa prévia tem prazo de 10 dias.</p>
            </section>

            <section>
              <h3>Prazos, autoridade e efeitos</h3>
              <ul>
                <li>O PAD deve ser concluído em até 60 dias, prorrogáveis por igual período.</li>
                <li>Após o parecer de legalidade, a autoridade julgadora decide em até 20 dias.</li>
                <li>A ação disciplinar prescreve em 5 anos; se a infração também for crime, aplicam-se os prazos penais.</li>
                <li>Conforme o fundamento, a demissão pode impedir nova investidura estadual por 5 ou 10 anos e pode gerar indisponibilidade de bens e ressarcimento ao erário.</li>
                <li>Para ocupante exclusivamente comissionado, a sanção correspondente é a destituição do cargo em comissão.</li>
              </ul>
            </section>

            <section>
              <h3>Fontes consultadas</h3>
              <ul>
                <li><a href="https://app1.sefaz.mt.gov.br/0425762E005567C5/250A3B130089C1CC042572ED0051D0A1/F30BBDEE7F310A2E042567BD006CE603" target="_blank" rel="noreferrer">Lei Complementar nº 4/1990 — texto consolidado</a></li>
              </ul>
              <small>O conteúdo é informativo. Somente os atos publicados no Diário Oficial produzem efeitos legais.</small>
            </section>
          </div>
        </ModalSeplag>
        <ModalSeplag
          visible={informacoesAcessoAbertas}
          titulo="Informações legais — Acesso"
          fechar={() => setInformacoesAcessoAbertas(false)}
          hideFooter
          tamanho="min(920px, calc(100vw - 32px))"
        >
          <div style={{ display: "grid", gap: "1rem", lineHeight: 1.5 }}>
            <p>
              A Lei Complementar estadual nº 4/1990 define acesso como a investidura do servidor em função de direção, chefia, assessoramento ou assistência. Os critérios dependem do plano de carreira ou de lei específica.
            </p>

            <section>
              <h3>Designação x acesso a outro cargo</h3>
              <ul>
                <li>Designação para função de confiança ou cargo em comissão pode ocorrer nos termos da lei e possui caráter temporário.</li>
                <li>Essa designação não encerra o vínculo efetivo do servidor nem libera automaticamente a vaga de seu cargo efetivo.</li>
                <li>O acesso a outro cargo ou carreira efetiva exige concurso público específico.</li>
              </ul>
            </section>

            <section>
              <h3>Limite constitucional</h3>
              <p>A Súmula Vinculante nº 43 do STF considera inconstitucional qualquer provimento que invista o servidor, sem concurso, em cargo que não integra a carreira na qual já estava investido.</p>
              <p>Por esse motivo, o acesso não deve ser usado para trocar o servidor de cargo efetivo ou de carreira sem concurso público.</p>
            </section>

            <section>
              <h3>Orientação para registro</h3>
              <p>Use esta área para consulta de registros históricos ou atos amparados em legislação específica. Para uma nomeação ou designação atual, registre o ato, a função ou cargo de destino, a lei aplicável, a data de vigência e a publicação no Diário Oficial.</p>
            </section>

            <section>
              <h3>Fontes consultadas</h3>
              <ul>
                <li><a href="https://app1.sefaz.mt.gov.br/0425762E005567C5/250A3B130089C1CC042572ED0051D0A1/F30BBDEE7F310A2E042567BD006CE603" target="_blank" rel="noreferrer">Lei Complementar nº 4/1990 — texto consolidado</a></li>
                <li><a href="https://portal.stf.jus.br/jurisprudencia/sumariosumulas.asp?base=26&sumula=2348" target="_blank" rel="noreferrer">Súmula Vinculante nº 43 do STF</a></li>
              </ul>
              <small>O conteúdo é informativo. A aplicação em cada carreira depende da legislação específica e dos atos publicados no Diário Oficial.</small>
            </section>
          </div>
        </ModalSeplag>
        <ModalSeplag
          visible={informacoesTransferenciaAbertas}
          titulo="Informações legais — Transferência"
          fechar={() => setInformacoesTransferenciaAbertas(false)}
          hideFooter
          tamanho="min(920px, calc(100vw - 32px))"
        >
          <div style={{ display: "grid", gap: "1rem", lineHeight: 1.5 }}>
            <p>
              A transferência consta como hipótese de vacância no art. 43, V, da Lei Complementar Estadual nº 4/1990.
              Os arts. 26 a 29 descrevem seus requisitos no Estatuto dos Servidores Públicos de Mato Grosso.
            </p>

            <section>
              <h3>Conceito legal</h3>
              <p>
                Pelo art. 26, é a passagem do servidor estável de um cargo efetivo de carreira para outro de igual
                denominação, classe e remuneração, em quadro de pessoal diverso, na mesma localidade. O art. 27 também
                prevê a hipótese de cargo em quadro em extinção, em situação equivalente em outro órgão ou entidade.
              </p>
            </section>

            <section>
              <h3>Requisitos previstos no Estatuto</h3>
              <ul>
                <li>interesse comprovado do serviço;</li>
                <li>existência de vaga;</li>
                <li>dois anos de efetivo exercício no cargo, salvo a exceção relativa a cônjuge ou companheiro;</li>
                <li>limite de até um terço das vagas de cada classe, conforme o art. 29.</li>
              </ul>
              <p>
                A transferência pode ocorrer a pedido do servidor, desde que observada a conveniência do serviço
                (art. 27, parágrafo único).
              </p>
            </section>

            <section>
              <h3>Limite constitucional essencial</h3>
              <p>
                A Súmula Vinculante nº 43 do STF considera inconstitucional forma de provimento que permita ao servidor
                investir-se, sem concurso público, em cargo que não integra a carreira na qual foi anteriormente investido.
                Portanto, uma operação que represente ingresso em cargo ou carreira distinta não deve ser tratada como
                transferência administrativa comum.
              </p>
            </section>

            <section>
              <h3>Não confundir</h3>
              <ul>
                <li><strong>Remoção (art. 51):</strong> deslocamento dentro do mesmo quadro, com ou sem mudança de sede; não é transferência nem gera vacância por transferência.</li>
                <li><strong>Cessão (art. 119):</strong> exercício temporário em outro órgão ou entidade, preservando o vínculo de origem; não equivale à transferência definitiva.</li>
              </ul>
            </section>

            <section>
              <h3>Orientação para o registro</h3>
              <p>
                Antes de efetivar o ato, valide a identidade entre os cargos e carreiras, os requisitos de ingresso,
                a existência de vaga, os atos de origem e destino e a compatibilidade constitucional. Casos que impliquem
                cargo ou carreira diversa exigem análise jurídica específica e não devem ser usados para burlar o concurso público.
              </p>
            </section>

            <p style={{ fontSize: "0.875rem" }}>
              Fontes: <a href="https://app1.sefaz.mt.gov.br/0425762E005567C5/250A3B130089C1CC042572ED0051D0A1/F30BBDEE7F310A2E042567BD006CE603" target="_blank" rel="noreferrer">Lei Complementar Estadual nº 4/1990 — arts. 26 a 29, 43, 51 e 119</a>{" "}
              e <a href="https://portal.stf.jus.br/jurisprudencia/sumariosumulas.asp?base=26&sumula=2348" target="_blank" rel="noreferrer">Súmula Vinculante nº 43 do STF</a>.
            </p>
          </div>
        </ModalSeplag>
        <ModalSeplag
          visible={informacoesFalecimentoAbertas}
          titulo="Informações legais — Falecimento"
          fechar={() => setInformacoesFalecimentoAbertas(false)}
          hideFooter
          tamanho="min(920px, calc(100vw - 32px))"
        >
          <div style={{ display: "grid", gap: "1rem", lineHeight: 1.5 }}>
            <p>
              O falecimento é causa de vacância do cargo público, conforme art. 43, IX, da Lei Complementar Estadual nº 4/1990.
              O vínculo funcional se encerra em razão do óbito; não se trata de exoneração ou de demissão.
            </p>

            <section>
              <h3>Registro da vacância</h3>
              <p>
                O órgão deve instruir o procedimento com a certidão de óbito, formalizar o registro funcional e atualizar
                os sistemas de pessoal e a folha. O registro administrativo documenta a vacância decorrente do óbito e
                viabiliza as providências funcionais e previdenciárias subsequentes.
              </p>
            </section>

            <section>
              <h3>Pensão por morte</h3>
              <p>
                Os dependentes de servidor ativo ou aposentado falecido podem requerer pensão por morte à MTPREV. O
                benefício é regido pelas normas constitucionais e legais vigentes na data do óbito, de modo que valor,
                duração e dependentes habilitados devem ser definidos na análise previdenciária do caso concreto.
              </p>
            </section>

            <section>
              <h3>Documentação essencial</h3>
              <ul>
                <li>requerimento de pensão por morte;</li>
                <li>certidão de óbito e documentos do servidor falecido;</li>
                <li>RG, CPF e comprovante de endereço do requerente;</li>
                <li>prova da condição de dependente, quando aplicável — por exemplo, certidão de casamento, reconhecimento de união estável, guarda, tutela, curatela ou prova de dependência econômica.</li>
              </ul>
              <p>
                A MTPREV pode exigir documentos complementares, inclusive laudo pericial em situações de dependente inválido
                ou com deficiência.
              </p>
            </section>

            <section>
              <h3>Como requerer</h3>
              <p>
                O pedido de pensão pode ser apresentado pelo requerimento on-line, no órgão de origem, presencialmente na
                MTPREV ou pelos Correios. Depois da análise, a concessão depende de ato publicado no Diário Oficial.
                A Instrução Normativa MTPREV de 2023 padroniza a vida funcional e os documentos desses processos.
              </p>
            </section>

            <section>
              <h3>Orientação para o registro</h3>
              <p>
                Não aplique no sistema um cálculo padronizado de pensão: as regras variam conforme a data do óbito, a
                composição de dependentes e a situação previdenciária do servidor. Preserve a documentação e encaminhe o
                processo para análise da MTPREV.
              </p>
            </section>

            <p style={{ fontSize: "0.875rem" }}>
              Fontes: <a href="https://app1.sefaz.mt.gov.br/0425762E005567C5/250A3B130089C1CC042572ED0051D0A1/F30BBDEE7F310A2E042567BD006CE603" target="_blank" rel="noreferrer">LC Estadual nº 4/1990 — art. 43, IX</a>,{" "}
              <a href="https://www.mtprev.mt.gov.br/-/5939842-regras-de-pensao-por-morte" target="_blank" rel="noreferrer">MTPREV — regras de pensão por morte</a>,{" "}
              <a href="https://www.iomat.mt.gov.br/portal/edicoes/download/17635" target="_blank" rel="noreferrer">IN MTPREV de 2023</a>{" "}
              e <a href="https://www.mtprev.mt.gov.br/-/cartilha-de-regras-de-aposentadoria-e-pens%C3%A3o-por-morte-atualiza%C3%A7%C3%A3o-janiero/2026" target="_blank" rel="noreferrer">cartilha MTPREV atualizada em 2026</a>.
            </p>
          </div>
        </ModalSeplag>
        <ModalSeplag
          visible={informacoesPosseInacumulavelAbertas}
          titulo="Informações legais — Posse em outro cargo inacumulável"
          fechar={() => setInformacoesPosseInacumulavelAbertas(false)}
          hideFooter
          tamanho="min(920px, calc(100vw - 32px))"
        >
          <div style={{ display: "grid", gap: "1rem", lineHeight: 1.5 }}>
            <p>
              A posse em outro cargo inacumulável gera vacância do cargo anterior, conforme art. 43, VIII, da Lei
              Complementar Estadual nº 4/1990. O ato evita a manutenção de dois vínculos quando a acumulação não é
              permitida pela Constituição.
            </p>

            <section>
              <h3>Quando se aplica</h3>
              <p>
                Aplica-se quando o servidor toma posse em outro cargo público que não pode ser acumulado com o cargo
                que já ocupa. A Constituição Federal veda a acumulação remunerada de cargos, empregos e funções públicas,
                exceto nas hipóteses expressamente autorizadas e desde que haja compatibilidade de horários.
              </p>
            </section>

            <section>
              <h3>Formalização</h3>
              <ul>
                <li>comprove a nomeação e a posse no novo cargo;</li>
                <li>registre o pedido e os documentos no processo administrativo;</li>
                <li>emita o ato administrativo que declara vago o cargo anterior;</li>
                <li>publique o ato e atualize os assentamentos funcionais e os sistemas de pessoal.</li>
              </ul>
              <p>
                O Estado de Mato Grosso possui atos publicados que declaram a vacância com fundamento direto no art. 43,
                VIII, da LC nº 4/1990.
              </p>
            </section>

            <section>
              <h3>Férias e continuidade do exercício</h3>
              <p>
                Para posse em outro cargo inacumulável no Poder Executivo Estadual, sem interrupção do efetivo exercício,
                a norma estadual de férias prevê a expedição de certidão para usufruto ou complementação do período
                aquisitivo no novo cargo. Nessa hipótese, não se aplica automaticamente a indenização de férias prevista
                para as demais situações de vacância.
              </p>
            </section>

            <section>
              <h3>Recondução e acumulação lícita</h3>
              <p>
                A recondução ao cargo anterior pode existir nas hipóteses previstas no regime jurídico e depende da situação
                funcional, da estabilidade e do ato competente. Se os cargos forem constitucionalmente acumuláveis e houver
                compatibilidade de horários, o caso deve ser analisado como acumulação lícita — e não como vacância.
              </p>
            </section>

            <p style={{ fontSize: "0.875rem" }}>
              Fontes: <a href="https://app1.sefaz.mt.gov.br/0425762E005567C5/250A3B130089C1CC042572ED0051D0A1/F30BBDEE7F310A2E042567BD006CE603" target="_blank" rel="noreferrer">LC Estadual nº 4/1990 — art. 43, VIII</a>,{" "}
              <a href="https://iomat.mt.gov.br/legislacao/diario_oficial/detalhes/170839" target="_blank" rel="noreferrer">ato estadual de vacância</a>,{" "}
              <a href="https://iomat.mt.gov.br/legislacao/diario_oficial/detalhes/183950" target="_blank" rel="noreferrer">norma estadual sobre férias</a>{" "}
              e <a href="https://app1.sefaz.mt.gov.br/Sistema/legislacao/constituicaof.nsf/0/2db9a3bf2e86578a0325675400647e6c" target="_blank" rel="noreferrer">Constituição Federal — art. 37</a>.
            </p>
          </div>
        </ModalSeplag>
        <ModalSeplag
          visible={informacoesAposentadoriaAbertas}
          titulo="Informações legais — Aposentadoria"
          fechar={() => setInformacoesAposentadoriaAbertas(false)}
          hideFooter
          tamanho="min(920px, calc(100vw - 32px))"
        >
          <div style={{ display: "grid", gap: "1rem", lineHeight: 1.5 }}>
            <p>
              A aposentadoria gera vacância do cargo público (art. 43, VII, da Lei Complementar Estadual nº 4/1990).
              No Estado de Mato Grosso, o benefício é analisado no âmbito do Regime Próprio de Previdência Social — RPPS,
              administrado pela MTPREV.
            </p>

            <section>
              <h3>Modalidades principais</h3>
              <ul>
                <li><strong>Voluntária:</strong> depende da manifestação de vontade do servidor e do cumprimento dos requisitos legais aplicáveis.</li>
                <li><strong>Por incapacidade permanente:</strong> quando o servidor for incapaz para o trabalho no cargo e não puder ser readaptado; há avaliações periódicas para verificar a continuidade da condição.</li>
                <li><strong>Compulsória:</strong> aos 75 anos de idade, com proventos proporcionais ao tempo de contribuição.</li>
                <li><strong>Especial:</strong> aplicável apenas nas hipóteses e condições específicas previstas em lei, como situações de efetiva exposição a agentes nocivos.</li>
              </ul>
            </section>

            <section>
              <h3>Regras e cálculo do benefício</h3>
              <p>
                Após a EC Estadual nº 92/2020, coexistem regras permanentes e regras de transição. A regra aplicável pode
                variar conforme a data de ingresso, o cargo, a idade, o tempo de contribuição e o tempo no serviço público e
                no cargo. Por isso, não se deve aplicar uma idade, percentual ou cálculo único a todos os servidores.
              </p>
              <p>
                Na incapacidade permanente, a regra geral posterior à reforma utiliza 60% da média das remunerações
                contributivas, acrescida de 2% por ano de contribuição que exceder 20 anos, sem prejuízo das exceções legais.
              </p>
            </section>

            <section>
              <h3>Fluxo da aposentadoria voluntária</h3>
              <ol>
                <li>solicitação pelo Portal do Servidor, em Previdência → Sistema MT Prev;</li>
                <li>produção da vida funcional e dos documentos pelo órgão de origem;</li>
                <li>análise técnica da MTPREV;</li>
                <li>agendamento e concessão, com informação da regra mais benéfica aplicável.</li>
              </ol>
            </section>

            <section>
              <h3>Orientação para o registro</h3>
              <p>
                Registre a vacância apenas a partir do ato de aposentadoria formalmente concedido e publicado. Para a
                definição do benefício, mantenha no processo a documentação funcional, as averbações e a fundamentação
                legal indicadas pela MTPREV; a concessão exige análise individual.
              </p>
            </section>

            <p style={{ fontSize: "0.875rem" }}>
              Fontes: <a href="https://app1.sefaz.mt.gov.br/0425762E005567C5/250A3B130089C1CC042572ED0051D0A1/F30BBDEE7F310A2E042567BD006CE603" target="_blank" rel="noreferrer">LC Estadual nº 4/1990 — art. 43, VII</a>,{" "}
              <a href="https://www.mtprev.mt.gov.br/aposentadoria-voluntaria" target="_blank" rel="noreferrer">MTPREV — aposentadoria voluntária</a>,{" "}
              <a href="https://www2.senado.leg.br/bdsf/bitstream/handle/id/70444/Constituicao_Estado_MT.pdf" target="_blank" rel="noreferrer">Constituição Estadual — arts. 140-A e 140-B</a>{" "}
              e <a href="https://www.iomat.mt.gov.br/portal/edicoes/download/17635" target="_blank" rel="noreferrer">IN MTPREV de 2023</a>.
            </p>
          </div>
        </ModalSeplag>
        <ModalSeplag
          visible={informacoesReadaptacaoAbertas}
          titulo="Informações legais — Readaptação"
          fechar={() => setInformacoesReadaptacaoAbertas(false)}
          hideFooter
          tamanho="min(920px, calc(100vw - 32px))"
        >
          <div style={{ display: "grid", gap: "1rem", lineHeight: 1.5 }}>
            <p>
              A readaptação é causa de vacância do cargo anterior, prevista no art. 43, VI, da Lei Complementar Estadual nº 4/1990.
              O seu conceito e seus limites estão no art. 30 do Estatuto dos Servidores Públicos de Mato Grosso.
            </p>

            <section>
              <h3>O que é</h3>
              <p>
                É a investidura do servidor em cargo cujas atribuições e responsabilidades sejam compatíveis com a limitação
                sofrida em sua capacidade física ou mental, desde que essa limitação seja verificada em inspeção médica.
              </p>
            </section>

            <section>
              <h3>Condições do cargo de destino</h3>
              <ul>
                <li>deve ser cargo de carreira;</li>
                <li>deve possuir atribuições afins às compatíveis com a limitação reconhecida;</li>
                <li>deve respeitar a habilitação exigida para o cargo;</li>
                <li>não pode resultar em aumento ou redução da remuneração do servidor.</li>
              </ul>
            </section>

            <section>
              <h3>Resultado da avaliação médica</h3>
              <p>
                Se o servidor for considerado incapaz para o serviço público, o § 1º do art. 30 prevê a aposentadoria,
                nos termos da legislação vigente. A readaptação, portanto, pressupõe que ainda exista capacidade para o
                desempenho de atribuições compatíveis.
              </p>
            </section>

            <section>
              <h3>O que não é</h3>
              <p>
                Readaptação não é penalidade disciplinar, nem simples remoção ou troca de lotação. É uma forma de provimento
                funcional fundamentada em limitação de capacidade formalmente constatada pela inspeção médica competente.
              </p>
            </section>

            <section>
              <h3>Orientação para o registro</h3>
              <p>
                Registre o ato somente após a documentação médica e administrativa competente, a identificação do cargo de
                destino e a validação de compatibilidade entre as atribuições, a habilitação exigida e a remuneração.
                A decisão médico-pericial e os atos publicados são indispensáveis para o caso concreto.
              </p>
            </section>

            <p style={{ fontSize: "0.875rem" }}>
              Fonte: <a href="https://app1.sefaz.mt.gov.br/0425762E005567C5/250A3B130089C1CC042572ED0051D0A1/F30BBDEE7F310A2E042567BD006CE603" target="_blank" rel="noreferrer">Lei Complementar Estadual nº 4/1990 — arts. 30 e 43, VI</a>.
              O texto consolidado tem caráter informativo; o ato publicado no Diário Oficial é o que produz efeitos legais.
            </p>
          </div>
        </ModalSeplag>
        <ModalSeplag
          visible={informacoesAscensaoAbertas}
          titulo="Informações legais — Ascensão"
          fechar={() => setInformacoesAscensaoAbertas(false)}
          hideFooter
          tamanho="min(920px, calc(100vw - 32px))"
        >
          <div style={{ display: "grid", gap: "1rem", lineHeight: 1.5 }}>
            <p>
              A Lei Complementar estadual nº 4/1990 define ascensão como a passagem do servidor de um nível para outro, com posicionamento na primeira classe e em referência ou padrão imediatamente superior, na mesma carreira.
            </p>

            <section>
              <h3>Regra do Estatuto</h3>
              <ul>
                <li>Ascensão é uma das hipóteses de vacância do cargo anterior.</li>
                <li>Não interrompe o tempo de exercício, que passa a ser contado no novo posicionamento a partir da publicação do ato.</li>
                <li>Os critérios aplicáveis devem estar definidos no plano de carreira específico.</li>
              </ul>
            </section>

            <section>
              <h3>Limite constitucional</h3>
              <p>A ascensão não pode ser utilizada para investir o servidor em cargo de outra carreira sem concurso público específico.</p>
              <p>A Súmula Vinculante nº 43 do STF considera inconstitucional qualquer forma de provimento que leve o servidor, sem concurso, a cargo que não integra a carreira na qual já estava investido.</p>
              <p>Na prática, progressão e promoção ocorrem dentro da carreira. Se houver troca para cargo ou carreira distinta, a operação não deve ser registrada como ascensão sem previsão legal e validação jurídica.</p>
            </section>

            <section>
              <h3>Orientação para registro</h3>
              <p>O registro deve exigir a identificação da carreira de origem e destino, o plano de carreira ou lei específica, o ato publicado e a data de vigência. Casos anteriores já publicados devem ser preservados como histórico.</p>
            </section>

            <section>
              <h3>Fontes consultadas</h3>
              <ul>
                <li><a href="https://app1.sefaz.mt.gov.br/0425762E005567C5/250A3B130089C1CC042572ED0051D0A1/F30BBDEE7F310A2E042567BD006CE603" target="_blank" rel="noreferrer">Lei Complementar nº 4/1990 — texto consolidado</a></li>
                <li><a href="https://portal.stf.jus.br/jurisprudencia/sumariosumulas.asp?base=26&sumula=2348" target="_blank" rel="noreferrer">Súmula Vinculante nº 43 do STF</a></li>
                <li><a href="https://iomat.mt.gov.br/portal/edicoes/download/15965" target="_blank" rel="noreferrer">Decreto estadual nº 559/2020</a></li>
              </ul>
              <small>O conteúdo é informativo. A aplicação em cada carreira depende da legislação específica e dos atos publicados no Diário Oficial.</small>
            </section>
          </div>
        </ModalSeplag>
      </main>
    );
  }

  return (
    <main className="prototype-cadastro-geral">
      <header>
        <h1>Vacância</h1>
        <p>Selecione a modalidade de vacância que deseja registrar ou consultar.</p>
      </header>
      <section aria-label="Modalidades de Vacância">
        {modalidades.map((modalidadeItem) => (
          <Link key={modalidadeItem.slug} to={`${VACANCIA_BASE_PATH}/${modalidadeItem.slug}`}>
            <i className={modalidadeItem.icone} aria-hidden="true" />
            <h2>{modalidadeItem.titulo}</h2>
            <p>{modalidadeItem.descricao}</p>
            <span>Acessar <i className="pi pi-arrow-right" aria-hidden="true" /></span>
          </Link>
        ))}
      </section>
    </main>
  );
}
