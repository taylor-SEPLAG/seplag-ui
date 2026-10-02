import { useState } from "react";
import { useV2DropdownDismiss } from "./useV2DropdownDismiss";
import type { V2Cargo, V2Matrix } from "./v2Store";
import { V2_EDITAIS, v2EditalNames, v2Currency } from "./v2Store";

const levelClassMatrix = (matrix: V2Matrix): V2Matrix => matrix.columns.length === 1 && matrix.rows.length === 1
  ? { columns: ["A"], rows: [{ ...matrix.rows[0], name: "001" }] } : matrix;

export function V2MatrixEditor({
  matrix, previous, onChange, readOnly = false,
}: {
  matrix: V2Matrix;
  previous?: V2Matrix;
  onChange?: (matrix: V2Matrix) => void;
  readOnly?: boolean;
}) {
  const displayMatrix = levelClassMatrix(matrix);
  const singleCell = displayMatrix.columns.length === 1 && displayMatrix.rows.length === 1;
  const update = (next: V2Matrix) => onChange?.(levelClassMatrix(next));
  const setColumn = (index: number, value: string) => update({
    ...displayMatrix, columns: displayMatrix.columns.map((column, position) => position === index ? value : column),
  });
  const setRow = (index: number, value: string) => update({
    ...displayMatrix, rows: displayMatrix.rows.map((row, position) => position === index ? { ...row, name: value } : row),
  });
  const setValue = (rowIndex: number, columnIndex: number, value: string) => update({
    ...displayMatrix,
    rows: displayMatrix.rows.map((row, position) => position === rowIndex
      ? { ...row, values: row.values.map((cell, column) => column === columnIndex ? value : cell) }
      : row),
  });
  const addColumn = () => {
    const next = String.fromCharCode(65 + displayMatrix.columns.length);
    update({
      columns: [...displayMatrix.columns, next],
      rows: displayMatrix.rows.map((row) => ({ ...row, values: [...row.values, ""] })),
    });
  };
  const removeColumn = (index: number) => {
    if (displayMatrix.columns.length <= 1) return;
    update({
      columns: displayMatrix.columns.filter((_, position) => position !== index),
      rows: displayMatrix.rows.map((row) => ({ ...row, values: row.values.filter((_, position) => position !== index) })),
    });
  };
  const addRow = () => update({
    ...displayMatrix,
    rows: [...displayMatrix.rows, { name: String(displayMatrix.rows.length + 1).padStart(3, "0"), values: displayMatrix.columns.map(() => "") }],
  });
  const removeRow = (index: number) => {
    if (displayMatrix.rows.length <= 1) return;
    update({ ...displayMatrix, rows: displayMatrix.rows.filter((_, position) => position !== index) });
  };
  return <div className={"v2-matrix-wrap" + (!readOnly ? " v2-matrix-editable" : "")}>
    <table className="v2-matrix" style={!readOnly ? { minWidth: Math.max(600, (displayMatrix.columns.length + 1) * 180 + 150) } : undefined}>
      {!readOnly && <colgroup>
        {Array.from({ length: displayMatrix.columns.length + 1 }, (_, index) => <col key={index} style={{ width: "calc((100% - 150px) / " + (displayMatrix.columns.length + 1) + ")" }} />)}
        <col style={{ width: 150 }} />
      </colgroup>}
      <thead><tr>
        <th>Nível / Classe</th>
        {displayMatrix.columns.map((column, index) => <th key={index}>
          {readOnly ? column : <div className="v2-matrix-head">
            <input aria-label={"Classe " + (index + 1)} readOnly={singleCell} value={column} onChange={(event) => setColumn(index, event.target.value)} />
            <button type="button" className="v2-matrix-delete" title="Remover classe" aria-label={"Remover classe " + column} disabled={displayMatrix.columns.length <= 1} onClick={() => removeColumn(index)}><i className="pi pi-trash" /></button>
          </div>}
        </th>)}
        {!readOnly && <th className="v2-matrix-add"><button type="button" title="Adicionar classe" aria-label="Adicionar classe" onClick={addColumn}><i className="pi pi-plus" /> Nova classe</button></th>}
      </tr></thead>
      <tbody>{displayMatrix.rows.map((row, rowIndex) => <tr key={rowIndex}>
        <th>{readOnly ? row.name : <div className="v2-matrix-head">
          <input aria-label={"Nível " + (rowIndex + 1)} readOnly={singleCell} value={row.name} onChange={(event) => setRow(rowIndex, event.target.value)} />
          
        </div>}</th>
        {row.values.map((value, columnIndex) => <td key={columnIndex} className={previous?.rows[rowIndex]?.values[columnIndex] !== undefined && previous.rows[rowIndex].values[columnIndex] !== value ? "v2-cell-changed" : ""}>
          {readOnly ? value || "—" : <input aria-label={row.name + " / " + displayMatrix.columns[columnIndex]} inputMode="decimal" value={value} placeholder="R$ 0,00" onChange={(event) => setValue(rowIndex, columnIndex, event.target.value.replace(/[^0-9.,]/g, ""))} onBlur={() => value && setValue(rowIndex, columnIndex, v2Currency(value))} title={previous?.rows[rowIndex]?.values[columnIndex] && previous.rows[rowIndex].values[columnIndex] !== value ? "Valor anterior: " + previous.rows[rowIndex].values[columnIndex] : undefined} />}
        </td>)}
        {!readOnly && <td className="v2-matrix-row-actions"><button type="button" className="v2-matrix-delete" title="Remover nível" aria-label={"Remover nível " + row.name} disabled={displayMatrix.rows.length <= 1} onClick={() => removeRow(rowIndex)}><i className="pi pi-trash" /></button></td>}
      </tr>)}</tbody>
    </table>
    {!readOnly && <button type="button" className="v2-matrix-new-row" aria-label="Adicionar nível" onClick={addRow}><i className="pi pi-plus" /> Novo nível</button>}
  </div>;
}

