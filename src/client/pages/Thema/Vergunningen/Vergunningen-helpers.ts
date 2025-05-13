import type {
  WithDateEnd,
  WithTimeRange,
} from '../../../../server/services/decos/decos-types';
import { dateTimeFormatYear } from '../../../../universal/helpers/date';
import type { ZaakDetail } from '../../../../universal/types/App.types';

export type VergunningAanvraag = ZaakDetail & {
  processed: boolean;
};

export type VergunningExpirable = VergunningAanvraag & {
  isExpired?: boolean;
};

export function isVergunningExpirable<T extends VergunningExpirable>(
  vergunning: T
) {
  return !!vergunning.steps.some((step) => step.status === 'Verlopen');
}

export function isVergunningExpired<T extends VergunningExpirable>(
  vergunning: T
) {
  return vergunning.steps.some(
    (step) => step.status === 'Verlopen' && step.isActive
  );
}

export function dateTimeEndFormatted<
  T extends Partial<WithTimeRange & WithDateEnd>,
>(zaak: T) {
  if (zaak.dateEnd && zaak.timeEnd) {
    return dateTimeFormatYear(`${zaak.dateEnd.split('T')[0]}T${zaak.timeEnd}`);
  }
  return zaak.dateEndFormatted;
}
