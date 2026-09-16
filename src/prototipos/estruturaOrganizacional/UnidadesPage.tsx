import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { BadgeSeplag } from "@componentes/Badge";
import { BotaoLimparFiltroSeplag, BotaoSalvarSeplag, BotaoSeplag } from "@componentes/Botao";
import { BreadcrumbSeplag } from "@componentes/Breadcrumb";
import { CardSeplag } from "@componentes/Card";
import { DocumentosLegaisAssociadosSeplag, type DocumentoLegalAssociadoSeplag } from "@componentes/DocumentosLegaisAssociados";
import { DateFieldSeplag, DropdownFieldSeplag, RadioButtonFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
import { PanelSeplag } from "@componentes/PanelSeplag";
import { TablePaginadoSeplag, type ColumnMetaSeplag } from "@componentes/TablePaginado";
import type { ResultsSeplag } from "@interfaces/Results";
import { menuGestaoPessoas, PrototypeSystemPage } from "../PrototiposPage";
import "./unidadesList.css";

type SituacaoUnidade = "ATIVA" | "INATIVA";

interface UnidadeRow {
  id: number;
  nome: string;
  sigla: string;
  codigo: string;
  orgao: string;
  tipo: string;
  localizacao: string;
  situacao: SituacaoUnidade;
  unidadeSuperior?: string;
  ordem: number;
}

interface UnidadeFiltro {
  pesquisa: string;
  orgao?: string;
  tipo?: string;
  situacao?: SituacaoUnidade;
}

const CHAVE_UNIDADES_CADASTRADAS = "sigep-prototipo-unidades-cadastradas-v2";
const unidadesIniciais: UnidadeRow[] = [
  { id: 1, nome: "Gabinete do Secretário de Estado de Planejamento e Gestão", sigla: "GAB", codigo: "U0001", orgao: "SEPLAG", tipo: "Gabinete", localizacao: "Cuiabá/MT", situacao: "ATIVA", ordem: 1 },
  { id: 2, nome: "Gabinete do Secretário Adjunto de Planejamento e Governo Digital", sigla: "GSAPGD", codigo: "U0002", orgao: "SEPLAG", tipo: "Secretaria Adjunta", localizacao: "Cuiabá/MT", situacao: "ATIVA", unidadeSuperior: "Gabinete do Secretário de Estado de Planejamento e Gestão", ordem: 1 },
  { id: 3, nome: "Superintendência de Modernização Organizacional", sigla: "SUMO", codigo: "U0003", orgao: "SEPLAG", tipo: "Superintendência", localizacao: "Cuiabá/MT", situacao: "ATIVA", unidadeSuperior: "Gabinete do Secretário Adjunto de Planejamento e Governo Digital", ordem: 1 },
  { id: 4, nome: "Coordenadoria de Modelagem Organizacional", sigla: "CMO", codigo: "U0004", orgao: "SEPLAG", tipo: "Coordenadoria", localizacao: "Cuiabá/MT", situacao: "ATIVA", unidadeSuperior: "Gabinete do Secretário Adjunto de Planejamento e Governo Digital", ordem: 2 },
  { id: 5, nome: "Gerência de Otimização de Processos", sigla: "GEOP", codigo: "U0005", orgao: "SEPLAG", tipo: "Gerência", localizacao: "Cuiabá/MT", situacao: "ATIVA", unidadeSuperior: "Gabinete do Secretário Adjunto de Planejamento e Governo Digital", ordem: 3 },
  { id: 6, nome: "Núcleo de Gestão Estratégica para Resultados - NGER", sigla: "NGER", codigo: "U0006", orgao: "SEPLAG", tipo: "Núcleo", localizacao: "Cuiabá/MT", situacao: "ATIVA", unidadeSuperior: "Superintendência de Modernização Organizacional", ordem: 1 },
  { id: 7, nome: "Gabinete do Secretário de Estado de Educação", sigla: "GAB", codigo: "U0101", orgao: "SEDUC", tipo: "Gabinete", localizacao: "Cuiabá/MT", situacao: "ATIVA", ordem: 1 },
  { id: 8, nome: "Superintendência de Gestão de Pessoas", sigla: "SGP", codigo: "U0102", orgao: "SEDUC", tipo: "Superintendência", localizacao: "Cuiabá/MT", situacao: "ATIVA", unidadeSuperior: "Gabinete do Secretário de Estado de Educação", ordem: 1 },
  { id: 9, nome: "Coordenadoria Regional", sigla: "COR", codigo: "U0103", orgao: "SEDUC", tipo: "Coordenadoria", localizacao: "Rondonópolis/MT", situacao: "ATIVA", unidadeSuperior: "Superintendência de Gestão de Pessoas", ordem: 1 },
];

const lerUnidadesCadastradas = (): UnidadeRow[] => {
  if (typeof window === "undefined") return unidadesIniciais;
  try {
    const registros = window.localStorage.getItem(CHAVE_UNIDADES_CADASTRADAS);
    return registros ? JSON.parse(registros) as UnidadeRow[] : unidadesIniciais;
  } catch {
    return unidadesIniciais;
  }
};

const gravarUnidadesCadastradas = (registros: UnidadeRow[]) => {
  window.localStorage.setItem(CHAVE_UNIDADES_CADASTRADAS, JSON.stringify(registros));
};

const options = (values: string[]) => values.map((value) => ({ label: value, value }));
const documentosLegaisUnidade: DocumentoLegalAssociadoSeplag[] = [
  { id: "decreto-2185-2026", titulo: "Decreto nº 2.185, de 03/07/2026", categoria: "Decreto", descricao: "Estrutura organizacional do Poder Executivo Estadual" },
  { id: "lc-612-2019", titulo: "Lei Complementar nº 612, de 28/01/2019", categoria: "Lei Complementar", descricao: "Organização administrativa do Estado" },
  { id: "lei-10052-2014", titulo: "Lei nº 10.052, de 15/01/2014", categoria: "Lei", descricao: "Estrutura e carreiras da Administração Pública" },
];

interface UnidadeCadastroForm {
  orgao: string;
  formaVinculacao: "ORGAO" | "SETOR";
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
  dataFim: string;
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
      formaVinculacao: unidadeSelecionada?.unidadeSuperior ? "SETOR" : "ORGAO",
      setorSuperior: unidadeSelecionada?.unidadeSuperior ?? "",
      tipo: unidadeSelecionada?.tipo ?? "",
      nivelOrganizacional: "Nível de Execução Programática",
      nome: unidadeSelecionada?.nome ?? "",
      sigla: unidadeSelecionada?.sigla ?? "",
      codigo: unidadeSelecionada?.codigo ?? "",
      documento: "",
      uf: "",
      municipio: "",
      outraLocalidade: "NAO",
      cep: "",
      estadoEndereco: "",
      cidadeEndereco: "",
      bairroEndereco: "",
      tipoLogradouro: "",
      logradouro: "",
      numeroEndereco: "",
      complementoEndereco: "",
      dataInicio: "",
      dataFim: "",
    },
  });
  const [documentosSelecionados, setDocumentosSelecionados] = useState<string[]>([]);
  const [unidadesCadastradas, setUnidadesCadastradas] = useState<UnidadeRow[]>(lerUnidadesCadastradas);
  const [unidadeArrastada, setUnidadeArrastada] = useState<number | null>(null);
  const [alterandoEstrutura, setAlterandoEstrutura] = useState(!modoEdicao);
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
      .filter((unidade) => unidade.orgao === orgaoSelecionado && unidade.unidadeSuperior === (vinculadoDiretamenteAoOrgao ? undefined : setorSuperior) && unidade.id !== unidadeSelecionada?.id)
      .sort((a, b) => a.ordem - b.ordem)
    : [];
  const unidadesSuperiores = unidadesCadastradas.filter((unidade) => unidade.orgao === orgaoSelecionado && unidade.id !== unidadeSelecionada?.id);
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
    if (vinculadoDiretamenteAoOrgao) setValue("setorSuperior", "");
  }, [setValue, vinculadoDiretamenteAoOrgao]);

  useEffect(() => {
    if (!orgao) {
      setValue("uf", "");
      setValue("municipio", "");
      return;
    }
    setValue("uf", "MT");
    setValue("municipio", "Cuiabá");
  }, [orgao, setValue]);

  const voltar = () => navigate("/prototipos/sigep/gestao/cadastro/estrutura-organizacional/unidades");
  const noError = () => null;
  const trocarOrdem = (unidadeDestino: number) => {
    if (!unidadeArrastada || unidadeArrastada === unidadeDestino) return;

    setUnidadesCadastradas((cadastroAtual) => {
      const ordem = unidadesMesmoNivel.map((unidade) => unidade.id);
      const indiceOrigem = ordem.indexOf(unidadeArrastada);
      const indiceDestino = ordem.indexOf(unidadeDestino);
      if (indiceOrigem < 0 || indiceDestino < 0) return cadastroAtual;

      ordem.splice(indiceOrigem, 1);
      ordem.splice(indiceDestino, 0, unidadeArrastada);
      const registrosAtualizados = cadastroAtual.map((unidade) => {
        const novaOrdem = ordem.indexOf(unidade.id);
        return novaOrdem >= 0 ? { ...unidade, ordem: novaOrdem + 1 } : unidade;
      });
      gravarUnidadesCadastradas(registrosAtualizados);
      return registrosAtualizados;
    });
    setUnidadeArrastada(null);
  };
  const salvarUnidade = () => {
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
      localizacao: localidadePropria ? `${watch("cidadeEndereco") || "Cuiabá"}/MT` : "Cuiabá/MT",
      situacao: unidadeSelecionada?.situacao ?? "ATIVA",
      unidadeSuperior: vinculadoDiretamenteAoOrgao ? undefined : setorSuperior,
      ordem: unidadeSelecionada?.ordem ?? proximaOrdem,
    };
    const registrosAtualizados = unidadeSelecionada
      ? unidadesCadastradas.map((unidade) => unidade.id === unidadeSelecionada.id ? registro : unidade)
      : [...unidadesCadastradas, registro];
    gravarUnidadesCadastradas(registrosAtualizados);
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
                    <BotaoSeplag type="button" label="Alterar Estrutura / Subordinação" icon="pi pi-external-link" severity="warning" onClick={() => setAlterandoEstrutura(true)} />
                  </div>
                  <div className="unidades-structure-current">
                    <small>SUBORDINAÇÃO ATUAL NA ÁRVORE:</small>
                    <strong>{caminhoSubordinacao.join(" > ")}</strong>
                    <span>As alterações de posição serão aplicadas ao salvar a unidade.</span>
                  </div>
                </div>
              )}
              {(alterandoEstrutura || !modoEdicao) && <div className="unidades-position-grid">
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
                    {unidadesMesmoNivel.length > 0 ? (
                      <div className="unidades-position-order-list" aria-label="Unidades ordenáveis no mesmo nível">
                        {unidadesMesmoNivel.map((unidade, indice) => (
                          <div
                            key={unidade.id}
                            className={`unidades-position-sort-item${unidadeArrastada === unidade.id ? " is-dragging" : ""}`}
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
                            <span>{unidade.nome}</span>
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
                <DateFieldSeplag name="dataFim" control={control} label="Data de fim" cols="12 12 6" getFormErrorMessage={noError} />
              </div>
            </PanelSeplag>

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
                    <TextFieldSeplag name="cep" control={control} label="CEP" placeholder="00000-000" cols="12 12 6" required maxLength={9} getFormErrorMessage={noError} />
                    <DropdownFieldSeplag name="estadoEndereco" control={control} label="Estado" placeholder="Selecione..." cols="12 12 4" required options={options(["Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"])} optionLabel="label" optionValue="value" getFormErrorMessage={noError} />
                    <DropdownFieldSeplag name="cidadeEndereco" control={control} label="Cidade" placeholder="Selecione..." cols="12 12 4" required options={options(["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Cáceres"])} optionLabel="label" optionValue="value" getFormErrorMessage={noError} />
                    <TextFieldSeplag name="bairroEndereco" control={control} label="Bairro/Distrito" placeholder="Informe o bairro ou distrito" cols="12 12 4" required getFormErrorMessage={noError} />
                    <DropdownFieldSeplag name="tipoLogradouro" control={control} label="Tipo de Logradouro" placeholder="Selecione..." cols="12 12 4" required options={options(["Rua", "Avenida", "Rodovia", "Praça", "Travessa", "Estrada", "Alameda"])} optionLabel="label" optionValue="value" getFormErrorMessage={noError} />
                    <TextFieldSeplag name="logradouro" control={control} label="Logradouro" placeholder="Informe o logradouro" cols="12 12 6" required getFormErrorMessage={noError} />
                    <TextFieldSeplag name="numeroEndereco" control={control} label="Número" placeholder="Número" cols="12 12 2" required getFormErrorMessage={noError} />
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
  const [unidadesCadastradas] = useState<UnidadeRow[]>(lerUnidadesCadastradas);
  const registrosPorPagina = 10;
  const { control, reset, watch } = useForm<UnidadeFiltro>({
    defaultValues: { pesquisa: "", situacao: "ATIVA" },
  });
  const filtros = watch();
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
      body: (row) => <BadgeSeplag label={row.situacao === "ATIVA" ? "Ativa" : "Inativa"} color={row.situacao === "ATIVA" ? "#00843d" : "#6b7280"} bg={row.situacao === "ATIVA" ? "#e2f3e8" : "#f1f3f5"} border="transparent" size="md" />,
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
            <DropdownFieldSeplag name="situacao" control={control} label="Situação" placeholder="Todas" cols="12 6 2" options={[{ label: "Ativa", value: "ATIVA" }, { label: "Inativa", value: "INATIVA" }]} optionLabel="label" optionValue="value" showClear getFormErrorMessage={() => null} />
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
              handleEdit={(unidade) => navigate("/prototipos/sigep/gestao/cadastro/estrutura-organizacional/unidades/novo?modo=editar", { state: { unidade } })}
              handleDelete={() => {}}
              handleOnPageChange={(event) => setPagina(Math.floor((event.first ?? 0) / (event.rows ?? registrosPorPagina)))}
            />
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}
