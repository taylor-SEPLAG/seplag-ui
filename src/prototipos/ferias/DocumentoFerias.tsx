import { useId, useRef, useState } from 'react';
import { BotaoIconSeplag } from '../../componentes/Botao';
import { guardarDocumento, lerDocumento } from './documentosFerias';

export interface DocumentoFerias { nome: string; id: string; anexadoEm: string }

function formatarTamanhoFerias(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function iconeDocumentoFerias(nome: string): string {
  if (nome.toLowerCase().endsWith('.pdf')) return 'pi pi-file-pdf';
  if (/\.docx?$/i.test(nome)) return 'pi pi-file-word';
  return 'pi pi-file';
}

const TIPOS_ACEITOS_FERIAS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export function AnexoFerias({ label, onChange }: { label: string; onChange: (documento: DocumentoFerias | null) => void }) {
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [documento, setDocumento] = useState<(DocumentoFerias & { tamanho: number }) | null>(null);
  const tentativa = useRef(0);
  const inputId = useId();

  const processarArquivo = async (arquivo: File | undefined) => {
    const atual = ++tentativa.current;
    onChange(null); setErro(''); setCarregando(false); setDocumento(null);
    if (!arquivo) return;
    if (arquivo.size > 2 * 1024 * 1024 || !TIPOS_ACEITOS_FERIAS.includes(arquivo.type)) {
      setErro('Selecione PDF, DOC ou DOCX de até 2 MB.'); return;
    }
    setCarregando(true);
    try {
      const id = await guardarDocumento(arquivo);
      if (atual === tentativa.current) {
        const novoDocumento = { nome: arquivo.name, id, anexadoEm: new Date().toISOString() };
        onChange(novoDocumento);
        setDocumento({ ...novoDocumento, tamanho: arquivo.size });
      }
    } catch {
      if (atual === tentativa.current) setErro('Não foi possível armazenar o documento. Selecione novamente.');
    } finally {
      if (atual === tentativa.current) setCarregando(false);
    }
  };

  const remover = () => {
    tentativa.current += 1;
    setDocumento(null); setErro('');
    onChange(null);
  };

  const baixar = async () => {
    if (!documento) return;
    try {
      const arquivo = await lerDocumento(documento.id);
      if (!arquivo) throw new Error('Ausente');
      const url = URL.createObjectURL(arquivo);
      const link = window.document.createElement('a'); link.href = url; link.download = documento.nome;
      link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setErro('Documento indisponível neste navegador.');
    }
  };

  return (
    <div className="prototype-ferias-form-section prototype-judicial-document-field">
      <strong className="prototype-judicial-upload-label">{label}<em>*</em></strong>
      <input
        id={inputId}
        className="prototype-judicial-upload-input"
        type="file"
        accept=".pdf,.doc,.docx"
        aria-label={`${label} *`}
        aria-invalid={Boolean(erro)}
        onChange={(e) => { const arquivo = e.target.files?.[0]; processarArquivo(arquivo); e.target.value = ''; }}
      />
      <label
        htmlFor={inputId}
        className={`prototype-judicial-upload-area${erro ? ' is-invalid' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); processarArquivo(e.dataTransfer.files?.[0]); }}
      >
        <span className="prototype-judicial-upload-button"><i className="pi pi-upload" aria-hidden="true" /> Escolher arquivo</span>
        <span className="prototype-judicial-upload-texto">
          <span className="prototype-judicial-upload-prompt">Arraste e solte o arquivo aqui ou clique para selecionar</span>
          <small>Formatos aceitos: PDF, DOC, DOCX (Máx. 2MB).</small>
        </span>
      </label>
      {carregando && <span role="status">Armazenando documento...</span>}
      {erro && <small className="prototype-judicial-upload-error" role="alert">{erro}</small>}
      <div className="prototype-judicial-attachments">
        <strong>Arquivos anexados ({documento ? 1 : 0})</strong>
        {documento ? (
          <div className="prototype-judicial-attachment-row">
            <span className="prototype-judicial-attachment-icon"><i className={iconeDocumentoFerias(documento.nome)} aria-hidden="true" /></span>
            <span className="prototype-judicial-attachment-info">
              <strong>{documento.nome}</strong>
              <small>{formatarTamanhoFerias(documento.tamanho)}</small>
            </span>
            <div className="prototype-judicial-attachment-actions">
              <BotaoIconSeplag type="button" icon="pi pi-download" tooltip={`Baixar ${documento.nome}`} aria-label={`Baixar ${documento.nome}`} onClick={baixar} />
              <BotaoIconSeplag type="button" icon="pi pi-trash" severity="danger" tooltip={`Remover ${documento.nome}`} aria-label={`Remover ${documento.nome}`} onClick={remover} />
            </div>
          </div>
        ) : <p>Nenhum arquivo anexado</p>}
      </div>
    </div>
  );
}

export function DownloadDocumentoFerias({ documento }: { documento: DocumentoFerias }) {
  const [erro, setErro] = useState('');
  const baixar = async () => {
    try {
      const arquivo = await lerDocumento(documento.id);
      if (!arquivo) throw new Error('Ausente');
      const url = URL.createObjectURL(arquivo);
      const link = document.createElement('a'); link.href = url; link.download = documento.nome;
      link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setErro('');
    } catch { setErro('Documento indisponível neste navegador.'); }
  };
  return <>
    <BotaoIconSeplag type="button" icon="pi pi-cloud-download" tooltip={`Baixar ${documento.nome}`} aria-label={`Baixar ${documento.nome}`} onClick={baixar} />
    {erro && <span role="alert">{erro}</span>}
  </>;
}
