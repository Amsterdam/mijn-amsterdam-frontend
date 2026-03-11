import { generatePath, type Params } from 'react-router';

import type {
  VarenVergunningFrontend,
  VarenZakenFrontend,
} from '../../../../server/services/varen/config-and-types';
import { IS_PRODUCTION } from '../../../../universal/config/env';
import {
  dateSort,
  isDateInFuture,
  isDateInPast,
} from '../../../../universal/helpers/date';
import { LinkProps } from '../../../../universal/types/App.types';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import type {
  PageConfig,
  ThemaConfigBase,
  WithListPage,
} from '../../../config/thema-types';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_AFGEHANDELD = 3;

// Aanvragen before this date will not be correctly linked to their vergunningen. These are not showed
export const SHOW_HISTORICAL_AANVRAGEN_STARTING_FROM_DATE = new Date(
  '2025-07-16T23:59:59'
);

export const listPageParamKind = {
  inProgress: 'lopende-aanvragen',
  actief: 'actieve-vergunningen',
  historic: 'afgehandelde-aanvragen',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

const THEMA_ID = 'VAREN';
const THEMA_TITLE = 'Passagiersvaart';

const formulierenBaseUrl = `https://formulieren${IS_PRODUCTION ? '' : '.acc'}.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam`;
export const exploitatieVergunningAanvragen: LinkProps = {
  to: `${formulierenBaseUrl}/VARExploitatievergunningAanvragen.aspx`,
  title: 'Exploitatievergunning aanvragen',
} as const;

type WithDetailPageVergunning = PageConfig<'detailPageVergunning'>;
type WithDetailPageZaak = PageConfig<'detailPageZaak'>;

type VarenThemaConfig = ThemaConfigBase<typeof THEMA_ID> &
  WithListPage &
  WithDetailPageVergunning &
  WithDetailPageZaak;

export const themaConfig: VarenThemaConfig = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  profileTypes: ['commercial'],
  redactedScope: 'none',
  featureToggle: {
    active: true,
  },
  pageLinks: [
    {
      to: 'https://www.amsterdam.nl/ondernemen/vergunning-passagiersvaart-wijzigen',
      title: 'Meer informatie over passagiersvaart',
    },
    {
      to: 'https://lokaleregelgeving.overheid.nl/CVDR728175#bijlage_1.',
      title: 'Legestabel',
    },
  ],
  uitlegPageSections: [
    {
      title: THEMA_TITLE,
      listItems: [
        'Registreren van uw onderneming',
        {
          text: 'Inzien en wijzigen van uw vergunning passagiersvaart:',
          listItems: [
            'Vaartuig vervangen door een bestaand vaartuig',
            'Vaartuig vervangen door een te (ver)bouwen vaartuig',
            'Exploitatievergunning op naam van een andere onderneming zetten',
            'Vaartuig een andere naam geven',
          ],
        },
      ],
    },
  ],
  route: {
    path: '/varen',
    documentTitle: `${THEMA_TITLE} | overzicht`,
    trackingUrl: null,
  },
  listPage: {
    route: {
      path: '/varen/vergunningen/lijst/:kind/:page?',
      documentTitle: getVarenListPageDocumentTitle(THEMA_TITLE),
      trackingUrl: null,
    },
  },
  detailPageVergunning: {
    route: {
      path: '/varen/vergunningen/:id',
      trackingUrl(params) {
        return `/varen/vergunning/${params?.caseType ?? ''}`;
      },
      documentTitle: getVarenDetailPageDocumentTitle(THEMA_TITLE),
    },
  },
  detailPageZaak: {
    route: {
      path: '/varen/vergunningen/:caseType/:id',
      trackingUrl(params) {
        return `/varen/vergunningen/${params?.caseType ?? ''}`;
      },
      documentTitle: getVarenDetailPageDocumentTitle(THEMA_TITLE),
    },
  },
};

