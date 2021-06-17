import SearchBar from '@amsterdam/asc-ui/lib/components/SearchBar/SearchBar';
import ThemeProvider from '@amsterdam/asc-ui/lib/theme/ThemeProvider';
import { useCallback, useEffect, useState } from 'react';
import useDebouncedCallback from 'use-debounce/lib/useDebouncedCallback';
import {
  generateSearchIndexPageEntries,
  searchAmsterdamNL,
  useSearch,
} from './useSearch';
import { useAppStateGetter } from '../../hooks/useAppState';
import Linkd from '../Button/Button';
import styles from './Search.module.scss';
import Heading from '../Heading/Heading';
import { PageEntry } from './staticIndex';

interface ResultSetProps {
  results: PageEntry[];
  title: string;
  noResultsMessage?: string;
  onClickResult: () => void;
  isLoading: boolean;
}

function ResultSet({
  results,
  title,
  isLoading = false,
  noResultsMessage = 'Geen resultaten',
  onClickResult,
}: ResultSetProps) {
  return (
    <div className={styles.ResultSet}>
      <Heading className={styles.ResultSetTitle} size="tiny">
        {title}
      </Heading>
      {!results.length && (
        <p className={styles.NoResults}>{noResultsMessage}</p>
      )}
      {isLoading && <p>Zoeken..</p>}
      {!!results.length && (
        <ul className={styles.ResultList}>
          {results.map((result) => (
            <li key={result.title} className={styles.ResultListItem}>
              <Linkd onClick={onClickResult} href={result.url}>
                {result.title}
              </Linkd>
              {/* <p>{result.item.description}</p> */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface SearchProps {
  onClose?: () => void;
}

export function Search({ onClose }: SearchProps) {
  const fuse = useSearch();
  const [results, setResults] = useState<any[]>([]);
  const [resultsAmsterdamNL, setResultsAmsterdamNL] = useState<any[]>([]);
  const [resultsAmsterdamNLLoading, setResultsAmsterdamNLLoading] =
    useState(false);
  const [term, setTerm] = useState('');
  const { VERGUNNINGEN } = useAppStateGetter();

  useEffect(() => {
    if (VERGUNNINGEN.content?.length) {
      for (const entry of generateSearchIndexPageEntries(
        'VERGUNNINGEN',
        VERGUNNINGEN.content
      )) {
        fuse.current.add(entry);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [VERGUNNINGEN.content]);

  const searchAmsterdamNLDebounced = useDebouncedCallback(() => {
    searchAmsterdamNL(term)
      .then(({ data }) => {
        setResultsAmsterdamNL(data);
        setResultsAmsterdamNLLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  }, 400);

  const search = useCallback(
    (term: string) => {
      setResultsAmsterdamNLLoading(true);

      const fuseResults = fuse.current
        .search(term)
        .slice(0, 5)
        .map((result) => result.item);

      setResults(fuseResults);
      searchAmsterdamNLDebounced();
    },
    [setResults, searchAmsterdamNLDebounced, fuse]
  );

  const clearSearch = useCallback(() => {
    setTerm('');
    setResults([]);
    setResultsAmsterdamNL([]);
    onClose && onClose();
  }, [setTerm, setResults, onClose]);

  useEffect(() => {
    if (term) {
      search(term);
    }
  }, [term, search]);

  return (
    <div className={styles.Search}>
      <div className={styles.SearchBar}>
        <div className={styles.SearchBarInner}>
          <ThemeProvider>
            <SearchBar
              autoFocus
              placeholder="Enter the search text"
              onChange={(e) => {
                setTerm(e.target.value);
              }}
              onClear={clearSearch}
              onSubmit={(e) => {}}
              value={term}
            />
            {!!term && !!(results.length || resultsAmsterdamNL.length) && (
              <div className={styles.Results}>
                <ResultSet
                  isLoading={false}
                  title="Resultaten van Mijn Amsterdam"
                  results={results}
                  onClickResult={clearSearch}
                />
                <ResultSet
                  isLoading={resultsAmsterdamNLLoading}
                  title="Resultaten van Amsterdam.nl"
                  results={resultsAmsterdamNL}
                  onClickResult={clearSearch}
                />
              </div>
            )}
          </ThemeProvider>
        </div>
      </div>
    </div>
  );
}
