import { contactmomentenDisplayProps } from './config';
import { useContactmomenten } from './useContactmomenten.hook';
import { AppRoutes } from '../../../universal/config/routes';
import { Themas } from '../../../universal/config/thema';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function ContactmomentenListPage() {
  const { contactmomenten, isLoading, isError, title } = useContactmomenten();

  return (
    <ListPagePaginated
      items={contactmomenten}
      title={`Alle ${title.toLowerCase()}`}
      appRoute={AppRoutes['KLANT_CONTACT/CONTACTMOMENTEN']}
      appRouteBack={AppRoutes.BRP}
      displayProps={contactmomentenDisplayProps}
      thema={Themas.BRP}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
