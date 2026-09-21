import { Fragment, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { CardSeplag } from "../../componentes/Card";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import "./vinculos.css";

type SituacaoVinculo = "Ativo" | "Vago";

interface VinculoRegistro {
  id: number;
  nome: string;
  cpf: string;
  matricula: string;
  numeroVinculo: string;
  tipoVinculo: string;
  regime: string;
  carreira: string;
  cargo: string;
  perfilProfissional: string;
  jornadaTrabalho: string;
  lotacao: string;
  dataExercicio: string;
  dataVacancia: string;
  formaVacancia: string;
  observacao: string;
  situacao: SituacaoVinculo;
  automatico?: boolean;
  numeroIngresso?: string;
}

interface ServidorVinculo {
  id: number;
  nome: string;
  cpf: string;
  matricula: string;
  vinculos: VinculoRegistro[];
}

const STORAGE_KEY = "prototype-vinculos-funcionais";

const servidoresBase: ServidorVinculo[] = [
  {
    id: 1,
    nome: "João Silva",
    cpf: "000.000.000-00",
    matricula: "327305",
    vinculos: [
      {
        id: 1,
        nome: "João Silva",
        cpf: "000.000.000-00",
        matricula: "327305",
        numeroVinculo: "1",
        tipoVinculo: "Efetivo",
        regime: "Regime Estatutário",
        carreira: "Gestão Governamental",
        cargo: "Analista Administrativo",
        perfilProfissional: "Administração",
        jornadaTrabalho: "40 horas semanais",
        lotacao: "Secretaria de Estado de Planejamento e Gestão",
        dataExercicio: "15/07/2026",
        dataVacancia: "",
        formaVacancia: "",
        observacao: "",
        situacao: "Ativo",
      },
    ],
  },
  {
    id: 2,
    nome: "Maria Souza",
    cpf: "111.111.111-11",
    matricula: "418920",
    vinculos: [
      {
        id: 2002,
        nome: "Maria Souza",
        cpf: "111.111.111-11",
        matricula: "418920",
        numeroVinculo: "1",
        tipoVinculo: "Contrato Temporário",
        regime: "Regime Especial",
        carreira: "Profissionais da Saúde",
        cargo: "Técnico de Enfermagem",
        perfilProfissional: "Saúde",
        jornadaTrabalho: "40 horas semanais",
        lotacao: "Hospital Regional de Mato Grosso",
        dataExercicio: "02/09/2026",
        dataVacancia: "01/09/2027",
        formaVacancia: "Término de contrato",
        observacao: "Vínculo criado automaticamente após a conclusão do ingresso.",
        situacao: "Ativo",
        automatico: true,
        numeroIngresso: "2026/0002",
      },
    ],
  },
  {
    id: 3,
    nome: "Carlos Pereira",
    cpf: "222.222.222-22",
    matricula: "529104",
    vinculos: [],
  },
];

const tipoVinculoOptions = [
  "Efetivo",
  "Exclusivamente Comissionado",
  "Contrato Temporário",
  "Estagiário",
  "Residente Técnico",
  "Bolsista",
];

const regimeOptions = [
  "Regime Estatutário",
  "Regime Misto",
  "Regime Especial",
  "Sem Vínculo Empregatício",
];

const carreiraOptions = [
  "Gestão Governamental",
  "Profissionais da Administração",
  "Profissionais da Educação",
  "Profissionais da Saúde",
];

const cargoOptions = [
  "Analista Administrativo",
  "Assessor Especial",
  "Gestor Governamental",
  "Professor",
  "Técnico de Enfermagem",
];

const perfilOptions = [
  "Administração",
  "Assessoria",
  "Gestão Pública",
  "Educação",
  "Saúde",
];

const jornadaTrabalhoOptions = [
  "20 horas semanais",
  "30 horas semanais",
  "40 horas semanais",
  "Dedicação exclusiva",
];

const lotacaoOptions = [
  "Secretaria de Estado de Planejamento e Gestão",
  "Gabinete do Secretário",
  "Coordenadoria de Gestão de Pessoas",
  "Superintendência Administrativa",
];

const formaVacanciaOptions = [
  "Exoneração",
  "Demissão",
  "Aposentadoria",
  "Falecimento",
  "Posse em outro cargo inacumulável",
  "Término de contrato",
];

function carregarVinculosSalvos(): VinculoRegistro[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as VinculoRegistro[];
  } catch {
    return [];
  }
}

