import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  sigepDomainLabels as SIGEP_DOMAIN_LABELS,
  sigepStatusLabels as SIGEP_STATUS_LABELS,
  sigepSystemModules as SIGEP_SYSTEM_MODULES,
  type SigepDomain,
  type SigepModuleStatus,
  type SigepSystemModule,
} from "./sigepVisaoSistemaData";
import "./sigepVisaoSistema.css";

const domainOrder: SigepDomain[] = [
  "BASE_JURIDICA",
  "CADASTROS",
  "CONTROLE_VAGAS",
  "INGRESSO",
  "VIDA_FUNCIONAL",
  "GESTAO",
];

const moduleById = new Map(SIGEP_SYSTEM_MODULES.map((module) => [module.id, module]));

export function SigepVisaoSistemaPage() {
  const [selectedId, setSelectedId] = useState("quadro-autorizado");
  const [domain, setDomain] = useState<SigepDomain | "TODOS">("TODOS");
  const [status, setStatus] = useState<SigepModuleStatus | "TODOS">("TODOS");
  const [onlyPending, setOnlyPending] = useState(false);

  const selected = moduleById.get(selectedId) ?? SIGEP_SYSTEM_MODULES[0];
  const visibleIds = useMemo(
    () =>
      new Set(
        SIGEP_SYSTEM_MODULES.filter(
          (module) =>
            (domain === "TODOS" || module.domain === domain) &&
            (status === "TODOS" || module.status === status) &&
            (!onlyPending || module.pending.length > 0),
        ).map((module) => module.id),
      ),
    [domain, onlyPending, status],
  );

  const relatedIds = new Set([...selected.dependsOn, ...selected.impacts]);

  return (
    <main className="sigep-vision-page">
      <header className="sigep-vision-header">
        <div>
          <Link className="sigep-vision-back" to="/prototipos">
            <i className="pi pi-arrow-left" aria-hidden="true" /> Voltar aos protótipos
          </Link>
          <p className="sigep-vision-eyebrow">SIGEP</p>
          <h1>Mapa funcional do sistema</h1>
          <p>Entenda de onde vêm os dados, como os módulos se conectam e o que ainda falta evoluir.</p>
        </div>
        <Link className="sigep-vision-primary" to="/prototipos/sigep">
          Acessar SIGEP <i className="pi pi-arrow-right" aria-hidden="true" />
        </Link>
      </header>

      <section className="sigep-vision-filters" aria-label="Filtros do mapa">
        <label>
          Domínio
          <select value={domain} onChange={(event) => setDomain(event.target.value as SigepDomain | "TODOS")}>
            <option value="TODOS">Todos</option>
            {domainOrder.map((item) => <option key={item} value={item}>{SIGEP_DOMAIN_LABELS[item]}</option>)}
          </select>
        </label>
        <label>
          Situação
          <select value={status} onChange={(event) => setStatus(event.target.value as SigepModuleStatus | "TODOS")}>
            <option value="TODOS">Todas</option>
            {Object.entries(SIGEP_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="sigep-vision-checkbox">
          <input type="checkbox" checked={onlyPending} onChange={(event) => setOnlyPending(event.target.checked)} />
          Somente com pendências
        </label>
        <button type="button" onClick={() => { setDomain("TODOS"); setStatus("TODOS"); setOnlyPending(false); }}>
          <i className="pi pi-filter-slash" aria-hidden="true" /> Limpar
        </button>
      </section>

      <div className="sigep-vision-legend" aria-label="Legenda de situações">
        {Object.entries(SIGEP_STATUS_LABELS).map(([value, label]) => (
          <span key={value}><i className={`status-dot status-${value.toLowerCase()}`} />{label}</span>
        ))}
      </div>

      <div className="sigep-vision-layout">
        <section className="sigep-system-map" aria-label="Fluxo funcional do SIGEP">
          {domainOrder.map((domainItem, index) => {
            const modules = SIGEP_SYSTEM_MODULES.filter((module) => module.domain === domainItem);
            return (
              <div className="sigep-map-stage" key={domainItem}>
                <div className="sigep-map-stage-heading">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h2>{SIGEP_DOMAIN_LABELS[domainItem]}</h2>
                </div>
                <div className="sigep-map-nodes">
                  {modules.map((module) => (
                    <button
                      type="button"
                      key={module.id}
                      className={[
                        "sigep-map-node",
                        `status-${module.status.toLowerCase()}`,
                        selected.id === module.id ? "selected" : "",
                        relatedIds.has(module.id) ? "related" : "",
                        !visibleIds.has(module.id) ? "filtered" : "",
                      ].filter(Boolean).join(" ")}
                      onClick={() => setSelectedId(module.id)}
                    >
                      <i className={`pi ${module.icon}`} aria-hidden="true" />
                      <span><strong>{module.name}</strong><small>{SIGEP_STATUS_LABELS[module.status]}</small></span>
                      {module.pending.length > 0 && <b title={`${module.pending.length} pendência(s)`}>{module.pending.length}</b>}
                    </button>
                  ))}
                </div>
                {index < domainOrder.length - 1 && <i className="pi pi-arrow-down sigep-stage-arrow" aria-hidden="true" />}
              </div>
            );
          })}
        </section>

        <ModuleDetail module={selected} onSelect={setSelectedId} />
      </div>
    </main>
  );
}

function ModuleDetail({ module, onSelect }: { module: SigepSystemModule; onSelect: (id: string) => void }) {
  const relationButtons = (ids: readonly string[]) => ids.map((id) => moduleById.get(id)).filter(Boolean).map((item) => (
    <button type="button" key={item!.id} onClick={() => onSelect(item!.id)}>{item!.name}</button>
  ));

  return (
    <aside className="sigep-module-detail" aria-live="polite">
      <div className="sigep-module-detail-title">
        <i className={`pi ${module.icon}`} aria-hidden="true" />
        <div><span>{SIGEP_DOMAIN_LABELS[module.domain]}</span><h2>{module.name}</h2></div>
      </div>
      <span className={`sigep-detail-status status-${module.status.toLowerCase()}`}>{SIGEP_STATUS_LABELS[module.status]}</span>
      <p>{module.objective}</p>
      <DetailList title="Entradas" values={module.inputs} />
      <DetailList title="Entregas" values={module.outputs} />
      <section><h3>Depende de</h3><div className="sigep-relation-list">{module.dependsOn.length ? relationButtons(module.dependsOn) : <span>Nenhuma dependência mapeada.</span>}</div></section>
      <section><h3>Impacta</h3><div className="sigep-relation-list">{module.impacts.length ? relationButtons(module.impacts) : <span>Nenhum impacto mapeado.</span>}</div></section>
      <section className="sigep-pending-list"><h3>Pendências</h3>{module.pending.length ? <ul>{module.pending.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Sem pendências registradas.</p>}</section>
      {module.route ? <Link className="sigep-open-module" to={module.route}>Abrir protótipo <i className="pi pi-arrow-right" aria-hidden="true" /></Link> : <span className="sigep-no-route">Protótipo ainda não disponível</span>}
    </aside>
  );
}

function DetailList({ title, values }: { title: string; values: string[] }) {
  return <section><h3>{title}</h3><ul>{values.map((value) => <li key={value}>{value}</li>)}</ul></section>;
}
