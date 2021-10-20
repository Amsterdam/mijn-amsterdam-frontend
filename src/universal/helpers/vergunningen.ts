import { differenceInMonths } from 'date-fns';
import { VergunningExpirable } from '../../server/services/vergunningen/vergunningen';
import { CaseType } from '../types/vergunningen';
import { isDateInPast, monthsFromNow } from './date';

export const MONTHS_TO_KEEP_NOTIFICATIONS = 3;
export const NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END = 3;

export function isActualNotification(
  datePublished: string,
  compareDate: Date
): boolean {
  return (
    differenceInMonths(compareDate, new Date(datePublished)) <
    MONTHS_TO_KEEP_NOTIFICATIONS
  );
}

export function isNearEndDate(vergunning: VergunningExpirable) {
  if (!vergunning.dateEnd) {
    return false;
  }

  const monthsTillEnd = monthsFromNow(vergunning.dateEnd);
  return (
    !isExpired(vergunning) &&
    monthsTillEnd < NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END &&
    monthsTillEnd >= 0
  );
}

export function isExpired(vergunning: VergunningExpirable) {
  if (!vergunning.dateEnd) {
    return false;
  }

  return isDateInPast(vergunning.dateEnd);
}

export function hasOtherValidVergunningOfSameType(
  items: Array<VergunningExpirable>,
  item: VergunningExpirable
): boolean {
  return items.some(
    (otherVergunning: VergunningExpirable) =>
      otherVergunning.caseType === item.caseType &&
      otherVergunning.identifier !== item.identifier &&
      !isExpired(otherVergunning)
  );
}

export const isWorkflowItem = (caseType: string) =>
  caseType === CaseType.Omzettingsvergunning;

export const isExpireable = (caseType: string) =>
  caseType === CaseType.GPK ||
  caseType === CaseType.BZB ||
  caseType === CaseType.BZP;
