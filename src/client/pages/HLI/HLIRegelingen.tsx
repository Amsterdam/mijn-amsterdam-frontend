import { useParams } from 'react-router-dom';

import { ListPageParamKind } from './HLI-thema-config';
import { HistoricItemsMention } from './HLIThemaPagina';
import { useHliThemaData } from './useHliThemaData';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export default function HLIRegelingen() {
  const { kind } = useParams<{ kind: ListPageParamKind }>();
  const { regelingen, tableConfig, title, routes, isLoading, isError } =
    useHliThemaData();
  const listPageTableConfig = tableConfig[kind];

  return (
    <>
      <ListPagePaginated
        items={regelingen
          .filter(listPageTableConfig.filter)
          .sort(listPageTableConfig.sort)}
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
