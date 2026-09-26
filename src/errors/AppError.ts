export type ErrorCode =
  | "INVALID_REQUEST"
  | "NOT_FOUND"
  | "FILE_TOO_LARGE"
  | "INVALID_AUDIO"
  | "VOICE_CONSENT_REQUIRED"
  | "VOICE_UPLOAD_FAILED"
  | "VOICE_CLONE_FAILED"
  | "STYLE_ANALYSIS_FAILED"
  | "STORY_GENERATION_FAILED"
  | "STORY_VALIDATION_FAILED"
  | "TTS_FAILED"
  | "AUDIO_UPLOAD_FAILED"
  | "UNKNOWN_ERROR";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code: ErrorCode = "UNKNOWN_ERROR", statusCode = 500, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string, code: ErrorCode = "INVALID_REQUEST", details?: unknown): AppError {
    return new AppError(message, code, 400, details);
  }

  static notFound(message: string): AppError {
    return new AppError(message, "NOT_FOUND", 404);
  }

  static consentRequired(message = "Voice cloning requires explicit consent"): AppError {
    return new AppError(message, "VOICE_CONSENT_REQUIRED", 400);
  }

  static internal(message: string, code: ErrorCode = "UNKNOWN_ERROR", details?: unknown): AppError {
    return new AppError(message, code, 500, details);
  }
}
