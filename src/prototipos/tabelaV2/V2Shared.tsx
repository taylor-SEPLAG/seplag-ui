import { useState, type ReactNode } from "react";
import { BreadcrumbSeplag } from "@componentes/Breadcrumb";
import { CardSeplag } from "@componentes/Card";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { V2_BASE, v2Status, type V2Record } from "./v2Store";
import "./tabelaV2.css";

export function V2PageFrame({ title = "Tabela de Vencimentos", children }: { title?: string; children: ReactNode }) {
  const isList = title === "Tabela de Vencimentos";
  const breadcrumbAction = title.includes("Visualizar") ? "Visualizar" : title.includes("RGA") ? "Aplicar RGA" : title.includes("versão") ? "Versionar" : title.includes("Exceção") ? "Cadastrar Exceção" : "Cadastrar";
  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
    <div className="prototype-page-content prototype-page-content--white prototype-ingressos-teste-list-page tv-page v2-page">
      <CardSeplag title={title} cols="12" cardHeaderClassNames={"prototype-regime-card prototype-ingressos-card " + (isList ? "tv-list-card" : "tv-form-card")}
        headerNavigation={<BreadcrumbSeplag divided items={[
          { label: "Cadastro" }, { label: "Cargo e Concurso" }, { label: "Tabela de Vencimentos", to: V2_BASE },
          ...(isList ? [] : [{ label: breadcrumbAction }]),
        ]} />}>
        <div className={isList ? "prototype-ingressos-teste-content v2-content" : "tv-form col-12 v2-content"}>
          {isList && <hr className="prototype-ingressos-teste-header-divider" />}
          {children}
        </div>
      </CardSeplag>
    </div>
  </PrototypeSystemPage>;
}
export function V2Status({ value }: { value: string }) {
  return <span className={"v2-status " + value.toLowerCase().replaceAll(" ", "-")}>{value}</span>;
}
export function V2Tags({ tipos, itemLabel = "vínculos" }: { tipos: string[]; itemLabel?: string }) {
  const [open, setOpen] = useState(false);
  return <div className="v2-tag-list">
    {tipos.slice(0, open ? undefined : 2).map((tipo) => <span className="v2-chip" key={tipo}>{tipo}</span>)}
    {tipos.length > 2 && <button type="button" className="v2-more-tag" title={tipos.slice(2).join(", ")}
      onClick={() => setOpen(!open)}>{open ? "Mostrar menos" : "+" + (tipos.length - 2) + " " + itemLabel}</button>}
  </div>;
}
export function V2RecordStatus({ record }: { record: V2Record }) {
  return <V2Status value={v2Status(record)} />;
}
