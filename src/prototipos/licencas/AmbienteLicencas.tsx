import type { ReactNode } from "react";
import { CardSeplag } from "../../componentes/Card";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { BASE_LICENCAS as BASE } from "./model";
import "../vinculos/vinculoV2.css";
import "./licencas.css";

export function Ambiente({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <main className="prototype-page-content prototype-page-content--white v2v-shell pl-shell">
        <CardSeplag
          title={titulo}
          cols="12"
          cardHeaderClassNames="prototype-carreira-card v2v-card"
          headerNavigation={
            <BreadcrumbSeplag
              divided
              items={[
                {
                  label: "Direitos e Benefícios",
                  to: "/prototipos/sigep/direitos-beneficios",
                },
                { label: "Parametrização de Licenças", to: BASE },
                ...(titulo === "Parametrização de Licenças"
                  ? []
                  : [{ label: titulo }]),
              ]}
            />
          }
        >
          <div className="v2v-page pl-page">{children}</div>
        </CardSeplag>
      </main>
    </PrototypeSystemPage>
  );
}
