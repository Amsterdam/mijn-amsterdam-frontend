import { generatePath } from 'react-router';

import { LoodMetingFrontend } from '../../../../server/services/bodem/types';
import { dateSort } from '../../../../universal/helpers/date';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import {
  MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
} from '../../../config/app';
import {
  ThemaConfigBase,
  WithDetailPage,
  WithListPage,
} from '../../../config/thema-types';

type BodemThemaConfig = ThemaConfigBase & WithDetailPage & WithListPage;

export const themaConfig: BodemThemaConfig = {
  id: 'BODEM', // Bij USEBODEMLISTPAGEDATAHOOKS.TS NOG STEEDS THEMAID EN USEBODEMDATA.HOOKS.TSX
  title: 'Bodem',
  profileTypes: ['private', 'commercial'],
  featureToggle: {
    themaActive: true, // ook van infosection active toevoegen of het uit of aan en check het generalinfo gedeelte. import kan je aanpassen met as bodemn bijvoorbeeld
  },
  linkListItems: [
    {
      title: 'Meer informatie over lood in de bodem.',
      to: 'https://www.amsterdam.nl/wonen-bouwen-verbouwen/bodem/loodcheck-tuin-aanvragen',
    },
  ],
  // Alleen algemene uitleg voor de themapagina
  uitlegPageSections: [
    {
      listItems: [
        'Op deze pagina vindt u informatie over uw lood in de bodem-check.',
      ],
    },
    {
      listItems: [
        'Op deze pagina vindt u informatie over uw lood in de bodem-check.',
      ],
    },
  ],

  // Extra property speciaal voor GeneralInfo
  // overviewListItems: ["Uw aanvraag voor 'lood in de bodem-check'"],
  route: {
    path: '/bodem',
    get documentTitle() {
      return `${themaConfig.title} | Overzicht`;
    }, //bijv
  },
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
    route: {
      path: '/bodem/lijst/lood-meting/:kind/:page?',
      documentTitle: (params: { kind: string }) =>
        `${params?.kind === listPageParamKind.completed ? 'Afgehandelde' : 'Lopende'} aanvragen | ${themaConfig.title}` as const,
    },
  },
  redactedScope: 'none',
} as const;

// -----------------------------
// Pagina-soorten
// -----------------------------
const listPageParamKind = {
  inProgress: 'lopende-aanvragen',
  completed: 'afgehandelde-aanvragen',
} as const;

// -----------------------------
// Types voor list page params
// -----------------------------
export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

// -----------------------------
// Tabellenconfig (backend/data)
// -----------------------------
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
  [listPageParamKind.inProgress]: {
    title: 'Lopende aanvragen',
    sort: dateSort<LoodMetingFrontend>('datumAanvraag', 'desc'),
    filter: (bodemAanvraag: LoodMetingFrontend) => !bodemAanvraag.processed,
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageParamKind.inProgress,
      page: null,
    }),
    displayProps: displayPropsLopend,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
  },
  [listPageParamKind.completed]: {
    title: 'Afgehandelde aanvragen',
    sort: dateSort<LoodMetingFrontend>('datumAfgehandeld', 'desc'),
    filter: (bodemAanvraag: LoodMetingFrontend) => bodemAanvraag.processed,
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageParamKind.completed,
      page: null,
    }),
    displayProps: displayPropsEerder,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  },
} as const;
