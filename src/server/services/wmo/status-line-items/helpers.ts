import { isDateInPast } from '../../../../universal/helpers';
import { TextPartContents, WMOVoorziening } from '../config-and-types';

export function parseLabelContent(
  text: TextPartContents,
  voorziening: WMOVoorziening,
  today: Date
): string {
  let rText = text || '';

  if (typeof rText === 'function') {
    return rText(voorziening, today);
  }

  return rText;
}

export function hasFutureDate(dateStr: string | null, compareDate: Date) {
  if (!dateStr) {
    return false;
  }
  return !isDateInPast(dateStr, compareDate);
}

export function hasHistoricDate(dateStr: string | null, compareDate: Date) {
  if (!dateStr) {
    return false;
  }
  return isDateInPast(dateStr, compareDate);
}

export function isServiceDeliveryStarted(
  sourceData: WMOVoorziening,
  compareDate: Date
) {
  return hasHistoricDate(sourceData.datumBeginLevering, compareDate);
}

export function isServiceDeliveryStopped(
  sourceData: WMOVoorziening,
  compareDate: Date
) {
  return hasHistoricDate(sourceData.datumEindeLevering, compareDate);
}

export function isServiceDeliveryActive(
  sourceData: WMOVoorziening,
  compareDate: Date
) {
  return (
    sourceData.isActueel &&
    isServiceDeliveryStarted(sourceData, compareDate) &&
    !isServiceDeliveryStopped(sourceData, compareDate) &&
    !hasHistoricDate(sourceData.datumEindeGeldigheid, compareDate)
  );
}
