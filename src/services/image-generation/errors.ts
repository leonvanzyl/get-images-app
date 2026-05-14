export class ImageGenerationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ImageGenerationError";
  }
}

export class ConfigError extends ImageGenerationError {
  constructor(message: string) {
    super(message, "CONFIG_ERROR");
    this.name = "ConfigError";
  }
}

export class ProviderError extends ImageGenerationError {
  constructor(
    message: string,
    public override readonly cause?: unknown,
  ) {
    super(message, "PROVIDER_ERROR");
    this.name = "ProviderError";
  }
}

export class ValidationError extends ImageGenerationError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export function isKnownGenerationError(error: unknown): error is Error {
  if (!(error instanceof Error)) return false;
  const code = (error as Error & { code?: unknown }).code;
  return (
    (typeof code === "string" &&
      (code === "VALIDATION_ERROR" ||
        code === "INSUFFICIENT_CREDITS" ||
        code === "CREDIT_ERROR" ||
        code === "USER_ERROR")) ||
    error.name === "ValidationError" ||
    error.name === "InsufficientCreditsError"
  );
}
