import { CheckboxSNSeplag } from "@componentes/CheckBoxSN";
import {
  CheckboxFieldSeplag,
  CNPJFieldSeplag,
  CPFFieldSeplag,
  CurrencyFieldSeplag,
  DateFieldSeplag,
  DropdownFieldSeplag,
  EmailFieldSeplag,
  FieldsetDateFieldSeplag,
  MaskFieldSeplag,
  MultiSelectFieldSeplag,
  NumberFieldSeplag,
  RadioButtonFieldSeplag,
  SearchFieldSeplag,
  SwitchFieldSeplag,
  TextAreaFieldSeplag,
  TextFieldSeplag,
} from "@componentes/Fields";
import "primereact/resources/themes/saga-blue/theme.css";
import { useState } from "react";
import { useForm } from "react-hook-form";
import "./FieldsPlayground.css";

type FieldType =
  | "TextField"
  | "TextAreaField"
  | "EmailField"
  | "NumberField"
  | "CurrencyField"
  | "CPFField"
  | "CNPJField"
  | "MaskField"
  | "DateField"
  | "DropdownField"
  | "MultiSelectField"
  | "RadioButtonField"
  | "CheckboxField"
  | "SwitchField"
  | "SearchField"
  | "FieldsetDateField"
  | "CheckboxSN";

interface FieldConfig {
  id: string;
  type: FieldType;
  name: string;
  label: string;
  cols: string;
  placeholder: string;
  required: boolean;
  disabled: boolean;
  min: string;
  max: string;
  mask: string;
  optionsRaw: string;
  display: "comma" | "chip";
  checkedValue: string;
  uncheckedValue: string;
  checkboxLabel: string;
  horizontal: boolean;
  textTooltip: string;
  rows: string;
  maxLength: string;
  minDate: string;
  maxDate: string;
  shouldUnregister: boolean;
  validateStartDate: string;
  validateAfterDate: string;
  searchMinLength: string;
  searchForceSelection: boolean;
  isDisabled: boolean;
  optionsDisabledRaw: string;
}

const FIELD_TYPES: FieldType[] = [
  "TextField",
  "TextAreaField",
  "EmailField",
  "NumberField",
  "CurrencyField",
  "CPFField",
  "CNPJField",
  "MaskField",
  "DateField",
  "FieldsetDateField",
  "DropdownField",
  "MultiSelectField",
  "RadioButtonField",
  "CheckboxField",
  "CheckboxSN",
  "SwitchField",
  "SearchField",
];

function defaultConfig(type: FieldType, index: number): FieldConfig {
  const base: FieldConfig = {
    id: `field_${Date.now()}_${index}`,
    type,
    name: `campo${index + 1}`,
    label: type.replace("Field", "").replace("SN", ""),
    cols: "12 6",
    placeholder: "",
    required: false,
    disabled: false,
    min: "",
    max: "",
    mask: "(99) 99999-9999",
    optionsRaw: "Opção 1|op1\nOpção 2|op2\nOpção 3|op3",
    display: "comma",
    checkedValue: "S",
    uncheckedValue: "N",
    checkboxLabel: "Marcar opção",
    horizontal: false,
    textTooltip: "",
    rows: "3",
    maxLength: "",
    minDate: "",
    maxDate: "",
    shouldUnregister: false,
    validateStartDate: "",
    validateAfterDate: "",
    searchMinLength: "3",
    searchForceSelection: false,
    isDisabled: false,
    optionsDisabledRaw: "",
  };
  if (type === "RadioButtonField") base.optionsRaw = "Sim|S\nNão|N";
  if (type === "CheckboxField") base.cols = "12";
  if (type === "CheckboxSN") base.cols = "12";
  if (type === "SearchField") {
    base.placeholder = "Digite para buscar...";
    base.optionsRaw = "Ana Silva|1\nBruno Costa|2\nCarlos Souza|3";
  }
  return base;
}

