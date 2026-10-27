import { useRef, useState } from "react";
import { Menu } from "primereact/menu";
import { useNavigate, useLocation } from "react-router-dom";
import { carregarGestaoLicencas } from "./solicitacaoModel";
import { CardSeplag } from "../../componentes/Card";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { PaginacaoV2 } from "../vinculos/VinculoV2Page";

import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import {
  GESTAO_LICENCAS_PATH,
  TITULO_GESTAO_LICENCAS,
  filtrosIniciais,
  filtrarLicencas,
  indicadoresLicencas,
  opcoesUnicas,
  dataLicenca,
  type RegistroLicenca,
  type FiltrosGestaoLicencas,
} from "./model";
import "../vinculos/vinculoV2.css";
import "./gestaoLicencas.css";
import { EditarLancamentoModal } from "./EditarLancamentoModal";
import { HistoricoLancamentoModal } from "./HistoricoLancamentoModal";

function AcoesLicenca({ registro, onEditar, onHistorico }: { registro: RegistroLicenca; onEditar: (registro: RegistroLicenca) => void; onHistorico: (registro: RegistroLicenca) => void }) {
  const navigate = useNavigate();
  const menu = useRef<Menu>(null);
  const [aberto, setAberto] = useState(false);
  return (
    <div className="gl-actions">
      <button
        type="button"
        aria-label={`Visualizar licença de ${registro.nome}`}
        title="Visualizar"
        onClick={() =>
          navigate(`${GESTAO_LICENCAS_PATH}/${registro.id}/visualizar`)
        }
      >
        <i className="pi pi-eye" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={`Ações de ${registro.nome}`}
        title="Mais ações"
        aria-haspopup="menu"
        aria-controls={`gl-acoes-${registro.id}`}
        aria-expanded={aberto}
        onClick={(e) => menu.current?.toggle(e)}
      >
        <i className="pi pi-chevron-down" aria-hidden="true" />
      </button>
      <Menu
        ref={menu}
        popup
        id={`gl-acoes-${registro.id}`}
        onShow={() => setAberto(true)}
        onHide={() => setAberto(false)}
        model={[
          {
            label: "Editar",
            icon: "pi pi-pencil",
            command: () => onEditar(registro),
          },
          {
            label: "Histórico",
            icon: "pi pi-history",
            command: () => onHistorico(registro),
          },
        ]}
      />
    </div>
  );
}
function Situacao({ valor }: { valor: RegistroLicenca["situacao"] }) {
  return (
    <span
      className={`gl-pill gl-status-${valor === "Em andamento" ? "vigente" : "encerrado"}`}
    >
      {valor}
    </span>
  );
}

