import type { Vinculo } from './vinculoDados';
import { agruparAnalise, sexoVinculo } from './dashboardAbasModel';
import { corSexo } from './dashboardTema';

export function TiposVinculoPorSexo({ registros, abrir }: {
  registros: Vinculo[];
  abrir: (titulo: string, itens: Vinculo[]) => void;
}) {
  const sexos = agruparAnalise(registros, sexoVinculo);
  const tipos = agruparAnalise(registros, v => v.tipo);
  const maior = Math.max(1, ...tipos.map(g => g.total));
  return <section className="v2v-panel da-card" aria-labelledby="da-tipos-sexo-title">
    <h2 id="da-tipos-sexo-title">Tipos de Vínculo por Sexo</h2>
    <div className="dv-chart-legend da-sex-legend">
      {sexos.map(sexo => <span key={sexo.nome}><i style={{background: corSexo(sexo.nome)}} />{sexo.nome}</span>)}
    </div>
    <div className="da-sex-rows">
      {tipos.map(tipo => <div className="da-sex-row" key={tipo.nome}>
        <div className="da-sex-heading"><span>{tipo.nome}</span><strong title={`Total: ${tipo.total} vínculos`}>{tipo.total}</strong></div>
        <div className="da-sex-track" role="group" aria-label={`${tipo.nome}: ${tipo.total} vínculos`}>
          {sexos.map(sexo => {
            const itens = tipo.itens.filter(v => sexoVinculo(v) === sexo.nome);
            if (!itens.length) return null;
            const rotulo = `${tipo.nome} · ${sexo.nome}: ${itens.length} vínculos`;
            return <button key={sexo.nome} type="button" aria-label={rotulo}
              title={`${rotulo} (${(itens.length / tipo.total * 100).toLocaleString('pt-BR', {maximumFractionDigits: 1})}% do tipo)`}
              style={{width: `${itens.length / maior * 100}%`, background: corSexo(sexo.nome), color: sexo.nome === 'Não informado' ? 'var(--dv-texto)' : '#fff'}}
              onClick={() => abrir(`${tipo.nome} · ${sexo.nome}`, itens)}><span aria-hidden="true">{itens.length / maior >= .05 ? itens.length : ''}</span></button>;
          })}
        </div>
      </div>)}
      {!tipos.length && <p role="status">Nenhum vínculo encontrado.</p>}
    </div>
  </section>;
}
