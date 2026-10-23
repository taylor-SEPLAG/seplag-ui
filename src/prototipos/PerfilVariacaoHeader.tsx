import { createContext, useContext, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './perfilVariacaoHeader.css';

export const PerfilVariacaoHeaderContext = createContext<HTMLElement | null>(null);

/** A presença do seletor na tela determina sua presença no header. */
export function PerfilVariacaoHeader({ children, resumo }: { children: ReactNode; resumo: string }) {
  const destino = useContext(PerfilVariacaoHeaderContext);
  if (!destino) return null;
  return createPortal(
    <details className="sigep-profile-control" onKeyDown={event => {
      if (event.key === 'Escape') {
        event.currentTarget.open = false;
        event.currentTarget.querySelector('summary')?.focus();
      }
    }}>
      <summary aria-label={`Perfil da variação: ${resumo}`}>
        <i className="pi pi-users" aria-hidden="true" />
        <span>{resumo}</span><i className="pi pi-chevron-down" aria-hidden="true" />
      </summary>
      <div className="sigep-profile-fields">{children}</div>
    </details>, destino,
  );
}