export function GestaoLicencasContent({
  registros = carregarGestaoLicencas(),
}: { registros?: readonly RegistroLicenca[] } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [edicao, setEdicao] = useState<RegistroLicenca | null>(null);
  const [historico, setHistorico] = useState<RegistroLicenca | null>(null);
  const [alteracaoSalva, setAlteracaoSalva] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosGestaoLicencas>({
    ...filtrosIniciais,
  });

  const [pagina, setPagina] = useState(1),
    [porPagina, setPorPagina] = useState(10);
  const filtrados = filtrarLicencas(registros, filtros);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice(
    (paginaAtual - 1) * porPagina,
    paginaAtual * porPagina,
  );
  const lotacoes = opcoesUnicas(
    registros
      .filter((r) => !filtros.orgao || r.orgao === filtros.orgao)
      .map((r) => r.lotacao),
  );
  const alterar = (campo: keyof FiltrosGestaoLicencas, valor: string) => {
    setPagina(1);
    setFiltros((f) => ({
      ...f,
      [campo]: valor,
      ...(campo === "orgao" ? { lotacao: "" } : {}),
    }));
  };
  return (
    <div className="v2v-page gl-page">
      {(location.state?.solicitacaoSalva || alteracaoSalva) && (
        <p role="status" className="v2v-notice">
          Lançamento salvo com sucesso.
        </p>
      )}
      <div>
        <section
          className="v2v-kpis gl-kpis"
          aria-label="Resumo de licenças e afastamentos"
        >
          {indicadoresLicencas(registros).map((k) => (
            <article key={k.label} className={`gl-kpi-${k.cor}`}>
              <i className={`pi ${k.icone}`} aria-hidden="true" />
              <div>
                <span>{k.label}</span>
                <strong>{k.valor}</strong>
              </div>
            </article>
          ))}
        </section>
        <p className="gl-referencias">
          <i className="pi pi-info-circle" aria-hidden="true" />
          Diretrizes e Fechamento de Licenças (LC 266/2006 &amp; LC 04/1990)
        </p>
        <section
          className="v2v-panel gl-filtros"
          aria-label="Filtros de licenças e afastamentos"
        >
          <div className="gl-filter-grid">
            <label>
              Órgão
              <select
                value={filtros.orgao}
                onChange={(e) => alterar("orgao", e.target.value)}
              >
                <option value="">Todos</option>
                {opcoesUnicas(registros.map((r) => r.orgao)).map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <label>
              Setor / Lotação
              <select
                value={filtros.lotacao}
                onChange={(e) => alterar("lotacao", e.target.value)}
              >
                <option value="">Todos</option>
                {lotacoes.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <label>
              Servidor
              <input
                placeholder="Matrícula ou nome"
                value={filtros.servidor}
                onChange={(e) => alterar("servidor", e.target.value)}
              />
            </label>
            <label>
              Situação
              <select
                value={filtros.situacao}
                onChange={(e) => alterar("situacao", e.target.value)}
              >
                <option value="">Todas</option>
                {["Em andamento", "Encerrado"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <label>
              Tipo
              <select
                value={filtros.tipo}
                onChange={(e) => alterar("tipo", e.target.value)}
              >
                <option value="">Todos</option>
                {opcoesUnicas(registros.map((r) => r.tipo)).map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="v2v-primary gl-limpar"
              onClick={() => {
                setFiltros({ ...filtrosIniciais });
                setPagina(1);
              }}
            >
              <i className="pi pi-refresh" aria-hidden="true" />
              Limpar filtro
            </button>
          </div>
        </section>
        <div className="gl-toolbar">
          <button
            type="button"
            className="v2v-primary"
            onClick={() => navigate(`${GESTAO_LICENCAS_PATH}/novo`)}
          >
            <i className="pi pi-plus" aria-hidden="true" />
            Nova solicitação de licença
          </button>
        </div>
        <div
          className="gl-table-scroll"
          role="region"
          aria-label="Registros de licenças e afastamentos"
          tabIndex={0}
        >
          <table
            className="v2v-table gl-table"
            aria-label="Licenças e afastamentos"
          >
            <thead>
              <tr>
                {[
                  "Matrícula/Vínculo",
                  "Lotação",
                  "Nome Servidor",
                  "Período do Afastamento",
                  "Tipo",
                  "Situação",
                  "Ações",
                ].map((c) => (
                  <th scope="col" key={c}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visiveis.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>
                      {r.matricula} / {r.vinculo}
                    </strong>
                    <small>{r.tipoVinculo}</small>
                  </td>
                  <td>
                    {r.orgao}
                    <small>{r.lotacao}</small>
                  </td>
                  <td>
                    {r.nome}
                    <small>{r.cargo}</small>
                  </td>
                  <td>
                    {dataLicenca(r.inicio)} a {dataLicenca(r.fim)}
                  </td>
                  <td>
                    <span className="gl-pill gl-tipo">{r.tipo}</span>
                  </td>
                  <td>
                    <Situacao valor={r.situacao} />
                  </td>
                  <td>
                    <AcoesLicenca registro={r} onEditar={setEdicao} onHistorico={setHistorico} />
                  </td>
                </tr>
              ))}
              {!filtrados.length && (
                <tr>
                  <td colSpan={7} className="v2v-empty" role="status">
                    Nenhum registro encontrado para os filtros informados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {edicao && <EditarLancamentoModal registro={edicao} onClose={() => setEdicao(null)} onSaved={() => { setEdicao(null); setAlteracaoSalva(true); }} />}
      {historico && <HistoricoLancamentoModal registro={historico} onClose={() => setHistorico(null)} />}
      <PaginacaoV2
        nome="licenças e afastamentos"
        pagina={paginaAtual}
        totalPaginas={totalPaginas}
        porPagina={porPagina}
        mudarPagina={setPagina}
        mudarPorPagina={(quantidade) => {
          setPorPagina(quantidade);
          setPagina(1);
        }}
      />
    </div>
  );
}

export function GestaoLicencasPage() {
  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <main className="prototype-page-content prototype-page-content--white v2v-shell gl-shell">
        <CardSeplag
          title={TITULO_GESTAO_LICENCAS}
          cols="12"
          cardHeaderClassNames="prototype-carreira-card v2v-card"
          headerNavigation={
            <BreadcrumbSeplag
              divided
              items={[
                {
                  label: "Direitos e Benefícios",
                  to: "/prototipos/sigep/direitos-beneficios",
                },
                { label: TITULO_GESTAO_LICENCAS, to: GESTAO_LICENCAS_PATH },
              ]}
            />
          }
        >
          <GestaoLicencasContent />
        </CardSeplag>
      </main>
    </PrototypeSystemPage>
  );
}
