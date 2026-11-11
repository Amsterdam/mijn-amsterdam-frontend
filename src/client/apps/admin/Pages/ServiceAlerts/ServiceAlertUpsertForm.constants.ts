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
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'notification', label: 'Notificatie' },
] as const satisfies readonly ServiceAlertSelectOption<
  ServiceAlertInput['displayLocation']
>[];

export const serviceAlertEnvironments = [
  { value: 'test', label: 'Test' },
  { value: 'acc', label: 'Acceptatie' },
  { value: 'prod', label: 'Productie' },
] as const satisfies readonly ServiceAlertSelectOption<
  ServiceAlertInput['environments'][number]
>[];

export const serviceAlertThemas = myThemasMenuItems
  .map(({ id, title }) => ({
    value: id,
    label: typeof title === 'string' ? title : id,
  }))
  .toSorted((a, b) => a.label.localeCompare(b.label, 'nl'));
