import { generatePath, type Params } from 'react-router';

import type {
  VarenVergunningFrontend,
  VarenZakenFrontend,
} from '../../../../server/services/varen/config-and-types';
import { IS_PRODUCTION } from '../../../../universal/config/env';
import { dateSort } from '../../../../universal/helpers/date';
import { LinkProps } from '../../../../universal/types/App.types';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import type { ThemaRoutesConfig } from '../../../config/thema-types';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA = 5;

export const listPageParamKind = {
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
  detailZaakPage: {
    path: '/passagiers-en-beroepsvaart/vergunningen/:caseType/:id',
    trackingUrl(params) {
      return `/passagiers-en-beroepsvaart/vergunningen/${params?.caseType ?? ''}`;
    },
    documentTitle: getVarenDetailPageDocumentTitle(themaTitle),
  },
  detailVergunningPage: {
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

type TableConfig<T> = {
  title: string;
  filter: (vergunning: T) => boolean;
  sort: (a: T, b: T) => number;
  displayProps: DisplayProps<T>;
  listPageRoute: string;
  maxItems: number;
};

export const tableConfig: {
  [listPageParamKind.inProgress]: TableConfig<VarenZakenFrontend>;
  [listPageParamKind.actief]: TableConfig<VarenVergunningFrontend>;
} = {
  [listPageParamKind.inProgress]: {
    title: 'Lopende aanvragen',
    filter: (zaak: VarenZakenFrontend) => !zaak.processed,
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
    filter: (vergunning: VarenVergunningFrontend) => !vergunning.isExpired,
    sort: dateSort('dateStart', 'desc'),
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.actief,
      page: null,
    }),
    displayProps: {
      props: {
        detailLinkComponent: 'Naam vaartuig',
        title: 'Omschrijving',
        dateStartFormatted: 'Datum besluit',
      },
      colWidths: {
        large: ['25%', '35%', '40%', '0%'],
        small: ['50%', '50%', '0', '0'],
      },
    },
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
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
