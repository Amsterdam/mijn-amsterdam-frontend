import type { ServiceAlertInput } from '../../../../../server/services/service-alerts/service-alerts.types.ts';
import {
  themaId as myAreaThemaId,
  themaTitle as myAreaThemaTitle,
} from '../../../../components/MyArea/MyArea-thema-config.ts';
import {
  SERVICE_ALERT_THEMA_IDS,
  type ServiceAlertThemaID,
} from '../../../bob/config/service-alert-themas.ts';
import { myThemasMenuItems } from '../../../bob/config/thema.ts';
import type { ServiceAlertSelectOption } from './ServiceAlertForm.types.ts';

export const serviceAlertTypes = [
  { value: 'info', label: 'Informatie' },
  { value: 'warning', label: 'Waarschuwing' },
  { value: 'error', label: 'Storing' },
] as const satisfies readonly ServiceAlertSelectOption<
  ServiceAlertInput['type']
>[];

export const NOTIFICATION_SERVICE_ALERT_TYPE =
  'info' satisfies ServiceAlertInput['type'];

export function hasServiceAlertType(
  displayLocation: ServiceAlertInput['displayLocation'] | undefined
) {
  return displayLocation !== 'notification';
}

export const serviceAlertDisplayLocations = [
  { value: 'theme', label: 'Thema' },
  { value: 'notification', label: 'Notificatie' },
  { value: 'landingspagina', label: 'Landingspagina' },
] as const satisfies readonly ServiceAlertSelectOption<
  ServiceAlertInput['displayLocation']
>[];

// Mijn buurt is no thema menu item, so its title comes from its own config.
function getServiceAlertThemaLabel(themaId: ServiceAlertThemaID) {
  if (themaId === myAreaThemaId) {
    return myAreaThemaTitle;
  }

  const title = myThemasMenuItems.find(({ id }) => id === themaId)?.title;
  return typeof title === 'string' ? title : themaId;
}

export const serviceAlertThemas: ServiceAlertSelectOption<ServiceAlertThemaID>[] =
  SERVICE_ALERT_THEMA_IDS.map((themaId) => ({
    value: themaId,
    label: getServiceAlertThemaLabel(themaId),
  })).toSorted((a, b) => a.label.localeCompare(b.label, 'nl'));

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
