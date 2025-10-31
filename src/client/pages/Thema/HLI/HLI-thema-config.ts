import type { ReactNode } from 'react';

import { generatePath } from 'react-router';

import { HLIRegelingFrontend } from '../../../../server/services/hli/hli-regelingen-types';
import { IS_PRODUCTION } from '../../../../universal/config/env';
import { dateSort } from '../../../../universal/helpers/date';
import { LinkProps } from '../../../../universal/types/App.types';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../config/app';
import type { ThemaRoutesConfig } from '../../../config/thema-types';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

const displayPropsHuidigeRegelingen: DisplayProps<HLIRegelingFrontend> = {
  props: {
    detailLinkComponent: 'Regeling',
    ...(!IS_PRODUCTION && { betrokkenen: 'Ontvangers' }),
  },
  colWidths: {
    large: ['80%', '20%'],
    small: ['100%', '0'],
  },
};

const displayPropsEerdereRegelingen: DisplayProps<HLIRegelingFrontend> = {
  props: {
    detailLinkComponent: 'Regeling',
    displayStatus: 'Status',
    ...(!IS_PRODUCTION && { betrokkenen: 'Ontvangers' }),
  },
  colWidths: {
    large: ['80%', '20%'],
    small: ['100%', '0'],
  },
};

type SpecificatieDisplayProps = {
  datePublishedFormatted: ReactNode;
  // We don't use category just yet, since we only have one type of category at the moment.
  // This is shown in the title of the specificatie table.
  category: ReactNode;
  documentUrl: ReactNode;
};

const specificatieDisplayProps: DisplayProps<SpecificatieDisplayProps> = {
  datePublishedFormatted: 'Datum',
  documentUrl: 'Document',
};

export const listPageParamKind = {
  lopend: 'lopende-aanvragen',
  actual: 'huidige-regelingen',
  historic: 'eerdere-en-afgewezen-regelingen',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const featureToggle = {
  hliActive: true,
  hliStadspasActive: true,
  zorgnedAvApiActive: true,
  hliThemaStadspasBlokkerenActive: true,
  hliThemaStadspasDeblokkerenActive: !IS_PRODUCTION,
  hliThemaRegelingenActive: true,
  hliRegelingEnabledCZM: true,
  hliRegelingEnabledRTM: !IS_PRODUCTION,
  hli2025PCTegoedCodesEnabled: !IS_PRODUCTION,
  hli2026PCVergoedingV3Enabled: !IS_PRODUCTION,
} as const;

export const themaId = 'HLI' as const;
export const themaTitle = 'Stadspas en regelingen bij laag inkomen' as const;
export const regelingenTitle = 'Regelingen bij laag inkomen' as const;
export const stadspasTitle = 'Stadspas' as const;

export const routeConfig = {
  detailPage: {
    path: '/regelingen-bij-laag-inkomen/regeling/:regeling/:id',
    trackingUrl: (params) =>
      generatePath('/regelingen-bij-laag-inkomen/regeling/:regeling', {
        regeling: params?.regeling ?? '',
      }),
    documentTitle: `Regeling | ${themaTitle}`,
  },
  detailPageStadspas: {
    path: '/regelingen-bij-laag-inkomen/stadspas/:passNumber',
    trackingUrl: '/regelingen-bij-laag-inkomen/stadspas',
    documentTitle: `Stadspas | ${themaTitle}`,
  },
  specificatieListPage: {
    path: '/regelingen-bij-laag-inkomen/lijst/specificaties/:page?',
    documentTitle: `Specificaties | ${themaTitle}`,
  },
  regelingenListPage: {
    path: '/regelingen-bij-laag-inkomen/lijst/:kind/:page?',
    documentTitle: (params) =>
      `${params?.kind === listPageParamKind.historic ? 'Eerdere' : 'Huidige'} regelingen | ${themaTitle}`,
  },
  themaPage: {
    path: '/regelingen-bij-laag-inkomen',
    documentTitle: `${themaTitle} | overzicht`,
  },
} as const satisfies ThemaRoutesConfig;

export const listPageTitle = {
  [listPageParamKind.lopend]: 'Aanvragen',
  [listPageParamKind.actual]: 'Huidige regelingen',
  [listPageParamKind.historic]: 'Eerdere en afgewezen regelingen',
} as const;

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/werk-inkomen/hulp-bij-laag-inkomen/',
    title: 'Meer informatie over regelingen',
  },
  {
    to: 'https://www.amsterdam.nl/stadspas',
    title: 'Meer informatie over Stadspas',
  },
] as const;

export const kindTegoedLinkListItem: LinkProps = {
  to: 'https://www.amsterdam.nl/stadspas/kindtegoed/kosten-terugvragen/',
  title: 'Meer informatie over Kindtegoed declareren',
};

export const tableConfig = {
  [listPageParamKind.lopend]: {
    title: listPageTitle[listPageParamKind.lopend],
    filter: (regeling: HLIRegelingFrontend) =>
      regeling.displayStatus.startsWith('In behandeling'),
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayPropsHuidigeRegelingen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    listPageRoute: generatePath(routeConfig.regelingenListPage.path, {
      kind: listPageParamKind.lopend,
      page: null,
    }),
  },
  [listPageParamKind.actual]: {
    title: listPageTitle[listPageParamKind.actual],
    filter: (regeling: HLIRegelingFrontend) =>
      regeling.isActual && !regeling.displayStatus.startsWith('In behandeling'),
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayPropsHuidigeRegelingen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    listPageRoute: generatePath(routeConfig.regelingenListPage.path, {
      kind: listPageParamKind.actual,
      page: null,
    }),
  },
  [listPageParamKind.historic]: {
    title: listPageTitle[listPageParamKind.historic],
    filter: (regeling: HLIRegelingFrontend) => !regeling.isActual,
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayPropsEerdereRegelingen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER,
    listPageRoute: generatePath(routeConfig.regelingenListPage.path, {
      kind: listPageParamKind.historic,
      page: null,
    }),
  },
} as const;

export const specificatieTableConfig = {
  title: 'Specificaties regeling tegemoetkoming meerkosten',
  sort: dateSort('datePublished', 'desc'),
  displayProps: specificatieDisplayProps,
  maxItems: 3,
  listPageRoute: generatePath(routeConfig.specificatieListPage.path, {
    page: null,
  }),
};
