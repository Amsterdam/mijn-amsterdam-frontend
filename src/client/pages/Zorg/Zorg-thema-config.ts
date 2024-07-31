import { WMOVoorzieningFrontend } from '../../../server/services/wmo/wmo-config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import styles from './Zorg.module.scss';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

const displayProps = {
  detailLinkComponent: '',
  status: 'Status',
  dateDescisionFormatted: 'Datum',
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
    filter: (regeling: WMOVoorzieningFrontend) => regeling.isActual,
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayProps,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG,
    className: styles.HuidigeRegelingen,
  },
  [listPageParamKind.historic]: {
    title: listPageTitle[listPageParamKind.historic],
    filter: (regeling: WMOVoorzieningFrontend) => !regeling.isActual,
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayProps,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER,
    className: styles.EerdereRegelingen,
  },
} as const;

export const routes = {
  listPage: AppRoutes['ZORG/VOORZIENINGEN_LIST'],
  detailPage: AppRoutes['ZORG/VOORZIENING'],
  themaPage: AppRoutes['ZORG'],
} as const;
