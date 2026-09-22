import { BotaoSalvarSeplag, BotaoVoltarSeplag, type BotaoSeplagProps } from "@componentes/Botao";
import DividerSeplag from "@componentes/Divider";
import type { ReactNode } from "react";

interface FormActionsSeplagProps {
  readonly id?: string;
  readonly onGoBack: () => void;
  readonly onSave?: () => void;
  readonly showSave?: boolean;
  readonly showBack?: boolean;
  readonly isLoading?: boolean;
  readonly disableSave?: boolean;
  readonly disableBack?: boolean;
  readonly saveLabel?: string;
  readonly backLabel?: string;
  readonly saveProps?: Omit<BotaoSeplagProps, "type" | "loading" | "onClick">;
  readonly children?: ReactNode;
}

export function FormActionsSeplag({
  id = "form-actions",
  onGoBack,
  onSave,
  showSave = true,
  showBack = true,
  isLoading = false,
  disableSave = false,
  disableBack = false,
  saveLabel = "Salvar",
  backLabel = "Voltar",
  saveProps,
  children,
}: Readonly<FormActionsSeplagProps>) {
  return (
    <>
      <DividerSeplag className="col-12" />
      <div id={id} data-testid={id} className="flex gap-2 justify-content-end col-12">
        {showBack && (
          <BotaoVoltarSeplag
            id={`${id}-voltar`}
            data-testid={`${id}-voltar`}
            label={backLabel}
            onClick={onGoBack}
            disabled={disableBack}
          />
        )}
        {children}
        {showSave && (
          <BotaoSalvarSeplag
            id={`${id}-salvar`}
            data-testid={`${id}-salvar`}
            type={onSave ? "button" : "submit"}
            label={saveLabel}
            loading={isLoading}
            disabled={disableSave}
            onClick={onSave}
            {...saveProps}
          />
        )}
      </div>
    </>
  );
}
