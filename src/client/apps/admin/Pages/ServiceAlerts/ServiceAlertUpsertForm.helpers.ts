import { isHttpsUrl } from '../../../../../universal/helpers/url.ts';
import {
  serviceAlertDisplayLocations,
  serviceAlertThemas,
  serviceAlertTypes,
} from './ServiceAlertUpsertForm.constants.ts';
import type {
  ServiceAlertUpsertFormResult,
  ServiceAlertUpsertFormValues,
} from './ServiceAlertUpsertForm.types.ts';

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

export function getServiceAlertUpsertFormResult({
  formData,
  dateRange,
  timeStart,
  timeEnd,
  links,
  serviceAlert,
}: ServiceAlertUpsertFormValues): ServiceAlertUpsertFormResult {
  const title = formData.get('title');
  const body = formData.get('body');
  const displayLocation = serviceAlertDisplayLocations.find(
    ({ value }) => value === formData.get('displayLocation')
  )?.value;
  const type = serviceAlertTypes.find(
    ({ value }) => value === formData.get('type')
  )?.value;
  const formThemaId = formData.get('themaId');
  const parsedLinks = links
    .filter(({ label, url }) => label.trim() || url.trim())
    .map(({ label, url }, sortOrder) => ({
      label: label.trim(),
      url: url.trim(),
      sortOrder,
    }));

  if (
    typeof title !== 'string' ||
    typeof body !== 'string' ||
    !title.trim() ||
    !body.trim() ||
    !type ||
    !displayLocation ||
    (displayLocation === 'theme' &&
      (typeof formThemaId !== 'string' ||
        !serviceAlertThemas.some(({ value }) => value === formThemaId))) ||
    !dateRange.start ||
    !dateRange.end ||
    !timeStart ||
    !timeEnd
  ) {
    return {
      payload: null,
      validationMessage: 'Vul alle verplichte velden in.',
    };
  }

  if (parsedLinks.some((link) => getServiceAlertLinkValidationMessage(link))) {
    return {
      payload: null,
      validationMessage:
        'Controleer de links. Vul voor elke link zowel een label als een geldig https://-adres in.',
    };
  }

  const parsedDateStart = combineDateAndTime(dateRange.start, timeStart);
  const parsedDateEnd = combineDateAndTime(dateRange.end, timeEnd);

  if (
    Number.isNaN(parsedDateStart.getTime()) ||
    Number.isNaN(parsedDateEnd.getTime()) ||
    parsedDateEnd < parsedDateStart
  ) {
    return {
      payload: null,
      validationMessage:
        'Controleer de start- en einddatum. Vul een geldige einddatum en eindtijd in die niet voor de startdatum liggen.',
    };
  }

  return {
    validationMessage: null,
    payload: {
      title: title.trim(),
      body: body.trim(),
      type,
      id: serviceAlert?.id,
      displayLocation,
      themaId:
        displayLocation === 'theme' && typeof formThemaId === 'string'
          ? formThemaId
          : null,
      links: parsedLinks,
      dateStart: parsedDateStart.toISOString(),
      dateEnd: parsedDateEnd.toISOString(),
    },
  };
}
