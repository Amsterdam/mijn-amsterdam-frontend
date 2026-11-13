import type {
  LinkProps,
  MyNotification,
} from '../../../universal/types/App.types.ts';

export type OtapEnv = 'tst' | 'acc' | 'prd';

type SeverityLevel = 'error' | 'info' | 'success' | 'warning';
export type CMSMaintenanceNotification = MyNotification & {
  title: string;
  datePublished: string;
  dateStart: string;
  dateEnd: string;
  timeEnd: string;
  timeStart: string;
  description: string;
  path: string;
  severity: SeverityLevel;
  displayLocation?: 'theme' | 'dashboard' | 'notification';
  link?: LinkProps;
};
export type QueryParamsMaintenanceNotifications = {
  page?: string;
  forceRenew?: 'true';
};
