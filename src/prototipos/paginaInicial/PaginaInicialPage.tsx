import {
  menuGestaoPessoas,
  PrototypeSystemPage,
  USUARIO_SIGEP_LOGADO,
} from "../PrototiposPage";
import { getPermissionsSeplag } from "../../componentes/layout/Config/menu";
import { PaginaInicialContent } from "./PaginaInicialContent";
import { funcionalidades, menuDisponivel } from "./model";
import { useInformativos } from "../avisos/model";
import { useCronogramaFolha } from "../cronograma/useCronogramaFolha";
import { proximoEvento, situacaoEvento, vencimento } from "../cronograma/model";

export function PaginaInicialPage() {
  const informativos = useInformativos();
  const calendario = useCronogramaFolha();
  const proximo = proximoEvento(calendario.eventos, calendario.agora);
  const ativo = calendario.eventos.some(
    (evento) =>
      vencimento(evento) >= calendario.agora.getTime() &&
      ["pendente", "proximo", "andamento"].includes(
        situacaoEvento(evento, calendario.agora).classe,
      ),
  );
  const menu = menuDisponivel(menuGestaoPessoas, getPermissionsSeplag() ?? []);
  const podeConsultarPainel = funcionalidades(menu).some(
    (item) => item.nome === "Painel Informativo",
  );
  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menu}
    >
      <PaginaInicialContent
        menu={menu}
        nomeUsuario={USUARIO_SIGEP_LOGADO.nome}
        avisos={podeConsultarPainel ? informativos.length : 0}
        cronogramas={podeConsultarPainel ? Number(ativo) : 0}
        proximo={podeConsultarPainel ? proximo : undefined}
      />
    </PrototypeSystemPage>
  );
}
