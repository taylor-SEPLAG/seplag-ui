import { BadgeSeplag } from "../../Badge";
import {
  BotaoAdicionarSeplag,
  BotaoIconSeplag,
  BotaoRemoverSeplag,
  BotaoSalvarSeplag,
  BotaoSeplag,
  BotaoVoltarSeplag,
} from "../../Botao";
import { DateTimeFieldSeplag as DateTimeField } from "../../Fields";
import {
  DefaultPermissionsCicloCronogramaSeplag,
  usePaginaInicialPermissionsSeplag,
} from "../permissions";
import {
  useAtualizarCicloPagamentoMutation,
  useCriarCicloPagamentoMutation,
  useDeletarCicloPagamentoMutation,
  useListarCiclosPagamentoQuery,
} from "./cronogramaApi";
import {
  mapCicloPagamentoToCronograma,
  mapCronogramaToCicloPagamentoRequest,
} from "./cronogramaMappers";
import type {
  CicloPagamentoResponse,
  CronogramaData,
  EventoCronograma,
  EventoCronogramaStatus,
  SecaoCronograma,
} from "./types";

import type { DragEvent } from "react";
import { useEffect, useState } from "react";
import { useToastSeplag } from "../../../hooks/toast";
import { ModalDeleteSeplag } from "../../ModalDelete";
import style from "./style.module.css";

type CronogramaProps = {
  onConfigModeChange?: (isConfiguring: boolean) => void;
};

type ExclusaoPendente =
  | {
      tipo: "ciclo";
      cicloId: number;
      titulo: string;
    }
  | {
      tipo: "secao";
      secaoId: number;
      titulo: string;
    }
  | {
      tipo: "evento";
      secaoId: number;
      eventoId: number;
    };

const initialCronograma: CronogramaData = {
  titulo: "Ciclo de pagamento",
  secoes: [],
};

function getExclusaoMessage(exclusaoPendente: ExclusaoPendente | null) {
  if (exclusaoPendente === null) {
    return undefined;
  }

  if (exclusaoPendente.tipo === "ciclo") {
    return `Deseja realmente remover o ciclo "${exclusaoPendente.titulo}"?`;
  }

  if (exclusaoPendente.tipo === "secao") {
    return `Deseja realmente remover a seção '${exclusaoPendente.titulo}'? Todos os eventos vinculados a esta seção também serão removidos permanentemente. Esta ação não poderá ser desfeita.`;
  }

  return "Deseja realmente remover o evento selecionado?";
}

const sortByOrdem = <T extends { ordem: number }>(items: T[]) =>
  [...items].sort((a, b) => a.ordem - b.ordem);

const normalizeOrder = <T extends { ordem: number }>(items: T[]) =>
  items.map((item, index) => ({ ...item, ordem: index + 1 }));

const reorderById = <T extends { id: number; ordem: number }>(
  items: T[],
  draggedId: number,
  targetId: number,
) => {
  if (draggedId === targetId) {
    return items;
  }

  const orderedItems = sortByOrdem(items);
  const draggedIndex = orderedItems.findIndex((item) => item.id === draggedId);
  const targetIndex = orderedItems.findIndex((item) => item.id === targetId);

  if (draggedIndex < 0 || targetIndex < 0) {
    return items;
  }

  const [draggedItem] = orderedItems.splice(draggedIndex, 1);
  orderedItems.splice(targetIndex, 0, draggedItem);

  return normalizeOrder(orderedItems);
};

let temporaryIdSequence = 0;

function createTemporaryId() {
  temporaryIdSequence -= 1;
  return temporaryIdSequence;
}

const emptyEvento = (ordem: number): EventoCronograma => ({
  id: createTemporaryId(),
  ordem,
  dataInicio: "",
  dataFim: "",
  descricao: "",
  status: "agendado",
});

function getNextOrder(items: Array<{ ordem: number }>) {
  return Math.max(0, ...items.map((item) => item.ordem)) + 1;
}

