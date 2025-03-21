import styles from './Vergunningen.module.scss';
import {
  Vergunning,
  VergunningExpirable,
} from '../../../server/services/vergunningen/vergunningen';
import { VergunningFrontendV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { dateSort } from '../../../universal/helpers/date';
import { isExpired } from '../../../universal/helpers/vergunningen';

const displayPropsHuidigeVergunningen = {
  identifier: 'Kenmerk',
  title: 'Soort vergunning',
  dateStartFormatted: 'Startdatum',
  dateEndFormatted: 'Einddatum',
};

const displayPropsParkerenHuidigeVergunningen = {
  identifier: 'Kenmerk',
  title: 'Omschrijving',
  dateRequestFormatted: 'Aangevraagd',
};

const displayPropsLopendeAanvragen = {
  identifier: 'Kenmerk',
  title: 'Omschrijving',
  dateRequestFormatted: 'Aangevraagd',
};

const displayPropsEerdereVergunningen = {
  identifier: 'Kenmerk',
  title: 'Omschrijving',
  decision: 'Resultaat',
};

export const listPageParamKind = {
  actual: 'huidige-vergunningen-en-ontheffingen',
  historic: 'eerdere-vergunningen-en-ontheffingen',
  inProgress: 'lopende-aanvragen',
} as const;

type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

function isVergunningExpirable(
  vergunning: Vergunning | VergunningFrontendV2
): vergunning is VergunningExpirable {
  return (vergunning as VergunningExpirable).dateEnd !== undefined;
}

export const tableConfig = {
  [listPageParamKind.inProgress]: {
    title: 'Lopende aanvragen',
    filter: (vergunning: VergunningFrontendV2 | Vergunning) =>
      !vergunning.processed,
    sort: dateSort('dateRequest', 'desc'),
    displayProps: displayPropsLopendeAanvragen,
    className: styles.VergunningenTableThemaPagina,
  },
  [listPageParamKind.actual]: {
    title: 'Huidige vergunningen en ontheffingen',
    filter: (vergunning: VergunningFrontendV2 | Vergunning) => {
      const isCurrentlyActivePermit =
        vergunning.processed && vergunning.decision === 'Verleend';

      if (isVergunningExpirable(vergunning)) {
        return isCurrentlyActivePermit && !isExpired(vergunning, new Date());
      }
      // Assume if something is not expirable then it's not expired.
      return isCurrentlyActivePermit;
    },
    sort: dateSort('dateEnd', 'asc'),
    displayProps: FeatureToggle.vergunningenV2Active
      ? displayPropsHuidigeVergunningen
      : displayPropsParkerenHuidigeVergunningen,
    className: styles.VergunningenTableThemaPagina,
  },
  [listPageParamKind.historic]: {
    title: 'Eerdere en niet verleende vergunningen en ontheffingen',
    filter: (vergunning: VergunningFrontendV2 | Vergunning) => {
      if (vergunning.processed && vergunning.decision !== 'Verleend') {
        return true;
      }

      if (isVergunningExpirable(vergunning)) {
        return (
          vergunning.processed &&
          vergunning.decision === 'Verleend' &&
          isExpired(vergunning, new Date())
        );
      }

      return false;
    },
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayPropsEerdereVergunningen,
    className: styles.VergunningenTableThemaPagina,
  },
} as const;
