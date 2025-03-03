import styles from './ToeristischeVerhuur.module.scss';
import {
  BBVergunning,
  LVVRegistratie,
  ToeristischeVerhuurVergunning,
} from '../../../server/services/toeristische-verhuur/toeristische-verhuur-config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

const DISPLAY_PROPS_VERGUNNINGEN: DisplayProps<
  WithDetailLinkComponent<ToeristischeVerhuurVergunning>
> = {
  detailLinkComponent: 'Soort vergunning',
  zaaknummer: 'Zaaknummer',
  status: 'Status',
  dateStartFormatted: 'Vanaf',
  dateEndFormatted: 'Tot',
};

const DISPLAY_PROPS_LVV_REGISTRATIES: DisplayProps<LVVRegistratie> = {
  registrationNumber: 'Registratienummer',
  address: 'Adres',
  agreementDateFormatted: 'Geregistreerd op',
};

export const listPageParamKind = {
  actual: 'huidige-vergunningen',
  historic: 'eerdere-en-afgewezen-vergunningen',
} as const;

type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const listPageTitle = {
  [listPageParamKind.actual]: 'Huidige vergunningen',
  [listPageParamKind.historic]: 'Eerdere en afgewezen vergunningen',
} as const;

export const tableConfigVergunningen = {
  [listPageParamKind.actual]: {
    title: listPageTitle[listPageParamKind.actual],
    filter: (vergunning: ToeristischeVerhuurVergunning) => vergunning.isActual,
    sort: dateSort('dateReceived', 'desc'),
    displayProps: DISPLAY_PROPS_VERGUNNINGEN,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG,
    className: styles.HuidigeRegelingen,
  },
  [listPageParamKind.historic]: {
    title: listPageTitle[listPageParamKind.historic],
    filter: (vergunning: ToeristischeVerhuurVergunning) => !vergunning.isActual,
    sort: dateSort('dateReceived', 'desc'),
    displayProps: DISPLAY_PROPS_VERGUNNINGEN,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER,
    className: styles.EerdereRegelingen,
  },
} as const;

export const tableConfigLVVRegistraties = {
  title: 'Registratienummer(s) toeristische verhuur',
  displayProps: DISPLAY_PROPS_LVV_REGISTRATIES,
} as const;

export const routes = {
  listPage: AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/LIST'],
  detailPageVergunning: AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'],
  themaPage: AppRoutes.TOERISTISCHE_VERHUUR,
} as const;
