import { generatePath, type Params } from 'react-router';

import {
  isVergunningExpirable,
  isVergunningExpired,
  type VergunningAanvraag,
  type VergunningExpirable,
} from './Vergunningen-helpers';
import {
  DecosZaakBase,
  WithDateRange,
} from '../../../../server/services/decos/config-and-types';
import { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types';
import { dateSort } from '../../../../universal/helpers/date';
import { LinkProps } from '../../../../universal/types/App.types';
import { withOmitDisplayPropsForSmallScreens } from '../../../components/Table/helpers';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../../components/Table/TableV2.types';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../config/app';
import type { ThemaRoutesConfig } from '../../../config/thema-types';

type VergunningFrontendDisplayProps = DisplayProps<
  WithDetailLinkComponent<VergunningFrontend>
>;

type VergunningFrontendExpireableDisplayProps = DisplayProps<
  WithDetailLinkComponent<
    VergunningFrontend & VergunningFrontend<DecosZaakBase & WithDateRange>
  >
>;

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
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const featureToggle = {
  vergunningenActive: true,
};

export const themaId = 'VERGUNNINGEN' as const;
export const themaTitle = 'Vergunningen';

export const routeConfig = {
  detailPage: {
    path: '/vergunningen/:caseType/:id',
    trackingUrl(params) {
      return `/vergunningen/${params?.caseType}`;
    },
    documentTitle: `Vergunningen | ${themaTitle}`,
  },
  listPage: {
    path: '/vergunningen/lijst/:kind/:page?',
    documentTitle: getListPageDocumentTitle(themaTitle),
  },
  themaPage: {
    path: '/vergunningen',
    documentTitle: `${themaTitle} | overzicht`,
  },
} as const satisfies ThemaRoutesConfig;

export const tableConfig = {
  [listPageParamKind.inProgress]: {
    title: 'Lopende aanvragen',
    filter: (vergunning: VergunningAanvraag) => !vergunning.processed,
    sort: dateSort('dateRequest', 'desc'),
    displayProps: displayPropsLopendeAanvragen,
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.inProgress,
      page: null,
    }),
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG,
  },
  [listPageParamKind.actual]: {
    title: 'Huidige vergunningen en ontheffingen',
    filter: (vergunning: VergunningExpirable) => {
      if (isVergunningExpirable(vergunning)) {
        return !isVergunningExpired(vergunning);
      }
      return false;
    },
    sort: dateSort('dateEnd', 'asc'),
    displayProps: displayPropsHuidigeVergunningen,
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.actual,
      page: null,
    }),
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG,
  },
  [listPageParamKind.historic]: {
    title: 'Eerdere en niet verleende vergunningen en ontheffingen',
    filter: (vergunning: VergunningAanvraag) => {
      if (isVergunningExpirable(vergunning)) {
        return isVergunningExpired(vergunning);
      }

      return vergunning.processed;
    },
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayPropsEerdereVergunningen,
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.historic,
      page: null,
    }),
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER,
  },
} as const;

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/ondernemen/vergunningen/wevos/',
    title: 'Ontheffing RVV en TVM aanvragen',
  },
];

export function getListPageDocumentTitle(themaTitle: string) {
  return <T extends Params<string>>(params: T | null): string => {
    const kind = params?.kind as ListPageParamKind;
    return kind in tableConfig
      ? `${tableConfig[kind].title} | ${themaTitle}`
      : themaTitle;
  };
}