export function V2LinksSelect({
  cargo, allowed, value, onChange, readOnly = false,
}: {
  cargo: V2Cargo;
  jornada?: string;
  allowed?: string[];
  value: string[];
  onChange: (value: string[]) => void;
  readOnly?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const available = cargo.vinculos.filter((link) => !allowed || allowed.includes(link.tipo));
  const filtered = available.filter((link) => link.tipo.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")));
  const root = useV2DropdownDismiss(open, setOpen);
  return <div className="v2-links-select" ref={root} onClick={(event) => {
    if (!readOnly && event.target instanceof Element && !event.target.closest("button, .v2-links-options")) setOpen(!open);
  }}>
    <div className="v2-selected-links">
      {value.map((tipo) => <span className="v2-chip" key={tipo}>{tipo}
        {!readOnly && <button type="button" aria-label={"Remover " + tipo} onClick={() => onChange(value.filter((item) => item !== tipo))}><i className="pi pi-times" /></button>}
      </span>)}
      {!value.length && <span className="v2-muted">Selecione os Tipos de Vínculo</span>}
    </div>
    {!readOnly && <button type="button" className="v2-select-trigger" aria-label="Selecionar Tipos de Vínculo" aria-expanded={open} onClick={() => setOpen(!open)}><i className={"pi " + (open ? "pi-chevron-up" : "pi-chevron-down")} /></button>}
    {open && !readOnly && <div className="v2-links-options">
      <input type="search" aria-label="Buscar Tipo de Vínculo" placeholder="Buscar Tipo de Vínculo" value={query} onChange={(event) => setQuery(event.target.value)} />
      {filtered.map((link) => <label key={link.tipo}><input type="checkbox" checked={value.includes(link.tipo)} onChange={(event) => onChange(event.target.checked ? [...value, link.tipo] : value.filter((tipo) => tipo !== link.tipo))} /> {link.tipo}</label>)}
      {!filtered.length && <span className="v2-muted">Nenhum vínculo encontrado.</span>}
    </div>}
  </div>;
}

export function V2EditaisSelect({ value, onChange, blocked = [], readOnly = false }: { value: string[]; onChange: (value: string[]) => void; blocked?: string[]; readOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const available = V2_EDITAIS.filter((edital) => edital.situacao === "Em homologação");
  const filtered = available.filter((edital) => edital.nome.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")));
  const root = useV2DropdownDismiss(open, setOpen);
  return <div className="v2-links-select" ref={root} onClick={(event) => {
    if (!readOnly && event.target instanceof Element && !event.target.closest("button, .v2-links-options")) setOpen(!open);
  }}>
    <div className="v2-selected-links">
      {value.map((id) => <span className="v2-chip" key={id}>{v2EditalNames([id])}
        {!readOnly && <button type="button" aria-label={"Remover edital " + v2EditalNames([id])} onClick={() => onChange(value.filter((item) => item !== id))}><i className="pi pi-times" /></button>}
      </span>)}
      {!value.length && <span className="v2-muted">Selecione os editais em homologação</span>}
    </div>
    {!readOnly && <button type="button" className="v2-select-trigger" aria-label="Selecionar editais" aria-expanded={open} onClick={() => setOpen(!open)}><i className={"pi " + (open ? "pi-chevron-up" : "pi-chevron-down")} /></button>}
    {open && !readOnly && <div className="v2-links-options">
      <input type="search" aria-label="Buscar edital" placeholder="Buscar edital..." value={query} onChange={(event) => setQuery(event.target.value)} />
      {filtered.map((edital) => <label key={edital.id} className={blocked.includes(edital.id) ? "v2-edital-used" : undefined} title={blocked.includes(edital.id) ? "Edital já utilizado para este cargo e jornada." : undefined}><input type="checkbox" disabled={blocked.includes(edital.id)} checked={value.includes(edital.id)}
        onChange={(event) => !blocked.includes(edital.id) && onChange(event.target.checked ? [...value, edital.id] : value.filter((id) => id !== edital.id))} /><span>{edital.nome}</span></label>)}
      {!filtered.length && <span className="v2-muted">Nenhum edital em homologação encontrado.</span>}
    </div>}
  </div>;
}
