import { useParams } from 'react-router-dom';

import { ListPageParamKind } from './Inkomen-thema-config';
import { useInkomenThemaData } from './useInkomenThemaData.hook';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function InkomenLijstPagina() {
  const { kind } = useParams<{
    kind: Exclude<ListPageParamKind, 'jaaropgaven' | 'uitkering'>;
  }>();
  const { zaken, tableConfig, routes, isLoadingWpi, isErrorWpi } =
    useInkomenThemaData();
  const listPageTableConfig = tableConfig[kind];

  return (
    <ListPagePaginated
      items={zaken.filter(listPageTableConfig.filter)}
      title={listPageTableConfig.title}
      appRoute={routes.listPage}
      appRouteParams={{ kind }}
      appRouteBack={routes.themaPage}
      displayProps={listPageTableConfig.displayProps}
      isLoading={isLoadingWpi}
      isError={isErrorWpi}
    />
  );
}
