import { useState, type ReactNode } from "react";
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
const competencias = ["10/2026", "09/2026", "08/2026"];
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
    principal: [...(matriculas.length===1 ? matriculas : []), p.cpf, p.nome].join(" — "),
    complemento: !matriculas.length ? "Beneficiária sem matrícula funcional" : matriculas.length>1 ? `${matriculas.length} matrículas cadastradas` : p.vinculos.length>1 ? `${p.vinculos.length} vínculos cadastrados` : "",
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
function layoutIdentificacao(p: Pessoa | null) {
  if (p?.relacionamento) return { icone: "pi-users", descricao: "Consulte os dados do benefício e do servidor relacionado." };
  if (p) return layoutsVinculo[p.perfil ?? "efetivo"];
  return { icone: "pi-user", descricao: "Identifique o servidor ou beneficiário e selecione o vínculo, quando necessário." };
}
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

function iconeIdentificacao(label: string) {
  if(label.startsWith('Regime')) return 'pi-verified';
  if(label.startsWith('Cargo')) return 'pi-briefcase';
  if(label.startsWith('Órgão')) return 'pi-building';
  if(label.startsWith('Unidade')) return 'pi-map-marker';
  if(label.startsWith('Situa')) return 'pi-heart';
  if(label.startsWith('Início')) return 'pi-calendar';
  if(label.startsWith('Servidor')) return 'pi-user';
  if(label.startsWith('Vínculo')) return 'pi-id-card';
  return 'pi-file';
}
export function FichaFinanceiraV2Content() {
  const [busca, setBusca] = useState<string | PessoaFisica>("");
  const [sugestoes, setSugestoes] = useState<PessoaFisica[]>([]);
  const [pessoaFisica, setPessoaFisica] = useState<PessoaFisica | null>(null);
  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const [competencia, setCompetencia] = useState("");
  const [folha, setFolha] = useState("");
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [detalhes, setDetalhes] = useState(false);
  const [tipo, setTipo] = useState("Todas");
  const [rubrica, setRubrica] = useState<Rubrica | null>(null);
  const [erro, setErro] = useState("");
  const limpar = () => { setCompetencia(""); setFolha(""); setConsulta(null); setRubrica(null); setErro(""); setTipo("Todas"); };
  const selecionarPessoa = (p: PessoaFisica) => {
    limpar(); setPessoaFisica(p); setBusca(p); setDetalhes(false);
    setPessoa(p.vinculos.length === 1 ? p.vinculos[0] : p.vinculos.length === 0 && p.relacionamentos.length === 1 ? p.relacionamentos[0] : null);
  };
  const consultar = () => {
    if (!pessoa || !competencia || !folha) { setErro("Selecione a competência e o número da folha para consultar."); return; }
    setErro(""); setTipo("Todas"); setConsulta({ pessoa, competencia, folha, rubricas: gerarRubricas(pessoa, competencia, folha) });
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
    <section className="ffv2-section" aria-labelledby="ffv2-pessoa"><CabecalhoSecao id="ffv2-pessoa" titulo="Identificação para Consulta" icone={layoutIdentificacao(pessoa).icone} descricao="Localize a pessoa que deseja consultar e selecione o vínculo, quando necessário." />
    <div className="ffv2-section-body">
      <div className="ffv2-search"><label htmlFor="ffv2-busca">Servidor / Beneficiário</label><span className="ffv2-search-control"><i className="pi pi-search" aria-hidden="true" /><AutoComplete inputId="ffv2-busca" value={busca} suggestions={sugestoes} field="nome" dropdown dropdownMode="blank" placeholder="Pesquise por matrícula, CPF ou nome..." forceSelection minLength={0} completeMethod={e => setSugestoes(pessoasFisicas.filter(p=>correspondePesquisaPessoa(p,e.query)))} onChange={e=>setBusca(e.value)} onSelect={e=>selecionarPessoa(e.value)} itemTemplate={(p:PessoaFisica)=>{const resultado=identificacaoAutocomplete(p);return <div className="ffv2-option"><strong>{resultado.principal}</strong>{resultado.complemento && <small>{resultado.complemento}</small>}</div>;}} dataKey="id" scrollHeight="280px" panelClassName="ffv2-person-options" emptyMessage="Nenhum resultado encontrado" /></span></div>
      {pessoaFisica && <>
        <div className="ffv2-person-band">
          <div className="ffv2-band-name"><i className="pi pi-user" aria-hidden="true" /><div><small>Pessoa selecionada</small><strong>{pessoaFisica.nome}</strong></div></div>
          <div className="ffv2-band-cpf"><small>CPF</small><strong>{pessoaFisica.cpf}</strong></div>
          <Button label="Trocar pessoa" icon="pi pi-sync" text onClick={()=>{limpar();setPessoa(null);setPessoaFisica(null);setBusca("");setDetalhes(false);}} />
        </div>
        {pessoaFisica.vinculos.length>0 && <div className="ffv2-vinculo-area">
          <div className="ffv2-vinculo-heading"><strong>Vínculo selecionado</strong><small>{pessoaFisica.vinculos.length} {pessoaFisica.vinculos.length===1 ? "vínculo disponível" : "vínculos disponíveis"}</small></div>
          <label className="ffv2-sr-only" htmlFor="ffv2-vinculo">Vínculo *</label>
          <div className={`ffv2-vinculo-control ${pessoa ? "is-selected" : ""}`}>
            <Dropdown inputId="ffv2-vinculo" value={pessoa?.id ?? null} options={pessoaFisica.vinculos.map(v=>({label:v.identificacao,value:v.id}))} placeholder="Selecione o vínculo" onChange={e=>{limpar();setPessoa(pessoaFisica.vinculos.find(v=>v.id===e.value) ?? null);setDetalhes(false);}} />
          </div>
        </div>}
        {!pessoaFisica.vinculos.length && <div className="ffv2-relationship-area">
          {pessoa && <p className="ffv2-context-summary">{pessoa.relacionamento?.descricao}</p>}
          {pessoaFisica.relacionamentos.length>1 && <><div className="ffv2-vinculo-heading"><strong>Benefício / Relacionamento</strong><small>{pessoaFisica.relacionamentos.length} registros disponíveis</small></div><label className="ffv2-sr-only" htmlFor="ffv2-beneficio">Benefício / Relacionamento *</label><Dropdown inputId="ffv2-beneficio" value={pessoa?.id ?? null} options={pessoaFisica.relacionamentos.map(r=>({label:`${r.identificacao} — ${r.tipo} · ${r.relacionamento?.descricao}`,value:r.id}))} placeholder="Selecione o benefício ou relacionamento" onChange={e=>{limpar();setPessoa(pessoaFisica.relacionamentos.find(r=>r.id===e.value) ?? null);setDetalhes(false);}} /></>}
        </div>}
        {pessoa && <div className="ffv2-details-area">
          {detalhes && <dl id="ffv2-detalhes" className="ffv2-icon-grid">{dadosIdentificacao(pessoa).filter(([label,valor])=>Boolean(valor) && (pessoa.relacionamento || !["Matrícula/número do vínculo","Tipo de vínculo"].includes(label))).map(([label,valor])=><div key={label} className="ffv2-detail-item"><i className={`pi ${iconeIdentificacao(label)}`} aria-hidden="true" /><div><dt>{label}</dt><dd>{label.startsWith("Situação") ? <span className="ffv2-status">{valor}</span> : valor}</dd></div></div>)}</dl>}
          <Button label={detalhes ? "Ocultar detalhes" : "Ver detalhes"} aria-expanded={detalhes} aria-controls="ffv2-detalhes" icon={detalhes ? "pi pi-chevron-up" : "pi pi-chevron-down"} text onClick={()=>setDetalhes(!detalhes)} />
        </div>}
      </>}
    </div>
    </section>
    <section className={`ffv2-section ${!pessoa ? "ffv2-disabled" : ""}`} aria-labelledby="ffv2-consulta"><CabecalhoSecao id="ffv2-consulta" titulo="Consulta Financeira" icone="pi-search" descricao="Selecione a competência e a folha de pagamento que deseja consultar." />
    <div className="ffv2-section-body">
      {!pessoa && <p className="ffv2-muted"><i className="pi pi-lock" /> Selecione uma pessoa ou vínculo para habilitar a consulta.</p>}
      <form onSubmit={e=>{e.preventDefault();consultar();}}><div className="ffv2-fields"><div><label htmlFor="ffv2-competencia">Competência *</label><Dropdown inputId="ffv2-competencia" value={competencia} options={pessoa?.fator ? competencias : []} disabled={!pessoa || !pessoa.fator} placeholder="MM/AAAA" onChange={e=>{setCompetencia(e.value);setFolha("");setConsulta(null);setRubrica(null);setErro("");}} /></div><div><label htmlFor="ffv2-folha">Número da Folha *</label><Dropdown inputId="ffv2-folha" value={folha} options={competencia === "10/2026" && pessoa?.id === "358186-001" ? folhas : folhas.slice(0,1)} disabled={!competencia} placeholder="Selecione a folha" onChange={e=>{setFolha(e.value);setConsulta(null);setRubrica(null);setErro("");}} /></div><div className="ffv2-actions"><Button type="submit" label="Consultar Ficha Financeira" icon="pi pi-search" disabled={!pessoa || !pessoa.fator} /><Button type="button" label="Limpar Filtros" icon="pi pi-filter-slash" text disabled={!pessoa} onClick={limpar} /></div></div></form>
      {erro && <p role="alert" className="ffv2-error">{erro}</p>}{pessoa && !pessoa.fator && <p role="status" className="ffv2-empty">Nenhum registro financeiro encontrado para os filtros informados.</p>}
    </div>
    </section>
    {consulta && <section className="ffv2-section" aria-labelledby="ffv2-demonstrativo"><CabecalhoSecao id="ffv2-demonstrativo" titulo="Demonstrativo de Pagamento" icone="pi-wallet" descricao="Confira os valores e a composição do pagamento consultado." acao={<Button label="Holerite" icon="pi pi-file-pdf" outlined onClick={holerite} />} />
    <div className="ffv2-section-body">
        <div className="ffv2-statement-person" aria-label="Identificação do demonstrativo"><strong>{consulta.pessoa.nome}</strong><span>CPF · {consulta.pessoa.cpf}</span>{!consulta.pessoa.relacionamento && <span>Matrícula/Vínculo: {consulta.pessoa.identificacao}</span>}</div>
        <div className="ffv2-meta"><strong>Competência {consulta.competencia}</strong><span>{folhas.find(f=>f.value===consulta.folha)?.label}</span></div>
        <div className="ffv2-totals">{[["Vantagens",vantagens,"blue","pi pi-arrow-up-right"],["Descontos",descontos,"red","pi pi-arrow-down-right"],["Líquido",vantagens-descontos,"green","pi pi-wallet"]].map(([label,valor,cor,icone])=><div key={String(label)} className={`ffv2-total ffv2-${cor}`}><span>{label}<i className={String(icone)} /></span><strong>{moeda(Number(valor))}</strong></div>)}</div>
        <h3>Rubricas do Pagamento</h3><div className="ffv2-toolbar"><div className="ffv2-tabs" aria-label="Filtrar tipo de rubrica">{[["Todas","Todas"],["Vantagem","Vantagens"],["Desconto","Descontos"]].map(([valor,label])=><button key={valor} type="button" aria-pressed={tipo===valor} onClick={()=>setTipo(valor)}>{label}</button>)}</div></div>
        <div className="ffv2-table-wrap"><table className="ffv2-table"><thead><tr>{["Código da Rubrica","Descrição","Tipo","Complemento","Competência","Vantagens","Descontos","Percentual","Ação"].map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{visiveis.map(r=><tr key={r.codigo}><td data-label="Código">{r.codigo}</td><td data-label="Descrição"><strong>{r.descricao}</strong></td><td data-label="Tipo"><span className={`ffv2-tag ${r.tipo === "Desconto" ? "ffv2-tag-red" : ""}`}>{r.tipo}</span></td><td data-label="Complemento">{consulta.pessoa.pensionista && r.tipo === "Vantagem" ? "Cota do benefício" : "—"}</td><td data-label="Competência">{consulta.competencia}</td><td data-label="Vantagens" className="ffv2-money">{r.tipo === "Vantagem" ? moeda(r.valor) : "—"}</td><td data-label="Descontos" className="ffv2-money">{r.tipo === "Desconto" ? moeda(r.valor) : "—"}</td><td data-label="Percentual">{r.referencia.includes("%") ? r.referencia : "—"}</td><td><Button aria-label="Ver Cálculo" icon="pi pi-cog" tooltip="Ver cálculo" tooltipOptions={{position:"top"}} className="ffv2-calculation-action" onClick={()=>setRubrica(r)} /></td></tr>)}{!visiveis.length && <tr><td colSpan={9} className="ffv2-empty">Nenhuma rubrica encontrada.</td></tr>}</tbody><tfoot><tr><td colSpan={5}>Totais do demonstrativo</td><td className="ffv2-money">{moeda(vantagens)}</td><td className="ffv2-money">{moeda(descontos)}</td><td colSpan={2} /></tr></tfoot></table></div>
        <div className="ffv2-processing-timestamp"><span className="ffv2-processed-at"><i className="pi pi-check-circle" aria-hidden="true" /><span>Processado em: <strong>{consulta.competencia === "10/2026" ? "28/10/2026" : `28/${consulta.competencia}`} às 18:42</strong></span></span></div>
        <details className="ffv2-processing"><summary><i className="pi pi-cog" aria-hidden="true" /> Informações do Processamento</summary><dl className="ffv2-data">{[["Número da execução",`EX-${consulta.competencia.replace('/','')}-${consulta.folha}-${consulta.pessoa.id}`],["Data e hora",`28/${consulta.competencia} às 18:42`],["Rubricas processadas","3"],["Rubricas auxiliares","2"],["Registros retidos","0"],["Ocorrências","Nenhuma"],["Mensagens do processamento","Processamento concluído com sucesso."],["Informações de cálculo","Parâmetros registrados no processamento simulado."],["Correções de vantagens e descontos","Nenhuma correção registrada."]].map(([label,valor])=><div key={label}><dt>{label}</dt><dd>{valor}</dd></div>)}</dl></details>
    </div>
    </section>}
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
