import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  BadgeSeplag, BotaoIconSeplag, BotaoLimparFiltroSeplag, BreadcrumbSeplag,
  CardSeplag, ModalSeplag, TablePaginadoSeplag, TextFieldSeplag,
  type ColumnMetaSeplag,
} from "../../componentes";
import type { ResultsSeplag } from "../../interfaces/Results";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { tiposDocumentosStore, useTiposDocumentos, type TipoDocumento } from "./tiposDocumentosStore";
import "./tiposDocumentos.css";

interface FiltroForm { nome: string }
interface CadastroForm { nome: string }

function results<T>(content: T[]): ResultsSeplag<T> {
  return { content, totalPages: 1, totalRecords: content.length, size: 10, sizePage: 10, pageActual: 0, first: true, last: true, numberOfElements: content.length, empty: content.length === 0 };
}
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function PrototiposTiposDocumentosPage() {
  const tipos = useTiposDocumentos();
  const [editing, setEditing] = useState<TipoDocumento>();
  const [modalOpen, setModalOpen] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<TipoDocumento>();
  const [error, setError] = useState("");
  const filtroForm = useForm<FiltroForm>({ defaultValues: { nome: "" } });
  const cadastroForm = useForm<CadastroForm>({ defaultValues: { nome: "" } });
  const filtro = filtroForm.watch("nome");
  const filtered = useMemo(() => {
    const query = normalize(filtro.trim());
    return tipos.filter((item) => !query || normalize(item.nome).includes(query));
  }, [filtro, tipos]);

  const openCreate = () => {
    setEditing(undefined);
    setError("");
    cadastroForm.reset({ nome: "" });
    setModalOpen(true);
  };
  const openEdit = (tipo: TipoDocumento) => {
    setEditing(tipo);
    setError("");
    cadastroForm.reset({ nome: tipo.nome });
    setModalOpen(true);
  };
  const save = cadastroForm.handleSubmit(({ nome }) => {
    const trimmed = nome.trim();
    if (!trimmed) return setError("Informe o nome do tipo de documento.");
    if (tiposDocumentosStore.isDuplicate(trimmed, editing?.id)) return setError("Já existe um tipo de documento com esse nome.");
    if (editing) tiposDocumentosStore.update(editing.id, trimmed);
    else tiposDocumentosStore.create(trimmed);
    setModalOpen(false);
  });
  const columns: ColumnMetaSeplag<TipoDocumento>[] = [
    { field: "nome", header: "Tipo de Documento", body: (row) => <strong>{row.nome}</strong> },
    { header: "Situação", body: (row) => <BadgeSeplag label={row.ativo ? "Ativo" : "Inativo"} color={row.ativo ? "#177245" : "#667085"} bg={row.ativo ? "#e7f5ec" : "#f2f4f7"} border={row.ativo ? "#a5d6a7" : "#d0d5dd"} size="md" /> },
  ];

  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
    <div className="prototype-page-content prototype-page-content--white prototype-tipos-documentos-page">
      <BreadcrumbSeplag divided className="prototype-doc-breadcrumb" items={[{ label: "Cadastro" }, { label: "Documentação" }, { label: "Tipo de documentos Legais" }]} />
      <CardSeplag title="Tipo de documentos Legais" subtitle="Consulte, cadastre e gerencie os tipos de documentos e atos normativos da instituição." subtitlePosition="below" cols="12">
        <div className="col-12 grid prototype-tipos-documentos-filters">
          <TextFieldSeplag name="nome" control={filtroForm.control} label="Tipo de Documento" placeholder="Ex.: Lei Ordinária, Edital, Portaria..." cols="12 12 9" getFormErrorMessage={() => null} />
          <div className="col-12 lg:col-3 prototype-tipos-documentos-clear"><BotaoLimparFiltroSeplag label="Limpar filtro" onClick={() => filtroForm.reset({ nome: "" })} /></div>
        </div>
        <div className="col-12 prototype-tipos-documentos-table">
          <TablePaginadoSeplag dataKey="id" data={results(filtered)} rows={10} rowsPerPage={[10, 25, 50]} paginator={filtered.length > 10} lazy={false} selectionMode={null} columns={columns} hasEventoAcao
            handleAdicionar={openCreate} handleEdit={openEdit} handleDelete={null} handleView={null} handleOnPageChange={() => {}}
            actionHeader="Ações" renderBotoes={(row) => <BotaoIconSeplag type="button" icon={row.ativo ? "pi pi-ban" : "pi pi-check"} severity={row.ativo ? "danger" : "success"} tooltip={row.ativo ? "Inativar" : "Ativar"} onClick={() => setToggleTarget(row)} />} />
        </div>
      </CardSeplag>
    </div>

    <ModalSeplag visible={modalOpen} titulo={editing ? "Editar Tipo de Documento" : "Cadastrar Tipo de Documento"} tamanho="34rem" fechar={() => setModalOpen(false)} labelFechar="Cancelar" labelAcao="Salvar" funcAcao={save}>
      {error ? <div className="col-12 prototype-tipos-documentos-error" role="alert">{error}</div> : null}
      <TextFieldSeplag name="nome" control={cadastroForm.control} label="Nome do Tipo de Documento" placeholder="Ex.: Lei Ordinária" cols="12" required autoFocus maxLength={120} getFormErrorMessage={() => null} />
    </ModalSeplag>

    <ModalSeplag visible={Boolean(toggleTarget)} titulo={(toggleTarget?.ativo ? "Inativar" : "Ativar") + " tipo de documento"} tamanho="30rem" fechar={() => setToggleTarget(undefined)}
      labelFechar="Cancelar" labelAcao={toggleTarget?.ativo ? "Inativar" : "Ativar"} iconAcao={toggleTarget?.ativo ? "pi pi-ban" : "pi pi-check"} funcAcao={() => { if (toggleTarget) tiposDocumentosStore.toggle(toggleTarget.id); setToggleTarget(undefined); }}>
      <div className="col-12 prototype-tipos-documentos-confirm">Confirma a alteração de situação de <strong>{toggleTarget?.nome}</strong>?</div>
    </ModalSeplag>
  </PrototypeSystemPage>;
}
