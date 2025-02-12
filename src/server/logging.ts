import { LoggerOptions, pino } from 'pino';

import { IS_DEVELOPMENT } from '../universal/config/env';

const loggerEnabledKey = 'LOGGER_ENABLED';
export let LOGGER_ENABLED = process.env[loggerEnabledKey];

if (!(LOGGER_ENABLED && ['true', 'false'].includes(LOGGER_ENABLED))) {
  // eslint-disable-next-line no-console
  console.error(
    `${loggerEnabledKey} not defined. please define this environment variable
 as either a 'true' or 'false' string`
  );
  LOGGER_ENABLED = 'false';
}

const logLevelKey = 'LOG_LEVEL';
let LOG_LEVEL = process.env[logLevelKey];

// Source: https://getpino.io/#/docs/api?id=level-string
const logLevels = [
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'silent',
];

if (!(LOG_LEVEL && logLevels.includes(LOG_LEVEL))) {
  // eslint-disable-next-line no-console
  console.error(
    `${logLevelKey} not defined and is now set to 'info'.
Please define this environment variable as either ${logLevels.join(', ')}`
  );
  LOG_LEVEL = 'info';
}

// Enable pretty printing for readability in the terminal.
const transport = IS_DEVELOPMENT
  ? {
      target: 'pino-pretty',
    }
  : undefined;

const options: LoggerOptions = {
  enabled: LOGGER_ENABLED === 'true',
  level: LOG_LEVEL,
  transport,
};

export const logger = pino(options);
export const requestLogger = pino({ ...options, enabled: true });
