import { useParams } from 'react-router-dom';

import { useVarenThemaData } from './useVarenThemaData.hook';
import { ListPageParamKind } from './Varen-thema-config';
import type { VarenZakenFrontend } from '../../../server/services/varen/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function VarenList() {
  const { kind, page } = useParams<{
    kind: ListPageParamKind;
    page: string;
  }>();
  const { varenZaken, tableConfig, isLoading, isError } = useVarenThemaData();
  const { title, displayProps, filter, sort } = tableConfig[kind];
  const vergunningen = varenZaken.filter(filter).sort(sort);

  return (
    <ListPagePaginated<VarenZakenFrontend>
      items={vergunningen}
      title={title}
      isLoading={isLoading}
      isError={isError}
      appRoute={AppRoutes['VAREN/LIST']}
      appRouteBack={AppRoutes.VAREN}
      appRouteParams={{ kind, page }}
      displayProps={displayProps}
    />
  );
}
