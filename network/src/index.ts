import {
  createHttpTransport,
  type HttpRequestOptions,
  type HttpTransportOptions,
} from "./http-transport.js";

export {
  createHttpTransport,
  type FetchImplementation,
  type HttpRequestOptions,
  HttpTimeoutError,
  type HttpTransportOptions,
} from "./http-transport.js";

export type JsonTransportOptions = HttpTransportOptions & {
  baseUrl: string;
  resolveHeaders?: () => HeadersInit | Promise<HeadersInit>;
  credentials?: RequestCredentials;
  cache?: RequestCache;
};

export type JsonRequest = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  timeoutMs?: number;
};

export class JsonTransportError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Request failed with status ${status}`);
    this.name = "JsonTransportError";
    this.status = status;
  }
}

export function createJsonTransport({
  baseUrl,
  fetchImplementation,
  timeoutMs,
  resolveHeaders,
  credentials,
  cache,
}: JsonTransportOptions) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/u, "");
  if (!normalizedBaseUrl) throw new Error("A transport base URL is required");
  const transportOptions: HttpTransportOptions = {};
  if (fetchImplementation)
    transportOptions.fetchImplementation = fetchImplementation;
  if (timeoutMs !== undefined) transportOptions.timeoutMs = timeoutMs;
  const transport = createHttpTransport(transportOptions);

  return async function request<ResponseBody>(
    path: string,
    options: JsonRequest = {},
  ): Promise<ResponseBody> {
    const headers = new Headers(await resolveHeaders?.());
    new Headers(options.headers).forEach((value, key) => {
      headers.set(key, value);
    });
    const init: HttpRequestOptions = {
      method: options.method ?? "GET",
      headers,
    };
    if (credentials) init.credentials = credentials;
    if (cache) init.cache = cache;
    if (options.signal) init.signal = options.signal;
    if (options.timeoutMs !== undefined) init.timeoutMs = options.timeoutMs;
    if (options.body !== undefined) {
      headers.set("content-type", "application/json");
      init.body = JSON.stringify(options.body);
    }
    const response = await transport(
      `${normalizedBaseUrl}/${path.replace(/^\/+/, "")}`,
      init,
    );
    if (!response.ok) throw new JsonTransportError(response.status);
    return (await response.json()) as ResponseBody;
  };
}
