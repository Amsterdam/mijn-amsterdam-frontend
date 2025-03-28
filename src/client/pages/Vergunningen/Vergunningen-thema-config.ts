import { generatePath } from 'react-router-dom';

import { VergunningFrontend } from '../../../server/services/vergunningen/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { LinkProps } from '../../../universal/types/App.types';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';

type VergunningFrontendDisplayProps = DisplayProps<
  WithDetailLinkComponent<VergunningFrontend>
>;

export const displayPropsHuidigeVergunningen: VergunningFrontendDisplayProps = {
  detailLinkComponent: 'Kenmerk',
  title: 'Omschrijving',
  dateStartFormatted: 'Startdatum',
  dateEndFormatted: 'Einddatum',
};

export const displayPropsLopendeAanvragen: VergunningFrontendDisplayProps = {
  detailLinkComponent: 'Kenmerk',
  title: 'Omschrijving',
  dateRequestFormatted: 'Aangevraagd',
};

export const displayPropsEerdereVergunningen: VergunningFrontendDisplayProps = {
  detailLinkComponent: 'Kenmerk',
  title: 'Omschrijving',
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

export const routes = {
  themePage: AppRoutes.VERGUNNINGEN,
  detailPage: AppRoutes['VERGUNNINGEN/DETAIL'],
  listPage: AppRoutes['VERGUNNINGEN/LIST'],
} as const;

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
    listPageRoute: generatePath(routes.listPage, {
      kind: listPageParamKind.historic,
    }),
  },
} as const;

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/ondernemen/vergunningen/wevos/',
    title: 'Ontheffing RVV en TVM aanvragen',
  },
];
