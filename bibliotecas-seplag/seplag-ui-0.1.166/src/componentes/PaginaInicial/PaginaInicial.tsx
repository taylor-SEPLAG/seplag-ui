import { useState } from "react";
import { Cronograma } from "./Cronograma";
import { Informativos } from "./Informativos";
import style from "./style.module.css";

export function PaginaInicial() {
  const [isViewingHome, setIsViewingHome] = useState(true);

  function handleConfigModeChange(isConfiguring: boolean) {
    if (isConfiguring) {
      setIsViewingHome(false);
      return;
    }

    setIsViewingHome(true);
  }

  return (
    <main className={style.page} id="pagina-inicial" data-testid="pagina-inicial">
      <section className={isViewingHome ? style.homeGrid : style.configGrid}>
        {isViewingHome ? <Informativos /> : null}
        <Cronograma onConfigModeChange={handleConfigModeChange} />
      </section>
    </main>
  );
}
