import cloneDeep from 'lodash.clonedeep';
import { generatePath, type PathMatch } from 'react-router';

import {
  LVVRegistratie,
  ToeristischeVerhuurVergunning,
} from '../../../../server/services/toeristische-verhuur/toeristische-verhuur-config-and-types';
import { entries } from '../../../../universal/helpers/utils';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../../components/Table/TableV2.types';
import type { ThemaRoutesConfig } from '../../../config/thema-types';
import {
  ListPageParamKind as ListPageParamKindVergunningen,
  listPageParamKind as listPageParamKindVergunningen,
  tableConfig as tableConfigVergunningen,
} from '../Vergunningen/Vergunningen-thema-config';

export const featureToggle = {
  toeristischeVerhuurActive: true,
};

export const themaId = 'TOERISTISCHE_VERHUUR' as const;
export const themaTitle = 'Toeristische verhuur';

export const routeConfig = {
  detailPage: {
    path: '/toeristische-verhuur/vergunning/:caseType/:id',
    trackingUrl: (match: PathMatch) =>
      `/toeristische-verhuur/vergunning/${match.params.caseType ?? ''}`,
    documentTitle: `Toeristische verhuur | ${themaTitle}`,
  },
  listPage: {
    path: '/toeristische-verhuur/vergunning/lijst/:kind/:page?',
    documentTitle: (_, params) =>
      `${tableConfigVergunningen[(params?.kind as ListPageParamKind) || 'lopende-aanvragen'].title} | ${themaTitle}`,
  },
  themaPage: {
    path: '/toeristische-verhuur',
    documentTitle: `${themaTitle} | overzicht`,
  },
} as const satisfies ThemaRoutesConfig;

const DISPLAY_PROPS_HUIDIGE_VERGUNNINGEN: DisplayProps<
  WithDetailLinkComponent<ToeristischeVerhuurVergunning>
> = {
  detailLinkComponent: 'Zaaknummer',
  title: 'Soort vergunning',
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
        listPageRoute: generatePath(routeConfig.listPage.path, {
          kind,
          page: null,
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
