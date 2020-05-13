import { IS_PRODUCTION } from './env';

export const API_BASE_PATH = IS_PRODUCTION ? '/api' : '/api-test';
