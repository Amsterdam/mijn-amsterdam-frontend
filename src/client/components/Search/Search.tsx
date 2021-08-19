import SearchBar from '@amsterdam/asc-ui/lib/components/SearchBar/SearchBar';
import ThemeProvider from '@amsterdam/asc-ui/lib/theme/ThemeProvider';
import classnames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useDebouncedCallback from 'use-debounce/lib/useDebouncedCallback';
import { AppRoutes } from '../../../universal/config';
import { trackSearch } from '../../hooks/analytics.hook';
import { useKeyUp } from '../../hooks/useKeyUp';
import Linkd from '../Button/Button';
import Heading from '../Heading/Heading';
import Pagination from '../Pagination/Pagination';
import styles from './Search.module.scss';
import { PageEntry } from './searchConfig';
import { useSearchIndex, useSearchResults, useSearchTerm } from './useSearch';

interface ResultSetProps {
  results: PageEntry[];
  title?: string;
  noResultsMessage?: string;
  onSelectResult?: () => void;
  isLoading?: boolean;
  selectedIndex?: number;
  pageSize?: number;
  term: string;
}

export function ResultSet({
  results,
  title,
  isLoading = false,
  noResultsMessage = 'Geen resultaten',
  onSelectResult,
  selectedIndex = -1,
  pageSize,
  term,
}: ResultSetProps) {
  return (
    <div className={styles.ResultSet}>
      {!!title && (
        <Heading className={styles.ResultSetTitle} size="tiny">
          {title}
        </Heading>
      )}
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
              <Linkd
                icon={null}
                onClick={onSelectResult}
                external={result.url.startsWith('http')}
                href={result.url}
                className={styles.ResultSetLink}
              >
                {result.displayTitle ? result.displayTitle(term) : result.title}
              </Linkd>
              {/* {!!result.description && <p>{result.description}</p>} */}
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
  onSelectResult,
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
      <ResultSet
        term=""
        results={resultsPaginated}
        onSelectResult={onSelectResult}
      />
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
  onFinish?: (isSelection?: boolean) => void;
  term?: string;
  maxResultCountDisplay?: number;
  autoFocus?: boolean;
  typeAhead?: boolean;
}

export function Search({
  onFinish,
  term: termInitial = '',
  maxResultCountDisplay = 10,
  autoFocus = true,
  typeAhead = true,
}: SearchProps) {
  const searchBarRef = useRef<HTMLFormElement>(null);
  const results = useSearchResults();
  const [isResultsVisible, setResultsVisible] = useState(false);
  const [term, setTerm] = useSearchTerm();
  const history = useHistory();
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useSearchIndex();

  const doFinish = useCallback(
    (isSelection?: boolean) => {
      if (onFinish) {
        onFinish(isSelection);
      }
      setResultsVisible(false);
    },
    [onFinish, setResultsVisible]
  );

  const trackSiteSearch = useDebouncedCallback((term: string) => {
    trackSearch(term);
  }, 150);

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
        ...(results?.ma || []).slice(0, maxResultCountDisplay / 2),
        ...(results?.am?.state === 'hasValue'
          ? results?.am?.contents
          : []
        ).slice(0, maxResultCountDisplay / 2),
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
            const url = allResults[selectedIndex].url;
            if (!url.startsWith('http')) {
              history.push(url);
            } else {
              window.location.href = url;
            }
          }
          doFinish(true);
          break;
        case isEscape:
          setResultsVisible(false);
          break;
      }
    },
    [
      setSelectedIndex,
      results,
      selectedIndex,
      history,
      doFinish,
      maxResultCountDisplay,
    ]
  );

  useKeyUp(keyHandler);

  useEffect(() => {
    if (autoFocus) {
      // AutoFocus on the element doesn't seem to work properly with dynamic mounting
      searchBarRef.current?.querySelector<HTMLInputElement>('input')?.focus();
    }
    return () => setTerm('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.SearchBar}>
      <ThemeProvider>
        <form
          ref={searchBarRef}
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedIndex === -1 && term) {
              history.push(AppRoutes.SEARCH + '?term=' + term);
              doFinish();
            }
          }}
        >
          <SearchBar
            inputProps={{
              autoComplete: 'none',
              autoCorrect: 'none',
              autoCapitalize: 'none',
              spellCheck: 'false',
            }}
            placeholder={
              results.isIndexReady ? 'Zoeken naar...' : 'Zoeken voorbereiden...'
            }
            onFocus={() => {
              if (term) {
                setResultsVisible(true);
              }
            }}
            onChange={(e) => {
              setResultsVisible(true);
              trackSiteSearch(e.target.value);
              setTerm(e.target.value);
            }}
            onClear={() => {
              setTerm('');
            }}
            value={term || termInitial}
          />
        </form>
      </ThemeProvider>

      {typeAhead &&
        isResultsVisible &&
        !!term &&
        !!(results?.ma?.length || results?.am?.state === 'hasValue') && (
          <div className={styles.Results}>
            <ResultSet
              term={term}
              onSelectResult={() => doFinish(true)}
              isLoading={false}
              results={results?.ma?.slice(0, maxResultCountDisplay / 2) || []}
              noResultsMessage="Niets gevonden op Mijn Amsterdam"
              selectedIndex={selectedIndex}
            />

            <ResultSet
              term={term}
              onSelectResult={() => doFinish(true)}
              isLoading={results?.am?.state === 'loading'}
              title="Overige informatie op Amsterdam.nl"
              noResultsMessage="Niets gevonden op Amsterdam.nl"
              results={
                results?.am?.state === 'hasValue'
                  ? results?.am?.contents.slice(0, maxResultCountDisplay / 2)
                  : []
              }
              selectedIndex={
                selectedIndex -
                Math.min(results?.ma?.length || 0, maxResultCountDisplay / 2)
              }
            />
          </div>
        )}
    </div>
  );
}
