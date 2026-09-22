import { Suspense, lazy, useState } from "react";
import { NavLink, Outlet, useParams, useLocation } from "react-router-dom";
import { addLocale, locale, PrimeReactProvider } from "primereact/api";
import pkg from "../../../package.json";
import { getDocsByCategory, getDocEntry } from "../config";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "../compat.css";
import "./DocsLayout.css";

// Registra o locale pt-BR para todos os componentes PrimeReact na docs
addLocale("pt", {
  firstDayOfWeek: 0,
  dayNames: ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"],
  dayNamesShort: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
  dayNamesMin: ["D", "S", "T", "Q", "Q", "S", "S"],
  monthNames: [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ],
  monthNamesShort: [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ],
  today: "Hoje",
  clear: "Limpar",
  dateFormat: "dd/mm/yy",
  weekHeader: "Sem",
  chooseDate: "Escolher data",
  prevDecade: "Década anterior",
  nextDecade: "Próxima década",
  prevYear: "Ano anterior",
  nextYear: "Próximo ano",
  prevMonth: "Mês anterior",
  nextMonth: "Próximo mês",
  prevHour: "Hora anterior",
  nextHour: "Próxima hora",
  prevMinute: "Minuto anterior",
  nextMinute: "Próximo minuto",
  prevSecond: "Segundo anterior",
  nextSecond: "Próximo segundo",
  am: "AM",
  pm: "PM",
  choose: "Escolher",
  upload: "Enviar",
  cancel: "Cancelar",
  fileSizeTypes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
  aria: {
    trueLabel: "Verdadeiro",
    falseLabel: "Falso",
    nullLabel: "Não selecionado",
    star: "1 estrela",
    stars: "{star} estrelas",
    selectAll: "Todos os itens selecionados",
    unselectAll: "Todos os itens desmarcados",
    close: "Fechar",
    previous: "Anterior",
    next: "Próximo",
    navigation: "Navegação",
    scrollTop: "Rolar ao topo",
    moveTop: "Mover ao topo",
    moveUp: "Mover acima",
    moveDown: "Mover abaixo",
    moveBottom: "Mover ao fundo",
    moveToTarget: "Mover para destino",
    moveToSource: "Mover para origem",
    moveAllToTarget: "Mover tudo para destino",
    moveAllToSource: "Mover tudo para origem",
    pageLabel: "Página {page}",
    firstPageLabel: "Primeira página",
    lastPageLabel: "Última página",
    nextPageLabel: "Próxima página",
    prevPageLabel: "Página anterior",
    rowsPerPageLabel: "Linhas por página",
    jumpToPageDropdownLabel: "Ir para página",
    jumpToPageInputLabel: "Ir para página",
    selectRow: "Linha selecionada",
    unselectRow: "Linha desmarcada",
    expandRow: "Linha expandida",
    collapseRow: "Linha recolhida",
    showFilterMenu: "Mostrar menu de filtro",
    hideFilterMenu: "Ocultar menu de filtro",
    filterOperator: "Operador de filtro",
    filterConstraint: "Restrição de filtro",
    editRow: "Editar linha",
    saveEdit: "Salvar edição",
    cancelEdit: "Cancelar edição",
    listView: "Visualização em lista",
    gridView: "Visualização em grade",
    slide: "Slide",
    slideNumber: "{slideNumber}",
    zoomImage: "Ampliar imagem",
    zoomIn: "Ampliar",
    zoomOut: "Reduzir",
    rotateRight: "Girar à direita",
    rotateLeft: "Girar à esquerda",
  },
});
locale("pt");

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

