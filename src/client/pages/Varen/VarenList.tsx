import { useParams } from 'react-router';

import { useVarenThemaData } from './useVarenThemaData.hook';
import { ListPageParamKind } from './Varen-thema-config';
import type { VarenZakenFrontend } from '../../../server/services/varen/config-and-types';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function VarenList() {
  const { kind, page } = useParams<{
    kind: ListPageParamKind;
    page: string;
  }>();
  const { varenZaken, tableConfig, isLoading, isError, routes, breadcrumbs } =
    useVarenThemaData();
  const { title, displayProps, filter, sort } = tableConfig[kind];
  const zaken = varenZaken.filter(filter).sort(sort);

  return (
    <ListPagePaginated<VarenZakenFrontend>
      items={zaken}
      title={title}
      isLoading={isLoading}
      isError={isError}
      appRoute={routes.listPage}
      breadcrumbs={breadcrumbs}
      appRouteParams={{ kind, page }}
      displayProps={displayProps}
    />
  );
}
