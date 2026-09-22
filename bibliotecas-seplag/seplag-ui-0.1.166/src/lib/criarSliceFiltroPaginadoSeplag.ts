import type { Api, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { opcoesPaginacaoSeplag } from "../interfaces/paginacao";
import type { ResultsSeplag } from "../interfaces/Results";

export interface PageQuerySeplag {
  page?: number;
  sizePage?: number;
  sort?: "ASC" | "DESC";
  sortProperties?: string[];
}

export interface BuscaFiltradaParamsSeplag<TFiltro> {
  filtro: TFiltro;
  pageQuery?: PageQuerySeplag;
}

export type ApiSliceSeplag<TagTypes extends string, ReducerPath extends string = string> = Api<
  BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
  Record<never, never>,
  ReducerPath,
  TagTypes
>;

export interface CriarEndpointFiltroPaginadoSeplagOptions<TagTypes extends string> {
  /** URL do POST de filtro (ex.: "/v1/certames/filtro"). */
  readonly url: string;
  /** Tag(s) de cache invalidadas/providas por este endpoint — devem existir em `tagTypes` do apiSlice. */
  readonly tags: readonly TagTypes[];
  /** sortProperties default quando o chamador não informar pageQuery.sortProperties. */
  readonly sortPropertiesPadrao?: readonly string[];
  /** extraOptions repassado ao endpoint (ex.: `{ exibirLoader: true }`). */
  readonly extraOptions?: Record<string, unknown>;
}

export interface SliceFiltroPaginadoSeplag<TFiltro, TResponse> {
  useBuscaQuery: (params: BuscaFiltradaParamsSeplag<TFiltro>) => {
    data?: ResultsSeplag<TResponse>;
    isFetching: boolean;
  };
  useLazyBuscaQuery: () => [
    (params: BuscaFiltradaParamsSeplag<TFiltro>) => void,
    { data?: ResultsSeplag<TResponse>; isFetching: boolean },
  ];
}

/**
 * Padroniza a criação de endpoints de listagem paginada (POST /.../filtro com
 * page/sizePage/sort/sortProperties na querystring e o filtro no body) — o
 * mesmo formato já usado nas telas de listagem com filtro em múltiplos apps.
 *
 * Uso — chamada em duas etapas (curried): a primeira fixa o `apiSlice` do app
 * (e com ele, suas TagTypes reais); a segunda define o filtro/resposta dessa
 * listagem específica. Um arquivo por listagem, ex.: features/certame/filterCertame.ts:
 *
 *   const criarEndpointCertame = criarSliceFiltroPaginadoSeplag(apiSlice)
 *
 *   const { useBuscaQuery, useLazyBuscaQuery } = criarEndpointCertame<
 *     CertameFiltroRequest,
 *     CertameListagemResponse
 *   >({
 *     url: "/v1/certames/filtro",
 *     tags: ["Certame"],
 *     sortPropertiesPadrao: ["nomeEdital"],
 *     extraOptions: { exibirLoader: true },
 *   })
 *
 *   export const useGetBuscaCertameQuery = useBuscaQuery
 *   export const useLazyGetBuscaCertameQuery = useLazyBuscaQuery
 *
 * Cada chamada injeta um endpoint próprio no apiSlice do app (chave interna
 * derivada da URL, para não colidir entre diferentes listagens), então basta
 * apontar para uma URL nova para ter uma listagem nova — sem reescrever query
 * params, body ou tipagem do zero em cada tela.
 */
export function criarSliceFiltroPaginadoSeplag<TagTypes extends string, ReducerPath extends string>(
  apiSlice: ApiSliceSeplag<TagTypes, ReducerPath>,
) {
  return function criarEndpointFiltroPaginado<TFiltro, TResponse>({
    url,
    tags,
    sortPropertiesPadrao = [],
    extraOptions,
  }: CriarEndpointFiltroPaginadoSeplagOptions<TagTypes>): SliceFiltroPaginadoSeplag<TFiltro, TResponse> {
    const nomeEndpoint = `busca${url.replace(/[^a-zA-Z0-9]/g, "_")}`;

    const slice = apiSlice.injectEndpoints({
      endpoints: ({ query }) => ({
        [nomeEndpoint]: query<ResultsSeplag<TResponse>, BuscaFiltradaParamsSeplag<TFiltro>>({
          query: ({ filtro, pageQuery }) => ({
            url,
            method: "POST",
            params: {
              page: pageQuery?.page ?? opcoesPaginacaoSeplag.page,
              sizePage: pageQuery?.sizePage ?? opcoesPaginacaoSeplag.rows,
              sort: pageQuery?.sort ?? "ASC",
              sortProperties: pageQuery?.sortProperties ?? sortPropertiesPadrao,
            },
            body: filtro,
          }),
          providesTags: [...tags],
          ...(extraOptions ? { extraOptions } : {}),
        }),
      }),
    });

    const endpointHooks = slice as unknown as Record<
      string,
      (params: BuscaFiltradaParamsSeplag<TFiltro>) => {
        data?: ResultsSeplag<TResponse>;
        isFetching: boolean;
      }
    > &
      Record<
        string,
        () => [
          (params: BuscaFiltradaParamsSeplag<TFiltro>) => void,
          { data?: ResultsSeplag<TResponse>; isFetching: boolean },
        ]
      >;

    const capitalizado = nomeEndpoint[0].toUpperCase() + nomeEndpoint.slice(1);

    return {
      useBuscaQuery: endpointHooks[`use${capitalizado}Query`],
      useLazyBuscaQuery: endpointHooks[`useLazy${capitalizado}Query`],
    };
  };
}
