import {
  Vergunning,
  VergunningExpirable,
} from '../../../server/services/vergunningen/vergunningen';
import { VergunningFrontendV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { dateSort } from '../../../universal/helpers/date';
import { isExpired } from '../../../universal/helpers/vergunningen';

export const displayPropsHuidigeVergunningen = {
  identifier: 'Kenmerk',
  title: 'Soort vergunning',
  dateStartFormatted: 'Startdatum',
  dateEndFormatted: 'Einddatum',
};

export const displayPropsParkerenHuidigeVergunningen = {
  identifier: 'Kenmerk',
  title: 'Soort vergunning',
  dateRequestFormatted: 'Aangevraagd',
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

function isVergunningExpirable(
  vergunning: Vergunning | VergunningFrontendV2
): vergunning is VergunningExpirable {
  return (vergunning as VergunningExpirable).dateEnd !== undefined;
}

export const tableConfig = {
  [listPageParamKind.inProgress]: {
    title: 'Lopende aanvragen',
    filter: (vergunning: VergunningFrontendV2 | Vergunning) =>
      vergunning.status !== 'Afgehandeld',
    sort: dateSort('dateRequest', 'desc'),
    displayProps: displayPropsLopendeAanvragen,
  },
  [listPageParamKind.actual]: {
    title: 'Huidige vergunningen en ontheffingen',
    filter: (vergunning: VergunningFrontendV2 | Vergunning) => {
      if (FeatureToggle.vergunningenV2Active) {
        return (
          vergunning.decision === 'Verleend' &&
          'isExpired' in vergunning &&
          vergunning.isExpired !== true
        );
      }
      if (isVergunningExpirable(vergunning)) {
        return (
          (vergunning.status === 'Afgehandeld' ||
            vergunning.decision === 'Verleend') &&
          !isExpired(vergunning, new Date())
        );
      }
      // Assume if something is not expirable then it's not expired.
      return (
        vergunning.status === 'Afgehandeld' &&
        vergunning.decision === 'Verleend'
      );
    },
    sort: dateSort('dateEnd', 'asc'),
    displayProps: FeatureToggle.vergunningenV2Active
      ? displayPropsHuidigeVergunningen
      : displayPropsParkerenHuidigeVergunningen,
  },
  [listPageParamKind.historic]: {
    title: 'Eerdere en niet verleende vergunningen en ontheffingen',
    filter: (vergunning: VergunningFrontendV2 | Vergunning) => {
      if (isVergunningExpirable(vergunning)) {
        return (
          vergunning.decision === 'Verleend' &&
          isExpired(vergunning, new Date())
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
