import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AnexarDocumentoSeplag, type ArquivoAnexadoSeplag } from "../../componentes/AnexarDocumento";
import { BadgeSeplag } from "../../componentes/Badge";
import { BotaoLimparFiltroSeplag, BotaoSalvarSeplag, BotaoSeplag, BotaoVoltarSeplag } from "../../componentes/Botao";
import { CardSeplag } from "../../componentes/Card";
import { DateFieldSeplag, DropdownFieldSeplag, RadioButtonFieldSeplag, TextAreaFieldSeplag, TextFieldSeplag } from "../../componentes/Fields";
import { TablePaginadoSeplag, type ColumnMetaSeplag } from "../../componentes/TablePaginado";
import type { ResultsSeplag } from "../../interfaces/Results";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { documentosLegaisStore, getSituacaoDocumentoLegal, useDocumentosLegais, type DocumentoLegal, type DocumentoLegalInput, type SituacaoDocumentoLegal } from "./documentosLegaisStore";
import "./documentosLegais.css";

const BASE_PATH = "/prototipos/sigep/documentos-legais";
const tipos = ["Lei", "Lei Complementar", "Decreto", "Portaria", "Resolução", "Instrução Normativa", "Ato Administrativo", "Decisão Judicial", "Outro"].map((value) => ({ label: value, value }));
const situacoes = [{ label: "Ativo", value: "ATIVO" }, { label: "Inativo", value: "INATIVO" }];
interface FiltroForm { termo: string; tipo?: string; situacao?: SituacaoDocumentoLegal }
interface DocumentoForm { tipo: string; numero: string; ano: string; nome: string; ementa: string; dataPublicacao: string; dataVigencia: string; dataFim: string; observacao: string; substituiOuAltera: "SIM" | "NAO" }

function results<T>(content: T[]): ResultsSeplag<T> {
  return { content, totalPages: Math.max(1, Math.ceil(content.length / 10)), totalRecords: content.length, size: 10, sizePage: 10, pageActual: 0, first: true, last: true, numberOfElements: content.length, empty: content.length === 0 };
}
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function PrototiposDocumentosLegaisPage() {
  const navigate = useNavigate();
  const documents = useDocumentosLegais();
  const { control, reset, watch } = useForm<FiltroForm>({ defaultValues: { termo: "" } });
  const filters = watch();
  const filtered = useMemo(() => documents.filter((document) => {
    const query = normalize(filters.termo.trim());
    const text = normalize(`${document.tipo} ${document.numero} ${document.ano} ${document.nome}`);
    return (!query || text.includes(query)) && (!filters.tipo || document.tipo === filters.tipo) && (!filters.situacao || getSituacaoDocumentoLegal(document) === filters.situacao);
  }), [documents, filters]);
  const columns: ColumnMetaSeplag<DocumentoLegal>[] = [
    { field: "tipo", header: "Tipo" }, { field: "numero", header: "Número" }, { field: "ano", header: "Ano" }, { field: "nome", header: "Nome do Documento" },
    { header: "Situação", body: (row) => { const situacao = getSituacaoDocumentoLegal(row); return <BadgeSeplag label={situacao === "ATIVO" ? "Ativo" : "Inativo"} color={situacao === "ATIVO" ? "#00843d" : "#c62828"} bg={situacao === "ATIVO" ? "#e2f3e8" : "#fdecec"} border="transparent" size="md" />; } },
  ];
  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
    <div className="prototype-page-content prototype-page-content--white prototype-documentos-legais-page"><CardSeplag title="Documentos Legais" cols="12">
      <div className="grid prototype-documentos-legais-filters">
        <TextFieldSeplag name="termo" control={control} label="Pesquisar por descrição, número ou ano" cols="12 6 5" getFormErrorMessage={() => null} />
        <DropdownFieldSeplag name="tipo" control={control} label="Tipo" cols="12 6 3" options={tipos} optionLabel="label" optionValue="value" getFormErrorMessage={() => null} />
        <DropdownFieldSeplag name="situacao" control={control} label="Situação" cols="12 6 2" options={situacoes} optionLabel="label" optionValue="value" getFormErrorMessage={() => null} />
        <div className="col-12 md:col-6 lg:col-2 prototype-documentos-legais-clear"><BotaoLimparFiltroSeplag label="Limpar" icon="pi pi-refresh" onClick={() => reset({ termo: "" })} /></div>
      </div>
      <div className="prototype-documentos-legais-table"><TablePaginadoSeplag dataKey="id" data={results(filtered)} rows={10} rowsPerPage={[10]} paginator={filtered.length > 10} lazy={false} selectionMode={null} columns={columns} hasEventoAcao handleAdicionar={() => navigate(`${BASE_PATH}/novo`)} handleView={(row) => navigate(`${BASE_PATH}/${row.id}`)} handleEdit={(row) => navigate(`${BASE_PATH}/${row.id}/editar`)} handleDelete={null} handleOnPageChange={() => {}} /></div>
    </CardSeplag></div>
  </PrototypeSystemPage>;
}