function montarServidores(): ServidorVinculo[] {
  const servidores = servidoresBase.map((servidor) => ({
    ...servidor,
    vinculos: [...servidor.vinculos],
  }));

  carregarVinculosSalvos().forEach((vinculo) => {
    const servidor = servidores.find(
      (item) => item.matricula === vinculo.matricula || item.cpf === vinculo.cpf,
    );

    if (servidor) {
      servidor.nome = vinculo.nome;
      servidor.cpf = vinculo.cpf;
      servidor.vinculos.push(vinculo);
      return;
    }

    servidores.push({
      id: vinculo.id,
      nome: vinculo.nome,
      cpf: vinculo.cpf,
      matricula: vinculo.matricula,
      vinculos: [vinculo],
    });
  });

  return servidores;
}

function normalizarBusca(valor: string) {
  return valor.trim().toLocaleLowerCase("pt-BR");
}

function formatarCpf(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);
  return numeros
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function PrototiposVinculosPage() {
  const navigate = useNavigate();
  const [servidores] = useState(montarServidores);
  const [buscaServidor, setBuscaServidor] = useState("");
  const [buscaVinculo, setBuscaVinculo] = useState("");
  const [situacao, setSituacao] = useState("");
  const [servidorExpandido, setServidorExpandido] = useState<number | null>(1);

  const servidoresFiltrados = useMemo(() => {
    const busca = normalizarBusca(buscaServidor);
    if (!busca) return servidores;

    const numeros = busca.replace(/\D/g, "");
    return servidores.filter((servidor) =>
      servidor.nome.toLocaleLowerCase("pt-BR").includes(busca) ||
      servidor.matricula.includes(busca) ||
      (numeros && servidor.cpf.replace(/\D/g, "").includes(numeros)),
    );
  }, [buscaServidor, servidores]);

  const filtrarVinculos = (servidor: ServidorVinculo) => {
    const busca = normalizarBusca(buscaVinculo);
    return servidor.vinculos.filter((vinculo) =>
      (!busca ||
        vinculo.numeroVinculo.toLocaleLowerCase("pt-BR").includes(busca) ||
        vinculo.tipoVinculo.toLocaleLowerCase("pt-BR").includes(busca) ||
        vinculo.cargo.toLocaleLowerCase("pt-BR").includes(busca)) &&
      (!situacao || vinculo.situacao === situacao),
    );
  };

  const limparFiltros = () => {
    setBuscaServidor("");
    setBuscaVinculo("");
    setSituacao("");
  };

  return (
    <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
      <div className="prototype-page-content prototype-page-content--white prototype-vinculos-page">
        <CardSeplag
          title="Vínculos"
          cols="12"
          cardHeaderClassNames="prototype-carreira-card prototype-vinculos-card"
          headerNavigation={
            <BreadcrumbSeplag
              divided
              items={[
                { label: "Cadastro" },
                { label: "Vínculos Funcionais" },
                { label: "Vínculo" },
              ]}
            />
          }
        >
          <div className="prototype-vinculos-content">
            <div className="prototype-vinculos-main-filter">
              <label>
                <span>Servidor, CPF ou Matrícula</span>
                <input
                  value={buscaServidor}
                  placeholder="Digite para buscar"
                  onChange={(event) => setBuscaServidor(event.target.value)}
                />
              </label>
              <button type="button" className="prototype-vinculos-clear" onClick={limparFiltros}>
                <i className="pi pi-refresh" aria-hidden="true" />
                Limpar filtro
              </button>
            </div>

            <div className="prototype-vinculos-table-wrap">
              <table className="prototype-vinculos-table">
                <thead>
                  <tr>
                    <th>Servidor</th>
                    <th>Matrícula</th>
                    <th>Vínculos</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {servidoresFiltrados.map((servidor) => {
                    const expandido = servidorExpandido === servidor.id;
                    const vinculos = filtrarVinculos(servidor);
                    return (
                      <Fragment key={servidor.id}>
                        <tr>
                          <td>
                            <strong>{servidor.nome}</strong>
                            <small>{servidor.cpf}</small>
                          </td>
                          <td>{servidor.matricula}</td>
                          <td>{servidor.vinculos.length}</td>
                          <td>
                            <div className="prototype-vinculos-row-actions">
                              <button
                                type="button"
                                className="prototype-vinculos-add"
                                onClick={() => navigate("/prototipos/sigep/vinculos/novo?servidor=" + servidor.id)}
                              >
                                <i className="pi pi-plus" aria-hidden="true" />
                                Adicionar
                              </button>
                              <button
                                type="button"
                                className="prototype-vinculos-expand"
                                aria-label={expandido ? "Recolher vínculos" : "Exibir vínculos"}
                                aria-expanded={expandido}
                                onClick={() => setServidorExpandido(expandido ? null : servidor.id)}
                              >
                                <i className={"pi " + (expandido ? "pi-chevron-up" : "pi-chevron-down")} aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandido ? (
                          <tr className="prototype-vinculos-expanded-row">
                            <td colSpan={4}>
                              <div className="prototype-vinculos-secondary-filter">
                                <label>
                                  <span>Nº do Vínculo, Tipo de Vínculo ou Cargo</span>
                                  <input
                                    value={buscaVinculo}
                                    placeholder="Digite para buscar"
                                    onChange={(event) => setBuscaVinculo(event.target.value)}
                                  />
                                </label>
                                <label>
                                  <span>Situação</span>
                                  <select value={situacao} onChange={(event) => setSituacao(event.target.value)}>
                                    <option value="">Todas</option>
                                    <option value="Ativo">Ativo</option>
                                    <option value="Vago">Vago</option>
                                  </select>
                                </label>
                                <button type="button" className="prototype-vinculos-clear" onClick={() => { setBuscaVinculo(""); setSituacao(""); }}>
                                  <i className="pi pi-refresh" aria-hidden="true" />
                                  Limpar filtro
                                </button>
                              </div>
                              <div className="prototype-vinculos-inner-table-wrap">
                                <table className="prototype-vinculos-inner-table">
                                  <thead>
                                    <tr>
                                      <th>Nº do Vínculo</th>
                                      <th>Tipo de Vínculo</th>
                                      <th>Cargo</th>
                                      <th>Situação</th>
                                      <th>Ações</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {vinculos.length ? vinculos.map((vinculo) => (
                                      <tr key={vinculo.id}>
                                        <td>{vinculo.numeroVinculo}</td>
                                        <td>{vinculo.tipoVinculo}</td>
                                        <td>{vinculo.cargo}</td>
                                        <td><span className={"prototype-vinculos-status is-" + vinculo.situacao.toLowerCase()}>{vinculo.situacao}</span></td>
                                        <td>
                                          <button
                                            type="button"
                                            className="prototype-vinculos-view"
                                            aria-label="Visualizar vínculo"
                                            title="Visualizar vínculo"
                                            onClick={() => navigate("/prototipos/sigep/vinculos/" + vinculo.id)}
                                          >
                                            <i className="pi pi-eye" aria-hidden="true" />
                                          </button>
                                        </td>
                                      </tr>
                                    )) : (
                                      <tr>
                                        <td colSpan={5} className="prototype-vinculos-empty">Nenhum registro encontrado</td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}
                  {!servidoresFiltrados.length ? (
                    <tr><td colSpan={4} className="prototype-vinculos-empty">Nenhum servidor encontrado</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

function formatarDataInputVinculo(valor: string) {
  if (!valor) return "";
  const correspondencia = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return correspondencia ? `${correspondencia[3]}-${correspondencia[2]}-${correspondencia[1]}` : valor;
}

export function PrototiposVinculoVisualizacaoPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const registro = montarServidores()
    .flatMap((servidor) => servidor.vinculos)
    .find((vinculo) => String(vinculo.id) === id);

  return (
    <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
      <div className="prototype-page-content prototype-page-content--white prototype-vinculo-form-page">
        <CardSeplag
          title="Visualizar Vínculo"
          cols="12"
          cardHeaderClassNames="prototype-carreira-card prototype-vinculos-card"
          headerNavigation={
            <BreadcrumbSeplag
              divided
              items={[
                { label: "Cadastro" },
                { label: "Vínculos Funcionais" },
                { label: "Vínculo", to: "/prototipos/sigep/vinculos" },
                { label: "Visualizar" },
              ]}
            />
          }
        >
          {registro ? (
            <form className="prototype-vinculo-form prototype-vinculo-form--readonly">
              {registro.automatico ? (
                <div className="prototype-vinculo-automatic-notice">
                  <i className="pi pi-info-circle" aria-hidden="true" />
                  <div>
                    <strong>Registro criado automaticamente pelo ingresso nº {registro.numeroIngresso}</strong>
                    <span>As informações deste contrato temporário estão disponíveis apenas para visualização.</span>
                  </div>
                </div>
              ) : null}

              <fieldset className="prototype-vinculo-view-fieldset" disabled>
                <section>
                  <header>
                    <i className="pi pi-id-card" aria-hidden="true" />
                    <div>
                      <h2>Dados do Vínculo</h2>
                      <p>Identificação do servidor e do tipo do vínculo.</p>
                    </div>
                  </header>
                  <div className="prototype-vinculo-form-grid prototype-vinculo-form-grid--identity">
                    <label><span>Nome</span><input value={registro.nome} readOnly /></label>
                    <label><span>CPF</span><input value={registro.cpf} readOnly /></label>
                    <label><span>Tipo de Vínculo</span><select value={registro.tipoVinculo} readOnly><option value={registro.tipoVinculo}>{registro.tipoVinculo}</option></select></label>
                  </div>
                </section>

                <section>
                  <header>
                    <i className="pi pi-briefcase" aria-hidden="true" />
                    <div>
                      <h2>Características do Vínculo</h2>
                      <p>Características funcionais e vigência do vínculo.</p>
                    </div>
                  </header>
                  <div className="prototype-vinculo-form-grid">
                    <label><span>Regime Jurídico</span><select value={registro.regime} readOnly><option value={registro.regime}>{registro.regime}</option></select></label>
                    <label><span>Carreira</span><select value={registro.carreira} readOnly><option value={registro.carreira}>{registro.carreira}</option></select></label>
                    <label><span>Cargo</span><select value={registro.cargo} readOnly><option value={registro.cargo}>{registro.cargo}</option></select></label>
                    <label><span>Perfil Profissional</span><select value={registro.perfilProfissional} readOnly><option value={registro.perfilProfissional}>{registro.perfilProfissional}</option></select></label>
                    <label><span>Jornada de Trabalho</span><select value={registro.jornadaTrabalho} readOnly><option value={registro.jornadaTrabalho}>{registro.jornadaTrabalho || "Não informado"}</option></select></label>
                    <label><span>Lotação</span><select value={registro.lotacao} readOnly><option value={registro.lotacao}>{registro.lotacao || "Não informado"}</option></select></label>
                    <label><span>Data de Início do Exercício</span><input type="date" value={formatarDataInputVinculo(registro.dataExercicio)} readOnly /></label>
                    <label><span>Data de Vacância</span><input type="date" value={formatarDataInputVinculo(registro.dataVacancia)} readOnly /></label>
                    <label><span>Forma de Vacância</span><select value={registro.formaVacancia} readOnly><option value={registro.formaVacancia}>{registro.formaVacancia || "Não informado"}</option></select></label>
                  </div>
                </section>

                <section>
                  <header>
                    <i className="pi pi-align-left" aria-hidden="true" />
                    <div>
                      <h2>Observação</h2>
                      <p>Informações complementares sobre o vínculo.</p>
                    </div>
                  </header>
                  <div className="prototype-vinculo-form-grid prototype-vinculo-form-grid--observation">
                    <label><span>Observação</span><textarea rows={4} value={registro.observacao} readOnly /></label>
                  </div>
                </section>
              </fieldset>

              <footer>
                <button type="button" className="prototype-vinculo-back" onClick={() => navigate("/prototipos/sigep/vinculos")}>
                  <i className="pi pi-arrow-left" aria-hidden="true" />
                  Voltar
                </button>
              </footer>
            </form>
          ) : (
            <div className="prototype-vinculo-not-found">
              <p>Vínculo não encontrado.</p>
              <button type="button" className="prototype-vinculo-back" onClick={() => navigate("/prototipos/sigep/vinculos")}>Voltar</button>
            </div>
          )}
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}
const formularioInicial = {
  nome: "",
  cpf: "",
  matricula: "",
  numeroVinculo: "",
  tipoVinculo: "",
  regime: "",
  carreira: "",
  cargo: "",
  perfilProfissional: "",
  jornadaTrabalho: "",
  lotacao: "",
  dataExercicio: "",
  dataVacancia: "",
  formaVacancia: "",
  observacao: "",
};

export function PrototiposVinculoCadastroPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const servidorId = Number(searchParams.get("servidor"));
  const servidor = servidoresBase.find((item) => item.id === servidorId);
  const [formulario, setFormulario] = useState({
    ...formularioInicial,
    nome: servidor?.nome ?? "",
    cpf: servidor?.cpf ?? "",
    matricula: servidor?.matricula ?? "",
    numeroVinculo: servidor ? String(servidor.vinculos.length + 1) : "",
  });

  const atualizar = (campo: keyof typeof formularioInicial, valor: string) => {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  };

  const salvar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const registro: VinculoRegistro = {
      id: Date.now(),
      ...formulario,
      situacao: formulario.dataVacancia ? "Vago" : "Ativo",
    };
    const registros = carregarVinculosSalvos();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...registros, registro]));
    navigate("/prototipos/sigep/vinculos");
  };

  return (
    <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
      <div className="prototype-page-content prototype-page-content--white prototype-vinculo-form-page">
        <CardSeplag
          title="Cadastrar Vínculo"
          cols="12"
          cardHeaderClassNames="prototype-carreira-card prototype-vinculos-card"
          headerNavigation={
            <BreadcrumbSeplag
              divided
              items={[
                { label: "Cadastro" },
                { label: "Vínculos Funcionais" },
                { label: "Vínculo", to: "/prototipos/sigep/vinculos" },
                { label: "Cadastrar" },
              ]}
            />
          }
        >
          <form className="prototype-vinculo-form" onSubmit={salvar}>
            <section>
              <header>
                <i className="pi pi-id-card" aria-hidden="true" />
                <div>
                  <h2>Dados do Vínculo</h2>
                  <p>Identifique o servidor e o tipo do vínculo.</p>
                </div>
              </header>
              <div className="prototype-vinculo-form-grid prototype-vinculo-form-grid--identity">
                <label><span>Nome <em>*</em></span><input required value={formulario.nome} onChange={(event) => atualizar("nome", event.target.value)} /></label>
                <label><span>CPF <em>*</em></span><input required inputMode="numeric" maxLength={14} placeholder="000.000.000-00" value={formulario.cpf} onChange={(event) => atualizar("cpf", formatarCpf(event.target.value))} /></label>
                <label><span>Tipo de Vínculo <em>*</em></span><select required value={formulario.tipoVinculo} onChange={(event) => atualizar("tipoVinculo", event.target.value)}><option value="">Selecione...</option>{tipoVinculoOptions.map((item) => <option key={item} value={item} disabled={item === "Contrato Temporário"}>{item === "Contrato Temporário" ? "Contrato Temporário — criado automaticamente pelo ingresso" : item}</option>)}</select></label>
              </div>
            </section>

            <section>
              <header>
                <i className="pi pi-briefcase" aria-hidden="true" />
                <div>
                  <h2>Características do Vínculo</h2>
                  <p>Informe as características funcionais e a vigência do vínculo.</p>
                </div>
              </header>
              <div className="prototype-vinculo-form-grid">
                <label><span>Regime Jurídico <em>*</em></span><select required value={formulario.regime} onChange={(event) => atualizar("regime", event.target.value)}><option value="">Selecione...</option>{regimeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label><span>Carreira <em>*</em></span><select required value={formulario.carreira} onChange={(event) => atualizar("carreira", event.target.value)}><option value="">Selecione...</option>{carreiraOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label><span>Cargo <em>*</em></span><select required value={formulario.cargo} onChange={(event) => atualizar("cargo", event.target.value)}><option value="">Selecione...</option>{cargoOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label><span>Perfil Profissional <em>*</em></span><select required value={formulario.perfilProfissional} onChange={(event) => atualizar("perfilProfissional", event.target.value)}><option value="">Selecione...</option>{perfilOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label><span>Jornada de Trabalho <em>*</em></span><select required value={formulario.jornadaTrabalho} onChange={(event) => atualizar("jornadaTrabalho", event.target.value)}><option value="">Selecione...</option>{jornadaTrabalhoOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label><span>Lotação <em>*</em></span><select required value={formulario.lotacao} onChange={(event) => atualizar("lotacao", event.target.value)}><option value="">Selecione...</option>{lotacaoOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label><span>Data de Início do Exercício <em>*</em></span><input required type="date" value={formulario.dataExercicio} onChange={(event) => atualizar("dataExercicio", event.target.value)} /></label>
                <label><span>Data de Vacância</span><input type="date" value={formulario.dataVacancia} min={formulario.dataExercicio || undefined} onChange={(event) => atualizar("dataVacancia", event.target.value)} /></label>
                <label><span>Forma de Vacância</span><select value={formulario.formaVacancia} required={Boolean(formulario.dataVacancia)} onChange={(event) => atualizar("formaVacancia", event.target.value)}><option value="">Selecione...</option>{formaVacanciaOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
              </div>
            </section>

            <section>
              <header>
                <i className="pi pi-align-left" aria-hidden="true" />
                <div>
                  <h2>Observação</h2>
                  <p>Registre informações complementares sobre o vínculo.</p>
                </div>
              </header>
              <div className="prototype-vinculo-form-grid prototype-vinculo-form-grid--observation">
                <label><span>Observação</span><textarea rows={4} placeholder="Registre uma observação, se necessário." value={formulario.observacao} onChange={(event) => atualizar("observacao", event.target.value)} /></label>
              </div>
            </section>
            <footer>
              <button type="button" className="prototype-vinculo-back" onClick={() => navigate("/prototipos/sigep/vinculos")}>
                <i className="pi pi-arrow-left" aria-hidden="true" />
                Voltar
              </button>
              <button type="submit" className="prototype-vinculo-save">
                <i className="pi pi-check" aria-hidden="true" />
                Salvar
              </button>
            </footer>
          </form>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}