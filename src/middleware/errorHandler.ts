import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const requestId = (req.headers["x-request-id"] as string) || `req_${Date.now()}`;

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        requestId,
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

  // Mask unknown / internal error details to prevent leaking secrets or raw provider dumps
  console.error(`[Unhandled Error] [${requestId}]`, err);

  return res.status(500).json({
    error: {
      code: "UNKNOWN_ERROR",
      message: "An internal server error occurred while processing your request",
      requestId,
    },
  });
}
