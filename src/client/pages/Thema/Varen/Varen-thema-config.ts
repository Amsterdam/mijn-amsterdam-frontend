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
import type { ThemaRoutesConfig } from '../../../config/thema-types';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA = 5;

// Aanvragen before this date will not be correctly linked to their vergunningen. These are not showed
export const SHOW_HISTORICAL_AANVRAGEN_STARTING_FROM_DATE = new Date(
  '2025-08-25T00:00:00'
);

export const listPageParamKind = {
  inProgress: 'lopende-aanvragen',
  actief: 'actieve-vergunningen',
  historic: 'afgehandelde-aanvragen',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const featureToggle = {
  varenActive: !IS_PRODUCTION,
};

export const themaId = 'VAREN' as const;
export const themaTitle = 'Passagiers- en beroepsvaart' as const;

export const routeConfig = {
  detailPageZaak: {
    path: '/passagiers-en-beroepsvaart/vergunningen/:caseType/:id',
    trackingUrl(params) {
      return `/passagiers-en-beroepsvaart/vergunningen/${params?.caseType ?? ''}`;
    },
    documentTitle: getVarenDetailPageDocumentTitle(themaTitle),
  },
  detailPageVergunning: {
    path: '/passagiers-en-beroepsvaart/vergunningen/:id',
    trackingUrl(params) {
      return `/passagiers-en-beroepsvaart/vergunning/${params?.caseType ?? ''}`;
    },
    documentTitle: getVarenDetailPageDocumentTitle(themaTitle),
  },
  listPage: {
    path: '/passagiers-en-beroepsvaart/vergunningen/lijst/:kind/:page?',
    documentTitle: getVarenListPageDocumentTitle(themaTitle),
  },
  themaPage: {
    path: '/passagiers-en-beroepsvaart',
    documentTitle: `${themaTitle} | overzicht`,
  },
} as const satisfies ThemaRoutesConfig;

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
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.inProgress,
      page: null,
    }),
    displayProps: {
      props: {
        detailLinkComponent: 'Naam vaartuig',
        title: 'Omschrijving',
        dateRequestFormatted: 'Aangevraagd',
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
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.actief,
      page: null,
    }),
    displayProps: {
      props: {
        detailLinkComponent: 'Naam vaartuig',
        title: 'Omschrijving',
      },
      colWidths: {
        large: ['25%', '75%', '0', '0'],
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
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.inProgress,
      page: null,
    }),
    displayProps: {
      props: {
        detailLinkComponent: 'Naam vaartuig',
        title: 'Omschrijving',
        dateDecisionFormatted: 'Datum besluit',
        displayStatus: 'Status',
      },
      colWidths: {
        large: ['25%', '35%', '20%', '20%'],
        small: ['50%', '50%', '0', '0'],
      },
    },
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  },
} as const;

export const varenMeerInformatieLink: LinkProps = {
  to: 'https://www.amsterdam.nl/ondernemen/vergunning-passagiersvaart-wijzigen',
  title: 'Meer informatie over passagiers- en beroepsvaart',
} as const;

export const varenLegesTableLink: LinkProps = {
  to: 'https://lokaleregelgeving.overheid.nl/CVDR728175#bijlage_1.',
  title: 'Legestabel',
} as const;

const formulierenBaseUrl = `https://formulieren${IS_PRODUCTION ? '' : '.acc'}.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam`;
export const exploitatieVergunningAanvragen: LinkProps = {
  to: `${formulierenBaseUrl}/VARExploitatievergunningAanvragen.aspx`,
  title: 'Exploitatievergunning aanvragen',
} as const;

export const exploitatieVergunningWijzigenLink: (
  key: string,
  title?: string
) => LinkProps = (key, title = 'Wijzigen') => ({
  to: `${formulierenBaseUrl}/VARExploitatievergunningWijzigen.aspx?guid=${key}`,
  title,
});

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
