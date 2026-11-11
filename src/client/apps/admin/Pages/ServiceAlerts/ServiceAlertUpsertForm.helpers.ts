import {
  serviceAlertDisplayLocations,
  serviceAlertEnvironments,
  serviceAlertThemas,
  serviceAlertTypes,
} from './ServiceAlertUpsertForm.constants.ts';
import type {
  ServiceAlertUpsertFormResult,
  ServiceAlertUpsertFormValues,
} from './ServiceAlertUpsertForm.types.ts';

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
  type: currentType,
  serviceAlert,
}: ServiceAlertUpsertFormValues): ServiceAlertUpsertFormResult {
  const title = formData.get('title');
  const body = formData.get('body');
  const displayLocation = serviceAlertDisplayLocations.find(
    ({ value }) => value === formData.get('displayLocation')
  )?.value;
  const type =
    serviceAlertTypes.find(({ value }) => value === formData.get('type'))
      ?.value ?? (displayLocation === 'notification' ? currentType : undefined);
  const formThemaId = formData.get('themaId');
  const environment = serviceAlertEnvironments.find(
    ({ value }) => value === formData.get('environment')
  )?.value;

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
    !environment ||
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
      links: serviceAlert?.links ?? [],
      environments: serviceAlert
        ? [
            environment,
            ...serviceAlert.environments
              .slice(1)
              .filter(
                (existingEnvironment) => existingEnvironment !== environment
              ),
          ]
        : [environment],
      dateStart: parsedDateStart.toISOString(),
      dateEnd: parsedDateEnd.toISOString(),
    },
  };
}