function hasRequiredEventFields(evento: EventoCronograma) {
  return (
    DateTimeField.parseValue(evento.dataInicio) !== null &&
    DateTimeField.parseValue(evento.dataFim) !== null &&
    evento.descricao.trim().length > 0
  );
}

function hasInvalidDateRange(evento: EventoCronograma) {
  const dataInicio = DateTimeField.parseValue(evento.dataInicio);
  const dataFim = DateTimeField.parseValue(evento.dataFim);

  return dataInicio !== null && dataFim !== null && dataFim < dataInicio;
}

function getCronogramaValidationMessage(draft: CronogramaData) {
  if (!draft.titulo.trim()) {
    return "O título do ciclo é obrigatório.";
  }

  if (draft.secoes.some((secao) => !secao.titulo.trim())) {
    return "Toda seção deverá possuir um título informado.";
  }

  const eventos = draft.secoes.flatMap((secao) => secao.eventos);

  if (eventos.some((evento) => !hasRequiredEventFields(evento))) {
    return "Data início, data fim e descrição são obrigatórios em todos os eventos.";
  }

  if (eventos.some(hasInvalidDateRange)) {
    return "A data/hora final deverá ser maior ou igual à data/hora inicial.";
  }

  return null;
}

function normalizeCronogramaDraft(draft: CronogramaData): CronogramaData {
  return {
    ...draft,
    titulo: draft.titulo.trim(),
    secoes: normalizeOrder(sortByOrdem(draft.secoes)).map((secao) => ({
      ...secao,
      titulo: secao.titulo.trim(),
      eventos: normalizeOrder(sortByOrdem(secao.eventos)),
    })),
  };
}

function formatTimelineDate(dataInicio: string, dataFim: string) {
  if (!dataInicio && !dataFim) {
    return "";
  }

  const [inicioData] = dataInicio.split(" ");
  const [fimData, fimHora] = dataFim.split(" ");

  return `${inicioData.slice(0, 5)} - ${fimData.slice(0, 5)} - ${fimHora ?? ""}`.trim();
}

const statusEventoLabel: Record<EventoCronogramaStatus, string> = {
  agendado: "Agendado",
  emAndamento: "Em Andamento",
  concluido: "Concluído",
};

const statusEventoVariant: Record<EventoCronogramaStatus, "warning" | "info" | "success"> = {
  agendado: "warning",
  emAndamento: "info",
  concluido: "success",
};

function hasAnyPermission(...permissions: boolean[]) {
  return permissions.some(Boolean);
}

function getEventoStatus(evento: EventoCronograma): EventoCronogramaStatus {
  const dataInicio = DateTimeField.parseValue(evento.dataInicio);
  const dataFim = DateTimeField.parseValue(evento.dataFim);

  if (!dataInicio || !dataFim) {
    return "agendado";
  }

  const agora = new Date();

  if (agora > dataFim) {
    return "concluido";
  }

  if (agora >= dataInicio && agora <= dataFim) {
    return "emAndamento";
  }

  return "agendado";
}

function getCronogramaFromCiclos(ciclosPagamento: CicloPagamentoResponse[] | undefined) {
  const [cicloPagamento] = ciclosPagamento ?? [];

  return cicloPagamento ? mapCicloPagamentoToCronograma(cicloPagamento) : initialCronograma;
}

function EmptyTimeline({ hasSections }: Readonly<{ hasSections: boolean }>) {
  if (hasSections) {
    return null;
  }

  return <p className={style.emptyTimeline}>Nenhum cronograma cadastrado.</p>;
}

function canConfirmExclusao(
  canDelete: boolean,
  exclusaoPendente: ExclusaoPendente | null,
): exclusaoPendente is ExclusaoPendente {
  return canDelete && exclusaoPendente !== null;
}

function CronogramaDeleteModal({
  exclusaoPendente,
  onCancel,
  onConfirm,
}: Readonly<{
  exclusaoPendente: ExclusaoPendente | null;
  onCancel: () => void;
  onConfirm: () => void;
}>) {
  if (!exclusaoPendente) {
    return null;
  }

  return (
    <ModalDeleteSeplag
      id="cronograma-delete-modal"
      visible
      onCancel={onCancel}
      onConfirm={onConfirm}
      message={getExclusaoMessage(exclusaoPendente)}
    />
  );
}

