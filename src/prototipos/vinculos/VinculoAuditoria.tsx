import { consultarAuditoriaVinculos } from './vinculoAdministracao';
import { useUsuarioVinculos } from './vinculoSessao';
import { useAtualizacaoVinculos } from './vinculoPersistencia';

export function VinculoAuditoria({id}: {id?: string}) {
  const usuario = useUsuarioVinculos();
  useAtualizacaoVinculos();
  if (!usuario || (!id && !usuario.excluir)) return <p role="alert">Seu perfil não possui permissão para consultar esta auditoria.</p>;
  const eventos = consultarAuditoriaVinculos(id);
  return <section className="v2v-audit" aria-label="Histórico de Alterações">
    {!eventos.length && <p>Nenhuma alteração registrada para esta consulta.</p>}
    {eventos.map(e => <details key={e.id} className="v2v-panel">
      <summary><span><strong>{e.operacao}</strong> · {new Date(e.registradoEm).toLocaleString('pt-BR',{timeZone:'America/Cuiaba'})}<small>{e.usuario}{e.login ? ` (${e.login})` : ''} · {e.origem} · {e.mudancas.length} campo(s) alterado(s)</small></span><span className="v2v-link">Ver detalhes</span></summary>
      <div className="v2v-section-body"><p><strong>{e.identificacao.nome}</strong> · Matrícula {e.identificacao.matricula} · Vínculo {e.identificacao.numero} · {e.identificacao.tipo}</p><p><strong>Justificativa:</strong> {e.justificativa}</p>
        {!!e.mudancas.length && <div className="v2v-table-wrap"><table className="v2v-table"><thead><tr><th>Campo Alterado</th><th>Valor Anterior</th><th>Novo Valor</th></tr></thead><tbody>{e.mudancas.map(m => <tr key={m.campo}><td>{m.rotulo}</td><td>{m.anterior || '—'}</td><td>{m.novo || '—'}</td></tr>)}</tbody></table></div>}
      </div>
    </details>)}
  </section>;
}
