import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { CardSeplag } from "../../componentes/Card";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { FormularioIndividual, FormularioRecesso } from "./FeriasPages";
import { carregarRegistros } from "./feriasMockDados";
import "./ferias.css";
import { DownloadDocumentoFerias } from './DocumentoFerias';

export function FeriasVisualizarPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  // "Visualizar" na linha de uma parcela (registro com várias parcelas) mostra só aquela parcela.
  const [searchParams] = useSearchParams();
  const parcelaParam = searchParams.get("parcela");
  const parcelaFocoId = parcelaParam != null && parcelaParam !== "" ? Number(parcelaParam) : undefined;
  const registros = carregarRegistros();
  const registro = registros.find((item) => String(item.id) === id);
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

  const parcelaFoco =
    parcelaFocoId != null && Number.isFinite(parcelaFocoId) && registro.parcelas.length > 1
      ? registro.parcelas.find((parcela) => parcela.id === parcelaFocoId)
      : undefined;
  const titulo = `Visualizar solicitação — ${registro.tipo}${parcelaFoco ? ` · parcela de ${parcelaFoco.dias} dias` : ""}`;
  const documentosFuncionais = [...new Map(registros.filter(r => r.matricula === registro.matricula)
    .flatMap(r => r.documentos ?? []).map(d => [d.id,d])).values()];

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
                ...(parcelaFoco ? [{ label: `Parcela de ${parcelaFoco.dias} dias` }] : []),
              ]}
            />
          }
        >
          <div className="col-12">
            <div className="prototype-ferias-nova-pagina">
              <section className="prototype-ferias-form-section"><h3>Pasta funcional digital — demonstração</h3>
                {documentosFuncionais.length ? documentosFuncionais.map(d => <p key={d.id}><DownloadDocumentoFerias documento={d} /></p>) : <p>Nenhum documento anexado.</p>}
                <small>Armazenamento local do protótipo. Integração com a pasta funcional digital pendente.</small>
              </section>
              {registro.tipo === "Recesso" ? (
                <FormularioRecesso registroSomenteLeitura={registro} onCancelar={voltar} onSalvar={voltar} />
              ) : (
                <FormularioIndividual registroSomenteLeitura={registro} parcelaFocoId={parcelaFoco?.id} onCancelar={voltar} onSalvar={voltar} />
              )}
            </div>
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}
