import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { BadgeSeplag } from "@componentes/Badge";
import { BotaoLimparFiltroSeplag, BotaoSalvarSeplag, BotaoSeplag } from "@componentes/Botao";
import { BreadcrumbSeplag } from "@componentes/Breadcrumb";
import { CardSeplag } from "@componentes/Card";
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

interface UnidadeCadastroForm {
  orgao: string;
  tipo: string;
  nome: string;
  sigla: string;
  codigo: string;
  documento: string;
  uf: string;
  municipio: string;
  outraLocalidade: "NAO" | "SIM";
}

function UnidadeCadastroPage() {
  const navigate = useNavigate();
  const { control, watch, setValue } = useForm<UnidadeCadastroForm>({
    defaultValues: {
      orgao: "",
      tipo: "",
      nome: "",
      sigla: "",
      codigo: "",
      documento: "",
      uf: "",
      municipio: "",
      outraLocalidade: "NAO",
    },
  });
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
      <div className="prototype-page-content prototype-page-content--white unidades-register-page">
        <CardSeplag
          title="Cadastrar Unidade Organizacional"
          cols="12"
          cardHeaderClassNames="prototype-category-card"
          headerNavigation={<BreadcrumbSeplag divided items={[{ label: "Cadastro" }, { label: "Estrutura Organizacional" }, { label: "Unidades", to: "/prototipos/sigep/gestao/cadastro/estrutura-organizacional/unidades" }, { label: "Cadastrar" }]} />}
        >
          <p className="unidades-register-description">Cadastre setores, gabinetes, núcleos e demais unidades que compõem a estrutura do órgão.</p>
          <div className="unidades-register-content">
            <PanelSeplag title="Identificação da unidade" description="Selecione o órgão e informe os dados básicos da unidade." className="unidades-register-panel">
              <div className="grid unidades-register-fields">
                <DropdownFieldSeplag name="orgao" control={control} label="Órgão/Entidade" placeholder="Selecione..." cols="12" options={options(["SEPLAG - Secretaria de Estado de Planejamento e Gestão", "SEDUC - Secretaria de Estado de Educação"])} optionLabel="label" optionValue="value" required getFormErrorMessage={noError} />
                <div className="col-12 unidades-register-field-help">UF e Município serão preenchidos automaticamente conforme o órgão selecionado.</div>
                <DropdownFieldSeplag name="tipo" control={control} label="Tipo de unidade" placeholder="Selecione..." cols="12 12 6" options={options(["Gabinete", "Secretaria Adjunta", "Superintendência", "Coordenadoria", "Gerência", "Núcleo", "Unidade", "Conselho", "Comissão", "Ouvidoria", "Diretoria"])} optionLabel="label" optionValue="value" required getFormErrorMessage={noError} />
                <TextFieldSeplag name="nome" control={control} label="Nome da unidade" placeholder="Ex.: Coordenadoria de Modelagem Organizacional" cols="12 12 6" required maxLength={200} getFormErrorMessage={noError} />
                <TextFieldSeplag name="sigla" control={control} label="Sigla" placeholder="Ex.: CMO" cols="12 12 6" maxLength={20} getFormErrorMessage={noError} />
                <TextFieldSeplag name="codigo" control={control} label="Código" placeholder="Gerado automaticamente" cols="12 12 6" disabled getFormErrorMessage={noError} />
              </div>
            </PanelSeplag>

            <PanelSeplag title="Fundamentação legal" description="Informe o documento que sustenta a existência da unidade." className="unidades-register-panel">
              <div className="grid unidades-register-fields">
                <DropdownFieldSeplag name="documento" control={control} label="Documento legal" placeholder="Selecione..." cols="12" options={options(["Decreto nº 2.185, de 03/07/2026", "Lei Complementar nº 612, de 28/01/2019", "Lei nº 10.052, de 15/01/2014"])} optionLabel="label" optionValue="value" required getFormErrorMessage={noError} />
              </div>
            </PanelSeplag>

            <PanelSeplag title="Localização" description="UF e Município são herdados do órgão. Informe endereço próprio apenas quando a unidade funcionar em outra localidade." className="unidades-register-panel">
              <div className="grid unidades-register-fields">
                <div className="col-12 lg:col-6 unidades-register-inherited">
                  <TextFieldSeplag name="uf" control={control} label="UF" placeholder="Selecione o órgão" cols="12" disabled={!localidadePropria} getFormErrorMessage={noError} />
                  {!localidadePropria && <span>Herdado do órgão</span>}
                </div>
                <div className="col-12 lg:col-6 unidades-register-inherited">
                  <TextFieldSeplag name="municipio" control={control} label="Município" placeholder="Selecione o órgão" cols="12" disabled={!localidadePropria} getFormErrorMessage={noError} />
                  {!localidadePropria && <span>Herdado do órgão</span>}
                </div>
                <RadioButtonFieldSeplag name="outraLocalidade" control={control} label="A unidade funciona em outra localidade?" cols="12" options={[{ label: "Não", value: "NAO" }, { label: "Sim", value: "SIM" }]} getFormErrorMessage={noError} />
                <div className="col-12 unidades-register-note">
                  <i className="pi pi-info-circle" />
                  <span>{localidadePropria ? "Informe a UF e o Município próprios da unidade." : "A unidade utilizará a UF e o Município herdados do órgão selecionado."}</span>
                </div>
              </div>
            </PanelSeplag>

            <footer className="unidades-register-actions">
              <BotaoSeplag type="button" label="Cancelar" outlined onClick={voltar} />
              <BotaoSalvarSeplag type="button" label="Salvar unidade" onClick={() => {}} />
            </footer>
          </div>
        </CardSeplag>
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
          title="Unidades Organizacionais"
          cols="12"
          cardHeaderClassNames="prototype-carreira-card"
          headerNavigation={<BreadcrumbSeplag divided items={[{ label: "Cadastro" }, { label: "Estrutura Organizacional" }, { label: "Unidades" }]} />}
        >
          <p className="unidades-list-description">Consulte e mantenha setores, gabinetes, núcleos e demais unidades cadastradas nos órgãos e entidades.</p>
          <div className="prototype-category-filters prototype-carreira-filters grid">
            <TextFieldSeplag name="pesquisa" control={control} label="Pesquisar" placeholder="Nome da unidade, sigla ou código" cols="12 6 4" getFormErrorMessage={() => null} />
            <DropdownFieldSeplag name="orgao" control={control} label="Órgão/Entidade" placeholder="Todos" cols="12 6 2" options={options(["SEPLAG", "SEDUC"])} optionLabel="label" optionValue="value" showClear getFormErrorMessage={() => null} />
            <DropdownFieldSeplag name="tipo" control={control} label="Tipo de unidade" placeholder="Todos" cols="12 6 2" options={options([...new Set(unidades.map((item) => item.tipo))])} optionLabel="label" optionValue="value" showClear getFormErrorMessage={() => null} />
            <DropdownFieldSeplag name="situacao" control={control} label="Situação" placeholder="Todas" cols="12 6 2" options={[{ label: "Ativa", value: "ATIVA" }, { label: "Inativa", value: "INATIVA" }]} optionLabel="label" optionValue="value" showClear getFormErrorMessage={() => null} />
            <div className="prototype-category-clear col-12 md:col-6 lg:col-2">
              <BotaoLimparFiltroSeplag type="button" label="Limpar" icon="pi pi-refresh" onClick={() => reset({ pesquisa: "", orgao: undefined, tipo: undefined, situacao: undefined })} />
            </div>
          </div>
          <div className="unidades-list-summary">{filtradas.length} {filtradas.length === 1 ? "unidade encontrada" : "unidades encontradas"}</div>
          <div className="unidades-list-table">
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
