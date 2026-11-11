import { type FormEvent, useState } from 'react';

import type { DateRange } from '@amsterdam/design-system-react';

import type {
  ServiceAlertInput,
  ServiceAlertsOverview,
} from '../../../../../server/services/service-alerts/service-alerts.types.ts';
import {
  sendJSONPostRequest,
  useBffApi,
} from '../../../../hooks/api/useBffApi.ts';
import { BFFApiUrls } from '../../config/api.ts';
import { serviceAlertDisplayLocations } from './ServiceAlertUpsertForm.constants.ts';
import { getServiceAlertUpsertFormResult } from './ServiceAlertUpsertForm.helpers.ts';

function getInitialDateRange(
  serviceAlert?: ServiceAlertsOverview[number]
): DateRange {
  return {
    start: serviceAlert ? new Date(serviceAlert.dateStart) : new Date(),
    end: serviceAlert ? new Date(serviceAlert.dateEnd) : null,
  };
}

function getTime(date: string | undefined) {
  if (!date) {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  const parsedDate = new Date(date);
  return `${String(parsedDate.getHours()).padStart(2, '0')}:${String(parsedDate.getMinutes()).padStart(2, '0')}`;
}

export function useServiceAlertUpsertForm(
  serviceAlert?: ServiceAlertsOverview[number]
) {
  const [title, setTitle] = useState(serviceAlert?.title ?? '');
  const [body, setBody] = useState(serviceAlert?.body ?? '');
  const [type, setType] = useState<ServiceAlertInput['type']>(
    serviceAlert?.type ?? 'info'
  );
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );
  const [dateRange, setDateRange] = useState<DateRange>(() =>
    getInitialDateRange(serviceAlert)
  );
  const [timeStart, setTimeStart] = useState(() =>
    getTime(serviceAlert?.dateStart)
  );
  const [timeEnd, setTimeEnd] = useState(() =>
    serviceAlert ? getTime(serviceAlert.dateEnd) : ''
  );
  const [displayLocation, setDisplayLocation] = useState<
    ServiceAlertInput['displayLocation']
  >(serviceAlert?.displayLocation ?? 'dashboard');
  const [themaId, setThemaId] = useState(serviceAlert?.themaId ?? '');
  const upsertServiceAlert = useBffApi<{ success: boolean }, ServiceAlertInput>(
    BFFApiUrls.SERVICE_ALERTS_UPSERT,
    {
      fetchImmediately: false,
      sendRequest: sendJSONPostRequest,
    }
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = getServiceAlertUpsertFormResult({
      formData: new FormData(event.currentTarget),
      dateRange,
      timeStart,
      timeEnd,
      type,
      serviceAlert,
    });

    if (!result.payload) {
      setValidationMessage(result.validationMessage);
      return;
    }

    setValidationMessage(null);
    upsertServiceAlert.fetch({
      method: 'POST',
      payload: result.payload,
    });
  }

  function handleDisplayLocationChange(value: string) {
    const location = serviceAlertDisplayLocations.find(
      ({ value: optionValue }) => optionValue === value
    )?.value;
    if (!location) {
      return;
    }

    setDisplayLocation(location);
    if (location !== 'theme') {
      setThemaId('');
    }
  }

  return {
    body,
    dateRange,
    displayLocation,
    handleDisplayLocationChange,
    handleSubmit,
    isError: upsertServiceAlert.isError,
    isLoading: upsertServiceAlert.isLoading,
    isSuccess: upsertServiceAlert.data?.status === 'OK',
    setBody,
    setDateRange,
    setThemaId,
    setTimeEnd,
    setTimeStart,
    setTitle,
    setType,
    title,
    themaId,
    timeEnd,
    timeStart,
    type,
    validationMessage,
    errorData: upsertServiceAlert.errorData,
  };
}
