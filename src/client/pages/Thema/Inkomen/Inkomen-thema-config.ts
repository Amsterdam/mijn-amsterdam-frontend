import { generatePath } from 'react-router';

import {
  WpiIncomeSpecificationTransformed,
  WpiRequestProcess,
} from '../../../../server/services/wpi/wpi-types';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import {
  MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
} from '../../../config/app';
import {
  PageConfig,
  ThemaConfigBase,
  WithListPage,
} from '../../../config/thema-types';

const THEMA_ID = 'INKOMEN';
const THEMA_TITLE = 'Inkomen';

export const wpiLinks = {
  BIJSTANDSUITKERING:
    'https://www.amsterdam.nl/werk-inkomen/bijstandsuitkering/',
  BBZ: 'https://www.amsterdam.nl/ondernemen/ondersteuning/bijstand-lening-aanvragen-ondernemers/',
};

type WithlistPageSpecificaties = PageConfig<'listPageSpecificaties'>;
type WithDetailPageBbz = PageConfig<'detailPageBbz'>;
type WithDetailPageTonk = PageConfig<'detailPageTonk'>;
type WithDetailPageTozo = PageConfig<'detailPageTozo'>;
type WithDetailPageUitkering = PageConfig<'detailPageUitkering'>;

type InkomenThemaConfig = ThemaConfigBase &
  WithListPage &
  WithlistPageSpecificaties &
  WithDetailPageBbz &
  WithDetailPageTonk &
  WithDetailPageTozo &
  WithDetailPageUitkering;

export const themaConfig: InkomenThemaConfig = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  featureToggle: {
    active: true,
  },
  profileTypes: ['private'],
  route: {
    path: '/inkomen',
    documentTitle: `${THEMA_TITLE} | overzicht`,
    trackingUrl: null,
  },
  redactedScope: 'full',
  pageLinks: [
    {
      to: 'https://www.amsterdam.nl/werk-inkomen',
      title: 'Algemene informatie over Werk en Inkomen',
    },
    {
      to: 'https://www.amsterdam.nl/werk-inkomen/contact/',
      title: 'Contact Werk en Inkomen',
    },
  ],
  uitlegPageSections: [
    {
      title: THEMA_TITLE,
      listItems: [
        'Uw aanvraag voor een bijstandsuitkering of bijstand voor zelfstandigen (Bbz)',
        'De uitkeringsspecificaties en jaaropgaven van uw bijstandsuitkering of bijstand voor zelfstandigen (Bbz)',
        'Uw aanvraag voor de Tijdelijke overbruggingsregeling zelfstandig ondernemers (Tozo 1, 2, 3, 4 en 5)',
        'Uw aanvraag voor de Tijdelijke Ondersteuning Noodzakelijke Kosten (TONK)',
        'Uw aanvraag voor de Inkomensvoorziening oudere en gedeeltelijk arbeidsongeschikte gewezen zelfstandigen (IOAZ)',
      ],
    },
  ],
  listPage: {
    route: {
      path: '/inkomen/lijst/:kind/:page?',
      documentTitle: (params) =>
        `${params?.kind === listPageParamKind.eerder ? 'Eerdere' : 'Lopende'} aanvragen | ${THEMA_TITLE}`,
      trackingUrl: null,
    },
  },
  listPageSpecificaties: {
    route: {
      path: '/inkomen/lijst/specificaties/:kind/:page?',
      documentTitle: (params) =>
        `${params?.kind === listPageParamKind.jaaropgaven ? 'Jaaropgaven' : 'Uitkeringsspecificaties'} | ${THEMA_TITLE}`,
      trackingUrl: null,
    },
  },
  detailPageBbz: {
    route: {
      path: '/inkomen/bbz/:version/:id',
      trackingUrl: `/inkomen/bbz`,
      documentTitle: `Bbz | ${THEMA_ID}`,
    },
  },
  detailPageTonk: {
    route: {
      path: '/inkomen/tonk/:version/:id',
      documentTitle: `TONK | ${THEMA_TITLE}`,
      trackingUrl: null,
    },
  },
  detailPageTozo: {
    route: {
      path: '/inkomen/tozo/:version/:id',
      trackingUrl: (params) => {
        return `/inkomen/tozo/${params?.version}`;
      },
      documentTitle: `Tozo | ${THEMA_TITLE}`,
    },
  },
  detailPageUitkering: {
    route: {
      path: '/inkomen/bijstandsuitkering/:id',
      trackingUrl: '/inkomen/bijstandsuitkering',
      documentTitle: `Bijstandsuitkering | ${THEMA_TITLE}`,
    },
  },
};

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
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
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
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
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
    listPageRoute: generatePath(themaConfig.listPageSpecificaties.route.path, {
      kind: listPageParamKind.uitkering,
      page: null,
    }),
  },
  [listPageParamKind.jaaropgaven]: {
    title: 'Jaaropgaven',
    displayProps: jaaropgavenTableDisplayProps,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    listPageRoute: generatePath(themaConfig.listPageSpecificaties.route.path, {
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
