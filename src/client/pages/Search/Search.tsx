import { useEffect, useState } from 'react';
import { useRecoilCallback } from 'recoil';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  ChapterIcon,
  Page,
  PageContent,
  PageHeading,
  Search as SearchBar,
} from '../../components';
import { ResultSet } from '../../components/Search/Search';
import {
  SearchResults,
  searchResultsAtom,
} from '../../components/Search/useSearch';
import styles from './Search.module.scss';
import { useSearchResults } from '../../components/Search/useSearch';

export default function Search() {
  const term = new URLSearchParams(window.location.search).get('term') || '';
  const [liveResults] = useSearchResults();
  const [results, setResults] = useState<SearchResults | null>(null);

  const getSearchResults = useRecoilCallback(({ snapshot }) => () => {
    return snapshot.getPromise(searchResultsAtom);
  });

  useEffect(() => {
    console.log(liveResults);
    // (async function () {
    if (term && liveResults !== null && results === null) {
      // const searchResults = await getSearchResults();
      setResults(liveResults);
    }
    // })();
  }, [term, results, liveResults]);

  return (
    <Page className={styles.Search}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={false}
        icon={<ChapterIcon />}
      >
        {ChapterTitles.SEARCH}
      </PageHeading>
      <PageContent>
        <SearchBar term={term} onEscape={() => {}} />
        {!!(results?.am.length || results?.ma.length) && (
          <>
            <ResultSet
              title="Resultaten van Mijn Amsterdam"
              results={results.ma}
            />
            <ResultSet
              title="Resultaten van Amsterdam.nl"
              results={results.am}
            />
          </>
        )}
      </PageContent>
    </Page>
  );
}
