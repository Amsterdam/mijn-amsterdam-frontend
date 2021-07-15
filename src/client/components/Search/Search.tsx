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
import { useKeyPress } from '../../hooks/useKeyPress';
import classnames from 'classnames';
import { useHistory } from 'react-router-dom';

interface ResultSetProps {
  results: PageEntry[];
  title: string;
  noResultsMessage?: string;
  onClickResult: () => void;
  isLoading: boolean;
  selectedIndex: number;
}

function ResultSet({
  results,
  title,
  isLoading = false,
  noResultsMessage = 'Geen resultaten',
  onClickResult,
  selectedIndex = -1,
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
          {results.map((result, index) => (
            <li
              key={result.title + index}
              className={classnames(
                styles.ResultListItem,
                index === selectedIndex && styles['ResultListItem--selected']
              )}
            >
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

  const isArrowUp = useKeyPress('ArrowUp');
  const isArrowDown = useKeyPress('ArrowDown');
  const isEnter = useKeyPress('Enter');
  const history = useHistory();

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
      setSelectedIndex(-1);
      search(term);
    }
  }, [term, search]);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (!resultsAmsterdamNLLoading && (isArrowDown || isArrowUp || isEnter)) {
      const allResults = [...results, ...resultsAmsterdamNL];
      if (!allResults.length) {
        return;
      }

      if (isEnter) {
        if (selectedIndex < results.length) {
          history.push(allResults[selectedIndex].url);
        } else {
          window.location.href = allResults[selectedIndex].url;
        }
        return;
      }

      const prevIndex = selectedIndex - 1;
      const nextIndex = selectedIndex + 1;
      const lastIndex = allResults.length - 1;

      if (isArrowDown) {
        if (allResults[nextIndex]) {
          setSelectedIndex(nextIndex);
        } else {
          setSelectedIndex(0);
        }
      } else if (isArrowUp) {
        if (allResults[prevIndex]) {
          setSelectedIndex(prevIndex);
        } else {
          setSelectedIndex(lastIndex);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isArrowDown,
    isArrowUp,
    results,
    resultsAmsterdamNL,
    resultsAmsterdamNLLoading,
    isEnter,
  ]);
  return (
    <div className={styles.Search}>
      <div className={styles.SearchBar}>
        <div className={styles.SearchBarInner}>
          <div className={styles.SearchBarInput}>
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
            </ThemeProvider>
          </div>
          {!!term && !!(results.length || resultsAmsterdamNL.length) && (
            <div className={styles.Results}>
              <ResultSet
                isLoading={false}
                title="Resultaten van Mijn Amsterdam"
                results={results}
                onClickResult={clearSearch}
                selectedIndex={selectedIndex}
              />
              <ResultSet
                isLoading={resultsAmsterdamNLLoading}
                title="Resultaten van Amsterdam.nl"
                results={resultsAmsterdamNL}
                onClickResult={clearSearch}
                selectedIndex={selectedIndex - results.length}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
