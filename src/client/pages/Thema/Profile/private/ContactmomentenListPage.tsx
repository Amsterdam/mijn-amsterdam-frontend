import { contactmomentenDisplayProps } from './Contactmomenten.config';
import { useContactmomenten } from './useContactmomenten.hook';
import { ListPagePaginated } from '../../../../components/ListPagePaginated/ListPagePaginated';

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
