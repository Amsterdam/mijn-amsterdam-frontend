import { useEffect, useState } from 'react';
import { useRecoilCallback } from 'recoil';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  Button,
  ChapterIcon,
  Linkd,
  Page,
  PageContent,
  PageHeading,
  Search as SearchBar,
} from '../../components';
import { ResultSet, ResultSetPaginated } from '../../components/Search/Search';
import {
  SearchResults,
  useSearchResults,
  searchResultsAtom,
} from '../../components/Search/useSearch';
import styles from './Search.module.scss';
import { useHistory } from 'react-router-dom';

export default function Search() {
  const term = new URLSearchParams(window.location.search).get('term') || '';
  const [liveResults] = useSearchResults();
  const [results, setResults] = useState<SearchResults | null>(null);
  const history = useHistory();

  const getSearchResults = useRecoilCallback(({ snapshot }) => () => {
    return snapshot.getPromise(searchResultsAtom);
  });

  useEffect(() => {
    const hasPopulatedSearch =
      term && liveResults?.am && liveResults?.ma && results === null;
    if (hasPopulatedSearch) {
      console.log('11.');
      setResults(liveResults);
    }
  }, [term, results, liveResults]);

  // useEffect(() => {
  //   if (term && results !== null) {
  //     console.log('22.');
  //     (async function () {
  //       const searchResults = await getSearchResults();
  //       setResults(searchResults);
  //     })();
  //   }
  // }, [term, results, liveResults]);

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
        <SearchBar
          term={term}
          onEscape={() => {
            setResults(liveResults);
          }}
        />
        {!!(results?.am?.length || results?.ma?.length) && (
          <div className={styles.SearchResults}>
            <ResultSetPaginated
              title="Resultaten van Mijn Amsterdam"
              results={results.ma || []}
            />
            <div className={styles.SearchResults}>
              <ResultSet
                title="Resultaten van Amsterdam.nl"
                results={results.am || []}
              />
              <p>
                <Button
                  onClick={() =>
                    (window.location.href = `https://www.amsterdam.nl/zoeken/?Zoe=${term}`)
                  }
                >
                  Alle resultaten van Amsterdam.nl
                </Button>
              </p>
            </div>
          </div>
        )}
      </PageContent>
    </Page>
  );
}
