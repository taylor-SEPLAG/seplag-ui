import { ModalSeplag } from '../../componentes/Modal';
import { configuracaoDoEvento, regraDoVinculo, OPCOES_VINCULOS, type EventoLicenca } from './model';

export function camposHistorico(evento: EventoLicenca) {
  const c = configuracaoDoEvento(evento);
  const dados: Record<string, string> = {
    'Código Interno': evento.codigo, 'Nome da Ocorrência': evento.nome, Sigla: evento.sigla ?? '', Tipo: evento.natureza,
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
    const regra = regraDoVinculo(evento, vinculo);
    const nome = OPCOES_VINCULOS.find(o => o.value === vinculo)?.label ?? vinculo;
    dados[`Dias Máximos Permitidos (${nome})`] = regra.semLimite ? 'Sem limite' : String(regra.quantidade);
    dados[`Abrangência (${nome})`] = [...regra.abrangencias].sort().join(', ');
    dados[`Trava de Recorrência (${nome})`] = regra.travaRecorrencia ? `${regra.recorrenciaQuantidade} ocorrência(s) a cada ${regra.recorrenciaIntervalo} ${regra.recorrenciaUnidade}` : 'Não';
    financeiros[`Gera ônus (${nome})`] = efeito ? efeito.geraOnus ? 'Sim' : 'Não' : 'Não configurado';
    financeiros[`Suspende remuneração (${nome})`] = efeito ? efeito.suspendeRemuneracao ? `Sim (a partir do ${efeito.diaInicioSuspensao}º dia)` : 'Não' : 'Não configurado';
  }
  return { 'Dados da Parametrização': dados, 'Efeitos Financeiros': financeiros };
}

export function HistoricoEvento({evento, fechar}: {evento: EventoLicenca | null; fechar: () => void}) {
  const c = evento ? configuracaoDoEvento(evento) : null;
  const dataBR = (data: string) => data.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3/$2/$1');
  return <ModalSeplag visible={Boolean(evento)} titulo="Histórico de Alterações" fechar={fechar} hideFooter tamanho="min(94vw, 760px)">
    {evento && <div className="pl-historico pl-history-cards">
      <p className="pl-history-subtitle">Rastreabilidade da Parametrização de Ocorrências</p>
      <section className="pl-history-identificacao" aria-label="Identificação da ocorrência">
      <dl className="pl-history-resumo">
        <div><dt>Código Interno</dt><dd>{evento.codigo}</dd></div>
        <div><dt>Tipo de Ocorrência</dt><dd>{evento.natureza}</dd></div>
        <div><dt>Vigência Atual</dt><dd>{c?.inicioVigencia ? dataBR(c.inicioVigencia) : 'Não informada'} — {c?.fimVigencia ? dataBR(c.fimVigencia) : 'Aberta'}</dd></div>
        <div><dt>Amparo Legal Atual</dt><dd>{c?.fundamentoLegal || 'Não informado'}</dd></div>
      </dl>
      </section>
      {!evento.historico?.length ? <p className="v2v-empty">Nenhuma alteração registrada para esta ocorrência.</p> :
        <div className="pl-history-events" aria-label="Histórico de alterações">
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
            return <article className="pl-history-event" key={versao.versao} aria-label={`${anterior ? 'Edição' : 'Criação'} — Versão ${versao.versao}`}>
              <header><time dateTime={versao.publicadaEm}>{new Date(versao.publicadaEm).toLocaleDateString('pt-BR', { timeZone: 'America/Cuiaba' })} às {new Date(versao.publicadaEm).toLocaleTimeString('pt-BR', { timeZone: 'America/Cuiaba', hour: '2-digit', minute: '2-digit' })}</time>
                <span className={`pl-history-operation ${anterior ? 'is-edit' : 'is-create'}`}>{anterior ? 'Edição' : 'Criação'}</span>
                <span className="pl-history-person"><i className="pi pi-user" aria-hidden="true" />{versao.responsavel || 'Responsável não registrado'}</span>
              </header>
              <div className="pl-history-event-body">{anterior ? <>
                <div className="pl-history-card-columns"><span>Campo</span><span>Valor anterior</span><span>Novo valor</span></div>
                {grupos}{quantidade === 0 && <p>Sem alterações nos campos da parametrização.</p>}
              </> : <><p>Ocorrência criada com {quantidade} campos preenchidos.</p>
                <details><summary>Ver todos os detalhes da criação original</summary>{grupos}</details>
              </>}</div>
            </article>;
          })}
        </div>}
    </div>}
  </ModalSeplag>;
}
