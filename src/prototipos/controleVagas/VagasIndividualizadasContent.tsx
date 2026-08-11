import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { DataTableStateEvent } from "primereact/datatable";
import { useControleVagasStore } from "./controleVagasStore";
import type {
  EstadoVaga,
  OcupacaoVaga,
  SituacaoLegalVaga,
  Vaga,
} from "./types";
import { Dropdown, type DropdownChangeEvent } from "primereact/dropdown";
import { Paginator, type PaginatorPageChangeEvent } from "primereact/paginator";
import { useSearchParams } from "react-router-dom";
import {
  carreirasBaseTemporaria,
  cargosBaseTemporaria,
  orgaosBaseTemporaria,
  perfisProfissionaisBaseTemporaria,
} from "./baseTemporaria";
import { calcularPosicaoVaga } from "./distribuicaoIndividual";
import "./vagasIndividualizadas.css";
import { SpecArea, SpecificationMode } from "../shared/visualizationModes";
import {
  vagasActionSpecifications,
  vagasBlockSpecifications,
  vagasBusinessItems,
  vagasFilterSpecifications,
  vagasKpiSpecifications,
  vagasScreenSpecification,
} from "./VagasIndividualizadasSpecifications";
import {
  BotaoLimparFiltroSeplag,
  BotaoVoltarSeplag,
  DropdownFieldSeplag,
  ModalSeplag,
  TablePaginadoSeplag,
  TextFieldSeplag,
} from "../../componentes";
import type { ColumnMetaSeplag } from "../../componentes/TablePaginado";
import type { ResultsSeplag } from "../../interfaces/Results";

const estadoLabel: Record<EstadoVaga, string> = {
  DISPONIVEL: "Disponível",
  OCUPADA: "Ocupada",
};
const legalLabel: Record<SituacaoLegalVaga, string> = {
  REGULAR: "Regular",
  DECISAO_JUDICIAL: "Decisão judicial",
  EM_EXTINCAO: "Em extinção",
  EXTINTA: "Extinta",
  EM_TRANSFORMACAO: "Em transformação",
};
const legalClass: Record<SituacaoLegalVaga, string> = {
  REGULAR: "regular",
  DECISAO_JUDICIAL: "judicial",
  EM_EXTINCAO: "extincao",
  EXTINTA: "extinta",
  EM_TRANSFORMACAO: "transformacao",
};

const fasesIngresso = [
  "Aguardando análise",
  "Em análise",
  "Aguardando Efetivo Exercício",
  "Posse Suspensa",
] as const;

const faseAtualDoComprometimento = (compromisso: import("./types").ComprometimentoVaga | undefined) =>
  compromisso?.fases.find((fase) => fase.situacao === "EM_ANDAMENTO");

interface VagasIndividualizadasFiltros {
  quadro: string;
  identificador: string;
  comprometimento: string;
  situacaoLegal: string;
}

const filtrosIniciais: VagasIndividualizadasFiltros = {
  quadro: "",
  identificador: "",
  comprometimento: "",
  situacaoLegal: "",
};

const resultadoVagas = (
  itens: Vaga[],
  pagina: number,
  porPagina: number,
): ResultsSeplag<Vaga> => {
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
};

