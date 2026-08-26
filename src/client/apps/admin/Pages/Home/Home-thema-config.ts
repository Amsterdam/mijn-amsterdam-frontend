import type { AdminThemaConfig } from '../../../../../universal/types/thema-types.ts';

const THEMA_ID = 'AdminHome';
const THEMA_TITLE = 'Home';

type AdminHomeThemaConfig = AdminThemaConfig<typeof THEMA_ID>;

export const themaConfig = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  featureToggle: {
    active: true,
  },
  route: {
    path: '/',
    documentTitle: `${THEMA_TITLE} | overzicht`,
    trackingUrl: null,
  },
} as const satisfies AdminHomeThemaConfig;
