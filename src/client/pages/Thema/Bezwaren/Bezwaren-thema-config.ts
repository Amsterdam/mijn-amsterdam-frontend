import { generatePath } from 'react-router';

import { BezwaarFrontend } from '../../../../server/services/bezwaren/types';
import { LinkProps } from '../../../../universal/types/App.types';
import type { DisplayProps } from '../../../components/Table/TableV2.types';
import {
  MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
} from '../../../config/app';
import type {
  ThemaConfigBase,
  ThemaRoutesConfig,
} from '../../../config/thema-types';

export const featureToggle = {
  BezwarenActive: true,
};

const THEMA_ID = 'BEZWAREN';
const THEMA_TITLE = 'Bezwaren';

export const links = {
  BEZWAREN_FORMULIER:
    'https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/BezwaarEnBeroep.aspx',
};

type ThemaConfigBezwaren = Pick<
  ThemaConfigBase,
  'id' | 'title' | 'profileTypes' | 'redactedScope'
>;

export const themaConfig: ThemaConfigBezwaren = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  profileTypes: ['private', 'commercial'],
  redactedScope: 'full',
};

export const routeConfig = {
  detailPage: {
    path: '/bezwaren/:uuid',
    trackingUrl: '/bezwaren/bezwaarfrontend',
    documentTitle: `Bezwaar | ${THEMA_ID}`,
  },
  listPage: {
    path: '/bezwaren/lijst/:kind/:page?',
    documentTitle: (params) =>
      `${params?.kind === listPageParamKind.afgehandeld ? 'Afgehandelde' : 'Lopende'} bezwaren | ${THEMA_TITLE}`,
    trackingUrl: null,
  },
  themaPage: {
    path: '/bezwaren',
    documentTitle: `${THEMA_TITLE} | overzicht`,
    trackingUrl: null,
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
