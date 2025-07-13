export type LogLevel = "debug" | "info" | "warn" | "error" | "success";

export type LogMeta = unknown;
// {
//   [key: string]: unknown;
// };

export interface LogPayload {
  timestamp: string;
  level: LogLevel;
  context?: string;
  message: string;
  meta?: LogMeta;
}
