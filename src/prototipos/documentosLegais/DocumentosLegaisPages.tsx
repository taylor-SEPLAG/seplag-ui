import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  AnexarDocumentoSeplag, BadgeSeplag, BotaoLimparFiltroSeplag,
  BotaoChipSeplag, BotaoSalvarSeplag, BotaoSeplag, BotaoVoltarSeplag, BreadcrumbSeplag, CardSeplag,
  DateFieldSeplag, DropdownFieldSeplag, MultiSelectFieldSeplag,
  ModalSeplag, TablePaginadoSeplag, TextAreaFieldSeplag,
  TextFieldSeplag, type ArquivoAnexadoSeplag, type ColumnMetaSeplag,
} from "../../componentes";
import type { ResultsSeplag } from "../../interfaces/Results";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import {
  documentosLegaisStore, useDocumentosLegais, type DocumentoLegal,
  type DocumentoLegalInput, type SituacaoDocumentoLegal,
} from "./documentosLegaisStore";
import { useTiposDocumentos } from "../tiposDocumentos/tiposDocumentosStore";
import "./documentosLegais.css";

const BASE_PATH = "/prototipos/sigep/documentos-legais";
const option = (value: string) => ({ label: value, value });
const naturezas = ["Criação", "Plano de Cargos, Carreiras e Salários (PCCS)", "Alteração de PCCS", "Estatuto dos Servidores Públicos"].map(option);
const abrangencias = ["FEDERAL", "ESTADUAL", "MUNICIPAL"].map(option);
const veiculos = ["Diário Oficial do Estado - DOE", "IOB", "Jornal de Grande Circulação"].map(option);
const aplicacoes = ["Cargo", "Carreira", "Concurso", "Rubricas", "Estrutura / Organograma", "Vínculo", "Benefícios", "Aposentadoria / Pensão"].map(option);
const situacoes = ["Vigente", "Revogada", "Encerrado"].map(option);

interface FiltroForm { termo: string; tipo?: string; situacao?: SituacaoDocumentoLegal }
interface DocumentoForm {
  tipo: string; numero: string; ano: string; nome: string;
  dataVigencia: string; dataPublicacao: string; dataFim: string;
  natureza: string; abrangencia: string; veiculoPublicacao: string;
  aplicacoes: string[]; tipoAltera: string; ementa: string; relacionaNormas: "NENHUMA" | "ALTERA" | "REVOGA";
  normasAlteradas: string[]; normasRevogadas: string[];
}

function results<T>(content: T[]): ResultsSeplag<T> {
  return { content, totalPages: 1, totalRecords: content.length, size: 10, sizePage: 10, pageActual: 0, first: true, last: true, numberOfElements: content.length, empty: content.length === 0 };
}
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
function StatusBadge({ situacao }: { situacao: SituacaoDocumentoLegal }) {
  const colors = situacao === "Vigente" ? ["#177245", "#e7f5ec"] : situacao === "Revogada" ? ["#b42318", "#fdebea"] : ["#8b6300", "#fff3d6"];
  return <BadgeSeplag label={situacao} color={colors[0]} bg={colors[1]} border="transparent" size="md" />;
}

