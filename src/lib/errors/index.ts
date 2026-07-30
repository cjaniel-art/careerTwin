/**
 * Typed internal error hierarchy. Route handlers and server actions must catch
 * these and translate them into safe, generic external messages (see toSafeResponse
 * below) — internal messages/stacks must never reach the client.
 */

export type ErrorCode =
  | "unauthenticated"
  | "unauthorized"
  | "not_found"
  | "invalid_input"
  | "invalid_state"
  | "conflict"
  | "rate_limited"
  | "insufficient_credits"
  | "insufficient_data"
  | "upstream_provider_error"
  | "missing_external_configuration"
  | "internal_error";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly correlationId?: string;
  readonly safeMessage: string;

  constructor(
    code: ErrorCode,
    safeMessage: string,
    options?: { cause?: unknown; correlationId?: string },
  ) {
    super(safeMessage);
    this.name = "AppError";
    this.code = code;
    this.safeMessage = safeMessage;
    this.correlationId = options?.correlationId;
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export class UnauthenticatedError extends AppError {
  constructor(correlationId?: string) {
    super("unauthenticated", "É necessário entrar na sua conta para continuar.", {
      correlationId,
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(correlationId?: string) {
    super("unauthorized", "Você não tem acesso a este recurso.", { correlationId });
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, correlationId?: string) {
    super("not_found", `${resource} não foi encontrado.`, { correlationId });
  }
}

export class InvalidInputError extends AppError {
  constructor(safeMessage: string, correlationId?: string) {
    super("invalid_input", safeMessage, { correlationId });
  }
}

export class InvalidStateError extends AppError {
  constructor(safeMessage: string, correlationId?: string) {
    super("invalid_state", safeMessage, { correlationId });
  }
}

export class InsufficientCreditsError extends AppError {
  constructor(correlationId?: string) {
    super("insufficient_credits", "Você não tem créditos suficientes para esta ação.", {
      correlationId,
    });
  }
}

export class InsufficientDataError extends AppError {
  constructor(safeMessage: string, correlationId?: string) {
    super("insufficient_data", safeMessage, { correlationId });
  }
}

export class UpstreamProviderError extends AppError {
  constructor(provider: string, cause?: unknown, correlationId?: string) {
    super("upstream_provider_error", "Um serviço externo está indisponível no momento.", {
      cause,
      correlationId,
    });
    this.provider = provider;
  }
  readonly provider: string;
}

/** Maps an AppError to the HTTP status it should produce. */
export function statusForErrorCode(code: ErrorCode): number {
  switch (code) {
    case "unauthenticated":
      return 401;
    case "unauthorized":
      return 403;
    case "not_found":
      return 404;
    case "invalid_input":
      return 422;
    case "invalid_state":
    case "conflict":
      return 409;
    case "rate_limited":
      return 429;
    case "insufficient_credits":
    case "insufficient_data":
      return 402;
    case "upstream_provider_error":
    case "missing_external_configuration":
    case "internal_error":
    default:
      return 500;
  }
}

/** Safe, user-facing shape — never includes stack traces or internal detail. */
export interface SafeErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    correlationId?: string;
  };
}

export function toSafeResponse(error: unknown, correlationId: string): SafeErrorResponse {
  if (error instanceof AppError) {
    return {
      error: {
        code: error.code,
        message: error.safeMessage,
        correlationId: error.correlationId ?? correlationId,
      },
    };
  }
  return {
    error: {
      code: "internal_error",
      message: "Ocorreu um erro inesperado. Tente novamente em instantes.",
      correlationId,
    },
  };
}
