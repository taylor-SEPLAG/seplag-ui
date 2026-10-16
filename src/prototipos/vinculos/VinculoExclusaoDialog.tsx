import { useState } from 'react';
import { ModalSeplag } from '../../componentes/Modal';
import { excluirVinculo, impedimentosExclusao } from './vinculoAdministracao';
import { useUsuarioVinculos } from './vinculoSessao';
import type { Vinculo } from './vinculoDados';

export function VinculoExclusaoDialog({vinculo,fechar,concluido}: {vinculo:Vinculo;fechar:()=>void;concluido:()=>void}) {
  const usuario = useUsuarioVinculos();
  const [justificativa,setJustificativa] = useState('');
  const [erro,setErro] = useState('');
  let motivos: string[];
  try {motivos=impedimentosExclusao(vinculo.id);} catch (e) {motivos=[(e as Error).message];}
  const bloqueado = motivos.length > 0;
  return <ModalSeplag visible titulo={bloqueado ? 'Não é possível excluir o vínculo' : 'Confirmar Exclusão do Vínculo'} fechar={fechar} hideFooter tamanho="700px">
    <div className="col-12 v2v-delete-dialog">
    {bloqueado ? <><p>O vínculo selecionado possui registros ou dependências associadas que impedem sua exclusão. Consulte as informações relacionadas ou utilize o procedimento adequado de correção ou encerramento.</p><ul>{motivos.map(m => <li key={m}>{m}</li>)}</ul><button type="button" className="v2v-secondary" onClick={fechar}>Fechar</button></> : <>
      <dl className="v2v-delete-identification"><div><dt>Nome do Servidor</dt><dd>{vinculo.nome}</dd></div><div><dt>Matrícula</dt><dd>{vinculo.matricula}</dd></div><div><dt>Nº do Vínculo</dt><dd>{vinculo.numero}</dd></div><div><dt>Tipo de Vínculo</dt><dd>{vinculo.tipo}</dd></div></dl>
      <label className="v2v-justificativa">Justificativa da Exclusão<textarea value={justificativa} onChange={e => setJustificativa(e.target.value)} required /></label>
      {erro && <p role="alert">{erro}</p>}
      <div className="v2v-form-actions"><button type="button" className="v2v-secondary" onClick={fechar}>Cancelar</button><button type="button" className="v2v-primary v2v-action-delete" disabled={!justificativa.trim() || !usuario?.excluir} onClick={() => {try {excluirVinculo(vinculo.id,justificativa);concluido();} catch (e) {setErro((e as Error).message);}}}>Confirmar Exclusão</button></div>
    </>}
    </div>
  </ModalSeplag>;
}
