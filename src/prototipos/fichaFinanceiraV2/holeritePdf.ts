import { jsPDF } from "jspdf";

export type CampoHolerite = { label: string; valor?: string };
export type HoleriteDados = {
  nome: string; cpf: string; competencia: string; folha: string; descricaoFolha: string;
  vinculo?: string; tipoFolha?: string; orgao?: string; campos: CampoHolerite[];
  rubricas: { codigo: string; descricao: string; complemento?: string; competencia?: string; vantagem?: number; desconto?: number; auxiliares?: string }[];
  vantagens: number; descontos: number; liquido: number; observacoes?: string[];
  simulacao: boolean; emissao?: Date; brasao?: string;
  validacao?: { codigo: string; qrCode?: string };
};
const texto = (s: string) => s.replace(/[\u2010-\u2015\u2212]/g, "-").replace(/\u00a0/g, " ");
const dinheiro = (n: number) => texto(n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}));
const seguro = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9\s_-]/g, "").trim().replace(/[\s_-]+/g, "_");
export function nomeArquivoHolerite(d: Pick<HoleriteDados,"nome"|"competencia"|"folha"|"vinculo">) {
  const nome=seguro(d.nome).toLowerCase().replace(/(?:^|_)[a-z]/g,c=>c.toUpperCase());
  const competencia=d.competencia.replace("/","-");
  const folha=d.folha.replace(/^0+(?=\d)/, "").padStart(2,"0");
  const vinculo=d.vinculo ? "_"+seguro(d.vinculo.replace("/","-")).replaceAll("_","-") : "";
  return `Holerite_${nome}_${competencia}_F${folha}${vinculo}.pdf`;
}
export function gerarHoleritePdf(d: HoleriteDados) {
  const pdf=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const nome=nomeArquivoHolerite(d);
  pdf.setProperties({title:nome,subject:"Holerite SIGEP",author:"SIGEP",creator:"SIGEP"});
  const esquerda=14, largura=182, limite=268;
  let y=0;
  const escrita=(s:string,x:number,linha:number,tamanho=9,negrito=false,align:"left"|"right"|"center"="left")=>{
    pdf.setFont("helvetica",negrito?"bold":"normal");pdf.setFontSize(tamanho);pdf.setTextColor(35);pdf.text(texto(s),x,linha,{align});
  };
  const linhas=(s:string,w:number,size=8.5):string[]=>{pdf.setFont("helvetica","normal");pdf.setFontSize(size);return pdf.splitTextToSize(texto(s),w);};
  const cabecalho=()=>{
    const x=d.brasao ? 36 : esquerda;
    if(d.brasao)pdf.addImage(d.brasao,"PNG",14,12,18,18);
    escrita("GOVERNO DO ESTADO DE MATO GROSSO",x,17,9,true);
    escrita("Sistema Inteligente de Gestão de Pessoas e Folha de Pagamento",x,22,7);
    if(d.orgao)pdf.text(linhas(d.orgao,118,7),x,27);
    escrita("HOLERITE",105,40,15,true,"center");
    if(d.simulacao)escrita("PROTÓTIPO - DADOS SIMULADOS - SEM VALIDADE OFICIAL",105,46,7,true,"center");
    escrita(`Competência: ${d.competencia}`,esquerda,54,9,true);
    escrita(`Folha: ${d.folha} - ${d.descricaoFolha}`,75,54,8.5);
    if(d.tipoFolha)escrita(`Tipo: ${d.tipoFolha}`,esquerda,60,8);
    pdf.setDrawColor(190);pdf.setLineWidth(.2);pdf.line(esquerda,63,196,63);y=70;
  };
  const novaPagina=()=>{pdf.addPage();cabecalho();};
  const garantir=(h:number)=>{if(y+h>limite)novaPagina();};
  const titulo=(s:string)=>{garantir(12);pdf.setFillColor(241);pdf.rect(esquerda,y,largura,7,"F");escrita(s,17,y+4.8,9,true);y+=11;};
  cabecalho();
  titulo("IDENTIFICAÇÃO DO SERVIDOR / BENEFICIÁRIO");
  const campos:CampoHolerite[]=[{label:"Nome",valor:d.nome},{label:"CPF",valor:d.cpf},...(d.vinculo?[{label:"Matrícula / Vínculo",valor:d.vinculo}]:[]),...d.campos].filter(c=>c.valor?.trim());
  // Campos opcionais são removidos antes de distribuir a grade, sem reservar lacunas.
  for(let i=0;i<campos.length;i+=2){
    const par=campos.slice(i,i+2);const valores=par.map(c=>linhas(c.valor!,84));const h=Math.max(...valores.map(v=>v.length))*4+8;
    garantir(h);
    par.forEach((c,j)=>{const x=esquerda+j*93;escrita(c.label,x,y,7);pdf.setFontSize(8.5);pdf.setFont("helvetica","bold");pdf.text(valores[j],x,y+5);});
    y+=h;
  }
  const colunas=[{nome:"Rubrica",w:53},{nome:"Complemento",w:29},{nome:"Competência",w:24},{nome:"Vantagens",w:27},{nome:"Descontos",w:27},{nome:"Auxiliares",w:22}];
  const tabelaCabecalho=()=>{pdf.setFillColor(238);pdf.setDrawColor(190);pdf.rect(esquerda,y,largura,9,"FD");let x=esquerda;colunas.forEach(c=>{escrita(c.nome,x+2,y+5.7,7.5,true);x+=c.w;});y+=9;};
  garantir(30);titulo("DEMONSTRATIVO FINANCEIRO");tabelaCabecalho();
  for(const r of d.rubricas){
    const celulas=[`${r.codigo} - ${r.descricao}`,r.complemento||"-",r.competencia||d.competencia,r.vantagem===undefined?"-":dinheiro(r.vantagem),r.desconto===undefined?"-":dinheiro(r.desconto),r.auxiliares||"-"];
    const conteudos=celulas.map((c,i)=>linhas(c,colunas[i].w-4,7.5));const h=Math.max(10,...conteudos.map(c=>c.length*3.7+5));
    if(y+h>limite){novaPagina();tabelaCabecalho();}
    let x=esquerda;
    conteudos.forEach((c,i)=>{pdf.setDrawColor(215);pdf.rect(x,y,colunas[i].w,h);pdf.setFont("helvetica","normal");pdf.setFontSize(7.5);pdf.text(c,i===3||i===4?x+colunas[i].w-2:x+2,y+5,{align:i===3||i===4?"right":"left"});x+=colunas[i].w;});y+=h;
  }
  garantir(25);y+=5;
  [{label:"TOTAL DE VANTAGENS",v:d.vantagens},{label:"TOTAL DE DESCONTOS",v:d.descontos},{label:"VALOR LÍQUIDO",v:d.liquido}].forEach((c,i)=>{
    const x=esquerda+i*largura/3;pdf.setFillColor(244);pdf.setDrawColor(190);pdf.rect(x,y,largura/3,19,"FD");escrita(c.label,x+3,y+6,7,true);escrita(dinheiro(c.v),x+largura/3-3,y+14,11,true,"right");
  });y+=26;
  if(d.observacoes?.length){titulo("OBSERVAÇÕES");for(const o of d.observacoes){const ls=linhas(o,largura);garantir(ls.length*4+5);pdf.setFontSize(8.5);pdf.setFont("helvetica","normal");pdf.text(ls,esquerda,y);y+=ls.length*4+5;}}
  garantir(d.validacao?.qrCode ? 35 : d.validacao?.codigo ? 25 : 15);pdf.setDrawColor(190);pdf.line(esquerda,y,196,y);y+=7;
  if(d.validacao?.codigo){
    escrita(`Código de validação: ${d.validacao.codigo}`,esquerda,y,8);y+=6;
    const autenticidade=linhas("A autenticidade deste documento poderá ser verificada por meio do código de validação ou QR Code disponibilizado neste holerite.",d.validacao.qrCode?150:largura,7);
    pdf.setFontSize(7);pdf.text(autenticidade,esquerda,y);
    if(d.validacao.qrCode)pdf.addImage(d.validacao.qrCode,"PNG",174,y-10,22,22);
  } else escrita(d.simulacao?"Autenticação indisponível no protótipo. Documento sem validade oficial.":"Serviço de validação não disponibilizado para este documento.",esquerda,y,7);
  const total=pdf.getNumberOfPages();const emissao=d.emissao??new Date();
  const data=emissao.toLocaleString("pt-BR",{timeZone:"America/Cuiaba",dateStyle:"short",timeStyle:"short"});
  for(let pagina=1;pagina<=total;pagina++){
    pdf.setPage(pagina);escrita(`Emissão: ${data}`,196,12,7,false,"right");escrita(`Página ${pagina} de ${total}`,196,17,7,false,"right");
    pdf.setDrawColor(190);pdf.line(esquerda,278,196,278);
    escrita("Holerite emitido pelo Sistema Inteligente de Gestão de Pessoas",105,283,7,false,"center");
    escrita("e Folha de Pagamento - SIGEP.",105,287,7,false,"center");
  }
  return {pdf,nome};
}
