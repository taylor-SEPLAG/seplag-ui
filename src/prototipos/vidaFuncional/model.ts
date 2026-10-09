export interface Pessoa { id: string; nome: string; cpf: string; nascimento: string }
export interface Vinculo { id: string; pessoaId: string; matricula: string; numero: number; tipo: string; cargo: string; orgao: string; unidade: string; inicio: string; fim?: string; classificacao: 'Ativo' | 'Inativo' | 'Falecido' | 'Extinto'; relacionadoId?: string }
export interface Evento { id: string; vinculoId: string; data: string; tipo: string; titulo: string; descricao: string; origem: string; responsavel: string; registradoEm: string; documento: string; secoes: Record<string, Record<string, string>> }
export const pessoas: Pessoa[] = [
  { id: '1', nome: 'Ana Paula Ribeiro', cpf: '000.000.001-00', nascimento: '1986-05-12' },
  { id: '2', nome: 'Carlos Eduardo Martins', cpf: '000.000.002-00', nascimento: '1961-03-21' },
  { id: '3', nome: 'Mariana Alves de Souza', cpf: '000.000.003-00', nascimento: '1990-08-17' },
  { id: '4', nome: 'José Antônio Ferreira', cpf: '000.000.004-00', nascimento: '1972-11-09' },
  { id: '5', nome: 'Beatriz Costa Lima', cpf: '000.000.005-00', nascimento: '1993-02-04' },
  { id: '6', nome: 'Rafael Oliveira Santos', cpf: '000.000.006-00', nascimento: '1984-07-19' },
];
export const vinculos: Vinculo[] = [
  { id: 'ana-1', pessoaId: '1', matricula: '327305', numero: 1, tipo: 'Nomeado Efetivo', cargo: 'Analista Administrativo / Coordenadora', orgao: 'SEPLAG', unidade: 'Superintendência de Gestão de Pessoas', inicio: '2018-03-15', classificacao: 'Ativo' },
  { id: 'carlos-1', pessoaId: '2', matricula: '128450', numero: 1, tipo: 'Nomeado Efetivo', cargo: 'Analista Administrativo', orgao: 'SEPLAG', unidade: 'Coordenadoria de Administração', inicio: '1995-02-01', fim: '2025-06-30', classificacao: 'Inativo', relacionadoId: 'carlos-2' },
  { id: 'carlos-2', pessoaId: '2', matricula: '128450', numero: 2, tipo: 'Aposentado', cargo: 'Analista Administrativo', orgao: 'MTPREV', unidade: 'Gestão de Benefícios', inicio: '2025-07-01', classificacao: 'Inativo', relacionadoId: 'carlos-1' },
  { id: 'mariana-1', pessoaId: '3', matricula: '418920', numero: 1, tipo: 'Contrato Temporário', cargo: 'Técnica de Enfermagem', orgao: 'SES', unidade: 'Hospital Regional', inicio: '2020-03-02', fim: '2022-03-01', classificacao: 'Extinto' },
  { id: 'mariana-2', pessoaId: '3', matricula: '529140', numero: 2, tipo: 'Nomeado Efetivo', cargo: 'Enfermeira', orgao: 'SES', unidade: 'Hospital Regional', inicio: '2023-04-10', classificacao: 'Ativo' },
  { id: 'jose-1', pessoaId: '4', matricula: '215670', numero: 1, tipo: 'Nomeado Efetivo', cargo: 'Professor', orgao: 'SEDUC', unidade: 'Escola Estadual Cuiabá', inicio: '2005-02-07', fim: '2024-11-20', classificacao: 'Falecido' },
  { id: 'beatriz-1', pessoaId: '5', matricula: '630218', numero: 1, tipo: 'Contrato Temporário', cargo: 'Professora', orgao: 'SEDUC', unidade: 'Escola Estadual Várzea Grande', inicio: '2025-02-03', classificacao: 'Ativo' },
  { id: 'rafael-1', pessoaId: '6', matricula: '372891', numero: 1, tipo: 'Nomeado Comissionado', cargo: 'Assessor Técnico', orgao: 'SEFAZ', unidade: 'Gabinete', inicio: '2022-01-10', fim: '2025-12-31', classificacao: 'Extinto' },
];
export const dataBR = (data?: string) => data ? data.slice(0, 10).split('-').reverse().join('/') : '—';
export const situacao = (v: Vinculo) => v.fim ? 'Encerrado' : 'Vigente';
const evento = (v: Vinculo, tipo: string, data: string, titulo: string, origem: string, secoes: Evento['secoes'], registradoEm = `${data}T10:30:00`): Evento => ({ id: `${v.id}-${tipo}-${data}`, vinculoId: v.id, data, tipo, titulo, descricao: titulo, origem, secoes, responsavel: 'Luciana Mendes • Gestão de Pessoas', registradoEm, documento: `Ato demonstrativo ${data.slice(0, 4)}/${v.matricula}-${tipo}` });
export const eventos: Evento[] = vinculos.flatMap(v => {
  const aposentado = v.tipo === 'Aposentado';
  const lista = [evento(v, 'Ingresso', v.inicio, aposentado ? 'Criação do vínculo de aposentado' : 'Ingresso no serviço público', aposentado ? 'Aposentadoria e Benefícios' : 'Gestão de Ingresso', {
    'Dados do Ingresso': { 'Número do ingresso': `${v.inicio.slice(0, 4)}/${v.matricula}`, 'Meio de ingresso': aposentado ? 'Aposentadoria' : v.tipo === 'Contrato Temporário' ? 'Processo Seletivo' : v.tipo === 'Nomeado Comissionado' ? 'Nomeação' : 'Concurso', ...(!aposentado && v.tipo === 'Nomeado Efetivo' ? { 'Edital': `Edital 001/${Number(v.inicio.slice(0, 4)) - 1}`, 'Classificação no certame': '12º lugar' } : {}), 'Tipo de vínculo': v.tipo, 'Cargo/Função': v.id === 'ana-1' ? 'Analista Administrativo' : v.cargo, 'Situação do ingresso': 'Concluído' },
    'Dados Funcionais': { 'Matrícula': v.matricula, 'Número do vínculo': String(v.numero), 'Órgão/Entidade': v.orgao, 'Unidade de lotação': v.unidade, 'Jornada': aposentado ? 'Sem jornada de exercício' : v.id === 'ana-1' ? '30 horas semanais' : '40 horas semanais', 'Referência': 'B-2', ...(!aposentado && v.tipo === 'Nomeado Efetivo' ? { 'Data da posse': dataBR(v.inicio) } : {}), 'Data de início do efetivo exercício': dataBR(v.inicio), ...(aposentado ? { 'Origem do novo vínculo': 'Aposentadoria do vínculo efetivo', 'Vínculo anterior': `${v.matricula} / 1` } : {}) },
  })];
  if (v.id === 'ana-1') lista.push(
    evento(v, 'Movimentação', '2019-08-20', 'Alteração da unidade de lotação', 'Movimentações Funcionais', { 'Dados da Movimentação': { 'Tipo de movimentação': 'Remoção', 'Motivo': 'Interesse da administração', 'Data da movimentação': '20/08/2019', 'Data de vigência': '20/08/2019' }, 'Origem': { 'Órgão/Entidade anterior': 'SEPLAG', 'Unidade anterior': 'Coordenadoria de Administração', 'Cargo/Função anterior': 'Analista Administrativo', 'Referência anterior': 'B-2' }, 'Destino': { 'Órgão/Entidade destino': 'SEPLAG', 'Unidade destino': v.unidade, 'Cargo/Função atual': 'Analista Administrativo', 'Referência atual': 'B-2' } }),
    evento(v, 'Férias', '2021-01-05', 'Concessão de férias — 30 dias', 'Férias', { 'Dados das Férias': { 'Período aquisitivo': '15/03/2019 a 14/03/2020', 'Data de início': '05/01/2021', 'Data de término': '03/02/2021', 'Quantidade de dias': '30', 'Situação das férias': 'Concluídas' } }),
    evento(v, 'Licença', '2022-07-12', 'Licença para tratamento de saúde', 'Licenças e Afastamentos', { 'Dados da Licença': { 'Tipo de licença ou afastamento': 'Tratamento de saúde', 'Motivo': 'Afastamento autorizado por perícia', 'Data de início': '12/07/2022', 'Data de término': '26/07/2022', 'Quantidade de dias': '15', 'Situação': 'Concluída', 'Documento comprobatório': 'Laudo demonstrativo 2022/015' } }),
    evento(v, 'Retorno ao exercício', '2022-07-27', 'Retorno ao efetivo exercício', 'Licenças e Afastamentos', { 'Dados do Retorno': { 'Tipo de retorno': 'Retorno de licença', 'Data do retorno': '27/07/2022', 'Ocorrência de origem': 'Licença de 12/07/2022', 'Situação funcional anterior': 'Em licença', 'Situação funcional posterior': 'Em exercício', 'Órgão/Entidade': v.orgao, 'Unidade de retorno': v.unidade } }),
    evento(v, 'Progressão funcional', '2024-04-01', 'Referência B-2 para B-3', 'Progressões e Promoções', { 'Dados da Progressão': { 'Tipo de alteração funcional': 'Progressão horizontal', 'Cargo/Função': v.id === 'ana-1' ? 'Analista Administrativo' : v.cargo, 'Carreira': 'Gestão Governamental', 'Classe anterior': 'B', 'Classe atual': 'B', 'Referência anterior': 'B-2', 'Nova referência': 'B-3', 'Data de vigência': '01/04/2024' } }, '2024-05-14T14:20:00'),
    evento(v, 'Férias', '2026-02-10', 'Concessão de férias — 30 dias', 'Férias', { 'Dados das Férias': { 'Período aquisitivo': '15/03/2024 a 14/03/2025', 'Data de início': '10/02/2026', 'Data de término': '11/03/2026', 'Quantidade de dias': '30', 'Situação das férias': 'Concluídas' } }),
    evento(v, 'Alteração de jornada', '2026-10-01', 'Jornada de 30 para 40 horas semanais', 'Alterações Funcionais', { 'Dados da Jornada': { 'Jornada anterior': '30 horas semanais', 'Nova jornada': '40 horas semanais', 'Data de vigência': '01/10/2026', 'Motivo': 'Adequação da jornada' } }),
    evento(v, 'Alteração de cargo/função', '2026-10-01', 'Designação para função de coordenação', 'Alterações Funcionais', { 'Dados do Cargo/Função': { 'Cargo/Função anterior': 'Analista Administrativo', 'Novo Cargo/Função': 'Analista Administrativo / Coordenadora', 'Data de vigência': '01/10/2026', 'Motivo': 'Designação para função de confiança' } }),
  );
  if (v.fim) lista.push(evento(v, 'Encerramento', v.fim, v.relacionadoId ? 'Aposentadoria e encerramento do vínculo efetivo' : v.classificacao === 'Falecido' ? 'Encerramento por falecimento' : 'Encerramento do vínculo', 'Encerramento de Vínculos', { 'Dados do Encerramento': { 'Tipo de encerramento': v.relacionadoId ? 'Aposentadoria' : v.classificacao === 'Falecido' ? 'Falecimento' : v.tipo === 'Contrato Temporário' ? 'Término do contrato' : 'Exoneração', 'Motivo': v.relacionadoId ? 'Concessão de aposentadoria' : 'Conclusão do vínculo funcional', 'Data do encerramento': dataBR(v.fim), 'Classificação anterior': 'Ativo', 'Classificação final': v.classificacao, 'Situação anterior': 'Vigente', 'Situação final': 'Encerrado', 'Justificativa/Observações': 'Histórico integralmente preservado.', ...(v.relacionadoId ? { 'Novo vínculo de Aposentado': `${v.matricula} / 2 — início em 01/07/2025` } : {}) } }));
  return lista;
});
export interface Filtros { nome: string; cpf: string; matricula: string; tipo: string; situacao: string }
export const filtrosVazios: Filtros = { nome: '', cpf: '', matricula: '', tipo: '', situacao: '' };
const normalizar = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function pesquisarPessoas(f: Filtros) {
  return pessoas.filter(p => normalizar(p.nome).includes(normalizar(f.nome.trim())) && p.cpf.replace(/\D/g, '').includes(f.cpf.replace(/\D/g, '')) && vinculos.some(v => v.pessoaId === p.id && v.matricula.includes(f.matricula.trim()) && (!f.tipo || v.tipo === f.tipo) && (!f.situacao || situacao(v) === f.situacao)));
}
export function pesquisarEventos(vinculoId: string, tipo = '', inicio = '', fim = '', antigo = false) {
  return eventos.filter(e => e.vinculoId === vinculoId && (!tipo || e.tipo === tipo) && (!inicio || e.data >= inicio) && (!fim || e.data <= fim)).sort((a, b) => (antigo ? 1 : -1) * a.data.localeCompare(b.data) || a.id.localeCompare(b.id));
}
export function indicadores(hoje = new Date()) {
  const mes = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Cuiaba', year: 'numeric', month: '2-digit' }).formatToParts(hoje);
  const prefixo = `${mes.find(p => p.type === 'year')?.value}-${mes.find(p => p.type === 'month')?.value}`;
  return [pessoas.filter(p => vinculos.some(v => v.pessoaId === p.id)).length, vinculos.filter(v => !v.fim).length, vinculos.filter(v => v.fim).length, eventos.filter(e => e.data.startsWith(prefixo)).length];
}
