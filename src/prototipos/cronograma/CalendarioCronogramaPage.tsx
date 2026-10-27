import { menuGestaoPessoas, PrototypeSystemPage, PrototiposFolhaCronogramaPage } from "../PrototiposPage";
import { getPermissionsSeplag } from "../../componentes/layout/Config/menu";
import { menuDisponivel, funcionalidades } from "../paginaInicial/model";
import { useCronogramaFolha } from "./useCronogramaFolha";
import { CalendarioContent } from "./CalendarioContent";

export function CalendarioCronogramaPage() {
  const calendario = useCronogramaFolha();
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
        <CalendarioContent calendario={calendario} agora={calendario.agora} />
      ) : (
        <p role="alert">
          Você não possui permissão para consultar o cronograma.
        </p>
      )}
    </PrototypeSystemPage>
  );
}

export function ConfigurarCronogramaPage() {
  const menu = menuDisponivel(menuGestaoPessoas, getPermissionsSeplag() ?? []);
  const permitido = funcionalidades(menu).some(item => item.nome === "Painel Informativo");
  return permitido ? <PrototiposFolhaCronogramaPage sigep /> : <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menu}><p role="alert">Você não possui permissão para configurar o cronograma.</p></PrototypeSystemPage>;
}
