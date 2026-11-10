import type { AdminThemaConfig } from '../../../../../universal/types/thema-types.ts';

const THEMA_ID = 'AdminStoringsMelding';
const THEMA_TITLE = 'Storingsmeldingen';

export const TITLE_ADD_STORINGSMELDING = 'Storingsmelding toevoegen';

type AdminStoringsMeldingenThemaConfig = AdminThemaConfig<typeof THEMA_ID>;

export const routePath = 'storings-meldingen';
export const routePathToevoegen = routePath + '/toevoegen';

export const themaConfig = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  featureToggle: {
    active: true,
  },
  route: {
    path: routePath,
    documentTitle: `Overzicht | ${THEMA_TITLE}`,
    trackingUrl: null,
  },
  pageLinks: [
    {
      to: routePathToevoegen,
      title: 'Storingsmelding aanmaken',
    },
  ],
} as const satisfies AdminStoringsMeldingenThemaConfig;
