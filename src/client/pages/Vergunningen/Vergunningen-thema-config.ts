import { VergunningFrontendV2 } from '../../../server/services/vergunningen/config-and-types';
import { dateSort } from '../../../universal/helpers/date';

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

function isVergunningExpirable(vergunning: VergunningFrontendV2) {
  // TODO: is this the correct check ?
  return 'isExpired' in vergunning;
}

export const tableConfig = {
  [listPageParamKind.inProgress]: {
    title: 'Lopende aanvragen',
    filter: (vergunning: VergunningFrontendV2) => !vergunning.processed,
    sort: dateSort('dateRequest', 'desc'),
    displayProps: displayPropsLopendeAanvragen,
  },
  [listPageParamKind.actual]: {
    title: 'Huidige vergunningen en ontheffingen',
    filter: (vergunning: VergunningFrontendV2) => {
      if (isVergunningExpirable(vergunning)) {
        return (
          vergunning.decision === 'Verleend' &&
          'isExpired' in vergunning &&
          vergunning.isExpired !== true
        );
      }
      // Assume if something is not expirable then it's not expired.
      return (
        vergunning.status === 'Afgehandeld' &&
        vergunning.decision === 'Verleend'
      );
    },
    sort: dateSort('dateEnd', 'asc'),
    displayProps: displayPropsHuidigeVergunningen,
  },
  [listPageParamKind.historic]: {
    title: 'Eerdere en niet verleende vergunningen en ontheffingen',
    filter: (vergunning: VergunningFrontendV2) => {
      if (isVergunningExpirable(vergunning)) {
        return (
          vergunning.decision === 'Verleend' && vergunning.isExpired === true
        );
      }
      return (
        vergunning.status === 'Afgehandeld' &&
        vergunning.decision !== 'Verleend'
      );
    },
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayPropsEerdereVergunningen,
  },
};
