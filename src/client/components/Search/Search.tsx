import SearchBar from '@amsterdam/asc-ui/lib/components/SearchBar/SearchBar';
import ThemeProvider from '@amsterdam/asc-ui/lib/theme/ThemeProvider';
import classnames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useDebouncedCallback from 'use-debounce/lib/useDebouncedCallback';
import { AppRoutes } from '../../../universal/config';
import { IconChevronRight } from '../../assets/icons';
import { trackSearch } from '../../hooks/analytics.hook';
import { useKeyUp } from '../../hooks/useKeyUp';
import Linkd, { Button } from '../Button/Button';
import Heading from '../Heading/Heading';
import Pagination from '../Pagination/Pagination';
import styles from './Search.module.scss';
import { PageEntry } from './searchConfig';
import { useSearchIndex, useSearchResults, useSearchTerm } from './useSearch';

interface ResultSetProps {
  results: PageEntry[];
  title?: string;
  noResultsMessage?: string;
  isLoading?: boolean;
  term: string;
  extendedResults?: boolean;
  showIcon?: boolean;
}

export function ResultSet({
  results,
  title,
  isLoading = false,
  noResultsMessage = 'Geen resultaten',
  term,
  extendedResults = false,
  showIcon = false,
}: ResultSetProps) {
  return (
    <div className={styles.ResultSet}>
      {!!title && (
        <Heading className={styles.ResultSetTitle} size="tiny">
          {title}
        </Heading>
      )}
      {!!term && !results.length && !isLoading && (
        <p className={styles.NoResults}>{noResultsMessage}</p>
      )}
      <ul className={styles.ResultList}>
        {results.map((result, index) => (
          <li
            key={result.title + index}
            className={classnames(
              styles.ResultListItem,
              extendedResults && styles['is-extended']
            )}
          >
            <Linkd
              icon={showIcon ? IconChevronRight : null}
              external={result.url.startsWith('http')}
              href={result.url}
              className={styles.ResultSetLink}
            >
              {result.displayTitle ? result.displayTitle(term) : result.title}
              {extendedResults && (
                <p className={styles.ResultDescription}>
                  <span className={styles.ResultUrl}>{result.url}</span>
                  {result.description}
                </p>
              )}
            </Linkd>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface SearchProps {
  onFinish?: (isSelection?: boolean) => void;
  term?: string;
  maxResultCountDisplay?: number;
  autoFocus?: boolean;
  typeAhead?: boolean;
  extendedAMResults?: boolean;
}

export function Search({
  onFinish,
  term: termInitial = '',
  maxResultCountDisplay = 10,
  autoFocus = true,
  typeAhead = true,
  extendedAMResults = false,
}: SearchProps) {
  const searchBarRef = useRef<HTMLFormElement>(null);
  const results = useSearchResults(extendedAMResults);
  const [isResultsVisible, setResultsVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [term, setTerm] = useSearchTerm();
  const history = useHistory();

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

  const setTermDebounced = useDebouncedCallback((term: string) => {
    trackSearch(term);
    setTerm(term);
    setIsTyping(false);
    if (!term) {
      setResultsVisible(false);
    }
  }, 300);

  const keyHandler = useCallback(
    (event: KeyboardEvent) => {
      const isEscape = event.key === 'Escape';
      if (isEscape && typeAhead) {
        setResultsVisible(false);
      }
    },
    [results, history, doFinish, maxResultCountDisplay]
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

  useEffect(() => {
    if (results?.am?.state === 'hasValue' && results?.am?.contents !== null) {
      setIsDirty(true);
    }
  }, [results?.am?.state]);

  useEffect(() => {
    if (term) {
      setResultsVisible(true);
    }
  }, [term]);

  return (
    <div
      className={classnames(styles.SearchBar, !typeAhead && styles['in-page'])}
    >
      <ThemeProvider>
        <form
          ref={searchBarRef}
          onSubmit={(e) => {
            e.preventDefault();
            if (term) {
              history.push(AppRoutes.SEARCH + '?term=' + term);
              setResultsVisible(true);
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
              setIsTyping(true);
              setResultsVisible(true);
              setTermDebounced(e.target.value);
            }}
            onClear={() => {
              setTerm('');
              setIsDirty(false);
              setResultsVisible(false);
            }}
            value={term || termInitial}
          />
        </form>
      </ThemeProvider>

      {isResultsVisible && (
        <div className={styles.Results}>
          {!!results?.ma?.length && (
            <ResultSet
              term={term}
              isLoading={isTyping}
              results={results?.ma?.slice(0, maxResultCountDisplay / 2) || []}
              noResultsMessage="Niets gevonden op Mijn Amsterdam"
              showIcon={extendedAMResults}
            />
          )}
          {isDirty && (
            <>
              <ResultSet
                term={term}
                isLoading={results?.am?.state === 'loading' || isTyping}
                title="Overige informatie op Amsterdam.nl"
                noResultsMessage="Niets gevonden op Amsterdam.nl"
                extendedResults={extendedAMResults}
                results={
                  results?.am?.state === 'hasValue' &&
                  results?.am?.contents !== null
                    ? results.am.contents.slice(0, maxResultCountDisplay / 2)
                    : []
                }
              />
              {extendedAMResults && (
                <p>
                  <Button
                    onClick={() =>
                      (window.location.href = `https://www.amsterdam.nl/zoeken/?Zoe=${term}`)
                    }
                  >
                    Zoek verder op Amsterdam.nl
                  </Button>
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
