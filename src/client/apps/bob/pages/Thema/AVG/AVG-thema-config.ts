import { generatePath } from 'react-router';

import type { AVGRequestFrontend } from '../../../../../../server/services/avg/types.ts';
import { dateSort } from '../../../../../../universal/helpers/date.ts';
import { capitalizeFirstLetter } from '../../../../../../universal/helpers/text.ts';
import type {
  ThemaConfigBase,
  WithDetailPage,
  WithListPage,
} from '../../../../../../universal/types/thema-types.ts';
import { type DisplayProps } from '../../../../../components/Table/TableV2.types.ts';
import {
  MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
} from '../../../config/app.ts';

const listPageParamKind = {
  inProgress: 'lopende-aanvragen',
  completed: 'afgehandelde-aanvragen',
} as const;
const THEMA_ID = 'AVG';
const THEMA_TITLE = 'AVG persoonsgegevens';

type AVGThemaConfig = ThemaConfigBase<typeof THEMA_ID> &
  WithDetailPage &
  WithListPage;

export const themaConfig: AVGThemaConfig = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  featureToggle: {
    active: true,
  },
  profileTypes: ['private', 'commercial'],
  uitlegPageSections: [
    {
      title: THEMA_TITLE,
      listItems: ['Uw inzage of wijziging persoonsgegevens AVG'],
    },
  ],
  pageLinks: [
    {
      title: 'Loket persoonsgegevens gemeente Amsterdam',
      to: 'https://www.amsterdam.nl/privacy/loket/',
    },
  ],

  redactedScope: 'none',
  route: {
    path: '/avg',
    documentTitle: `${THEMA_TITLE} verzoeken | overzicht`,
    trackingUrl: null,
  },

  detailPage: {
    title: 'AVG verzoek',
    route: {
      path: '/avg/verzoek/:id',
      trackingUrl: '/avg/verzoek',
      documentTitle: `Avg verzoek | ${THEMA_TITLE}`,
    },
  },
  listPage: {
    route: {
      path: '/avg/lijst/:kind/:page?',
      trackingUrl: null,
      documentTitle(params) {
        const kind = params?.kind as ListPageParamKind;
        return `${capitalizeFirstLetter(kind === 'lopende-aanvragen' ? 'Lopende' : 'Afgehandelde')} ${THEMA_TITLE} verzoeken | overzicht`;
      },
    },
  } as const,
};

const displayPropsLopend: DisplayProps<AVGRequestFrontend> = {
  props: {
    detailLinkComponent: 'Nummer',
    type: 'Onderwerp',
    ontvangstDatumFormatted: 'Ontvangen op',
  },
  colWidths: {
    large: ['15%', '35%', '50%'],
    small: ['auto', 'auto', 'auto'],
  },
  enableMobileListView: true,
};
const displayPropsAfgehandeld: DisplayProps<AVGRequestFrontend> = {
  props: {
    detailLinkComponent: 'Nummer',
    type: 'Onderwerp',
    resultaat: 'Resultaat',
  },
  colWidths: {
    large: ['15%', '35%', '50%'],
    small: ['auto', 'auto', 'auto'],
  },
  enableMobileListView: true,
};

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

// const tableConfigBase = {
//   sort: dateSort('registratieDatum', 'desc'),
//   displayProps: displayPropsLopend,
// } as const;

export const tableConfig = {
  [listPageParamKind.inProgress]: {
    title: 'Lopende verzoeken',
    sort: dateSort('registratieDatum', 'desc'),
    filter: (avgVerzoek: AVGRequestFrontend) => !avgVerzoek.datumAfhandeling,
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageParamKind.inProgress,
      page: null,
    }),
    displayProps: displayPropsLopend,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
  },
  [listPageParamKind.completed]: {
    title: 'Afgehandelde verzoeken',
    sort: dateSort('datumAfhandeling', 'desc'),
    filter: (avgVerzoek: AVGRequestFrontend) => avgVerzoek.datumAfhandeling,
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageParamKind.completed,
      page: null,
    }),
    displayProps: displayPropsAfgehandeld,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  },
} as const;
