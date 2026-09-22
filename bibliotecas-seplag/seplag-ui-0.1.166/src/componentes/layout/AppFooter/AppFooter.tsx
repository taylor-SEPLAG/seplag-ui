import type { ReactNode } from "react";

export interface AppFooterSeplagProps {
  children?: ReactNode;
  text?: string;
}

export function AppFooterSeplag({ children, text }: AppFooterSeplagProps) {
  return (
    <div className="layout-footer" id="app-footer" data-testid="app-footer">
      {children ?? <span>{text}</span>}
    </div>
  );
}
