import type { ServiceAlertsOverview } from '../../../../../server/services/service-alerts/service-alerts.types.ts';
import { PageContentCell } from '../../../../components/Page/Page.tsx';
import { ServiceAlertsPageContent } from '../../../../components/ServiceAlerts/ServiceAlerts.tsx';
import { ThemaPagina } from '../../../../components/Thema/ThemaPagina.tsx';
import { useBffApi } from '../../../../hooks/api/useBffApi.ts';
import { BFFApiUrls } from '../../config/api.ts';
import {
  TITLE_ADD_STORINGSMELDING,
  themaConfig,
} from './ServiceAlerts-thema-config.ts';

export function ServiceAlerts() {
  const { isError, data } = useBffApi<ServiceAlertsOverview>(
    BFFApiUrls.SERVICE_ALERTS_OVERVIEW
  );

  if (isError) {
    return null;
  }

  return (
    <ThemaPagina
      title={themaConfig.title}
      showBreadcrumbs={false}
      isError={false}
      isLoading={false}
      id="admin-user-feedback"
      pageContentTop={
        <PageContentCell>Overzicht van storingsmeldingen</PageContentCell>
      }
      pageLinks={[]}
      pageContentMain={
        <ServiceAlertsPageContent overview={data?.content ?? []} />
      }
    />
  );
}

export function ServiceAlertToevoegen() {
  return (
    <ThemaPagina
      title={TITLE_ADD_STORINGSMELDING}
      showBreadcrumbs={false}
      isError={false}
      isLoading={false}
      id="admin-user-feedback"
      pageContentTop={
        <PageContentCell>Toevoegen van storingsmelding</PageContentCell>
      }
      pageLinks={[]}
      pageContentMain={<h1> toevoegen</h1>}
    />
  );
}
