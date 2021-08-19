import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  Button,
  ChapterIcon,
  Page,
  PageContent,
  PageHeading,
  Search as SearchBar,
} from '../../components';
import { ResultSet, ResultSetPaginated } from '../../components/Search/Search';
import {
  SearchResults,
  useSearchResults,
  useSearchTerm,
} from '../../components/Search/useSearch';
import styles from './Search.module.scss';

function useOnceCall(cb: () => void, condition: boolean) {
  const isCalledRef = useRef(false);

  useEffect(() => {
    if (condition && !isCalledRef.current) {
      isCalledRef.current = true;
      cb();
    }
  }, [cb, condition]);
}

export default function Search() {
  const termParam =
    new URLSearchParams(window.location.search).get('term') || '';
  const liveResults = useSearchResults();
  const amState = liveResults.am?.state;
  const [results, setResults] = useState<SearchResults | null>(null);
  const [term, setTerm] = useSearchTerm();
  const history = useHistory();

  useEffect(() => {
    if (termParam) {
      setTerm(termParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termParam]);

  useOnceCall(() => {
    setResults(liveResults);
  }, amState === 'hasValue' && liveResults.isIndexReady);

  const displayResults = useCallback(
    (isSelection) => {
      setResults(liveResults);
      if (!isSelection) {
        history.push(`${AppRoutes.SEARCH}?term=${term}`);
      }
    },
    [term, setResults, history, liveResults]
  );

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
          autoFocus={false}
          term={term || termParam}
          onFinish={displayResults}
          typeAhead={false}
        />
        {!!(results?.am?.contents.length || results?.ma?.length) && (
          <div className={styles.SearchResults}>
            <ResultSetPaginated
              term={term}
              results={results.ma || []}
              noResultsMessage="Niets gevonden op Mijn Amsterdam"
            />
            <div className={styles.SearchResults}>
              <ResultSet
                term={term}
                isLoading={results?.am?.state === 'loading'}
                title="Overige informatie op Amsterdam.nl"
                noResultsMessage="Niets gevonden op Amsterdam.nl"
                results={
                  results?.am?.state === 'hasValue' ? results?.am?.contents : []
                }
              />
              <p>
                <Button
                  onClick={() =>
                    (window.location.href = `https://www.amsterdam.nl/zoeken/?Zoe=${term}`)
                  }
                >
                  Zoek verder op Amsterdam.nl
                </Button>
              </p>
            </div>
          </div>
        )}
      </PageContent>
    </Page>
  );
}
