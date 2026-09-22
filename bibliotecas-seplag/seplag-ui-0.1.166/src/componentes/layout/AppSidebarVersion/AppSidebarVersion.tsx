import { useEffect, useState } from "react";
import { BadgeSeplag, type BadgeSeplagProps } from "../../Badge";
import { ModalSeplag } from "../../Modal";

export const TipoSistemaVersaoSeplag = {
  FRONTEND: "frontend",
  BACKEND: "backend",
} as const;

export type TipoSistemaVersaoSeplag =
  (typeof TipoSistemaVersaoSeplag)[keyof typeof TipoSistemaVersaoSeplag];

const ICONE_PADRAO_POR_TIPO: Record<TipoSistemaVersaoSeplag, string> = {
  [TipoSistemaVersaoSeplag.FRONTEND]: "pi pi-desktop",
  [TipoSistemaVersaoSeplag.BACKEND]: "pi pi-server",
};

const ORDEM_LABELS = ["Versão", "Build", "Commit"];

const VARIANT_POR_LABEL: Record<string, NonNullable<BadgeSeplagProps["variant"]>> = {
  Versão: "info",
  Build: "success",
  Commit: "warning",
};

function ordenarVersoes(versoes: VersaoValorSeplag[]): VersaoValorSeplag[] {
  return [...versoes].sort((a, b) => {
    const indexA = a.label ? ORDEM_LABELS.indexOf(a.label) : -1;
    const indexB = b.label ? ORDEM_LABELS.indexOf(b.label) : -1;
    return (
      (indexA === -1 ? ORDEM_LABELS.length : indexA) -
      (indexB === -1 ? ORDEM_LABELS.length : indexB)
    );
  });
}

/**
 * Achata `sistemas` de volta ao formato plano da API (`{ nome, versao, commit, build }`) para o
 * atalho Ctrl+C — a estrutura `versoes: [{label, valor}]` é conveniente para renderizar badges
 * lado a lado, mas não é o formato que o usuário espera copiar.
 */
function sistemasParaResponseBruto(sistemas: readonly SistemaVersaoSeplag[]) {
  return sistemas.map((sistema) => {
    const valorPorLabel = Object.fromEntries(
      sistema.versoes.map((v) => [v.label, v.valor ?? null]),
    );
    return {
      nome: sistema.nome,
      versao: valorPorLabel.Versão ?? null,
      commit: valorPorLabel.Commit ?? null,
      build: valorPorLabel.Build ?? null,
    };
  });
}

export interface VersaoValorSeplag {
  /** Rótulo curto da versão (ex.: "Build", "Versão"). Omitido quando o sistema só tem uma versão. */
  label?: string;
  valor?: string | null;
}

export interface SistemaVersaoSeplag {
  /** Nome de exibição do sistema/serviço (ex.: "Front-end", "API SIGEP"). */
  nome: string;
  /** Uma ou mais versões desse sistema, exibidas lado a lado na mesma linha. */
  versoes: VersaoValorSeplag[];
  /** Determina o ícone padrão exibido (frontend ou backend). */
  tipo?: TipoSistemaVersaoSeplag;
  /** Classe de ícone PrimeIcons customizada (ex.: "pi pi-cloud"). Sobrescreve o ícone padrão do `tipo`. */
  icone?: string;
}

export interface AppSidebarVersionSeplagProps {
  /** Sistemas e suas versões, exibidos no modal de versões do menu lateral. */
  sistemas?: SistemaVersaoSeplag[];
  collapsed?: boolean;
  onOpen?: () => void;
}

export function AppSidebarVersionSeplag({
  sistemas = [],
  collapsed,
  onOpen,
}: Readonly<AppSidebarVersionSeplagProps>) {
  const [visible, setVisible] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const abrir = () => {
    onOpen?.();
    setVisible(true);
  };
  useEffect(() => {
    if (!visible) return;

    function handleKeyDown(event: KeyboardEvent) {
      const isCopyShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c";
      if (!isCopyShortcut) return;

      const selecao = window.getSelection()?.toString();
      if (selecao) return;

      event.preventDefault();
      const json = JSON.stringify(sistemasParaResponseBruto(sistemas), null, 2);
      navigator.clipboard
        .writeText(json)
        .then(() => {
          setCopiado(true);
          window.setTimeout(() => setCopiado(false), 2000);
        })
        .catch(() => {});
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible, sistemas]);

  if (sistemas.length === 0 && !onOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="layout-sidebar-version"
        id="app-sidebar-version"
        data-testid="app-sidebar-version"
        onClick={abrir}
      >
        <i className="pi pi-info-circle" />
        {!collapsed && <span className="layout-sidebar-version-label">Versões</span>}
      </button>

      <ModalSeplag
        id="modal-versoes-sistema"
        visible={visible}
        fechar={() => setVisible(false)}
        titulo={
          <span className="flex align-items-center gap-2">
            Versões do sistema
            {copiado && (
              <BadgeSeplag label="JSON copiado!" variant="success" size="xs" minWidth={0} />
            )}
          </span>
        }
        onlyClose
        tamanho="min(800px, 95vw)"
        showFooterDivider={false}
      >
        <ul className="layout-sidebar-version-list">
          {sistemas.map((sistema) => (
            <li key={sistema.nome}>
              <div className="layout-sidebar-version-icon">
                <i
                  className={
                    sistema.icone ??
                    ICONE_PADRAO_POR_TIPO[sistema.tipo ?? TipoSistemaVersaoSeplag.BACKEND]
                  }
                />
              </div>
              <div className="layout-sidebar-version-body">
                <span className="layout-sidebar-version-nome">{sistema.nome}</span>
                <div className="layout-sidebar-version-valores">
                  {ordenarVersoes(sistema.versoes).map((v, index) => (
                    <BadgeSeplag
                      // eslint-disable-next-line react/no-array-index-key
                      key={v.label ?? index}
                      label={
                        v.label
                          ? `${v.label} ${v.valor ?? "indisponível"}`
                          : (v.valor ?? "indisponível")
                      }
                      variant={(v.label && VARIANT_POR_LABEL[v.label]) || "neutral"}
                      capitalize={false}
                      size="xs"
                      minWidth={0}
                      tooltip={v.label}
                    />
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </ModalSeplag>
    </>
  );
}
