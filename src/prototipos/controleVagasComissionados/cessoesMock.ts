import { ocupacoesVagasMock } from "./ocupacoesMock";
import type { CessaoFuncional } from "./types";

const ocupacao=ocupacoesVagasMock.find((item)=>item.vinculoId==="VIN-1045892")!;
export const cessoesMock:CessaoFuncional[]=[
 {id:"CES-2026-00041",ocupacaoId:ocupacao.id,vinculoId:ocupacao.vinculoId,vagaId:ocupacao.vagaId,orgaoCedente:"SEPLAG",orgaoCessionario:"CGE",inicio:"01/06/2026",fim:"31/05/2027",onus:"RESSARCIMENTO",processo:"SEPLAG-PRO-2026/01420",ato:"Ato nº 188/2026",situacao:"ATIVA"},
 {id:"CES-2024-00018",ocupacaoId:"OCU-00004",vinculoId:"VIN-1008210",vagaId:ocupacoesVagasMock.find((item)=>item.id==="OCU-00004")!.vagaId,orgaoCedente:"SEPLAG",orgaoCessionario:"SINFRA",inicio:"01/02/2022",fim:"31/01/2024",onus:"ORIGEM",processo:"SEPLAG-PRO-2022/00110",ato:"Ato nº 31/2022",situacao:"ENCERRADA",encerradaEm:"31/01/2024",motivoEncerramento:"Término da vigência"},
];
