import type { ReactNode } from 'react';

import { StandaloneLink } from '@amsterdam/design-system-react';

import type { ServiceAlertsOverview } from '../../../server/services/service-alerts/service-alerts.types.ts';
import { defaultDateTimeFormat } from '../../../universal/helpers/date.ts';
import { DataView } from '../DataView/DataView.tsx';
import { MaRouterLink } from '../MaLink/MaLink.tsx';
import { PageContentCell } from '../Page/Page.tsx';
import {
  getServiceAlertDisplayLocationLabel,
  getServiceAlertGroups,
  getServiceAlertTypeLabel,
} from './ServiceAlerts.helpers.ts';

export type ServiceAlertOverviewItem = Pick<
  ServiceAlertsOverview[number],
  'title' | 'dateStart' | 'dateEnd'
> & {
  id: string;
  type: ReturnType<typeof getServiceAlertTypeLabel>;
  displayLocation: ReturnType<typeof getServiceAlertDisplayLocationLabel>;
  detailLinkComponent?: ReactNode;
};

function ServiceAlertsTable({
  overview,
  detailPath,
  caption,
}: {
  overview: ServiceAlertsOverview;
  detailPath: string;
  caption: string;
}) {
  const items: ServiceAlertOverviewItem[] = overview.map((serviceAlert) => ({
    id: serviceAlert.id,
    title: serviceAlert.title,
    detailLinkComponent: (
      <MaRouterLink
        href={`${detailPath}/${serviceAlert.id}`}
        maVariant="fatNoUnderline"
      >
        {serviceAlert.title}
      </MaRouterLink>
    ),
    type: getServiceAlertTypeLabel(serviceAlert.type),
    displayLocation: getServiceAlertDisplayLocationLabel(
      serviceAlert.displayLocation,
      serviceAlert.themaId
    ),
    dateStart: defaultDateTimeFormat(serviceAlert.dateStart),
    dateEnd: defaultDateTimeFormat(serviceAlert.dateEnd),
  }));

  return (
    <DataView<ServiceAlertOverviewItem>
      items={items}
      caption={caption}
      className="ams-mb-l"
      displayProps={{
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
      }}
    />
  );
}

export function ServiceAlertsPageContent({
  overview,
  detailPath,
}: {
  overview: ServiceAlertsOverview;
  detailPath: string;
}) {
  const { active, upcoming, past } = getServiceAlertGroups(overview);

  return (
    <PageContentCell>
      <StandaloneLink
        href={`${detailPath}/toevoegen`}
        linkComponent={MaRouterLink}
        className="ams-mb-l"
      >
        Storingsmelding aanmaken
      </StandaloneLink>
      <ServiceAlertsTable
        overview={active}
        detailPath={detailPath}
        caption="Actief"
      />
      <ServiceAlertsTable
        overview={upcoming}
        detailPath={detailPath}
        caption="Binnenkort"
      />
      <ServiceAlertsTable
        overview={past}
        detailPath={detailPath}
        caption="Afgelopen"
      />
    </PageContentCell>
  );
}
