import { useNavigate, useParams } from "react-router-dom";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { CardSeplag } from "../../componentes/Card";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { FormularioIndividual, FormularioRecesso } from "./FeriasPages";
import { carregarRegistros } from "./feriasMockDados";
import "./ferias.css";

export function FeriasVisualizarPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const registro = carregarRegistros().find((item) => String(item.id) === id);
  const voltar = () => navigate("/prototipos/sigep/ferias");

  if (!registro) {
    return (
      <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
        <div className="prototype-page-content prototype-page-content--white prototype-ferias-content">
          <CardSeplag title="Visualizar solicitação" cols="12" cardHeaderClassNames="prototype-carreira-card">
            <div className="col-12">
              <p>Solicitação não encontrada.</p>
            </div>
          </CardSeplag>
        </div>
      </PrototypeSystemPage>
    );
  }

  const titulo = `Visualizar solicitação — ${registro.tipo}`;

  return (
    <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
      <div className="prototype-page-content prototype-page-content--white prototype-ferias-content">
        <CardSeplag
          title={titulo}
          cols="12"
          cardHeaderClassNames="prototype-carreira-card"
          headerNavigation={
            <BreadcrumbSeplag
              divided
              items={[
                { label: "Gestão de Férias", to: "/prototipos/sigep/ferias" },
                { label: "Visualizar" },
                { label: registro.tipo },
              ]}
            />
          }
        >
          <div className="col-12">
            <div className="prototype-ferias-nova-pagina">
              {registro.tipo === "Recesso" ? (
                <FormularioRecesso registroSomenteLeitura={registro} onCancelar={voltar} onSalvar={voltar} />
              ) : (
                <FormularioIndividual registroSomenteLeitura={registro} onCancelar={voltar} onSalvar={voltar} />
              )}
            </div>
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}
