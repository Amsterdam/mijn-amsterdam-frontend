import { generatePath } from 'react-router';

import { isVergunning } from './helper';
import type { VarenZakenFrontend } from '../../../../server/services/varen/config-and-types';
import { IS_PRODUCTION } from '../../../../universal/config/env';
import { dateSort } from '../../../../universal/helpers/date';
import { LinkProps } from '../../../../universal/types/App.types';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../../components/Table/TableV2.types';
import { TrackingConfig } from '../../../config/routes';
import type { ThemaRoutesConfig } from '../../../config/thema-types';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA = 5;

const listPageParamKind = {
  inProgress: 'lopende-aanvragen',
  actief: 'actieve-vergunningen',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const featureToggle = {
  varenActive: !IS_PRODUCTION,
};

export const themaId = 'VAREN' as const;
export const themaTitle = 'Passagiers- en beroepsvaart' as const;

export const routeConfig = {
  detailPage: {
    path: '/passagiers-en-beroepsvaart/vergunning/:caseType/:id',
    trackingUrl(match) {
      return `/passagiers-en-beroepsvaart/vergunning/${match.params.caseType ?? ''}`;
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

const tableConfigSort = {
  sort: dateSort('dateRequest', 'desc'),
};

type TableConfig<T> = {
  title: string;
  filter: (vergunning: T) => boolean;
  sort: (a: T, b: T) => number;
  displayProps: DisplayProps<T>;
  listPageRoute: string;
  maxItems: number;
};

type TableConfigByKind<T> = Record<ListPageParamKind, TableConfig<T>>;

export const tableConfig: TableConfigByKind<
  WithDetailLinkComponent<VarenZakenFrontend>
> = {
  [listPageParamKind.inProgress]: {
    title: 'Lopende aanvragen',
    filter: (vergunning: VarenZakenFrontend) => !vergunning.processed,
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.inProgress,
      page: null,
    }),
    displayProps: {
      detailLinkComponent: 'Naam vaartuig',
      title: 'Omschrijving',
      dateRequestFormatted: 'Aangevraagd',
      displayStatus: 'Status',
    },
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    ...tableConfigSort,
  },
  [listPageParamKind.actief]: {
    title: 'Actieve vergunningen',
    filter: isVergunning,
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.actief,
      page: null,
    }),
    displayProps: {
      detailLinkComponent: 'Naam vaartuig',
      title: 'Omschrijving',
      dateDecisionFormatted: 'Datum besluit',
      decision: 'Resultaat',
    },
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    ...tableConfigSort,
  },
} as const;

export const varenMeerInformatieLink: LinkProps = {
  to: 'https://www.amsterdam.nl/verkeer-vervoer/varen-amsterdam/varen-beroepsvaart/#:~:text=De%20passagiersvaart%20in%20Amsterdam%20is,stad%20willen%20we%20graag%20behouden.',
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

export function getVarenDetailPageDocumentTitle(themaTitle: string) {
  return <T extends Record<string, string>>(
    config: TrackingConfig,
    params: T | null
  ) => {
    switch (params?.caseType) {
      case 'exploitatievergunning':
        return `Exploitatievergunning | ${themaTitle}`;
      default:
        return `Vergunning | ${themaTitle}`;
    }
  };
}
