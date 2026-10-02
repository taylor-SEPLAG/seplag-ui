import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { OrganogramaContent } from "./OrganogramaContent";

const estrutura = menuGestaoPessoas.find((item) => item.label === "Cadastro")?.items?.find((item) => item.label === "Estrutura Organizacional");
const rotaEstruturaUnidades = "/prototipos/sigep/gestao/cadastro/estrutura-organizacional/organograma";
const itemEstruturaUnidades = estrutura?.items?.find((item) => item.to === rotaEstruturaUnidades);
if (itemEstruturaUnidades) itemEstruturaUnidades.label = "Estrutura e Unidades";
else estrutura?.items?.push({ label: "Estrutura e Unidades", icon: "pi pi-circle-on", to: rotaEstruturaUnidades, visibleOnMenu: true, visibleOnRouter: true });

export function PrototiposOrganogramaPage() {
  return <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}><OrganogramaContent /></PrototypeSystemPage>;
}
