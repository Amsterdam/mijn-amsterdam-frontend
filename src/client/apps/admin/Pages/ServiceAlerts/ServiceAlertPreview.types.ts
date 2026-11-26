import type { DateRange } from '@amsterdam/design-system-react';

import type { ServiceAlertInput } from '../../../../../server/services/service-alerts/service-alerts.types.ts';

export type ServiceAlertPreviewProps = {
  title: string;
  body: string;
  type?: ServiceAlertInput['type'];
  displayLocation?: ServiceAlertInput['displayLocation'];
  links: ServiceAlertInput['links'];
  dateRange?: DateRange;
  timeStart?: string;
  timeEnd?: string;
};
