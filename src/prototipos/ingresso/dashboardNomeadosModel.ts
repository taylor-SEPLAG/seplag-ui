import type { CargoVagaCertame, Certame } from '../controlePss/certame/types';
import { type RegistroDashboard } from './dashboardIngressoModel';
import { ingressoConcursosProcessosMock } from '../PrototiposPage';
import { categoriaIngresso, naoComparecimentoIngresso, posseRegistradaIngresso, type lerRegistrosIngresso } from './ingressoDados';
import { localizarCertameIngresso, quantidadeValida, quantitativosEditalIngresso, quantitativosCertameIngresso, type CertameConsultaIngresso } from './certameIngresso';
import { type ControleDisponibilidade } from './disponibilidadeNomeados';
import { getOrgaoAtuacaoIngresso, getPerfilVariacaoIngresso } from './perfilVariacao';

type CargoNomeados = Pick<CargoVagaCertame, 'cargoNome' | 'quantidadeVagas' | 'orgaoDestino'> & Partial<Pick<CargoVagaCertame,'id'|'cargoExistenteId'|'polo'|'tipoVaga'|'aceitaCadastroReserva'|'quantidadeCadastroReserva'|'quadroCodigo'>> & { vagasInformadas?: boolean; relacionamentoPendente?: boolean };
export type EditalNomeados = Pick<Certame, 'id' | 'tipoCertame' | 'setor' | 'numeroEditalOrgao' | 'anoConcurso'> & {
  situacaoAtual: string; cargos: readonly CargoNomeados[]; gestaoId?: number; certameOrigemId?: string;
  vagasTotais?: number; reservaTotal?: number;
};

const normalizar = (valor: string) => valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
function chaveEdital(edital: string, tipo: string, orgao: string) {
  const numero = edital.match(/(\d+)\s*\/\s*(\d{4})/);
  return numero ? `${tipo}|${Number(numero[1])}|${numero[2]}|${normalizar(orgao)}` : '';
}
export interface LinhaNomeados {
  id: string; certameId: string; edital: string; cargo: string; orgao: string; tipo: string;
  vagas: number; nomeados: number; ingressados: number; aNomear: number; aguardandoIngresso: number; excedentes: number;
  ano: string; situacaoCertame: string; ingressosPendentes: number; tomaramPosse: number; apresentaramServico: number; naoCompareceram: number;
  ingressoId?: number;
  polo?: string; tipoVaga?: string;
  cargoId?: string; ofertaIds?: string[]; cargoChave?: string; relacionamentoPendente?: boolean;
  vagasInformadas?: boolean; nomeadosValidos?: number; certameOrigemId?: string;
  cadastroReserva?: number; reservaInformada?: boolean; disponibilidadeInformada?: boolean;
  nomeacoesComprometidas?: number; quadrosCodigos?: string[]; alertas?: string[];
  totalCandidatos?: number; candidatosInformados?: boolean;
}

