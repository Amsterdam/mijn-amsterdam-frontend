import { useKlachtenThemaData } from './useKlachtenThemaData.hook';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function KlachtenLijstPagina() {
  const { klachten, tableConfig, breadcrumbs, isLoading, isError } =
    useKlachtenThemaData();

  return (
    <ListPagePaginated
      items={klachten}
      title={tableConfig.title}
      appRoute={tableConfig.listPageRoute}
      appRouteParams={{}}
      breadcrumbs={breadcrumbs}
      displayProps={tableConfig.displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
