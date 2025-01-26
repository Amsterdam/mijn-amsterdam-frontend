import { KrefiaDeepLink } from '../../../server/services';
import { AppRoutes } from '../../../universal/config/routes';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';

const displayPropsDeeplink: DisplayProps<
  WithDetailLinkComponent<KrefiaDeepLink>
> = {
  status: 'Status',
  detailLinkComponent: 'Bekijk op Krefia',
};

export const routes = {
  themaPage: AppRoutes.KREFIA,
} as const;

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
