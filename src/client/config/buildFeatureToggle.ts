import type { ThemaFeatureToggle } from './thema-types';

export function buildFeatureToggle(
  toggle: ThemaFeatureToggle
): ThemaFeatureToggle & Record<string, boolean> {
  const featureToggle = { ...toggle } as ThemaFeatureToggle &
    Record<string, boolean>;

  const parents = toggle.parents;
  if (!parents) {
    return featureToggle;
  }

  for (const parentKey in parents) {
    const parent = parents[parentKey];
    const parentOn = toggle.themaActive && !!parent.active;
    featureToggle[`${parentKey}Active`] = parentOn;

    const children = parent.children ?? {};
    for (const childKey in children) {
      const childValue = !!children[childKey];
      featureToggle[childKey] = parentOn && childValue;
    }
  }

  return featureToggle;
}
