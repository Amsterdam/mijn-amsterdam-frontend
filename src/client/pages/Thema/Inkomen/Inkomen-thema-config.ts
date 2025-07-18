import { generatePath } from 'react-router';

import {
  WpiIncomeSpecificationTransformed,
  WpiRequestProcess,
} from '../../../../server/services/wpi/wpi-types';
import { LinkProps } from '../../../../universal/types/App.types';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import {
  MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
} from '../../../config/app';
import { ThemaRoutesConfig } from '../../../config/thema-types';

export const themaId = 'INKOMEN' as const;
export const themaTitle = 'Inkomen';

export const REQUEST_PROCESS_COMPLETED_STATUS_IDS = [
  'besluit',
  'intrekking',
  'briefWeigering',
  'terugvorderingsbesluit',
];

export const listPageParamKind = {
  lopend: 'lopende-aanvragen',
  eerder: 'eerdere-aanvragen',
  uitkering: 'uitkering',
  jaaropgaven: 'jaaropgaven',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const routeConfig = {
  detailPageUitkering: {
    path: '/inkomen/bijstandsuitkering/:id',
    trackingUrl: '/inkomen/bijstandsuitkering',
    documentTitle: `Bijstandsuitkering | ${themaTitle}`,
  },
  detailPageTozo: {
    path: '/inkomen/tozo/:version/:id',
    trackingUrl: (params) => {
      return `/inkomen/tozo/${params?.version}`;
    },
    documentTitle: `Tozo | ${themaTitle}`,
  },
  detailPageTonk: {
    path: '/inkomen/tonk/:version/:id',
    documentTitle: `TONK | ${themaTitle}`,
  },
  detailPageBbz: {
    path: '/inkomen/bbz/:version/:id',
    trackingUrl: `/inkomen/bbz`,
    documentTitle: `Bbz | ${themaTitle}`,
  },
  listPageSpecificaties: {
    path: '/inkomen/lijst/specificaties/:kind/:page?',
    documentTitle: (params) =>
      `${params?.kind === listPageParamKind.jaaropgaven ? 'Jaaropgaven' : 'Uitkeringsspecificaties'} | ${themaTitle}`,
  },
  listPage: {
    path: '/inkomen/lijst/:kind/:page?',
    documentTitle: (params) =>
      `${params?.kind === listPageParamKind.eerder ? 'Eerdere' : 'Lopende'} aanvragen | ${themaTitle}`,
  },
  themaPage: {
    path: '/inkomen',
    documentTitle: `${themaTitle} | overzicht`,
  },
} as const satisfies ThemaRoutesConfig;

const lopendeAanvragenDisplayProps: DisplayProps<WpiRequestProcess> = {
  props: {
    detailLinkComponent: '',
    dateStartFormatted: 'Datum aanvraag',
    displayStatus: 'Status',
  },
  colWidths: {
    large: ['50%', '25%', '25%'],
    small: ['100%', '0', '0'],
  },
};

const afgehandeldeAanvragenDisplayProps: DisplayProps<WpiRequestProcess> = {
  props: {
    detailLinkComponent: '',
    dateStartFormatted: 'Datum aanvraag',
    dateEndFormatted: 'Datum besluit',
  },
  colWidths: {
    large: ['50%', '25%', '25%'],
    small: ['100%', '0', '0'],
  },
};

const specificatiesTableDisplayProps: DisplayProps<
  WpiIncomeSpecificationTransformed & { documentUrl: string }
> = {
  props: {
    datePublishedFormatted: 'Datum',
    category: 'Regeling',
    documentUrl: 'Document',
  },
  colWidths: {
    large: ['50%', '25%', '25%'],
    small: ['0', '75%', '25%'],
  },
};

const jaaropgavenTableDisplayProps: DisplayProps<
  WpiIncomeSpecificationTransformed & { documentUrl: string }
> = {
  props: {
    datePublishedFormatted: 'Datum',
    documentUrl: 'Document',
  },
  colWidths: {
    large: ['75%', '25%'],
    small: ['75%', '25%'],
  },
};

export const wpiLinks = {
  BIJSTANDSUITKERING:
    'https://www.amsterdam.nl/werk-inkomen/bijstandsuitkering/',
  TOZO: 'https://www.amsterdam.nl/ondernemen/ondersteuning/tozo/',
  TONK: 'https://www.amsterdam.nl/tonk/',
  BBZ: 'https://www.amsterdam.nl/ondernemen/ondersteuning/bijstand-lening-aanvragen-ondernemers/',
};

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/werk-inkomen',
    title: 'Algemene informatie over Werk en Inkomen',
  },
  {
    to: 'https://www.amsterdam.nl/werk-inkomen/contact/',
    title: 'Contact Werk en Inkomen',
  },
];

export const tableConfig = {
  [listPageParamKind.lopend]: {
    title: 'Lopende aanvragen',
    filter: (zaak: WpiRequestProcess) => {
      return !zaak.steps.some((step) =>
        REQUEST_PROCESS_COMPLETED_STATUS_IDS.includes(step.id)
      );
    },
    displayProps: lopendeAanvragenDisplayProps,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.lopend,
      page: null,
    }),
  },
  [listPageParamKind.eerder]: {
    title: 'Eerdere aanvragen',
    filter: (zaak: WpiRequestProcess) => {
      return zaak.steps.some((step) =>
        REQUEST_PROCESS_COMPLETED_STATUS_IDS.includes(step.id)
      );
    },
    displayProps: afgehandeldeAanvragenDisplayProps,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.eerder,
      page: null,
    }),
  },
} as const;

export const tableConfigSpecificaties = {
  [listPageParamKind.uitkering]: {
    title: 'Uitkeringsspecificaties',
    displayProps: specificatiesTableDisplayProps,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    listPageRoute: generatePath(routeConfig.listPageSpecificaties.path, {
      kind: listPageParamKind.uitkering,
      page: null,
    }),
  },
  [listPageParamKind.jaaropgaven]: {
    title: 'Jaaropgaven',
    displayProps: jaaropgavenTableDisplayProps,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    listPageRoute: generatePath(routeConfig.listPageSpecificaties.path, {
      kind: listPageParamKind.jaaropgaven,
      page: null,
    }),
  },
} as const;

export function getInkomenListPageDocumentTitle(themaTitle: string) {
  return <T extends Record<string, string>>(params: T | null) => {
    const kind = params?.kind as Exclude<
      ListPageParamKind,
      'uitkering' | 'jaaropgaven'
    >;
    return kind in tableConfig
      ? `${tableConfig[kind].title} | ${themaTitle}`
      : themaTitle;
  };
}

export function getInkomenSpecificatiesListPageDocumentTitle(
  themaTitle: string,
  kind: Exclude<ListPageParamKind, 'lopende-aanvragen' | 'eerdere-aanvragen'>
) {
  return <T extends Record<string, string>>(_params: T | null) => {
    return kind in tableConfigSpecificaties
      ? `${tableConfigSpecificaties[kind].title} | ${themaTitle}`
      : themaTitle;
  };
}
