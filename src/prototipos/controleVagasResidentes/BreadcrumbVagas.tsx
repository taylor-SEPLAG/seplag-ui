import { useLocation, useNavigate } from "react-router-dom";
import { BotaoSeplag } from "../../componentes";
import {
  BreadcrumbSeplag,
  type BreadcrumbItemSeplag,
} from "../../componentes/Breadcrumb";
import "./breadcrumbVagas.css";

export function BreadcrumbVagas() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const base = "/prototipos/sigep/controle-vagas/bolsistas";
  const partes = pathname.slice(base.length).split("/").filter(Boolean);
  const items: BreadcrumbItemSeplag[] = [
    {
      label: "Controle de Vagas",
      to: "/prototipos/sigep/controle-vagas/dashboard",
    },
  ];
  const telas: Record<string, string> = {
    dashboard: "Dashboard",
    configuracoes: "Regras e Parâmetros",
    distribuicao: "Distribuição",
    redistribuicao: "Redistribuição",
    movimentacoes: "Movimentações",
    cessoes: "Cessões",
    projecoes: "Projeções",
    "quadro-autorizado": "Quadro Autorizado Bolsistas",
    vagas: "Vagas Individualizadas Bolsistas",
  };

  items.push({
    label: "Bolsistas",
    to: "/prototipos/sigep/controle-vagas/bolsistas",
  });

  const tela = partes[0];
  if (telas[tela]) items.push({ label: telas[tela], to: base + "/" + tela });

  if (partes.length > 1) {
    const acao = partes[partes.length - 1];
    const rotulos: Record<string, string> = {
      novo: "Cadastrar",
      nova: "Cadastrar",
      editar: "Editar",
      "nova-versao": "Nova versão",
      "nova-remocao": "Nova remoção",
      "nova-cessao": "Nova cessão",
    };
    items.push({ label: rotulos[acao] ?? "Visualizar" });
  }

  const atalho =
    partes.length === 1 && tela === "quadro-autorizado"
      ? {
          label: "Vagas Individualizadas Bolsistas",
          icon: "pi pi-list",
          destino: base + "/vagas",
        }
      : partes.length === 1 && tela === "vagas"
        ? {
            label: "Quadros Autorizados Bolsistas",
            icon: "pi pi-table",
            destino: base + "/quadro-autorizado",
          }
        : null;

  return (
    <div className="breadcrumb-vagas-residentes">
      <BreadcrumbSeplag divided homeTo="/prototipos/sigep" items={items} />
      {atalho && (
        <BotaoSeplag
          type="button"
          variant="back"
          label={atalho.label}
          icon={atalho.icon}
          onClick={() => navigate(atalho.destino)}
        />
      )}
    </div>
  );
}

