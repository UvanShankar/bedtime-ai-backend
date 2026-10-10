import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const requestId = (req.headers["x-request-id"] as string) || `req_${Date.now()}`;

  const isAppError =
    err instanceof AppError ||
    err?.name === "AppError" ||
    (Boolean(err?.statusCode) && Boolean(err?.code));

  if (isAppError) {
    return res.status(err.statusCode || 500).json({
      error: {
        code: err.code,
        message: err.message,
        requestId,
        details: err.details,
      },
    });
  }

  // Handle Multer upload errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: {
          code: "FILE_TOO_LARGE",
          message: "Uploaded voice file exceeds size limit",
          requestId,
        },
      });
    }
    return res.status(400).json({
      error: {
        code: "INVALID_AUDIO",
        message: `File upload error: ${err.message}`,
        requestId,
      },
    });
  }

  console.error(`[Unhandled Error] [${requestId}]`, err);

  return res.status(err?.statusCode || err?.status || 500).json({
    error: {
      code: err?.code || "INTERNAL_ERROR",
      message: err?.message || "An internal server error occurred while processing your request",
      requestId,
    },
  });
}
