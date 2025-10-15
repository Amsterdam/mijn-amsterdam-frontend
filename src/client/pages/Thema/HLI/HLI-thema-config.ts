import { generatePath } from 'react-router';

import { HLIRegelingFrontend } from '../../../../server/services/hli/hli-regelingen-types';
import { IS_PRODUCTION } from '../../../../universal/config/env';
import { dateSort } from '../../../../universal/helpers/date';
import { LinkProps } from '../../../../universal/types/App.types';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../config/app';
import type {
  ThemaConfigBase,
  WithDetailPage,
  WithDetailPageStadspas,
  WithListPage,
} from '../../../config/thema-types';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

const displayPropsHuidigeRegelingen: DisplayProps<HLIRegelingFrontend> = {
  props: {
    detailLinkComponent: 'Regeling',
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
  },
  colWidths: {
    large: ['80%', '20%'],
    small: ['100%', '0'],
  },
};

type HLIThemaConfig = ThemaConfigBase &
  WithDetailPage &
  WithDetailPageStadspas &
  WithListPage;
export const themaConfig: HLIThemaConfig = {
  id: 'HLI',
  title: 'Stadspas en regelingen bij laag inkomen',
  featureToggle: {
    themaActive: true, //uitsluitend Regelingemn
    hliActive: true, //misschien bij render config waar nu themaActive staat HLIActive weer terug?/
    hliStadspasActive: true,
    zorgnedAvApiActive: true,
    hliThemaStadspasBlokkerenActive: true,
    hliThemaStadspasDeblokkerenActive: !IS_PRODUCTION,
    hliThemaRegelingenActive: true,
    hliRegelingEnabledCZM: true,
    hliRegelingEnabledRTM: !IS_PRODUCTION,
    hli2025PCTegoedCodesEnabled: !IS_PRODUCTION,
  },
  profileTypes: ['private'],
  route: {
    path: '/regelingen-bij-laag-inkomen',
    get documentTitle() {
      return `${themaConfig.title} | Overzicht`;
    },
    trackingUrl: null,
  },
  redactedScope: 'full',
  links: [
    {
      to: 'https://www.amsterdam.nl/werk-inkomen/hulp-bij-laag-inkomen/',
      title: 'Meer informatie over regelingen',
    },
    {
      to: 'https://www.amsterdam.nl/stadspas',
      title: 'Meer informatie over Stadspas',
    },
  ],
  uitlegPageSections: {
    title: null,
    listItems: ["Uw aanvraag voor 'lood in de bodem-check'"],
  },

  detailPage: {
    title: null,
    route: {
      path: '/regelingen-bij-laag-inkomen/regeling/:regeling/:id',
      trackingUrl: null, //(params: { regeling: any; }) =>
      //   //generatePath('/regelingen-bij-laag-inkomen/regeling/:regeling', {
      //     regeling: params?.regeling ?? '',
      //   }),
      get documentTitle() {
        return `Regelingen | ${themaConfig.title}`;
      },
    },
  },
  stadspasPage: {
    title: null,
    route: {
      path: '/regelingen-bij-laag-inkomen/stadspas/:passNumber',
      trackingUrl: '/regelingen-bij-laag-inkomen/stadspas',
      get documentTitle() {
        return `Stadspas | ${themaConfig.title}`;
      },
    },
  },

  listPage: {
    title: null,
    route: {
      path: '/regelingen-bij-laag-inkomen/lijst/:kind/:page?',
      trackingUrl: null,
      documentTitle: (params) =>
        `${params?.kind === listPageKind.historic ? 'Eerdere' : 'Huidige'} regelingen | ${themaConfig.title}`,
    },
  },
} as const;

export const listPageKind = {
  inProgress: 'lopende-aanvragen',
  actual: 'huidige-regelingen',
  historic: 'eerdere-en-afgewezen-regelingen',
} as const;

export type ListPageParamKey = keyof typeof listPageKind;
export type ListPageParamKind = (typeof listPageKind)[ListPageParamKey];

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
} as const;

export const themaId = 'HLI' as const;
export const themaTitle = 'Stadspas en regelingen bij laag inkomen' as const;
export const regelingenTitle = 'Regelingen bij laag inkomen' as const;
export const stadspasTitle = 'Stadspas' as const;

// export const routeConfig = {
//   detailPage: {
//     path: '/regelingen-bij-laag-inkomen/regeling/:regeling/:id',
//     trackingUrl: (params) =>
//       generatePath('/regelingen-bij-laag-inkomen/regeling/:regeling', {
//         regeling: params?.regeling ?? '',
//       }),
//     documentTitle: `Regeling | ${themaConfig.title}`,
//   },
//   detailPageStadspas: {
//     path: '/regelingen-bij-laag-inkomen/stadspas/:passNumber',
//     trackingUrl: '/regelingen-bij-laag-inkomen/stadspas',
//     documentTitle: `Stadspas | ${themaConfig.title}`,
//   },
//   listPage: {
//     trackingUrl: null,
//     path: '/regelingen-bij-laag-inkomen/lijst/:kind/:page?',
//     documentTitle: (params) =>
//       `${params?.kind === listPageKind.historic ? 'Eerdere' : 'Huidige'} regelingen | ${themaTitle}`,
//   },
//   themaPage: {
//     trackingUrl: null,
//     path: '/regelingen-bij-laag-inkomen',
//     documentTitle: `${themaConfig.title} | overzicht`,
//   },
// } as const satisfies ThemaRoutesConfig;

export const listPageTitle = {
  [listPageKind.inProgress]: 'Aanvragen',
  [listPageKind.actual]: 'Huidige regelingen',
  [listPageKind.historic]: 'Eerdere en afgewezen regelingen',
} as const;

// export const linkListItems: LinkProps[] = [
//   {
//     to: 'https://www.amsterdam.nl/werk-inkomen/hulp-bij-laag-inkomen/',
//     title: 'Meer informatie over regelingen',
//   },
//   {
//     to: 'https://www.amsterdam.nl/stadspas',
//     title: 'Meer informatie over Stadspas',
//   },
// ] as const;

export const kindTegoedLinkListItem: LinkProps = {
  to: 'https://www.amsterdam.nl/stadspas/kindtegoed/kosten-terugvragen/',
  title: 'Meer informatie over Kindtegoed declareren',
};

export const tableConfig = {
  [listPageKind.inProgress]: {
    title: listPageTitle[listPageKind.inProgress],
    filter: (regeling: HLIRegelingFrontend) =>
      regeling.displayStatus.startsWith('In behandeling'),
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayPropsHuidigeRegelingen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageKind.inProgress,
      page: null,
    }),
  },
  [listPageKind.actual]: {
    title: listPageTitle[listPageKind.actual],
    filter: (regeling: HLIRegelingFrontend) =>
      regeling.isActual && !regeling.displayStatus.startsWith('In behandeling'),
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayPropsHuidigeRegelingen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageKind.actual,
      page: null,
    }),
  },
  [listPageKind.historic]: {
    title: listPageTitle[listPageKind.historic],
    filter: (regeling: HLIRegelingFrontend) => !regeling.isActual,
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayPropsEerdereRegelingen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER,
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageKind.historic,
      page: null,
    }),
  },
} as const;
