import { VergunningFrontendV2 } from '../../../server/services/vergunningen-v2/config-and-types';

export const displayPropsHuidigeVergunningen = {
  identifier: 'Kenmerk',
  title: 'Soort vergunning',
  dateStartFormatted: 'Startdatum',
  dateEndFormatted: 'Einddatum',
};

export const displayPropsLopendeAanvragen = {
  identifier: 'Kenmerk',
  title: 'Soort vergunning',
  dateRequestFormatted: 'Aangevraagd',
};

export const displayPropsEerdereVergunningen = {
  identifier: 'Kenmerk',
  title: 'Soort vergunning',
  decision: 'Resultaat',
};

export const listPageParamKind = {
  actual: 'huidige-vergunningen-en-ontheffingen',
  historic: 'eerdere-vergunningen-en-ontheffingen',
  inProgress: 'lopende-aanvragen',
};

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const listPageTitle = {
  [listPageParamKind.actual]: 'Huidige vergunningen en ontheffingen',
  [listPageParamKind.historic]:
    'Eerdere en niet verleende vergunningen en ontheffingen',
};

export const tableConfig = {
  [listPageParamKind.inProgress]: {
    title: 'Lopende aanvragen',
    filter: (vergunning: VergunningFrontendV2) => !vergunning.processed,
    displayProps: displayPropsLopendeAanvragen,
  },
  [listPageParamKind.actual]: {
    title: 'Huidige vergunningen en ontheffingen',
    filter: (vergunning: VergunningFrontendV2) =>
      'isExpired' in vergunning && vergunning.isExpired !== true,
    displayProps: displayPropsHuidigeVergunningen,
  },
  [listPageParamKind.historic]: {
    title: 'Eerdere en niet verleende vergunningen en ontheffingen',
    filter: (vergunning: VergunningFrontendV2) => vergunning.processed,
    displayProps: displayPropsEerdereVergunningen,
  },
};
