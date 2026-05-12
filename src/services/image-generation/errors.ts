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
