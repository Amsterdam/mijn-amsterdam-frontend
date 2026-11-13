import { useState } from 'react';

import type { ServiceAlertInput } from '../../../../../server/services/service-alerts/service-alerts.types.ts';
import {
  getServiceAlertLinkValidationMessage,
  moveServiceAlertLink,
  removeServiceAlertLink,
  sortServiceAlertLinks,
} from './ServiceAlertForm.helpers.ts';

export function useServiceAlertLinks(
  initialLinks: ServiceAlertInput['links'] = []
) {
  const [links, setLinks] = useState<ServiceAlertInput['links']>(() =>
    sortServiceAlertLinks(initialLinks)
  );
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkValidationMessage, setLinkValidationMessage] = useState<
    string | null
  >(null);

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

  return {
    links,
    linkLabel,
    linkUrl,
    linkValidationMessage,
    setLinkLabel: handleLinkLabelChange,
    setLinkUrl: handleLinkUrlChange,
    addLink,
    removeLink,
    moveLink,
  };
}

export type ServiceAlertLinksControls = ReturnType<typeof useServiceAlertLinks>;
