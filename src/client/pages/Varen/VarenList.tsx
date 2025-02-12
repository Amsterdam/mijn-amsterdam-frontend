import { useParams } from 'react-router-dom';

import { useVarenListPage, VarenVergunningKind } from './useVarenListPage.hook';
import { VarenFrontend } from '../../../server/services/varen/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

const PAGE_SIZE = 10;
export function VarenList() {
  const { kind, page } = useParams<{
    kind: VarenVergunningKind;
    page: string;
  }>();
  const { varenVergunningen, displayProps, title, isLoading, isError } =
    useVarenListPage(kind);

  return (
    <ListPagePaginated<VarenFrontend>
      items={varenVergunningen}
      title={title}
      totalCount={varenVergunningen.length}
      pageSize={PAGE_SIZE}
      isLoading={isLoading}
      isError={isError}
      appRoute={AppRoutes['VAREN/LIST']}
      appRouteBack={AppRoutes.VAREN}
      appRouteParams={{ kind, page }}
      displayProps={displayProps}
    />
  );
}
