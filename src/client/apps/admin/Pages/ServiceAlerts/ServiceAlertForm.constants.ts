import type { ServiceAlertInput } from '../../../../../server/services/service-alerts/service-alerts.types.ts';
import {
  themaId as myAreaThemaId,
  themaTitle as myAreaThemaTitle,
} from '../../../../components/MyArea/MyArea-thema-config.ts';
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

// Mijn buurt is no thema menu item, but has its own page that shows theme alerts.
export const serviceAlertThemas = [
  ...myThemasMenuItems.map(({ id, title }) => ({
    value: id,
    label: typeof title === 'string' ? title : id,
  })),
  { value: myAreaThemaId, label: myAreaThemaTitle },
].toSorted((a, b) => a.label.localeCompare(b.label, 'nl'));

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

export const serviceAlertLinkFieldIds = {
  label: 'service-alert-link-label',
  url: 'service-alert-link-url',
  error: 'service-alert-link-error',
} as const;
