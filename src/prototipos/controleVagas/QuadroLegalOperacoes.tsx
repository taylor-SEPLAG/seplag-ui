import { useMemo, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import {
  controleVagasStore,
  useControleVagasStore,
} from "./controleVagasStore";
import type { QuadroAutorizadoRow } from "./types";
import {
  aplicarAlteracaoQuadroLegal,
  type TipoAlteracaoQuadroLegal,
} from "./quadroLegalUtils";
import { DocumentosLegaisAssociadosSeplag } from "../../componentes/DocumentosLegaisAssociados";
import { documentosLegaisDisponiveis } from "./documentosLegaisData";
import { BotaoSalvarSeplag, BotaoSeplag } from "../../componentes/Botao";
import {
  DateFieldSeplag,
  DropdownFieldSeplag,
  NumberFieldSeplag,
  TextFieldSeplag,
} from "../../componentes/Fields";
import { MensagemSeplag } from "../../componentes/Mensagem";
import { cargosBaseTemporaria } from "./baseTemporaria";
import "./quadroLegalOperacoes.css";

const rotulos: Record<TipoAlteracaoQuadroLegal, string> = {
  AMPLIACAO: "Ampliação legal",
  REDUCAO: "Redução legal",
  TRANSFORMACAO: "Transformação",
  EXTINCAO_PROGRESSIVA: "Extinção progressiva",
};
const descricoes: Record<TipoAlteracaoQuadroLegal, string> = {
  AMPLIACAO:
    "Cria novos identificadores após o último sequencial, sem reutilizar códigos.",
  REDUCAO:
    "Extingue vagas disponíveis e mantém ocupadas em extinção até a vacância.",
  TRANSFORMACAO:
    "Preserva a origem no histórico e gera vagas numeradas para o cargo de destino.",
  EXTINCAO_PROGRESSIVA:
    "Bloqueia novas ocupações; vagas ocupadas desaparecem do limite somente após vagarem.",
};

export function QuadroLegalOperacoes({
  registro,
  onSaved,
}: {
  registro: QuadroAutorizadoRow;
  onSaved?: () => void;
}) {
  const { vagas } = useControleVagasStore();
  const vagasOriginais = useMemo(
    () => vagas.filter((vaga) => vaga.quadroAutorizadoId === registro.id),
    [registro.id, vagas],
  );
  const cargosDisponiveisTransformacao = useMemo(
    () =>
      cargosBaseTemporaria
        .filter(
          (cargo) =>
            cargo.situacaoLegal === "REGULAR" && cargo.nome !== registro.cargo,
        )
        .map((cargo) => ({ label: cargo.nome, value: cargo.nome })),
    [registro.cargo],
  );
  const [tipo, setTipo] = useState<TipoAlteracaoQuadroLegal>("AMPLIACAO");
  const {
    control: operacaoControl,
    watch: watchOperacao,
    setValue: setOperacaoValue,
  } = useForm<{
    dataEfeito: string;
    quantidade: number;
    novoCargo: string;
  }>({
    defaultValues: {
      dataEfeito: "2026-08-01",
      quantidade: 1,
      novoCargo: "",
    },
  });
  const dataEfeito = watchOperacao("dataEfeito");
  const quantidade = watchOperacao("quantidade");
  const novoCargo = watchOperacao("novoCargo");
  const [documentosLegaisIds, setDocumentosLegaisIds] = useState<string[]>([]);
  const normasSelecionadas = documentosLegaisDisponiveis.filter((item) =>
    documentosLegaisIds.includes(item.id),
  );
  const lei = normasSelecionadas.map((item) => item.titulo).join("; ");
  const [processo, setProcesso] = useState(registro.processo);
  const [resultado, setResultado] = useState<ReturnType<
    typeof aplicarAlteracaoQuadroLegal
  > | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);

  const simular = (event: FormEvent) => {
    event.preventDefault();
    setSalvo(false);
    setResultado(
      aplicarAlteracaoQuadroLegal(vagasOriginais, {
        tipo,
        quantidade,
        lei,
        processo,
        dataEfeito,
        novoCargo,
      }),
    );
  };

  const registrarNovaVersao = () => {
    if (
      !resultado ||
      resultado.criadas.length + resultado.alteradas.length === 0
    )
      return;
    const atual = controleVagasStore.getState();
    const novoId = Math.max(0, ...atual.quadros.map((item) => item.id)) + 1;
    const vigenciaFutura = dataEfeito > "2026-07-20";
    const vagasDaNovaVersao = resultado.vagas.map((vaga) => ({
      ...vaga,
      quadroAutorizadoId: novoId,
      quadroCodigo: registro.codigo,
    }));
    const ocupadas = vagasDaNovaVersao.filter(
      (vaga) => vaga.estado === "OCUPADA" && vaga.situacaoLegal !== "EXTINTA",
    ).length;
    const extincaoProgressiva = tipo === "EXTINCAO_PROGRESSIVA";
    const extincaoImediata =
      extincaoProgressiva && resultado.quantitativoPosterior === 0;
    const novaVersao: QuadroAutorizadoRow = {
      ...registro,
      id: novoId,
      autorizadas: resultado.quantitativoPosterior,
      ocupadas,
      ato: lei,
      processo,
      inicioVigencia: dataEfeito.split("-").reverse().join("/"),
      dataAtivacao: dataEfeito,
      dataEncerramento: undefined,
      motivoEncerramento: undefined,
      situacaoVigencia: extincaoImediata ? "EXTINTO" : "ATIVO",
      dataExtincao: extincaoImediata ? dataEfeito : undefined,
      motivoExtincao: extincaoImediata
        ? "Extinção progressiva concluída sem vagas ocupadas."
        : undefined,
      extincaoProgressivaEmAndamento:
        extincaoProgressiva && !extincaoImediata,
      dataInicioExtincaoProgressiva: extincaoProgressiva
        ? dataEfeito
        : undefined,
      fimVigencia: extincaoImediata
        ? dataEfeito.split("-").reverse().join("/")
        : "",
      situacao: vigenciaFutura
        ? "Vigência futura"
        : extincaoImediata
          ? "Encerrada"
          : "Vigente",
      versao: registro.versao + 1,
      atualizadoEm: "20/07/2026",
    };
    controleVagasStore.update((estado) => ({
      ...estado,
      quadros: [
        ...estado.quadros.map((item) =>
          item.id === registro.id && !vigenciaFutura
            ? { ...item, situacao: "Encerrada" as const }
            : item,
        ),
        novaVersao,
      ],
      vagas: vigenciaFutura
        ? estado.vagas
        : [
            ...estado.vagas.filter(
              (vaga) => vaga.quadroAutorizadoId !== registro.id,
            ),
            ...vagasDaNovaVersao,
          ],
    }));
    setConfirmacaoAberta(false);
    setSalvo(true);
    window.setTimeout(() => onSaved?.(), 700);
  };

  const quantidadeImpactada =
    (resultado?.criadas.length ?? 0) + (resultado?.alteradas.length ?? 0);

  return (
    <section className="prototype-legal-card">
      <header>
        <div>
          <h2>Evolução do quadro legal</h2>
          <p>
            Simule o efeito de uma nova lei sobre as vagas individuais deste
            quadro.
          </p>
        </div>
        <span>
          <i className="pi pi-lock" /> Operação rastreável
        </span>
      </header>
      <form onSubmit={simular}>
        <div className="prototype-legal-types">
          {(Object.keys(rotulos) as TipoAlteracaoQuadroLegal[]).map((item) => (
            <button
              key={item}
              type="button"
              className={tipo === item ? "active" : ""}
              onClick={() => {
                setTipo(item);
                if (item !== "TRANSFORMACAO") {
                  setOperacaoValue("novoCargo", "");
                }
                setResultado(null);
                setSalvo(false);
              }}
            >
              <i
                className={
                  item === "AMPLIACAO"
                    ? "pi pi-plus-circle"
                    : item === "REDUCAO"
                      ? "pi pi-minus-circle"
                      : item === "TRANSFORMACAO"
                        ? "pi pi-sync"
                        : "pi pi-ban"
                }
              />
              <strong>{rotulos[item]}</strong>
              <small>{descricoes[item]}</small>
            </button>
          ))}
        </div>
        <div className="prototype-legal-documents">
          <DocumentosLegaisAssociadosSeplag
            label="Lei ou ato legal"
            required
            options={documentosLegaisDisponiveis}
            value={documentosLegaisIds}
            onChange={(ids) => {
              setDocumentosLegaisIds(ids);
              setResultado(null);
              setSalvo(false);
            }}
            onVisualizar={() => {}}
            exibirNovoCadastro={false}
            expandirAoAbrir
          />
        </div>
        <div className="prototype-legal-fields prototype-legal-library-fields">
          <DateFieldSeplag
            name="dataEfeito"
            control={operacaoControl}
            label="Data de efeito"
            required
            cols="12 12 3"
            getFormErrorMessage={() => null}
          />
          <TextFieldSeplag
            name="processo"
            label="Processo SIGADOC"
            value={processo}
            onChange={(value) => {
              setProcesso(value);
              setResultado(null);
            }}
            cols="12 12 4"
          />
          {tipo !== "EXTINCAO_PROGRESSIVA" && (
            <NumberFieldSeplag
              name="quantidade"
              control={operacaoControl}
              label="Quantidade"
              required
              cols="12 12 2"
              min={1}
              max={tipo === "AMPLIACAO" ? 9999 : vagasOriginais.length}
              getFormErrorMessage={() => null}
            />
          )}
          {tipo === "TRANSFORMACAO" && (
            <DropdownFieldSeplag
              name="novoCargo"
              control={operacaoControl}
              label="Novo cargo"
              required
              options={cargosDisponiveisTransformacao}
              optionLabel="label"
              optionValue="value"
              onChange={() => {
                setResultado(null);
                setSalvo(false);
              }}
              placeholder="Selecione o cargo de destino"
              cols="12 12 3"
              getFormErrorMessage={() => null}
            />
          )}
        </div>
        <div className="prototype-legal-simulate-action">
          <BotaoSeplag
            type="submit"
            label="Simular impacto legal"
            icon="pi pi-calculator"
          />
        </div>
      </form>
      <MensagemSeplag
        visible={salvo}
        severity="success"
        message="Nova versão registrada com sucesso."
      />
      {resultado && (
        <div className="prototype-legal-result">
          <header>
            <div>
              <span>Resultado da simulação</span>
              <h3>{rotulos[tipo]}</h3>
            </div>
            <span className={resultado.alertas.length ? "warning" : "ok"}>
              {resultado.alertas.length ? "Requer atenção" : "Consistente"}
            </span>
          </header>
          <div className="prototype-legal-result-kpis">
            <article>
              <span>Quadro anterior</span>
              <strong>{resultado.quantitativoAnterior}</strong>
            </article>
            <article>
              <span>Quadro resultante</span>
              <strong>{resultado.quantitativoPosterior}</strong>
            </article>
            <article>
              <span>Vagas geradas</span>
              <strong>{resultado.criadas.length}</strong>
            </article>
            <article>
              <span>Vagas afetadas</span>
              <strong>{resultado.alteradas.length}</strong>
            </article>
          </div>
          {resultado.alertas.map((alerta) => (
            <MensagemSeplag key={alerta} severity="warning" message={alerta} />
          ))}
          {quantidadeImpactada > 0 && (
            <div className="prototype-legal-impact-list">
              <h4>Amostra das vagas impactadas</h4>
              <table>
                <thead>
                  <tr>
                    <th>Identificador</th>
                    <th>Efeito</th>
                    <th>Estado</th>
                    <th>Situação legal</th>
                  </tr>
                </thead>
                <tbody>
                  {[...resultado.criadas, ...resultado.alteradas]
                    .slice(0, 8)
                    .map((vaga) => (
                      <tr key={vaga.id + "-" + vaga.situacaoLegal}>
                        <td>
                          <strong>{vaga.id}</strong>
                        </td>
                        <td>
                          {resultado.criadas.some((item) => item.id === vaga.id)
                            ? "Nova vaga numerada"
                            : "Atualização preservando o código"}
                        </td>
                        <td>
                          {vaga.estado === "DISPONIVEL"
                            ? "Disponível"
                            : "Ocupada"}
                        </td>
                        <td>{vaga.situacaoLegal.replaceAll("_", " ")}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {quantidadeImpactada > 8 && (
                <small>
                  Mais {quantidadeImpactada - 8} vaga(s) receberiam o mesmo
                  tratamento.
                </small>
              )}
            </div>
          )}
          <footer>
            <BotaoSalvarSeplag
              type="button"
              label="Registrar nova versão"
              disabled={salvo || quantidadeImpactada === 0}
              onClick={() => setConfirmacaoAberta(true)}
            />
          </footer>
        </div>
      )}
      {confirmacaoAberta && resultado && (
        <div
          className="prototype-legal-confirm-backdrop"
          role="presentation"
          onMouseDown={() => setConfirmacaoAberta(false)}
        >
          <section
            className="prototype-legal-confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmar-nova-versao"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span>Confirmação</span>
                <h3 id="confirmar-nova-versao">Registrar nova versão?</h3>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setConfirmacaoAberta(false)}
              >
                <i className="pi pi-times" />
              </button>
            </header>
            <p>
              Confira os dados da evolução legal antes de concluir. A versão
              vigente será preservada no histórico.
            </p>
            <dl>
              <div>
                <dt>Nova versão</dt>
                <dd>Versão {registro.versao + 1}</dd>
              </div>
              <div>
                <dt>Operação</dt>
                <dd>{rotulos[tipo]}</dd>
              </div>
              <div className="is-full">
                <dt>Base legal</dt>
                <dd>{lei}</dd>
              </div>
              <div>
                <dt>Data de efeito</dt>
                <dd>{dataEfeito.split("-").reverse().join("/")}</dd>
              </div>
              <div>
                <dt>Processo</dt>
                <dd>{processo || "Não informado"}</dd>
              </div>
              <div>
                <dt>Quadro anterior</dt>
                <dd>{resultado.quantitativoAnterior}</dd>
              </div>
              <div>
                <dt>Quadro resultante</dt>
                <dd>{resultado.quantitativoPosterior}</dd>
              </div>
              <div>
                <dt>Vagas geradas</dt>
                <dd>{resultado.criadas.length}</dd>
              </div>
              <div>
                <dt>Vagas afetadas</dt>
                <dd>{resultado.alteradas.length}</dd>
              </div>
            </dl>
            <footer>
              <button type="button" onClick={() => setConfirmacaoAberta(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="is-primary"
                onClick={registrarNovaVersao}
              >
                <i className="pi pi-check" /> Confirmar e registrar
              </button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}
