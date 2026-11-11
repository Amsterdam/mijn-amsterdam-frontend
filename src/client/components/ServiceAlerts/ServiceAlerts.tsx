import type { ReactNode } from 'react';

import { StandaloneLink } from '@amsterdam/design-system-react';

import type { ServiceAlertsOverview } from '../../../server/services/service-alerts/service-alerts.types.ts';
import { defaultDateTimeFormat } from '../../../universal/helpers/date.ts';
import { DataView } from '../DataView/DataView.tsx';
import { MaRouterLink } from '../MaLink/MaLink.tsx';
import { PageContentCell } from '../Page/Page.tsx';

export type ServiceAlertOverviewItem = Pick<
  ServiceAlertsOverview[number],
  'title' | 'type' | 'displayLocation' | 'dateStart' | 'dateEnd'
> & {
  id: string;
  detailLinkComponent?: ReactNode;
};

function ServiceAlertsTable({
  overview,
  detailPath,
}: {
  overview: ServiceAlertsOverview;
  detailPath: string;
}) {
  const items: ServiceAlertOverviewItem[] = overview.map((serviceAlert) => ({
    id: serviceAlert.id,
    title: serviceAlert.title,
    detailLinkComponent: (
      <MaRouterLink
        href={`/${detailPath}/${serviceAlert.id}`}
        maVariant="fatNoUnderline"
      >
        {serviceAlert.title}
      </MaRouterLink>
    ),
    type: serviceAlert.type,
    displayLocation: serviceAlert.displayLocation,
    dateStart: defaultDateTimeFormat(serviceAlert.dateStart),
    dateEnd: defaultDateTimeFormat(serviceAlert.dateEnd),
  }));

  return (
    <DataView<ServiceAlertOverviewItem>
      items={items}
      displayProps={{
        props: {
          detailLinkComponent: 'Titel',
          type: 'Type',
          displayLocation: 'Locatie',
          dateStart: 'Startdatum',
          dateEnd: 'Einddatum',
        },
        enableMobileListView: true,
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
  return (
    <PageContentCell>
      <StandaloneLink
        href={`/${detailPath}/toevoegen`}
        linkComponent={MaRouterLink}
      >
        Storingsmelding aanmaken
      </StandaloneLink>
      <ServiceAlertsTable overview={overview} detailPath={detailPath} />
    </PageContentCell>
  );
}
