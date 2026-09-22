import { FilterMatchMode, type APIOptions, PrimeReactProvider } from "primereact/api";
import type { ReactNode } from "react";

/**
 * Configuração padrão do PrimeReactProvider usada por todos os apps SEPLAG
 * (filterMatchMode, zIndex, ripple, etc.). Compartilhada para evitar
 * divergência entre aplicações.
 */
export const primeReactConfigSeplag: Partial<APIOptions> = {
  filterMatchModeOptions: {
    text: [
      FilterMatchMode.STARTS_WITH,
      FilterMatchMode.CONTAINS,
      FilterMatchMode.NOT_CONTAINS,
      FilterMatchMode.ENDS_WITH,
      FilterMatchMode.EQUALS,
      FilterMatchMode.NOT_EQUALS,
    ],
    numeric: [
      FilterMatchMode.EQUALS,
      FilterMatchMode.NOT_EQUALS,
      FilterMatchMode.LESS_THAN,
      FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
      FilterMatchMode.GREATER_THAN,
      FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
    ],
    date: [
      FilterMatchMode.DATE_IS,
      FilterMatchMode.DATE_IS_NOT,
      FilterMatchMode.DATE_BEFORE,
      FilterMatchMode.DATE_AFTER,
    ],
  },
  cssTransition: true,
  nullSortOrder: 1,
  ripple: true,
  zIndex: {
    modal: 1100, // dialog, sidebar
    overlay: 1000, // dropdown, overlaypanel
    menu: 1000, // overlay menus
    tooltip: 1100, // tooltip
    toast: 1200, // toast
  },
  autoZIndex: true,
};

export interface AppPrimeReactProviderSeplagProps {
  readonly children: ReactNode;
  /** Sobrepõe/estende a configuração padrão (primeReactConfigSeplag). */
  readonly value?: Partial<APIOptions>;
}

export function AppPrimeReactProviderSeplag({
  children,
  value,
}: AppPrimeReactProviderSeplagProps) {
  return (
    <PrimeReactProvider value={{ ...primeReactConfigSeplag, ...value }}>
      {children}
    </PrimeReactProvider>
  );
}

export default AppPrimeReactProviderSeplag;
