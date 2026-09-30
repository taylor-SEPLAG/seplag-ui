import { useState } from "react";

export type PerfilVariacaoIngresso = "CENTRAL" | "SETORIAL";
const PROFILE_KEY = "prototype-ingresso-perfil-variacao";
export const getPerfilVariacaoIngresso = (): PerfilVariacaoIngresso =>
  localStorage.getItem(PROFILE_KEY) === "SETORIAL" ? "SETORIAL" : "CENTRAL";
export const getOrgaoAtuacaoIngresso = (): string =>
  localStorage.getItem("prototype-ingresso-orgao-atuacao") || "SEPLAG";

export function podeConsultarIngresso(perfil: PerfilVariacaoIngresso, orgao: string, origem: string, destinoAnalise?: string, destinoEfetivo?: string) {
  return perfil === "CENTRAL" || [origem, destinoAnalise, destinoEfetivo].includes(orgao);
}

export function podeAnalisarIngresso(perfil: PerfilVariacaoIngresso, tipo: string, orgao: string, destinoAnalise?: string) {
  return perfil === "CENTRAL" || (tipo === "Processo Seletivo" && destinoAnalise === orgao);
}

export function podeRegistrarEfetivo(perfil: PerfilVariacaoIngresso, orgao: string, destinoEfetivo: string) {
  return perfil === "SETORIAL" && orgao === destinoEfetivo;
}

export function usePerfilVariacaoIngresso() {
  const [perfil, setPerfil] = useState<PerfilVariacaoIngresso>(getPerfilVariacaoIngresso);
  const selecionarPerfil = (novoPerfil: PerfilVariacaoIngresso) => {
    localStorage.setItem(PROFILE_KEY, novoPerfil);
    setPerfil(novoPerfil);
  };
  return [perfil, selecionarPerfil] as const;
}

export function SeletorPerfilVariacaoIngresso({
  perfil,
  onChange,
  orgao,
  onOrgaoChange,
}: {
  perfil: PerfilVariacaoIngresso;
  onChange: (perfil: PerfilVariacaoIngresso) => void;
  orgao?: string;
  onOrgaoChange?: (orgao: string) => void;
}) {
  const label = perfil === "CENTRAL" ? "Gestão de Pessoas - Órgão Central" : "Gestão de Pessoas - Setorial";
  return (
    <div className="prototype-ingresso-profile">
      <label>
        Perfil da variação
        <select aria-label="Perfil da variação" value={perfil} onChange={(event) => onChange(event.target.value as PerfilVariacaoIngresso)}>
          <option value="CENTRAL">Gestão de Pessoas - Órgão Central</option>
          <option value="SETORIAL">Gestão de Pessoas - Setorial</option>
        </select>
      </label>
      <strong>{label}</strong>
      {perfil === "SETORIAL" && orgao && onOrgaoChange ? <label className="prototype-ingresso-profile-orgao">Órgão de atuação<select aria-label="Órgão de atuação" value={orgao} onChange={(event) => { localStorage.setItem("prototype-ingresso-orgao-atuacao", event.target.value); onOrgaoChange(event.target.value); }}><option value="SEPLAG">SEPLAG</option><option value="SES">SES</option><option value="SEDUC">SEDUC</option><option value="SEFAZ">SEFAZ</option></select></label> : null}
    </div>
  );
}
