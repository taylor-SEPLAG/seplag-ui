import type { SpecificationMetadata } from "../shared/visualizationModes";

const story="US Controle PSS — Painel Geral";
const spec=(id:string,title:string,description:string,businessRule:string,source:string,dataType:string,component:string,route?:string,behavior?:string):SpecificationMetadata=>({id,title,description,businessRule,source,dataType,component,status:"CONFIRMADO",route,behavior,userStory:story});

export const painelPssScreenSpecification=spec("PSS-PAINEL","Painel Geral do Controle PSS","Consolidar em uma única visão a posição dos certames (Concursos Públicos e Processos Seletivos Simplificados) cadastrados diretamente no SIGEP.","O Cadastro de Certames é a origem SIGEP de concursos e PSS (RN-01 a RN-16); o Painel Geral resume quantidade, situação e vagas ofertadas dos certames.","Certame[] do controlePssStore.","Certame[]","Página React + seletores derivados do store","/prototipos/sigep/controle-pss/painel","Recalcula a visão sempre que os certames do store forem alterados.");

export const painelPssKpiSpecifications:Record<string,SpecificationMetadata>={
 "Certames cadastrados":spec("PSS-PAINEL-KPI-001","Certames cadastrados","Total de Concursos Públicos e Processos Seletivos Simplificados cadastrados diretamente no SIGEP.","Cadastro de Certames — origem SIGEP (RN-01 a RN-16).","Certame[] do controlePssStore.","integer","KPI navegável","/prototipos/sigep/controle-pss/certames","Abre Cadastro de Certames."),
 "Certames homologados":spec("PSS-PAINEL-KPI-002","Certames homologados","Certames cuja situação atual é Homologado.","RN-15/RN-16 — a homologação é o marco do prazo de prestação de contas ao TCE-MT.","Certame.situacaoAtual.","integer","KPI navegável","/prototipos/sigep/controle-pss/certames","Abre Cadastro de Certames."),
 "Vagas ofertadas nos certames":spec("PSS-PAINEL-KPI-003","Vagas ofertadas nos certames","Somatório das vagas dos cargos cadastrados em todos os certames.","RN-14 — cada certame deve ter ao menos um cargo/vaga cadastrado.","Certame.cargos[].quantidadeVagas.","integer","KPI navegável","/prototipos/sigep/controle-pss/certames","Abre Cadastro de Certames."),
 "Cargos cadastrados":spec("PSS-PAINEL-KPI-004","Cargos cadastrados","Total de linhas de cargo/vaga cadastradas em todos os certames.","RN-14 — cada certame deve ter ao menos um cargo/vaga cadastrado.","CargoVagaCertame[] de todos os certames.","integer","KPI navegável","/prototipos/sigep/controle-pss/certames","Abre Cadastro de Certames."),
 "Vagas PCD ofertadas":spec("PSS-PAINEL-KPI-005","Vagas PCD ofertadas","Somatório das vagas reservadas para pessoas com deficiência entre os cargos cadastrados.","CargoVagaCertame.vagaPcd e quantidadePcd.","CargoVagaCertame[].quantidadePcd.","integer","KPI navegável","/prototipos/sigep/controle-pss/certames","Abre Cadastro de Certames."),
 "Cargo com mais vagas":spec("PSS-PAINEL-KPI-006","Cargo com mais vagas","Cargo com a maior quantidade de vagas somadas entre todos os certames.","Ajuda a priorizar o acompanhamento do cargo de maior impacto no quantitativo geral.","CargoVagaCertame[].quantidadeVagas agrupado por cargoNome.","integer","KPI navegável","/prototipos/sigep/controle-pss/certames","Abre Cadastro de Certames."),
};

export const painelPssBlockSpecifications={
 tabelaCertames:spec("PSS-PAINEL-TBL-001","Certames em acompanhamento","Apresentar a posição resumida de cada certame cadastrado no SIGEP.","Exibir edital, órgão mandante, tipo, situação e total de vagas.","Certame[] do controlePssStore.","Certame[]","tabela gerencial","/prototipos/sigep/controle-pss/certames/:id","O edital abre o detalhe em Cadastro de Certames."),
 tabelaCargos:spec("PSS-PAINEL-TBL-002","Cargos ofertados","Listar cada cargo/vaga cadastrado nos certames, com o vínculo e a quantidade ofertada.","RN-14 — todo cargo/vaga do certame fica visível no painel, incluindo vagas PCD.","Certame.cargos[] de todos os certames.","CargoVagaCertame[]","tabela gerencial","/prototipos/sigep/controle-pss/certames/:id","O certame abre o detalhe em Cadastro de Certames."),
} satisfies Record<string,SpecificationMetadata>;

export const painelPssBusinessItems=[...Object.values(painelPssBlockSpecifications),...Object.values(painelPssKpiSpecifications)];
