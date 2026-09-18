import { IS_PRODUCTION } from '../../../../../universal/config/env.ts';

export const themaTitle = 'Alle tips' as const;

export const featureToggle = {
  newTipsDesign: !IS_PRODUCTION,
};

export const MY_TIPS_PAGE_DOCUMENT_TITLE = `${themaTitle} | Mijn Amsterdam`;
