import { generatePath } from 'react-router-dom';

import {
  WpiIncomeSpecificationTransformed,
  WpiRequestProcess,
} from '../../../server/services/wpi/wpi-types';
import { AppRoutes } from '../../../universal/config/routes';
import { LinkProps } from '../../../universal/types';
import { withOmitDisplayPropsForSmallScreens } from '../../components/Table/helpers';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import { TrackingConfig } from '../../config/routes';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND = 5;

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

const inkomenSpecificaties = generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
  kind: listPageParamKind.uitkering,
});

const jaaropgaven = generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
  kind: listPageParamKind.jaaropgaven,
});

export const routes = {
  themaPage: AppRoutes.INKOMEN,
  listPage: AppRoutes['INKOMEN/LIST'],
  listPageSpecificaties: inkomenSpecificaties,
  listPageJaaropgaven: jaaropgaven,
} as const;

const lopendeAanvragenDisplayPropsBase: DisplayProps<
  WithDetailLinkComponent<WpiRequestProcess>
> = {
  detailLinkComponent: '',
  dateStartFormatted: 'Datum aanvraag',
  statusId: 'Status',
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
  themaTitle: string
) {
  return <T extends Record<string, string>>(
    config: TrackingConfig,
    params: T | null
  ) => {
    const kind = params?.kind as Exclude<
      ListPageParamKind,
      'lopende-aanvragen' | 'eerdere-aanvragen'
    >;
    return kind in tableConfigSpecificaties
      ? `${tableConfigSpecificaties[kind].title} | ${themaTitle}`
      : themaTitle;
  };
}
