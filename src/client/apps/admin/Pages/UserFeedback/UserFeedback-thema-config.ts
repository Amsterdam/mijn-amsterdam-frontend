import type { AdminThemaConfig } from '../../../../../universal/types/thema-types.ts';

const THEMA_ID = 'AdminUserFeedback';
const THEMA_TITLE = 'User Feedback (KTO)';

type AdminUserFeedbackThemaConfig = AdminThemaConfig<typeof THEMA_ID>;

export const themaConfig = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  featureToggle: {
    active: true,
  },
  route: {
    path: '/user-feedback',
    documentTitle: `${THEMA_TITLE} | overzicht`,
    trackingUrl: null,
  },
} as const satisfies AdminUserFeedbackThemaConfig;
