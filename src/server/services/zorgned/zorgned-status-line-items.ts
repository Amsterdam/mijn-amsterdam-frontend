import { StatusLineItem } from '../../../universal/types';
import {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemsConfig,
} from './zorgned-config-and-types';
import { parseLabelContent } from './zorgned-helpers';

function getStatusLineItemTransformers(
  statusLineItemsConfig: ZorgnedStatusLineItemsConfig[],
  aanvraagTransformed: ZorgnedAanvraagTransformed
) {
  return statusLineItemsConfig.find((config) => {
    return (
      aanvraagTransformed.leveringsVorm === config.leveringsVorm &&
      config.productsoortCodes.includes(aanvraagTransformed.productsoortCode)
    );
  })?.lineItemTransformers;
}

export function getStatusLineItems(
  serviceName: 'WMO' | 'HLI',
  statusLineItemsConfig: ZorgnedStatusLineItemsConfig[],
  aanvraagTransformed: ZorgnedAanvraagTransformed,
  today: Date
) {
  const lineItemTransformer = getStatusLineItemTransformers(
    statusLineItemsConfig,
    aanvraagTransformed
  );

  if (!lineItemTransformer) {
    console.log(
      `No line item formatters found for Service: ${serviceName}, leveringsVorm: ${aanvraagTransformed.leveringsVorm}, productsoortCode: ${aanvraagTransformed.productsoortCode}`
    );
    return null;
  }

  const statusLineItems: StatusLineItem[] = lineItemTransformer
    .map((statusItem, index) => {
      const datePublished = parseLabelContent(
        statusItem.datePublished,
        aanvraagTransformed,
        today
      ) as string;

      const stepData: StatusLineItem = {
        id: `status-step-${index}`,
        status: statusItem.status,
        description: parseLabelContent(
          statusItem.description,
          aanvraagTransformed,
          today
        ),
        datePublished,
        isActive: statusItem.isActive(index, aanvraagTransformed, today),
        isChecked: statusItem.isChecked(index, aanvraagTransformed, today),
        isVisible: statusItem.isVisible
          ? statusItem.isVisible(index, aanvraagTransformed, today)
          : true,
        documents: [], // NOTE: Assigned in specific service transformers.
      };

      return stepData.isVisible ? stepData : null;
    })
    .filter(Boolean) as StatusLineItem[];

  return statusLineItems;
}
