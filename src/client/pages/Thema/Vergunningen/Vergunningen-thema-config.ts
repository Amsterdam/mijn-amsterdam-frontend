import { generatePath } from 'react-router';

import styles from './Vergunningen.module.scss';
import {
  DecosZaakBase,
  WithDateRange,
} from '../../../../server/services/decos/config-and-types';
import { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types';
import { AppRoutes } from '../../../../universal/config/routes';
import { dateSort } from '../../../../universal/helpers/date';
import { LinkProps } from '../../../../universal/types/App.types';
import { withOmitDisplayPropsForSmallScreens } from '../../../components/Table/helpers';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../../components/Table/TableV2';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../config/app';
import { TrackingConfig } from '../../../config/routes';

type VergunningFrontendDisplayProps = DisplayProps<
  WithDetailLinkComponent<VergunningFrontend>
>;

type VergunningFrontendExpireableDisplayProps = DisplayProps<
  WithDetailLinkComponent<
    VergunningFrontend & VergunningFrontend<DecosZaakBase & WithDateRange>
  >
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

const displayPropsHuidigeVergunningenBase: VergunningFrontendExpireableDisplayProps =
  {
    detailLinkComponent: 'Kenmerk',
    title: 'Omschrijving',
    dateStartFormatted: 'Startdatum',
    dateEndFormatted: 'Einddatum',
  };

const displayPropsLopendeAanvragenBase: VergunningFrontendDisplayProps = {
  detailLinkComponent: 'Kenmerk',
  title: 'Omschrijving',
  displayStatus: 'Status',
  dateRequestFormatted: 'Aangevraagd op',
};

const displayPropsEerdereVergunningenBase: VergunningFrontendDisplayProps = {
  detailLinkComponent: 'Kenmerk',
  title: 'Omschrijving',
  displayStatus: 'Status',
};

export const displayPropsHuidigeVergunningen =
  withOmitDisplayPropsForSmallScreens(displayPropsHuidigeVergunningenBase, [
    'dateStartFormatted',
    'dateEndFormatted',
  ]);

export const displayPropsLopendeAanvragen = withOmitDisplayPropsForSmallScreens(
  displayPropsLopendeAanvragenBase,
  ['displayStatus', 'dateRequestFormatted']
);

export const displayPropsEerdereVergunningen =
  withOmitDisplayPropsForSmallScreens(displayPropsEerdereVergunningenBase, [
    'decision',
  ]);

export const listPageParamKind = {
  actual: 'huidige-vergunningen-en-ontheffingen',
  historic: 'eerdere-vergunningen-en-ontheffingen',
  inProgress: 'lopende-aanvragen',
};

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

function isVergunningExpirable(vergunning: { isExpired?: boolean }) {
  // isExpired is only present on vergunningen that have an end date.
  return 'isExpired' in vergunning;
}

export const routes = {
  themaPage: AppRoutes.VERGUNNINGEN,
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
      page: null,
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
      page: null,
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
      page: null,
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

export function getListPageDocumentTitle(themaTitle: string) {
  return <T extends Record<string, string>>(
    config: TrackingConfig,
    params: T | null
  ) => {
    const kind = params?.kind as ListPageParamKind;
    return kind in tableConfig
      ? `${tableConfig[kind].title} | ${themaTitle}`
      : themaTitle;
  };
}
