import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { CardSeplag } from "../../componentes/Card";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { FormularioRecesso, ModalConfirmarCancelamento, STORAGE_KEY } from "./FeriasPages";
import type { FeriasRegistro } from "./FeriasPages";
import "./ferias.css";

function carregarRegistros(): FeriasRegistro[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") ?? [];
  } catch {
    return [];
  }
}

export function FeriasRecessoPage() {
  const navigate = useNavigate();
  const [mostrarConfirmacaoCancelar, setMostrarConfirmacaoCancelar] = useState(false);

  const salvar = (registro: FeriasRegistro) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...carregarRegistros(), registro]));
    navigate("/prototipos/sigep/ferias");
  };

  return (
    <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
      <div className="prototype-page-content prototype-page-content--white prototype-ferias-content">
        <CardSeplag
          title="Nova solicitação — Recesso Remunerado"
          cols="12"
          cardHeaderClassNames="prototype-carreira-card"
          headerNavigation={
            <BreadcrumbSeplag
              divided
              items={[
                { label: "Gestão de Férias", to: "/prototipos/sigep/ferias" },
                { label: "Nova solicitação" },
                { label: "Recesso Remunerado" },
              ]}
            />
          }
        >
          <div className="col-12">
          <div className="prototype-ferias-nova-pagina">
            <div className="prototype-ferias-nova-pagina-header">
              <div>
                <h2 style={{ color: "#22c55e" }}><i className="pi pi-sun" aria-hidden="true" style={{ marginRight: 8 }} />Recesso Remunerado</h2>
                <p>Residente técnico, bolsista e estagiário — não é férias, instituto próprio (IN 05).</p>
              </div>
            </div>
            <FormularioRecesso onCancelar={() => setMostrarConfirmacaoCancelar(true)} onSalvar={salvar} />
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
