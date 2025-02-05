import { LoggerOptions, pino } from 'pino';

import { IS_DEVELOPMENT } from '../universal/config/env';

const loggerEnabledKey = 'LOGGER_ENABLED';
const LOGGER_ENABLED = process.env[loggerEnabledKey];

if (!(LOGGER_ENABLED && ['true', 'false'].includes(LOGGER_ENABLED))) {
  throw Error(
    `${loggerEnabledKey} not defined. please define this environment variable
 as either a 'true' or 'false' string`
  );
}

const logLevelKey = 'LOG_LEVEL';
const LOG_LEVEL = process.env[logLevelKey];

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
  throw Error(
    `${logLevelKey} not defined.
Please define this environment variable as either ${logLevels.join(', ')}`
  );
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

export const log = pino(options);
