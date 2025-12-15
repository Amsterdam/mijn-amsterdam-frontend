import { describe, it } from 'vitest';

import { getPropagatedToggles } from './buildFeatureToggle';

describe('buildFeatureToggle', () => {
  it('does not modify subtoggle state when the parent is true', () => {
    const toggles = {
      active: true,
      feature: {
        active: false,
      },
    };
    expect(getPropagatedToggles(toggles)).toStrictEqual({ ...toggles });
  });

  it('propagates negative active values down', () => {
    const toggles = {
      active: false,
      feature: {
        active: true,
        subFeature: {
          active: true,
        },
      },
    };
    expect(getPropagatedToggles(toggles)).toStrictEqual({
      active: false,
      feature: {
        active: false,
        subFeature: {
          active: false,
        },
      },
    });
  });

  it('propagates negative active values down including non nested subfeatures', () => {
    const toggles = {
      active: false,
      feature: {
        active: true,
        subFeature: true,
        subFeatureB: false,
      },
    };
    expect(getPropagatedToggles(toggles)).toStrictEqual({
      active: false,
      feature: {
        active: false,
        subFeature: false,
        subFeatureB: false,
      },
    });
  });

  it('does not propagate to siblings', () => {
    const toggles = {
      active: true,
      featureA: {
        active: false,
        subFeature: true,
      },
      featureB: {
        active: true,
      },
    };
    expect(getPropagatedToggles(toggles)).toStrictEqual({
      active: true,
      featureA: {
        active: false,
        subFeature: false,
      },
      featureB: {
        active: true,
      },
    });
  });

  it('supports deeply nested toggles', () => {
    const toggles = {
      active: true,
      feature: {
        active: true,
        subFeatureObj: {
          active: true,
          subSubFeatureObj: {
            active: false,
            subSubSubFeatureObj: {
              active: true,
            },
          },
        },
      },
    };
    expect(getPropagatedToggles(toggles)).toStrictEqual({
      active: true,
      feature: {
        active: true,
        subFeatureObj: {
          active: true,
          subSubFeatureObj: {
            active: false,
            subSubSubFeatureObj: {
              active: false,
            },
          },
        },
      },
    });
  });
});
