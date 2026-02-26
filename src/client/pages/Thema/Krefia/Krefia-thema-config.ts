import type { KrefiaDeepLink } from '../../../../server/services/krefia/krefia.types';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import type { ThemaConfigBase } from '../../../config/thema-types';

const THEMA_ID = 'KREFIA';
const THEMA_TITLE = 'Kredietbank & FIBU';

type KrefiaThemaConfig = ThemaConfigBase;

export const themaConfig: KrefiaThemaConfig = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  featureToggle: {
    active: true,
  },
  profileTypes: ['private'],
  redactedScope: 'none',
  route: {
    path: '/kredietbank-fibu',
    documentTitle: `THEMA_TITLE | overzicht`,
    trackingUrl: null,
  },

  pageLinks: [],

  uitlegPageSections: [
    {
      title: THEMA_TITLE,
      listItems: [
        'Informatie over ondersteuning door Kredietbank en Budgetbeheer (FIBU)',
      ],
    },
  ],
};

const displayPropsDeeplink: DisplayProps<KrefiaDeepLink> = {
  displayStatus: 'Status',
  detailLinkComponent: 'Bekijk op Krefia',
};

export const krefiaTableConfig = {
  schuldhulp: {
    title: 'Schuldregeling',
    displayProps: displayPropsDeeplink,
    filter(v: KrefiaDeepLink) {
      return v.type === 'schuldhulp';
    },
  },
  lening: {
    title: 'Leningen',
    displayProps: displayPropsDeeplink,
    filter(v: KrefiaDeepLink) {
      return v.type === 'lening';
    },
  },
  budgetbeheer: {
    title: 'Budgetbeheer',
    displayProps: displayPropsDeeplink,
    filter(v: KrefiaDeepLink) {
      return v.type === 'budgetbeheer';
    },
  },
} as const;
