import {
  DECOS_EXCLUDE_CASES_WITH_INVALID_DFUNCTION,
  DECOS_EXCLUDE_CASES_WITH_PENDING_PAYMENT_CONFIRMATION_SUBJECT1,
  DECOS_PENDING_PAYMENT_CONFIRMATION_TEXT11,
  DECOS_PENDING_PAYMENT_CONFIRMATION_TEXT12,
  DECOS_PENDING_REMOVAL_DFUNCTION,
  DecosZaakSource,
  DecosZaakTypeTransformer,
  NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END,
  VergunningV2,
} from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import {
  defaultDateFormat,
  isDateInPast,
  monthsFromNow,
} from '../../../universal/helpers/date';
import { DecosCaseType } from '../../../universal/types/vergunningen';
import { AuthProfileAndToken } from '../../auth/auth-types';

// Checks to see if a payment was not processed correctly/completely yet.
export function isWaitingForPaymentConfirmation(
  decosZaakSource: DecosZaakSource
) {
  const zaakType = getDecosZaakTypeFromSource(decosZaakSource);

  const isWaitingForPaymentConfirmation =
    decosZaakSource.fields.text11?.toLowerCase() ==
      DECOS_PENDING_PAYMENT_CONFIRMATION_TEXT11 &&
    decosZaakSource.fields.text12?.toLowerCase() ==
      DECOS_PENDING_PAYMENT_CONFIRMATION_TEXT12;

  const isWaitingForPaymentConfirmation2 =
    !!decosZaakSource.fields.subject1 &&
    DECOS_EXCLUDE_CASES_WITH_PENDING_PAYMENT_CONFIRMATION_SUBJECT1.includes(
      decosZaakSource.fields.subject1?.toLowerCase()
    );

  return (
    !!decosZaakTransformers[zaakType]?.requirePayment &&
    (isWaitingForPaymentConfirmation || isWaitingForPaymentConfirmation2)
  );
}

// Cases that match the following condition are not shown to the user.
export function hasInvalidDecision(decosZaakSource: DecosZaakSource) {
  return decosZaakSource.fields.dfunction
    ? DECOS_EXCLUDE_CASES_WITH_INVALID_DFUNCTION.includes(
        decosZaakSource.fields.dfunction?.toLowerCase()
      )
    : false;
}

// Cases that match the following condition are not show to the user.
export function isScheduledForRemoval(decosZaakSource: DecosZaakSource) {
  return !!decosZaakSource.fields.subject1
    ?.toLowerCase()
    .includes(DECOS_PENDING_REMOVAL_DFUNCTION);
}

export function isExcludedFromTransformation(
  zaakSource: DecosZaakSource,
  zaakTypeTransformer: DecosZaakTypeTransformer
) {
  return (
    isScheduledForRemoval(zaakSource) ||
    isWaitingForPaymentConfirmation(zaakSource) ||
    hasInvalidDecision(zaakSource) ||
    !zaakTypeTransformer.isActive ||
    // Check if we have data we want to transform or not.
    (typeof zaakTypeTransformer.hasValidSourceData === 'function' &&
      !zaakTypeTransformer.hasValidSourceData(zaakSource))
  );
}

// Transforms kenteken values to a list separated by a pipe.
export function transformKenteken(kentekenSource: string | null) {
  if (typeof kentekenSource === 'string') {
    const kentekenSanitizedTransformed = kentekenSource
      .replace(/[^0-9a-zA-Z-]+/g, ' ')
      .replace(/-/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase()
      .replace(/\s/g, ' | ');
    return kentekenSanitizedTransformed;
  }

  return kentekenSource;
}

export function getCustomTitleForVergunningWithLicensePlates(
  vergunning: VergunningV2
) {
  if ('kentekens' in vergunning) {
    const plates = vergunning.kentekens?.split(' | ');
    if (plates?.length === 1) {
      return `${vergunning.title} (${vergunning.kentekens})`;
    } else if (!!plates && plates.length > 1) {
      return `${vergunning.title} (${plates[0]}... +${plates.length - 1})`;
    }
  }
  return vergunning.title;
}

export function getDecosZaakTypeFromSource(decosZaakSource: DecosZaakSource) {
  return decosZaakSource.fields.text45 as DecosCaseType;
}

export function transformBoolean(input: any) {
  return !!input;
}

export function getUserKeysSearchQuery(
  bookKey: string,
  id: AuthProfileAndToken['profile']['id']
) {
  const searchQuery = {
    bookKey,
    orderBy: 'sequence',
    skip: 0,
    take: 50,
    searchInHierarchyPath: false,
    searchInPendingItemContainerKeys: false,
    filterFields: {
      num1: [{ FilterOperation: 1, FilterValue: id, FilterOperator: '=' }],
    },
  };
  return searchQuery;
}

export function isNearEndDate(
  vergunning: { dateEnd: string | null },
  dateNow: Date = new Date()
) {
  if (!vergunning.dateEnd) {
    return false;
  }

  const monthsTillEnd = monthsFromNow(vergunning.dateEnd, dateNow);

  return (
    !isExpired(vergunning, dateNow) &&
    monthsTillEnd < NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END &&
    monthsTillEnd >= 0 // Only show the notification if we have a long-running permit validity
  );
}

export function isExpired(
  vergunning: { dateEnd: string | null },
  dateNow: Date = new Date()
) {
  if (!vergunning.dateEnd) {
    return false;
  }

  return isDateInPast(vergunning.dateEnd, dateNow);
}

export function hasOtherActualVergunningOfSameType(
  items: Array<VergunningV2>,
  item: VergunningV2
): boolean {
  return items.some(
    (otherVergunning: VergunningV2) =>
      otherVergunning.caseType === item.caseType &&
      otherVergunning.identifier !== item.identifier &&
      !isExpired(otherVergunning)
  );
}

export function toDateFormatted(input: string | null) {
  return input ? defaultDateFormat(input) : null;
}
