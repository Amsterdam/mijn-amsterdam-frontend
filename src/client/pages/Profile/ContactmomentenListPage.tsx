import { contactmomentenDisplayProps } from './ProfilePrivate';
import { useContactmomenten } from './useContactmomenten.hook';
import { AppRoutes } from '../../../universal/config/routes';
import { Themas } from '../../../universal/config/thema';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export default function ContactmomentenListPage() {
  const { items, isLoading, isError } = useContactmomenten();

  return (
    <ListPagePaginated
      items={items}
      title="Alle Contactmomenten"
      appRoute={AppRoutes['SALESFORCE/CONTACTMOMENTEN']}
      appRouteBack={AppRoutes.BRP}
      displayProps={contactmomentenDisplayProps}
      thema={Themas.SALESFORCE}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
