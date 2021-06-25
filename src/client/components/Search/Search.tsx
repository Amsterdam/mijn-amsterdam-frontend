import SearchBar from '@amsterdam/asc-ui/lib/components/SearchBar/SearchBar';
import ThemeProvider from '@amsterdam/asc-ui/lib/theme/ThemeProvider';
import classnames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { generatePath, useHistory } from 'react-router-dom';
import useDebouncedCallback from 'use-debounce/lib/useDebouncedCallback';
import { AppRoutes } from '../../../universal/config';
import { isError, pick } from '../../../universal/helpers';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useKeyUp } from '../../hooks/useKeyUp';
import Linkd from '../Button/Button';
import Heading from '../Heading/Heading';
import styles from './Search.module.scss';
import { PageEntry, searchStateKeys } from './searchConfig';
import { AppState, PRISTINE_APPSTATE } from '../../AppState';
import {
  generateSearchIndexPageEntries,
  searchAmsterdamNL,
  useSearch,
  useSearchResults,
} from './useSearch';
import Pagination from '../Pagination/Pagination';

interface ResultSetProps {
  results: PageEntry[];
  title: string;
  noResultsMessage?: string;
  onClickResult?: () => void;
  isLoading?: boolean;
  selectedIndex?: number;
  pageSize?: number;
}

