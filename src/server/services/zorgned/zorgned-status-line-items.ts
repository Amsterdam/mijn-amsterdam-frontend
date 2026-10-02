import { parseLabelContent } from './zorgned-helpers.ts';
import type {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemsConfig,
} from './zorgned-types.ts';
import { type ZorgnedStatusLineItemTransformerConfig } from './zorgned-types.ts';
import type { StatusLineItem } from '../../../universal/types/App.types.ts';
import { logger } from '../../logging.ts';

// If a config property for the leveringsVorm, productSoortCodes or productIdentificatie is not found,
// we set the match to true so the check doesn't influence the selection criteria and returns items by default.
const PASS_MATCH_DEFAULT = true;

export function isStatusLineItemTransformerMatch<
  T extends ZorgnedAanvraagTransformed,
>(
  aanvraagTransformed: T,
  allAanvragenTransformed: T[],
  config: ZorgnedStatusLineItemsConfig<T>
): boolean {
  const hasLeveringsVormMatch =
    typeof config.leveringsVorm !== 'undefined'
      ? aanvraagTransformed.leveringsVorm === config.leveringsVorm
      : PASS_MATCH_DEFAULT;

  const hasProductSoortCodeMatch =
    typeof config.productsoortCodes !== 'undefined'
      ? config.productsoortCodes.includes(
          aanvraagTransformed.productsoortCode
            ? aanvraagTransformed.productsoortCode
            : ''
        )
      : PASS_MATCH_DEFAULT;

  const hasProductIdentificatieMatch =
    typeof config.productIdentificatie === 'undefined'
      ? PASS_MATCH_DEFAULT
      : typeof aanvraagTransformed.productIdentificatie !== 'undefined' &&
        config.productIdentificatie.includes(
          aanvraagTransformed.productIdentificatie
        );

  const isFilterMatch =
    typeof config.filter !== 'undefined'
      ? config.filter(aanvraagTransformed, allAanvragenTransformed)
      : PASS_MATCH_DEFAULT;

  const hasResultaatMatch =
    typeof config.resultaat !== 'undefined'
      ? aanvraagTransformed.resultaat === config.resultaat
      : PASS_MATCH_DEFAULT;

  return (
    isFilterMatch &&
    hasLeveringsVormMatch &&
    hasProductSoortCodeMatch &&
    hasProductIdentificatieMatch &&
    hasResultaatMatch
  );
}

function getStatusLineItemTransformers<T extends ZorgnedAanvraagTransformed>(
  statusLineItemsConfig: ZorgnedStatusLineItemsConfig<T>[],
  aanvraagTransformed: T,
  allAanvragenTransformed: T[]
): ZorgnedStatusLineItemTransformerConfig<T>[] | null {
  return (
    statusLineItemsConfig
      .filter((config) => !config.isDisabled)
      .find((config) =>
        isStatusLineItemTransformerMatch(
          aanvraagTransformed,
          allAanvragenTransformed,
          config
        )
      )?.statusLineItems.transformers ?? null
  );
}

function buildStatusLineItem<T extends ZorgnedAanvraagTransformed>(
  statusItem: ZorgnedStatusLineItemTransformerConfig<T>,
  idPath: string,
  aanvraagTransformed: T,
  allAanvragenTransformed: T[],
  today: Date
): StatusLineItem | null {
  const datePublished = parseLabelContent<T>(
    statusItem.datePublished,
    aanvraagTransformed,
    today,
    allAanvragenTransformed
  ) as string;

  const isVisible =
    typeof statusItem.isVisible === 'function'
      ? statusItem.isVisible(
          aanvraagTransformed,
          today,
          allAanvragenTransformed
        )
      : (statusItem.isVisible ?? true);

  const substeps = statusItem.substeps
    ?.map((substep, subIndex) =>
      buildStatusLineItem(
        substep,
        `${idPath}.${subIndex}`,
        aanvraagTransformed,
        allAanvragenTransformed,
        today
      )
    )
    .filter(Boolean) as StatusLineItem[] | undefined;

  const stepData: StatusLineItem = {
    id: `status-step-${idPath}`,
    status: parseLabelContent<T>(
      statusItem.status,
      aanvraagTransformed,
      today,
      allAanvragenTransformed
    ),
    description: parseLabelContent<T>(
      statusItem.description,
      aanvraagTransformed,
      today,
      allAanvragenTransformed
    ),
    datePublished,
    ...(typeof statusItem.hideDateInProgressList !== 'undefined' && {
      hideDateInProgressList: statusItem.hideDateInProgressList,
    }),
    isActive:
      typeof statusItem.isActive === 'function'
        ? statusItem.isActive(
            aanvraagTransformed,
            today,
            allAanvragenTransformed
          )
        : statusItem.isActive,
    isChecked:
      typeof statusItem.isChecked === 'function'
        ? statusItem.isChecked(
            aanvraagTransformed,
            today,
            allAanvragenTransformed
          )
        : statusItem.isChecked,
    isVisible,
    documents: [], // NOTE: Assigned in specific service transformers.
  };

  if (substeps?.length) {
    stepData.substeps = substeps;
  }

  return stepData.isVisible ? stepData : null;
}

export function getStatusLineItems<T extends ZorgnedAanvraagTransformed>(
  serviceName: 'WMO' | 'HLI' | 'LLV',
  statusLineItemsConfig: ZorgnedStatusLineItemsConfig<T>[],
  aanvraagTransformed: T,
  allAanvragenTransformed: T[],
  today: Date
) {
  const lineItemTransformer = getStatusLineItemTransformers<T>(
    statusLineItemsConfig,
    aanvraagTransformed,
    allAanvragenTransformed
  );

  if (!lineItemTransformer) {
    logger.error(
      `No line item formatters found for Service: ${serviceName}, resultaat: ${aanvraagTransformed.resultaat}, leveringsVorm: ${aanvraagTransformed.leveringsVorm}, productsoortCode: ${aanvraagTransformed.productsoortCode}, productIdentificatie: ${aanvraagTransformed.productIdentificatie}`
    );
    return null;
  }

  const statusLineItems: StatusLineItem[] = lineItemTransformer
    .map((statusItem, index) =>
      buildStatusLineItem(
        statusItem,
        `${index}`,
        aanvraagTransformed,
        allAanvragenTransformed,
        today
      )
    )
    .filter(Boolean) as StatusLineItem[];

  return statusLineItems;
}

export const forTesting = {
  getStatusLineItemTransformers,
};
