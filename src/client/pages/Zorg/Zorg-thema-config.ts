import styles from './Zorg.module.scss';
import { WMOVoorzieningFrontend } from '../../../server/services/wmo/wmo-config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { LinkProps } from '../../../universal/types/App.types';
import { ExternalUrls, MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

const displayProps = {
  detailLinkComponent: '',
  status: 'Status',
  statusDateFormatted: 'Datum',
};

export const listPageParamKind = {
  actual: 'huidige-regelingen',
  historic: 'eerdere-en-afgewezen-regelingen',
} as const;

type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const listPageTitle = {
  [listPageParamKind.actual]: 'Huidige voorzieningen',
  [listPageParamKind.historic]: 'Eerdere en afgewezen voorzieningen',
} as const;

export const tableConfig = {
  [listPageParamKind.actual]: {
    title: listPageTitle[listPageParamKind.actual],
    filter: (regeling: WMOVoorzieningFrontend) => regeling.isActual,
    displayProps: displayProps,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG,
    className: styles.HuidigeRegelingen,
    textNoContent: 'U heeft geen huidige voorzieningen.',
  },
  [listPageParamKind.historic]: {
    title: listPageTitle[listPageParamKind.historic],
    filter: (regeling: WMOVoorzieningFrontend) => !regeling.isActual,
    displayProps: displayProps,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER,
    className: styles.EerdereRegelingen,
    textNoContent:
      'U heeft geen eerdere en/of afgewezen voorzieningen. U ziet hier niet alle gegevens uit het verleden. De gegevens die u hier niet ziet, heeft u eerder per post ontvangen.',
  },
} as const;

export const routes = {
  listPage: AppRoutes['ZORG/VOORZIENINGEN_LIST'],
  detailPage: AppRoutes['ZORG/VOORZIENING'],
  themaPage: AppRoutes.ZORG,
} as const;

export const linkListItems: LinkProps[] = [
  {
    to: ExternalUrls.ZORG_LEES_MEER,
    title: 'Lees hier meer over zorg en ondersteuning',
  },
];
