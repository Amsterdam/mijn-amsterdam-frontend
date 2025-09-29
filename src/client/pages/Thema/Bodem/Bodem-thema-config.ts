import { generatePath } from 'react-router';

import { LoodMetingFrontend } from '../../../../server/services/bodem/types';
import { dateSort } from '../../../../universal/helpers/date';
import { LinkProps } from '../../../../universal/types/App.types';
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
  // listPageParamKind: {
  //   inProgress: 'lopende-aanvragen',
  //   completed: 'afgehandelde-aanvragen',
  // },
  linkListItems: [
    {
      title: 'Meer informatie over lood in de bodem.',
      to: 'https://www.amsterdam.nl/wonen-bouwen-verbouwen/bodem/loodcheck-tuin-aanvragen',
    },
  ],
  uitlegPageSections: [
    {
      listItems: ["Uw aanvraag voor 'lood in de bodem-check'"],
    },
  ],
  route: {
    path: '/bodem',
    documentTitle: `Bodem | overzicht`, //bijv
  },
  detailPage: {
    title: 'Lood in bodem-check',
    route: {
      path: '/bodem/lood-meting/:id',
      trackingUrl: '/bodem/lood-meting',
      get documentTitle() {
        return `Lood in de bodem-check | Bodem, | ${themaConfig.title}`;
      },
    },
  },
  listPage: {
    route: {
      path: '/bodem/lijst/lood-meting/:kind/:page?',
      documentTitle: (params: { kind: string }) =>
        `${params?.kind === listPageParamKind.completed ? 'Afgehandelde' : 'Lopende'} aanvragen | Bodem` as const,
    },
  },
  redactedScope: 'none',
} as const;

// -----------------------------
// Routes (backend/data)
// -----------------------------
// export const routeConfig: ThemaRoutesConfig = {
//   detailPage: {
//     path: '/bodem/lood-meting/:id',
//     trackingUrl: '/bodem/lood-meting',
//     documentTitle: `Lood in de bodem-check | ${themaConfig.title}`,
//   },
//   listPage: {
//     path: '/bodem/lijst/lood-meting/:kind/:page?',
//     documentTitle: (params) =>
//       `${params?.kind === listPageParamKind.completed ? 'Afgehandelde' : 'Lopende'} aanvragen | ${themaConfig.title}`,
//   },
//   themaPage: {
//     path: '/bodem',
//     documentTitle: `${themaConfig.title} | overzicht`,
//   },
// } as const;

// -----------------------------
// Pagina-soorten
// -----------------------------
const listPageParamKind = {
  inProgress: 'lopende-aanvragen',
  completed: 'afgehandelde-aanvragen',
} as const;

// -----------------------------
// Feature toggle
// -----------------------------
// export const featureToggle = {
//   BodemActive: true,
// };

// -----------------------------
// Thema-gegevens (backend-safe)
// -----------------------------
// export const themaId = 'BODEM' as const;
// export const themaTitle = 'Bodem';
// export const themaTitleDetail = 'Lood in bodem-check';
// export const profileTypes: ProfileType[] = ['private', 'commercial'] as const;

// // -----------------------------
// // Routes (backend/data)
// // -----------------------------
// export const routeConfig = {
//   detailPage: {
//     path: '/bodem/lood-meting/:id',
//     trackingUrl: '/bodem/lood-meting',
//     documentTitle: `Lood in de bodem-check | ${themaConfig.title}`,
//   },
//   listPage: {
//     path: '/bodem/lijst/lood-meting/:kind/:page?',
//     documentTitle: (params) =>
//       `${params?.kind === themaConfig.listPageParamKind.completed ? 'Afgehandelde' : 'Lopende'} aanvragen | ${themaConfig.title}`,
//   },
//   themaPage: {
//     path: '/bodem',
//     documentTitle: `${themaConfig.title} | overzicht`,
//   },
// } as const satisfies ThemaRoutesConfig;

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

// -----------------------------
// Links (backend/data)
// -----------------------------
export const linkListItems: LinkProps[] = [
  {
    title: 'Meer informatie over lood in de bodem.',
    to: 'https://www.amsterdam.nl/wonen-bouwen-verbouwen/bodem/loodcheck-tuin-aanvragen',
  },
] as const;
