import { type FormEvent, useEffect, useState } from 'react';

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
import type {
  ServiceAlertFormErrors,
  ServiceAlertFormState,
  SetServiceAlertFormValue,
} from './ServiceAlertForm.types.ts';
import { useServiceAlertLinks } from './ServiceAlertFormLinks.hooks.ts';
import { routePath } from './ServiceAlerts-thema-config.ts';

function getTime(date: string | undefined) {
  return dateFormat(date ?? new Date(), 'HH:mm');
}

function getInitialValues(
  serviceAlert?: ServiceAlertsOverview[number]
): ServiceAlertFormState {
  return {
    title: serviceAlert?.title ?? '',
    body: serviceAlert?.body ?? '',
    type: serviceAlert?.type,
    displayLocation: serviceAlert?.displayLocation,
    themaId: serviceAlert?.themaId ?? '',
    dateRange: {
      start: serviceAlert ? new Date(serviceAlert.dateStart) : new Date(),
      end: serviceAlert ? new Date(serviceAlert.dateEnd) : null,
    },
    timeStart: getTime(serviceAlert?.dateStart),
    timeEnd: serviceAlert ? getTime(serviceAlert.dateEnd) : '',
  };
}

export function useServiceAlertForm(
  serviceAlert?: ServiceAlertsOverview[number]
) {
  const navigate = useNavigate();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [values, setValues] = useState(() => getInitialValues(serviceAlert));
  const linkControls = useServiceAlertLinks(serviceAlert?.links);
  const [errors, setErrors] = useState<ServiceAlertFormErrors>({});
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

  const isSaved =
    hasSubmitted &&
    !upsertServiceAlert.isLoading &&
    upsertServiceAlert.data?.status === 'OK';
  const isSubmitError =
    hasSubmitted && !upsertServiceAlert.isLoading && upsertServiceAlert.isError;

  useEffect(() => {
    if (!isSaved) {
      return;
    }

    serviceAlertsOverview.fetch();
    if (!serviceAlert) {
      navigate(routePath);
    }
  }, [isSaved, navigate, serviceAlert, serviceAlertsOverview.fetch]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = getServiceAlertFormResult({
      ...values,
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

    setValues((currentValues) => ({
      ...currentValues,
      displayLocation: location,
      themaId: location === 'theme' ? currentValues.themaId : '',
    }));
  }

  const setValue: SetServiceAlertFormValue = (field, value) => {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
  };

  return {
    values,
    setValue,
    linkControls,
    handleDisplayLocationChange,
    handleSubmit,
    isLoading: upsertServiceAlert.isLoading,
    isSuccess: isSaved,
    errors,
    submitError: isSubmitError
      ? upsertServiceAlert.errorData ||
        'Er is iets misgegaan. Probeer het opnieuw.'
      : null,
  };
}
