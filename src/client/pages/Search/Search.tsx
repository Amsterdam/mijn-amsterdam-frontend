import { Paragraph } from '@amsterdam/design-system-react';

import { SEARCH_PAGE_DOCUMENT_TITLE } from './Search-routes.ts';
import {
  PageContentCell,
  PageContentV2,
  PageV2,
} from '../../components/Page/Page.tsx';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2.tsx';
import { Search } from '../../components/Search/Search.tsx';
import { useAppStateReady } from '../../hooks/useAppState.ts';
import { useHTMLDocumentTitle } from '../../hooks/useHTMLDocumentTitle.ts';

export function SearchPage() {
  useHTMLDocumentTitle({
    documentTitle: SEARCH_PAGE_DOCUMENT_TITLE,
  });

  const termParam =
    new URLSearchParams(globalThis.location.search).get('term') || '';
  const isReady = useAppStateReady();
  return (
    <PageV2>
      <PageContentV2>
        <PageHeadingV2>Zoeken</PageHeadingV2>
        <PageContentCell>
          {isReady ? (
            <Search
              autoFocus
              term={termParam}
              extendedAMResults
              typeAhead={false}
              inPage
              maxResultCountDisplay={20}
            />
          ) : (
            <Paragraph>Zoeken voorbereiden...</Paragraph>
          )}
        </PageContentCell>
      </PageContentV2>
    </PageV2>
  );
}
