import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { BadgeSeplag } from "@componentes/Badge";
import { BotaoLimparFiltroSeplag, BotaoSalvarSeplag, BotaoSeplag } from "@componentes/Botao";
import { BreadcrumbSeplag } from "@componentes/Breadcrumb";
import { CardSeplag } from "@componentes/Card";
import { DocumentosLegaisAssociadosSeplag, type DocumentoLegalAssociadoSeplag } from "@componentes/DocumentosLegaisAssociados";
import { DateFieldSeplag, DropdownFieldSeplag, RadioButtonFieldSeplag, TextAreaFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
import { PanelSeplag } from "@componentes/PanelSeplag";
import { ModalSeplag } from "@componentes/Modal";
import { TablePaginadoSeplag, type ColumnMetaSeplag } from "@componentes/TablePaginado";
import type { ResultsSeplag } from "@interfaces/Results";
import { menuGestaoPessoas, PrototypeSystemPage } from "../PrototiposPage";
import { criarNovaVersaoEstrutural, excluirUnidadeDaEstrutura, extinguirUnidadeDaEstrutura, gravarUnidadesDaEstrutura, lerEstruturaOrganizacional, type SituacaoUnidadeEstrutural, type UnidadeEstrutural } from "./estruturaOrganizacionalStore";
import "./unidadesList.css";

type SituacaoUnidade = SituacaoUnidadeEstrutural;
type UnidadeRow = UnidadeEstrutural;

interface UnidadeFiltro {
  pesquisa: string;
  orgao?: string;
  tipo?: string;
  situacao?: SituacaoUnidade;
}

const lerUnidadesCadastradas = (): UnidadeRow[] => lerEstruturaOrganizacional().unidades;
const gravarUnidadesCadastradas = (registros: UnidadeRow[], acao: "CADASTRO" | "EDICAO" | "ORDENACAO" = "EDICAO") => gravarUnidadesDaEstrutura(registros, acao);

const options = (values: string[]) => values.map((value) => ({ label: value, value }));
const documentosLegaisUnidade: DocumentoLegalAssociadoSeplag[] = [
  { id: "decreto-2185-2026", titulo: "Decreto nº 2.185, de 03/07/2026", categoria: "Decreto", descricao: "Estrutura organizacional do Poder Executivo Estadual" },
  { id: "lc-612-2019", titulo: "Lei Complementar nº 612, de 28/01/2019", categoria: "Lei Complementar", descricao: "Organização administrativa do Estado" },
  { id: "lei-10052-2014", titulo: "Lei nº 10.052, de 15/01/2014", categoria: "Lei", descricao: "Estrutura e carreiras da Administração Pública" },
];

interface UnidadeCadastroForm {
  orgao: string;
  formaVinculacao: "" | "ORGAO" | "SETOR";
  setorSuperior: string;
  tipo: string;
  nivelOrganizacional: string;
  nome: string;
  sigla: string;
  codigo: string;
  documento: string;
  uf: string;
  municipio: string;
  outraLocalidade: "NAO" | "SIM";
  cep: string;
  estadoEndereco: string;
  cidadeEndereco: string;
  bairroEndereco: string;
  tipoLogradouro: string;
  logradouro: string;
  numeroEndereco: string;
  complementoEndereco: string;
  dataInicio: string;
  dataInicioEstrutura: string;
  documentoEstrutura: string;
  justificativaMudanca: string;
  dataFimExtincao: string;
  documentoExtincao: string;
}

function UnidadeCadastroPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const unidadeSelecionada = (location.state as { unidade?: UnidadeRow } | null)?.unidade;
  const modoVisualizacao = new URLSearchParams(location.search).get("modo") === "visualizar";
  const modoEdicao = new URLSearchParams(location.search).get("modo") === "editar";
  const { control, watch, setValue } = useForm<UnidadeCadastroForm>({
    defaultValues: {
      orgao: unidadeSelecionada ? (unidadeSelecionada.orgao === "SEPLAG" ? "SEPLAG - Secretaria de Estado de Planejamento e Gestão" : "SEDUC - Secretaria de Estado de Educação") : "",
      formaVinculacao: unidadeSelecionada ? (unidadeSelecionada.unidadeSuperior ? "SETOR" : "ORGAO") : "",
      setorSuperior: unidadeSelecionada?.unidadeSuperior ?? "",
      tipo: unidadeSelecionada?.tipo ?? "",
      nivelOrganizacional: unidadeSelecionada?.nivelOrganizacional ?? "",
      nome: unidadeSelecionada?.nome ?? "",
      sigla: unidadeSelecionada?.sigla ?? "",
      codigo: unidadeSelecionada?.codigo ?? "",
      documento: unidadeSelecionada?.documentoCriacaoId ?? "",
      uf: unidadeSelecionada?.localizacao.split("/")[1] ?? "",
      municipio: unidadeSelecionada?.localizacao.split("/")[0] ?? "",
      outraLocalidade: unidadeSelecionada?.outraLocalidade ? "SIM" : "NAO",
      cep: unidadeSelecionada?.endereco?.cep ?? "",
      estadoEndereco: unidadeSelecionada?.endereco?.estado ?? "",
      cidadeEndereco: unidadeSelecionada?.endereco?.municipio ?? "",
      bairroEndereco: unidadeSelecionada?.endereco?.bairro ?? "",
      tipoLogradouro: unidadeSelecionada?.endereco?.tipoLogradouro ?? "",
      logradouro: unidadeSelecionada?.endereco?.logradouro ?? "",
      numeroEndereco: unidadeSelecionada?.endereco?.numero ?? "",
      complementoEndereco: unidadeSelecionada?.endereco?.complemento ?? "",
      dataInicio: unidadeSelecionada?.dataInicio ?? "",
      dataInicioEstrutura: "",
      documentoEstrutura: "",
      justificativaMudanca: "",
      dataFimExtincao: unidadeSelecionada?.dataFim ?? "Não informada",
      documentoExtincao: unidadeSelecionada?.documentoExtincaoId ?? "Não informado",
    },
  });
  const [documentosSelecionados, setDocumentosSelecionados] = useState<string[]>(unidadeSelecionada?.documentosLegaisCriacaoIds ?? (unidadeSelecionada?.documentoCriacaoId ? [unidadeSelecionada.documentoCriacaoId] : []));
  const [errosValidacao, setErrosValidacao] = useState<string[]>([]);
  const [confirmarMovimentacao, setConfirmarMovimentacao] = useState(false);
  const [unidadesCadastradas, setUnidadesCadastradas] = useState<UnidadeRow[]>(lerUnidadesCadastradas);
  const [unidadeArrastada, setUnidadeArrastada] = useState<number | null>(null);
  const [ordemRascunho, setOrdemRascunho] = useState<number[]>([]);
  const [modalAlterarEstrutura, setModalAlterarEstrutura] = useState(false);
  const orgao = watch("orgao");
  const formaVinculacao = watch("formaVinculacao");
  const setorSuperior = watch("setorSuperior");
  const nomeSetor = watch("nome");
  const outraLocalidade = watch("outraLocalidade");
  const localidadePropria = outraLocalidade === "SIM";
  const orgaoSelecionado = orgao ? orgao.split(" - ")[0] : "Órgão não selecionado";
  const vinculadoDiretamenteAoOrgao = formaVinculacao === "ORGAO";
  const unidadeSuperiorSelecionada = unidadesCadastradas.find((unidade) => unidade.nome === setorSuperior);
  const nivelHierarquico = vinculadoDiretamenteAoOrgao ? 1 : unidadeSuperiorSelecionada ? 2 : null;
  const unidadesMesmoNivel = orgao
    ? unidadesCadastradas
      .filter((unidade) => unidade.orgao === orgaoSelecionado && unidade.situacao === "ATIVA" && unidade.unidadeSuperior === (vinculadoDiretamenteAoOrgao ? undefined : setorSuperior) && unidade.id !== unidadeSelecionada?.id)
      .sort((a, b) => a.ordem - b.ordem)
    : [];
  const nomesDescendentes = new Set<string>();
  if (unidadeSelecionada) {
    const localizarDescendentes = (nomeSuperior: string) => {
      unidadesCadastradas.filter((unidade) => unidade.orgao === unidadeSelecionada.orgao && unidade.unidadeSuperior === nomeSuperior).forEach((unidade) => {
        nomesDescendentes.add(unidade.nome);
        localizarDescendentes(unidade.nome);
      });
    };
    localizarDescendentes(unidadeSelecionada.nome);
  }
  const unidadesSuperiores = unidadesCadastradas.filter((unidade) =>
    unidade.orgao === orgaoSelecionado && unidade.situacao === "ATIVA" && unidade.id !== unidadeSelecionada?.id && !nomesDescendentes.has(unidade.nome),
  );
  const idUnidadeRascunho = unidadeSelecionada?.id ?? -1;
  const itensOrdenacao = ordemRascunho.map((id) => id === idUnidadeRascunho
    ? { id, nome: nomeSetor || "Nova unidade", rascunho: true }
    : unidadesMesmoNivel.find((unidade) => unidade.id === id) ? { ...unidadesMesmoNivel.find((unidade) => unidade.id === id)!, rascunho: false } : null,
  ).filter((unidade): unidade is { id: number; nome: string; rascunho: boolean } => unidade !== null);
  const caminhoSubordinacao = (() => {
    if (!unidadeSelecionada) return [];
    const caminho = [unidadeSelecionada.nome];
    let superior = unidadeSelecionada.unidadeSuperior;
    while (superior) {
      caminho.unshift(superior);
      superior = unidadesCadastradas.find((unidade) => unidade.nome === superior)?.unidadeSuperior;
    }
    return [unidadeSelecionada.orgao, ...caminho];
  })();

  useEffect(() => {
    if (vinculadoDiretamenteAoOrgao && !modalAlterarEstrutura) setValue("setorSuperior", "");
  }, [modalAlterarEstrutura, setValue, vinculadoDiretamenteAoOrgao]);

  useEffect(() => {
    if (!modalAlterarEstrutura) return;
    if (setorSuperior === "__ORGAO__") setValue("formaVinculacao", "ORGAO");
    else if (setorSuperior) setValue("formaVinculacao", "SETOR");
  }, [modalAlterarEstrutura, setorSuperior, setValue]);

  useEffect(() => {
    if (!orgao) {
      setValue("uf", "");
      setValue("municipio", "");
      return;
    }
    setValue("uf", "MT");
    setValue("municipio", "Cuiabá");
  }, [orgao, setValue]);

  useEffect(() => {
    const unidadeNaPosicaoAtual = unidadeSelecionada && unidadeSelecionada.unidadeSuperior === (vinculadoDiretamenteAoOrgao ? undefined : setorSuperior) ? unidadeSelecionada : null;
    setOrdemRascunho([...unidadesMesmoNivel, ...(unidadeNaPosicaoAtual ? [unidadeNaPosicaoAtual] : [])].sort((a, b) => a.ordem - b.ordem).map((unidade) => unidade.id).concat(unidadeNaPosicaoAtual ? [] : [idUnidadeRascunho]));
  }, [formaVinculacao, idUnidadeRascunho, orgaoSelecionado, setorSuperior]);

  const voltar = () => navigate("/prototipos/sigep/gestao/cadastro/estrutura-organizacional/unidades");
  const noError = () => null;
  const validarCadastro = () => {
    const erros: string[] = [];
    if (!orgao) erros.push("Selecione o Órgão/Entidade.");
    if (!watch("tipo")) erros.push("Selecione o Tipo de unidade.");
    if (!watch("nivelOrganizacional")) erros.push("Selecione o Nível organizacional.");
    if (!nomeSetor.trim()) erros.push("Informe o Nome da unidade.");
    if (!formaVinculacao) erros.push("Defina a Forma de Vinculação.");
    if (formaVinculacao === "SETOR" && !setorSuperior) erros.push("Selecione a Unidade superior.");
    if (!watch("dataInicio")) erros.push("Informe a Data de início.");
    if (!documentosSelecionados.length) erros.push("Associe ao menos um Documento Legal de criação.");
    setErrosValidacao(erros);
    return erros.length === 0;
  };
  const trocarOrdem = (unidadeDestino: number) => {
    if (unidadeArrastada === null || unidadeArrastada === unidadeDestino) return;
    setOrdemRascunho((ordemAtual) => {
      const ordem = [...ordemAtual];
      const indiceOrigem = ordem.indexOf(unidadeArrastada);
      const indiceDestino = ordem.indexOf(unidadeDestino);
      if (indiceOrigem < 0 || indiceDestino < 0) return ordemAtual;

      ordem.splice(indiceOrigem, 1);
      ordem.splice(indiceDestino, 0, unidadeArrastada);
      return ordem;
    });
    setUnidadeArrastada(null);
  };
  const salvarUnidade = (movimentacaoConfirmada = false) => {
    if (!validarCadastro()) return;
    const proximaOrdem = unidadesCadastradas
      .filter((unidade) => unidade.orgao === orgaoSelecionado && unidade.unidadeSuperior === (vinculadoDiretamenteAoOrgao ? undefined : setorSuperior) && unidade.id !== unidadeSelecionada?.id)
      .reduce((maior, unidade) => Math.max(maior, unidade.ordem), 0) + 1;
    const registro: UnidadeRow = {
      id: unidadeSelecionada?.id ?? Math.max(0, ...unidadesCadastradas.map((unidade) => unidade.id)) + 1,
      nome: nomeSetor,
      sigla: watch("sigla"),
      codigo: watch("codigo") || `U${String(unidadesCadastradas.length + 1).padStart(4, "0")}`,
      orgao: orgaoSelecionado,
      tipo: watch("tipo"),
      nivelOrganizacional: watch("nivelOrganizacional"),
      localizacao: localidadePropria ? `${watch("cidadeEndereco") || "Cuiabá"}/MT` : "Cuiabá/MT",
      situacao: unidadeSelecionada?.situacao ?? "ATIVA",
      dataInicio: watch("dataInicio") || unidadeSelecionada?.dataInicio || "01/01/2026",
      documentoCriacaoId: documentosSelecionados[0] ?? unidadeSelecionada?.documentoCriacaoId,
      documentosLegaisCriacaoIds: documentosSelecionados,
      outraLocalidade: localidadePropria,
      endereco: localidadePropria ? {
        cep: watch("cep"), estado: watch("estadoEndereco"), municipio: watch("cidadeEndereco"), bairro: watch("bairroEndereco"), tipoLogradouro: watch("tipoLogradouro"), logradouro: watch("logradouro"), numero: watch("numeroEndereco"), complemento: watch("complementoEndereco"),
      } : undefined,
      unidadeSuperior: vinculadoDiretamenteAoOrgao ? undefined : setorSuperior,
      ordem: ordemRascunho.indexOf(idUnidadeRascunho) >= 0 ? ordemRascunho.indexOf(idUnidadeRascunho) + 1 : proximaOrdem,
    };
    const registrosBase = unidadeSelecionada
      ? unidadesCadastradas.map((unidade) => unidade.id === unidadeSelecionada.id ? registro : unidade)
      : [...unidadesCadastradas, registro];
    const registrosAtualizados = registrosBase.map((unidade) => {
      const novaOrdem = ordemRascunho.indexOf(unidade.id);
      return novaOrdem >= 0 ? { ...unidade, ordem: novaOrdem + 1 } : unidade;
    });
    const posicaoFoiAlterada = Boolean(unidadeSelecionada && (
      unidadeSelecionada.unidadeSuperior !== registro.unidadeSuperior || unidadeSelecionada.ordem !== registro.ordem
    ));
    if (modoEdicao && posicaoFoiAlterada) {
      const errosEstrutura = [
        !watch("dataInicioEstrutura") ? "Informe a Data de início da nova estrutura." : "",
        !watch("documentoEstrutura") ? "Selecione o Documento Legal da alteração estrutural." : "",
      ].filter(Boolean);
      if (errosEstrutura.length) {
        setErrosValidacao(errosEstrutura);
        return;
      }
      const subordinadasAtivas = unidadesCadastradas.filter((unidade) => nomesDescendentes.has(unidade.nome) && unidade.situacao === "ATIVA");
      if (subordinadasAtivas.length && !movimentacaoConfirmada) {
        setConfirmarMovimentacao(true);
        return;
      }
      criarNovaVersaoEstrutural(registrosAtualizados, registro.orgao, watch("dataInicioEstrutura"), watch("documentoEstrutura"), watch("justificativaMudanca"));
      navigate("/prototipos/sigep/gestao/cadastro/estrutura-organizacional/unidades");
      return;
    }
    gravarUnidadesCadastradas(registrosAtualizados, unidadeSelecionada ? "EDICAO" : "CADASTRO");
    navigate("/prototipos/sigep/gestao/cadastro/estrutura-organizacional/unidades");
  };

  return (
    <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
      <div className="prototype-carreira-register-page unidades-register-page">
        <BreadcrumbSeplag divided className="prototype-doc-breadcrumb" items={[{ label: "Cadastro" }, { label: "Estrutura Organizacional" }, { label: "Unidades", to: "/prototipos/sigep/gestao/cadastro/estrutura-organizacional/unidades" }, { label: "Cadastrar" }]} />
        <header className="prototype-carreira-register-title">
          <div>
            <h1>{modoVisualizacao ? "Visualizar unidade" : modoEdicao ? "Editar unidade" : "Nova unidade"}</h1>
            <p>{modoVisualizacao ? "Consulte os dados da unidade cadastrada." : modoEdicao ? "Atualize os dados da unidade cadastrada." : "Cadastre as unidades que compõem a estrutura do órgão."}</p>
          </div>
        </header>
          <div className="prototype-carreira-register-form unidades-register-content">
            <fieldset className="unidades-register-fieldset" disabled={modoVisualizacao}>
            {errosValidacao.length > 0 && <div className="unidades-validation-summary" role="alert"><strong>Revise os dados obrigatórios:</strong><ul>{errosValidacao.map((erro) => <li key={erro}>{erro}</li>)}</ul></div>}
            <PanelSeplag title="Identificação da unidade" description="Selecione o órgão e informe os dados básicos da unidade." className="unidades-register-panel">
              <div className="grid unidades-register-fields">
                <DropdownFieldSeplag name="orgao" control={control} label="Órgão/Entidade" placeholder="Selecione..." cols="12 12 4" options={options(["SEPLAG - Secretaria de Estado de Planejamento e Gestão", "SEDUC - Secretaria de Estado de Educação"])} optionLabel="label" optionValue="value" required getFormErrorMessage={noError} />
                <DropdownFieldSeplag name="tipo" control={control} label="Tipo de unidade" placeholder="Selecione..." cols="12 12 4" options={options(["Gabinete", "Secretaria Adjunta", "Superintendência", "Coordenadoria", "Gerência", "Núcleo", "Unidade", "Conselho", "Comissão", "Ouvidoria", "Diretoria"])} optionLabel="label" optionValue="value" required getFormErrorMessage={noError} />
                <DropdownFieldSeplag name="nivelOrganizacional" control={control} label="Nível organizacional" placeholder="Selecione..." cols="12 12 4" options={options(["Nível de Decisão Colegiada", "Nível de Direção Superior", "Nível de Assessoramento Superior", "Nível Assessoramento Estratégico e Especializado", "Nível de Administração Sistêmica", "Nível de Execução Programática", "Nível de Administração Regionalizada", "Nível de Administração Desconcentrada", "Nível de Administração Descentralizada"])} optionLabel="label" optionValue="value" required getFormErrorMessage={noError} />
                <div className="col-12 unidades-register-field-help">UF e Município serão preenchidos automaticamente conforme o órgão selecionado.</div>
                <TextFieldSeplag name="codigo" control={control} label="Código" placeholder="Gerado automaticamente" cols="12 12 2" disabled getFormErrorMessage={noError} />
                <TextFieldSeplag name="nome" control={control} label="Nome da unidade" placeholder="Ex.: Coordenadoria de Modelagem Organizacional" cols="12 12 7" required maxLength={200} getFormErrorMessage={noError} />
                <TextFieldSeplag name="sigla" control={control} label="Sigla" placeholder="Ex.: CMO" cols="12 12 3" maxLength={20} getFormErrorMessage={noError} />
              </div>
            </PanelSeplag>

            <PanelSeplag title="Posição na estrutura" description="Escolha a unidade superior. O nível hierárquico será definido automaticamente." className="unidades-register-panel">
              {modoEdicao && (
                <div className="unidades-structure-change">
                  <div className="unidades-structure-change-header">
                    <span>Posição na Estrutura Organizacional</span>
                    <BotaoSeplag type="button" label="Alterar Estrutura / Subordinação" icon="pi pi-external-link" outlined onClick={() => { setValue("formaVinculacao", unidadeSelecionada?.unidadeSuperior ? "SETOR" : "ORGAO"); setValue("setorSuperior", unidadeSelecionada?.unidadeSuperior ?? "__ORGAO__"); setModalAlterarEstrutura(true); }} />
                  </div>
                  <div className="unidades-structure-current">
                    <small>SUBORDINAÇÃO ATUAL NA ÁRVORE:</small>
                    <strong>{caminhoSubordinacao.join(" > ")}</strong>
                    <span>As alterações de posição serão aplicadas ao salvar a unidade.</span>
                  </div>
                </div>
              )}
              {!modoEdicao && <div className="unidades-position-grid">
                <div className="unidades-position-selection">
                  <div className="grid unidades-position-controls">
                    <RadioButtonFieldSeplag name="formaVinculacao" control={control} label="Forma de Vinculação" cols="12 12 6" options={[{ label: "Diretamente ao órgão", value: "ORGAO" }, { label: "Vincular a outra unidade", value: "SETOR" }]} getFormErrorMessage={noError} />
                    <DropdownFieldSeplag name="setorSuperior" control={control} label="Unidade superior" placeholder={vinculadoDiretamenteAoOrgao ? "Vinculada diretamente ao órgão" : "Selecione..."} cols="12 12 6" options={options(unidadesSuperiores.map((unidade) => unidade.nome))} optionLabel="label" optionValue="value" required={!vinculadoDiretamenteAoOrgao} disabled={vinculadoDiretamenteAoOrgao} getFormErrorMessage={noError} />
                  </div>
                  <p>Somente unidades válidas para receber esta unidade são exibidas.</p>
                  <div className="unidades-position-tree" aria-label="Prévia da posição na estrutura">
                    <span className="level-1">{orgaoSelecionado}</span>
                    {!vinculadoDiretamenteAoOrgao && setorSuperior && <span className="level-2">{setorSuperior}</span>}
                    <strong className="level-3">{nomeSetor || "Nova unidade"}</strong>
                  </div>
                  <section className="unidades-position-order" aria-labelledby="ordem-unidades-titulo">
                    <div className="unidades-position-order-heading">
                      <div>
                        <h3 id="ordem-unidades-titulo">Ordem das unidades no mesmo nível</h3>
                        <p>Arraste uma unidade e solte sobre outra para alterar a ordem de exibição.</p>
                      </div>
                      <i className="pi pi-sort-alt" aria-hidden="true" />
                    </div>
                    {itensOrdenacao.length > 0 ? (
                      <div className="unidades-position-order-list" aria-label="Unidades ordenáveis no mesmo nível">
                        {itensOrdenacao.map((unidade, indice) => (
                          <div
                            key={unidade.id}
                            className={`unidades-position-sort-item${unidade.rascunho ? " is-draft" : ""}${unidadeArrastada === unidade.id ? " is-dragging" : ""}`}
                            draggable
                            onDragStart={(event) => {
                              event.dataTransfer.effectAllowed = "move";
                              setUnidadeArrastada(unidade.id);
                            }}
                            onDragEnd={() => setUnidadeArrastada(null)}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => trocarOrdem(unidade.id)}
                            title="Arraste para reorganizar"
                          >
                            <i className="pi pi-bars unidades-position-drag-handle" aria-hidden="true" />
                            <span className="unidades-position-sort-index">{indice + 1}</span>
                            <span>{unidade.nome}{unidade.rascunho && <small>Nova unidade</small>}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="unidades-position-order-empty">Selecione a unidade superior para ordenar as unidades deste nível.</div>
                    )}
                  </section>
                </div>
                <aside className="unidades-position-summary">
                  <h3>Resumo da posição</h3>
                  <dl>
                    <div><dt>Forma de vinculação</dt><dd>{vinculadoDiretamenteAoOrgao ? "Diretamente ao órgão" : "Vinculada a outra unidade"}</dd></div>
                    <div><dt>Unidade superior</dt><dd>{vinculadoDiretamenteAoOrgao ? "Não se aplica" : setorSuperior || "Não selecionada"}</dd></div>
                    <div><dt>Nível hierárquico</dt><dd>{nivelHierarquico ? `${nivelHierarquico} · calculado automaticamente` : "Aguardando seleção"}</dd></div>
                    <div><dt>Nova unidade</dt><dd>{nomeSetor || "Nome ainda não informado"}</dd></div>
                  </dl>
                </aside>
              </div>}
            </PanelSeplag>

            <PanelSeplag title="Vigência" description="Informe o período de vigência da unidade." className="unidades-register-panel">
              <div className="grid unidades-register-fields">
                <DateFieldSeplag name="dataInicio" control={control} label="Data de início" cols="12 12 6" required getFormErrorMessage={noError} />
              </div>
            </PanelSeplag>

            {modoVisualizacao && unidadeSelecionada?.situacao === "EXTINTA" && <PanelSeplag title="Dados de extinção" description="Informações da vigência encerrada da unidade." className="unidades-register-panel">
              <div className="grid unidades-register-fields">
                <TextFieldSeplag name="dataInicio" control={control} label="Data de início" cols="12 12 4" disabled getFormErrorMessage={noError} />
                <TextFieldSeplag name="dataFimExtincao" control={control} label="Data de fim" cols="12 12 4" disabled getFormErrorMessage={noError} />
                <TextFieldSeplag name="documentoExtincao" control={control} label="Documento Legal de Extinção" cols="12 12 4" disabled getFormErrorMessage={noError} />
              </div>
            </PanelSeplag>}

            <PanelSeplag title="Fundamentação legal" description="Informe o documento que sustenta a existência da unidade." className="unidades-register-panel">
              <div className="unidades-register-legal-documents">
                <DocumentosLegaisAssociadosSeplag label="Documentos legais associados" required options={documentosLegaisUnidade} value={documentosSelecionados} onChange={setDocumentosSelecionados} onNovoCadastro={() => navigate(`/prototipos/sigep/documentos-legais/novo?returnTo=${encodeURIComponent(location.pathname)}`)} onVisualizar={() => {}} expandirAoAbrir />
              </div>
            </PanelSeplag>

            <PanelSeplag title="Localização" description="UF e Município são herdados do órgão. Informe endereço próprio apenas quando a unidade funcionar em outra localidade." className="unidades-register-panel">
              <div className="grid unidades-register-fields">
                <RadioButtonFieldSeplag name="outraLocalidade" control={control} label="A unidade funciona em outra localidade?" cols="12" options={[{ label: "Não", value: "NAO" }, { label: "Sim", value: "SIM" }]} getFormErrorMessage={noError} />
                {!localidadePropria && (
                  <>
                    <div className="col-12 lg:col-6 unidades-register-inherited">
                      <TextFieldSeplag name="uf" control={control} label="UF" placeholder="Selecione o órgão" cols="12" disabled getFormErrorMessage={noError} />
                      <span>Herdado do órgão</span>
                    </div>
                    <div className="col-12 lg:col-6 unidades-register-inherited">
                      <TextFieldSeplag name="municipio" control={control} label="Município" placeholder="Selecione o órgão" cols="12" disabled getFormErrorMessage={noError} />
                      <span>Herdado do órgão</span>
                    </div>
                  </>
                )}
                {localidadePropria && (
                  <div className="col-12 grid unidades-register-address-fields">
                    <TextFieldSeplag name="cep" control={control} label="CEP" placeholder="00000-000" cols="12 12 6" maxLength={9} getFormErrorMessage={noError} />
                    <DropdownFieldSeplag name="estadoEndereco" control={control} label="Estado" placeholder="Selecione..." cols="12 12 4" options={options(["Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"])} optionLabel="label" optionValue="value" getFormErrorMessage={noError} />
                    <DropdownFieldSeplag name="cidadeEndereco" control={control} label="Cidade" placeholder="Selecione..." cols="12 12 4" options={options(["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Cáceres"])} optionLabel="label" optionValue="value" getFormErrorMessage={noError} />
                    <TextFieldSeplag name="bairroEndereco" control={control} label="Bairro/Distrito" placeholder="Informe o bairro ou distrito" cols="12 12 4" getFormErrorMessage={noError} />
                    <DropdownFieldSeplag name="tipoLogradouro" control={control} label="Tipo de Logradouro" placeholder="Selecione..." cols="12 12 4" options={options(["Rua", "Avenida", "Rodovia", "Praça", "Travessa", "Estrada", "Alameda"])} optionLabel="label" optionValue="value" getFormErrorMessage={noError} />
                    <TextFieldSeplag name="logradouro" control={control} label="Logradouro" placeholder="Informe o logradouro" cols="12 12 6" getFormErrorMessage={noError} />
                    <TextFieldSeplag name="numeroEndereco" control={control} label="Número" placeholder="Número" cols="12 12 2" getFormErrorMessage={noError} />
                    <TextFieldSeplag name="complementoEndereco" control={control} label="Complemento" placeholder="Informe o complemento" cols="12" getFormErrorMessage={noError} />
                  </div>
                )}
                <div className="col-12 unidades-register-note">
                  <i className="pi pi-info-circle" />
                  <span>{localidadePropria ? "Informe a UF e o Município próprios da unidade." : "A unidade utilizará a UF e o Município herdados do órgão selecionado."}</span>
                </div>
              </div>
            </PanelSeplag>
            </fieldset>

            <footer className="prototype-carreira-register-actions unidades-register-actions">
              <BotaoSeplag type="button" label={modoVisualizacao ? "Voltar" : "Cancelar"} outlined onClick={voltar} />
              {!modoVisualizacao && <BotaoSalvarSeplag type="button" label={modoEdicao ? "Salvar alterações" : "Salvar unidade"} onClick={salvarUnidade} />}
            </footer>
            <ModalSeplag visible={confirmarMovimentacao} titulo="Confirmar movimentação de ramo" fechar={() => setConfirmarMovimentacao(false)} labelFechar="Cancelar" labelAcao="Continuar" funcAcao={() => { setConfirmarMovimentacao(false); salvarUnidade(true); }} tamanho="620px">
              <p>A unidade possui <strong>{[...nomesDescendentes].filter((nome) => unidadesCadastradas.some((unidade) => unidade.nome === nome && unidade.situacao === "ATIVA")).length}</strong> unidade(s) subordinada(s) ativa(s).</p>
              <p>Ao continuar, todo o ramo será movimentado para a nova posição, preservando as relações internas.</p>
            </ModalSeplag>
            <ModalSeplag visible={modalAlterarEstrutura} titulo="Alterar Subordinação Estrutural" fechar={() => setModalAlterarEstrutura(false)} labelFechar="Cancelar" labelAcao="Confirmar Alteração Estrutural" iconAcao="pi pi-check" funcAcao={() => salvarUnidade()} tamanho="720px">
              <div className="grid unidades-estrutura-modal">
                <div className="col-12 unidades-estrutura-atual"><small>SUBORDINAÇÃO ATUAL:</small><strong>{caminhoSubordinacao.join(" > ")}</strong></div>
                <DropdownFieldSeplag name="setorSuperior" control={control} label="Nova Unidade Superior (Mãe)" placeholder="Selecione a nova unidade pai..." cols="12" required options={[{ label: "Diretamente ao Órgão/Entidade", value: "__ORGAO__" }, ...unidadesSuperiores.map((unidade) => ({ label: unidade.nome, value: unidade.nome }))]} optionLabel="label" optionValue="value" getFormErrorMessage={noError} />
                <DateFieldSeplag name="dataInicioEstrutura" control={control} label="Data da Nova Vigência" cols="12 12 5" required getFormErrorMessage={noError} />
                <DropdownFieldSeplag name="documentoEstrutura" control={control} label="Amparo Legal da Reorganização" placeholder="Selecione o amparo legal..." cols="12 12 7" required options={documentosLegaisUnidade.map((documento) => ({ label: documento.titulo, value: documento.id }))} optionLabel="label" optionValue="value" getFormErrorMessage={noError} />
                <TextAreaFieldSeplag name="justificativaMudanca" control={control} label="Justificativa da Mudança" placeholder="Informe a motivação técnica/legal para o remanejamento deste setor..." rows={3} maxLength={1000} cols="12" getFormErrorMessage={noError} />
                {errosValidacao.length > 0 && <div className="col-12 unidades-operation-error">{errosValidacao.join(" ")}</div>}
                <div className="col-12 unidades-estrutura-alert"><i className="pi pi-exclamation-triangle" /><span>Ao confirmar, a relação de subordinação anterior será encerrada na data informada. O organograma manterá o histórico retroativo e publicará uma nova versão vigente.</span></div>
              </div>
            </ModalSeplag>
          </div>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposUnidadesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const cadastro = location.pathname.endsWith("/novo");
  const [pagina, setPagina] = useState(0);
  const [unidadesCadastradas, setUnidadesCadastradas] = useState<UnidadeRow[]>(lerUnidadesCadastradas);
  const [unidadeParaExtinguir, setUnidadeParaExtinguir] = useState<UnidadeRow | null>(null);
  const [unidadeParaExcluir, setUnidadeParaExcluir] = useState<UnidadeRow | null>(null);
  const [erroOperacao, setErroOperacao] = useState("");
  const registrosPorPagina = 10;
  const { control, reset, watch } = useForm<UnidadeFiltro>({
    defaultValues: { pesquisa: "", situacao: "ATIVA" },
  });
  const filtros = watch();
  const { control: controlExtincao, watch: watchExtincao, reset: resetExtincao } = useForm<{ dataFim: string; documentoExtincao: string }>({ defaultValues: { dataFim: "", documentoExtincao: "" } });
  const termo = filtros.pesquisa.trim().toLocaleLowerCase("pt-BR");
  const filtradas = unidadesCadastradas.filter((unidade) =>
    (!termo || [unidade.nome, unidade.sigla, unidade.codigo].some((valor) => valor.toLocaleLowerCase("pt-BR").includes(termo))) &&
    (!filtros.orgao || unidade.orgao === filtros.orgao) &&
    (!filtros.tipo || unidade.tipo === filtros.tipo) &&
    (!filtros.situacao || unidade.situacao === filtros.situacao),
  );

  useEffect(() => setPagina(0), [filtros.pesquisa, filtros.orgao, filtros.tipo, filtros.situacao]);
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / registrosPorPagina));
  const paginaAtual = Math.min(pagina, totalPaginas - 1);
  const content = filtradas.slice(paginaAtual * registrosPorPagina, (paginaAtual + 1) * registrosPorPagina);
  const data: ResultsSeplag<UnidadeRow> = {
    content,
    last: paginaAtual + 1 >= totalPaginas,
    totalPages: totalPaginas,
    pageActual: paginaAtual,
    sizePage: registrosPorPagina,
    totalRecords: filtradas.length,
    size: registrosPorPagina,
    number: paginaAtual,
    first: paginaAtual === 0,
    numberOfElements: content.length,
    empty: content.length === 0,
  };

  const columns: ColumnMetaSeplag<UnidadeRow>[] = [
    {
      header: "Unidade",
      body: (row) => <div className="unidades-list-identificacao"><strong>{row.nome}</strong><small>{row.sigla} · {row.codigo}</small></div>,
    },
    { field: "orgao", header: "Órgão/Entidade" },
    {
      header: "Tipo",
      body: (row) => <BadgeSeplag label={row.tipo} color="#075d96" bg="#edf6fd" border="#c8dfef" size="sm" />,
    },
    { field: "localizacao", header: "Localização" },
    {
      header: "Situação",
      body: (row) => <BadgeSeplag label={row.situacao === "ATIVA" ? "Ativa" : row.situacao === "EXTINTA" ? "Extinta" : "Inativa"} color={row.situacao === "ATIVA" ? "#00843d" : row.situacao === "EXTINTA" ? "#b42318" : "#6b7280"} bg={row.situacao === "ATIVA" ? "#e2f3e8" : row.situacao === "EXTINTA" ? "#fef3f2" : "#f1f3f5"} border="transparent" size="md" />,
    },
  ];

  if (cadastro) {
    return <UnidadeCadastroPage />;
  }

  return (
    <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
      <div className="prototype-page-content prototype-page-content--white unidades-list-page">
        <CardSeplag
          title="Unidades"
          cols="12"
          cardHeaderClassNames="prototype-carreira-card"
          headerNavigation={<BreadcrumbSeplag divided items={[{ label: "Cadastro" }, { label: "Estrutura Organizacional" }, { label: "Unidades" }]} />}
        >
          <p className="unidades-list-description">Consulte e mantenha as unidades cadastradas nos órgãos e entidades.</p>
          <div className="prototype-category-filters prototype-cargo-filters unidades-list-filters grid">
            <TextFieldSeplag name="pesquisa" control={control} label="Pesquisar" placeholder="Nome da unidade, sigla ou código" cols="12 6 4" getFormErrorMessage={() => null} />
            <DropdownFieldSeplag name="orgao" control={control} label="Órgão/Entidade" placeholder="Todos" cols="12 6 2" options={options(["SEPLAG", "SEDUC"])} optionLabel="label" optionValue="value" showClear getFormErrorMessage={() => null} />
            <DropdownFieldSeplag name="tipo" control={control} label="Tipo de unidade" placeholder="Todos" cols="12 6 2" options={options([...new Set(unidadesCadastradas.map((item) => item.tipo))])} optionLabel="label" optionValue="value" showClear getFormErrorMessage={() => null} />
            <DropdownFieldSeplag name="situacao" control={control} label="Situação" placeholder="Todas" cols="12 6 2" options={[{ label: "Ativa", value: "ATIVA" }, { label: "Inativa", value: "INATIVA" }, { label: "Extinta", value: "EXTINTA" }]} optionLabel="label" optionValue="value" showClear getFormErrorMessage={() => null} />
            <div className="prototype-category-clear col-12 md:col-6 lg:col-2">
              <BotaoLimparFiltroSeplag type="button" label="Limpar" icon="pi pi-refresh" onClick={() => reset({ pesquisa: "", orgao: undefined, tipo: undefined, situacao: undefined })} />
            </div>
          </div>
          <div className="unidades-list-summary">{filtradas.length} {filtradas.length === 1 ? "unidade encontrada" : "unidades encontradas"}</div>
          <div className="prototype-cargo-table unidades-list-table">
            <TablePaginadoSeplag
              dataKey="id"
              data={data}
              rows={registrosPorPagina}
              rowsPerPage={[registrosPorPagina]}
              columns={columns}
              lazy
              paginator
              selectionMode={null}
              hasEventoAcao
              handleAdicionar={() => navigate("/prototipos/sigep/gestao/cadastro/estrutura-organizacional/unidades/novo")}
              handleView={(unidade) => navigate("/prototipos/sigep/gestao/cadastro/estrutura-organizacional/unidades/novo?modo=visualizar", { state: { unidade } })}
              handleEdit={(unidade) => navigate(`/prototipos/sigep/gestao/cadastro/estrutura-organizacional/unidades/novo?modo=${unidade.situacao === "EXTINTA" ? "visualizar" : "editar"}`, { state: { unidade } })}
              handleDelete={(unidade) => { if (unidade.situacao !== "EXTINTA") { setErroOperacao(""); setUnidadeParaExcluir(unidade); } }}
              extraAcoesSplit={(unidade) => [
                ...(unidade.situacao === "ATIVA" ? [{ label: "Extinguir Unidade", icon: "pi pi-ban", command: () => { setErroOperacao(""); resetExtincao({ dataFim: "", documentoExtincao: "" }); setUnidadeParaExtinguir(unidade); } }] : []),
                ...(unidade.situacao !== "EXTINTA" ? [{ label: "Excluir", icon: "pi pi-trash", command: () => { setErroOperacao(""); setUnidadeParaExcluir(unidade); } }] : []),
              ]}
              handleOnPageChange={(event) => setPagina(Math.floor((event.first ?? 0) / (event.rows ?? registrosPorPagina)))}
            />
          </div>
          <ModalSeplag visible={Boolean(unidadeParaExtinguir)} titulo="Extinguir Unidade" fechar={() => setUnidadeParaExtinguir(null)} labelFechar="Cancelar" labelAcao="Confirmar Extinção" funcAcao={() => {
            if (!unidadeParaExtinguir) return;
            const possuiSubordinadas = unidadesCadastradas.some((unidade) => unidade.unidadeSuperior === unidadeParaExtinguir.nome && unidade.situacao === "ATIVA");
            const possuiImpedimento = possuiSubordinadas || (unidadeParaExtinguir.servidoresAtivosLotados ?? 0) > 0;
            if (possuiImpedimento) { setErroOperacao(`Não é possível extinguir a unidade ${unidadeParaExtinguir.nome}, pois existem servidores lotados e/ou unidades subordinadas ativas.`); return; }
            if (!watchExtincao("dataFim") || !watchExtincao("documentoExtincao")) { setErroOperacao("Informe a Data de Fim e o Documento Legal de Extinção."); return; }
            const estrutura = extinguirUnidadeDaEstrutura(unidadeParaExtinguir.id, watchExtincao("dataFim"), watchExtincao("documentoExtincao"));
            setUnidadesCadastradas(estrutura.unidades); setUnidadeParaExtinguir(null); setErroOperacao("");
          }} tamanho="680px">
            {unidadeParaExtinguir && <div className="grid unidades-extincao-modal"><p className="col-12">A unidade <strong>{unidadeParaExtinguir.nome}</strong> será encerrada formalmente e não poderá ser reativada.</p>{erroOperacao && <p className="col-12 unidades-operation-error">{erroOperacao}</p>}<DateFieldSeplag name="dataFim" control={controlExtincao} label="Data de Fim" cols="12 12 6" required getFormErrorMessage={() => null} /><DropdownFieldSeplag name="documentoExtincao" control={controlExtincao} label="Documento Legal de Extinção" placeholder="Selecione..." cols="12 12 6" required options={documentosLegaisUnidade.map((documento) => ({ label: documento.titulo, value: documento.id }))} optionLabel="label" optionValue="value" getFormErrorMessage={() => null} /></div>}
          </ModalSeplag>
          <ModalSeplag visible={Boolean(unidadeParaExcluir)} titulo="Excluir cadastro de unidade" fechar={() => setUnidadeParaExcluir(null)} labelFechar="Cancelar" labelAcao="Excluir" funcAcao={() => {
            if (!unidadeParaExcluir) return;
            const possuiDependencia = unidadesCadastradas.some((unidade) => unidade.unidadeSuperior === unidadeParaExcluir.nome) || (unidadeParaExcluir.servidoresAtivosLotados ?? 0) > 0 || (unidadeParaExcluir.referencias ?? 0) > 0;
            if (possuiDependencia) { setErroOperacao(`Não é possível excluir a unidade ${unidadeParaExcluir.nome}, pois ela possui vínculos, dependências ou referências que exigem sua preservação.`); return; }
            const estrutura = excluirUnidadeDaEstrutura(unidadeParaExcluir.id);
            setUnidadesCadastradas(estrutura.unidades); setUnidadeParaExcluir(null); setErroOperacao("");
          }} tamanho="640px">
            {unidadeParaExcluir && <div className="unidades-extincao-modal"><p>Deseja realmente excluir a unidade <strong>{unidadeParaExcluir.nome}</strong>?</p><p>Esta ação é exclusiva para cadastro indevido e não poderá ser desfeita.</p>{erroOperacao && <p className="unidades-operation-error">{erroOperacao}</p>}</div>}
          </ModalSeplag>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}
