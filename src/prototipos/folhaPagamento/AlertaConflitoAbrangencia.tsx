import { useEffect, useRef } from "react";
import type { CatalogoAbrangencia } from "./abrangenciaGrupoCalculo";
import type { ConflitoAbrangenciaGrupo } from "./conflitosAbrangenciaGrupo";
import { formatarCompetenciaGrupo } from "./gruposCalculoCompetencia";
import "./alertaConflitoAbrangencia.css";

const campos = {
  regimes: "Regime Jurídico",
  tipos: "Tipo de Vínculo",
  orgaos: "Órgão/Entidade",
  carreiras: "Carreira",
  unidades: "Unidade de Lotação",
  cargos: "Cargo",
};
export function AlertaConflitoAbrangencia({
  conflitos,
  catalogo,
}: {
  conflitos: ConflitoAbrangenciaGrupo[];
  catalogo: CatalogoAbrangencia;
}) {
  const alertaRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (conflitos.length)
      alertaRef.current?.scrollIntoView?.({
        behavior: "smooth",
        block: "start",
      });
  }, [conflitos.length]);
  if (!conflitos.length) return null;
  return (
    <section
      ref={alertaRef}
      className="grupo-conflito-alerta"
      role="alert"
      aria-labelledby="grupo-conflito-titulo"
    >
      <div className="grupo-conflito-mensagem">
        <i className="pi pi-exclamation-triangle" aria-hidden="true" />
        <div>
          <h3 id="grupo-conflito-titulo">
            Conflito de abrangência identificado
          </h3>
          <p>
            Não foi possível aprovar o grupo, pois sua abrangência apresenta
            sobreposição com outros grupos de cálculo na mesma competência.
            Revise os critérios conflitantes para continuar.
          </p>
        </div>
      </div>
      <details open>
        <summary>Grupos conflitantes ({conflitos.length})</summary>
        <div className="grupo-conflito-tabela">
          <table>
            <thead>
              <tr>
                <th>Grupo conflitante</th>
                <th>Critérios em conflito</th>
                <th>Competência</th>
              </tr>
            </thead>
            <tbody>
              {conflitos.map((g) => (
                <tr key={g.id}>
                  <td>{g.grupo}</td>
                  <td>
                    {g.criterios.length ? (
                      <ul>
                        {g.criterios.map((c) => (
                          <li key={c.campo}>
                            <strong>{campos[c.campo]}:</strong>{" "}
                            {c.valores
                              .map(
                                (v) =>
                                  catalogo[c.campo].find((o) => o.value === v)
                                    ?.label ?? v,
                              )
                              .join(", ")}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "Todos os critérios: sem restrição"
                    )}
                  </td>
                  <td>{formatarCompetenciaGrupo(g.competencia)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
