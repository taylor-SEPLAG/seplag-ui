import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BotaoSeplag } from "@componentes/Botao";
import { DocumentosLegaisAssociadosSeplag } from "@componentes/DocumentosLegaisAssociados";
import { useDocumentosLegaisAssociaveis } from "../documentosLegais/documentosLegaisStore";
import { estruturaOrganizacionalNiveis } from "../estruturaOrganizacionalCatalogo";
import { lerEstruturaOrganizacional } from "../estruturaOrganizacional/estruturaOrganizacionalStore";
import { V2EditaisSelect, V2LinksSelect, V2MatrixEditor } from "./V2Fields";
import { V2CommissionedValues, V2CommissionedValuesSummary } from "./V2CommissionedValues";
import { V2PageFrame, V2Status, V2Tags } from "./V2Shared";
import {
  V2_BASE, V2_CARGOS, blankV2Matrix, v2Today, v2Conflicts, v2Currency, v2CommissionCalculatedValue, v2Create, v2CommissionedInputs, v2CreateCommissionedPair, v2Date, v2Hours, v2MatrixValid,
  v2EditalNames, v2ReferenceCandidates, v2TableDisplayId, v2Persist, v2ProportionalMatrix, v2Read, v2Structure, v2ValuesValid, v2Version, v2CanVersion, v2CommissionedCompanion, v2CommissionedViewValues, v2VersionCommissionedPair, v2VisibleLinks,
  type V2Input, type V2Link, type V2Matrix,
} from "./v2Store";
type Draft = { key: string; jornada: string; tipos: string[]; matrix: V2Matrix; original: V2Matrix; approved: boolean; adjusted: boolean };
export function V2Form({ kind, sourceId, cargoId, initialJourney, referenceId, view = false, embedded = false, viewStep }: { kind: "padrao" | "excecao"; sourceId?: string; cargoId?: number; initialJourney?: string; referenceId?: string; view?: boolean; embedded?: boolean; viewStep?: 0 | 1 }) {
  const nav = useNavigate();
  const legalDocuments = useDocumentosLegaisAssociaveis();
  const locations = [...(estruturaOrganizacionalNiveis.find((level) => level.id === "orgaos")?.itens.map((item) => item.nome) || []), ...lerEstruturaOrganizacional().unidades.filter((unit) => unit.situacao === "ATIVA").map((unit) => unit.nome + " — " + unit.orgao)];
  const [records] = useState(() => v2Read());
  const source = sourceId ? records.find((record) => record.id === sourceId) : undefined;
  const cargo = V2_CARGOS.find((item) => item.id === (source?.cargoId || cargoId)) || V2_CARGOS[0];
  const versionCommissionPair = Boolean(cargo.comissionado && source && !view);
  const commissionCompanion = source && versionCommissionPair ? v2CommissionedCompanion(records, source) : undefined;
  const viewCommissionValues = source && cargo.comissionado && view ? v2CommissionedViewValues(records, source) : undefined;
  const createCommissionPair = cargo.comissionado && !source && !view;
  const referenceSource = !source && referenceId ? v2ReferenceCandidates(records, cargo, initialJourney || "").find((record) => record.id === referenceId) : undefined;
  const inherited = source || referenceSource;
  const referenceMatrix = referenceSource ? v2ProportionalMatrix(referenceSource.matrix, v2Hours(referenceSource.jornada || ""), v2Hours(initialJourney || "")) : undefined;
  const originalLinks = source ? view ? source.links : v2VisibleLinks(source) : referenceSource ? v2VisibleLinks(referenceSource).filter((link) => link.inicio <= v2Today() && (!link.fim || link.fim >= v2Today())) : [];
  const [formStep, setStep] = useState(0);
  const step = view && viewStep !== undefined ? viewStep : formStep;
  const [jornada, setJornada] = useState(source?.jornada || (initialJourney && cargo.jornadas.includes(initialJourney) ? initialJourney : ""));
  const [tipos, setTipos] = useState(inherited ? originalLinks.map((link) => link.tipo) : createCommissionPair ? ["Exclusivamente Comissionado", "Nomeado Efetivo"] : cargo.comissionado ? ["Exclusivamente Comissionado"] : cargo.vinculos.length === 1 ? [cargo.vinculos[0].tipo] : []);
  const [editais, setEditais] = useState<string[]>(inherited?.editais || []);
  const [structure, setStructure] = useState<"fixo" | "matriz">(cargo.comissionado ? inherited ? v2Structure(inherited) : "fixo" : "matriz");
  const [fixedValue, setFixedValue] = useState(inherited && v2Structure(inherited) === "fixo" ? (referenceMatrix || inherited.matrix).rows[0]?.values[0] || "" : "");
  const [start, setStart] = useState(source ? view ? source.inicio : v2Today() : referenceSource?.inicio || "");
  const [end, setEnd] = useState(view ? source?.fim || "" : referenceSource?.fim || "");
  const [legalId, setLegalId] = useState(inherited?.baseLegalId || "");
  const baseLegal = legalDocuments.find((document) => document.id === legalId)?.titulo || (view ? source?.baseLegal || "" : "");
  const [legalPreview, setLegalPreview] = useState<string | null>(null);
  const [observation, setObservation] = useState(source?.observacao || "");
  const [perfil, setPerfil] = useState(source?.perfil || "");
  const [local, setLocal] = useState(source?.local || "");

  const [reference, setReference] = useState(view && source?.origem === "Referência" ? "Sim" : "Não");
  const [generate, setGenerate] = useState<string[]>(view && source ? records.filter((record) => record.proporcional?.referenciaId === source.id).map((record) => record.jornada + "-same-links") : []);
  const [matrix, setMatrix] = useState<V2Matrix>(source && !cargo.comissionado ? structuredClone(source.matrix) : referenceMatrix || blankV2Matrix());
  const [remuneracaoValor, setRemuneracaoValor] = useState(source?.remuneracao?.valor || "");
  const [commissionSubsidy, setCommissionSubsidy] = useState(viewCommissionValues?.subsidy || (versionCommissionPair ? source?.remuneracao?.valor || "" : ""));
  const [commissionPercent, setCommissionPercent] = useState(viewCommissionValues?.percent || (versionCommissionPair ? commissionCompanion?.remuneracao?.valor || "" : ""));
  const [commissionBase, setCommissionBase] = useState(source?.remuneracao?.baseCalculo || "");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");
  const title = view ? "Visualizar Tabela de Vencimentos" + (kind === "excecao" ? " — Exceção" : "") : source ? kind === "excecao" ? "Nova versão da Tabela de Vencimentos — Exceção" : "Nova versão da Tabela de Vencimentos" : kind === "excecao" ? "Nova Tabela de Vencimentos — Exceção" : "Nova tabela de vencimentos";
  const options = cargo.vinculos.map((link) => link.tipo);
  const journeys = cargo.jornadas;
  const targets = kind === "padrao" && reference === "Sim" && jornada
    ? cargo.jornadas.filter((item) => item !== jornada && (!view || records.some((record) => record.proporcional?.referenciaId === source?.id && record.jornada === item))).map((item) => ({
      key: item + "-same-links", jornada: item, tipos: [...tipos],
      compatible: tipos.length > 0,
    })) : [];
  const valueMatrix: V2Matrix = structure === "fixo" ? { columns: ["Valor"], rows: [{ name: "Fixo", values: [fixedValue] }] } : matrix;
  const commissionFixed = cargo.comissionado && structure === "fixo";
  const blockedEditaisFor = (selectedJourney: string) => [...new Set(records
    .filter((record) => record.cargoId === cargo.id && record.kind === kind &&
      (kind === "padrao" ? Boolean(selectedJourney) && record.jornada === selectedJourney : record.perfil === perfil && record.local === local))
    .flatMap((record) => record.editais || []))].filter((id) => !source?.editais?.includes(id));
  const blockedEditais = blockedEditaisFor(jornada);
  const previousTable = source || records.filter((record) => record.cargoId === cargo.id && record.kind === kind && v2Structure(record) === "matriz" && (kind === "padrao" ? Boolean(jornada) && record.jornada === jornada : record.perfil === perfil && record.local === local)).slice(-1)[0];
  const makeInput = (target?: { jornada: string; tipos: string[]; matrix: V2Matrix; adjusted?: boolean }): V2Input => ({
    kind, cargoId: cargo.id, jornada: kind === "padrao" ? target?.jornada || jornada : undefined,
    perfil: kind === "excecao" ? perfil : undefined, local: kind === "excecao" ? local : undefined,
    inicio: start, fim: end || undefined, baseLegal: baseLegal.trim(), baseLegalId: legalId, observacao: observation.trim(),
    origem: target ? target.adjusted ? "Ajustada manualmente" : "Proporcional" : referenceSource ? "Proporcional" : reference === "Sim" && kind === "padrao" ? "Referência" : "Manual",
    referencia: target ? (source?.tableId || "Tabela de referência") + " · " + jornada : referenceSource ? referenceSource.tableId + " V" + referenceSource.version : undefined,
    proporcional: referenceSource && referenceMatrix ? { referenciaId: referenceSource.id, percentual: v2Hours(jornada) / v2Hours(referenceSource.jornada || "") * 100, calculada: referenceMatrix } : undefined,
    estrutura: structure, matrix: target?.matrix || valueMatrix,
    editais: (target?.tipos || tipos).includes("Contrato Temporário") ? editais : [],
    remuneracao: commissionFixed ? { tipo: tipos[0] === "Exclusivamente Comissionado" ? "subsidio" : "gratificacao", valor: tipos[0] === "Exclusivamente Comissionado" && remuneracaoValor ? v2Currency(remuneracaoValor) : remuneracaoValor, baseCalculo: tipos[0] === "Exclusivamente Comissionado" ? undefined : commissionBase ? v2Currency(commissionBase) : undefined, valorCalculado: tipos[0] === "Exclusivamente Comissionado" ? undefined : commissionBase && remuneracaoValor ? v2CommissionCalculatedValue(commissionBase, remuneracaoValor) : undefined } : undefined,
    links: (target?.tipos || tipos).map((tipo): V2Link => ({
      tipo, inicio: start, fim: end || undefined, incideRga: originalLinks.find((link) => link.tipo === tipo)?.incideRga ?? false,
      percentualRga: originalLinks.find((link) => link.tipo === tipo)?.percentualRga,
    })),
  });
  const valuesValid = () => createCommissionPair || versionCommissionPair ? v2CommissionedInputs(makeInput(), commissionSubsidy, commissionPercent).every(v2ValuesValid) : v2ValuesValid(makeInput());
  const validateIdentification = () => {
    if (versionCommissionPair && !commissionCompanion) return "Não foi possível identificar a tabela de Nomeado Efetivo associada.";
    if (!cargoId && !source) return "Selecione um Cargo pela consulta.";
    if (!tipos.length || !start || !legalId || (kind === "padrao" && !jornada)) return "Preencha os campos obrigatórios da identificação e vigência.";
    if (kind === "excecao" && (!perfil || !local)) return "Selecione Perfil Profissional e Local de Lotação.";
    if (end && end < start) return "A data de término deve ser posterior à data de início.";
    if (tipos.some((tipo) => !options.includes(tipo))) return "Há Tipos de Vínculo inválidos para este Cargo.";
    if (kind === "padrao" && !journeys.includes(jornada)) return "A Jornada selecionada não está disponível para todos os Tipos de Vínculo selecionados.";
    if (commissionFixed && !createCommissionPair && new Set(tipos.map((tipo) => tipo === "Exclusivamente Comissionado" ? "subsidio" : "gratificacao")).size > 1) return "Estes vínculos utilizam estruturas remuneratórias diferentes e não podem compartilhar a mesma tabela.";
    if (source && start <= source.inicio) return "A nova vigência deve começar após a versão anterior.";
    const conflicts = v2Conflicts(records, makeInput(), source ? { recordId: source.id, tipos } : undefined);
    if (conflicts.length) return "Já existe uma tabela cadastrada para o período informado. Tipo(s) de Vínculo em conflito: " + conflicts.join(", ") + ". Revise a seleção ou utilize o versionamento da tabela existente.";
    const generatedConflicts = targets.filter((target) => target.compatible && generate.includes(target.key)).flatMap((target) => v2Conflicts(records, makeInput({ ...target, matrix })));
    if (generatedConflicts.length) return "Já existe uma tabela cadastrada para uma Jornada proporcional no período informado. Tipo(s) de Vínculo em conflito: " + [...new Set(generatedConflicts)].join(", ") + ".";
    return "";
  };
  const changeJornada = (value: string) => {
    setJornada(value);
    const compatibleTypes = tipos;
    setTipos(compatibleTypes);
    setEditais((current) => compatibleTypes.includes("Contrato Temporário")
      ? current.filter((id) => !blockedEditaisFor(value).includes(id)) : []);
    setGenerate([]);
    setDrafts([]);
  };
  const save = () => {
    setError("");
    const issue = validateIdentification();
    if (issue) { setConfirmOpen(false); setStep(0); setError(issue); return; }
    if (!valuesValid()) { setConfirmOpen(false); setStep(structure === "fixo" ? 0 : 1); setError("Preencha todos os valores da estrutura remuneratória."); return; }
    if (drafts.some((draft) => !draft.approved || !v2MatrixValid(draft.matrix))) { setStep(structure === "fixo" ? 0 : 2); setError("Aprove e valide todas as tabelas proporcionais."); return; }
    if (createCommissionPair) {
      const pair = v2CreateCommissionedPair(records, makeInput(), commissionSubsidy, commissionPercent);
      if (!pair.ok) { setConfirmOpen(false); setError(pair.message); return; }
      setConfirmOpen(false); v2Persist(pair.records); nav(V2_BASE + "?salvo=1&cargo=" + cargo.id); return;
    }
    const primary = source ? versionCommissionPair ? v2VersionCommissionedPair(records, source.id, v2CommissionedInputs(makeInput(), commissionSubsidy, commissionPercent)[0], undefined, commissionPercent) : v2Version(records, source.id, tipos, makeInput()) : v2Create(records, makeInput());
    if (!primary.ok) { setError(primary.message); return; }
    let next = primary.records;
    for (const draft of drafts) {
      const result = v2Create(next, { ...makeInput(draft), referencia: primary.record.tableId + " V" + primary.record.version, proporcional: { referenciaId: primary.record.id, percentual: v2Hours(draft.jornada) / v2Hours(jornada) * 100, calculada: draft.original } });
      if (!result.ok) { setConfirmOpen(false); setError(result.message); return; }
      next = result.records;
    }
    setConfirmOpen(false);
    v2Persist(next);
    nav(V2_BASE + "?salvo=1&cargo=" + cargo.id);
  };
  const advance = () => {
    setError("");
    if (step === 0) {
      const issue = validateIdentification();
      if (issue) { setError(issue); return; }
      if (structure === "fixo") {
        if (!valuesValid()) { setError("Preencha o Valor de Referência e os valores obrigatórios."); return; }
        const selected = targets.filter((target) => target.compatible && generate.includes(target.key));
        if (selected.length && !drafts.length) {
          setDrafts(selected.map((target) => ({
            ...target, matrix: v2ProportionalMatrix(valueMatrix, v2Hours(jornada), v2Hours(target.jornada)),
            original: v2ProportionalMatrix(valueMatrix, v2Hours(jornada), v2Hours(target.jornada)), approved: false, adjusted: false,
          })));
          setReviewIndex(0);
          return;
        }
        if (drafts.some((draft) => !draft.approved || !v2MatrixValid(draft.matrix))) { setError("Aprove e valide todas as tabelas proporcionais."); return; }
        setConfirmOpen(true);
        return;
      }
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!valuesValid()) { setError("Preencha todos os valores da estrutura remuneratória."); return; }
      if (source) { setConfirmOpen(true); return; }
      if (kind === "excecao") { setStep(2); return; }
      const selected = targets.filter((target) => target.compatible && generate.includes(target.key));
      if (selected.length) {
        setDrafts(selected.map((target) => ({
          ...target, matrix: v2ProportionalMatrix(valueMatrix, v2Hours(jornada), v2Hours(target.jornada)),
          original: v2ProportionalMatrix(valueMatrix, v2Hours(jornada), v2Hours(target.jornada)), approved: false, adjusted: false,
        })));
        setStep(2); return;
      }
      setConfirmOpen(true); return;
    }
    if (drafts.some((draft) => !draft.approved || !v2MatrixValid(draft.matrix))) { setError("Aprove e valide todas as tabelas proporcionais."); return; }
    setConfirmOpen(true);
  };
  const updateDraft = (index: number, update: Partial<Draft>) =>
    setDrafts((current) => current.map((draft, position) => position === index ? { ...draft, ...update } : draft));
  const hasProportionalReview = kind === "padrao" && targets.some((target) => generate.includes(target.key));
  const sourceTypes = originalLinks.map((link) => link.tipo);
  const changedValues = source ? valueMatrix.rows.flatMap((row, rowIndex) => row.values.map((value, columnIndex) => ({ nivel: row.name, classe: valueMatrix.columns[columnIndex], before: source.matrix.rows[rowIndex]?.values[columnIndex] || "", after: value }))).filter((item) => item.before !== item.after) : [];
  const changedCommission = source?.remuneracao?.valor !== remuneracaoValor || source?.remuneracao?.baseCalculo !== (commissionBase || undefined);
  const isLastStep = structure === "fixo" || step === 2 || step === 1 && (Boolean(source) || kind === "padrao" && !hasProportionalReview);
  if (referenceId && !referenceSource) return <V2PageFrame title={title}><p role="alert" className="v2-error">A tabela de referência não está disponível para esta jornada. Volte à consulta e selecione outra opção de cadastro.</p><button type="button" className="v2-button-secondary" onClick={() => nav(V2_BASE + "?cargo=" + cargo.id)}>Voltar</button></V2PageFrame>;
  if (source && versionCommissionPair && !v2CanVersion(source)) return <V2PageFrame title={title}><p className="v2-error" role="alert">Versione o cargo comissionado pela tabela de Exclusivamente Comissionado. A tabela de Nomeado Efetivo será versionada automaticamente.</p><button type="button" className="v2-button-secondary" onClick={() => nav(V2_BASE + "?cargo=" + cargo.id)}>Voltar</button></V2PageFrame>;
  const content = <>
    {!embedded && <div className={"v2-wizard-tabs" + (structure === "fixo" ? " v2-wizard-tabs-single" : "")}>
      {(structure === "fixo" ? ["Identificação e vigência"] : ["Identificação e vigência", "Valores por Nível e Classe", ...(source ? [] : kind === "excecao" ? ["Confirmação"] : hasProportionalReview ? ["Revisão das Jornadas"] : [])]).map((label, index) =>
        <button key={label} type="button" className={step === index ? "active" : ""} disabled={index > step && index !== 1} onClick={() => { setStep(index); setError(""); }}>{label}</button>)}
    </div>}
    {referenceSource && <div className="v2-note">Tabela proporcional à referência {v2TableDisplayId(referenceSource)} · {referenceSource.jornada} · V{referenceSource.version} · {(v2Hours(jornada) / v2Hours(referenceSource.jornada || "") * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%</div>}
    {view && source && <div className="v2-note">Tabela {v2TableDisplayId(source)} · Versão {"V" + source.version} · Somente leitura · Origem: {source.origem}{source.referencia ? " — " + source.referencia : ""}</div>}
    {!view && source && <div className="v2-note">Tabela {v2TableDisplayId(source)} · Versão atual {"V" + source.version} · {tipos.length < originalLinks.length ? "Os vínculos selecionados formarão uma tabela independente." : "Nova versão V" + (source.version + 1)}</div>}
{step === 0 && <>
      <section className="v2-panel v2-form-section"><h2><span className="v2-section-icon"><i className="pi pi-calendar" /></span> {source && !view ? "Dados da nova versão" : "Identificação e vigência"}</h2>
        <div className="v2-form-grid">
          <label>Carreira<input value={cargo.carreira} readOnly /></label>
          <label><span>Cargo <span className="v2-required">*</span></span><input value={cargo.nome} readOnly /></label>
          {kind === "padrao" && <label><span>Jornada <span className="v2-required">*</span></span><select value={jornada} disabled={Boolean(source || referenceSource)} onChange={(event) => changeJornada(event.target.value)}>
            <option value="">Selecione</option>{journeys.map((item) => <option key={item}>{item}</option>)}</select></label>}
          {!cargo.comissionado && <>
          <div className="v2-select-field"><label><span>Tipo(s) de Vínculo <span className="v2-required">*</span></span></label><V2LinksSelect readOnly={view || Boolean(referenceSource)} cargo={cargo} value={tipos} allowed={source ? sourceTypes : undefined}
            onChange={(value) => { setTipos(value); if (!value.includes("Contrato Temporário")) setEditais([]); setGenerate([]); setDrafts([]); }} />
            <small>Selecione um ou vários vínculos que utilizarão os mesmos valores de vencimento.</small>
            {!view && source && sourceTypes.length > 1 && <small>Selecione todos para versionar a tabela compartilhada ou apenas alguns para criar uma tabela independente.</small>}
          </div>
          </>}
          {tipos.includes("Contrato Temporário") && <div className="v2-select-field">
            <label>Edital / Processo Seletivo</label>
            <V2EditaisSelect readOnly={view || Boolean(referenceSource)} value={editais} blocked={blockedEditais} onChange={(value) => { setEditais(value); setDrafts([]); }} />
            <small>Selecione um ou mais editais em homologação. Editais já utilizados para este cargo e jornada estão riscados e indisponíveis.</small>
          </div>}
          {kind === "excecao" && <>
            <label><span>Perfil Profissional <span className="v2-required">*</span></span><select value={perfil} disabled={Boolean(source || referenceSource)} onChange={(event) => setPerfil(event.target.value)}><option value="">Selecione</option>{cargo.perfis.map((item) => <option key={item}>{item}</option>)}</select></label>
            <div className="v2-location-field"><label htmlFor="v2-location"><span>Local de Lotação <span className="v2-required">*</span></span></label>
              <select id="v2-location" value={local} disabled={Boolean(source || referenceSource)} onChange={(event) => setLocal(event.target.value)}><option value="">Selecione a lotação</option>
                {locations.map((item) => <option key={item} value={item}>{item}</option>)}
              </select></div>
          </>}
          <label><span>Data início da vigência <span className="v2-required">*</span></span><input readOnly={view} type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label>
          <label>Data fim da vigência<input readOnly={view} type="date" value={end} min={start || undefined} onChange={(event) => setEnd(event.target.value)} /></label>
          <div className="v2-legal-field"><DocumentosLegaisAssociadosSeplag disabled={view} label="Base Legal" required options={legalDocuments} value={legalId ? [legalId] : []}
            onChange={(ids) => setLegalId(ids[ids.length - 1] || "")} onVisualizar={(document) => setLegalPreview(document.id)}
            placeholder="Buscar documentos legais..." exibirNovoCadastro={false} compact expandirAoAbrir />{view && !legalId && <span>{source?.baseLegal || "—"}</span>}</div>
        </div>
        {kind === "excecao" && <div className="v2-note">Esta tabela será aplicada por Cargo, Tipo de Vínculo, Perfil Profissional e Local de Lotação, independentemente da Jornada.</div>}
      </section>
      {createCommissionPair || versionCommissionPair || viewCommissionValues ? <V2CommissionedValues readOnly={view} cargoName={cargo.nome} subsidy={commissionSubsidy} percent={commissionPercent} onSubsidyChange={setCommissionSubsidy} onPercentChange={setCommissionPercent} /> : cargo.comissionado ? <section className="v2-panel v2-form-section" aria-labelledby="v2-structure-title">
        <h2 id="v2-structure-title"><span className="v2-section-icon"><i className="pi pi-table" /></span> Estrutura de Vencimento</h2>
        <div className="v2-form-grid">
          <div className="v2-select-field">
            <label htmlFor="v2-structure"><span>Estrutura de Vencimento <span className="v2-required">*</span></span></label>
            <select disabled={view || Boolean(referenceSource)} id="v2-structure" required value={structure} onChange={(event) => { setStructure(event.target.value as "fixo" | "matriz"); setDrafts([]); }}>
              <option value="fixo">Valor Fixo</option>
              <option value="matriz">Tabela por Nível e Classe</option>
            </select>
            <small>{structure === "matriz" ? "Valores por Nível e Classe - Os valores serão informados na próxima etapa do cadastro." : "Informe o Valor de Referência para esta tabela."}</small>
          </div>
          {structure === "fixo" && <label><span>Valor de Referência <span className="v2-required">*</span></span>
            <input readOnly={view || Boolean(referenceSource)} required inputMode="decimal" placeholder="R$ 0,00"
              value={commissionFixed ? tipos[0] === "Exclusivamente Comissionado" ? remuneracaoValor : commissionBase : fixedValue}
              onChange={(event) => {
                const value = event.target.value.replace(/[^0-9.,]/g, "");
                if (commissionFixed) { if (tipos[0] === "Exclusivamente Comissionado") setRemuneracaoValor(value); else setCommissionBase(value); }
                else setFixedValue(value);
                setDrafts([]);
              }}
              onBlur={() => { if (view) return;
                if (commissionFixed) { if (tipos[0] === "Exclusivamente Comissionado" && remuneracaoValor) setRemuneracaoValor(v2Currency(remuneracaoValor)); else if (commissionBase) setCommissionBase(v2Currency(commissionBase)); }
                else if (fixedValue) setFixedValue(v2Currency(fixedValue));
              }} />
          </label>}
          {structure === "fixo" && <label className="v2-fixed-reference">Referência<input value="000" readOnly /></label>}
          {commissionFixed && tipos[0] !== "Exclusivamente Comissionado" && <div className="v2-select-field"><label>
            <span>Percentual de gratificação para servidores e empregados de carreira <span className="v2-required">*</span></span>
            <input readOnly={view} type="number" required min="0" max="100" step="0.01" value={remuneracaoValor} onChange={(event) => setRemuneracaoValor(event.target.value)} />
          </label>
            <small>Valor calculado: {commissionBase && remuneracaoValor ? v2CommissionCalculatedValue(commissionBase, remuneracaoValor) : "R$ 0,00"}</small>
          </div>}
        </div>
      </section> : null}
        {kind === "padrao" && (!source || view) && !referenceSource && !cargo.comissionado && <section className="v2-panel v2-form-section v2-reference v2-generation-section" aria-labelledby="v2-generation-title">
          <h2 id="v2-generation-title"><span className="v2-section-icon"><i className="pi pi-calculator" /></span> Geração proporcional</h2><label><span>Esta será a tabela de referência para cálculo proporcional das demais jornadas deste cargo? <span className="v2-required">*</span></span>
            <select disabled={view} value={reference} onChange={(event) => { setReference(event.target.value); setGenerate([]); setDrafts([]); }}><option>Não</option><option>Sim</option></select></label>
          <p>Ao selecionar Sim, o sistema calculará as demais jornadas compatíveis com os mesmos Tipos de Vínculo da tabela de referência.</p>
          {reference === "Sim" && <><h4>Jornadas para geração proporcional</h4><div className="v2-table-wrap"><table className="v2-table"><thead><tr><th>Jornada</th><th>Tipo(s) de Vínculo</th><th>Proporção</th><th>Gerar</th></tr></thead><tbody>
            <tr><td>{jornada || "Selecione a Jornada"}</td><td><V2Tags tipos={tipos} /></td><td>100%</td><td>Referência</td></tr>
            {targets.map((target) => <tr key={target.key}><td>{target.jornada}</td><td>{target.tipos.length ? <V2Tags tipos={target.tipos} /> : <span className="v2-muted">Selecione os Tipos de Vínculo</span>}</td><td>{Math.round(v2Hours(target.jornada) / v2Hours(jornada) * 100)}%</td><td><input readOnly={view} type="checkbox" aria-label={"Gerar " + target.jornada + " para " + target.tipos.join(", ")} disabled={view || !target.compatible} title={!tipos.length ? "Selecione os Tipos de Vínculo da referência." : undefined} checked={generate.includes(target.key)} onChange={(event) => { setGenerate(event.target.checked ? [...generate, target.key] : generate.filter((item) => item !== target.key)); setDrafts([]); }} /></td></tr>)}
            {!targets.length && <tr><td colSpan={4} className="v2-empty">Não há outras jornadas associadas a este cargo.</td></tr>}
          </tbody></table></div></>}
        </section>}
      <section className="v2-panel v2-form-section"><h2><span className="v2-section-icon"><i className="pi pi-file-edit" /></span> Observação</h2>
        <p>Registre informações complementares sobre a tabela de vencimentos.</p>
        <textarea readOnly={view} aria-label="Observação" rows={3} maxLength={1000} value={observation} onChange={(event) => setObservation(event.target.value)} />
        <small className="v2-counter">{observation.length}/1000 caracteres</small>
      </section>
    </>}
    {step === 1 && <section className="v2-panel v2-form-section v2-values-section"><h2><span className="v2-section-icon"><i className="pi pi-dollar" /></span>{structure === "fixo" ? "Valores de Vencimento" : "Valores por Nível e Classe"}</h2>
      <div className="v2-values-toolbar">
        <p>Matriz gerada conforme a estrutura do cargo e da carreira.</p>
        {!view && !referenceSource && <BotaoSeplag type="button" label="Copiar valores da tabela anterior" icon="pi pi-copy" disabled={!previousTable || v2Structure(previousTable) !== "matriz"} onClick={() => { if (previousTable) { setMatrix(structuredClone(previousTable.matrix)); setDrafts([]); } }} />}
      </div>
      {commissionFixed ? <div className="v2-commission-fields">{tipos[0] === "Exclusivamente Comissionado" ? <label><span>Subsídio <span className="v2-required">*</span></span><input readOnly={view} inputMode="decimal" value={remuneracaoValor} placeholder="R$ 0,00" onChange={(event) => setRemuneracaoValor(event.target.value.replace(/[^0-9.,]/g, ""))} onBlur={() => !view && remuneracaoValor && setRemuneracaoValor(v2Currency(remuneracaoValor))} /></label> : <><label><span>Base de cálculo — subsídio do cargo (R$) <span className="v2-required">*</span></span><input readOnly={view} inputMode="decimal" value={commissionBase} placeholder="R$ 0,00" onChange={(event) => setCommissionBase(event.target.value.replace(/[^0-9.,]/g, ""))} onBlur={() => !view && commissionBase && setCommissionBase(v2Currency(commissionBase))} /></label><label><span>Percentual de gratificação para servidores e empregados de carreira <span className="v2-required">*</span></span><input readOnly={view} type="number" min="0" max="100" step="0.01" value={remuneracaoValor} onChange={(event) => setRemuneracaoValor(event.target.value)} /></label><div className="v2-note">Valor calculado: {commissionBase && remuneracaoValor ? v2CommissionCalculatedValue(commissionBase, remuneracaoValor) : "R$ 0,00"}</div></>}
        {source && changedCommission && <p>Valor anterior: {source.remuneracao?.valor || "—"} · Novo valor: {remuneracaoValor}</p>}</div> : structure === "fixo" ? <div className="v2-commission-fields"><label><span>Valor de Referência <span className="v2-required">*</span></span><input readOnly={view} inputMode="decimal" value={fixedValue} placeholder="R$ 0,00" onChange={(event) => { setFixedValue(event.target.value.replace(/[^0-9.,]/g, "")); setDrafts([]); }} onBlur={() => !view && fixedValue && setFixedValue(v2Currency(fixedValue))} /></label></div> : <V2MatrixEditor readOnly={view || Boolean(referenceSource)} matrix={matrix} previous={source?.matrix} onChange={(value) => { setMatrix(value); setDrafts([]); }} />}
      {source && changedValues.length > 0 && <div className="v2-value-changes"><h3>{changedValues.length} valor(es) alterado(s)</h3>
        <div className="v2-table-wrap"><table className="v2-table"><thead><tr><th>Nível</th><th>Classe</th><th>Valor anterior</th><th>Novo valor</th></tr></thead><tbody>{changedValues.map((item) =>
          <tr key={item.nivel + item.classe}><td>{item.nivel}</td><td>{item.classe}</td><td>{item.before}</td><td>{item.after}</td></tr>)}</tbody></table></div>
      </div>}
    </section>}
    {step === 2 && kind === "excecao" && !source && <section className="v2-panel"><h2>Confirmação da Exceção</h2>
      <h3>Identificação</h3><div className="v2-info-grid">
        <div><small>Cargo</small><strong>{cargo.nome}</strong></div><div><small>Carreira</small><strong>{cargo.carreira}</strong></div>
        <div><small>Tipo de cadastro</small><strong>{kind === "excecao" ? "Exceção" : "Tabela por Jornada"}</strong></div>
        <div><small>Perfil Profissional</small><strong>{perfil}</strong></div><div><small>Local de Lotação</small><strong>{local}</strong></div>
        {!cargo.comissionado && <div><small>Tipos de Vínculo contemplados</small><strong>{tipos.join(", ")}</strong></div>}<div><small>Vigência</small><strong>{v2Date(start)} – {end ? v2Date(end) : "Atual"}</strong></div>
        <div><small>Base Legal</small><strong>{baseLegal}</strong></div><div><small>Observação</small><strong>{observation || "—"}</strong></div>
      </div>
      <h3>Valores</h3>{commissionFixed ? <div className="v2-info-grid"><div><small>Estrutura</small><strong>{tipos[0] === "Exclusivamente Comissionado" ? "Subsídio" : "Gratificação"}</strong></div><div><small>Valor</small><strong>{remuneracaoValor}{tipos[0] === "Exclusivamente Comissionado" ? "" : "%"}</strong></div>{tipos[0] !== "Exclusivamente Comissionado" && <><div><small>Base de cálculo</small><strong>{commissionBase}</strong></div><div><small>Gratificação calculada</small><strong>{v2CommissionCalculatedValue(commissionBase, remuneracaoValor)}</strong></div></>}</div> : structure === "fixo" ? <div className="v2-commission-readonly"><strong>Valor Fixo</strong><span>{v2Currency(fixedValue)}</span></div> : <V2MatrixEditor matrix={matrix} readOnly />}
      {!source && tipos.length > 1 && <div className="v2-note">Os Tipos de Vínculo selecionados utilizarão os mesmos valores de vencimento desta exceção durante sua vigência.</div>}
    </section>}
    {(step === 2 || structure === "fixo" && step === 0 && drafts.length > 0) && kind === "padrao" && !source && <section className="v2-panel"><h2>Revisão das Jornadas</h2><p>Revise cada tabela proporcional antes de confirmar o cadastro.</p>
      <div className="v2-review-tabs">{drafts.map((draft, index) => <button type="button" key={draft.key} className={reviewIndex === index ? "active" : ""} onClick={() => setReviewIndex(index)}>{draft.jornada} — {draft.tipos.join(", ")}</button>)}</div>
      {drafts.map((draft, index) => index === reviewIndex && <div className="v2-draft" key={draft.key}>
        <div className="v2-section-head"><h3>{draft.jornada} · {draft.tipos.join(", ")}</h3><V2Status value={draft.approved ? "Aprovada para salvar" : "Aguardando revisão"} /></div>
        <div className="v2-context"><span>Referência: {cargo.nome} · {jornada}</span><span>Proporção: {Math.round(v2Hours(draft.jornada) / v2Hours(jornada) * 100)}%</span><span>{draft.adjusted ? "Proporcional — Ajustada manualmente" : "Proporcional"}</span></div>
        <div className="v2-draft-actions"><button type="button" className="v2-button-secondary" onClick={() => updateDraft(index, { adjusted: !draft.adjusted, matrix: !draft.adjusted ? draft.matrix : draft.original, approved: false })}>{draft.adjusted ? "Usar cálculo proporcional" : "Ajustar valores manualmente"}</button>
          <button type="button" className="v2-button-primary" onClick={() => { if (v2MatrixValid(draft.matrix)) updateDraft(index, { approved: true }); else setError("Preencha todos os valores da Jornada."); }}><i className="pi pi-check" /> Aprovar cálculo</button></div>
        <V2MatrixEditor matrix={draft.matrix} previous={draft.original} readOnly={!draft.adjusted} onChange={(value) => updateDraft(index, { matrix: value, approved: false })} />
      </div>)}
    </section>}
    {error && <p role="alert" className="v2-error">{error}</p>}
    {!embedded && <div className={"v2-footer" + (step === 1 ? " v2-values-footer" : "")}><button type="button" className="v2-button-secondary" onClick={() => view ? nav(V2_BASE + "?cargo=" + cargo.id) : step ? setStep(step - 1) : nav(V2_BASE)}><i className="pi pi-arrow-left" /> Voltar</button>
      {!view && <button type="button" className="v2-button-primary" onClick={advance}><i className="pi pi-save" /> {step === 0 && !source && kind === "padrao" ? "Confirmar" : !isLastStep ? "Avançar" : source ? "Confirmar versionamento" : kind === "excecao" ? "Salvar Exceção" : "Salvar tabela"}</button>}</div>}
    {confirmOpen && <div className="v2-overlay" role="presentation" onMouseDown={() => setConfirmOpen(false)}><section className="v2-modal v2-confirm" role="dialog" aria-modal="true" aria-labelledby="v2-confirm-form-title" onMouseDown={(event) => event.stopPropagation()}>
      <header><h2 id="v2-confirm-form-title">{source ? "Confirmar versionamento" : kind === "excecao" ? "Confirmar cadastro da Exceção" : "Confirmar cadastro da tabela"}</h2>
        <button type="button" className="v2-icon-plain" aria-label="Fechar" onClick={() => setConfirmOpen(false)}><i className="pi pi-times" /></button></header>
      <div className="v2-confirm-body">
        <p>{versionCommissionPair ? "Ao confirmar, a tabela de Exclusivamente Comissionado e a tabela de Nomeado Efetivo serão versionadas automaticamente. A gratificação será recalculada com o subsídio e o percentual informados. Deseja continuar?" : createCommissionPair ? "Serão criadas duas tabelas: uma para Exclusivamente Comissionado com o subsídio integral e outra para Nomeado Efetivo com a gratificação calculada. Deseja continuar?" : cargo.comissionado ? "Deseja confirmar os valores e a vigência desta tabela de cargo comissionado?" : source ? tipos.length < sourceTypes.length ? "Deseja confirmar a separação dos Tipos de Vínculo? Será criada uma nova tabela para os vínculos selecionados, preservando a tabela anterior para os demais." : "Deseja confirmar a nova versão? Os novos valores serão aplicados aos Tipos de Vínculo selecionados a partir da vigência informada." : "Deseja confirmar o cadastro da tabela de vencimentos? Os Tipos de Vínculo selecionados compartilharão os valores informados."}</p>
        <div className="v2-info-grid"><div><small>Cargo</small><strong>{cargo.nome}</strong></div><div><small>Jornada ou abrangência</small><strong>{kind === "padrao" ? jornada : perfil + " · " + local}</strong></div>
          {!cargo.comissionado && <div><small>Tipos de Vínculo</small><strong>{tipos.join(", ")}</strong></div>}<div><small>Vigência</small><strong>{v2Date(start)} – {end ? v2Date(end) : "Atual"}</strong></div>
          {tipos.includes("Contrato Temporário") && <div><small>Edital / Processo Seletivo</small><strong>{v2EditalNames(editais) || "Nenhum edital selecionado"}</strong></div>}
          {cargo.comissionado && <div><small>Estrutura de Vencimento</small><strong>{structure === "fixo" ? "Valor Fixo" : "Tabela por Nível e Classe"}</strong></div>}
          {structure === "fixo" && !cargo.comissionado && <div><small>Valor de Referência</small><strong>{v2Currency(fixedValue)}</strong></div>}
          <div><small>Base Legal</small><strong>{baseLegal}</strong></div>
        </div>
        {createCommissionPair && <V2CommissionedValuesSummary subsidy={commissionSubsidy} percent={commissionPercent} />}
        {versionCommissionPair && commissionCompanion && <><div className="v2-note">Tabelas: {v2TableDisplayId(source!)} e {v2TableDisplayId(commissionCompanion)} · Nova vigência: {v2Date(start)}</div><V2CommissionedValuesSummary subsidy={commissionSubsidy} percent={commissionPercent} /></>}
        {source && !cargo.comissionado && <div className="v2-info-grid"><div><small>Receberão os novos valores</small><strong>{tipos.join(", ")}</strong></div><div><small>Permanecerão na tabela anterior</small><strong>{sourceTypes.filter((tipo) => !tipos.includes(tipo)).join(", ") || "Nenhum"}</strong></div></div>}
        {!!drafts.length && <div><strong>Tabelas proporcionais</strong>{drafts.map((draft) => <p key={draft.key}>{draft.jornada}: {draft.tipos.join(", ")}</p>)}</div>}
      </div>
      <div className="v2-footer"><button type="button" className="v2-button-secondary" onClick={() => setConfirmOpen(false)}>Cancelar</button><button type="button" className="v2-button-primary" onClick={save}>{source ? "Confirmar versionamento" : "Confirmar cadastro"}</button></div>
    </section></div>}
    {legalPreview && <div className="v2-overlay" role="presentation" onMouseDown={() => setLegalPreview(null)}><section className="v2-modal v2-confirm" role="dialog" aria-modal="true" aria-label="Visualizar Base Legal" onMouseDown={(event) => event.stopPropagation()}>
      <header><h2>Base Legal</h2><button type="button" className="v2-icon-plain" aria-label="Fechar" onClick={() => setLegalPreview(null)}><i className="pi pi-times" /></button></header>
      <div className="v2-confirm-body"><strong>{legalDocuments.find((document) => document.id === legalPreview)?.titulo}</strong><p>{legalDocuments.find((document) => document.id === legalPreview)?.descricao}</p>
        <button type="button" className="v2-button-secondary" onClick={() => nav("/prototipos/sigep/documentos-legais/" + legalPreview)}>Abrir documento</button></div>
    </section></div>}
    </>;
  return embedded ? content : <V2PageFrame title={title}>{content}</V2PageFrame>;
}
