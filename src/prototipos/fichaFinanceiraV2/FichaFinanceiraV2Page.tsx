import { ReceiptText, LoaderCircle } from "lucide-react";
import { competenciasDisponiveis, folhasDisponiveis, recuperarDemonstrativo } from "./consultaAutomatica";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { AutoComplete } from "primereact/autocomplete";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { CardSeplag } from "../../componentes/Card";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { PrototypeSystemPage, menuFolha } from "../PrototiposPage";
import "./fichaFinanceiraV2.css";

type Relacionamento = {
  tipo: string; beneficio?: string; descricao: string; servidor?: string; vinculoServidor?: string;
  orgaoOrigem?: string; cargoServidor?: string; situacao: string; inicio?: string;
};
type Pessoa = { id: string; pessoaId: string; nome: string; identificacao: string; cpf: string; tipo: string; orgao: string; pensionista?: boolean; fator: number; perfil?: PerfilLayoutVinculo; carreira?: string; relacionamento?: Relacionamento };
const pessoas: Pessoa[] = [
  { id: "358186-001", carreira: "Gestão Governamental", pessoaId: "pessoa-01", nome: "ISABELI RODRIGUES DE OLIVEIRA", identificacao: "358186/001", cpf: "123.456.789-09", tipo: "Servidor efetivo", orgao: "SEPLAG — Secretaria de Estado de Planejamento e Gestão", fator: 1 },
  { id: "32274-001", carreira: "Profissionais da Educação Básica", pessoaId: "pessoa-02", nome: "ANTONIA SILVA", identificacao: "32274/001", cpf: "234.567.890-12", tipo: "Servidor efetivo", orgao: "SEDUC — Secretaria de Estado de Educação", fator: 0.75 },
  { id: "32274-002", pessoaId: "pessoa-02", nome: "ANTONIA SILVA", identificacao: "32274/002", cpf: "234.567.890-12", tipo: "Contrato Temporário", orgao: "SEDUC — Secretaria de Estado de Educação", fator: 0.5, perfil: "temporario" },
  { id: "pensao-01", pessoaId: "pessoa-03", nome: "MARIA COSTA", identificacao: "PEN-2020-001", cpf: "456.789.123-00", tipo: "Pensão por morte", orgao: "MTPREV — Mato Grosso Previdência", pensionista: true, fator: 0.6, relacionamento: { tipo: "Pensão por morte", beneficio: "Pensão por morte", descricao: "Pensionista de CARLOS EDUARDO COSTA", servidor: "CARLOS EDUARDO COSTA", vinculoServidor: "45120/001", orgaoOrigem: "SEPLAG", cargoServidor: "Analista Administrativo", situacao: "Ativo", inicio: "01/03/2020" } },
  { id: "auxilio-01", pessoaId: "pessoa-04", nome: "ANA LIMA", identificacao: "AUX-2026-001", cpf: "678.901.234-56", tipo: "Auxílio a dependente", orgao: "SEPLAG", fator: 0.1, relacionamento: { tipo: "Dependente", beneficio: "Auxílio a dependente", descricao: "Dependente de PAULO LIMA", servidor: "PAULO LIMA", vinculoServidor: "78001/001", orgaoOrigem: "SEPLAG", situacao: "Ativo" } },
  { id: "auxilio-02", pessoaId: "pessoa-04", nome: "ANA LIMA", identificacao: "AUX-2026-002", cpf: "678.901.234-56", tipo: "Auxílio educacional", orgao: "SEDUC", fator: 0.05, relacionamento: { tipo: "Dependente", beneficio: "Auxílio educacional", descricao: "Dependente de LUCIA LIMA", servidor: "LUCIA LIMA", vinculoServidor: "78002/001", orgaoOrigem: "SEDUC", situacao: "Ativo" } },
  { id: "sem-registro", pessoaId: "pessoa-05", nome: "JOÃO ALMEIDA", identificacao: "900001/001", cpf: "567.890.123-45", tipo: "Servidor efetivo", orgao: "SEPLAG", fator: 0 },
];
const moeda = (valor: number) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const normalizar = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
type Rubrica = { codigo: string; descricao: string; tipo: "Vantagem" | "Desconto"; referencia: string; valor: number; base: number; deducao: number; formula: string; parametro: string; disponivel: boolean };
type Consulta = { pessoa: Pessoa; competencia: string; folha: string; rubricas: Rubrica[] };
const folhas = [{ label: "1 — Folha Mensal", value: "1" }, { label: "2 — Folha Complementar", value: "2" }];
function gerarRubricas(p: Pessoa, competencia: string, folha: string): Rubrica[] {
  const fator = p.fator * (competencia === "08/2026" ? 0.95 : 1) * (folha === "2" ? 0.1 : 1);
  const valor = (v: number) => Math.round(v * fator * 100) / 100;
  return [
    { codigo: "1040", descricao: p.relacionamento && !p.pensionista ? p.tipo : p.pensionista ? "Benefício de pensão" : "Subsídios", tipo: "Vantagem", referencia: p.pensionista ? "Cota de 60%" : "30 dias", valor: valor(16120.95), base: valor(16120.95), deducao: 0, formula: "Base mensal × 30 / 30", parametro: "30 dias", disponivel: true },
    { codigo: "5330", descricao: "INSS", tipo: "Desconto", referencia: "14%", valor: valor(988.09), base: valor(7057.79), deducao: 0, formula: "Base limitada ao teto × 14% (arredondado)", parametro: "14%", disponivel: !p.pensionista },
    { codigo: "9900", descricao: "Imposto de Renda", tipo: "Desconto", referencia: "27,5%", valor: valor(3252.81), base: valor(15132.86), deducao: valor(908.73), formula: "Base tributável × 27,5% − parcela a deduzir", parametro: "27,5%", disponivel: true },
  ];
}
type PessoaFisica = { id: string; nome: string; cpf: string; vinculos: Pessoa[]; relacionamentos: Pessoa[] };
const pessoasFisicas: PessoaFisica[] = Array.from(new Set(pessoas.map(p=>p.pessoaId))).map(id=>{
  const registros=pessoas.filter(p=>p.pessoaId===id);
  const principal=registros[0];
  return {id, nome:principal.nome, cpf:principal.cpf, vinculos:registros.filter(p=>!p.relacionamento), relacionamentos:registros.filter(p=>p.relacionamento)};
});
export function identificacaoAutocomplete(p: Pick<PessoaFisica, "cpf" | "nome" | "vinculos">) {
  const matriculas = [...new Set(p.vinculos.map(v=>v.identificacao.split("/")[0]).filter(Boolean))];
  return {
    principal: [p.nome.toLocaleLowerCase("pt-BR").split(/\s+/).filter(Boolean).map((parte,i)=>i>0 && ["de","da","do","das","dos","e"].includes(parte) ? parte : parte.charAt(0).toLocaleUpperCase("pt-BR")+parte.slice(1)).join(" "), p.cpf, ...matriculas].filter(Boolean).join(" · "),
    complemento: !matriculas.length ? "" : matriculas.length>1 ? `${matriculas.length} matrículas cadastradas` : p.vinculos.length>1 ? `${p.vinculos.length} vínculos cadastrados` : "",
  };
}
export function correspondePesquisaPessoa(p: Pick<PessoaFisica, "cpf" | "nome" | "vinculos">, termo: string) {
  const query=normalizar(termo.trim());
  if (!query) return true;
  if (/^[\d\s.()/\-]+$/.test(query)) {
    const numeros=query.replace(/\D/g, "");
    return !!numeros && [p.cpf,...p.vinculos.map(v=>v.identificacao)].some(valor=>valor.replace(/\D/g, "").includes(numeros));
  }
  return normalizar(p.nome).includes(query);
}