type EventoField = keyof Pick<EventoCronograma, "dataInicio" | "dataFim" | "descricao">;

function updateSecaoTituloDraft(
  current: CronogramaData,
  secaoId: number,
  titulo: string,
): CronogramaData {
  return {
    ...current,
    secoes: current.secoes.map((secao) => (secao.id === secaoId ? { ...secao, titulo } : secao)),
  };
}

function updateEventoDraft(
  current: CronogramaData,
  secaoId: number,
  eventoId: number,
  field: EventoField,
  value: string,
): CronogramaData {
  return {
    ...current,
    secoes: current.secoes.map((secao) =>
      secao.id === secaoId
        ? {
            ...secao,
            eventos: secao.eventos.map((evento) =>
              evento.id === eventoId ? { ...evento, [field]: value } : evento,
            ),
          }
        : secao,
    ),
  };
}

function addEventoDraft(current: CronogramaData, secaoId: number): CronogramaData {
  return {
    ...current,
    secoes: current.secoes.map((secao) =>
      secao.id === secaoId
        ? {
            ...secao,
            eventos: [...secao.eventos, emptyEvento(getNextOrder(secao.eventos))],
          }
        : secao,
    ),
  };
}

function removeEventoDraft(
  current: CronogramaData,
  secaoId: number,
  eventoId: number,
): CronogramaData {
  return {
    ...current,
    secoes: current.secoes.map((secao) =>
      secao.id === secaoId
        ? {
            ...secao,
            eventos: normalizeOrder(secao.eventos.filter((evento) => evento.id !== eventoId)),
          }
        : secao,
    ),
  };
}

function addSecaoDraft(current: CronogramaData): CronogramaData {
  return {
    ...current,
    secoes: [
      ...current.secoes,
      {
        id: createTemporaryId(),
        ordem: getNextOrder(current.secoes),
        titulo: `Nova seção ${current.secoes.length + 1}`,
        marcador: current.secoes.length % 2 === 0 ? "azul" : "laranja",
        eventos: [],
      },
    ],
  };
}

function removeSecaoDraft(current: CronogramaData, secaoId: number): CronogramaData {
  return {
    ...current,
    secoes: normalizeOrder(current.secoes.filter((secao) => secao.id !== secaoId)),
  };
}

