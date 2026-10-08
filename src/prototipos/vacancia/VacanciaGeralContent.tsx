import { Link, useParams } from "react-router-dom";
import "../cadastro/cadastroGeral.css";

const VACANCIA_BASE_PATH = "/prototipos/sigep/vacancia";

const modalidades = [
  { slug: "exoneracao", titulo: "Exoneração", descricao: "Registre a vacância por exoneração do cargo.", icone: "pi pi-user-minus" },
  { slug: "demissao", titulo: "Demissão", descricao: "Registre a vacância decorrente de demissão.", icone: "pi pi-times-circle" },
  { slug: "ascensao", titulo: "Ascensão", descricao: "Registre a vacância decorrente de ascensão.", icone: "pi pi-arrow-up" },
  { slug: "acesso", titulo: "Acesso", descricao: "Registre a vacância decorrente de acesso.", icone: "pi pi-arrow-right-arrow-left" },
  { slug: "transferencia", titulo: "Transferência", descricao: "Registre a vacância decorrente de transferência.", icone: "pi pi-send" },
  { slug: "readaptacao", titulo: "Readaptação", descricao: "Registre a vacância decorrente de readaptação.", icone: "pi pi-refresh" },
  { slug: "aposentadoria", titulo: "Aposentadoria", descricao: "Registre a vacância decorrente de aposentadoria.", icone: "pi pi-clock" },
  { slug: "posse-outro-cargo-inacumulavel", titulo: "Posse em outro cargo inacumulável", descricao: "Registre a vacância por posse em outro cargo inacumulável.", icone: "pi pi-briefcase" },
  { slug: "falecimento", titulo: "Falecimento", descricao: "Registre a vacância decorrente de falecimento.", icone: "pi pi-heart-fill" },
] as const;

export function VacanciaGeralContent() {
  const { modalidade } = useParams();
  const modalidadeSelecionada = modalidades.find((item) => item.slug === modalidade);

  if (modalidade && modalidadeSelecionada) {
    return (
      <main className="prototype-cadastro-geral">
        <header>
          <h1>{modalidadeSelecionada.titulo}</h1>
          <p>{modalidadeSelecionada.descricao}</p>
        </header>
        <section aria-label={`Vacância por ${modalidadeSelecionada.titulo}`}>
          <Link to={VACANCIA_BASE_PATH}>
            <i className="pi pi-arrow-left" aria-hidden="true" />
            <h2>Voltar para Vacância</h2>
            <p>Selecione outra modalidade de vacância.</p>
            <span>Voltar <i className="pi pi-arrow-right" aria-hidden="true" /></span>
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="prototype-cadastro-geral">
      <header>
        <h1>Vacância</h1>
        <p>Selecione a modalidade de vacância que deseja registrar ou consultar.</p>
      </header>
      <section aria-label="Modalidades de Vacância">
        {modalidades.map((modalidadeItem) => (
          <Link key={modalidadeItem.slug} to={`${VACANCIA_BASE_PATH}/${modalidadeItem.slug}`}>
            <i className={modalidadeItem.icone} aria-hidden="true" />
            <h2>{modalidadeItem.titulo}</h2>
            <p>{modalidadeItem.descricao}</p>
            <span>Acessar <i className="pi pi-arrow-right" aria-hidden="true" /></span>
          </Link>
        ))}
      </section>
    </main>
  );
}
