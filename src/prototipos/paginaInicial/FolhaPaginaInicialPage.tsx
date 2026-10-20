import type { ReactNode } from "react";
import {
  PrototypeSystemPage,
  menuFolha,
  USUARIO_SIGEP_LOGADO,
} from "../PrototiposPage";
import { getPermissionsSeplag } from "../../componentes/layout/Config/menu";
import { PaginaInicialContent } from "./PaginaInicialContent";
import { funcionalidades, menuDisponivel } from "./model";
import { useInformativos } from "../avisos/model";
import { AvisosContent } from "../avisos/AvisosContent";
import { useCronogramaFolha } from "../cronograma/useCronogramaFolha";
import { proximoEvento } from "../cronograma/model";
import { CalendarioContent } from "../cronograma/CalendarioContent";
import {
  FOLHA_PAGINA_INICIAL_PATH,
  FOLHA_AVISOS_PATH,
  FOLHA_CALENDARIO_PATH,
  acessosPaginaInicialFolha,
} from "./folhaModel";

function menuAtual() {
  return menuDisponivel(menuFolha, getPermissionsSeplag() ?? []);
}
function permitePainel() {
  return funcionalidades(menuAtual()).some(
    (item) => item.nome === "Painel Informativo",
  );
}
function AmbienteFolha({ children }: { children: ReactNode }) {
  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuAtual()}
    >
      {children}
    </PrototypeSystemPage>
  );
}
export function FolhaPaginaInicialPage() {
  const avisos = useInformativos(),
    calendario = useCronogramaFolha();
  const permitido = permitePainel();
  return (
    <AmbienteFolha>
      <PaginaInicialContent
        menu={menuAtual()}
        nomeUsuario={USUARIO_SIGEP_LOGADO.nome}
        avisos={permitido ? avisos.length : 0}
        cronogramas={permitido ? Number(calendario.eventos.length > 0) : 0}
        proximo={
          permitido
            ? proximoEvento(calendario.eventos, calendario.agora)
            : undefined
        }
        modulos={acessosPaginaInicialFolha}
        avisosDestino={FOLHA_AVISOS_PATH}
        cronogramaDestino={FOLHA_CALENDARIO_PATH}
      />
    </AmbienteFolha>
  );
}
export function FolhaAvisosPage() {
  const avisos = useInformativos();
  return (
    <AmbienteFolha>
      {permitePainel() ? (
        <AvisosContent
          avisos={avisos}
          homePath={FOLHA_PAGINA_INICIAL_PATH}
          avisosPath={FOLHA_AVISOS_PATH}
        />
      ) : (
        <p role="alert">Você não possui permissão para consultar os avisos.</p>
      )}
    </AmbienteFolha>
  );
}
export function FolhaCronogramaConsultaPage() {
  const calendario = useCronogramaFolha();
  return (
    <AmbienteFolha>
      {permitePainel() ? (
        <CalendarioContent
          calendario={calendario}
          agora={calendario.agora}
          homePath={FOLHA_PAGINA_INICIAL_PATH}
          cronogramaPath={FOLHA_CALENDARIO_PATH}
        />
      ) : (
        <p role="alert">
          Você não possui permissão para consultar o cronograma.
        </p>
      )}
    </AmbienteFolha>
  );
}
