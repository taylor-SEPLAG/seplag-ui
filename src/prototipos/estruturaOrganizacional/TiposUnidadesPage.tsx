import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { BadgeSeplag } from "@componentes/Badge";
import { BotaoLimparFiltroSeplag } from "@componentes/Botao";
import { BreadcrumbSeplag } from "@componentes/Breadcrumb";
import { CardSeplag } from "@componentes/Card";
import { DropdownFieldSeplag, RadioButtonFieldSeplag, TextAreaFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
import { PanelSeplag } from "@componentes/PanelSeplag";
import { ModalSeplag } from "@componentes/Modal";
import { TablePaginadoSeplag, type ColumnMetaSeplag } from "@componentes/TablePaginado";
import type { ResultsSeplag } from "@interfaces/Results";
import { menuGestaoPessoas, PrototypeSystemPage } from "../PrototiposPage";
import { gravarTiposUnidades, lerTiposUnidades, type SituacaoTipoUnidadeEstrutural, type TipoUnidadeEstrutural } from "./tiposUnidadesStore";
import "./tiposUnidades.css";
import "./tiposUnidadesList.css";

type SituacaoTipoUnidade = SituacaoTipoUnidadeEstrutural;
type TipoUnidadeRow = TipoUnidadeEstrutural;

interface TipoUnidadeFiltro {
  pesquisa: string;
  situacao?: SituacaoTipoUnidade;
}

const situacaoOptions = [
  { label: "Ativo", value: "ATIVO" },
  { label: "Inativo", value: "INATIVO" },
];

export function PrototiposTiposUnidadesPage() {
  const [registros, setRegistros] = useState(lerTiposUnidades);
  const [modalCadastro, setModalCadastro] = useState(false);
  const [pagina, setPagina] = useState(0);
  const registrosPorPagina = 10;
  const { control, reset, watch } = useForm<TipoUnidadeFiltro>({
    defaultValues: { pesquisa: "", situacao: "ATIVO" },
  });
  const { control: cadastroControl, reset: resetCadastro, handleSubmit } = useForm<TipoUnidadeCadastroForm>({
    defaultValues: { nome: "", descricao: "", situacao: "ATIVO" },
  });
  const fecharCadastro = () => {
    setModalCadastro(false);
    resetCadastro({ nome: "", descricao: "", situacao: "ATIVO" });
  };
  const cadastrarTipo = handleSubmit((form) => {
    const nome = form.nome.trim();
    if (!nome) return;
    setRegistros((atuais) => {
      const atualizados = [...atuais, {
      id: Math.max(0, ...atuais.map((item) => item.id)) + 1,
      nome,
      descricao: form.descricao.trim(),
      situacao: form.situacao,
      }];
      gravarTiposUnidades(atualizados);
      return atualizados;
    });
    fecharCadastro();
  });
  const filtros = watch();
  const pesquisa = filtros.pesquisa.trim().toLocaleLowerCase("pt-BR");
  const filtrados = registros.filter((item) =>
    (!pesquisa || item.nome.toLocaleLowerCase("pt-BR").includes(pesquisa) || item.descricao.toLocaleLowerCase("pt-BR").includes(pesquisa)) &&
    (!filtros.situacao || item.situacao === filtros.situacao),
  );

  useEffect(() => setPagina(0), [filtros.pesquisa, filtros.situacao]);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / registrosPorPagina));
  const paginaAtual = Math.min(pagina, totalPaginas - 1);
  const content = filtrados.slice(paginaAtual * registrosPorPagina, (paginaAtual + 1) * registrosPorPagina);
  const data: ResultsSeplag<TipoUnidadeRow> = {
    content,
    last: paginaAtual + 1 >= totalPaginas,
    totalPages: totalPaginas,
    pageActual: paginaAtual,
    sizePage: registrosPorPagina,
    totalRecords: filtrados.length,
    size: registrosPorPagina,
    number: paginaAtual,
    first: paginaAtual === 0,
    numberOfElements: content.length,
    empty: content.length === 0,
  };

  const columns: ColumnMetaSeplag<TipoUnidadeRow>[] = [
    { field: "nome", header: "Tipo de unidade" },
    { field: "descricao", header: "Descrição" },
    {
      header: "Situação",
      body: (row) => <BadgeSeplag label={row.situacao === "ATIVO" ? "Ativo" : "Inativo"} color={row.situacao === "ATIVO" ? "#00843d" : "#6b7280"} bg={row.situacao === "ATIVO" ? "#e2f3e8" : "#f1f3f5"} border="transparent" size="md" />,
    },
  ];

  return (
    <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
      <div className="prototype-page-content prototype-page-content--white tipos-unidades-list-page">
        <CardSeplag
          title="Tipos de Unidades"
          cols="12"
          cardHeaderClassNames="prototype-carreira-card"
          headerNavigation={<BreadcrumbSeplag divided items={[{ label: "Cadastro" }, { label: "Estrutura Organizacional" }, { label: "Tipos de Unidades" }]} />}
        >
          <div className="prototype-category-filters prototype-carreira-filters grid">
            <TextFieldSeplag name="pesquisa" control={control} label="Tipo de unidade" placeholder="Digite o nome ou a descrição" cols="12 6 7" getFormErrorMessage={() => null} />
            <DropdownFieldSeplag name="situacao" control={control} label="Situação" placeholder="Selecione a situação" cols="12 6 3" options={situacaoOptions} optionLabel="label" optionValue="value" showClear getFormErrorMessage={() => null} />
            <div className="prototype-category-clear col-12 md:col-6 lg:col-2">
              <BotaoLimparFiltroSeplag type="button" label="Limpar" icon="pi pi-refresh" onClick={() => reset({ pesquisa: "", situacao: undefined })} />
            </div>
          </div>
          <div className="tipos-unidades-list-table">
            <TablePaginadoSeplag
              dataKey="id"
              data={data}
              rows={registrosPorPagina}
              rowsPerPage={[registrosPorPagina]}
              columns={columns}
              lazy
              paginator
              selectionMode={null}
              hasEventoAcao
              handleAdicionar={() => setModalCadastro(true)}
              handleView={() => {}}
              handleEdit={() => {}}
              handleDelete={() => {}}
              handleOnPageChange={(event) => setPagina(Math.floor((event.first ?? 0) / (event.rows ?? registrosPorPagina)))}
            />
          </div>
        </CardSeplag>
        <ModalSeplag visible={modalCadastro} titulo="Cadastrar Tipo de Unidade" fechar={fecharCadastro} labelFechar="Cancelar" labelAcao="Salvar" funcAcao={cadastrarTipo} tamanho="850px">
          <div className="col-12 tipos-unidades-register-content">
            <PanelSeplag title="Dados do tipo" description="Cadastre somente a classificação da unidade. A posição hierárquica será definida no organograma." className="tipos-unidades-register-panel">
              <div className="grid tipos-unidades-register-fields">
                <div className="col-12 lg:col-9">
                  <TextFieldSeplag name="nome" control={cadastroControl} label="Nome do tipo" placeholder="Ex.: Superintendência" cols="12" required maxLength={150} getFormErrorMessage={() => null} />
                  <small className="tipos-unidades-field-help">Utilize a denominação institucional do tipo de unidade.</small>
                </div>
                <div className="col-12 lg:col-3 tipos-unidades-situacao-field">
                  <RadioButtonFieldSeplag name="situacao" control={cadastroControl} label="Situação" cols="12" options={[{ label: "Ativo", value: "ATIVO" }, { label: "Inativo", value: "INATIVO" }]} getFormErrorMessage={() => null} />
                </div>
                <div className="col-12">
                  <TextAreaFieldSeplag name="descricao" control={cadastroControl} label="Descrição" placeholder="Informe uma breve descrição, quando necessário." cols="12" rows={4} maxLength={500} getFormErrorMessage={() => null} />
                  <small className="tipos-unidades-field-help">Campo opcional. Não utilize este campo para definir regras de hierarquia.</small>
                </div>
                <div className="col-12 tipos-unidades-register-note"><strong>Importante:</strong> este cadastro não define nível, unidade superior ou posição no organograma. Essas relações serão configuradas na montagem da estrutura organizacional.</div>
              </div>
            </PanelSeplag>
          </div>
        </ModalSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

interface TipoUnidadeCadastroForm {
  nome: string;
  descricao: string;
  situacao: "ATIVO" | "INATIVO";
}

export function PrototiposTipoUnidadeCadastroPage() {
  return <Navigate to="/prototipos/sigep/gestao/cadastro/estrutura-organizacional/tipos-unidades" replace />;
}
