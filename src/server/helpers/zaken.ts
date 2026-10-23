import { defaultDateFormat } from '../../universal/helpers/date.ts';
import type { StatusLineItem } from '../../universal/types/App.types.ts';

type StatusLineItemWithSubSteps = StatusLineItem & {
  substeps?: StatusLineItemWithSubSteps[];
};

export function getLatestStatusStep(
  steps: StatusLineItemWithSubSteps[]
): StatusLineItemWithSubSteps | null {
  const active = steps.findLast((step) => step.isActive);

  if (active) {
    return getLatestStatusStep(active.substeps ?? []) ?? active;
  }

  const checked = steps.findLast((step) => step.isChecked);

  if (checked) {
    return getLatestStatusStep(checked.substeps ?? []) ?? checked;
  }

  return null;
}

export function getLatestStatus(steps: StatusLineItem[]): string {
  return getLatestStatusStep(steps)?.status ?? 'Onbekend';
}

export function getLatestStatusDate(
  steps: StatusLineItem[],
  doTransformDate: boolean = false
): string {
  const date = getLatestStatusStep(steps)?.datePublished;
  if (date && doTransformDate) {
    return defaultDateFormat(date);
  }
  return date || '-';
}
