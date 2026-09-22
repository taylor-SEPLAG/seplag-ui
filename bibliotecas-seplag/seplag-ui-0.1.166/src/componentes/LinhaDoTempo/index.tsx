import type { ReactNode } from "react";
import styles from "./style.module.css";

export type LinhaDoTempoVarianteSeplag = "neutral" | "info" | "success" | "warning" | "danger";

export interface LinhaDoTempoItemSeplag {
  readonly id: string | number;
  readonly titulo: ReactNode;
  readonly data?: ReactNode;
  readonly dataIso?: string;
  readonly descricao?: ReactNode;
  readonly metadados?: ReactNode;
  readonly icone?: string;
  readonly variante?: LinhaDoTempoVarianteSeplag;
}

export interface LinhaDoTempoSeplagProps {
  readonly itens: readonly LinhaDoTempoItemSeplag[];
  readonly titulo?: ReactNode;
  readonly mensagemVazia?: ReactNode;
  readonly className?: string;
  readonly ariaLabel?: string;
  readonly itemSelecionadoId?: string | number;
  readonly onItemClick?: (item: LinhaDoTempoItemSeplag) => void;
}

function montarClasseRaiz(className?: string) {
  return [styles.timeline, className].filter(Boolean).join(" ");
}

export function LinhaDoTempoSeplag({
  itens,
  titulo,
  mensagemVazia = "Nenhum evento registrado.",
  className,
  ariaLabel = "Linha do tempo",
  itemSelecionadoId,
  onItemClick,
}: Readonly<LinhaDoTempoSeplagProps>) {
  return (
    <section className={montarClasseRaiz(className)} aria-label={ariaLabel}>
      {titulo && <h3 className={styles.heading}>{titulo}</h3>}

      {itens.length === 0 ? (
        <div className={styles.emptyState} role="status">
          <i className="pi pi-clock" aria-hidden="true" />
          <span>{mensagemVazia}</span>
        </div>
      ) : (
        <ol className={styles.list}>
          {itens.map((item) => {
            const variante = item.variante ?? "neutral";
            const icone = item.icone ?? "pi pi-circle-fill";
            const selecionado = itemSelecionadoId === item.id;
            const clicavel = Boolean(onItemClick);

            const conteudo = (
              <div className={styles.content}>
                <strong className={styles.title}>{item.titulo}</strong>
                {item.data && (
                  <time className={styles.date} dateTime={item.dataIso}>
                    {item.data}
                  </time>
                )}
                {item.descricao && <div className={styles.description}>{item.descricao}</div>}
                {item.metadados && <div className={styles.metadata}>{item.metadados}</div>}
              </div>
            );

            return (
              <li
                className={[styles.item, clicavel && styles.itemClicavel, selecionado && styles.itemSelecionado]
                  .filter(Boolean)
                  .join(" ")}
                key={item.id}
              >
                <span className={`${styles.marker} ${styles[variante]}`} aria-hidden="true">
                  <i className={icone} />
                </span>
                {clicavel ? (
                  <button
                    type="button"
                    className={styles.itemButton}
                    aria-pressed={selecionado}
                    onClick={() => onItemClick?.(item)}
                  >
                    {conteudo}
                  </button>
                ) : (
                  conteudo
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
