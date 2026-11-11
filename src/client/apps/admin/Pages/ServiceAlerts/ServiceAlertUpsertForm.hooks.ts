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
import {
  getServiceAlertLinkValidationMessage,
  getServiceAlertUpsertFormResult,
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
  const [title, setTitle] = useState(serviceAlert?.title ?? '');
  const [body, setBody] = useState(serviceAlert?.body ?? '');
  const [links, setLinks] = useState<ServiceAlertInput['links']>(
    () => serviceAlert?.links.map((link) => ({ ...link })) ?? []
  );
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkValidationMessage, setLinkValidationMessage] = useState<
    string | null
  >(null);
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
    setLinks((currentLinks) =>
      currentLinks
        .filter((_link, linkIndex) => linkIndex !== index)
        .map((link, sortOrder) => ({ ...link, sortOrder }))
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = getServiceAlertUpsertFormResult({
      formData: new FormData(event.currentTarget),
      dateRange,
      timeStart,
      timeEnd,
      type,
      links,
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
