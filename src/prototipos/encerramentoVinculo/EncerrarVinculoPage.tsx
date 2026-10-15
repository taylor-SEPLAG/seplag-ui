import { Fragment, useMemo, useState } from "react";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { BotaoIconSeplag } from "../../componentes/Botao";
import { CardSeplag } from "../../componentes/Card";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { dataBR, pessoas, situacao, vinculos } from "../vidaFuncional/model";
import "../vinculos/vinculoV2.css";
import "../vidaFuncional/vidaFuncional.css";

function SituacaoVinculo({ valor }: Readonly<{ valor: string }>) {
  const classe = valor === "Vigente" ? "ativo" : valor === "Encerrado" ? "encerrado" : "inativo";
  return <span className={`v2v-status v2v-status-${classe}`}>{valor}</span>;
}

export function EncerrarVinculoPage() {
  const [busca, setBusca] = useState("");
  const [expandidos, setExpandidos] = useState<string[]>([]);
  const termo = busca.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  const digitos = busca.replace(/\D/g, "");
  const servidores = useMemo(() => pessoas.filter((pessoa) =>
    !busca.trim() || pessoa.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").includes(termo) || (digitos.length > 0 && pessoa.cpf.replace(/\D/g, "").includes(digitos)),
  ), [busca, digitos, termo]);

  const alternarServidor = (id: string) => setExpandidos((atuais) =>
    atuais.includes(id) ? atuais.filter((item) => item !== id) : [...atuais, id],
  );

  return (
    <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}>
      <main className="prototype-page-content prototype-page-content--white v2v-shell">
        <CardSeplag
          title="Encerrar Vínculo"
          cols="12"
          cardHeaderClassNames="prototype-carreira-card v2v-card"
          headerNavigation={<BreadcrumbSeplag divided homeTo="/prototipos/sigep" items={[{ label: "Encerramento de Vínculo", to: "/prototipos/sigep/encerramento-vinculo" }, { label: "Encerrar Vínculo" }]} />}
        >
          <div className="v2v-page vf-page">
            <p className="v2v-description">Pesquise o servidor para consultar seus vínculos e iniciar o encerramento do vínculo selecionado.</p>
            <section className="v2v-panel v2v-filters vf-consulta-filtros" aria-label="Pesquisa de servidor">
              <label>
                Servidor ou CPF
                <input value={busca} onChange={(evento) => setBusca(evento.target.value)} placeholder="Buscar por nome ou CPF" />
              </label>
              <div className="v2v-filter-actions">
                <button className="v2v-primary" type="button" onClick={() => setBusca("")}>
                  <i className="pi pi-refresh" aria-hidden="true" /> Limpar filtro
                </button>
              </div>
            </section>
            <section className="v2v-panel vf-grid-panel" aria-label="Vínculos dos servidores">
              <div className="v2v-table-wrap">
                <table className="v2v-table">
                  <thead><tr><th>Servidor</th><th>CPF</th><th>Quantidade de Vínculos</th><th>Ação</th></tr></thead>
                  <tbody>
                    {servidores.map((servidor) => {
                      const lista = vinculos.filter((vinculo) => vinculo.pessoaId === servidor.id);
                      const expandido = expandidos.includes(servidor.id);
                      return <Fragment key={servidor.id}>
                        <tr className="vf-server-row" tabIndex={0} aria-expanded={expandido} onClick={() => alternarServidor(servidor.id)} onKeyDown={(evento) => {
                          if (evento.key === "Enter" || evento.key === " ") { evento.preventDefault(); alternarServidor(servidor.id); }
                        }}>
                          <td>{servidor.nome}</td><td>{servidor.cpf}</td><td>{lista.length}</td>
                          <td><button type="button" className="v2v-icon-action" aria-label={expandido ? "Recolher vínculos" : "Expandir vínculos"} title={expandido ? "Recolher vínculos" : "Expandir vínculos"} onClick={(evento) => { evento.stopPropagation(); alternarServidor(servidor.id); }}><i className={`pi pi-chevron-${expandido ? "up" : "down"}`} aria-hidden="true" /></button></td>
                        </tr>
                        {expandido && <tr className="v2v-expanded-row"><td colSpan={4}>
                          <div className="v2v-expanded vf-expanded">
                            <div className="v2v-expanded-head"><div><strong>Vínculos do Servidor</strong><span>{lista.length} vínculo(s) encontrado(s)</span></div></div>
                            <div className="v2v-table-wrap"><table className="v2v-table v2v-inner-table">
                              <thead><tr>{["Matrícula", "Nº do Vínculo", "Tipo de Vínculo", "Cargo/Função", "Órgão/Entidade", "Data de Início", "Data de Encerramento", "Situação", "Ação"].map((coluna) => <th key={coluna}>{coluna}</th>)}</tr></thead>
                              <tbody>{lista.map((vinculo) => <tr key={vinculo.id}>
                                <td>{vinculo.matricula}</td><td>{vinculo.numero}</td><td>{vinculo.tipo}</td><td>{vinculo.cargo}</td><td>{vinculo.orgao}</td><td>{dataBR(vinculo.inicio)}</td><td>{dataBR(vinculo.fim)}</td><td><SituacaoVinculo valor={situacao(vinculo)} /></td>
                                <td><BotaoIconSeplag type="button" severity="danger" icon="pi pi-sign-out" tooltip="Encerrar vínculo" aria-label="Encerrar vínculo" onClick={() => undefined} style={{ width: 40, height: 40, borderRadius: 4 }} /></td>
                              </tr>)}</tbody>
                            </table></div>
                          </div>
                        </td></tr>}
                      </Fragment>;
                    })}
                    {!servidores.length && <tr><td colSpan={4} className="v2v-empty">Nenhum servidor encontrado para os filtros informados.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </CardSeplag>
      </main>
    </PrototypeSystemPage>
  );
}
