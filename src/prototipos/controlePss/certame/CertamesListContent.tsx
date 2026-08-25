import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { CONTROLE_PSS_BASE_PATH as BASE } from "../constants";
import { useControlePssStore } from "../controlePssStore";
import { SpecArea, SpecificationMode } from "../../shared/visualizationModes";
import { certamesListBlockSpecifications, certamesListBusinessItems, certamesListFilterSpecifications, certamesListScreenSpecification } from "./CertamesListSpecifications";
import { ORGAOS_CERTAME, SITUACOES_CERTAME, TIPOS_CERTAME } from "./dominios";
import type { Certame, SituacaoCertame, TipoCertame } from "./types";
import { lerRascunhoCertame, limparRascunhoCertame, type RascunhoCertame } from "./rascunhoCertameStore";
import { SituacoesCertameModal } from "./SituacoesCertameModal";
import { CardSeplag } from "@componentes/Card";
import { BadgeSeplag } from "@componentes/Badge";
import { BotaoAdicionarSeplag, BotaoIconSeplag, BotaoLimparFiltroSeplag, BotaoSeplag } from "@componentes/Botao";
import { TextFieldSeplag } from "@componentes/Fields";
import "./certame.css";

const abaLabel:Record<RascunhoCertame["aba"], string> = { IDENTIFICACAO:"Identificação", CRONOGRAMA:"Cronograma", FINANCEIRO:"Contrato e Custos", VAGAS_COTAS:"Vagas e Cotas", DOCUMENTOS:"Documentos" };

interface FiltroForm { termo:string }

const situacaoLabel:Record<SituacaoCertame,string> = Object.fromEntries(SITUACOES_CERTAME.map((item) => [item.value, item.label])) as Record<SituacaoCertame,string>;
const situacaoEstilo:Record<SituacaoCertame,{ color:string; bg:string }> = {
 ABERTO: { color:"#0b6199", bg:"#e9f3fc" },
 RETIFICACAO_EDITAL: { color:"#55637a", bg:"#eef1f5" },
 HOMOLOGADO: { color:"#147441", bg:"#e2f5e8" },
 RETIFICACAO_HOMOLOGACAO: { color:"#55637a", bg:"#eef1f5" },
 PRORROGACAO_VALIDADE: { color:"#8a5c00", bg:"#fff1cf" },
 CANCELADO_ANULADO: { color:"#ad3039", bg:"#ffe3e5" },
 PARALISADO: { color:"#ad3039", bg:"#ffe3e5" },
 HOMOLOGACAO_PARCIAL: { color:"#8a5c00", bg:"#fff1cf" },
 RETIFICACAO_HOMOLOGACAO_PARCIAL: { color:"#8a5c00", bg:"#fff1cf" },
};
const tipoLabel:Record<TipoCertame,string> = Object.fromEntries(TIPOS_CERTAME.map((item) => [item.value, item.label])) as Record<TipoCertame,string>;
const normalizar = (valor:string) => valor.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR");

const ITENS_POR_PAGINA_OPCOES = [10, 20, 50];

