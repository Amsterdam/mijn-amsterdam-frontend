import { generatePath } from 'react-router';

import { LoodMetingFrontend } from '../../../../server/services/bodem/types';
import { dateSort } from '../../../../universal/helpers/date';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import {
  MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
} from '../../../config/app';
import type {
  ThemaConfigBase,
  WithDetailPage,
  WithListPage,
} from '../../../config/thema-types';

type BodemThemaConfig = ThemaConfigBase & WithDetailPage & WithListPage;

export const themaConfig: BodemThemaConfig = {
  id: 'BODEM',
  title: 'Bodem',
  featureToggle: {
    themaActive: true,
  },
  profileTypes: ['private', 'commercial'],
  route: {
    path: '/bodem',
    get documentTitle() {
      return `${themaConfig.title} | Overzicht`;
    },
    trackingUrl: null,
  },
  redactedScope: 'none',
  links: [
    {
      title: 'Meer informatie over lood in de bodem.',
      to: 'https://www.amsterdam.nl/wonen-bouwen-verbouwen/bodem/loodcheck-tuin-aanvragen',
    },
  ],
  uitlegPageSections: {
    title: null,
    listItems: ["Uw aanvraag voor 'lood in de bodem-check'"],
  },

  ///gebruik deze nog niet, moet wel maar dan moet de hele pagina GegevensInfo.tsx worden omgebouwd, daarnaast moet de Uitlegpagina voor Eherk anders dan die van Digid > maar denk dat ik dat met Profiletype kan oplossen

  detailPage: {
    title: 'Lood in bodem-check',
    route: {
      path: '/bodem/lood-meting/:id',
      trackingUrl: '/bodem/lood-meting',
      get documentTitle() {
        return `Lood in de bodem-check | ${themaConfig.title}`;
      },
    },
  },
  listPage: {
    title: null,
    route: {
      path: '/bodem/lijst/lood-meting/:kind/:page?',
      documentTitle: (params) =>
        `${params?.kind === listPageKind.completed ? 'Afgehandelde' : 'Lopende'} aanvragen | ${themaConfig.title}`,
    },
  },
} as const;

const listPageKind = {
  inProgress: 'lopende-aanvragen',
  completed: 'afgehandelde-aanvragen',
} as const;

export type TableHeadersKey = keyof typeof listPageKind;
export type TableHeaders = (typeof listPageKind)[TableHeadersKey];

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
  [listPageKind.inProgress]: {
    title: 'Lopende aanvragen',
    sort: dateSort<LoodMetingFrontend>('datumAanvraag', 'desc'),
    filter: (bodemAanvraag: LoodMetingFrontend) => !bodemAanvraag.processed,
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageKind.inProgress,
      page: null,
    }),
    displayProps: displayPropsLopend,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
  },
  [listPageKind.completed]: {
    title: 'Afgehandelde aanvragen',
    sort: dateSort<LoodMetingFrontend>('datumAfgehandeld', 'desc'),
    filter: (bodemAanvraag: LoodMetingFrontend) => bodemAanvraag.processed,
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageKind.completed,
      page: null,
    }),
    displayProps: displayPropsEerder,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  },
} as const;
