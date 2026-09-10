import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { BadgeSeplag } from "@componentes/Badge";
import { BotaoLimparFiltroSeplag, BotaoSalvarSeplag, BotaoSeplag } from "@componentes/Botao";
import { BreadcrumbSeplag } from "@componentes/Breadcrumb";
import { CardSeplag } from "@componentes/Card";
import { DocumentosLegaisAssociadosSeplag, type DocumentoLegalAssociadoSeplag } from "@componentes/DocumentosLegaisAssociados";
import { DropdownFieldSeplag, RadioButtonFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
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
}

interface UnidadeFiltro {
  pesquisa: string;
  orgao?: string;
  tipo?: string;
  situacao?: SituacaoUnidade;
}

const unidades: UnidadeRow[] = [
  { id: 1, nome: "Gabinete do Secretário de Estado de Planejamento e Gestão", sigla: "GAB", codigo: "U0001", orgao: "SEPLAG", tipo: "Gabinete", localizacao: "Cuiabá/MT", situacao: "ATIVA" },
  { id: 2, nome: "Gabinete do Secretário Adjunto de Planejamento e Governo Digital", sigla: "GSAPGD", codigo: "U0002", orgao: "SEPLAG", tipo: "Secretaria Adjunta", localizacao: "Cuiabá/MT", situacao: "ATIVA" },
  { id: 3, nome: "Superintendência de Modernização Organizacional", sigla: "SUMO", codigo: "U0003", orgao: "SEPLAG", tipo: "Superintendência", localizacao: "Cuiabá/MT", situacao: "ATIVA" },
  { id: 4, nome: "Coordenadoria de Modelagem Organizacional", sigla: "CMO", codigo: "U0004", orgao: "SEPLAG", tipo: "Coordenadoria", localizacao: "Cuiabá/MT", situacao: "ATIVA" },
  { id: 5, nome: "Gerência de Otimização de Processos", sigla: "GEOP", codigo: "U0005", orgao: "SEPLAG", tipo: "Gerência", localizacao: "Cuiabá/MT", situacao: "ATIVA" },
  { id: 6, nome: "Núcleo de Gestão Estratégica para Resultados - NGER", sigla: "NGER", codigo: "U0006", orgao: "SEPLAG", tipo: "Núcleo", localizacao: "Cuiabá/MT", situacao: "ATIVA" },
  { id: 7, nome: "Gabinete do Secretário de Estado de Educação", sigla: "GAB", codigo: "U0101", orgao: "SEDUC", tipo: "Gabinete", localizacao: "Cuiabá/MT", situacao: "ATIVA" },
  { id: 8, nome: "Superintendência de Gestão de Pessoas", sigla: "SGP", codigo: "U0102", orgao: "SEDUC", tipo: "Superintendência", localizacao: "Cuiabá/MT", situacao: "ATIVA" },
  { id: 9, nome: "Coordenadoria Regional", sigla: "COR", codigo: "U0103", orgao: "SEDUC", tipo: "Coordenadoria", localizacao: "Rondonópolis/MT", situacao: "ATIVA" },
];

const options = (values: string[]) => values.map((value) => ({ label: value, value }));
const documentosLegaisUnidade: DocumentoLegalAssociadoSeplag[] = [
  { id: "decreto-2185-2026", titulo: "Decreto nº 2.185, de 03/07/2026", categoria: "Decreto", descricao: "Estrutura organizacional do Poder Executivo Estadual" },
  { id: "lc-612-2019", titulo: "Lei Complementar nº 612, de 28/01/2019", categoria: "Lei Complementar", descricao: "Organização administrativa do Estado" },
  { id: "lei-10052-2014", titulo: "Lei nº 10.052, de 15/01/2014", categoria: "Lei", descricao: "Estrutura e carreiras da Administração Pública" },
];

interface UnidadeCadastroForm {
  orgao: string;
  setorSuperior: string;
  tipo: string;
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
}

function UnidadeCadastroPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { control, watch, setValue } = useForm<UnidadeCadastroForm>({
    defaultValues: {
      orgao: "",
      setorSuperior: "",
      tipo: "",
      nome: "",
      sigla: "",
      codigo: "",
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
    },
  });
  const [documentosSelecionados, setDocumentosSelecionados] = useState<string[]>([]);
  const orgao = watch("orgao");
  const outraLocalidade = watch("outraLocalidade");
  const localidadePropria = outraLocalidade === "SIM";

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

  return (
    <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
      <div className="prototype-carreira-register-page unidades-register-page">
        <BreadcrumbSeplag divided className="prototype-doc-breadcrumb" items={[{ label: "Cadastro" }, { label: "Estrutura Organizacional" }, { label: "Setores", to: "/prototipos/sigep/gestao/cadastro/estrutura-organizacional/unidades" }, { label: "Cadastrar" }]} />
        <header className="prototype-carreira-register-title">
          <div>
            <h1>Novo setor</h1>
            <p>Cadastre os setores que compõem a estrutura do órgão.</p>
          </div>
        </header>
          <div className="prototype-carreira-register-form unidades-register-content">
            <PanelSeplag title="Identificação do setor" description="Selecione o órgão e informe os dados básicos do setor." className="unidades-register-panel">
              <div className="grid unidades-register-fields">
                <DropdownFieldSeplag name="orgao" control={control} label="Órgão/Entidade" placeholder="Selecione..." cols="12 12 4" options={options(["SEPLAG - Secretaria de Estado de Planejamento e Gestão", "SEDUC - Secretaria de Estado de Educação"])} optionLabel="label" optionValue="value" required getFormErrorMessage={noError} />
                <DropdownFieldSeplag name="setorSuperior" control={control} label="Setor superior" placeholder="Selecione, se houver..." cols="12 12 4" options={options(["Gabinete do Secretário", "Secretaria Adjunta", "Superintendência de Modernização Organizacional", "Coordenadoria de Modelagem Organizacional"])} optionLabel="label" optionValue="value" showClear getFormErrorMessage={noError} />
                <DropdownFieldSeplag name="tipo" control={control} label="Tipo de setor" placeholder="Selecione..." cols="12 12 4" options={options(["Gabinete", "Secretaria Adjunta", "Superintendência", "Coordenadoria", "Gerência", "Núcleo", "Setor", "Conselho", "Comissão", "Ouvidoria", "Diretoria"])} optionLabel="label" optionValue="value" required getFormErrorMessage={noError} />
                <div className="col-12 unidades-register-field-help">UF e Município serão preenchidos automaticamente conforme o órgão selecionado.</div>
                <TextFieldSeplag name="codigo" control={control} label="Código" placeholder="Gerado automaticamente" cols="12 12 3" disabled getFormErrorMessage={noError} />
                <TextFieldSeplag name="nome" control={control} label="Nome do setor" placeholder="Ex.: Coordenadoria de Modelagem Organizacional" cols="12 12 6" required maxLength={200} getFormErrorMessage={noError} />
                <TextFieldSeplag name="sigla" control={control} label="Sigla" placeholder="Ex.: CMO" cols="12 12 3" maxLength={20} getFormErrorMessage={noError} />
              </div>
            </PanelSeplag>

            <PanelSeplag title="Fundamentação legal" description="Informe o documento que sustenta a existência do setor." className="unidades-register-panel">
              <div className="unidades-register-legal-documents">
                <DocumentosLegaisAssociadosSeplag label="Documentos legais associados" required options={documentosLegaisUnidade} value={documentosSelecionados} onChange={setDocumentosSelecionados} onNovoCadastro={() => navigate(`/prototipos/sigep/documentos-legais/novo?returnTo=${encodeURIComponent(location.pathname)}`)} onVisualizar={() => {}} expandirAoAbrir />
              </div>
            </PanelSeplag>

            <PanelSeplag title="Localização" description="UF e Município são herdados do órgão. Informe endereço próprio apenas quando o setor funcionar em outra localidade." className="unidades-register-panel">
              <div className="grid unidades-register-fields">
                <RadioButtonFieldSeplag name="outraLocalidade" control={control} label="O setor funciona em outra localidade?" cols="12" options={[{ label: "Não", value: "NAO" }, { label: "Sim", value: "SIM" }]} getFormErrorMessage={noError} />
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
                  <span>{localidadePropria ? "Informe a UF e o Município próprios do setor." : "O setor utilizará a UF e o Município herdados do órgão selecionado."}</span>
                </div>
              </div>
            </PanelSeplag>

            <footer className="prototype-carreira-register-actions unidades-register-actions">
              <BotaoSeplag type="button" label="Cancelar" outlined onClick={voltar} />
              <BotaoSalvarSeplag type="button" label="Salvar setor" onClick={() => {}} />
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
  const registrosPorPagina = 10;
  const { control, reset, watch } = useForm<UnidadeFiltro>({
    defaultValues: { pesquisa: "", situacao: "ATIVA" },
  });
  const filtros = watch();
  const termo = filtros.pesquisa.trim().toLocaleLowerCase("pt-BR");
  const filtradas = unidades.filter((unidade) =>
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
      header: "Setor",
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
          title="Setores"
          cols="12"
          cardHeaderClassNames="prototype-carreira-card"
          headerNavigation={<BreadcrumbSeplag divided items={[{ label: "Cadastro" }, { label: "Estrutura Organizacional" }, { label: "Setores" }]} />}
        >
          <p className="unidades-list-description">Consulte e mantenha os setores cadastrados nos órgãos e entidades.</p>
          <div className="prototype-category-filters prototype-cargo-filters unidades-list-filters grid">
            <TextFieldSeplag name="pesquisa" control={control} label="Pesquisar" placeholder="Nome do setor, sigla ou código" cols="12 6 4" getFormErrorMessage={() => null} />
            <DropdownFieldSeplag name="orgao" control={control} label="Órgão/Entidade" placeholder="Todos" cols="12 6 2" options={options(["SEPLAG", "SEDUC"])} optionLabel="label" optionValue="value" showClear getFormErrorMessage={() => null} />
            <DropdownFieldSeplag name="tipo" control={control} label="Tipo de setor" placeholder="Todos" cols="12 6 2" options={options([...new Set(unidades.map((item) => item.tipo))])} optionLabel="label" optionValue="value" showClear getFormErrorMessage={() => null} />
            <DropdownFieldSeplag name="situacao" control={control} label="Situação" placeholder="Todas" cols="12 6 2" options={[{ label: "Ativa", value: "ATIVA" }, { label: "Inativa", value: "INATIVA" }]} optionLabel="label" optionValue="value" showClear getFormErrorMessage={() => null} />
            <div className="prototype-category-clear col-12 md:col-6 lg:col-2">
              <BotaoLimparFiltroSeplag type="button" label="Limpar" icon="pi pi-refresh" onClick={() => reset({ pesquisa: "", orgao: undefined, tipo: undefined, situacao: undefined })} />
            </div>
          </div>
          <div className="unidades-list-summary">{filtradas.length} {filtradas.length === 1 ? "setor encontrado" : "setores encontrados"}</div>
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
              handleView={() => {}}
              handleEdit={() => {}}
              handleDelete={() => {}}
              handleOnPageChange={(event) => setPagina(Math.floor((event.first ?? 0) / (event.rows ?? registrosPorPagina)))}
            />
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}
