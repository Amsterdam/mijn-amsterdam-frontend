import { IS_PRODUCTION } from '../../../../../universal/config/env.ts';

export const themaId = 'TIPS' as const;
export const themaTitle = 'Alle tips' as const;

export const featureToggle = {
  newTipsDesign: !IS_PRODUCTION,
};

export const themaConfig = {
  profileTypes: ['private'],
};

export const MY_TIPS_PAGE_DOCUMENT_TITLE = `${themaTitle} | Mijn Amsterdam`;
