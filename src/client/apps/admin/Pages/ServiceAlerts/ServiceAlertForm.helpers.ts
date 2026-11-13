import type { ServiceAlertInput } from '../../../../../server/services/service-alerts/service-alerts.types.ts';
import { serviceAlertThemas } from './ServiceAlertForm.constants.ts';
import type {
  ServiceAlertFormErrors,
  ServiceAlertFormResult,
  ServiceAlertFormValues,
} from './ServiceAlertForm.types.ts';

function isHttpsUrl(value: string) {
  return URL.canParse(value) && new URL(value).protocol === 'https:';
}

export function getServiceAlertLinkValidationMessage({
  label,
  url,
}: {
  label: string;
  url: string;
}) {
  const trimmedLabel = label.trim();
  const trimmedUrl = url.trim();

  if (!trimmedLabel && !trimmedUrl) {
    return 'Vul een linktekst en URL in.';
  }

  if (
    !trimmedLabel ||
    trimmedLabel.length > 200 ||
    trimmedUrl.length > 2048 ||
    !isHttpsUrl(trimmedUrl)
  ) {
    return 'Vul een linktekst en een geldig https://-adres in.';
  }

  return null;
}

type ServiceAlertLinks = ServiceAlertInput['links'];

function withSortOrder(links: ServiceAlertLinks): ServiceAlertLinks {
  return links.map((link, sortOrder) => ({ ...link, sortOrder }));
}

export function sortServiceAlertLinks(links: ServiceAlertLinks) {
  return withSortOrder(links.toSorted((a, b) => a.sortOrder - b.sortOrder));
}

export function removeServiceAlertLink(
  links: ServiceAlertLinks,
  index: number
) {
  return withSortOrder(links.filter((_link, linkIndex) => linkIndex !== index));
}

export function moveServiceAlertLink(
  links: ServiceAlertLinks,
  index: number,
  direction: 'up' | 'down'
) {
  const targetIndex = direction === 'up' ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= links.length) {
    return links;
  }

  const reorderedLinks = [...links];
  [reorderedLinks[index], reorderedLinks[targetIndex]] = [
    reorderedLinks[targetIndex],
    reorderedLinks[index],
  ];

  return withSortOrder(reorderedLinks);
}

function combineDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes
  );
}

export const SERVICE_ALERT_FORM_ERROR_MESSAGES = {
  title: 'Vul een titel in.',
  body: 'Vul een bericht in.',
  displayLocation: 'Kies waar de storingsmelding getoond wordt.',
  themaId: 'Kies een thema.',
  type: 'Kies een type.',
  links:
    'Controleer de links. Elke link heeft een linktekst en een geldig https://-adres nodig.',
  period: 'Kies een startdatum en een einddatum.',
  timeStart: 'Vul een starttijd in.',
  timeEnd: 'Vul een eindtijd in.',
  timeEndBeforeStart:
    'Vul een einddatum en eindtijd in die na de startdatum en starttijd liggen.',
} as const;

export function getServiceAlertFormResult({
  title: rawTitle,
  body: rawBody,
  type,
  displayLocation,
  themaId: rawThemaId,
  dateRange,
  timeStart,
  timeEnd,
  links,
  serviceAlert,
}: ServiceAlertFormValues): ServiceAlertFormResult {
  const title = rawTitle.trim();
  const body = rawBody.trim();
  const themaId =
    displayLocation === 'theme'
      ? (serviceAlertThemas.find(({ value }) => value === rawThemaId)?.value ??
        null)
      : null;
  const parsedLinks = links
    .filter(({ label, url }) => label.trim() || url.trim())
    .map(({ label, url }, sortOrder) => ({
      label: label.trim(),
      url: url.trim(),
      sortOrder,
    }));
  const dateStart =
    dateRange.start && timeStart
      ? combineDateAndTime(dateRange.start, timeStart)
      : null;
  const dateEnd =
    dateRange.end && timeEnd
      ? combineDateAndTime(dateRange.end, timeEnd)
      : null;

  const errors: ServiceAlertFormErrors = {};
  const messages = SERVICE_ALERT_FORM_ERROR_MESSAGES;

  if (!title) {
    errors.title = messages.title;
  }
  if (!body) {
    errors.body = messages.body;
  }
  if (!displayLocation) {
    errors.displayLocation = messages.displayLocation;
  }
  if (displayLocation === 'theme' && !themaId) {
    errors.themaId = messages.themaId;
  }
  if (!type) {
    errors.type = messages.type;
  }
  if (parsedLinks.some((link) => getServiceAlertLinkValidationMessage(link))) {
    errors.links = messages.links;
  }
  if (!dateRange.start || !dateRange.end) {
    errors.period = messages.period;
  }
  if (!timeStart) {
    errors.timeStart = messages.timeStart;
  }
  if (!timeEnd) {
    errors.timeEnd = messages.timeEnd;
  }
  if (dateStart && dateEnd && dateEnd <= dateStart) {
    errors.timeEnd = messages.timeEndBeforeStart;
  }

  if (
    Object.keys(errors).length > 0 ||
    !displayLocation ||
    !type ||
    !dateStart ||
    !dateEnd
  ) {
    return { payload: null, errors };
  }

  return {
    errors: null,
    payload: {
      id: serviceAlert?.id,
      title,
      body,
      type,
      displayLocation,
      themaId,
      links: parsedLinks,
      dateStart: dateStart.toISOString(),
      dateEnd: dateEnd.toISOString(),
    },
  };
}
