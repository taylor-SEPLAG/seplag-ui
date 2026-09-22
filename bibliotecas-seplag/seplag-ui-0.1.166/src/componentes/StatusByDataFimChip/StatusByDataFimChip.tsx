import { BadgeSeplag } from "@componentes/Badge";
import { StatusKeySeplag, StatusLabels } from "@type/status";
import { isBefore, parse } from "date-fns";

interface Props {
  readonly dataFim?: string | null;
}

/**
 * @deprecated Use BadgeSeplag with explicit status-to-variant mapping in the consumer.
 */
export function StatusByDataFimChipSeplag({ dataFim }: Props) {
  let ativo = true;

  if (dataFim) {
    const dataFimParsed = parse(dataFim, "dd/MM/yyyy", new Date());
    const hoje = new Date();

    ativo = isBefore(hoje, dataFimParsed);
  }

  const key = ativo ? StatusKeySeplag.ATIVO : StatusKeySeplag.INATIVO;
  const label = StatusLabels[key];
  const variant = key === StatusKeySeplag.ATIVO ? "success" : "error";

  return <BadgeSeplag label={label} variant={variant} minWidth={120} />;
}
