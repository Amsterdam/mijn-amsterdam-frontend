import { generatePath, PathMatch } from 'react-router';

import {
  WpiIncomeSpecificationTransformed,
  WpiRequestProcess,
} from '../../../server/services/wpi/wpi-types';
import { LinkProps } from '../../../universal/types';
import { withOmitDisplayPropsForSmallScreens } from '../../components/Table/helpers';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2.types';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import { TrackingConfig } from '../../config/routes';
import { ThemaRoutesConfig } from '../../config/thema-types';
import {
  toRoutes,
  toDocumentTitles,
  toCustomTrackingUrls,
} from '../../helpers/themas';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND = 5;

export const themaId = { INKOMEN: 'INKOMEN' } as const;
export type ProfileThemaID = (typeof themaId)[keyof typeof themaId];

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

const routeConfig: ThemaRoutesConfig = {
  detailPageUitkering: {
    path: '/inkomen/bijstandsuitkering/:id',
    trackingUrl: '/inkomen/bijstandsuitkering',
    documentTitle: 'Bijstandsuitkering | Inkomen',
  },
  detailPageTozo: {
    path: '/inkomen/tozo/:version/:id',
    trackingUrl: (match: PathMatch) => {
      return `/inkomen/tozo/${match.params?.version}`;
    },
    documentTitle: `Tozo | Inkomen`,
  },
  detailPageTonk: {
    path: '/inkomen/tonk/:version/:id',
    documentTitle: `TONK | Inkomen`,
  },
  detailPageBbz: {
    path: '/inkomen/bbz/:version/:id',
    trackingUrl: `/inkomen/bbz`,
    documentTitle: `Bbz | Inkomen`,
  },
  listPageSpecificaties: {
    path: '/inkomen/lijst/specificaties/uitkering/:page?',
    documentTitle: getInkomenSpecificatiesListPageDocumentTitle(
      themaTitle,
      listPageParamKind.uitkering
    ),
  },
  listPageJaaropgaven: {
    path: '/inkomen/lijst/specificaties/jaaropgave/:page?',
    documentTitle: getInkomenSpecificatiesListPageDocumentTitle(
      themaTitle,
      listPageParamKind.jaaropgaven
    ),
  },
  listPage: {
    path: '/inkomen/lijst/:kind/:page?',
    documentTitle: getInkomenListPageDocumentTitle(themaTitle),
  },
  themaPage: {
    path: '/inkomen',
    documentTitle: `Inkomen | overzicht`,
  },
} as const;

export const routes = toRoutes(routeConfig);
export const documentTitles = toDocumentTitles(routeConfig);
export const customTrackingUrls = toCustomTrackingUrls(routeConfig);

const lopendeAanvragenDisplayPropsBase: DisplayProps<
  WithDetailLinkComponent<WpiRequestProcess>
> = {
  detailLinkComponent: '',
  dateStartFormatted: 'Datum aanvraag',
  displayStatus: 'Status',
};

const afgehandeldeAanvragenDisplayPropsBase: DisplayProps<
  WithDetailLinkComponent<WpiRequestProcess>
> = {
  detailLinkComponent: '',
  dateStartFormatted: 'Datum aanvraag',
  dateEndFormatted: 'Datum besluit',
};

const specificatiesTableDisplayPropsBase: DisplayProps<
  WithDetailLinkComponent<
    WpiIncomeSpecificationTransformed & { documentUrl: string }
  >
> = {
  category: 'Regeling',
  datePublishedFormatted: 'Datum',
  documentUrl: 'Documenten',
};

const jaaropgavenTableDisplayPropsBase: DisplayProps<
  WithDetailLinkComponent<
    WpiIncomeSpecificationTransformed & { documentUrl: string }
  >
> = {
  datePublishedFormatted: 'Datum',
  documentUrl: 'Documenten',
};

const lopendeAanvragenDisplayProps = withOmitDisplayPropsForSmallScreens(
  lopendeAanvragenDisplayPropsBase,
  ['statusId', 'dateStartFormatted']
);
const afgehandeldeAanvragenDisplayProps = withOmitDisplayPropsForSmallScreens(
  afgehandeldeAanvragenDisplayPropsBase,
  ['statusId', 'dateStartFormatted', 'dateEndFormatted']
);
const specificatiesTableDisplayProps = withOmitDisplayPropsForSmallScreens(
  specificatiesTableDisplayPropsBase,
  ['category']
);
const jaaropgavenTableDisplayProps = withOmitDisplayPropsForSmallScreens(
  jaaropgavenTableDisplayPropsBase,
  []
);

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

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

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
    listPageRoute: generatePath(routes.listPage, {
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
    listPageRoute: generatePath(routes.listPage, {
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
    listPageRoute: routes.listPageSpecificaties,
  },
  [listPageParamKind.jaaropgaven]: {
    title: 'Jaaropgaven',
    displayProps: jaaropgavenTableDisplayProps,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    listPageRoute: routes.listPageJaaropgaven,
  },
} as const;

export function getInkomenListPageDocumentTitle(themaTitle: string) {
  return <T extends Record<string, string>>(
    config: TrackingConfig,
    params: T | null
  ) => {
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
  return () => {
    return kind in tableConfigSpecificaties
      ? `${tableConfigSpecificaties[kind].title} | ${themaTitle}`
      : themaTitle;
  };
}
