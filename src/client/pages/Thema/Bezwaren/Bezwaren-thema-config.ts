import { generatePath } from 'react-router';

import { BezwaarFrontend } from '../../../../server/services/bezwaren/types';
import type { DisplayProps } from '../../../components/Table/TableV2.types';
import {
  MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
} from '../../../config/app';
import type {
  ThemaConfigBase,
  WithDetailPage,
  WithListPage,
} from '../../../config/thema-types';

const THEMA_ID = 'BEZWAREN';
const THEMA_TITLE = 'Bezwaren';

export const links = {
  BEZWAREN_FORMULIER:
    'https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/BezwaarEnBeroep.aspx',
};

type ThemaConfigBezwaren = ThemaConfigBase & WithDetailPage & WithListPage;

export const themaConfig: ThemaConfigBezwaren = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  featureToggle: {
    active: true,
  },
  profileTypes: ['private', 'commercial'],
  uitlegPageSections: [
    {
      title: THEMA_TITLE,
      listItems: ['Bezwaren tegen een besluit van de gemeente Amsterdam'],
    },
  ],
  pageLinks: [
    {
      to: 'https://www.amsterdam.nl/veelgevraagd/bezwaar-maken-tegen-een-besluit-van-de-gemeente-amsterdam-e5898',
      title: 'Meer informatie over Bezwaar maken',
    },
  ],
  route: {
    path: '/bezwaren',
    documentTitle: `${THEMA_TITLE} | overzicht`,
    trackingUrl: null,
  },
  redactedScope: 'full',

  detailPage: {
    route: {
      path: '/bezwaren/:uuid',
      trackingUrl: '/bezwaren/bezwaarfrontend',
      documentTitle: `Bezwaar | ${THEMA_TITLE}`,
    },
  },
  listPage: {
    route: {
      path: '/bezwaren/lijst/:kind/:page?',
      documentTitle: (params) =>
        `${params?.kind === listPageParamKind.afgehandeld ? 'Afgehandelde' : 'Lopende'} bezwaren | ${THEMA_TITLE}`,
      trackingUrl: null,
    },
  },
} as const;

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
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
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
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageParamKind.afgehandeld,
      page: null,
    }),
  },
} as const;
