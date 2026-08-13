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
import { useDocumentosLegaisAssociaveis } from "../documentosLegais/documentosLegaisStore";
import { BaseLegalVinculada } from "./BaseLegalVinculada";
import { BotaoSalvarSeplag, BotaoSeplag } from "../../componentes/Botao";
import {
  DateFieldSeplag,
  DropdownFieldSeplag,
  NumberFieldSeplag,
  TextFieldSeplag,
} from "../../componentes/Fields";
import { MensagemSeplag } from "../../componentes/Mensagem";
import { calcularPosicaoVaga } from "./distribuicaoIndividual";
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
    "Reduz somente vagas disponíveis, regulares e sem comprometimento ativo.",
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
  const { vagas, movimentos, comprometimentos, quadros } = useControleVagasStore();
  const documentosLegaisDisponiveis = useDocumentosLegaisAssociaveis();
  const vagasOriginais = useMemo(
    () => vagas.filter((vaga) => vaga.quadroAutorizadoId === registro.id),
    [registro.id, vagas],
  );
  const quadrosDestino = useMemo(() => {
    const atuais = new Map<string, QuadroAutorizadoRow>();
    quadros
      .filter((quadro) => quadro.codigo !== registro.codigo && quadro.situacao !== "Encerrada")
      .forEach((quadro) => {
        const anterior = atuais.get(quadro.codigo);
        if (!anterior || quadro.versao > anterior.versao) atuais.set(quadro.codigo, quadro);
      });
    return [...atuais.values()].sort((a, b) => a.codigo.localeCompare(b.codigo));
  }, [quadros, registro.codigo]);
  const opcoesQuadroDestino = useMemo(
    () => quadrosDestino.map((quadro) => ({
      label: `${quadro.codigo} — ${quadro.cargo} — versão ${quadro.versao}`,
      value: quadro.id,
    })),
    [quadrosDestino],
  );
  const [tipo, setTipo] = useState<TipoAlteracaoQuadroLegal>("AMPLIACAO");
  const {
    control: operacaoControl,
    watch: watchOperacao,
    setValue: setOperacaoValue,
  } = useForm<{
    dataEfeito: string;
    quantidade: number;
    quadroDestinoId: number | null;
  }>({
    defaultValues: {
      dataEfeito: "2026-08-01",
      quantidade: 1,
      quadroDestinoId: null,
    },
  });
  const dataEfeito = watchOperacao("dataEfeito");
  const quantidade = watchOperacao("quantidade");
  const quadroDestinoId = watchOperacao("quadroDestinoId");
  const quadroDestino = quadrosDestino.find((quadro) => quadro.id === Number(quadroDestinoId));
  const vagasDestino = useMemo(() => vagas.filter((vaga) => vaga.quadroAutorizadoId === quadroDestino?.id), [quadroDestino?.id, vagas]);
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
  const [reducaoPorOrgao, setReducaoPorOrgao] = useState<Record<string, number>>({});

  const idsVagasComprometidas = useMemo(
    () =>
      new Set(
        comprometimentos
          .filter((item) => item.situacao === "ATIVO")
          .map((item) => item.vagaId),
      ),
    [comprometimentos],
  );

  const resumoQuadro = useMemo(() => {
    const ativas = vagasOriginais.filter((vaga) => vaga.situacaoLegal !== "EXTINTA");
    const pendentes = ativas.filter((vaga) => calcularPosicaoVaga(vaga, movimentos, dataEfeito || "2026-07-20").situacaoDistribuicao === "PENDENTE_ATO").length;
    const ocupadas = ativas.filter((vaga) => vaga.estado === "OCUPADA").length;
    const comprometidas = ativas.filter((vaga) => idsVagasComprometidas.has(vaga.id)).length;
    const disponiveis = ativas.filter((vaga) => vaga.estado === "DISPONIVEL").length - pendentes;
    return { autorizadas: ativas.length, ocupadas, comprometidas, disponiveis: Math.max(0, disponiveis), pendentes };
  }, [dataEfeito, idsVagasComprometidas, movimentos, vagasOriginais]);
  const vagasPorOrgao = useMemo(() => {
    const grupos = new Map<string, typeof vagasOriginais>();
    vagasOriginais.filter((vaga) => vaga.situacaoLegal !== "EXTINTA").forEach((vaga) => {
      const posicao = calcularPosicaoVaga(vaga, movimentos, dataEfeito || "2026-07-20");
      const orgao = posicao.orgaoDistribuicao ?? "Pendente de ato de distribuição";
      grupos.set(orgao, [...(grupos.get(orgao) ?? []), vaga]);
    });
    return [...grupos.entries()].map(([orgao, itens]) => {
      const elegiveis = itens.filter(
        (vaga) =>
          vaga.estado === "DISPONIVEL" &&
          vaga.situacaoLegal === "REGULAR" &&
          !idsVagasComprometidas.has(vaga.id),
      );
      return {
        orgao,
        vagas: itens,
        ocupadas: itens.filter((vaga) => vaga.estado === "OCUPADA").length,
        disponiveis: itens.filter((vaga) => vaga.estado === "DISPONIVEL").length,
        comprometidas: itens.filter((vaga) => idsVagasComprometidas.has(vaga.id)).length,
        elegiveis,
      };
    });
  }, [dataEfeito, idsVagasComprometidas, movimentos, vagasOriginais]);

  const vagasSelecionadasReducao = useMemo(() => vagasPorOrgao.flatMap((grupo) => {
    const quantidadeGrupo = Math.min(reducaoPorOrgao[grupo.orgao] ?? 0, grupo.elegiveis.length);
    return [...grupo.elegiveis].sort((a, b) => b.sequencial - a.sequencial).slice(0, quantidadeGrupo);
  }), [reducaoPorOrgao, vagasPorOrgao]);
  const totalSolicitadoReducao = useMemo(
    () => Object.values(reducaoPorOrgao).reduce((total, item) => total + item, 0),
    [reducaoPorOrgao],
  );

  const reducaoInvalida = tipo === "REDUCAO" && vagasPorOrgao.some(
    (grupo) => (reducaoPorOrgao[grupo.orgao] ?? 0) > grupo.elegiveis.length,
  );
  const vagasDisponiveisComprometidas = useMemo(
    () => vagasOriginais.filter(
      (vaga) =>
        vaga.situacaoLegal !== "EXTINTA" &&
        vaga.estado === "DISPONIVEL" &&
        idsVagasComprometidas.has(vaga.id),
    ),
    [idsVagasComprometidas, vagasOriginais],
  );
  const extincaoJaIniciada = tipo === "EXTINCAO_PROGRESSIVA" && Boolean(registro.extincaoProgressivaEmAndamento);
  const extincaoInvalida = tipo === "EXTINCAO_PROGRESSIVA" && (extincaoJaIniciada || vagasDisponiveisComprometidas.length > 0);
  const operacaoInvalida = reducaoInvalida || extincaoInvalida;

  const simular = (event: FormEvent) => {
    event.preventDefault();
    setSalvo(false);
    if (operacaoInvalida) {
      setResultado(null);
      return;
    }
    const quantidadeEfetiva = tipo === "REDUCAO" ? vagasSelecionadasReducao.length : quantidade;
    setResultado(
      aplicarAlteracaoQuadroLegal(vagasOriginais, {
        tipo,
        quantidade: tipo === "EXTINCAO_PROGRESSIVA" ? undefined : quantidadeEfetiva,
        lei,
        processo,
        dataEfeito,
        novoCargo: quadroDestino?.cargo,
        novaCarreira: quadroDestino?.carreira,
        quadroDestinoId: quadroDestino?.id,
        quadroDestinoCodigo: quadroDestino?.codigo,
        maiorSequencialDestino: Math.max(0, ...vagasDestino.map((vaga) => vaga.sequencial)),
        vagaIds: tipo === "REDUCAO" ? vagasSelecionadasReducao.map((vaga) => vaga.id) : undefined,
        vagaIdsBloqueados: tipo === "REDUCAO" || tipo === "EXTINCAO_PROGRESSIVA" ? [...idsVagasComprometidas] : undefined,
      }),
    );
  };

  const registrarNovaVersao = () => {
    if (operacaoInvalida || !resultado || resultado.criadas.length + resultado.alteradas.length === 0) return;
    const atual = controleVagasStore.getState();
    const agora = new Date();
    const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
    const vigenciaFutura = dataEfeito > hoje;
    const dataBr = dataEfeito.split("-").reverse().join("/");
    const primeiroNovoId = Math.max(0, ...atual.quadros.map((item) => item.id)) + 1;

    if (tipo === "TRANSFORMACAO" && quadroDestino) {
      const idOrigemNovaVersao = primeiroNovoId;
      const idDestinoNovaVersao = primeiroNovoId + 1;
      const paresTransformacao = new Map(
        resultado.alteradas.map((vagaOrigem, indice) => [vagaOrigem.id, resultado.criadas[indice]]),
      );
      const vagasOrigemRestantes = resultado.vagas
        .filter((vaga) => vaga.quadroAutorizadoId === registro.id)
        .map((vaga, indice) => ({ ...vaga, quadroAutorizadoId: idOrigemNovaVersao, quadroCodigo: registro.codigo }));
      const vagasTransformadas = resultado.criadas.map((vaga, indice) => ({
        ...vaga,
        quadroAutorizadoId: idDestinoNovaVersao,
        quadroCodigo: quadroDestino.codigo,
      }));
      const vagasDestinoAnteriores = atual.vagas
        .filter((vaga) => vaga.quadroAutorizadoId === quadroDestino.id)
        .map((vaga, indice) => ({ ...vaga, quadroAutorizadoId: idDestinoNovaVersao, quadroCodigo: quadroDestino.codigo }));
      const ocupadasTransformadas = vagasTransformadas.filter((vaga) => vaga.estado === "OCUPADA").length;
      const comprometidasTransformadas = resultado.alteradas.filter((vaga) => idsVagasComprometidas.has(vaga.id)).length;
      const origemNovaVersao: QuadroAutorizadoRow = {
        ...registro,
        id: idOrigemNovaVersao,
        autorizadas: resultado.quantitativoPosterior,
        ocupadas: Math.max(0, registro.ocupadas - ocupadasTransformadas),
        comprometidas: Math.max(0, registro.comprometidas - comprometidasTransformadas),
        ato: lei,
        processo,
        inicioVigencia: dataBr,
        dataAtivacao: dataEfeito,
        situacao: vigenciaFutura ? "Vigência futura" : "Vigente",
        versao: registro.versao + 1,
        atualizadoEm: dataBr,
      };
      const destinoNovaVersao: QuadroAutorizadoRow = {
        ...quadroDestino,
        id: idDestinoNovaVersao,
        autorizadas: quadroDestino.autorizadas + vagasTransformadas.length,
        ocupadas: quadroDestino.ocupadas + ocupadasTransformadas,
        comprometidas: quadroDestino.comprometidas + comprometidasTransformadas,
        ato: lei,
        processo,
        inicioVigencia: dataBr,
        dataAtivacao: dataEfeito,
        situacao: vigenciaFutura ? "Vigência futura" : "Vigente",
        versao: quadroDestino.versao + 1,
        atualizadoEm: dataBr,
      };
      controleVagasStore.update((estado) => ({
        ...estado,
        quadros: [
          ...estado.quadros.map((item) =>
            !vigenciaFutura && (item.id === registro.id || item.id === quadroDestino.id)
              ? { ...item, situacao: "Encerrada" as const }
              : item,
          ),
          origemNovaVersao,
          destinoNovaVersao,
        ],
        vagas: vigenciaFutura
          ? estado.vagas
          : [
              ...estado.vagas.filter((vaga) => vaga.quadroAutorizadoId !== registro.id && vaga.quadroAutorizadoId !== quadroDestino.id),
              ...vagasOrigemRestantes,
              ...vagasDestinoAnteriores,
              ...vagasTransformadas,
            ],
        ocupacoes: vigenciaFutura
          ? estado.ocupacoes
          : estado.ocupacoes.map((ocupacao) => {
              const destino = paresTransformacao.get(ocupacao.vagaId);
              return destino ? { ...ocupacao, vagaId: destino.id, cargo: quadroDestino.cargo } : ocupacao;
            }),
        comprometimentos: vigenciaFutura
          ? estado.comprometimentos
          : estado.comprometimentos.map((comprometimento) => {
              const destino = paresTransformacao.get(comprometimento.vagaId);
              return destino ? { ...comprometimento, vagaId: destino.id } : comprometimento;
            }),
      }));
    } else {
      const novoId = primeiroNovoId;
      const vagasDaNovaVersao = resultado.vagas.map((vaga, indice) => ({ ...vaga, quadroAutorizadoId: novoId, quadroCodigo: registro.codigo }));
      const ocupadasNovaVersao = vagasDaNovaVersao.filter((vaga) => vaga.estado === "OCUPADA" && vaga.situacaoLegal !== "EXTINTA").length;
      const extincaoProgressiva = tipo === "EXTINCAO_PROGRESSIVA";
      const extincaoImediata = extincaoProgressiva && resultado.quantitativoPosterior === 0;
      const novaVersao: QuadroAutorizadoRow = {
        ...registro,
        id: novoId,
        autorizadas: resultado.quantitativoPosterior,
        ocupadas: ocupadasNovaVersao,
        comprometidas: extincaoProgressiva
          ? vagasDaNovaVersao.filter((vaga) => vaga.situacaoLegal !== "EXTINTA" && idsVagasComprometidas.has(vaga.id)).length
          : registro.comprometidas,
        bloqueadas: extincaoProgressiva ? 0 : registro.bloqueadas,
        ato: lei,
        processo,
        inicioVigencia: dataBr,
        dataAtivacao: dataEfeito,
        dataEncerramento: undefined,
        motivoEncerramento: undefined,
        situacaoVigencia: extincaoImediata ? "EXTINTO" : "ATIVO",
        dataExtincao: extincaoImediata ? dataEfeito : undefined,
        motivoExtincao: extincaoImediata ? "Extinção progressiva concluída sem vagas ocupadas." : undefined,
        extincaoProgressivaEmAndamento: extincaoProgressiva && !extincaoImediata,
        dataInicioExtincaoProgressiva: extincaoProgressiva ? dataEfeito : undefined,
        fimVigencia: extincaoImediata ? dataBr : "",
        situacao: vigenciaFutura ? "Vigência futura" : extincaoImediata ? "Encerrada" : "Vigente",
        versao: registro.versao + 1,
        atualizadoEm: dataBr,
      };
      controleVagasStore.update((estado) => ({
        ...estado,
        quadros: [...estado.quadros.map((item) => item.id === registro.id && !vigenciaFutura ? { ...item, situacao: "Encerrada" as const } : item), novaVersao],
        vagas: vigenciaFutura ? estado.vagas : [...estado.vagas.filter((vaga) => vaga.quadroAutorizadoId !== registro.id), ...vagasDaNovaVersao],
      }));
    }
    setConfirmacaoAberta(false);
    setSalvo(true);
    window.setTimeout(() => onSaved?.(), 700);
  };
  const quantidadeImpactada = tipo === "TRANSFORMACAO"
    ? resultado?.alteradas.length ?? 0
    : (resultado?.criadas.length ?? 0) + (resultado?.alteradas.length ?? 0);

  return (
    <section className="prototype-legal-card">
<form onSubmit={simular}>
        <section className="prototype-legal-version-context">
          <span>Quadro que será versionado</span>
          <div>
            <strong>{registro.codigo}</strong>
            <h3>{registro.cargo}</h3>
            <em>Versão vigente {registro.versao}</em>
          </div>
          <dl className="prototype-legal-version-summary">
            <div><dt>Autorizadas</dt><dd>{resumoQuadro.autorizadas}</dd></div>
            <div><dt>Ocupadas</dt><dd>{resumoQuadro.ocupadas}</dd></div>
            <div><dt>Comprometidas</dt><dd>{resumoQuadro.comprometidas}</dd></div>
            <div><dt>Disponíveis</dt><dd>{resumoQuadro.disponiveis}</dd></div>
            <div><dt>Pendentes de ato</dt><dd>{resumoQuadro.pendentes}</dd></div>
          </dl>          <p><i className="pi pi-info-circle" /> A versão vigente será preservada. Selecione a lei ou o ato legal que fundamenta a alteração e simule seu impacto antes de registrar a nova versão.</p>
        </section>
        <BaseLegalVinculada
          className="prototype-legal-documents"
          value={documentosLegaisIds}
          onChange={(ids) => {
            setDocumentosLegaisIds(ids);
            setResultado(null);
            setSalvo(false);
          }}
        />
        <div className="prototype-legal-types">
          {(Object.keys(rotulos) as TipoAlteracaoQuadroLegal[]).map((item) => (
            <button
              key={item}
              type="button"
              className={tipo === item ? "active" : ""}
              disabled={item === "EXTINCAO_PROGRESSIVA" && Boolean(registro.extincaoProgressivaEmAndamento)}
              title={item === "EXTINCAO_PROGRESSIVA" && registro.extincaoProgressivaEmAndamento ? "A extinção progressiva deste quadro já está em andamento." : undefined}
              onClick={() => {
                setTipo(item);
                if (item !== "TRANSFORMACAO") {
                  setOperacaoValue("quadroDestinoId", null);
                }
                setResultado(null);
                setSalvo(false);
                setReducaoPorOrgao({});
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
        {tipo === "REDUCAO" && (
          <section className="prototype-legal-reduction-allocation">
            <header>
              <div>
                <h3>Redução por órgão de distribuição</h3>
                <p>Somente vagas disponíveis, regulares e sem comprometimento ativo podem ser reduzidas.</p>
              </div>
              <strong>{totalSolicitadoReducao} vaga(s) selecionada(s)</strong>
            </header>
            <table>
              <thead><tr><th>Órgão</th><th>Distribuídas</th><th>Ocupadas</th><th>Comprometidas</th><th>Disponíveis</th><th>Quantidade a reduzir</th><th>Efeito previsto</th></tr></thead>
              <tbody>{vagasPorOrgao.map((grupo) => {
                const reduzir = reducaoPorOrgao[grupo.orgao] ?? 0;
                const excedeuDisponiveis = reduzir > grupo.elegiveis.length;
                return <tr key={grupo.orgao}>
                  <td><strong>{grupo.orgao}</strong></td><td>{grupo.vagas.length}</td><td>{grupo.ocupadas}</td><td>{grupo.comprometidas}</td><td>{grupo.elegiveis.length}</td>
                  <td><input aria-label={`Reduzir vagas de ${grupo.orgao}`} aria-invalid={excedeuDisponiveis} className={excedeuDisponiveis ? "is-invalid" : undefined} type="number" min={0} value={reducaoPorOrgao[grupo.orgao] ?? 0} onChange={(event) => {
                    const valor = Math.max(0, Math.floor(Number(event.target.value) || 0));
                    const proximo = {...reducaoPorOrgao, [grupo.orgao]: valor};
                    setReducaoPorOrgao(proximo);
                    setOperacaoValue("quantidade", Object.values(proximo).reduce((total, item) => total + item, 0));
                    setResultado(null);
                  }} /></td>
                  <td>{excedeuDisponiveis
                    ? <span className="is-invalid-effect">Quantidade superior às {grupo.elegiveis.length} vaga(s) disponíveis.</span>
                    : <span className="is-immediate">{reduzir} extinta(s) imediatamente</span>}
                  </td>
                </tr>;
              })}</tbody>
            </table>
          </section>
        )}
        {tipo === "EXTINCAO_PROGRESSIVA" && (
          <section className="prototype-legal-extinction-guidance">
            <MensagemSeplag
              severity="info"
              message={`A operação alcançará o quadro inteiro: ${resumoQuadro.disponiveis + resumoQuadro.pendentes} vaga(s) disponível(is) serão extintas e ${resumoQuadro.ocupadas} ocupada(s) permanecerão até a vacância.`}
            />
            {vagasDisponiveisComprometidas.length > 0 && (
              <MensagemSeplag
                severity="error"
                message={`${vagasDisponiveisComprometidas.length} vaga(s) disponível(is) possui(em) processo de ocupação ativo. Trate esses processos antes de registrar a extinção progressiva.`}
              />
            )}
            {extincaoJaIniciada && (
              <MensagemSeplag severity="warning" message="A extinção progressiva deste quadro já está em andamento e não pode ser iniciada novamente." />
            )}
          </section>
        )}        <div className="prototype-legal-fields prototype-legal-library-fields">
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
            required
            value={processo}
            onChange={(value) => {
              setProcesso(value);
              setResultado(null);
            }}
            cols="12 12 4"
          />
          {tipo !== "EXTINCAO_PROGRESSIVA" && tipo !== "REDUCAO" && (
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
              name="quadroDestinoId"
              control={operacaoControl}
              label="Quadro Autorizado de destino"
              required
              options={opcoesQuadroDestino}
              optionLabel="label"
              optionValue="value"
              onChange={() => {
                setResultado(null);
                setSalvo(false);
                setReducaoPorOrgao({});
              }}
              placeholder="Selecione o quadro de destino"
              cols="12 12 3"
              getFormErrorMessage={() => null}
            />
          )}
        </div>
        {tipo === "TRANSFORMACAO" && quadroDestino && (
          <section className="prototype-legal-destination-preview">
            <header><span>Quadro de destino selecionado</span><strong>{quadroDestino.codigo} · versão {quadroDestino.versao}</strong></header>
            <div>
              <article><span>Cargo</span><strong>{quadroDestino.cargo}</strong></article>
              <article><span>Autorizadas</span><strong>{quadroDestino.autorizadas}</strong></article>
              <article><span>Ocupadas</span><strong>{quadroDestino.ocupadas}</strong></article>
              <article><span>Comprometidas</span><strong>{quadroDestino.comprometidas}</strong></article>
              <article><span>Último sequencial</span><strong>{Math.max(0, ...vagasDestino.map((vaga) => vaga.sequencial))}</strong></article>
            </div>
          </section>
        )}        <div className="prototype-legal-simulate-action">
          <BotaoSeplag
            type="submit"
            label="Simular impacto legal"
            icon="pi pi-calculator"
            disabled={operacaoInvalida}
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
              <span>{tipo === "TRANSFORMACAO" ? "Origem resultante" : "Quadro resultante"}</span>
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
          {tipo === "EXTINCAO_PROGRESSIVA" && (
            <section className="prototype-legal-transformation-balance">
              <article><span>Extintas imediatamente</span><strong>{resultado.alteradas.filter((vaga) => vaga.situacaoLegal === "EXTINTA").length}</strong></article>
              <article><span>Mantidas até a vacância</span><strong>{resultado.alteradas.filter((vaga) => vaga.situacaoLegal === "EM_EXTINCAO").length}</strong></article>
              <article><span>Novos ingressos</span><strong>Bloqueados</strong></article>
              <article><span>Encerramento do quadro</span><strong>Após a última vacância</strong></article>
            </section>
          )}          {tipo === "TRANSFORMACAO" && quadroDestino && (
            <section className="prototype-legal-transformation-balance">
              <article><span>Livres transformadas</span><strong>{resultado.alteradas.filter((vaga) => vaga.estado === "DISPONIVEL").length}</strong></article>
              <article><span>Ocupadas transformadas</span><strong>{resultado.alteradas.filter((vaga) => vaga.estado === "OCUPADA").length}</strong></article>
              <article><span>Origem após transformação</span><strong>{resultado.quantitativoPosterior}</strong></article>
              <article><span>Destino após transformação</span><strong>{quadroDestino.autorizadas + resultado.criadas.length}</strong></article>
            </section>
          )}          {resultado.alertas.map((alerta) => (
            <MensagemSeplag key={alerta} severity="warning" message={alerta} />
          ))}
          {tipo === "AMPLIACAO" && resultado.criadas.length > 0 && (
            <MensagemSeplag
              severity="info"
              message="As novas vagas serão criadas como disponíveis, regulares e pendentes de ato de distribuição. A destinação deverá ser registrada no menu Distribuição."
            />
          )}
          {quantidadeImpactada > 0 && (
            <div className="prototype-legal-impact-list">
              <h4>{tipo === "REDUCAO" ? "Vagas reduzidas (do maior para o menor sequencial)" : "Amostra das vagas impactadas"}</h4>
              <table>
                <thead>
                  <tr>
                    <th>Sequencial</th>
                    <th>Identificador</th>
                    <th>Efeito</th>
                    <th>Estado</th>
                    <th>Situação legal</th>
                    {tipo === "AMPLIACAO" && <th>Distribuição</th>}
                  </tr>
                </thead>
                <tbody>
                  {(tipo === "TRANSFORMACAO" ? resultado.criadas : [...resultado.criadas, ...resultado.alteradas])
                    .slice(0, tipo === "REDUCAO" ? resultado.alteradas.length : 8)
                    .map((vaga, indice) => (
                      <tr key={vaga.id + "-" + vaga.situacaoLegal}>
                        <td><strong>{vaga.sequencial}</strong></td>
                        <td>
                          <strong>{vaga.id}</strong>
                        </td>
                        <td>
                          {tipo === "TRANSFORMACAO"
                            ? vaga.estado === "OCUPADA" ? "Ocupada transformada para o quadro de destino" : "Disponível transformada para o quadro de destino"
                            : resultado.criadas.some((item) => item.id === vaga.id)
                              ? "Nova vaga numerada"
                              : "Atualização preservando o código"}
                        </td>
                        <td>
                          {vaga.estado === "DISPONIVEL"
                            ? "Disponível"
                            : "Ocupada"}
                        </td>
                        <td>{vaga.situacaoLegal.replaceAll("_", " ")}</td>
                        {tipo === "AMPLIACAO" && (
                          <td>Pendente de ato de distribuição</td>
                        )}
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
              disabled={operacaoInvalida || salvo || quantidadeImpactada === 0}
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
