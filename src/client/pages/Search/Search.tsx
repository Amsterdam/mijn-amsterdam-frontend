import { Paragraph } from '@amsterdam/design-system-react';

import { AppRoutes } from '../../../universal/config/routes';
import { Search as SearchBar } from '../../components';
import {
  PageContentCell,
  PageContentV2,
  PageV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { ThemaTitles } from '../../config/thema';
import { useAppStateReady } from '../../hooks/useAppState';

export default function Search() {
  const termParam =
    new URLSearchParams(window.location.search).get('term') || '';
  const isReady = useAppStateReady();
  return (
    <PageV2>
      <PageContentV2>
        <PageHeadingV2 backLink={AppRoutes.HOME}>
          {ThemaTitles.SEARCH}
        </PageHeadingV2>
        <PageContentCell>
          {isReady ? (
            <SearchBar
              autoFocus={true}
              term={termParam}
              extendedAMResults={true}
              typeAhead={false}
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
