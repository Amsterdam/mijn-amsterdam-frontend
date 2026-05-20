import type { MockServerLogger } from './types.ts';

function format(message: string): string {
  return `[mocks-server] ${message}\n`;
}

export const logger: MockServerLogger = {
  debug(message: string) {
    process.stdout.write(format(message));
  },
  info(message: string) {
    process.stdout.write(format(message));
  },
  warn(message: string) {
    process.stdout.write(format(message));
  },
  error(message: string) {
    process.stderr.write(format(message));
  },
};
