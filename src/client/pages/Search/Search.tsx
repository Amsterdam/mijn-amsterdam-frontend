import { useEffect, useRef } from 'react';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  ChapterIcon,
  Page,
  PageContent,
  PageHeading,
  Search as SearchBar,
} from '../../components';
import { useSearchTerm } from '../../components/Search/useSearch';
import styles from './Search.module.scss';

export default function Search() {
  const termParam =
    new URLSearchParams(window.location.search).get('term') || '';
  const [term, setTerm] = useSearchTerm();

  useEffect(() => {
    if (termParam) {
      setTerm(termParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termParam]);

  return (
    <Page className={styles.Search}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={false}
        icon={<ChapterIcon />}
        className={styles.SearchPageHeading}
      >
        {ChapterTitles.SEARCH}
      </PageHeading>
      <PageContent>
        <SearchBar
          autoFocus={true}
          term={term || termParam}
          onFinish={() => console.log('finish searchsz!')}
          extendedAMResults={true}
          typeAhead={false}
          maxResultCountDisplay={20}
        />
      </PageContent>
    </Page>
  );
}
