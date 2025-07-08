import { contactmomentenDisplayProps } from './Contactmomenten.config.ts';
import { useContactmomenten } from './useContactmomenten.hook.tsx';
import { ListPagePaginated } from '../../../../components/ListPagePaginated/ListPagePaginated.tsx';

export function ContactmomentenListPage() {
  const {
    contactmomenten,
    isLoading,
    isError,
    title,
    breadcrumbs,
    listPageRoute,
  } = useContactmomenten();

  return (
    <ListPagePaginated
      items={contactmomenten}
      title={`Alle ${title.toLowerCase()}`}
      appRoute={listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={contactmomentenDisplayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
