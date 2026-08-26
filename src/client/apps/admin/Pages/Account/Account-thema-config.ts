import type { AdminThemaConfig } from '../../../../../universal/types/thema-types.ts';

const THEMA_ID = 'AdminAccount';
const THEMA_TITLE = 'Account';

type AdminAccountThemaConfig = AdminThemaConfig<typeof THEMA_ID>;

export const themaConfig = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  featureToggle: {
    active: true,
  },
  route: {
    path: '/account',
    documentTitle: `${THEMA_TITLE} | overzicht`,
    trackingUrl: null,
  },
} as const satisfies AdminAccountThemaConfig;
