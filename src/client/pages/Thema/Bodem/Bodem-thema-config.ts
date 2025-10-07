import { generatePath } from 'react-router';

import { LoodMetingFrontend } from '../../../../server/services/bodem/types';
import { dateSort } from '../../../../universal/helpers/date';
import { LinkProps } from '../../../../universal/types/App.types';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import {
  MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
} from '../../../config/app';
import type {
  ThemaConfigBase,
  // ThemaRoutesConfig,
  WithDetailPage,
  WithListPage,
} from '../../../config/thema-types';

const listPageParamKind = {
  inProgress: 'lopende-aanvragen',
  completed: 'afgehandelde-aanvragen',
} as const;

// export const featureToggle = {
//   BodemActive: true,
// };
// feature toggle moet gedaan worden , linklist items moeten ook in config komen
// export const themaId = 'BODEM' as const;
// export const themaTitle = 'Bodem';
// profileTypes moeten nog toegevoegd worden
// redactedScope moet nog toegevoegd worden staat in thema types
//linklist items moeten nog toegevoegd worden
// check teams themaconfig refinment 3 puntjes klikken !!!!!!!!!
// uitleg page moet nog in de config (kijk generalinfo.tsx)
//kijk ook naar info section.tsx
type BodemThemaConfig = ThemaConfigBase & WithListPage & WithDetailPage;

export const themaConfig: BodemThemaConfig = {
  id: 'BODEM',
  title: 'Bodem',
  featureToggle: {
    themaActive: true,
},
  sections: [{ listItems: ["Uw aanvraag voor 'lood in de bodem-check'"] }],
  route: {
    path: '/bodem',
    get documentTitle() {
      return `${themaConfig.title} | overzicht`;
    },
  },
  listPage: {
    route: {
      path: '/bodem/lijst/lood-meting/:kind/:page?',
      documentTitle: (params) =>
        `${params?.kind === listPageParamKind.completed ? 'Afgehandelde' : 'Lopende'} aanvragen | ${themaConfig.title}`,
    },
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
  profileTypes: ['private', 'commercial'],
  redactedScope: 'none',
};

// export const routeConfig = {
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
// } as const satisfies ThemaRoutesConfig;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

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

export const linkListItems: LinkProps[] = [
  {
    title: 'Meer informatie over lood in de bodem.',
    to: 'https://www.amsterdam.nl/wonen-bouwen-verbouwen/bodem/loodcheck-tuin-aanvragen',
  },
] as const;
