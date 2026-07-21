import { createContext, cloneElement, isValidElement, useContext, useState, type ReactElement, type ReactNode } from "react";
import "./specificationMode.css";

export interface SpecificationMetadata {
  id: string;
  title: string;
  description: string;
  businessRule: string;
  source: string;
  dataType: string;
  component: string;
  behavior?: string;
  filters?: string;
  route?: string;
  userStory?: string;
  status?: "CONFIRMADO" | "PENDENTE";
}

interface SpecificationContextValue {
  active: boolean;
  selected: SpecificationMetadata | null;
  select: (metadata: SpecificationMetadata) => void;
}

const SpecificationContext = createContext<SpecificationContextValue>({ active: false, selected: null, select: () => undefined });

export function SpecificationMode({ children, screen }: { children: ReactNode; screen: SpecificationMetadata }) {
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState<SpecificationMetadata | null>(null);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const toggle = () => { setActive((value) => !value); setSelected(null); setPanelCollapsed(false); };
  const select = (metadata: SpecificationMetadata) => { setSelected(metadata); setPanelCollapsed(false); };
  return <SpecificationContext.Provider value={{ active, selected, select }}>
    <div className={`${active ? "prototype-spec-root is-active" : "prototype-spec-root"}${panelCollapsed ? " is-panel-collapsed" : ""}`}>
      {children}
      <button className={active ? "prototype-spec-toggle is-active" : "prototype-spec-toggle"} type="button" onClick={toggle} title={active ? "Fechar modo de especificação" : "Ativar modo de especificação"} aria-label={active ? "Fechar modo de especificação" : "Ativar modo de especificação"} aria-pressed={active}>
        <i className="pi pi-code"/>
      </button>
      {active && <><div className="prototype-spec-mask"/><SpecificationPanel metadata={selected ?? screen} collapsed={panelCollapsed} onToggle={() => setPanelCollapsed((value) => !value)}/></>}
    </div>
  </SpecificationContext.Provider>;
}

export function SpecArea({ metadata, children }: { metadata: SpecificationMetadata; children: ReactElement }) {
  const { active, select } = useContext(SpecificationContext);
  if (!active || !isValidElement(children)) return children;
  const original = children.props as { className?: string; onClickCapture?: (event: React.MouseEvent) => void };
  return cloneElement(children, {
    className: `${original.className ?? ""} prototype-spec-target`.trim(),
    "data-spec-code": metadata.id,
    title: `Ver especificação: ${metadata.title}`,
    onClickCapture: (event: React.MouseEvent) => { event.preventDefault(); event.stopPropagation(); select(metadata); },
  } as never);
}

function SpecificationPanel({ metadata, collapsed, onToggle }: { metadata: SpecificationMetadata; collapsed: boolean; onToggle: () => void }) {
  if (collapsed) return <aside className="prototype-spec-panel is-collapsed" aria-label="Painel de especificação recolhido"><button className="prototype-spec-expand" type="button" onClick={onToggle} title="Expandir painel de especificação"><i className="pi pi-angle-left"/><span>Especificação</span></button></aside>;
  return <aside className="prototype-spec-panel" aria-label="Especificação do componente">
    <header><div><span>{metadata.id}</span><h2>{metadata.title}</h2></div><button type="button" onClick={onToggle} title="Recolher painel de especificação"><i className="pi pi-angle-right"/></button></header>
    <div className="prototype-spec-status"><i className={metadata.status === "PENDENTE" ? "pi pi-clock" : "pi pi-check-circle"}/>{metadata.status === "PENDENTE" ? "Definição pendente" : "Especificação confirmada"}</div>
    <section><h3>Visão de negócio</h3><SpecItem label="Objetivo" value={metadata.description}/><SpecItem label="Regra de negócio" value={metadata.businessRule}/><SpecItem label="Origem da informação" value={metadata.source}/>{metadata.filters && <SpecItem label="Filtros aplicáveis" value={metadata.filters}/>} {metadata.behavior && <SpecItem label="Comportamento" value={metadata.behavior}/>}</section>
    <section><h3>Visão técnica</h3><div className="prototype-spec-grid"><SpecItem label="Tipo de dado" value={metadata.dataType}/><SpecItem label="Componente" value={metadata.component}/></div>{metadata.route && <SpecItem label="Rota ou ação" value={metadata.route}/>}<SpecItem label="Identificador" value={metadata.id}/><SpecItem label="US relacionada" value={metadata.userStory ?? "A definir"}/></section>
  </aside>;
}

function SpecItem({ label, value }: { label: string; value: string }) { return <div className="prototype-spec-item"><span>{label}</span><p>{value}</p></div>; }
