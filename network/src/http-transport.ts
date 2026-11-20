export type FetchImplementation = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export type HttpTransportOptions = {
  fetchImplementation?: FetchImplementation;
  timeoutMs?: number;
};

export type HttpRequestOptions = RequestInit & { timeoutMs?: number };

export class HttpTimeoutError extends Error {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs} ms`);
    this.name = "TimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

function validateTimeout(timeoutMs: number | undefined): void {
  if (
    timeoutMs !== undefined &&
    (!Number.isFinite(timeoutMs) || timeoutMs < 0 || timeoutMs > 2_147_483_647)
  ) {
    throw new RangeError("HTTP timeout must be between 0 and 2147483647 ms");
  }
}

export function createHttpTransport({
  fetchImplementation = globalThis.fetch,
  timeoutMs,
}: HttpTransportOptions = {}) {
  validateTimeout(timeoutMs);

  return async function request(
    input: RequestInfo | URL,
    options: HttpRequestOptions = {},
  ): Promise<Response> {
    const { timeoutMs: requestTimeout = timeoutMs, ...init } = options;
    validateTimeout(requestTimeout);
    const sourceSignal =
      init.signal === undefined && input instanceof Request
        ? input.signal
        : init.signal;
    sourceSignal?.throwIfAborted();

    const timeoutController = requestTimeout
      ? new AbortController()
      : undefined;
    const signal = timeoutController
      ? sourceSignal
        ? AbortSignal.any([sourceSignal, timeoutController.signal])
        : timeoutController.signal
      : sourceSignal;
    if (timeoutController && signal) init.signal = signal;
    const timer = timeoutController
      ? setTimeout(
          () =>
            timeoutController.abort(new HttpTimeoutError(requestTimeout ?? 0)),
          requestTimeout,
        )
      : undefined;
    let abortListener: (() => void) | undefined;

    try {
      if (!signal) return await fetchImplementation(input, init);
      const aborted = new Promise<never>((_resolve, reject) => {
        abortListener = () => reject(signal.reason);
        signal.addEventListener("abort", abortListener, { once: true });
      });
      return await Promise.race([fetchImplementation(input, init), aborted]);
    } finally {
      clearTimeout(timer);
      if (signal && abortListener)
        signal.removeEventListener("abort", abortListener);
    }
  };
}
