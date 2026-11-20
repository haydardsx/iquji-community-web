import {
  QueryClient,
  type QueryClientConfig,
  QueryClientProvider,
} from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

function errorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }
  if ("status" in error && typeof error.status === "number") {
    return error.status;
  }
  if (
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "status" in error.response &&
    typeof error.response.status === "number"
  ) {
    return error.response.status;
  }
  return undefined;
}

export function isAuthorizationQueryError(error: unknown): boolean {
  const status = errorStatus(error);
  return status === 401 || status === 403;
}

export function shouldRetryIqujiQuery(
  failureCount: number,
  error: unknown,
): boolean {
  return !isAuthorizationQueryError(error) && failureCount < 2;
}

export const iqujiQueryClientDefaults = {
  defaultOptions: {
    queries: {
      gcTime: 5 * 60_000,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      retry: shouldRetryIqujiQuery,
      staleTime: 30_000,
    },
    mutations: {
      retry: false,
    },
  },
} satisfies QueryClientConfig;

export function createIqujiQueryClient(
  config: QueryClientConfig = {},
): QueryClient {
  return new QueryClient({
    ...iqujiQueryClientDefaults,
    ...config,
    defaultOptions: {
      ...iqujiQueryClientDefaults.defaultOptions,
      ...config.defaultOptions,
      queries: {
        ...iqujiQueryClientDefaults.defaultOptions?.queries,
        ...config.defaultOptions?.queries,
      },
      mutations: {
        ...iqujiQueryClientDefaults.defaultOptions?.mutations,
        ...config.defaultOptions?.mutations,
      },
    },
  });
}

export type IqujiQueryProviderProps = {
  children: ReactNode;
  client?: QueryClient;
  clientConfig?: QueryClientConfig;
};

export function IqujiQueryProvider({
  children,
  client,
  clientConfig,
}: IqujiQueryProviderProps) {
  const [ownedClient] = useState(
    () => client ?? createIqujiQueryClient(clientConfig),
  );
  return (
    <QueryClientProvider client={ownedClient}>{children}</QueryClientProvider>
  );
}