export function CertamesListContent() {
 const { certames } = useControlePssStore();
 const navigate = useNavigate();
 const { control, watch, reset } = useForm<FiltroForm>({ defaultValues: { termo:"" } });
 const termo = watch("termo");
 const [orgaoFiltro, setOrgaoFiltro] = useState("");
 const [exercicioFiltro, setExercicioFiltro] = useState("");
 const [tipoFiltro, setTipoFiltro] = useState<TipoCertame | "">("");
 const [situacaoFiltro, setSituacaoFiltro] = useState<SituacaoCertame | "">("");
 const [pagina, setPagina] = useState(1);
 const [itensPorPagina, setItensPorPagina] = useState(10);
 const [certameSituacoesId, setCertameSituacoesId] = useState<string | null>(null);
 const [acoesMenuAbertoId, setAcoesMenuAbertoId] = useState<string | null>(null);

 // Certame em cadastro (fase "Abertura/Cadastro"), ainda não salvo como registro — o progresso fica
 // em rascunho local (ver rascunhoCertameStore) até a conclusão do cadastro; sinalizado aqui como
 // pendência para retomada, já que ele não aparece na lista de certames efetivamente salvos.
 const [rascunho, setRascunho] = useState<RascunhoCertame | null>(() => lerRascunhoCertame());
 const descartarRascunho = () => {
  if (!window.confirm("Descartar o rascunho deste cadastro? O progresso não salvo será perdido.")) return;
  limparRascunhoCertame();
  setRascunho(null);
 };

 const exercicios = useMemo(() => Array.from(new Set(certames.map((item) => item.anoConcurso))).sort((a, b) => b - a).map((ano) => String(ano)), [certames]);

 // Cards de indicadores acima do filtro — mesmo padrão de "Efetivo Exercício"/"Controle de Vagas"
 // (faixa de KPIs resumindo a lista antes de filtrar).
 const indicadores = useMemo(() => [
  { label:"Total de certames", value:certames.length, icon:"pi pi-briefcase", tone:"blue" },
  { label:"Em abertura", value:certames.filter((item) => item.situacaoAtual === "ABERTO").length, icon:"pi pi-hourglass", tone:"amber" },
  { label:"Homologados", value:certames.filter((item) => item.situacaoAtual === "HOMOLOGADO").length, icon:"pi pi-check-circle", tone:"green" },
  { label:"Cancelados/Paralisados", value:certames.filter((item) => item.situacaoAtual === "CANCELADO_ANULADO" || item.situacaoAtual === "PARALISADO").length, icon:"pi pi-ban", tone:"red" },
 ], [certames]);

 const lista = useMemo(() => {
  const termoNormalizado = normalizar(termo.trim());
  return certames.filter((certame) =>
   (!termoNormalizado || normalizar(`${certame.nomeEdital} ${certame.numeroEditalOrgao} ${certame.setor}`).includes(termoNormalizado)) &&
   (!orgaoFiltro || certame.setor === orgaoFiltro) &&
   (!exercicioFiltro || String(certame.anoConcurso) === exercicioFiltro) &&
   (!tipoFiltro || certame.tipoCertame === tipoFiltro) &&
   (!situacaoFiltro || certame.situacaoAtual === situacaoFiltro),
  );
 }, [certames, termo, orgaoFiltro, exercicioFiltro, tipoFiltro, situacaoFiltro]);

 const totalPaginas = Math.max(1, Math.ceil(lista.length / itensPorPagina));
 const paginaAtual = Math.min(pagina, totalPaginas);
 const listaPaginada = lista.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

 const limparFiltros = () => {
  reset({ termo:"" });
  setOrgaoFiltro(""); setExercicioFiltro(""); setTipoFiltro(""); setSituacaoFiltro("");
  setPagina(1);
 };

 return <SpecificationMode screen={certamesListScreenSpecification} businessItems={certamesListBusinessItems}>
  <div className="prototype-page-content prototype-page-content--white prototype-ingressos-teste-list-page">
   <CardSeplag title="Cadastro de Certames" cols="12" cardHeaderClassNames="prototype-regime-card prototype-ingressos-card" actions={<BotaoAdicionarSeplag label="Cadastrar" onClick={() => navigate(`${BASE}/certames/novo`)} />}>
    <div className="col-12"><div className="prototype-ingressos-teste-content">
     <SpecArea metadata={certamesListBlockSpecifications.aviso}><p className="prototype-ingressos-teste-support">Concursos Públicos e Processos Seletivos Simplificados cadastrados no SIGEP com base no edital publicado, para fins de vínculo do candidato e prestação de contas ao TCE-MT.</p></SpecArea>
     <hr className="prototype-ingressos-teste-header-divider" />

     <section className="prototype-ingressos-teste-indicators" aria-label="Indicadores de certames">
      {indicadores.map((indicador) => <article key={indicador.label} className={`prototype-ingressos-teste-indicator prototype-ingressos-teste-indicator--${indicador.tone}`}>
       <span className="prototype-ingressos-teste-indicator-icon" aria-hidden="true"><i className={indicador.icon} /></span>
       <div><span>{indicador.label}</span><strong>{indicador.value.toLocaleString("pt-BR")}</strong></div>
      </article>)}
     </section>

     {rascunho && <div className="prototype-certames-rascunho-aviso">
      <i className="pi pi-file-edit" aria-hidden="true" />
      <div className="prototype-certames-rascunho-info">
       <div className="prototype-certames-rascunho-titulo">
        <strong>{rascunho.valores.nomeEdital || "Novo certame"}</strong>
        <BadgeSeplag label="Em andamento" color="#8a5c00" bg="#fff1cf" border="transparent" size="sm" />
       </div>
       <span>Cadastro iniciado, ainda não salvo — parou na etapa "{abaLabel[rascunho.aba]}".</span>
      </div>
      <div className="prototype-certames-rascunho-acoes">
       <BotaoSeplag type="button" label="Continuar cadastro" icon="pi pi-arrow-right" iconPos="right" onClick={() => navigate(`${BASE}/certames/novo`)} />
       <BotaoIconSeplag type="button" severity="danger" tooltip="Descartar rascunho" icon="pi pi-trash" onClick={descartarRascunho} />
      </div>
     </div>}

     <div className="prototype-category-filters prototype-ingressos-filters prototype-certame-list-filters grid">
      <TextFieldSeplag name="termo" control={control} label="Pesquisar" cols="12" placeholder="Nome ou número do edital, órgão" getFormErrorMessage={() => null} />
      <SpecArea metadata={certamesListFilterSpecifications["Órgão"]}><label className="prototype-native-field">
       <span>Órgão</span>
       <select value={orgaoFiltro} onChange={(event) => { setOrgaoFiltro(event.target.value); setPagina(1); }}>
        <option value="">Todos</option>
        {ORGAOS_CERTAME.map((item) => <option key={item} value={item}>{item}</option>)}
       </select>
      </label></SpecArea>
      <SpecArea metadata={certamesListFilterSpecifications["Exercício"]}><label className="prototype-native-field">
       <span>Exercício</span>
       <select value={exercicioFiltro} onChange={(event) => { setExercicioFiltro(event.target.value); setPagina(1); }}>
        <option value="">Todos</option>
        {exercicios.map((ano) => <option key={ano} value={ano}>{ano}</option>)}
       </select>
      </label></SpecArea>
      <SpecArea metadata={certamesListFilterSpecifications["Tipo"]}><label className="prototype-native-field">
       <span>Tipo</span>
       <select value={tipoFiltro} onChange={(event) => { setTipoFiltro(event.target.value as TipoCertame | ""); setPagina(1); }}>
        <option value="">Todos</option>
        {TIPOS_CERTAME.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
       </select>
      </label></SpecArea>
      <SpecArea metadata={certamesListFilterSpecifications["Situação"]}><label className="prototype-native-field">
       <span>Situação</span>
       <select value={situacaoFiltro} onChange={(event) => { setSituacaoFiltro(event.target.value as SituacaoCertame | ""); setPagina(1); }}>
        <option value="">Todas</option>
        {SITUACOES_CERTAME.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
       </select>
      </label></SpecArea>
      <div className="prototype-category-clear">
       <BotaoLimparFiltroSeplag type="button" label="Limpar filtros" icon="pi pi-refresh" onClick={limparFiltros} />
      </div>
     </div>

     <SpecArea metadata={certamesListBlockSpecifications.lista}><div className="prototype-efetivo-exercicio-table-wrap">
      <table className="prototype-simple-table">
       <thead>
        <tr>
         <th>Certame</th>
         <th>Órgão mandante</th>
         <th>Tipo</th>
         <th>Vagas</th>
         <th>Cotas</th>
         <th>Situação do certame</th>
         <th>Ações</th>
        </tr>
       </thead>
       <tbody>
        {listaPaginada.length === 0
         ? <tr><td colSpan={7} className="prototype-empty-table-cell">Nenhum certame encontrado para os filtros informados.</td></tr>
         : listaPaginada.map((row:Certame) => {
          const menuId = row.id;
          return (
           <tr key={row.id}>
            <td><strong>{row.numeroEditalOrgao}</strong><div className="text-sm text-color-secondary">{row.nomeEdital}</div></td>
            <td>{row.setor}</td>
            <td>{tipoLabel[row.tipoCertame]}</td>
            <td>{row.cargos.reduce((total, cargo) => total + cargo.quantidadeVagas, 0).toLocaleString("pt-BR")}</td>
            <td>{row.cotas.length}</td>
            <td><BadgeSeplag label={situacaoLabel[row.situacaoAtual]} color={situacaoEstilo[row.situacaoAtual].color} bg={situacaoEstilo[row.situacaoAtual].bg} border="transparent" size="sm" /></td>
            <td>
             <div className="prototype-ingresso-candidato-actions">
              <div className="prototype-ingresso-actions-dropdown">
               <div className="prototype-ingresso-actions-trigger" role="group" aria-label="Ações do certame">
                <button type="button" className="prototype-ingresso-actions-eye" title="Visualizar" aria-label="Visualizar" onClick={() => navigate(`${BASE}/certames/${row.id}`)}>
                 <i className="pi pi-eye" aria-hidden="true" />
                </button>
                <button type="button" className="prototype-ingresso-actions-arrow" title="Mais ações" aria-label="Mais ações" aria-expanded={acoesMenuAbertoId === menuId} onClick={() => setAcoesMenuAbertoId((atual) => atual === menuId ? null : menuId)}>
                 <i className="pi pi-chevron-down" aria-hidden="true" />
                </button>
               </div>
               {acoesMenuAbertoId === menuId && <div className="prototype-ingresso-actions-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => { setAcoesMenuAbertoId(null); navigate(`${BASE}/certames/${row.id}`); }}>
                 <i className="pi pi-pencil" aria-hidden="true" /><span>Editar</span>
                </button>
                <button type="button" role="menuitem" onClick={() => { setAcoesMenuAbertoId(null); setCertameSituacoesId(row.id); }}>
                 <i className="pi pi-history" aria-hidden="true" /><span>Situação / Histórico</span>
                </button>
               </div>}
              </div>
             </div>
            </td>
           </tr>
          );
         })}
       </tbody>
      </table>
     </div></SpecArea>

     <nav className="prototype-efetivo-exercicio-pagination" aria-label="Paginação de certames">
      <button type="button" aria-label="Primeira página" disabled={paginaAtual === 1} onClick={() => setPagina(1)}><i className="pi pi-angle-double-left" aria-hidden="true" /></button>
      <button type="button" aria-label="Página anterior" disabled={paginaAtual === 1} onClick={() => setPagina((atual) => Math.max(1, atual - 1))}><i className="pi pi-angle-left" aria-hidden="true" /></button>
      <span aria-current="page">{paginaAtual}</span>
      <button type="button" aria-label="Próxima página" disabled={paginaAtual === totalPaginas} onClick={() => setPagina((atual) => Math.min(totalPaginas, atual + 1))}><i className="pi pi-angle-right" aria-hidden="true" /></button>
      <button type="button" aria-label="Última página" disabled={paginaAtual === totalPaginas} onClick={() => setPagina(totalPaginas)}><i className="pi pi-angle-double-right" aria-hidden="true" /></button>
      <select aria-label="Itens por página" value={itensPorPagina} onChange={(event) => { setItensPorPagina(Number(event.target.value)); setPagina(1); }}>
       {ITENS_POR_PAGINA_OPCOES.map((opcao) => <option key={opcao} value={opcao}>{opcao}</option>)}
      </select>
     </nav>
    </div></div>
   </CardSeplag>
  </div>
  {certameSituacoesId && <SituacoesCertameModal certameId={certameSituacoesId} onClose={() => setCertameSituacoesId(null)} />}
 </SpecificationMode>;
}
