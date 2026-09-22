import { BotaoSeplag } from "@componentes/Botao";
import type { CSSProperties } from "react";
import {
  SEPLAG_BORDER_LIGHT,
  SEPLAG_PRIMARY,
  SEPLAG_SECONDARY,
  SEPLAG_WHITE,
} from "../../tokens/colors";

const DEFAULT_COL_CLASS = "lg:col-3";

const BASE_BUTTON_STYLE: CSSProperties = {
  width: "100%",
  height: "44px",
  padding: "0px",
  margin: "0px",
  borderRadius: "0px",
  border: `1px solid ${SEPLAG_BORDER_LIGHT}`,
  boxSizing: "border-box",
};

const getTabItemKey = <T,>(item: TabItemSeplag<T>, index: number): string =>
  item.id ?? (item.value == null ? String(index) : String(item.value));

const getTabButtonStyle = (active: boolean): CSSProperties => ({
  ...BASE_BUTTON_STYLE,
  backgroundColor: active ? SEPLAG_PRIMARY : SEPLAG_SECONDARY,
  color: SEPLAG_WHITE,
});

export interface TabItemSeplag<T = any> {
  id?: string;
  label: string;
  value?: T;
  disabled?: boolean;
  active?: boolean;
  icon?: string;
  index?: number;
  col?: string; // ex: 'lg:col-3', 'lg:col-2'
}

export interface TabsSeplagProps<T = any> {
  items: TabItemSeplag<T>[];
  onTabChange?: (selectedTab: TabItemSeplag<T>) => void;
  onTabChangeIndex?: (index: number) => void;
  activeIndex?: number;
  activeValue?: T; // Para compatibilidade com MenuAbasSeplag
  onChange?: (value: T) => void; // Para compatibilidade com MenuAbasSeplag
  className?: string;
  style?: CSSProperties;
  disableTabsOnCreate?: boolean;
  isCreate?: boolean;
  firstAbaLiberada?: T; // aba permitida quando isCreate = true (compatibilidade MenuAbasSeplag)
  maxWidth?: string; // Para compatibilidade com MenuAbasSeplag (default: '1050px')
  showRequiredLegend?: boolean;
  legendPosition?: "right" | "bottom";
}

export function TabsSeplag<T = any>({
  items,
  onTabChange,
  onTabChangeIndex,
  activeIndex,
  activeValue,
  onChange,
  className = "",
  style,
  disableTabsOnCreate = false,
  isCreate = false,
  firstAbaLiberada,
  maxWidth,
  showRequiredLegend: _showRequiredLegend,
  legendPosition: _legendPosition,
}: Readonly<TabsSeplagProps<T>>) {
  const isTabActive = (item: TabItemSeplag<T>, index: number) => {
    // Suporte para activeValue (compatibilidade MenuAbasSeplag)
    if (activeValue !== undefined && item.value !== undefined) {
      return activeValue === item.value;
    }
    // Suporte para activeIndex
    if (activeIndex !== undefined) {
      return activeIndex === (item.index ?? index);
    }
    // Fallback para item.active
    return item.active || false;
  };

  const isTabDisabled = (item: TabItemSeplag<T>) => {
    // Suporte para firstAbaLiberada (compatibilidade MenuAbasSeplag)
    if (isCreate && firstAbaLiberada !== undefined && item.value !== undefined) {
      return item.value !== firstAbaLiberada;
    }
    return Boolean(item.disabled) || (disableTabsOnCreate && isCreate);
  };

  const handleTabClick = (item: TabItemSeplag<T>, index: number, disabled: boolean) => {
    if (disabled) return;

    // Suporte para onChange (compatibilidade MenuAbasSeplag)
    if (onChange && item.value !== undefined) {
      onChange(item.value);
      return;
    }

    if (onTabChangeIndex && (item.index !== undefined || activeIndex !== undefined)) {
      onTabChangeIndex(item.index ?? index);
    } else if (onTabChange) {
      onTabChange(item);
    }
  };

  return (
    <div className={`col-12 flex flex-column relative ${className}`} style={style}>
      {/* Wrapper com largura máxima (compatibilidade MenuAbasSeplag) */}
      <div className="w-full" style={maxWidth ? { maxWidth } : undefined}>
        <div className="grid" style={{ margin: 0 }}>
          {items.map((item, index) => {
            const itemKey = getTabItemKey(item, index);
            const colClass = item.col || DEFAULT_COL_CLASS;
            const active = isTabActive(item, index);
            const disabled = isTabDisabled(item);

            return (
              <div
                className={`col-12 md:col-6 ${colClass}`}
                key={itemKey}
                style={{ padding: "1px" }}
              >
                <BotaoSeplag
                  id={`tab-${itemKey}`}
                  data-testid={`tab-${itemKey}`}
                  label={item.label}
                  icon={item.icon}
                  type="button"
                  style={getTabButtonStyle(active)}
                  disabled={disabled}
                  aria-pressed={active}
                  onClick={() => handleTabClick(item, index, disabled)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TabsSeplag;
