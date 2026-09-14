import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";
import { BadgeSeplag } from "../../componentes/Badge";
import {
  BotaoAdicionarSeplag,
  BotaoIconSeplag,
  BotaoLimparFiltroSeplag,
} from "../../componentes/Botao";
import {
  listarQuadrosComissionados,
  prepararEdicaoQuadroComissionado,
  prepararNovoQuadroComissionado,
  type ItemEstruturaComissionadaSalvo,
  type QuadroComissionadoSalvo,
} from "./novoQuadroComissionadoStore";
import "./quadroAutorizadoComissionadoLista.css";

const BASE_PATH = "/prototipos/sigep/controle-vagas/comissionados/quadro-autorizado";

type SituacaoLista = "Ativo" | "Agendado";
type QuadroLista = QuadroComissionadoSalvo & {
  codigo: string;
  cargos: number;
  funcoes: number;
  dotacoes: number;
  situacao: SituacaoLista;
};

function somarItens(itens: ItemEstruturaComissionadaSalvo[]) {
  return itens.reduce(
    (total, item) => {
      const atual = item.dotacoes.reduce(
        (soma, dotacao) => ({
          cargos: soma.cargos + dotacao.cargos,
          funcoes: soma.funcoes + dotacao.funcoes,
          dotacoes: soma.dotacoes + 1,
        }),
        { cargos: 0, funcoes: 0, dotacoes: 0 },
      );
      const filhos = somarItens(item.subitens ?? []);
      return {
        cargos: total.cargos + atual.cargos + filhos.cargos,
        funcoes: total.funcoes + atual.funcoes + filhos.funcoes,
        dotacoes: total.dotacoes + atual.dotacoes + filhos.dotacoes,
      };
    },
    { cargos: 0, funcoes: 0, dotacoes: 0 },
  );
}

function situacaoDoQuadro(dataVigencia: string): SituacaoLista {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const inicio = dataVigencia ? new Date(`${dataVigencia}T00:00:00`) : hoje;
  return inicio > hoje ? "Agendado" : "Ativo";
}

