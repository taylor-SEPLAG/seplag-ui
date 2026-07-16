import { useLocation } from "react-router-dom";
import { DistribuicaoIndividualContent } from "./DistribuicaoIndividualContent";
import { SaldosControleVagasContent } from "./SaldosControleVagasContent";

export function DistribuicaoSaldoContent(){
 const location=useLocation();
 return location.pathname.includes("consulta-saldo")?<SaldosControleVagasContent/>:<DistribuicaoIndividualContent/>;
}
