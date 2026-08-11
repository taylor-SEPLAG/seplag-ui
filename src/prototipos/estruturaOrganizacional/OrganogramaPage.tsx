import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { OrganogramaContent } from "./OrganogramaContent";

const estrutura = menuGestaoPessoas.find((item) => item.label === "Cadastro")?.items?.find((item) => item.label === "Estrutura Organizacional");
if (estrutura?.items && !estrutura.items.some((item) => item.label === "Organograma")) {
  estrutura.items.push({ label: "Organograma", icon: "pi pi-circle-on", to: "/prototipos/sigep/gestao/cadastro/estrutura-organizacional/organograma", visibleOnMenu: true, visibleOnRouter: true });
}

export function PrototiposOrganogramaPage() {
  return <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}><OrganogramaContent /></PrototypeSystemPage>;
}
