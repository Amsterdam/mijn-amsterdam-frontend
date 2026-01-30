import type { ReactNode } from 'react';

import { generatePath } from 'react-router';

import { HLIRegelingFrontend } from '../../../../server/services/hli/hli-regelingen-types';
import { IS_PRODUCTION } from '../../../../universal/config/env';
import { dateSort } from '../../../../universal/helpers/date';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../config/app';
import { propagateFeatureToggles } from '../../../config/buildFeatureToggle';
import type { PageConfig, ThemaConfigBase } from '../../../config/thema-types';

const THEMA_TITLE = 'Stadspas en regelingen bij laag inkomen' as const;
export const regelingenTitle = 'Regelingen bij laag inkomen' as const;
export const stadspasTitle = 'Stadspas' as const;

type HLIThemaConfig = ThemaConfigBase &
  PageConfig<'regelingenDetailPage'> &
  PageConfig<'stadspasDetailPage'> &
  PageConfig<'specificatieListPage'> &
  PageConfig<'regelingenListPage'>;

export const themaConfig = {
  id: 'HLI' as const,
  title: THEMA_TITLE,
  featureToggle: propagateFeatureToggles({
    active: true,
    stadspas: {
      active: true,
      blokkerenActive: true,
      deblokkerenActive: !IS_PRODUCTION,
    },
    regelingen: {
      active: true,
      enabledCZM: true,
      enabledRTM: true,
    },
  }),
  profileTypes: ['private'],
  route: {
    path: '/regelingen-bij-laag-inkomen',
    trackingUrl: null,
    documentTitle: `${THEMA_TITLE} | Overzicht`,
  },
  redactedScope: 'full',
  pageLinks: [
    {
      title: 'Meer informatie over regelingen',
      to: 'https://www.amsterdam.nl/werk-inkomen/hulp-bij-laag-inkomen/',
    },
    {
      title: 'Meer informatie over Stadspas',
      to: 'https://www.amsterdam.nl/stadspas',
    },
  ],
  specificatieListPage: {
    route: {
      path: '/regelingen-bij-laag-inkomen/lijst/specificaties/:page?',
      trackingUrl: null,
      documentTitle: `Specificaties | ${THEMA_TITLE}`,
    },
  },
  regelingenListPage: {
    route: {
      path: '/regelingen-bij-laag-inkomen/lijst/:kind/:page?',
      trackingUrl: null,
      documentTitle: (params) =>
        `${params?.kind === 'eerdere-en-afgewezen-regelingen' ? 'Eerdere' : 'Huidige'} regelingen | ${THEMA_TITLE}`,
    },
  },
  regelingenDetailPage: {
    route: {
      path: '/regelingen-bij-laag-inkomen/regeling/:regeling/:id',
      trackingUrl: '/regelingen-bij-laag-inkomen/regeling',
      documentTitle: `Regeling | ${THEMA_TITLE}`,
    },
  },
  stadspasDetailPage: {
    route: {
      path: '/regelingen-bij-laag-inkomen/stadspas/:passNumber',
      trackingUrl: '/regelingen-bij-laag-inkomen/stadspas',
      documentTitle: `Stadspas | ${THEMA_TITLE}`,
    },
  },
  uitlegPageSections: [
    {
      title: regelingenTitle,
      listItems: [
        'Collectieve zorgverzekering',
        'Declaratie Kindtegoed',
        'Kindtegoed Voorschool',
        'Reiskostenvergoeding',
        'Gratis laptop of tablet middelbare school',
        'Gratis laptop of tablet basisschool',
        'Individuele inkomenstoeslag',
        "Gratis openbaar vervoer voor AOW'ers",
        'Tegemoetkoming aanvullend openbaar vervoer voor ouderen',
        'Tegemoetkoming openbaar vervoer voor mantelzorgers',
        'Regeling tegemoetkoming meerkosten',
      ],
    },
    {
      title: stadspasTitle,
      listItems: [
        'Status aanvraag Stadspas van u of uw gezin',
        'Het saldo Kindtegoed en/of andere tegoeden en de bestedingen',
        'Stadspasnummer',
        'Stadspas blokkeren',
      ],
    },
  ],
} as const satisfies HLIThemaConfig;

export const kindTegoedPageLinkItem = {
  title: 'Meer informatie over Kindtegoed declareren',
  to: 'https://www.amsterdam.nl/stadspas/kindtegoed/kosten-terugvragen/',
} as const;

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

const displayPropsHuidigeRegelingen: DisplayProps<HLIRegelingFrontend> = {
  props: {
    detailLinkComponent: 'Regeling',
    betrokkenen: 'Ontvangers',
  },
  colWidths: {
    large: ['80%', '20%'],
    small: ['100%', '0'],
  },
};

const displayPropsEerdereRegelingen: DisplayProps<HLIRegelingFrontend> = {
  props: {
    detailLinkComponent: 'Regeling',
    displayStatus: 'Status',
    betrokkenen: 'Ontvangers',
  },
  colWidths: {
    large: ['80%', '20%'],
    small: ['100%', '0'],
  },
};

type SpecificatieDisplayProps = {
  datePublishedFormatted: ReactNode;
  // We don't use category just yet, since we only have one type of category at the moment.
  // This is shown in the title of the specificatie table.
  category: ReactNode;
  documentUrl: ReactNode;
};

const specificatieDisplayProps: DisplayProps<SpecificatieDisplayProps> = {
  datePublishedFormatted: 'Datum',
  documentUrl: 'Document',
};

export const listPageParamKind = {
  lopend: 'lopende-aanvragen',
  actual: 'huidige-regelingen',
  historic: 'eerdere-en-afgewezen-regelingen',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const listPageTitle = {
  [listPageParamKind.lopend]: 'Aanvragen',
  [listPageParamKind.actual]: 'Huidige regelingen',
  [listPageParamKind.historic]: 'Eerdere en afgewezen regelingen',
} as const;

export const tableConfig = {
  [listPageParamKind.lopend]: {
    title: listPageTitle[listPageParamKind.lopend],
    filter: (regeling: HLIRegelingFrontend) =>
      regeling.displayStatus.startsWith('In behandeling'),
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayPropsHuidigeRegelingen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    listPageRoute: generatePath(themaConfig.regelingenListPage.route.path, {
      kind: listPageParamKind.lopend,
      page: null,
    }),
  },
  [listPageParamKind.actual]: {
    title: listPageTitle[listPageParamKind.actual],
    filter: (regeling: HLIRegelingFrontend) =>
      regeling.isActual && !regeling.displayStatus.startsWith('In behandeling'),
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayPropsHuidigeRegelingen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    listPageRoute: generatePath(themaConfig.regelingenListPage.route.path, {
      kind: listPageParamKind.actual,
      page: null,
    }),
  },
  [listPageParamKind.historic]: {
    title: listPageTitle[listPageParamKind.historic],
    filter: (regeling: HLIRegelingFrontend) => !regeling.isActual,
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayPropsEerdereRegelingen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER,
    listPageRoute: generatePath(themaConfig.regelingenListPage.route.path, {
      kind: listPageParamKind.historic,
      page: null,
    }),
  },
} as const;

export const specificatieTableConfig = {
  title: 'Specificaties regeling tegemoetkoming meerkosten',
  sort: dateSort('datePublished', 'desc'),
  displayProps: specificatieDisplayProps,
  maxItems: 3,
  listPageRoute: generatePath(themaConfig.specificatieListPage.route.path, {
    page: null,
  }),
};
