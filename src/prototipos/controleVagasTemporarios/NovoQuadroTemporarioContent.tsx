import { useForm } from "react-hook-form";
import { DateFieldSeplag } from "../../componentes/Fields";
import { BadgeSeplag } from "../../componentes/Badge";
import { calcularStatusOperacionalVigenciaSeplag, validarSituacaoVigenciaSeplag } from "../../componentes/SituacaoVigencia";
import { BotaoSalvarSeplag, BotaoVoltarSeplag } from "../../componentes/Botao";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";
import { useControlePssStore } from "../controlePss/controlePssStore";
import { REGIMES_JURIDICOS, TIPOS_VINCULO, SITUACOES_CERTAME } from "../controlePss/certame/dominios";
import { salvarQuadroTemporario, seletivoTemporario, type QuadroTemporarioCadastro } from "./novoQuadroTemporarioStore";
import "./novoQuadroTemporario.css";

export function NovoQuadroTemporarioContent() {
 const navigate = useNavigate();
 const { control, watch, reset } = useForm<{ dataAtivacao:string }>({ defaultValues:{ dataAtivacao:"" } });
 const dataAtivacao = watch("dataAtivacao");
 const agendado = calcularStatusOperacionalVigenciaSeplag({ situacao:"ATIVO", dataAtivacao }).startsWith("AGENDADO");
 const { certames } = useControlePssStore();
 const [certameId, setCertameId] = useState<string>("");
 const [erro, setErro] = useState("");
 const [salvo, setSalvo] = useState<QuadroTemporarioCadastro | null>(null);
 const seletivos = certames.filter(seletivoTemporario);
 const certame = seletivos.find(item => item.id === certameId);
 const cargos = certame?.cargos ?? [];
 const voltar = () => navigate("/prototipos/sigep/controle-vagas/temporarios/quadro-autorizado");
 const salvar = (event: FormEvent) => {
  event.preventDefault();
  if (!certame || !cargos.length) { setErro("Selecione um processo seletivo com cargos cadastrados para criar o quadro."); return; }
  const errosVigencia = validarSituacaoVigenciaSeplag({ situacao:"ATIVO", dataAtivacao });
  if (!dataAtivacao || errosVigencia.length) { setErro(errosVigencia.join(" ") || "Informe a data de início."); return; }
  try { setSalvo(salvarQuadroTemporario(certame, "", dataAtivacao)); setErro(""); }
  catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível salvar o quadro. Tente novamente."); }
 };
 return <main className="novo-quadro-temporario">
  <header><h1>Novo Quadro Temporário</h1><p>Vincule o quadro às vagas de um processo seletivo cadastrado.</p></header>
  {salvo ? <section className="nqt-card" role="status"><h2>Quadro {salvo.codigo} criado com sucesso</h2><p>{salvo.certame.nomeEdital} · {salvo.cargos.length} cargo(s)</p><p>Todos os cargos do seletivo foram incluídos, com suas respectivas regras de vagas.</p><button type="button" onClick={() => { setSalvo(null); reset(); setCertameId(""); }}>Cadastrar outro quadro</button><button type="button" onClick={voltar}>Voltar</button></section> : <form onSubmit={salvar}>
   {erro && <p className="nqt-error" role="alert">{erro}</p>}
   <section className="nqt-card"><header className="nqt-section-header"><i className="pi pi-file" aria-hidden="true" /><div><h2>Seletivo de origem</h2><p>Selecione o processo seletivo que fundamenta o quadro temporário.</p></div></header><div className="nqt-section-body"><label htmlFor="nqt-seletivo">Processo Seletivo *</label>
    <Dropdown inputId="nqt-seletivo" value={certameId} options={seletivos.map(item => ({ value:item.id, label:[item.numeroConcurso + "/" + item.anoConcurso, item.nomeEdital, item.setor].join(" — ") }))} filter showClear placeholder="Selecione o processo seletivo" emptyMessage="Nenhum PSS temporário cadastrado" emptyFilterMessage="Nenhum seletivo encontrado" onChange={event => { setCertameId(event.value ?? ""); setErro(""); }} />
    {!seletivos.length && <p>Nenhum processo seletivo com vínculo temporário está cadastrado no Controle de Certame.</p>}
    {certame && <dl className="nqt-grid"><Dado label="Edital" value={certame.nomeEdital} /><Dado label="Número do edital" value={certame.numeroEditalOrgao} /><Dado label="Órgão responsável" value={certame.setor} /><Dado label="Tipo de vínculo" value={TIPOS_VINCULO.find(item => item.value === certame.tipoVinculo)?.label} /><Dado label="Regime jurídico" value={REGIMES_JURIDICOS.find(item => item.value === certame.regimeJuridico)?.label} /><Dado label="Situação" value={SITUACOES_CERTAME.find(item => item.value === certame.situacaoAtual)?.label} /><Dado label="Publicação do edital" value={certame.dataPublicacaoEdital} /><Dado label="Validade do seletivo" value={certame.dataValidade} /></dl>}
   </div></section>
   <section className="nqt-card"><header className="nqt-section-header"><i className="pi pi-briefcase" aria-hidden="true" /><div><h2>Cargos e vagas do seletivo</h2><p>Cargos e quantitativos registrados no edital selecionado.</p></div></header><div className="nqt-section-body"><p>Todos os cargos do seletivo integram este quadro. O cargo de cada pessoa será definido no ingresso.</p>
    {!certame ? <p>Selecione um processo seletivo para consultar seus cargos.</p> : !cargos.length ? <p role="status">Este seletivo ainda não possui cargos cadastrados.</p> : cargos.map(cargo => <article className="nqt-cargo" key={cargo.id}>
     <h3>{cargo.cargoNome}</h3>
     <dl className="nqt-grid"><Dado label="Referência no seletivo" value={cargo.id} /><Dado label="Jornada" value={cargo.jornada} /><Dado label="Polo" value={cargo.polo} /><Dado label="Órgão de destino" value={cargo.orgaoDestino} /><Dado label="Municípios" value={cargo.cidades?.join(", ")} /><Dado label="Vagas ofertadas no edital" value={cargo.quantidadeVagas} /><Dado label="Possui cadastro reserva" value={cargo.aceitaCadastroReserva ? "Sim" : "Não"} /><Dado label="Quantidade de cadastro reserva" value={cargo.aceitaCadastroReserva ? cargo.quantidadeCadastroReserva : "Não se aplica"} /><Dado label="Forma de controle" value={cargo.aceitaCadastroReserva ? "Sem limite quantitativo" : "Limitado a " + cargo.quantidadeVagas + " vagas"} /></dl>
     <h4>Reservas por cota</h4>{cargo.reservasCota.length ? <ul>{cargo.reservasCota.map(item => <li key={item.id}>{item.tipo}: {item.quantidade} vagas</li>)}</ul> : <p>Não há reservas por cota cadastradas para este cargo.</p>}
    </article>)}
   </div></section>
   <section className="nqt-card"><header className="nqt-section-header"><i className="pi pi-calendar" aria-hidden="true" /><div><h2>Vigência</h2><p>Informe a situação temporal da autorização utilizando o padrão do sistema.</p></div></header>
    <div className="nqt-section-body nqt-vigencia">
     <DateFieldSeplag name="dataAtivacao" control={control} label="Data de início" required cols="12" getFormErrorMessage={() => null} />
     <div className="nqt-situacao" aria-live="polite"><i className={"pi " + (agendado ? "pi-clock" : "pi-check-circle")} aria-hidden="true" /><div><span>Situação *</span><div><BadgeSeplag label={agendado ? "Agendado" : "Ativo"} color={agendado ? "#8a5a00" : "#00843d"} bg={agendado ? "#fff3d6" : "#dff3e8"} size="sm" fontWeight /></div><small>{agendado ? "A autorização ficará programada para a data informada." : "A autorização passa a valer a partir da data informada."}</small></div></div>
    </div>
   </section>
   <footer><BotaoVoltarSeplag type="button" label="Cancelar" icon="pi pi-times" onClick={voltar} /><BotaoSalvarSeplag type="submit" label="Criar Quadro Temporário" disabled={!certame || !cargos.length} /></footer>
  </form>}
 </main>;
}
function Dado({ label, value }: { label:string; value?:string | number }) { return <div><dt>{label}</dt><dd>{value === undefined || value === "" ? "Não informado" : value}</dd></div>; }
