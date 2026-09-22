import { Button, type ButtonProps } from "primereact/button";
import { SEPLAG_PRIMARY } from "../../tokens/colors";

const baseBotaoStyle = {
  height: 40,
  minWidth: 120,
  width: "auto",
  borderRadius: 4,
};

const saveBotaoStyle = {
  ...baseBotaoStyle,
  color: "white",
  backgroundColor: SEPLAG_PRIMARY,
};

const backBotaoStyle = {
  ...baseBotaoStyle,
  color: SEPLAG_PRIMARY,
  backgroundColor: "white",
  borderColor: SEPLAG_PRIMARY,
  width: "auto",
};

const clearFilterBotaoStyle = {
  height: 40,
  minWidth: 40,
  width: "auto",
  borderRadius: 4,
  border: "0px",
};

const noBorderStyle = {
  border: "0px",
};

const iconBotaoStyle = {
  color: "white",
  fontSize: "0.8rem",
};

export type BotaoSeplagProps = ButtonProps & {
  label?: string;
  hasPermission?: boolean;
  visible?: boolean;
  variant?: "base" | "save" | "back" | "clear" | "icon";
  tooltip?: string;
  tooltipOptions?: any;
  minWidth?: string;
  "data-testid"?: string;
};

type BotaoChipSeplagProps = BotaoSeplagProps & {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
  type?: ButtonProps["type"];
};

const defaultTooltipOptions = { position: "top" } as any;

function slugifyLabel(label?: string): string | undefined {
  if (!label) return undefined;

  return label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function ButtonSeplag(props: BotaoSeplagProps) {
  const {
    variant = "base",
    hasPermission = true,
    visible = true,
    style,
    label,
    icon,
    unstyled = false,
    tooltip,
    tooltipOptions = defaultTooltipOptions,
    outlined,
    minWidth,
    id,
    "data-testid": dataTestId,
    "aria-label": ariaLabel,
    ...rest
  } = props as any;

  const resolvedTestId = dataTestId ?? slugifyLabel(label) ?? id ?? `botao-${variant}`;
  const resolvedAriaLabel = ariaLabel ?? label ?? tooltip;

  if (!visible) return null;

  let mergedStyle;

  if (unstyled) {
    mergedStyle = style;
  } else {
    switch (variant) {
      case "save":
        mergedStyle = { ...saveBotaoStyle, ...style };
        break;
      case "back":
        mergedStyle = { ...backBotaoStyle, ...style };
        break;
      case "clear":
        mergedStyle = { ...clearFilterBotaoStyle, ...style };
        break;
      case "icon":
        mergedStyle = { ...iconBotaoStyle, ...style };
        break;
      default:
        mergedStyle = { ...baseBotaoStyle, ...style };

        if (!outlined) {
          mergedStyle = { ...mergedStyle, ...noBorderStyle };
        }
    }
  }

  if (minWidth) {
    mergedStyle = { ...mergedStyle, minWidth };
  }

  if (!shouldRenderButton(hasPermission)) {
    return null;
  }

  return (
    <Button
      id={id ?? resolvedTestId}
      data-testid={resolvedTestId}
      aria-label={resolvedAriaLabel}
      style={mergedStyle}
      label={label}
      icon={icon}
      unstyled={unstyled}
      tooltip={tooltip}
      tooltipOptions={tooltipOptions}
      outlined={outlined}
      {...(rest as ButtonProps)}
    >
      {(props as any).children}
    </Button>
  );
}

function shouldRenderButton(hasPermission?: boolean) {
  return hasPermission !== false;
}

export function BotaoChipSeplag({
  children,
  style,
  className,
  onClick,
  type = "button",
  tooltip,
  tooltipOptions = defaultTooltipOptions,
  id,
  ...rest
}: Readonly<BotaoChipSeplagProps>) {
  return (
    <ButtonSeplag
      unstyled
      type={type}
      style={style}
      className={className}
      onClick={onClick}
      tooltip={tooltip}
      tooltipOptions={tooltipOptions}
      id={id}
      {...rest}
    >
      {children}
    </ButtonSeplag>
  );
}

export function BotaoAdicionarSeplag(props: BotaoSeplagProps) {
  return <ButtonSeplag label="Adicionar" icon="pi pi-plus" iconPos="left" {...props} />;
}

export function BotaoSalvarSeplag(props: BotaoSeplagProps) {
  return (
    <ButtonSeplag
      variant="save"
      label={props.label ?? "Salvar"}
      icon="pi pi-save"
      iconPos="left"
      raised
      {...props}
    />
  );
}

export function BotaoVoltarSeplag(props: BotaoSeplagProps) {
  return (
    <ButtonSeplag
      variant="back"
      label={props.label ?? "Voltar"}
      icon="pi pi-arrow-left"
      iconPos="left"
      text
      raised
      type={props.type ?? "button"}
      {...props}
    />
  );
}

export function BotaoFecharSeplag(props: BotaoSeplagProps) {
  return (
    <ButtonSeplag
      variant="back"
      label={props.label ?? "Fechar"}
      text
      raised
      type={props.type ?? "button"}
      {...props}
    />
  );
}

export function BotaoConsultarSeplag(props: BotaoSeplagProps) {
  return (
    <ButtonSeplag
      label={props.label ?? "Consultar"}
      icon="pi pi-search"
      iconPos="left"
      {...props}
    />
  );
}

export function BotaoIconSeplag(props: BotaoSeplagProps) {
  const { tooltipOptions = defaultTooltipOptions } = props as any;
  return <ButtonSeplag variant="icon" tooltipOptions={tooltipOptions} {...props} />;
}

export function BotaoSeplag(props: BotaoSeplagProps) {
  return <ButtonSeplag {...props} />;
}

export function BotaoLimparFiltroSeplag(props: BotaoSeplagProps) {
  return <ButtonSeplag variant="clear" label={props.label ?? "Limpar Filtro"} {...props} />;
}

export function BotaoEditarSeplag(props: BotaoSeplagProps) {
  return (
    <ButtonSeplag
      variant="back"
      label={props.label ?? "Editar"}
      icon="pi pi-pencil"
      iconPos="left"
      text
      type={props.type ?? "button"}
      {...props}
    />
  );
}

export function BotaoRemoverSeplag(props: BotaoSeplagProps) {
  return (
    <ButtonSeplag
      label={props.label ?? "Remover"}
      icon="pi pi-trash"
      iconPos="left"
      outlined
      severity="danger"
      type={props.type ?? "button"}
      {...props}
    />
  );
}