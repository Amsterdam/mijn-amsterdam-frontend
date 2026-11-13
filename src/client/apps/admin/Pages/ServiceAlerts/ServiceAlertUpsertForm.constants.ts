import type { ServiceAlertInput } from '../../../../../server/services/service-alerts/service-alerts.types.ts';
import { myThemasMenuItems } from '../../../bob/config/thema.ts';
import type { ServiceAlertSelectOption } from './ServiceAlertUpsertForm.types.ts';

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
