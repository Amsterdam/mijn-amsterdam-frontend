import { useParams } from 'react-router-dom';

import { useVarenThemaData } from './useVarenThemaData.hook';
import { ListPageParamKind } from './Varen-thema-config';
import type { VarenZakenFrontend } from '../../../server/services/varen/config-and-types';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function VarenList() {
  const { kind, page } = useParams<{
    kind: ListPageParamKind;
    page: string;
  }>();
  const { varenVergunningen, tableConfig, isLoading, isError, routes } =
    useVarenThemaData();
  const { title, displayProps, filter, sort } = tableConfig[kind];
  const vergunningen = varenVergunningen.filter(filter).sort(sort);

  return (
    <ListPagePaginated<VarenZakenFrontend>
      items={vergunningen}
      title={title}
      isLoading={isLoading}
      isError={isError}
      appRoute={routes.listPage}
      breadcrumbs={[{ to: routes.themaPage, title: routes.themaPage }]}
      appRouteParams={{ kind, page }}
      displayProps={displayProps}
    />
  );
}
