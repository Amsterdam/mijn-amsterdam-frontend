import type { ThemaFeatureToggle } from './thema-types';
import { entries } from '../../universal/helpers/utils';

export function propagateFeatureToggles<T extends ThemaFeatureToggle>(
  obj: T,
  parentActive = true
): T {
  const toggles = {} as Record<keyof T, unknown>;
  parentActive = parentActive && obj.active;
  for (const [key, value] of entries(obj)) {
    if (typeof value === 'boolean') {
      toggles[key] = value && parentActive;
    } else {
      toggles[key] = propagateFeatureToggles(value, parentActive);
    }
  }
  return toggles as T;
}
