import { contactmomentenDisplayProps } from './Contactmomenten.config';
import { useContactmomenten } from './useContactmomenten.hook';
import { AppRoutes } from '../../../../universal/config/routes';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';

export function ContactmomentenListPage() {
  const { contactmomenten, isLoading, isError, title } = useContactmomenten();

  return (
    <ListPagePaginated
      items={contactmomenten}
      title={`Alle ${title.toLowerCase()}`}
      appRoute={AppRoutes['KLANT_CONTACT/CONTACTMOMENTEN']}
      appRouteBack={AppRoutes.BRP}
      displayProps={contactmomentenDisplayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
