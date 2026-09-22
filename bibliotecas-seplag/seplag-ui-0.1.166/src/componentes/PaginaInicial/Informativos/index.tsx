import {
  DefaultPermissionsInformativoSeplag,
  usePaginaInicialPermissionsSeplag,
} from "../permissions";
import {
  useAtualizarInformativoMutation,
  useCriarInformativoMutation,
  useDeletarInformativoMutation,
  useListarInformativosPaginadoQuery,
} from "./informativosApi";
import type { InformativoResponse, TipoInformativo } from "./types";

import { useMemo, useState } from "react";
import { useToastSeplag } from "../../../hooks/toast";
import { BotaoAdicionarSeplag, BotaoEditarSeplag, BotaoRemoverSeplag, BotaoSeplag } from "../../Botao";
import { TextAreaFieldSeplag, TextFieldSeplag } from "../../Fields";
import { ModalSeplag } from "../../Modal";
import { ModalDeleteSeplag } from "../../ModalDelete";
import style from "./style.module.css";

type TipoInformativoVisual = TipoInformativo;

type InformativoForm = {
  titulo: string;
  texto: string;
  tipoInformativo: TipoInformativoVisual;
};

function getModalTitle(isEditing: boolean) {
  return isEditing ? "Editar Informativo" : "Novo Informativo";
}

function getSubmitLabel(isSaving: boolean, isEditing: boolean) {
  if (isSaving) {
    return "Salvando...";
  }

  return isEditing ? "Salvar" : "Adicionar";
}

const tipoInformativoOptions: Array<{
  value: TipoInformativoVisual;
  label: string;
  icon: string;
}> = [
  { value: "ALERTA", label: "Alerta", icon: "pi pi-exclamation-triangle" },
  { value: "INFORMACAO", label: "Informação", icon: "pi pi-info-circle" },
  { value: "AVISO", label: "Aviso", icon: "pi pi-thumbtack" },
  { value: "IMPORTANTE", label: "Importante", icon: "pi pi-star" },
];

const emptyForm: InformativoForm = {
  titulo: "",
  texto: "",
  tipoInformativo: "INFORMACAO",
};

function getTipoInformativoVisual(tipo: TipoInformativo): TipoInformativoVisual {
  return tipoInformativoOptions.some((option) => option.value === tipo) ? tipo : "INFORMACAO";
}

function getTipoInformativoIcon(tipo: TipoInformativo) {
  const tipoVisual = getTipoInformativoVisual(tipo);
  return (
    tipoInformativoOptions.find((option) => option.value === tipoVisual)?.icon ??
    "pi pi-info-circle"
  );
}

function formatPublicationDate(date: string) {
  return date || "-";
}

type TipoInformativoOptionButtonProps = {
  icon: string;
  label: string;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
};

type TipoInformativoOptionButtonPropsWithId = TipoInformativoOptionButtonProps & {
  testId: string;
};

function TipoInformativoOptionButton({
  icon,
  label,
  selected,
  disabled,
  onSelect,
  testId,
}: Readonly<TipoInformativoOptionButtonPropsWithId>) {
  return (
    <BotaoSeplag
      unstyled
      type="button"
      id={testId}
      data-testid={testId}
      className={`${style.tipoInformativoOption} ${selected ? style.tipoInformativoOptionSelected : ""}`}
      onClick={onSelect}
      disabled={disabled}
    >
      <i className={icon} aria-hidden="true" />
      <span>{label}</span>
    </BotaoSeplag>
  );
}

