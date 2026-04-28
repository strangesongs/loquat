/**
 * Thrown when a DynamoDB query for pins fails (e.g. network, throttling, misconfiguration).
 * Callers can distinguish this from an empty result and return HTTP 5xx to the client.
 */
export class PinsQueryError extends Error {
  /**
   * @param {string} message
   * @param {unknown} [cause]
   */
  constructor(message = 'Failed to load pins from the database', cause) {
    super(message);
    this.name = 'PinsQueryError';
    this.cause = cause;
  }
}
