import { useParams } from 'react-router';

import { ListPageParamKind } from './Horeca-thema-config';
import { useHorecaThemaData } from './useHorecaThemaData.hook';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';

export function HorecaLijstPagina() {
  const { kind } = useParams<{ kind: ListPageParamKind }>();
  const { vergunningen, tableConfig, routes, isLoading, isError, breadcrumbs } =
    useHorecaThemaData();
  const listPageTableConfig = tableConfig[kind];

  return (
    <ListPagePaginated
      items={vergunningen.filter(listPageTableConfig.filter)}
      title={listPageTableConfig.title}
      appRoute={routes.listPage}
      appRouteParams={{ kind }}
      breadcrumbs={breadcrumbs}
      displayProps={listPageTableConfig.displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
