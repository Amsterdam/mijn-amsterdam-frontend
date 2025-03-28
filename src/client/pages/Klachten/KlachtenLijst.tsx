import { useKlachtenThemaData } from './useKlachtenThemaData.hook';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function KlachtenLijstPagina() {
  const { klachten, tableConfig, themaPaginaBreadcrumb, isLoading, isError } =
    useKlachtenThemaData();

  return (
    <ListPagePaginated
      items={klachten}
      title={tableConfig.title}
      appRoute={tableConfig.listPageRoute}
      appRouteParams={{}}
      breadcrumbs={[themaPaginaBreadcrumb]}
      displayProps={tableConfig.displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
