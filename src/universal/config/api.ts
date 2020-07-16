import { IS_AP } from './env';

export const API_BASE_PATH = IS_AP ? '/api' : '/test-api';
export const COOKIE_KEY_COMMERCIAL_LOGIN = 'icl';
