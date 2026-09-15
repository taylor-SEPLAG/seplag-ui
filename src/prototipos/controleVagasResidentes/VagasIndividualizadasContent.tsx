import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { DataTableStateEvent } from "primereact/datatable";
import { useSearchParams } from "react-router-dom";
import { useControleVagasStore } from "./controleVagasStore";
import type { Vaga } from "./types";
import "./vagasIndividualizadas.css";
import {
  BotaoIconSeplag,
  BotaoLimparFiltroSeplag,
  BotaoVoltarSeplag,
  DropdownFieldSeplag,
  ModalSeplag,
  TablePaginadoSeplag,
  TextFieldSeplag,
} from "../../componentes";
import type { ColumnMetaSeplag } from "../../componentes/TablePaginado";
import type { ResultsSeplag } from "../../interfaces/Results";

type SituacaoBolsa = "DISPONIVEL" | "EM_SELECAO" | "ATIVA";

interface FiltrosVagasBolsistas {
  quadro: string;
  orgao: string;
  bolsista: string;
  situacao: string;
}

interface VagaBolsistaView extends Vaga {
  identificadorExibicao: string;
  orgaoExibicao: string;
  situacaoBolsa: SituacaoBolsa;
  bolsistaAtual?: string;
  documentoLegal: string;
}

const filtrosIniciais: FiltrosVagasBolsistas = {
  quadro: "",
  orgao: "",
  bolsista: "",
  situacao: "",
};

const situacaoMeta: Record<SituacaoBolsa, { label: string; classe: string; icon: string }> = {
  DISPONIVEL: { label: "Disponível", classe: "disponivel", icon: "pi pi-check-circle" },
  EM_SELECAO: { label: "Em ocupação", classe: "em-ocupacao", icon: "pi pi-user-plus" },
  ATIVA: { label: "Ocupada", classe: "ocupada", icon: "pi pi-user" },
};

function resultadoVagas(
  itens: VagaBolsistaView[],
  pagina: number,
  porPagina: number,
): ResultsSeplag<VagaBolsistaView> {
  const totalPaginas = Math.max(1, Math.ceil(itens.length / porPagina));
  const paginaAtual = Math.min(pagina, totalPaginas - 1);
  const inicio = paginaAtual * porPagina;
  const content = itens.slice(inicio, inicio + porPagina);

  return {
    content,
    last: paginaAtual >= totalPaginas - 1,
    totalPages: totalPaginas,
    pageActual: paginaAtual,
    sizePage: porPagina,
    totalRecords: itens.length,
    size: content.length,
    number: paginaAtual,
    first: paginaAtual === 0,
    numberOfElements: content.length,
    empty: content.length === 0,
  };
}

