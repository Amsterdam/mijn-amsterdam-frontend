import { isEnabled } from '../../config/azure-appconfiguration.ts';

export const featureToggle = {
  service: {
    fetchWonen: {
      isEnabled: isEnabled('WONEN.vve'),
    },
  },
} as const;