/** A nomear = (vagas do cargo + cadastro de reserva) − ingressados − pendentes. */
export function atualizarSaldoCandidatos(linhas: LinhaNomeados[]) {
  linhas.forEach(l => {
    const reserva = l.cadastroReserva ?? 0;
    const informado = l.vagasInformadas !== false && l.reservaInformada !== false && quantidadeValida(l.vagas) && quantidadeValida(reserva);
    const total = l.vagas + reserva;
    l.totalCandidatos = informado ? total : undefined;
    l.candidatosInformados = informado;
    l.aNomear = informado ? Math.max(0, total - l.nomeados) : 0;
    l.excedentes = informado ? Math.max(0, l.nomeados - total) : 0;
    l.ingressosPendentes = Math.max(0, l.nomeados - l.ingressados);
    l.aguardandoIngresso = l.ingressosPendentes;
    l.alertas = !informado ? ['Vagas e cadastro de reserva não disponíveis no Controle de Certame para este edital/cargo/órgão.']
      : l.excedentes > 0 ? ['Nomeados excedem a soma de vagas e cadastro de reserva. Confira o cadastro.'] : [];
  });
}
export interface FiltrosNomeados { tipo: string; edital: string; orgao: string; cargo: string; ano?: string; situacao?: string }
export const filtrosNomeadosVazios: FiltrosNomeados = { tipo: '', edital: '', orgao: '', cargo: '', ano: '', situacao: '' };
export const anoEdital = (c: EditalNomeados) => c.numeroEditalOrgao.match(/\d+\s*\/\s*(\d{4})/)?.[1] || String(c.anoConcurso);
const orgaoCargo = (c: Pick<EditalNomeados, 'setor'>, cargo: CargoNomeados) => cargo.orgaoDestino && cargo.orgaoDestino !== 'TODOS' ? cargo.orgaoDestino : c.setor;
const chaveOferta = (cargo: string, orgao: string, polo = '', tipoVaga = '', identidade = '') => [identidade || cargo.trim(),orgao,polo,tipoVaga].join('|');
const chaveCargoOferta = (cargo: CargoNomeados, orgao: string) => chaveOferta(cargo.cargoNome,orgao,cargo.polo,cargo.tipoVaga,cargo.cargoExistenteId || cargo.id);
const cargoIgual = (a: string,b: string) => a.trim().toLocaleLowerCase('pt-BR') === b.trim().toLocaleLowerCase('pt-BR');
export const descricaoCargoNomeados = (l: Pick<LinhaNomeados,'cargo'|'polo'|'tipoVaga'>) => [l.cargo && l.cargo !== '-' ? l.cargo : 'Cargo/Função não identificado',l.polo,l.tipoVaga].filter(Boolean).join(' · ');

export function contarEditaisHomologados(certames: readonly EditalNomeados[], filtros: FiltrosNomeados) {
  return new Set(certames.filter(c => c.situacaoAtual === 'HOMOLOGADO'
    && (!filtros.ano || anoEdital(c) === filtros.ano)
    && (!filtros.situacao || c.situacaoAtual === filtros.situacao)
    && (!filtros.tipo || (c.tipoCertame === 'CONCURSO_PUBLICO' ? 'Concurso' : 'Processo Seletivo') === filtros.tipo)
    && (!filtros.edital || c.id === filtros.edital)
    && (!(filtros.orgao || filtros.cargo) || c.cargos.some(cargo => (!filtros.orgao || orgaoCargo(c,cargo) === filtros.orgao)
      && (!filtros.cargo || normalizar(cargo.cargoNome).includes(normalizar(filtros.cargo))))))
    .map(c => c.certameOrigemId || c.id)).size;
}

