import { useLocation } from "react-router-dom";
import { BreadcrumbSeplag, type BreadcrumbItemSeplag } from "../../componentes/Breadcrumb";
import "./breadcrumbVagas.css";

export function BreadcrumbVagas() {
  const { pathname } = useLocation();
  const base = "/prototipos/sigep/controle-vagas/temporarios";
  const partes = pathname.slice(base.length).split("/").filter(Boolean);
  const items: BreadcrumbItemSeplag[] = [{ label: "Controle de Vagas", to: "/prototipos/sigep/controle-vagas/dashboard" }];
  const telas: Record<string, string> = {
    dashboard: "Dashboard", configuracoes: "Regras e Parâmetros",
    distribuicao: "Distribuição", redistribuicao: "Redistribuição",
    movimentacoes: "Movimentações", cessoes: "Cessões", projecoes: "Projeções",
    "quadro-autorizado": "Quadro Contratos Temporários", vagas: "Vagas Contratos Temporários",
  };
  const categoria = true;
  if (categoria) items.push({ label: "Vagas Contratos Temporários", to: "/prototipos/sigep/controle-vagas/temporarios" });
  const tela = partes[0];
  if (telas[tela]) items.push({ label: telas[tela], to: base + "/" + tela });
  if (partes.length > 1) {
    const acao = partes[partes.length - 1];
    const rotulos: Record<string, string> = { novo: "Cadastrar", nova: "Cadastrar", editar: "Editar", "nova-versao": "Nova versão", "nova-remocao": "Nova remoção", "nova-cessao": "Nova cessão" };
    items.push({ label: rotulos[acao] ?? "Visualizar" });
  }
  return <div className="breadcrumb-vagas-temporarios"><BreadcrumbSeplag divided homeTo="/prototipos/sigep" items={items} /></div>;
}