export function VagasIndividualizadasContent() {
  const { vagas, quadros, comprometimentos, ocupacoes } =
    useControleVagasStore();
  const [searchParams] = useSearchParams();
  const { control, reset } = useForm<VagasIndividualizadasFiltros>({
    defaultValues: {
      ...filtrosIniciais,
      quadro: searchParams.get("quadro") ?? "",
    },
  });
  const filtros = useWatch({ control });
  const [vagaSelecionada, setVagaSelecionada] = useState<Vaga | null>(null);
  const [pagina, setPagina] = useState(0);
  const [porPagina, setPorPagina] = useState(10);

  const quadroSelecionado = filtros.quadro ?? "";
  const identificador = filtros.identificador ?? "";
  const comprometimento = filtros.comprometimento ?? "";
  const situacaoLegal = filtros.situacaoLegal ?? "";

  useEffect(() => {
    setPagina(0);
  }, [quadroSelecionado, identificador, comprometimento, situacaoLegal]);

  const opcoesQuadro = useMemo(() => {
    const codigosComVagas = new Set(vagas.map((item) => item.quadroCodigo));
    const opcoes = new Map<string, string>();

    quadros.forEach((item) => {
      if (codigosComVagas.has(item.codigo) && !opcoes.has(item.codigo)) {
        opcoes.set(item.codigo, `${item.codigo} - ${item.cargo}`);
      }
    });

    vagas.forEach((item) => {
      if (!opcoes.has(item.quadroCodigo)) {
        opcoes.set(item.quadroCodigo, `${item.quadroCodigo} - ${item.cargo}`);
      }
    });

    return [...opcoes].map(([value, label]) => ({ value, label }));
  }, [quadros, vagas]);

  const vagasDoQuadro = useMemo(
    () =>
      quadroSelecionado
        ? vagas.filter((item) => item.quadroCodigo === quadroSelecionado)
        : [],
    [quadroSelecionado, vagas],
  );

  const pessoasComMaisVinculos = useMemo(() => {
    const ativas = ocupacoes.filter((item) => item.situacao === "ATIVA");
    return new Set(
      ativas
        .filter((item, _, todos) =>
          todos.some(
            (outro) => outro.id !== item.id && outro.pessoaId === item.pessoaId,
          ),
        )
        .map((item) => item.pessoaId),
    );
  }, [ocupacoes]);

  const filtradas = useMemo(() => {
    const termo = identificador.trim().toLocaleLowerCase("pt-BR");

    return vagasDoQuadro.filter((item) => {
      const compromisso = comprometimentos.find(
        (registro) =>
          registro.vagaId === item.id && registro.situacao === "ATIVO" && registro.natureza === "OCUPACAO",
      );

      return (
        (!termo || item.id.toLocaleLowerCase("pt-BR").includes(termo)) &&
        (!comprometimento ||
          (comprometimento === "LIVRE"
            ? !compromisso
            : comprometimento === "OCUPACAO"
              ? Boolean(compromisso)
              : faseAtualDoComprometimento(compromisso)?.nome === comprometimento)) &&
        (!situacaoLegal ||
          (situacaoLegal === "ESPECIAL"
            ? item.situacaoLegal !== "REGULAR"
            : item.situacaoLegal === situacaoLegal))
      );
    });
  }, [
    comprometimento,
    comprometimentos,
    identificador,
    situacaoLegal,
    vagasDoQuadro,
  ]);

  const totais = useMemo(
    () =>
      vagasDoQuadro.reduce(
        (acumulado, item) => ({
          total: acumulado.total + 1,
          disponiveis:
            acumulado.disponiveis + (item.estado === "DISPONIVEL" ? 1 : 0),
          ocupadas: acumulado.ocupadas + (item.estado === "OCUPADA" ? 1 : 0),
          emOcupacao: acumulado.emOcupacao + (comprometimentos.some((registro) => registro.vagaId === item.id && registro.situacao === "ATIVO" && registro.natureza === "OCUPACAO") ? 1 : 0),
          excecoes:
            acumulado.excecoes + (item.situacaoLegal !== "REGULAR" ? 1 : 0),
        }),
        { total: 0, disponiveis: 0, ocupadas: 0, emOcupacao: 0, excecoes: 0 },
      ),
    [comprometimentos, vagasDoQuadro],
  );

  const getComprometimento = (vagaId: string) =>
    comprometimentos.find(
      (item) => item.vagaId === vagaId && item.situacao === "ATIVO" && item.natureza === "OCUPACAO",
    );

  const colunas = useMemo<ColumnMetaSeplag<Vaga>[]>(
    () => [
      {
        header: "Identificador",
        body: (item) => (
          <div className="prototype-vaga-primary-cell">
            <button
              type="button"
              className="prototype-vaga-link"
              onClick={() => setVagaSelecionada(item)}
            >
              {item.id}
            </button>
            <small>Sequencial {item.sequencial}</small>
          </div>
        ),
      },
      {
        header: "Cargo/Função",
        body: (item) => (
          <div className="prototype-vaga-primary-cell">
            <strong>{item.cargo}</strong>
            <small>{item.carreira}</small>
          </div>
        ),
      },
      { header: "Órgão titular", field: "orgaoTitular" },
      {
        header: "Ocupante atual",
        body: (item) => {
          const ocupacaoAtual = ocupacoes.find(
            (registro) =>
              registro.vagaId === item.id && registro.situacao === "ATIVA",
          );
          const possuiMaisVinculos = Boolean(
            ocupacaoAtual && pessoasComMaisVinculos.has(ocupacaoAtual.pessoaId),
          );

          return ocupacaoAtual ? (
            <div className="prototype-vaga-primary-cell">
              <strong>{ocupacaoAtual.pessoaNome}</strong>
              <small>
                {ocupacaoAtual.matricula} · {ocupacaoAtual.vinculoId}
              </small>
              {possuiMaisVinculos && (
                <span className="prototype-vaga-multiple-link">
                  <i className="pi pi-clone" /> Mais de um vínculo
                </span>
              )}
            </div>
          ) : (
            <span className="prototype-vaga-muted">Sem ocupante atual</span>
          );
        },
      },
      {
        header: "Ingresso/ocupação",
        body: (item) => {
          const compromisso = getComprometimento(item.id);
          const faseAtual = faseAtualDoComprometimento(compromisso);

          return compromisso ? (
            <span
              className={`prototype-vaga-commit ${compromisso.natureza.toLowerCase()}`}
            >
              <i className="pi pi-flag" />
              {faseAtual?.nome ?? "Aguardando análise"}
            </span>
          ) : (
            <span className="prototype-vaga-muted">Sem ingresso ativo</span>
          );
        },
      },
      {
        header: "Situação legal",
        body: (item) => (
          <span
            className={`prototype-vaga-legal ${legalClass[item.situacaoLegal]}`}
          >
            {legalLabel[item.situacaoLegal]}
          </span>
        ),
      },
    ],
    [comprometimentos, ocupacoes, pessoasComMaisVinculos],
  );

  const limpar = () => {
    reset(filtrosIniciais);
    setPagina(0);
  };

  const alterarPagina = (event: DataTableStateEvent) => {
    setPagina(event.page ?? 0);
    setPorPagina(event.rows);
  };

  return (
    <SpecificationMode
      screen={vagasScreenSpecification}
      businessItems={vagasBusinessItems}
    >
      <div className="prototype-vaga-page prototype-vaga-page-seplag">
        <header className="prototype-vaga-header">
          <SpecArea metadata={vagasScreenSpecification}>
            <div>
              <h1>Vagas Individualizadas</h1>
              <p>
                Consulte as vagas numeradas vinculadas a um Quadro Autorizado.
              </p>
            </div>
          </SpecArea>
        </header>

        {quadroSelecionado && (
          <section className="prototype-vaga-kpis prototype-vaga-kpis-seplag">
            <Kpi
              label="Vagas individualizadas"
              value={totais.total}
              icon="pi pi-list"
            />
            <Kpi
              label="Disponíveis"
              value={totais.disponiveis}
              icon="pi pi-check-circle"
              kind="available"
            />
            <Kpi
              label="Em ocupação"
              value={totais.emOcupacao}
              icon="pi pi-flag"
              kind="warning"
            />
            <Kpi
              label="Ocupadas"
              value={totais.ocupadas}
              icon="pi pi-users"
              kind="occupied"
            />
            <Kpi
              label="Situação legal especial"
              value={totais.excecoes}
              icon="pi pi-balance-scale"
              kind="warning"
            />
          </section>
        )}

        <section className="prototype-vaga-card prototype-vaga-card-seplag">
          <div className="prototype-vaga-filters-seplag">
            <div className="prototype-vaga-seplag-field">
              <DropdownFieldSeplag<VagasIndividualizadasFiltros>
                name="quadro"
                control={control}
                label="Quadro Autorizado"
                cols="12"
                options={opcoesQuadro}
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione"
                filter
                filterPlaceholder="Pesquisar quadro"
                showClear
                getFormErrorMessage={() => null}
              />
            </div>
            <div className="prototype-vaga-seplag-field">
              <TextFieldSeplag<VagasIndividualizadasFiltros>
                name="identificador"
                control={control}
                label="Identificador"
                cols="12"
                icon="pi pi-search"
                placeholder="Ex: VAG-SEPLAG-00001"
                disabled={!quadroSelecionado}
              />
            </div>
            <div className="prototype-vaga-seplag-field">
              <DropdownFieldSeplag<VagasIndividualizadasFiltros>
                name="comprometimento"
                control={control}
                label="Ingresso/ocupação"
                cols="12"
                options={[
                  { label: "Sem ingresso ativo", value: "LIVRE" },
                  { label: "Com ingresso ativo", value: "OCUPACAO" },
                  ...fasesIngresso.map((fase) => ({ label: fase, value: fase })),
                ]}
                optionLabel="label"
                optionValue="value"
                placeholder="Todos"
                showClear
                disabled={!quadroSelecionado}
                getFormErrorMessage={() => null}
              />
            </div>
            <div className="prototype-vaga-seplag-field">
              <DropdownFieldSeplag<VagasIndividualizadasFiltros>
                name="situacaoLegal"
                control={control}
                label="Situação legal"
                cols="12"
                options={[
                  { label: "Situações especiais", value: "ESPECIAL" },
                  ...Object.entries(legalLabel).map(([value, label]) => ({
                    label,
                    value,
                  })),
                ]}
                optionLabel="label"
                optionValue="value"
                placeholder="Todas"
                showClear
                disabled={!quadroSelecionado}
                getFormErrorMessage={() => null}
              />
            </div>
            <div className="prototype-vaga-seplag-field prototype-vaga-clear">
              <BotaoLimparFiltroSeplag type="button" onClick={limpar} />
            </div>
          </div>

          {quadroSelecionado ? (
            <SpecArea metadata={vagasBlockSpecifications.Tabela}>
              <div className="prototype-vaga-library-table">
                <TablePaginadoSeplag<Vaga>
                  dataKey="id"
                  data={resultadoVagas(filtradas, pagina, porPagina)}
                  rows={porPagina}
                  rowsPerPage={[10, 20, 50]}
                  columns={colunas}
                  lazy
                  selectionMode={null}
                  hasEventoAcao
                  handleOnPageChange={alterarPagina}
                  handleView={setVagaSelecionada}
                  handleEdit={null}
                  handleDelete={null}
                  handleAdicionar={null}
                />
              </div>
            </SpecArea>
          ) : (
            <div className="prototype-vaga-initial-state" role="status">
              <i className="pi pi-list" aria-hidden="true" />
              <div>
                <strong>Selecione um Quadro Autorizado</strong>
                <span>
                  As vagas individualizadas serão apresentadas após a seleção.
                </span>
              </div>
            </div>
          )}
        </section>

        {vagaSelecionada && (
          <VagaDetalhe
            vaga={vagaSelecionada}
            onClose={() => setVagaSelecionada(null)}
          />
        )}
      </div>
    </SpecificationMode>
  );
}

