import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { CardSeplag } from "../../componentes/Card";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { FormularioRecesso, ModalConfirmarCancelamento } from "./FeriasPages";
import type { FeriasRegistro } from "./FeriasPages";
import { STORAGE_KEY, carregarRegistros } from "./feriasMockDados";
import "./ferias.css";

export function FeriasRecessoPage() {
  const navigate = useNavigate();
  const [mostrarConfirmacaoCancelar, setMostrarConfirmacaoCancelar] = useState(false);
  // Evita duplicar o lançamento se o clique disparar duas vezes antes do navigate() sair da tela.
  const salvandoRef = useRef(false);

  const salvar = (registro: FeriasRegistro) => {
    if (salvandoRef.current) return;
    salvandoRef.current = true;
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
