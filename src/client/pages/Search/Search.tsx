import { useCallback, useEffect, useState } from 'react';
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
  useSearchResults,
  SearchResults,
} from '../../components/Search/useSearch';
import styles from './Search.module.scss';

// import { useAppStateGetter } from '../../hooks/useAppState';

export default function Search() {
  const [liveResults] = useSearchResults();
  const term = new URLSearchParams(window.location.search).get('term') || '';

  const [{ ma: results, am: resultsAmsterdamNL, resultsHydrated }, setResults] =
    useState<SearchResults & { resultsHydrated: boolean }>({
      am: [],
      ma: [],
      resultsHydrated: false,
    });

  useEffect(() => {
    if (term && liveResults && !resultsHydrated) {
      setResults({ ...liveResults, resultsHydrated: true });
    }
  }, [term, liveResults, resultsHydrated]);
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
        {!!(results.length || resultsAmsterdamNL.length) && (
          <>
            <ResultSet
              title="Resultaten van Mijn Amsterdam"
              results={results}
            />
            <ResultSet
              title="Resultaten van Amsterdam.nl"
              results={resultsAmsterdamNL}
            />
          </>
        )}
      </PageContent>
    </Page>
  );
}
