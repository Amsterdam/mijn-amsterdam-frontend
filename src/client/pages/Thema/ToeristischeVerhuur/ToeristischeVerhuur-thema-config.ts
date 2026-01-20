import cloneDeep from 'lodash.clonedeep';
import { generatePath } from 'react-router';

import {
  LVVRegistratie,
  ToeristischeVerhuurVergunning,
} from '../../../../server/services/toeristische-verhuur/toeristische-verhuur-config-and-types';
import { entries } from '../../../../universal/helpers/utils';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import type {
  ThemaRoutesConfig,
  ThemaConfigBase,
} from '../../../config/thema-types';
import {
  ListPageParamKind as ListPageParamKindVergunningen,
  listPageParamKind as listPageParamKindVergunningen,
  tableConfig as tableConfigVergunningen,
} from '../Vergunningen/Vergunningen-thema-config';

type ToeristischeVerhuurThemaConfig = ThemaConfigBase;

const THEMA_TITLE = 'Toeristische verhuur';

export const themaConfig: ToeristischeVerhuurThemaConfig = {
  id: 'TOERISTISCHE_VERHUUR',
  title: THEMA_TITLE,
  featureToggle: { active: true }, // TO DO YACINE
  profileTypes: ['private', 'commercial'],
  pageLinks: [
    {
      title: 'Meer informatie over particuliere vakantieverhuur',
      to: 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/',
    },
    {
      title: 'Meer over toeristenbelasting',
      to: 'https://www.amsterdam.nl/belastingen/toeristenbelasting/',
    },
    {
      title: 'Vakantieverhuur melden of registratienummer aanvragen', // TO DO YACINE > deze en die hieronder is afhankelijk  (hasVergunningBB && !hasVergunningenVakantieVerhuur)
      to: 'https://www.toeristischeverhuur.nl/portaal/login',
    },
    {
      title: 'Meer informatie over bed & breakfast',
      to: 'https://www.amsterdam.nl/wonen-bouwen-verbouwen/woonruimte-verhuren/vergunning-aanvragen-bed-breakfast/',
    },
  ],
  route: {
    path: '/toeristische-verhuur',
    get documentTitle() {
      return `${THEMA_TITLE} | overzicht`;
    },
    trackingUrl: null,
  },
  uitlegPageSections: [
    {
      title: THEMA_TITLE,
      listItems: [
        'Uw aanvraag voor een vergunning vakantieverhuur of bed & breakfast',
        'Uw landelijk registratienummer toeristische verhuur',
        'Link naar het landelijk portaal om vakantieverhuur door te geven en het aantal nachten verhuur in te zien',
      ],
    },
  ],
  redactedScope: 'none',
};

export const routeConfig = {
  detailPage: {
    path: '/toeristische-verhuur/vergunning/:caseType/:id',
    trackingUrl: (params) =>
      `/toeristische-verhuur/vergunning/${params?.caseType ?? ''}`,
    documentTitle: `Toeristische verhuur | ${THEMA_TITLE}`,
  },
  listPage: {
    path: '/toeristische-verhuur/vergunning/lijst/:kind/:page?',
    documentTitle: (params) =>
      `${tableConfigVergunningen[(params?.kind as ListPageParamKind) || 'lopende-aanvragen'].title} | ${THEMA_TITLE}`,
    trackingUrl: null,
  },
} as const satisfies ThemaRoutesConfig;

const DISPLAY_PROPS_HUIDIGE_VERGUNNINGEN: DisplayProps<ToeristischeVerhuurVergunning> =
  {
    props: {
      detailLinkComponent: 'Zaaknummer',
      title: 'Soort vergunning',
      dateStartFormatted: 'Vanaf',
      dateEndFormatted: 'Tot',
    },
    colWidths: {
      large: ['30%', '40%', '15%', '15%'],
      small: ['100%', '0', '0', '0'],
    },
    displayStatus: 'Status',
  };

const DISPLAY_PROPS_LVV_REGISTRATIES: DisplayProps<LVVRegistratie> = {
  props: {
    registrationNumber: 'Registratienummer',
    address: 'Adres',
    agreementDateFormatted: 'Geregistreerd op',
  },
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
            : { ...tableConfig.displayProps, title: 'Soort vergunning' },
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