export function VagasIndividualizadasContent() {
  const { vagas: todasVagas, quadros, comprometimentos, ocupacoes } =
    useControleVagasStore();
  const [searchParams] = useSearchParams();
  const { control, reset } = useForm<FiltrosVagasBolsistas>({
    defaultValues: {
      ...filtrosIniciais,
      quadro: searchParams.get("quadro") ?? "",
    },
  });
  const filtros = useWatch({ control });
  const quadroSelecionado = filtros.quadro ?? "";
  const [pagina, setPagina] = useState(0);
  const [porPagina, setPorPagina] = useState(10);
  const [vagaSelecionada, setVagaSelecionada] =
    useState<VagaBolsistaView | null>(null);

  const vagasBolsistas = useMemo(() => {
    const quadrosBolsistas = new Set(
      quadros
        .filter((quadro) => quadro.codigo.startsWith("QAB-"))
        .map((quadro) => quadro.codigo),
    );

    return todasVagas
      .filter((vaga) => quadrosBolsistas.has(vaga.quadroCodigo))
      .map((vaga) => {
        const ocupacao = ocupacoes.find(
          (item) => item.vagaId === vaga.id && item.situacao === "ATIVA",
        );
        const comprometimento = comprometimentos.find(
          (item) =>
            item.vagaId === vaga.id &&
            item.situacao === "ATIVO" &&
            item.natureza === "OCUPACAO",
        );
        const situacaoBolsa: SituacaoBolsa = ocupacao
          ? "ATIVA"
          : comprometimento
            ? "EM_SELECAO"
            : "DISPONIVEL";
        const quadro = quadros.find((item) => item.codigo === vaga.quadroCodigo);
        const sequencial = String(vaga.sequencial ?? 0).padStart(3, "0");

        return {
          ...vaga,
          identificadorExibicao: vaga.codigo || `${vaga.quadroCodigo}-${sequencial}`,
          orgaoExibicao: vaga.orgaoTitular?.trim().toLocaleUpperCase("pt-BR") === "ESTADO DE MATO GROSSO" ? "Pendente de distribuição" : vaga.orgaoTitular || "Pendente de distribuição",
          situacaoBolsa,
          bolsistaAtual: ocupacao?.pessoaNome,
          documentoLegal: quadro?.ato || vaga.lei || "Não informado",
        };
      });
  }, [comprometimentos, ocupacoes, quadros, todasVagas]);

  const vagasDoQuadro = useMemo(
    () => (quadroSelecionado ? vagasBolsistas.filter((vaga) => vaga.quadroCodigo === quadroSelecionado) : []),
    [quadroSelecionado, vagasBolsistas],
  );

  const opcoesQuadro = useMemo(() => {
    const codigos = new Set(vagasBolsistas.map((vaga) => vaga.quadroCodigo));
    return quadros
      .filter((quadro) => codigos.has(quadro.codigo))
      .map((quadro) => ({
        label: `${quadro.codigo} — ${quadro.cargo}`,
        value: quadro.codigo,
      }));
  }, [quadros, vagasBolsistas]);

  const opcoesOrgao = useMemo(
    () =>
      [...new Set(vagasBolsistas.map((vaga) => vaga.orgaoExibicao))]
        .filter((orgao) => orgao !== "Pendente de distribuição")
        .sort((a, b) => a.localeCompare(b, "pt-BR"))
        .map((value) => ({ label: value, value })),
    [vagasBolsistas],
  );

  const filtradas = useMemo(() => {
    const termoBolsista = (filtros.bolsista ?? "").trim().toLocaleLowerCase("pt-BR");

    return vagasDoQuadro.filter(
      (vaga) =>
        (!filtros.quadro || vaga.quadroCodigo === filtros.quadro) &&
        (!filtros.orgao || vaga.orgaoExibicao === filtros.orgao) &&
        (!termoBolsista ||
          (vaga.bolsistaAtual ?? "").toLocaleLowerCase("pt-BR").includes(termoBolsista)) &&
        (!filtros.situacao || vaga.situacaoBolsa === filtros.situacao),
    );
  }, [filtros, vagasDoQuadro]);

  useEffect(() => {
    setPagina(0);
  }, [filtros]);

  const totais = useMemo(() => {
    const quadro = quadros.find((item) => item.codigo === quadroSelecionado);
    const autorizadas = quadroSelecionado ? Number(quadro?.autorizadas ?? vagasDoQuadro.length) : 0;
    const distribuidas = vagasDoQuadro.filter((vaga) => vaga.orgaoExibicao !== "Pendente de distribuição");
    return {
      autorizadas,
      pendentes: Math.max(autorizadas - distribuidas.length, 0),
      disponiveis: distribuidas.filter((vaga) => vaga.situacaoBolsa === "DISPONIVEL").length,
      emOcupacao: distribuidas.filter((vaga) => vaga.situacaoBolsa === "EM_SELECAO").length,
      ocupadas: distribuidas.filter((vaga) => vaga.situacaoBolsa === "ATIVA").length,
    };
  }, [quadroSelecionado, quadros, vagasDoQuadro]);
  const colunas = useMemo<ColumnMetaSeplag<VagaBolsistaView>[]>(
    () => [
      {
        header: "Vaga de bolsa",
        body: (vaga) => (
          <div className="prototype-residentes-vaga-primary-cell">
            <strong>{vaga.identificadorExibicao}</strong>
            <small>{vaga.quadroCodigo}</small>
          </div>
        ),
      },
      {
        header: "Cargo bolsista",
        body: (vaga) => <strong>{vaga.cargo}</strong>,
      },
      {
        header: "Órgão",
        body: (vaga) =>
          vaga.orgaoExibicao === "Pendente de distribuição" ? (
            <span className="prototype-residentes-vaga-muted">
              Pendente de distribuição
            </span>
          ) : (
            vaga.orgaoExibicao
          ),
      },
      {
        header: "Bolsista atual",
        body: (vaga) =>
          vaga.bolsistaAtual ? (
            <div className="prototype-residentes-vaga-primary-cell">
              <strong>{vaga.bolsistaAtual}</strong>
              <small>Bolsa em andamento</small>
            </div>
          ) : (
            <span className="prototype-residentes-vaga-muted">Sem bolsista vinculado</span>
          ),
      },
      {
        header: "Situação",
        body: (vaga) => {
          const meta = situacaoMeta[vaga.situacaoBolsa];
          return (
            <span className={`prototype-residentes-vaga-state ${meta.classe}`}>
              <i className={meta.icon} /> {meta.label}
            </span>
          );
        },
      },
      {
        header: "Ações",
        body: (vaga) => (
          <BotaoIconSeplag
            type="button"
            icon="pi pi-eye"
            tooltip="Visualizar vaga de bolsa"
            severity="info"
            onClick={() => setVagaSelecionada(vaga)}
          />
        ),
      },
    ],
    [],
  );

  const limpar = () => {
    reset(filtrosIniciais);
    setPagina(0);
  };

  return (
    <div className="prototype-residentes-vaga-page prototype-residentes-vaga-page-seplag">
      <header className="prototype-residentes-vaga-header">
        <div>
          <h1>Vagas Individualizadas Bolsistas</h1>
          <p>
            Consulte as vagas de bolsa autorizadas por cargo, sua distribuição e a
            situação de cada bolsa.
          </p>
        </div>
      </header>

      {quadroSelecionado && (
      <section className="prototype-residentes-vaga-kpis prototype-residentes-vaga-kpis-seplag">
        <Kpi label="Vagas de bolsas autorizadas" value={totais.autorizadas} icon="pi pi-file-check" />
        <Kpi label="Pendentes de distribuição" value={totais.pendentes} icon="pi pi-share-alt" kind="warning" />
        <Kpi label="Disponíveis" value={totais.disponiveis} icon="pi pi-check-circle" kind="available" />
          <Kpi label="Em ocupação" value={totais.emOcupacao} icon="pi pi-user-plus" kind="warning" />
          <Kpi label="Ocupadas" value={totais.ocupadas} icon="pi pi-users" kind="occupied" />
      </section>
      )}

      <section className="prototype-residentes-vaga-card prototype-residentes-vaga-card-seplag">
        <div className="prototype-residentes-vaga-filters-seplag">
          <div className="prototype-residentes-vaga-seplag-field">
            <DropdownFieldSeplag<FiltrosVagasBolsistas>
              name="quadro"
              control={control}
              label="Quadro Autorizado Bolsistas"
              cols="12"
              options={opcoesQuadro}
              optionLabel="label"
              optionValue="value"
              showClear
              getFormErrorMessage={() => null}
            />
          </div>
          <div className="prototype-residentes-vaga-seplag-field">
            <DropdownFieldSeplag<FiltrosVagasBolsistas>
              name="orgao"
              control={control}
              label="Órgão"
              cols="12"
              options={opcoesOrgao}
              optionLabel="label"
              optionValue="value"
              showClear
              getFormErrorMessage={() => null}
            />
          </div>
          <div className="prototype-residentes-vaga-seplag-field">
            <TextFieldSeplag<FiltrosVagasBolsistas>
              name="bolsista"
              control={control}
              label="Bolsista atual"
              cols="12"
              icon="pi pi-search"
              placeholder="Nome do bolsista"
            />
          </div>
          <div className="prototype-residentes-vaga-seplag-field">
            <DropdownFieldSeplag<FiltrosVagasBolsistas>
              name="situacao"
              control={control}
              label="Situação"
              cols="12"
              options={[
                { label: "Disponível", value: "DISPONIVEL" },
                { label: "Em ocupação", value: "EM_SELECAO" },
                { label: "Ocupada", value: "ATIVA" },
              ]}
              optionLabel="label"
              optionValue="value"
              showClear
              getFormErrorMessage={() => null}
            />
          </div>
          <div className="prototype-residentes-vaga-filter-action">
            <BotaoLimparFiltroSeplag onClick={limpar} />
          </div>
        </div>

        <div className="prototype-residentes-vaga-library-table">
          <TablePaginadoSeplag<VagaBolsistaView>
            dataKey="id"
            data={resultadoVagas(filtradas, pagina, porPagina)}
            rows={porPagina}
            rowsPerPage={[10, 20, 50]}
            columns={colunas}
            handleOnPageChange={(evento: DataTableStateEvent) => {
              setPagina(evento.page ?? 0);
              setPorPagina(evento.rows);
            }}
            handleDelete={null}
            handleEdit={null}
            handleDuplicar={null}
            handleView={null}
            handleAdicionar={null}
            emptyMessage={quadroSelecionado ? "Nenhuma vaga de bolsa encontrada." : "Selecione um Quadro Autorizado Bolsistas para consultar as vagas."}
          />
        </div>
      </section>

      {vagaSelecionada && (
        <DetalheVagaBolsa
          vaga={vagaSelecionada}
          onClose={() => setVagaSelecionada(null)}
        />
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  icon,
  kind = "",
}: {
  label: string;
  value: number;
  icon: string;
  kind?: string;
}) {
  return (
    <article className={kind}>
      <i className={icon} />
      <div>
        <span>{label}</span>
        <strong>{value.toLocaleString("pt-BR")}</strong>
      </div>
    </article>
  );
}

function DetalheVagaBolsa({
  vaga,
  onClose,
}: {
  vaga: VagaBolsistaView;
  onClose: () => void;
}) {
  const meta = situacaoMeta[vaga.situacaoBolsa];

  return (
    <ModalSeplag
      visible
      titulo={
        <div className="prototype-residentes-vaga-modal-title">
          <span>Vaga de bolsa</span>
          <h2>{vaga.identificadorExibicao}</h2>
          <p>{vaga.cargo}</p>
        </div>
      }
      ariaLabel={`Detalhes da vaga de bolsa ${vaga.identificadorExibicao}`}
      tamanho="min(760px, 96vw)"
      fechar={onClose}
      customFooter={
        <BotaoVoltarSeplag
          type="button"
          label="Fechar"
          icon="pi pi-times"
          onClick={onClose}
        />
      }
    >
      <div className="col-12 prototype-residentes-vaga-detail-content">
        <div className="prototype-residentes-vaga-summary">
          <span className={`prototype-residentes-vaga-state ${meta.classe}`}>
            <i className={meta.icon} /> {meta.label}
          </span>
        </div>
        <section className="prototype-residentes-vaga-detail-section">
          <h3>Identificação da bolsa</h3>
          <dl>
            <div><dt>Quadro autorizado</dt><dd>{vaga.quadroCodigo}</dd></div>
            <div><dt>Cargo bolsista</dt><dd>{vaga.cargo}</dd></div>
            <div><dt>Órgão</dt><dd>{vaga.orgaoExibicao}</dd></div>
            <div><dt>Bolsista atual</dt><dd>{vaga.bolsistaAtual ?? "Sem bolsista vinculado"}</dd></div>
          </dl>
        </section>
        <section className="prototype-residentes-vaga-detail-section">
          <h3>Autorização</h3>
          <dl>
            <div><dt>Início da vigência</dt><dd>{vaga.inicioVigencia || "Não informado"}</dd></div>
            <div><dt>Documentos legais</dt><dd>{vaga.documentoLegal}</dd></div>
            <div><dt>Situação da bolsa</dt><dd>{meta.label}</dd></div>
          </dl>
        </section>
      </div>
    </ModalSeplag>
  );
}

