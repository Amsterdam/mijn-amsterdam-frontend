import { differenceInMonths } from 'date-fns';
import type {
  Samenvoegingsvergunning,
  Onttrekkingsvergunning,
  OnttrekkingsvergunningSloop,
  VormenVanWoonruimte,
  Splitsingsvergunning,
  TouringcarDagontheffing,
  TouringcarJaarontheffing,
  EigenParkeerplaatsOpheffen,
  EigenParkeerplaats,
} from '../../server/services/vergunningen/vergunningen';
import {
  Vergunning,
  VergunningExpirable,
} from '../../server/services/vergunningen/vergunningen';
import { CaseType } from '../types/vergunningen';
import { isDateInPast, monthsFromNow } from './date';

export const NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END = 3;

const EXCLUDED_CASETYPES_FOR_DOCUMENTS_DISPLAY = [
  CaseType.GPP,
  CaseType.GPK,
  CaseType.Omzettingsvergunning,
  CaseType.EvenementMelding,
  CaseType.EvenementVergunning,
  CaseType.Flyeren,
  CaseType.AanbiedenDiensten,
  CaseType.NachtwerkOntheffing,
  CaseType.Samenvoegingsvergunning,
  CaseType.Onttrekkingsvergunning,
  CaseType.OnttrekkingsvergunningSloop,
  CaseType.VormenVanWoonruimte,
];

const CASE_TYPES_WITH_WORKFLOW = [
  CaseType.Omzettingsvergunning,
  CaseType.NachtwerkOntheffing,
  CaseType.ZwaarVerkeer,
  CaseType.Samenvoegingsvergunning,
  CaseType.Onttrekkingsvergunning,
  CaseType.OnttrekkingsvergunningSloop,
  CaseType.VormenVanWoonruimte,
  CaseType.Splitsingsvergunning,
  CaseType.VOB,
  CaseType.ExploitatieHorecabedrijf,
  CaseType.RVVHeleStad,
  CaseType.RVVSloterweg,
  CaseType.EigenParkeerplaats,
  CaseType.EigenParkeerplaatsOpheffen,
  CaseType.TouringcarDagontheffing,
  CaseType.TouringcarJaarontheffing,
  CaseType.WVOS,
];

export const woonVergunningTypes = [
  CaseType.Samenvoegingsvergunning,
  CaseType.Onttrekkingsvergunning,
  CaseType.OnttrekkingsvergunningSloop,
  CaseType.VormenVanWoonruimte,
  CaseType.Splitsingsvergunning,
];

export type WoningVergunning =
  | Samenvoegingsvergunning
  | Onttrekkingsvergunning
  | OnttrekkingsvergunningSloop
  | VormenVanWoonruimte
  | Splitsingsvergunning;

export function isWoonvergunning(
  vergunning: Vergunning
): vergunning is WoningVergunning {
  return woonVergunningTypes.includes(
    (vergunning as WoningVergunning).caseType
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

export function hasWorkflow(caseType: CaseType) {
  return CASE_TYPES_WITH_WORKFLOW.includes(caseType);
}

export function showDocuments(caseType: CaseType) {
  const isExcluded =
    EXCLUDED_CASETYPES_FOR_DOCUMENTS_DISPLAY.includes(caseType);
  return !isExcluded;
}

export function getCustomTitleForVergunningWithLicensePlates(
  vergunning:
    | TouringcarDagontheffing
    | TouringcarJaarontheffing
    | EigenParkeerplaatsOpheffen
    | EigenParkeerplaats
) {
  if (vergunning.caseType === CaseType.TouringcarDagontheffing) {
    return `${vergunning.title} (${vergunning.licensePlate})`;
  } else {
    const plates = vergunning.licensePlates?.split(' | ');
    if (plates?.length === 1) {
      return `${vergunning.title} (${vergunning.licensePlates})`;
    } else if (!!plates && plates?.length > 1) {
      return `${vergunning.title} (${plates[0]}... +${plates.length - 1})`;
    }
    return vergunning.title;
  }
}
