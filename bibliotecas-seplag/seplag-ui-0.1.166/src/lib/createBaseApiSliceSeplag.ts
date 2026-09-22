import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query/react";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { decrementLoaderSeplag, incrementLoaderSeplag } from "../componentes/Loader/loaderSlice";
import { toastService } from "../provider/printToast/toastService";
import type OAuth2LibSeplag from "./OAuth2Seplag/OAuth2Lib";

interface ExtraOptionsProps {
  naoExibirMensagemErro?: boolean;
  /** Ativa o `LoaderSeplag` global (overlay de tela cheia) enquanto esta requisição está em andamento. */
  exibirLoader?: boolean;
}

/**
 * `extraOptions` é fixo por definição de endpoint (RTK Query não permite variar por chamada).
 * Para decidir `exibirLoader` dinamicamente por chamada, a função `query()` do endpoint pode
 * incluir esta propriedade no `FetchArgs` retornado — ela tem prioridade sobre `extraOptions`
 * e é removida antes de repassar os argumentos para o `fetch` (não polui a requisição real).
 *
 * @example
 * query: ({ id, silencioso }): FetchArgsComLoaderSeplag => ({
 *   url: `/v1/certames/${id}/cronograma`,
 *   exibirLoader: !silencioso,
 * }),
 */
export interface FetchArgsComLoaderSeplag extends FetchArgs {
  exibirLoader?: boolean;
}

interface ApiErrorBody {
  keyError?: string;
  message?: string;
  messageDev?: string;
  error?: string;
  fieldsValidation?: { field?: string; message?: string }[];
}

const STATUS_ERROR_MESSAGES: Record<string, string> = {
  FETCH_ERROR:
    "Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.",
  TIMEOUT_ERROR: "A requisição demorou muito para responder. Tente novamente.",
  PARSING_ERROR: "Não foi possível interpretar a resposta do servidor.",
  CUSTOM_ERROR: "Erro ao processar requisição.",
};

function genericStatusErrorMessage(status: FetchBaseQueryError["status"] | undefined): string {
  if (!status) return "Erro desconhecido";
  const known = typeof status === "string" ? STATUS_ERROR_MESSAGES[status] : undefined;
  return known ?? `Erro ${status}: Erro ao processar requisição`;
}

function extractErrorMessageFromString(
  data: string,
  status: FetchBaseQueryError["status"],
): string {
  try {
    const parsed = JSON.parse(data) as ApiErrorBody | null;
    return (parsed && typeof parsed === "object" ? parsed.message : undefined) ?? data;
  } catch {
    return data || genericStatusErrorMessage(status);
  }
}

function extractErrorMessageFromObject(
  data: ApiErrorBody,
  status: FetchBaseQueryError["status"],
): string {
  return (
    data.fieldsValidation?.[0]?.message ||
    data.message ||
    data.error ||
    genericStatusErrorMessage(status)
  );
}

function extractErrorMessage(error: FetchBaseQueryError): string {
  const data = error?.data;

  if (!data) return genericStatusErrorMessage(error?.status);
  if (typeof data === "string") return extractErrorMessageFromString(data, error?.status);
  if (typeof data === "object")
    return extractErrorMessageFromObject(data as ApiErrorBody, error?.status);

  return "Erro desconhecido";
}

export interface CreateBaseApiSliceSeplagOptions<
  TagTypes extends string,
  ReducerPath extends string,
> {
  reducerPath: ReducerPath;
  baseUrl: string;
  /**
   * Instância de autenticação usada para obter o token, renová-lo automaticamente em 401 e
   * deslogar se o refresh falhar. Recomendado — substitui `getToken`/`onUnauthorized`.
   */
  authThanos?: OAuth2LibSeplag;
  /** @deprecated Use `authThanos` para ganhar refresh automático de token em 401. */
  getToken?: () => string | undefined;
  /** @deprecated Use `authThanos` para ganhar refresh automático de token em 401. */
  onUnauthorized?: () => void;
  publicEndpoints?: string[];
  tagTypes: readonly TagTypes[];
  /** Loga request/response/erro no console. Default: lê de `localStorage.getItem("seplag:debugApi")`. */
  debug?: boolean;
}

function isDebugEnabled(debug: boolean | undefined): boolean {
  if (debug !== undefined) return debug;
  try {
    return localStorage.getItem("seplag:debugApi") === "true";
  } catch {
    return false;
  }
}

function maskAuthorization(headers: FetchArgs["headers"]): Record<string, string> | undefined {
  if (!headers) return undefined;
  const entries: Record<string, string> = {};
  new Headers(headers as HeadersInit).forEach((value, key) => {
    if (key.toLowerCase() === "authorization") {
      const [scheme] = value.split(" ", 1);
      entries[key] = `${scheme} ***`;
    } else {
      entries[key] = value;
    }
  });
  return entries;
}