type PerfilLayoutVinculo = "efetivo" | "temporario";
const layoutsVinculo = {
  efetivo: { icone: "pi-id-card", descricao: "Consulte os dados funcionais do vínculo efetivo selecionado.", regime: "Estatutário", inicioLabel: "Início do exercício" },
  temporario: { icone: "pi-briefcase", descricao: "Consulte os dados do contrato temporário selecionado.", regime: "Contrato administrativo temporário", inicioLabel: "Início do contrato" },
} satisfies Record<PerfilLayoutVinculo, {icone: string; descricao: string; regime: string; inicioLabel: string}>;
function CabecalhoSecao({id, titulo, icone, descricao, acao}: {id: string; titulo: string; icone: string; descricao: string; acao?: ReactNode}) {
  return <header className="ffv2-section-header"><i className={`pi ${icone}`} aria-hidden="true" /><div><h2 id={id}>{titulo}</h2><p>{descricao}</p></div>{acao && <div className="ffv2-section-header-action">{acao}</div>}</header>;
}

const cargoDoVinculo = (p: Pessoa) => p.id === '32274-002' ? 'Professora' : 'Analista Administrativo';
function dadosIdentificacao(p: Pessoa): [string, string | undefined][] {
  const r=p.relacionamento;
  return r ? [
    ["Tipo de relacionamento",r.tipo], ["Tipo de benefício",r.beneficio], ["Identificação do benefício/relacionamento",p.identificacao],
    ["Servidor relacionado",r.servidor], ["Vínculo do servidor relacionado",r.vinculoServidor], ["Órgão de origem",r.orgaoOrigem],
    ["Cargo do servidor relacionado",r.cargoServidor], ["Situação do benefício/relacionamento",r.situacao], ["Início do benefício",r.inicio],
  ] : [
    ["Matrícula/número do vínculo",p.identificacao], ["Tipo de vínculo",p.tipo], ["Regime jurídico",layoutsVinculo[p.perfil ?? "efetivo"].regime],
    ["Cargo/Função",cargoDoVinculo(p)], ["Órgão/Entidade",p.orgao], ["Unidade de Lotação",p.id.startsWith("32274") ? "Unidade Escolar Estadual" : "Superintendência de Gestão de Pessoas"],
    ["Situação funcional","Ativo"], [layoutsVinculo[p.perfil ?? "efetivo"].inicioLabel,"01/02/2018"],
  ];
}

