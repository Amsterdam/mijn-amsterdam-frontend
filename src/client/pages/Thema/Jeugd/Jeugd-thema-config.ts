import { generatePath } from 'react-router';

import { LeerlingenvervoerVoorzieningFrontend } from '../../../../server/services/jeugd/jeugd';
import { LinkProps } from '../../../../universal/types/App.types';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import { ThemaRoutesConfig } from '../../../config/thema-types';

export const featureToggle = {
  leerlingenvervoerActive: true,
};

export const themaTitle = 'Onderwijs en Jeugd';
export const themaId = 'JEUGD' as const;

const detailRouteBase = '/jeugd/voorziening';

export const routeConfig = {
  themaPage: {
    path: '/jeugd',
    documentTitle: themaTitle,
  },
  listPage: {
    path: '/jeugd/lijst/:kind/:page?',
    documentTitle: themaTitle,
  },
  detailPage: {
    path: `${detailRouteBase}/:id`,
    documentTitle: `Voorziening | ${themaTitle}`,
    trackingUrl: detailRouteBase,
  },
} as const satisfies ThemaRoutesConfig;

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/onderwijs/leerlingenvervoer/leerlingenvervoer-aanvragen/',
    title: 'Lees hier meer over Leerlingenvervoer',
  },
];

const displayProps: DisplayProps<LeerlingenvervoerVoorzieningFrontend> = {
  props: {
    detailLinkComponent: 'Voorziening',
    displayStatus: 'Status',
    statusDateFormatted: 'Datum',
  },
  colWidths: {
    large: ['50%', '25%', '25%'],
    small: ['100%', '0', '0'],
  },
};

export const listPageParamKind = {
  actual: 'huidige-voorzieningen',
  historic: 'eerdere-en-afgewezen-voorzieningen',
} as const;

type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const listPageTitle = {
  [listPageParamKind.actual]: 'Huidige voorzieningen',
  [listPageParamKind.historic]: 'Eerdere en afgewezen voorzieningen',
} as const;

export const tableConfig = {
  [listPageParamKind.actual]: {
    title: listPageTitle[listPageParamKind.actual],
    filter: (regeling: LeerlingenvervoerVoorzieningFrontend) =>
      regeling.isActual,
    displayProps,
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.actual,
      page: null,
    }),
    maxItems: 5,
    textNoContent: 'U heeft geen huidige voorzieningen.',
  },
  [listPageParamKind.historic]: {
    title: listPageTitle[listPageParamKind.historic],
    filter: (regeling: LeerlingenvervoerVoorzieningFrontend) =>
      !regeling.isActual,
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.historic,
      page: null,
    }),
    displayProps,
    maxItems: 5,
    textNoContent: 'U heeft geen eerdere en/of afgewezen voorzieningen.',
  },
} as const;
