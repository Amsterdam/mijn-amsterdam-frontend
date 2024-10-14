import styles from './HLI.module.scss';
import { HLIRegeling } from '../../../server/services/hli/hli-regelingen-types';
import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

const displayPropsHuidigeRegelingen = {
  detailLinkComponent: 'Regeling',
  receiver: 'Naam ontvanger',
};

const displayPropsEerdereRegelingen = {
  detailLinkComponent: displayPropsHuidigeRegelingen.detailLinkComponent,
  displayStatus: 'Status',
};

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

export const tableConfig = {
  [listPageParamKind.actual]: {
    title: listPageTitle[listPageParamKind.actual],
    filter: (regeling: HLIRegeling) => regeling.isActual,
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayPropsHuidigeRegelingen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG,
    className: styles.HuidigeRegelingen,
  },
  [listPageParamKind.historic]: {
    title: listPageTitle[listPageParamKind.historic],
    filter: (regeling: HLIRegeling) => !regeling.isActual,
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayPropsEerdereRegelingen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER,
    className: styles.EerdereRegelingen,
  },
} as const;

export const routes = {
  listPage: AppRoutes['HLI/REGELINGEN_LIST'],
  detailPage: AppRoutes['HLI/REGELING'],
  themaPage: AppRoutes['HLI'],
} as const;
