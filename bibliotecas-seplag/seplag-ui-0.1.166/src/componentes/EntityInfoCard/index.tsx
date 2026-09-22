export interface EntityInfoCardSeplagProps {
  id?: string;
  nameLabel: string | null;
  nameValue: string | null;
  documentLabel: string | null;
  documentValue: string | null;
  titulo?: string;
  /** Classe do wrapper de grid (compensa a margem do .grid pai). Default: "col-12". */
  className?: string;
  /** Classe do cartão visual (fundo, borda, padding). Default: estilo padrão em azul. */
  cardClassName?: string;
}

const EMPTY = "—";

export const EntityInfoCardSeplag = ({
  id = "entity-info-card",
  nameLabel,
  documentLabel,
  nameValue,
  documentValue,
  titulo,
  className,
  cardClassName,
}: EntityInfoCardSeplagProps) => (
  <div className={className ?? "col-12"} style={{ boxSizing: "border-box" }}>
    <div
      id={id}
      data-testid={id}
      className={cardClassName ?? "p-3 border-1 border-300 border-round bg-blue-50"}
      style={{ boxSizing: "border-box" }}
    >
      {titulo && (
        <h5 className="mb-3 text-blue-900">
          <strong>{titulo}</strong>
        </h5>
      )}
      <dl className="flex flex-column m-0">
        <div className="flex align-items-start mb-2">
          <dt className="font-medium text-gray-700 mr-2">{nameLabel}:</dt>
          <dd className="m-0 text-gray-900 uppercase">{nameValue ?? EMPTY}</dd>
        </div>
        <div className="flex align-items-start">
          <dt className="font-medium text-gray-700 mr-2">{documentLabel}:</dt>
          <dd className="m-0 text-gray-900">{documentValue ?? EMPTY}</dd>
        </div>
      </dl>
    </div>
  </div>
);
