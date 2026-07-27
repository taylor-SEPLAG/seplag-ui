import {describe,expect,it} from "vitest";
import {controleVagasStore} from "./controleVagasStore";
import {efetivarRemocaoInterna} from "./movimentacoesBasicas";
import {registrarCessao} from "./cessoes";

describe("Integração das movimentações funcionais",()=>{
 it("confirma que cessão altera exercício sem desocupar a vaga",()=>{const base=controleVagasStore.getState(),ocupacao=base.ocupacoes.find(o=>o.situacao==="ATIVA"&&base.vagas.find(v=>v.id===o.vagaId)?.carreira==="Gestão Governamental")!,vaga=base.vagas.find(v=>v.id===ocupacao.vagaId)!;const r=registrarCessao(vaga,ocupacao,{destino:"CGE",inicio:"2026-08-01",onus:"DESTINO",processo:"PROC-CES",ato:"ATO-CES"});expect(r.validacao.valido).toBe(true);expect(r.ocupacao.vagaId).toBe(ocupacao.vagaId);expect(r.ocupacao.orgaoExercicio).toBe("CGE");expect(vaga.estado).toBe("OCUPADA")});
 it("confirma que remoção interna mantém a vaga",()=>{const ocupacao=controleVagasStore.getState().ocupacoes.find(o=>o.situacao==="ATIVA")!;const r=efetivarRemocaoInterna(ocupacao,{orgaoDestino:ocupacao.orgaoLotacao,unidadeDestino:"Nova unidade",data:"2026-08-01",processo:"PROC-REM"});expect(r.vagaId).toBe(ocupacao.vagaId);expect(r.unidadeLotacao).toBe("Nova unidade")});
});