function reorderEventosDraft(
  current: CronogramaData,
  targetSecaoId: number,
  draggedEventoId: number,
  targetEventoId: number,
): CronogramaData {
  return {
    ...current,
    secoes: current.secoes.map((secao) =>
      secao.id === targetSecaoId
        ? {
            ...secao,
            eventos: reorderById(secao.eventos, draggedEventoId, targetEventoId),
          }
        : secao,
    ),
  };
}
export function Cronograma({ onConfigModeChange }: Readonly<CronogramaProps>) {
  const permissions = usePaginaInicialPermissionsSeplag(DefaultPermissionsCicloCronogramaSeplag);
  const canGerenciarCronograma = hasAnyPermission(
    permissions.podeIncluir,
    permissions.podeEditar,
    permissions.podeDeletar,
  );
  const { toastAtencao, toastSucesso } = useToastSeplag();
  const { data: ciclosPagamento } = useListarCiclosPagamentoQuery();
  const [criarCicloPagamento, { isLoading: isCreating }] = useCriarCicloPagamentoMutation();
  const [atualizarCicloPagamento, { isLoading: isUpdating }] = useAtualizarCicloPagamentoMutation();
  const [deletarCicloPagamento, { isLoading: isDeleting }] = useDeletarCicloPagamentoMutation();
  const isSaving = isCreating || isUpdating;
  const [cronograma, setCronograma] = useState<CronogramaData>(initialCronograma);
  const [draft, setDraft] = useState<CronogramaData>(initialCronograma);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [draggedSecaoId, setDraggedSecaoId] = useState<number | null>(null);
  const [draggedEvento, setDraggedEvento] = useState<{
    secaoId: number;
    eventoId: number;
  } | null>(null);
  const [exclusaoPendente, setExclusaoPendente] = useState<ExclusaoPendente | null>(null);

  useEffect(() => {
    if (isConfiguring) {
      return;
    }

    const cronogramaApi = getCronogramaFromCiclos(ciclosPagamento);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza o estado editável com a resposta da API.
    setCronograma(cronogramaApi);
    setDraft(cronogramaApi);
  }, [ciclosPagamento, isConfiguring]);

  const openConfig = () => {
    if (!canGerenciarCronograma) {
      return;
    }

    setDraft(structuredClone(cronograma));
    setIsConfiguring(true);
    onConfigModeChange?.(true);
  };

  const closeConfig = () => {
    setDraft(structuredClone(cronograma));
    setIsConfiguring(false);
    onConfigModeChange?.(false);
  };

  const saveConfig = async () => {
    if (!canGerenciarCronograma) {
      return;
    }

    const validationMessage = getCronogramaValidationMessage(draft);

    if (validationMessage !== null) {
      toastAtencao(validationMessage);
      return;
    }

    const normalizedDraft = normalizeCronogramaDraft(draft);

    try {
      const body = mapCronogramaToCicloPagamentoRequest(normalizedDraft);
      const cicloPagamento = normalizedDraft.id
        ? await atualizarCicloPagamento({
            id: normalizedDraft.id,
            body,
          }).unwrap()
        : await criarCicloPagamento(body).unwrap();
      const cronogramaSalvo = mapCicloPagamentoToCronograma(cicloPagamento);

      setCronograma(cronogramaSalvo);
      setDraft(cronogramaSalvo);
      setIsConfiguring(false);
      onConfigModeChange?.(false);
      toastSucesso("Cronograma salvo com sucesso!");
    } catch {
      // O apiSlice ja exibe a mensagem de erro padrao do sistema.
    }
  };

  const updateSecaoTitulo = (secaoId: number, titulo: string) => {
    setDraft((current) => updateSecaoTituloDraft(current, secaoId, titulo));
  };

  const updateEvento = (secaoId: number, eventoId: number, field: EventoField, value: string) => {
    setDraft((current) => updateEventoDraft(current, secaoId, eventoId, field, value));
  };

  const addEvento = (secaoId: number) => {
    setDraft((current) => addEventoDraft(current, secaoId));
  };

  const removeEvento = (secaoId: number, eventoId: number) => {
    setDraft((current) => removeEventoDraft(current, secaoId, eventoId));
  };

  const addSecao = () => {
    setDraft(addSecaoDraft);
  };

  const removeSecao = (secaoId: number) => {
    setDraft((current) => removeSecaoDraft(current, secaoId));
  };
  const solicitarExclusaoCiclo = () => {
    if (draft.id === undefined) {
      return;
    }

    setExclusaoPendente({
      tipo: "ciclo",
      cicloId: draft.id,
      titulo: draft.titulo,
    });
  };

  const solicitarExclusaoSecao = (secao: SecaoCronograma) => {
    setExclusaoPendente({
      tipo: "secao",
      secaoId: secao.id,
      titulo: secao.titulo,
    });
  };

  const solicitarExclusaoEvento = (secaoId: number, evento: EventoCronograma) => {
    setExclusaoPendente({
      tipo: "evento",
      secaoId,
      eventoId: evento.id,
    });
  };

  const confirmarExclusao = async () => {
    if (!canConfirmExclusao(permissions.podeDeletar, exclusaoPendente)) {
      return;
    }

    const exclusao = exclusaoPendente;
    setExclusaoPendente(null);

    if (exclusao.tipo === "ciclo") {
      try {
        await deletarCicloPagamento(exclusao.cicloId).unwrap();
        setCronograma(initialCronograma);
        setDraft(initialCronograma);
        setIsConfiguring(false);
        onConfigModeChange?.(false);
        toastSucesso("Cronograma removido com sucesso!");
      } catch {
        // O apiSlice ja exibe a mensagem de erro padrao do sistema.
      }

      return;
    }

    if (exclusao.tipo === "secao") {
      removeSecao(exclusao.secaoId);
    } else {
      removeEvento(exclusao.secaoId, exclusao.eventoId);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
  };

  const handleSectionDragEnter = (targetSecaoId: number) => {
    if (!draggedSecaoId || draggedSecaoId === targetSecaoId) {
      return;
    }

    setDraft((current) => ({
      ...current,
      secoes: reorderById(current.secoes, draggedSecaoId, targetSecaoId),
    }));
  };

  const handleSectionDrop = () => {
    setDraggedSecaoId(null);
  };

  const handleEventDragEnter = (targetSecaoId: number, targetEventoId: number) => {
    const draggedEventoId = draggedEvento?.eventoId;

    if (
      draggedEvento?.secaoId !== targetSecaoId ||
      draggedEventoId === undefined ||
      draggedEventoId === targetEventoId
    ) {
      return;
    }

    setDraft((current) =>
      reorderEventosDraft(current, targetSecaoId, draggedEventoId, targetEventoId),
    );
  };

  const handleEventDrop = () => {
    setDraggedEvento(null);
  };

  if (isConfiguring) {
    return (
      <section
        className={style.configPanel}
        aria-labelledby="configurar-cronograma-title"
        id="cronograma-config-panel"
        data-testid="cronograma-config-panel"
      >
        <header className={style.configHeader}>
          <h1 id="configurar-cronograma-title">Configurar cronograma</h1>
        </header>

        <div className={style.configBody}>
          <label className={style.titleLabel} htmlFor="titulo-ciclo">
            Título do ciclo
          </label>
          <input
            id="titulo-ciclo"
            data-testid="titulo-ciclo"
            className={style.cycleTitleInput}
            value={draft.titulo}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                titulo: event.target.value,
              }))
            }
            maxLength={200}
          />

          <div className={style.sectionsEditor}>
            {sortByOrdem(draft.secoes).map((secao) => (
              <section
                className={`${style.editorSection} ${draggedSecaoId === secao.id ? style.dragging : ""}`}
                key={secao.id}
                id={`cronograma-secao-${secao.id}`}
                data-testid={`cronograma-secao-${secao.id}`}
              >
                <div className={style.sectionEditorHeader}>
                  <BotaoSeplag
                    unstyled
                    type="button"
                    id={`cronograma-secao-${secao.id}-drag-handle`}
                    data-testid={`cronograma-secao-${secao.id}-drag-handle`}
                    className={style.dragHandleButton}
                    draggable
                    aria-label={`Mover ${secao.titulo}`}
                    onDragEnter={() => handleSectionDragEnter(secao.id)}
                    onDragOver={handleDragOver}
                    onDrop={handleSectionDrop}
                    onDragStart={(event: DragEvent<HTMLButtonElement>) => {
                      event.dataTransfer.effectAllowed = "move";
                      setDraggedSecaoId(secao.id);
                    }}
                    onDragEnd={handleSectionDrop}
                  >
                    <i className="pi pi-bars" aria-hidden="true" />
                  </BotaoSeplag>
                  <input
                    id={`cronograma-secao-${secao.id}-titulo`}
                    data-testid={`cronograma-secao-${secao.id}-titulo`}
                    className={style.sectionTitleInput}
                    value={secao.titulo}
                    onChange={(event) => updateSecaoTitulo(secao.id, event.target.value)}
                    maxLength={200}
                  />
                  {canGerenciarCronograma ? (
                    <BotaoAdicionarSeplag
                      id={`cronograma-secao-${secao.id}-adicionar-evento`}
                      data-testid={`cronograma-secao-${secao.id}-adicionar-evento`}
                      label="Adicionar evento"
                      className={style.addEventButton}
                      onClick={() => addEvento(secao.id)}
                    />
                  ) : null}
                  {permissions.podeDeletar ? (
                    <BotaoIconSeplag
                      id={`cronograma-secao-${secao.id}-remover`}
                      data-testid={`cronograma-secao-${secao.id}-remover`}
                      icon="pi pi-trash"
                      severity="danger"
                      className={style.deleteSectionButton}
                      onClick={() => solicitarExclusaoSecao(secao)}
                      aria-label={`Remover ${secao.titulo}`}
                    />
                  ) : null}
                </div>

                <div className={style.eventsHeader}>
                  <span>Data início</span>
                  <span>Data fim</span>
                  <span>Descrição</span>
                </div>

                {sortByOrdem(secao.eventos).map((evento) => {
                  const dataInicioDate = DateTimeField.parseValue(evento.dataInicio);
                  const dataFimDate = DateTimeField.parseValue(evento.dataFim);
                  const hasDataRangeError =
                    dataInicioDate !== null && dataFimDate !== null && dataFimDate < dataInicioDate;

                  const eventoTestId = `cronograma-secao-${secao.id}-evento-${evento.id}`;

                  return (
                    <div
                      className={`${style.eventEditorRow} ${draggedEvento?.eventoId === evento.id ? style.dragging : ""}`}
                      key={evento.id}
                      id={eventoTestId}
                      data-testid={eventoTestId}
                    >
                      <BotaoSeplag
                        unstyled
                        type="button"
                        id={`${eventoTestId}-drag-handle`}
                        data-testid={`${eventoTestId}-drag-handle`}
                        className={style.dragHandleButton}
                        draggable
                        aria-label="Mover evento"
                        onDragEnter={() => handleEventDragEnter(secao.id, evento.id)}
                        onDragOver={handleDragOver}
                        onDrop={handleEventDrop}
                        onDragStart={(event: DragEvent<HTMLButtonElement>) => {
                          event.dataTransfer.effectAllowed = "move";
                          setDraggedEvento({
                            secaoId: secao.id,
                            eventoId: evento.id,
                          });
                        }}
                        onDragEnd={handleEventDrop}
                      >
                        <i className="pi pi-bars" aria-hidden="true" />
                      </BotaoSeplag>
                      <div className={style.dateFieldGroup}>
                        <DateTimeField
                          inputId={`${eventoTestId}-data-inicio`}
                          value={evento.dataInicio}
                          placeholder="dd/mm/aaaa 17:00"
                          maxDate={dataFimDate ?? undefined}
                          onChange={(value) =>
                            updateEvento(secao.id, evento.id, "dataInicio", value)
                          }
                        />
                      </div>
                      <div className={style.dateFieldGroup}>
                        <DateTimeField
                          inputId={`${eventoTestId}-data-fim`}
                          value={evento.dataFim}
                          placeholder="dd/mm/aaaa 18:00"
                          minDate={dataInicioDate ?? undefined}
                          className={hasDataRangeError ? "p-invalid" : undefined}
                          onChange={(value) => updateEvento(secao.id, evento.id, "dataFim", value)}
                        />
                        {hasDataRangeError ? (
                          <span className={style.fieldErrorMessage}>
                            Data fim deve ser maior ou igual à data início.
                          </span>
                        ) : null}
                      </div>
                      <input
                        id={`${eventoTestId}-descricao`}
                        data-testid={`${eventoTestId}-descricao`}
                        value={evento.descricao}
                        onChange={(event) =>
                          updateEvento(secao.id, evento.id, "descricao", event.target.value)
                        }
                        maxLength={500}
                      />
                      {permissions.podeDeletar ? (
                        <BotaoIconSeplag
                          id={`${eventoTestId}-remover`}
                          data-testid={`${eventoTestId}-remover`}
                          icon="pi pi-times"
                          className={style.removeEventButton}
                          onClick={() => solicitarExclusaoEvento(secao.id, evento)}
                          aria-label="Remover evento"
                        />
                      ) : null}
                    </div>
                  );
                })}
              </section>
            ))}
          </div>

          {canGerenciarCronograma ? (
            <BotaoAdicionarSeplag
              id="cronograma-nova-secao"
              data-testid="cronograma-nova-secao"
              label="Nova seção"
              outlined
              className={style.addSectionButton}
              onClick={addSecao}
            />
          ) : null}
        </div>

        <footer className={style.configFooter}>
          {draft.id !== undefined && permissions.podeDeletar ? (
            <BotaoRemoverSeplag
              id="cronograma-excluir-ciclo"
              data-testid="cronograma-excluir-ciclo"
              label={isDeleting ? "Removendo..." : "Excluir ciclo"}
              className={style.deleteCycleButton}
              onClick={solicitarExclusaoCiclo}
              disabled={isDeleting}
            />
          ) : null}
          <BotaoVoltarSeplag
            id="cronograma-voltar"
            data-testid="cronograma-voltar"
            className={style.backButton}
            onClick={closeConfig}
          />
          {canGerenciarCronograma ? (
            <BotaoSalvarSeplag
              id="cronograma-salvar"
              data-testid="cronograma-salvar"
              label={isSaving ? "Salvando..." : "Salvar"}
              className={style.saveButton}
              onClick={() => void saveConfig()}
              disabled={isSaving}
            />
          ) : null}
        </footer>

        <CronogramaDeleteModal
          exclusaoPendente={exclusaoPendente}
          onCancel={() => setExclusaoPendente(null)}
          onConfirm={() => void confirmarExclusao()}
        />
      </section>
    );
  }

  return (
    <section
      className={style.panel}
      aria-labelledby="cronograma-title"
      id="cronograma-panel"
      data-testid="cronograma-panel"
    >
      <header className={style.panelHeader}>
        <div className={style.panelTitleGroup}>
          <i className="pi pi-calendar" aria-hidden="true" />
          <h1 id="cronograma-title">{cronograma.titulo}</h1>
        </div>
      </header>

      <div className={style.panelBody}>
        {canGerenciarCronograma ? (
          <BotaoSeplag
            id="cronograma-configurar"
            data-testid="cronograma-configurar"
            variant="save"
            label="Configurar Cronograma"
            icon="pi pi-cog"
            iconPos="left"
            style={{ width: "100%" }}
            className={style.configureButton}
            onClick={openConfig}
          />
        ) : null}

        <div className={style.timeline}>
          <EmptyTimeline hasSections={cronograma.secoes.length > 0} />
          {sortByOrdem(cronograma.secoes).map((secao) => (
            <section
              className={style.timelineSection}
              key={secao.id}
              id={`cronograma-timeline-secao-${secao.id}`}
              data-testid={`cronograma-timeline-secao-${secao.id}`}
            >
              <header className={style.timelineSectionHeader}>
                <span className={`${style.marker} ${style[secao.marcador]}`} />
                <h2>{secao.titulo}</h2>
                <BadgeSeplag
                  id={`cronograma-timeline-secao-${secao.id}-badge`}
                  label={`${secao.eventos.length} eventos`}
                  size="xs"
                  variant="neutral"
                />
              </header>

              {sortByOrdem(secao.eventos).map((evento) => {
                const statusEvento = getEventoStatus(evento);
                const isTimelineRowEmpty = evento.descricao.length === 0;
                const timelineRowTestId = `cronograma-timeline-secao-${secao.id}-evento-${evento.id}`;

                return (
                  <div
                    className={`${style.timelineRow} ${isTimelineRowEmpty ? style.timelineRowEmpty : ""}`}
                    key={evento.id}
                    id={timelineRowTestId}
                    data-testid={timelineRowTestId}
                  >
                    <strong>{formatTimelineDate(evento.dataInicio, evento.dataFim)}</strong>
                    <span>{evento.descricao}</span>
                    <span className={style.statusBadge}>
                      <BadgeSeplag
                        id={`${timelineRowTestId}-status`}
                        label={statusEventoLabel[statusEvento]}
                        variant={statusEventoVariant[statusEvento]}
                        size="xs"
                      />
                    </span>
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
