import { differenceInDays, parseISO } from 'date-fns';

import {
  MINIMUM_DAYS_FOR_WILL_EXPIRE_NOTIFICATION,
  PERCENTAGE_OF_LIFETIME_FOR_WILL_EXPIRE_NOTIFICATION,
} from './config-and-types';
import { isDateInPast } from '../../../universal/helpers/date';
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
  if (vergunning.caseType === 'Touringcar Dagontheffing') {
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

export function isNearEndDate(
  dateStart: string | null,
  dateEnd: string | null,
  dateNow?: Date,
  percentageOfLifetime = PERCENTAGE_OF_LIFETIME_FOR_WILL_EXPIRE_NOTIFICATION
) {
  if (!dateEnd || !dateStart || isDateInPast(dateEnd, dateNow)) {
    return false;
  }

  const daysInBetweenStartAndEnd = differenceInDays(
    parseISO(dateEnd),
    parseISO(dateStart)
  );

  if (daysInBetweenStartAndEnd < MINIMUM_DAYS_FOR_WILL_EXPIRE_NOTIFICATION) {
    return false;
  }

  const nDateNow = dateNow || new Date();
  const daysUntilEnd = differenceInDays(parseISO(dateEnd), nDateNow);

  return (
    daysInBetweenStartAndEnd - daysUntilEnd >=
    Math.round(daysInBetweenStartAndEnd * percentageOfLifetime)
  );
}
