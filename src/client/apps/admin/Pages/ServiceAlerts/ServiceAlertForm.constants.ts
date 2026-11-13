import type { ServiceAlertInput } from '../../../../../server/services/service-alerts/service-alerts.types.ts';
import { myThemasMenuItems } from '../../../bob/config/thema.ts';
import type { ServiceAlertSelectOption } from './ServiceAlertForm.types.ts';

export const serviceAlertTypes = [
  { value: 'info', label: 'Informatie' },
  { value: 'warning', label: 'Waarschuwing' },
  { value: 'error', label: 'Storing' },
] as const satisfies readonly ServiceAlertSelectOption<
  ServiceAlertInput['type']
>[];

export const serviceAlertDisplayLocations = [
  { value: 'theme', label: 'Thema' },
  { value: 'notification', label: 'Notificatie' },
  { value: 'login', label: 'Login' },
] as const satisfies readonly ServiceAlertSelectOption<
  ServiceAlertInput['displayLocation']
>[];

export const serviceAlertThemas = myThemasMenuItems
  .map(({ id, title }) => ({
    value: id,
    label: typeof title === 'string' ? title : id,
  }))
  .toSorted((a, b) => a.label.localeCompare(b.label, 'nl'));

export const serviceAlertFormFieldIds = {
  title: 'service-alert-title',
  body: 'service-alert-body',
  displayLocation: 'service-alert-location',
  themaId: 'service-alert-thema',
  type: 'service-alert-type',
  links: 'service-alert-links',
  period: 'service-alert-period',
  timeStart: 'service-alert-time-start',
  timeEnd: 'service-alert-time-end',
} as const;
