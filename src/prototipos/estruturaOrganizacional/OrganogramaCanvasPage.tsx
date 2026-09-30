import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { OrganogramaCanvasContent } from "./OrganogramaCanvasContent";

const estrutura = menuGestaoPessoas.find((item) => item.label === "Cadastro")?.items?.find((item) => item.label === "Estrutura Organizacional");
if (estrutura?.items && !estrutura.items.some((item) => item.label === "Organograma Canvas")) {
  estrutura.items.push({ label: "Organograma Canvas", icon: "pi pi-share-alt", to: "/prototipos/sigep/gestao/cadastro/estrutura-organizacional/organograma-canvas", visibleOnMenu: true, visibleOnRouter: true });
}

export function PrototiposOrganogramaCanvasPage() {
  return <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}><OrganogramaCanvasContent /></PrototypeSystemPage>;
}
