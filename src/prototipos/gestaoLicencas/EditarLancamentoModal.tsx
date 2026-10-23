import { useRef, useState, type FormEvent } from "react";
import { Dialog } from "primereact/dialog";
import { BotaoSeplag, BotaoFecharSeplag, BotaoSalvarSeplag } from "../../componentes/Botao";
import type { ArquivoAnexadoSeplag } from "../../componentes/AnexarDocumento";
import { dataLicenca, type RegistroLicenca } from "./model";
import { lerDocumento } from "./documentosSolicitacao";
import { carregarGestaoLicencas, carregarSolicitacoes, STORAGE_SOLICITACOES } from "./solicitacaoModel";

export function EditarLancamentoModal({ registro, onClose, onSaved }: {
  registro: RegistroLicenca; onClose: () => void; onSaved: () => void;
}) {
  const [justificativa, setJustificativa] = useState("");
  const [documento, setDocumento] = useState<ArquivoAnexadoSeplag>();
  const [erro, setErro] = useState("");
  const [lendo, setLendo] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  async function anexar(file?: File) {
    if (!file) return;
    setDocumento(undefined);
    setErro("");
    if (file.size > 2 * 1024 * 1024) {
      setErro("O documento deve ter no máximo 2MB.");
      return;
    }
    setLendo(true);
    try { setDocumento(await lerDocumento(file)); }
    catch (error) { setErro((error as Error).message); }
    finally { setLendo(false); }
  }
  function salvar(event: FormEvent) {
    event.preventDefault();
    if (!justificativa.trim() || !documento || lendo) {
      setErro("Informe a justificativa e anexe o documento comprobatório.");
      return;
    }
    try {
      const atual = carregarGestaoLicencas().find((item) => item.id === registro.id) || registro;
      const atualizado = { ...atual, alteracoes: [...(atual.alteracoes || []), {
        justificativa: justificativa.trim(), documento, data: new Date().toISOString(),
      }] };
      localStorage.setItem(STORAGE_SOLICITACOES, JSON.stringify([
        atualizado, ...carregarSolicitacoes().filter((item) => item.id !== registro.id),
      ]));
      onSaved();
    } catch { setErro("Não foi possível salvar a alteração. Tente novamente."); }
  }
  return <Dialog visible header="Editar Lançamento" onHide={onClose} modal draggable={false}
    className="gl-editar-modal" style={{ width: "720px", maxWidth: "calc(100vw - 24px)" }}>
    <form onSubmit={salvar}>
      <div className="gl-editar-body">
        <dl className="gl-editar-resumo">
          <div className="gl-editar-servidor"><dt>Servidor</dt><dd>{registro.nome}</dd></div>
          <div><dt>Matrícula</dt><dd>{registro.matricula}</dd></div>
          <div><dt>Vínculo</dt><dd>{registro.vinculo}</dd></div>
          <div><dt>Tipo de ocorrência</dt><dd>{registro.tipo}</dd></div>
          <div><dt>Período</dt><dd>{dataLicenca(registro.inicio)} a {dataLicenca(registro.fim)}</dd></div>
        </dl>
        <label className="gl-editar-label" htmlFor="gl-justificativa">Justificativa <span>*</span></label>
        <textarea id="gl-justificativa" required autoFocus placeholder="Descreva o motivo da alteração..."
          value={justificativa} onChange={(event) => setJustificativa(event.target.value)} />
        <label className="gl-editar-label" htmlFor="gl-documento">Documento comprobatório <span>*</span></label>
        <div className="gl-editar-upload" onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => { event.preventDefault(); if (!lendo) void anexar(event.dataTransfer.files[0]); }}>
          <input ref={input} id="gl-documento" type="file" accept=".pdf,.doc,.docx" disabled={lendo}
            onChange={(event) => { void anexar(event.target.files?.[0]); event.target.value = ""; }} />
          <BotaoSeplag type="button" label="Escolher arquivo" icon="pi pi-upload" disabled={lendo} onClick={() => input.current?.click()} />
          <p>{lendo ? "Carregando documento..." : documento ? documento.nome : "Arraste e solte o arquivo aqui ou clique para selecionar"}</p>
          <small>Formatos aceitos: PDF, DOC, DOCX (Máx 2MB).</small>
        </div>
        {erro && <p role="alert" className="gl-editar-erro">{erro}</p>}
      </div>
      <footer className="gl-editar-footer">
        <BotaoFecharSeplag type="button" onClick={onClose} />
        <BotaoSalvarSeplag type="submit" disabled={lendo} />
      </footer>
    </form>
  </Dialog>;
}