export function PrototiposDocumentosLegaisPage() {
  const navigate = useNavigate();
  const documents = useDocumentosLegais();
  const [documentoAplicacoes, setDocumentoAplicacoes] = useState<DocumentoLegal | null>(null);
  const tipos = useTiposDocumentos().map((item) => option(item.nome));
  const { control, reset, watch } = useForm<FiltroForm>({ defaultValues: { termo: "" } });
  const filters = watch();
  const filtered = useMemo(() => documents.filter((document) => {
    const query = normalize(filters.termo.trim());
    const text = normalize([document.tipo, document.numero, document.ano, document.nome, document.ementa].join(" "));
    return (!query || text.includes(query)) && (!filters.tipo || document.tipo === filters.tipo) && (!filters.situacao || document.situacao === filters.situacao);
  }), [documents, filters]);
  const columns: ColumnMetaSeplag<DocumentoLegal>[] = [
    { field: "ano", header: "Ano" },
    { field: "numero", header: "Número", body: (row) => <strong className="prototype-documentos-legais-number">{row.numero}</strong> },
    {
      header: "Nome",
      body: (row) => {
        const normaRevogadora = documents.find((item) => item.normasRevogadas.includes(row.id));
        const detalhe = row.situacao === "Revogada" && normaRevogadora
          ? "Revogada pela " + normaRevogadora.titulo
          : "Vigência a partir de: " + row.dataVigencia;
        return <div><strong>{row.nome}</strong><small className="prototype-documentos-legais-cell-note">{detalhe}</small></div>;
      },
    },
    { field: "tipo", header: "Tipo" },
    { field: "veiculoPublicacao", header: "Veículo de Publicação" },
    {
      header: "Aplicação da Norma",
      body: (row) => (
        <BotaoChipSeplag
          className="prototype-link-button"
          tooltip={row.aplicacoes.join(", ") || "Nenhuma aplicação vinculada"}
          aria-label={`Visualizar aplicações vinculadas a ${row.titulo}`}
          onClick={() => setDocumentoAplicacoes(row)}
        >
          {row.aplicacoes.length} {row.aplicacoes.length === 1 ? "Aplicação" : "Aplicações"}
        </BotaoChipSeplag>
      ),
    },
    { header: "Situação", body: (row) => <StatusBadge situacao={row.situacao} /> },
  ];
  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
    <div className="prototype-page-content prototype-page-content--white prototype-documentos-legais-page">
      <CardSeplag title="Documentos Legais" subtitle="Consulte e gerencie a fundamentação legal utilizada no sistema." subtitlePosition="below" cols="12">
        <div className="col-12 grid prototype-documentos-legais-filters">
          <TextFieldSeplag name="termo" control={control} label="Pesquisar" placeholder="Número, ano, nome ou ementa" cols="12 12 5" getFormErrorMessage={() => null} />
          <DropdownFieldSeplag name="tipo" control={control} label="Tipo" cols="12 6 3" options={tipos} optionLabel="label" optionValue="value" placeholder="Todos" getFormErrorMessage={() => null} />
          <DropdownFieldSeplag name="situacao" control={control} label="Situação" cols="12 6 2" options={situacoes} optionLabel="label" optionValue="value" placeholder="Todas" getFormErrorMessage={() => null} />
          <div className="col-12 lg:col-2 prototype-documentos-legais-clear"><BotaoLimparFiltroSeplag onClick={() => reset({ termo: "" })} /></div>
        </div>
        <div className="col-12 prototype-documentos-legais-table">
          <TablePaginadoSeplag dataKey="id" data={results(filtered)} rows={10} rowsPerPage={[10]} paginator={false} lazy={false} selectionMode={null} columns={columns} hasEventoAcao
            handleAdicionar={() => navigate(BASE_PATH + "/novo")} handleView={(row) => navigate(BASE_PATH + "/" + row.id)}
            handleEdit={(row) => navigate(BASE_PATH + "/" + row.id + "/editar")} handleDelete={null} handleOnPageChange={() => {}} />
        </div>
      </CardSeplag>
    </div>
    <ModalSeplag
      visible={Boolean(documentoAplicacoes)}
      titulo={`Aplicações da norma (${documentoAplicacoes?.aplicacoes.length ?? 0})`}
      fechar={() => setDocumentoAplicacoes(null)}
      labelFechar="Fechar"
      hideFooter
      tamanho="620px"
    >
      <div className="prototype-documentos-legais-applications">
        <p><strong>{documentoAplicacoes?.titulo}</strong> — {documentoAplicacoes?.nome}</p>
        {documentoAplicacoes?.aplicacoes.length ? (
          <ul>
            {documentoAplicacoes.aplicacoes.map((aplicacao, index) => (
              <li key={aplicacao}>
                <i className="pi pi-check-circle" aria-hidden="true" />
                <strong>{index + 1}.</strong> {aplicacao}
              </li>
            ))}
          </ul>
        ) : (
          <span>Nenhuma aplicação vinculada.</span>
        )}
      </div>
    </ModalSeplag>
  </PrototypeSystemPage>;
}

