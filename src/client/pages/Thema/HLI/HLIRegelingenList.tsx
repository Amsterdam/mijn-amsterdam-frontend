import { useParams } from 'react-router';

import { ListPageParamKind } from './HLI-thema-config';
import { HistoricItemsMention } from './HLIThema';
import { useHliThemaData } from './useHliThemaData';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { PageContentCell } from '../../../components/Page/Page';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function HLIRegelingenList() {
  const { kind = 'huidige-regelingen' } = useParams<{
    kind: ListPageParamKind;
  }>();
  const {
    themaId,
    regelingen,
    tableConfig,
    isLoading,
    isError,
    breadcrumbs,
    regelingenListPageConfig,
  } = useHliThemaData();
  useHTMLDocumentTitle(regelingenListPageConfig.route);

  const { filter, sort, title, displayProps, listPageRoute } =
    tableConfig[kind];

  return (
    <>
      <ListPagePaginated
        themaId={themaId}
        items={regelingen.filter(filter).sort(sort)}
        title={title}
        appRoute={listPageRoute}
        breadcrumbs={breadcrumbs}
        displayProps={displayProps}
        isLoading={isLoading}
        isError={isError}
        pageContentBottom={
          <PageContentCell startWide={3} spanWide={8}>
            {kind === 'eerdere-en-afgewezen-regelingen' && (
              <HistoricItemsMention />
            )}
          </PageContentCell>
        }
      />
    </>
  );
}
