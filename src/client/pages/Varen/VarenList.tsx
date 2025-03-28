import { useParams } from 'react-router-dom';

import { useVarenThemaData } from './useVarenThemaData.hook';
import { ListPageParamKind } from './Varen-thema-config';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function VarenList() {
  const { kind, page } = useParams<{
    kind: ListPageParamKind;
    page: string;
  }>();
  const {
    varenVergunningen,
    tableConfig,
    isLoading,
    isError,
    routes,
    themaPaginaBreadcrumb,
  } = useVarenThemaData();
  const { title, displayProps, filter, sort } = tableConfig[kind];
  const vergunningen = varenVergunningen.filter(filter).sort(sort);

  return (
    <ListPagePaginated
      items={vergunningen}
      title={title}
      isLoading={isLoading}
      isError={isError}
      appRoute={routes.listPage}
      breadcrumbs={[themaPaginaBreadcrumb]}
      appRouteParams={{ kind, page }}
      displayProps={displayProps}
    />
  );
}
