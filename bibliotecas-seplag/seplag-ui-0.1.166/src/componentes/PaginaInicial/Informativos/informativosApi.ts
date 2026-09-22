import { injetarEndpointsPaginaInicialSeplag } from "../paginaInicialApi";
import type { InformativoRequest, InformativoResponse } from "./types";

type QueryHook<Result> = () => {
  data?: Result;
  isFetching: boolean;
};

type MutationHook<Argument, Result> = () => [
  (argument: Argument) => { unwrap: () => Promise<Result> },
  { isLoading: boolean },
];

type PaginatedResult<Item> = {
  content: Item[];
};

type InformativosApiHooks = {
  useListarInformativosPaginadoQuery: QueryHook<PaginatedResult<InformativoResponse>>;
  useCriarInformativoMutation: MutationHook<InformativoRequest, InformativoResponse>;
  useAtualizarInformativoMutation: MutationHook<
    { id: number; body: InformativoRequest },
    InformativoResponse
  >;
  useDeletarInformativoMutation: MutationHook<number, void>;
};

let informativosApi: InformativosApiHooks | undefined;

function getInformativosApi() {
  informativosApi ??= injetarEndpointsPaginaInicialSeplag<InformativosApiHooks>((builder) => ({
    listarInformativosPaginado: builder.query({
      query: () => ({
        url: "/v1/informativos",
        params: {
          page: 0,
          sizePage: 30,
          sort: "DESC",
          sortProperties: "dataPublicacao",
        },
      }),
      providesTags: ["Informativos"],
    }),
    criarInformativo: builder.mutation({
      query: (body: InformativoRequest) => ({
        url: "/v1/informativos",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Informativos"],
    }),
    atualizarInformativo: builder.mutation({
      query: ({ id, body }: { id: number; body: InformativoRequest }) => ({
        url: `/v1/informativos/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Informativos"],
    }),
    deletarInformativo: builder.mutation({
      query: (id: number) => ({
        url: `/v1/informativos/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Informativos"],
    }),
  }));

  return informativosApi;
}

export function useAtualizarInformativoMutation() {
  return getInformativosApi().useAtualizarInformativoMutation();
}

export function useCriarInformativoMutation() {
  return getInformativosApi().useCriarInformativoMutation();
}

export function useDeletarInformativoMutation() {
  return getInformativosApi().useDeletarInformativoMutation();
}

export function useListarInformativosPaginadoQuery() {
  return getInformativosApi().useListarInformativosPaginadoQuery();
}
