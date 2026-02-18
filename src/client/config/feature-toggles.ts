import type { ThemaFeatureToggle } from './thema-types';
import {
  type FeatureToggles,
  type FeatureToggleKey,
} from '../../server/config/azure-appconfiguration';
import { entries } from '../../universal/helpers/utils';

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
  const g = globalThis as unknown as {
    [GLOBALTHIS_FEATURETOGGLE_KEY]: FeatureToggles;
  };
  if (!g.MA_FEATURETOGGLES) {
    return false;
  }
  return g.MA_FEATURETOGGLES[featureToggleKey] === true;
}
