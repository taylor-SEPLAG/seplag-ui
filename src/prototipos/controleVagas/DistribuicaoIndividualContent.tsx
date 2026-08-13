import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Dropdown } from "primereact/dropdown";
import {
  BotaoAdicionarSeplag,
  BotaoSalvarSeplag,
  BotaoVoltarSeplag,
  BotaoIconSeplag,
  BotaoLimparFiltroSeplag,
  DateFieldSeplag,
  DropdownFieldSeplag,
  NumberFieldSeplag,
  TablePaginadoSeplag,
  TextAreaFieldSeplag,
  TextFieldSeplag,
} from "../../componentes";
import { BaseLegalVinculada } from "./BaseLegalVinculada";
import { useDocumentosLegaisAssociaveis } from "../documentosLegais/documentosLegaisStore";
import {
  calcularPosicaoVaga,
  recalcularPosicoes,
  registrarMovimentoVaga,
} from "./distribuicaoIndividual";
import {
  controleVagasStore,
  useControleVagasStore,
} from "./controleVagasStore";
import type {
  ComprometimentoVaga,
  MovimentoVagaIndividual,
  PosicaoDistribuicaoVaga,
  QuadroAutorizadoRow,
  Vaga,
} from "./types";
import { SpecArea, SpecificationMode } from "../shared/visualizationModes";
import {
  distribuicaoActionSpecifications,
  distribuicaoBlockSpecifications,
  distribuicaoBusinessItems,
  distribuicaoFilterSpecifications,
  distribuicaoKpiSpecifications,
  distribuicaoScreenSpecification,
} from "./DistribuicaoSpecifications";
import type { ResultsSeplag } from "../../interfaces/Results";
import "./distribuicaoIndividual.css";
import "./quadroLegalOperacoes.css";

type OperacaoDistribuicao = "DISTRIBUICAO" | "REDISTRIBUICAO";
const operacaoLabel: Record<OperacaoDistribuicao, string> = {
  DISTRIBUICAO: "Distribuição",
  REDISTRIBUICAO: "Redistribuição",
};
const agora = new Date();
const hoje = [
  agora.getFullYear(),
  String(agora.getMonth() + 1).padStart(2, "0"),
  String(agora.getDate()).padStart(2, "0"),
].join("-");
const normalizarDataIso = (data: string) =>
  data.includes("/") ? data.split("/").reverse().join("-") : data;

