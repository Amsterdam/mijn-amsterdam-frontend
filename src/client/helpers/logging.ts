/* eslint-disable no-console */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = import.meta.env.DEV;

function format(level: LogLevel, message: unknown, ...args: unknown[]) {
  const timestamp = new Date().toISOString();
  return [`[${timestamp}] [${level.toUpperCase()}]`, message, ...args];
}

function log(level: LogLevel, message: unknown, ...args: unknown[]) {
  if (!isDev && level === 'debug') return;

  const formatted = format(level, message, ...args);

  switch (level) {
    case 'debug':
    case 'info':
      console.info(...formatted);
      break;
    case 'warn':
      console.warn(...formatted);
      break;
    case 'error':
      console.error(...formatted);
      break;
  }
}

export const logger = {
  debug: (msg: unknown, ...args: unknown[]) => log('debug', msg, ...args),
  info: (msg: unknown, ...args: unknown[]) => log('info', msg, ...args),
  warn: (msg: unknown, ...args: unknown[]) => log('warn', msg, ...args),
  error: (msg: unknown, ...args: unknown[]) => log('error', msg, ...args),
};
