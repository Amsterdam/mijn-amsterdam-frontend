import type { AMSAPP_PROTOCOl } from './amsapp-service-config';

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
  appHref?: `${typeof AMSAPP_PROTOCOl}${'stadspas' | 'mijn-amsterdam'}/${'gelukt' | 'mislukt'}${string}`;
};