function parseOptions(raw: string) {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [labelPart, valuePart] = l.split("|");
      return {
        label: labelPart?.trim() ?? l,
        value: (valuePart ?? labelPart)?.trim(),
      };
    });
}

function parseOptionsDisabled(raw: string) {
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

const noError = () => null;

//  Renderizador de campo

interface RenderedFieldProps {
  readonly cfg: FieldConfig;
  readonly control: any;
}

function renderTextField(cfg: FieldConfig, sharedProps: any) {
  if (cfg.type === "TextField") {
    return (
      <TextFieldSeplag
        {...sharedProps}
        placeholder={cfg.placeholder}
        maxLength={cfg.maxLength ? Number(cfg.maxLength) : undefined}
      />
    );
  }
  if (cfg.type === "TextAreaField") {
    return (
      <TextAreaFieldSeplag
        {...sharedProps}
        placeholder={cfg.placeholder}
        rows={Number(cfg.rows) || 3}
        maxLength={cfg.maxLength ? Number(cfg.maxLength) : undefined}
      />
    );
  }
  if (cfg.type === "EmailField") {
    return <EmailFieldSeplag {...sharedProps} placeholder={cfg.placeholder} />;
  }
  if (cfg.type === "MaskField") {
    return <MaskFieldSeplag {...sharedProps} mask={cfg.mask} placeholder={cfg.placeholder} />;
  }
  if (cfg.type === "DateField") {
    return <DateFieldSeplag {...sharedProps} placeholder={cfg.placeholder} />;
  }
  if (cfg.type === "FieldsetDateField") {
    return <FieldsetDateFieldSeplag {...sharedProps} placeholder={cfg.placeholder} />;
  }
  if (cfg.type === "SearchField") {
    const opts = parseOptions(cfg.optionsRaw);
    return (
      <SearchFieldSeplag
        {...sharedProps}
        items={opts}
        fieldLabel="label"
        search={() => {}}
        minLength={Number(cfg.searchMinLength) || 3}
        forceSelection={cfg.searchForceSelection}
        placeholder={cfg.placeholder}
      />
    );
  }
  return null;
}

function renderNumericField(cfg: FieldConfig, sharedProps: any) {
  if (cfg.type === "NumberField") {
    return (
      <NumberFieldSeplag
        {...sharedProps}
        placeholder={cfg.placeholder}
        min={cfg.min === "" ? undefined : Number(cfg.min)}
        max={cfg.max === "" ? undefined : Number(cfg.max)}
      />
    );
  }
  if (cfg.type === "CurrencyField") {
    return (
      <CurrencyFieldSeplag
        {...sharedProps}
        placeholder={cfg.placeholder}
        min={cfg.min === "" ? undefined : Number(cfg.min)}
        max={cfg.max === "" ? undefined : Number(cfg.max)}
      />
    );
  }
  if (cfg.type === "CPFField") return <CPFFieldSeplag {...sharedProps} />;
  if (cfg.type === "CNPJField") return <CNPJFieldSeplag {...sharedProps} />;
  return null;
}

function renderSelectField(
  cfg: FieldConfig,
  sharedProps: any,
  opts: ReturnType<typeof parseOptions>,
) {
  if (cfg.type === "DropdownField") {
    return (
      <DropdownFieldSeplag
        {...sharedProps}
        options={opts}
        optionLabel="label"
        optionValue="value"
        optionsDisabled={parseOptionsDisabled(cfg.optionsDisabledRaw)}
        placeholder={cfg.placeholder}
      />
    );
  }
  if (cfg.type === "MultiSelectField") {
    return (
      <MultiSelectFieldSeplag
        {...sharedProps}
        options={opts}
        optionLabel="label"
        optionValue="value"
        optionsDisabled={parseOptionsDisabled(cfg.optionsDisabledRaw)}
        display={cfg.display}
        placeholder={cfg.placeholder}
      />
    );
  }
  if (cfg.type === "RadioButtonField")
    return <RadioButtonFieldSeplag {...sharedProps} options={opts} />;
  if (cfg.type === "CheckboxField") {
    return (
      <CheckboxFieldSeplag
        {...sharedProps}
        checkboxLabel={cfg.checkboxLabel}
        checkedValue={cfg.checkedValue}
        uncheckedValue={cfg.uncheckedValue}
        defaultValue={cfg.uncheckedValue}
      />
    );
  }
  if (cfg.type === "CheckboxSN") {
    return (
      <CheckboxSNSeplag
        name={cfg.name}
        control={sharedProps.control}
        label={cfg.label}
        isDisabled={cfg.isDisabled || cfg.disabled}
      />
    );
  }
  if (cfg.type === "SwitchField") {
    return (
      <SwitchFieldSeplag
        {...sharedProps}
        horizontal={cfg.horizontal}
        textTooltip={cfg.textTooltip || undefined}
      />
    );
  }
  return null;
}

function RenderedField({ cfg, control }: Readonly<RenderedFieldProps>) {
  const sharedProps = {
    name: cfg.name,
    control,
    label: cfg.label,
    cols: cfg.cols,
    required: cfg.required,
    disabled: cfg.disabled,
    getFormErrorMessage: noError,
  } as any;

  const opts = parseOptions(cfg.optionsRaw);

  return (
    renderTextField(cfg, sharedProps) ??
    renderNumericField(cfg, sharedProps) ??
    renderSelectField(cfg, sharedProps, opts)
  );
}

//  Gerador de código

type OptionItem = { label: string; value: string | undefined };

function optionsToCode(opts: OptionItem[]) {
  const items = opts.map((o) => `{ label: "${o.label}", value: "${o.value}" }`).join(", ");
  return `[${items}]`;
}

function buildBaseLines(cfg: FieldConfig): string[] {
  return [
    `<${cfg.type}Seplag`,
    `  name="${cfg.name}"`,
    "  control={control}",
    ...(cfg.label ? [`  label="${cfg.label}"`] : []),
    ...(cfg.cols === "12 6" ? [] : [`  cols="${cfg.cols}"`]),
    ...(cfg.required ? ["  required"] : []),
    ...(cfg.disabled ? ["  disabled"] : []),
    ...(cfg.placeholder ? [`  placeholder="${cfg.placeholder}"`] : []),
  ];
}

const TYPE_SPECIFIC_SIMPLE: Partial<Record<FieldType, (cfg: FieldConfig) => string[]>> = {
  MaskField: (cfg) => [`  mask="${cfg.mask}"`],
  NumberField: (cfg) => [
    ...(cfg.min === "" ? [] : [`  min={${cfg.min}}`]),
    ...(cfg.max === "" ? [] : [`  max={${cfg.max}}`]),
  ],
  CurrencyField: (cfg) => [
    ...(cfg.min === "" ? [] : [`  min={${cfg.min}}`]),
    ...(cfg.max === "" ? [] : [`  max={${cfg.max}}`]),
  ],
  TextAreaField: (cfg) => [
    `  rows={${cfg.rows || 3}}`,
    ...(cfg.maxLength ? [`  maxLength={${cfg.maxLength}}`] : []),
  ],
  TextField: (cfg) => (cfg.maxLength ? [`  maxLength={${cfg.maxLength}}`] : []),
  SwitchField: (cfg) => [
    ...(cfg.horizontal ? ["  horizontal"] : []),
    ...(cfg.textTooltip ? [`  textTooltip="${cfg.textTooltip}"`] : []),
  ],
  SearchField: (cfg) => [
    ...(cfg.searchMinLength && cfg.searchMinLength !== "3"
      ? [`  minLength={${cfg.searchMinLength}}`]
      : []),
    ...(cfg.searchForceSelection ? ["  forceSelection"] : []),
  ],
  CheckboxSN: (cfg) => [...(cfg.isDisabled ? ["  isDisabled"] : [])],
};

function optionsDisabledToCode(raw: string): string[] {
  const values = parseOptionsDisabled(raw);
  if (values.length === 0) return [];
  const items = values.map((v) => `"${v}"`).join(", ");
  return [`  optionsDisabled={[${items}]}`];
}

function buildSelectionLines(cfg: FieldConfig, opts: OptionItem[]): string[] {
  const base = [
    `  options={${optionsToCode(opts)}}`,
    '  optionLabel="label"',
    '  optionValue="value"',
  ];
  if (cfg.type === "DropdownField")
    return [...base, ...optionsDisabledToCode(cfg.optionsDisabledRaw)];
  if (cfg.type === "MultiSelectField")
    return [
      ...base,
      ...(cfg.display === "chip" ? ['  display="chip"'] : []),
      ...optionsDisabledToCode(cfg.optionsDisabledRaw),
    ];
  if (cfg.type === "RadioButtonField") return [`  options={${optionsToCode(opts)}}`];
  if (cfg.type === "SearchField")
    return [`  items={${optionsToCode(opts)}}`, '  fieldLabel="label"', "  search={() => {}}"];
  return [];
}

function buildCheckboxLines(cfg: FieldConfig): string[] {
  return [
    `  checkboxLabel="${cfg.checkboxLabel}"`,
    ...(cfg.checkedValue === "S" ? [] : [`  checkedValue="${cfg.checkedValue}"`]),
    ...(cfg.uncheckedValue === "N" ? [] : [`  uncheckedValue="${cfg.uncheckedValue}"`]),
  ];
}

function buildTypeSpecificLines(cfg: FieldConfig): string[] {
  const simple = TYPE_SPECIFIC_SIMPLE[cfg.type];
  if (simple) return simple(cfg);

  if (cfg.type === "CheckboxField") return buildCheckboxLines(cfg);

  const opts = parseOptions(cfg.optionsRaw);
  const selectionResult = buildSelectionLines(cfg, opts);
  if (selectionResult.length > 0) return selectionResult;

  return [];
}

function buildFieldLines(cfg: FieldConfig): string[] {
  return [
    ...buildBaseLines(cfg),
    ...buildTypeSpecificLines(cfg),
    "  getFormErrorMessage={(name) => errors[name]?.message}",
    "/>",
  ];
}

function generateCode(fields: FieldConfig[]): string {
  const importsSet = new Set<string>();
  fields.forEach((f) => {
    if (f.type === "CheckboxSN") {
      importsSet.add("CheckboxSNSeplag");
    } else {
      importsSet.add(`${f.type}Seplag`);
    }
  });

  const imports = Array.from(importsSet)
    .sort((a, b) => a.localeCompare(b))
    .join(",\n  ");
  const hasCheckboxSN = fields.some((f) => f.type === "CheckboxSN");

  const fieldCode = fields
    .map((cfg) =>
      buildFieldLines(cfg)
        .map((l) => `  ${l}`)
        .join("\n"),
    )
    .join("\n\n");

  const importStatement = hasCheckboxSN
    ? `import { ${imports} } from "@seplag/ui-lib-react-18";\nimport { CheckboxSNSeplag } from "@seplag/ui-lib-react-18/src/componentes/CheckBoxSN";`
    : `import { ${imports} } from "@seplag/ui-lib-react-18";`;

  return `import { useForm } from "react-hook-form";
${importStatement}

const { control, formState: { errors } } = useForm();

<div className="grid">
${fieldCode}
</div>`;
}

//  Painel de configuração

interface FieldConfigPanelProps {
  readonly cfg: FieldConfig;
  readonly index: number;
  readonly total: number;
  readonly onChange: (updated: FieldConfig) => void;
  readonly onRemove: () => void;
  readonly onMove: (dir: -1 | 1) => void;
}

function FieldConfigPanel({
  cfg,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: Readonly<FieldConfigPanelProps>) {
  const [open, setOpen] = useState(true);
  const set = (patch: Partial<FieldConfig>) => onChange({ ...cfg, ...patch });

  const hasOptions =
    cfg.type === "DropdownField" ||
    cfg.type === "MultiSelectField" ||
    cfg.type === "RadioButtonField";

  const fid = (field: string) => `${cfg.id}_${field}`;

  return (
    <div className="fpg-card">
      <div className="fpg-card-header">
        <button className="fpg-card-toggle" onClick={() => setOpen((v) => !v)}>
          <i className={`pi pi-chevron-${open ? "down" : "right"}`} />
          <span className="fpg-card-title">
            <span className="fpg-badge">{cfg.type.replace("Field", "")}</span>
            <span className="fpg-card-name">{cfg.label || cfg.name}</span>
          </span>
        </button>
        <div className="fpg-card-actions">
          <button
            className="fpg-icon-btn"
            title="Mover para cima"
            disabled={index === 0}
            onClick={() => onMove(-1)}
          >
            <i className="pi pi-arrow-up" />
          </button>
          <button
            className="fpg-icon-btn"
            title="Mover para baixo"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
          >
            <i className="pi pi-arrow-down" />
          </button>
          <button className="fpg-icon-btn fpg-remove" title="Remover campo" onClick={onRemove}>
            <i className="pi pi-trash" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fpg-card-body">
          <div className="fpg-row">
            <label htmlFor={fid("type")} className="fpg-lbl">
              tipo
            </label>
            <select
              id={fid("type")}
              className="fpg-select"
              value={cfg.type}
              onChange={(e) => {
                const newType = e.target.value as FieldType;
                onChange({
                  ...defaultConfig(newType, index),
                  id: cfg.id,
                  name: cfg.name,
                  label: cfg.label,
                });
              }}
            >
              {FIELD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="fpg-row">
            <label htmlFor={fid("name")} className="fpg-lbl">
              name
            </label>
            <input
              id={fid("name")}
              className="fpg-input"
              value={cfg.name}
              onChange={(e) => set({ name: e.target.value })}
            />
          </div>
          <div className="fpg-row">
            <label htmlFor={fid("label")} className="fpg-lbl">
              label
            </label>
            <input
              id={fid("label")}
              className="fpg-input"
              value={cfg.label}
              onChange={(e) => set({ label: e.target.value })}
            />
          </div>
          <div className="fpg-row">
            <label htmlFor={fid("cols")} className="fpg-lbl">
              cols
            </label>
            <input
              id={fid("cols")}
              className="fpg-input fpg-input-sm"
              value={cfg.cols}
              onChange={(e) => set({ cols: e.target.value })}
              placeholder="12 6"
            />
          </div>

          {[
            "TextField",
            "TextAreaField",
            "EmailField",
            "MaskField",
            "DateField",
            "FieldsetDateField",
            "DropdownField",
            "MultiSelectField",
            "SearchField",
            "CurrencyField",
            "NumberField",
          ].includes(cfg.type) && (
            <div className="fpg-row">
              <label htmlFor={fid("placeholder")} className="fpg-lbl">
                placeholder
              </label>
              <input
                id={fid("placeholder")}
                className="fpg-input"
                value={cfg.placeholder}
                onChange={(e) => set({ placeholder: e.target.value })}
              />
            </div>
          )}

          {cfg.type === "NumberField" && (
            <>
              <div className="fpg-row">
                <label htmlFor={fid("min")} className="fpg-lbl">
                  min
                </label>
                <input
                  id={fid("min")}
                  className="fpg-input fpg-input-sm"
                  value={cfg.min}
                  onChange={(e) => set({ min: e.target.value })}
                  placeholder="sem limite"
                />
              </div>
              <div className="fpg-row">
                <label htmlFor={fid("max")} className="fpg-lbl">
                  max
                </label>
                <input
                  id={fid("max")}
                  className="fpg-input fpg-input-sm"
                  value={cfg.max}
                  onChange={(e) => set({ max: e.target.value })}
                  placeholder="sem limite"
                />
              </div>
            </>
          )}

          {cfg.type === "TextAreaField" && (
            <div className="fpg-row">
              <label htmlFor={fid("rows")} className="fpg-lbl">
                rows
              </label>
              <input
                id={fid("rows")}
                className="fpg-input fpg-input-sm"
                value={cfg.rows}
                onChange={(e) => set({ rows: e.target.value })}
              />
            </div>
          )}

          {(cfg.type === "TextField" || cfg.type === "TextAreaField") && (
            <div className="fpg-row">
              <label htmlFor={fid("maxLength")} className="fpg-lbl">
                maxLength
              </label>
              <input
                id={fid("maxLength")}
                className="fpg-input fpg-input-sm"
                value={cfg.maxLength}
                onChange={(e) => set({ maxLength: e.target.value })}
                placeholder="sem limite"
              />
            </div>
          )}

          {cfg.type === "MaskField" && (
            <div className="fpg-row">
              <label htmlFor={fid("mask")} className="fpg-lbl">
                mask
              </label>
              <input
                id={fid("mask")}
                className="fpg-input"
                value={cfg.mask}
                onChange={(e) => set({ mask: e.target.value })}
                placeholder="(99) 99999-9999"
              />
            </div>
          )}

          {hasOptions && (
            <div className="fpg-row fpg-row-top">
              <label htmlFor={fid("options")} className="fpg-lbl">
                opções
              </label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <textarea
                  id={fid("options")}
                  className="fpg-textarea"
                  rows={4}
                  value={cfg.optionsRaw}
                  onChange={(e) => set({ optionsRaw: e.target.value })}
                />
                <span className="fpg-hint">Um por linha: Label|valor</span>
              </div>
            </div>
          )}

          {(cfg.type === "DropdownField" || cfg.type === "MultiSelectField") && (
            <div className="fpg-row">
              <label htmlFor={fid("optionsDisabled")} className="fpg-lbl">
                optionsDisabled
              </label>
              <input
                id={fid("optionsDisabled")}
                className="fpg-input"
                value={cfg.optionsDisabledRaw}
                onChange={(e) => set({ optionsDisabledRaw: e.target.value })}
                placeholder="op2, op3"
              />
            </div>
          )}

          {cfg.type === "MultiSelectField" && (
            <div className="fpg-row">
              <span className="fpg-lbl">display</span>
              <div className="fpg-pills">
                {(["comma", "chip"] as const).map((d) => (
                  <button
                    key={d}
                    className={`fpg-pill${cfg.display === d ? " active" : ""}`}
                    onClick={() => set({ display: d })}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {cfg.type === "CheckboxField" && (
            <>
              <div className="fpg-row">
                <label htmlFor={fid("checkboxLabel")} className="fpg-lbl">
                  checkboxLabel
                </label>
                <input
                  id={fid("checkboxLabel")}
                  className="fpg-input"
                  value={cfg.checkboxLabel}
                  onChange={(e) => set({ checkboxLabel: e.target.value })}
                />
              </div>
              <div className="fpg-row">
                <label htmlFor={fid("checkedValue")} className="fpg-lbl">
                  checkedValue
                </label>
                <input
                  id={fid("checkedValue")}
                  className="fpg-input fpg-input-sm"
                  value={cfg.checkedValue}
                  onChange={(e) => set({ checkedValue: e.target.value })}
                />
              </div>
              <div className="fpg-row">
                <label htmlFor={fid("uncheckedValue")} className="fpg-lbl">
                  uncheckedValue
                </label>
                <input
                  id={fid("uncheckedValue")}
                  className="fpg-input fpg-input-sm"
                  value={cfg.uncheckedValue}
                  onChange={(e) => set({ uncheckedValue: e.target.value })}
                />
              </div>
            </>
          )}

          {cfg.type === "SwitchField" && (
            <div className="fpg-row">
              <label htmlFor={fid("textTooltip")} className="fpg-lbl">
                textTooltip
              </label>
              <input
                id={fid("textTooltip")}
                className="fpg-input"
                value={cfg.textTooltip}
                onChange={(e) => set({ textTooltip: e.target.value })}
              />
            </div>
          )}

          {cfg.type === "SearchField" && (
            <>
              <div className="fpg-row">
                <label htmlFor={fid("searchMinLength")} className="fpg-lbl">
                  minLength
                </label>
                <input
                  id={fid("searchMinLength")}
                  className="fpg-input fpg-input-sm"
                  value={cfg.searchMinLength}
                  onChange={(e) => set({ searchMinLength: e.target.value })}
                />
              </div>
              <div className="fpg-row">
                <span className="fpg-lbl">forceSelection</span>
                <div className="fpg-pills">
                  <button
                    className={`fpg-pill${cfg.searchForceSelection ? " active" : ""}`}
                    onClick={() =>
                      set({
                        searchForceSelection: !cfg.searchForceSelection,
                      })
                    }
                  >
                    Forçar seleção
                  </button>
                </div>
              </div>
            </>
          )}

          {cfg.type === "CheckboxSN" && (
            <div className="fpg-row">
              <span className="fpg-lbl">isDisabled</span>
              <div className="fpg-pills">
                <button
                  className={`fpg-pill${cfg.isDisabled ? " active" : ""}`}
                  onClick={() => set({ isDisabled: !cfg.isDisabled })}
                >
                  Desabilitado
                </button>
              </div>
            </div>
          )}

          {(cfg.type === "CurrencyField" || cfg.type === "NumberField") && (
            <>
              {cfg.type === "CurrencyField" && (
                <>
                  <div className="fpg-row">
                    <label htmlFor={fid("min")} className="fpg-lbl">
                      min
                    </label>
                    <input
                      id={fid("min")}
                      className="fpg-input fpg-input-sm"
                      value={cfg.min}
                      onChange={(e) => set({ min: e.target.value })}
                      placeholder="sem limite"
                    />
                  </div>
                  <div className="fpg-row">
                    <label htmlFor={fid("max")} className="fpg-lbl">
                      max
                    </label>
                    <input
                      id={fid("max")}
                      className="fpg-input fpg-input-sm"
                      value={cfg.max}
                      onChange={(e) => set({ max: e.target.value })}
                      placeholder="sem limite"
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div className="fpg-row">
            <span className="fpg-lbl">modificadores</span>
            <div className="fpg-pills">
              <button
                className={`fpg-pill${cfg.required ? " active" : ""}`}
                onClick={() => set({ required: !cfg.required })}
              >
                required
              </button>
              <button
                className={`fpg-pill${cfg.disabled ? " active" : ""}`}
                onClick={() => set({ disabled: !cfg.disabled })}
              >
                disabled
              </button>
              {cfg.type === "SwitchField" && (
                <button
                  className={`fpg-pill${cfg.horizontal ? " active" : ""}`}
                  onClick={() => set({ horizontal: !cfg.horizontal })}
                >
                  horizontal
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

//  Preview do formulário

interface FormPreviewProps {
  readonly fields: FieldConfig[];
}

function FormPreview({ fields }: Readonly<FormPreviewProps>) {
  const defaultValues = Object.fromEntries(
    fields.map((f) => [f.name, f.type === "CheckboxField" ? f.uncheckedValue : null]),
  );
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });
  const [submitResult, setSubmitResult] = useState<"success" | "error" | null>(null);

  function onValid() {
    setSubmitResult("success");
    setTimeout(() => setSubmitResult(null), 3000);
  }

  function onInvalid() {
    setSubmitResult("error");
    setTimeout(() => setSubmitResult(null), 4000);
  }

  const errorCount = Object.keys(errors).length;

  if (fields.length === 0) {
    return (
      <div className="fpg-empty">
        <i className="pi pi-plus-circle" style={{ fontSize: "2rem", color: "#9ca3af" }} />
        <span>Adicione campos para visualizar o formulário</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onValid, onInvalid)} style={{ width: "100%" }} noValidate>
      <div className="grid" style={{ width: "100%" }}>
        {fields.map((cfg) => (
          <RenderedField key={cfg.id} cfg={cfg} control={control} />
        ))}
      </div>
      <div className="fpg-validate-bar">
        <button type="submit" className="fpg-validate-btn">
          <i className="pi pi-check-circle" /> Validar formulário
        </button>
        {submitResult === "success" && (
          <span className="fpg-validate-ok">
            <i className="pi pi-check" /> Formulário válido!
          </span>
        )}
        {submitResult === "error" && (
          <span className="fpg-validate-err">
            <i className="pi pi-times" />{" "}
            {errorCount === 1 ? "1 campo inválido" : `${errorCount} campos inválidos`}
          </span>
        )}
      </div>
    </form>
  );
}

//  Página principal

export default function FieldsPlaygroundDoc() {
  const [fields, setFields] = useState<FieldConfig[]>([
    defaultConfig("TextField", 0),
    defaultConfig("DropdownField", 1),
  ]);
  const [showCode, setShowCode] = useState(false);
  const [addType, setAddType] = useState<FieldType>("TextField");
  const [widePreview, setWidePreview] = useState(true);

  function addField() {
    setFields((prev) => [...prev, defaultConfig(addType, prev.length)]);
  }

  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }

  function updateField(id: string, updated: FieldConfig) {
    setFields((prev) => prev.map((f) => (f.id === id ? updated : f)));
  }

  function moveField(index: number, dir: -1 | 1) {
    setFields((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const fieldCountLabel = fields.length === 1 ? "1 campo" : `${fields.length} campos`;

  return (
    <div className="fpg-root">
      <div className="fpg-header">
        <h1 className="fpg-title">Fields Playground</h1>
        <p className="fpg-subtitle">
          Monte um formulário adicionando e configurando campos. Copie o código gerado quando
          terminar.
        </p>
      </div>

      <div className={`fpg-layout${widePreview ? " fpg-layout-wide" : ""}`}>
        <div className="fpg-sidebar">
          <div className="fpg-sidebar-toolbar">
            <label htmlFor="fpg-add-type" style={{ display: "none" }}>
              Tipo de campo
            </label>
            <select
              id="fpg-add-type"
              className="fpg-select fpg-select-grow"
              value={addType}
              onChange={(e) => setAddType(e.target.value as FieldType)}
            >
              {FIELD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button className="fpg-btn-add" onClick={addField}>
              <i className="pi pi-plus" /> Adicionar
            </button>
          </div>

          {fields.length === 0 && (
            <p className="fpg-hint" style={{ padding: "1rem" }}>
              Nenhum campo adicionado ainda.
            </p>
          )}

          {fields.map((cfg, index) => (
            <FieldConfigPanel
              key={cfg.id}
              cfg={cfg}
              index={index}
              total={fields.length}
              onChange={(updated) => updateField(cfg.id, updated)}
              onRemove={() => removeField(cfg.id)}
              onMove={(dir) => moveField(index, dir)}
            />
          ))}
        </div>

        <div className="fpg-main">
          <div className="fpg-preview-box">
            <div className="fpg-preview-header">
              <span className="fpg-preview-title">
                <i className="pi pi-eye" /> Pré-visualização
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span className="fpg-field-count">{fieldCountLabel}</span>
                <button
                  className={`fpg-icon-btn${widePreview ? " fpg-expand-active" : ""}`}
                  title={widePreview ? "Modo compacto" : "Expandir preview"}
                  onClick={() => setWidePreview((v) => !v)}
                >
                  <i className={`pi pi-${widePreview ? "compress" : "expand"}`} />
                </button>
              </div>
            </div>
            <div className="fpg-preview-body">
              <FormPreview fields={fields} />
            </div>
          </div>

          <div className="fpg-code-box">
            <button className="fpg-code-toggle" onClick={() => setShowCode((v) => !v)}>
              <i className={`pi pi-chevron-${showCode ? "down" : "right"}`} /> Código gerado
            </button>
            {showCode && <pre className="fpg-code">{generateCode(fields)}</pre>}
          </div>
        </div>
      </div>
    </div>
  );
}
