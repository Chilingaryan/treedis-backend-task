type LogLevel = "debug" | "info" | "warn" | "error" | "success";

const LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  success: 50,
};

const DEFAULT_LEVEL: LogLevel = "info";

export type LogMeta =
  | any
  | {
      [key: string]: unknown;
    };

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  context?: string;
  message: string;
  meta?: LogMeta;
}

export class Logger {
  private constructor(private readonly context?: string) {}

  static forContext(context: string): Logger {
    return new Logger(context);
  }

  private shouldLog(level: LogLevel): boolean {
    const currentLevel = (process.env.LOG_LEVEL as LogLevel) || DEFAULT_LEVEL;
    return LEVELS[level] >= LEVELS[currentLevel];
  }

  private emit(level: LogLevel, message: string, meta?: LogMeta) {
    if (!this.shouldLog(level)) return;

    const payload: LogPayload = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...(meta && { meta }),
    };

    const icons: Record<string, string> = {
      error: "❌",
      success: "✅",
    };

    // console.table(payload);
    console.log(icons[level] ?? "", JSON.stringify(payload));
  }

  debug(message: string, meta?: LogMeta) {
    this.emit("debug", message, meta);
  }

  info(message: string, meta?: LogMeta) {
    this.emit("info", message, meta);
  }

  warn(message: string, meta?: LogMeta) {
    this.emit("warn", message, meta);
  }

  error(message: string, meta?: LogMeta) {
    this.emit("error", message, meta);
  }

  success(message: string, meta?: LogMeta) {
    this.emit("success", message, meta);
  }
}
