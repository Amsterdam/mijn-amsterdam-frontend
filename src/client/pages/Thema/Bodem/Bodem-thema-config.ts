import { generatePath } from 'react-router';

import { LoodMetingFrontend } from '../../../../server/services/bodem/types';
import { dateSort } from '../../../../universal/helpers/date';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import {
  MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
} from '../../../config/app';
import type { ThemaConfig, RouteConfig } from '../../../config/thema-types';

export const themaConfig: ThemaConfig = {
  id: 'BODEM', ///Bij useBodemListPageData.hook.ts nog steeds themaID en ook bij BodemList.tsx
  title: 'Bodem',
  titleDetail: 'Lood in bodem-check',
  linksThemaPage: [
    {
      to: 'https://www.amsterdam.nl/wonen-bouwen-verbouwen/bodem/loodcheck-tuin-aanvragen',
      title: 'Meer informatie over lood in de bodem.',
    },
  ],
  tableHeaders: {
    inProgress: 'lopende-aanvragen',
    completed: 'afgehandelde-aanvragen',
  },
  featureToggle: true,
  profileTypes: ['private', 'commercial'],
  uitlegPageSections: [
    { listItems: ["Uw aanvraag voor 'lood in de bodem-check'"] },
  ],
  ///gebruik deze nog niet, moet wel maar dan moet de hele pagina GegevensInfo.tsx worden omgebouwd, daarnaast moet de Uitlegpagina voor Eherk anders dan die van Digid > maar denk dat ik dat met Profiletype kan oplossen
} as const;

export const routeConfig: RouteConfig = {
  detailPage: {
    path: '/bodem/lood-meting/:id',
    trackingUrl: '/bodem/lood-meting',
    documentTitle: `Lood in de bodem-check | ${themaConfig.title}`,
  },
  listPage: {
    path: '/bodem/lijst/lood-meting/:kind/:page?',
    documentTitle: (params) =>
      `${params?.kind === themaConfig.tableHeaders.completed ? 'Afgehandelde' : 'Lopende'} aanvragen | ${themaConfig.title}` as const,
  },
  themaPage: {
    path: '/bodem',
    documentTitle: `${themaConfig.title} | overzicht`,
  },
} as const;

export type TableHeadersKey = keyof typeof themaConfig.tableHeaders;
export type TableHeaders = (typeof themaConfig.tableHeaders)[TableHeadersKey];

const displayPropsLopend: DisplayProps<LoodMetingFrontend> = {
  props: {
    detailLinkComponent: 'Adres',
    datumAanvraagFormatted: 'Aangevraagd op',
    displayStatus: 'Status',
  },
  colWidths: {
    large: ['25%', '25%', '50%'],
    small: ['100%', '0', '0'],
  },
};

const displayPropsEerder: DisplayProps<LoodMetingFrontend> = {
  props: {
    detailLinkComponent: 'Adres',
    datumAfgehandeldFormatted: 'Afgehandeld op',
    decision: 'Resultaat',
  },
  colWidths: {
    large: ['25%', '25%', '50%'],
    small: ['100%', '0', '0'],
  },
};

export const tableConfig = {
  [themaConfig.tableHeaders.inProgress]: {
    title: 'Lopende aanvragen',
    sort: dateSort<LoodMetingFrontend>('datumAanvraag', 'desc'),
    filter: (bodemAanvraag: LoodMetingFrontend) => !bodemAanvraag.processed,
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: themaConfig.tableHeaders.inProgress,
      page: null,
    }),
    displayProps: displayPropsLopend,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
  },
  [themaConfig.tableHeaders.completed]: {
    title: 'Afgehandelde aanvragen',
    sort: dateSort<LoodMetingFrontend>('datumAfgehandeld', 'desc'),
    filter: (bodemAanvraag: LoodMetingFrontend) => bodemAanvraag.processed,
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: themaConfig.tableHeaders.completed,
      page: null,
    }),
    displayProps: displayPropsEerder,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  },
} as const;
