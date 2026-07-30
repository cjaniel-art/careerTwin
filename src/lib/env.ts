import { z } from "zod";

/**
 * Central environment contract. Every variable the app can read must be declared
 * here — no ad-hoc `process.env.X` elsewhere (see src/lib/errors and CLAUDE conventions).
 *
 * Variables are optional at the schema level so that `next build` / unit tests can run
 * without live credentials. Each infrastructure adapter that actually needs a variable
 * calls `requireEnv(name)` at construction time, which throws a typed, explicit
 * `MissingEnvironmentConfigError` instead of falling back to a fabricated value.
 * In production (NODE_ENV=production) this means the app fails fast and loudly instead
 * of silently running against a fake/dev backend.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  AI_PROVIDER_API_KEY: z.string().min(1).optional(),
  AI_PROVIDER_MODEL: z.string().min(1).optional(),

  ANALYTICS_WRITE_KEY: z.string().min(1).optional(),

  RESUME_UPLOAD_MAX_MB: z.coerce.number().positive().default(5),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // Invalid (present but malformed) values are always a hard failure, in every
    // environment — this is different from "absent", which requireEnv handles below.
    throw new Error(
      `Invalid environment configuration: ${parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`,
    );
  }
  return parsed.data;
}

export const env = parseEnv();

export class MissingEnvironmentConfigError extends Error {
  readonly code = "missing_external_configuration" as const;
  constructor(readonly variable: string) {
    super(
      `Missing required environment variable "${variable}". ` +
        `See .env.example for the full list of variables this deployment needs.`,
    );
    this.name = "MissingEnvironmentConfigError";
  }
}

/**
 * Reads a required variable. Throws instead of returning a fallback — callers
 * (infrastructure adapters) are expected to let this propagate on production
 * startup rather than catch it and substitute a mock.
 */
export function requireEnv<K extends keyof Env>(key: K): NonNullable<Env[K]> {
  const value = env[key];
  if (value === undefined || value === null || value === "") {
    throw new MissingEnvironmentConfigError(key);
  }
  return value as NonNullable<Env[K]>;
}

export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
