import { AppError } from "./app-error";

export class HttpError extends AppError {
  constructor(message: string, statusCode = 500, context?: string) {
    super(message, statusCode, true, context);
  }
}
