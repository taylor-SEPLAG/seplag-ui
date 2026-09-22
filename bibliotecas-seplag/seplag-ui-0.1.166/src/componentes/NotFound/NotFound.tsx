import { useLocation, useNavigate } from "react-router-dom";
import brasaoEstadoMT from "../../assets/img/Logo_Branco_Estado_MT.png";
import { BotaoSeplag } from "../Botao";
import { SEPLAG_NOME_ORGAO_SEPLAG } from "../layout/Config/institucional";
import styles from "./NotFound.module.css";

export interface NotFoundSeplagProps {
  /** Rota para onde o botão "Ir para o início" navega. @default "/" */
  readonly homeRoute?: string;
  /** Nome do sistema exibido na barra superior do painel institucional. */
  readonly sistemaLabel?: string;
  /** Texto institucional exibido no rodapé do painel. */
  readonly orgaoLabel?: string;
}

export function NotFoundSeplag({
  homeRoute = "/",
  sistemaLabel = "Governo do Estado de Mato Grosso · SEPLAG",
  orgaoLabel = SEPLAG_NOME_ORGAO_SEPLAG,
}: Readonly<NotFoundSeplagProps>) {
  const navigate = useNavigate();
  const location = useLocation();

  const segmentosRota = location.pathname.split("/").filter(Boolean);

  return (
    <div className={styles.layout}>
      <aside className={styles.panel}>
        <img className={styles.brasao} src={brasaoEstadoMT} alt="" aria-hidden="true" />

        <div className={styles.panelTop}>
          <span className={styles.dot} />
          <span>{sistemaLabel}</span>
        </div>

        <div className={styles.panelMid}>
          <p className={styles.code}>404</p>
          <div className={styles.codeRule} />
          <p className={styles.codeSub}>O endereço solicitado não foi encontrado.</p>
        </div>

        <p className={styles.panelBottom}>{orgaoLabel}</p>
      </aside>

      <main className={styles.content}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <i className="pi pi-exclamation-circle" aria-hidden="true" />
            <span>Erro 404</span>
          </p>

          <h1 className={styles.title}>Não conseguimos localizar esta página.</h1>
          <p className={styles.subtitle}>
            O link pode ter sido movido, removido ou digitado incorretamente. Verifique o endereço
            ou volte para um ponto conhecido do sistema.
          </p>

          {segmentosRota.length > 0 && (
            <div className={styles.path}>
              <i className="pi pi-angle-right" aria-hidden="true" />
              {segmentosRota.map((segmento, indice) => (
                <span key={`${segmento}-${indice}`}>
                  {indice > 0 && <span className={styles.sep}>/</span>}
                  {segmento}
                </span>
              ))}
            </div>
          )}

          <div className={styles.actions}>
            <BotaoSeplag
              variant="back"
              label="Voltar"
              icon="pi pi-arrow-left"
              iconPos="left"
              onClick={() => navigate(-1)}
            />
            <BotaoSeplag
              variant="save"
              label="Ir para o início"
              icon="pi pi-home"
              iconPos="left"
              onClick={() => navigate(homeRoute)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default NotFoundSeplag;
