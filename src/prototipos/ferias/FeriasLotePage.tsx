import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { CardSeplag } from "../../componentes/Card";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { FormularioLote, ModalConfirmarCancelamento, STORAGE_KEY } from "./FeriasPages";
import type { FeriasRegistro } from "./FeriasPages";
import "./ferias.css";

function carregarRegistros(): FeriasRegistro[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") ?? [];
  } catch {
    return [];
  }
}

export function FeriasLotePage() {
  const navigate = useNavigate();
  const [mostrarConfirmacaoCancelar, setMostrarConfirmacaoCancelar] = useState(false);

  const salvar = (registros: FeriasRegistro[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...carregarRegistros(), ...registros]));
    navigate("/prototipos/sigep/ferias");
  };

  return (
    <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
      <div className="prototype-page-content prototype-page-content--white prototype-ferias-content">
        <CardSeplag title="Nova solicitação — Agendamento em Lote" cols="12">
          <div className="col-12">
          <BreadcrumbSeplag
            items={[
              { label: "Gestão de Férias", to: "/prototipos/sigep/ferias" },
              { label: "Nova solicitação" },
              { label: "Agendamento em Lote" },
            ]}
          />
          <div className="prototype-ferias-nova-pagina">
            <div className="prototype-ferias-nova-pagina-header">
              <div>
                <h2 style={{ color: "#8b5cf6" }}><i className="pi pi-users" aria-hidden="true" style={{ marginRight: 8 }} />Agendamento em Lote</h2>
                <p>Lançamento em massa para cargos de gestão/apoio.</p>
              </div>
            </div>
            <FormularioLote onCancelar={() => setMostrarConfirmacaoCancelar(true)} onSalvar={salvar} />
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
