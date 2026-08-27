import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CONTROLE_PSS_BASE_PATH as BASE } from "../constants";
import { TIPOS_FASE_CONCURSO_TCE } from "../certame/dominios";
import { fasesCertameStore, useFasesCertame, type FaseCertameCatalogo } from "./fasesCertameStore";
import { CardSeplag } from "@componentes/Card";
import { BotaoAdicionarSeplag, BotaoIconSeplag, BotaoLimparFiltroSeplag } from "@componentes/Botao";
import { SEPLAG_SUCCESS_DARK, SEPLAG_YELLOW } from "../../../tokens/colors";

const normalizar = (valor:string) => valor.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR");

const ITENS_POR_PAGINA_OPCOES = [5, 10, 20];

export function FasesCertameListContent() {
 const fases = useFasesCertame();
 const navigate = useNavigate();
 const [nomeFiltro, setNomeFiltro] = useState("");
 const [origemFiltro, setOrigemFiltro] = useState("");
 const [pagina, setPagina] = useState(1);
 const [itensPorPagina, setItensPorPagina] = useState(10);

 const lista = useMemo(() => {
  const termo = normalizar(nomeFiltro.trim());
  return fases.filter((fase) =>
   (!termo || normalizar(fase.nome).includes(termo)) &&
   (!origemFiltro || (origemFiltro === "TCE" ? Boolean(fase.tipoTceId) : !fase.tipoTceId)),
  );
 }, [fases, nomeFiltro, origemFiltro]);

 const totalPaginas = Math.max(1, Math.ceil(lista.length / itensPorPagina));
 const paginaAtual = Math.min(pagina, totalPaginas);
 const listaPaginada = lista.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

 const limparFiltros = () => { setNomeFiltro(""); setOrigemFiltro(""); setPagina(1); };

 const rotuloTipoTce = (tipoTceId?:string) => TIPOS_FASE_CONCURSO_TCE.find((tipo) => tipo.value === tipoTceId)?.label;

 return <div className="prototype-page-content prototype-page-content--white prototype-ingressos-teste-list-page">
  <CardSeplag title="Fase do Certame" cols="12" cardHeaderClassNames="prototype-regime-card prototype-ingressos-card" actions={<BotaoAdicionarSeplag label="Cadastrar" onClick={() => navigate(`${BASE}/fases-certame/novo`)} />}>
   <div className="col-12"><div className="prototype-ingressos-teste-content">
    <p className="prototype-ingressos-teste-support">Consulte, cadastre e gerencie as fases disponíveis para o cronograma dos certames.</p>
    <hr className="prototype-ingressos-teste-header-divider" />

    <div className="prototype-category-filters prototype-ingressos-filters grid">
     <label className="prototype-native-field">
      <span>Fase</span>
      <input type="text" value={nomeFiltro} placeholder="Nome da fase" onChange={(event) => { setNomeFiltro(event.target.value); setPagina(1); }} />
     </label>
     <label className="prototype-native-field">
      <span>Origem</span>
      <select value={origemFiltro} onChange={(event) => { setOrigemFiltro(event.target.value); setPagina(1); }}>
       <option value="">Todas</option>
       <option value="TCE">Tabela do TCE-MT</option>
       <option value="PERSONALIZADA">Personalizada</option>
      </select>
     </label>
     <div className="prototype-category-clear">
      <BotaoLimparFiltroSeplag type="button" label="Limpar filtro" icon="pi pi-refresh" onClick={limparFiltros} style={{ width:"auto", minWidth:150, paddingInline:14, whiteSpace:"nowrap" }} />
     </div>
    </div>

    <div className="prototype-efetivo-exercicio-table-wrap">
     <table className="prototype-simple-table">
      <thead>
       <tr>
        <th>Fase</th>
        <th>Origem</th>
        <th>Ações</th>
       </tr>
      </thead>
      <tbody>
       {listaPaginada.length === 0
        ? <tr><td colSpan={3} className="prototype-empty-table-cell">Nenhum registro encontrado para os filtros informados.</td></tr>
        : listaPaginada.map((row:FaseCertameCatalogo) => (
         <tr key={row.id}>
          <td><strong>{row.nome}</strong>{row.situacao === "INATIVO" && <div className="text-sm text-color-secondary">Inativo</div>}</td>
          <td>{row.tipoTceId ? <span title={rotuloTipoTce(row.tipoTceId)}>Tabela do TCE-MT</span> : "Personalizada"}</td>
          <td>
           <div className="flex gap-2">
            <BotaoIconSeplag type="button" tooltip="Editar" icon="pi pi-pencil" style={{ backgroundColor:SEPLAG_YELLOW, borderColor:SEPLAG_YELLOW }} onClick={() => navigate(`${BASE}/fases-certame/${row.id}`)} />
            <BotaoIconSeplag type="button" severity={row.situacao === "ATIVO" ? "danger" : "success"} style={row.situacao === "ATIVO" ? undefined : { backgroundColor:SEPLAG_SUCCESS_DARK, borderColor:SEPLAG_SUCCESS_DARK }} tooltip={row.situacao === "ATIVO" ? "Inativar" : "Ativar"} icon={row.situacao === "ATIVO" ? "pi pi-ban" : "pi pi-check"} onClick={() => fasesCertameStore.toggleSituacao(row.id)} />
           </div>
          </td>
         </tr>
        ))}
      </tbody>
     </table>
    </div>

    <nav className="prototype-efetivo-exercicio-pagination" aria-label="Paginação de fases do certame">
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
