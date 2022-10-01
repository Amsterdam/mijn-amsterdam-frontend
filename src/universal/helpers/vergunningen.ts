import { differenceInMonths } from 'date-fns';
import {
  Vergunning,
  VergunningExpirable,
} from '../../server/services/vergunningen/vergunningen';
import { CaseType } from '../types/vergunningen';
import { isDateInPast, monthsFromNow } from './date';

export const MONTHS_TO_KEEP_NOTIFICATIONS = 3;
export const NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END = 3;

export function isActualNotification(
  datePublished: string,
  dateNow: Date
): boolean {
  return (
    differenceInMonths(dateNow, new Date(datePublished)) <
    MONTHS_TO_KEEP_NOTIFICATIONS
  );
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

export function isExpired(vergunning: VergunningExpirable, dateNow?: Date) {
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

export const hasWorkflow = (caseType: CaseType) =>
  caseType === CaseType.Omzettingsvergunning;

export const showDocuments = (caseType: CaseType) => {
  const shouldShowDocuments = ![
    CaseType.GPP,
    CaseType.GPK,
    CaseType.Omzettingsvergunning,
    CaseType.EvenementMelding,
    CaseType.EvenementVergunning,
    CaseType.Flyeren,
    CaseType.AanbiedenDiensten,
  ].includes(caseType);
  return shouldShowDocuments;
};
