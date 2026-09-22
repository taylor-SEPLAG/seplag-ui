import { BadgeSeplag } from "@componentes/Badge";
import { StatusKeySeplag, StatusLabels } from "@type/status";

interface Props {
  readonly descStatus?: string | null;
}

/**
 * @deprecated Use BadgeSeplag with explicit status-to-variant mapping in the consumer.
 */
export function StatusByFilterChipSeplag({ descStatus }: Props) {
  const raw = descStatus?.trim().toUpperCase() || StatusKeySeplag.PENDENTE;
  const key = Object.values(StatusKeySeplag).includes(raw as StatusKeySeplag)
    ? (raw as StatusKeySeplag)
    : StatusKeySeplag.PENDENTE;

  const label = StatusLabels[key];
  let variant: "success" | "warning" | "error";
  if (key === StatusKeySeplag.ATIVO) {
    variant = "success";
  } else if (key === StatusKeySeplag.PENDENTE) {
    variant = "warning";
  } else {
    variant = "error";
  }

  return <BadgeSeplag label={label} variant={variant} minWidth={120} />;
}