export function PrototiposDocumentoLegalFormPage() {
  const navigate = useNavigate(); const location = useLocation(); const { id } = useParams(); const [searchParams] = useSearchParams();
  const requestedReturnTo = searchParams.get("returnTo");
  const returnTo = requestedReturnTo?.startsWith("/prototipos/") ? requestedReturnTo : BASE_PATH;
  const document = id ? documentosLegaisStore.findById(id) : undefined;
  const viewing = Boolean(id) && !location.pathname.endsWith("/editar");
  const [file, setFile] = useState<ArquivoAnexadoSeplag | undefined>(document?.arquivo); const [error, setError] = useState("");
  const { control, handleSubmit } = useForm<DocumentoForm>({ defaultValues: { tipo: document?.tipo ?? "", numero: document?.numero ?? "", ano: String(document?.ano ?? new Date().getFullYear()), nome: document?.nome ?? "", ementa: document?.ementa ?? "", dataPublicacao: document?.dataPublicacao ?? "", dataVigencia: document?.dataVigencia ?? "", dataFim: document?.dataFim ?? "", observacao: document?.observacao ?? "", substituiOuAltera: document?.substituiOuAltera ? "SIM" : "NAO" } });
  if (id && !document) return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas} message="Documento legal não encontrado." />;
  const save = (form: DocumentoForm) => {
    setError("");
    if (!form.tipo || !form.numero.trim() || !form.ano || !form.nome.trim() || !form.dataVigencia) return setError("Preencha os campos obrigatórios.");
    if (form.dataFim && form.dataFim < form.dataVigencia) return setError("A data fim não pode ser anterior à data de vigência.");
    const input: DocumentoLegalInput = { ...form, ano: Number(form.ano), arquivo: file, substituiOuAltera: form.substituiOuAltera === "SIM" };
    if (documentosLegaisStore.isDuplicate(input, id)) return setError("Já existe um documento com o mesmo tipo, número e ano.");
    if (id) { documentosLegaisStore.update(id, input); navigate(returnTo); return; }
    const created = documentosLegaisStore.create(input);
    const separator = returnTo.includes("?") ? "&" : "?";
    navigate(`${returnTo}${separator}documentoLegalId=${encodeURIComponent(created.id)}`);
  };
  const upload = (event: { files?: File[] }) => { const selected = event.files?.[0]; if (!selected) return; const reader = new FileReader(); reader.onload = () => setFile({ nome: selected.name, extensao: "pdf", contentType: selected.type, conteudoEmBase64: String(reader.result).split(",")[1] ?? "", tamanho: selected.size }); reader.readAsDataURL(selected); };
  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
    <form onSubmit={handleSubmit(save)}><div className="prototype-page-content prototype-page-content--white prototype-documentos-legais-page"><CardSeplag title={`${viewing ? "Visualizar" : id ? "Editar" : "Cadastrar"} - Documento Legal`} cols="12">
      {error && <div className="prototype-documentos-legais-error" role="alert">{error}</div>}
      <fieldset disabled={viewing} className="prototype-documentos-legais-fieldset"><div className="grid">
        <DropdownFieldSeplag name="tipo" control={control} label="Tipo de documento legal" cols="12 6 3" options={tipos} optionLabel="label" optionValue="value" required getFormErrorMessage={() => null} />
        <TextFieldSeplag name="numero" control={control} label="Número" cols="12 6 3" required getFormErrorMessage={() => null} />
        <TextFieldSeplag name="ano" control={control} label="Ano" cols="12 6 2" required getFormErrorMessage={() => null} />
        <TextFieldSeplag name="nome" control={control} label="Nome do Documento" cols="12" required getFormErrorMessage={() => null} />
        <TextAreaFieldSeplag name="ementa" control={control} label="Ementa/Descrição" cols="12" maxLength={1000} getFormErrorMessage={() => null} />
        <DateFieldSeplag name="dataPublicacao" control={control} label="Data de publicação" cols="12 6 4" getFormErrorMessage={() => null} />
        <DateFieldSeplag name="dataVigencia" control={control} label="Data de vigência" cols="12 6 4" required getFormErrorMessage={() => null} />
        <DateFieldSeplag name="dataFim" control={control} label="Data fim" cols="12 6 4" getFormErrorMessage={() => null} />
        <TextAreaFieldSeplag name="observacao" control={control} label="Observação" cols="12" maxLength={1000} getFormErrorMessage={() => null} />
        <RadioButtonFieldSeplag name="substituiOuAltera" control={control} label="Substitui ou altera norma existente?" cols="12" options={[{ label: "Sim", value: "SIM" }, { label: "Não", value: "NAO" }]} getFormErrorMessage={() => null} />
        <AnexarDocumentoSeplag cols="12" label="Anexar documento" arquivoBase64={file} onUploadDocument={viewing ? undefined : upload} onRemoveArquivo={viewing ? undefined : () => setFile(undefined)} handleViewArquivo={() => {}} accept="application/pdf" maxFileSize={2_000_000} helpText="Formato aceito: .pdf | Tamanho máximo: 2MB" />
      </div></fieldset>
      <div className="prototype-documentos-legais-actions"><BotaoVoltarSeplag type="button" onClick={() => navigate(returnTo)} />{viewing ? <BotaoSeplag type="button" label="Editar" icon="pi pi-pencil" onClick={() => navigate(`${BASE_PATH}/${id}/editar`)} /> : <BotaoSalvarSeplag type="submit" />}</div>
    </CardSeplag></div></form>
  </PrototypeSystemPage>;
}
