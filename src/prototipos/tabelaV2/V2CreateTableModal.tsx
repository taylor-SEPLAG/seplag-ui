import { useEffect, useState } from "react";
import { BotaoSalvarSeplag, BotaoVoltarSeplag } from "@componentes/Botao";
import { v2ReferenceCandidates, v2TableDisplayId, type V2Cargo, type V2Record } from "./v2Store";
import "../tabelaVencimentos/tabelaVencimentosSpacing.css";

export function V2CreateTableModal({ cargo, records, initialJourney, onClose, onContinue }: {
  cargo: V2Cargo; records: V2Record[]; initialJourney?: string; onClose: () => void;
  onContinue: (jornada: string, referenceId?: string) => void;
}) {
  const [jornada, setJornada] = useState(initialJourney || cargo.jornadas[0] || "");
  const [mode, setMode] = useState<"manual" | "proportional">("manual");
  const [referenceId, setReferenceId] = useState("");
  const references = v2ReferenceCandidates(records, cargo, jornada);
  const reference = references.find((item) => item.id === referenceId) || references[0];
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [onClose]);
  return <div className="tv-profile-list-overlay" role="presentation" onMouseDown={onClose}>
    <section className="tv-create-journey-modal v2-create-table-modal" role="dialog" aria-modal="true" aria-labelledby="v2-create-table-title" onMouseDown={(event) => event.stopPropagation()}>
      <header><div><h2 id="v2-create-table-title">Criar tabela para {jornada}</h2><p>Como deseja criar esta tabela?</p></div>
        <button type="button" aria-label="Fechar" onClick={onClose}><i className="pi pi-times" /></button></header>
      <div className="tv-create-journey-options">
        {!initialJourney && <div className="v2-select-field"><label htmlFor="v2-create-journey">Jornada</label><select id="v2-create-journey" value={jornada} onChange={(event) => { setJornada(event.target.value); setMode("manual"); setReferenceId(""); }}>{cargo.jornadas.map((item) => <option key={item}>{item}</option>)}</select></div>}
        <label className={mode === "manual" ? "selected" : ""}>
          <input type="radio" name="v2CreateMode" aria-label="Cadastrar manualmente" checked={mode === "manual"} onChange={() => setMode("manual")} />
          <span className="tv-create-journey-option-icon"><i className="pi pi-pencil" /></span>
          <span><strong>Cadastrar manualmente</strong><small>Informe os valores diretamente para esta jornada.</small></span>
        </label>
        <label className={mode === "proportional" && reference ? "selected" : ""} aria-disabled={!reference}>
          <input type="radio" name="v2CreateMode" aria-label="Gerar proporcionalmente" checked={mode === "proportional"} disabled={!reference} onChange={() => setMode("proportional")} />
          <span className="tv-create-journey-option-icon"><i className="pi pi-calculator" /></span>
          <span><strong>{reference ? "Gerar proporcionalmente a partir de " + reference.jornada : "Gerar proporcionalmente"}</strong>
            <small>{reference ? "Utiliza os valores da tabela de referência e calcula automaticamente os valores proporcionais desta jornada." : "Nenhuma tabela de referência vigente está disponível."}</small></span>
        </label>
        {mode === "proportional" && reference && <div className="v2-select-field"><label htmlFor="v2-create-reference">Tabela de referência</label>
          <select id="v2-create-reference" value={reference.id} onChange={(event) => setReferenceId(event.target.value)}>{references.map((item) => <option key={item.id} value={item.id}>{v2TableDisplayId(item)} · {item.jornada} · V{item.version}</option>)}</select>
        </div>}
      </div>
      <footer><BotaoVoltarSeplag type="button" label="Cancelar" onClick={onClose} />
        <BotaoSalvarSeplag type="button" label="Continuar" disabled={!jornada || mode === "proportional" && !reference} onClick={() => onContinue(jornada, mode === "proportional" ? reference?.id : undefined)} /></footer>
    </section>
  </div>;
}
