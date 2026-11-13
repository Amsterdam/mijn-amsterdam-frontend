import type { ReactNode } from 'react';

import type { ServiceAlertsOverview } from '../../../../../server/services/service-alerts/service-alerts.types.ts';
import type { AdminThemaConfig } from '../../../../../universal/types/thema-types.ts';
import type { DisplayProps } from '../../../../components/Table/TableV2.types.ts';

const THEMA_ID = 'AdminStoringsMelding';
const THEMA_TITLE = 'Storingsmeldingen';

export const TITLE_ADD_STORINGSMELDING = 'Storingsmelding toevoegen';
export const TITLE_ADD_STORINGSMELDING_LINK = 'Storingsmelding aanmaken';
export const TEXT_NO_CONTENT = 'Er zijn geen storingsmeldingen';

export type ServiceAlertOverviewItem = Pick<
  ServiceAlertsOverview[number],
  'id' | 'title' | 'dateStart' | 'dateEnd'
> & {
  type: string;
  displayLocation: string;
  detailLinkComponent?: ReactNode;
};

export const displayProps: DisplayProps<ServiceAlertOverviewItem> = {
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
} as const satisfies AdminStoringsMeldingenThemaConfig;
