import { LoggerOptions, pino } from 'pino';

import { IS_DEVELOPMENT } from '../universal/config/env';
import process from "node:process";

const LOG_LEVEL = process.env.LOG_LEVEL;

// Enable pretty printing for readability in the terminal.
const transport = IS_DEVELOPMENT
  ? {
      target: 'pino-pretty',
    }
  : undefined;

const options: LoggerOptions = {
  enabled: !!LOG_LEVEL,
  level: LOG_LEVEL,
  transport,
};

export const logger = pino(options);
