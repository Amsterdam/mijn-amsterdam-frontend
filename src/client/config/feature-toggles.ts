import type { ThemaFeatureToggle } from './thema-types';
import { type FeatureToggleKey } from '../../server/config/azure-appconfiguration';
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

export function isEnabled(featureToggleKey: FeatureToggleKey): boolean {
  if (!window.MA_FEATURETOGGLES) {
    return false;
  }
  return window.MA_FEATURETOGGLES[featureToggleKey] === true;
}
