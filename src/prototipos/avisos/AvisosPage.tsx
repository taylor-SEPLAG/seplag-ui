import { menuGestaoPessoas, PrototypeSystemPage } from "../PrototiposPage";
import { getPermissionsSeplag } from "../../componentes/layout/Config/menu";
import { funcionalidades, menuDisponivel } from "../paginaInicial/model";
import { useInformativos } from "./model";
import { AvisosContent } from "./AvisosContent";

export function AvisosPage() {
  const avisos = useInformativos();
  const menu = menuDisponivel(menuGestaoPessoas, getPermissionsSeplag() ?? []);
  const permitido = funcionalidades(menu).some(
    (item) => item.nome === "Painel Informativo",
  );
  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menu}
    >
      {permitido ? (
        <AvisosContent avisos={avisos} />
      ) : (
        <p role="alert">Você não possui permissão para consultar os avisos.</p>
      )}
    </PrototypeSystemPage>
  );
}
