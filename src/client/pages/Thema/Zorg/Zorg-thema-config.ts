import { generatePath } from 'react-router';

import { WMOVoorzieningFrontend } from '../../../../server/services/wmo/wmo-config-and-types';
import { LinkProps } from '../../../../universal/types/App.types';
import { withOmitDisplayPropsForSmallScreens } from '../../../components/Table/helpers';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../../components/Table/TableV2.types';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../config/app';
import type { ThemaRoutesConfig } from '../../../config/thema-types';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

export const listPageParamKind = {
  actual: 'huidige-voorzieningen',
  historic: 'eerdere-en-afgewezen-voorzieningen',
} as const;

type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const featureToggle = {
  zorgActive: true,
};

export const themaId = 'ZORG' as const;
export const themaTitle = 'Zorg en ondersteuning';

export const routeConfig = {
  detailPage: {
    path: '/zorg-en-ondersteuning/voorziening/:id',
    trackingUrl: '/zorg-en-ondersteuning/voorziening',
    documentTitle: `Voorziening | ${themaTitle}`,
  },
  listPage: {
    path: '/zorg-en-ondersteuning/lijst/:kind/:page?',
    documentTitle: (params) =>
      `${params?.kind === listPageParamKind.actual ? 'Huidige' : 'Eerdere en afgewezen'} voorzieningen | ${themaTitle}`,
  },
  themaPage: {
    path: '/zorg-en-ondersteuning',
    documentTitle: `${themaTitle} | overzicht`,
  },
} as const satisfies ThemaRoutesConfig;

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/zorg-ondersteuning/',
    title: 'Lees hier meer over zorg en ondersteuning',
  },
];

const displayPropsBase: DisplayProps<
  WithDetailLinkComponent<WMOVoorzieningFrontend>
> = {
  detailLinkComponent: 'Naam',
  displayStatus: 'Status',
  statusDateFormatted: 'Datum',
};

const displayProps = withOmitDisplayPropsForSmallScreens(displayPropsBase, [
  'displayStatus',
  'statusDateFormatted',
]);

export const listPageTitle = {
  [listPageParamKind.actual]: 'Huidige voorzieningen',
  [listPageParamKind.historic]: 'Eerdere en afgewezen voorzieningen',
} as const;

export const tableConfig = {
  [listPageParamKind.actual]: {
    title: listPageTitle[listPageParamKind.actual],
    filter: (regeling: WMOVoorzieningFrontend) => regeling.isActual,
    displayProps: displayProps,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG,
    textNoContent: 'U heeft geen huidige voorzieningen.',
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.actual,
      page: null,
    }),
  },
  [listPageParamKind.historic]: {
    title: listPageTitle[listPageParamKind.historic],
    filter: (regeling: WMOVoorzieningFrontend) => !regeling.isActual,
    displayProps: displayProps,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER,
    textNoContent:
      'U heeft geen eerdere en/of afgewezen voorzieningen. U ziet hier niet alle gegevens uit het verleden. De gegevens die u hier niet ziet, heeft u eerder per post ontvangen.',
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.historic,
      page: null,
    }),
  },
} as const;
