import SearchBar from '@amsterdam/asc-ui/lib/components/SearchBar/SearchBar';
import ThemeProvider from '@amsterdam/asc-ui/lib/theme/ThemeProvider';
import classnames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useDebouncedCallback from 'use-debounce/lib/useDebouncedCallback';
import { AppRoutes } from '../../../universal/config';
import { pick } from '../../../universal/helpers';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useKeyUp } from '../../hooks/useKeyUp';
import Linkd from '../Button/Button';
import Heading from '../Heading/Heading';
import styles from './Search.module.scss';
import { PageEntry } from './searchConfig';
import {
  generateSearchIndexPageEntries,
  searchAmsterdamNL,
  useSearch,
  useSearchResults,
} from './useSearch';

interface ResultSetProps {
  results: PageEntry[];
  title: string;
  noResultsMessage?: string;
  onClickResult?: () => void;
  isLoading?: boolean;
  selectedIndex?: number;
  resultsPageUrl?: undefined;
}

export function ResultSet({
  results,
  title,
  isLoading = false,
  noResultsMessage = 'Geen resultaten',
  onClickResult,
  selectedIndex = -1,
  resultsPageUrl,
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
              <Linkd icon={null} onClick={onClickResult} href={result.url}>
                {result.displayTitle || result.title}
              </Linkd>
              {/* <p>{result.item.description}</p> */}
            </li>
          ))}
        </ul>
      )}
      {resultsPageUrl && (
        <p>
          <Linkd>Alle resultaten</Linkd>
        </p>
      )}
    </div>
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
  const [{ am: resultsAmsterdamNL, ma: results }, setResults] =
    useSearchResults();
  const [resultsAmsterdamNLLoading, setResultsAmsterdamNLLoading] =
    useState(false);
  const [isResultsVisible, setResultsVisible] = useState(false);
  const [term, setTerm] = useState(termInitial);
  const [indexReady, setIndexReady] = useState(false);

  const searchStateKeys = [
    'VERGUNNINGEN',
    'FOCUS_TOZO',
    'TOERISTISCHE_VERHUUR',
  ];

  const appState = pick(useAppStateGetter(), searchStateKeys);

  useEffect(() => {
    for (const stateKey of searchStateKeys) {
      if (
        !fuse.apiNames.includes(stateKey) &&
        appState[stateKey].content?.length
      ) {
        for (const entry of generateSearchIndexPageEntries(
          stateKey,
          appState[stateKey].content
        )) {
          fuse.index.add(entry);
        }
        fuse.apiNames.push(stateKey);
      }
    }
    setIndexReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...Object.values(appState)]);

  const history = useHistory();

  const searchAmsterdamNLDebounced = useDebouncedCallback(() => {
    if (!term) {
      return;
    }
    searchAmsterdamNL(term)
      .then(({ data: amResults }) => {
        setResults((results) => {
          return {
            ma: results.ma,
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
          am: results.am,
        };
      });
      searchAmsterdamNLDebounced();
    },
    [setResults, searchAmsterdamNLDebounced, fuse]
  );

  const clearSearch = useCallback(() => {
    setTerm('');
    setResults({
      am: [],
      ma: [],
    });
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

      if (!(isArrowDown || isArrowUp || isEnter || isEscape)) {
        return;
      }

      event.preventDefault();

      const allResults = [...results, ...resultsAmsterdamNL];

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
          if (selectedIndex === -1) {
            history.push(AppRoutes.SEARCH + '?term=' + term);
          } else {
            if (selectedIndex < results.length) {
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
    [
      setSelectedIndex,
      results,
      resultsAmsterdamNL,
      selectedIndex,
      history,
      term,
    ]
  );

  useKeyUp(keyHandler);

  return (
    <>
      <div className={styles.SearchBarInput}>
        <ThemeProvider>
          <SearchBar
            autoFocus
            placeholder="Enter the search text"
            onChange={(e) => {
              setResultsVisible(true);
              setTerm(e.target.value);
            }}
            onClear={clearSearch}
            onSubmit={(e) => {}}
            value={term}
          />
        </ThemeProvider>
      </div>
      {isResultsVisible &&
        !!term &&
        !!(results.length || resultsAmsterdamNL.length) && (
          <div className={styles.Results}>
            <ResultSet
              isLoading={false}
              title="Resultaten van Mijn Amsterdam"
              results={results.slice(0, maxResultCountDisplay / 2)}
              onClickResult={clearSearch}
              selectedIndex={selectedIndex}
            />
            <ResultSet
              isLoading={resultsAmsterdamNLLoading}
              title="Resultaten van Amsterdam.nl"
              results={resultsAmsterdamNL.slice(0, maxResultCountDisplay / 2)}
              onClickResult={clearSearch}
              selectedIndex={selectedIndex - results.length}
            />
          </div>
        )}
    </>
  );
}