export function consolidarNomeados(certames: readonly EditalNomeados[], registros: RegistroDashboard[]) {
  const ativos = [...new Map(certames.filter(c => c.situacaoAtual === 'HOMOLOGADO').map(c => [c.id,c])).values()];
  const chaves = new Map<string, EditalNomeados[]>();
  ativos.forEach(c => {
    const chave = chaveEdital(c.numeroEditalOrgao, c.tipoCertame === 'CONCURSO_PUBLICO' ? 'Concurso' : 'Processo Seletivo', c.setor);
    if (chave) chaves.set(chave, [...(chaves.get(chave) || []), c]);
  });
  const linhas = new Map<string, LinhaNomeados>();
  ativos.forEach(c => {
    const ofertas: readonly CargoNomeados[] = c.cargos.length ? c.cargos
      : [{cargoNome:'Cargo/Função não informado',quantidadeVagas:0,vagasInformadas:false}];
    ofertas.filter((cargo,i,todos) => !cargo.id || todos.findIndex(outro => outro.id === cargo.id) === i).forEach(cargo => {
    const orgao = orgaoCargo(c,cargo);
    const id = `${c.id}|${chaveCargoOferta(cargo,orgao)}`;
    const existente = linhas.get(id);
    const vagasInformadas = cargo.vagasInformadas !== false && quantidadeValida(cargo.quantidadeVagas);
    const vagas = vagasInformadas ? cargo.quantidadeVagas : 0;
    const reserva = cargo.aceitaCadastroReserva === false ? 0 : cargo.quantidadeCadastroReserva ?? 0;
    const reservaInformada = quantidadeValida(reserva);
    if (existente) { existente.vagas += vagas; existente.vagasInformadas = existente.vagasInformadas !== false && vagasInformadas;
      existente.cadastroReserva = (existente.cadastroReserva || 0)+reserva; existente.reservaInformada = existente.reservaInformada && reservaInformada;
      existente.quadrosCodigos = [...new Set([...(existente.quadrosCodigos || []),...(cargo.quadroCodigo ? [cargo.quadroCodigo] : [])])];
      existente.ofertaIds = [...new Set([...(existente.ofertaIds || []),...(cargo.id ? [cargo.id] : [])])]; }
    else linhas.set(id, { id, certameId: c.id, edital: c.numeroEditalOrgao, cargo: cargo.cargoNome, orgao,
      tipo: c.tipoCertame === 'CONCURSO_PUBLICO' ? 'Concurso' : 'Processo Seletivo', ano: anoEdital(c), situacaoCertame: c.situacaoAtual,
      vagas, vagasInformadas, ingressoId:c.gestaoId, certameOrigemId:c.certameOrigemId,polo:cargo.polo,tipoVaga:cargo.tipoVaga,
      cargoId:cargo.cargoExistenteId,ofertaIds:cargo.id ? [cargo.id] : [],cargoChave:cargo.cargoExistenteId || `${c.certameOrigemId || c.id}|${cargo.id || cargo.cargoNome.trim()}`,
      relacionamentoPendente:cargo.relacionamentoPendente,
      cadastroReserva:reserva,reservaInformada,quadrosCodigos:cargo.quadroCodigo ? [cargo.quadroCodigo] : [],
      nomeados: 0, ingressados: 0, aNomear: 0, aguardandoIngresso: 0, excedentes: 0, ingressosPendentes: 0, tomaramPosse: 0, apresentaramServico: 0, naoCompareceram: 0 });
    });
  });
  const semCorrespondencia: RegistroDashboard[] = [];
  [...new Map(registros.map(r => [`${r.editalId}:${r.candidatoId}`,r])).values()].forEach(r => {
    // O órgão do edital é a origem do certame; o órgão de exercício pode ser outro.
    const origem = r.edital.split('·')[1]?.trim() || r.orgao;
    const candidatos = chaves.get(chaveEdital(r.edital, r.tipo, origem)) || [];
    const possibilidades = candidatos.flatMap(c => [...linhas.values()].filter(l => l.certameId === c.id &&
      (r.cargoVagaCertameId ? l.ofertaIds?.includes(r.cargoVagaCertameId) : r.cargoId ? l.cargoId === r.cargoId : cargoIgual(l.cargo,r.cargo))));
    const correspondencias = possibilidades.filter(l => normalizar(l.orgao) === normalizar(r.orgao)
      && (!l.polo || l.polo === r.polo) && (!l.tipoVaga || l.tipoVaga === r.tipoVaga));
    // Correspondências ambíguas nunca são distribuídas ou duplicadas por aproximação.
    if (correspondencias.length !== 1) { semCorrespondencia.push(r); return; }
    const linha = correspondencias[0];
    linha.nomeados++;
    if (r.tipo === 'Concurso' && (r.posseRegistrada || ['Aguardando Efetivo Exercicio','Aguardando Termo Assinado','Ingresso Concluído'].includes(r.situacao))) linha.tomaramPosse++;
    if (r.situacao === 'Ingresso Concluído') { linha.ingressados++; linha.apresentaramServico++; }
    if ((r.tipo === 'Concurso' && r.situacao === 'Exoneração de oficio' && r.naoComparecimento)
      || (r.tipo === 'Processo Seletivo' && r.situacao === 'Ingresso Cancelado' && r.naoComparecimento)) linha.naoCompareceram++;
    linha.ingressoId = r.editalId;
  });
  atualizarSaldoCandidatos([...linhas.values()]);
  return { linhas: [...linhas.values()].sort((a,b) => b.aNomear-a.aNomear || a.edital.localeCompare(b.edital, 'pt-BR') || a.cargo.localeCompare(b.cargo, 'pt-BR')), semCorrespondencia };
}
export function filtrarNomeados(linhas: LinhaNomeados[], filtros: FiltrosNomeados) {
  return linhas.filter(l => l.situacaoCertame === 'HOMOLOGADO' && (!filtros.tipo || l.tipo === filtros.tipo) && (!filtros.edital || l.certameId === filtros.edital)
    && (!filtros.ano || l.ano === filtros.ano) && (!filtros.situacao || l.situacaoCertame === filtros.situacao)
    && (!filtros.orgao || l.orgao === filtros.orgao) && (!filtros.cargo || normalizar(l.cargo).includes(normalizar(filtros.cargo))));
}
type QuantitativosNomeados = Pick<LinhaNomeados,'vagas'|'cadastroReserva'|'nomeados'|'ingressados'|'aNomear'|'aguardandoIngresso'|'excedentes'|'ingressosPendentes'|'tomaramPosse'|'apresentaramServico'|'naoCompareceram'>;
export function resumoNomeados(linhas: readonly QuantitativosNomeados[]) {
  return linhas.reduce((acc,l) => ({ vagas: acc.vagas+l.vagas, nomeados: acc.nomeados+l.nomeados, ingressados: acc.ingressados+l.ingressados,
    aNomear: acc.aNomear+l.aNomear, cadastroReserva:acc.cadastroReserva+(l.cadastroReserva || 0), aguardandoIngresso: acc.aguardandoIngresso+l.aguardandoIngresso, excedentes: acc.excedentes+l.excedentes,
    ingressosPendentes: acc.ingressosPendentes+l.ingressosPendentes, tomaramPosse: acc.tomaramPosse+l.tomaramPosse,
    apresentaramServico: acc.apresentaramServico+l.apresentaramServico, naoCompareceram: acc.naoCompareceram+l.naoCompareceram }),
    { vagas: 0, cadastroReserva:0, nomeados: 0, ingressados: 0, aNomear: 0, aguardandoIngresso: 0, excedentes: 0, ingressosPendentes: 0, tomaramPosse: 0, apresentaramServico: 0, naoCompareceram: 0 });
}

