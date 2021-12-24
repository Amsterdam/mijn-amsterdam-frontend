import { IS_AP } from './env';

export const API_BASE_PATH = IS_AP ? '/api' : '/test-api';
export const COOKIE_KEY_AUTH_TYPE = 'authType';

export enum AuthType {
  EHERKENNING = 'E',
  DIGID = 'D',
  IRMA = 'I',
}

export enum UserTpe {
  BURGER = 'BURGER',
  BEDRIJF = 'BEDRIJF',
}
