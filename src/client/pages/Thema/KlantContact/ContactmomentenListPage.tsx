import type { ContactmomentProps } from './KlantContact-thema-config.ts';
import { useContactmomentenListData } from './useContactmomentenListData.hook.tsx';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function ContactmomentenListPage() {
  const {
    id,
    contactmomenten,
    tableConfig,
    routeConfig,
    isLoading,
    isError,
    breadcrumbs,
  } = useContactmomentenListData();

  useHTMLDocumentTitle(routeConfig);

  return (
    <ListPagePaginated<ContactmomentProps>
      items={contactmomenten}
      themaId={id}
      title={`Alle ${tableConfig.title.toLowerCase()}`}
      appRoute={routeConfig.path}
      breadcrumbs={breadcrumbs}
      displayProps={tableConfig.displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
