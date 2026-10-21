import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { CardSeplag } from "../../componentes/Card";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { FormularioRecesso, ModalConfirmarCancelamento } from "./FeriasPages";
import type { FeriasRegistro } from "./FeriasPages";
import { STORAGE_KEY, carregarRegistros } from "./feriasMockDados";
import "./ferias.css";

/** Edição de um recesso remunerado já lançado (US50 3.5) — mesma tela/padrão da US007 (Nova
 * solicitação — Recesso Remunerado), com o servidor fixo e pré-preenchido, em vez do modal
 * compacto "Alterar recesso remunerado". */
export function FeriasEditarRecessoPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const registros = carregarRegistros();
  const registro = registros.find((item) => String(item.id) === id);
  const voltar = () => navigate("/prototipos/sigep/ferias");
  const [mostrarConfirmacaoCancelar, setMostrarConfirmacaoCancelar] = useState(false);
  // Evita duplicar a gravação se o clique disparar duas vezes antes do navigate() sair da tela.
  const salvandoRef = useRef(false);

  const salvar = (registroAtualizado: FeriasRegistro) => {
    if (salvandoRef.current) return;
    salvandoRef.current = true;
    const atualizados = carregarRegistros().map((item) => (item.id === registroAtualizado.id ? registroAtualizado : item));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizados));
    navigate("/prototipos/sigep/ferias");
  };

  if (!registro || registro.tipo !== "Recesso") {
    return (
      <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
        <div className="prototype-page-content prototype-page-content--white prototype-ferias-content">
          <CardSeplag title="Alterar recesso remunerado" cols="12" cardHeaderClassNames="prototype-carreira-card">
            <div className="col-12">
              <p>Solicitação não encontrada.</p>
            </div>
          </CardSeplag>
        </div>
      </PrototypeSystemPage>
    );
  }

  return (
    <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
      <div className="prototype-page-content prototype-page-content--white prototype-ferias-content">
        <CardSeplag
          title="Alterar solicitação — Recesso Remunerado"
          cols="12"
          cardHeaderClassNames="prototype-carreira-card"
          headerNavigation={
            <BreadcrumbSeplag
              divided
              items={[
                { label: "Gestão de Férias", to: "/prototipos/sigep/ferias" },
                { label: "Alterar" },
                { label: "Recesso Remunerado" },
              ]}
            />
          }
        >
          <div className="col-12">
            <div className="prototype-ferias-nova-pagina">
              <FormularioRecesso
                registroParaEditar={registro}
                onCancelar={() => setMostrarConfirmacaoCancelar(true)}
                onSalvar={salvar}
              />
            </div>
          </div>
        </CardSeplag>
      </div>
      {mostrarConfirmacaoCancelar ? (
        <ModalConfirmarCancelamento
          onFechar={() => setMostrarConfirmacaoCancelar(false)}
          onConfirmar={voltar}
        />
      ) : null}
    </PrototypeSystemPage>
  );
}