export function PrototiposDocumentoLegalFormPage() {
  const navigate = useNavigate(); const location = useLocation(); const { id } = useParams(); const [searchParams] = useSearchParams();
  const requestedReturnTo = searchParams.get("returnTo");
  const returnTo = requestedReturnTo?.startsWith("/prototipos/") ? requestedReturnTo : BASE_PATH;
  const document = id ? documentosLegaisStore.findById(id) : undefined;
  const viewing = Boolean(id) && !location.pathname.endsWith("/editar");
  const documents = useDocumentosLegais();
  const tipos = useTiposDocumentos()
    .filter((item) => item.ativo || item.nome === document?.tipo)
    .map((item) => option(item.nome));
  const [files, setFiles] = useState<ArquivoAnexadoSeplag[]>(document?.arquivos ?? (document?.arquivo ? [document.arquivo] : []));
  const [error, setError] = useState("");
  const { control, handleSubmit, watch } = useForm<DocumentoForm>({ defaultValues: {
    tipo: document?.tipo ?? "", numero: document?.numero ?? "", ano: String(document?.ano ?? new Date().getFullYear()), nome: document?.nome ?? "",
    dataVigencia: document?.dataVigencia ?? "", dataPublicacao: document?.dataPublicacao ?? "", dataFim: document?.dataFim ?? "",
    natureza: document?.natureza ?? "", abrangencia: document?.abrangencia ?? "", veiculoPublicacao: document?.veiculoPublicacao ?? "",
    aplicacoes: document?.aplicacoes ?? [], tipoAltera: document?.tipoAltera ?? "Não Informado", ementa: document?.ementa ?? "",
    relacionaNormas: document?.normasAlteradas.length
      ? "ALTERA"
      : document?.normasRevogadas.length
        ? "REVOGA"
        : "NENHUMA",
    normasAlteradas: document?.normasAlteradas ?? [], normasRevogadas: document?.normasRevogadas ?? [],
  } });
  const relacionaNormas = watch("relacionaNormas");
  const normasOptions = documents.filter((item) => item.id !== id).map((item) => ({ label: item.titulo + " — " + item.nome, value: item.id }));
  if (id && !document) return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas} message="Documento legal não encontrado." />;

  const upload = (event: { files?: File[] }) => {
    for (const selected of event.files ?? []) {
      if (files.some((item) => item.nome === selected.name && item.tamanho === selected.size)) continue;
      const reader = new FileReader();
      reader.onload = () => setFiles((current) => current.some((item) => item.nome === selected.name && item.tamanho === selected.size) ? current : [...current, {
        nome: selected.name, extensao: "pdf", contentType: selected.type || "application/pdf",
        conteudoEmBase64: String(reader.result).split(",")[1] ?? "", tamanho: selected.size,
      }]);
      reader.readAsDataURL(selected);
    }
  };
  const save = (form: DocumentoForm) => {
    setError("");
    if (form.dataFim && form.dataFim < form.dataVigencia) return setError("A data fim não pode ser anterior à data de vigência.");
    if (form.relacionaNormas === "ALTERA" && !form.normasAlteradas.length) return setError("Selecione ao menos uma norma alterada.");
    if (form.relacionaNormas === "REVOGA" && !form.normasRevogadas.length) return setError("Selecione ao menos uma norma revogada.");
    const input: DocumentoLegalInput = {
      ...form, ano: Number(form.ano), arquivos: files, arquivo: files[0],
      normasAlteradas: form.relacionaNormas === "ALTERA" ? form.normasAlteradas : [],
      normasRevogadas: form.relacionaNormas === "REVOGA" ? form.normasRevogadas : [],
    };
    if (documentosLegaisStore.isDuplicate(input, id)) return setError("Já existe um documento com o mesmo tipo, número e ano.");
    if (id) documentosLegaisStore.update(id, input); else documentosLegaisStore.create(input);
    navigate(returnTo);
  };

  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
    <div className={"prototype-documento-legal-register-page" + (viewing ? " is-visualizacao" : "")}>
      <BreadcrumbSeplag divided className="prototype-doc-breadcrumb" items={[
        { label: "Cadastro" },
        { label: "Documentos Legais", to: BASE_PATH },
        { label: viewing ? "Visualizar" : id ? "Editar" : "Cadastrar" },
      ]} />

      <header className="prototype-documento-legal-register-title">
        <div>
          <h1>{viewing ? "Visualizar documento legal" : id ? "Editar documento legal" : "Novo documento legal"}</h1>
          <p>{id ? "Consulte ou atualize os dados da norma, seus anexos e relacionamentos." : "Informe os dados da norma e onde ela poderá ser utilizada no sistema."}</p>
        </div>
        {viewing ? <BotaoSeplag type="button" icon="pi pi-pencil" aria-label="Editar documento legal" tooltip="Editar" onClick={() => navigate(BASE_PATH + "/" + id + "/editar")} /> : null}
      </header>

      {error ? <div className="prototype-documento-legal-register-alert" role="alert">
        <i className="pi pi-exclamation-circle" aria-hidden="true" />
        <span>{error}</span>
      </div> : null}

      <form className="prototype-documento-legal-register-form" onSubmit={handleSubmit(save)}>
        <fieldset disabled={viewing} className="prototype-documento-legal-register-fieldset">
          <section className="prototype-documento-legal-register-section">
            <header>
              <span className="prototype-documento-legal-section-icon"><i className="pi pi-id-card" /></span>
              <div><h2>Dados do documento</h2><p>Identifique a norma, sua publicação, natureza e abrangência.</p></div>
            </header>
            <div className="grid prototype-documento-legal-register-fields">
            <TextFieldSeplag name="numero" control={control} label="Número" cols="12 6 3" required getFormErrorMessage={() => null} />
            <TextFieldSeplag name="ano" control={control} label="Ano" cols="12 6 3" required maxLength={4} getFormErrorMessage={() => null} />
            <TextFieldSeplag name="nome" control={control} label="Nome do Documento" cols="12 12 6" required getFormErrorMessage={() => null} />
            <DateFieldSeplag name="dataVigencia" control={control} label="Data de Vigência" cols="12 6 3" required getFormErrorMessage={() => null} />
            <DateFieldSeplag name="dataPublicacao" control={control} label="Data Diário Oficial" cols="12 6 3" getFormErrorMessage={() => null} />
            <DateFieldSeplag name="dataFim" control={control} label="Data Fim" cols="12 6 3" getFormErrorMessage={() => null} />
            <DropdownFieldSeplag name="tipo" control={control} label="Tipo de documento legal" cols="12 6 3" options={tipos} optionLabel="label" optionValue="value" required getFormErrorMessage={() => null} />
            <DropdownFieldSeplag name="natureza" control={control} label="Natureza da Lei" cols="12 12 4" options={naturezas} optionLabel="label" optionValue="value" required getFormErrorMessage={() => null} />
            <DropdownFieldSeplag name="abrangencia" control={control} label="Tipo de Abrangência" cols="12 6 4" options={abrangencias} optionLabel="label" optionValue="value" required getFormErrorMessage={() => null} />
            <DropdownFieldSeplag name="veiculoPublicacao" control={control} label="Veículo de Publicação" cols="12 6 4" options={veiculos} optionLabel="label" optionValue="value" required getFormErrorMessage={() => null} />
            <MultiSelectFieldSeplag name="aplicacoes" control={control} label="Aplicação da Norma" cols="12 12 6" options={aplicacoes} optionLabel="label" optionValue="value" display="chip" required readOnly={viewing} selectedItemsLabel="{0} funcionalidades selecionadas" getFormErrorMessage={() => null} />
            <DropdownFieldSeplag
              name="tipoAltera"
              control={control}
              label="Tipo Altera"
              cols="12 12 6"
              options={[
                { label: "Não Informado", value: "Não Informado" },
                { label: "Revisão Geral Anual", value: "Revisão Geral Anual" },
                { label: "Aumento Salarial", value: "Aumento Salarial" },
                { label: "Revisão Geral Anual e Aumento Salarial", value: "Revisão Geral Anual e Aumento Salarial" },
                { label: "Diminuição Salarial", value: "Diminuição Salarial" },
              ]}
              optionLabel="label"
              optionValue="value"
              showClear={false}
              filter={false}
              getFormErrorMessage={() => null}
            />
            </div>
          </section>

          <section className="prototype-documento-legal-register-section">
            <header>
              <span className="prototype-documento-legal-section-icon"><i className="pi pi-file-pdf" /></span>
              <div><h2>Documento</h2><p>Anexe os arquivos que compõem a norma e informe sua ementa.</p></div>
            </header>
            <div className="grid prototype-documento-legal-register-fields">
            <AnexarDocumentoSeplag cols="12" label="Anexar Documento(s)" arquivosBase64={files} multiple onUploadDocument={viewing ? undefined : upload}
              onRemoveArquivo={viewing ? undefined : (_arquivo, index) => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}
              handleViewArquivo={() => {}} accept="application/pdf,.pdf" maxFileSize={2 * 1024 * 1024}
              helpText="É permitido anexar mais de um documento. Formato aceito: PDF | Tamanho máximo: 2MB por arquivo" />
            <TextAreaFieldSeplag name="ementa" control={control} label="Ementa" cols="12" maxLength={1000} required getFormErrorMessage={() => null} />
            </div>
          </section>

          <section className="prototype-documento-legal-register-section">
            <header>
              <span className="prototype-documento-legal-section-icon"><i className="pi pi-link" /></span>
              <div><h2>Relação com outras normas</h2><p>Registre se esta norma altera, revoga ou não possui relação com outras normas cadastradas.</p></div>
            </header>
            <div className="grid prototype-documento-legal-register-fields">
            <DropdownFieldSeplag
              name="relacionaNormas"
              control={control}
              label="Qual a relação deste documento com outras normas?"
              cols="12"
              options={[
                { label: "Não altera nem revoga outra norma", value: "NENHUMA" },
                { label: "Altera outra norma", value: "ALTERA" },
                { label: "Revoga outra norma", value: "REVOGA" },
              ]}
              optionLabel="label"
              optionValue="value"
              required
              showClear={false}
              filter={false}
              getFormErrorMessage={() => null}
            />
            {relacionaNormas === "ALTERA" ? (
              <MultiSelectFieldSeplag name="normasAlteradas" control={control} label="Norma(s) alterada(s)" cols="12" options={normasOptions} optionLabel="label" optionValue="value" display="chip" readOnly={viewing} selectedItemsLabel="{0} normas selecionadas" required getFormErrorMessage={() => null} />
            ) : null}
            {relacionaNormas === "REVOGA" ? <>
              <MultiSelectFieldSeplag name="normasRevogadas" control={control} label="Norma(s) revogada(s)" cols="12" options={normasOptions} optionLabel="label" optionValue="value" display="chip" readOnly={viewing} selectedItemsLabel="{0} normas selecionadas" required getFormErrorMessage={() => null} />
              <div className="col-12 prototype-documentos-legais-info"><i className="pi pi-info-circle" /> Normas revogadas permanecem disponíveis para consulta e histórico. Elas não são substituídas automaticamente nos registros em que já foram utilizadas.</div>
            </> : null}
            </div>
          </section>

          <footer className="prototype-documento-legal-register-actions">
            <BotaoVoltarSeplag onClick={() => navigate(returnTo)} />
            {!viewing ? <BotaoSalvarSeplag type="submit" label={id ? "Salvar alterações" : "Salvar documento"} /> : null}
          </footer>
        </fieldset>
      </form>
    </div>
  </PrototypeSystemPage>;
}
