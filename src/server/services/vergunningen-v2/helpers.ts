import { isDateInPast, monthsFromNow } from '../../../universal/helpers/date';
import { DecosCaseType } from '../../../universal/types/vergunningen';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  DecosZaakSource,
  DecosZaakTypeTransformer,
  NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END,
  Vergunning,
  VergunningExpirable,
} from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';

// Checks to see if a payment was not processed correctly/completely yet.
export function isWaitingForPaymentConfirmation(
  decosZaakSource: DecosZaakSource
) {
  const zaakType = getDecosZaakTypeFromSource(decosZaakSource);

  const isWaitingForPaymentConfirmation =
    decosZaakSource.fields.text11 == 'Nogniet' &&
    decosZaakSource.fields.text12 == 'Wacht op online betaling';

  const isWaitingForPaymentConfirmation2 = [
    'wacht op online betaling',
    'wacht op ideal betaling',
  ].includes(decosZaakSource.fields.subject1?.toLowerCase());

  return (
    !!decosZaakTransformers[zaakType]?.requirePayment &&
    (isWaitingForPaymentConfirmation || isWaitingForPaymentConfirmation2)
  );
}

// Cases that match the following condition are not show to the user.
export function hasInvalidDecision(decosZaakSource: DecosZaakSource) {
  return [
    'buiten behandeling',
    'geannuleerd',
    'geen aanvraag of dubbel',
  ].includes(decosZaakSource.fields.dfunction?.toLowerCase());
}

// Cases that match the following condition are not show to the user.
export function isScheduledForRemoval(decosZaakSource: DecosZaakSource) {
  return !!decosZaakSource.fields.dfunction
    ?.toLowerCase()
    .includes('*verwijder');
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
    (zaakTypeTransformer.hasValidSourceData &&
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
  vergunning: Vergunning
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
  vergunning: VergunningExpirable,
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
  vergunning: VergunningExpirable,
  dateNow: Date = new Date()
) {
  if (!vergunning.dateEnd) {
    return false;
  }

  return isDateInPast(vergunning.dateEnd, dateNow);
}

export function hasOtherActualVergunningOfSameType(
  items: Array<Vergunning>,
  item: Vergunning
): boolean {
  return items.some(
    (otherVergunning: Vergunning) =>
      otherVergunning.caseType === item.caseType &&
      otherVergunning.identifier !== item.identifier &&
      !isExpired(otherVergunning)
  );
}
