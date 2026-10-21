import { jsPDF } from 'jspdf';
import { dataBR, situacao, type Pessoa, type Vinculo, type Evento } from './model';
import logoUrl from '../../assets/img/logo-seplag-documento.png';

type Secoes = Record<string, Record<string, string>>;
const azul = '#093565', texto = '#172539', cinza = '#596E89', borda = '#CCD8E6';
const normalizar = (s: string) => s.replace(/→|➔/g, ' > ').replace(/\u202f/g, ' ');

/** PDF A4 com tabelas vetoriais e texto selecionável. */
export function criarHistoricoPdf(pessoa: Pessoa, vinculo: Vinculo, eventos: Evento[], detalhes: (evento: Evento) => Secoes, logo?: string, agora = new Date()) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const x = 18, largura = 174, limite = 274;
  let y = 17;
  let inicioBloco: number | null = null;
  const escrever = (s: string, px: number, py: number, tamanho = 9, negrito = false, cor = texto) => {
    pdf.setFont('helvetica', negrito ? 'bold' : 'normal');
    pdf.setFontSize(tamanho); pdf.setTextColor(cor);
    pdf.text(normalizar(s), px, py);
  };
  const linhas = (s: string, w: number, tamanho = 9, negrito = false): string[] => {
    pdf.setFont('helvetica', negrito ? 'bold' : 'normal'); pdf.setFontSize(tamanho);
    return pdf.splitTextToSize(normalizar(s || '—'), w);
  };
  const regra = (py: number) => { pdf.setDrawColor(borda); pdf.setLineWidth(.2); pdf.line(x, py, x + largura, py); };
  const secao = (titulo: string) => {
    escrever(titulo, x, y, 10, true, azul);
    const fimTitulo = x + pdf.getTextWidth(titulo) + 3;
    pdf.setDrawColor(borda); pdf.setLineWidth(.2);
    if (fimTitulo < x + largura) pdf.line(fimTitulo, y - 1, x + largura, y - 1);
    y += 5;
  };
  const fecharBloco = () => {
    if (inicioBloco === null) return;
    pdf.setDrawColor(borda); pdf.setLineWidth(.2);
    pdf.roundedRect(x, inicioBloco, largura, y - inicioBloco, 1.5, 1.5, 'S');
    inicioBloco = null;
  };
  const novaPagina = () => { fecharBloco(); pdf.addPage(); y = 20; secao('HISTÓRICO DE OCORRÊNCIAS (CONTINUAÇÃO)'); };
  const reservar = (h: number) => { if (y + h > limite) novaPagina(); };
  const tag = (valor: string, px: number, py: number, vermelho = true, tamanho = 8) => {
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(tamanho);
    const w = pdf.getTextWidth(valor) + 5;
    pdf.setDrawColor(vermelho ? '#FFBFC3' : borda); pdf.setFillColor(vermelho ? '#FFF5F5' : '#FFFFFF');
    pdf.roundedRect(px, py - 3.5, w, 5.5, .8, .8, 'FD');
    escrever(valor, px + 2.5, py, tamanho, true, vermelho ? '#B42323' : azul);
  };
  if (logo) {
    const imagem = pdf.getImageProperties(logo);
    const w = 43; pdf.addImage(logo, 'PNG', x, y, w, w * imagem.height / imagem.width);
  }
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(15); pdf.setTextColor(azul);
  pdf.text('SIGEP', x + largura, y + 6, { align: 'right' });
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(cinza);
  pdf.text('Histórico da Vida Funcional', x + largura, y + 12, { align: 'right' });
  y += 16; pdf.setDrawColor(azul); pdf.setLineWidth(.5); pdf.line(x, y, 192, y); y += 8;
  secao('IDENTIFICAÇÃO DO SERVIDOR E DO VÍNCULO');
  const inicioResumo = y;
  pdf.setFillColor('#F7F9FB'); pdf.setDrawColor(borda);
  // A altura é calculada antes de desenhar para acomodar nomes e unidades extensos.
  const resumo = [
    [['NOME DO SERVIDOR', pessoa.nome, 2], ['CPF', pessoa.cpf, 1]],
    [['MATRÍCULA', vinculo.matricula, 1], ['Nº DO VÍNCULO', String(vinculo.numero), 1], ['TIPO DE VÍNCULO', vinculo.tipo, 1], ['SITUAÇÃO', situacao(vinculo), 1]],
    [['ÓRGÃO / ENTIDADE', vinculo.orgao, 1], ['UNIDADE ADMINISTRATIVA', vinculo.unidade, 2]],
    [['CARGO / FUNÇÃO', vinculo.cargo, 2], ['PERÍODO DE VIGÊNCIA', `${dataBR(vinculo.inicio)} a ${vinculo.fim ? dataBR(vinculo.fim) : 'Atual'}`, 1]],
  ] as [string, string, number][][];
  const alturas = resumo.map(row => Math.max(...row.map(([, v, span]) => linhas(v, (largura - 12) * span / row.reduce((n, c) => n + c[2], 0) - 4, 9, true).length)) * 4 + 7);
  pdf.roundedRect(x, y, largura, alturas.reduce((a, b) => a + b, 0) + 4, 1.5, 1.5, 'FD');
  y += 6;
  resumo.forEach((row, i) => {
    let px = x + 4; const total = row.reduce((n, c) => n + c[2], 0);
    row.forEach(([label, valor, span]) => {
      const w = (largura - 8) * span / total;
      escrever(label, px, y, 6.7, true, cinza);
      if (label === 'SITUAÇÃO') tag(valor, px, y + 5);
      else linhas(valor, w - 5, 9, true).forEach((l, j) => escrever(l, px, y + 5 + j * 4, 9, true));
      px += w;
    });
    y += alturas[i];
    if (i < 2) {
      pdf.setDrawColor(borda); pdf.setLineWidth(.2);
      pdf.line(x + 4, y - 3, x + largura - 4, y - 3);
    }
  });
  y = inicioResumo + alturas.reduce((a, b) => a + b, 0) + 12;
  secao('HISTÓRICO DE OCORRÊNCIAS');

  const cabecalhoEvento = (evento: Evento, continuacao = false) => {
    const titulo = `${dataBR(evento.data)} — ${evento.titulo}${continuacao ? ' (continuação)' : ''}`;
    const ls = linhas(titulo, largura - 38, 9, true), h = ls.length * 4 + 6;
    reservar(h + 19);
    inicioBloco = y;
    pdf.setFillColor(evento.tipo === 'Encerramento' ? '#FFF2F3' : '#F1F5FA');
    pdf.setDrawColor(borda); pdf.rect(x, y, largura, h, 'FD');
    ls.forEach((l, i) => escrever(l, x + 4, y + 6 + i * 4, 9, true, evento.tipo === 'Encerramento' ? '#B42323' : texto));
    tag(dataBR(evento.data), x + largura - 27, y + 6, evento.tipo === 'Encerramento');
    y += h + 4;
  };
  const tabela = (evento: Evento, titulo: string, campos: Record<string, string>) => {
    const entradas = Object.entries(campos);
    if (!entradas.length) return;
    const tituloTabela = () => {
      if (titulo !== 'Dados do Encerramento') {
        escrever(titulo.toLocaleUpperCase('pt-BR'), x + 4, y + 3, 7.5, true, azul); y += 6;
      }
      pdf.setFillColor('#F7F9FB'); pdf.rect(x + 4, y, largura - 8, 7, 'F');
      escrever('CAMPO', x + 6, y + 4.7, 7, true, cinza);
      escrever('INFORMAÇÃO DO REGISTRO', x + 64, y + 4.7, 7, true, cinza); y += 7;
    };
    if (y + 26 > limite) { novaPagina(); cabecalhoEvento(evento, true); }
    tituloTabela();
    entradas.forEach(([campo, valor]) => {
      const labels = linhas(campo, 54, 8, true), valores = linhas(valor, largura - 72, 8);
      const quantidade = Math.max(labels.length, valores.length);
      let indice = 0;
      while (indice < quantidade) {
        if (y + 8 > limite) { novaPagina(); cabecalhoEvento(evento, true); tituloTabela(); }
        const cabem = Math.max(1, Math.min(quantidade - indice, Math.floor((limite - y - 4) / 4)));
        for (let i = 0; i < cabem; i++) {
          if (labels[indice + i]) escrever(labels[indice + i], x + 6, y + 5 + i * 4, 8, true, cinza);
          if (valores[indice + i]) escrever(valores[indice + i], x + 64, y + 5 + i * 4, 8);
        }
        y += cabem * 4 + 2.5;
        pdf.setDrawColor(borda); pdf.setLineWidth(.15); pdf.line(x + 4, y, x + largura - 4, y);
        indice += cabem;
      }
    });
    y += 4;
  };
  const tabelaPeriodo = (evento: Evento, campos: Record<string, string>, ferias: boolean) => {
    const colunas = ferias ? [
      ['PERÍODO AQUISITIVO', campos['Período aquisitivo'] || '—', 42],
      ['PERÍODO DE GOZO', `${campos['Data de início'] || '—'} a ${campos['Data de término'] || '—'}`, 50],
      ['DURAÇÃO', `${campos['Quantidade de dias'] || '—'} dias`, 32],
      ['SITUAÇÃO', campos['Situação das férias'] || '—', 42],
    ] : [
      ['TIPO / MOTIVO', [campos['Tipo de licença ou afastamento'], campos.Motivo].filter(Boolean).join('\n') || '—', 50],
      ['PERÍODO', `${campos['Data de início'] || '—'} a ${campos['Data de término'] || '—'}`, 50],
      ['DURAÇÃO', `${campos['Quantidade de dias'] || '—'} dias`, 28],
      ['SITUAÇÃO', campos.Situação || '—', 38],
    ];
    const conteudo = colunas.map(([, v, w]) => linhas(String(v), Number(w) - 3, 8));
    const altura = Math.max(...conteudo.map(v => v.length)) * 4 + 11;
    if (y + altura > limite) { novaPagina(); cabecalhoEvento(evento, true); }
    pdf.setFillColor('#F7F9FB'); pdf.rect(x + 4, y, largura - 8, 7, 'F');
    let px = x + 6;
    colunas.forEach(([label, , w], i) => {
      escrever(String(label), px, y + 4.7, 6.5, true, cinza);
      if (label === 'SITUAÇÃO') tag(String(colunas[i][1]), px, y + 12);
      else conteudo[i].forEach((l, j) => escrever(l, px, y + 12 + j * 4, 8));
      px += Number(w);
    });
    y += altura + 2; regra(y); y += 4;
    const consumidos = ferias
      ? ['Período aquisitivo', 'Data de início', 'Data de término', 'Quantidade de dias', 'Situação das férias']
      : ['Tipo de licença ou afastamento', 'Motivo', 'Data de início', 'Data de término', 'Quantidade de dias', 'Situação'];
    tabela(evento, 'Informações adicionais', Object.fromEntries(Object.entries(campos).filter(([k]) => !consumidos.includes(k))));
  };
  eventos.forEach(evento => {
    reservar(65); cabecalhoEvento(evento);
    const secoes = detalhes(evento);
    Object.entries(secoes).filter(([titulo]) => titulo !== 'Registro da ocorrência' && titulo !== 'Origem e Registro').forEach(([titulo, campos]) => {
      if ((evento.tipo === 'Férias' && titulo === 'Dados das Férias') || (evento.tipo === 'Licença' && titulo === 'Dados da Licença')) {
        tabelaPeriodo(evento, campos, evento.tipo === 'Férias');
      } else if (evento.tipo === 'Encerramento' && titulo === 'Dados do Encerramento') {
        const dados = { ...campos };
        if (dados['Situação anterior'] && dados['Situação final']) {
          dados['Alteração de Situação'] = `${dados['Situação anterior']} > ${dados['Situação final']} (em ${dados['Data do encerramento'] || dataBR(evento.data)})`;
          delete dados['Situação anterior']; delete dados['Situação final']; delete dados['Data do encerramento'];
        }
        tabela(evento, titulo, dados);
      } else tabela(evento, titulo, campos);
    });
    const origem = secoes['Origem e Registro'];
    if (origem) tabela(evento, 'Origem', Object.fromEntries(Object.entries(origem).filter(([k]) => !['Data/hora do registro', 'Responsável'].includes(k))));
    const registro = `Registro da Ocorrência: ${dataBR(evento.registradoEm)} às ${evento.registradoEm.slice(11, 19) || '—'}`;
    const responsavel = linhas(`Responsável: ${evento.responsavel || '—'}`, 81, 6.5);
    if (y + 8 + responsavel.length * 3 > limite) { novaPagina(); cabecalhoEvento(evento, true); }
    pdf.setDrawColor(borda); pdf.setLineDashPattern([.6, .5], 0);
    pdf.line(x + 4, y, x + largura - 4, y); pdf.setLineDashPattern([], 0);
    escrever(registro, x + 4, y + 5, 6.5, false, cinza);
    responsavel.forEach((l, i) => {
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(6.5); pdf.setTextColor(cinza);
      pdf.text(l, x + largura - 4, y + 5 + i * 3, { align: 'right' });
    });
    y += 8 + (responsavel.length - 1) * 3;
    fecharBloco(); y += 4;
  });
  if (!eventos.length) escrever('Nenhuma ocorrência registrada para este vínculo.', x + 4, y + 5);
  const download = agora.toLocaleString('pt-BR', { timeZone: 'America/Cuiaba' }).replace(', ', ' às ');
  const paginas = pdf.getNumberOfPages();
  for (let n = 1; n <= paginas; n++) {
    pdf.setPage(n); regra(282);
    escrever(`SIGEP • ${vinculo.orgao} / SEPLAG - MT`, x, 288, 7, false, cinza);
    escrever(`Data do Download: ${download}`, 84, 288, 7, false, cinza);
    escrever(`Página ${n} de ${paginas}`, 173, 288, 7, false, cinza);
  }
  pdf.setProperties({ title: 'SIGEP - Histórico da Vida Funcional', subject: `${pessoa.nome} - ${vinculo.matricula} / ${vinculo.numero}`, author: 'SIGEP / SEPLAG - MT' });
  return pdf;
}

export async function exportarHistoricoPdf(pessoa: Pessoa, vinculo: Vinculo, eventos: Evento[], detalhes: (evento: Evento) => Secoes) {
  const resposta = await fetch(logoUrl);
  if (!resposta.ok) throw new Error('Não foi possível carregar o cabeçalho do documento.');
  const blob = await resposta.blob();
  const logo = await new Promise<string>((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(String(leitor.result)); leitor.onerror = () => reject(leitor.error);
    leitor.readAsDataURL(blob);
  });
  const nomePessoa = pessoa.nome.trim().replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_');
  criarHistoricoPdf(pessoa, vinculo, eventos, detalhes, logo).save(`Historico_Funcional_${nomePessoa}.pdf`);
}
