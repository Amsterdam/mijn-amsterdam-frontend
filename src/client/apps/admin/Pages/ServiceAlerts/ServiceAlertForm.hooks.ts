import { type FormEvent, useEffect, useState } from 'react';

import type { DateRange } from '@amsterdam/design-system-react';
import { useNavigate } from 'react-router';

import type {
  ServiceAlertInput,
  ServiceAlertsOverview,
} from '../../../../../server/services/service-alerts/service-alerts.types.ts';
import { dateFormat } from '../../../../../universal/helpers/date.ts';
import {
  sendJSONPostRequest,
  useBffApi,
} from '../../../../hooks/api/useBffApi.ts';
import { BFFApiUrls } from '../../config/api.ts';
import { serviceAlertDisplayLocations } from './ServiceAlertForm.constants.ts';
import { getServiceAlertFormResult } from './ServiceAlertForm.helpers.ts';
import type { ServiceAlertFormErrors } from './ServiceAlertForm.types.ts';
import { useServiceAlertLinks } from './ServiceAlertFormLinks.hooks.ts';
import { routePath } from './ServiceAlerts-thema-config.ts';

function getInitialDateRange(
  serviceAlert?: ServiceAlertsOverview[number]
): DateRange {
  return {
    start: serviceAlert ? new Date(serviceAlert.dateStart) : new Date(),
    end: serviceAlert ? new Date(serviceAlert.dateEnd) : null,
  };
}

function getTime(date: string | undefined) {
  return dateFormat(date ?? new Date(), 'HH:mm');
}

export function useServiceAlertForm(
  serviceAlert?: ServiceAlertsOverview[number]
) {
  const navigate = useNavigate();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [title, setTitle] = useState(serviceAlert?.title ?? '');
  const [body, setBody] = useState(serviceAlert?.body ?? '');
  const linkControls = useServiceAlertLinks(serviceAlert?.links);
  const [type, setType] = useState<ServiceAlertInput['type'] | undefined>(
    serviceAlert?.type
  );
  const [errors, setErrors] = useState<ServiceAlertFormErrors>({});
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
    ServiceAlertInput['displayLocation'] | undefined
  >(serviceAlert?.displayLocation);
  const [themaId, setThemaId] = useState(serviceAlert?.themaId ?? '');
  const upsertServiceAlert = useBffApi<{ success: boolean }, ServiceAlertInput>(
    BFFApiUrls.SERVICE_ALERTS_UPSERT,
    {
      fetchImmediately: false,
      sendRequest: sendJSONPostRequest,
    }
  );
  const serviceAlertsOverview = useBffApi<ServiceAlertsOverview>(
    BFFApiUrls.SERVICE_ALERTS_OVERVIEW,
    { fetchImmediately: false }
  );

  useEffect(() => {
    if (
      !serviceAlert &&
      hasSubmitted &&
      !upsertServiceAlert.isLoading &&
      upsertServiceAlert.data?.status === 'OK'
    ) {
      serviceAlertsOverview.fetch();
      navigate(routePath);
    }
  }, [
    hasSubmitted,
    navigate,
    serviceAlert,
    serviceAlertsOverview.fetch,
    upsertServiceAlert.data?.status,
    upsertServiceAlert.isLoading,
  ]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = getServiceAlertFormResult({
      formData: new FormData(event.currentTarget),
      dateRange,
      timeStart,
      timeEnd,
      links: linkControls.links,
      serviceAlert,
    });

    setErrors(result.errors ?? {});
    if (!result.payload) {
      return;
    }

    setHasSubmitted(true);
    upsertServiceAlert.fetch({
      method: 'POST',
      payload: result.payload,
    });
  }

  function handleDisplayLocationChange(value: string) {
    const location = serviceAlertDisplayLocations.find(
      ({ value: optionValue }) => optionValue === value
    )?.value;

    setDisplayLocation(location);
    if (location !== 'theme') {
      setThemaId('');
    }
  }

  return {
    body,
    dateRange,
    displayLocation,
    linkControls,
    handleDisplayLocationChange,
    handleSubmit,
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
    errors,
    submitError: upsertServiceAlert.isError
      ? upsertServiceAlert.errorData ||
        'Er is iets misgegaan. Probeer het opnieuw.'
      : null,
  };
}
