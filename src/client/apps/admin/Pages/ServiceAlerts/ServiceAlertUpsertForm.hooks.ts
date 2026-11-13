import { type FormEvent, useEffect, useState } from 'react';

import type { DateRange } from '@amsterdam/design-system-react';
import { useNavigate } from 'react-router';

import type {
  ServiceAlertInput,
  ServiceAlertsOverview,
} from '../../../../../server/services/service-alerts/service-alerts.types.ts';
import {
  sendJSONPostRequest,
  useBffApi,
} from '../../../../hooks/api/useBffApi.ts';
import { BFFApiUrls } from '../../config/api.ts';
import { routePath } from './ServiceAlerts-thema-config.ts';
import { serviceAlertDisplayLocations } from './ServiceAlertUpsertForm.constants.ts';
import {
  getServiceAlertLinkValidationMessage,
  getServiceAlertUpsertFormResult,
  moveServiceAlertLink,
  removeServiceAlertLink,
  sortServiceAlertLinks,
} from './ServiceAlertUpsertForm.helpers.ts';

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
  const navigate = useNavigate();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [title, setTitle] = useState(serviceAlert?.title ?? '');
  const [body, setBody] = useState(serviceAlert?.body ?? '');
  const [links, setLinks] = useState<ServiceAlertInput['links']>(() =>
    sortServiceAlertLinks(serviceAlert?.links ?? [])
  );
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkValidationMessage, setLinkValidationMessage] = useState<
    string | null
  >(null);
  const [type, setType] = useState<ServiceAlertInput['type'] | undefined>(
    serviceAlert?.type
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

  function handleLinkLabelChange(value: string) {
    setLinkLabel(value);
    setLinkValidationMessage(null);
  }

  function handleLinkUrlChange(value: string) {
    setLinkUrl(value);
    setLinkValidationMessage(null);
  }

  function addLink() {
    const validationMessage = getServiceAlertLinkValidationMessage({
      label: linkLabel,
      url: linkUrl,
    });

    if (validationMessage) {
      setLinkValidationMessage(validationMessage);
      return;
    }

    setLinks((currentLinks) => [
      ...currentLinks,
      {
        label: linkLabel.trim(),
        url: linkUrl.trim(),
        sortOrder: currentLinks.length,
      },
    ]);
    setLinkLabel('');
    setLinkUrl('');
    setLinkValidationMessage(null);
  }

  function removeLink(index: number) {
    setLinks((currentLinks) => removeServiceAlertLink(currentLinks, index));
  }

  function moveLink(index: number, direction: 'up' | 'down') {
    setLinks((currentLinks) =>
      moveServiceAlertLink(currentLinks, index, direction)
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = getServiceAlertUpsertFormResult({
      formData: new FormData(event.currentTarget),
      dateRange,
      timeStart,
      timeEnd,
      links,
      serviceAlert,
    });

    if (!result.payload) {
      setValidationMessage(result.validationMessage);
      return;
    }

    setValidationMessage(null);
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
    links,
    addLink,
    linkLabel,
    linkUrl,
    linkValidationMessage,
    handleDisplayLocationChange,
    handleSubmit,
    isError: upsertServiceAlert.isError,
    isLoading: upsertServiceAlert.isLoading,
    isSuccess: upsertServiceAlert.data?.status === 'OK',
    setBody,
    setDateRange,
    setLinkLabel: handleLinkLabelChange,
    setLinkUrl: handleLinkUrlChange,
    moveLink,
    removeLink,
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
