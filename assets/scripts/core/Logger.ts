export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
  Silent = 4,
}

class LoggerImpl {
  private level: LogLevel = LogLevel.Debug;

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  debug(tag: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.Debug) console.log(`[D][${tag}]`, ...args);
  }

  info(tag: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.Info) console.log(`[I][${tag}]`, ...args);
  }

  warn(tag: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.Warn) console.warn(`[W][${tag}]`, ...args);
  }

  error(tag: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.Error) console.error(`[E][${tag}]`, ...args);
  }
}

export const Logger = new LoggerImpl();
