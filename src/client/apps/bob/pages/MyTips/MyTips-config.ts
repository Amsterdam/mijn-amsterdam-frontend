import { isEnabled } from '../../config/feature-toggles.ts';

export const themaId = 'TIPS' as const;
export const themaTitle = 'Alle tips' as const;

export const themaConfig = {
  profileTypes: ['private'],
  featureToggle: {
    enableNewTipsDesign: isEnabled('MELDINGEN.newTipsDesign'),
  },
};

export const MY_TIPS_PAGE_DOCUMENT_TITLE = `${themaTitle} | Mijn Amsterdam`;
