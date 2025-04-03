import { useParams } from 'react-router-dom';

import { ListPageParamKind } from './toeristischeVerhuur-thema-config';
import { useToeristischeVerhuurThemaData } from './useToeristischeVerhuur.hook';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function ToeristischeVerhuurVergunningen() {
  const { kind } = useParams<{ kind: ListPageParamKind }>();
  const { vergunningen, tableConfigVergunningen, routes, isLoading, isError } =
    useToeristischeVerhuurThemaData();
  const listPageTableConfig = tableConfigVergunningen[kind];

  return (
    <ListPagePaginated
      items={vergunningen
        .filter(listPageTableConfig.filter)
        .sort(listPageTableConfig.sort)}
      tableClassName={listPageTableConfig.className}
      title={listPageTableConfig.title}
      appRoute={routes.listPage}
      appRouteParams={{ kind }}
      breadcrumbs={[{ to: routes.themaPage, title: routes.themaPage }]}
      displayProps={listPageTableConfig.displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
