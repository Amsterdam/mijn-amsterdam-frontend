import type { ApiResponse } from '../../../universal/helpers/api';
import type { LinkProps } from '../../../universal/types/App.types';

export interface NotificationTrigger {
  datePublished: string;
  url: string;
}

export interface KrefiaDeepLink {
  displayStatus: string;
  link: LinkProps;
  type: 'budgetbeheer' | 'lening' | 'schuldhulp';
}

export interface NotificationTriggers {
  fibu: NotificationTrigger | null;
  krediet: NotificationTrigger | null;
}

type KrefiaDeepLinkSource = {
  title: string;
  url: string;
};

export interface KrefiaDeepLinksSource {
  budgetbeheer: KrefiaDeepLinkSource | null;
  lening: KrefiaDeepLinkSource | null;
  schuldhulp: KrefiaDeepLinkSource | null;
}

export type KrefiaSourceResponse = ApiResponse<{
  notificationTriggers: NotificationTriggers | null;
  deepLinks: KrefiaDeepLinksSource;
}>;

export interface Krefia {
  notificationTriggers: NotificationTriggers | null;
  deepLinks: KrefiaDeepLink[];
}
