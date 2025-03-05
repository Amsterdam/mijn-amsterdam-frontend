import { useParams } from 'react-router-dom';

import { useZorgThemaData } from './useZorgThemaData';
import { HistoricItemsMention } from './Zorg';
import { ListPageParamKind } from './Zorg-thema-config';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function ZorgRegelingen() {
  const { kind } = useParams<{ kind: ListPageParamKind }>();
  const { regelingen, tableConfig, routes, isLoading, isError } =
    useZorgThemaData();
  const listPageTableConfig = tableConfig[kind];

  return (
    <>
      <ListPagePaginated
        items={regelingen.filter(listPageTableConfig.filter)}
        title={listPageTableConfig.title}
        appRoute={routes.listPage}
        appRouteParams={{ kind }}
        appRouteBack={routes.themaPage}
        displayProps={listPageTableConfig.displayProps}
        isLoading={isLoading}
        isError={isError}
        tableClassName={listPageTableConfig.className}
      />
      {kind === 'eerdere-en-afgewezen-regelingen' && <HistoricItemsMention />}
    </>
  );
}
