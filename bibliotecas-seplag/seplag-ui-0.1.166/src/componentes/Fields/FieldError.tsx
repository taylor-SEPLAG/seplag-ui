import type { ReactNode } from "react";

interface FieldErrorProps {
  id?: string;
  children?: ReactNode;
}

export function FieldError({ id, children }: Readonly<FieldErrorProps>) {
  if (!children) return null;

  return (
    <small
      id={id}
      data-testid={id}
      className="p-error"
      style={{ display: "block", marginTop: "0.25rem" }}
    >
      {children}
    </small>
  );
}
