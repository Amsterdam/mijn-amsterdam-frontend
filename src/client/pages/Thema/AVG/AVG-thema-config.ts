import { generatePath } from 'react-router';

import { AVGRequestFrontend } from '../../../../server/services/avg/types';
import { dateSort } from '../../../../universal/helpers/date';
import { capitalizeFirstLetter } from '../../../../universal/helpers/text';
import { type DisplayProps } from '../../../components/Table/TableV2.types';
import {
  MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
} from '../../../config/app';
import {
  ThemaConfigBase,
  WithDetailPage,
  WithListPage,
} from '../../../config/thema-types';

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

const displayPropsAanvragen: DisplayProps<AVGRequestFrontend> = {
  props: {
    detailLinkComponent: 'Nummer',
    ontvangstDatumFormatted: 'Ontvangen op',
    themas: 'Onderwerp(en)',
  },
  colWidths: {
    large: ['15%', '35%', '50%'],
    small: ['20%', '80%', '0'],
  },
};

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

const tableConfigBase = {
  sort: dateSort('registratieDatum', 'desc'),
  displayProps: displayPropsAanvragen,
} as const;

export const tableConfig = {
  [listPageParamKind.inProgress]: {
    title: 'Lopende aanvragen',
    filter: (avgVerzoek: AVGRequestFrontend) => !avgVerzoek.datumAfhandeling,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageParamKind.inProgress,
      page: null,
    }),
    ...tableConfigBase,
  },
  [listPageParamKind.completed]: {
    title: 'Afgehandelde aanvragen',
    filter: (avgVerzoek: AVGRequestFrontend) => avgVerzoek.datumAfhandeling,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageParamKind.completed,
      page: null,
    }),
    ...tableConfigBase,
  },
} as const;
