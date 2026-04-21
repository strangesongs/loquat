// Network helper with timeout, retry, and cancellation support.

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetriableStatus(status) {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function isAbortError(error) {
  return !!error && (error.name === 'AbortError' || error.code === 'ABORT_ERR');
}

function isNetworkError(error) {
  // Browsers throw TypeError for most low-level network failures.
  return error instanceof TypeError;
}

function anySignal(signals = []) {
  const activeSignals = signals.filter(Boolean);
  if (activeSignals.length === 0) return null;

  const controller = new AbortController();
  const abort = () => controller.abort();
  const listeners = [];

  for (const signal of activeSignals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    const listener = () => abort();
    signal.addEventListener('abort', listener, { once: true });
    listeners.push(() => signal.removeEventListener('abort', listener));
  }

  return {
    signal: controller.signal,
    cleanup: () => listeners.forEach((remove) => remove()),
  };
}

function withTimeoutSignal(signal, timeoutMs) {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);
  const combined = anySignal([signal, timeoutController.signal]);

  return {
    signal: combined ? combined.signal : timeoutController.signal,
    cleanup: () => {
      clearTimeout(timeoutId);
      if (combined) combined.cleanup();
    },
  };
}

export async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const { signal, cleanup } = withTimeoutSignal(options.signal, timeoutMs);
  try {
    return await fetch(url, { ...options, signal });
  } finally {
    cleanup();
  }
}

export async function fetchWithRetry(
  url,
  options = {},
  {
    timeoutMs = 10000,
    retries = 2,
    retryDelayMs = 500,
    maxRetryDelayMs = 2500,
    jitterRatio = 0.2,
  } = {}
) {
  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    try {
      const response = await fetchWithTimeout(url, options, timeoutMs);
      if (attempt < retries && isRetriableStatus(response.status)) {
        attempt += 1;
        const backoff = Math.min(retryDelayMs * (2 ** (attempt - 1)), maxRetryDelayMs);
        const jitter = backoff * jitterRatio * Math.random();
        await sleep(backoff + jitter);
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (options.signal?.aborted || isAbortError(error)) throw error;
      if (!isNetworkError(error) || attempt >= retries) throw error;
      attempt += 1;
      const backoff = Math.min(retryDelayMs * (2 ** (attempt - 1)), maxRetryDelayMs);
      const jitter = backoff * jitterRatio * Math.random();
      await sleep(backoff + jitter);
    }
  }

  throw lastError || new Error('Network request failed');
}
