import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CONTROLE_PSS_BASE_PATH as BASE } from "../constants";
import { LEIS_CERTAME } from "../certame/dominios";
import { useDocumentosLegais } from "../../documentosLegais/documentosLegaisStore";
import { tiposCotaStore, useTiposCota, type TipoCota } from "./tiposCotaStore";
import { CardSeplag } from "@componentes/Card";
import { BadgeSeplag } from "@componentes/Badge";
import { BotaoAdicionarSeplag, BotaoIconSeplag, BotaoLimparFiltroSeplag } from "@componentes/Botao";
import { SEPLAG_SUCCESS_DARK, SEPLAG_YELLOW } from "../../../tokens/colors";

const normalizar = (valor:string) => valor.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR");

const ITENS_POR_PAGINA_OPCOES = [5, 10, 20];

// Mesmo padrão de tela de Locais (LocaisListContent) e Fase do Certame (FasesCertameListContent):
// listagem com filtro simples, cadastrar/editar em página própria, ativar/inativar em vez de excluir
// (evita quebrar cotas já registradas em certames que referenciam este código).
export function TiposCotaListContent() {
 const tiposCota = useTiposCota();
 const navigate = useNavigate();
 const [nomeFiltro, setNomeFiltro] = useState("");
 const [pagina, setPagina] = useState(1);
 const [itensPorPagina, setItensPorPagina] = useState(10);

 // Mesma fonte de leis do formulário (LEIS_CERTAME + Documentos Legais cadastrados), só para
 // resolver o título exibido na coluna "Lei".
 const documentosLegaisCadastrados = useDocumentosLegais();
 const tituloLei = useMemo(() => {
  const mapa = new Map<string, string>();
  for (const lei of LEIS_CERTAME) mapa.set(lei.value, lei.label);
  for (const documento of documentosLegaisCadastrados) mapa.set(documento.id, documento.titulo);
  return (id:string) => mapa.get(id) ?? id;
 }, [documentosLegaisCadastrados]);

 const lista = useMemo(() => {
  const termo = normalizar(nomeFiltro.trim());
  return tiposCota.filter((item) => !termo || normalizar(item.label).includes(termo) || normalizar(item.value).includes(termo));
 }, [tiposCota, nomeFiltro]);

 const totalPaginas = Math.max(1, Math.ceil(lista.length / itensPorPagina));
 const paginaAtual = Math.min(pagina, totalPaginas);
 const listaPaginada = lista.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

 const limparFiltros = () => { setNomeFiltro(""); setPagina(1); };

 return <div className="prototype-page-content prototype-page-content--white prototype-ingressos-teste-list-page">
  <CardSeplag title="Tipos de Cota" cols="12" cardHeaderClassNames="prototype-regime-card prototype-ingressos-card">
   <div className="col-12"><div className="prototype-ingressos-teste-content">
    <p className="prototype-ingressos-teste-support">Consulte, cadastre e gerencie os tipos de cota previstos em lei para os certames.</p>
    <hr className="prototype-ingressos-teste-header-divider" />

    <div className="prototype-category-filters prototype-ingressos-filters grid">
     <label className="prototype-native-field">
      <span>Tipo de cota</span>
      <input type="text" value={nomeFiltro} placeholder="Código ou nome" onChange={(event) => { setNomeFiltro(event.target.value); setPagina(1); }} />
     </label>
     <div className="prototype-category-clear">
      <BotaoLimparFiltroSeplag type="button" label="Limpar filtro" icon="pi pi-refresh" onClick={limparFiltros} style={{ width:"auto", minWidth:150, paddingInline:14, whiteSpace:"nowrap" }} />
     </div>
    </div>

    <div className="prototype-ingressos-teste-table-shell">
     <div className="prototype-ingressos-teste-table-actions">
      <BotaoAdicionarSeplag label="Cadastrar" onClick={() => navigate(`${BASE}/tipos-cota/novo`)} />
     </div>
     <div className="prototype-efetivo-exercicio-table-wrap">
      <table className="prototype-simple-table prototype-locais-table">
      <thead>
       <tr>
        <th>Tipo de cota</th>
        <th>Lei</th>
        <th>Situação</th>
        <th>Ações</th>
       </tr>
      </thead>
      <tbody>
       {listaPaginada.length === 0
        ? <tr><td colSpan={4} className="prototype-empty-table-cell">Nenhum registro encontrado para os filtros informados.</td></tr>
        : listaPaginada.map((row:TipoCota) => (
         <tr key={row.id}>
          <td><BadgeSeplag label={row.label} color="#0b6199" bg="#e9f3fc" border="transparent" size="sm" /></td>
          <td>{row.lei.length === 0 ? "—" : row.lei.map(tituloLei).join(", ")}</td>
          <td><span className={`prototype-locais-status ${row.situacao === "ATIVO" ? "is-active" : "is-inactive"}`}>{row.situacao === "ATIVO" ? "Ativo" : "Inativo"}</span></td>
          <td>
           <div className="flex gap-2">
            <BotaoIconSeplag type="button" tooltip="Editar" icon="pi pi-pencil" style={{ backgroundColor:SEPLAG_YELLOW, borderColor:SEPLAG_YELLOW }} onClick={() => navigate(`${BASE}/tipos-cota/${row.id}`)} />
            <BotaoIconSeplag type="button" severity={row.situacao === "ATIVO" ? "danger" : "success"} style={row.situacao === "ATIVO" ? undefined : { backgroundColor:SEPLAG_SUCCESS_DARK, borderColor:SEPLAG_SUCCESS_DARK }} tooltip={row.situacao === "ATIVO" ? "Inativar" : "Ativar"} icon={row.situacao === "ATIVO" ? "pi pi-ban" : "pi pi-check"} onClick={() => tiposCotaStore.toggleSituacao(row.id)} />
           </div>
          </td>
         </tr>
        ))}
      </tbody>
      </table>
     </div>
    </div>

    <nav className="prototype-efetivo-exercicio-pagination" aria-label="Paginação de tipos de cota">
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
 </div>;
}
