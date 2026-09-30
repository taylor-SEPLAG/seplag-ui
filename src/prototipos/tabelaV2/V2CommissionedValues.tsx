import { v2CommissionCalculatedValue, v2Currency } from "./v2Store";

export function V2CommissionedValuesSummary({ subsidy, percent }: { subsidy: string; percent: string }) {
  const validPercent = Number.isFinite(Number(percent.replace(",", "."))) && Number(percent.replace(",", ".")) > 0 && Number(percent.replace(",", ".")) <= 100;
  const calculated = subsidy && percent && validPercent ? v2CommissionCalculatedValue(subsidy, percent) : "—";
  return <><h3>Resumo dos valores</h3><div className="v2-table-wrap"><table className="v2-table" aria-label="Resumo dos valores comissionados">
    <thead><tr><th>Forma de ocupação</th><th>Regra</th><th>Valor</th></tr></thead><tbody>
      <tr><td>Exclusivamente Comissionado</td><td>Subsídio integral</td><td><strong>{subsidy ? v2Currency(subsidy) : "—"}</strong></td></tr>
      <tr><td>Nomeado Efetivo</td><td>{percent ? "Gratificação de " + percent + "%" : "Gratificação"}</td><td><strong>{calculated}</strong></td></tr>
    </tbody>
  </table></div></>;
}

export function V2CommissionedValues({ cargoName, subsidy, percent, onSubsidyChange, onPercentChange, readOnly = false }: {
  readOnly?: boolean; cargoName: string; subsidy: string; percent: string; onSubsidyChange: (value: string) => void; onPercentChange: (value: string) => void;
}) {
  return <section className="v2-panel v2-form-section v2-commissioned-values" aria-labelledby="v2-commissioned-title">
    <h2 id="v2-commissioned-title"><span className="v2-section-icon"><i className="pi pi-dollar" /></span><span>Valores do cargo comissionado<small>Informe o valor de referência e o percentual de gratificação aplicável ao cargo comissionado.</small></span></h2>
    <div className="v2-commissioned-values-grid">
      <label className="v2-fixed-reference">Referência<input value="000" readOnly /></label>
      <div className="v2-select-field"><label htmlFor="v2-commissioned-subsidy"><span>Subsídio — Exclusivamente Comissionado <span className="v2-required">*</span></span></label>
        <input id="v2-commissioned-subsidy" inputMode="decimal" readOnly={readOnly} required placeholder="R$ 0,00" value={subsidy} onChange={(event) => !readOnly && onSubsidyChange(event.target.value.replace(/[^0-9.,]/g, ""))} onBlur={() => !readOnly && subsidy && onSubsidyChange(v2Currency(subsidy))} />
        <small>Valor devido quando o cargo for ocupado por servidor exclusivamente comissionado.</small>
      </div>
      <div className="v2-select-field"><label htmlFor="v2-commissioned-percent"><span>Percentual — Nomeado Efetivo <span className="v2-required">*</span></span></label>
        <input id="v2-commissioned-percent" inputMode="decimal" readOnly={readOnly} required placeholder="0%" value={percent ? percent + "%" : ""} onChange={(event) => !readOnly && onPercentChange(event.target.value.replace(/[^0-9.,]/g, ""))} />
        <small>Percentual de gratificação aplicável ao servidor ou empregado de carreira nomeado para o cargo comissionado.</small>
      </div>
    </div>
    <V2CommissionedValuesSummary subsidy={subsidy} percent={percent} />
    <div className="v2-note"><i className="pi pi-info-circle" /> O cargo {cargoName} possui dois parâmetros de remuneração: subsídio para Exclusivamente Comissionado e percentual de gratificação para Nomeado Efetivo.</div>
  </section>;
}
