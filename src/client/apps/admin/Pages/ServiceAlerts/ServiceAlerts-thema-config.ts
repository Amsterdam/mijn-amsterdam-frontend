import type { ServiceAlertsOverview } from '../../../../../server/services/service-alerts/service-alerts.types.ts';
import type { AdminThemaConfig } from '../../../../../universal/types/thema-types.ts';
import type { DisplayProps } from '../../../../components/Table/TableV2.types.ts';

const THEMA_ID = 'AdminStoringsMelding';
const THEMA_TITLE = 'Storingsmeldingen';

export const TITLE_ADD_STORINGSMELDING = 'Storingsmelding toevoegen';
export const TEXT_NO_CONTENT = 'Er zijn geen storingsmeldingen';

type ServiceAlertOverviewDisplayItem = ServiceAlertsOverview[number] & {
  type: string;
  displayLocation: string;
};

export const displayProps: DisplayProps<ServiceAlertOverviewDisplayItem> = {
  props: {
    detailLinkComponent: 'Titel',
    type: 'Type',
    displayLocation: 'Locatie',
    dateStart: 'Start',
    dateEnd: 'Eind',
  },
  enableMobileListView: true,
  colWidths: {
    large: ['32%', '14%', '22%', '16%', '16%'],
    small: ['32%', '14%', '22%', '16%', '16%'],
  },
};

type AdminStoringsMeldingenThemaConfig = AdminThemaConfig<typeof THEMA_ID>;

export const routePath = '/storings-meldingen';
export const routePathToevoegen = `${routePath}/toevoegen`;
export const routePathDetail = `${routePath}/:id`;

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
