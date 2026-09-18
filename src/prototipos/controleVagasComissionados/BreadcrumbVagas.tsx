import { useLocation, useNavigate } from "react-router-dom";
import { BotaoSeplag } from "../../componentes";
import { BreadcrumbSeplag, type BreadcrumbItemSeplag } from "../../componentes/Breadcrumb";
import "./breadcrumbVagas.css";

export function BreadcrumbVagas() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const base = "/prototipos/sigep/controle-vagas/comissionados";
  const partes = pathname.slice(base.length).split("/").filter(Boolean);
  const items: BreadcrumbItemSeplag[] = [{ label: "Controle de Vagas", to: "/prototipos/sigep/controle-vagas/dashboard" }];
  const telas: Record<string, string> = {
    dashboard: "Dashboard", configuracoes: "Regras e Parâmetros",
    distribuicao: "Distribuição", redistribuicao: "Redistribuição",
    movimentacoes: "Movimentações", cessoes: "Cessões", projecoes: "Projeções",
    "quadro-autorizado": "Quadro Autorizado", vagas: "Vagas Individualizadas",
  };
  const categoria = true;
  if (categoria) items.push({ label: "Vagas Comissionados", to: "/prototipos/sigep/controle-vagas/comissionados" });
  const tela = partes[0];
  if (telas[tela]) items.push({ label: telas[tela], to: base + "/" + tela });
  if (partes.length > 1) {
    const acao = partes[partes.length - 1];
    const rotulos: Record<string, string> = { novo: "Cadastrar", nova: "Cadastrar", editar: "Editar", "nova-versao": "Nova versão", "nova-remocao": "Nova remoção", "nova-cessao": "Nova cessão" };
    items.push({ label: rotulos[acao] ?? "Visualizar" });
  }
  const atalho = partes.length === 1 && tela === "quadro-autorizado"
    ? { label: "Vagas Comissionados", icon: "pi pi-list", destino: base + "/vagas" }
    : partes.length === 1 && tela === "vagas"
      ? { label: "Quadro de Vagas Comissionados", icon: "pi pi-table", destino: base + "/quadro-autorizado" }
      : null;

  return <div className="breadcrumb-vagas-comissionados">
    <BreadcrumbSeplag homeTo="/prototipos/sigep" items={items} />
    {atalho && <BotaoSeplag type="button" variant="back" label={atalho.label} icon={atalho.icon} onClick={() => navigate(atalho.destino)} />}
  </div>;
}

