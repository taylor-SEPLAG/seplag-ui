import { controlePssStore } from '../controlePss/controlePssStore';
import type { CertameBasicoIngresso } from '../controlePss/certame/certameBasicoIngresso';
import { ingressoConcursosProcessosMock } from '../PrototiposPage';
import { candidatosAtuaisEdital } from './ingressoDados';
import { chaveEditalIngresso, localizarCertameIngresso, quantidadeValida, type CertameConsultaIngresso } from './certameIngresso';

/** Prefere o cadastro oficial, inclusive quando deixou de estar homologado. */
export function consultarCertamesIngresso() {
  const {certames,certamesBasicosIngresso}=controlePssStore.getState();
  return [...certames,...certamesBasicosIngresso.filter(b => !localizarCertameIngresso({id:b.gestaoIngressoId,edital:b.numeroEditalOrgao,
    tipo:b.tipoCertame === 'CONCURSO_PUBLICO' ? 'Concurso' : 'Processo Seletivo',orgao:b.setor},certames))];
}

/** Executada no carregamento/atualização da integração, nunca durante o cálculo/renderização. */
export function sincronizarCertamesIngresso(origens = ingressoConcursosProcessosMock, agora = new Date()) {
  const estado=controlePssStore.getState();
  const proximos=[...estado.certamesBasicosIngresso];
  const criados: string[]=[];
  const ambiguos: string[]=[];
  let alterado=false;
  for (const e of origens) {
    const todos: CertameConsultaIngresso[]=[...estado.certames,...proximos];
    // Cadastro oficial prevalece sobre o básico, sem sobrescrever situação ou dados válidos.
    if (localizarCertameIngresso(e,estado.certames)) continue;
    const existente=localizarCertameIngresso(e,proximos);
    if (existente) {
      const vagas=quantidadeValida(e.quantidadeVagas) ? e.quantidadeVagas : existente.vagasTotaisEdital;
      const reserva=quantidadeValida(e.quantidadeCadastroReserva ?? 0) ? e.quantidadeCadastroReserva ?? 0 : existente.cadastroReservaEdital;
      const situacao=e.situacaoCertame && e.situacaoCertame !== 'HOMOLOGADO' ? e.situacaoCertame : existente.situacaoAtual;
      if (vagas !== existente.vagasTotaisEdital || reserva !== existente.cadastroReservaEdital || situacao !== existente.situacaoAtual) {
        proximos[proximos.indexOf(existente)]={...existente,vagasTotaisEdital:vagas,cadastroReservaEdital:reserva,situacaoAtual:situacao,atualizadoEm:agora.toISOString()};alterado=true;
      }
      continue;
    }
    if (e.situacaoCertame !== 'HOMOLOGADO') continue;
    const chave=chaveEditalIngresso(e.edital,e.tipo,e.orgao);
    if (!chave) {ambiguos.push(e.edital);continue;}
    const coincidentes=todos.filter(c => chaveEditalIngresso(c.numeroEditalOrgao,c.tipoCertame === 'CONCURSO_PUBLICO' ? 'Concurso' : 'Processo Seletivo',c.setor) === chave);
    if (coincidentes.length) {ambiguos.push(`${e.edital}/${e.orgao}`);continue;}
    const candidatos=candidatosAtuaisEdital(e);
    const cargosConhecidos=[...new Map(candidatos.map(c => {
      const cargo={cargo:c.cargo,orgao:c.orgaoDesignado || e.orgao,polo:c.polo || (e.polos?.length === 1 ? e.polos[0] : undefined),tipoVaga:c.tipoVaga};
      return [JSON.stringify(cargo),cargo] as const;
    })).values()];
    const data=agora.toISOString();
    const novo: CertameBasicoIngresso={id:`CERT-INGRESSO-${e.id}`,gestaoIngressoId:e.id,origem:'GESTAO_INGRESSO',
      criadoEm:data,atualizadoEm:data,pendenteComplementacao:true,distribuicaoVagasPendente:true,
      camposPendentes:['Dados obrigatórios do certame','Distribuição de vagas por cargo/função, polo e tipo de vaga'],
      tipoCertame:e.tipo === 'Concurso' ? 'CONCURSO_PUBLICO' : 'PSS',setor:e.orgao,setoresParticipantes:e.orgaosParticipantes || [],
      nomeEdital:e.titulo,numeroEditalOrgao:`${e.edital.replace(/^Edital\s*/i,'')}/${e.orgao}`,anoConcurso:Number(e.edital.match(/\/(\d{4})/)?.[1]),
      situacaoAtual:'HOMOLOGADO',vagasTotaisEdital:quantidadeValida(e.quantidadeVagas) ? e.quantidadeVagas : undefined,
      cadastroReservaEdital:quantidadeValida(e.quantidadeCadastroReserva ?? 0) ? e.quantidadeCadastroReserva ?? 0 : undefined,
      cargos:[],cargosConhecidos};
    proximos.push(novo);criados.push(novo.id);
  }
  if (criados.length || alterado) controlePssStore.set('certamesBasicosIngresso',proximos);
  return {criados,ambiguos};
}
