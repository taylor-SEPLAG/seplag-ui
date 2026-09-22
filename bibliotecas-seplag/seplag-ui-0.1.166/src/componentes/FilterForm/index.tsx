import type { ReactNode } from "react";

interface FilterFormSeplagProps {
  readonly id?: string;
  readonly children: ReactNode;
  readonly onSubmit?: React.JSX.IntrinsicElements["form"]["onSubmit"];
  readonly asDiv?: boolean;
}

interface FilterActionsSeplagProps {
  readonly id?: string;
  readonly children: ReactNode;
}

export function FilterFormSeplag({
  id = "filter-form",
  children,
  onSubmit,
  asDiv,
}: Readonly<FilterFormSeplagProps>) {
  if (asDiv) {
    return (
      <div id={id} data-testid={id} className="col-12 grid p-fluid">
        {children}
      </div>
    );
  }

  return (
    <form id={id} data-testid={id} className="col-12 grid p-fluid" onSubmit={onSubmit}>
      {children}
    </form>
  );
}

export function FilterActionsSeplag({
  id = "filter-actions",
  children,
}: Readonly<FilterActionsSeplagProps>) {
  return (
    <div
      id={id}
      data-testid={id}
      className="flex gap-2"
      style={{ paddingTop: "1.8rem", alignItems: "flex-start" }}
    >
      {children}
    </div>
  );
}
