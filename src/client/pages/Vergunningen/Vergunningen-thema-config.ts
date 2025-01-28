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
  title: 'Soort vergunning',
  dateStartFormatted: 'Startdatum',
  dateEndFormatted: 'Einddatum',
};

export const displayPropsLopendeAanvragen: VergunningFrontendDisplayProps = {
  detailLinkComponent: 'Kenmerk',
  title: 'Soort vergunning',
  dateRequestFormatted: 'Aangevraagd',
};

export const displayPropsEerdereVergunningen: VergunningFrontendDisplayProps = {
  detailLinkComponent: 'Kenmerk',
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

function isVergunningExpirable(vergunning: VergunningFrontend) {
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
    filter: (vergunning: VergunningFrontend) => !vergunning.processed,
    sort: dateSort('dateRequest', 'desc'),
    displayProps: displayPropsLopendeAanvragen,
    listPageRoute: generatePath(routes.listPage, {
      kind: listPageParamKind.inProgress,
    }),
  },
  [listPageParamKind.actual]: {
    title: 'Huidige vergunningen en ontheffingen',
    filter: (vergunning: VergunningFrontend) => {
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
    listPageRoute: generatePath(routes.listPage, {
      kind: listPageParamKind.actual,
    }),
  },
  [listPageParamKind.historic]: {
    title: 'Eerdere en niet verleende vergunningen en ontheffingen',
    filter: (vergunning: VergunningFrontend) => {
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
    listPageRoute: generatePath(routes.listPage, {
      kind: listPageParamKind.historic,
    }),
  },
};

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/ondernemen/vergunningen/wevos/',
    title: 'Ontheffing RVV en TVM aanvragen',
  },
];
