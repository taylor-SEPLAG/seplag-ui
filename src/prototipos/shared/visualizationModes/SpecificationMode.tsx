import {
  createContext,
  cloneElement,
  isValidElement,
  useContext,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import "./specificationMode.css";
import { ReviewPersistencePanel } from "./ReviewPersistencePanel";

export interface SpecificationMetadata {
  id: string;
  title: string;
  description: string;
  businessRule: string;
  source: string;
  dataType: string;
  component: string;
  componentUrl?: string;
  componentSource?: string;
  behavior?: string;
  filters?: string;
  route?: string;
  userStory?: string;
  status?: "CONFIRMADO" | "PENDENTE";
}

type ViewMode = "DEVELOPER" | "BUSINESS";
type BusinessStatus =
  | "PENDENTE"
  | "APROVADO"
  | "RESSALVA"
  | "AJUSTE"
  | "DUVIDA";

interface SpecificationContextValue {
  active: boolean;
  mode: ViewMode | null;
  statuses: Record<string, BusinessStatus>;
  select: (metadata: SpecificationMetadata) => void;
}

const SpecificationContext = createContext<SpecificationContextValue>({
  active: false,
  mode: null,
  statuses: {},
  select: () => undefined,
});
const statusLabel: Record<BusinessStatus, string> = {
  PENDENTE: "Pendente de validação",
  APROVADO: "Aprovado",
  RESSALVA: "Aprovado com ressalva",
  AJUSTE: "Ajuste solicitado",
  DUVIDA: "Dúvida registrada",
};

export function SpecificationMode({
  children,
  screen,
  businessItems = [],
  showViewToggles = false,
}: {
  children: ReactNode;
  screen: SpecificationMetadata;
  businessItems?: SpecificationMetadata[];
  showViewToggles?: boolean;
}) {
  const [mode, setMode] = useState<ViewMode | null>(null);
  const [selected, setSelected] = useState<SpecificationMetadata | null>(null);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, BusinessStatus>>({});
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const [draft, setDraft] = useState("");
  const active = mode !== null;
  const toggleMode = (next: ViewMode) => {
    setMode((current) => (current === next ? null : next));
    setSelected(null);
    setPanelCollapsed(false);
    setDraft("");
  };
  const select = (metadata: SpecificationMetadata) => {
    setSelected(metadata);
    setPanelCollapsed(false);
    setDraft("");
  };
  const changeStatus = (status: BusinessStatus) =>
    selected &&
    setStatuses((current) => ({ ...current, [selected.id]: status }));
  const addComment = () => {
    if (!selected || !draft.trim()) return;
    setComments((current) => ({
      ...current,
      [selected.id]: [...(current[selected.id] ?? []), draft.trim()],
    }));
    setDraft("");
  };
  const restoreReview = (
    componentId: string,
    status: BusinessStatus,
    comment: string,
  ) => {
    setStatuses((current) =>
      current[componentId] === status
        ? current
        : { ...current, [componentId]: status },
    );
    if (comment)
      setComments((current) =>
        current[componentId]?.at(-1) === comment
          ? current
          : { ...current, [componentId]: [comment] },
      );
  };
  return (
    <SpecificationContext.Provider value={{ active, mode, statuses, select }}>
      <div
        className={`${active ? "prototype-spec-root is-active" : "prototype-spec-root"}${panelCollapsed ? " is-panel-collapsed" : ""}`}
      >
        {children}
        <div
          className={`prototype-view-toggles${showViewToggles ? " is-visible" : ""}`}
          role="group"
          aria-label="Modos de visualização do protótipo"
        >
          <button
            className={
              mode === "DEVELOPER"
                ? "prototype-view-toggle developer is-active"
                : "prototype-view-toggle developer"
            }
            type="button"
            onClick={() => toggleMode("DEVELOPER")}
            title={
              mode === "DEVELOPER"
                ? "Fechar visualização do desenvolvedor"
                : "Visualização do desenvolvedor"
            }
            aria-label="Visualização do desenvolvedor"
            aria-pressed={mode === "DEVELOPER"}
          >
            <i className="pi pi-code" />
          </button>
          <button
            className={
              mode === "BUSINESS"
                ? "prototype-view-toggle business is-active"
                : "prototype-view-toggle business"
            }
            type="button"
            onClick={() => toggleMode("BUSINESS")}
            title={
              mode === "BUSINESS"
                ? "Fechar validação da área de negócio"
                : "Validação da área de negócio"
            }
            aria-label="Validação da área de negócio"
            aria-pressed={mode === "BUSINESS"}
          >
            <i className="pi pi-check-square" />
          </button>
        </div>
        {active && (
          <>
            <div className="prototype-spec-mask" />
            <PrototypePanel
              mode={mode!}
              metadata={selected ?? screen}
              screenSelected={!selected}
              collapsed={panelCollapsed}
              onToggle={() => setPanelCollapsed((value) => !value)}
              status={
                selected ? (statuses[selected.id] ?? "PENDENTE") : "PENDENTE"
              }
              statuses={statuses}
              items={businessItems}
              comments={selected ? (comments[selected.id] ?? []) : []}
              draft={draft}
              onDraft={setDraft}
              onComment={addComment}
              onStatus={changeStatus}
              screenId={screen.id}
              onRestore={restoreReview}
            />
          </>
        )}
      </div>
    </SpecificationContext.Provider>
  );
}

export function SpecArea({
  metadata,
  children,
}: {
  metadata: SpecificationMetadata;
  children: ReactElement;
}) {
  const { active, mode, statuses, select } = useContext(SpecificationContext);
  if (!active || !isValidElement(children)) return children;
  const original = children.props as { className?: string };
  const status = statuses[metadata.id] ?? "PENDENTE";
  return cloneElement(children, {
    className:
      `${original.className ?? ""} prototype-spec-target ${mode === "BUSINESS" ? `is-business status-${status.toLowerCase()}` : "is-developer"}`.trim(),
    "data-spec-code": mode === "BUSINESS" ? metadata.title : metadata.id,
    title: `${mode === "BUSINESS" ? "Validar" : "Ver especificação"}: ${metadata.title}`,
    onClickCapture: (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      select(metadata);
    },
  } as never);
}

interface PanelProps {
  mode: ViewMode;
  metadata: SpecificationMetadata;
  screenSelected: boolean;
  collapsed: boolean;
  onToggle: () => void;
  status: BusinessStatus;
  statuses: Record<string, BusinessStatus>;
  items: SpecificationMetadata[];
  comments: string[];
  draft: string;
  onDraft: (value: string) => void;
  onComment: () => void;
  onStatus: (status: BusinessStatus) => void;
  screenId: string;
  onRestore: (
    componentId: string,
    status: BusinessStatus,
    comment: string,
  ) => void;
}

function PrototypePanel(props: PanelProps) {
  if (props.collapsed)
    return (
      <aside
        className="prototype-spec-panel is-collapsed"
        aria-label="Painel de visualização recolhido"
      >
        <button
          className="prototype-spec-expand"
          type="button"
          onClick={props.onToggle}
          title="Expandir painel"
        >
          <i className="pi pi-angle-left" />
          <span>
            {props.mode === "BUSINESS" ? "Validação" : "Especificação"}
          </span>
        </button>
      </aside>
    );
  return props.mode === "BUSINESS" ? (
    <BusinessPanel {...props} />
  ) : (
    <DeveloperPanel metadata={props.metadata} onToggle={props.onToggle} />
  );
}

function DeveloperPanel({
  metadata,
  onToggle,
}: {
  metadata: SpecificationMetadata;
  onToggle: () => void;
}) {
  return (
    <aside
      className="prototype-spec-panel"
      aria-label="Especificação do componente"
    >
      <PanelHeader
        eyebrow={metadata.id}
        title={metadata.title}
        onToggle={onToggle}
      />
      <div className="prototype-spec-status">
        <i
          className={
            metadata.status === "PENDENTE"
              ? "pi pi-clock"
              : "pi pi-check-circle"
          }
        />
        {metadata.status === "PENDENTE"
          ? "Definição pendente"
          : "Especificação confirmada"}
      </div>
      <section>
        <h3>Visão de negócio</h3>
        <SpecItem label="Objetivo" value={metadata.description} />
        <SpecItem label="Regra de negócio" value={metadata.businessRule} />
        <SpecItem label="Origem da informação" value={metadata.source} />
        {metadata.filters && (
          <SpecItem label="Filtros aplicáveis" value={metadata.filters} />
        )}{" "}
        {metadata.behavior && (
          <SpecItem label="Comportamento" value={metadata.behavior} />
        )}
      </section>
      <section>
        <h3>Visão técnica</h3>
        <div className="prototype-spec-grid">
          <SpecItem label="Tipo de dado" value={metadata.dataType} />
          <ComponentSpecItem metadata={metadata} />
        </div>
        {metadata.route && (
          <SpecItem label="Rota ou ação" value={metadata.route} />
        )}
        <SpecItem label="Identificador" value={metadata.id} />
        <SpecItem
          label="US relacionada"
          value={metadata.userStory ?? "A definir"}
        />
      </section>
    </aside>
  );
}


function ComponentSpecItem({ metadata }: { metadata: SpecificationMetadata }) {
  return (
    <div className="prototype-spec-item">
      <span>Componente</span>
      <p>{metadata.component}</p>
      {metadata.componentSource && <code>{metadata.componentSource}</code>}
      {metadata.componentUrl && (
        <a className="prototype-spec-component-link" href={"#" + metadata.componentUrl}>
          <i className="pi pi-external-link" /> Abrir componente na biblioteca
        </a>
      )}
    </div>
  );
}
function BusinessPanel(props: PanelProps) {
  const counts = (status: BusinessStatus) =>
    props.items.filter(
      (item) => (props.statuses[item.id] ?? "PENDENTE") === status,
    ).length;
  return (
    <aside
      className="prototype-spec-panel prototype-business-panel"
      aria-label="Validação da área de negócio"
    >
      <PanelHeader
        eyebrow={
          props.screenSelected
            ? "VALIDAÇÃO DO PROTÓTIPO"
            : "COMPONENTE SELECIONADO"
        }
        title={props.metadata.title}
        onToggle={props.onToggle}
      />
      <ReviewPersistencePanel
        screenId={props.screenId}
        metadata={props.metadata}
        status={props.status}
        comment={props.comments.at(-1) ?? ""}
        onRestore={props.onRestore}
        items={props.items}
      />
      {props.screenSelected ? (
        <>
          <section>
            <h3>Resumo da validação</h3>
            <p className="prototype-business-intro">
              Selecione um indicador ou bloco destacado para avaliar seu
              significado e comportamento.
            </p>
            <div className="prototype-business-summary">
              <article>
                <strong>{counts("PENDENTE")}</strong>
                <span>Pendentes</span>
              </article>
              <article className="approved">
                <strong>{counts("APROVADO")}</strong>
                <span>Aprovados</span>
              </article>
              <article className="adjust">
                <strong>{counts("AJUSTE")}</strong>
                <span>Ajustes</span>
              </article>
              <article className="question">
                <strong>{counts("DUVIDA")}</strong>
                <span>Dúvidas</span>
              </article>
            </div>
          </section>
          <section>
            <h3>Objetivo da tela</h3>
            <p className="prototype-business-intro">
              {props.metadata.description}
            </p>
          </section>
        </>
      ) : (
        <>
          <div
            className={`prototype-business-status status-${props.status.toLowerCase()}`}
          >
            <span>Situação</span>
            <strong>{statusLabel[props.status]}</strong>
          </div>
          <section>
            <h3>O que este item representa</h3>
            <p className="prototype-business-intro">
              {props.metadata.description}
            </p>
          </section>
          <section>
            <h3>O que validar</h3>
            <ul className="prototype-business-checklist">
              <li>O nome e o significado estão adequados?</li>
              <li>Esta informação é necessária para a decisão?</li>
              <li>Os filtros e o comportamento esperado estão corretos?</li>
              <li>A ação executada ao clicar faz sentido?</li>
            </ul>
          </section>
          <section>
            <h3>Sua avaliação</h3>
            <div className="prototype-business-actions">
              <button
                className="approve"
                onClick={() => props.onStatus("APROVADO")}
              >
                <i className="pi pi-check" />
                Aprovar
              </button>
              <button
                className="adjust"
                onClick={() => props.onStatus("AJUSTE")}
              >
                <i className="pi pi-pencil" />
                Solicitar ajuste
              </button>
              <button
                className="question"
                onClick={() => props.onStatus("DUVIDA")}
              >
                <i className="pi pi-question-circle" />
                Dúvida
              </button>
            </div>
            <textarea
              value={props.draft}
              onChange={(event) => props.onDraft(event.target.value)}
              placeholder="Escreva um comentário..."
              rows={3}
            />
            <button
              className="prototype-business-comment"
              onClick={props.onComment}
              disabled={!props.draft.trim()}
            >
              <i className="pi pi-comment" />
              Adicionar comentário
            </button>
            {props.comments.length > 0 && (
              <div className="prototype-business-comments">
                {props.comments.map((comment, index) => (
                  <article key={`${comment}-${index}`}>
                    <strong>Comentário da validação</strong>
                    <p>{comment}</p>
                    <small>Registrado nesta sessão</small>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </aside>
  );
}

function PanelHeader({
  eyebrow,
  title,
  onToggle,
}: {
  eyebrow: string;
  title: string;
  onToggle: () => void;
}) {
  return (
    <header>
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      <button type="button" onClick={onToggle} title="Recolher painel">
        <i className="pi pi-angle-right" />
      </button>
    </header>
  );
}
function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="prototype-spec-item">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}


