import { Paragraph } from '@amsterdam/design-system-react';

import { SEARCH_PAGE_DOCUMENT_TITLE } from './Search-routes';
import {
  PageContentCell,
  PageContentV2,
  PageV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { Search } from '../../components/Search/Search';
import { useAppStateReady } from '../../hooks/useAppStateStore';
import { useHTMLDocumentTitle } from '../../hooks/useHTMLDocumentTitle';

export function SearchPage() {
  useHTMLDocumentTitle({
    documentTitle: SEARCH_PAGE_DOCUMENT_TITLE,
  });

  const termParam =
    new URLSearchParams(window.location.search).get('term') || '';
  const isReady = useAppStateReady();

  return (
    <PageV2>
      <PageContentV2>
        <PageHeadingV2>Zoeken</PageHeadingV2>
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
      </PageContentV2>
    </PageV2>
  );
}
