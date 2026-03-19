import type { ThemaFeatureToggle } from './thema-types.ts';
import type { FeatureToggleKey } from '../../server/config/feature-toggles.ts';
import { entries } from '../../universal/helpers/utils.ts';

export const GLOBALTHIS_FEATURETOGGLE_KEY = 'MA_FEATURETOGGLES';

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

export function isEnabled(featureToggleKey: FeatureToggleKey): boolean {
  if (!globalThis.MA_FEATURETOGGLES) {
    return false;
  }
  return globalThis.MA_FEATURETOGGLES[featureToggleKey] === true;
}
