import type { ThemaFeatureToggle } from './thema-types';

export const buildFeatureToggle = <T extends ThemaFeatureToggle>(
  obj: T,
  active = true
): T => {
  if (typeof obj.active === 'boolean') {
    active = active && obj.active;
  }

  obj.active = active;

  for (const key in obj) {
    const value = obj[key];

    if (typeof value === 'boolean') {
      obj[key] = (value && active) as typeof value;
    } else if (value && typeof value === 'object') {
      buildFeatureToggle(value as ThemaFeatureToggle, active);
    }
  }

  return obj;
};
