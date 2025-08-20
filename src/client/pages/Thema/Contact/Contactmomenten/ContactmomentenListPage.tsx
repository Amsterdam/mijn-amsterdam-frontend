import { contactmomentenDisplayProps } from './Contactmomenten-config';
import { useContactmomenten } from './useContactmomenten';
import type { LinkProps } from '../../../../../universal/types/App.types';
import { ListPagePaginated } from '../../../../components/ListPagePaginated/ListPagePaginated';

type ContactmomentenListPageProps = {
  themaId: string;
  breadcrumbs?: LinkProps[];
};

export function ContactmomentenListPage({
  themaId,
  breadcrumbs,
}: ContactmomentenListPageProps) {
  const { contactmomenten, isLoading, isError, title, listPageRoute } =
    useContactmomenten();

  return (
    <ListPagePaginated
      items={contactmomenten}
      themaId={themaId}
      title={`Alle ${title.toLowerCase()}`}
      appRoute={listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={contactmomentenDisplayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