/** Um total global nunca é atribuído a cada cargo. Recortes parciais exigem a distribuição cadastrada. */
export function totaisNomeadosPorEdital(linhas: LinhaNomeados[], editais: readonly EditalNomeados[], todasLinhas: LinhaNomeados[], permitirTotalGeral = true) {
  const grupos = new Map<string,LinhaNomeados[]>();
  linhas.forEach(l => grupos.set(l.certameId,[...(grupos.get(l.certameId) || []),l]));
  return [...grupos].map(([id,itens]) => {
    const edital=editais.find(e => e.id===id);
    const completo=permitirTotalGeral && todasLinhas.filter(l => l.certameId===id).every(l => itens.some(i => i.id===l.id));
    const resumo=resumoNomeados(itens);
    const vagasInformadas=completo && edital?.vagasTotais !== undefined || itens.every(l => l.vagasInformadas !== false);
    const reservaInformada=completo && edital?.reservaTotal !== undefined || itens.every(l => l.reservaInformada !== false);
    const vagas=completo && edital?.vagasTotais !== undefined ? edital.vagasTotais : resumo.vagas;
    const cadastroReserva=completo && edital?.reservaTotal !== undefined ? edital.reservaTotal : resumo.cadastroReserva;
    const informado=vagasInformadas && reservaInformada;
    const distribuido=itens.every(l => l.candidatosInformados !== false);
    return {...resumo,vagas,cadastroReserva,aNomear:informado ? distribuido ? resumo.aNomear : Math.max(0,vagas+cadastroReserva-resumo.nomeados) : 0,
      excedentes:informado ? distribuido ? resumo.excedentes : Math.max(0,resumo.nomeados-vagas-cadastroReserva) : 0,
      vagasInformadas,reservaInformada,candidatosInformados:informado,id,edital:itens[0].edital,itens};
  });
}

