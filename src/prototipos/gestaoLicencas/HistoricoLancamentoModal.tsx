import { Dialog } from "primereact/dialog";
import { dataLicenca, registrosLicencas, type RegistroLicenca } from "./model";
import { carregarSolicitacoes, listarServidores } from "./solicitacaoModel";
import { abrirDocumento } from "./documentosSolicitacao";

const dataHistorico = (data?: string) => data && Number.isFinite(Date.parse(data))
  ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Cuiaba" }).format(new Date(data))
  : "Data não informada";

export function HistoricoLancamentoModal({ registro, onClose }: { registro: RegistroLicenca; onClose: () => void }) {
  const atual = carregarSolicitacoes().find((item) => item.id === registro.id) || registro;
  const criadoEm = atual.criadoEm || registrosLicencas.find((item) => item.id === atual.id)?.criadoEm;
  const jornada = listarServidores().find((servidor) => servidor.matricula === atual.matricula)
    ?.vinculos.find((vinculo) => vinculo.numero === atual.vinculo)?.jornada;
  const alteracoes = [...(atual.alteracoes || [])].sort((a, b) => Date.parse(b.data) - Date.parse(a.data));
  return <Dialog visible header="Histórico de Lançamento" onHide={onClose} modal draggable={false}
    className="gl-historico-modal" style={{ width: "660px", maxWidth: "calc(100vw - 24px)" }}>
    <section className="gl-historico-servidor" aria-label="Dados do registro">
      <header><strong>{atual.nome}</strong><span>Matrícula: <b>{atual.matricula}</b></span><span>Vínculo: <b>{atual.vinculo}</b></span></header>
      <dl>
        <div><dt>Órgão/Unidade de lotação</dt><dd>{atual.orgao} / {atual.lotacao}</dd></div>
        <div><dt>Cargo</dt><dd>{atual.cargo}</dd></div>
        <div><dt>Jornada</dt><dd>{jornada || "Não informada"}</dd></div>
        <div><dt>Tipo de vínculo</dt><dd><span className="gl-historico-vinculo">{atual.tipoVinculo}</span></dd></div>
      </dl>
    </section>
    <h3 className="gl-historico-heading"><i className="pi pi-history" aria-hidden="true" /> Linha do tempo de alterações</h3>
    <ol className="gl-historico-timeline">
      {alteracoes.map((alteracao, index) => <li key={`${alteracao.data}-${index}`}>
        <div className="gl-historico-evento"><strong>Edição de Dados</strong><time dateTime={alteracao.data}>{dataHistorico(alteracao.data)}</time></div>
        <p>{alteracao.descricao || "Justificativa de alteração registrada para este lançamento."}</p>
        <p className="gl-historico-autor"><i className="pi pi-user" aria-hidden="true" /> {alteracao.responsavel || "Responsável não informado"}</p>
        <div className="gl-historico-detalhes">
          <h4><i className="pi pi-comment" aria-hidden="true" /> Justificativa</h4>
          <blockquote>“{alteracao.justificativa}”</blockquote>
          <h4><i className="pi pi-paperclip" aria-hidden="true" /> Documento comprobatório</h4>
          <button type="button" className="gl-historico-documento" onClick={() => abrirDocumento(alteracao.documento)}>
            <i className="pi pi-file" aria-hidden="true" /><span>{alteracao.documento.nome}<small>{alteracao.documento.extensao.toUpperCase()} · {(alteracao.documento.tamanho / (1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} MB</small></span>
          </button>
        </div>
      </li>)}
      <li className="gl-historico-original">
        <div className="gl-historico-evento"><strong>Lançamento Original</strong><time dateTime={criadoEm}>{dataHistorico(criadoEm)}</time></div>
        <p>Solicitação criada no sistema com término em {dataLicenca(atual.fimOriginal || atual.fim)}.</p>
        <p className="gl-historico-autor"><i className="pi pi-user" aria-hidden="true" /> {atual.criadoPor || "Responsável não informado"}</p>
      </li>
    </ol>
  </Dialog>;
}
