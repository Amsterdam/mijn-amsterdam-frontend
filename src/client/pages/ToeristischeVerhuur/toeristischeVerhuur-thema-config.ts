import cloneDeep from 'lodash.clonedeep';
import { generatePath } from 'react-router-dom';

import {
  LVVRegistratie,
  ToeristischeVerhuurVergunning,
} from '../../../server/services/toeristische-verhuur/toeristische-verhuur-config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { entries } from '../../../universal/helpers/utils';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';
import {
  ListPageParamKind as ListPageParamKindVergunningen,
  listPageParamKind as listPageParamKindVergunningen,
  tableConfig as tableConfigVergunningen,
} from '../Vergunningen/Vergunningen-thema-config';

const DISPLAY_PROPS_HUIDIGE_VERGUNNINGEN: DisplayProps<
  WithDetailLinkComponent<ToeristischeVerhuurVergunning>
> = {
  detailLinkComponent: 'Zaaknummer',
  title: 'Soort vergunning',
  displayStatus: 'Status',
  dateStartFormatted: 'Vanaf',
  dateEndFormatted: 'Tot',
};

const DISPLAY_PROPS_LVV_REGISTRATIES: DisplayProps<LVVRegistratie> = {
  registrationNumber: 'Registratienummer',
  address: 'Adres',
  agreementDateFormatted: 'Geregistreerd op',
};

export type ListPageParamKind = ListPageParamKindVergunningen;

export const listPageTitle = {
  [listPageParamKindVergunningen.inProgress]: 'Lopende aanvragen',
  [listPageParamKindVergunningen.actual]: 'Huidige vergunningen',
  [listPageParamKindVergunningen.historic]: 'Eerdere en afgewezen vergunningen',
} as const;

export const routes = {
  listPage: AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/LIST'],
  detailPageVergunning: AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'],
  themaPage: AppRoutes.TOERISTISCHE_VERHUUR,
} as const;

export const tableConfig = Object.fromEntries(
  entries(cloneDeep(tableConfigVergunningen)).map(([kind, tableConfig]) => {
    return [
      kind,
      {
        ...tableConfig,
        displayProps:
          kind === listPageParamKindVergunningen.actual
            ? DISPLAY_PROPS_HUIDIGE_VERGUNNINGEN
            : tableConfig.displayProps,
        title: listPageTitle[kind],
        filter: (vergunning: ToeristischeVerhuurVergunning) =>
          tableConfig.filter(vergunning),
        listPageRoute: generatePath(routes.listPage, {
          kind,
        }),
      },
    ];
  })
);

export const tableConfigLVVRegistraties = {
  title: 'Registratienummer(s) toeristische verhuur',
  displayProps: DISPLAY_PROPS_LVV_REGISTRATIES,
} as const;

export const THEMA_DETAIL_TITLE_DEFAULT = 'Vergunning toeristische verhuur';