interface GrupoDistribuicao {
  chave: string;
  quadroId: number;
  quadroCodigo: string;
  versao: number;
  cargo: string;
  orgao: string;
  total: number;
  ocupadas: number;
  disponiveis: number;
  comprometidas: number;
  movimentaveis: number;
  distribuiveis: number;
  redistribuiveis: number;
  pendentesAto: number;
}
interface DestinacaoDistribuicao {
  id: number;
  orgao: string;
  quantidade: number;
}
interface NovaDistribuicaoCampos {
  origem: string;
  destino: string;
  quantidadeRedistribuicao: number;
  data: string;
  processo: string;
  justificativa: string;
}
interface DistribuicaoFiltros {
  busca: string;
  cargo: string;
  orgao: string;
}
const filtrosDistribuicaoIniciais: DistribuicaoFiltros = {
  busca: "",
  cargo: "",
  orgao: "",
};
const resultadosDistribuicao = (
  content: GrupoDistribuicao[],
  pageActual: number,
  sizePage: number,
): ResultsSeplag<GrupoDistribuicao> => ({
  content,
  last: pageActual >= Math.max(1, Math.ceil(content.length / sizePage)) - 1,
  totalPages: Math.max(1, Math.ceil(content.length / sizePage)),
  pageActual,
  sizePage,
  totalRecords: content.length,
  size: content.length,
  number: pageActual,
  first: pageActual === 0,
  numberOfElements: content.length,
  empty: content.length === 0,
});
export function DistribuicaoIndividualContent() {
  const { movimentos, vagas, comprometimentos, quadros } =
    useControleVagasStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isNovaDistribuicao = location.pathname.includes("/distribuicao/nova");
  const isNovaRedistribuicao = location.pathname.includes("/redistribuicao/nova");
  const isFormularioDistribuicao = isNovaDistribuicao || isNovaRedistribuicao;
  const [searchParams] = useSearchParams();
  const quadroInicial = searchParams.get("quadro") ?? "";
  const filtroQuadroInicial = isFormularioDistribuicao
    ? ""
    : (quadros.find((quadro) => String(quadro.id) === quadroInicial)?.codigo ??
      quadroInicial);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const { control, watch, reset } = useForm<DistribuicaoFiltros>({
    defaultValues: {
      ...filtrosDistribuicaoIniciais,
      busca: filtroQuadroInicial,
    },
  });
  const { busca, cargo: filtroCargo, orgao: filtroOrgao } = watch();
  const posicoes = useMemo(
    () => recalcularPosicoes(vagas, movimentos, hoje),
    [vagas, movimentos],
  );
  const compromissosAtivos = useMemo(
    () =>
      new Set(
        comprometimentos
          .filter((item) => item.situacao === "ATIVO")
          .map((item) => item.vagaId),
      ),
    [comprometimentos],
  );
  const grupos = useMemo(() => {
    const mapa = new Map<string, GrupoDistribuicao>();
    posicoes.forEach((posicao) => {
      const vaga = vagas.find((item) => item.id === posicao.vagaId);
      const quadro = quadros.find(
        (item) => item.id === posicao.quadroAutorizadoId,
      );
      if (!vaga || !quadro) return;
      const orgao = quadro.orgaosDefinidosLei?.length
        ? quadro.orgaosDefinidosLei.join(" • ")
        : quadro.formaDestinacaoLegal === "DISTRIBUICAO_POSTERIOR"
          ? "Pendente de ato de distribuição"
          : quadro.orgao;
      const quadroPermiteMovimentacao =
        quadro.situacao === "Vigente" &&
        quadro.situacaoVigencia !== "ENCERRADO" &&
        quadro.situacaoVigencia !== "EXTINTO";
      const chave = String(posicao.quadroAutorizadoId);
      const atual = mapa.get(chave) ?? {
        chave,
        quadroId: quadro.id,
        quadroCodigo: quadro.codigo,
        versao: quadro.versao,
        cargo: posicao.cargo,

        orgao,
        total: 0,
        ocupadas: 0,
        disponiveis: 0,
        comprometidas: 0,
        movimentaveis: 0,
        distribuiveis: 0,
        redistribuiveis: 0,
        pendentesAto: 0,
      };
      atual.total++;
      if (posicao.situacaoDistribuicao === "PENDENTE_ATO") atual.pendentesAto++;
      if (vaga.estado === "OCUPADA") atual.ocupadas++;
      else atual.disponiveis++;
      if (vaga.estado === "DISPONIVEL" && compromissosAtivos.has(vaga.id))
        atual.comprometidas++;
      const elegivel =
        vaga.estado === "DISPONIVEL" &&
        !compromissosAtivos.has(vaga.id) &&
        posicao.situacaoLegal === "REGULAR" &&
        quadroPermiteMovimentacao;
      if (elegivel) {
        atual.movimentaveis++;
        if (
          posicao.situacaoDistribuicao === "PENDENTE_ATO" ||
          !posicao.orgaoDistribuicao
        )
          atual.distribuiveis++;
        else atual.redistribuiveis++;
      }
      mapa.set(chave, atual);
    });
    const codigosRepresentados = new Set(
      [...mapa.values()].map((grupo) => grupo.quadroCodigo),
    );
    const quadrosAtuais = new Map<string, QuadroAutorizadoRow>();
    quadros.forEach((quadro) => {
      const atual = quadrosAtuais.get(quadro.codigo);
      if (!atual || quadro.versao > atual.versao) quadrosAtuais.set(quadro.codigo, quadro);
    });
    quadrosAtuais.forEach((quadro) => {
      if (codigosRepresentados.has(quadro.codigo)) return;
      const orgao = quadro.orgaosDefinidosLei?.length
        ? quadro.orgaosDefinidosLei.join(" • ")
        : quadro.formaDestinacaoLegal === "DISTRIBUICAO_POSTERIOR"
          ? "Pendente de ato de distribuição"
          : quadro.orgao;
      mapa.set(String(quadro.id), {
        chave: String(quadro.id),
        quadroId: quadro.id,
        quadroCodigo: quadro.codigo,
        versao: quadro.versao,
        cargo: quadro.cargo,
        orgao,
        total: quadro.autorizadas,
        ocupadas: quadro.ocupadas,
        disponiveis: Math.max(0, quadro.autorizadas - quadro.ocupadas),
        comprometidas: 0, movimentaveis: 0, distribuiveis: 0, redistribuiveis: 0, pendentesAto: 0,
      });
    });
    return [...mapa.values()].sort(
      (a, b) =>
        a.cargo.localeCompare(b.cargo) || a.orgao.localeCompare(b.orgao),
    );
  }, [posicoes, vagas, quadros, compromissosAtivos]);
  const opcoesCargo = [...new Set(grupos.map((grupo) => grupo.cargo))].sort();
  const opcoesOrgao = [
    ...new Set(grupos.flatMap((grupo) => grupo.orgao.split(" • "))),
  ].sort();
  const gruposFiltrados = grupos.filter(
    (grupo) =>
      (!busca ||
        grupo.quadroCodigo.toLowerCase().includes(busca.toLowerCase())) &&
      (!filtroCargo || grupo.cargo === filtroCargo) &&
      (!filtroOrgao || grupo.orgao.split(" • ").includes(filtroOrgao)),
  );
  const paginas = Math.max(1, Math.ceil(gruposFiltrados.length / porPagina));
  const paginaAtual = Math.min(pagina, paginas);
  const colunasTabela = [
    {
      field: "quadroCodigo",
      header: "Quadro",
      sortable: true,
      body: (grupo: GrupoDistribuicao) => (
        <>
          <strong>{grupo.quadroCodigo}</strong>
          <small>Versão {grupo.versao}</small>
        </>
      ),
    },
    {
      field: "cargo",
      header: "Cargo",
      sortable: true,
      body: (grupo: GrupoDistribuicao) => <strong>{grupo.cargo}</strong>,
    },
    { field: "orgao", header: "Órgão", sortable: true },
    { field: "total", header: "Autorizadas", sortable: true },
    { field: "ocupadas", header: "Ocupadas", sortable: true },
    { field: "disponiveis", header: "Disponíveis", sortable: true },
    { field: "comprometidas", header: "Comprometidas", sortable: true },
    {
      field: "movimentaveis",
      header: "Movimentáveis",
      sortable: true,
      body: (grupo: GrupoDistribuicao) => (
        <strong className="movable">{grupo.movimentaveis}</strong>
      ),
    },
    { field: "pendentesAto", header: "Pendentes de ato", sortable: true },
  ];
  const distribuidas = posicoes.filter(
    (item) => item.situacaoDistribuicao === "DISTRIBUIDA",
  ).length;
  const pendentesAto = posicoes.length - distribuidas;
  const ocupadas = vagas.filter((item) => item.estado === "OCUPADA").length;
  const movimentaveis = posicoes.filter((item) => {
    const vaga = vagas.find((vaga) => vaga.id === item.vagaId);
    return (
      vaga?.estado === "DISPONIVEL" &&
      !compromissosAtivos.has(item.vagaId) &&
      item.situacaoLegal === "REGULAR"
    );
  }).length;
  const limparFiltros = () => {
    reset(filtrosDistribuicaoIniciais);
    setPagina(1);
  };
  const fecharNovo = () =>
    navigate("/prototipos/sigep/controle-vagas/distribuicao");
  const salvar = (lote: MovimentoVagaIndividual[]) => {
    controleVagasStore.set("movimentos", (itens) => [...itens, ...lote]);
    fecharNovo();
  };
  if (isFormularioDistribuicao)
    return (
      <NovaDistribuicao
        operacao={isNovaRedistribuicao ? "REDISTRIBUICAO" : "DISTRIBUICAO"}
        quadroInicial={quadroInicial}
        quadros={quadros}
        vagas={vagas}
        posicoes={posicoes}
        movimentos={movimentos}
        comprometimentos={comprometimentos}
        onClose={fecharNovo}
        onSave={salvar}
      />
    );
  return (
    <SpecificationMode
      screen={distribuicaoScreenSpecification}
      businessItems={distribuicaoBusinessItems}
    >
      <div className="prototype-ind-page prototype-distribution-list-page">
        <header className="prototype-ind-header">
          <SpecArea metadata={distribuicaoScreenSpecification}>
            <div>
              <h1>Distribuição</h1>
              <p>
                Distribuição inicial e redistribuição formal de vagas entre
                órgãos, sempre vinculadas ao Quadro Autorizado.
              </p>
            </div>
          </SpecArea>
        </header>
        <section className="prototype-distribution-kpis">
          <SpecArea
            metadata={distribuicaoKpiSpecifications["Vagas individualizadas"]}
          >
            <article>
              <i className="pi pi-list" />
              <div>
                <span>Vagas individualizadas</span>
                <strong>{vagas.length}</strong>
              </div>
            </article>
          </SpecArea>
          <SpecArea
            metadata={distribuicaoKpiSpecifications["Pendentes de ato"]}
          >
            <article>
              <i className="pi pi-clock" />
              <div>
                <span>Pendentes de ato</span>
                <strong>{pendentesAto}</strong>
              </div>
            </article>
          </SpecArea>
          <SpecArea metadata={distribuicaoKpiSpecifications["Distribuídas"]}>
            <article>
              <i className="pi pi-sitemap" />
              <div>
                <span>Distribuídas</span>
                <strong>{distribuidas}</strong>
              </div>
            </article>
          </SpecArea>
          <SpecArea
            metadata={
              distribuicaoKpiSpecifications["Disponíveis para movimentação"]
            }
          >
            <article className="available">
              <i className="pi pi-check-circle" />
              <div>
                <span>Disponíveis para movimentação</span>
                <strong>{movimentaveis}</strong>
              </div>
            </article>
          </SpecArea>
          <SpecArea
            metadata={
              distribuicaoKpiSpecifications["Ocupadas — não movimentáveis"]
            }
          >
            <article className="occupied">
              <i className="pi pi-lock" />
              <div>
                <span>Ocupadas — não movimentáveis</span>
                <strong>{ocupadas}</strong>
              </div>
            </article>
          </SpecArea>
        </section>
        <section className="prototype-quadro-card prototype-distribution-card">
          <div className="prototype-quadro-filters prototype-quadro-library-filters prototype-distribution-library-filters">
            <SpecArea metadata={distribuicaoFilterSpecifications["Pesquisa"]}>
              <div className="prototype-quadro-spec-control">
                <TextFieldSeplag
                  name="busca"
                  control={control}
                  label="Quadro"
                  cols="12"
                  icon="pi pi-search"
                  placeholder="Ex: QA-xxxx"
                  onChange={() => setPagina(1)}
                />
              </div>
            </SpecArea>
            <SpecArea metadata={distribuicaoFilterSpecifications["Cargo"]}>
              <div className="prototype-quadro-spec-control">
                <DropdownFieldSeplag
                  name="cargo"
                  control={control}
                  label="Cargo"
                  cols="12"
                  options={opcoesCargo.map((value) => ({
                    label: value,
                    value,
                  }))}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Todos"
                  getFormErrorMessage={() => null}
                  onChange={() => setPagina(1)}
                />
              </div>
            </SpecArea>
            <SpecArea
              metadata={
                distribuicaoFilterSpecifications["Órgão de distribuição"]
              }
            >
              <div className="prototype-quadro-spec-control">
                <DropdownFieldSeplag
                  name="orgao"
                  control={control}
                  label="Órgão de distribuição"
                  cols="12"
                  options={opcoesOrgao.map((value) => ({
                    label: value,
                    value,
                  }))}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Todos"
                  getFormErrorMessage={() => null}
                  onChange={() => setPagina(1)}
                />
              </div>
            </SpecArea>
            <SpecArea metadata={distribuicaoActionSpecifications.Limpar}>
              <div className="prototype-quadro-spec-control">
                <BotaoLimparFiltroSeplag
                  type="button"
                  onClick={limparFiltros}
                />
              </div>
            </SpecArea>
          </div>

          <SpecArea
            metadata={distribuicaoBlockSpecifications["Tabela da posição"]}
          >
            <div className="prototype-quadro-table prototype-quadro-library-table prototype-distribution-library-table">
              <TablePaginadoSeplag<GrupoDistribuicao>
                dataKey="chave"
                data={resultadosDistribuicao(
                  gruposFiltrados,
                  paginaAtual - 1,
                  porPagina,
                )}
                rows={porPagina}
                rowsPerPage={[10, 20, 50]}
                lazy={false}
                selectionMode={null}
                columns={colunasTabela}
                hasEventoAcao
                renderBotoes={(grupo) => (
                  <div className="prototype-distribution-row-actions">
                    <SpecArea metadata={distribuicaoActionSpecifications.Distribuir}>
                    <BotaoIconSeplag
                      type="button"
                      tooltip={
                        grupo.distribuiveis > 0
                          ? `Distribuir ${grupo.distribuiveis} vaga(s) pendente(s) do ${grupo.quadroCodigo}`
                          : "Este quadro não possui vagas pendentes elegíveis para distribuição"
                      }
                      aria-label={`Distribuir vagas do ${grupo.quadroCodigo}`}
                      icon="pi pi-sitemap"
                      disabled={grupo.distribuiveis === 0}
                      onClick={() =>
                        navigate(
                          `/prototipos/sigep/controle-vagas/distribuicao/nova?quadro=${grupo.quadroId}`,
                        )
                      }
                    />
                    </SpecArea>
                    <SpecArea metadata={distribuicaoActionSpecifications.Redistribuir}>
                    <BotaoIconSeplag
                      type="button"
                      tooltip={
                        grupo.redistribuiveis > 0
                          ? `Redistribuir ${grupo.redistribuiveis} vaga(s) do ${grupo.quadroCodigo}`
                          : "Este quadro não possui vagas já distribuídas elegíveis para redistribuição"
                      }
                      aria-label={`Redistribuir vagas do ${grupo.quadroCodigo}`}
                      icon="pi pi-arrow-right-arrow-left"
                      disabled={grupo.redistribuiveis === 0}
                      onClick={() =>
                        navigate(
                          `/prototipos/sigep/controle-vagas/redistribuicao/nova?quadro=${grupo.quadroId}`,
                        )
                      }
                    />
                    </SpecArea>
                  </div>
                )}
                handleOnPageChange={(event) => {
                  setPagina((event.page ?? 0) + 1);
                  setPorPagina(event.rows);
                }}
              />
            </div>
          </SpecArea>
        </section>
    </div>
    </SpecificationMode>
  );
}

