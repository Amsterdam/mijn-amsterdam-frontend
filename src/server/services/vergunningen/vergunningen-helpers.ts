import {
  VergunningFrontend,
  NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END,
} from './config-and-types';
import { monthsFromNow, isDateInPast } from '../../../universal/helpers/date';
import { CaseTypeV2 } from '../../../universal/types/decos-zaken';
import {
  TouringcarDagontheffing,
  TouringcarJaarontheffing,
  EigenParkeerplaatsOpheffen,
  EigenParkeerplaats,
} from '../parkeren/config-and-types';

export function getCustomTitleForVergunningWithLicensePlates(
  vergunning:
    | TouringcarDagontheffing
    | TouringcarJaarontheffing
    | EigenParkeerplaatsOpheffen
    | EigenParkeerplaats
) {
  if (vergunning.caseType === CaseTypeV2.TouringcarDagontheffing) {
    return `${vergunning.title} (${vergunning.kentekens})`;
  }
  if ('kentekens' in vergunning) {
    const plates = vergunning.kentekens?.split(' | ');
    if (plates?.length === 1) {
      return `${vergunning.title} (${vergunning.kentekens})`;
    } else if (!!plates && plates?.length > 1) {
      return `${vergunning.title} (${plates[0]}... +${plates.length - 1})`;
    }
  }
  return vergunning.title;
}

export function hasOtherActualVergunningOfSameType(
  items: VergunningFrontend[],
  item: VergunningFrontend
): boolean {
  return items.some(
    (otherVergunning: VergunningFrontend) =>
      otherVergunning.caseType === item.caseType &&
      otherVergunning.identifier !== item.identifier &&
      !isExpired(otherVergunning)
  );
}

export function isNearEndDate(dateEnd?: string | null, dateNow?: Date) {
  if (!dateEnd) {
    return false;
  }

  const nDateNow = dateNow || new Date();
  const monthsTillEnd = monthsFromNow(dateEnd, nDateNow);

  return (
    !isDateInPast(dateEnd, nDateNow) &&
    monthsTillEnd < NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END &&
    monthsTillEnd >= 0 // Only show the notification if we have a long-running permit validity
  );
}

export function isExpired(vergunning: VergunningFrontend, dateNow?: Date) {
  if (!vergunning.dateEnd) {
    return false;
  }

  return isDateInPast(vergunning.dateEnd, dateNow || new Date());
}
