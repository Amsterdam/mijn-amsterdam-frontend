import { generatePath } from 'react-router';

import { BezwaarFrontend } from '../../../../server/services/bezwaren/types';
import { LinkProps } from '../../../../universal/types/App.types';
import type { DisplayProps } from '../../../components/Table/TableV2.types';
import {
  MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
} from '../../../config/app';
import type { ThemaRoutesConfig } from '../../../config/thema-types';

export const featureToggle = {
  BezwarenActive: true,
};

export const themaId = 'BEZWAREN' as const;
export const themaTitle = 'Bezwaren';

export const routeConfig = {
  detailPage: {
    path: '/bezwaren/:uuid',
    trackingUrl: '/bezwaren/bezwaarfrontend',
    documentTitle: `Bezwaar | ${themaTitle}`,
  },
  listPage: {
    path: '/bezwaren/lijst/:kind/:page?',
    documentTitle: (params) =>
      `${params?.kind === listPageParamKind.afgehandeld ? 'Afgehandelde' : 'Lopende'} bezwaren | ${themaTitle}`,
  },
  themaPage: {
    path: '/bezwaren',
    documentTitle: `${themaTitle} | overzicht`,
  },
} as const satisfies ThemaRoutesConfig;

export const LinkListItems: LinkProps[] = [
  {
    title: 'Meer informatie over Bezwaar maken',
    to: 'https://www.amsterdam.nl/veelgevraagd/bezwaar-maken-tegen-een-besluit-van-de-gemeente-amsterdam-e5898',
  },
];

const displayPropsBezwaren: DisplayProps<BezwaarFrontend> = {
  props: {
    detailLinkComponent: 'Zaaknummer',
    ontvangstdatumFormatted: 'Ontvangen op',
    omschrijving: 'Onderwerp',
  },
  colWidths: {
    large: ['25%', '25%', '50%'],
    small: ['50%', '0', '0'],
  },
};

export const listPageParamKind = {
  lopend: 'lopende-bezwaren',
  afgehandeld: 'afgehandelde-bezwaren',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const tableConfig = {
  [listPageParamKind.lopend]: {
    title: 'Lopende bezwaren',
    filter: (bezwaar: BezwaarFrontend) =>
      bezwaar.displayStatus !== 'Afgehandeld',
    displayProps: displayPropsBezwaren,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
    textNoContent:
      'U heeft geen lopende zaken. Het kan zijn dat een ingediend bezwaar nog niet is geregistreerd.',
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.lopend,
      page: null,
    }),
  },
  [listPageParamKind.afgehandeld]: {
    title: 'Afgehandelde bezwaren',
    filter: (bezwaar: BezwaarFrontend) =>
      bezwaar.displayStatus === 'Afgehandeld',
    displayProps: displayPropsBezwaren,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    textNoContent: 'U heeft nog geen afgehandelde bezwaren.',
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.afgehandeld,
      page: null,
    }),
  },
} as const;
