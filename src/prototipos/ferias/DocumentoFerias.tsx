import { useRef, useState } from 'react';
import { guardarDocumento, lerDocumento } from './documentosFerias';

export interface DocumentoFerias { nome: string; id: string; anexadoEm: string }

export function AnexoFerias({ label, onChange }: { label: string; onChange: (documento: DocumentoFerias | null) => void }) {
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const tentativa = useRef(0);
  return <label className="prototype-ferias-form-section" style={{display:'block'}}>
    <strong>{label} *</strong>
    <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={async e => {
      const atual = ++tentativa.current;
      onChange(null); setErro(''); setCarregando(false);
      const arquivo = e.target.files?.[0];
      if (!arquivo) return;
      if (arquivo.size > 2 * 1024 * 1024 || !['application/pdf','image/png','image/jpeg'].includes(arquivo.type)) {
        setErro('Selecione PDF, PNG ou JPEG de até 2 MB.'); return;
      }
      setCarregando(true);
      try {
        const id = await guardarDocumento(arquivo);
        if (atual === tentativa.current) onChange({nome:arquivo.name, id, anexadoEm:new Date().toISOString()});
      } catch { if (atual === tentativa.current) setErro('Não foi possível armazenar o documento. Selecione novamente.'); }
      finally { if (atual === tentativa.current) setCarregando(false); }
    }} />
    <small>PDF ou imagem, até 2 MB. Documento armazenado com o registro do servidor neste protótipo.</small>
    {carregando && <span role="status">Armazenando documento...</span>}
    {erro && <span role="alert">{erro}</span>}
  </label>;
}

export function DownloadDocumentoFerias({ documento }: { documento: DocumentoFerias }) {
  const [erro, setErro] = useState('');
  return <><button type="button" onClick={async () => {
    try {
      const arquivo = await lerDocumento(documento.id);
      if (!arquivo) throw new Error('Ausente');
      const url = URL.createObjectURL(arquivo);
      const link = document.createElement('a'); link.href = url; link.download = documento.nome;
      link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setErro('');
    } catch { setErro('Documento indisponível neste navegador.'); }
  }}>{documento.nome}</button>{erro && <span role="alert">{erro}</span>}</>;
}
