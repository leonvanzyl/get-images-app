export class InsufficientCreditsError extends Error {
  public readonly code = "INSUFFICIENT_CREDITS" as const;

  constructor(message: string) {
    super(message);
    this.name = "InsufficientCreditsError";
  }
}