function NovaDistribuicao({
  operacao,
  quadroInicial,
  quadros,
  vagas,
  posicoes,
  movimentos,
  comprometimentos,
  onClose,
  onSave,
}: {
  operacao: OperacaoDistribuicao;
  quadroInicial?: string;
  quadros: QuadroAutorizadoRow[];
  vagas: Vaga[];
  posicoes: PosicaoDistribuicaoVaga[];
  movimentos: MovimentoVagaIndividual[];
  comprometimentos: ComprometimentoVaga[];
  onClose: () => void;
  onSave: (lote: MovimentoVagaIndividual[]) => void;
}) {
  const documentosLegaisDisponiveis = useDocumentosLegaisAssociaveis();
  const [destinacoes, setDestinacoes] = useState<DestinacaoDistribuicao[]>([
    { id: 1, orgao: "", quantidade: 1 },
  ]);
  const [documentosLegaisIds, setDocumentosLegaisIds] = useState<string[]>([]);
  const [simulado, setSimulado] = useState(false);
  const [erro, setErro] = useState("");
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NovaDistribuicaoCampos>({
    defaultValues: {
      origem: "",
      destino: "",
      quantidadeRedistribuicao: 0,
      data: hoje,
      processo: "",
      justificativa: "",
    },
  });
  const {
    origem,
    destino,
    quantidadeRedistribuicao,
    data,
    processo,
    justificativa,
  } = watch();
  useEffect(() => {
    const subscription = watch(() => setSimulado(false));
    return () => subscription.unsubscribe();
  }, [watch]);
  const getFormErrorMessage = (name: string) => {
    const error = errors[name as keyof NovaDistribuicaoCampos];
    return error?.message ? (
      <small className="p-error">{String(error.message)}</small>
    ) : null;
  };
  const ato = documentosLegaisDisponiveis
    .filter((item) => documentosLegaisIds.includes(item.id))
    .map((item) => item.titulo)
    .join("; ");
  const quadro = quadros.find((item) => item.id === Number(quadroInicial));
  const posicoesQuadro = posicoes.filter(
    (item) => item.quadroAutorizadoId === quadro?.id,
  );
  const compromissos = new Set(
    comprometimentos
      .filter((item) => item.situacao === "ATIVO")
      .map((item) => item.vagaId),
  );
  const resumoQuadro = (() => {
    const vagasAtivas = vagas.filter(
      (vaga) =>
        vaga.quadroAutorizadoId === quadro?.id &&
        vaga.situacaoLegal !== "EXTINTA",
    );
    const posicoesAtivas = posicoesQuadro.filter((posicao) =>
      vagasAtivas.some((vaga) => vaga.id === posicao.vagaId),
    );
    const pendentes = posicoesAtivas.filter(
      (posicao) => posicao.situacaoDistribuicao === "PENDENTE_ATO",
    ).length;
    const ocupadas = vagasAtivas.filter(
      (vaga) => vaga.estado === "OCUPADA",
    ).length;
    const comprometidas = vagasAtivas.filter((vaga) =>
      compromissos.has(vaga.id),
    ).length;
    const disponiveis =
      vagasAtivas.filter((vaga) => vaga.estado === "DISPONIVEL").length -
      pendentes;

    return {
      autorizadas: vagasAtivas.length,
      ocupadas,
      comprometidas,
      disponiveis: Math.max(0, disponiveis),
      pendentes,
    };
  })();  const orgaosOrigem = [
    ...new Set(
      posicoesQuadro
        .map((item) => item.orgaoDistribuicao)
        .filter(Boolean) as string[],
    ),
  ].sort();
const orgaosPermitidos = quadro?.orgaosDefinidosLei?.length
    ? [...quadro.orgaosDefinidosLei]
    : [
        "AGER",
        "CASA CIVIL",
        "CGE",
        "PGE",
        "PJC",
        "SEDUC",
        "SEFAZ",
        "SEMA",
        "SEPLAG",
        "SES",
        "SINFRA",
      ];
  const bloqueioLegal = "";
  const candidatas = posicoesQuadro.filter((posicao) => {
    const vaga = vagas.find((item) => item.id === posicao.vagaId);
    if (
      !vaga ||
      vaga.estado !== "DISPONIVEL" ||
      vaga.situacaoLegal !== "REGULAR" ||
      compromissos.has(vaga.id)
    )
      return false;
    if (operacao === "DISTRIBUICAO") return !posicao.orgaoDistribuicao;
    return posicao.orgaoDistribuicao === origem;
  });
  const totalDestinacoes = destinacoes.reduce(
    (total, item) =>
      total + (item.orgao ? Math.max(0, item.quantidade || 0) : 0),
    0,
  );
  const candidatasOrdenadas = [...candidatas].sort((a, b) => {
    const sequencialA = vagas.find((vaga) => vaga.id === a.vagaId)?.sequencial ?? 0;
    const sequencialB = vagas.find((vaga) => vaga.id === b.vagaId)?.sequencial ?? 0;
    return sequencialB - sequencialA;
  });
  const quantidadeRedistribuir = Math.max(0, Number(quantidadeRedistribuicao || 0));
  const selecionadas =
    operacao === "REDISTRIBUICAO"
      ? candidatasOrdenadas.slice(0, quantidadeRedistribuir)
      : candidatas.slice(0, totalDestinacoes);
  const atualizarDestinacao = (
    id: number,
    campo: "orgao" | "quantidade",
    valor: string | number,
  ) => {
    setDestinacoes((atuais) =>
      atuais.map((item) =>
        item.id === id
          ? {
              ...item,
              [campo]: valor,
            }
          : item,
      ),
    );
    setSimulado(false);
  };
  const adicionarDestinacao = () => {
    setDestinacoes((atuais) => [
      ...atuais,
      {
        id: Math.max(0, ...atuais.map((item) => item.id)) + 1,
        orgao: "",
        quantidade: 1,
      },
    ]);
    setSimulado(false);
  };
  const removerDestinacao = (id: number) => {
    setDestinacoes((atuais) =>
      atuais.length === 1 ? atuais : atuais.filter((item) => item.id !== id),
    );
    setSimulado(false);
  };
  const simular = () => {
    setErro("");
    if (!quadro) {
      setErro("O Quadro Autorizado não foi informado ou não foi encontrado.");
      return;
    }
    if (bloqueioLegal) {
      setErro(bloqueioLegal);
      return;
    }
    if (operacao === "DISTRIBUICAO") {
      if (
        destinacoes.some(
          (item) => !item.orgao || !item.quantidade || item.quantidade < 1,
        )
      ) {
        setErro(
          "Informe órgão e quantidade maior que zero em todas as destinações.",
        );
        return;
      }
      if (destinacoes.some((item) => !orgaosPermitidos.includes(item.orgao))) {
        setErro(
          "Há órgão de destino não permitido pela autorização legal do quadro.",
        );
        return;
      }
      const chaves = destinacoes.map((item) => item.orgao);
      if (new Set(chaves).size !== chaves.length) {
        setErro("Não repita o mesmo órgão de destino.");
        return;
      }
      if (selecionadas.length < totalDestinacoes) {
        setErro(
          `Existem apenas ${selecionadas.length} vagas livres elegíveis para ${totalDestinacoes} vagas informadas.`,
        );
        return;
      }
    } else {
      if (!origem) {
        setErro("Selecione o órgão de origem.");
        return;
      }
      if (!destino) {
        setErro("Selecione o órgão de destino.");
        return;
      }
      if (origem === destino) {
        setErro("Origem e destino devem ser diferentes.");
        return;
      }
      if (!orgaosPermitidos.includes(destino)) {
        setErro(
          "O órgão de destino não está permitido pela autorização legal deste quadro.",
        );
        return;
      }
      if (!Number.isInteger(quantidadeRedistribuir) || quantidadeRedistribuir < 1) {
        setErro("Informe uma quantidade inteira maior que zero para redistribuir.");
        return;
      }
      if (quantidadeRedistribuir > candidatas.length) {
        setErro(`Existem apenas ${candidatas.length} vagas elegíveis no órgão de origem.`);
        return;
      }
    }
    if (!data || !ato || !processo || !justificativa) {
      setErro(
        "Preencha data de efeito, documento legal, processo SIGADOC e justificativa.",
      );
      return;
    }
    setSimulado(true);
  };
  const confirmar = () => {
    if (!quadro) return;
    const dataEfeitoIso = normalizarDataIso(data);
    const loteId = `DIST-${quadro.codigo}-${dataEfeitoIso.replaceAll("-", "")}-${String(movimentos.length + 1).padStart(5, "0")}`;
    const atribuicoes: {
      posicao: PosicaoDistribuicaoVaga;
      orgao: string;
    }[] = [];
    if (operacao === "DISTRIBUICAO") {
      let cursor = 0;
      for (const item of destinacoes) {
        for (const posicao of selecionadas.slice(
          cursor,
          cursor + item.quantidade,
        ))
          atribuicoes.push({
            posicao,
            orgao: item.orgao,
          });
        cursor += item.quantidade;
      }
    } else {
      for (const posicao of selecionadas)
        atribuicoes.push({ posicao, orgao: destino });
    }
    const lote: MovimentoVagaIndividual[] = [];
    for (const [indice, atribuicao] of atribuicoes.entries()) {
      const vaga = vagas.find((item) => item.id === atribuicao.posicao.vagaId)!;
      const resultado = registrarMovimentoVaga(
        vaga,
        calcularPosicaoVaga(vaga, movimentos, hoje),
        {
          tipo: operacao,
          dataEfeito: dataEfeitoIso,
          orgao: atribuicao.orgao,
          ato,
          processo,
          justificativa,
        },
      );
      if (resultado.erro) {
        setErro(resultado.erro);
        setSimulado(false);
        return;
      }
      lote.push({
        ...resultado.movimento!,
        id: `${loteId}-${String(indice + 1).padStart(3, "0")}`,
        loteId,
        quadroAutorizadoId: quadro.id,
        quadroCodigo: quadro.codigo,
        quadroVersao: quadro.versao,
      });
    }
    onSave(lote);
  };
  return (
    <div className="prototype-ind-page prototype-distribution-form-page">
      <header className="prototype-ind-header">
        <div>
          <h1>{operacao === "DISTRIBUICAO" ? "Nova distribuição" : "Nova redistribuição"}</h1>
          <p>
            O Quadro Autorizado define a origem e o limite legal da operação.
          </p>
        </div>
      </header>
      <form
        className="prototype-distribution-page-card"
        onSubmit={handleSubmit(simular)}
      >
        {erro && (
          <div className="prototype-ind-error">
            <i className="pi pi-exclamation-circle" />
            {erro}
          </div>
        )}
        <div className="prototype-ind-form">
          <BaseLegalVinculada
            className="full prototype-distribution-legal-document"
            value={documentosLegaisIds}
            onChange={(ids) => {
              setDocumentosLegaisIds(ids);
              setSimulado(false);
            }}
          />
          {quadro && (
            <section className="prototype-legal-version-context prototype-distribution-board-context">
              <span>
                Quadro da {operacao === "DISTRIBUICAO" ? "distribuição" : "redistribuição"}
              </span>
              <div>
                <strong>{quadro.codigo}</strong>
                <h3>{quadro.cargo}</h3>
                <em>Versão vigente {quadro.versao}</em>
              </div>
              <dl className="prototype-legal-version-summary">
                <div><dt>Autorizadas</dt><dd>{resumoQuadro.autorizadas}</dd></div>
                <div><dt>Ocupadas</dt><dd>{resumoQuadro.ocupadas}</dd></div>
                <div><dt>Comprometidas</dt><dd>{resumoQuadro.comprometidas}</dd></div>
                <div><dt>Disponíveis</dt><dd>{resumoQuadro.disponiveis}</dd></div>
                <div><dt>Pendentes de ato</dt><dd>{resumoQuadro.pendentes}</dd></div>
              </dl>
              <p>
                <i className="pi pi-info-circle" />
                {operacao === "DISTRIBUICAO"
                  ? "Somente vagas pendentes de ato, disponíveis e sem comprometimento podem ser distribuídas."
                  : "Somente vagas já distribuídas, disponíveis e sem comprometimento podem ser redistribuídas."}
              </p>
            </section>
          )}
          {operacao === "DISTRIBUICAO" ? (
            <section className="prototype-distribution-destinations full">
              <header>
                <div>
                  <h3>Destinações da distribuição</h3>
                  <p>Adicione os órgãos e as respectivas quantidades.</p>
                </div>
                <BotaoAdicionarSeplag
                  type="button"
                  label="Adicionar destinação"
                  onClick={adicionarDestinacao}
                />
              </header>
              <div className="prototype-distribution-destination-head">
                <span>Órgão *</span>
                <span>Quantidade *</span>
                <span>Ações</span>
              </div>
              {destinacoes.map((item) => (
                <div
                  className="prototype-distribution-destination-row"
                  key={item.id}
                >
                  <div className="prototype-distribution-destination-field">
                    <span>Órgão *</span>
                    <Dropdown
                      aria-label="Órgão"
                      value={item.orgao}
                      options={orgaosPermitidos.map((orgao) => ({
                        label: orgao,
                        value: orgao,
                      }))}
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Selecione"
                      showClear
                      filter
                      className="w-full"
                      onChange={(e) =>
                        atualizarDestinacao(item.id, "orgao", e.value ?? "")
                      }
                    />
                  </div>
                  <div className="prototype-distribution-destination-field">
                    <span>Quantidade *</span>
                    <input
                      id={`quantidade-${item.id}`}
                      type="number"
                      aria-label="Quantidade"
                      min={1}
                      step={1}
                      value={item.quantidade}
                      className="p-inputtext p-component prototype-distribution-quantity-input"
                      onChange={(e) => {
                        const value = Math.max(1, Number(e.target.value || 1));
                        atualizarDestinacao(
                          item.id,
                          "quantidade",
                          Number.isFinite(value) ? value : 1,
                        );
                      }}
                    />
                  </div>
                  <div className="prototype-distribution-destination-field">
                    <span>Ações</span>
                    <BotaoIconSeplag
                      type="button"
                      tooltip="Remover destinação"
                      aria-label="Remover destinação"
                      icon="pi pi-trash"
                      severity="danger"
                      disabled={destinacoes.length === 1}
                      onClick={() => removerDestinacao(item.id)}
                    />
                  </div>
                </div>
              ))}
              <footer>
                <span>Total a distribuir</span>
                <strong>
                  {totalDestinacoes} {totalDestinacoes === 1 ? "vaga" : "vagas"}
                </strong>
              </footer>
            </section>
          ) : (
            <>
              <section
                className="prototype-distribution-route"
                aria-label="Fluxo da redistribuição"
              >
                <div className="prototype-distribution-route-side is-origin">
                  <header>
                    <span className="prototype-distribution-route-icon">
                      <i className="pi pi-building" />
                    </span>
                    <div>
                      <span>Origem</span>
                      <strong>{origem || "Órgão atual das vagas"}</strong>
                    </div>
                  </header>
                  <div className="prototype-distribution-seplag-field">
                    <DropdownFieldSeplag<NovaDistribuicaoCampos>
                      name="origem"
                      control={control}
                      label="Órgão de origem"
                      cols="12"
                      required
                      options={orgaosOrigem.map((value) => ({
                        label: value,
                        value,
                      }))}
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Selecione o órgão de origem"
                      getFormErrorMessage={getFormErrorMessage}
                      onChange={(value) => {
                        setValue("quantidadeRedistribuicao", 0);
                        if (value === destino) {
                          setValue("destino", "");
                        }
                      }}
                    />
                  </div>
                  {origem && (
                    <small className="prototype-distribution-route-balance">
                      <i className="pi pi-list" />
                      {candidatas.length}{" "}
                      {candidatas.length === 1
                        ? "vaga disponível"
                        : "vagas disponíveis"}
                    </small>
                  )}
                </div>

                <div
                  className="prototype-distribution-route-direction"
                  aria-hidden="true"
                >
                  <i className="pi pi-arrow-right" />
                </div>

                <div className="prototype-distribution-route-side is-destination">
                  <header>
                    <span className="prototype-distribution-route-icon">
                      <i className="pi pi-map-marker" />
                    </span>
                    <div>
                      <span>Destino</span>
                      <strong>{destino || "Novo órgão das vagas"}</strong>
                    </div>
                  </header>
                  <div className="prototype-distribution-seplag-field">
                    <DropdownFieldSeplag<NovaDistribuicaoCampos>
                      name="destino"
                      control={control}
                      label="Órgão de destino"
                      cols="12"
                      required
                      options={orgaosPermitidos
                        .filter((value) => value !== origem)
                        .map((value) => ({
                          label: value,
                          value,
                        }))}
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Selecione o órgão de destino"
                      getFormErrorMessage={getFormErrorMessage}
                    />
                  </div>
                </div>
              </section>
              <div className="full prototype-distribution-seplag-field">
                <NumberFieldSeplag<NovaDistribuicaoCampos>
                  name="quantidadeRedistribuicao"
                  control={control}
                  label="Quantidade de vagas"
                  cols="12"
                  required
                  min={1}
                  max={candidatas.length || 1}
                  useGrouping={false}
                  placeholder="Informe quantas vagas serão redistribuídas"
                  getFormErrorMessage={getFormErrorMessage}
                />
                <small className="prototype-distribution-auto-selection-hint">
                  O sistema selecionará automaticamente as vagas elegíveis de maior sequencial.
                </small>
              </div>
            </>
          )}
          <div className="prototype-distribution-seplag-field">
            <DateFieldSeplag<NovaDistribuicaoCampos>
              name="data"
              control={control}
              label="Data de efeito"
              cols="12"
              required
              getFormErrorMessage={getFormErrorMessage}
            />
          </div>
          <div className="prototype-distribution-seplag-field">
            <TextFieldSeplag<NovaDistribuicaoCampos>
              name="processo"
              control={control}
              label="Processo SIGADOC"
              cols="12"
              required
              placeholder="Informe o número do processo"
              getFormErrorMessage={getFormErrorMessage}
            />
          </div>

          <TextAreaFieldSeplag<NovaDistribuicaoCampos>
            name="justificativa"
            control={control}
            label="Justificativa"
            cols="12"
            required
            rows={3}
            maxLength={1000}
            rules={{ required: "Justificativa é obrigatória" }}
            placeholder="Informe a justificativa da operação"
            getFormErrorMessage={getFormErrorMessage}
          />
        </div>
        {quadro && (
          <div
            className={`prototype-distribution-availability ${bloqueioLegal ? "blocked" : ""}`}
          >
            <div>
              <span>
                {bloqueioLegal
                  ? "Movimentação administrativa bloqueada"
                  : "Vagas elegíveis"}
              </span>
              <strong>{bloqueioLegal ? 0 : candidatas.length}</strong>
            </div>
            <div>
              <span>
                {operacao === "DISTRIBUICAO"
                  ? "Total informado"
                  : "Quantidade informada"}
              </span>
              <strong>
                {operacao === "DISTRIBUICAO"
                  ? totalDestinacoes
                  : quantidadeRedistribuir}
              </strong>
            </div>
            <div>
              <span>Saldo restante</span>
              <strong>
                {Math.max(
                  0,
                  candidatas.length -
                    (operacao === "DISTRIBUICAO"
                      ? totalDestinacoes
                      : quantidadeRedistribuir),
                )}
              </strong>
            </div>
            <small>
              {bloqueioLegal ||
                "Ocupadas, comprometidas ou com situação legal especial foram excluídas."}
            </small>
          </div>
        )}
        {simulado && (
          <section className="prototype-distribution-simulation">
            <header>
              <div>
                <h3>Simulação da operação</h3>
                <p>
                  {quadro?.codigo} • versão {quadro?.versao} •{" "}
                  {selecionadas.length} vagas
                </p>
              </div>
              <strong>{operacaoLabel[operacao]}</strong>
            </header>
            {operacao === "DISTRIBUICAO" ? (
              <div className="prototype-distribution-simulation-destinations">
                {destinacoes.map((item) => (
                  <article key={item.id}>
                    <span>{item.orgao}</span>
                    <strong>
                      {item.quantidade}{" "}
                      {item.quantidade === 1 ? "vaga" : "vagas"}
                    </strong>
                  </article>
                ))}
              </div>
            ) : (
              <div>
                <span>{origem}</span>
                <i className="pi pi-arrow-right" />
                <strong>
                  {destino}
                </strong>
              </div>
            )}
            <ul>
              {selecionadas.slice(0, 10).map((item) => (
                <li key={item.vagaId}>{item.vagaId}</li>
              ))}
            </ul>
            {selecionadas.length > 10 && (
              <small>e mais {selecionadas.length - 10} vagas numeradas.</small>
            )}
          </section>
        )}
        <footer>
          <BotaoVoltarSeplag
            type="button"
            label="Cancelar"
            icon="pi pi-times"
            onClick={onClose}
          />
          {!simulado ? (
            <BotaoSalvarSeplag
              type="submit"
              label="Simular distribuição"
              icon="pi pi-check"
            />
          ) : (
            <BotaoSalvarSeplag
              type="button"
              label="Confirmar e registrar"
              icon="pi pi-check-circle"
              onClick={confirmar}
            />
          )}
        </footer>
      </form>
    </div>
  );
}




