export interface JornadaDocenteConfig {
  duracao: '' | '50' | '60'; possuiHoraAtividade: boolean; jornada: string; inicio: string; fim: string;
}
export const jornadaDocenteVazia: JornadaDocenteConfig = { duracao: '', possuiHoraAtividade: false, jornada: '', inicio: '', fim: '' };
export function calcularJornadaDocente(config: JornadaDocenteConfig) {
  const total = Number(config.jornada) || 0;
  const atividade = config.duracao === '50' && config.possuiHoraAtividade ? total / 3 : 0;
  return { total, atividade, docencia: total - atividade };
}
export function jornadaDocenteValida(config: JornadaDocenteConfig) {
  return ['50','60'].includes(config.duracao) && Number(config.jornada) > 0 && Boolean(config.inicio) && Boolean(config.fim) && config.fim >= config.inicio;
}
export function JornadaDocente({ value, onChange }: { value: JornadaDocenteConfig; onChange: (value: JornadaDocenteConfig) => void }) {

  return <section className="prototype-carreira-register-section prototype-jornada-docente" aria-labelledby="jornada-docente-title">
    <header><span className="prototype-carreira-section-icon"><i className="pi pi-clock" aria-hidden="true" /></span><div><h2 id="jornada-docente-title">Configuração da Jornada Docente</h2><p>Configure a hora-aula e a vigência da jornada docente.</p></div></header>
    <div className="prototype-jornada-docente-body">
      <div className="prototype-jornada-docente-grid">
        <fieldset className="prototype-jornada-docente-duration"><legend>Duração da hora-aula <em>*</em></legend><div>{(['50', '60'] as const).map(duracao => <label key={duracao}><input type="radio" name="docente-duracao" value={duracao} required checked={value.duracao === duracao} onChange={() => onChange({...value,duracao,possuiHoraAtividade:false})} /><span>{duracao} minutos</span></label>)}</div><input type="hidden" data-rascunho-campo="docente-duracao" value={value.duracao} /></fieldset>
        <div className="prototype-jornada-docente-activity">{value.duracao === '50' && <><span className="prototype-jornada-docente-activity-label">Hora-atividade</span><label className="prototype-jornada-docente-flag"><input type="checkbox" data-rascunho-campo="docente-hora-atividade" checked={value.possuiHoraAtividade} onChange={e => onChange({...value,possuiHoraAtividade:e.target.checked})} /><span>Possui hora-atividade?</span></label></>}</div>
        <label className="prototype-ingresso-field"><span>Data de início da vigência <em>*</em></span><input type="date" required data-rascunho-campo="docente-inicio" value={value.inicio} onChange={e => onChange({...value,inicio:e.target.value})} /></label>
        <label className="prototype-ingresso-field"><span>Data de fim da vigência <em>*</em></span><input type="date" required min={value.inicio || undefined} data-rascunho-campo="docente-fim" value={value.fim} onChange={e => onChange({...value,fim:e.target.value})} /></label>
      </div>
      {value.duracao && <div className="prototype-jornada-docente-result" role="status">
        <i className="pi pi-info-circle" aria-hidden="true" /><span>{value.duracao === '60' ? "Hora-aula de 60 minutos. A configuração de hora-atividade não se aplica." : value.possuiHoraAtividade ? "Hora-atividade habilitada. O cálculo será realizado conforme a jornada do professor." : "Hora-atividade não habilitada para esta configuração."}</span>
      </div>}
      {value.inicio && value.fim && value.fim < value.inicio && <p role="alert">A data de fim da vigência deve ser igual ou posterior à data de início.</p>}
    </div>
  </section>;
}
