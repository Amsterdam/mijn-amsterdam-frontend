import { generatePath, type PathMatch } from 'react-router';

import { HLIRegelingFrontend } from '../../../../server/services/hli/hli-regelingen-types';
import { dateSort } from '../../../../universal/helpers/date';
import { LinkProps } from '../../../../universal/types/App.types';
import { withOmitDisplayPropsForSmallScreens } from '../../../components/Table/helpers';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../../components/Table/TableV2.types';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../config/app';
import type { ThemaRoutesConfig } from '../../../config/thema-types';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

const displayPropsHuidigeRegelingenBase: DisplayProps<
  WithDetailLinkComponent<HLIRegelingFrontend>
> = {
  detailLinkComponent: 'Regeling',
  receiver: 'Naam ontvanger',
};

const displayPropsHuidigeRegelingen = withOmitDisplayPropsForSmallScreens(
  displayPropsHuidigeRegelingenBase,
  ['receiver']
);

const displayPropsEerdereRegelingenBase: DisplayProps<
  WithDetailLinkComponent<HLIRegelingFrontend>
> = {
  detailLinkComponent: displayPropsHuidigeRegelingen.detailLinkComponent,
  displayStatus: 'Status',
};

const displayPropsEerdereRegelingen = withOmitDisplayPropsForSmallScreens(
  displayPropsEerdereRegelingenBase,
  ['displayStatus']
);

export const listPageParamKind = {
  actual: 'huidige-regelingen',
  historic: 'eerdere-en-afgewezen-regelingen',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const featureToggle = {
  hliActive: true,
  hliStadspasActive: true,
};

export const themaId = 'HLI' as const;
export const themaTitle = 'Stadspas en regelingen bij laag inkomen' as const;

export const routeConfig = {
  detailPage: {
    path: '/regelingen-bij-laag-inkomen/regeling/:regeling/:id',
    trackingUrl: (match: PathMatch) =>
      generatePath('/regelingen-bij-laag-inkomen/regeling/:regeling', {
        regeling: match.params?.regeling ?? '',
      }),
    documentTitle: `Regeling | ${themaTitle}`,
  },
  detailPageStadspas: {
    path: '/regelingen-bij-laag-inkomen/stadspas/:passNumber',
    trackingUrl: '/regelingen-bij-laag-inkomen/stadspas',
    documentTitle: `Stadspas | ${themaTitle}`,
  },
  listPage: {
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
  [listPageParamKind.actual]: {
    title: listPageTitle[listPageParamKind.actual],
    filter: (regeling: HLIRegelingFrontend) => regeling.isActual,
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayPropsHuidigeRegelingen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    listPageRoute: generatePath(routeConfig.listPage.path, {
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
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.historic,
      page: null,
    }),
  },
} as const;
