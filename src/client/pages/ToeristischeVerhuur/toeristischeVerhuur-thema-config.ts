import { BBVergunning } from '../../../server/services/toeristische-verhuur/tv-powerbrowser-bb-vergunning';
import { VakantieverhuurVergunning } from '../../../server/services/toeristische-verhuur/tv-vakantieverhuur-vergunning';
import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { DisplayProps } from '../../components/Table/TableV2';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import styles from './ToeristischeVerhuur.module.scss';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

const DISPLAY_PROPS_VERGUNNINGEN: DisplayProps<
  BBVergunning | VakantieverhuurVergunning
> = {
  title: 'Soort vergunning',
  zaaknummer: 'Zaaknummer',
  status: 'Status',
  dateStartFormatted: 'Vanaf',
  dateEndFormatted: 'Tot',
};

export const listPageParamKind = {
  actual: 'huidige-vergunningen',
  historic: 'eerdere-en-afgewezen-vergunningen',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const listPageTitle = {
  [listPageParamKind.actual]: 'Huidige vergunningen',
  [listPageParamKind.historic]: 'Eerdere en afgewezen vergunningen',
} as const;

export const tableConfig = {
  [listPageParamKind.actual]: {
    title: listPageTitle[listPageParamKind.actual],
    filter: (vergunning: BBVergunning | VakantieverhuurVergunning) =>
      vergunning.isActual,
    sort: dateSort('dateDecision', 'desc'),
    displayProps: DISPLAY_PROPS_VERGUNNINGEN,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG,
    className: styles.HuidigeRegelingen,
  },
  [listPageParamKind.historic]: {
    title: listPageTitle[listPageParamKind.historic],
    filter: (vergunning: BBVergunning | VakantieverhuurVergunning) =>
      !vergunning.isActual,
    sort: dateSort('dateDecision', 'desc'),
    displayProps: DISPLAY_PROPS_VERGUNNINGEN,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER,
    className: styles.EerdereRegelingen,
  },
} as const;

export const routes = {
  listPage: AppRoutes['TOERISTISCHE_VERHUUR'],
  detailPageBB: AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/BB'],
  detailPageVV: AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/VV'],
  themaPage: AppRoutes['TOERISTISCHE_VERHUUR'],
} as const;
