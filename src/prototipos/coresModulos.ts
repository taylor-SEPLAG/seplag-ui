import type { CSSProperties } from "react";
import "./paletaModulos.css";

const tokensPorModulo: Record<string, string> = {
  "Painel Informativo": "painel",
  Pessoas: "pessoas",
  "Estrutura Organizacional": "estrutura",
  "Cargo e Concurso": "cargo",
  "Controle de Vagas": "vagas",
  Movimentação: "movimentacao",
  "Controle de Certame": "certame",
  Ingresso: "ingresso",
  "Vínculos Funcionais": "vinculos",
  Vacância: "vacancia",
  Documentação: "documentacao",
  "Aposentadoria e Benefícios": "aposentadoria",
  Parametrização: "parametrizacao",
  Backlog: "backlog",
};

export function estiloCorModulo(nome: string): CSSProperties {
  const token = tokensPorModulo[nome];
  return token
    ? ({
        "--sigep-cor-modulo": `var(--sigep-modulo-${token})`,
      } as CSSProperties)
    : {};
}
