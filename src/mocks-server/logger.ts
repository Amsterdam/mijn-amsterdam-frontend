import pino from 'pino';

const LOG_LEVEL = process.env.LOG_LEVEL;

const options: pino.LoggerOptions = {
  enabled: !!LOG_LEVEL,
  level: LOG_LEVEL,
  transport: {
    target: 'pino-pretty',
  },
};

export const logger = pino(options);