export function QuadroAutorizadoComissionadoLista() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [orgao, setOrgao] = useState("");
  const [situacao, setSituacao] = useState("");
  const [detalhe, setDetalhe] = useState<QuadroLista | null>(null);
  const quadros = useMemo<QuadroLista[]>(() => listarQuadrosComissionados().map((quadro, indice) => {
    const totais = quadro.niveis.reduce(
      (total, nivel) => {
        const itens = somarItens(nivel.itens ?? []);
        return {
          cargos: total.cargos + itens.cargos,
          funcoes: total.funcoes + itens.funcoes,
          dotacoes: total.dotacoes + itens.dotacoes,
        };
      },
      { cargos: 0, funcoes: 0, dotacoes: 0 },
    );
    return {
      ...quadro,
      ...totais,
      codigo: `QC-${String(indice + 1).padStart(4, "0")}`,
      situacao: situacaoDoQuadro(quadro.dataVigencia),
    };
  }), []);

  const orgaos = useMemo(() => [...new Set(quadros.map((quadro) => quadro.orgao))].sort(), [quadros]);
  const filtrados = quadros.filter((quadro) => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return (!termo || `${quadro.codigo} ${quadro.nome}`.toLocaleLowerCase("pt-BR").includes(termo))
      && (!orgao || quadro.orgao === orgao)
      && (!situacao || quadro.situacao === situacao);
  });
  const kpis = quadros.reduce((total, quadro) => ({
    cargos: total.cargos + quadro.cargos,
    funcoes: total.funcoes + quadro.funcoes,
    dotacoes: total.dotacoes + quadro.dotacoes,
  }), { cargos: 0, funcoes: 0, dotacoes: 0 });

  const novoQuadro = () => {
    prepararNovoQuadroComissionado();
    navigate(`${BASE_PATH}/novo`);
  };
  const editarQuadro = (id: string) => {
    prepararEdicaoQuadroComissionado(id);
    navigate(`${BASE_PATH}/novo`);
  };
  const limpar = () => { setBusca(""); setOrgao(""); setSituacao(""); };

  return <main className="qcl-page">
    <section className="qcl-content">
      <header className="qcl-heading"><div><h1>Quadro de Vagas Comissionados</h1><p>Estruturas organizacionais e dotações autorizadas por órgão.</p></div></header>

      <div className="qcl-kpis">
        <Kpi label="Quadros cadastrados" value={quadros.length} icon="pi pi-file" />
        <Kpi label="Órgãos vinculados" value={orgaos.length} icon="pi pi-building" />
        <Kpi label="Cargos em comissão autorizados" value={kpis.cargos} icon="pi pi-briefcase" />
        <Kpi label="Funções de confiança autorizadas" value={kpis.funcoes} icon="pi pi-users" />
        <Kpi label="Dotações registradas" value={kpis.dotacoes} icon="pi pi-sitemap" />
      </div>

      <div className="qcl-filtros">
        <label>Quadro<span className="qcl-input-wrap"><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Nome ou código do quadro" /><i className="pi pi-search" /></span></label>
        <label>Órgão<Dropdown value={orgao} options={orgaos.map((item) => ({ label: item, value: item }))} showClear placeholder="Todos" onChange={(event) => setOrgao(event.value ?? "")} /></label>
        <label>Situação<Dropdown value={situacao} options={[{ label: "Ativo", value: "Ativo" }, { label: "Agendado", value: "Agendado" }]} showClear placeholder="Todas" onChange={(event) => setSituacao(event.value ?? "")} /></label>
        <BotaoLimparFiltroSeplag label="Limpar" onClick={limpar} />
      </div>

      <div className="qcl-table-toolbar"><BotaoAdicionarSeplag label="Novo Quadro" onClick={novoQuadro} /></div><div className="qcl-table-wrap"><table><thead><tr><th>Quadro</th><th>Órgão</th><th>Cargos</th><th>Funções</th><th>Situação</th><th>Ações</th></tr></thead><tbody>
        {filtrados.map((quadro) => <tr key={quadro.id}><td><strong>{quadro.codigo}</strong><small>{quadro.nome}</small></td><td>{quadro.orgao}</td><td>{quadro.cargos}</td><td>{quadro.funcoes}</td><td><BadgeSeplag label={quadro.situacao} color={quadro.situacao === "Ativo" ? "#00843d" : "#8a5a00"} bg={quadro.situacao === "Ativo" ? "#dff3e8" : "#fff4d6"} size="xs" /></td><td><span className="qcl-actions"><BotaoIconSeplag icon="pi pi-eye" aria-label={`Visualizar ${quadro.nome}`} tooltip="Visualizar estrutura" onClick={() => setDetalhe(quadro)} /><BotaoIconSeplag icon="pi pi-pencil" aria-label={`Editar ${quadro.nome}`} tooltip="Editar quadro" onClick={() => editarQuadro(quadro.id)} /><BotaoIconSeplag icon="pi pi-history" aria-label={`Histórico de ${quadro.nome}`} tooltip="Histórico" onClick={() => setDetalhe(quadro)} /></span></td></tr>)}
        {!filtrados.length && <tr><td className="qcl-empty" colSpan={6}>Nenhum quadro comissionado encontrado.</td></tr>}
      </tbody></table></div>
    </section>
    {detalhe && <aside className="qcl-detail" role="dialog" aria-label="Resumo do quadro"><header><div><span>QUADRO COMISSIONADO</span><h2>{detalhe.nome}</h2></div><BotaoIconSeplag icon="pi pi-times" aria-label="Fechar resumo" tooltip="Fechar" onClick={() => setDetalhe(null)} /></header><dl><div><dt>Órgão</dt><dd>{detalhe.orgao}</dd></div><div><dt>Níveis</dt><dd>{detalhe.niveis.length}</dd></div><div><dt>Itens e subitens</dt><dd>{contarItens(detalhe.niveis)}</dd></div><div><dt>Dotações</dt><dd>{detalhe.dotacoes}</dd></div><div><dt>Cargos autorizados</dt><dd>{detalhe.cargos}</dd></div><div><dt>Funções autorizadas</dt><dd>{detalhe.funcoes}</dd></div></dl></aside>}
  </main>;
}

function Kpi({ label, value, icon }: { label: string; value: number; icon: string }) { return <article className="qcl-kpi"><i className={icon} /><div><span>{label}</span><strong>{value.toLocaleString("pt-BR")}</strong></div></article>; }
function contarItens(niveis: QuadroComissionadoSalvo["niveis"]) { const contar = (itens: ItemEstruturaComissionadaSalvo[]): number => itens.reduce((total, item) => total + 1 + contar(item.subitens ?? []), 0); return niveis.reduce((total, nivel) => total + contar(nivel.itens ?? []), 0); }
