import { useId, type ReactNode } from "react";
import "./processamentoFolhaLayout.css";
export function SecaoProcessamentoFolha({
  titulo,
  icone,
  descricao,
  children,
  acoes,
}: {
  titulo: string;
  icone: string;
  descricao?: string;
  children: ReactNode;
  acoes?: ReactNode;
}) {
  const id = useId();
  return (
    <section className="processamento-bloco" aria-labelledby={id}>
      <header className="processamento-bloco-cabecalho">
        <i className={icone} aria-hidden="true" />
        <div>
          <h2 id={id}>{titulo}</h2>
          {descricao && <p>{descricao}</p>}
        </div>
        {acoes && <div className="processamento-bloco-acoes">{acoes}</div>}
      </header>
      <div className="processamento-bloco-conteudo">{children}</div>
    </section>
  );
}
