import { useParams } from 'react-router';

import type { ListPageParamKind } from './HLI-thema-config.ts';
import { HistoricItemsMention } from './HLIThema.tsx';
import { useHliThemaData } from './useHliThemaData.ts';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

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
    themaConfig,
  } = useHliThemaData();
  useHTMLDocumentTitle(themaConfig.regelingenListPage.route);

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
