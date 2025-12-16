import { generatePath } from 'react-router';

import { KlachtFrontend } from '../../../../server/services/klachten/types';
import { dateSort } from '../../../../universal/helpers/date';
import { LinkProps } from '../../../../universal/types/App.types';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import {
  MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
} from '../../../config/app';
import type { ThemaRoutesConfig } from '../../../config/thema-types';

export const featureToggle = {
  klachtenActive: true,
};

export const themaId = 'KLACHTEN' as const;
export const themaTitle = 'Klachten';

export const listPageParamKind = {
  lopend: 'lopende-aanvragen',
  eerder: 'eerdere-aanvragen',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const routeConfig = {
  detailPage: {
    path: '/klachten/klacht/:id',
    trackingUrl: '/klachten/klacht',
    documentTitle: `Klachten | ${themaTitle}`,
  },
  listPage: {
    path: '/klachten/lijst/:kind/:page?',
    documentTitle: (params) => {
      return `${params?.kind === listPageParamKind.eerder ? 'Eerdere' : 'Lopende'} aanvragen | ${themaTitle}`;
    },
    trackingUrl: null,
  },
  themaPage: {
    path: '/klachten',
    documentTitle: `${themaTitle} | overzicht`,
    trackingUrl: null,
  },
} as const satisfies ThemaRoutesConfig;

export const LinkListItems: LinkProps[] = [
  {
    title: 'Meer informatie over de afhandeling van uw klacht',
    to: 'https://www.amsterdam.nl/veelgevraagd/klacht-indienen-over-de-gemeente-42fd5#case_%7B9846AD0A-E989-4B5D-A1D3-6D79E34DF1BE%7D',
  },
];

const displayProps: DisplayProps<KlachtFrontend> = {
  props: {
    detailLinkComponent: 'Nummer van uw klacht',
    ontvangstDatumFormatted: 'Ontvangen op',
    onderwerp: 'Onderwerp',
  },
  colWidths: {
    large: ['25%', '25%', '50%'],
    small: ['50%', '50%', '0'],
  },
};

export const tableConfig = {
  [listPageParamKind.lopend]: {
    title: 'Openstaande klachten',
    displayProps,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.lopend,
      page: null,
    }),
    filter: (klacht: KlachtFrontend) => klacht.isActive,
    sort: dateSort<KlachtFrontend>('ontvangstDatum'),
  },
  [listPageParamKind.eerder]: {
    title: 'Afgehandelde klachten',
    displayProps,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.eerder,
      page: null,
    }),
    filter: (klacht: KlachtFrontend) => !klacht.isActive,
    sort: dateSort<KlachtFrontend>('ontvangstDatum'),
  },
} as const;