type VarenTableItem = {
  processed: boolean | undefined;
  isExpired?: boolean;
  dateRequest: string;
  dateDecision: string | null;
  dateStart: string | null;
  dateEnd: string | null;
};
type TableConfig<T> = {
  title: string;
  type: 'vergunning' | 'zaak';
  filter: (vergunning: VarenTableItem) => boolean;
  sort: (a: VarenTableItem, b: VarenTableItem) => number;
  displayProps: DisplayProps<T>;
  listPageRoute: string;
  maxItems: number;
};

export const tableConfig: {
  [listPageParamKind.inProgress]: TableConfig<VarenZakenFrontend>;
  [listPageParamKind.actief]: TableConfig<VarenVergunningFrontend>;
  [listPageParamKind.historic]: TableConfig<VarenZakenFrontend>;
} = {
  [listPageParamKind.inProgress]: {
    title: 'Lopende aanvragen',
    type: 'zaak',
    filter: (zaak) => !zaak.processed,
    sort: dateSort('dateRequest', 'desc'),
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageParamKind.inProgress,
      page: null,
    }),
    displayProps: {
      props: {
        detailLinkComponent: 'Naam vaartuig',
        title: 'Omschrijving',
        dateRequestFormatted: 'Datum aanvraag',
        displayStatus: 'Status',
      },
      colWidths: {
        large: ['25%', '35%', '20%', '20%'],
        small: ['50%', '50%', '0', '0'],
      },
    },
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  },
  [listPageParamKind.actief]: {
    title: 'Actieve vergunningen',
    type: 'vergunning',
    filter: (vergunning) =>
      !vergunning.isExpired &&
      (!vergunning.dateStart || isDateInPast(vergunning.dateStart)) &&
      (!vergunning.dateEnd || isDateInFuture(vergunning.dateEnd)),
    sort: dateSort('dateStart', 'desc'),
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageParamKind.actief,
      page: null,
    }),
    displayProps: {
      props: {
        detailLinkComponent: 'Naam vaartuig',
        title: 'Omschrijving',
        vergunningKenmerk: 'Vergunningkenmerk',
      },
      colWidths: {
        large: ['25%', '35%', '40%', '0'],
        small: ['50%', '50%', '0', '0'],
      },
    },
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  },
  [listPageParamKind.historic]: {
    title: 'Afgehandelde aanvragen',
    type: 'zaak',
    filter: (zaak) =>
      !!zaak.processed &&
      isDateInFuture(
        zaak.dateRequest,
        SHOW_HISTORICAL_AANVRAGEN_STARTING_FROM_DATE
      ),
    sort: dateSort('dateDecision', 'desc'),
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageParamKind.historic,
      page: null,
    }),
    displayProps: {
      props: {
        detailLinkComponent: 'Naam vaartuig',
        title: 'Omschrijving',
        dateDecisionFormatted: 'Datum besluit',
        displayStatus: 'Resultaat',
      },
      colWidths: {
        large: ['25%', '35%', '20%', '20%'],
        small: ['50%', '50%', '0', '0'],
      },
    },
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_AFGEHANDELD,
  },
} as const;

export const exploitatieVergunningWijzigenLink: (
  key: string,
  title?: string
) => LinkProps = (key, title = 'Wijzigen') => {
  const queryParam = new URLSearchParams({
    guid: key,
  });
  return {
    to: `${formulierenBaseUrl}/VARExploitatievergunningWijzigen.aspx?${queryParam}`,
    title,
  };
};

export const rederRegistratieLink: LinkProps = {
  to: `${formulierenBaseUrl}/VARRegistratieReder.aspx`,
  title: 'Onderneming registreren',
} as const;

export function getVarenListPageDocumentTitle(themaTitle: string) {
  return <T extends Params<string>>(params: T | null) => {
    const kind = params?.kind as ListPageParamKind;
    return kind in tableConfig
      ? `${tableConfig[kind].title} | ${themaTitle}`
      : themaTitle;
  };
}

export function getVarenDetailPageDocumentTitle(themaTitle: string) {
  return <T extends Params<string>>(params: T | null) => {
    switch (params?.caseType) {
      case 'exploitatievergunning':
        return `Exploitatievergunning | ${themaTitle}`;
      default:
        return `Vergunning | ${themaTitle}`;
    }
  };
}
