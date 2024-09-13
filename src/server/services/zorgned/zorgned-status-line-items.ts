import { StatusLineItem } from '../../../universal/types';
import {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemsConfig,
} from './zorgned-types';
import { parseLabelContent } from './zorgned-helpers';

// If a config property for the leveringsVorm, productSoortCodes or productIdentificatie is not found,
// we set the match to true so the check doesn't influence the selection criteria and returns items by default.
const PASS_MATCH_DEFAULT = true;

function getStatusLineItemTransformers(
  statusLineItemsConfig: ZorgnedStatusLineItemsConfig[],
  aanvraagTransformed: ZorgnedAanvraagTransformed,
  allAanvragenTransformed: ZorgnedAanvraagTransformed[]
) {
  return statusLineItemsConfig.find((config) => {
    const hasRegelingsVormMatch =
      typeof config.leveringsVorm !== 'undefined'
        ? aanvraagTransformed.leveringsVorm === config.leveringsVorm
        : PASS_MATCH_DEFAULT;

    const hasProductSoortCodeMatch =
      typeof config.productsoortCodes !== 'undefined'
        ? config.productsoortCodes.includes(
            aanvraagTransformed.productsoortCode
          )
        : PASS_MATCH_DEFAULT;

    const hasProductIdentificatieMatch =
      typeof config.productIdentificatie !== 'undefined'
        ? typeof aanvraagTransformed.productIdentificatie !== 'undefined'
          ? config.productIdentificatie.includes(
              aanvraagTransformed.productIdentificatie
            )
          : false
        : PASS_MATCH_DEFAULT;

    const isFilterMatch =
      typeof config.filter !== 'undefined'
        ? config.filter(aanvraagTransformed, allAanvragenTransformed)
        : PASS_MATCH_DEFAULT;

    return (
      isFilterMatch &&
      hasRegelingsVormMatch &&
      hasProductSoortCodeMatch &&
      hasProductIdentificatieMatch
    );
  })?.lineItemTransformers;
}

export function getStatusLineItems(
  serviceName: 'WMO' | 'HLI',
  statusLineItemsConfig: ZorgnedStatusLineItemsConfig[],
  aanvraagTransformed: ZorgnedAanvraagTransformed,
  allAanvragenTransformed: ZorgnedAanvraagTransformed[],
  today: Date
) {
  const lineItemTransformer = getStatusLineItemTransformers(
    statusLineItemsConfig,
    aanvraagTransformed,
    allAanvragenTransformed
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
        today,
        allAanvragenTransformed
      ) as string;

      const stepData: StatusLineItem = {
        id: `status-step-${index}`,
        status: statusItem.status,
        description: parseLabelContent(
          statusItem.description,
          aanvraagTransformed,
          today,
          allAanvragenTransformed
        ),
        datePublished,
        isActive: statusItem.isActive(
          index,
          aanvraagTransformed,
          today,
          allAanvragenTransformed
        ),
        isChecked: statusItem.isChecked(
          index,
          aanvraagTransformed,
          today,
          allAanvragenTransformed
        ),
        isVisible: statusItem.isVisible
          ? statusItem.isVisible(
              index,
              aanvraagTransformed,
              today,
              allAanvragenTransformed
            )
          : true,
        documents: [], // NOTE: Assigned in specific service transformers.
      };

      return stepData.isVisible ? stepData : null;
    })
    .filter(Boolean) as StatusLineItem[];

  return statusLineItems;
}

export const forTesting = {
  getStatusLineItemTransformers,
};
