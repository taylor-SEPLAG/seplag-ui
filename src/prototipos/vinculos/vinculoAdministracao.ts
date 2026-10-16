import { todos, configTipo, opcoesCargo, SETORES, TIPOS_FIM_EXERCICIO, moduloDeOrigem, type Vinculo } from './vinculoDados';
import { exigirPermissaoVinculo, usuarioVinculos } from './vinculoSessao';
import { CHAVE_ADMINISTRACAO, lerEstadoAdministrativo, persistirEstadoAdministrativo, type AuditoriaVinculo, type MudancaVinculo } from './vinculoPersistencia';
import { controleVagasStore } from '../controleVagas/controleVagasStore';
import { eventos as eventosFuncionais } from '../vidaFuncional/model';
import { folhaPagamentoService } from '../folhaPagamento/folhaPagamentoService';

export const CAMPOS_EDITAVEIS = {
  regime: 'Regime Jurídico', carreira: 'Carreira', cargo: 'Cargo', perfil: 'Perfil Profissional',
  jornada: 'Jornada de Trabalho', orgao: 'Órgão/Entidade', setor: 'Lotação', inicio: 'Data de Início do Exercício',
  termino: 'Data de Fim do Exercício', observacao: 'Observação',
} as const;
type Campo = keyof typeof CAMPOS_EDITAVEIS;
const texto = (valor: unknown) => valor == null ? '' : String(valor);
const identificacao = (v: Vinculo) => ({nome:v.nome,matricula:v.matricula,numero:v.numero,tipo:v.tipo});
const assinatura = (v: Vinculo) => JSON.stringify(v);
function encontrar(id: string) {
  const v = todos().find(v => v.id === id);
  if (!v) throw new Error('Vínculo não encontrado ou já excluído.');
  return v;
}
export function diferencasVinculo(anterior: Vinculo, novo: Partial<Vinculo>): MudancaVinculo[] {
  return (Object.keys(CAMPOS_EDITAVEIS) as Campo[]).filter(c => c in novo && texto(anterior[c]) !== texto(novo[c]))
    .map(c => ({campo:c,rotulo:CAMPOS_EDITAVEIS[c],anterior:texto(anterior[c]),novo:texto(novo[c])}));
}
function validarEdicao(v: Vinculo, novos: Partial<Vinculo>, autorizacao = '') {
  for (const [campo,valor] of Object.entries(novos)) {
    const anterior = v[campo as keyof Vinculo];
    const iguais = typeof anterior === 'object' || typeof valor === 'object' ? JSON.stringify(anterior) === JSON.stringify(valor) : texto(anterior) === texto(valor);
    if (!Object.hasOwn(CAMPOS_EDITAVEIS,campo) && !iguais)
      throw new Error('Não é permitido alterar identificação, tipo, situação ou dados de vacância na edição cadastral.');
  }
  const n = {...v,...novos};
  if (![n.regime,n.cargo,n.perfil,n.jornada,n.orgao,n.setor,n.inicio].every(c => c.trim())) throw new Error('Preencha todos os campos obrigatórios do vínculo.');
  const config = configTipo(v.tipo), opcoes = opcoesCargo(config,n.cargo);
  const mudou = (c: Campo) => texto(n[c]) !== texto(v[c]);
  const permitida = (c: Campo, opcoes: string[]) => {if (mudou(c) && !opcoes.includes(texto(n[c]))) throw new Error(`${CAMPOS_EDITAVEIS[c]} não corresponde à parametrização do vínculo.`);};
  permitida('regime',config.regimes); permitida('carreira',['',...config.carreiras]); permitida('cargo',config.cargos);
  if (mudou('cargo') || mudou('perfil')) {if (!opcoes.perfis.includes(n.perfil)) throw new Error('Perfil Profissional incompatível com o cargo.');}
  if (mudou('cargo') || mudou('jornada')) {if (!opcoes.jornadas.includes(n.jornada)) throw new Error('Jornada de Trabalho incompatível com o cargo.');}
  if ((mudou('setor') || mudou('orgao')) && !(SETORES[n.orgao] || []).includes(n.setor)) throw new Error('Selecione uma lotação pertencente ao órgão informado.');
  const dataValida = (data: string) => /^\d{4}-\d{2}-\d{2}$/.test(data) && !Number.isNaN(Date.parse(data)) && new Date(data).toISOString().slice(0,10) === data;
  if (!dataValida(n.inicio) || (n.termino && !dataValida(n.termino))) throw new Error('Informe datas válidas.');
  if (n.termino && n.termino < n.inicio) throw new Error('A Data de Fim do Exercício não pode ser anterior ao início do exercício.');
  if (v.vacanciaData && n.inicio > v.vacanciaData) throw new Error('O início do exercício não pode ser posterior à vacância.');
  if (mudou('termino')) {
    if (!TIPOS_FIM_EXERCICIO.has(v.tipo)) throw new Error('Este vínculo não admite alteração de Data de Fim do Exercício.');
    if (v.vacanciaData) throw new Error('Não é permitido prorrogar um vínculo encerrado.');
    if (!n.termino || (v.termino && n.termino <= v.termino) || !autorizacao.trim()) throw new Error('Informe uma prorrogação e a referência da autorização correspondente.');
  }
  if ((n.observacao || '').length > 500) throw new Error('Observação limitada a 500 caracteres.');
  return n;
}
export function prepararEdicaoVinculo(id: string, novos: Partial<Vinculo>, autorizacao = '') {
  exigirPermissaoVinculo('editar');
  const anterior = encontrar(id), novo = validarEdicao(anterior,novos,autorizacao);
  const mudancas = diferencasVinculo(anterior,novo);
  if (!mudancas.length) throw new Error('Nenhum campo foi modificado.');
  return {anterior,novo,mudancas,versao:assinatura(anterior)};
}
function evento(v: Vinculo, operacao: string, justificativa: string, mudancas: MudancaVinculo[], origem = 'Gestão de Vínculos'): AuditoriaVinculo {
  const usuario = usuarioVinculos();
  return {id:crypto.randomUUID(),vinculoId:v.id,registradoEm:new Date().toISOString(),usuario:usuario?.nome || 'Sistema',login:usuario?.login || 'sistema',operacao,origem,justificativa,mudancas,identificacao:identificacao(v)};
}
function auditoriaComCriacao(v: Vinculo) {
  const estado = lerEstadoAdministrativo();
  if (!v.criacao || estado.auditoria.some(e => e.vinculoId === v.id && e.operacao === 'Criação do Vínculo')) return estado.auditoria;
  const criacao: AuditoriaVinculo = {id:`${v.id}:criacao`,vinculoId:v.id,registradoEm:v.criacao.registradoEm,usuario:v.criacao.responsavel,login:'',operacao:'Criação do Vínculo',origem:'Gestão de Vínculos',justificativa:'Cadastro do vínculo.',identificacao:identificacao(v),mudancas:Object.entries(v.criacao.dados).map(([rotulo,novo]) => ({campo:rotulo,rotulo,anterior:'',novo}))};
  return [...estado.auditoria,criacao];
}
export function confirmarEdicaoVinculo(id: string, novos: Partial<Vinculo>, justificativa: string, versao: string, autorizacao = '', contexto?: {operacao:'Correção de Informações' | 'Alteração automática' | 'Integração';origem:string}) {
  exigirPermissaoVinculo('editar');
  if (!justificativa.trim()) throw new Error('Informe a Justificativa da Alteração.');
  const preparo = prepararEdicaoVinculo(id,novos,autorizacao);
  if (assinatura(preparo.anterior) !== versao) throw new Error('O vínculo foi atualizado por outra operação. Reabra a edição para conferir os dados.');
  const estado = lerEstadoAdministrativo();
  const operacao = contexto?.operacao || (preparo.mudancas.some(m => m.campo === 'termino') ? 'Alteração de Data de Fim do Exercício' : 'Edição Cadastral');
  const motivo = justificativa.trim()+(autorizacao.trim() ? ` — Autorização da prorrogação: ${autorizacao.trim()}` : '');
  persistirEstadoAdministrativo({...estado,alteracoes:{...estado.alteracoes,[id]:preparo.novo},auditoria:[...auditoriaComCriacao(preparo.anterior),evento(preparo.novo,operacao,motivo,preparo.mudancas,contexto?.origem)]});
  return preparo.novo;
}
// A lotação inicial é um dado cadastral, não uma dependência. As referências
// abaixo exigem utilização efetiva do identificador do vínculo.
function referencia(valor: unknown, v: Vinculo, contexto = ''): boolean {
  if (!valor || typeof valor !== 'object') return false;
  if (Array.isArray(valor)) return valor.some(item => referencia(item,v,contexto));
  const r = valor as Record<string,unknown>;
  if (['vinculoId','idVinculo','vinculoOrigemId','vinculoDestinoId'].some(c => r[c] === v.id)) return true;
  if (['vinculoIds','vinculosIds'].some(c => Array.isArray(r[c]) && (r[c] as unknown[]).includes(v.id))) return true;
  if (texto(r.matricula) === v.matricula && ['numeroVinculo','numrVinculo','vinculo'].some(c => texto(r[c]) === v.numero)) return true;
  const tiposEquivalentes: Record<string,string> = {Efetivo:'Nomeado Efetivo',Comissionado:'Exclusivamente Comissionado'};
  if (texto(r.matricula) === v.matricula && texto(r.cpf).replace(/\D/g,'') === v.cpf.replace(/\D/g,'')
    && (tiposEquivalentes[texto(r.tipoVinculo)] || r.tipoVinculo) === v.tipo) return true;
  return Object.entries(r).some(([chave,item]) => (chave === v.id && contexto !== 'cadastro') || referencia(item,v,contexto));
}
export function impedimentosExclusao(id: string): string[] {
  exigirPermissaoVinculo('excluir');
  const v = encontrar(id), motivos = new Set<string>();
  if (moduloDeOrigem(v.tipo)) motivos.add(`Vínculo de origem ${moduloDeOrigem(v.tipo)}: utilize a correção ou retificação do processo de origem antes de excluir o vínculo.`);
  if (v.vacanciaData || v.vacanciaForma) motivos.add('Existe ato de vacância ou encerramento registrado.');
  const controle = controleVagasStore.getState();
  if (referencia(controle.ocupacoes,v)) motivos.add('Efetivo exercício ou ocupação de vaga registrado no Controle de Vagas.');
  if (referencia(controle.movimentacoesFuncionais,v) || referencia(controle.cessoes,v) || referencia(controle.movimentos,v)) motivos.add('Movimentações funcionais, transferências ou alterações de lotação registradas.');
  if (eventosFuncionais.some(e => e.vinculoId === id && e.tipo !== 'Ingresso')) motivos.add('Eventos funcionais posteriores à criação registrados no Histórico Funcional.');
  if (referencia(folhaPagamentoService.listarPessoaLogs(),v)) motivos.add('Lançamento ou processamento de folha de pagamento vinculado à matrícula e ao número do vínculo.');
  const historico = lerEstadoAdministrativo().auditoria.filter(e => e.vinculoId === id);
  if (historico.some(e => e.mudancas.some(m => ['orgao','setor','termino'].includes(m.campo)))) motivos.add('Alteração funcional de lotação ou prorrogação registrada.');
  for (let i=0;i<localStorage.length;i++) {
    const chave = localStorage.key(i)!;
    if (chave === CHAVE_ADMINISTRACAO || chave === 'prototype-vinculos-v2' || !/prototype-|sigep:/.test(chave)) continue;
    const raw = localStorage.getItem(chave);
    if (!raw || !/^[\[{]/.test(raw.trim())) continue;
    let dados: unknown;
    try {dados=JSON.parse(raw);} catch {throw new Error(`Não foi possível conferir as dependências em ${chave}. A exclusão não será realizada.`);}
    if (referencia(dados,v)) {
      const modulo = /folha|pagamento|rubrica/i.test(chave) ? 'Folha de pagamento' : /ferias|licenca|afastamento/i.test(chave) ? 'Férias, licenças ou afastamentos' : /beneficio|aposent|pensao/i.test(chave) ? 'Benefícios, aposentadoria ou pensão' : /social|integrac/i.test(chave) ? 'Integrações externas' : /documento|pasta|ato/i.test(chave) ? 'Documentos ou atos funcionais' : /ingresso|efetivo/i.test(chave) ? 'Processo de Ingresso ou efetivo exercício' : 'Outros registros relacionados';
      motivos.add(`${modulo}: referência associada ao vínculo (${chave}).`);
    }
  }
  return [...motivos];
}
export function excluirVinculo(id: string, justificativa: string) {
  exigirPermissaoVinculo('excluir');
  if (!justificativa.trim()) throw new Error('Informe a Justificativa da Exclusão.');
  const motivos = impedimentosExclusao(id);
  if (motivos.length) throw new Error(motivos.join('\n'));
  const v = encontrar(id), estado = lerEstadoAdministrativo();
  const alteracoes = {...estado.alteracoes}; delete alteracoes[id];
  persistirEstadoAdministrativo({...estado,alteracoes,excluidos:[...estado.excluidos,id],auditoria:[...auditoriaComCriacao(v),evento(v,'Exclusão',justificativa.trim(),[])]});
}
export function consultarAuditoriaVinculos(id?: string) {
  exigirPermissaoVinculo('historico');
  const estado = lerEstadoAdministrativo();
  if (!id || estado.excluidos.includes(id)) exigirPermissaoVinculo('excluir');
  const eventos = estado.auditoria.filter(e => !id || e.vinculoId === id);
  for (const v of todos().filter(v => (!id || v.id === id) && v.criacao)) {
    if (eventos.some(e => e.vinculoId === v.id && e.operacao === 'Criação do Vínculo')) continue;
    eventos.push({id:`${v.id}:criacao`,vinculoId:v.id,registradoEm:v.criacao!.registradoEm,usuario:v.criacao!.responsavel,login:'',operacao:'Criação do Vínculo',origem:'Gestão de Vínculos',justificativa:'Cadastro do vínculo.',identificacao:identificacao(v),mudancas:Object.entries(v.criacao!.dados).map(([rotulo,novo]) => ({campo:rotulo,rotulo,anterior:'',novo}))});
  }
  return eventos.reverse().sort((a,b) => b.registradoEm.localeCompare(a.registradoEm));
}
