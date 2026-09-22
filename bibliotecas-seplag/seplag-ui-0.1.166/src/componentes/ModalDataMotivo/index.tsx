import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { formatDateToStringSeplag, stringToDateSeplag } from "../../uteis/manipulaData";
import { DateFieldSeplag, TextAreaFieldSeplag } from "../Fields";
import { MensagemSeplag } from "../Mensagem";
import { ModalSeplag } from "../Modal";

export interface ModalDataMotivoValoresSeplag {
  /** Data escolhida, no formato `dd/MM/yyyy` (o consumidor converte se precisar de ISO). */
  data: string;
  motivo: string;
}

export interface ModalDataMotivoSeplagProps {
  /** Base dos `data-testid` e dos `name` dos campos. Evite `.` — o react-hook-form o lê como aninhamento. @default "modal-data-motivo" */
  id?: string;
  visible: boolean;
  titulo: string;
  onConfirm: (valores: ModalDataMotivoValoresSeplag) => void;
  onCancel: () => void;
  /** Spinner no botão de ação; trava campos, cancelar e ESC. @default false */
  confirmando?: boolean;
  /** Trava campos e ação enquanto o host carrega dados (ex.: a data de referência). @default false */
  carregando?: boolean;
  /** Aviso informativo no topo. Omitido quando não informado. */
  mensagem?: string;
  /** Data exibida somente leitura; também é o limite mínimo do calendário. Aceita `dd/MM/yyyy` ou `yyyy-MM-dd`. */
  dataReferencia?: string | Date | null;
  /** @default "Data de início" */
  labelDataReferencia?: string;
  /** @default "Data" */
  labelData?: string;
  /** @default "Motivo" */
  labelMotivo?: string;
  /** @default "Confirmar" */
  labelAcao?: string;
  /** @default "pi pi-check" */
  iconAcao?: string;
  /** @default "Cancelar" */
  labelCancelar?: string;
  /** @default 500 */
  maxLengthMotivo?: number;
  /** @default "45vw" */
  tamanho?: string;
}

function valoresIniciais(nomeData: string, nomeMotivo: string): Record<string, string> {
  return {
    [nomeData]: formatDateToStringSeplag(new Date()) ?? "",
    [nomeMotivo]: "",
  };
}

/**
 * Modal que coleta **uma data e um motivo** — encerramento, extinção e ações parecidas.
 *
 * Os limites (`dataReferencia` até hoje) valem só para a escolha no calendário: o que for digitado
 * fora do intervalo chega ao `onConfirm` e a recusa fica com o backend, que responde com mensagem.
 * Fechar o modal após o sucesso é responsabilidade do consumidor.
 */
export function ModalDataMotivoSeplag(props: Readonly<ModalDataMotivoSeplagProps>) {
  const {
    id = "modal-data-motivo",
    visible,
    titulo,
    onConfirm,
    onCancel,
    confirmando = false,
    carregando = false,
    mensagem,
    dataReferencia,
    labelDataReferencia = "Data de início",
    labelData = "Data",
    labelMotivo = "Motivo",
    labelAcao = "Confirmar",
    iconAcao = "pi pi-check",
    labelCancelar = "Cancelar",
    maxLengthMotivo = 500,
    tamanho = "45vw",
  } = props;

  const nomeData = `${id}-data`;
  const nomeMotivo = `${id}-motivo`;

  const { control, handleSubmit, reset } = useForm<Record<string, string>>({
    defaultValues: valoresIniciais(nomeData, nomeMotivo),
  });

  useEffect(() => {
    if (visible) reset(valoresIniciais(nomeData, nomeMotivo));
  }, [visible, reset, nomeData, nomeMotivo]);

  const bloqueado = confirmando || carregando;
  const dataInicio = stringToDateSeplag(dataReferencia ?? null);

  return (
    <ModalSeplag
      id={id}
      titulo={titulo}
      visible={visible}
      fechar={onCancel}
      funcAcao={handleSubmit((valores) =>
        onConfirm({ data: valores[nomeData], motivo: valores[nomeMotivo] }),
      )}
      labelFechar={labelCancelar}
      labelAcao={labelAcao}
      iconAcao={iconAcao}
      tamanho={tamanho}
      alignFooter="right"
      overflow="visible"
      loadingAcao={bloqueado}
      disabledFechar={bloqueado}
      closeOnEscape={!bloqueado}
    >
      {mensagem && (
        <MensagemSeplag id={`${id}-mensagem`} severity="info" cols="12" message={mensagem} />
      )}

      {dataInicio && (
        <DateFieldSeplag
          name={`${id}-referencia`}
          label={labelDataReferencia}
          cols="12"
          value={formatDateToStringSeplag(dataInicio) ?? ""}
          disabled
        />
      )}

      <DateFieldSeplag
        name={nomeData}
        control={control}
        label={labelData}
        cols="12"
        required
        disabled={bloqueado}
        maxDate={new Date()}
        minDate={dataInicio ?? undefined}
      />

      <TextAreaFieldSeplag
        name={nomeMotivo}
        control={control}
        label={labelMotivo}
        cols="12"
        required
        maxLength={maxLengthMotivo}
        disabled={bloqueado}
      />
    </ModalSeplag>
  );
}

export default ModalDataMotivoSeplag;
