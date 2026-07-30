import { randomUUID } from "node:crypto";

/**
 * Correlation IDs tie a request to its logs, job records, and error responses
 * without ever containing user data — safe to log and to return to the client.
 */
export function newCorrelationId(): string {
  return randomUUID();
}

const CORRELATION_HEADER = "x-correlation-id";

export function correlationIdFromHeaders(headers: Headers): string {
  return headers.get(CORRELATION_HEADER) ?? newCorrelationId();
}

export { CORRELATION_HEADER };
