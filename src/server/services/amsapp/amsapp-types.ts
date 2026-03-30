import type { AMSAPP_PROTOCOL } from './amsapp-service-config.ts';

export type ApiError = {
  code: string;
  message: string;
};
export type RenderProps = {
  nonce: string;
  promptOpenApp: boolean;
  urlToImage: string;
  urlToCSS: string;
  error?: ApiError;
  identifier?: string; // Only included in debug build.
  appHref?: `${typeof AMSAPP_PROTOCOL}${'stadspas' | 'mijn-amsterdam'}/${'gelukt' | 'mislukt'}${string}`;
};
