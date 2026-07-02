import { ListPagePaginated } from '../../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { useHTMLDocumentTitle } from '../../../../hooks/useHTMLDocumentTitle.ts';
import type { ContactmomentFrontendFinal } from '../KlantContact-thema-config.ts';
import { useKlantcontactData } from '../useKlantcontactData.hook.tsx';

export function ContactmomentenListPage() {
  const {
    contactmomenten,
    tableConfigs,
    themaConfig,
    isLoading,
    isError,
    breadcrumbs,
  } = useKlantcontactData();

  const tableConfig = tableConfigs.contactmomenten;
  const routeConfig = themaConfig.listPageContactmomenten.route;

  useHTMLDocumentTitle(routeConfig);

  return (
    <ListPagePaginated<ContactmomentFrontendFinal>
      items={contactmomenten}
      themaId={themaConfig.id}
      title={`Alle ${tableConfig.title.toLowerCase()}`}
      appRoute={routeConfig.path}
      breadcrumbs={breadcrumbs}
      displayProps={tableConfig.displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