function logApiCall({
  reducerPath,
  endpoint,
  args,
  result,
  durationMs,
}: {
  reducerPath: string;
  endpoint: string;
  args: string | FetchArgs;
  result: {
    data?: unknown;
    error?: FetchBaseQueryError;
    meta?: FetchBaseQueryMeta;
  };
  durationMs: number;
}): void {
  const isFetchArgs = typeof args === "object";
  const method = isFetchArgs ? (args.method ?? "GET") : "GET";
  const url = isFetchArgs ? args.url : args;
  const params = isFetchArgs ? args.params : undefined;
  const body = isFetchArgs ? args.body : undefined;
  const headers = isFetchArgs ? maskAuthorization(args.headers) : undefined;
  const hasError = Boolean(result.error);
  const status = hasError ? result.error?.status : (result.meta?.response?.status ?? 200);

  console.groupCollapsed(
    `%c[seplag-api] ${method} ${reducerPath}/${endpoint} → ${status}%c (${durationMs.toFixed(0)}ms)`,
    `color: ${hasError ? "#e5484d" : "#30a46c"}; font-weight: bold`,
    "color: inherit; font-weight: normal",
  );
  console.log("endpoint:", endpoint);
  console.log("method:", method);
  console.log("url:", url);
  if (params !== undefined) console.log("query params:", params);
  if (headers !== undefined) console.log("headers:", headers);
  if (body !== undefined) console.log("payload:", body);
  console.log("status:", status);
  console.log(hasError ? "error:" : "data:", hasError ? result.error : result.data);
  if (result.meta?.response?.headers) {
    console.log("response headers:", Object.fromEntries(result.meta.response.headers.entries()));
  }
  console.log("duration:", `${durationMs.toFixed(1)}ms`);
  console.log("raw result:", result);
  console.groupEnd();
}

export function createBaseApiSliceSeplag<TagTypes extends string, ReducerPath extends string>({
  reducerPath,
  baseUrl,
  authThanos,
  getToken,
  onUnauthorized,
  publicEndpoints = [],
  tagTypes,
  debug,
}: CreateBaseApiSliceSeplagOptions<TagTypes, ReducerPath>): ReturnType<
  typeof createApi<
    BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
    Record<never, never>,
    ReducerPath,
    TagTypes
  >
> {
  if (!authThanos && !getToken) {
    throw new Error("createBaseApiSliceSeplag: informe `authThanos` (recomendado) ou `getToken`.");
  }

  const publicEndpointsSet = new Set(publicEndpoints);
  const debugEnabled = isDebugEnabled(debug);
  const resolveToken = () => authThanos?.token?.access_token ?? getToken?.();

  const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { endpoint }) => {
      const token = resolveToken();
      if (token && !publicEndpointsSet.has(endpoint)) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  let refreshPromise: Promise<boolean> | null = null;

  const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions,
  ) => {
    const option = extraOptions as ExtraOptionsProps;

    let argsSemFlagLoader: string | FetchArgs = args;
    let exibirLoaderPorArgs: boolean | undefined;
    if (typeof args === "object") {
      const { exibirLoader, ...resto } = args as FetchArgsComLoaderSeplag;
      exibirLoaderPorArgs = exibirLoader;
      argsSemFlagLoader = resto;
    }
    const mostrarLoader = exibirLoaderPorArgs ?? option?.exibirLoader ?? false;

    if (mostrarLoader) api.dispatch(incrementLoaderSeplag());
    try {
      return await executarComReauth(argsSemFlagLoader, api, extraOptions);
    } finally {
      if (mostrarLoader) api.dispatch(decrementLoaderSeplag());
    }
  };

  const executarComReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions,
  ) => {
    const startedAt = performance.now();
    let result = await baseQuery(args, api, extraOptions);
    const durationMs = performance.now() - startedAt;
    const option = extraOptions as ExtraOptionsProps;

    if (result.error?.status === 401 && authThanos) {
      if (!refreshPromise) {
        refreshPromise = authThanos
          .updateTokenSeplag()
          .then(() => true)
          .catch(() => false)
          .finally(() => {
            refreshPromise = null;
          });
      }
      const refreshed = await refreshPromise;

      if (refreshed) {
        result = await baseQuery(args, api, extraOptions);
      } else {
        authThanos.logoutSeplag();
      }
    } else if (result.error?.status === 401) {
      onUnauthorized?.();
    }

    if (debugEnabled) {
      logApiCall({ reducerPath, endpoint: api.endpoint, args, result, durationMs });
    }

    if (option?.naoExibirMensagemErro === true) return result;

    if (result.error) {
      const msg = extractErrorMessage(result.error);
      if (msg) toastService.show({ severity: "error", detail: msg, life: 5000 });
      return result;
    }
    const data = result.data as ApiErrorBody | null;
    if (data !== null && typeof data === "object" && "keyError" in data && data.message) {
      if (debugEnabled) {
        console.warn(`[seplag-api] ${reducerPath}/${api.endpoint} → erro disfarçado de 200`, data);
      }
      toastService.show({ severity: "error", detail: data.message, life: 5000 });
      return {
        error: {
          status: "CUSTOM_ERROR" as const,
          error: data.message,
          data,
        } as unknown as FetchBaseQueryError,
      };
    }

    return result;
  };

  return createApi({
    reducerPath,
    baseQuery: baseQueryWithReauth,
    tagTypes,
    endpoints: () => ({}),
  });
}
