import { VergunningFrontendV2 } from '../../../server/services/vergunningen/config-and-types';
import { dateSort } from '../../../universal/helpers/date';

export const displayPropsHuidigeVergunningen = {
  identifier: 'Kenmerk',
  title: 'Omschrijving',
  dateStartFormatted: 'Startdatum',
  dateEndFormatted: 'Einddatum',
} as const;

export const displayPropsLopendeAanvragen = {
  identifier: 'Kenmerk',
  title: 'Omschrijving',
  dateRequestFormatted: 'Aangevraagd',
} as const;

export const displayPropsEerdereVergunningen = {
  identifier: 'Kenmerk',
  title: 'Omschrijving',
  decision: 'Resultaat',
} as const;

export const listPageParamKind = {
  actual: 'huidige-vergunningen-en-ontheffingen',
  historic: 'eerdere-vergunningen-en-ontheffingen',
  inProgress: 'lopende-aanvragen',
} as const;

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
    className: styles.VergunningenTableThemaPagina,
  },
  [listPageParamKind.actual]: {
    title: 'Huidige vergunningen en ontheffingen',
    filter: (vergunning: VergunningFrontendV2) => {
      const isCurrentlyActivePermit =
        vergunning.processed && vergunning.decision === 'Verleend';

      if (isVergunningExpirable(vergunning)) {
        return isCurrentlyActivePermit && vergunning.isExpired !== true;
      }
      // Assume if something is not expirable then it's not expired.
      return isCurrentlyActivePermit;
    },
    sort: dateSort('dateEnd', 'asc'),
    displayProps: displayPropsHuidigeVergunningen,
    className: styles.VergunningenTableThemaPagina,
  },
  [listPageParamKind.historic]: {
    title: 'Eerdere en niet verleende vergunningen en ontheffingen',
    filter: (vergunning: VergunningFrontendV2) => {
      if (vergunning.processed && vergunning.decision !== 'Verleend') {
        return true;
      }

      if (isVergunningExpirable(vergunning)) {
        return (
          vergunning.processed &&
          vergunning.decision === 'Verleend' &&
         vergunning.isExpired === true
        );
      }

      return false;
    },
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayPropsEerdereVergunningen,
    className: styles.VergunningenTableThemaPagina,
  },
} as const;