function VagasIndividualizadasLegacy() {
  const { vagas, comprometimentos, ocupacoes } = useControleVagasStore();
  const [searchParams] = useSearchParams();
  const getComprometimento = (vagaId: string) =>
    comprometimentos.find(
      (item) => item.vagaId === vagaId && item.situacao === "ATIVO" && item.natureza === "OCUPACAO",
    );
  const [busca, setBusca] = useState("");
  const [orgao, setOrgao] = useState(() => searchParams.get("orgao") ?? "");
  const [carreira, setCarreira] = useState("");
  const [cargo, setCargo] = useState(() => searchParams.get("cargo") ?? "");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState(() => searchParams.get("estado") ?? "");
  const [comprometimento, setComprometimento] = useState(
    () => searchParams.get("comprometimento") ?? "",
  );
  const [ocupacaoFiltro, setOcupacaoFiltro] = useState("");
  const [legal, setLegal] = useState(() => searchParams.get("legal") ?? "");
  const [lei, setLei] = useState("");
  const [mostrarIdentificador, setMostrarIdentificador] = useState(true);
  const [mostrarOrgao, setMostrarOrgao] = useState(true);
  const [mostrarCargoCarreira, setMostrarCargoCarreira] = useState(true);
  const [mostrarTipo, setMostrarTipo] = useState(true);
  const [mostrarEstado, setMostrarEstado] = useState(true);
  const [mostrarOcupacao, setMostrarOcupacao] = useState(true);
  const [mostrarComprometimento, setMostrarComprometimento] = useState(true);
  const [mostrarSituacaoLegal, setMostrarSituacaoLegal] = useState(true);
  const [mostrarLei, setMostrarLei] = useState(true);
  const [vaga, setVaga] = useState<Vaga | null>(null);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const pessoasComMaisVinculos = useMemo(() => {
    const ativas = ocupacoes.filter((item) => item.situacao === "ATIVA");
    return new Set(
      ativas
        .filter((item, _, todos) =>
          todos.some(
            (outro) => outro.id !== item.id && outro.pessoaId === item.pessoaId,
          ),
        )
        .map((item) => item.pessoaId),
    );
  }, [ocupacoes]);
  const filtradas = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return vagas.filter((v) => {
      const compromisso = comprometimentos.find(
        (item) => item.vagaId === v.id && item.situacao === "ATIVO",
      );
      const ocupacoesDaVaga = ocupacoes.filter((item) => item.vagaId === v.id);
      const ocupacaoAtual = ocupacoesDaVaga.find(
        (item) => item.situacao === "ATIVA",
      );
      const atendeOcupacao =
        !ocupacaoFiltro ||
        (ocupacaoFiltro === "ATUAL"
          ? Boolean(ocupacaoAtual)
          : ocupacaoFiltro === "HISTORICO"
            ? ocupacoesDaVaga.some((item) => item.situacao === "ENCERRADA")
            : ocupacaoFiltro === "MULTIPLO"
              ? Boolean(
                  ocupacaoAtual &&
                  pessoasComMaisVinculos.has(ocupacaoAtual.pessoaId),
                )
              : ocupacaoFiltro === "SEM_HISTORICO"
                ? ocupacoesDaVaga.length === 0
                : true);
      return (
        (!t || v.id.toLowerCase().includes(t)) &&
        (!orgao || v.orgaoTitular === orgao) &&
        (!carreira || v.carreira === carreira) &&
        (!cargo || v.cargo === cargo) &&
        (!tipo || v.tipo === tipo) &&
        (!estado || v.estado === estado) &&
        (!comprometimento ||
          (comprometimento === "LIVRE"
            ? !compromisso
            : comprometimento === "OCUPACAO"
              ? Boolean(compromisso)
              : faseAtualDoComprometimento(compromisso)?.nome === comprometimento)) &&
        atendeOcupacao &&
        (!legal ||
          (legal === "ESPECIAL"
            ? v.situacaoLegal !== "REGULAR"
            : v.situacaoLegal === legal)) &&
        (!lei || v.lei === lei)
      );
    });
  }, [
    busca,
    orgao,
    carreira,
    cargo,
    tipo,
    estado,
    comprometimento,
    ocupacaoFiltro,
    legal,
    lei,
    vagas,
    comprometimentos,
    ocupacoes,
    pessoasComMaisVinculos,
  ]);
  const paginas = Math.max(1, Math.ceil(filtradas.length / porPagina));
  const exibidas = filtradas.slice(
    (Math.min(pagina, paginas) - 1) * porPagina,
    Math.min(pagina, paginas) * porPagina,
  );
  const totais = vagas.reduce(
    (a, v) => ({
      total: a.total + 1,
      disponiveis: a.disponiveis + (v.estado === "DISPONIVEL" ? 1 : 0),
      ocupadas: a.ocupadas + (v.estado === "OCUPADA" ? 1 : 0),
      excecoes: a.excecoes + (v.situacaoLegal !== "REGULAR" ? 1 : 0),
    }),
    { total: 0, disponiveis: 0, ocupadas: 0, emOcupacao: 0, excecoes: 0 },
  );
  const limpar = () => {
    setBusca("");
    setOrgao("");
    setCarreira("");
    setCargo("");
    setTipo("");
    setEstado("");
    setComprometimento("");
    setOcupacaoFiltro("");
    setLegal("");
    setLei("");
    setPagina(1);
  };
  const opcoesOrgaos = [
    ...new Set([
      ...orgaosBaseTemporaria.map((item) => item.nome),
      ...vagas.map((vaga) => vaga.orgaoTitular),
    ]),
  ];
  const opcoesCarreiras = [
    ...new Set([
      ...carreirasBaseTemporaria.map((item) => item.nome),
      ...vagas.map((vaga) => vaga.carreira),
    ]),
  ];
  const opcoesCargos = [
    ...new Set([
      ...cargosBaseTemporaria.map((item) => item.nome),
      ...vagas.map((vaga) => vaga.cargo),
    ]),
  ];
  return (
    <SpecificationMode
      screen={vagasScreenSpecification}
      businessItems={vagasBusinessItems}
    >
      <div className="prototype-vaga-page">
        <header className="prototype-vaga-header">
          <SpecArea metadata={vagasScreenSpecification}>
            <div>
              <h1>Vagas Individualizadas</h1>
              <p>
                Identificação, estado operacional, fundamento legal e histórico
                de cada vaga.
              </p>
            </div>
          </SpecArea>
        </header>
        <section className="prototype-vaga-kpis">
          <Kpi
            label="Vagas individualizadas"
            value={totais.total}
            icon="pi pi-list"
          />
          <Kpi
            label="Disponíveis"
            value={totais.disponiveis}
            icon="pi pi-check-circle"
            kind="available"
          />
          <Kpi
            label="Ocupadas"
            value={totais.ocupadas}
            icon="pi pi-users"
            kind="occupied"
          />
          <Kpi
            label="Situação legal especial"
            value={totais.excecoes}
            icon="pi pi-balance-scale"
            kind="warning"
          />
          <Kpi
            label="Pessoas com mais de um vínculo"
            value={pessoasComMaisVinculos.size}
            icon="pi pi-clone"
            kind="dual"
          />
        </section>
        <section className="prototype-vaga-card">
          <div className="prototype-vaga-filters">
            <SpecArea metadata={vagasFilterSpecifications.Identificador}>
              <label className="wide">
                <span>
                  Identificador
                  <button
                    type="button"
                    className="prototype-vaga-column-visibility"
                    onClick={() => setMostrarIdentificador((valor) => !valor)}
                    title={
                      mostrarIdentificador ? "Ocultar coluna" : "Exibir coluna"
                    }
                    aria-label={
                      mostrarIdentificador
                        ? "Ocultar coluna de identificador"
                        : "Exibir coluna de identificador"
                    }
                  >
                    <i
                      className={
                        mostrarIdentificador ? "pi pi-eye" : "pi pi-eye-slash"
                      }
                    />
                  </button>
                </span>
                <div>
                  <i className="pi pi-search" />
                  <input
                    value={busca}
                    onChange={(e) => {
                      setBusca(e.target.value);
                      setPagina(1);
                    }}
                    placeholder="Pesquisar identificador"
                  />
                </div>
              </label>
            </SpecArea>
            <FiltroPesquisa
              label="Órgão titular"
              visibility={{
                visible: mostrarOrgao,
                onToggle: () => setMostrarOrgao((valor) => !valor),
              }}
              value={orgao}
              options={opcoesOrgaos}
              onChange={(valor) => {
                setOrgao(valor);
                setPagina(1);
              }}
            />
            <FiltroPesquisa
              label="Carreira"
              visibility={{
                visible: mostrarCargoCarreira,
                onToggle: () => setMostrarCargoCarreira((valor) => !valor),
              }}
              value={carreira}
              options={opcoesCarreiras}
              onChange={(valor) => {
                setCarreira(valor);
                setPagina(1);
              }}
            />
            <FiltroPesquisa
              label="Cargo"
              visibility={{
                visible: mostrarCargoCarreira,
                onToggle: () => setMostrarCargoCarreira((valor) => !valor),
              }}
              value={cargo}
              options={opcoesCargos}
              onChange={(valor) => {
                setCargo(valor);
                setPagina(1);
              }}
            />
            <FiltroPesquisa
              label="Tipo"
              visibility={{
                visible: mostrarTipo,
                onToggle: () => setMostrarTipo((valor) => !valor),
              }}
              value={tipo}
              options={[
                { label: "Efetivo", value: "EFETIVO" },
                { label: "Comissionado", value: "COMISSIONADO" },
              ]}
              onChange={(valor) => {
                setTipo(valor);
                setPagina(1);
              }}
              searchable={false}
            />
            <FiltroPesquisa
              label="Estado"
              visibility={{
                visible: mostrarEstado,
                onToggle: () => setMostrarEstado((valor) => !valor),
              }}
              value={estado}
              options={[
                { label: "Disponível", value: "DISPONIVEL" },
                { label: "Ocupada", value: "OCUPADA" },
              ]}
              onChange={(valor) => {
                setEstado(valor);
                setPagina(1);
              }}
              searchable={false}
            />
            <FiltroPesquisa
              label="Ingresso/ocupação"
              value={comprometimento}
              options={[
                { label: "Sem processo ativo", value: "LIVRE" },
                { label: "Para ocupação", value: "OCUPACAO" },
                { label: "Para disponibilização", value: "DISPONIBILIZACAO" },
              ]}
              onChange={(valor) => {
                setComprometimento(valor);
                setPagina(1);
              }}
              searchable={false}
              visibility={{
                visible: mostrarComprometimento,
                onToggle: () => setMostrarComprometimento((valor) => !valor),
              }}
            />
            <FiltroPesquisa
              label="Ocupação"
              visibility={{
                visible: mostrarOcupacao,
                onToggle: () => setMostrarOcupacao((valor) => !valor),
              }}
              value={ocupacaoFiltro}
              options={[
                { label: "Com ocupante atual", value: "ATUAL" },
                { label: "Com histórico anterior", value: "HISTORICO" },
                { label: "Pessoa com mais de um vínculo", value: "MULTIPLO" },
                { label: "Sem histórico de ocupação", value: "SEM_HISTORICO" },
              ]}
              onChange={(valor) => {
                setOcupacaoFiltro(valor);
                setPagina(1);
              }}
              searchable={false}
            />
            <FiltroPesquisa
              label="Situação legal"
              visibility={{
                visible: mostrarSituacaoLegal,
                onToggle: () => setMostrarSituacaoLegal((valor) => !valor),
              }}
              value={legal}
              options={[
                { label: "Situações especiais", value: "ESPECIAL" },
                ...Object.entries(legalLabel).map(([value, label]) => ({
                  label,
                  value,
                })),
              ]}
              onChange={(valor) => {
                setLegal(valor);
                setPagina(1);
              }}
              searchable={false}
            />
            <FiltroPesquisa
              label="Lei"
              visibility={{
                visible: mostrarLei,
                onToggle: () => setMostrarLei((valor) => !valor),
              }}
              value={lei}
              options={[...new Set(vagas.map((item) => item.lei))]}
              onChange={(valor) => {
                setLei(valor);
                setPagina(1);
              }}
            />
            <SpecArea metadata={vagasActionSpecifications.Limpar}>
              <button onClick={limpar}>
                <i className="pi pi-filter-slash" /> Limpar
              </button>
            </SpecArea>
          </div>{" "}
          <SpecArea metadata={vagasBlockSpecifications.Tabela}>
            <div className="prototype-vaga-table">
              <table>
                <thead>
                  <tr>
                    {mostrarIdentificador && <th>Identificador</th>}
                    {mostrarCargoCarreira && <th>Cargo e carreira</th>}
                    {mostrarOrgao && <th>Órgão titular</th>}
                    {mostrarTipo && <th>Tipo</th>}
                    {mostrarEstado && <th>Estado</th>}
                    {mostrarOcupacao && (
                      <>
                        <th>Ocupante atual</th>
                        <th>Matrícula e vínculo</th>
                      </>
                    )}
                    {mostrarComprometimento && <th>Comprometimento</th>}
                    {mostrarSituacaoLegal && <th>Situação legal</th>}
                    {mostrarLei && <th>Lei</th>}
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {exibidas.map((v) => {
                    const ocupacaoAtual = ocupacoes.find(
                      (item) =>
                        item.vagaId === v.id && item.situacao === "ATIVA",
                    );
                    const vinculosMultiplos = Boolean(
                      ocupacaoAtual &&
                      pessoasComMaisVinculos.has(ocupacaoAtual.pessoaId),
                    );
                    const compromisso = getComprometimento(v.id);
                    const faseAtual = compromisso?.fases.find(
                      (fase) => fase.situacao === "EM_ANDAMENTO",
                    );
                    return (
                      <tr key={v.id}>
                        {mostrarIdentificador && (
                          <td>
                            <button
                              className="prototype-vaga-link"
                              onClick={() => setVaga(v)}
                            >
                              {v.id}
                            </button>
                            <small>
                              {v.quadroCodigo} • sequencial {v.sequencial}
                            </small>
                          </td>
                        )}
                        {mostrarCargoCarreira && (
                          <td>
                            <strong>{v.cargo}</strong>
                            <small>{v.carreira}</small>
                          </td>
                        )}
                        {mostrarOrgao && <td>{v.orgaoTitular}</td>}
                        {mostrarTipo && (
                          <td>
                            <span className="prototype-vaga-type">
                              {v.tipo === "EFETIVO"
                                ? "Efetivo"
                                : "Comissionado"}
                            </span>
                          </td>
                        )}
                        {mostrarEstado && (
                          <td>
                            <span
                              className={
                                "prototype-vaga-state " + v.estado.toLowerCase()
                              }
                            >
                              <i
                                className={
                                  v.estado === "DISPONIVEL"
                                    ? "pi pi-check-circle"
                                    : "pi pi-user"
                                }
                              />
                              {estadoLabel[v.estado]}
                            </span>
                          </td>
                        )}
                        {mostrarOcupacao && (
                          <>
                            <td>
                              {ocupacaoAtual ? (
                                <>
                                  <strong>{ocupacaoAtual.pessoaNome}</strong>
                                  <small>{ocupacaoAtual.cpf}</small>
                                  {vinculosMultiplos && (
                                    <span className="prototype-vaga-multiple-link">
                                      <i className="pi pi-clone" /> Mais de um
                                      vínculo
                                    </span>
                                  )}
                                </>
                              ) : (
                                <small>Sem ocupante atual</small>
                              )}
                            </td>
                            <td>
                              {ocupacaoAtual ? (
                                <>
                                  <strong>{ocupacaoAtual.matricula}</strong>
                                  <small>
                                    {ocupacaoAtual.vinculoId} •{" "}
                                    {ocupacaoAtual.tipoVinculo}
                                  </small>
                                </>
                              ) : (
                                <span>—</span>
                              )}
                            </td>
                          </>
                        )}
                        {mostrarComprometimento && (
                          <td>
                            {compromisso ? (
                              <span
                                className={
                                  "prototype-vaga-commit " +
                                  compromisso.natureza.toLowerCase()
                                }
                              >
                                <i className="pi pi-flag" />
                                {faseAtual?.nome ??
                                  "Aguardando evento definitivo"}
                              </span>
                            ) : (
                              <span>—</span>
                            )}
                          </td>
                        )}
                        {mostrarSituacaoLegal && (
                          <td>
                            <span
                              className={
                                "prototype-vaga-legal " +
                                legalClass[v.situacaoLegal]
                              }
                            >
                              {legalLabel[v.situacaoLegal]}
                            </span>
                          </td>
                        )}
                        {mostrarLei && (
                          <td>
                            <span className="prototype-vaga-law">{v.lei}</span>
                          </td>
                        )}
                        <td>
                          <button
                            className="prototype-vaga-detail-button"
                            onClick={() => setVaga(v)}
                            title="Visualizar vaga"
                          >
                            <i className="pi pi-eye" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SpecArea>
          <SpecArea metadata={vagasActionSpecifications.Paginação}>
            <footer className="prototype-vaga-pagination">
              <Paginator
                first={(Math.min(pagina, paginas) - 1) * porPagina}
                rows={porPagina}
                totalRecords={filtradas.length}
                rowsPerPageOptions={[10, 20, 50]}
                onPageChange={(event: PaginatorPageChangeEvent) => {
                  setPagina(event.page + 1);
                  setPorPagina(event.rows);
                }}
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
              />
            </footer>
          </SpecArea>
        </section>{" "}
        {vaga && <VagaDetalhe vaga={vaga} onClose={() => setVaga(null)} />}
      </div>
    </SpecificationMode>
  );
}
type OpcaoFiltro = string | { label: string; value: string };
function FiltroPesquisa({
  label,
  value,
  options,
  onChange,
  searchable = true,
  visibility,
}: {
  label: string;
  value: string;
  options: OpcaoFiltro[];
  onChange: (valor: string) => void;
  searchable?: boolean;
  visibility?: { visible: boolean; onToggle: () => void };
}) {
  const normalizadas = options.map((opcao) =>
    typeof opcao === "string" ? { label: opcao, value: opcao } : opcao,
  );
  return (
    <SpecArea metadata={vagasFilterSpecifications[label]}>
      <label>
        <span>
          {label}
          {visibility && (
            <button
              type="button"
              className="prototype-vaga-column-visibility"
              onClick={visibility.onToggle}
              title={visibility.visible ? "Ocultar coluna" : "Exibir coluna"}
              aria-label={
                visibility.visible
                  ? `Ocultar coluna ${label}`
                  : `Exibir coluna ${label}`
              }
            >
              <i
                className={visibility.visible ? "pi pi-eye" : "pi pi-eye-slash"}
              />
            </button>
          )}
        </span>
        <Dropdown
          value={value || null}
          options={normalizadas}
          optionLabel="label"
          optionValue="value"
          placeholder="Todos"
          showClear
          filter={searchable}
          filterPlaceholder="Pesquisar"
          emptyFilterMessage="Nenhum resultado encontrado"
          className="prototype-vaga-filter-dropdown"
          onChange={(event: DropdownChangeEvent) =>
            onChange(String(event.value ?? ""))
          }
        />
      </label>
    </SpecArea>
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
    <SpecArea metadata={vagasKpiSpecifications[label]}>
      <article className={kind}>
        <i className={icon} />
        <div>
          <span>{label}</span>
          <strong>{value.toLocaleString("pt-BR")}</strong>
        </div>
      </article>
    </SpecArea>
  );
}
function VagaDetalhe({ vaga, onClose }: { vaga: Vaga; onClose: () => void }) {
  const { movimentos } = useControleVagasStore();
  const hoje = new Date();
  const dataReferencia = [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, "0"),
    String(hoje.getDate()).padStart(2, "0"),
  ].join("-");
  const distribuicao = calcularPosicaoVaga(vaga, movimentos, dataReferencia);
  return (
    <ModalSeplag
      visible
      titulo={
        <div className="prototype-vaga-modal-title">
          <span>Vaga individual</span>
          <h2>{vaga.id}</h2>
          <p>Identificador imutável · criado em {vaga.criadaEm}</p>
        </div>
      }
      ariaLabel={`Detalhes da vaga ${vaga.id}`}
      tamanho="min(1100px, 96vw)"
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
      <div className="col-12 prototype-vaga-detail-content">
        <div className="prototype-vaga-summary">
          <span className={`prototype-vaga-state ${vaga.estado.toLowerCase()}`}>
            <i
              className={
                vaga.estado === "DISPONIVEL"
                  ? "pi pi-check-circle"
                  : "pi pi-user"
              }
            />
            {estadoLabel[vaga.estado]}
          </span>
          <span
            className={`prototype-vaga-legal ${legalClass[vaga.situacaoLegal]}`}
          >
            {legalLabel[vaga.situacaoLegal]}
          </span>
        </div>
        <div className="prototype-vaga-detail-grid">
          <section>
            <h3>Vinculação legal</h3>
            <dl>
              <div>
                <dt>Quadro autorizado</dt>
                <dd>{vaga.quadroCodigo}</dd>
              </div>
              <div>
                <dt>Tipo</dt>
                <dd>
                  {vaga.tipo === "EFETIVO"
                    ? "Cargo efetivo"
                    : "Cargo comissionado"}
                </dd>
              </div>
              <div className="full">
                <dt>Lei</dt>
                <dd>{vaga.lei}</dd>
              </div>
              <div>
                <dt>Carreira</dt>
                <dd>{vaga.carreira}</dd>
              </div>
              <div>
                <dt>Cargo</dt>
                <dd>{vaga.cargo}</dd>
              </div>
              <div>
                <dt>Perfil profissional</dt>
                <dd>{vaga.perfilProfissional || "Não informado"}</dd>
              </div>
              <div>
                <dt>CBO eSocial</dt>
                <dd>
                  {perfisProfissionaisBaseTemporaria.find(
                    (item) => item.nome === vaga.perfilProfissional,
                  )?.cboEsocial ?? "Não informado"}
                </dd>
              </div>
              <div>
                <dt>Órgão titular</dt>
                <dd>{vaga.orgaoTitular}</dd>
              </div>
              <div>
                <dt>Destinação prevista na lei</dt>
                <dd>{distribuicao.destinacaoPrevistaLei}</dd>
              </div>
              <div>
                <dt>Distribuição atual</dt>
                <dd>
                  {distribuicao.orgaoDistribuicao ??
                    "Pendente de ato de distribuição"}
                  {distribuicao.unidadeDistribuicao
                    ? ` • ${distribuicao.unidadeDistribuicao}`
                    : ""}
                </dd>
              </div>
              <div>
                <dt>Ato de distribuição</dt>
                <dd>
                  {distribuicao.atoDistribuicao ?? "Aguardando ato formal"}
                </dd>
              </div>
              <div>
                <dt>Vigência da distribuição</dt>
                <dd>{distribuicao.inicioVigenciaDistribuicao ?? "—"}</dd>
              </div>
              <div>
                <dt>Início da vigência do quadro</dt>
                <dd>{vaga.inicioVigencia}</dd>
              </div>
            </dl>
          </section>
          <section>
            <h3>Integridade do identificador</h3>
            <div className="prototype-vaga-id-parts">
              <code>{vaga.id}</code>
              <div>
                <span>VAG</span>
                <small>Entidade</small>
              </div>
              <div>
                <span>{vaga.orgaoTitular}</span>
                <small>Órgão</small>
              </div>
              <div>
                <span>{vaga.cargo.slice(0, 10)}</span>
                <small>Cargo</small>
              </div>
              <div>
                <span>{String(vaga.sequencial).padStart(5, "0")}</span>
                <small>Sequencial</small>
              </div>
            </div>
            <div className="prototype-vaga-integrity">
              <i className="pi pi-shield" />
              <span>
                O histórico é acrescido por novos eventos. Registros anteriores
                não são editados ou removidos.
              </span>
            </div>
          </section>
        </div>
        <OcupantesDaVaga vagaId={vaga.id} />
        <section className="prototype-vaga-history">
          <header>
            <div>
              <h3>Histórico imutável</h3>
              <p>{vaga.historico.length} eventos registrados.</p>
            </div>
          </header>
          <ol>
            {[...vaga.historico].reverse().map((h, index) => (
              <li key={h.id}>
                <i className={index === 0 ? "active" : ""} />
                <div className="date">
                  <strong>{h.dataEfeito}</strong>
                  <small>registrado em {h.ocorridoEm}</small>
                </div>
                <div className="event">
                  <strong>{h.titulo}</strong>
                  <p>{h.descricao}</p>
                  <small>
                    {h.origem} • {h.usuario}
                    {h.processo ? ` • ${h.processo}` : ""}
                  </small>
                </div>
                {h.estadoAnterior && (
                  <span>
                    {estadoLabel[h.estadoAnterior]} →{" "}
                    {estadoLabel[h.estadoPosterior!]}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </ModalSeplag>
  );
}
function PosicaoFuncionalDaVaga({ vaga }: { vaga: Vaga }) {
  const { ocupacoes, movimentacoesFuncionais } = useControleVagasStore();
  const ocupacao = ocupacoes.find(
    (item) => item.vagaId === vaga.id && item.situacao === "ATIVA",
  );
  const relacionadas = movimentacoesFuncionais.filter(
    (item) => item.vagaOrigemId === vaga.id || item.vagaDestinoId === vaga.id,
  );
  const encerrada = (situacao: string) =>
    ["EFETIVADA", "DEVOLVIDA", "REJEITADA", "CANCELADA", "ENCERRADA"].includes(
      situacao,
    );
  const cessao = relacionadas.find(
    (item) =>
      item.tipo === "CESSAO" &&
      item.detalhesCessao?.situacaoOperacional === "ATIVA",
  );
  const remocao = relacionadas.find(
    (item) => item.tipo === "REMOCAO" && !encerrada(item.situacao),
  );
  const eventos = relacionadas
    .flatMap((item) =>
      item.historico.map((evento) => ({
        ...evento,
        movimentacaoId: item.id,
        tipoMovimentacao: item.tipo,
        processo: item.processo,
      })),
    )
    .sort(
      (a, b) =>
        normalizarDataMovimentacao(b.data).localeCompare(
          normalizarDataMovimentacao(a.data),
        ) || b.registradoEm.localeCompare(a.registradoEm),
    );
  return (
    <>
      <section className="prototype-vaga-commitment-detail">
        <header>
          <div>
            <h3>Posição funcional e movimentações</h3>
            <p>Informações consolidadas do vínculo e dos eventos funcionais.</p>
          </div>
        </header>
        <dl>
          <div>
            <dt>Lotação</dt>
            <dd>
              {ocupacao
                ? `${ocupacao.orgaoLotacao}${ocupacao.unidadeLotacao ? ` • ${ocupacao.unidadeLotacao}` : ""}`
                : "—"}
            </dd>
          </div>
          <div>
            <dt>Exercício</dt>
            <dd>
              {ocupacao
                ? `${ocupacao.orgaoExercicio}${ocupacao.unidadeExercicio ? ` • ${ocupacao.unidadeExercicio}` : ""}`
                : "—"}
            </dd>
          </div>
          <div>
            <dt>Cessão ativa</dt>
            <dd>
              {cessao
                ? `${cessao.orgaoDestino}${cessao.unidadeDestino ? ` • ${cessao.unidadeDestino}` : ""}`
                : "Não"}
            </dd>
          </div>
          <div>
            <dt>Remoção em andamento</dt>
            <dd>
              {remocao ? `${remocao.id} • ${remocao.orgaoDestino}` : "Não"}
            </dd>
          </div>
        </dl>
      </section>
      {eventos.length > 0 && (
        <section className="prototype-vaga-history">
          <header>
            <div>
              <h3>Histórico de movimentações funcionais</h3>
              <p>{eventos.length} eventos recebidos do módulo Movimentações.</p>
            </div>
          </header>
          <ol>
            {eventos.map((evento, index) => (
              <li key={`${evento.movimentacaoId}-${evento.id}`}>
                <i className={index === 0 ? "active" : ""} />
                <div className="date">
                  <strong>{evento.data}</strong>
                  <small>registrado em {evento.registradoEm}</small>
                </div>
                <div className="event">
                  <strong>
                    {rotuloMovimentacao(evento.tipoMovimentacao)} •{" "}
                    {evento.tipo.replaceAll("_", " ")}
                  </strong>
                  <p>{evento.descricao}</p>
                  <small>
                    {evento.origem} • {evento.processo}
                  </small>
                </div>
                <span>{evento.movimentacaoId}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
function normalizarDataMovimentacao(valor: string) {
  if (/^\d{4}-\d{2}-\d{2}/.test(valor)) return valor.slice(0, 10);
  const partes = valor.slice(0, 10).split("/");
  return partes.length === 3 ? `${partes[2]}-${partes[1]}-${partes[0]}` : valor;
}
function rotuloMovimentacao(tipo: string) {
  return tipo === "CESSAO" ? "Cessão" : "Remoção";
}

function ComprometimentoDaVaga({ vagaId }: { vagaId: string }) {
  const { comprometimentos } = useControleVagasStore();
  const processos = comprometimentos.filter(
    (item) => item.vagaId === vagaId && item.natureza === "OCUPACAO",
  );
  const processo =
    processos.find((item) => item.situacao === "ATIVO") ?? processos[0];
  if (!processo) return null;
  const ativo = processo.situacao === "ATIVO";
  const faseAtual = processo.fases.find(
    (fase) => fase.situacao === "EM_ANDAMENTO",
  );
  const concluidas = processo.fases.filter(
    (fase) => fase.situacao === "CONCLUIDA",
  ).length;
  return (
    <section className="prototype-vaga-commitment-detail">
      <header>
        <div>
          <h3>{ativo ? "Ingresso ativo" : "Último ingresso"}</h3>
          <p>
            {ativo
              ? "Informação recebida automaticamente do processo de origem."
              : "Resultado preservado no histórico da vaga."}
          </p>
        </div>
        <span
          className={"prototype-vaga-commit " + processo.natureza.toLowerCase()}
        >
          <i className="pi pi-flag" />
          {ativo
            ? "Em ocupação"
            : processo.eventoDefinitivo ?? "Ingresso encerrado"}
        </span>
      </header>
      <dl>
        <div>
          <dt>Processo</dt>
          <dd>{processo.processo}</dd>
        </div>
        <div>
          <dt>Origem</dt>
          <dd>{processo.origem}</dd>
        </div>
        <div>
          <dt>{ativo ? "Fase atual" : "Resultado"}</dt>
          <dd>
            {ativo
              ? faseAtual?.nome ?? "Aguardando evento definitivo"
              : processo.eventoDefinitivo ?? "Ingresso encerrado"}
          </dd>
        </div>
        <div>
          <dt>Previsão</dt>
          <dd>{processo.dataEfeitoPrevista ?? "Não informada"}</dd>
        </div>
        <div className="full">
          <dt>Motivo</dt>
          <dd>{processo.motivo}</dd>
        </div>
      </dl>
      <div className="prototype-vaga-commitment-progress">
        <span>
          <i
            style={{ width: (concluidas / processo.fases.length) * 100 + "%" }}
          />
        </span>
        <small>
          {concluidas} de {processo.fases.length} fases concluídas
        </small>
      </div>
      <ol>
        {processo.fases.map((fase) => (
          <li key={fase.id} className={fase.situacao.toLowerCase()}>
            <i
              className={
                fase.situacao === "CONCLUIDA"
                  ? "pi pi-check"
                  : fase.situacao === "EM_ANDAMENTO"
                    ? "pi pi-clock"
                    : "pi pi-circle"
              }
            />
            <div>
              <strong>{fase.nome}</strong>
              <small>{fase.situacao.replaceAll("_", " ")}</small>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
function OcupantesDaVaga({ vagaId }: { vagaId: string }) {
  const { ocupacoes } = useControleVagasStore();
  const itens = ocupacoes
    .filter((item) => item.vagaId === vagaId)
    .sort((a, b) => b.efetivoExercicioEm.localeCompare(a.efetivoExercicioEm));
  const ativas = ocupacoes.filter((item) => item.situacao === "ATIVA");
  const pessoasComMaisVinculos = new Set(
    ativas
      .filter((item, _, todos) =>
        todos.some(
          (outro) => outro.id !== item.id && outro.pessoaId === item.pessoaId,
        ),
      )
      .map((item) => item.pessoaId),
  );
  if (!itens.length) return null;
  const columns: ColumnMetaSeplag<OcupacaoVaga>[] = [
    {
      header: "Pessoa",
      body: (item) => (
        <>
          <strong>{item.pessoaNome}</strong>
          <small>{item.cpf}</small>
          {pessoasComMaisVinculos.has(item.pessoaId) && (
            <span className="prototype-vaga-multiple-link">
              <i className="pi pi-clone" /> Mais de um vínculo
            </span>
          )}
        </>
      ),
    },
    {
      header: "Matrícula / vínculo",
      body: (item) => (
        <>
          {item.matricula}
          <small>
            {item.vinculoId} • {item.tipoVinculo}
          </small>
        </>
      ),
    },
    { header: "Lotação", field: "orgaoLotacao" },
    { header: "Órgão de exercício", field: "orgaoExercicio" },
    {
      header: "Posse",
      body: (item) => item.dataPosse ?? "—",
    },
    { header: "Efetivo exercício", field: "efetivoExercicioEm" },
    {
      header: "Encerramento",
      body: (item) => (
        <>
          {item.encerradaEm ?? "—"}
          {item.motivoEncerramento && <small>{item.motivoEncerramento}</small>}
        </>
      ),
    },
    { header: "Situação", field: "situacao" },
  ];
  const data: ResultsSeplag<OcupacaoVaga> = {
    content: itens,
    last: true,
    totalPages: 1,
    pageActual: 0,
    sizePage: itens.length,
    totalRecords: itens.length,
    size: itens.length,
    number: 0,
    first: true,
    numberOfElements: itens.length,
    empty: false,
  };
  return (
    <section className="prototype-vaga-occupants">
      <header>
        <h3>Ocupações nominais</h3>
        <p>
          Vínculos atuais e anteriores recebidos de Ingresso do Servidor e Vida
          Funcional.
        </p>
      </header>
      <TablePaginadoSeplag<OcupacaoVaga>
        dataKey="id"
        data={data}
        rows={Math.max(itens.length, 1)}
        columns={columns}
        lazy={false}
        paginator={false}
        selectionMode={null}
        handleOnPageChange={() => undefined}
      />
    </section>
  );
}
