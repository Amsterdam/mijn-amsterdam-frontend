import { addDays, differenceInDays, parseISO } from 'date-fns';

import {
  MINIMUM_DAYS_FOR_WILL_EXPIRE_NOTIFICATION,
  PERCENTAGE_OF_LIFETIME_FOR_WILL_EXPIRE_NOTIFICATION,
  type ZaakFrontendCombined,
} from './config-and-types.ts';
import { isDateInPast } from '../../../universal/helpers/date.ts';
import type {
  TouringcarDagontheffing,
  TouringcarJaarontheffing,
  EigenParkeerplaatsOpheffen,
  EigenParkeerplaats,
} from '../parkeren/config-and-types.ts';

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

export function getLifetimeTriggerDate(
  dateStart: string,
  dateEnd: string,
  percentageOfLifetime = PERCENTAGE_OF_LIFETIME_FOR_WILL_EXPIRE_NOTIFICATION
): Date {
  const daysInBetweenStartAndEnd = differenceInDays(
    parseISO(dateEnd),
    parseISO(dateStart)
  );

  return addDays(
    dateStart,
    Math.round(daysInBetweenStartAndEnd * percentageOfLifetime)
  );
}

export function isExpiryNotificationDue(
  dateStart: string | null,
  dateEnd: string | null,
  dateNow?: Date,
  percentageOfLifetime = PERCENTAGE_OF_LIFETIME_FOR_WILL_EXPIRE_NOTIFICATION
): boolean {
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
import { caseTypeVergunningen } from './config-and-types.ts';

export function getAanvraagUrlAndText(
  zaak: ZaakFrontendCombined,
  type: 'verlengen' | 'aanvragen'
): { url: string | null; text: string } {
  const config = caseTypeVergunningen[zaak.caseType];

  if (config && config[type]) {
    return {
      url: config[type].url,
      text: config[type].text,
    };
  }

  return {
    url: null,
    text: '',
  };
}