export function ResultSet({
  results,
  title,
  isLoading = false,
  noResultsMessage = 'Geen resultaten',
  onClickResult,
  selectedIndex = -1,
  pageSize,
}: ResultSetProps) {
  return (
    <div className={styles.ResultSet}>
      <Heading className={styles.ResultSetTitle} size="tiny">
        {title}
      </Heading>
      {!results.length && !isLoading && (
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
              <Linkd icon={null} onClick={onClickResult} href={result.url}>
                {result.displayTitle || result.title}
              </Linkd>
              {/* <p>{result.item.description}</p> */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface ResultSetPaginatedProps extends ResultSetProps {
  pageSize?: number;
}

export function ResultSetPaginated({
  title,
  results,
  pageSize = 10,
}: ResultSetPaginatedProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPaginated = useMemo(() => {
    const startIndex = currentPage - 1;
    const start = startIndex * pageSize;
    const end = start + pageSize;
    return results.slice(start, end);
  }, [currentPage, results, pageSize]);

  const total = results.length;

  return (
    <>
      <ResultSet title={title} results={resultsPaginated} />
      {total > pageSize && (
        <Pagination
          className={styles.Pagination}
          totalCount={total}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageClick={setCurrentPage}
        />
      )}
    </>
  );
}

interface SearchProps {
  onEscape?: () => void;
  term?: string;
  maxResultCountDisplay?: number;
}

export function Search({
  onEscape,
  term: termInitial = '',
  maxResultCountDisplay = 10,
}: SearchProps) {
  const fuse = useSearch();
  const [results, setResults] = useSearchResults();
  const [resultsAmsterdamNLLoading, setResultsAmsterdamNLLoading] =
    useState(false);
  const [isResultsVisible, setResultsVisible] = useState(false);
  const [term, setTerm] = useState(termInitial);
  const [indexReady, setIndexReady] = useState(false);
  const appState = useAppStateGetter();

  useEffect(() => {
    for (const stateKey of searchStateKeys) {
      if (stateKey && !fuse.apiNames.includes(stateKey)) {
        if (
          isError(appState[stateKey]) ||
          appState[stateKey] !== PRISTINE_APPSTATE[stateKey]
        ) {
          if (!isError(appState[stateKey])) {
            const pageEntries = generateSearchIndexPageEntries(
              stateKey,
              appState[stateKey].content
            );

            console.log(stateKey, 'pageEntries', pageEntries);

            for (const entry of pageEntries) {
              fuse.index.add(entry);
            }
          }

          fuse.apiNames.push(stateKey);
        }
      }
    }
    if (fuse.apiNames.length === searchStateKeys.length) {
      setIndexReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState]);

  const history = useHistory();

  const searchAmsterdamNLDebounced = useDebouncedCallback(() => {
    if (!term) {
      return;
    }
    searchAmsterdamNL(term)
      .then(({ data: amResults }) => {
        setResults((results) => {
          return {
            ma: results?.ma,
            am: amResults,
          };
        });
        setResultsAmsterdamNLLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  }, 400);

  const search = useCallback(
    (term: string) => {
      setResultsAmsterdamNLLoading(true);

      const rawResults = fuse.index.search(term);
      const displayResults = rawResults.map((result) => result.item);

      setResults((results) => {
        return {
          ma: displayResults,
          am: results?.am,
        };
      });
      searchAmsterdamNLDebounced();
    },
    [setResults, searchAmsterdamNLDebounced, fuse]
  );

  const clearSearch = useCallback(() => {
    setTerm('');
    setResults(null);
  }, [setTerm, setResults]);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (indexReady && term) {
      setSelectedIndex(-1);
      search(term);
    }
  }, [indexReady, term, search]);

  function doEscape() {
    if (onEscape) {
      onEscape();
    }
    setResultsVisible(false);
  }

  const keyHandler = useCallback(
    (event: KeyboardEvent) => {
      const isArrowDown = event.key === 'ArrowDown';
      const isArrowUp = event.key === 'ArrowUp';
      const isEnter = event.key === 'Enter';
      const isEscape = event.key === 'Escape';

      if (
        !(isArrowDown || isArrowUp || isEnter || isEscape) ||
        results === null
      ) {
        return;
      }

      event.preventDefault();

      const allResults = [
        ...(results?.ma || []).slice(0, 5),
        ...(results?.am || []).slice(0, 5),
      ];

      if (!isEscape && !allResults.length) {
        return;
      }

      switch (true) {
        case isArrowDown || isArrowUp:
          const prevIndex = selectedIndex - 1;
          const nextIndex = selectedIndex + 1;
          const lastIndex = allResults.length - 1;

          if (isArrowDown) {
            if (allResults[nextIndex]) {
              setSelectedIndex(nextIndex);
            } else {
              setSelectedIndex(-1);
            }
          } else if (isArrowUp) {
            if (allResults[prevIndex] || prevIndex === -1) {
              setSelectedIndex(prevIndex);
            } else {
              setSelectedIndex(lastIndex);
            }
          }
          break;
        case isEnter:
          if (selectedIndex !== -1) {
            if (selectedIndex < (results?.ma?.length ?? 0)) {
              history.push(allResults[selectedIndex].url);
            } else {
              window.location.href = allResults[selectedIndex].url;
            }
          }
          doEscape();
          break;
        case isEscape:
          doEscape();
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setSelectedIndex, results, selectedIndex, history, term]
  );

  useKeyUp(keyHandler);

  return (
    <>
      <div className={styles.SearchBarInput}>
        <ThemeProvider>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log('submit!');
              if (selectedIndex === -1) {
                history.push(AppRoutes.SEARCH + '?term=' + term);
                doEscape();
              }
            }}
          >
            <SearchBar
              autoFocus
              placeholder="Enter the search text"
              onChange={(e) => {
                setResultsVisible(true);
                setTerm(e.target.value);
              }}
              onClear={clearSearch}
              value={term}
            />
          </form>
        </ThemeProvider>
      </div>
      {isResultsVisible &&
        !!term &&
        !!(results?.ma?.length || results?.am?.length) && (
          <div className={styles.Results}>
            <ResultSet
              isLoading={false}
              title="Resultaten van Mijn Amsterdam"
              results={results?.ma?.slice(0, maxResultCountDisplay / 2) || []}
              onClickResult={clearSearch}
              selectedIndex={selectedIndex}
            />
            <ResultSet
              isLoading={resultsAmsterdamNLLoading}
              title="Resultaten van Amsterdam.nl"
              results={results?.am?.slice(0, maxResultCountDisplay / 2) || []}
              onClickResult={clearSearch}
              selectedIndex={
                selectedIndex -
                Math.min(results?.am?.length || 0, maxResultCountDisplay / 2)
              }
            />
          </div>
        )}
    </>
  );
}
