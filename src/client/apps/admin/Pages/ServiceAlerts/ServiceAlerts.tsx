import type { ServiceAlertsOverview } from '../../../../../server/services/service-alerts/service-alerts.types.ts';
import { ServiceAlertsPageContent } from '../../../../components/ServiceAlerts/ServiceAlerts.tsx';
import { ThemaPagina } from '../../../../components/Thema/ThemaPagina.tsx';
import { useBffApi } from '../../../../hooks/api/useBffApi.ts';
import { BFFApiUrls } from '../../config/api.ts';
import { themaConfig } from './ServiceAlerts-thema-config.ts';

export function ServiceAlerts() {
  const { isLoading, isError, data } = useBffApi<ServiceAlertsOverview>(
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
      pageContentTop={null}
      pageLinks={[]}
      pageContentMain={
        <ServiceAlertsPageContent overview={data?.content ?? []} />
      }
    />
  );
}