function resumoIdentificacao(p: Pessoa): [string, string | undefined][] {
  const r=p.relacionamento;
  return r ? [["CPF",p.cpf],["Relacionamento",r.descricao],["Benefício",p.identificacao],["Situação do benefício",r.situacao],["Órgão de origem",r.orgaoOrigem],["Vínculo do servidor relacionado",r.vinculoServidor],["Cargo do servidor relacionado",r.cargoServidor],["Início do benefício",r.inicio]] : [
    ["CPF",p.cpf],["Matrícula/Vínculo",p.identificacao],["Tipo de Vínculo",p.tipo],["Regime Jurídico",layoutsVinculo[p.perfil??"efetivo"].regime],["Carreira",p.carreira],["Cargo",cargoDoVinculo(p)],["Órgão",p.orgao.split(" — ")[0]],
    ["Unidade",p.id.startsWith("32274")?"Unidade Escolar Estadual":"Superintendência de Gestão de Pessoas"],[layoutsVinculo[p.perfil??"efetivo"].inicioLabel,"01/02/2018"],["Situação","Ativo"],
  ];
}

export function FichaFinanceiraV2Content() {
  const [busca, setBusca] = useState<string | PessoaFisica>("");
  const [sugestoes, setSugestoes] = useState<PessoaFisica[]>([]);
  const [pessoaFisica, setPessoaFisica] = useState<PessoaFisica | null>(null);
  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const [competencia, setCompetencia] = useState("");
  const [folha, setFolha] = useState("");
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [detalhesVisiveis, setDetalhesVisiveis] = useState(true);
  const [tipo, setTipo] = useState("Todas");
  const [rubrica, setRubrica] = useState<Rubrica | null>(null);
  const [erro, setErro] = useState("");
  const [semResultados, setSemResultados] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const termoPesquisa = useRef("");
  const requisicao = useRef<AbortController | null>(null);
  const podeConsultar = !!pessoa && competenciasDisponiveis(pessoa).includes(competencia) && folhasDisponiveis(pessoa,competencia).includes(folha);
  const invalidarResultado = () => { requisicao.current?.abort();requisicao.current=null;setConsulta(null);setRubrica(null);setErro("");setSemResultados(false);setCarregando(false); };
  const opcoesRegistro = pessoaFisica?.vinculos ?? [];
  const limpar = () => { invalidarResultado();setCompetencia("");setFolha("");setConsulta(null);setRubrica(null);setErro("");setTipo("Todas");setCarregando(false);setSemResultados(false); };
  const selecionarRegistro = (r: Pessoa | null) => {
    limpar();setPessoa(r);setDetalhesVisiveis(true);
    const disponiveis=competenciasDisponiveis(r);
    const unica=disponiveis.length===1 ? disponiveis[0] : "";
    setCompetencia(unica);
    const folhasDoRegistro=folhasDisponiveis(r,unica);
    setFolha(folhasDoRegistro.length===1 ? folhasDoRegistro[0] : "");
  };
  const selecionarPessoa = (p: PessoaFisica) => {
    setPessoaFisica(p);setBusca(p);
    const correspondentes=/^[\d\s.()/\-]+$/.test(termoPesquisa.current) ? p.vinculos.filter(v=>{
      const q=termoPesquisa.current.replace(/\D/g,"");
      return v.identificacao.replace(/\D/g,"")===q || v.identificacao.split("/")[0]===q;
    }) : [];
    const r=correspondentes.length===1 ? correspondentes[0] : p.vinculos.length===1 ? p.vinculos[0] : !p.vinculos.length && p.relacionamentos.length===1 ? p.relacionamentos[0] : null;
    if(pessoaFisica?.id===p.id && pessoa?.id===r?.id)return;
    selecionarRegistro(r);
  };
  const alterarCompetencia = (valor: string) => {
    if(valor===competencia)return;
    invalidarResultado();setCompetencia(valor);
    const disponiveis=folhasDisponiveis(pessoa,valor);
    setFolha(disponiveis.length===1 ? disponiveis[0] : "");
  };
  const limparFiltros = () => { limpar();setPessoa(null);setPessoaFisica(null);setBusca("");setSugestoes([]);termoPesquisa.current=""; };
  useEffect(()=>()=>{requisicao.current?.abort();},[]);
  const consultar = async () => {
    if(!podeConsultar || !pessoa || requisicao.current)return;
    const controller=new AbortController();requisicao.current=controller;
    setCarregando(true);setSemResultados(false);setErro("");setConsulta(null);setRubrica(null);setTipo("Todas");
    try {
      const resultado=await recuperarDemonstrativo(()=>({pessoa,competencia,folha,rubricas:gerarRubricas(pessoa,competencia,folha)}),controller.signal);
      if(requisicao.current!==controller || controller.signal.aborted)return;
      setSemResultados(!resultado.rubricas.length);setConsulta(resultado.rubricas.length ? resultado : null);
    } catch {
      if(requisicao.current===controller && !controller.signal.aborted)setErro("N\u00e3o foi poss\u00edvel carregar o demonstrativo. Tente novamente.");
    } finally {
      if(requisicao.current===controller){requisicao.current=null;setCarregando(false);}
    }
  };
  const vantagens = consulta?.rubricas.filter(r => r.tipo === "Vantagem").reduce((s,r) => s+r.valor,0) ?? 0;
  const descontos = consulta?.rubricas.filter(r => r.tipo === "Desconto").reduce((s,r) => s+r.valor,0) ?? 0;
  const visiveis = consulta?.rubricas.filter(r => (tipo === "Todas" || r.tipo === tipo)) ?? [];
  async function holerite() {
    if (!consulta) return;
    const { gerarHoleritePdf } = await import("./holeritePdf");
    const { default: svgBrasao } = await import("../../assets/img/brasao-mt.svg?raw");
    const brasao = await new Promise<string>((resolve,reject)=>{
      const imagem=new Image();
      imagem.onload=()=>{const canvas=document.createElement("canvas");canvas.width=256;canvas.height=256;const ctx=canvas.getContext("2d");if(!ctx){reject(new Error("Canvas indisponivel"));return;}ctx.drawImage(imagem,0,0,256,256);resolve(canvas.toDataURL("image/png"));};
      imagem.onerror=()=>reject(new Error("Falha ao carregar brasao"));
      imagem.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svgBrasao.replaceAll("#fff","#333"));
    });
    const registro=consulta.pessoa;
    const documento=gerarHoleritePdf({
      nome:registro.nome, cpf:registro.cpf, competencia:consulta.competencia,
      folha:consulta.folha, descricaoFolha:folhas.find(f=>f.value===consulta.folha)?.label.split(" — ")[1] ?? "",
      vinculo:registro.relacionamento ? undefined : registro.identificacao,
      orgao:registro.orgao, simulacao:true, brasao,
      campos:[...dadosIdentificacao(registro).filter(([label])=>label!=="Matrícula/número do vínculo").map(([label,valor])=>({label,valor})),...(!registro.relacionamento && registro.carreira ? [{label:"Carreira",valor:registro.carreira}] : [])],
      rubricas:consulta.rubricas.map(r=>({codigo:r.codigo,descricao:r.descricao,competencia:consulta.competencia,complemento:registro.pensionista && r.tipo==="Vantagem" ? "Cota do beneficio" : undefined,vantagem:r.tipo==="Vantagem" ? r.valor : undefined,desconto:r.tipo==="Desconto" ? r.valor : undefined,auxiliares:r.referencia})),
      vantagens,descontos,liquido:vantagens-descontos,
    });
    documento.pdf.save(documento.nome);
  }
  return <div className="prototype-page-content prototype-page-content--white ffv2">
    <CardSeplag title="Demonstrativo de Pagamento" cols="12" cardHeaderClassNames="prototype-carreira-card ffv2-card" headerNavigation={<BreadcrumbSeplag divided items={[{ label: "Lançamento Financeiro", to: "/prototipos/folha/lancamento-financeiro" }, { label: "Demonstrativo de Pagamento" }]} />}>
    <div className="ffv2-content">
    <section className="ffv2-section" aria-labelledby="ffv2-consultar"><CabecalhoSecao id="ffv2-consultar" titulo="Consultar Demonstrativo" icone="pi-search" descricao="Pesquise a pessoa e informe os filtros para consultar a ficha financeira." />
      <div className="ffv2-section-body">
        <div className="ffv2-query-grid">
          <div className="ffv2-search"><label htmlFor="ffv2-busca">Nome, CPF ou matrícula</label><span className="ffv2-search-control"><AutoComplete inputId="ffv2-busca" value={busca} suggestions={sugestoes} field="nome" dropdown dropdownMode="blank" placeholder="Buscar por nome, CPF ou matrícula" forceSelection minLength={0} completeMethod={e=>setSugestoes(pessoasFisicas.filter(p=>correspondePesquisaPessoa(p,e.query)))} onChange={e=>{setBusca(e.value);if(typeof e.value==="string"){termoPesquisa.current=e.value;if(pessoaFisica){limpar();setPessoaFisica(null);setPessoa(null);}}}} onSelect={e=>selecionarPessoa(e.value)} itemTemplate={(p:PessoaFisica)=>{const r=identificacaoAutocomplete(p);return <div className="ffv2-option"><strong>{r.principal}</strong></div>;}} dataKey="id" scrollHeight="280px" panelClassName="ffv2-person-options" emptyMessage="Nenhum resultado encontrado" /></span></div>
          <div><label htmlFor="ffv2-contexto">Vínculo{opcoesRegistro.length>1 && <> <span className="ffv2-required">*</span></>}</label>{pessoaFisica && !pessoaFisica.vinculos.length ? <input id="ffv2-contexto" className="p-inputtext p-component ffv2-no-functional-link" value="Não possui vínculo funcional" readOnly aria-readonly="true" tabIndex={-1} /> : <Dropdown inputId="ffv2-contexto" value={pessoa?.relacionamento ? null : pessoa?.id ?? null} options={opcoesRegistro.map(r=>({label:r.identificacao,value:r.id}))} disabled={!opcoesRegistro.length} placeholder={!pessoaFisica ? "Selecione após identificar a pessoa" : opcoesRegistro.length ? "Selecione o vínculo" : ""} onChange={e=>{const r=opcoesRegistro.find(v=>v.id===e.value)??null;if(r?.id!==pessoa?.id)selecionarRegistro(r);}} />}</div>
          <div><label htmlFor="ffv2-competencia">Competência <span className="ffv2-required">*</span></label><Dropdown inputId="ffv2-competencia" value={competencia} options={competenciasDisponiveis(pessoa)} disabled={!pessoa || !competenciasDisponiveis(pessoa).length} placeholder="MM/AAAA" onChange={e=>alterarCompetencia(e.value)} /></div>
          <div><label htmlFor="ffv2-folha">Número da Folha <span className="ffv2-required">*</span></label><Dropdown inputId="ffv2-folha" value={folha} options={folhas.filter(f=>folhasDisponiveis(pessoa,competencia).includes(f.value))} disabled={!pessoa || !folhasDisponiveis(pessoa,competencia).length} placeholder="Selecione a folha" onChange={e=>{if(e.value===folha)return;invalidarResultado();setFolha(e.value);}} /></div>
        <div className="ffv2-query-actions">
          <Button label="Limpar filtro" icon="pi pi-refresh" className="ffv2-query-clear" onClick={limparFiltros} />
          <Button label="Consultar" icon="pi pi-search" className="ffv2-query-submit" disabled={!podeConsultar || carregando} onClick={consultar} />
        </div>
        </div>
        {pessoaFisica && <div className="ffv2-query-identity ffv2-link-detail" aria-label="Resumo da identificação">
          <div className="ffv2-link-detail-header"><i className="pi pi-user" aria-hidden="true" /><div><span className="ffv2-link-detail-title">{pessoa?.relacionamento || !pessoaFisica.vinculos.length ? "Identificação do beneficiário" : "Detalhes do vínculo"}</span><strong>{pessoaFisica.nome}</strong></div><Button className="ffv2-toggle-link-details" label={detalhesVisiveis ? "Ocultar detalhes" : "Exibir detalhes"} icon={detalhesVisiveis ? "pi pi-chevron-up" : "pi pi-chevron-down"} text aria-expanded={detalhesVisiveis} aria-controls="ffv2-link-details" onClick={()=>setDetalhesVisiveis(v=>!v)} /></div>
          <dl id="ffv2-link-details" hidden={!detalhesVisiveis} className="ffv2-link-detail-grid">{(pessoa ? resumoIdentificacao(pessoa) : [["CPF",pessoaFisica.cpf],...pessoaFisica.relacionamentos.map(r=>["Relacionamento",r.relacionamento?.descricao])]).filter(([,valor])=>Boolean(valor)).map(([label,valor])=><div key={`${label}-${valor}`}><dt>{label}:</dt><dd>{label?.startsWith("Situação") ? <span className="ffv2-status">{valor}</span> : valor}</dd></div>)}</dl>

          {!pessoa && pessoaFisica.vinculos.length>0 && <span>Selecione o vínculo para continuar.</span>}
        </div>}
        {(pessoa && !competenciasDisponiveis(pessoa).length) && <p role="status" className="ffv2-empty">Nenhum registro financeiro encontrado para os filtros informados.</p>}
        {erro && <div role="alert" className="ffv2-query-error"><span>{erro}</span><Button label="Tentar novamente" icon="pi pi-refresh" text onClick={consultar} /></div>}
      </div>
    </section>
    <section className="ffv2-section" aria-labelledby="ffv2-demonstrativo"><CabecalhoSecao id="ffv2-demonstrativo" titulo="Demonstrativo de Pagamento" icone="pi-wallet" descricao="Confira os valores e a composição do pagamento consultado." acao={consulta ? <Button label="Holerite" icon="pi pi-file-pdf" outlined onClick={holerite} /> : undefined} />
    <div className="ffv2-section-body">
        {!consulta ? <div className="ffv2-empty-statement" role={carregando || semResultados ? "status" : undefined} aria-live="polite" aria-busy={carregando}><span className="ffv2-empty-icon">{carregando ? <LoaderCircle size={30} strokeWidth={1.6} className="ffv2-empty-spinner" aria-hidden="true" /> : <ReceiptText size={30} strokeWidth={1.6} aria-hidden="true" />}</span><strong>{carregando ? "Carregando demonstrativo" : semResultados ? "Nenhum demonstrativo encontrado" : "Nenhum demonstrativo consultado"}</strong><p>{carregando ? "Aguarde enquanto os dados financeiros são recuperados." : semResultados ? "Não foram encontrados registros financeiros para os filtros informados." : "Preencha os filtros acima e clique em 'Consultar' para visualizar os dados financeiros."}</p></div> : <>
        <div className="ffv2-statement-person" aria-label="Identificação do demonstrativo"><strong>{consulta.pessoa.nome}</strong><span>CPF · {consulta.pessoa.cpf}</span><span>{consulta.pessoa.relacionamento ? "Benefício/Relacionamento" : "Matrícula/Vínculo"}: {consulta.pessoa.identificacao}</span></div>
        <div className="ffv2-meta"><strong>Competência {consulta.competencia}</strong><span>{folhas.find(f=>f.value===consulta.folha)?.label}</span></div>
        <div className="ffv2-totals">{[["Vantagens",vantagens,"blue","pi pi-arrow-up-right"],["Descontos",descontos,"red","pi pi-arrow-down-right"],["Líquido",vantagens-descontos,"green","pi pi-wallet"]].map(([label,valor,cor,icone])=><div key={String(label)} className={`ffv2-total ffv2-${cor}`}><span>{label}<i className={String(icone)} /></span><strong>{moeda(Number(valor))}</strong></div>)}</div>
        <h3>Rubricas do Pagamento</h3><div className="ffv2-toolbar"><div className="ffv2-tabs" aria-label="Filtrar tipo de rubrica">{[["Todas","Todas"],["Vantagem","Vantagens"],["Desconto","Descontos"]].map(([valor,label])=><button key={valor} type="button" aria-pressed={tipo===valor} onClick={()=>setTipo(valor)}>{label}</button>)}</div></div>
        <div className="ffv2-table-wrap"><table className="ffv2-table"><thead><tr>{["Código da Rubrica","Descrição","Tipo","Complemento","Competência","Vantagens","Descontos","Percentual","Ação"].map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{visiveis.map(r=><tr key={r.codigo}><td data-label="Código">{r.codigo}</td><td data-label="Descrição"><strong>{r.descricao}</strong></td><td data-label="Tipo"><span className={`ffv2-tag ${r.tipo === "Desconto" ? "ffv2-tag-red" : ""}`}>{r.tipo}</span></td><td data-label="Complemento">{consulta.pessoa.pensionista && r.tipo === "Vantagem" ? "Cota do benefício" : "—"}</td><td data-label="Competência">{consulta.competencia}</td><td data-label="Vantagens" className="ffv2-money">{r.tipo === "Vantagem" ? moeda(r.valor) : "—"}</td><td data-label="Descontos" className="ffv2-money">{r.tipo === "Desconto" ? moeda(r.valor) : "—"}</td><td data-label="Percentual">{r.referencia.includes("%") ? r.referencia : "—"}</td><td><Button aria-label="Ver Cálculo" icon="pi pi-cog" tooltip="Ver cálculo" tooltipOptions={{position:"top"}} className="ffv2-calculation-action" onClick={()=>setRubrica(r)} /></td></tr>)}{!visiveis.length && <tr><td colSpan={9} className="ffv2-empty">Nenhuma rubrica encontrada.</td></tr>}</tbody><tfoot><tr><td colSpan={5}>Totais do demonstrativo</td><td className="ffv2-money">{moeda(vantagens)}</td><td className="ffv2-money">{moeda(descontos)}</td><td colSpan={2} /></tr></tfoot></table></div>
        <div className="ffv2-processing-timestamp"><span className="ffv2-processed-at"><i className="pi pi-check-circle" aria-hidden="true" /><span>Processado em: <strong>{consulta.competencia === "10/2026" ? "28/10/2026" : `28/${consulta.competencia}`} às 18:42</strong></span></span></div>
        <details className="ffv2-processing"><summary><i className="pi pi-cog" aria-hidden="true" /> Informações do Processamento</summary><dl className="ffv2-data">{[["Número da execução",`EX-${consulta.competencia.replace('/','')}-${consulta.folha}-${consulta.pessoa.id}`],["Data e hora",`28/${consulta.competencia} às 18:42`],["Rubricas processadas","3"],["Rubricas auxiliares","2"],["Registros retidos","0"],["Ocorrências","Nenhuma"],["Mensagens do processamento","Processamento concluído com sucesso."],["Informações de cálculo","Parâmetros registrados no processamento simulado."],["Correções de vantagens e descontos","Nenhuma correção registrada."]].map(([label,valor])=><div key={label}><dt>{label}</dt><dd>{valor}</dd></div>)}</dl></details>
        </>}
    </div>
    </section>
    </div>
    </CardSeplag>
    <Sidebar visible={!!rubrica && !!consulta} position="right" onHide={()=>setRubrica(null)} className="ffv2-drawer" header={<strong>Memória de Cálculo</strong>}>
      {rubrica && consulta && <><span className="ffv2-eyebrow">{rubrica.codigo} · {rubrica.tipo}</span><h2>{rubrica.descricao}</h2><dl className="ffv2-data"><div><dt>Competência</dt><dd>{consulta.competencia}</dd></div><div><dt>Número da folha</dt><dd>{folhas.find(f=>f.value===consulta.folha)?.label}</dd></div><div><dt>Referência utilizada</dt><dd>{rubrica.referencia}</dd></div></dl><p className="ffv2-notice"><i className="pi pi-info-circle" /> Parâmetros do processamento original simulado. Esta consulta não executa um novo cálculo.</p>
      {rubrica.disponivel ? <><h3>Composição do cálculo</h3><dl className="ffv2-calculation">{[["Base de cálculo",moeda(rubrica.base)],["Rubricas que compõem a base",rubrica.codigo === "9900" ? "1040 — Subsídios / Benefício de pensão; dedução de 5330 — INSS" : rubrica.codigo === "5330" ? "1040 — Subsídios (base limitada ao teto)" : consulta.pessoa.pensionista ? "Benefício do instituidor × cota de 60%" : "Tabela de subsídios do vínculo"],["Percentual ou parâmetro",rubrica.parametro],["Deduções",moeda(rubrica.deducao)]].map(([label,valor])=><div key={label}><dt>{label}</dt><dd>{valor}</dd></div>)}</dl><div className="ffv2-formula"><small>Fórmula registrada</small><p>{consulta.pessoa.pensionista && rubrica.codigo === "1040" ? "Base do instituidor × cota de 60%" : rubrica.formula}</p></div><div className="ffv2-result"><span>Resultado do cálculo</span><strong>{moeda(rubrica.valor)}</strong></div></> : <p role="status" className="ffv2-empty">O detalhamento do cálculo não está disponível para esta rubrica.</p>}
      <div className="ffv2-other"><label htmlFor="ffv2-outra">Consultar outra rubrica</label><Dropdown inputId="ffv2-outra" value={rubrica.codigo} options={consulta.rubricas.map(r=>({label:`${r.codigo} — ${r.descricao}`,value:r.codigo}))} onChange={e=>setRubrica(consulta.rubricas.find(r=>r.codigo===e.value) ?? null)} /></div></>}
    </Sidebar>
  </div>;
}
export function FichaFinanceiraV2Page() { return <PrototypeSystemPage nomeSistema="FOLHA" ambienteSistema="Teste" menuItems={menuFolha}><FichaFinanceiraV2Content /></PrototypeSystemPage>; }
