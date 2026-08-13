import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { DocumentosLegaisAssociadosSeplag } from "../../componentes/DocumentosLegaisAssociados";
import { useDocumentosLegaisAssociaveis } from "../documentosLegais/documentosLegaisStore";
import "./baseLegalVinculada.css";

interface BaseLegalVinculadaProps {
  value: string[];
  onChange: (ids: string[]) => void;
  required?: boolean;
  expandirAoAbrir?: boolean;
  className?: string;
}

/**
 * Bloco único de associação jurídica do Controle de Vagas.
 * A fonte e o cadastro pertencem ao módulo Documentação; este componente
 * somente consulta e associa os registros ativos daquela base.
 */
export function BaseLegalVinculada({
  value,
  onChange,
  required = true,
  expandirAoAbrir = true,
  className = "",
}: Readonly<BaseLegalVinculadaProps>) {
  const documentos = useDocumentosLegaisAssociaveis();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const documentoCriadoId = searchParams.get("documentoLegalId");
  const perfil = (searchParams.get("perfil") ?? "").toUpperCase();
  const podeCadastrarDocumentoLegal = perfil !== "SETORIAL";

  useEffect(() => {
    if (!documentoCriadoId) return;
    if (!value.includes(documentoCriadoId)) onChange([...value, documentoCriadoId]);

    const params = new URLSearchParams(searchParams);
    params.delete("documentoLegalId");
    const query = params.toString();
    navigate(`${location.pathname}${query ? `?${query}` : ""}`, { replace: true });
  }, [documentoCriadoId, location.pathname, navigate, onChange, searchParams, value]);

  const returnTo = `${location.pathname}${location.search}`;
  const novoDocumentoUrl = `/prototipos/sigep/documentos-legais/novo?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <section className={`prototype-base-legal-card ${className}`.trim()}>
      <header className="prototype-base-legal-card__header">
        <i className="pi pi-link" aria-hidden="true" />
        <div>
          <h2>Base legal vinculada</h2>
          <p>Selecione uma norma cadastrada ou use o atalho para cadastrar uma nova.</p>
        </div>
      </header>
      <div className="prototype-base-legal-card__content">
        <DocumentosLegaisAssociadosSeplag
          label="Documentos legais associados"
          required={required}
          options={documentos}
          value={value}
          onChange={onChange}
          onNovoCadastro={() => navigate(novoDocumentoUrl)}
          onVisualizar={(documento) =>
            navigate(`/prototipos/sigep/documentos-legais/${documento.id}`)
          }
          exibirNovoCadastro={podeCadastrarDocumentoLegal}
          expandirAoAbrir={expandirAoAbrir}
        />
      </div>
    </section>
  );
}

