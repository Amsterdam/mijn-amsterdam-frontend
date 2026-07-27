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

  useHTMLDocumentTitle(themaConfig.listPageContactmomenten.route);

  const tableConfig = tableConfigs.contactmomenten;
  return (
    <ListPagePaginated<ContactmomentFrontendFinal>
      items={contactmomenten}
      themaId={themaConfig.id}
      title={`Alle ${tableConfig.title.toLowerCase()}`}
      appRoute={tableConfig.listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={tableConfig.displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
