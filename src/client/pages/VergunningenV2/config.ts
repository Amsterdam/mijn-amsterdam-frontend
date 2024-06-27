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
