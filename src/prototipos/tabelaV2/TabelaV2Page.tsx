import { useLocation } from "react-router-dom";
import { V2List } from "./V2List";
import { V2Form } from "./V2Form";
import { V2RgaPage } from "./V2RgaPage";
import { V2IndividualRgaPage } from "./V2IndividualRgaPage";
import { v2Read } from "./v2Store";

export function TabelaV2Page() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const cargoId = Number(params.get("cargo")) || undefined;
  if (location.pathname.endsWith("/aplicar-rga")) return <V2IndividualRgaPage key={location.search} sourceId={params.get("registro") || ""} />;
  if (location.pathname.endsWith("/rga-em-lote")) return <V2RgaPage />;
  if (location.pathname.endsWith("/excecao/nova")) return <V2Form key={location.pathname + location.search} kind="excecao" cargoId={cargoId} />;
  if (location.pathname.endsWith("/visualizar") || location.pathname.endsWith("/versionar")) {
    const record = v2Read().find((item) => item.id === params.get("registro"));
    if (record) return <V2Form key={location.pathname + record.id} kind={record.kind} sourceId={record.id} view={location.pathname.endsWith("/visualizar")} />;
  }
  if (location.pathname.endsWith("/novo")) return <V2Form key={location.pathname + location.search} kind="padrao" cargoId={cargoId} initialJourney={params.get("jornada") || undefined} referenceId={params.get("referencia") || undefined} />;
  return <V2List />;
}
