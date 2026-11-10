export type GrupoPorCompetencia = { id:number; situacao:string; inicioVigencia:string; fimVigencia:string; versao?:number; competencia?:string; responsavel?:string };
export type DadosGrupos<T extends GrupoPorCompetencia> = { grupos:T[]; versoes:Record<number,T[]> };
const chave="sigep:grupos-calculo:competencias:v1";
const clonar=<T,>(valor:T):T=>JSON.parse(JSON.stringify(valor));
const data=(v:string)=>/^\d{2}\/\d{2}\/\d{4}$/.test(v)?v.split('/').reverse().join('-'):'';
const aprovado=(v:GrupoPorCompetencia)=>["ATIVO","Ativo","VIGENTE"].includes(v.situacao);
export const competenciaAnterior=(competencia:string)=>{const [ano,mes]=competencia.split('-').map(Number);return mes===1?`${ano-1}-12`:`${ano}-${String(mes-1).padStart(2,'0')}`;};
export function formatarCompetenciaGrupo(comp:string){const [ano,mes]=comp.split('-');return `${mes}/${ano}`;}
function ler<T extends GrupoPorCompetencia>():Record<string,DadosGrupos<T>>{try{return JSON.parse(localStorage.getItem(chave)??'{}');}catch{return {};}}
function gravar<T extends GrupoPorCompetencia>(dados:Record<string,DadosGrupos<T>>){localStorage.setItem(chave,JSON.stringify(dados));}
export function carregarGruposCompetencia<T extends GrupoPorCompetencia>(competencia:string,base:T[],historicos:Record<number,T[]>,periodos:string[]):DadosGrupos<T>{
  const banco=ler<T>();
  // As competências já cadastradas são migradas uma vez com as versões válidas no período.
  if(!Object.keys(banco).length){
    const vigente=[...periodos].sort().at(-1)??competencia;
    for(const periodo of [...periodos].sort()){
      const ultimoDia=new Date(Number(periodo.slice(0,4)),Number(periodo.slice(5)),0).getDate();
      const fim=`${periodo}-${ultimoDia}`;const inicio=`${periodo}-01`;
      const versoes:Record<number,T[]>={};
      for(const grupo of base){
        const historia=historicos[grupo.id]??[grupo];
        const candidatas=historia.map((v,i)=>({...clonar(v),versao:v.versao??historia.length-i})).filter(v=>data(v.inicioVigencia)<=fim && (!data(v.fimVigencia)||data(v.fimVigencia)>=inicio));
        const atual=candidatas.find(v=>aprovado(v)||v.situacao==="ENCERRADO");
        const rascunho=periodo===vigente?candidatas.find(v=>v.situacao==="RASCUNHO"):undefined;
        const selecionada=rascunho??atual;
        if(selecionada){versoes[grupo.id]=[{...selecionada,competencia:periodo},...candidatas.filter(v=>v!==selecionada && aprovado(v)).map(v=>({...v,competencia:periodo}))];}
      }
      banco[periodo]={grupos:Object.values(versoes).map(v=>v[0]),versoes};
    }
  }
  const migracao="sigep:grupos-calculo:situacoes:v2";
  if(!localStorage.getItem(migracao)){
    const vigente=[...periodos].sort().at(-1);
    for(const periodo of periodos){
      const dados=banco[periodo];if(!dados)continue;
      for(const original of base){
        const historia=historicos[original.id]??[original];
        const registro=dados.grupos.find(g=>g.id===original.id);
        if(registro?.situacao==="ATIVO"){
          const encerrada=historia.find((v,i)=>v.situacao==="ENCERRADO" && (registro.versao??1)===(v.versao??historia.length-i) && Object.keys(registro).every(k=>k in v || ["competencia","versao"].includes(k)) && Object.keys(v).filter(k=>!["situacao","competencia","versao"].includes(k)).every(k=>JSON.stringify((v as Record<string,unknown>)[k])===JSON.stringify((registro as Record<string,unknown>)[k])));
          if(encerrada){registro.situacao="ENCERRADO";if(dados.versoes[registro.id]?.[0])dados.versoes[registro.id][0].situacao="ENCERRADO";}
        }
        if(!registro && periodo===vigente && original.situacao==="RASCUNHO" && data(original.inicioVigencia)<=periodo+"-31"){
          const pendente={...clonar(original),competencia:periodo,versao:1};
          const indiceBase=base.findIndex(g=>g.id===pendente.id);
          const posicao=dados.grupos.findIndex(g=>base.findIndex(item=>item.id===g.id)>indiceBase);
          dados.grupos.splice(posicao<0?dados.grupos.length:posicao,0,pendente);dados.versoes[pendente.id]=[pendente];
        }
      }
    }
    localStorage.setItem(migracao,"1");
  }
  if(!banco[competencia]){
    replicarNoBanco(banco, competencia);
  }
  gravar(banco);return clonar(banco[competencia]);
}

function replicarNoBanco<T extends GrupoPorCompetencia>(banco:Record<string,DadosGrupos<T>>,competencia:string){
  if(banco[competencia])return;
  const origem=banco[competenciaAnterior(competencia)];
  const versoes:Record<number,T[]>={};
  for(const grupo of origem?.grupos??[]){
    const copia={...clonar(grupo),competencia,versao:1,inicioVigencia:"01/"+formatarCompetenciaGrupo(competencia),fimVigencia:"-"};
    versoes[copia.id]=[copia];
  }
  banco[competencia]={grupos:Object.values(versoes).map(v=>v[0]),versoes};
}
export function replicarGruposNovaCompetencia(competencia:string){
  const banco=ler();
  if(!banco[competenciaAnterior(competencia)] || banco[competencia])return;
  replicarNoBanco(banco,competencia);gravar(banco);
}

export function salvarGrupoCompetencia<T extends GrupoPorCompetencia>(competencia:string,grupo:T,novaVersao=false){
  const banco=ler<T>();const dados=banco[competencia]??{grupos:[],versoes:{}};const historia=dados.versoes[grupo.id]??[];
  const numero=novaVersao?(historia[0]?.versao??historia.length)+1:historia[0]?.versao??1;
  const registro={...clonar(grupo),competencia,versao:numero};
  const anteriores=clonar(historia);
  if(novaVersao && aprovado(registro) && anteriores[0]){
    anteriores[0].situacao="ENCERRADO";
    const [dia,mes,ano]=registro.inicioVigencia.split('/').map(Number);const fim=new Date(Date.UTC(ano,mes-1,dia-1));
    anteriores[0].fimVigencia=[String(fim.getUTCDate()).padStart(2,'0'),String(fim.getUTCMonth()+1).padStart(2,'0'),fim.getUTCFullYear()].join('/');
  }
  dados.versoes[grupo.id]=novaVersao?[registro,...anteriores]:[registro,...anteriores.slice(1)];
  dados.grupos=[...dados.grupos.filter(g=>g.id!==grupo.id),registro];banco[competencia]=dados;gravar(banco);return registro;
}
export function excluirGrupoCompetencia(competencia:string,id:number){
  const banco=ler();const dados=banco[competencia];if(!dados)return;
  const grupo=dados.grupos.find(g=>g.id===id);if(!grupo||grupo.situacao!=="RASCUNHO")return;
  dados.grupos=dados.grupos.filter(g=>g.id!==id);delete dados.versoes[id];gravar(banco);
}
export function salvarConjuntoCompetencia<T extends GrupoPorCompetencia>(competencia:string,dados:DadosGrupos<T>){const banco=ler<T>();banco[competencia]=clonar(dados);gravar(banco);}
