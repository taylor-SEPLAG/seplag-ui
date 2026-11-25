import { Fragment, useState } from "react";
import { BotaoSeplag } from "../../componentes/Botao";
import { Paginator } from "primereact/paginator";
import { SecaoProcessamentoFolha } from "./SecaoProcessamentoFolha";
import type {
  GrupoResultado,
  ResultadoSimulacao,
  VinculoSimulacao,
} from "./simulacaoExecucaoModelo";
import "./simulacaoExecucao.css";
const numero = (n: number) => n.toLocaleString("pt-BR");
function VinculosGrupo({
  grupo,
  consultar,
}: {
  grupo: GrupoResultado;
  consultar: (
    ids: string[],
    inicio: number,
    quantidade: number,
  ) => VinculoSimulacao[];
}) {
  const [primeiro, setPrimeiro] = useState(0),
    [quantidade, setQuantidade] = useState(10);
  const inicio = Math.min(
    primeiro,
    Math.max(0, Math.ceil(grupo.vinculosIds.length / quantidade) - 1) *
      quantidade,
  );
  const registros = consultar(grupo.vinculosIds, inicio, quantidade);
  return (
    <div className="simulacao-vinculos">
      <h4>
        {grupo.grupo} · V{grupo.versao}
      </h4>
      <p>{numero(grupo.vinculosIds.length)} vínculos encontrados</p>
      <div className="simulacao-tabela-scroll">
        <table className="simulacao-tabela">
          <thead>
            <tr>
              <th>Matrícula/Vínculo</th>
              <th>Servidor</th>
              <th>Tipo de Vínculo</th>
              <th>Órgão/Entidade</th>
              <th>Unidade</th>
              <th>Cargo</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((v) => (
              <tr key={v.id}>
                <td>
                  {v.matricula}/{v.numero}
                </td>
                <td>{v.nome}</td>
                <td>{v.tipo}</td>
                <td>{v.orgao}</td>
                <td>{v.setor || "—"}</td>
                <td>{v.cargo || "—"}</td>
              </tr>
            ))}
            {!registros.length && (
              <tr>
                <td colSpan={6}>Nenhum vínculo elegível neste grupo.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <nav aria-label={`Paginação dos vínculos de ${grupo.grupo}`}>
        <Paginator
          first={inicio}
          rows={quantidade}
          totalRecords={grupo.vinculosIds.length}
          rowsPerPageOptions={[10, 20, 50]}
          onPageChange={(e) => {
            setPrimeiro(e.first);
            setQuantidade(e.rows);
          }}
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        />
      </nav>
    </div>
  );
}
export function SimulacaoExecucao({
  resultado,
  invalida,
  onSimular,
  onDemonstrarSemGrupos,
  demonstracao = false,
  consultar,
}: {
  resultado: ResultadoSimulacao | null;
  invalida: boolean;
  onSimular: () => void;
  onDemonstrarSemGrupos?: () => void;
  demonstracao?: boolean;
  consultar: (
    ids: string[],
    inicio: number,
    quantidade: number,
  ) => VinculoSimulacao[];
}) {
  const [abertos, setAbertos] = useState<string[]>([]);
  const [primeiroGrupo, setPrimeiroGrupo] = useState(0),
    [gruposPorPagina, setGruposPorPagina] = useState(10);
  const inicioGrupos = Math.min(
    primeiroGrupo,
    Math.max(
      0,
      Math.ceil((resultado?.grupos.length ?? 0) / gruposPorPagina) - 1,
    ) * gruposPorPagina,
  );
  const semGrupos = resultado?.grupos.length === 0,
    impedida = !!resultado?.impedimentos.length,
    semVinculos = resultado?.total === 0;
  return (
    <SecaoProcessamentoFolha
      titulo="Simulação da Execução"
      icone="pi pi-play"
      descricao="Verifique quais grupos serão considerados e os vínculos encontrados para os parâmetros informados."
      acoes={
        <div className="simulacao-acoes">
          {onDemonstrarSemGrupos && (
            <BotaoSeplag
              type="button"
              label="Demonstrar sem grupos"
              icon="pi pi-eye"
              outlined
              style={{
                border: "1px solid #1688ed",
                background: "#fff",
                color: "#0874d1",
              }}
              onClick={() => {
                setAbertos([]);
                setPrimeiroGrupo(0);
                onDemonstrarSemGrupos();
              }}
            />
          )}
          <BotaoSeplag
            type="button"
            label="Simular execução"
            icon="pi pi-play"
            outlined
            style={{
              border: "1px solid #1688ed",
              background: "#fff",
              color: "#0874d1",
            }}
            onClick={() => {
              setAbertos([]);
              setPrimeiroGrupo(0);
              onSimular();
            }}
          />
        </div>
      }
    >
      {demonstracao && !invalida && (
        <p className="simulacao-inicial">
          Demonstração do cenário sem grupos de cálculo. Utilize “Simular
          execução” para consultar os parâmetros reais.
        </p>
      )}
      {invalida ? (
        <p className="simulacao-faixa is-alerta" role="status">
          <i className="pi pi-info-circle" aria-hidden="true" />
          Os parâmetros da execução foram alterados. Realize uma nova simulação
          para atualizar o resultado.
        </p>
      ) : resultado ? (
        <>
          <div
            className={`simulacao-faixa ${semGrupos || impedida ? "is-erro" : semVinculos ? "is-alerta" : "is-sucesso"}`}
            role="status"
          >
            <i
              className={`pi ${semGrupos || impedida ? "pi-times-circle" : semVinculos ? "pi-exclamation-triangle" : "pi-check-circle"}`}
              aria-hidden="true"
            />
            <div>
              {semGrupos ? (
                <>
                  <strong>Nenhum Grupo de Cálculo encontrado</strong>
                  <p>
                    O processamento será realizado, porém não haverá vínculos a
                    processar, pois não existe Grupo de Cálculo compatível com
                    os parâmetros informados.
                  </p>
                </>
              ) : impedida ? (
                <>
                  <strong>Simulação com impedimentos</strong>
                  {resultado.impedimentos.map((m) => (
                    <p key={m}>{m}</p>
                  ))}
                </>
              ) : semVinculos ? (
                <>
                  <strong>Nenhum vínculo elegível encontrado</strong>
                  <p>
                    Foram encontrados {numero(resultado.grupos.length)} Grupos
                    de Cálculo compatíveis, porém nenhum vínculo atende aos
                    parâmetros desta execução.
                  </p>
                </>
              ) : (
                <>
                  <strong>Simulação concluída</strong>
                  <p>
                    {numero(resultado.grupos.length)} grupos de cálculo
                    encontrados · {numero(resultado.total ?? 0)} vínculos
                    elegíveis
                  </p>
                </>
              )}
            </div>
          </div>
          {!!resultado.grupos.length && (
            <>
              <h3 className="simulacao-grupos-titulo">Grupos encontrados</h3>
              <div className="simulacao-tabela-scroll">
                <table className="simulacao-tabela">
                  <thead>
                    <tr>
                      <th aria-label="Expandir grupo" />
                      <th>Grupo de Cálculo</th>
                      <th>Versão</th>
                      <th>Vigência</th>
                      <th className="simulacao-numero">Vínculos encontrados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.grupos
                      .slice(inicioGrupos, inicioGrupos + gruposPorPagina)
                      .map((g) => (
                        <Fragment key={g.chave}>
                          <tr>
                            <td>
                              <button
                                type="button"
                                className="simulacao-expandir"
                                aria-expanded={abertos.includes(g.chave)}
                                aria-label={`${abertos.includes(g.chave) ? "Recolher" : "Expandir"} ${g.grupo}`}
                                onClick={() =>
                                  setAbertos((v) =>
                                    v.includes(g.chave)
                                      ? v.filter((c) => c !== g.chave)
                                      : [...v, g.chave],
                                  )
                                }
                              >
                                <i
                                  className={`pi ${abertos.includes(g.chave) ? "pi-chevron-down" : "pi-chevron-right"}`}
                                  aria-hidden="true"
                                />
                              </button>
                            </td>
                            <td>{g.grupo}</td>
                            <td>V{g.versao}</td>
                            <td>
                              {g.inicioVigencia} —{" "}
                              {g.fimVigencia && g.fimVigencia !== "-"
                                ? g.fimVigencia
                                : "Atual"}
                            </td>
                            <td className="simulacao-numero">
                              {g.vinculosIds.length ? (
                                <strong>{numero(g.vinculosIds.length)}</strong>
                              ) : (
                                <span className="simulacao-sem-vinculo">
                                  Nenhum vínculo
                                </span>
                              )}
                            </td>
                          </tr>
                          {abertos.includes(g.chave) && (
                            <tr>
                              <td colSpan={5}>
                                <VinculosGrupo
                                  grupo={g}
                                  consultar={consultar}
                                />
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                  </tbody>
                </table>
              </div>
              <nav aria-label="Paginação dos grupos encontrados">
                <Paginator
                  first={inicioGrupos}
                  rows={gruposPorPagina}
                  totalRecords={resultado.grupos.length}
                  rowsPerPageOptions={[10, 20, 50]}
                  template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                  onPageChange={(e) => {
                    setPrimeiroGrupo(e.first);
                    setGruposPorPagina(e.rows);
                    setAbertos([]);
                  }}
                />
              </nav>
              <div className="simulacao-resumo">
                <span>
                  {numero(resultado.grupos.length)} grupos encontrados
                </span>
                <span>
                  {resultado.total === null ? "—" : numero(resultado.total)}{" "}
                  vínculos elegíveis
                </span>
              </div>
            </>
          )}
        </>
      ) : (
        <p className="simulacao-inicial">
          Utilize “Simular execução” para consultar os grupos e vínculos antes
          do processamento.
        </p>
      )}
    </SecaoProcessamentoFolha>
  );
}
