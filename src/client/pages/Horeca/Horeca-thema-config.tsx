import { generatePath } from 'react-router-dom';

import { ExploitatieHorecabedrijf } from '../../../server/services/vergunningen/vergunningen';
import { ExploitatieHorecabedrijf as ExploitatieHorecabedrijfV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { LinkProps } from '../../../universal/types/App.types';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';

export type HorecaVergunning =
  | ExploitatieHorecabedrijf
  | ExploitatieHorecabedrijfV2;

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND = 5;

export const LinkListItems: LinkProps[] = [
  // {
  //   title: '',
  //   to: '',
  // },
];

const displayPropsHorecaHuidig: DisplayProps<
  WithDetailLinkComponent<HorecaVergunning>
> = {
  detailLinkComponent: 'Zaaknummer',
  title: 'Soort vergunning',
  dateRequestFormatted: 'Aangevraagd',
};

const displayPropsHorecaEerder: DisplayProps<
  WithDetailLinkComponent<HorecaVergunning>
> = {
  detailLinkComponent: 'Zaaknummer',
  title: 'Soort vergunning',
  decision: 'Resultaat',
};

export const routes = {
  listPage: AppRoutes['HORECA/LIST'],
  detailPageVergunning: AppRoutes['HORECA/DETAIL'],
  themaPage: AppRoutes.HORECA,
} as const;

export const listPageParamKind = {
  huidig: 'huidige-aanvragen-en-vergunningen',
  eerder: 'eerdere-aanvragen-en-vergunningen',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const horecaTableConfig = {
  [listPageParamKind.huidig]: {
    title: 'Huidige aanvragen en vergunningen',
    filter: (v: HorecaVergunning) => !v.processed,
    textNoContent: 'U heeft geen horeca vergunningen of aanvragen.',
    displayProps: displayPropsHorecaHuidig,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
    listPageRoute: generatePath(routes.listPage, {
      kind: listPageParamKind.huidig,
    }),
  },
  [listPageParamKind.eerder]: {
    title: 'Eerdere aanvragen en vergunningen',
    filter: (v: HorecaVergunning) => v.processed,
    textNoContent: 'U heeft geen eerdere horeca vergunningen of aanvragen.',
    displayProps: displayPropsHorecaEerder,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
    listPageRoute: generatePath(routes.listPage, {
      kind: listPageParamKind.eerder,
    }),
  },
} as const;
