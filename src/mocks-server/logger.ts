import { logger as appLogger } from '../server/logging.ts';

export const logger = appLogger.child({ service: 'mocks-server' });
