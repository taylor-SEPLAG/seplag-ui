import { useLocation } from "react-router-dom";
import { BreadcrumbSeplag, type BreadcrumbItemSeplag } from "../../componentes/Breadcrumb";
import "./breadcrumbVagas.css";

export function BreadcrumbVagas() {
  const { pathname } = useLocation();
  const base = "/prototipos/sigep/controle-vagas";
  const partes = pathname.slice(base.length).split("/").filter(Boolean);
  const items: BreadcrumbItemSeplag[] = [{ label: "Controle de Vagas", to: "/prototipos/sigep/controle-vagas/dashboard" }];
  const telas: Record<string, string> = {
    dashboard: "Dashboard", configuracoes: "Regras e Parâmetros",
    distribuicao: "Distribuição", redistribuicao: "Redistribuição",
    movimentacoes: "Movimentações", cessoes: "Cessões", projecoes: "Projeções",
    "quadro-autorizado": "Quadro Servidores Efetivos", vagas: "Vagas Servidores Efetivos",
  };
  const categoria = !partes.length || ["efetivos", "quadro-autorizado", "vagas"].includes(partes[0]);
  if (categoria) items.push({ label: "Vagas Servidores Efetivos", to: "/prototipos/sigep/controle-vagas/efetivos" });
  const tela = partes[0];
  if (telas[tela]) items.push({ label: telas[tela], to: base + "/" + tela });
  if (partes.length > 1) {
    const acao = partes[partes.length - 1];
    const rotulos: Record<string, string> = { novo: "Cadastrar", nova: "Cadastrar", editar: "Editar", "nova-versao": "Nova versão", "nova-remocao": "Nova remoção", "nova-cessao": "Nova cessão" };
    items.push({ label: rotulos[acao] ?? "Visualizar" });
  }
  return <div className="breadcrumb-vagas-efetivos"><BreadcrumbSeplag divided homeTo="/prototipos/sigep" items={items} /></div>;
}
