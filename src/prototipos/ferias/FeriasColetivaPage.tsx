import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { CardSeplag } from "../../componentes/Card";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { FormularioColetiva, ModalConfirmarCancelamento, STORAGE_KEY } from "./FeriasPages";
import type { FeriasRegistro } from "./FeriasPages";
import "./ferias.css";

function carregarRegistros(): FeriasRegistro[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") ?? [];
  } catch {
    return [];
  }
}

export function FeriasColetivaPage() {
  const navigate = useNavigate();
  const [mostrarConfirmacaoCancelar, setMostrarConfirmacaoCancelar] = useState(false);

  const salvar = (registros: FeriasRegistro[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...carregarRegistros(), ...registros]));
    navigate("/prototipos/sigep/ferias");
  };

  return (
    <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
      <div className="prototype-page-content prototype-page-content--white prototype-ferias-content">
        <CardSeplag
          title="Nova solicitação — Coletiva (SEDUC/UNEMAT)"
          cols="12"
          cardHeaderClassNames="prototype-carreira-card"
          headerNavigation={
            <BreadcrumbSeplag
              divided
              items={[
                { label: "Gestão de Férias", to: "/prototipos/sigep/ferias" },
                { label: "Nova solicitação" },
                { label: "Coletiva (SEDUC/UNEMAT)" },
              ]}
            />
          }
        >
          <div className="col-12">
            <div className="prototype-ferias-nova-pagina">
              <FormularioColetiva onCancelar={() => setMostrarConfirmacaoCancelar(true)} onSalvar={salvar} />
            </div>
          </div>
        </CardSeplag>
      </div>
      {mostrarConfirmacaoCancelar ? (
        <ModalConfirmarCancelamento
          onFechar={() => setMostrarConfirmacaoCancelar(false)}
          onConfirmar={() => navigate("/prototipos/sigep/ferias")}
        />
      ) : null}
    </PrototypeSystemPage>
  );
}
