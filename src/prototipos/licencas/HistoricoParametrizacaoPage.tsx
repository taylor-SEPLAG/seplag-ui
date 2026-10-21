import { Link, useNavigate, useParams } from 'react-router-dom';
import { Ambiente } from './AmbienteLicencas';
import { HistoricoEvento } from './HistoricoEvento';
import { BASE_LICENCAS, carregarEventos } from './model';

export function HistoricoParametrizacaoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const evento = carregarEventos().find(item => item.id === id);

  return <Ambiente titulo="Histórico de Alterações">
    <Link to={BASE_LICENCAS}>Voltar para parametrização</Link>
    {evento
      ? <HistoricoEvento evento={evento} fechar={() => navigate(BASE_LICENCAS)} />
      : <p role="alert">Ocorrência não encontrada.</p>}
  </Ambiente>;
}
