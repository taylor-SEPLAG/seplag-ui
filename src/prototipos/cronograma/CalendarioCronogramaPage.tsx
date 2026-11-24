import { calendarioCiclo } from "./ciclosRepository";
import { useCiclos } from "./useCiclos";
import { diaCuiaba } from "./model";
import { menuGestaoPessoas, PrototypeSystemPage } from "../PrototiposPage";
import { getPermissionsSeplag } from "../../componentes/layout/Config/menu";
import { menuDisponivel, funcionalidades } from "../paginaInicial/model";
import { useCronogramaFolha } from "./useCronogramaFolha";
import { CalendarioContent } from "./CalendarioContent";

export function CalendarioCronogramaPage() {
  const legado = useCronogramaFolha();
  const { ciclos, carregando, erro } = useCiclos();
  const fontes = ciclos.map((c) => ({
    competencia: c.competencia,
    calendario: calendarioCiclo(c),
  }));
  const calendario = {
    titulo: "Eventos cadastrados",
    competencia: diaCuiaba().slice(0, 7),
    tipos: fontes.flatMap((f) =>
      f.calendario.tipos.map((t) => ({
        ...t,
        id: `${f.competencia}-${t.id}`,
        competencia: f.competencia,
      })),
    ),
    eventos: fontes.flatMap((f) =>
      f.calendario.eventos.map((e) => ({
        ...e,
        id: `${f.competencia}-${e.id}`,
        tipoId: `${f.competencia}-${e.tipoId}`,
      })),
    ),
    semData: fontes.reduce((n, f) => n + f.calendario.semData, 0),
  };
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
        carregando ? (
          <p role="status">Carregando cronograma…</p>
        ) : erro ? (
          <p role="alert">{erro}</p>
        ) : (
          <CalendarioContent calendario={calendario} agora={legado.agora} />
        )
      ) : (
        <p role="alert">
          Você não possui permissão para consultar o cronograma.
        </p>
      )}
    </PrototypeSystemPage>
  );
}