function DocsSidebar() {
  const categories = getDocsByCategory();
  const location = useLocation();

  const activeCategory = categories.find((cat) =>
    cat.entries.some((e) => location.pathname === `/docs/${e.id}`),
  )?.label;

  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set(activeCategory ? [activeCategory] : [categories[0]?.label]),
  );
  const [filter, setFilter] = useState("");

  const normalizedFilter = filter.trim().toLowerCase();
  const isFiltering = normalizedFilter !== "";

  const filteredCategories = isFiltering
    ? categories
        .map((cat) => ({
          ...cat,
          entries: cat.entries.filter((e) => e.label.toLowerCase().includes(normalizedFilter)),
        }))
        .filter((cat) => cat.entries.length > 0)
    : categories;

  const toggleCategory = (label: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  return (
    <aside className="docs-sidebar">
      <div className="docs-sidebar-header">
        <NavLink to="/docs" className="docs-sidebar-home-link">
          <span className="docs-sidebar-logo">SEPLAG</span>
        </NavLink>
        <span className="docs-sidebar-version">v{pkg.version}</span>
        <NavLink to="/" className="docs-sidebar-back-home" title="Voltar à página inicial">
          <i className="pi pi-home" />
        </NavLink>
      </div>

      <div className="docs-sidebar-search-wrapper">
        <i className="pi pi-search docs-sidebar-search-icon" />
        <input
          type="text"
          className="docs-sidebar-search"
          placeholder="Buscar componente…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filtrar componentes"
        />
        {isFiltering && (
          <button
            type="button"
            className="docs-sidebar-search-clear"
            onClick={() => setFilter("")}
            aria-label="Limpar busca"
          >
            <i className="pi pi-times" />
          </button>
        )}
      </div>

      <nav className="docs-sidebar-nav" aria-label="Componentes">
        {filteredCategories.map((cat) => {
          const isOpen = isFiltering || openCategories.has(cat.label);
          return (
            <div key={cat.label} className="docs-sidebar-group">
              <button
                type="button"
                className="docs-sidebar-category-toggle"
                onClick={() => toggleCategory(cat.label)}
                aria-expanded={isOpen}
              >
                <span>{cat.label}</span>
                <i
                  className={`pi ${isOpen ? "pi-chevron-down" : "pi-chevron-right"} docs-sidebar-chevron`}
                />
              </button>
              {isOpen && (
                <div className="docs-sidebar-entries">
                  {cat.entries.map((entry) => (
                    <NavLink
                      key={entry.id}
                      to={`/docs/${entry.id}`}
                      className={({ isActive }) => {
                        const highlight =
                          entry.id === "fields-playground" ? " docs-sidebar-link--highlight" : "";
                        return `docs-sidebar-link${isActive ? " active" : ""}${highlight}`;
                      }}
                    >
                      {entry.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// HomeDoc — lazy import
// ---------------------------------------------------------------------------

const HomeDoc = lazy(() => import("../pages/Home/HomeDoc"));

// ---------------------------------------------------------------------------
// Content area — renders the matching doc component by :id
// ---------------------------------------------------------------------------

function DocsRenderer() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <Suspense
        fallback={
          <div className="docs-content-empty">
            <p>Carregando…</p>
          </div>
        }
      >
        <HomeDoc />
      </Suspense>
    );
  }

  const entry = getDocEntry(id);

  if (!entry) {
    return (
      <div className="docs-content-empty">
        <h3>Componente não encontrado.</h3>
        <p>
          Verifique o ID <code>{id}</code> em <code>src/docs/config.ts</code>.
        </p>
      </div>
    );
  }

  const Component = entry.component;
  return (
    <Suspense
      fallback={
        <div className="docs-content-empty">
          <p>Carregando documentação…</p>
        </div>
      }
    >
      <Component />
    </Suspense>
  );
}

// ---------------------------------------------------------------------------
// Layout shell
// ---------------------------------------------------------------------------

export function DocsLayout() {
  return (
    <PrimeReactProvider value={{ ripple: true }}>
      <div className="docs-shell">
        <DocsSidebar />
        <main className="docs-content">
          <Outlet />
        </main>
      </div>
    </PrimeReactProvider>
  );
}

export { DocsRenderer };
