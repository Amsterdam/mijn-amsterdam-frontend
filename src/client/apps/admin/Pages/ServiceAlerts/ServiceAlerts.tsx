import { ThemaPagina } from '../../../../components/Thema/ThemaPagina.tsx';
import { themaConfig } from './ServiceAlerts-thema-config.ts';

export function ServiceAlerts() {
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
        <>
          <h1>test</h1>
        </>
      }
    />
  );
}
