import { ModalSeplag } from '../../componentes/Modal';
import { configuracaoDoEvento, OPCOES_VINCULOS, type EventoLicenca } from './model';

export function camposHistorico(evento: EventoLicenca) {
  const c = configuracaoDoEvento(evento);
  const dados: Record<string, string> = {
    'Código Interno': evento.codigo, 'Nome da Ocorrência': evento.nome, Tipo: evento.natureza,
    Categoria: evento.categoria, 'Data Início Vigência': c.inicioVigencia,
    'Data Fim Vigência': c.fimVigencia || 'Vigência Aberta', 'Amparo Legal': c.fundamentoLegal,
    Observação: c.orientacao, 'Tipos de Vínculo': [...evento.vinculos].sort().join(', '),
    'Dias Máximos Permitidos': c.semLimite ? 'Sem limite' : String(evento.quantidade),
    'Tipo de Contagem': c.contagem, Abrangência: [...c.abrangencias].sort().join(', '),
    'Trava de Recorrência': c.travaRecorrencia ? `${c.recorrenciaQuantidade} ocorrência(s) a cada ${c.recorrenciaIntervalo} ${c.recorrenciaUnidade}` : 'Não',
    'Exige Parentesco': evento.parentesco ? 'Sim' : 'Não',
    'Graus de Parentesco': evento.parentesco ? [...c.grausParentesco].sort().join(', ') : '',
    'Exigência de Documentos': c.documentosObrigatorios ? 'Sim, obrigatório' : 'Não é obrigatório',
    Situação: evento.situacao,
  };
  const financeiros: Record<string, string> = {};
  for (const vinculo of evento.vinculos) {
    const efeito = c.efeitosFinanceiros?.[vinculo];
    const nome = OPCOES_VINCULOS.find(o => o.value === vinculo)?.label ?? vinculo;
    financeiros[`Gera ônus (${nome})`] = efeito ? efeito.geraOnus ? 'Sim' : 'Não' : 'Não configurado';
    financeiros[`Suspende remuneração (${nome})`] = efeito ? efeito.suspendeRemuneracao ? `Sim (a partir do ${efeito.diaInicioSuspensao}º dia)` : 'Não' : 'Não configurado';
  }
  return { 'Dados da Parametrização': dados, 'Efeitos Financeiros': financeiros };
}

export function HistoricoEvento({evento, fechar}: {evento: EventoLicenca | null; fechar: () => void}) {
  const c = evento ? configuracaoDoEvento(evento) : null;
  const dataBR = (data: string) => data.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3/$2/$1');
  return <ModalSeplag visible={Boolean(evento)} titulo="Histórico de Alterações" fechar={fechar} hideFooter tamanho="min(90vw, 1440px)">
    {evento && <div className="pl-historico">
      <section className="pl-history-identificacao" aria-label="Identificação da ocorrência">
      <h2>{evento.nome}</h2>
      <dl className="pl-history-resumo">
        <div><dt>Código Interno</dt><dd>{evento.codigo}</dd></div>
        <div><dt>Tipo de Ocorrência</dt><dd>{evento.natureza}</dd></div>
        <div><dt>Vigência Atual</dt><dd>{c?.inicioVigencia ? dataBR(c.inicioVigencia) : 'Não informada'} — {c?.fimVigencia ? dataBR(c.fimVigencia) : 'Aberta'}</dd></div>
        <div><dt>Amparo Legal Atual</dt><dd>{c?.fundamentoLegal || 'Não informado'}</dd></div>
      </dl>
      </section>
      {!evento.historico?.length ? <p className="v2v-empty">Nenhuma alteração registrada para esta ocorrência.</p> :
        <div className="pl-history-table-wrap"><table className="pl-history-table" aria-label="Histórico de alterações"><colgroup><col className="pl-history-meta-col"/><col/></colgroup><thead><tr><th scope="col">Data / Responsável</th><th scope="col">Detalhes das Alterações<div className="pl-history-columns"><span>Campo</span><span>Valor anterior</span><span>Novo valor</span></div></th></tr></thead><tbody>
          {[...evento.historico].reverse().map((versao, i) => {
            const anterior = versao.anteriores ?? evento.historico?.[evento.historico.length - i - 2]?.dados;
            const antes = anterior ? camposHistorico(anterior) : null;
            const depois = camposHistorico(versao.dados);
            let quantidade = 0;
            const grupos = Object.entries(depois).map(([aba, campos]) => {
              const antigos = antes?.[aba as keyof typeof antes] ?? {};
              const alterados = [...new Set([...Object.keys(antigos), ...Object.keys(campos)])].filter(campo => antigos[campo] !== campos[campo]);
              quantidade += alterados.length;
              return alterados.length > 0 && <section className="pl-history-group" key={aba}>
                <h3>{alterados.length} campo(s) {anterior ? 'alterado(s)' : 'registrado(s)'} na aba “{aba}”</h3>
                {alterados.map(campo => <div className={`pl-history-change${!anterior ? ' pl-history-initial' : ''}`} key={campo}><strong>{campo}</strong>{anterior && <span className="pl-history-old" aria-label={`Valor anterior: ${antigos[campo] || 'Não informado'}`}>{antigos[campo] || 'Não informado'}</span>}<span className="pl-history-new" aria-label={`Novo valor: ${campos[campo] || 'Não informado'}`}>{campos[campo] || 'Não informado'}</span></div>)}
              </section>;
            });
            return <tr key={versao.versao}><td className="pl-history-meta"><time dateTime={versao.publicadaEm}><strong>{new Date(versao.publicadaEm).toLocaleDateString('pt-BR')}</strong><span>{new Date(versao.publicadaEm).toLocaleTimeString('pt-BR')}</span></time><p>{versao.responsavel || 'Responsável não registrado'}</p><small>Versão {versao.versao}</small></td><td>{!anterior && <h3 className="pl-history-creation">Criação da Ocorrência (Registro Inicial)</h3>}{grupos}{quantidade === 0 && <p>Sem alterações nos campos da parametrização.</p>}</td></tr>;
          })}
        </tbody></table></div>}
    </div>}
  </ModalSeplag>;
}
