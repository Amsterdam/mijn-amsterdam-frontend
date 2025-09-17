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

// !!!!!! LET OP TO DO SEARCH voor Bodem uitgezet //import { featureToggle as themaConfig } from '../../pages/Thema/Bodem/Bodem-thema-config';!!!!!!!!

type BodemThemaConfig = ThemaConfigBase & WithDetailPage & WithListPage;

export const themaConfig: BodemThemaConfig = {
  id: 'BODEM', ///Bij useBodemListPageData.hook.ts nog steeds themaID en ook bij BodemList.tsx
  title: 'Bodem',
  featureToggle: {
    thema: true,
  },
  profileTypes: ['private', 'commercial'],
  route: {
    path: '/bodem',
    documentTitle: `Bodem | overzicht`,
  },
  links: [
    {
      title: 'Meer informatie over lood in de bodem.',
      to: 'https://www.amsterdam.nl/wonen-bouwen-verbouwen/bodem/loodcheck-tuin-aanvragen',
    },
  ],
  uitlegPageSections: [
    { listItems: ["Uw aanvraag voor 'lood in de bodem-check'"] },
  ],
  ///gebruik deze nog niet, moet wel maar dan moet de hele pagina GegevensInfo.tsx worden omgebouwd, daarnaast moet de Uitlegpagina voor Eherk anders dan die van Digid > maar denk dat ik dat met Profiletype kan oplossen
  detailPage: {
    title: '',
    route: {
      path: '/bodem/lood-meting/:id',
      trackingUrl: '/bodem/lood-meting',
      documentTitle: `Lood in de bodem-check | Bodem`, //    get documentTitle() > WERKT niet bij mij.
    },
  },
  listPage: {
    route: {
      path: '/bodem/lijst/lood-meting/:kind/:page?',
      documentTitle: (params: { kind: string }) =>
        `${params?.kind === listPageParamKind.completed ? 'Afgehandelde' : 'Lopende'} aanvragen | Bodem` as const,
    },
  },
} as const;

// export const withDetailPage: WithDetailPage = {
//   titleDetail: 'Lood in bodem-check',
// };

//   export const withListPage: WithListPage = {
//   linksThemaPage: [],
//   to: 'https://www.amsterdam.nl/wonen-bouwen-verbouwen/bodem/loodcheck-tuin-aanvragen',
//   title: 'Meer informatie over lood in de bodem.',
// };
const listPageParamKind = {
  //moet not erggens naar
  inProgress: 'lopende-aanvragen',
  completed: 'afgehandelde-aanvragen',
} as const;

export type TableHeadersKey = keyof typeof listPageParamKind;
export type TableHeaders = (typeof listPageParamKind)[TableHeadersKey];

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
