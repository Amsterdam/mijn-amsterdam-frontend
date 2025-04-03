import { defaultDateFormat } from '../universal/helpers/date';
import { StatusLineItem } from '../universal/types';

export function getLatestStatusStep(
  steps: StatusLineItem[]
): StatusLineItem | null {
  const active = steps.findLast((step) => step.isActive);
  if (active) {
    return active;
  }
  const checked = steps.findLast((step) => step.isChecked);
  if (checked) {
    return checked;
  }
  return null;
}

export function getLatestStatus(steps: StatusLineItem[]) {
  return getLatestStatusStep(steps)?.status ?? 'Onbekend';
}

export function getLatestStatusDate(
  steps: StatusLineItem[],
  doTransformDate: boolean = false
) {
  const date = getLatestStatusStep(steps)?.datePublished;
  if (date && doTransformDate) {
    return defaultDateFormat(date);
  }
  return date || '-';
}
