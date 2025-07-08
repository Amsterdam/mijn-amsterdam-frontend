import { generatePath, type Params } from 'react-router';

import {
  isVergunningExpirable,
  isVergunningExpired,
  type VergunningAanvraag,
  type VergunningExpirable,
} from './Vergunningen-helpers.ts';
import {
  DecosZaakBase,
  WithDateRange,
} from '../../../../server/services/decos/decos-types.ts';
import { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types.ts';
import { dateSort } from '../../../../universal/helpers/date.ts';
import { LinkProps } from '../../../../universal/types/App.types.ts';
import { DisplayProps } from '../../../components/Table/TableV2.types.ts';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../config/app.ts';
import type { ThemaRoutesConfig } from '../../../config/thema-types.ts';

type VergunningFrontendDisplayProps = DisplayProps<VergunningFrontend>;

type VergunningFrontendExpireableDisplayProps = DisplayProps<
  VergunningFrontend & VergunningFrontend<DecosZaakBase & WithDateRange>
>;

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

const displayPropsHuidigeVergunningen: VergunningFrontendExpireableDisplayProps =
  {
    props: {
      detailLinkComponent: 'Zaaknummer',
      title: 'Soort vergunning',
      dateStartFormatted: 'Startdatum',
      dateEndFormatted: 'Einddatum',
    },
    colWidths: {
      large: ['20%', '45%', '15%', '15%'],
      small: ['50%', '50%', '0', '0'],
    },
  };

const displayPropsLopendeAanvragen: VergunningFrontendDisplayProps = {
  props: {
    detailLinkComponent: 'Zaaknummer',
    title: 'Soort vergunning',
    displayStatus: 'Status',
    dateRequestFormatted: 'Aangevraagd op',
  },
  colWidths: {
    large: ['20%', '45%', '15%', '15%'],
    small: ['50%', '50%', '0', '0'],
  },
};

const displayPropsEerdereVergunningen: VergunningFrontendDisplayProps = {
  props: {
    detailLinkComponent: 'Zaaknummer',
    title: 'Soort vergunning',
    displayStatus: 'Status',
  },
  colWidths: {
    large: ['20%', '45%', '35%'],
    small: ['50%', '50%', '0'],
  },
};

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
export const themaTitle = 'Vergunningen en ontheffingen';

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
    filter: (vergunning: VergunningAanvraag | VergunningExpirable) => {
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
