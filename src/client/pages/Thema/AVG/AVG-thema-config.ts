import { generatePath } from 'react-router';

import { AVGRequestFrontend } from '../../../../server/services/avg/types.ts';
import { dateSort } from '../../../../universal/helpers/date.ts';
import { capitalizeFirstLetter } from '../../../../universal/helpers/text.ts';
import { LinkProps } from '../../../../universal/types/App.types.ts';
import { type DisplayProps } from '../../../components/Table/TableV2.types.ts';
import {
  MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
} from '../../../config/app.ts';
import { type ThemaRoutesConfig } from '../../../config/thema-types.ts';

const listPageParamKind = {
  inProgress: 'lopende-aanvragen',
  completed: 'afgehandelde-aanvragen',
} as const;

export const featureToggle = {
  avgActive: true,
};

export const themaId = 'AVG' as const;
export const themaTitle = 'AVG persoonsgegevens';

export const routeConfig = {
  detailPage: {
    path: '/avg/verzoek/:id',
    trackingUrl: '/avg/verzoek',
    documentTitle: `Avg verzoek | ${themaTitle}`,
  },
  listPage: {
    path: '/avg/lijst/:kind/:page?',
    documentTitle(params) {
      const kind = params?.kind as ListPageParamKind;
      return `${capitalizeFirstLetter(kind === 'lopende-aanvragen' ? 'Lopende' : 'Afgehanelde')} ${themaTitle} verzoeken | overzicht`;
    },
  },
  themaPage: {
    path: '/avg',
    documentTitle: `${themaTitle} verzoeken | overzicht`,
  },
} as const satisfies ThemaRoutesConfig;

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
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.inProgress,
      page: null,
    }),
    ...tableConfigBase,
  },
  [listPageParamKind.completed]: {
    title: 'Afgehandelde aanvragen',
    filter: (avgVerzoek: AVGRequestFrontend) => avgVerzoek.datumAfhandeling,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.completed,
      page: null,
    }),
    ...tableConfigBase,
  },
} as const;

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/privacy/loket/',
    title: 'Loket persoonsgegevens gemeente Amsterdam',
  },
] as const;
