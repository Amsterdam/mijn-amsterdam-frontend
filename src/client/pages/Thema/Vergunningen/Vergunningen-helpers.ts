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
