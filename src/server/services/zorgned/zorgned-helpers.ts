import { isSameDay, parseISO } from 'date-fns';
import { isDateInPast } from '../../../universal/helpers/date';
import {
  TextPartContents,
  ZorgnedAanvraagTransformed,
} from './zorgned-config-and-types';

export function parseLabelContent(
  text: TextPartContents,
  aanvraag: ZorgnedAanvraagTransformed,
  today: Date,
  allAanvragen: ZorgnedAanvraagTransformed[]
): string {
  let rText = text || '';

  if (typeof rText === 'function') {
    return rText(aanvraag, today, allAanvragen);
  }

  return rText;
}

export function isFutureDate(dateStr: string | null, compareDate: Date) {
  if (!dateStr) {
    return false;
  }
  return isSameDay(parseISO(dateStr), compareDate)
    ? false
    : !isDateInPast(dateStr, compareDate);
}

export function isHistoricDate(dateStr: string | null, compareDate: Date) {
  if (!dateStr) {
    return false;
  }
  return isSameDay(parseISO(dateStr), compareDate)
    ? false
    : isDateInPast(dateStr, compareDate);
}

export function isServiceDeliveryStarted(
  sourceData: ZorgnedAanvraagTransformed,
  compareDate: Date
) {
  return isHistoricDate(sourceData.datumBeginLevering, compareDate);
}

export function isServiceDeliveryStopped(
  sourceData: ZorgnedAanvraagTransformed,
  compareDate: Date
) {
  return isHistoricDate(sourceData.datumEindeLevering, compareDate);
}

export function isServiceDeliveryActive(
  sourceData: ZorgnedAanvraagTransformed,
  compareDate: Date
) {
  return (
    sourceData.isActueel &&
    isServiceDeliveryStarted(sourceData, compareDate) &&
    !isServiceDeliveryStopped(sourceData, compareDate) &&
    !isHistoricDate(sourceData.datumEindeGeldigheid, compareDate)
  );
}
