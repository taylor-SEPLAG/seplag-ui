import { injetarEndpointsPaginaInicialSeplag } from "../paginaInicialApi";
import type { CicloPagamentoRequest, CicloPagamentoResponse } from "./types";

type QueryHook<Result> = () => {
  data?: Result;
  isFetching: boolean;
};

type MutationHook<Argument, Result> = () => [
  (argument: Argument) => { unwrap: () => Promise<Result> },
  { isLoading: boolean },
];

type CronogramaApiHooks = {
  useListarCiclosPagamentoQuery: QueryHook<CicloPagamentoResponse[]>;
  useCriarCicloPagamentoMutation: MutationHook<CicloPagamentoRequest, CicloPagamentoResponse>;
  useAtualizarCicloPagamentoMutation: MutationHook<
    { id: number; body: CicloPagamentoRequest },
    CicloPagamentoResponse
  >;
  useDeletarCicloPagamentoMutation: MutationHook<number, void>;
};

let cronogramaApi: CronogramaApiHooks | undefined;

function getCronogramaApi() {
  cronogramaApi ??= injetarEndpointsPaginaInicialSeplag<CronogramaApiHooks>((builder) => ({
    listarCiclosPagamento: builder.query({
      query: () => ({ url: "/v1/ciclo-pagamento", method: "GET" }),
      providesTags: ["CicloPagamento"],
    }),
    criarCicloPagamento: builder.mutation({
      query: (body: CicloPagamentoRequest) => ({
        url: "/v1/ciclo-pagamento",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CicloPagamento"],
    }),
    atualizarCicloPagamento: builder.mutation({
      query: ({ id, body }: { id: number; body: CicloPagamentoRequest }) => ({
        url: `/v1/ciclo-pagamento/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["CicloPagamento"],
    }),
    deletarCicloPagamento: builder.mutation({
      query: (id: number) => ({
        url: `/v1/ciclo-pagamento/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CicloPagamento"],
    }),
  }));

  return cronogramaApi;
}

export function useAtualizarCicloPagamentoMutation() {
  return getCronogramaApi().useAtualizarCicloPagamentoMutation();
}

export function useCriarCicloPagamentoMutation() {
  return getCronogramaApi().useCriarCicloPagamentoMutation();
}

export function useDeletarCicloPagamentoMutation() {
  return getCronogramaApi().useDeletarCicloPagamentoMutation();
}

export function useListarCiclosPagamentoQuery() {
  return getCronogramaApi().useListarCiclosPagamentoQuery();
}