/** Certame fornece as ofertas; Gestão fornece o histórico e a situação atual de cada ingresso. */
export function consolidarNomeadosDaGestao(certames: readonly CertameConsultaIngresso[], registros: ReturnType<typeof lerRegistrosIngresso>, _controle?: ControleDisponibilidade, filtros?: FiltrosNomeados) {
  const central = getPerfilVariacaoIngresso() === 'CENTRAL';
  const orgao = getOrgaoAtuacaoIngresso();
  const permitidos = certames.filter(c => c.situacaoAtual === 'HOMOLOGADO' && (central || c.setor === orgao || c.setoresParticipantes?.includes(orgao)));
  const editais: EditalNomeados[] = [];
  const porGestao = new Map<number,EditalNomeados>();
  const porCertame = new Map<string,EditalNomeados>();
  ingressoConcursosProcessosMock.filter(e => central || e.orgao === orgao || registros.some(r => r.edital.id === e.id)).forEach(e => {
    const certame = localizarCertameIngresso(e,certames);
    if (!certame || !permitidos.includes(certame)) return;
    let adaptado = certame && porCertame.get(certame.id);
    if (!adaptado) {
      const totais=quantitativosEditalIngresso(e,permitidos);
      adaptado = {id:`gestao-${e.id}`,gestaoId:e.id,certameOrigemId:certame?.id,
        vagasTotais:totais.vagas,reservaTotal:totais.cadastroReserva,
        tipoCertame:e.tipo === 'Concurso' ? 'CONCURSO_PUBLICO' : 'PSS',setor:e.orgao,
        numeroEditalOrgao:certame?.numeroEditalOrgao || `${e.edital.replace(/^Edital\s*/i,'')}/${e.orgao}`,
        anoConcurso:certame?.anoConcurso || Number(e.edital.match(/\/(\d{4})/)?.[1] || 0),situacaoAtual:certame?.situacaoAtual || '',
        cargos:certame ? [...certame.cargos] : []};
      editais.push(adaptado);
      if (certame) porCertame.set(certame.id,adaptado);
    }
    porGestao.set(e.id,adaptado);
  });
  permitidos.forEach(c => {if (!porCertame.has(c.id)) {const totais=quantitativosCertameIngresso(c);const e={...c,cargos:[...c.cargos],certameOrigemId:c.id,vagasTotais:totais.vagas,reservaTotal:totais.cadastroReserva};editais.push(e);porCertame.set(c.id,e);}});
  const unicos = [...new Map(registros.map(r => [`${r.edital.id}:${r.candidato.id}`,r])).values()];
  const ofertaPorRegistro = new Map<string,string>();
  // Candidatos sem oferta identificada continuam visíveis, com vagas indisponíveis.
  unicos.forEach(r => {
    const e = porGestao.get(r.edital.id);
    if (!e) return;
    const destino = r.candidato.orgaoDesignado || r.edital.orgao;
    const polo = r.candidato.polo || (r.edital.polos?.length === 1 ? r.edital.polos[0] : undefined);
    const vaga = r.candidato.vagaId && _controle?.vagas.find(v => v.id === r.candidato.vagaId);
    let ofertas = e.cargos.filter(c => c.vagasInformadas !== false && (r.candidato.cargoVagaCertameId ? c.id === r.candidato.cargoVagaCertameId
      : r.candidato.cargoId ? c.cargoExistenteId === r.candidato.cargoId
      : vaga ? c.quadroCodigo === vaga.quadroCodigo : cargoIgual(c.cargoNome,r.candidato.cargo)) && normalizar(orgaoCargo(e,c)) === normalizar(destino)
      && (!c.polo || (!!polo && normalizar(c.polo) === normalizar(polo)))
      && (!c.tipoVaga || c.tipoVaga === r.candidato.tipoVaga));
    const cadastradas = ofertas.filter(c => c.vagasInformadas !== false);
    if (cadastradas.length) ofertas = cadastradas;
    if (ofertas.some(c => c.polo)) ofertas = ofertas.filter(c => c.polo);
    if (ofertas.some(c => c.tipoVaga)) ofertas = ofertas.filter(c => c.tipoVaga);
    ofertas = [...new Map(ofertas.map(c => [chaveCargoOferta(c,orgaoCargo(e,c)),c])).values()];
    if (ofertas.length !== 1) {
      const semCargo=!r.candidato.cargo?.trim() || r.candidato.cargo==='-';
      const identidade=r.candidato.cargoVagaCertameId || r.candidato.cargoId || (semCargo ? String(r.candidato.id) : JSON.stringify([r.candidato.cargo,destino,polo,r.candidato.tipoVaga]));
      const cargo: CargoNomeados = {id:`SEM-VINCULO-${r.edital.id}:${identidade}`,cargoNome:r.candidato.cargo,orgaoDestino:destino,polo,tipoVaga:r.candidato.tipoVaga,quantidadeVagas:0,vagasInformadas:false,
        relacionamentoPendente:semCargo || !!r.candidato.cargoId || !!r.candidato.cargoVagaCertameId || e.cargos.some(c => c.vagasInformadas !== false)};
      const chave = chaveCargoOferta(cargo,destino);
      if (!e.cargos.some(c => c.vagasInformadas === false && chaveCargoOferta(c,orgaoCargo(e,c)) === chave)) e.cargos=[...e.cargos,cargo];
      ofertas=[cargo];
    }
    const oferta = ofertas[0];
    ofertaPorRegistro.set(`${r.edital.id}:${r.candidato.id}`,`${e.id}|${chaveCargoOferta(oferta,orgaoCargo(e,oferta))}`);
  });
  const resultado = consolidarNomeados(editais,[]);
  const linhasBase=[...resultado.linhas];
  if (filtros) resultado.linhas=filtrarNomeados(resultado.linhas,filtros);
  const linhasPorId = new Map(resultado.linhas.map(l => [l.id,l]));
  unicos.forEach(r => {
    const linha = linhasPorId.get(ofertaPorRegistro.get(`${r.edital.id}:${r.candidato.id}`) || '');
    if (!linha) return;
    const categoria = categoriaIngresso(r.situacao);
    linha.nomeados++;
    if (categoria === 'pendente' || categoria === 'ingressado') linha.nomeadosValidos = (linha.nomeadosValidos || 0)+1;
    if (categoria === 'ingressado') {linha.ingressados++;linha.apresentaramServico++;}
    if (posseRegistradaIngresso(r.edital,r.candidato,r.situacao)) linha.tomaramPosse++;
    if (naoComparecimentoIngresso(r.edital,r.candidato,r.situacao)) linha.naoCompareceram++;
  });
  atualizarSaldoCandidatos(resultado.linhas);
  resultado.linhas.filter(l => l.relacionamentoPendente).forEach(l => {
    l.alertas=[`Ingresso sem vínculo inequívoco com cargo/vaga do certame: ${l.ofertaIds?.join(', ')}. Confira edital, cargo, órgão, polo e tipo de vaga.`];
  });
  return {...resultado,editais,linhasBase};
}

