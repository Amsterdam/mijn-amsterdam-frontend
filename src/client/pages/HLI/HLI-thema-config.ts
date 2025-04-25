import { generatePath } from 'react-router';

import styles from './HLIThemaPagina.module.scss';
import { HLIRegeling } from '../../../server/services/hli/hli-regelingen-types';
import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { LinkProps } from '../../../universal/types/App.types';
import { withOmitDisplayPropsForSmallScreens } from '../../components/Table/helpers';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

const displayPropsHuidigeRegelingenBase: DisplayProps<
  WithDetailLinkComponent<HLIRegeling>
> = {
  detailLinkComponent: 'Regeling',
  receiver: 'Naam ontvanger',
};

const displayPropsHuidigeRegelingen = withOmitDisplayPropsForSmallScreens(
  displayPropsHuidigeRegelingenBase,
  ['receiver']
);

const displayPropsEerdereRegelingenBase: DisplayProps<
  WithDetailLinkComponent<HLIRegeling>
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

export const listPageTitle = {
  [listPageParamKind.actual]: 'Huidige regelingen',
  [listPageParamKind.historic]: 'Eerdere en afgewezen regelingen',
} as const;

export const routes = {
  listPage: AppRoutes['HLI/REGELINGEN_LIST'],
  detailPage: AppRoutes['HLI/REGELING'],
  themaPage: AppRoutes.HLI,
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
    filter: (regeling: HLIRegeling) => regeling.isActual,
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayPropsHuidigeRegelingen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG,
    className: styles.HuidigeRegelingen,
    listPageRoute: generatePath(routes.listPage, {
      kind: listPageParamKind.actual,
      page: null,
    }),
  },
  [listPageParamKind.historic]: {
    title: listPageTitle[listPageParamKind.historic],
    filter: (regeling: HLIRegeling) => !regeling.isActual,
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayPropsEerdereRegelingen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER,
    className: styles.EerdereRegelingen,
    listPageRoute: generatePath(routes.listPage, {
      kind: listPageParamKind.historic,
      page: null,
    }),
  },
} as const;
