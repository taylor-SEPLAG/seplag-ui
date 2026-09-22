export type PaginaInicialEndpointBuilder = {
  query: (definition: unknown) => unknown;
  mutation: (definition: unknown) => unknown;
};

type InjectEndpoints = (options: {
  endpoints: (builder: PaginaInicialEndpointBuilder) => Record<string, unknown>;
  overrideExisting?: boolean;
}) => unknown;

type ApiSliceLike = {
  injectEndpoints: unknown;
};

let paginaInicialApiSlice: ApiSliceLike | undefined;

export function configurarPaginaInicialSeplag(apiSlice: ApiSliceLike): void {
  paginaInicialApiSlice = apiSlice;
}

export function injetarEndpointsPaginaInicialSeplag<Result>(
  endpoints: (builder: PaginaInicialEndpointBuilder) => Record<string, unknown>,
): Result {
  if (!paginaInicialApiSlice) {
    throw new Error("Chame configurarPaginaInicialSeplag(apiSlice) no módulo host.");
  }

  const injectEndpoints = paginaInicialApiSlice.injectEndpoints as InjectEndpoints;

  return injectEndpoints.call(paginaInicialApiSlice, {
    endpoints,
    overrideExisting: false,
  }) as Result;
}
