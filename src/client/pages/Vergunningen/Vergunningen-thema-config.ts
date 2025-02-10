import { generatePath } from 'react-router-dom';

import styles from './Vergunningen.module.scss';
import { VergunningFrontend } from '../../../server/services/vergunningen/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { LinkProps } from '../../../universal/types/App.types';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';

type VergunningFrontendDisplayProps = DisplayProps<
  WithDetailLinkComponent<VergunningFrontend>
>;

// Created because the tableconfig here is also used for other types of Vergunning, for example ToeristischeVerhuurVergunning.
// This type extends Decos and PowerBrowser types and the type below satisfies both of them.
type VergunningPropsCommon = {
  processed: boolean;
  decision: string | null;
  isExpired?: boolean;
};

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

export const displayPropsHuidigeVergunningen: VergunningFrontendDisplayProps = {
  detailLinkComponent: 'Kenmerk',
  title: 'Omschrijving',
  dateStartFormatted: 'Startdatum',
  dateEndFormatted: 'Einddatum',
};

export const displayPropsLopendeAanvragen: VergunningFrontendDisplayProps = {
  detailLinkComponent: 'Kenmerk',
  title: 'Omschrijving',
  status: 'Status',
  dateRequestFormatted: 'Aangevraagd op',
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

function isVergunningExpirable(vergunning: { isExpired?: boolean }) {
  // isExpired is only present on vergunningen that have an end date.
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
    filter: <T extends VergunningPropsCommon>(vergunning: T) =>
      !vergunning.processed,
    sort: dateSort('dateRequest', 'desc'),
    displayProps: displayPropsLopendeAanvragen,
    listPageRoute: generatePath(routes.listPage, {
      kind: listPageParamKind.inProgress,
    }),
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG,
    className: styles.VergunningenTableThemaPagina,
  },
  [listPageParamKind.actual]: {
    title: 'Huidige vergunningen en ontheffingen',
    filter: <T extends VergunningPropsCommon>(vergunning: T) => {
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
    listPageRoute: generatePath(routes.listPage, {
      kind: listPageParamKind.actual,
    }),
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG,
    className: styles.VergunningenTableThemaPagina,
  },
  [listPageParamKind.historic]: {
    title: 'Eerdere en niet verleende vergunningen en ontheffingen',
    filter: <T extends VergunningPropsCommon>(vergunning: T) => {
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
    listPageRoute: generatePath(routes.listPage, {
      kind: listPageParamKind.historic,
    }),
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER,
    className: styles.VergunningenTableThemaPagina,
  },
} as const;

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/ondernemen/vergunningen/wevos/',
    title: 'Ontheffing RVV en TVM aanvragen',
  },
];