export function Informativos() {
  const permissions = usePaginaInicialPermissionsSeplag(DefaultPermissionsInformativoSeplag);
  const { toastSucesso } = useToastSeplag();
  const { data, isFetching } = useListarInformativosPaginadoQuery();
  const informativos = useMemo(() => data?.content ?? [], [data?.content]);
  const [criarInformativo, { isLoading: isCreating }] = useCriarInformativoMutation();
  const [atualizarInformativo, { isLoading: isUpdating }] = useAtualizarInformativoMutation();
  const [deletarInformativo] = useDeletarInformativoMutation();
  const [form, setForm] = useState<InformativoForm>(emptyForm);
  const [editingInformativoId, setEditingInformativoId] = useState<number | null>(null);
  const [informativoPendenteExclusao, setInformativoPendenteExclusao] =
    useState<InformativoResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isSaving = isCreating || isUpdating;
  const isEditing = editingInformativoId !== null;
  const hasFinishedFetching = isFetching === false;
  const hasEmptyList = informativos.length === 0;
  const modalTitle = getModalTitle(isEditing);
  const submitLabel = getSubmitLabel(isSaving, isEditing);

  const openCreateModal = () => {
    if (!permissions.podeIncluir) {
      return;
    }

    setForm(emptyForm);
    setEditingInformativoId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (informativo: InformativoResponse) => {
    if (!permissions.podeEditar) {
      return;
    }

    setForm({
      titulo: informativo.titulo,
      texto: informativo.texto,
      tipoInformativo: getTipoInformativoVisual(informativo.tipo),
    });
    setEditingInformativoId(informativo.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingInformativoId(null);
    setForm(emptyForm);
  };

  const saveInformativo = async () => {
    const titulo = form.titulo.trim();
    const texto = form.texto.trim();

    if (titulo.length === 0 || texto.length === 0) {
      return;
    }

    const body = {
      titulo,
      tipo: form.tipoInformativo,
      texto,
    };

    if (editingInformativoId && !permissions.podeEditar) {
      return;
    }

    if (!editingInformativoId && !permissions.podeIncluir) {
      return;
    }

    try {
      if (editingInformativoId) {
        await atualizarInformativo({ id: editingInformativoId, body }).unwrap();
        toastSucesso("Informativo atualizado com sucesso!");
      } else {
        await criarInformativo(body).unwrap();
        toastSucesso("Informativo cadastrado com sucesso!");
      }

      closeModal();
    } catch {
      // O apiSlice ja exibe a mensagem de erro padrao do sistema.
    }
  };

  const confirmarExclusao = async () => {
    if (!informativoPendenteExclusao) {
      return;
    }

    if (!permissions.podeDeletar) {
      return;
    }

    const informativo = informativoPendenteExclusao;
    setInformativoPendenteExclusao(null);

    try {
      await deletarInformativo(informativo.id).unwrap();
      toastSucesso("Informativo removido com sucesso!");
    } catch {
      // O apiSlice ja exibe a mensagem de erro padrao do sistema.
    }
  };

  const renderInformativo = (informativo: InformativoResponse) => {
    const tipoVisual = getTipoInformativoVisual(informativo.tipo);
    const hasCardActions = permissions.podeEditar || permissions.podeDeletar;

    const informativoTestId = `informativo-${informativo.id}`;

    return (
      <article
        className={style.informativoCard}
        key={informativo.id}
        id={informativoTestId}
        data-testid={informativoTestId}
      >
        <div className={style.informativoHeading}>
          <i
            className={`${getTipoInformativoIcon(informativo.tipo)} ${style[tipoVisual.toLowerCase()]}`}
            aria-hidden="true"
          />
          <h2>{informativo.titulo}</h2>
        </div>

        <time>Publicado em: {formatPublicationDate(informativo.dataPublicacao)}</time>
        <p>{informativo.texto}</p>

        {hasCardActions ? (
          <div className={style.cardActions}>
            {permissions.podeEditar ? (
              <BotaoEditarSeplag
                id={`${informativoTestId}-editar`}
                data-testid={`${informativoTestId}-editar`}
                onClick={() => openEditModal(informativo)}
              />
            ) : null}
            {permissions.podeDeletar ? (
              <BotaoRemoverSeplag
                id={`${informativoTestId}-remover`}
                data-testid={`${informativoTestId}-remover`}
                onClick={() => setInformativoPendenteExclusao(informativo)}
              />
            ) : null}
          </div>
        ) : null}
      </article>
    );
  };

  return (
    <section
      className={style.panel}
      aria-labelledby="informativos-title"
      id="informativos-panel"
      data-testid="informativos-panel"
    >
      <header className={style.panelHeader}>
        <div className={style.panelTitleGroup}>
          <i className="pi pi-clipboard" aria-hidden="true" />
          <h1 id="informativos-title">Informativos</h1>
        </div>
      </header>

      <div className={style.panelBody}>
        {permissions.podeIncluir ? (
          <BotaoAdicionarSeplag
            id="informativos-novo"
            data-testid="informativos-novo"
            label="Novo Informativo"
            className={style.primaryAction}
            style={{ width: "100%" }}
            onClick={openCreateModal}
          />
        ) : null}

        <div className={style.informativoList}>
          {isFetching ? <p className={style.feedbackText}>Carregando informativos...</p> : null}
          {hasFinishedFetching && hasEmptyList ? (
            <p className={style.feedbackText}>Nenhum informativo encontrado.</p>
          ) : null}
          {hasFinishedFetching ? informativos.map(renderInformativo) : null}
        </div>
      </div>

      <ModalSeplag
        id="informativos-modal"
        visible={isModalOpen}
        fechar={closeModal}
        titulo={modalTitle}
        labelFechar="Cancelar"
        labelAcao={submitLabel}
        funcAcao={() => void saveInformativo()}
      >
        <TextFieldSeplag
          name="titulo"
          label="Título"
          cols="12"
          value={form.titulo}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              titulo: value,
            }))
          }
          maxLength={200}
          required
        />

        <div className="col-12">
          <fieldset className={style.tipoInformativoFieldset}>
            <legend className={style.tipoInformativoLegend}>Tipo de Informativo</legend>
            <div className={style.tipoInformativoGrid}>
              {tipoInformativoOptions.map((option) => (
                <TipoInformativoOptionButton
                  key={option.value}
                  testId={`informativos-tipo-${option.value.toLowerCase()}`}
                  icon={option.icon}
                  label={option.label}
                  selected={form.tipoInformativo === option.value}
                  disabled={isSaving}
                  onSelect={() =>
                    setForm((current) => ({
                      ...current,
                      tipoInformativo: option.value,
                    }))
                  }
                />
              ))}
            </div>
          </fieldset>
        </div>

        <TextAreaFieldSeplag
          name="texto"
          label="Texto"
          cols="12"
          value={form.texto}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              texto: value,
            }))
          }
          rows={4}
          maxLength={500}
          required
        />
      </ModalSeplag>

      {informativoPendenteExclusao ? (
        <ModalDeleteSeplag
          id={`informativo-${informativoPendenteExclusao.id}-delete-modal`}
          visible
          onCancel={() => setInformativoPendenteExclusao(null)}
          onConfirm={() => void confirmarExclusao()}
          message={`Deseja realmente remover o informativo "${informativoPendenteExclusao.titulo}"?`}
        />
      ) : null}
    </section>
  );
}
