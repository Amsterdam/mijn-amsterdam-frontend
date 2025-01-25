import { useKlachtenThemaData } from './useKlachtenThemaData.hook';
import { Klacht } from '../../../server/services/klachten/types';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function KlachtenLijstPagina() {
  const { klachten, tableConfig, routes, isLoading, isError } =
    useKlachtenThemaData();

  return (
    <ListPagePaginated<Klacht>
      items={klachten}
      title={tableConfig.title}
      appRoute={tableConfig.listPageRoute}
      appRouteBack={routes.themaPage}
      displayProps={tableConfig.displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
