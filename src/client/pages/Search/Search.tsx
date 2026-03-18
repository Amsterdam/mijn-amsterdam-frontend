import { Paragraph } from '@amsterdam/design-system-react';

import { SEARCH_PAGE_DOCUMENT_TITLE } from './Search-routes.ts';
import { PageContentCell, PageV2 } from '../../components/Page/Page.tsx';
import { Search } from '../../components/Search/Search.tsx';
import { useAppStateReady } from '../../hooks/useAppStateStore.ts';
import { useHTMLDocumentTitle } from '../../hooks/useHTMLDocumentTitle.ts';

export function SearchPage() {
  useHTMLDocumentTitle({
    documentTitle: SEARCH_PAGE_DOCUMENT_TITLE,
  });

  const termParam =
    new URLSearchParams(window.location.search).get('term') || '';
  const isReady = useAppStateReady();

  return (
    <PageV2 heading="Zoeken">
      <PageContentCell>
        {isReady ? (
          <Search
            autoFocus={true}
            term={termParam}
            extendedAMResults={true}
            typeAhead={false}
            inPage={true}
            maxResultCountDisplay={20}
          />
        ) : (
          <Paragraph>Zoeken voorbereiden...</Paragraph>
        )}
      </PageContentCell>
    </PageV2>
  );
}
