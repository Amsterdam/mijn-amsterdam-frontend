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

export const isExpireable = (caseType: CaseType) =>
  [CaseType.GPK, CaseType.BZB, CaseType.BZP].includes(caseType);

export const showDocuments = (caseType: CaseType) =>
  ![
    CaseType.GPP,
    CaseType.GPK,
    CaseType.Omzettingsvergunning,
    CaseType.EvenementMelding,
    CaseType.EvenementVergunning,
    CaseType.Flyeren,
    CaseType.AanbiedenDiensten,
  ].includes(caseType);
