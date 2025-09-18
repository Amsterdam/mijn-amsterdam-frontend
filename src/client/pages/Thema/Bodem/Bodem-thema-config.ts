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
  id: 'BODEM', //steeds themaID bij BodemList.tsx > daar ook  routeConfig,    } = useBodemListPageData();    useHTMLDocumentTitle(routeConfig.listPage);
  title: 'Bodem',
  featureToggle: {
    thema: true,
  },
  profileTypes: ['private', 'commercial'],
  route: {
    path: '/bodem',
    get documentTitle() {
      return `${themaConfig.title} | Overzicht`;
    },
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

  // isLoading: {
  //   redactedScope: 'none',
  //   isActive(appState: AppState) {
  //     return (
  //       themaConfig.featureToggle &&
  //       !isLoading(appState.BODEM) && /// hier wil voor BODEM ${themaConfig.id}
  //       !!appState.BODEM.content?.length /// hier wil voor BODEM ${themaConfig.id}
  //     );
  //   }
  // },

  detailPage: {
    title: 'Lood in bodem-check', // TO DO Deze zie ik niet terug op localhost > ik zie daar title > terwijl er in de title bij BodemDetail.tsx wordt verwezen naar title: themaConfig.detailPage.title,
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
        `${params?.kind === listPageParamKind.completed ? 'Afgehandelde' : 'Lopende'} aanvragen | Bodem` as const /*TO DO hier nog een get van maken  get documentTitle() {
    return `${this.params?.kind === listPageParamKind.completed ? 'Afgehandelde' : 'Lopende'} aanvragen | ${themaConfig.title}`;
}  */,
    },
  },
} as const;

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