export function totaisNomeadosPorCargo(linhas: LinhaNomeados[]) {
  const grupos=new Map<string,LinhaNomeados[]>();
  linhas.forEach(l => {const chave=l.cargoChave || `${l.certameId}|${l.cargoId || l.id}`;grupos.set(chave,[...(grupos.get(chave) || []),l]);});
  return [...grupos].map(([id,itens]) => ({id,nome:descricaoCargoNomeados({cargo:itens[0].cargo}),...resumoNomeados(itens),
    incompletas:itens.some(l => l.candidatosInformados === false),itens}));
}

/** Projeção única consumida por cards, gráficos, grid e exportação, independente da paginação. */
export function consultarDashboardNomeados(certames: readonly CertameConsultaIngresso[], registros: ReturnType<typeof lerRegistrosIngresso>, filtros: FiltrosNomeados, controle?: ControleDisponibilidade) {
  const base=consolidarNomeadosDaGestao(certames,registros,controle,filtros);
  const linhas=base.linhas.sort((a,b) => a.edital.localeCompare(b.edital,'pt-BR') || a.cargo.localeCompare(b.cargo,'pt-BR'));
  const totaisEditais=totaisNomeadosPorEdital(linhas,base.editais,base.linhasBase,!filtros.cargo);
  return {...base,linhas,totaisEditais,porEdital:totaisEditais.map(t => ({...t,nome:t.edital,incompletas:!t.candidatosInformados})),
    porCargo:totaisNomeadosPorCargo(linhas),resumo:resumoNomeados(totaisEditais),homologados:contarEditaisHomologados(base.editais,filtros)};
}
