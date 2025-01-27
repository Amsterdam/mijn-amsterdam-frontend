import type {
  DecosZaakTransformer,
  DecosZaakSource,
  DecosZaakBase,
  DecosZaakWithKentekens,
  ZaakStatus,
  DecosFieldValue,
} from './decos-types';
import {
  DECOS_EXCLUDE_CASES_WITH_INVALID_DFUNCTION,
  DECOS_EXCLUDE_CASES_WITH_PENDING_PAYMENT_CONFIRMATION_SUBJECT1,
  DECOS_PENDING_PAYMENT_CONFIRMATION_TEXT11,
  DECOS_PENDING_PAYMENT_CONFIRMATION_TEXT12,
  DECOS_PENDING_REMOVAL_DFUNCTION,
} from './decos-types';
import {
  defaultDateFormat,
  isDateInPast,
  monthsFromNow,
} from '../../../universal/helpers/date';
import { entries } from '../../../universal/helpers/utils';
import { NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END } from '../../../universal/helpers/vergunningen';
import { AuthProfileAndToken } from '../../auth/auth-types';

// Checks to see if a payment was not processed correctly/completely yet.
export function isWaitingForPaymentConfirmation(
  decosZaakSource: DecosZaakSource,
  zaakTypeTransformer: DecosZaakTransformer<any>
) {
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
    !!zaakTypeTransformer.requirePayment &&
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
  zaakTypeTransformer: DecosZaakTransformer<any>
) {
  return (
    isScheduledForRemoval(zaakSource) ||
    isWaitingForPaymentConfirmation(zaakSource, zaakTypeTransformer) ||
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

export const translateValue =
  <T>(translationMapping: { [K in keyof T]: DecosFieldValue[] }) =>
  (input: string) => {
    if (translationMapping) {
      const maValue = entries(translationMapping).find(
        ([maValue, decosValues]) => {
          return decosValues.includes(input);
        }
      )?.[0];
      return maValue ?? input;
    }
    return input;
  };

export function getCustomTitleForDecosZaakWithLicensePlates(
  decosZaak: DecosZaakWithKentekens
) {
  if ('kentekens' in decosZaak) {
    const plates = decosZaak.kentekens?.split(' | ');
    if (plates?.length === 1) {
      return `${decosZaak.title} (${decosZaak.kentekens})`;
    } else if (!!plates && plates.length > 1) {
      return `${decosZaak.title} (${plates[0]}... +${plates.length - 1})`;
    }
  }
  return decosZaak.title;
}

export function getDecosZaakTypeFromSource<T extends DecosZaakSource>(
  decosZaakSource: T
) {
  // TODO: Base this on the transformer or DZ?
  return decosZaakSource.fields.text45;
}

export function transformBoolean(input: unknown) {
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
  decosZaak: { dateEnd: string | null },
  dateNow: Date = new Date()
) {
  if (!decosZaak.dateEnd) {
    return false;
  }

  const monthsTillEnd = monthsFromNow(decosZaak.dateEnd, dateNow);

  return (
    !isExpired(decosZaak, dateNow) &&
    monthsTillEnd < NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END &&
    monthsTillEnd >= 0 // Only show the notification if we have a long-running permit validity
  );
}

export function isExpired(
  decosZaak: { dateEnd: string | null },
  dateNow: Date = new Date()
) {
  if (!decosZaak.dateEnd) {
    return false;
  }

  return isDateInPast(decosZaak.dateEnd, dateNow);
}

export function hasOtherActualDecosZaakOfSameType(
  items: Array<DecosZaakBase>,
  item: DecosZaakBase
): boolean {
  return items.some(
    (otherDecosZaak: DecosZaakBase) =>
      otherDecosZaak.caseType === item.caseType &&
      otherDecosZaak.identifier !== item.identifier &&
      !isExpired(otherDecosZaak)
  );
}

export function toDateFormatted(input: string | null) {
  return input ? defaultDateFormat(input) : null;
}

// Try to fetch and assign a specific date on which the zaak was "In behandeling"
export function getStatusDate(
  zaakStatus: ZaakStatus,
  decosZaak: DecosZaakBase
) {
  return (
    decosZaak.statusDates.find(({ status }) => status === zaakStatus)
      ?.datePublished || null
  );
}
