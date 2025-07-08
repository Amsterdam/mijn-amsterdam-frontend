import type { KrefiaDeepLink } from '../../../../server/services/krefia/krefia.types.ts';
import { DisplayProps } from '../../../components/Table/TableV2.types.ts';
import type { ThemaRoutesConfig } from '../../../config/thema-types.ts';

export const featureToggle = {
  krefiaActive: true,
};

export const themaId = 'KREFIA' as const;
export const themaTitle = 'Kredietbank & FIBU';

export const routeConfig = {
  themaPage: {
    path: '/kredietbank-fibu',
    documentTitle: `${themaTitle} | overzicht`,
  },
} as const satisfies ThemaRoutesConfig;

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
